"""Build web-ready images from the committed hero stills.

Sources: hero/stills/S1-S7.jpg (picked story frames), hero/stills/extra/*.jpg
(unused candidates reused as section imagery), hero/brand-*-source.png.
Outputs: public/img/** (WebP), public/brand/**, src/app/icon.png.
Re-run after replacing any still:  npm run images
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "hero" / "stills"
OUT = ROOT / "public" / "img"


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


def save(im: Image.Image, rel: str, width: int, quality: int = 74) -> None:
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=quality, method=6)
    print(f"{rel:40s} {im.width}x{im.height} {dest.stat().st_size // 1024} KB")


# Story frames: landscape for desktop/tablet, portrait crop for phones.
PORTRAIT_FOCUS = {1: 0.55, 2: 0.5, 3: 0.6, 4: 0.68, 5: 0.3, 6: 0.55, 7: 0.64}
for i in range(1, 8):
    im = load(f"S{i}")
    save(im, f"story/s{i}-2400.webp", 2400, 72)
    save(im, f"story/s{i}-1280.webp", 1280, 72)
    save(crop(im, PORTRAIT_FOCUS[i], 0.5, 9 / 16), f"story/s{i}-portrait.webp", 900, 72)

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
    save(crop(load(name), cx, cy, aspect, scale), rel, 1400)

# Social preview card.
OUT.mkdir(parents=True, exist_ok=True)
crop(load("S7"), 0.62, 0.5, 1200 / 630).resize((1200, 630), Image.LANCZOS).save(OUT / "og.jpg", quality=82)

# Brand marks.
brand = ROOT / "public" / "brand"
brand.mkdir(parents=True, exist_ok=True)
logo = Image.open(ROOT / "hero" / "brand-logo-source.png")
logo.resize((720, round(logo.height * 720 / logo.width)), Image.LANCZOS).save(brand / "logo.png", optimize=True)
icon = Image.open(ROOT / "hero" / "brand-icon-source.png")
icon.resize((192, 192), Image.LANCZOS).save(brand / "mark.png", optimize=True)
icon.resize((180, 180), Image.LANCZOS).save(ROOT / "src" / "app" / "apple-icon.png", optimize=True)
icon.resize((64, 64), Image.LANCZOS).save(ROOT / "src" / "app" / "icon.png", optimize=True)
print("done")
