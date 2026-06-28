#!/usr/bin/env python3
"""
Golf Kenya Site Generator
Fetches product data from Google Sheet → generates static HTML site + PDF catalogue
"""

import csv
import io
import os
import re
import shutil
import sqlite3
import urllib.request
import urllib.parse
from datetime import datetime

# ── Config ──
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY/export?format=csv"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dist")
SITE_TITLE = "Karibu"
SITE_URL = "https://golfklcubskenya.netlify.app"
WHATSAPP_NUMBER = "8613262570197"
WHATSAPP_LINK = f"https://wa.me/{WHATSAPP_NUMBER}"
BUSINESS_EMAIL = ""
BUSINESS_LOCATION = "Nairobi, Kenya"

# Categories with icons and descriptions
CATEGORIES = {
    "drivers": {"icon": "fa-golf-ball-tee", "label": "Drivers", "desc": "Maximum distance off the tee"},
    "golf_irons": {"icon": "fa-golf-ball-tee", "label": "Golf Irons", "desc": "Precision and control for approach shots"},
    "putters": {"icon": "fa-golf-ball-tee", "label": "Putters", "desc": "Roll it true on the greens"},
    "woods": {"icon": "fa-golf-ball-tee", "label": "Woods", "desc": "Power and versatility from the fairway"},
    "wedges": {"icon": "fa-golf-ball-tee", "label": "Wedges", "desc": "Scoring shots around the green"},
    "hybrids": {"icon": "fa-golf-ball-tee", "label": "Hybrids", "desc": "The best of both worlds"},
    "mens_polos": {"icon": "fa-shirt", "label": "Men's Polos", "desc": "Style and performance on the course"},
    "mens_pants": {"icon": "fa-person", "label": "Men's Pants", "desc": "Comfort and mobility for your swing"},
    "mens_jackets": {"icon": "fa-vest", "label": "Men's Jackets", "desc": "Weather-ready outerwear"},
    "mens_shorts": {"icon": "fa-person", "label": "Men's Shorts", "desc": "Stay cool under pressure"},
    "womens_polos": {"icon": "fa-shirt", "label": "Women's Polos", "desc": "Performance fit for women"},
    "womens_skirts": {"icon": "fa-person-dress", "label": "Women's Skirts", "desc": "Move freely on the course"},
    "womens_pants": {"icon": "fa-person-dress", "label": "Women's Pants", "desc": "Sleek and comfortable"},
    "womens_dresses": {"icon": "fa-person-dress", "label": "Women's Dresses", "desc": "Effortless elegance"},
    "womens_jackets": {"icon": "fa-vest", "label": "Women's Jackets", "desc": "Stay warm in style"},
    "womens_tops": {"icon": "fa-shirt", "label": "Women's Tops", "desc": "Versatile layering pieces"},
    "mens_shoes": {"icon": "fa-shoe-prints", "label": "Men's Shoes", "desc": "Walk the course in comfort"},
    "womens_shoes": {"icon": "fa-shoe-prints", "label": "Women's Shoes", "desc": "Style meets performance"},
    "bags": {"icon": "fa-bag-shopping", "label": "Bags", "desc": "Carry your gear in style"},
    "gloves": {"icon": "fa-hand", "label": "Gloves", "desc": "Grip it and rip it"},
    "hats_and_caps": {"icon": "fa-hat-cowboy", "label": "Hats & Caps", "desc": "Top off your look"},
    "accessories": {"icon": "fa-glasses", "label": "Accessories", "desc": "The finishing touches"},
    "balls": {"icon": "fa-golf-ball", "label": "Balls", "desc": "Premium performance golf balls"},
    "grips": {"icon": "fa-hand", "label": "Grips", "desc": "Feel the difference"},
    "range_finders": {"icon": "fa-binoculars", "label": "Range Finders", "desc": "Know your distance"},
}

# Map sheet categories to URL-friendly category slugs
CATEGORY_MAP = {
    "accessories": "accessories",
    "apparel": "mens_jackets",
    "bags": "bags",
    "balls": "balls",
    "gloves": "gloves",
    "grips": "grips",
    "hats & caps": "hats_and_caps",
    "irons": "golf_irons",
    "putters": "putters",
    "range finders": "range_finders",
    "shoes": "mens_shoes",
    "wedges": "wedges",
}

SHEET_CATEGORY_DISPLAY = {
    "accessories": "Accessories",
    "apparel": "Apparel",
    "bags": "Bags",
    "balls": "Balls",
    "gloves": "Gloves",
    "grips": "Grips",
    "hats & caps": "Hats & Caps",
    "irons": "Irons",
    "putters": "Putters",
    "range finders": "Range Finders",
    "shoes": "Shoes",
    "wedges": "Wedges",
}


def fetch_data():
    """Fetch CSV from Google Sheets."""
    print("📥 Fetching product data from Google Sheet...")
    req = urllib.request.Request(SHEET_CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(raw))
    products = []
    for row in reader:
        name = (row.get("Name") or "").strip()
        if not name:
            continue
        cat = (row.get("Category") or "").strip().lower()
        price_str = (row.get("Price Kenya (Ksh)") or "").strip()
        price_clean = re.sub(r"[^\d]", "", price_str)
        cost_cny = (row.get("Cost China (CNY)") or "").strip()
        cost_kes = (row.get("Cost China (Ksh)") or "").strip()
        products.append({
            "sku": (row.get("SKU") or "").strip(),
            "name": name,
            "category_raw": cat,
            "category_slug": CATEGORY_MAP.get(cat, "accessories"),
            "category_display": SHEET_CATEGORY_DISPLAY.get(cat, cat.title()),
            "description": (row.get("Description") or "").strip(),
            "sizes": (row.get("Sizes") or "").strip(),
            "colors": (row.get("Colors") or "").strip(),
            "price_kes": int(price_clean) if price_clean else 0,
            "price_display": f"KES {int(price_clean):,}" if price_clean else "Inquire",
            "cost_cny": cost_cny,
            "cost_kes": cost_kes,
            "status": (row.get("Status") or "").strip(),
            "stock": (row.get("Stock") or "").strip(),
            "image": (row.get("Image") or "").strip(),
        })
    print(f"   ✅ {len(products)} products loaded")
    return products


def fetch_data_from_db():
    """Fetch product data from SQLite database (admin backend)."""
    db_path = os.path.join(os.path.dirname(__file__), "backend", "golf_kenya.db")
    print("📥 Fetching product data from SQLite database...")
    
    if not os.path.exists(db_path):
        print("   ⚠️  SQLite database not found. Falling back to Google Sheet.")
        return fetch_data()
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        rows = conn.execute("""
            SELECT p.*, c.label as category_label
            FROM products p
            JOIN categories c ON p.category_slug = c.slug
            ORDER BY p.category_slug, p.name
        """).fetchall()
        conn.close()
        
        products = []
        for row in rows:
            cat = row["category_slug"]
            # Find the raw category for display
            raw_cat = None
            for k, v in CATEGORY_MAP.items():
                if v == cat:
                    raw_cat = k
                    break
            
            price = row["price_kes"] or 0
            products.append({
                "sku": row["sku"],
                "name": row["name"],
                "category_raw": raw_cat or cat,
                "category_slug": cat,
                "category_display": SHEET_CATEGORY_DISPLAY.get(raw_cat or "", row["category_label"] or cat.title()),
                "description": row["description"] or "",
                "sizes": row["sizes"] or "",
                "colors": row["colors"] or "",
                "price_kes": price,
                "price_display": f"KES {price:,}" if price else "Inquire",
                "cost_cny": row["cost_cny"] or "",
                "cost_kes": row["cost_kes"] or "",
                "status": row["status"] or "",
                "stock": row["stock"] or "",
                "image": row["image"] or "",
            })
        
        print(f"   ✅ {len(products)} products loaded from SQLite")
        return products
    except Exception as e:
        print(f"   ⚠️  SQLite error: {e}. Falling back to Google Sheet.")
        return fetch_data()


def safe_filename(name):
    """Convert product name to a safe filename."""
    s = name.replace(" ", "_").replace("/", "_").replace("\\", "_")
    return re.sub(r'[^a-zA-Z0-9_-]', '', s) + ".jpg"


