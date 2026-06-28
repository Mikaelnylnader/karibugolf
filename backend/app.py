import os
import csv
import io
import re
import json
import sqlite3
import urllib.request
import urllib.parse
import subprocess
import threading
import sys
from datetime import datetime, timedelta
from pathlib import Path

from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, jsonify, send_from_directory, session, abort
)

try:
    from sheet_sync import sync_product_to_sheet, sync_delete_from_sheet, get_sheet_status, is_configured as sheet_configured
    SHEET_SYNC_AVAILABLE = True
except ImportError:
    SHEET_SYNC_AVAILABLE = False

# ── Config ──
BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR.parent / "dist"
PROJECT_DIR = BASE_DIR.parent
DATABASE = BASE_DIR / "golf_kenya.db"

UPLOAD_FOLDER = DIST_DIR / "images" / "products"
CATEGORY_IMG_FOLDER = DIST_DIR / "images" / "categories"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

CSV_COLUMNS = [
    "SKU", "Name", "Category", "Price Kenya (Ksh)", "Cost China (CNY)",
    "Cost China (Ksh)", "Sizes", "Colors", "Description", "Image", "Status", "Stock"
]

CATEGORY_MAP = {
    "accessories": "accessories", "apparel": "mens_jackets", "bags": "bags",
    "balls": "balls", "gloves": "gloves", "grips": "grips",
    "hats & caps": "hats_and_caps", "irons": "golf_irons", "putters": "putters",
    "range finders": "range_finders", "shoes": "mens_shoes", "wedges": "wedges",
}

# ── Category Attribute Templates ──
CATEGORY_ATTR_TEMPLATES = {
    "club": {"attributes": [
        {"key": "loft", "label": "Loft", "type": "text", "placeholder": "e.g., 9°, 10.5°, 12°"},
        {"key": "flex", "label": "Shaft Flex", "type": "select", "options": "Regular,Stiff,X-Stiff,Ladies,Senior"},
        {"key": "hand", "label": "Hand", "type": "select", "options": "Right,Left"},
    ]},
    "apparel": {"attributes": [
        {"key": "sizes", "label": "Sizes", "type": "text", "placeholder": "XS,S,M,L,XL,XXL"},
        {"key": "colors", "label": "Colors / Patterns", "type": "text", "placeholder": "White, Black, Navy"},
    ]},
    "shoes": {"attributes": [
        {"key": "sizes", "label": "Shoe Sizes (EU)", "type": "text", "placeholder": "39,40,41,42,43,44,45,46"},
        {"key": "colors", "label": "Colors", "type": "text", "placeholder": "White, Black"},
        {"key": "width", "label": "Width", "type": "select", "options": "Standard,Wide"},
    ]},
    "glove": {"attributes": [
        {"key": "sizes", "label": "Glove Sizes", "type": "text", "placeholder": "S,M,L,XL"},
        {"key": "hand", "label": "Hand", "type": "select", "options": "Right,Left"},
    ]},
    "ball": {"attributes": [
        {"key": "compression", "label": "Compression", "type": "text", "placeholder": "70, 80, 90, 100"},
        {"key": "qty", "label": "Pack Qty", "type": "select", "options": "Dozen (12),Sleeve (3),Practice (24)"},
    ]},
    "bag": {"attributes": [
        {"key": "colors", "label": "Colors", "type": "text", "placeholder": "Black, White, Navy"},
        {"key": "bag_type", "label": "Bag Type", "type": "select", "options": "Stand Bag,Cart Bag,Staff Bag,Sunday Bag,Pencil Bag"},
    ]},
    "accessory": {"attributes": [
        {"key": "colors", "label": "Colors", "type": "text", "placeholder": "Black, White"},
    ]},
}

CATEGORY_TYPES = {
    "drivers": "club", "golf_irons": "club", "putters": "club",
    "woods": "club", "wedges": "club", "hybrids": "club",
    "mens_polos": "apparel", "mens_pants": "apparel", "mens_jackets": "apparel",
    "mens_shorts": "apparel", "womens_polos": "apparel", "womens_skirts": "apparel",
    "womens_pants": "apparel", "womens_dresses": "apparel", "womens_jackets": "apparel",
    "womens_tops": "apparel",
    "mens_shoes": "shoes", "womens_shoes": "shoes",
    "bags": "bag", "gloves": "glove",
    "hats_and_caps": "accessory", "accessories": "accessory",
    "balls": "ball", "grips": "accessory", "range_finders": "accessory",
}

CATEGORY_SKU_PREFIXES = {
    "drivers": "dr", "golf_irons": "ir", "putters": "pt",
    "woods": "wd", "wedges": "wg", "hybrids": "hy",
    "mens_polos": "mp", "mens_pants": "mpt", "mens_jackets": "mj",
    "mens_shorts": "msh", "womens_polos": "wp", "womens_skirts": "ws",
    "womens_pants": "wpt", "womens_dresses": "wd", "womens_jackets": "wj",
    "womens_tops": "wt",
    "mens_shoes": "mso", "womens_shoes": "wso",
    "bags": "bg", "gloves": "gv",
    "hats_and_caps": "hc", "accessories": "ac",
    "balls": "bl", "grips": "gr", "range_finders": "rf",
}

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET", "gk-admin-secret-2024")
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["CATEGORY_IMG_FOLDER"] = str(CATEGORY_IMG_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.config["TEMPLATES_AUTO_RELOAD"] = True

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CATEGORY_IMG_FOLDER, exist_ok=True)

# ── Auto Deploy State ──
_auto_deploy_enabled = False
_last_deploy_result = ""
_last_deploy_time = None

