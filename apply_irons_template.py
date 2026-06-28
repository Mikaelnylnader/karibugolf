#!/usr/bin/env python3
import re, os

DIST = '/mnt/c/Users/mikae/workspace/golf-kenya/dist/products'
SKUS = ['cla', 'clp', 'mzj', 'mzp', 'pgbt', 'pgg', 'pggg', 'pggs', 'pgi', 'pxxg', 'tmqi', 'tms', 'tmsm', 'ttt']

BRAND_SPECS = {
    "cla": {"style": "Players Distance", "hcp": "5-20", "forgiveness": "High", "trajectory": "High", "workability": "Medium", "face_material": "Forged 1025 Mild Carbon Steel"},
    "clp": {"style": "Players Distance", "hcp": "5-20", "forgiveness": "High", "trajectory": "Mid-High", "workability": "Medium", "face_material": "Forged 455 Steel"},
    "mzj": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "High", "trajectory": "High", "workability": "Low", "face_material": "Forged Chromoly (4120)"},
    "mzp": {"style": "Players Distance", "hcp": "3-15", "forgiveness": "Medium", "trajectory": "Mid", "workability": "High", "face_material": "Forged 1025E Carbon Steel"},
    "pgbt": {"style": "Players", "hcp": "0-10", "forgiveness": "Low-Medium", "trajectory": "Mid", "workability": "High", "face_material": "Forged 8620 Carbon Steel"},
    "pgg": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "Very High", "trajectory": "High", "workability": "Low", "face_material": "Stainless Steel (17-4)"},
    "pggg": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "Very High", "trajectory": "High", "workability": "Low", "face_material": "Stainless Steel (17-4)"},
    "pggs": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "Very High", "trajectory": "High", "workability": "Low", "face_material": "Stainless Steel (17-4)"},
    "pgi": {"style": "Players Distance", "hcp": "5-18", "forgiveness": "High", "trajectory": "Mid-High", "workability": "Medium", "face_material": "Forged 455 Steel"},
    "pxxg": {"style": "Players Distance", "hcp": "3-20", "forgiveness": "High", "trajectory": "Mid-High", "workability": "Medium", "face_material": "Forged HT1770 Steel"},
    "tmqi": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "High", "trajectory": "High", "workability": "Medium", "face_material": "Forged 450 Steel"},
    "tms": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "Very High", "trajectory": "High", "workability": "Low", "face_material": "Forged 450 Steel"},
    "tmsm": {"style": "Game Improvement", "hcp": "10-25+", "forgiveness": "Very High", "trajectory": "High", "workability": "Low", "face_material": "Forged 450 Steel"},
    "ttt": {"style": "Players Distance", "hcp": "5-20", "forgiveness": "High", "trajectory": "Mid-High", "workability": "Medium", "face_material": "Forged 8620 Carbon Steel"},
}

DEFAULT_LOFTS = [
    ["4 Iron", "19.0", "61.5", "5.8mm", "2", "39.125", "D1"],
    ["5 Iron", "21.5", "62.0", "5.2mm", "3", "38.50", "D1"],
    ["6 Iron", "25.0", "62.5", "4.7mm", "5", "37.88", "D1"],
    ["7 Iron", "28.5", "63.0", "4.2mm", "5", "37.25", "D1"],
    ["8 Iron", "32.5", "63.5", "3.5mm", "6.5", "36.75", "D1"],
    ["9 Iron", "38.0", "64.0", "3.0mm", "7", "36.25", "D1"],
    ["PW",   "43.5", "64.5", "2.6mm", "7.5", "35.75", "D1"],
    ["AW",   "49.0", "64.5", "2.0mm", "7.5", "35.50", "D1"],
    ["SW",   "54.0", "64.5", "1.5mm", "9", "35.25", "D3"],
    ["LW",   "59.0", "64.5", "1.5mm", "9", "35.00", "D3"],
]