def get_product_image(product):
    """Get the best available image for a product."""
    # Check in dist/images/products first
    base_dir = os.path.dirname(__file__)
    img_dir = os.path.join(base_dir, "dist", "images", "products")
    fn = safe_filename(product["name"])
    fpath = os.path.join(img_dir, fn)

    if os.path.isfile(fpath):
        return f"/images/products/{fn}"

    # Fallback to permanent images directory
    perm_dir = os.path.join(base_dir, "images", "products")
    perm_path = os.path.join(perm_dir, fn)
    if os.path.isfile(perm_path):
        # Copy to dist for deployment
        os.makedirs(img_dir, exist_ok=True)
        try:
            import shutil
            shutil.copy2(perm_path, fpath)
        except:
            pass
        return f"/images/products/{fn}"

    # Category-based fallbacks for missing product images
    cat = product["category_slug"]
    cat_img = {
        "mens_shoes": "__cat_shoes.jpg",
        "womens_shoes": "__cat_shoes.jpg",
        "balls": "__cat_balls.jpg",
        "range_finders": "__cat_rangefinder.jpg",
    }
    fallback = cat_img.get(cat, "__cat_golf_generic.jpg")
    fb_path = os.path.join(img_dir, fallback)
    if os.path.isfile(fb_path):
        return f"/images/products/{fallback}"

    return ""


def group_by_category(products):
    """Group products by their category slug."""
    groups = {}
    for p in products:
        slug = p["category_slug"]
        groups.setdefault(slug, []).append(p)
    return groups


# ── HTML Templates ──

def render_nav(active_page="home"):
    home_active = " active" if active_page == "home" else ""
    return f"""    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo">
                <img src="/images/karibu-logo-small.png" alt="Karibu" style="height:32px;width:32px;border-radius:50%;">
                <span class="logo-text">KARIBU</span>
            </a>
            <ul class="nav-menu">
                <li><a href="/" class="nav-link{home_active}">Home</a></li>
                                <li><a href="/categories/" class="nav-link">Categories</a></li>
                <li><a href="/#products" class="nav-link">Shop</a></li>
                <li><a href="/about.html" class="nav-link">About</a></li>
                <li><a href="/#contact" class="nav-link">Contact</a></li>
            </ul>
            <div class="nav-actions">
                <a href="{WHATSAPP_LINK}" class="btn-nav-cta" target="_blank">
                    <i class="fab fa-whatsapp"></i> Chat
                </a>
            </div>
            <button class="nav-toggle" id="navToggle">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>"""


def render_announcement():
    return ""


def render_footer():
    return f"""    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <a href="/" class="footer-logo">
                        <img src="/images/karibu-logo-small.png" alt="Karibu" style="height:24px;width:24px;border-radius:50%;vertical-align:middle;margin-right:8px;">
                        <span class="logo-text">KARIBU</span>
                    </a>
                    <p>Premium golf equipment and lifestyle products for the discerning golfer in Kenya.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/#products">Shop</a></li>
                        <li><a href="/about.html">About Us</a></li>
                        <li><a href="/#brands">Brands</a></li>
                        
                        <li><a href="/#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Brands</h4>
                    <ul>
                        <li><a href="#">TaylorMade</a></li>
                        <li><a href="#">Callaway</a></li>
                        <li><a href="#">J.Lindeberg</a></li>
                        <li><a href="#">Titleist</a></li>
                        <li><a href="#">Ping</a></li>
                        <li><a href="#">FootJoy</a></li>
                    </ul>
                </div>
                <div class="footer-newsletter">
                    <h4>Contact Us on WhatsApp</h4>
                    <p>Scan the QR code or tap to chat</p>
                    <a href="https://wa.me/8613262570197" target="_blank" style="display:inline-block;">
                        <img src="/images/whatsapp-qr.png" alt="WhatsApp" style="width:100px;height:100px;border-radius:12px;">
                    </a>
                    <p style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.7);">+86 13262570197</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; {datetime.now().year} Karibu. All rights reserved.</p>
            </div>
        </div>
    </footer>"""


def render_product_card(p):
    img = get_product_image(p)
    img_html = f'<img src="{img}" alt="{p["name"]}" loading="lazy">' if img else '<div class="product-placeholder"><i class="fas fa-golf-ball"></i></div>'
    badge = ""
    if p["price_kes"] >= 50000:
        badge = '<span class="product-badge">Premium</span>'
    elif p["price_kes"] >= 20000:
        badge = '<span class="product-badge">Featured</span>'

    sku_html = f'<span class="product-sku">SKU: {p["sku"]}</span>' if p['sku'] else ''
    slug = p['sku'].lower() if p['sku'] else p['name'].lower().replace(' ', '-')
    prod_url = f"/products/{slug}.html"
    return f"""        <a href="{prod_url}" class="product-card-link" style="text-decoration:none;color:inherit;display:block;">
        <div class="product-card" data-category="{p['category_slug']}" data-aos="fade-up">
            <div class="product-image-wrapper">
                {img_html}
                <div class="product-actions">
                    <button class="btn-wishlist" onclick="event.stopPropagation();inquireProduct('{p['name']}', '{p['price_display']}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
                {badge}
            </div>
            <div class="product-details">
                <span class="product-category">{p['category_display']}</span>
                <h3 class="product-title">{p['name']}</h3>
                <div class="product-meta">
                    {sku_html}
                </div>
                <div class="product-price">{p['price_display']}</div>
                <button class="btn-inquire" onclick="event.stopPropagation();inquireProduct('{p['name']}', '{p['price_display']}')">
                    <i class="fab fa-whatsapp"></i> Inquire Now
                </button>
            </div>
        </div>
        </a>"""


