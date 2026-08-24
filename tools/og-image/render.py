#!/usr/bin/env python3
"""
מייצר מחדש את assets/og/cover.jpg — התמונה שמופיעה בתצוגה המקדימה
של הקישור בוואטסאפ / פייסבוק / טלגרם / לינקדאין / X.

template.html מרונדר ב-Chromium ב-1200x630 בפי-2 ואז מוקטן, כדי לקבל
קצוות חלקים. פלט: JPEG איכות 90 (~75KB) — קל מספיק כדי שהזחלן של
וואטסאפ יספיק להוריד אותו לפני timeout.

    pip install playwright pillow
    python3 tools/og-image/render.py

אם מספרי התוכן משתנים (שאלות / כרטיסיות / נושאים) — עדכן אותם
ב-template.html והרץ שוב.
"""
import pathlib
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

W, H, SCALE = 1200, 630, 2
ROOT = pathlib.Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "tools" / "og-image" / "template.html"
OUT = ROOT / "assets" / "og" / "cover.jpg"

# ב-Claude Code / CI הדפדפן כבר מותקן ב-PLAYWRIGHT_BROWSERS_PATH.
CHROMIUM = pathlib.Path("/opt/pw-browsers/chromium")


def main() -> int:
    with sync_playwright() as p:
        launch = {"executable_path": str(CHROMIUM)} if CHROMIUM.exists() else {}
        browser = p.chromium.launch(**launch)
        page = browser.new_page(
            viewport={"width": W, "height": H}, device_scale_factor=SCALE
        )
        page.goto(TEMPLATE.as_uri())
        page.wait_for_timeout(700)  # להשלמת טעינת ה-woff2 המקומיים
        png = page.screenshot(clip={"x": 0, "y": 0, "width": W, "height": H})
        browser.close()

    tmp = OUT.with_suffix(".raw.png")
    tmp.write_bytes(png)
    img = Image.open(tmp).convert("RGB").resize((W, H), Image.LANCZOS)
    img.save(OUT, quality=90, optimize=True, progressive=True, subsampling=0)
    tmp.unlink()

    print(f"{OUT.relative_to(ROOT)} — {W}x{H}, {OUT.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
