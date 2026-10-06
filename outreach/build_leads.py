#!/usr/bin/env python3
"""Merge the scraped sources into one lead sheet and check each email domain.

Inputs (any may be missing):
  leads/sources/ogn_eastern_province.csv   from scrape_ogn_directory.py
  leads/sources/website_crawl.csv          from crawl_contacts.py
  leads/sources/manual_research.csv        hand-collected (company, sector, city, email, phone, website, contact_name, contact_title, source_url)

Output: leads/leads_eastern_province.csv, one row per email address, with
sector, priority, email_type (procurement / general / person / freemail) and
mx_ok (whether the email domain accepts mail at all), plus the same data as
leads/Eastern_Province_Leads.xlsx split into sheets. The status and notes
you type into the workbook's Email-ready sheet survive a rebuild.

    python3 outreach/build_leads.py
"""
from __future__ import annotations

import csv
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "leads" / "sources"
OUT = ROOT / "leads" / "leads_eastern_province.csv"
XLSX = ROOT / "leads" / "Eastern_Province_Leads.xlsx"

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
FREEMAIL = re.compile(r"@(yahoo|hotmail|gmail|outlook|live|msn|aol|ymail|rocketmail)\.", re.I)
PROCUREMENT = re.compile(r"procure|purchas|supply|supplier|vendor|sourcing|buyer|scm|material|tender|contracts", re.I)
GENERAL = re.compile(r"^(info|contact|enquir|inquir|sales|marketing|admin|office|hello|customer|care|cs|business|mail|general)", re.I)

# OGN category code -> sector, checked in this order (first hit wins).
SECTORS = [
    ("Freight / logistics (competitor or partner)", "LOGI FREI PORT RAIL HELI AERO DRED"),
    ("Oil & gas services", "DRIL OILF WELL OFFS PETR REFI GEOL GEOT SEPA SKID PIMA PIPR LINE CATH CORR"),
    ("Chemicals & petrochemicals", "CHEM ACID ADHE"),
    ("Industrial equipment & trading", "PUMP COMP FILT FITT GASK GAUG GEAR HOSE BEAR SEAL TOOL MACH MEAS CALI TURB BOIL "
     "HEAT VENT CONV ROPE CHAI LIFT CRAN HEAV TYRE RUBB ABRA CUTT WELD IRON PRES TANK PROC PIPI PLAS"),
    ("Electrical & power", "ELEC CABL LIGH POWE SOLA WIRE"),
    ("Building materials & construction", "CEME CERA GLAS DOOR ROOF INSU SCAF ARCH EART DEMO SAND STAI PLAT FURN CIVI CONS CONT COND LAND"),
    ("Safety & fire protection", "SAFE FIRE"),
    ("General trading", "TRAD"),
    ("Engineering, testing & services", "ENGI PROJ SURV TEST LABO INTE RESE SOFT TELE COMM CLEA CAMP MEDI PRIN PACK PALL TEXT AUTO STOR"),
]

# Sectors most likely to import (rank 1 = contact first).
PRIORITY = {
    "Oil & gas services": 1,
    "Industrial equipment & trading": 1,
    "Chemicals & petrochemicals": 1,
    "General trading": 1,
    "Building materials & construction": 2,
    "Electrical & power": 2,
    "Safety & fire protection": 2,
    "Food & FMCG": 2,
    "Engineering, testing & services": 3,
    "Freight / logistics (competitor or partner)": 9,
}


def normalize_sector(label: str) -> str:
    """Map free-text sector labels from the hand-made lists onto the sector names above."""
    if label in PRIORITY:
        return label
    s = label.lower()
    for words, name in (
        (("food", "fmcg", "dairy"), "Food & FMCG"),
        (("oil & gas", "drilling", "offshore", "refin", "epc"), "Oil & gas services"),
        (("petrochem", "chemical", "gases", "plastics"), "Chemicals & petrochemicals"),
        (("building", "cement", "concrete", "insulation", "contracting", "civil", "construction"), "Building materials & construction"),
        (("electric", "transformer", "power", "batter"), "Electrical & power"),
        (("general trading", "diversified", "holding"), "General trading"),
        (("pipe", "valve", "steel", "industrial", "machinery", "hvac", "manufactur", "supply"), "Industrial equipment & trading"),
        (("logistic", "shipping", "freight"), "Freight / logistics (competitor or partner)"),
    ):
        if any(w in s for w in words):
            return name
    return "Engineering, testing & services"