def set_auto_deploy(enabled: bool):
    global _auto_deploy_enabled
    _auto_deploy_enabled = enabled

def is_auto_deploy_enabled() -> bool:
    return _auto_deploy_enabled

# ── Database ──

def get_db():
    conn = sqlite3.connect(str(DATABASE))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            label TEXT NOT NULL,
            description TEXT DEFAULT '',
            icon TEXT DEFAULT 'fa-golf-ball-tee',
            display_order INTEGER DEFAULT 0,
            image TEXT DEFAULT '',
            image_filename TEXT DEFAULT '',
            sku_prefix TEXT DEFAULT '',
            category_type TEXT DEFAULT 'accessory',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category_slug TEXT NOT NULL,
            description TEXT DEFAULT '',
            price_kes INTEGER DEFAULT 0,
            cost_cny TEXT DEFAULT '',
            cost_kes TEXT DEFAULT '',
            sizes TEXT DEFAULT '',
            colors TEXT DEFAULT '',
            extra_attrs TEXT DEFAULT '{}',
            status TEXT DEFAULT 'In Stock',
            stock TEXT DEFAULT '',
            image TEXT DEFAULT '',
            image_filename TEXT DEFAULT '',
            featured INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_slug) REFERENCES categories(slug)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT DEFAULT '',
            customer_email TEXT DEFAULT '',
            items TEXT DEFAULT '[]',
            total_kes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'new',
            source TEXT DEFAULT 'admin',
            notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    """)
    # Add columns if missing (for existing DB migration)
    for col_sql in [
        "ALTER TABLE categories ADD COLUMN image TEXT DEFAULT ''",
        "ALTER TABLE categories ADD COLUMN image_filename TEXT DEFAULT ''",
        "ALTER TABLE categories ADD COLUMN sku_prefix TEXT DEFAULT ''",
        "ALTER TABLE categories ADD COLUMN category_type TEXT DEFAULT 'accessory'",
        "ALTER TABLE products ADD COLUMN extra_attrs TEXT DEFAULT '{}'",
        "ALTER TABLE products ADD COLUMN gallery TEXT DEFAULT '[]'",
    ]:
        try:
            conn.execute(col_sql)
        except sqlite3.OperationalError:
            pass  # column already exists
    conn.commit()
    conn.close()

def seed_categories():
    defaults = {
        "drivers": ("Drivers", "Maximum distance off the tee", 1),
        "golf_irons": ("Golf Irons", "Precision and control for approach shots", 2),
        "putters": ("Putters", "Roll it true on the greens", 3),
        "woods": ("Woods", "Power and versatility from the fairway", 4),
        "wedges": ("Wedges", "Scoring shots around the green", 5),
        "hybrids": ("Hybrids", "The best of both worlds", 6),
        "mens_polos": ("Men's Polos", "Style and performance on the course", 10),
        "mens_pants": ("Men's Pants", "Comfort and mobility for your swing", 11),
        "mens_jackets": ("Men's Jackets", "Weather-ready outerwear", 12),
        "mens_shorts": ("Men's Shorts", "Stay cool under pressure", 13),
        "womens_polos": ("Women's Polos", "Performance fit for women", 14),
        "womens_skirts": ("Women's Skirts", "Move freely on the course", 15),
        "womens_pants": ("Women's Pants", "Sleek and comfortable", 16),
        "womens_dresses": ("Women's Dresses", "Effortless elegance", 17),
        "womens_jackets": ("Women's Jackets", "Stay warm in style", 18),
        "womens_tops": ("Women's Tops", "Versatile layering pieces", 19),
        "mens_shoes": ("Men's Shoes", "Walk the course in comfort", 20),
        "womens_shoes": ("Women's Shoes", "Style meets performance", 21),
        "bags": ("Bags", "Carry your gear in style", 22),
        "gloves": ("Gloves", "Grip it and rip it", 23),
        "hats_and_caps": ("Hats & Caps", "Top off your look", 24),
        "accessories": ("Accessories", "The finishing touches", 25),
        "balls": ("Balls", "Premium performance golf balls", 26),
        "grips": ("Grips", "Feel the difference", 27),
        "range_finders": ("Range Finders", "Know your distance", 28),
    }
    conn = get_db()
    for slug, (label, desc, order) in defaults.items():
        ctype = CATEGORY_TYPES.get(slug, "accessory")
        prefix = CATEGORY_SKU_PREFIXES.get(slug, "xx")
        conn.execute(
            """INSERT OR IGNORE INTO categories
               (slug, label, description, display_order, sku_prefix, category_type)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (slug, label, desc, order, prefix, ctype)
        )
        # Also update existing rows that might not have sku_prefix/type set
        conn.execute(
            "UPDATE categories SET sku_prefix=?, category_type=? WHERE slug=? AND (sku_prefix IS NULL OR sku_prefix='')",
            (prefix, ctype, slug)
        )
    conn.commit()
    conn.close()

# ── Helpers ──

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def safe_filename(sku, suffix=""):
    s = re.sub(r"[^a-zA-Z0-9_-]", "", sku.replace(" ", "_"))
    return s + suffix + ".jpg"

def parse_kes(s):
    clean = re.sub(r"[^\d]", "", str(s))
    return int(clean) if clean else 0

