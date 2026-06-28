
import re, os

DIST = "/mnt/c/Users/mikae/workspace/golf-kenya/dist/products"

products = [
    ("gk-ir001", "GK-IR001", "Titleist T100 Irons", "KES 178,595", "178595",
     "<strong>Titleist T100 Irons</strong> — forged players cavity back with premium feel and tour-proven performance.",
     "Titleist T100 Irons in Kenya — forged players cavity back irons.",
     "Titleist_T100_1.jpg",
     "Players", "0-10", "Low-Medium", "Mid", "High", "Forged 8620 Carbon Steel", "Golf Pride Z-Grip Plus2"),
    
    ("gk-ir002", "GK-IR002", "TaylorMade Qi Max Irons", "KES 95,676", "95676",
     "<strong>TaylorMade Qi Max Irons</strong> — maximum forgiveness iron with advanced Speed Pocket and progressive shaping for high-launch, long-distance performance.",
     "TaylorMade Qi Max Irons in Kenya — maximum forgiveness irons.",
     "TaylorMade_QiMax_1.jpg",
     "Game Improvement", "10-25+", "Very High", "High", "Low", "Forged 450 Steel", "Lamkin Crossline 360"),
    
    ("gk-ir003", "GK-IR003", "Mizuno JPX 923 Forged Irons", "KES 89,297", "89297",
     "<strong>Mizuno JPX 923 Forged Irons</strong> — grain flow forged cavity back irons with exceptional feel, distance, and forgiveness.",
     "Mizuno JPX 923 Forged Irons in Kenya — grain flow forged cavity back.",
     "Mizuno_JPX923_Forged_1.jpg",
     "Players Distance", "5-18", "Medium-High", "Mid-High", "Medium", "Forged Chromoly (4120)", "Lamkin Crossline 360"),
    
    ("gk-ir004", "GK-IR004", "Callaway Ai Smoke HL Irons", "KES 89,297", "89297",
     "<strong>Callaway Ai Smoke HL Irons</strong> — high-launch game improvement irons with AI-designed face for optimized ball speed and forgiveness.",
     "Callaway Ai Smoke HL Irons in Kenya — AI-designed face for optimized ball speed.",
     "Callaway_AiSmokeHL_1.jpg",
     "Game Improvement", "10-25+", "Very High", "High", "Low", "Forged 455 Steel", "Lamkin Crossline 360"),
]