def render_product_page(p):
    """Generate a full product detail page."""
    img = get_product_image(p)
    import os as _gio
    _base_dir = _gio.path.dirname(__file__)
    _prod_img_dir = _gio.path.join(_base_dir, "dist", "images", "products")
    _base_name = safe_filename(p["name"]).rsplit(".", 1)[0]
    _all_imgs = [img] if img else []
    for _suf in ["_2", "_3", "_4"]:
        _gfn = f"{_base_name}{_suf}.jpg"
        if _gio.path.isfile(_gio.path.join(_prod_img_dir, _gfn)):
            _all_imgs.append(f"/images/products/{_gfn}")
    _main = _all_imgs[0] if _all_imgs else ""
    _thumbs = " ".join(f'<img src="{s}" alt="{p["name"]}" class="pthumb" onclick="document.getElementById(\'pmain\').src=this.src" loading="lazy">' for s in _all_imgs[1:])
    img_html = ""
    if _main:
        img_html = f'<div class="pimage-main"><img id="pmain" src="{_main}" alt="{p["name"]}"></div>'
    if _thumbs:
        img_html += f'<div class="pimage-thumbs">{_thumbs}</div>'
    if not img_html:
        img_html = '<div class="product-placeholder"><i class="fas fa-golf-ball"></i></div>'
    desc = (p['description'] or f'Premium quality {p["name"]}. Designed for performance and comfort on the course.').replace("'", "\\'")
    colors = (p['colors'] or '').replace("'", "\\'")
    sizes = (p['sizes'] or '').replace("'", "\\'")
    stock_status = "In Stock" if (p['status'] or '') == "In Stock" else "Low Stock"
    
    wa_msg = f"I'm interested in the {p['name']} ({p['sku']}) - {p['price_display']}"
    cat_link = f"/categories/{p['category_slug']}.html"
    
    back_link = f'<div class="container" style="padding-top: 100px;"><div class="back-to-shop"><a href="{cat_link}"><i class="fas fa-arrow-left"></i> Back to {p["category_display"]}</a></div></div>'
    
    sizes_block = f'<p class="product-detail-size">Sizes: {sizes}</p>' if sizes else ''

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{p['name']} - KARIBU</title>
    <meta name="description" content="{desc[:150]}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <style>
        .product-detail {{ padding: 60px 0; background: #f8f5ee; min-height: calc(100vh - 400px); }}
        .product-detail-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; max-width: 1100px; margin: 0 auto; padding: 0 20px; }}
        .product-detail-image {{ background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }}
        .product-detail-image img {{ width: 100%; height: auto; display: block; }}
        .product-detail-info {{ padding-top: 10px; }}
        .product-detail-badge {{ display: inline-block; background: #1f5132; color: #c9a961; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }}
        .product-detail-title {{ font-family: 'Playfair Display', serif; font-size: 32px; color: #1a1a1a; margin-bottom: 10px; font-weight: 700; }}
        .product-detail-sku {{ font-size: 14px; color: #888; margin-bottom: 15px; }}
        .product-detail-meta {{ display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; padding: 15px 0; border-top: 1px solid #e8e0d0; border-bottom: 1px solid #e8e0d0; }}
        .product-detail-meta-item {{ flex: 1; min-width: 120px; }}
        .product-detail-meta-item label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600; }}
        .product-detail-meta-item span {{ display: block; font-size: 16px; color: #1a1a1a; font-weight: 500; margin-top: 3px; }}
        .product-detail-price {{ font-size: 36px; font-weight: 800; color: #1f5132; margin: 20px 0; }}
        .product-detail-desc {{ color: #555; line-height: 1.8; margin-bottom: 30px; font-size: 15px; }}
        .product-detail-actions {{ display: flex; gap: 15px; flex-wrap: wrap; }}
        .btn-detail-inquire {{ display: inline-flex; align-items: center; gap: 10px; background: #25D366; color: #fff; padding: 15px 35px; border-radius: 50px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s; text-decoration: none; }}
        .btn-detail-inquire:hover {{ background: #1da851; transform: translateY(-2px); }}
        .btn-detail-back {{ display: inline-flex; align-items: center; gap: 8px; color: #1f5132; text-decoration: none; font-weight: 500; padding: 15px 25px; border: 2px solid #1f5132; border-radius: 50px; transition: all 0.3s; }}
        .btn-detail-back:hover {{ background: #1f5132; color: #fff; }}
        .product-detail-size {{ color: #555; font-size: 14px; margin: 5px 0; }}
        .back-to-shop {{ text-align: center; margin-bottom: 20px; }}
        .back-to-shop a {{ color: #1f5132; text-decoration: none; font-weight: 500; font-size: 15px; }}
        .back-to-shop a:hover {{ color: #c9a961; }}
        .pimage-main {{ width:100%; margin-bottom:12px; }}
        .pimage-main img {{ width:100% !important; height:auto !important; display:block !important; }}
        .pimage-thumbs {{ display:flex !important; gap:8px; margin-top:0; }}
        .pthumb {{ width:70px !important; height:70px !important; object-fit:cover; border-radius:8px; border:2px solid #e0d8c8; cursor:pointer; transition:all 0.2s; }}
        .pthumb:hover {{ border-color:#c9a961; transform:scale(1.05); }}
        @media (max-width: 768px) {{ .product-detail-grid {{ grid-template-columns: 1fr; gap: 30px; }} .product-detail-title {{ font-size: 24px; }} .product-detail-price {{ font-size: 28px; }} }}
    </style>
</head>
<body>
    {render_announcement()}
    {render_nav("shop")}

{back_link}

    <section class="product-detail">
        <div class="container">
            <div class="product-detail-grid">
                <div class="product-detail-image" data-aos="fade-right">
                    {img_html}
                </div>
                <div class="product-detail-info" data-aos="fade-left">
                    <span class="product-detail-badge">{p['category_display']}</span>
                    <h1 class="product-detail-title">{p['name']}</h1>
                    <p class="product-detail-sku">SKU: {p['sku']}</p>
                    <div class="product-detail-meta">
                        <div class="product-detail-meta-item">
                            <label>Colors</label>
                            <span>{colors or 'Various'}</span>
                        </div>
                        <div class="product-detail-meta-item">
                            <label>Availability</label>
                            <span>{stock_status}</span>
                        </div>
                    </div>
                    {sizes_block}
                    <div class="product-detail-price">{p['price_display']}</div>
                    <div class="product-detail-desc">{desc}</div>
                    <div class="product-specs">
                        <h3 class="specs-title">Product Specifications</h3>
                        <ul class="specs-list">
                            <li><span class="spec-label">Model</span><span class="spec-value">{p['name']}</span></li>
                            <li><span class="spec-label">SKU</span><span class="spec-value">{p['sku']}</span></li>
                            <li><span class="spec-label">Category</span><span class="spec-value">{p['category_display']}</span></li>
                            <li><span class="spec-label">Colors</span><span class="spec-value">{colors or 'Various'}</span></li>
                            <li><span class="spec-label">Sizes</span><span class="spec-value">{sizes or 'Standard'}</span></li>
                            <li><span class="spec-label">Status</span><span class="spec-value">{stock_status}</span></li>
                        </ul>
                    </div>
                    <div class="product-detail-actions">
                        <a href="https://wa.me/{WHATSAPP_NUMBER}?text={urllib.parse.quote(wa_msg)}" target="_blank" class="btn-detail-inquire">
                            <i class="fab fa-whatsapp"></i> Inquire via WhatsApp
                        </a>
                        <a href="{cat_link}" class="btn-detail-back">
                            <i class="fas fa-arrow-left"></i> Back to {p['category_display']}
                        </a>
                    </div>
                    <div class="product-features">
                        <h3 class="features-title">Product Details</h3>
                        <div class="features-grid">
                            <div class="feature-item">
                                <i class="fas fa-check-circle" style="color:#c9a961;"></i>
                                <span>100% Authentic</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-truck" style="color:#c9a961;"></i>
                                <span>Nationwide Delivery</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-shield-alt" style="color:#c9a961;"></i>
                                <span>Premium Quality</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-hand-holding-usd" style="color:#c9a961;"></i>
                                <span>Best Price Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {render_footer()}
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="/script.js"></script>
    <script>AOS.init({{ duration: 800, once: true }});</script>
</body>
</html>"""


def render_index(products, groups):
    # Show only 8 featured products on homepage (one per category)
    import random as _rd
    _rng = _rd.Random(42)
    featured = []
    seen_cats = set()
    for p in products:
        if p["category_slug"] not in seen_cats:
            featured.append(p)
            seen_cats.add(p["category_slug"])
        if len(featured) >= 8:
            break
    if len(featured) < 8:
        remaining = [p for p in products if p not in featured]
        _rng.shuffle(remaining)
        featured.extend(remaining[:8-len(featured)])
    featured_cards = "\n".join(render_product_card(p) for p in featured)

    # Stats
    total_products = len(products)
    total_categories = len([g for g in groups.values() if len(g) > 0])
    brands_count = 8

    # Category grid
    cat_links = []
    i = 0
    for slug, info in CATEGORIES.items():
        cat_products = groups.get(slug, [])
        if not cat_products:
            continue
        delay = i * 50
        first_img = f"/images/categories/cat_{slug}.jpg"
        cat_links.append(f"""            <a class='category-card-link' data-aos-delay='{delay}' data-aos='fade-up' href='/categories/{slug}.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="{first_img}" alt="{info['label']}" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>{info['label']}</h3>
                        <span class="product-count">{len(cat_products)} products</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>""")
        i += 1

    # Brands
    brand_items = [
        ("taylormade", "TaylorMade"),
        ("callaway", "Callaway"),
        ("j-lindeberg", "J.Lindeberg"),
        ("titleist", "Titleist"),
        ("malbon", "Malbon Golf"),
        ("footjoy", "FootJoy"),
        ("ping", "Ping"),
        ("cobra", "Cobra"),
    ]
    def _ext(slug):
        return "svg" if slug in ["taylormade","callaway","j-lindeberg","titleist","ping"] else "png"
    brand_svgs = "\n".join(
        f'            <div class="brand-item"><img src="/images/brands/brand_{slug}.{_ext(slug)}" alt="{name}" class="brand-logo" loading="lazy"></div>'
        for slug, name in brand_items
    )

    # Filters
    filters = ["all"] + sorted(set(p["category_slug"] for p in products))
    filter_labels = {"all": "All"}
    for p in products:
        if p["category_slug"] not in filter_labels:
            filter_labels[p["category_slug"]] = p["category_display"]
    filter_btns = "\n".join(
        f'                <button class="filter-btn{f' active' if f == 'all' else ''}" data-filter="{f}">{filter_labels[f]}</button>'
        for f in filters
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{SITE_TITLE} - Premium Golf Equipment & Lifestyle</title>
    <meta name="description" content="Premium golf equipment, apparel and accessories from top brands. Shop TaylorMade, Callaway, J.Lindeberg, Titleist and more in Kenya.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    {render_announcement()}
    {render_nav("home")}

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-bg" style="background-image:url(/images/hero-golf-africa.jpg);"></div>
        <div class="hero-content" data-aos="fade-up" data-aos-duration="1000">
            <span class="hero-subtitle">Premium Golf Lifestyle</span>
            <h1 class="hero-title">Elevate Your<br><span>Game</span></h1>
            <p class="hero-description">Curated collection of premium golf equipment and apparel from the world's finest brands. Delivered across Kenya.</p>
            <div class="hero-buttons">
                <a href="#products" class="btn btn-primary">
                    Shop Collection <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
        <div class="hero-scroll">
            <span>Scroll</span>
            <div class="scroll-line"></div>
        </div>
    </section>

    <!-- Brands Section -->
    <div class="brands-bar">
        <div class="brands-slider">
            {brand_svgs}
            {brand_svgs}
        </div>
    </div>

    <!-- Categories Section -->
    <section id="categories" class="categories-section">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-label">Browse By</span>
                <h2 class="section-title">Shop <span>Categories</span></h2>
                <p class="section-description">Premium golf equipment, apparel & accessories</p>
            </div>
            <div class="categories-grid">
            <a class='category-card-link' data-aos-delay='0' data-aos='fade-up' href='/categories/golf-clubs.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_golf_irons.jpg" alt="Golf Clubs" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Golf Clubs</h3>
                        <span class="product-count">Drivers, woods, hybrids, irons, wedges & putters</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            <a class='category-card-link' data-aos-delay='50' data-aos='fade-up' href='/categories/clothes.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_mens_jackets.jpg" alt="Clothes" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Clothes</h3>
                        <span class="product-count">Men's & Women's apparel</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            <a class='category-card-link' data-aos-delay='100' data-aos='fade-up' href='/categories/bags.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_bags.png?v=2" alt="Bags" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Bags</h3>
                        <span class="product-count">Carry your gear in style</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            <a class='category-card-link' data-aos-delay='150' data-aos='fade-up' href='/categories/mens_shoes.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_mens_shoes.jpg?v=2" alt="Shoes" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Shoes</h3>
                        <span class="product-count">Men's & Women's golf shoes</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            <a class='category-card-link' data-aos-delay='200' data-aos='fade-up' href='/categories/hats_and_caps.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_hats_and_caps.png?v=2" alt="Hats & Caps" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Hats & Caps</h3>
                        <span class="product-count">Top off your look</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            <a class='category-card-link' data-aos-delay='250' data-aos='fade-up' href='/categories/accessories.html'>
                <div class="category-card">
                    <div class="category-image">
                        <img src="/images/categories/cat_accessories.jpg" alt="Accessories" loading="lazy">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3>Accessories</h3>
                        <span class="product-count">Gloves, balls, grips & more</span>
                        <span class="category-cta">Shop Now <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </a>            </div>
        </div>
    </section>

    <!-- Featured Stats -->
    <section class="stats-section">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item" data-aos="fade-up" data-aos-delay="0">
                    <span class="stat-number">{total_products}+</span>
                    <span class="stat-label">Premium Products</span>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="100">
                    <span class="stat-number">{total_categories}</span>
                    <span class="stat-label">Categories</span>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="200">
                    <span class="stat-number">{brands_count}</span>
                    <span class="stat-label">Top Brands</span>
                </div>
                <div class="stat-item" data-aos="fade-up" data-aos-delay="300">
                    <span class="stat-number">24/7</span>
                    <span class="stat-label">WhatsApp Support</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section id="products" class="products-section">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-label">Our Collection</span>
                <h2 class="section-title">Shop <span>Premium</span></h2>
                <p class="section-description">Handpicked selection of the finest golf equipment and apparel</p>
            </div>


            <div class="products-grid">
{featured_cards}
            </div>
            <div class="text-center" style="text-align:center;margin-top:40px;" data-aos="fade-up">
                <a href="/categories/" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:10px;padding:14px 40px;font-size:16px;">
                    Browse All Categories <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content" data-aos="fade-up">
                <h2>Can't Find What You're Looking For?</h2>
                <p>We source premium golf equipment from around the world. Contact us for special orders.</p>
                <div class="cta-buttons">
                    <a href="{WHATSAPP_LINK}?text=Hi!%20I'm%20looking%20for%20specific%20golf%20equipment" class="btn btn-primary btn-large" target="_blank">
                        <i class="fab fa-whatsapp"></i> Contact Us
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
        <div class="container">
            <div class="about-grid">
                <div class="about-content" data-aos="fade-right">
                    <span class="section-label">About Us</span>
                    <h2 class="section-title">Your Golf <span>Partner</span></h2>
                    <p>Golf Kenya is your premier destination for premium golf equipment and apparel in East Africa. We bring you the finest brands and latest collections from around the world, delivered right to your doorstep.</p>
                    <div class="about-features">
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>100% Authentic Products</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Direct from Manufacturers</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Nationwide Delivery in Kenya</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Competitive Pricing & Bulk Orders</span>
                        </div>
                    </div>
                </div>
                <div class="about-image" data-aos="fade-left">
                    <div class="image-frame">
                        <img src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600" alt="Golf Course">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <span class="section-label">Get In Touch</span>
                <h2 class="section-title">Contact <span>Us</span></h2>
            </div>
            <div class="contact-grid">
                <div class="contact-card" data-aos="fade-up" data-aos-delay="0">
                    <div class="contact-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <h3>WhatsApp</h3>
                    <p>Chat with us instantly</p>
                    <a href="{WHATSAPP_LINK}" target="_blank">+254 700 000 000</a>
                </div>
                <div class="contact-card" data-aos="fade-up" data-aos-delay="100">
                    <div class="contact-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <h3>WhatsApp QR</h3>
                    <p>Scan to chat with us</p>
                    <img src="/images/whatsapp-qr.png" alt="WhatsApp QR" style="width:120px;height:120px;border-radius:12px;margin-top:8px;">
                </div>
                <div class="contact-card" data-aos="fade-up" data-aos-delay="200">
                    <div class="contact-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <h3>Location</h3>
                    <p>Visit our showroom</p>
                    <span>{BUSINESS_LOCATION}</span>
                </div>
                <div class="contact-card" data-aos="fade-up" data-aos-delay="300">
                    <div class="contact-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <h3>Catalogue</h3>
                    <p>Browse our full collection</p>
                    <a href="/catalogue.pdf" target="_blank">Download PDF</a>
                </div>
            </div>
        </div>
    </section>

    {render_footer()}

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="/script.js"></script>
</body>
</html>"""
    return html


def render_category_page(slug, info, cat_products):
    product_cards = "\n".join(render_product_card(p) for p in cat_products)
    first_img = get_product_image(cat_products[0]) if cat_products else ""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{info['label']} - {SITE_TITLE}</title>
    <meta name="description" content="Shop {info['label']} at {SITE_TITLE}. {info['desc']}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    {render_announcement()}
    {render_nav('category')}

    <!-- Category Header -->
    <section class="category-hero">
        <div class="category-hero-bg">
            <img src="/images/categories/cat_{slug}.jpg" alt="{info['label']}" loading="lazy">
        </div>
        <div class="category-hero-content" data-aos="fade-up">
            <i class="fas {info['icon']} category-hero-icon"></i>
            <h1 class="category-hero-title">{info['label']}</h1>
            <p class="category-hero-description">{info['desc']} — {len(cat_products)} premium products</p>
            <a class='btn btn-outline' href='/#products'>
                <i class="fas fa-arrow-left"></i> Back to All Products
            </a>
            <a href="/catalogue.pdf" target="_blank" class="btn btn-primary" style="margin-left:10px;">
                <i class="fas fa-download"></i> Download Catalogue
            </a>
        </div>
    </section>

    <!-- Products Section -->
    <section class="products-section">
        <div class="container">
            <div class="section-header" data-aos="fade-up">
                <h2 class="section-title">{info['label']} <span>Collection</span></h2>
                <p class="section-description">{len(cat_products)} products available</p>
            </div>
            <div class="products-grid">
{product_cards}
            </div>
            <div class="text-center" style="text-align:center;margin-top:40px;" data-aos="fade-up">
                <a href="/categories/" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:10px;padding:14px 40px;font-size:16px;">
                    Browse All Categories <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content" data-aos="fade-up">
                <h2>Interested in Bulk Orders?</h2>
                <p>We offer special pricing for clubs, pros, and bulk purchases.</p>
                <a href="{WHATSAPP_LINK}?text=Hi!%20I'd%20like%20to%20inquire%20about%20bulk%20pricing" class="btn btn-primary btn-large" target="_blank">
                    <i class="fab fa-whatsapp"></i> Contact Us
                </a>
            </div>
        </div>
    </section>

    {render_footer()}

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="/script.js"></script>
</body>
</html>"""
    return html


def generate_styles():
    return """/* Golf Kenya - Premium Styles */
:root {
    --primary: #185838;
    --primary-light: #286e46;
    --primary-dark: #102010;
    --accent: #c89848;
    --accent-light: #d4b060;
    --text-dark: #181808;
    --text-light: #7a7a6a;
    --text-muted: #999;
    --bg-light: #f2e8cf;
    --bg-cream: #ede4c8;
    --white: #ffffff;
    --black: #000000;
    --gradient-dark: linear-gradient(135deg, #185838 0%, #102010 100%);
    --shadow-sm: 0 2px 10px rgba(0,0,0,0.08);
    --shadow-md: 0 10px 40px rgba(0,0,0,0.12);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.15);
    --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior: smooth; }
body { font-family:'Montserrat',sans-serif; color:var(--text-dark); line-height:1.6; overflow-x:hidden; }
.container { max-width:1400px; margin:0 auto; padding:0 20px; }

/* Announcement Bar */
.announcement-bar { background:var(--gradient-dark); color:var(--white); text-align:center; padding:12px 20px; font-size:13px; letter-spacing:0.5px; }
.announcement-bar span { color:var(--accent); font-weight:600; cursor:pointer; }

/* Navigation */
.navbar { position:fixed; top:40px; left:0; right:0; z-index:1000; background:rgba(255,255,255,0.95); backdrop-filter:blur(20px); transition:var(--transition); }
.navbar.scrolled { top:0; box-shadow:var(--shadow-sm); }
.nav-container { max-width:1400px; margin:0 auto; padding:0 40px; display:flex; align-items:center; justify-content:space-between; height:80px; }
.nav-logo { display:flex; align-items:center; justify-content:center; gap:10px; text-decoration:none; }

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:10px; padding:16px 32px; border-radius:50px; font-family:'Montserrat',sans-serif; font-size:15px; font-weight:600; text-decoration:none; cursor:pointer; transition:var(--transition); border:2px solid transparent; }
.btn-primary { background:var(--gradient-dark); color:var(--white); }
.btn-primary:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
.btn-outline { background:transparent; border-color:var(--primary); color:var(--primary); }
.btn-outline:hover { background:var(--primary); color:var(--white); }
.btn-large { padding:20px 40px; font-size:16px; }
.btn-inquire { width:100%; padding:14px; background:var(--gradient-dark); color:var(--white); border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition); display:flex; align-items:center; justify-content:center; gap:8px; font-family:'Montserrat',sans-serif; }
.btn-inquire:hover { opacity:0.9; transform:translateY(-1px); }
.btn-inquire i { font-size:18px; }
.btn-nav-cta { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:var(--gradient-dark); color:var(--white); text-decoration:none; border-radius:50px; font-size:13px; font-weight:600; transition:var(--transition); }
.btn-nav-cta:hover { transform:translateY(-1px); box-shadow:var(--shadow-sm); }
.btn-catalogue { background:var(--accent); }
.btn-catalogue:hover { background:#b8944e; }

/* Logo */
.logo-text { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--primary); }
.logo-text span { color:var(--accent); }

.nav-menu { display:flex; list-style:none; gap:32px; }
.nav-menu li a { text-decoration:none; color:var(--text-dark); font-size:14px; font-weight:500; transition:var(--transition); position:relative; padding:5px 0; }
.nav-menu li a::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:var(--accent); transition:var(--transition); }
.nav-menu li a:hover::after,
.nav-menu li a.active::after { width:100%; }
.nav-menu li a.active { color:var(--primary); font-weight:600; }
.nav-actions { display:flex; align-items:center; gap:12px; }
.nav-toggle { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:5px; }
.nav-toggle span { display:block; width:25px; height:2px; background:var(--text-dark); transition:var(--transition); }

/* Hero */
.hero { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg-cream); position:relative; overflow:hidden; }
.hero-bg { position:absolute; inset:0; background-size:cover; background-position:center; background-repeat:no-repeat; }
.hero-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%); }
.hero-content { text-align:center; max-width:800px; padding:0 20px; z-index:1; }
.hero-subtitle { font-size:14px; letter-spacing:3px; text-transform:uppercase; color:var(--accent); font-weight:600; }
.hero-title { font-family:'Playfair Display',serif; font-size:clamp(48px, 10vw, 96px); font-weight:700; color:var(--primary); line-height:1.1; margin:20px 0; }
.hero-title span { color:var(--accent); }
.hero-description { font-size:18px; color:var(--text-light); max-width:500px; margin:0 auto 40px; line-height:1.8; }
.hero-buttons { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.hero-scroll { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:10px; }
.hero-scroll span { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); }
.scroll-line { width:1px; height:40px; background:linear-gradient(to bottom, var(--accent), transparent); animation:scrollPulse 2s ease-in-out infinite; }
@keyframes scrollPulse { 0%,100% { opacity:0.3; } 50% { opacity:1; } }

/* Sections */
.section-header { text-align:center; margin-bottom:60px; }
.section-label { font-size:13px; letter-spacing:3px; text-transform:uppercase; color:var(--accent); font-weight:600; }
.section-title { font-family:'Playfair Display',serif; font-size:clamp(32px,5vw,48px); font-weight:700; color:var(--primary); margin:10px 0; }
.section-title span { color:var(--accent); }
.section-description { color:var(--text-light); font-size:16px; max-width:500px; margin:0 auto; }

/* Brands */
.brands-bar { padding:40px 0; background:var(--bg-cream); overflow:hidden; }
.brands-bar .brands-slider { display:flex; gap:40px; animation:scrollBrands 30s linear infinite; white-space:nowrap; }
.brands-bar .brands-slider:hover { animation-play-state:paused; }
@keyframes scrollBrands { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
.brand-item { flex:0 0 auto; display:flex; align-items:center; justify-content:center; padding:12px 24px; background:var(--bg-light); border-radius:16px; min-width:180px; min-height:70px; }
.brand-logo { max-height:48px; width:auto; display:block; object-fit:contain; opacity:0.85; transition:opacity 0.3s; }
.brand-item:hover .brand-logo { opacity:1; }
.brand-name { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:var(--text-dark); letter-spacing:1px; }

/* Categories */
.categories-section { padding:100px 0; background:var(--bg-cream); }
.categories-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:24px; }
.category-card-link { text-decoration:none; display:block; }
.category-card { position:relative; border-radius:20px; overflow:hidden; height:300px; cursor:pointer; }
.category-image { position:absolute; inset:0; }
.category-image img { width:100%; height:100%; object-fit:cover; transition:var(--transition); }
.category-card:hover .category-image img { transform:scale(1.08); }
.category-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%); }
.category-content { position:absolute; bottom:0; left:0; right:0; padding:30px; color:var(--white); z-index:1; }
.category-content i { font-size:28px; color:var(--accent); margin-bottom:10px; }
.category-content h3 { font-size:20px; font-weight:600; margin-bottom:4px; }
.product-count { font-size:13px; opacity:0.8; display:block; margin-bottom:8px; }
.category-cta { font-size:13px; font-weight:600; color:var(--accent); display:flex; align-items:center; gap:6px; transition:var(--transition); }
.category-card:hover .category-cta { gap:10px; }

/* 3D Card Effect */
.category-card-link { perspective:1000px; }
.category-card { transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform-style:preserve-3d; }
.category-card:hover { transform:rotateX(-4deg) rotateY(4deg) scale(1.03); box-shadow:0 25px 60px rgba(0,0,0,0.25); }
.category-card:hover .category-overlay { background:linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.05) 60%, transparent 100%); }
.category-card:hover .category-content { transform:translateZ(20px); }
.category-content { transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform-style:preserve-3d; }
.category-image img { transition:transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.category-card:hover .category-image img { transform:scale(1.12); }

/* 3D Effect for subcategory cards (umbrella pages) */
.subsection-card { perspective:1000px; transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform-style:preserve-3d; }
.subsection-card:hover { transform:rotateX(-3deg) rotateY(3deg) scale(1.03); box-shadow:0 20px 50px rgba(0,0,0,0.2); }

/* 3D Effect for product cards */
.product-card { transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform-style:preserve-3d; }
.product-card:hover { transform:rotateX(-2deg) rotateY(2deg) scale(1.02); box-shadow:0 20px 50px rgba(0,0,0,0.15); }

/* Stats */
.stats-section { padding:80px 0; background:var(--gradient-dark); color:var(--white); }
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:40px; text-align:center; }
.stat-number { font-family:'Playfair Display',serif; font-size:48px; font-weight:700; color:var(--accent); display:block; }
.stat-label { font-size:16px; opacity:0.8; display:block; margin-top:8px; }

/* Products */
.products-section { padding:100px 0; background:var(--white); }
.filters-wrapper { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:50px; }
.filter-btn { padding:10px 24px; border:2px solid var(--primary); background:transparent; color:var(--primary); border-radius:50px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:var(--transition); }
.filter-btn.active,
.filter-btn:hover { background:var(--primary); color:var(--white); }
.products-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:30px; }

.product-card { background:var(--white); border-radius:16px; overflow:hidden; transition:var(--transition); border:1px solid rgba(0,0,0,0.06); }
.product-card:hover { transform:translateY(-4px); box-shadow:0 15px 50px rgba(0,0,0,0.12); }
.product-image-wrapper { position:relative; height:300px; background:var(--bg-light); overflow:hidden; }
.product-image-wrapper img { width:100%; height:100%; object-fit:contain; padding:24px; transition:var(--transition); }
.product-card:hover .product-image-wrapper img { transform:scale(1.08); }
.product-placeholder { display:flex; align-items:center; justify-content:center; height:100%; font-size:64px; color:var(--text-muted); background:linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%); }
.product-actions { position:absolute; top:12px; right:12px; display:flex; gap:8px; opacity:0; transition:var(--transition); }
.product-card:hover .product-actions { opacity:1; }
.btn-wishlist { width:40px; height:40px; border-radius:50%; border:none; background:var(--white); color:var(--primary); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:var(--shadow-sm); transition:var(--transition); }
.btn-wishlist:hover { background:var(--gradient-dark); color:var(--white); }
.product-badge { position:absolute; top:15px; left:15px; padding:5px 14px; background:var(--accent); color:var(--white); border-radius:50px; font-size:11px; font-weight:600; letter-spacing:0.5px; }
.product-details { padding:20px; }
.product-category { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-muted); font-weight:600; }
.product-title { font-size:15px; font-weight:600; margin:8px 0; color:var(--text-dark); line-height:1.4; }
.product-meta { margin-bottom:8px; }
.product-sku { font-size:11px; color:var(--text-muted); }
.product-price { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--primary); margin:10px 0 16px; }

/* CTA Section */
.cta-section { padding:100px 0; background:var(--bg-cream); text-align:center; }
.cta-content { max-width:600px; margin:0 auto; }
.cta-content h2 { font-family:'Playfair Display',serif; font-size:clamp(28px,4vw,42px); color:var(--primary); margin-bottom:16px; }
.cta-content p { color:var(--text-light); font-size:16px; margin-bottom:30px; }
.cta-buttons { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }

/* About */
.about-section { padding:100px 0; background:var(--white); }
.about-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
.about-features { display:flex; flex-direction:column; gap:16px; margin-top:30px; }
.feature { display:flex; align-items:center; gap:12px; font-size:15px; }
.feature i { color:var(--accent); font-size:18px; }
.image-frame { border-radius:24px; overflow:hidden; position:relative; }
.image-frame::before { content:''; display:block; padding-bottom:80%; }
.image-frame img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

/* Contact */
.contact-section { padding:100px 0; background:var(--bg-cream); }
.contact-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:30px; }
.contact-card { background:var(--white); padding:40px; border-radius:20px; text-align:center; transition:var(--transition); border:1px solid rgba(0,0,0,0.06); }
.contact-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-md); }
.contact-icon { width:60px; height:60px; border-radius:50%; background:var(--bg-light); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:24px; color:var(--primary); }
.contact-card h3 { font-size:18px; font-weight:600; margin-bottom:8px; }
.contact-card p { color:var(--text-light); font-size:14px; margin-bottom:12px; }
.contact-card a, .contact-card span { color:var(--primary); font-weight:600; text-decoration:none; font-size:15px; }
.contact-card a:hover { color:var(--accent); }

/* Footer */
.footer { background:var(--primary-dark); color:var(--white); padding:80px 0 0; }
.footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 2fr; gap:60px; margin-bottom:60px; }
.footer-logo { display:flex; align-items:center; justify-content:center; gap:8px; } .footer-logo .logo-text { color:var(--white); }
.footer-brand p { color:rgba(255,255,255,0.7); font-size:14px; line-height:1.8; margin:20px 0; }
.social-links { display:flex; gap:12px; }
.social-links a { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:var(--white); transition:var(--transition); text-decoration:none; }
.social-links a:hover { background:var(--accent); color:var(--primary-dark); }
.footer-links h4 { font-size:16px; margin-bottom:20px; }
.footer-links ul { list-style:none; }
.footer-links ul li { margin-bottom:12px; }
.footer-links ul li a { color:rgba(255,255,255,0.7); text-decoration:none; font-size:14px; transition:var(--transition); }
.footer-links ul li a:hover { color:var(--accent); }
.footer-newsletter p { color:rgba(255,255,255,0.7); font-size:14px; margin-bottom:20px; }
.newsletter-form { display:flex; gap:10px; }
.newsletter-form input { flex:1; padding:14px 18px; border-radius:12px; border:none; background:rgba(255,255,255,0.1); color:var(--white); font-family:'Montserrat',sans-serif; outline:none; }
.newsletter-form input::placeholder { color:rgba(255,255,255,0.4); }
.newsletter-form button { width:50px; height:50px; border-radius:12px; border:none; background:var(--accent); color:var(--primary-dark); cursor:pointer; font-size:16px; transition:var(--transition); }
.newsletter-form button:hover { background:var(--accent-light); }
.footer-bottom { border-top:1px solid rgba(255,255,255,0.1); padding:30px 0; text-align:center; font-size:13px; color:rgba(255,255,255,0.5); }
.footer-bottom a { color:var(--accent); text-decoration:none; }

/* Category Pages */
.category-hero { min-height:60vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:var(--bg-cream); padding-top:120px; }
.category-hero-bg { position:absolute; inset:0; }
.category-hero-bg img { width:100%; height:100%; object-fit:cover; opacity:0.15; }
.category-hero-content { text-align:center; max-width:800px; padding:0 20px; z-index:1; }
.category-hero-icon { font-size:64px; color:var(--accent); margin-bottom:20px; }
.category-hero-title { font-family:'Playfair Display',serif; font-size:clamp(36px,8vw,64px); font-weight:700; color:var(--text-dark); margin-bottom:20px; }
.category-hero-description { font-size:18px; color:var(--text-light); margin-bottom:30px; }

/* Responsive */
@media (max-width:1024px) {
    .about-grid { grid-template-columns:1fr; gap:50px; }
    .stats-grid { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:768px) {
    .nav-menu { display:none; position:absolute; top:80px; left:0; right:0; background:var(--white); flex-direction:column; padding:20px 40px; gap:16px; box-shadow:var(--shadow-md); }
    .nav-menu.active { display:flex; }
    .nav-toggle { display:flex; }
    .nav-actions { gap:8px; }
    .btn-nav-cta span { display:none; }
    .contact-grid { grid-template-columns:1fr; }
    .stats-grid { grid-template-columns:repeat(2,1fr); gap:30px; }
    .stat-number { font-size:36px; }
    .footer-grid { grid-template-columns:1fr; gap:40px; }
    .categories-grid { grid-template-columns:repeat(2,1fr); }
    .products-grid { grid-template-columns:repeat(2,1fr); gap:16px; }
}
@media (max-width:480px) {
    .hero-buttons, .cta-buttons { flex-direction:column; width:100%; }
    .btn { width:100%; justify-content:center; }
    .products-grid { grid-template-columns:1fr; }
    .categories-grid { grid-template-columns:1fr; }
}
"""


def generate_script():
    return """// Golf Kenya - Script
AOS.init({ duration:800, easing:'ease-out-cubic', once:true, offset:100 });

// Navbar scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.pageYOffset > 100);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Product filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        productCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => { card.style.display = 'none'; }, 300);
            }
        });
    });
});

// WhatsApp inquiry
function inquireProduct(productName, price) {
    const message = encodeURIComponent(
        'Hi! I\\'m interested in:\\n\\n*' + productName + '*\\nPrice: ' + price + '\\n\\nPlease provide more details.'
    );
    window.open('https://wa.me/254700000000?text=' + message, '_blank');
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
});
"""


def generate_pdf(products, groups):
    """Generate a professional multi-page PDF catalogue with images and prices."""
    try:
        from fpdf import FPDF
    except ImportError:
        from fpdf2 import FPDF

    base_dir = os.path.dirname(__file__)
    img_dir = os.path.join(base_dir, "dist", "images", "products")
    thumb_dir = os.path.join(base_dir, "dist", "images", "pdf_thumbs")
    
    # Use thumbnails if available (much smaller PDF)
    img_source = thumb_dir if os.path.isdir(thumb_dir) and len(os.listdir(thumb_dir)) > 5 else img_dir
    
    # Verify images are findable
    if os.path.isdir(img_source):
        avail = set(os.listdir(img_source))
    else:
        avail = set()
    
    print(f"   📷 PDF checking {len(avail)} images in {img_source}")

    def find_img(name):
        """Find product image across possible locations."""
        fn = safe_filename(name)
        # Check thumbnails first, then full images
        for d in [img_source, img_dir]:
            p = os.path.join(d, fn)
            if os.path.isfile(p) and os.path.getsize(p) > 2000:
                return p
        # Check fallback images
        for fb in ["__cat_golf_generic.jpg", "__cat_shoes.jpg", "__cat_balls.jpg", "__cat_rangefinder.jpg"]:
            for d in [img_source, img_dir]:
                p = os.path.join(d, fb)
                if os.path.isfile(p):
                    return p
        return None

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)

    GREEN = (26, 71, 42)
    GOLD = (201, 169, 97)
    DARK = (26, 26, 26)
    GREY = (102, 102, 102)
    WHITE = (255, 255, 255)
    LIGHT_BG = (245, 245, 245)

    # ═══════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════
    pdf.add_page()
    # Full green background
    pdf.set_fill_color(*GREEN)
    pdf.rect(0, 0, 210, 297, "F")
    # Gold accent stripe at top
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 0, 210, 12, "F")
    # Bottom stripe
    pdf.rect(0, 280, 210, 17, "F")

    # Brand title
    pdf.set_y(70)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "PREMIUM GOLF EQUIPMENT & APPAREL", align="C")

    pdf.ln(18)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 52)
    pdf.cell(0, 25, "GOLF KENYA", align="C")

    pdf.ln(28)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "", 20)
    pdf.cell(0, 12, "2026 Product Catalogue", align="C")

    # Divider line
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.5)
    pdf.line(50, pdf.get_y() + 8, 160, pdf.get_y() + 8)

    pdf.ln(16)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "", 13)
    pdf.cell(0, 8, f"{len(products)} Premium Products  |  12 Categories  |  8 Top Brands", align="C")
    pdf.cell(0, 8, "TaylorMade  |  Titleist  |  Callaway  |  Ping  |  FootJoy  |  J.Lindeberg  |  PXG  |  Malbon", align="C")

    # Contact block
    pdf.set_y(195)
    pdf.set_fill_color(*GOLD)
    pdf.rect(40, 190, 130, 1, "F")
    pdf.ln(6)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "CONTACT US", align="C")
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "", 11)
    pdf.ln(8)
    pdf.cell(0, 7, "[WhatsApp] WhatsApp: +254 700 000 000", align="C")
    pdf.cell(0, 7, "[Email] Email: info@golfkenya.com", align="C")
    pdf.cell(0, 7, "[Location] Nairobi, Kenya", align="C")

    pdf.set_y(260)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 5, "100% Authentic Products  |  Direct from Manufacturers  |  Nationwide Delivery", align="C")
    pdf.cell(0, 5, f"Catalogue updated: {datetime.now().strftime('%d %B %Y')}", align="C")

    # ═══════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.set_fill_color(*GREEN)
    pdf.rect(0, 0, 210, 40, "F")
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 40, 210, 3, "F")

    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_xy(20, 10)
    pdf.cell(0, 14, "Contents")

    y = 58
    pdf.set_text_color(*DARK)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_xy(20, y)
    pdf.cell(0, 10, "Product Categories")
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.3)
    pdf.line(20, y + 10, 190, y + 10)

    y = 78
    page_num = 3
    for slug, info in CATEGORIES.items():
        prods = groups.get(slug, [])
        if not prods:
            continue
        # Background stripe
        if (page_num - 3) % 2 == 0:
            pdf.set_fill_color(248, 248, 248)
            pdf.rect(15, y - 1, 180, 9, "F")
        
        pdf.set_xy(22, y)
        pdf.set_text_color(*DARK)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(12, 7, f"{page_num-2}.")
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(85, 7, info["label"])
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*GREY)
        pdf.cell(30, 7, f"{len(prods)} products", align="R")
        pdf.set_text_color(*GOLD)
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(20, 7, f"p.{page_num}", align="R")
        y += 9.5
        page_num += 1

    # How to order
    y += 12
    pdf.set_xy(20, y)
    pdf.set_text_color(*DARK)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "How to Order")
    pdf.set_draw_color(*GOLD)
    pdf.line(20, y + 10, 190, y + 10)
    y += 18
    pdf.set_xy(25, y)
    pdf.set_text_color(*GREY)
    pdf.set_font("Helvetica", "", 10)
    steps = [
        "1. Browse the catalogue and find your products",
        "2. WhatsApp us the product name/SKU and quantity",
        "3. We confirm availability, pricing & delivery timeline",
        "4. Order delivered across Kenya within 2-5 business days",
    ]
    for s in steps:
        pdf.set_xy(25, y)
        pdf.cell(0, 7, s)
        y += 7.5

    # ═══════════════════════════════════════════
    # PRODUCT PAGES — 2 products per row, bigger layout
    # ═══════════════════════════════════════════
    for slug, info in CATEGORIES.items():
        prods = groups.get(slug, [])
        if not prods:
            continue

        # Category header page
        pdf.add_page()
        pdf.set_fill_color(*GREEN)
        pdf.rect(0, 0, 210, 50, "F")
        pdf.set_fill_color(*GOLD)
        pdf.rect(0, 50, 210, 3, "F")

        pdf.set_text_color(*WHITE)
        pdf.set_font("Helvetica", "B", 26)
        pdf.set_xy(20, 12)
        pdf.cell(0, 14, info["label"])
        pdf.set_font("Helvetica", "", 11)
        pdf.set_xy(20, 30)
        pdf.cell(0, 8, f"{len(prods)} products  |  Prices in KES  |  Golf Kenya 2026")

        # Products in a 2-column card layout
        card_w = 87
        card_h = 52
        gap_x = 6
        gap_y = 6
        x_start = 12
        y_start = 68

        for idx, p in enumerate(prods):
            col = idx % 2
            row = idx // 2
            x = x_start + col * (card_w + gap_x)
            y = y_start + row * (card_h + gap_y)

            # Check if we need a new page
            if y + card_h > 280:
                pdf.add_page()
                y = 20
                row = 0

            # Card background — alternating subtle colors
            card_bg = WHITE if col == 1 else LIGHT_BG
            pdf.set_fill_color(*card_bg)
            pdf.rect(x, y, card_w, card_h, "F")
            
            # Left accent bar
            pdf.set_fill_color(*GOLD)
            pdf.rect(x, y, 3, card_h, "F")

            # Product image (top-left area)
            img_path = find_img(p["name"])
            img_placed = False
            if img_path:
                try:
                    pdf.image(img_path, x=x + 6, y=y + 4, w=28, h=28)
                    img_placed = True
                except:
                    pass

            if not img_placed:
                # Placeholder circle
                pdf.set_fill_color(*GREEN)
                pdf.circle(x + 20, y + 18, 14)
                pdf.set_text_color(*WHITE)
                pdf.set_font("Helvetica", "B", 16)
                pdf.set_xy(x + 9, y + 11)
                pdf.cell(22, 14, p["name"][0], align="C")

            # Product name (to the right of image)
            text_x = x + 38
            text_w = card_w - 42
            
            pdf.set_xy(text_x, y + 3)
            pdf.set_text_color(*DARK)
            pdf.set_font("Helvetica", "B", 8)
            name = p["name"][:42] + "..." if len(p["name"]) > 42 else p["name"]
            pdf.multi_cell(text_w, 4.5, name)

            # SKU
            pdf.set_xy(text_x, y + 13)
            pdf.set_text_color(*GREY)
            pdf.set_font("Helvetica", "", 6)
            pdf.cell(text_w, 3.5, f"SKU: {p['sku']}")

            # Colors / Sizes
            details = []
            if p["colors"]:
                details.append(p["colors"])
            if p["sizes"]:
                details.append(p["sizes"])
            if details:
                pdf.set_xy(text_x, y + 17)
                pdf.set_text_color(*GREY)
                pdf.set_font("Helvetica", "", 6)
                pdf.cell(text_w, 3.5, " | ".join(details))

            # Price - BIG and prominent
            pdf.set_xy(text_x, y + 25)
            pdf.set_text_color(*GREEN)
            pdf.set_font("Helvetica", "B", 14)
            pdf.cell(text_w, 7, p["price_display"])

            # Description snippet
            desc = p["description"]
            if desc:
                pdf.set_xy(text_x, y + 34)
                pdf.set_text_color(*GREY)
                pdf.set_font("Helvetica", "", 6)
                desc_short = desc[:65] + "..." if len(desc) > 65 else desc
                pdf.cell(text_w, 3.5, desc_short)

            # WhatsApp badge
            pdf.set_xy(text_x, y + 40)
            pdf.set_fill_color(*GREEN)
            pdf.set_text_color(*WHITE)
            pdf.set_font("Helvetica", "B", 6)
            pdf.cell(30, 5, "  WhatsApp to Order  ", border=1, fill=True)

            # Stock badge
            if p["status"] == "In Stock":
                pdf.set_xy(text_x + 33, y + 40)
                pdf.set_text_color(*GREEN)
                pdf.set_font("Helvetica", "", 6)
                pdf.cell(20, 5, "[In Stock] In Stock")

    # ═══════════════════════════════════════════
    # ORDER / CONTACT PAGE
    # ═══════════════════════════════════════════
    pdf.add_page()
    pdf.set_fill_color(*GREEN)
    pdf.rect(0, 0, 210, 297, "F")
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 0, 210, 8, "F")
    pdf.rect(50, 85, 110, 2, "F")

    pdf.set_y(70)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 30)
    pdf.cell(0, 16, "Ready to Order?", align="C")

    pdf.set_y(105)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 7, "Contact us on WhatsApp with the product names or", align="C")
    pdf.cell(0, 7, "SKU numbers you need. We'll respond within minutes.", align="C")

    pdf.set_y(140)
    contact_items = [
        ("[WhatsApp]", "WhatsApp", "+254 700 000 000", "Quickest response"),
        ("[Email]", "Email", "info@golfkenya.com", "For bulk orders"),
        ("[Location]", "Location", "Nairobi, Kenya", "By appointment"),
    ]
    for emoji, title, val, sub in contact_items:
        pdf.set_fill_color(*WHITE)
        pdf.rect(40, pdf.get_y(), 130, 22, "F")
        pdf.set_text_color(*GREEN)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_xy(48, pdf.get_y() + 3)
        pdf.cell(120, 8, f"{emoji}  {title}: {val}")
        pdf.set_text_color(*GREY)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_xy(48, pdf.get_y() + 9)
        pdf.cell(120, 6, sub)
        pdf.ln(28)

    pdf.set_y(230)
    pdf.set_fill_color(*GOLD)
    pdf.rect(50, 228, 110, 1, "F")
    pdf.ln(6)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Delivery & Payment", align="C")
    pdf.ln(10)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "", 9)
    details_list = [
        "- Free delivery in Nairobi for orders over KES 50,000",
        "- Nationwide shipping available",
        "- Payment: M-Pesa, Bank Transfer, or Cash on Delivery",
        "- 100% Authentic products guaranteed",
    ]
    for d in details_list:
        pdf.cell(0, 6, d, align="C")
        pdf.ln(6)

    pdf.set_y(275)
    pdf.set_text_color(*GOLD)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 5, "Golf Kenya - Your Premier Golf Equipment Partner in East Africa", align="C")

    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pdf_path = os.path.join(OUTPUT_DIR, "catalogue.pdf")
    pdf.output(pdf_path)
    print(f"   ✅ PDF catalogue generated: {pdf_path} ({pdf.pages_count} pages)")
    return pdf_path


def main(use_db=False):
    """Generate the static site.
    
    Args:
        use_db: If True, read from SQLite database instead of Google Sheet.
    
    Returns:
        Summary string of what was generated.
    """
    print("=" * 50)
    print(f"  🏌️  {SITE_TITLE} Site Generator")
    print(f"  {datetime.now().strftime('%B %d, %Y at %H:%M')}")
    print("=" * 50)

    # Fetch data
    if use_db:
        products = fetch_data_from_db()
    else:
        products = fetch_data()
    groups = group_by_category(products)

    if not products:
        print("❌ No products found!")
        return

    # Prepare output directory
    source_img_dir = os.path.join(os.path.dirname(__file__), "images", "products")

    if os.path.exists(OUTPUT_DIR):
        for item in os.listdir(OUTPUT_DIR):
            if item == "images":
                continue  # Preserve images if already there
            item_path = os.path.join(OUTPUT_DIR, item)
            try:
                if os.path.isfile(item_path):
                    os.remove(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path, ignore_errors=True)
            except:
                pass
    os.makedirs(os.path.join(OUTPUT_DIR, "categories"), exist_ok=True)

    # Copy images from permanent source to dist
    target_img_dir = os.path.join(OUTPUT_DIR, "images", "products")
    os.makedirs(target_img_dir, exist_ok=True)
    if os.path.isdir(source_img_dir):
        for f in os.listdir(source_img_dir):
            try:
                shutil.copy2(os.path.join(source_img_dir, f), os.path.join(target_img_dir, f))
            except:
                pass
        img_count = len(os.listdir(target_img_dir))
        print(f"   📷 {img_count} product images copied")

    # Generate index page
    print("\n📄 Generating pages...")
    index_html = render_index(products, groups)
    with open(os.path.join(OUTPUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)
    print("   ✅ index.html")

    # Generate category pages
    cat_count = 0
    for slug, info in CATEGORIES.items():
        cat_products = groups.get(slug, [])
        if not cat_products:
            continue
        cat_html = render_category_page(slug, info, cat_products)
        with open(os.path.join(OUTPUT_DIR, "categories", f"{slug}.html"), "w", encoding="utf-8") as f:
            f.write(cat_html)
        cat_count += 1
    print(f"   ✅ {cat_count} category pages")

    # Generate individual product pages
    prod_count = 0
    prod_dir = os.path.join(OUTPUT_DIR, "products")
    os.makedirs(prod_dir, exist_ok=True)
    for p in products:
        slug = p['sku'].lower() if p['sku'] else p['name'].lower().replace(' ', '-')
        page_html = render_product_page(p)
        with open(os.path.join(prod_dir, f"{slug}.html"), "w", encoding="utf-8") as f:
            f.write(page_html)
        prod_count += 1
    print(f"   ✅ {prod_count} product pages")

    # Generate CSS
    css = generate_styles()
    with open(os.path.join(OUTPUT_DIR, "styles.css"), "w", encoding="utf-8") as f:
        f.write(css)
    print("   ✅ styles.css")

    # Generate JS
    js = generate_script()
    with open(os.path.join(OUTPUT_DIR, "script.js"), "w", encoding="utf-8") as f:
        f.write(js)
    print("   ✅ script.js")

    # Generate PDF catalogue
    print("\n📕 Generating PDF catalogue...")
    pdf_path = generate_pdf(products, groups)

    # Summary
    summary = (f"✅ Generated {len(products)} products, {prod_count} product pages, "
               f"{cat_count} category pages, + PDF catalogue")
    print("\n" + "=" * 50)
    print(f"  ✅ Generation Complete!")
    print(f"  [Location] Output: {OUTPUT_DIR}")
    print(f"  📄 {len(products)} products  |  {prod_count} product pages")
    print(f"  📁 {cat_count} category pages")
    print(f"  📕 PDF catalogue generated")
    print("=" * 50)
    print(f"\n  To deploy: upload the 'dist/' folder to Netlify")
    if not use_db:
        print(f"  To update: edit your Google Sheet, then run:")
        print(f"    python generate.py")
    print()
    return summary


if __name__ == "__main__":
    import sys
    use_db = "--db" in sys.argv or "-d" in sys.argv
    main(use_db=use_db)
