"""Generate print-ready QR codes (PNG, SVG, sticker-sheet PDF) for the three CUORE cups.

Usage:  python scripts/make_qr.py [BASE_URL]
Default BASE_URL is https://cuorecup.vercel.app  (QR -> BASE_URL/cup/s, /cup/m, /cup/l)

Requires: pip install qrcode pillow reportlab zxing-cpp pypdfium2
The script re-reads every PNG and the rendered PDF with a QR decoder and fails
if any code does not decode to the expected URL.
"""
import io
import os
import sys

import pypdfium2 as pdfium
import qrcode
import qrcode.image.svg
import zxingcpp
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://cuorecup.vercel.app").rstrip("/")
OUT = os.path.join("deliverables", "qr")
os.makedirs(OUT, exist_ok=True)

CUPS = [
    ("S", "S-CUP", "Sodium-conscious", "#B4235A"),
    ("M", "M-CUP", "Metabolic", "#1F7A45"),
    ("L", "L-CUP", "Lipid-oriented", "#6B3FA0"),
]

pdfmetrics.registerFont(TTFont("Body", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("Bold", r"C:\Windows\Fonts\segoeuib.ttf"))


def make_qr(url):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=40, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    return qr


def decode(img):
    res = zxingcpp.read_barcodes(img)
    return [r.text for r in res]


entries = []
for key, name, tagline, color in CUPS:
    url = f"{BASE}/cup/{key.lower()}"
    qr = make_qr(url)
    png = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    png_path = os.path.join(OUT, f"QR_{name}.png")
    png.save(png_path)
    svg = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    svg.save(os.path.join(OUT, f"QR_{name}.svg"))
    got = decode(Image.open(png_path))
    assert got == [url], (name, got, url)
    entries.append((key, name, tagline, color, url, png_path))
    print("PNG ok", name, "->", url, f"({png.size[0]}px)")

# Sticker sheet: 3 rows (one per cup) x 4 stickers, 46 mm squares with a coloured label band.
pdf_path = os.path.join(OUT, "QR_Stiker_CUORE.pdf")
c = canvas.Canvas(pdf_path, pagesize=A4)
c.setTitle("CUORE QR stickers")
W, H = A4
S, GAP, COLS = 46 * mm, 6 * mm, 4
left = (W - (COLS * S + (COLS - 1) * GAP)) / 2
c.setFont("Bold", 14)
c.setFillColor(colors.black)
c.drawString(left, H - 16 * mm, "CUORE QR stickers")
c.setFont("Body", 8.5)
c.setFillColor(colors.HexColor("#5A5252"))
c.drawString(left, H - 21 * mm, f"Each code opens {BASE}/cup/s, /m or /l. Print at 100% scale (no 'fit to page'); cut along the grey outline.")

top = H - 30 * mm
for r, (key, name, tagline, color, url, png_path) in enumerate(entries):
    y = top - r * (S + 14 * mm) - S
    for ccol in range(COLS):
        x = left + ccol * (S + GAP)
        c.setStrokeColor(colors.HexColor("#BDBDBD"))
        c.setLineWidth(0.4)
        c.roundRect(x, y, S, S, 2 * mm, stroke=1, fill=0)
        band = 9 * mm
        c.setFillColor(colors.HexColor(color))
        c.roundRect(x, y + S - band, S, band, 2 * mm, stroke=0, fill=1)
        c.rect(x, y + S - band, S, 3 * mm, stroke=0, fill=1)  # square off the band's lower corners
        c.setFillColor(colors.white)
        c.setFont("Bold", 11)
        c.drawString(x + 3 * mm, y + S - band + 2.6 * mm, name)
        c.setFont("Body", 7)
        c.drawRightString(x + S - 3 * mm, y + S - band + 2.9 * mm, "CUORE")
        qrs = S - 16 * mm
        c.drawImage(ImageReader(png_path), x + (S - qrs) / 2, y + 5 * mm, qrs, qrs)
        c.setFillColor(colors.HexColor("#1D1A1A"))
        c.setFont("Body", 6.5)
        c.drawCentredString(x + S / 2, y + 2 * mm, url.replace("https://", ""))
c.showPage()
c.save()
print("PDF written", pdf_path)

# Verify: render the PDF at 300 dpi and decode every code on it.
doc = pdfium.PdfDocument(pdf_path)
page_img = doc[0].render(scale=300 / 72).to_pil().convert("RGB")
found = sorted(decode(page_img))
expected = sorted([e[4] for e in entries for _ in range(COLS)])
assert found == expected, (found, expected)
print(f"PDF decode ok: {len(found)} codes ->", sorted(set(found)))