def extract(sku):
    path = DIST + "/gk-ir-" + sku + ".html"
    if not os.path.exists(path):
        return None
    with open(path) as f:
        c = f.read()

    m = re.search(r"<title>([^<]+)", c)
    title = m.group(1).replace(" - KARIBU", "") if m else "Product " + sku.upper()

    m = re.search(r'<meta name="description" content="([^"]+)', c)
    meta_desc = m.group(1) if m else title + " at KARIBU Kenya."

    m = re.search(r"(KES\s*[\d,]+)", c)
    price = m.group(1) if m else "KES 0"

    images = re.findall(r'/images/products/([^"\'<>\s]+)', c)
    seen = set()
    uniq = []
    for img in images:
        if img not in seen:
            seen.add(img)
            uniq.append(img)
    main_img = uniq[0] if uniq else sku + ".jpg"
    thumbs = uniq[:4]
    while len(thumbs) < 4:
        thumbs.append(thumbs[0])

    desc = ""
    dm = re.search(r'<p[^>]*class="[^"]*desc[^"]*"[^>]*>(.*?)</p>', c, re.DOTALL)
    if dm:
        desc = re.sub(r"<[^>]+>", "", dm.group(1)).strip()
    if not desc:
        desc = meta_desc

    spec_items = re.findall(r"<strong>([^<]+)</strong>\s*([^<]+)", c)
    spec_items = [(s.strip(), v.strip()) for s, v in spec_items]

    loom = re.findall(r"<tr><td>([^<]+)</td><td>([^<]+)</td><td>([^<]+)</td><td>([^<]+)</td><td>([^<]+)</td><td>([^<]+)</td><td>([^<]+)</td></tr>", c)
    loft_rows = list(loom) if loom else []

    return {"title": title, "meta_desc": meta_desc, "price": price,
            "main_img": main_img, "thumbs": thumbs, "desc": desc,
            "spec_items": spec_items, "loft_rows": loft_rows}


