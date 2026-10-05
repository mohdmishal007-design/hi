"""Package the static build as a claude.ai artifact preview with placeholder branding.

claude.ai artifacts may not carry a real company's identity, so this preview
swaps the company name, logo and contact details for placeholders. Everything
else (layout, copy, story clips, both languages, every page) is the real build.

  npx next build && python3 scripts/build_artifact.py   →  artifact/

Next's runtime is dropped; scripts/artifact/site.js drives the story, header,
menu and form instead. The build fails if any real identity detail survives.
"""
import json
import re
import shutil
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "out"
DEST = ROOT / "artifact"
TITLE = "Saudi Freight Website"
LENIS = "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"

# Identity → placeholder. Longest strings first.
TEXT = [
    ("rayyan@lonestarshipping.com", "name@company.com"),
    ("Lonestar Shipping", "[Company name]"),
    ("لون ستار للشحن", "[اسم الشركة]"),
    ("+966 53 502 2995", "+966 5X XXX XXXX"),
    ("Rayyan Rassal", "[Contact name]"),
    ("Al Waha Downtown Mall, Office 12, 2nd Floor, Prince Mohammed Bin Fahad Road", "[Office address]"),
    ("Al Waha Downtown Mall, Office 12, Prince Mohammed Bin Fahad Road", "[Office address]"),
    ("Al Waha Downtown Mall, Office 12, 2nd Floor", "[Office address]"),
    ("Al Waha Downtown Mall", "[Office address]"),
    ("Prince Mohammed Bin Fahad Road", "[Street]"),
    ("الواحة داون تاون مول، مكتب 12، الطابق الثاني", "[عنوان المكتب]"),
    ("الواحة داون تاون مول، مكتب 12، طريق الأمير محمد بن فهد", "[عنوان المكتب]"),
    ("الواحة داون تاون مول", "[عنوان المكتب]"),
    ("طريق الأمير محمد بن فهد", "[الشارع]"),
]
DEAD_LINKS = ("tel:", "mailto:", "https://wa.me/", "https://www.google.com/maps", "https://www.lonestarshipping.com")
FORBIDDEN = ["lonestar", "لون ستار", "535022995", "rayyan", "rassal", "waha", "الواحة"]

FORM_COPY = {
    "en": {
        "previewTitle": "Preview only.",
        "previewBody": "This form isn't connected in the preview. On the live site it sends the shipment brief to the Dammam team.",
    },
    "ar": {
        "previewTitle": "معاينة فقط.",
        "previewBody": "هذا النموذج غير متصل في المعاينة. في الموقع الفعلي يُرسل تفاصيل الشحنة إلى فريق الدمام.",
    },
}

INLINE_CSS = """
:root{color-scheme:dark}
html,body{background:#050b16;color:#eaf1fb}
body{margin:0;font-family:var(--font-sans);font-size:1rem;line-height:1.6}
html:lang(ar) body{line-height:1.75}
.logo-ph{display:inline-flex;align-items:center;height:2rem;padding:0 .75rem;border:1px dashed #7f95b4;border-radius:4px;color:#a9bbd4;font:600 .8125rem/1 var(--font-display);white-space:nowrap}
"""


def ts_config() -> dict:
    """Read story beats and form error copy straight from the TypeScript sources."""
    js = (
        "Promise.all([import('./src/content/site.ts'),import('./src/content/en.ts'),import('./src/content/ar.ts')])"
        ".then(([s,e,a])=>console.log(JSON.stringify({beats:s.storyBeats,tail:s.STORY_TAIL,"
        "en:e.en.quote.errors,ar:a.ar.quote.errors})))"
    )
    out = subprocess.run(
        ["node", "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", js],
        cwd=ROOT, check=True, capture_output=True, text=True,
    ).stdout
    data = json.loads(out)
    return {
        "beats": data["beats"],
        "tail": data["tail"],
        "stampBeat": 5,
        "form": {lang: {**data[lang], **FORM_COPY[lang]} for lang in ("en", "ar")},
    }


def page_file(lang: str, path: str) -> str:
    """Flatten /<lang>/<path>/ to one artifact file name."""
    prefix = "" if lang == "en" else "ar-"
    path = path.strip("/")
    if not path:
        return "en.html" if lang == "en" else "ar.html"
    if path.startswith("services/"):
        return f"{prefix}services-{path.split('/')[1]}.html"
    if path.startswith("privacy"):
        return f"{prefix}privacy.html"
    return "en.html" if lang == "en" else "ar.html"


def map_href(href: str, current: str) -> str:
    if href.startswith(DEAD_LINKS):
        return "#contact" if current in ("index.html", "en.html", "ar.html") else "#"
    m = re.match(r"^/(en|ar)(/[^#?]*)?(?:\?[^#]*)?(?:#(.*))?$", href)
    if not m:
        return href
    lang, path, frag = m.group(1), m.group(2) or "/", m.group(3)
    target = page_file(lang, path)
    if target == current or (current == "index.html" and target == "en.html"):
        return f"#{frag}" if frag else "#"
    return f"{target}#{frag}" if frag else target


