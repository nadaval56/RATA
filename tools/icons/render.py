#!/usr/bin/env python3
"""
מייצר מחדש את קובצי ה-PNG של האייקון מתוך מקורות ה-SVG.

    pip install playwright pillow
    python3 tools/icons/render.py

מקורות:
  assets/icons/icon.svg      — האייקון המלא (כוכב + רוזטת מג'נטה). מקור האמת.
  tools/icons/icon-16.svg    — וריאנט ל-16px בלבד, בלי הרוזטה שנמרחת בגודל הזה.

פלט:
  assets/icons/icon-512.png  · icon-192.png   — אייקון ההתקנה (PWA)
  assets/icons/icon-32.png                    — פאביקון
  assets/icons/icon-16.png                    — פאביקון low-dpi, מהוריאנט המפושט
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
ICONS = ROOT / "assets" / "icons"
CHROMIUM = pathlib.Path("/opt/pw-browsers/chromium")

# (קובץ מקור, גודל בפיקסלים, שם הפלט)
JOBS = [
    (ICONS / "icon.svg", 512, "icon-512.png"),
    (ICONS / "icon.svg", 192, "icon-192.png"),
    (ICONS / "icon.svg", 32, "icon-32.png"),
    (pathlib.Path(__file__).parent / "icon-16.svg", 16, "icon-16.png"),
]


def main() -> int:
    scratch = ROOT / "tools" / "icons" / "_render.html"
    with sync_playwright() as p:
        launch = {"executable_path": str(CHROMIUM)} if CHROMIUM.exists() else {}
        browser = p.chromium.launch(**launch)
        for src, size, name in JOBS:
            scratch.write_text(
                f'<body style="margin:0">'
                f'<img src="{src.as_uri()}" style="width:{size}px;height:{size}px;display:block">'
            )
            page = browser.new_page(viewport={"width": size, "height": size})
            page.goto(scratch.as_uri())
            page.wait_for_timeout(250)
            page.screenshot(path=str(ICONS / name), omit_background=True)
            page.close()
            print(f"assets/icons/{name} — {size}x{size}, "
                  f"{(ICONS / name).stat().st_size / 1024:.1f} KB")
        browser.close()
    scratch.unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
