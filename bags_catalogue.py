#!/usr/bin/env python3
"""Bags Catalogue - Karibu brand, centered logo everywhere."""

import os
from pathlib import Path
from site_contact import WHATSAPP_DISPLAY

from fpdf import FPDF

PROJECT_DIR = Path(__file__).resolve().parent
DIST_DIR = PROJECT_DIR / "dist"
OUTPUT = str(DIST_DIR / "bags_catalogue.pdf")
IMG_DIR = str(DIST_DIR / "images" / "products")
THUMB_DIR = str(DIST_DIR / "images" / "pdf_thumbs")
LOGO = str(DIST_DIR / "images" / "karibu-logo.png")
QR = str(DIST_DIR / "images" / "whatsapp-qr-pdf.png")

DARK = (24, 24, 8)
GREEN = (31, 81, 50)
CREAM = (239, 227, 204)
GOLD = (200, 153, 71)
WHITE = (255, 255, 255)
WARM = (136, 104, 72)

WHATSNR = WHATSAPP_DISPLAY

bags = [
("GK-BG007","Callaway Duffle Bag with Shoe Compartment","Black",9000),
("GK-BG008","Titleist BRW Collection Boston Bag","Black",8000),
("GK-BG009","Callaway Golf Shoe Bag","Black, White",4000),
("GK-BG010","Malbon Shoes Bag","Black/White",3500),
("GK-BG011","Callaway Golf Shoe Bag 2","White",4000),
("GK-BG012","Titleist Shag Bag","Black",5500),
("GK-BG013","Titleist Boston Bag (Performance Double Layer)","Black",9000),
("GK-BG014","Callaway EXIA DL Boston Bag","White",18000),
("GK-BG015","Malbon Classic Boston Bag","Black/White",8000),
("GK-BG016","Malbon Amongst The Cypress Golf Stand Bag","Multi",24000),
("GK-BG017","Malbon Duffle Bag Weekender","Green/White",7000),
("GK-BG018","Taylor Made Boston Bag","Black/Grey",9000),
]

image_map = {
"GK-BG007":"Callaway_Duffle_Bag_with_Shoe_Compartment.jpg",
"GK-BG008":"Titleist_BRW_Collection_Boston_Bag.jpg",
"GK-BG009":"Callaway_Golf_Shoe_Bag.jpg",
"GK-BG010":"Malbon_Shoes_Bag.jpg",
"GK-BG011":"Callaway_Golf_Shoe_Bag_2.jpg",
"GK-BG012":"Titleist_Shag_Bag.jpg",
"GK-BG013":"Titleist_Boston_Bag_Performance.jpg",
"GK-BG014":"Callaway_EXIA_DL_Boston_Bag.jpg",
"GK-BG015":"Malbon_Classic_Boston_Bag.jpg",
"GK-BG016":"Malbon_Amongst_Cypress_Stand_Bag.jpg",
"GK-BG017":"Malbon_Duffle_Bag_Weekender.jpg",
"GK-BG018":"Taylor_Made_Boston_Bag.jpg",
}

def find_img(sku):
    fn = image_map.get(sku, "")
    for d in [THUMB_DIR, IMG_DIR]:
        fp = os.path.join(d, fn)
        if os.path.exists(fp): return fp
    return None

def centre(pdf, text, size, style="", color=DARK, y=None):
    if y is not None: pdf.set_y(y)
    pdf.set_x(0)
    pdf.set_text_color(*color)
    pdf.set_font("Helvetica", style, size)
    pdf.cell(210, size + 2, text, align="C")

def image_centre(pdf, path, y, w=50):
    """Place image centered horizontally at given y position."""
    if os.path.exists(path):
        x = (210 - w) / 2  # Center on A4 (210mm wide)
        pdf.image(path, x, y, w=w)

pdf = FPDF("P", "mm", "A4")
pdf.set_auto_page_break(auto=True, margin=12)

# COVER
pdf.add_page()
pdf.set_fill_color(*DARK); pdf.rect(0, 0, 210, 297, "F")

# Logo - centered
image_centre(pdf, LOGO, 25, w=50)

