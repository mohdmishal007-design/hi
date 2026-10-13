"""Build Mohammed Mishal's digital business card.

  python3 card/build_card.py

Writes, next to this script:
  index.html                   the card page, one self-contained file (fonts, images and contact inlined)
  mohammed-mishal.vcf          the contact file behind "Save contact"
  mohammed-mishal-front.png    card faces at 2100×1200 (3.5×2 in at 600 dpi), to send as images
  mohammed-mishal-back.png

Both QR codes hold the contact itself, so scanning saves it with no website needed.
Needs Pillow and segno (pip install pillow segno). The PNGs need Chrome or Chromium;
set CHROME=/path/to/chrome if it isn't found.
"""
import base64
import glob
import json
import os
import shutil
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

import segno
from PIL import Image, PngImagePlugin

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SLUG = "mohammed-mishal"

PERSON = {
    "given": "Mohammed",
    "family": "Mishal",
    "title": "Business Development Executive",
    "phone": "+966578626353",
    "phone_display": "+966 57 862 6353",
    "email": "mishal@lonestarshipping.com",
}
COMPANY = {
    "company": "Lonestar Shipping Co. Ltd",
    "website": "https://www.lonestarshipping.com",
    "website_display": "lonestarshipping.com",
    "office": "Office 12, 2nd Floor",
    "office_short": "Office 12",
    "mall": "Al Waha Downtown Mall",
    "street": "Prince Mohammed Bin Fahad Road",
    "city": "Dammam",
    "country": "Saudi Arabia",
    "maps": "https://www.google.com/maps/search/?api=1&query=Al+Waha+Downtown+Mall+Prince+Mohammed+Bin+Fahad+Road+Dammam",
}

# Lucide icons, the same set the website uses.
ICONS = {
    "phone": '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
    "mail": '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    "message-circle": '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    "ship": '<path d="M12 2v2"/><path d="M12 9.189V13"/><path d="M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6"/><path d="M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76"/><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    "plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    "truck": '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
}

STILL = ROOT / "public" / "img" / "story" / "s3-2400.webp"


def vcard(full: bool) -> str:
    """vCard 3.0. The QR copy drops the address and type labels so the code stays small enough to scan off a printed card."""
    p, c = PERSON, COMPANY

    def esc(s: str) -> str:
        return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;")

    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{esc(p['family'])};{esc(p['given'])}",
        f"FN:{p['given']} {p['family']}",
        f"ORG:{esc(c['company'])}",
        f"TITLE:{esc(p['title'])}",
        f"TEL;TYPE=CELL:{p['phone']}" if full else f"TEL:{p['phone']}",
        f"EMAIL;TYPE=INTERNET,WORK:{p['email']}" if full else f"EMAIL:{p['email']}",
        f"URL:{c['website']}",
    ]
    if full:
        street = esc(f"{c['office']}, {c['mall']}, {c['street']}")
        lines.append(f"ADR;TYPE=WORK:;;{street};{esc(c['city'])};;;{esc(c['country'])}")
    lines.append("END:VCARD")
    return "\r\n".join(lines) + "\r\n"


def data_uri(data: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


def webp(path: Path, width: int, quality: int) -> bytes:
    im = Image.open(path).convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


def fonts_css() -> str:
    faces = [("Sora", 600, "sora-600"), ("Manrope", 400, "manrope-400"), ("Manrope", 600, "manrope-600")]
    return "\n".join(
        f'@font-face {{ font-family: {family}; font-weight: {weight}; font-display: swap; '
        f'src: url({data_uri((HERE / "fonts" / f"{name}.woff2").read_bytes(), "font/woff2")}) format("woff2"); }}'
        for family, weight, name in faces
    )


def fill(template: str, values: dict) -> str:
    for key, value in values.items():
        template = template.replace("{{" + key + "}}", value)
    if "{{" in template:
        start = template.index("{{")
        raise SystemExit(f"Unfilled placeholder: {template[start:start + 40]}")
    return template


def find_chrome() -> str | None:
    candidates = [
        os.environ.get("CHROME"),
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        *sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome")),
    ]
    return next((c for c in candidates if c and Path(c).exists()), None)


def render_faces(html: str) -> None:
    chrome = find_chrome()
    if not chrome:
        print("Chrome not found: skipped the PNG card faces (set CHROME=/path/to/chrome).")
        return
    still_prompt = json.loads(Path(f"{STILL.with_name('s3-1280.webp')}.json").read_text())["prompt"]
    note = f"Business card face made by card/build_card.py. Background photo: {still_prompt}"
    # The window is taller than the two faces: headless Chrome's viewport is shorter than its window.
    with tempfile.TemporaryDirectory() as tmp:
        page, shot = Path(tmp) / "faces.html", Path(tmp) / "faces.png"
        page.write_text(html)
        args = [chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                "--window-size=1050,1400", f"--screenshot={shot}", page.as_uri()]
        if hasattr(os, "geteuid") and os.geteuid() == 0:
            args.insert(1, "--no-sandbox")
        subprocess.run(args, check=True, capture_output=True)
        sheet = Image.open(shot).convert("RGB")
    if sheet.size != (2100, 2800):
        raise SystemExit(f"Unexpected screenshot size {sheet.size}")
    meta = PngImagePlugin.PngInfo()
    meta.add_text("impeccable:prompt", note)
    for side, top in (("front", 0), ("back", 1200)):
        sheet.crop((0, top, 2100, top + 1200)).save(HERE / f"{SLUG}-{side}.png", pnginfo=meta, optimize=True)


def main() -> None:
    full, compact = vcard(full=True), vcard(full=False)
    vcf_name = f"{SLUG}.vcf"
    (HERE / vcf_name).write_bytes(full.encode())

    qr = segno.make(compact, error="m", micro=False)
    qr_svg = qr.svg_inline(scale=1, border=0, dark="#050b16", omitsize=True)

    values = {
        **PERSON,
        **COMPANY,
        **{f"icon_{name}": f'<svg class="i" viewBox="0 0 24 24" aria-hidden="true">{body}</svg>' for name, body in ICONS.items()},
        "name": f"{PERSON['given']} {PERSON['family']}",
        "whatsapp": f"https://wa.me/{PERSON['phone'].lstrip('+')}",
        "fonts": fonts_css(),
        "logo": data_uri((ROOT / "public" / "brand" / "logo.png").read_bytes(), "image/png"),
        "mark": data_uri((ROOT / "public" / "brand" / "mark.png").read_bytes(), "image/png"),
        "qr": qr_svg,
        "vcard_file": "Mohammed-Mishal.vcf",
        "vcard_file_json": json.dumps("Mohammed-Mishal.vcf"),
        "vcard_json": json.dumps(full),
        "vcard_uri": "data:text/vcard;charset=utf-8," + quote(full),
    }

    page = fill((HERE / "template.html").read_text(), {**values, "hero": data_uri(webp(STILL, 960, 72), "image/webp")})
    (HERE / "index.html").write_text(page)
    faces = fill((HERE / "faces.html").read_text(), {**values, "hero": data_uri(webp(STILL, 1600, 82), "image/webp")})
    render_faces(faces)

    print(f"index.html {len(page) / 1000:.0f} KB · QR version {qr.version} ({qr.symbol_size(border=0)[0]} modules)")


if __name__ == "__main__":
    main()