def build_page(sku, d):
    title = d["title"]
    sku_code = "GK-IR-" + sku.upper()
    price = d.get("price", "KES 0")
    price_num = re.sub(r"[^\d]", "", price)
    main_img = d.get("main_img", "placeholder.jpg")
    thumbs = d.get("thumbs", [main_img]*4)
    desc = d.get("desc", title + " - premium golf irons.")
    meta_desc = d.get("meta_desc", title + " at KARIBU Kenya.")
    loft_rows = d.get("loft_rows", DEFAULT_LOFTS)
    spec_items = d.get("spec_items", [])
    bs = BRAND_SPECS.get(sku, {})

    # Thumbnails
    labels = ["Angle", "Sole", "Face", "Back"]
    thumb_html = ""
    for i in range(min(4, len(thumbs))):
        lbl = labels[i] if i < 4 else "View " + str(i+1)
        thumb_html += (
            '<img class="pthumb" src="/images/products/' + thumbs[i] + '" alt="' + lbl + '"'
            ' onclick="document.getElementById(\'pmain\').src=this.src">\n'
        )

    # Specs
    if spec_items:
        specs = ""
        for l, v in spec_items:
            specs += "<li><span class=\"spec-label\">" + l + "</span><span class=\"spec-value\">" + v + "</span></li>\n"
    else:
        specs = (
            "<li><span class=\"spec-label\">Model</span><span class=\"spec-value\">" + title + "</span></li>\n"
            + "<li><span class=\"spec-label\">Style</span><span class=\"spec-value\">" + bs.get("style", "Players Distance") + " - HCP " + bs.get("hcp", "5-20") + "</span></li>\n"
            + "<li><span class=\"spec-label\">Forgiveness</span><span class=\"spec-value\">" + bs.get("forgiveness", "High") + "</span></li>\n"
            + "<li><span class=\"spec-label\">Trajectory</span><span class=\"spec-value\">" + bs.get("trajectory", "Mid-High") + "</span></li>\n"
            + "<li><span class=\"spec-label\">Workability</span><span class=\"spec-value\">" + bs.get("workability", "Medium") + "</span></li>\n"
            + "<li><span class=\"spec-label\">Face Material</span><span class=\"spec-value\">" + bs.get("face_material", "Forged Steel") + "</span></li>\n"
            + "<li><span class=\"spec-label\">Set</span><span class=\"spec-value\">4-PW+AW (8 Irons)</span></li>\n"
            + "<li><span class=\"spec-label\">Grip</span><span class=\"spec-value\">Lamkin Crossline 360</span></li>\n"
            + "<li><span class=\"spec-label\">Shaft Steel</span><span class=\"spec-value\">KBS Max 85 MT (S/R)</span></li>\n"
            + "<li><span class=\"spec-label\">Shaft Graphite</span><span class=\"spec-value\">Fujikura Ventus TR Blue (S/R/A)</span></li>\n"
            + "<li><span class=\"spec-label\">Status</span><span class=\"spec-value\">In Stock</span></li>"
        )

    # Loft table
    loft = (
        "<!-- Loft Specs Table -->\n"
        '<div class="loft-table-wrapper">\n'
        '<h3 class="specs-title">Loft and Length Specs</h3>\n'
        '<table class="loft-table">\n'
        "<thead>\n"
        "<tr><th>Club</th><th>Loft</th><th>Lie</th><th>Offset</th><th>Bounce</th><th>Length</th><th>Swing Wt</th></tr>\n"
        "</thead>\n"
        "<tbody>\n"
    )
    for row in loft_rows:
        loft += "<tr><td>" + str(row[0]) + "</td><td>" + str(row[1]) + "</td><td>" + str(row[2]) + "</td><td>" + str(row[3]) + "</td><td>" + str(row[4]) + "</td><td>" + str(row[5]) + "</td><td>" + str(row[6]) + "</td></tr>\n"
    loft += "</tbody>\n</table>\n</div>"

    wa_text = "I%20am%20interested%20in%20the%20" + title.replace(" ", "%20") + "%20(" + sku_code + ")"

    css = """
.product-detail { padding: 60px 0; background: #f8f5ee; min-height: calc(100vh - 400px); }
.product-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; max-width:1400px; margin:0 auto; padding:0 40px; }
.product-detail-image { background: transparent; border-radius: 0; overflow: visible; box-shadow: none; filter: drop-shadow(0 15px 40px rgba(0,0,0,0.15)); position:relative; }
.product-detail-image img { width: 100%; height: auto; display: block; border-radius: 12px; }
.product-detail-badge { display: inline-block; background: #1f5132; color: #c9a961; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
.product-detail-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a1a1a; margin-bottom: 10px; font-weight: 700; }
.product-detail-sku { font-size: 14px; color: #888; margin-bottom: 15px; }
.product-detail-price { font-size: 36px; font-weight: 800; color: #1f5132; margin: 20px 0; }
.product-detail-desc { color: #555; line-height: 1.8; margin-bottom: 30px; font-size: 15px; }
.pimage-main { width:100%; margin-bottom:12px; }
.pimage-main img { width:100% !important; height:auto !important; display:block !important; }
.pimage-thumbs { display:flex !important; gap:8px; margin-top:0; flex-wrap:wrap; }
.pthumb { width:70px !important; height:70px !important; object-fit:cover; border-radius:8px; border:2px solid #e0d8c8; cursor:pointer; transition:all 0.2s; }
.pthumb:hover { border-color:#c9a961; transform:scale(1.05); }
.configurator { background:#f8f5ee; border-radius:16px; padding:20px; margin:20px 0; border:1px solid #e8e0d0; }
.config-title { font-size:16px; font-weight:700; color:#1f5132; margin-bottom:16px; font-family:'Montserrat',sans-serif; }
.config-row { display:flex; gap:12px; margin-bottom:12px; }
.config-field { flex:1; min-width:0; }
.config-field label { display:block; font-size:11px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
.config-field select { width:100%; padding:10px 12px; border:2px solid #d0c8b8; border-radius:10px; background:#fff; color:#333; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; appearance:auto; }
.config-field select:focus { border-color:#1f5132; outline:none; }
.config-summary { background:#fff; border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; color:#1f5132; border:1px solid #e8e0d0; margin-top:12px; }
@media (max-width:500px) { .config-row { flex-direction:column; gap:10px; } }
.product-detail-actions { display: flex; gap: 15px; flex-wrap: wrap; margin: 20px 0; }
.btn-detail-inquire { display: inline-flex; align-items: center; gap: 10px; background: #25D366; color: #fff; padding: 15px 35px; border-radius: 50px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s; text-decoration: none; }
.btn-detail-inquire:hover { background: #1da851; transform: translateY(-2px); }
.btn-detail-cart { display: inline-flex; align-items: center; gap: 10px; background: #1f5132; color: #fff; padding: 15px 35px; border-radius: 50px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s; text-decoration: none; }
.btn-detail-cart:hover { background: #163d26; transform: translateY(-2px); }
.product-specs { margin: 20px 0; padding: 20px; background: #fff; border-radius: 16px; border: 1px solid #e8e0d0; }
.specs-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1f5132; margin-bottom: 16px; }
.specs-title::after { content:""; display:block; width:50px; height:3px; background:#c9a961; margin-top:6px; }
.specs-list { list-style: none; padding: 0; margin: 0; }
.specs-list li { display: flex; padding: 10px 0; border-bottom: 1px solid #f0e8d8; font-size: 14px; }
.specs-list li:last-child { border-bottom: none; }
.spec-label { width: 45%; font-weight: 600; color: #1a1a1a; flex-shrink: 0; }
.spec-value { width: 55%; color: #555; }
.loft-table-wrapper { margin: 0; overflow-x: auto; }
.loft-table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; font-size: 13px; }
.loft-table thead { background: #1f5132; }
.loft-table thead th { color: #c9a961; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.loft-table tbody tr:nth-child(odd) { background: #fff; }
.loft-table tbody tr:nth-child(even) { background: #e8f0ea; }
.loft-table tbody td { padding: 8px 12px; color: #333; border-bottom: 1px solid #d0d8d0; }
.pimage-specs { margin-top:24px; padding:20px; background:#f8f5ee; border-radius:16px; border:1px solid #e8e0d0; }
.pimage-specs .specs-title { font-size:16px; margin-bottom:12px; }
.pimage-specs .loft-table { font-size:12px; }
.pimage-specs .loft-table thead th { padding:7px 8px; font-size:10px; }
.pimage-specs .loft-table tbody td { padding:5px 8px; }
.back-to-shop { text-align: left; margin-bottom: 16px; max-width:1400px; margin-left: auto; margin-right: auto; padding:0 40px; }
.back-to-shop a { color: #1f5132; text-decoration: none; font-weight: 500; font-size: 15px; }
.back-to-shop a:hover { color: #c9a961; }
@media (max-width:768px) { .product-detail-grid { grid-template-columns: 1fr; gap: 30px; } .product-detail-title { font-size: 24px; } .product-detail-price { font-size: 28px; } .back-to-shop { padding:0 20px; } }
.lightbox-overlay { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:9999; justify-content:center; align-items:center; cursor:pointer; }
.lightbox-overlay.active { display:flex; }
.lightbox-overlay img { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:8px; }
.lightbox-close { position:absolute; top:20px; right:30px; color:#fff; font-size:40px; cursor:pointer; font-weight:300; transition:all 0.2s; line-height:1; }
.lightbox-close:hover { color:#c9a961; transform:scale(1.1); }
.lightbox-prev, .lightbox-next { position:absolute; top:50%; transform:translateY(-50%); color:#fff; font-size:50px; cursor:pointer; font-weight:300; padding:20px; transition:all 0.2s; user-select:none; }
.lightbox-prev { left:20px; }
.lightbox-next { right:20px; }
.lightbox-prev:hover, .lightbox-next:hover { color:#c9a961; }
"""

    # Build page
    lines = []
    lines.append("<!DOCTYPE html>")
    lines.append('<html lang="en">')
    lines.append("<head>")
    lines.append('    <meta charset="UTF-8">')
    lines.append('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.append("    <title>" + title + " - KARIBU</title>")
    lines.append('    <meta name="description" content="' + meta_desc + '">')
    lines.append('    <link rel="preconnect" href="https://fonts.googleapis.com">')
    lines.append('    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">')
    lines.append('    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">')
    lines.append('    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">')
    lines.append('    <link rel="stylesheet" href="/styles.css">')
    lines.append("    <style>")
    lines.append(css)
    lines.append("    </style>")
    lines.append("</head>")
    lines.append("<body>")
    lines.append('    <div class="lightbox-overlay" id="lightbox" onclick="closeLightbox(event)">')
    lines.append('        <span class="lightbox-close" onclick="closeLightbox(event)">&times;</span>')
    lines.append('        <span class="lightbox-prev" onclick="prevImage(event)">&#8249;</span>')
    lines.append('        <img id="lightboxImg" src="" alt="Product Image">')
    lines.append('        <span class="lightbox-next" onclick="nextImage(event)">&#8250;</span>')
    lines.append("    </div>")
    lines.append('    <nav class="navbar">')
    lines.append('        <div class="nav-container">')
    lines.append('            <a href="/" class="nav-logo">')
    lines.append('                <img src="/images/karibu-logo-small.png" alt="Karibu" style="height:32px;width:32px;border-radius:50%;">')
    lines.append('                <span class="logo-text">KARIBU</span>')
    lines.append("            </a>")
    lines.append('            <ul class="nav-menu">')
    lines.append('                <li><a href="/" class="nav-link">Home</a></li>')
    lines.append('                <li><a href="/categories/" class="nav-link">Categories</a></li>')
    lines.append('                <li><a href="/#products" class="nav-link">Shop</a></li>')
    lines.append('                <li><a href="/about.html" class="nav-link">About</a></li>')
    lines.append('                <li><a href="/#contact" class="nav-link">Contact</a></li>')
    lines.append("            </ul>")
    lines.append('            <div class="nav-actions">')
    lines.append('                <a href="https://wa.me/8613262570197" class="btn-nav-cta" target="_blank">')
    lines.append('                    <i class="fab fa-whatsapp"></i> Chat')
    lines.append("                </a>")
    lines.append("            </div>")
    lines.append('            <button class="nav-toggle" id="navToggle">')
    lines.append("                <span></span><span></span><span></span>")
    lines.append("            </button>")
    lines.append("        </div>")
    lines.append("    </nav>")
    lines.append("")
    lines.append('    <div class="back-to-shop">')
    lines.append('        <a href="/categories/golf_irons.html"><i class="fas fa-arrow-left"></i> Back to Irons</a>')
    lines.append("    </div>")
    lines.append("")
    lines.append('    <section class="product-detail">')
    lines.append('        <div class="product-detail-grid">')
    lines.append("            <!-- LEFT COLUMN: Images + Loft Specs -->")
    lines.append('            <div class="product-detail-image" data-aos="fade-right">')
    lines.append('                <div class="pimage-main"><img id="pmain" src="/images/products/' + main_img + '" alt="' + title + '"></div>')
    lines.append('                <div class="pimage-thumbs">')
    for t in thumbs:
        lines.append('                    ' + thumb_html)
    lines.append("                </div>")
    lines.append('                <div class="pimage-specs">')
    lines.append(loft)
    lines.append("                </div>")
    lines.append("            </div>")
    lines.append("")
    lines.append("            <!-- RIGHT COLUMN: Product Info -->")
    lines.append('            <div class="product-detail-info">')
    lines.append('                <span class="product-detail-badge">Irons</span>')
    lines.append('                <h1 class="product-detail-title">' + title + '</h1>')
    lines.append('                <div class="product-detail-sku">SKU: ' + sku_code + '</div>')
    lines.append('                <div class="product-detail-price">' + price + '</div>')
    lines.append('                <div class="product-detail-desc">')
    lines.append("                    " + desc)
    lines.append("                </div>")
    lines.append('                <div class="configurator">')
    lines.append('                    <h3 class="config-title">Customize Your Set</h3>')
    lines.append('                    <div class="config-row">')
    lines.append('                        <div class="config-field">')
    lines.append("                            <label>Set Composition</label>")
    lines.append('                            <select id="selSet" onchange="updateConfig()">')
    lines.append('                                <option value="4-PW+AW (8 Irons)" selected>4-PW+AW (8 Irons)</option>')
    lines.append('                                <option value="4-PW (7 Irons)">4-PW (7 Irons)</option>')
    lines.append('                                <option value="5-PW+AW+SW (8 Irons)">5-PW+AW+SW (8 Irons)</option>')
    lines.append('                                <option value="5-PW+SW (7 Irons)">5-PW+SW (7 Irons)</option>')
    lines.append('                                <option value="5-PW+AW (7 Irons)">5-PW+AW (7 Irons)</option>')
    lines.append('                                <option value="5-PW (6 Irons)">5-PW (6 Irons)</option>')
    lines.append("                            </select>")
    lines.append("                        </div>")
    lines.append('                        <div class="config-field">')
    lines.append("                            <label>Shaft Type</label>")
    lines.append('                            <select id="selShaft" onchange="updateConfig()">')
    lines.append('                                <option value="steel" selected>Steel - KBS Max 85 MT</option>')
    lines.append('                                <option value="graphite">Graphite - Fujikura Ventus TR Blue</option>')
    lines.append("                            </select>")
    lines.append("                        </div>")
    lines.append("                    </div>")
    lines.append('                    <div class="config-row">')
    lines.append('                        <div class="config-field">')
    lines.append("                            <label>Flex</label>")
    lines.append('                            <select id="selFlex" onchange="updateConfig()">')
    lines.append('                                <option value="Stiff (S)" selected>Stiff (S)</option>')
    lines.append('                                <option value="Regular (R)">Regular (R)</option>')
    lines.append('                                <option value="Senior (A)">Senior (A)</option>')
    lines.append("                            </select>")
    lines.append("                        </div>")
    lines.append('                        <div class="config-field">')
    lines.append("                            <label>Hand</label>")
    lines.append('                            <select id="selHand" onchange="updateConfig()">')
    lines.append('                                <option value="Right Hand" selected>Right Hand</option>')
    lines.append("                            </select>")
    lines.append("                        </div>")
    lines.append("                    </div>")
    lines.append('                    <div class="config-summary" id="configSummary">')
    lines.append('                        <i class="fas fa-check-circle" style="color:#c9a961;"></i>')
    lines.append("                        <span>4-PW+AW (8 Irons) - KBS Max 85 MT - Stiff (S) - Right Hand</span>")
    lines.append("                    </div>")
    lines.append("                </div>")
    lines.append("")
    lines.append('                <div class="product-detail-actions">')
    lines.append('                    <a href="javascript:void(0)" class="btn-detail-cart" onclick="addToCart('' + title + '', ' + price_num + ', '/images/products/' + main_img + '', document.getElementById('configSummary').querySelector('span').textContent)">')
    lines.append('                        <i class="fas fa-shopping-cart"></i> Add to Cart')
    lines.append("                    </a>")
    lines.append('                    <a href="https://wa.me/8613262570197?text=' + wa_text + '" target="_blank" class="btn-detail-inquire">')
    lines.append('                        <i class="fab fa-whatsapp"></i> Inquire via WhatsApp')
    lines.append("                    </a>")
    lines.append("                </div>")
    lines.append("")
    lines.append('                <div class="product-specs">')
    lines.append('                    <h3 class="specs-title">Product Specifications</h3>')
    lines.append('                    <ul class="specs-list">')
    lines.append("                        " + specs)
    lines.append("                    </ul>")
    lines.append("                </div>")
    lines.append("            </div>")
    lines.append("        </div>")
    lines.append("    </section>")
    lines.append("")
    lines.append('    <footer class="footer">')
    lines.append('        <div class="container">')
    lines.append('            <div class="footer-grid">')
    lines.append('                <div class="footer-brand">')
    lines.append('                    <a href="/" class="footer-logo">')
    lines.append('                        <img src="/images/karibu-logo-small.png" alt="Karibu" style="height:24px;width:24px;border-radius:50%;vertical-align:middle;margin-right:8px;">')
    lines.append('                        <span class="logo-text">KARIBU</span>')
    lines.append("                    </a>")
    lines.append("                    <p>Premium golf equipment and lifestyle products for the discerning golfer in Kenya.</p>")
    lines.append('                    <div class="social-links">')
    lines.append('                        <a href="#"><i class="fab fa-instagram"></i></a>')
    lines.append('                        <a href="#"><i class="fab fa-facebook"></i></a>')
    lines.append('                        <a href="#"><i class="fab fa-twitter"></i></a>')
    lines.append("                    </div>")
    lines.append("                </div>")
    lines.append('                <div class="footer-links">')
    lines.append("                    <h4>Quick Links</h4>")
    lines.append("                    <ul>")
    lines.append('                        <li><a href="/#products">Shop</a></li>')
    lines.append('                        <li><a href="/about.html">About Us</a></li>')
    lines.append('                        <li><a href="/#brands">Brands</a></li>')
    lines.append('                        <li><a href="/#contact">Contact</a></li>')
    lines.append("                    </ul>")
    lines.append("                </div>")
    lines.append('                <div class="footer-links">')
    lines.append("                    <h4>Brands</h4>")
    lines.append("                    <ul>")
    lines.append('                        <li><a href="#">TaylorMade</a></li>')
    lines.append('                        <li><a href="#">Callaway</a></li>')
    lines.append('                        <li><a href="#">J.Lindeberg</a></li>')
    lines.append('                        <li><a href="#">Titleist</a></li>')
    lines.append('                        <li><a href="#">Ping</a></li>')
    lines.append('                        <li><a href="#">FootJoy</a></li>')
    lines.append("                    </ul>")
    lines.append("                </div>")
    lines.append('                <div class="footer-newsletter">')
    lines.append("                    <h4>Contact Us on WhatsApp</h4>")
    lines.append("                    <p>Scan the QR code or tap to chat</p>")
    lines.append('                    <a href="https://wa.me/8613262570197" target="_blank" style="display:inline-block;">')
    lines.append('                        <img src="/images/whatsapp-qr.png" alt="WhatsApp" style="width:100px;height:100px;border-radius:12px;">')
    lines.append("                    </a>")
    lines.append('                    <p style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.7);">+86 13262570197</p>')
    lines.append("                </div>")
    lines.append("            </div>")
    lines.append('            <div class="footer-bottom">')
    lines.append("                <p>&copy; 2026 Karibu. All rights reserved.</p>")
    lines.append("            </div>")
    lines.append("        </div>")
    lines.append("    </footer>")
    lines.append('    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>')
    lines.append('    <script src="/script.js"></script>')
    lines.append("    <script>AOS.init({ duration: 800, once: true });</script>")
    lines.append("    <script>")
    lines.append("        var lightboxImages = [];")
    lines.append("        var currentIndex = 0;")
    lines.append("        var lightbox = document.getElementById('lightbox');")
    lines.append("        var lightboxImg = document.getElementById('lightboxImg');")
    lines.append("")
    lines.append("        function openLightbox(index) {")
    lines.append("            currentIndex = index;")
    lines.append("            lightboxImg.src = lightboxImages[currentIndex];")
    lines.append("            lightbox.classList.add('active');")
    lines.append("            document.body.style.overflow = 'hidden';")
    lines.append("        }")
    lines.append("")
    lines.append("        function closeLightbox(e) {")
    lines.append("            if (e.target === lightbox || e.target.className === 'lightbox-close') {")
    lines.append("                lightbox.classList.remove('active');")
    lines.append("                document.body.style.overflow = '';")
    lines.append("            }")
    lines.append("        }")
    lines.append("")
    lines.append("        function prevImage(e) { e.stopPropagation(); currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length; lightboxImg.src = lightboxImages[currentIndex]; }")
    lines.append("        function nextImage(e) { e.stopPropagation(); currentIndex = (currentIndex + 1) % lightboxImages.length; lightboxImg.src = lightboxImages[currentIndex]; }")
    lines.append("")
    lines.append("        document.addEventListener('DOMContentLoaded', function() {")
    lines.append("            var thumbs = document.querySelectorAll('.pthumb');")
    lines.append("            thumbs.forEach(function(img, i) {")
    lines.append("                lightboxImages.push(img.src);")
    lines.append("                img.style.cursor = 'pointer';")
    lines.append("                img.addEventListener('click', function(e) {")
    lines.append("                    e.stopPropagation();")
    lines.append("                    document.getElementById('pmain').src = this.src;")
    lines.append("                    openLightbox(i);")
    lines.append("                });")
    lines.append("            });")
    lines.append("            var mainImg = document.getElementById('pmain');")
    lines.append("            if (mainImg) {")
    lines.append("                if (lightboxImages.indexOf(mainImg.src) === -1) {")
    lines.append("                    lightboxImages.unshift(mainImg.src);")
    lines.append("                }")
    lines.append("                mainImg.style.cursor = 'pointer';")
    lines.append("                mainImg.addEventListener('click', function(e) {")
    lines.append("                    var idx = lightboxImages.indexOf(this.src);")
    lines.append("                    if (idx === -1) { idx = 0; }")
    lines.append("                    openLightbox(idx);")
    lines.append("                });")
    lines.append("            }")
    lines.append("            var videos = document.querySelectorAll('video[id]');")
    lines.append("            var observer = new IntersectionObserver(function(entries) {")
    lines.append("                entries.forEach(function(entry) {")
    lines.append("                    if (entry.isIntersecting) { entry.target.play().catch(function(){}); }")
    lines.append("                    else { entry.target.pause(); }")
    lines.append("                });")
    lines.append("            }, { threshold: 0.1, rootMargin: '200px' });")
    lines.append("            videos.forEach(function(v) { v.load(); observer.observe(v); });")
    lines.append("        });")
    lines.append("    </script>")
    lines.append("</body>")
    lines.append("</html>")

    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    print("Converting all iron pages to new template...")
    print()
    results = {}
    for sku in SKUS:
        data = extract(sku)
        if not data:
            print("  SKIP " + sku + ": no file")
            continue
        page = build_page(sku, data)
        out = DIST + "/gk-ir-" + sku + ".html"
        with open(out, "w") as f:
            f.write(page)
        sz = len(page)
        lines = page.count("\n")
        broken = len(re.findall(r'(?<!<)/div>', page)) + len(re.findall(r"^\s*<\s*$", page, re.MULTILINE))
        results[sku] = {"lines": lines, "size": sz, "broken": broken}
        print("  OK " + sku + ": " + str(lines) + " lines, " + str(sz) + " bytes (broken: " + str(broken) + ")")

    print()
    print("Total: " + str(len(results)) + " pages updated")
    bad = [k for k, v in results.items() if v["broken"] > 0]
    if bad:
        print("WARNING: Broken tags in: " + ", ".join(bad))
    else:
        print("All pages clean!")