def calc_margin(price_kes, cost_cny_str, cost_kes_str, exchange_rate=18.0):
    """Calculate profit and margin percentage.
    Returns dict with profit_kes, margin_pct, cost_kes_total.
    """
    cost_cny = parse_kes(cost_cny_str)
    cost_kes_input = parse_kes(cost_kes_str)
    cost_kes_from_cny = int(cost_cny * exchange_rate)
    total_cost = cost_kes_from_cny + cost_kes_input
    if price_kes and total_cost:
        profit = price_kes - total_cost
        margin = round((profit / price_kes) * 100, 1)
    else:
        profit, margin = 0, 0
    return {
        "profit_kes": profit,
        "margin_pct": margin,
        "cost_kes_from_cny": cost_kes_from_cny,
        "cost_kes_total": total_cost,
    }

def generate_sku(category_slug):
    """Auto-generate a SKU like gk-dr001, gk-pt036, etc."""
    prefix = CATEGORY_SKU_PREFIXES.get(category_slug, "xx")
    conn = get_db()
    counter_key = f"sku_counter_{prefix}"
    row = conn.execute("SELECT value FROM settings WHERE key=?", (counter_key,)).fetchone()
    if row:
        next_num = int(row["value"]) + 1
    else:
        # Find the highest existing number for this prefix
        pattern = f"gk-{prefix}%"
        max_row = conn.execute(
            "SELECT sku FROM products WHERE sku LIKE ? AND sku GLOB 'gk-???[0-9]*' ORDER BY sku DESC LIMIT 1",
            (pattern,)
        ).fetchone()
        if max_row:
            # Extract number part: gk-dr001 -> 001
            m = re.search(rf"gk-{prefix}(\d+)", max_row["sku"], re.IGNORECASE)
            next_num = int(m.group(1)) + 1 if m else 1
        else:
            next_num = 1

    conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                 (counter_key, str(next_num)))
    conn.commit()
    conn.close()
    return f"gk-{prefix}{next_num:03d}"

def get_category_attrs(category_slug):
    """Get attribute template for a category."""
    ctype = CATEGORY_TYPES.get(category_slug, "accessory")
    return CATEGORY_ATTR_TEMPLATES.get(ctype, CATEGORY_ATTR_TEMPLATES["accessory"])

