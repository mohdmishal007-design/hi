#!/usr/bin/env python3
"""Package a ready-to-run Windows folder: scripts, the lead workbook and .bat launchers.

    python3 outreach/make_kit.py        -> leads/Lonestar_Outreach_Kit.zip

The zip holds the lead workbook, so it is written to leads/ (git-ignored),
not into the repository.
"""
import shutil
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT / "leads" / "Lonestar_Outreach_Kit"


def crlf(src: Path, dst: Path) -> None:
    text = src.read_text(encoding="utf-8").replace("\r\n", "\n")
    dst.write_bytes(text.replace("\n", "\r\n").encode("utf-8"))


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        kit = Path(tmp) / "Lonestar_Outreach"
        (kit / "outreach").mkdir(parents=True)
        (kit / "leads").mkdir()
        for f in (HERE / "kit").iterdir():
            dest = kit / "outreach" / f.name if f.name == "find_python.bat" else kit / f.name
            crlf(f, dest)
        for name in ("send_campaign.py", "templates.py", "README.md"):
            shutil.copy(HERE / name, kit / "outreach" / name)
        crlf(HERE / ".env.example", kit / "outreach" / ".env")
        shutil.copy(ROOT / "leads" / "Eastern_Province_Leads.xlsx", kit / "leads")
        shutil.make_archive(str(OUT), "zip", tmp, "Lonestar_Outreach")
    print(f"-> {OUT}.zip")


if __name__ == "__main__":
    main()
