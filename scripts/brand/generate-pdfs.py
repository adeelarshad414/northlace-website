import json
import os
import sys
from pathlib import Path

from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

rl_config.invariant = 1


def hex_color(value):
    return colors.HexColor(value)


def draw_title(page, text, x, y, color, size=28):
    page.setFillColor(hex_color(color))
    page.setFont("Helvetica-Bold", size)
    page.drawString(x, y, text)


def draw_body(page, text, x, y, color, size=12, width=360, leading=16):
    page.setFillColor(hex_color(color))
    page.setFont("Helvetica", size)
    words = text.split()
    line = ""
    offset = 0
    for word in words:
        trial = f"{line} {word}".strip()
        if page.stringWidth(trial, "Helvetica", size) > width and line:
            page.drawString(x, y - offset, line)
            line = word
            offset += leading
        else:
            line = trial
    if line:
        page.drawString(x, y - offset, line)
    return y - offset - leading


def draw_card(page, x, y, w, h, fill, stroke=None):
    page.setFillColor(hex_color(fill))
    page.setStrokeColor(hex_color(stroke or fill))
    page.roundRect(x, y, w, h, 10, fill=1, stroke=1)


def draw_swatch(page, color, x, y, w, h, surface_color, text_color):
    draw_card(page, x, y, w, h, surface_color, color["hex"])
    page.setFillColor(hex_color(color["hex"]))
    page.roundRect(x + 10, y + h - 37, 42, 22, 5, fill=1, stroke=0)
    page.setStrokeColor(hex_color(text_color))
    page.roundRect(x + 10, y + h - 37, 42, 22, 5, fill=0, stroke=1)
    page.setFillColor(hex_color(text_color))
    page.setFont("Helvetica-Bold", 10)
    page.drawString(x + 62, y + h - 22, color["name"])
    page.setFont("Helvetica", 9)
    page.drawString(x + 62, y + h - 36, color["hex"])
    draw_body(page, color["role"], x + 10, y + h - 54, text_color, 8, w - 20, 11)


def image_path(public_dir, slug, variant):
    return (
        public_dir.parent
        / "work"
        / "brand-qa"
        / "embed-assets"
        / slug
        / f"{slug}-{variant}.png"
    )


def page_setup(page, brand):
    width, height = landscape(A4)
    page.setPageSize((width, height))
    page.setFillColor(hex_color(brand["primaryLight"]))
    page.rect(0, 0, width, height, fill=1, stroke=0)
    return width, height