def sector_from_codes(codes: str) -> str:
    have = set(codes.split())
    for name, group in SECTORS:
        if have & set(group.split()):
            return name
    return "Other industrial"


def email_type(email: str) -> str:
    local = email.split("@")[0]
    if FREEMAIL.search(email):
        return "freemail"
    if PROCUREMENT.search(local):
        return "procurement"
    if GENERAL.search(local):
        return "general"
    return "person/department"


def dns_answer(name: str, rtype: str) -> list | None:
    for _ in range(3):
        try:
            with urllib.request.urlopen(f"https://dns.google/resolve?name={name}&type={rtype}", timeout=15) as r:
                data = json.load(r)
            return (data.get("Answer") or []) if data.get("Status") in (0, 3) else None
        except Exception:
            continue
    return None


def has_mx(domain: str) -> str:
    mx = dns_answer(domain, "MX")
    if mx is None:
        return "unknown"
    if any(a.get("type") == 15 for a in mx):
        return "yes"
    return "no MX (A only)" if dns_answer(domain, "A") else "no"


def clean_phone(p: str) -> str:
    p = re.sub(r"\s+", " ", p or "").strip()
    # pre-2013 Eastern Province numbers: +966 3 xxxxxxx -> +966 13 xxxxxxx
    return re.sub(r"^\+ ?966 0?3 ", "+966 13 ", p).replace("+ 966", "+966")


def load(name: str) -> list[dict]:
    path = SRC / name
    return list(csv.DictReader(open(path, newline="", encoding="utf-8"))) if path.exists() else []


def main() -> None:
    leads: dict[str, dict] = {}

    def add(email: str, **kw) -> None:
        email = email.strip().strip(".").lower()
        if not EMAIL_RE.match(email):
            return
        row = leads.setdefault(email, {"email": email, **kw})
        for k, v in kw.items():  # fill gaps from later sources
            if v and not row.get(k):
                row[k] = v

    for r in load("manual_research.csv"):
        for e in re.split(r"[;,\s]+", r.get("email", "")):
            if e:
                add(e, company=r["company"], sector=normalize_sector(r["sector"]), city=r["city"], phone=r.get("phone", ""),
                    website=r.get("website", ""), contact_name=r.get("contact_name", ""),
                    contact_title=r.get("contact_title", ""), source=r.get("source_url", "manual research"))

    for r in load("website_crawl.csv"):
        for e in (r["procurement_emails"] + ";" + r["other_emails"]).split(";"):
            if e.strip() and not FREEMAIL.search(e):  # webmail on a company site is usually the web designer
                add(e, company=r["company"], sector=normalize_sector(r["sector"]), city=r["city"], phone=r["phones"].split(";")[0],
                    website=r["final_url"] or r["website"], source=f"company website ({r['final_url'] or r['website']})")

    for r in load("ogn_eastern_province.csv"):
        if r["email"]:
            add(r["email"], company=re.sub(r"\s+", " ", r["company"]).strip(), sector=sector_from_codes(r["categories"]),
                city=r["city"], phone=clean_phone(r["phone"]), website=r["website"], employees=r["employees"].replace("NOT KNOWN", ""),
                source="ognnews.com oil & gas directory")

    domains = sorted({e.split("@")[1] for e in leads})
    with ThreadPoolExecutor(max_workers=8) as pool:
        mx = dict(zip(domains, pool.map(has_mx, domains)))

    kept = previous_status()
    fields = ["priority", "company", "sector", "city", "email", "email_type", "mx_ok", "contact_name", "contact_title",
              "phone", "website", "employees", "source", "status", "notes"]
    rows = []
    for e, r in leads.items():
        r["email_type"] = email_type(e)
        r["mx_ok"] = mx[e.split("@")[1]]
        r["priority"] = PRIORITY.get(r.get("sector", ""), 2)
        r["status"], r["notes"] = kept.get(e, ("new", ""))
        rows.append({k: r.get(k, "") for k in fields})
    type_rank = {"procurement": 0, "person/department": 1, "general": 2, "freemail": 3}
    rows.sort(key=lambda r: (r["priority"], r["mx_ok"] != "yes", type_rank[r["email_type"]], r["city"], r["company"].lower()))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8-sig") as f:  # BOM so Excel opens Arabic/UTF-8 cleanly
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    ok = sum(1 for r in rows if r["mx_ok"] == "yes")
    print(f"{len(rows)} emails, {ok} on domains with working MX -> {OUT}")
    write_workbook(rows, fields)