def relative_assets(value: str) -> str:
    return value.replace("/img/", "img/").replace("/frames/", "frames/")


def convert(src: Path, lang: str, current: str, main: bool) -> str:
    soup = BeautifulSoup(src.read_text(), "html.parser")
    html = soup.find("html")
    font_classes = html.get("class", [])
    title = soup.title.string if soup.title else TITLE

    for tag in soup.find_all(["script", "link", "noscript"]):
        tag.decompose()
    for meta in soup.find_all("meta"):
        if meta.get("property", "").startswith("og:") or meta.get("name", "").startswith("twitter:"):
            meta.decompose()

    placeholder = "[شعار الشركة]" if lang == "ar" else "[Company logo]"
    for img in soup.find_all("img", src="/brand/logo.png"):
        span = soup.new_tag("span", attrs={"class": "logo-ph", "role": "img", "aria-label": placeholder})
        span.string = placeholder
        img.replace_with(span)

    for tag in soup.find_all(True):
        for attr in ("src", "srcset", "srcSet"):
            if tag.has_attr(attr):
                tag[attr] = relative_assets(tag[attr])
        if tag.name == "a" and tag.has_attr("href"):
            tag["href"] = map_href(tag["href"], current)

    body = soup.body
    inner = "".join(str(c) for c in body.contents)
    scripts = f'<script src="{LENIS}"></script>\n<script src="js/site.js"></script>'
    head_bits = f'<link rel="stylesheet" href="css/site.css">\n<style>{INLINE_CSS}</style>'

    if main:
        boot = (
            "<script>(function(r){r.lang=%s;r.dir=%s;r.className=%s;})(document.documentElement);</script>"
            % (json.dumps(lang), json.dumps("rtl" if lang == "ar" else "ltr"), json.dumps(" ".join(font_classes)))
        )
        doc = f"<title>{TITLE}</title>\n{head_bits}\n{boot}\n{inner}\n{scripts}\n"
    else:
        doc = (
            f'<!doctype html>\n<html lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}" class="{" ".join(font_classes)}">\n'
            f'<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
            f"<title>{title}</title>\n{head_bits}</head>\n<body>\n{inner}\n{scripts}\n</body></html>\n"
        )

    for old, new in TEXT:
        doc = doc.replace(old, new)
    lowered = doc.lower()
    leaks = [w for w in FORBIDDEN if w in lowered]
    if leaks:
        raise SystemExit(f"{current}: identity details left in the preview: {leaks}")
    return doc


def main() -> None:
    if not (OUT_DIR / "en" / "index.html").exists():
        raise SystemExit("Run `npx next build` first.")
    shutil.rmtree(DEST, ignore_errors=True)
    (DEST / "css").mkdir(parents=True)
    (DEST / "js").mkdir()

    css = next((OUT_DIR / "_next" / "static" / "chunks").glob("*.css"))
    shutil.copy(css, DEST / "css" / "site.css")
    (DEST / "media").mkdir()
    for font in (OUT_DIR / "_next" / "static" / "media").glob("*.woff2"):
        shutil.copy(font, DEST / "media" / font.name)

    for group in ("story", "sections", "services"):
        (DEST / "img" / group).mkdir(parents=True)
        for f in (ROOT / "public" / "img" / group).glob("*.webp"):
            shutil.copy(f, DEST / "img" / group / f.name)
    for seq in sorted((ROOT / "public" / "frames").iterdir()):
        dest = DEST / "frames" / seq.name / "wide"
        dest.mkdir(parents=True)
        for f in (seq / "wide").iterdir():
            if f.suffix == ".webp" or f.name == "manifest.json":
                shutil.copy(f, dest / f.name)

    runtime = (ROOT / "scripts" / "artifact" / "site.js").read_text()
    (DEST / "js" / "site.js").write_text(runtime.replace("__CONFIG__", json.dumps(ts_config(), ensure_ascii=False)))

    pages = [("en", "", "index.html", True), ("en", "", "en.html", False), ("ar", "", "ar.html", False)]
    for lang in ("en", "ar"):
        for svc in sorted((OUT_DIR / lang / "services").iterdir()):
            pages.append((lang, f"services/{svc.name}", page_file(lang, f"services/{svc.name}"), False))
        pages.append((lang, "privacy", page_file(lang, "privacy"), False))
    for lang, path, name, is_main in pages:
        src = OUT_DIR / lang / path / "index.html"
        (DEST / name).write_text(convert(src, lang, name, is_main))

    files = [p for p in DEST.rglob("*") if p.is_file()]
    size = sum(p.stat().st_size for p in files)
    print(f"artifact/: {len(files)} files, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