def import_from_google_sheet():
    SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY/export?format=csv"
    try:
        req = urllib.request.Request(SHEET_CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(raw))
        conn = get_db()
        count = 0
        for row in reader:
            name = (row.get("Name") or "").strip()
            if not name:
                continue
            cat = (row.get("Category") or "").strip().lower()
            conn.execute(
                """INSERT OR REPLACE INTO products
                   (sku, name, category_slug, description, price_kes, cost_cny, cost_kes,
                    sizes, colors, status, stock, image)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    (row.get("SKU") or "").strip(), name,
                    CATEGORY_MAP.get(cat, "accessories"),
                    (row.get("Description") or "").strip(),
                    parse_kes(row.get("Price Kenya (Ksh)")),
                    (row.get("Cost China (CNY)") or "").strip(),
                    (row.get("Cost China (Ksh)") or "").strip(),
                    (row.get("Sizes") or "").strip(),
                    (row.get("Colors") or "").strip(),
                    (row.get("Status") or "In Stock").strip(),
                    (row.get("Stock") or "").strip(),
                    (row.get("Image") or "").strip(),
                )
            )
            count += 1
        conn.commit()
        conn.close()
        return count
    except Exception as e:
        print(f"Sheet import error: {e}")
        return 0

def generate_site_sync():
    try:
        import importlib.util as _util
        import sys as _sys
        root = str(PROJECT_DIR)
        if root not in _sys.path:
            _sys.path.insert(0, root)
        spec = _util.spec_from_file_location("gk_gen", str(PROJECT_DIR / "generate.py"))
        mod = _util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        result = mod.main(use_db=True)
        return True, result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return False, str(e)

def deploy_to_netlify():
    try:
        os.chdir(str(DIST_DIR))
        result = subprocess.run(
            ["npx", "netlify", "deploy", "--dir", ".", "--site", "925395d9",
             "--prod", "--message", f"Admin auto-deploy {datetime.now().strftime('%Y-%m-%d %H:%M')}"],
            capture_output=True, text=True, timeout=180
        )
        os.chdir(str(PROJECT_DIR))
        output = (result.stdout + result.stderr)[:2000]
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        os.chdir(str(PROJECT_DIR))
        return False, "Deploy timed out"
    except Exception as e:
        os.chdir(str(PROJECT_DIR))
        return False, str(e)

def auto_publish():
    if not is_auto_deploy_enabled():
        return
    ok, msg = generate_site_sync()
    if ok:
        deploy_ok, deploy_msg = deploy_to_netlify()
        global _last_deploy_result, _last_deploy_time
        _last_deploy_result = deploy_msg[:500]
        _last_deploy_time = datetime.now()
    else:
        print(f"❌ Auto-generation failed: {msg}")

def trigger_auto_publish():
    """Fire auto-publish in background thread (non-blocking)."""
    t = threading.Thread(target=auto_publish, daemon=True)
    t.start()


def sync_to_sheet(product_sku=None, product_dict=None):
    """Sync a product to Google Sheet (non-blocking background thread)."""
    if not SHEET_SYNC_AVAILABLE or not sheet_configured():
        return
    if product_dict:
        t = threading.Thread(target=sync_product_to_sheet, args=(product_dict,), daemon=True)
        t.start()
    elif product_sku:
        # Fetch product from DB and sync
        def _sync():
            conn = get_db()
            p = conn.execute("SELECT * FROM products WHERE sku = ?", (product_sku,)).fetchone()
            conn.close()
            if p:
                sync_product_to_sheet(dict(p))
        t = threading.Thread(target=_sync, daemon=True)
        t.start()


def delete_from_sheet(sku):
    """Delete a product from Google Sheet (background)."""
    if not SHEET_SYNC_AVAILABLE or not sheet_configured():
        return
    t = threading.Thread(target=sync_delete_from_sheet, args=(sku,), daemon=True)
    t.start()

# ── Dashboard ──

@app.route("/")
def dashboard():
    conn = get_db()
    product_count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    in_stock = conn.execute("SELECT COUNT(*) FROM products WHERE status='In Stock'").fetchone()[0]
    category_count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
    last_updated = conn.execute("SELECT MAX(updated_at) FROM products").fetchone()[0]
    categories = conn.execute("""
        SELECT c.label, c.slug, c.image, COUNT(p.id) as count
        FROM categories c LEFT JOIN products p ON c.slug = p.category_slug
        GROUP BY c.id ORDER BY count DESC LIMIT 10
    """).fetchall()
    recent = conn.execute("""
        SELECT sku, name, price_kes, image, updated_at
        FROM products ORDER BY updated_at DESC LIMIT 5
    """).fetchall()
    total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    new_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE status='new'").fetchone()[0]
    conn.close()
    sheet_status = get_sheet_status() if SHEET_SYNC_AVAILABLE else {"configured": False, "message": "Sheet sync not available"}
    return render_template("dashboard.html",
        product_count=product_count, in_stock=in_stock, category_count=category_count,
        last_updated=last_updated, categories=categories, recent=recent,
        total_orders=total_orders, new_orders=new_orders,
        auto_deploy=is_auto_deploy_enabled(),
        last_deploy_time=_last_deploy_time, last_deploy_result=_last_deploy_result,
        sheet_status=sheet_status
    )

# ── Products ──

@app.route("/products")
def product_list():
    conn = get_db()
    category = request.args.get("category", "")
    search = request.args.get("search", "")
    query = """SELECT p.*, c.label as category_label
               FROM products p JOIN categories c ON p.category_slug = c.slug WHERE 1=1"""
    params = []
    if category:
        query += " AND p.category_slug = ?"
        params.append(category)
    if search:
        query += " AND (p.name LIKE ? OR p.sku LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    products = conn.execute(query + " ORDER BY p.updated_at DESC", params).fetchall()
    categories = conn.execute("SELECT * FROM categories ORDER BY display_order").fetchall()
    conn.close()
    return render_template("products.html", products=products, categories=categories,
                          selected_category=category, search=search)

@app.route("/products/new", methods=["GET", "POST"])
def product_new():
    conn = get_db()
    categories = conn.execute("SELECT * FROM categories ORDER BY display_order").fetchall()
    if request.method == "POST":
        sku = request.form.get("sku", "").strip()
        name = request.form.get("name", "").strip()
        if not name:
            flash("Product name is required!", "danger")
            return render_template("product_form.html", categories=categories, product=None, attrs=None)
        category_slug = request.form.get("category_slug", "accessories")

        # Auto-generate SKU if empty
        if not sku:
            sku = generate_sku(category_slug)

        # Collect extra attributes based on category type
        attr_tmpl = get_category_attrs(category_slug)
        extra_attrs = {}
        for attr in attr_tmpl["attributes"]:
            val = request.form.get(f"attr_{attr['key']}", "").strip()
            if val:
                extra_attrs[attr["key"]] = val

        # Map category-specific fields to general fields for backward compat
        sizes = extra_attrs.get("sizes", request.form.get("sizes", "").strip())
        colors = extra_attrs.get("colors", request.form.get("colors", "").strip())

        try:
            conn.execute(
                """INSERT INTO products (sku, name, category_slug, description, price_kes,
                   sizes, colors, extra_attrs, status, stock, cost_cny, cost_kes, featured)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (sku, name, category_slug,
                 request.form.get("description", "").strip(),
                 parse_kes(request.form.get("price_kes")),
                 sizes, colors, json.dumps(extra_attrs),
                 request.form.get("status", "In Stock"),
                 request.form.get("stock", "").strip(),
                 request.form.get("cost_cny", "").strip(),
                 request.form.get("cost_kes", "").strip(),
                 1 if request.form.get("featured") else 0)
            )
            conn.commit()
            conn.close()
            flash(f"✅ '{name}' created! SKU: {sku}", "success")
            trigger_auto_publish()
            sync_to_sheet(product_sku=sku)
            return redirect(url_for("product_list"))
        except sqlite3.IntegrityError:
            flash(f"SKU '{sku}' already exists!", "danger")

    conn.close()
    return render_template("product_form.html", categories=categories, product=None,
                          attrs=None, category_attrs=None, CATEGORY_ATTR_TEMPLATES=CATEGORY_ATTR_TEMPLATES)