def previous_status() -> dict[str, tuple[str, str]]:
    """Status and notes the user typed into the last workbook, keyed by email."""
    if not XLSX.exists():
        return {}
    from openpyxl import load_workbook

    ws = load_workbook(XLSX, read_only=True)["Email-ready"]
    it = ws.iter_rows(values_only=True)
    head = list(next(it))
    out = {}
    for row in it:
        r = dict(zip(head, row))
        if r.get("email"):
            out[str(r["email"]).lower()] = (r.get("status") or "new", r.get("notes") or "")
    return out


def write_workbook(rows: list[dict], fields: list[str]) -> None:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill
    from openpyxl.utils import get_column_letter

    live = [r for r in rows if r["mx_ok"] == "yes"]
    sheets = {
        "Email-ready": [r for r in live if r["email_type"] != "freemail" and "Freight" not in r["sector"]],
        "Free webmail": [r for r in live if r["email_type"] == "freemail" and "Freight" not in r["sector"]],
        "Logistics firms": [r for r in live if "Freight" in r["sector"]],
        "Domain not receiving": [r for r in rows if r["mx_ok"] != "yes"],
    }
    key = load("key_accounts.csv")
    wb = Workbook()
    ws = wb.active
    ws.title = "Read me"
    for line in [
        ["Eastern Province leads (Dammam, Al Khobar, Jubail, Dhahran, Al Ahsa, Qatif)"],
        [],
        ["Sheet", "What it holds", "Rows"],
        ["Email-ready", "Company emails on domains that accept mail. Excludes freight forwarders and free webmail. "
                        "This is the sheet the mailer sends from.", len(sheets["Email-ready"])],
        ["Free webmail", "Small firms listed with yahoo/hotmail/gmail addresses. Real, but they land in spam more often.",
         len(sheets["Free webmail"])],
        ["Logistics firms", "Freight and logistics companies: competitors or possible sub-agents. Not emailed.",
         len(sheets["Logistics firms"])],
        ["Domain not receiving", "The email domain has no mail server (company closed or renamed). Call instead.",
         len(sheets["Domain not receiving"])],
        ["Key accounts", "Large buyers that work through vendor portals or a switchboard rather than a public email.", len(key)],
        [],
        ["Columns"],
        ["priority", "1 = oil & gas, industrial trading, chemicals, general trading; 2 = building materials, electrical, "
                     "safety, food; 3 = engineering and services"],
        ["email_type", "procurement = purchasing/supply mailbox; person/department = a named or department mailbox; "
                       "general = info@ / sales@"],
        ["mx_ok", "yes = the domain has a live mail server. It does not prove the mailbox exists: directory entries can be "
                  "years old, so expect some bounces. The mailer stops emailing an address once it bounces."],
        ["status", "The mailer emails rows whose status is new or active. Type skip, customer or anything else to leave a "
                   "row out. Your status and notes are kept when the workbook is rebuilt."],
    ]:
        ws.append(line)
    ws["A1"].font = Font(bold=True, size=13)
    for c in ("A3", "B3", "C3", "A10"):
        ws[c].font = Font(bold=True)
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 120

    widths = {"company": 42, "sector": 34, "email": 38, "source": 34, "website": 30, "phone": 20, "how_to_reach": 70, "notes": 40}

    def add_sheet(name: str, data: list[dict], columns: list[str]) -> None:
        sh = wb.create_sheet(name)
        sh.append(columns)
        for r in data:
            sh.append([r.get(c, "") for c in columns])
        for c in sh[1]:
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor="1F3A5F")
        sh.freeze_panes = "A2"
        sh.auto_filter.ref = sh.dimensions
        for i, c in enumerate(columns, 1):
            sh.column_dimensions[get_column_letter(i)].width = widths.get(c, 14)

    for name, data in sheets.items():
        add_sheet(name, data, fields)
    if key:
        add_sheet("Key accounts", key, list(key[0].keys()))
    wb.save(XLSX)
    print(f"workbook -> {XLSX} ({len(sheets['Email-ready'])} email-ready)")


if __name__ == "__main__":
    main()