def build(p):
    sku, code, title, price, pn, desc, meta, img, style, hcp, forg, traj, work, face, grip = p
    
    loft_rows = [
        ["4 Iron","19.0","61.5","5.8mm","2","39.125","D1"],
        ["5 Iron","21.5","62.0","5.2mm","3","38.50","D1"],
        ["6 Iron","25.0","62.5","4.7mm","5","37.88","D1"],
        ["7 Iron","28.5","63.0","4.2mm","5","37.25","D1"],
        ["8 Iron","32.5","63.5","3.5mm","6.5","36.75","D1"],
        ["9 Iron","38.0","64.0","3.0mm","7","36.25","D1"],
        ["PW","43.5","64.5","2.6mm","7.5","35.75","D1"],
        ["AW","49.0","64.5","2.0mm","7.5","35.50","D1"],
        ["SW","54.0","64.5","1.5mm","9","35.25","D3"],
        ["LW","59.0","64.5","1.5mm","9","35.00","D3"],
    ]

    css = """
.product-detail { padding: 60px 0; background: #f8f5ee; min-height: calc(100vh - 400px); }
.product-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; max-width:1400px; margin:0 auto; padding:0 40px; }
.product-detail-image { background: transparent; border-radius: 0; overflow: visible; box-shadow: none; filter: drop-shadow(0 15px 40px rgba(0,0,0,0.15)); position:relative; }
.product-detail-image img { width: 100%; height: auto; display: block; border-radius: 12px; }
.product-detail-info { padding-top: 10px; }
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

    wa = "I%20am%20interested%20in%20the%20" + title.replace(" ", "%20") + "%20(" + code + ")"
    
    lines = []
    a = lines.append
    a("<!DOCTYPE html>")
    a('<html lang="en">')
    a("<head>")
    a('    <meta charset="UTF-8">')
    a('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    a(f"    <title>{title} - KARIBU</title>")
    a(f'    <meta name="description" content="{meta}">')
    a('    <link rel="preconnect" href="https://fonts.googleapis.com">')
    a('    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">')
    a('    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">')
    a('    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">')
    a('    <link rel="stylesheet" href="/styles.css">')
    a("    <style>")
    a(css)
    a("    </style>")
    a("</head>")
    a("<body>")
    a('    <div class="lightbox-overlay" id="lightbox" onclick="closeLightbox(event)">')
    a('        <span class="lightbox-close" onclick="closeLightbox(event)">&times;</span>')
    a('        <span class="lightbox-prev" onclick="prevImage(event)">&#8249;</span>')
    a('        <img id="lightboxImg" src="" alt="Product Image">')
    a('        <span class="lightbox-next" onclick="nextImage(event)">&#8250;</span>')
    a("    </div>")
    a('    <nav class="navbar"><div class="nav-container">')
    a('            <a href="/" class="nav-logo"><img src="/images/karibu-logo-small.png" alt="Karibu" style="height:32px;width:32px;border-radius:50%;"><span class="logo-text">KARIBU</span></a>')
    a('            <ul class="nav-menu"><li><a href="/" class="nav-link">Home</a></li><li><a href="/categories/" class="nav-link">Categories</a></li><li><a href="/#products" class="nav-link">Shop</a></li><li><a href="/about.html" class="nav-link">About</a></li><li><a href="/#contact" class="nav-link">Contact</a></li></ul>')
    a('            <div class="nav-actions"><a href="https://wa.me/8613262570197" class="btn-nav-cta" target="_blank"><i class="fab fa-whatsapp"></i> Chat</a></div>')
    a('            <button class="nav-toggle" id="navToggle"><span></span><span></span><span></span></button>')
    a("        </div></nav>")
    a('    <div class="back-to-shop"><a href="/categories/golf_irons.html"><i class="fas fa-arrow-left"></i> Back to Irons</a></div>')
    a('    <section class="product-detail"><div class="product-detail-grid">')
    a('            <div class="product-detail-image" data-aos="fade-right">')
    a(f'                <div class="pimage-main"><img id="pmain" src="/images/products/{img}" alt="{title}"></div>')
    a('                <div class="pimage-thumbs">')
    for lbl in ["Angle","Sole","Face","Back"]:
        a(f'                    <img class="pthumb" src="/images/products/{img}" alt="{lbl}" onclick="document.getElementById(\'pmain\').src=this.src">')
    a("                </div>")
    a('                <div class="pimage-specs">')
    a('                    <h3 class="specs-title">Loft and Length Specs</h3>')
    a('                    <table class="loft-table">')
    a('                        <thead><tr><th>Club</th><th>Loft</th><th>Lie</th><th>Offset</th><th>Bounce</th><th>Length</th><th>Swing Wt</th></tr></thead>')
    a("                        <tbody>")
    for r in loft_rows:
        a(f"                            <tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{r[6]}</td></tr>")
    a("                        </tbody>")
    a("                    </table>")
    a("                </div>")
    a("            </div>")
    a('            <div class="product-detail-info">')
    a('                <span class="product-detail-badge">Irons</span>')
    a(f'                <h1 class="product-detail-title">{title}</h1>')
    a(f'                <div class="product-detail-sku">SKU: {code}</div>')
    a(f'                <div class="product-detail-price">{price}</div>')
    a('                <div class="product-detail-desc">')
    a(f'                    {desc}')
    a("                </div>")
    a('                <div class="configurator"><h3 class="config-title">Customize Your Set</h3>')
    a('                    <div class="config-row">')
    a('                        <div class="config-field"><label>Set Composition</label><select id="selSet" onchange="updateConfig()">')
    a('                                <option value="4-PW+AW (8 Irons)" selected>4-PW+AW (8 Irons)</option><option value="4-PW (7 Irons)">4-PW (7 Irons)</option><option value="5-PW+AW+SW (8 Irons)">5-PW+AW+SW (8 Irons)</option><option value="5-PW+SW (7 Irons)">5-PW+SW (7 Irons)</option><option value="5-PW+AW (7 Irons)">5-PW+AW (7 Irons)</option><option value="5-PW (6 Irons)">5-PW (6 Irons)</option>')
    a("                            </select></div>")
    a('                        <div class="config-field"><label>Shaft Type</label><select id="selShaft" onchange="updateConfig()">')
    a('                                <option value="steel" selected>Steel - KBS Max 85 MT</option><option value="graphite">Graphite - Fujikura Ventus TR Blue</option>')
    a("                            </select></div>")
    a("                    </div>")
    a('                    <div class="config-row">')
    a('                        <div class="config-field"><label>Flex</label><select id="selFlex" onchange="updateConfig()">')
    a('                                <option value="Stiff (S)" selected>Stiff (S)</option><option value="Regular (R)">Regular (R)</option><option value="Senior (A)">Senior (A)</option>')
    a("                            </select></div>")
    a('                        <div class="config-field"><label>Hand</label><select id="selHand" onchange="updateConfig()">')
    a('                                <option value="Right Hand" selected>Right Hand</option>')
    a("                            </select></div>")
    a("                    </div>")
    a('                    <div class="config-summary" id="configSummary"><i class="fas fa-check-circle" style="color:#c9a961;"></i>')
    a("                        <span>4-PW+AW (8 Irons) - KBS Max 85 MT - Stiff (S) - Right Hand</span></div>")
    a("                </div>")
    a('                <div class="product-detail-actions">')
    a(f'                    <a href="javascript:void(0)" class="btn-detail-cart" onclick="addToCart(\'{title}\', {pn}, \'/images/products/{img}\', document.getElementById(\'configSummary\').querySelector(\'span\').textContent)"><i class="fas fa-shopping-cart"></i> Add to Cart</a>')
    a(f'                    <a href="https://wa.me/8613262570197?text={wa}" target="_blank" class="btn-detail-inquire"><i class="fab fa-whatsapp"></i> Inquire via WhatsApp</a>')
    a("                </div>")
    a('                <div class="product-specs"><h3 class="specs-title">Product Specifications</h3><ul class="specs-list">')
    a(f'                        <li><span class="spec-label">Model</span><span class="spec-value">{title}</span></li>')
    a(f'                        <li><span class="spec-label">Style</span><span class="spec-value">{style} - HCP {hcp}</span></li>')
    a(f'                        <li><span class="spec-label">Forgiveness</span><span class="spec-value">{forg}</span></li>')
    a(f'                        <li><span class="spec-label">Trajectory</span><span class="spec-value">{traj}</span></li>')
    a(f'                        <li><span class="spec-label">Workability</span><span class="spec-value">{work}</span></li>')
    a(f'                        <li><span class="spec-label">Face Material</span><span class="spec-value">{face}</span></li>')
    a('                        <li><span class="spec-label">Set</span><span class="spec-value">4-PW+AW (8 Irons)</span></li>')
    a(f'                        <li><span class="spec-label">Grip</span><span class="spec-value">{grip}</span></li>')
    a('                        <li><span class="spec-label">Shaft Steel</span><span class="spec-value">KBS Max 85 MT (S/R)</span></li>')
    a('                        <li><span class="spec-label">Shaft Graphite</span><span class="spec-value">Fujikura Ventus TR Blue (S/R/A)</span></li>')
    a('                        <li><span class="spec-label">Status</span><span class="spec-value">In Stock</span></li>')
    a("                    </ul></div>")
    a("            </div>")
    a("        </div></section>")
    a('    <footer class="footer"><div class="container"><div class="footer-grid">')
    a('            <div class="footer-brand"><a href="/" class="footer-logo"><img src="/images/karibu-logo-small.png" alt="Karibu" style="height:24px;width:24px;border-radius:50%;vertical-align:middle;margin-right:8px;"><span class="logo-text">KARIBU</span></a><p>Premium golf equipment and lifestyle products for the discerning golfer in Kenya.</p>')
    a('                <div class="social-links"><a href="#"><i class="fab fa-instagram"></i></a><a href="#"><i class="fab fa-facebook"></i></a><a href="#"><i class="fab fa-twitter"></i></a></div></div>')
    a('            <div class="footer-links"><h4>Quick Links</h4><ul><li><a href="/#products">Shop</a></li><li><a href="/about.html">About Us</a></li><li><a href="/#brands">Brands</a></li><li><a href="/#contact">Contact</a></li></ul></div>')
    a('            <div class="footer-links"><h4>Brands</h4><ul><li><a href="#">TaylorMade</a></li><li><a href="#">Callaway</a></li><li><a href="#">J.Lindeberg</a></li><li><a href="#">Titleist</a></li><li><a href="#">Ping</a></li><li><a href="#">FootJoy</a></li></ul></div>')
    a('            <div class="footer-newsletter"><h4>Contact Us on WhatsApp</h4><p>Scan the QR code or tap to chat</p>')
    a('                <a href="https://wa.me/8613262570197" target="_blank" style="display:inline-block;"><img src="/images/whatsapp-qr.png" alt="WhatsApp" style="width:100px;height:100px;border-radius:12px;"></a>')
    a('                <p style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.7);">+86 13262570197</p></div>')
    a("        </div>")
    a('        <div class="footer-bottom"><p>&copy; 2026 Karibu. All rights reserved.</p></div></div></footer>')
    a('    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>')
    a('    <script src="/script.js"></script>')
    a("    <script>AOS.init({ duration: 800, once: true });</script>")
    a("    <script>")
    a("        var lightboxImages = [];")
    a("        var currentIndex = 0;")
    a("        var lightbox = document.getElementById('lightbox');")
    a("        var lightboxImg = document.getElementById('lightboxImg');")
    a("        function openLightbox(index) { currentIndex = index; lightboxImg.src = lightboxImages[currentIndex]; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; }")
    a("        function closeLightbox(e) { if (e.target === lightbox || e.target.className === 'lightbox-close') { lightbox.classList.remove('active'); document.body.style.overflow = ''; } }")
    a("        function prevImage(e) { e.stopPropagation(); currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length; lightboxImg.src = lightboxImages[currentIndex]; }")
    a("        function nextImage(e) { e.stopPropagation(); currentIndex = (currentIndex + 1) % lightboxImages.length; lightboxImg.src = lightboxImages[currentIndex]; }")
    a("        document.addEventListener('DOMContentLoaded', function() {")
    a("            var thumbs = document.querySelectorAll('.pthumb');")
    a("            thumbs.forEach(function(img, i) { lightboxImages.push(img.src); img.style.cursor = 'pointer'; img.addEventListener('click', function(e) { e.stopPropagation(); document.getElementById('pmain').src = this.src; openLightbox(i); }); });")
    a("            var mainImg = document.getElementById('pmain');")
    a("            if (mainImg) { if (lightboxImages.indexOf(mainImg.src) === -1) { lightboxImages.unshift(mainImg.src); } mainImg.style.cursor = 'pointer'; mainImg.addEventListener('click', function(e) { var idx = lightboxImages.indexOf(this.src); if (idx === -1) { idx = 0; } openLightbox(idx); }); }")
    a("        });")
    a("    </script>")
    a("</body>")
    a("</html>")
    return "\n".join(lines)


print("Building new iron pages...")
for p in products:
    page = build(p)
    path = DIST + "/" + p[0] + ".html"
    with open(path, "w") as f:
        f.write(page)
    bt = len(re.findall(r"(?<!<)/div>", page))
    print(f"  {p[0]}.html: {len(page)} bytes, broken={bt}")
print("Done!")