@app.route("/products/<sku>/edit", methods=["GET", "POST"])
def product_edit(sku):
    conn = get_db()
    product = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
    if not product:
        flash("Product not found!", "danger")
        return redirect(url_for("product_list"))
    categories = conn.execute("SELECT * FROM categories ORDER BY display_order").fetchall()

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        if not name:
            flash("Name is required!", "danger")
            return render_template("product_form.html", categories=categories, product=product)
        category_slug = request.form.get("category_slug", product["category_slug"])

        # Collect extra attributes
        attr_tmpl = get_category_attrs(category_slug)
        extra_attrs = {}
        for attr in attr_tmpl["attributes"]:
            val = request.form.get(f"attr_{attr['key']}", "").strip()
            if val:
                extra_attrs[attr["key"]] = val

        sizes = extra_attrs.get("sizes", request.form.get("sizes", "").strip())
        colors = extra_attrs.get("colors", request.form.get("colors", "").strip())

        conn.execute(
            """UPDATE products SET name=?, category_slug=?, description=?, price_kes=?,
               sizes=?, colors=?, extra_attrs=?, status=?, stock=?, cost_cny=?, cost_kes=?, featured=?,
               updated_at=CURRENT_TIMESTAMP WHERE sku=?""",
            (name, category_slug,
             request.form.get("description", "").strip(), parse_kes(request.form.get("price_kes")),
             sizes, colors, json.dumps(extra_attrs),
             request.form.get("status", "In Stock"), request.form.get("stock", "").strip(),
             request.form.get("cost_cny", "").strip(), request.form.get("cost_kes", "").strip(),
             1 if request.form.get("featured") else 0, sku)
        )
        conn.commit()
        conn.close()
        flash(f"✅ '{name}' saved!", "success")
        trigger_auto_publish()
        sync_to_sheet(product_sku=sku)
        return redirect(url_for("product_list"))

    conn.close()
    # Parse extra_attrs JSON
    product_dict = dict(product)
    try:
        product_dict["extra_attrs_parsed"] = json.loads(product_dict.get("extra_attrs", "{}"))
    except (json.JSONDecodeError, TypeError):
        product_dict["extra_attrs_parsed"] = {}
    # Parse gallery
    try:
        product_dict["gallery_list"] = json.loads(product_dict.get("gallery", "[]"))
    except (json.JSONDecodeError, TypeError):
        product_dict["gallery_list"] = []
    # Calculate margin
    product_dict["margin"] = calc_margin(
        product_dict.get("price_kes", 0),
        product_dict.get("cost_cny", ""),
        product_dict.get("cost_kes", ""),
    )
    return render_template("product_form.html", categories=categories, product=product_dict,
                          CATEGORY_ATTR_TEMPLATES=CATEGORY_ATTR_TEMPLATES)

@app.route("/products/<sku>/delete", methods=["POST"])
def product_delete(sku):
    conn = get_db()
    p = conn.execute("SELECT name FROM products WHERE sku = ?", (sku,)).fetchone()
    if p:
        conn.execute("DELETE FROM products WHERE sku = ?", (sku,))
        conn.commit()
        flash(f"🗑️ '{p['name']}' deleted", "warning")
        conn.close()
        trigger_auto_publish()
        delete_from_sheet(sku)
    else:
        conn.close()
    return redirect(url_for("product_list"))

@app.route("/products/<sku>/image", methods=["POST"])
def product_upload_image(sku):
    if "image" not in request.files:
        flash("No file selected!", "danger")
        return redirect(url_for("product_edit", sku=sku))
    file = request.files["image"]
    if file.filename == "":
        flash("No file selected!", "danger")
        return redirect(url_for("product_edit", sku=sku))
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = safe_filename(sku) + "." + ext
        file.save(str(UPLOAD_FOLDER / filename))
        conn = get_db()
        conn.execute("UPDATE products SET image_filename=?, image=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
                     (filename, f"/images/products/{filename}", sku))
        conn.commit()
        conn.close()
        flash(f"📸 Image uploaded!", "success")
        trigger_auto_publish()
    else:
        flash("Invalid file type!", "danger")
    return redirect(url_for("product_edit", sku=sku))

@app.route("/products/<sku>/delete-image", methods=["POST"])
def product_delete_image(sku):
    conn = get_db()
    p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
    if p and p["image_filename"]:
        img = UPLOAD_FOLDER / p["image_filename"]
        if img.exists():
            img.unlink()
        conn.execute("UPDATE products SET image_filename='', image='', updated_at=CURRENT_TIMESTAMP WHERE sku=?", (sku,))
        conn.commit()
    conn.close()
    return redirect(url_for("product_edit", sku=sku))

# ── Gallery (multi-image) ──

@app.route("/products/<sku>/gallery-upload", methods=["POST"])
def product_gallery_upload(sku):
    if "image" not in request.files:
        flash("No file selected!", "danger")
        return redirect(url_for("product_edit", sku=sku))
    file = request.files["image"]
    if file.filename == "":
        flash("No file selected!", "danger")
        return redirect(url_for("product_edit", sku=sku))
    if file and allowed_file(file.filename):
        conn = get_db()
        p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
        if not p:
            conn.close()
            flash("Product not found!", "danger")
            return redirect(url_for("product_list"))
        # Determine next gallery index
        gallery = json.loads(p["gallery"] or "[]")
        next_idx = len(gallery) + 2  # _2, _3, _4 etc (main image is _1 / no suffix)
        ext = file.filename.rsplit(".", 1)[1].lower()
        fname = safe_filename(sku, f"_{next_idx}") + "." + ext
        file.save(str(UPLOAD_FOLDER / fname))
        gallery.append(fname)
        conn.execute("UPDATE products SET gallery=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
                     (json.dumps(gallery), sku))
        conn.commit()
        conn.close()
        flash(f"📸 Gallery image {next_idx} uploaded!", "success")
        trigger_auto_publish()
    else:
        flash("Invalid file type!", "danger")
    return redirect(url_for("product_edit", sku=sku))


@app.route("/products/<sku>/gallery-delete", methods=["POST"])
def product_gallery_delete(sku):
    filename = request.form.get("filename", "")
    if not filename:
        flash("No image specified!", "danger")
        return redirect(url_for("product_edit", sku=sku))
    conn = get_db()
    p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
    if p:
        gallery = json.loads(p["gallery"] or "[]")
        if filename in gallery:
            gallery.remove(filename)
            # Delete physical file
            img_path = UPLOAD_FOLDER / filename
            if img_path.exists():
                img_path.unlink()
            conn.execute("UPDATE products SET gallery=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
                         (json.dumps(gallery), sku))
            conn.commit()
            flash(f"🗑️ Removed from gallery", "warning")
            trigger_auto_publish()
        else:
            flash("Image not found in gallery!", "danger")
    conn.close()
    return redirect(url_for("product_edit", sku=sku))