pdf.set_fill_color(*GOLD); pdf.rect(25, 85, 160, 2, "F")
centre(pdf, "KARIBU", 16, "B", GOLD, y=95)
centre(pdf, "Bag Collection", 34, "B", WHITE, y=110)
centre(pdf, f"{len(bags)} Premium Bags", 12, "", CREAM, y=130)
pdf.set_fill_color(*GREEN); pdf.rect(25, 145, 160, 2, "F")
centre(pdf, "Callaway  |  Malbon  |  TaylorMade  |  Titleist", 11, "", CREAM, y=160)

# QR - centered
image_centre(pdf, QR, 185, w=35)
centre(pdf, WHATSNR, 10, "", WHITE, y=225)
centre(pdf, "Scan to message us on WhatsApp", 8, "", GOLD, y=235)

# PRODUCT PAGES
pdf.add_page()
pdf.set_fill_color(*GREEN); pdf.rect(0, 0, 210, 22, "F")
# Logo left-aligned on product pages (fits in header)
if os.path.exists(LOGO):
    pdf.image(LOGO, 8, 3, w=16, h=16)
pdf.set_text_color(*WHITE); pdf.set_font("Helvetica", "B", 15)
pdf.set_xy(28, 5); pdf.cell(0, 10, "All Bags")
pdf.set_font("Helvetica", "", 8)
pdf.set_xy(28, 14); pdf.cell(0, 8, f"{len(bags)} products")

for idx, (sku, name, colors, price) in enumerate(bags):
    per_page = 4
    pos = idx % per_page
    if pos == 0 and idx > 0:
        pdf.add_page()
        pdf.set_fill_color(*GREEN); pdf.rect(0, 0, 210, 16, "F")
        if os.path.exists(LOGO):
            pdf.image(LOGO, 8, 2, w=12, h=12)
        pdf.set_text_color(*WHITE); pdf.set_font("Helvetica", "B", 11)
        pdf.set_xy(22, 4); pdf.cell(0, 8, "All Bags (continued)")
    
    y = 30 + pos * 68
    pdf.set_fill_color(*CREAM)
    pdf.set_draw_color(*GOLD)
    pdf.rect(10, y, 190, 64, "DF")
    
    img_path = find_img(sku)
    if img_path:
        try: pdf.image(img_path, 14, y + 3, w=75, h=58)
        except: pass
    
    ix = 95
    pdf.set_xy(ix, y + 4)
    pdf.set_text_color(*DARK)
    pdf.set_font("Helvetica", "B", 10)
    n = name[:50] + ("..." if len(name) > 50 else "")
    pdf.cell(102, 6, n)
    
    pdf.set_xy(ix, y + 12)
    pdf.set_text_color(*WARM)
    pdf.set_font("Helvetica", "", 7)
    pdf.cell(102, 4, f"SKU: {sku}")
    if colors:
        pdf.set_xy(ix, y + 17)
        pdf.set_font("Helvetica", "", 7)
        pdf.cell(102, 4, f"Color: {colors}")
    
    pdf.set_xy(ix, y + 28)
    pdf.set_text_color(*GREEN)
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(102, 10, f"KES {price:,}")
    
    pdf.set_xy(ix, y + 40)
    pdf.set_text_color(180, 180, 180)
    pdf.set_font("Helvetica", "", 7)
    pdf.cell(102, 4, "Selling Price")

# CONTACT PAGE
pdf.add_page()
pdf.set_fill_color(*DARK); pdf.rect(0, 0, 210, 297, "F")

# Logo - centered
image_centre(pdf, LOGO, 20, w=50)

pdf.set_fill_color(*GOLD); pdf.rect(25, 75, 160, 2, "F")
centre(pdf, "Get In Touch", 24, "B", WHITE, y=85)

# QR - centered
image_centre(pdf, QR, 110, w=45)
centre(pdf, WHATSNR, 12, "B", GOLD, y=165)
centre(pdf, "Scan to message us on WhatsApp", 10, "", CREAM, y=175)

centre(pdf, "KARIBU", 11, "B", GOLD, y=220)
centre(pdf, "Premium Golf Equipment", 8, "", CREAM, y=230)

pdf.output(OUTPUT)
print(f"✅ Bags catalogue with CENTERED logo!")
print(f"   {len(bags)} products, {pdf.pages_count} pages")
print(f"   Logo, QR all centered on A4")