def build_pdf(brand, public_dir):
    slug = brand["slug"]
    out_path = public_dir / "brand" / slug / f"{slug}-brand-guidelines.pdf"
    page = canvas.Canvas(str(out_path), pagesize=landscape(A4), invariant=1)
    width, height = landscape(A4)
    dark = brand["primaryDark"]
    light = brand["primaryLight"]
    accent = brand["primaryAccent"]
    text_dark = brand["palette"][0]["hex"]
    margin = 24 * mm

    # 1. Cover
    page.setFillColor(hex_color(dark))
    page.rect(0, 0, width, height, fill=1, stroke=0)
    page.drawImage(
        str(image_path(public_dir, slug, "mark-dark")),
        margin,
        height - margin - 90,
        90,
        90,
        mask="auto",
    )
    draw_title(page, brand["name"], margin, height - margin - 135, light, 42)
    draw_body(page, brand["tagline"], margin, height - margin - 165, accent, 18, 600, 22)
    draw_body(page, "Brand Guidelines v1.0", margin, margin + 36, light, 15, 400, 18)
    page.showPage()

    # 2. Logo system
    page_setup(page, brand)
    draw_title(page, "Logo system", margin, height - margin, dark)
    y = height - margin - 44
    y = draw_body(page, brand["logoGeometry"], margin, y, dark, 12, 350, 16)
    y = draw_body(
        page,
        "Clearspace equals 25% of mark height. Minimum sizes: 24 px / 10 mm icon and 120 px lockup.",
        margin,
        y - 10,
        dark,
        12,
        350,
        16,
    )
    right_x = margin + 390
    small_variants = ["icon-transparent", "mark-dark", "mark-light"]
    for idx, variant in enumerate(small_variants):
        img = image_path(public_dir, slug, variant)
        box_w = 128
        box_h = 86
        row = idx // 2
        col = idx % 2
        x = right_x + col * 158
        y_pos = height - margin - 118 - row * 115
        draw_card(page, x, y_pos, box_w, box_h, light, dark)
        page.drawImage(str(img), x + 16, y_pos + 12, box_w - 32, box_h - 24, preserveAspectRatio=True, mask="auto")
        draw_body(page, variant, x, y_pos - 12, dark, 8, 135, 10)

    for idx, variant in enumerate(["lockup-horizontal-dark", "lockup-horizontal-light"]):
        img = image_path(public_dir, slug, variant)
        y_pos = height - margin - 300 - idx * 82
        draw_card(page, right_x, y_pos, 300, 66, light, dark)
        page.drawImage(str(img), right_x + 14, y_pos + 10, 272, 46, preserveAspectRatio=True, mask="auto")
        draw_body(page, variant, right_x, y_pos - 12, dark, 8, 250, 10)
    draw_body(page, "Do not stretch, recolor outside the palette, add shadows, rotate, outline, or place the mark on low-contrast photography.", margin, margin + 20, dark, 11, 720, 15)
    page.showPage()

    # 3. Color system
    page_setup(page, brand)
    draw_title(page, "Color system", margin, height - margin, dark)
    draw_body(page, "Primary colors carry 60-70% of the system. Accent colors stay below 10% unless they are the main mark stroke.", margin, height - margin - 30, dark, 12, 720, 16)
    cols = 4 if len(brand["palette"]) > 8 else 3
    sw_w = (width - margin * 2 - (cols - 1) * 14) / cols
    sw_h = 70
    for idx, color in enumerate(brand["palette"]):
        col = idx % cols
        row = idx // cols
        y_pos = height - margin - 130 - row * 86
        draw_swatch(page, color, margin + col * (sw_w + 14), y_pos, sw_w, sw_h, light, dark)
    page.showPage()

    # 4. Typography
    page_setup(page, brand)
    draw_title(page, "Typography", margin, height - margin, dark)
    y = draw_body(page, brand["typography"], margin, height - margin - 42, dark, 13, 660, 18)
    sizes = [38, 30, 24, 18, 13]
    labels = ["Display", "H1", "H2", "Body lead", "Body"]
    for idx, size in enumerate(sizes):
        page.setFillColor(hex_color(dark))
        page.setFont("Helvetica", size)
        page.drawString(margin, y - 25 - idx * 48, f"{labels[idx]} specimen")
    page.showPage()

    # 5. Voice and pillars
    page_setup(page, brand)
    draw_title(page, "Voice and pillars", margin, height - margin, dark)
    copy = brand.get("positioning") or brand.get("bio") or brand["tagline"]
    draw_body(page, copy, margin, height - margin - 42, dark, 12, 720, 16)
    if brand["altTaglines"]:
        draw_body(page, "Alternate lines: " + " / ".join(brand["altTaglines"]), margin, height - margin - 88, dark, 11, 720, 15)
    for idx, pillar in enumerate(brand["pillars"]):
        x = margin + (idx % 2) * 360
        y = height - margin - 185 - (idx // 2) * 100
        draw_card(page, x, y, 320, 72, "#E1F5EE" if slug != "signal-and-scale" else "#DDF5F2", accent)
        draw_title(page, pillar["name"], x + 14, y + 44, dark, 15)
        draw_body(page, pillar["description"], x + 14, y + 24, dark, 10, 280, 12)
    page.showPage()

    # 6. Do / don't
    page_setup(page, brand)
    draw_title(page, "Use it this way", margin, height - margin, dark)
    draw_card(page, margin, margin + 50, 350, height - margin * 2 - 70, "#E1F5EE" if slug != "signal-and-scale" else "#DDF5F2", accent)
    draw_card(page, margin + 390, margin + 50, 350, height - margin * 2 - 70, light, dark)
    draw_title(page, "Do", margin + 20, height - margin - 72, dark, 22)
    draw_body(page, "Use dark-first surfaces, keep generous clearspace, use the provided lockups, and keep unconfirmed links labeled to be announced.", margin + 20, height - margin - 105, dark, 13, 300, 18)
    draw_title(page, "Don't", margin + 410, height - margin - 72, dark, 22)
    draw_body(page, "Do not mix another brand palette, invent social handles, add trademark claims, use pure white, or turn amber/red/green into brand decoration.", margin + 410, height - margin - 105, dark, 13, 300, 18)
    page.showPage()

    # 7. Inventory and social specs
    page_setup(page, brand)
    draw_title(page, "Digital asset inventory", margin, height - margin, dark)
    specs = [
        "YouTube banner 2560x1440, safe area 1546x423",
        "Thumbnail 1280x720",
        "Instagram 320, 1080x1350, 1080x1920",
        "TikTok 1080x1920 captions inside center 80%",
        "Open Graph 1200x630",
        "Podcast art 3000x3000",
    ]
    for idx, spec in enumerate(specs):
        draw_body(page, spec, margin, height - margin - 48 - idx * 30, dark, 13, 500, 16)
    draw_body(page, "Included files: five SVG logo variants, one 1200x630 OG PNG, one PDF guideline deck, and one editable PPTX deck template.", margin, margin + 40, dark, 12, 720, 16)
    page.showPage()

    # 8. Back cover
    page.setFillColor(hex_color(dark))
    page.rect(0, 0, width, height, fill=1, stroke=0)
    page.drawImage(
        str(image_path(public_dir, slug, "lockup-horizontal-dark")),
        margin,
        height / 2 - 55,
        350,
        100,
        preserveAspectRatio=True,
        mask="auto",
    )
    draw_body(page, "#TODO-LINK social channels to be announced", margin, margin + 70, light, 13, 500, 18)
    draw_body(page, "#TODO-LINK contact line to be announced", margin, margin + 45, light, 13, 500, 18)
    page.showPage()
    page.save()


def main():
    if len(sys.argv) != 3:
        print("Usage: generate-pdfs.py <brands-json> <public-dir>", file=sys.stderr)
        return 2
    data = json.loads(Path(sys.argv[1]).read_text())
    public_dir = Path(sys.argv[2])
    for brand in data:
        build_pdf(brand, public_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