@app.route("/products/<sku>/promote-image", methods=["POST"])
def product_promote_image(sku):
    """Promote a gallery image to main image. The old main image becomes gallery."""
    filename = request.form.get("filename", "")
    if not filename:
        flash("No image specified!", "danger")
        return redirect(url_for("product_edit", sku=sku))

    conn = get_db()
    p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
    if not p:
        conn.close()
        flash("Product not found!", "danger")
        return redirect(url_for("product_list"))

    old_main = p["image_filename"]
    if not old_main:
        flash("No main image to swap with!", "danger")
        conn.close()
        return redirect(url_for("product_edit", sku=sku))

    gallery = json.loads(p["gallery"] or "[]")
    if filename not in gallery:
        flash("Image not in gallery!", "danger")
        conn.close()
        return redirect(url_for("product_edit", sku=sku))

    # Swap: gallery image becomes main, old main goes to gallery
    gallery.remove(filename)
    if old_main and old_main != filename:
        gallery.append(old_main)

    new_main_path = f"/images/products/{filename}"
    conn.execute(
        "UPDATE products SET image_filename=?, image=?, gallery=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
        (filename, new_main_path, json.dumps(gallery), sku)
    )
    conn.commit()
    conn.close()
    flash(f"📸 '{filename}' is now the main image!", "success")
    trigger_auto_publish()
    return redirect(url_for("product_edit", sku=sku))


@app.route("/api/generate-sku")
def api_generate_sku():
    cat = request.args.get("category", "accessories")
    sku = generate_sku(cat)
    return jsonify({"sku": sku})

@app.route("/api/category-attrs/<slug>")
def api_category_attrs(slug):
    """Return the attribute template for a category (for dynamic form updates)."""
    attrs = get_category_attrs(slug)
    return jsonify(attrs)

# ── CSV ──

