"""Turn the story clips into scroll-scrubbed WebP frame sequences.

Sources: hero/drafts/C1.mp4 … C6.mp4 (Google Flow, Veo 3.1 Fast, 1920x1080,
8 s). Each clip is trimmed to its usable span, then exported twice:

  public/frames/<id>/wide/  1280 px wide, for landscape screens
  public/frames/<id>/tall/  608x1080 portrait crop that pans with the subject, for phones

with a manifest.json per set. Run:  python3 scripts/build_frames.py
"""
import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "hero" / "drafts"
OUT = ROOT / "public" / "frames"
FPS = 10

# start/end in seconds; focus = horizontal centre of the portrait crop at the
# first and last frame (0–1 of the width), so the crop follows the subject.
CLIPS = {
    # Lightning appears from ~2.3 s: keep the clean lift only.
    "c1": {"file": "C1.mp4", "start": 0.0, "end": 2.25, "focus": (0.55, 0.55)},
    "c2": {"file": "C2.mp4", "start": 0.0, "end": 8.0, "focus": (0.45, 0.6)},
    "c3": {"file": "C3.mp4", "start": 0.0, "end": 8.0, "focus": (0.56, 0.47)},
    "c4": {"file": "C4.mp4", "start": 0.0, "end": 8.0, "focus": (0.3, 0.58)},
    "c5": {"file": "C5.mp4", "start": 0.0, "end": 8.0, "focus": (0.55, 0.55)},
    # From ~2.8 s the rig turns into a column of light: keep the arrival only.
    "c6": {"file": "C6.mp4", "start": 0.0, "end": 2.7, "focus": (0.6, 0.6)},
}

PROMPTS = json.loads((ROOT / "hero" / "clips.json").read_text())


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def export(clip_id: str, cfg: dict) -> None:
    src = SRC / cfg["file"]
    span = cfg["end"] - cfg["start"]
    a, b = cfg["focus"]
    # Portrait crop x (pixels in the 1920-wide source), easing linearly from a to b.
    crop_x = f"min(max(({a}+({b}-{a})*t/{span})*1920-304\\,0)\\,1312)"
    variants = {
        "wide": ("scale=1280:-2:flags=lanczos", 54),
        "tall": (f"crop=608:1080:{crop_x}:0", 50),
    }
    origin = PROMPTS[clip_id]
    for name, (vf, quality) in variants.items():
        dest = OUT / clip_id / name
        shutil.rmtree(dest, ignore_errors=True)
        dest.mkdir(parents=True)
        run([
            "ffmpeg", "-v", "error", "-y", "-ss", str(cfg["start"]), "-t", str(span), "-i", str(src),
            "-an", "-vf", f"fps={FPS},{vf}", "-c:v", "libwebp", "-quality", str(quality),
            "-compression_level", "6", str(dest / "f%03d.webp"),
        ])
        frames = sorted(dest.glob("f*.webp"))
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "json", str(frames[0])],
            check=True, capture_output=True, text=True,
        )
        size = json.loads(probe.stdout)["streams"][0]
        (dest / "manifest.json").write_text(json.dumps({
            "count": len(frames), "pattern": "f%03d.webp", "fps": FPS,
            "width": size["width"], "height": size["height"],
        }, indent=2) + "\n")
        # Provenance sidecar per frame (the format Impeccable's provenance scan reads for WebP).
        stamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        text = (
            f"Frame of {cfg['file']} ({cfg['start']}–{cfg['end']} s), {origin}. "
            f"Exported at {FPS} fps by scripts/build_frames.py ({name})."
        )
        for f in frames:
            Path(f"{f}.json").write_text(json.dumps({"prompt": text, "createdAt": stamp}) + "\n")
        kb = sum(f.stat().st_size for f in frames) // 1024
        print(f"{clip_id}/{name}: {len(frames)} frames, {size['width']}x{size['height']}, {kb} KB")


for clip_id, cfg in CLIPS.items():
    export(clip_id, cfg)
