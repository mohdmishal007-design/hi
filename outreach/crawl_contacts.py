#!/usr/bin/env python3
"""Collect publicly listed contact emails and phones from company websites.

Reads a CSV with columns company, sector, city, website. For each site it
fetches the home page plus up to a few contact / procurement / supplier pages
linked from it, and pulls out email addresses and phone numbers. Emails are
ranked so procurement and purchasing addresses come first.

    python3 outreach/crawl_contacts.py leads/candidates.csv leads/crawled.csv
"""
from __future__ import annotations

import csv
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
TIMEOUT = 20
MAX_PAGES = 8

LINK_HINTS = re.compile(
    r"contact|procure|purchas|supplier|vendor|supply|sourcing|tender|about|reach|location|office|"
    r"اتصل|تواصل|المشتريات|الموردين",
    re.I,
)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?966|00966|\b0)[\s\-()]*1[1-7](?:[\s\-()]*\d){7}|(?:\+?966|00966|\b0)[\s\-]*5(?:[\s\-]*\d){8}|\b9200(?:[\s\-]*\d){5}")

PROCUREMENT_WORDS = ("procure", "purchas", "supply", "supplier", "vendor", "sourcing", "buyer", "scm", "material", "tender", "contracts")
GENERAL_WORDS = ("info", "contact", "enquir", "inquir", "sales", "marketing", "admin", "office", "hello", "customer", "care", "cs", "business")
JUNK = ("example.", "sentry", "wixpress", "domain.com", "email.com", "yourcompany", "@2x", ".png", ".jpg", ".gif", ".webp", ".svg", "u003e", "career", "jobs", "hr@", "recruit", "cv@",
        "investor", "shareholder", "whistle", "auditor", "ir@", "relations", "motivoweb")


def rank(email: str) -> int:
    local = email.split("@")[0].lower()
    if any(w in local for w in PROCUREMENT_WORDS):
        return 0
    if any(w in local for w in GENERAL_WORDS):
        return 2
    return 1  # a named person or department we cannot classify


def fetch(session: requests.Session, url: str) -> tuple[str, str] | None:
    try:
        r = session.get(url, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code >= 400 or "html" not in r.headers.get("content-type", "html"):
            return None
        return r.url, r.text
    except requests.RequestException:
        return None


def extract(html: str) -> tuple[set[str], set[str]]:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ")
    emails = set(EMAIL_RE.findall(text))
    for a in soup.select('a[href^="mailto:"]'):
        addr = a["href"][7:].split("?")[0].strip()
        if EMAIL_RE.fullmatch(addr):
            emails.add(addr)
    # Cloudflare-obfuscated addresses
    for el in soup.select("[data-cfemail]"):
        enc = el["data-cfemail"]
        try:
            key = int(enc[:2], 16)
            emails.add("".join(chr(int(enc[i : i + 2], 16) ^ key) for i in range(2, len(enc), 2)))
        except ValueError:
            pass
    phones = {re.sub(r"[^\d+]", "", p) for p in PHONE_RE.findall(text)}
    return emails, phones


def crawl(row: dict) -> dict:
    site = row["website"].strip()
    out = dict(row, status="", final_url="", procurement_emails="", other_emails="", phones="", pages_checked="")
    if not site:
        out["status"] = "no website"
        return out
    s = requests.Session()
    s.headers["User-Agent"] = UA
    home = fetch(s, site)
    if not home and site.startswith("https://www."):
        home = fetch(s, site.replace("https://www.", "https://"))
    if not home:
        out["status"] = "unreachable"
        return out
    base_url, html = home
    host = urlparse(base_url).netloc.removeprefix("www.")
    out["final_url"] = base_url
    pages = {base_url: html}
    soup = BeautifulSoup(html, "html.parser")
    links = []
    for a in soup.find_all("a", href=True):
        label = (a.get_text(" ") or "") + " " + a["href"]
        if LINK_HINTS.search(label):
            u = urljoin(base_url, a["href"]).split("#")[0]
            if urlparse(u).netloc.removeprefix("www.") == host and u not in links:
                links.append(u)
    for guess in ("/contact", "/contact-us", "/en/contact-us", "/contactus"):
        u = urljoin(base_url, guess)
        if u not in links:
            links.append(u)
    for u in links[: MAX_PAGES * 2]:
        if len(pages) > MAX_PAGES:
            break
        if u in pages:
            continue
        got = fetch(s, u)
        if got:
            pages[got[0]] = got[1]
    emails, phones = set(), set()
    for page in pages.values():
        e, p = extract(page)
        emails |= e
        phones |= p
    emails = {e.strip(".").lower() for e in emails if not any(j in e.lower() for j in JUNK)}
    ordered = sorted(emails, key=lambda e: (rank(e), e))
    out["procurement_emails"] = "; ".join(e for e in ordered if rank(e) == 0)
    out["other_emails"] = "; ".join(e for e in ordered if rank(e) != 0)
    out["phones"] = "; ".join(sorted(phones)[:4])
    out["pages_checked"] = str(len(pages))
    out["status"] = "ok" if emails else "no email on site"
    return out


def main(src: str, dst: str) -> None:
    rows = list(csv.DictReader(open(src, newline="", encoding="utf-8")))
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(crawl, rows))
    fields = list(results[0].keys())
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(results)
    found = sum(1 for r in results if r["status"] == "ok")
    print(f"{found}/{len(results)} sites gave at least one email -> {dst}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
