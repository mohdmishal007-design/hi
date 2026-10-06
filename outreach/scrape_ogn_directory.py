#!/usr/bin/env python3
"""Pull Eastern Province (KSA) company listings from the OGN oil & gas directory.

ognnews.com publishes a supplier directory grouped by category codes
(e.g. PUMP, CHEM, WELD). The category index is not linked from the site, so
this tries a list of likely codes, walks each category's pages, and keeps
companies whose city is in Dammam / Khobar / Jubail / Dhahran / Al Ahsa etc.

    python3 outreach/scrape_ogn_directory.py leads/ogn_eastern_province.csv
"""
from __future__ import annotations

import csv
import re
import sys
from concurrent.futures import ThreadPoolExecutor

import requests
from bs4 import BeautifulSoup

BASE = "https://ognnews.com/Directory1/{code}/x?page={page}"
UA = {"User-Agent": "Mozilla/5.0"}

EASTERN_CITIES = {
    "dammam": "Dammam", "al dammam": "Dammam", "ad dammam": "Dammam",
    "khobar": "Al Khobar", "al khobar": "Al Khobar", "al-khobar": "Al Khobar", "alkhobar": "Al Khobar",
    "jubail": "Jubail", "al jubail": "Jubail", "al-jubail": "Jubail", "jubail industrial city": "Jubail",
    "dhahran": "Dhahran", "ras tanura": "Ras Tanura", "qatif": "Qatif", "al qatif": "Qatif",
    "al ahsa": "Al Ahsa", "al hassa": "Al Ahsa", "al-ahsa": "Al Ahsa", "hofuf": "Al Ahsa", "al hofuf": "Al Ahsa",
    "abqaiq": "Abqaiq", "ras al khair": "Ras Al Khair", "khafji": "Khafji", "al khafji": "Khafji",
    "hafr al batin": "Hafr Al Batin", "dammam 2nd industrial city": "Dammam",
}

# Category codes look like the first letters of the category name (PUMP, CHEM, PIPR...).
WORDS = """
pump chem engi elec safe corr fire weld heav cran logi offs comp powe insu filt dril pima pipr geol cons oilf
abra acid acou adhe aero agen air alar alum anal anch anti arch auto bear bolt boil bran brea buil cabl calc
cali camp cart cast cate cath cein cell ceme cera chai civi clea coat comm conc cond cont conv cool copp cran
cryo cust cutt data deck demo desa desi diag dies dist divi dock door dred dril duct eart effl elec elev emer
ener envi equi expl fabr fast fenc fibe filt fina fitt flan flar flex flow flui forg foun frei furn gal gas gask
gaug gear gene geot glas grat grou heat heli hose hote hvac hydr indu insp inst insu inte iron labo ladd lami
land lase lead leak lift ligh line liqu load lubr mach mari mate meas mech medi meta mete mini mixe modu moni
moto mud oil offi ozon pack pain pall pane pers petr pile pipi pipe plan plas plat pneu poly port pres prin proc
prod proj prot purc qual radi rail recr refi rent repa rese rig robo rods roll roof rope rubb sand scaf seal secu
sens sepa serv shel ship sign simu skid slur soft soil sola spar spec spra stai stea stee stor stru subs supp surf
surv swit tank tele tent test text tool towe trad trai tran trea tube turb tyre valv vent vess vibr wast wate
weld well wire work
""".split()
CODES = sorted({w[:4].upper() for w in WORDS})


def parse(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    out = []
    for h1 in soup.select("h1.fontsubsection"):
        name = h1.get_text(" ", strip=True)
        box = h1.find_parent("div")
        if not box or not name:
            continue
        fields = {}
        for tr in box.select("tr"):
            tds = tr.find_all("td")
            if len(tds) == 2:
                fields[tds[0].get_text(" ", strip=True).rstrip(":")] = tds[1].get_text(" ", strip=True)
        if "City" in fields or "Email Address" in fields:
            out.append({"company": name, **fields})
    return out


def walk(code: str) -> list[dict]:
    s = requests.Session()
    s.headers.update(UA)
    rows, page = [], 1
    while page <= 60:
        try:
            r = s.get(BASE.format(code=code, page=page), timeout=30)
        except requests.RequestException:
            break
        got = parse(r.text) if r.ok else []
        if not got:
            break
        for g in got:
            g["category_code"] = code
        rows += got
        page += 1
    return rows


def main(dst: str) -> None:
    with ThreadPoolExecutor(max_workers=10) as pool:
        batches = list(pool.map(walk, CODES))
    found_codes = [c for c, b in zip(CODES, batches) if b]
    print(f"{len(found_codes)} category codes had listings: {' '.join(found_codes)}")
    merged: dict[str, dict] = {}
    for b in batches:
        for r in b:
            if r.get("Country", "").lower() != "saudi arabia":
                continue
            city = EASTERN_CITIES.get(r.get("City", "").strip().lower())
            if not city:
                continue
            key = (r.get("Email Address") or r["company"]).lower()
            cur = merged.setdefault(key, {
                "company": r["company"], "city": city, "email": r.get("Email Address", ""),
                "phone": r.get("Phone", ""), "website": r.get("Website", ""),
                "employees": r.get("Employee Range", ""), "po_box": r.get("P.O Box", ""),
                "categories": set(),
            })
            cur["categories"].add(r["category_code"])
    rows = sorted(merged.values(), key=lambda r: (r["city"], r["company"].lower()))
    for r in rows:
        r["categories"] = " ".join(sorted(r["categories"]))
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} Eastern Province companies -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1])
