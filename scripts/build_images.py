"""Build web-ready images from the committed hero stills.

Sources: hero/stills/S1-S7.jpg (picked story frames), hero/stills/extra/*.jpg
(unused candidates reused as section imagery), hero/brand-*-source.png.
Outputs: public/img/** (WebP), public/brand/**, src/app/icon.png.
Re-run after replacing any still:  npm run images
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, PngImagePlugin

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "hero" / "stills"
OUT = ROOT / "public" / "img"
MANIFEST = json.loads((SRC / "manifest.json").read_text())


def origin(name: str) -> str:
    """Provenance line for a source still: model, job id and the exact generation prompt."""
    entry = MANIFEST.get(name) or MANIFEST["extra"][name]
    ref = f" Reference: {entry['reference']}." if entry.get("reference") else ""
    return (
        f"Generated on Higgsfield ({entry['model']}), job {entry['higgsfield_job_id']}.{ref} "
        f"Prompt: {entry['prompt']} Web derivative (crop/resize) made by scripts/build_images.py."
    )


def provenance(dest: Path, text: str) -> None:
    """Record where a raster came from: PNG text chunk, or a JSON sidecar for WebP/JPEG."""
    if dest.suffix == ".png":
        im = Image.open(dest)
        meta = PngImagePlugin.PngInfo()
        meta.add_text("impeccable:prompt", text)
        im.save(dest, pnginfo=meta, optimize=True)
    else:
        stamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        Path(f"{dest}.json").write_text(json.dumps({"prompt": text, "createdAt": stamp}, indent=2) + "\n")


def load(name: str) -> Image.Image:
    p = SRC / f"{name}.jpg"
    if not p.exists():
        p = SRC / "extra" / f"{name}.jpg"
    return Image.open(p).convert("RGB")


def crop(im: Image.Image, cx: float, cy: float, aspect: float, scale: float = 1.0) -> Image.Image:
    """Largest box of `aspect` (w/h) that fits, shrunk by `scale`, centred on (cx, cy) fractions."""
    W, H = im.size
    w, h = (W, W / aspect) if W / H < aspect else (H * aspect, H)
    w, h = w * scale, h * scale
    left = min(max(cx * W - w / 2, 0), W - w)
    top = min(max(cy * H - h / 2, 0), H - h)
    return im.crop((round(left), round(top), round(left + w), round(top + h)))


def save(im: Image.Image, rel: str, width: int, quality: int = 74, source: str = "") -> None:
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=quality, method=6)
    if source:
        provenance(dest, origin(source))
    print(f"{rel:40s} {im.width}x{im.height} {dest.stat().st_size // 1024} KB")


# Story frames: landscape for desktop/tablet, portrait crop for phones.
PORTRAIT_FOCUS = {1: 0.55, 2: 0.5, 3: 0.6, 4: 0.68, 5: 0.3, 6: 0.55, 7: 0.64}
for i in range(1, 8):
    im = load(f"S{i}")
    save(im, f"story/s{i}-2400.webp", 2400, 72, f"S{i}")
    save(im, f"story/s{i}-1280.webp", 1280, 72, f"S{i}")
    save(crop(im, PORTRAIT_FOCUS[i], 0.5, 9 / 16), f"story/s{i}-portrait.webp", 900, 72, f"S{i}")

# Section imagery: (source, centre x, centre y, aspect, scale).
SECTIONS = {
    "sections/topdrive.webp": ("S1", 0.545, 0.42, 4 / 5, 1.0),
    "sections/rig-dusk.webp": ("S7", 0.64, 0.5, 4 / 5, 1.0),
    "sections/port-arrival.webp": ("S3", 0.62, 0.45, 16 / 9, 0.8),
    "services/customs-clearance.webp": ("S5", 0.4, 0.55, 3 / 2, 0.9),
    "services/saber-certification.webp": ("S5-1", 0.45, 0.55, 3 / 2, 0.9),
    "services/import-export-agency.webp": ("S3-6", 0.6, 0.5, 3 / 2, 0.9),
    "services/sea-freight.webp": ("S2", 0.5, 0.5, 3 / 2, 0.9),
    "services/air-freight.webp": ("S4", 0.62, 0.45, 3 / 2, 0.85),
    "services/land-freight.webp": ("S6-3", 0.5, 0.5, 3 / 2, 0.9),
    "services/oil-gas-projects.webp": ("S7-3", 0.6, 0.5, 3 / 2, 0.9),
    "services/warehousing.webp": ("S3", 0.75, 0.4, 3 / 2, 0.7),
    "services/containers.webp": ("S1-1", 0.4, 0.5, 3 / 2, 0.9),
}
for rel, (name, cx, cy, aspect, scale) in SECTIONS.items():
    save(crop(load(name), cx, cy, aspect, scale), rel, 1400, source=name)

# Social preview card.
OUT.mkdir(parents=True, exist_ok=True)
crop(load("S7"), 0.62, 0.5, 1200 / 630).resize((1200, 630), Image.LANCZOS).save(OUT / "og.jpg", quality=82)
provenance(OUT / "og.jpg", origin("S7"))

# Brand marks.
brand = ROOT / "public" / "brand"
brand.mkdir(parents=True, exist_ok=True)
logo = Image.open(ROOT / "hero" / "brand-logo-source.png")
logo.resize((720, round(logo.height * 720 / logo.width)), Image.LANCZOS).save(brand / "logo.png", optimize=True)
provenance(brand / "logo.png", MANIFEST["brand"]["logo"])
icon = Image.open(ROOT / "hero" / "brand-icon-source.png")
icon.resize((192, 192), Image.LANCZOS).save(brand / "mark.png", optimize=True)
provenance(brand / "mark.png", MANIFEST["brand"]["mark"])
icon.resize((180, 180), Image.LANCZOS).save(ROOT / "src" / "app" / "apple-icon.png", optimize=True)
icon.resize((64, 64), Image.LANCZOS).save(ROOT / "src" / "app" / "icon.png", optimize=True)
for app_icon in ("apple-icon.png", "icon.png"):
    provenance(ROOT / "src" / "app" / app_icon, MANIFEST["brand"]["mark"])
print("done")
