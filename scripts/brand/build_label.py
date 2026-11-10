"""
Builds a print-ready evenly label on top of a Supliful label template (.ai saved as PDF-compatible).

- Keeps Supliful's regulatory content EXACTLY as supplied, copied as vectors from the template:
  directions, cautions, FDA disclaimer (left panel) and Supplement Facts + Other Ingredients (right panel).
- Replaces only the front panel (Supliful's "YOUR DESIGN HERE" sample) with the Sunlit Balance design.
- Same page size, bleed and trim as the template.

Usage:
  python build_label.py <template.ai> <out-dir> <fonts-dir> <logo-green.png> <config.json>
"""
import json
import sys

import fitz  # PyMuPDF

tpl_path, out_dir, fonts_dir, logo_path, cfg_path = sys.argv[1:6]
cfg = json.load(open(cfg_path, encoding="utf-8"))

GREEN = (0x12 / 255, 0x3D / 255, 0x38 / 255)
CREAM = (0xFF / 255, 0xF8 / 255, 0xEC / 255)
WHITE = (1, 1, 1)
FRUIT = {
    "coral": (0xFF / 255, 0x73 / 255, 0x5E / 255),
    "mango": (0xFF / 255, 0xC8 / 255, 0x57 / 255),
    "guava": (0xEE / 255, 0x91 / 255, 0xAC / 255),
}


def tint(c, amt):
    return tuple(v + (1 - v) * amt for v in c)


tpl = fitz.open(tpl_path)
src = tpl[0]
W, H = src.rect.width, src.rect.height
trim = src.trimbox

doc = fitz.open()
page = doc.new_page(width=W, height=H)
page.set_trimbox(trim)
page.set_bleedbox(src.rect)

fonts = {
    "r": fitz.Font(fontfile=f"{fonts_dir}/PlusJakartaSans-Regular.ttf"),
    "sb": fitz.Font(fontfile=f"{fonts_dir}/PlusJakartaSans-SemiBold.ttf"),
    "b": fitz.Font(fontfile=f"{fonts_dir}/PlusJakartaSans-Bold.ttf"),
    "xb": fitz.Font(fontfile=f"{fonts_dir}/PlusJakartaSans-ExtraBold.ttf"),
}


def text_width(s, font, size, tracking=0.0):
    return font.text_length(s, fontsize=size) + tracking * size * max(len(s) - 1, 0)


def draw_text(s, font, size, x, y, color=GREEN, tracking=0.0, align="center"):
    """Draws text with optional letter-spacing (tracking in em). y = baseline."""
    w = text_width(s, font, size, tracking)
    if align == "center":
        x -= w / 2
    tw = fitz.TextWriter(page.rect)
    cx = x
    for ch in s:
        tw.append((cx, y), ch, font=font, fontsize=size)
        cx += font.text_length(ch, fontsize=size) + tracking * size
    tw.write_text(page, color=color)


# 1. Cream label, full bleed.
page.draw_rect(page.rect, color=None, fill=CREAM)

# 2. Regulatory panels: white cards, then Supliful's content copied as vectors (unchanged).
left_clip = fitz.Rect(*cfg["left_clip"])
right_clip = fitz.Rect(*cfg["right_clip"])
for clip in (left_clip, right_clip):
    card = fitz.Rect(clip.x0 - 3, clip.y0 - 3, clip.x1 + 3, clip.y1 + 3)
    page.draw_rect(card, color=None, fill=WHITE, radius=0.06)
    page.show_pdf_page(clip, tpl, 0, clip=clip)

# Responsible-party block (21 CFR 101.5): typeset below the left panel.
rp = cfg["responsible_party"]
y = left_clip.y1 + 10
draw_text("Manufactured for and distributed by:", fonts["r"], 4.5, left_clip.x0 + 2, y, align="left")
for line in rp:
    y += 5.2
    draw_text(line, fonts["sb"], 4.5, left_clip.x0 + 2, y, align="left")

# 3. Front panel (principal display panel).
x0, x1 = cfg["front_x"]
cx = (x0 + x1) / 2
main = FRUIT[cfg["main"]]
acc = FRUIT[cfg["accent"]]

# Fruit-slice graphics (from the packaging system): small quarter circles bottom-left,
# a large quarter circle bottom-right, bleeding off the bottom edge. Kept below the text.
import math


def quarter(cx_, cy_, r, a0, a1, fill):
    """Filled circular sector. Angles in degrees, math orientation (0 = right, 90 = up)."""
    pts = [fitz.Point(cx_, cy_)]
    for i in range(41):
        a = math.radians(a0 + (a1 - a0) * i / 40)
        pts.append(fitz.Point(cx_ + r * math.cos(a), cy_ - r * math.sin(a)))
    sh = page.new_shape()
    sh.draw_polyline(pts + [pts[0]])
    sh.finish(fill=fill, color=None, closePath=True)
    sh.commit()


by = H  # bottom of the bleed
q = cfg.get("slice_small", 17)
big = cfg.get("slice_big", 40)
quarter(x0, by - q, q, 0, 90, tint(acc, 0.35))
quarter(x0, by, q, 0, 90, tint(main, 0.4))
quarter(x0 + q, by, q, 0, 90, acc)
quarter(x1, by, big, 90, 180, main)

# Logo (approved wordmark, raster: replace with the vector file when supplied).
lw = cfg["logo_width"]
lh = lw * 433 / 1439
ly = cfg["logo_top"]
page.insert_image(fitz.Rect(cx - lw / 2, ly, cx + lw / 2, ly + lh), filename=logo_path)

y = ly + lh + 22
draw_text(cfg["name"], fonts["xb"], cfg["name_size"], cx, y, tracking=0.06)
y += 11
draw_text(cfg["descriptor"], fonts["sb"], 6.4, cx, y, tracking=0.12)
y += 11
draw_text(cfg["claim"], fonts["r"], 6.2, cx, y)

# Statement of identity + net quantity: lower 30% of the front panel (21 CFR 101.105).
draw_text(cfg["identity_qty"], fonts["b"], 5.6, cx, cfg.get("identity_y", 134), tracking=0.08)

# 4. Save PDF (vector + embedded fonts) and a 300 dpi PNG.
base = f"{out_dir}/{cfg['file']}"
doc.save(base + ".pdf", garbage=4, deflate=True)
pix = page.get_pixmap(dpi=300)
pix.save(base + "-300dpi.png")
page.get_pixmap(dpi=150).save(base + "-preview.png")

# Guides preview: trim (green) + front panel (coral) for checking.
g = fitz.open(base + ".pdf")
gp = g[0]
gp.draw_rect(trim, color=(0, 0.6, 0), width=0.4, dashes="[2] 0")
gp.draw_rect(fitz.Rect(x0, trim.y0, x1, trim.y1), color=(1, 0.3, 0.2), width=0.4, dashes="[2] 0")
gp.get_pixmap(dpi=150).save(base + "-guides.png")
print("saved", base + ".pdf")