@app.route("/csv/import", methods=["GET", "POST"])
def csv_import():
    if request.method == "POST":
        if "csv_file" not in request.files:
            flash("No file selected!", "danger")
            return redirect(request.url)
        file = request.files["csv_file"]
        if file.filename == "" or not file.filename.endswith(".csv"):
            flash("Please upload a .csv file!", "danger")
            return redirect(request.url)
        try:
            stream = io.StringIO(file.stream.read().decode("utf-8-sig"))
            reader = csv.DictReader(stream)
            conn = get_db()
            imported, errors = 0, []
            for i, row in enumerate(reader, 2):
                name = (row.get("Name") or "").strip()
                if not name:
                    continue
                sku = (row.get("SKU") or "").strip()
                if not sku:
                    errors.append(f"Row {i}: missing SKU")
                    continue
                cat = (row.get("Category") or "").strip().lower()
                try:
                    conn.execute(
                        """INSERT OR REPLACE INTO products
                           (sku, name, category_slug, description, price_kes,
                            cost_cny, cost_kes, sizes, colors, status, stock)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                        (sku, name, CATEGORY_MAP.get(cat, "accessories"),
                         (row.get("Description") or "").strip(),
                         parse_kes(row.get("Price Kenya (Ksh)")),
                         (row.get("Cost China (CNY)") or "").strip(),
                         (row.get("Cost China (Ksh)") or "").strip(),
                         (row.get("Sizes") or "").strip(),
                         (row.get("Colors") or "").strip(),
                         (row.get("Status") or "In Stock").strip(),
                         (row.get("Stock") or "").strip())
                    )
                    imported += 1
                except Exception as e:
                    errors.append(f"Row {i} ({sku}): {e}")
            conn.commit()
            conn.close()
            flash(f"✅ Imported {imported} products." + (f" ⚠️ {len(errors)} errors" if errors else ""),
                  "success" if not errors else "warning")
            trigger_auto_publish()
            return redirect(url_for("product_list"))
        except Exception as e:
            flash(f"Error reading CSV: {e}", "danger")
    return render_template("csv_import.html")

@app.route("/csv/template")
def csv_template():
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(CSV_COLUMNS)
    w.writerow(["gk-dr001", "TaylorMade Qi35 Driver", "irons", "85000", "1200", "21600",
                 "S,M,L,XL", "White/Black", "Premium driver", "driver.jpg", "In Stock", "10"])
    return app.response_class(
        output.getvalue(), mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=golf_kenya_template.csv"}
    )

@app.route("/csv/export")
def csv_export():
    conn = get_db()
    products = conn.execute("SELECT * FROM products ORDER BY sku").fetchall()
    conn.close()
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(CSV_COLUMNS)
    for p in products:
        w.writerow([p["sku"], p["name"], p["category_slug"], p["price_kes"],
                     p["cost_cny"], p["cost_kes"], p["sizes"], p["colors"],
                     p["description"], p["image_filename"], p["status"], p["stock"]])
    return app.response_class(
        output.getvalue(), mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=golf_kenya_export.csv"}
    )

@app.route("/import-sheet")
def import_sheet():
    count = import_from_google_sheet()
    flash(f"📥 Imported {count} products from Google Sheet!", "success")
    trigger_auto_publish()
    return redirect(url_for("product_list"))

# ── Categories ──

@app.route("/categories")
def category_list():
    conn = get_db()
    cats = conn.execute("""
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c LEFT JOIN products p ON c.slug = p.category_slug
        GROUP BY c.id ORDER BY c.display_order
    """).fetchall()
    conn.close()
    return render_template("categories.html", categories=cats,
                          CATEGORY_ATTR_TEMPLATES=CATEGORY_ATTR_TEMPLATES)

@app.route("/categories/<slug>/edit", methods=["POST"])
def category_edit(slug):
    conn = get_db()
    conn.execute(
        """UPDATE categories SET label=?, description=?, display_order=?, sku_prefix=?, category_type=?
           WHERE slug=?""",
        (request.form.get("label", "").strip(),
         request.form.get("description", "").strip(),
         int(request.form.get("display_order", 0)),
         request.form.get("sku_prefix", "xx").strip(),
         request.form.get("category_type", "accessory").strip(),
         slug)
    )
    conn.commit()
    conn.close()
    flash("✅ Category updated!", "success")
    return redirect(url_for("category_list"))

@app.route("/categories/<slug>/image", methods=["POST"])
def category_upload_image(slug):
    if "image" not in request.files:
        flash("No file selected!", "danger")
        return redirect(url_for("category_list"))
    file = request.files["image"]
    if file.filename == "":
        flash("No file selected!", "danger")
        return redirect(url_for("category_list"))
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        # Use the category image naming convention: cat_{slug}.jpg
        filename = f"cat_{slug}.{ext}"
        file.save(str(CATEGORY_IMG_FOLDER / filename))
        conn = get_db()
        conn.execute("UPDATE categories SET image_filename=?, image=? WHERE slug=?",
                     (filename, f"/images/categories/{filename}", slug))
        conn.commit()
        conn.close()
        flash(f"📸 Category image uploaded!", "success")
    else:
        flash("Invalid file type!", "danger")
    return redirect(url_for("category_list"))

@app.route("/categories/<slug>/delete-image", methods=["POST"])
def category_delete_image(slug):
    conn = get_db()
    cat = conn.execute("SELECT * FROM categories WHERE slug = ?", (slug,)).fetchone()
    if cat and cat["image_filename"]:
        img = CATEGORY_IMG_FOLDER / cat["image_filename"]
        if img.exists():
            img.unlink()
        conn.execute("UPDATE categories SET image_filename='', image='' WHERE slug=?", (slug,))
        conn.commit()
    conn.close()
    return redirect(url_for("category_list"))

# ── Generate & Deploy ──

@app.route("/generate-now")
def generate_now():
    ok, msg = generate_site_sync()
    if ok:
        flash(f"🏗️ Site regenerated! {msg}", "success")
    else:
        flash(f"❌ Generation failed: {msg}", "danger")
    return redirect(url_for("dashboard"))

@app.route("/deploy-now", methods=["POST"])
def deploy_now():
    ok, msg = deploy_to_netlify()
    if ok:
        flash(f"🚀 Deployed to Netlify!", "success")
    else:
        flash(f"❌ Deploy failed: {msg[:300]}", "danger")
    return redirect(url_for("dashboard"))

@app.route("/toggle-auto-deploy", methods=["POST"])
def toggle_auto_deploy():
    set_auto_deploy(not is_auto_deploy_enabled())
    flash(f"🔁 Auto-publish {'ON' if is_auto_deploy_enabled() else 'OFF'}", "success")
    return redirect(url_for("dashboard"))

# ── API ──

@app.route("/api/products")
def api_products():
    conn = get_db()
    products = conn.execute("""
        SELECT p.*, c.label as category_label
        FROM products p JOIN categories c ON p.category_slug = c.slug
        ORDER BY p.name
    """).fetchall()
    conn.close()
    return jsonify([dict(p) for p in products])

@app.route("/api/stats")
def api_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    in_stock = conn.execute("SELECT COUNT(*) FROM products WHERE status='In Stock'").fetchone()[0]
    by_cat = conn.execute("""
        SELECT c.label, c.slug, c.image, COUNT(p.id) as count
        FROM categories c LEFT JOIN products p ON c.slug = p.category_slug
        GROUP BY c.id ORDER BY count DESC
    """).fetchall()
    total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    new_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE status='new'").fetchone()[0]
    conn.close()
    return jsonify({"total_products": total, "in_stock": in_stock,
                    "by_category": [dict(r) for r in by_cat],
                    "total_orders": total_orders,
                    "new_orders": new_orders,
                    })

@app.route("/images/products/<filename>")
def serve_image(filename):
    return send_from_directory(str(UPLOAD_FOLDER), filename)

@app.route("/images/categories/<filename>")
def serve_category_image(filename):
    return send_from_directory(str(CATEGORY_IMG_FOLDER), filename)

# ── Settings ──

@app.route("/settings", methods=["GET", "POST"])
def shop_settings():
    if request.method == "POST":
        conn = get_db()
        for key in ["shop_name", "shop_url", "whatsapp_number", "business_email",
                     "business_location", "currency", "tax_rate", "shipping_flat_rate"]:
            val = request.form.get(key, "").strip()
            conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, val))
        conn.commit()
        conn.close()
        flash("⚙️ Settings saved!", "success")
        return redirect(url_for("shop_settings"))
    conn = get_db()
    settings = {}
    for row in conn.execute("SELECT key, value FROM settings").fetchall():
        settings[row["key"]] = row["value"]
    conn.close()
    defaults = {
        "shop_name": "Karibu Golf", "shop_url": "https://golfklcubskenya.netlify.app",
        "whatsapp_number": "+861****0197", "currency": "KES",
    }
    for k, v in defaults.items():
        settings.setdefault(k, v)
    return render_template("settings.html", settings=settings)


# ── Orders ──

def generate_order_number():
    today = datetime.now().strftime("%Y%m%d")
    conn = get_db()
    row = conn.execute(
        "SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1",
        (f"ORD-{today}-%",)
    ).fetchone()
    conn.close()
    if row:
        parts = row["order_number"].split("-")
        next_num = int(parts[-1]) + 1
    else:
        next_num = 1
    return f"ORD-{today}-{next_num:03d}"


@app.route("/orders")
def order_list():
    conn = get_db()
    status_filter = request.args.get("status", "")
    search = request.args.get("search", "")
    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    if status_filter:
        query += " AND status = ?"
        params.append(status_filter)
    if search:
        query += " AND (customer_name LIKE ? OR order_number LIKE ? OR customer_phone LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    orders = conn.execute(query + " ORDER BY created_at DESC", params).fetchall()
    conn.close()
    order_list = []
    for o in orders:
        d = dict(o)
        try:
            d["items_parsed"] = json.loads(d.get("items", "[]"))
        except:
            d["items_parsed"] = []
        order_list.append(d)
    return render_template("orders.html", orders=order_list, status_filter=status_filter, search=search)


@app.route("/orders/new", methods=["GET", "POST"])
def order_new():
    conn = get_db()
    products = conn.execute("SELECT sku, name, price_kes, image, colors, sizes FROM products ORDER BY name").fetchall()
    categories = conn.execute("SELECT * FROM categories ORDER BY display_order").fetchall()
    if request.method == "POST":
        customer_name = request.form.get("customer_name", "").strip()
        if not customer_name:
            flash("Customer name is required!", "danger")
            return render_template("order_form.html", products=products, categories=categories)
        skus = request.form.getlist("item_sku[]")
        qtys = request.form.getlist("item_qty[]")
        prices = request.form.getlist("item_price[]")
        names = request.form.getlist("item_name[]")
        options = request.form.getlist("item_options[]")
        items = []
        total = 0
        for i in range(len(skus)):
            if not skus[i].strip():
                continue
            qty = int(qtys[i]) if i < len(qtys) and qtys[i].strip().isdigit() else 1
            price = parse_kes(prices[i]) if i < len(prices) else 0
            items.append({
                "sku": skus[i].strip(), "name": names[i].strip() if i < len(names) else "",
                "qty": qty, "price": price, "options": options[i].strip() if i < len(options) else "",
            })
            total += price * qty
        order_number = generate_order_number()
        source = request.form.get("source", "admin")
        notes = request.form.get("notes", "").strip()
        conn.execute(
            """INSERT INTO orders (order_number, customer_name, customer_phone, customer_email,
               items, total_kes, status, source, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (order_number, customer_name,
             request.form.get("customer_phone", "").strip(),
             request.form.get("customer_email", "").strip(),
             json.dumps(items), total, request.form.get("status", "new"), source, notes)
        )
        conn.commit()
        last_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        flash(f"📦 Order {order_number} created! (KES {total:,})", "success")
        return redirect(url_for("order_detail", order_id=last_id))
    conn.close()
    return render_template("order_form.html", products=products, categories=categories)


@app.route("/orders/<int:order_id>")
def order_detail(order_id):
    conn = get_db()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    if not order:
        flash("Order not found!", "danger")
        return redirect(url_for("order_list"))
    d = dict(order)
    try:
        d["items_parsed"] = json.loads(d.get("items", "[]"))
    except:
        d["items_parsed"] = []
    return render_template("order_detail.html", order=d)


@app.route("/orders/<int:order_id>/status", methods=["POST"])
def order_update_status(order_id):
    status = request.form.get("status", "").strip()
    if status in ("new", "confirmed", "processing", "shipped", "delivered", "cancelled"):
        conn = get_db()
        conn.execute("UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                     (status, order_id))
        conn.commit()
        conn.close()
        flash(f"📦 Order status updated to '{status}'", "success")
    return redirect(url_for("order_detail", order_id=order_id))


@app.route("/orders/<int:order_id>/delete", methods=["POST"])
def order_delete(order_id):
    conn = get_db()
    order = conn.execute("SELECT order_number FROM orders WHERE id = ?", (order_id,)).fetchone()
    if order:
        conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        conn.commit()
        flash(f"🗑️ Order {order['order_number']} deleted", "warning")
    conn.close()
    return redirect(url_for("order_list"))


@app.route("/api/orders", methods=["POST"])
def api_create_order():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    customer_name = (data.get("customer_name") or "").strip()
    if not customer_name:
        return jsonify({"error": "customer_name required"}), 400
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "items required"}), 400
    total = 0
    clean_items = []
    for item in items:
        qty = int(item.get("qty", 1))
        price = parse_kes(item.get("price", 0))
        total += price * qty
        clean_items.append({
            "sku": item.get("sku", ""), "name": item.get("name", ""),
            "qty": qty, "price": price, "options": item.get("options", ""),
        })
    order_number = generate_order_number()
    conn = get_db()
    conn.execute(
        """INSERT INTO orders (order_number, customer_name, customer_phone, customer_email,
           items, total_kes, status, source, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (order_number, customer_name, data.get("customer_phone", ""),
         data.get("customer_email", ""), json.dumps(clean_items), total,
         "new", "website", data.get("notes", ""))
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "order_number": order_number, "total": total})


# ── Main ──
if __name__ == "__main__":
    init_db()
    seed_categories()

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")

    print(f"\n{'='*50}")
    print(f"  🏌️  Golf Kenya Admin Panel")
    print(f"  http://localhost:{port}")
    print(f"  Auto-publish: {'ON' if is_auto_deploy_enabled() else 'OFF'}")
    print(f"{'='*50}\n")

    app.run(debug=debug, use_reloader=debug, host="0.0.0.0", port=port)
