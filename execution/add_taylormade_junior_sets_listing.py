"""Add Team TaylorMade Junior Sets and the Junior Sets category locally.

Read-only unless --apply is supplied. The listing uses TaylorMade's official
US$299.99 starting price as a cost basis, the catalogue conversion rates and
Karibu's standing 62% gross-margin rule. It remains visible but out of stock
until the exact size, hand and landed cost are confirmed.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-JR001"
NAME = "Team TaylorMade Junior Golf Set"
CATEGORY_SLUG = "junior_sets"
CATEGORY_LABEL = "Junior Sets"
SOURCE_PRICE_USD = 299.99
USD_TO_KES = 129.5
CNY_TO_KES = 19
MARGIN = 0.62
COST_KES = round(SOURCE_PRICE_USD * USD_TO_KES)
PRICE_KES = round(COST_KES / (1 - MARGIN))
COST_CNY = round(COST_KES / CNY_TO_KES, 2)
PRICE_CNY = round(PRICE_KES / CNY_TO_KES, 2)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
SIZES = "Size 1 · 42–47 in · ages 4–6; Size 2 · 48–53 in · ages 7–9; Size 3 · 54–59 in · ages 10–12"
COLORS = "Blue / White / Black"
DESCRIPTION = (
    "Team TaylorMade Junior Golf Set engineered specifically for young golfers "
    "ages 4–12. Three height-based sizes progress from a fairway, 7-iron, "
    "wedge and putter set to a complete seven-club junior setup. Each set "
    "includes a dual-strap stand bag, rain hood and club headcovers. Right- "
    "and left-handed options are manufacturer references; exact Karibu "
    "availability and the final landed price must be confirmed. Currently out of stock."
)
PRODUCT_IMAGES = [
    ("V98596_zoom_D3.jpg", "taylormade-junior-set-bag.jpg"),
    ("TMJR24-FnB-3_2024-04-11-174508_kzrg~W1250_H900_Mcrop_P50-50.jpg", "taylormade-junior-set-woods.jpg"),
    ("TMJR24-FnB-4_2024-04-11-174323_egvg~W1250_H900_Mcrop_P50-50.jpg", "taylormade-junior-set-irons-putter.jpg"),
    ("Rectangle-15~W1200_H900_Mcrop_CZ1_P50-50.jpg", "taylormade-junior-set-bag-closeup.jpg"),
    ("V98596_zoom_D4.jpg", "taylormade-junior-set-fairway.jpg"),
    ("V98596_zoom_D5.jpg", "taylormade-junior-set-seven-iron.jpg"),
    ("V98596_zoom_D7.jpg", "taylormade-junior-set-putter.jpg"),
]
KIDS_SOURCE_IMAGE = "Gemini_Generated_Image_e1a4t5e1a4t5e1a4.jpg"


def main(apply: bool, source: Path) -> None:
    for original, _ in PRODUCT_IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)
    if not (source / KIDS_SOURCE_IMAGE).is_file():
        raise FileNotFoundError(source / KIDS_SOURCE_IMAGE)

    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    if connection.execute("SELECT 1 FROM products WHERE sku=?", (SKU,)).fetchone():
        raise RuntimeError(f"{SKU} already exists; this script only performs the initial add")
    if connection.execute("SELECT 1 FROM products WHERE lower(name)=lower(?)", (NAME,)).fetchone():
        raise RuntimeError(f"A local product named {NAME} already exists")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(product["sku"] == SKU or product["name"].lower() == NAME.lower() for product in catalog["products"]):
        raise RuntimeError(f"{SKU} or {NAME} already exists in the generated catalogue")

    plan = {
        "sku": SKU,
        "name": NAME,
        "category": {"slug": CATEGORY_SLUG, "label": CATEGORY_LABEL},
        "official_starting_price_usd_cost_basis": SOURCE_PRICE_USD,
        "margin": MARGIN,
        "cost_kes": COST_KES,
        "cost_cny": COST_CNY,
        "price_kes": PRICE_KES,
        "price_usd": PRICE_USD,
        "price_cny": PRICE_CNY,
        "sizes": ["42–47 in / ages 4–6", "48–53 in / ages 7–9", "54–59 in / ages 10–12"],
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "product_gallery_images": len(PRODUCT_IMAGES),
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "taylormade-junior-sets-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for original, filename in PRODUCT_IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / original, folder / filename)

    category_copies = [
        (source / KIDS_SOURCE_IMAGE, ROOT / "public/images/shop/kids-v2.jpg"),
        (source / "V98596_zoom_D3.jpg", ROOT / "public/images/shop/categories-v2/junior_sets.jpg"),
        (source / "V98596_zoom_D3.jpg", ROOT / "images/categories/junior_sets.jpg"),
    ]
    for original, target in category_copies:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(original, target)

    connection.execute(
        """INSERT OR IGNORE INTO categories
        (slug, label, description, display_order, image, image_filename, sku_prefix, category_type)
        VALUES (?, ?, ?, 7, '/images/categories/junior_sets.jpg', 'junior_sets.jpg', 'jr', 'club')""",
        (CATEGORY_SLUG, CATEGORY_LABEL, "Complete height-matched golf sets for junior players"),
    )
    if not connection.execute("SELECT 1 FROM categories WHERE slug=?", (CATEGORY_SLUG,)).fetchone():
        raise AssertionError("Junior Sets category was not created")

    extra_attrs = {
        "brand": "TaylorMade",
        "source": "https://www.taylormadegolf.com/Team-TaylorMade-Junior-Sets/DW-TC602.html?lang=en_US",
        "official_starting_price_usd_cost_basis": SOURCE_PRICE_USD,
        "margin": MARGIN,
        "hand_reference": "Right / Left",
        "size_1": "42–47 in; ages 4–6; fairway, 7-iron, wedge, putter, golf bag",
        "size_2": "48–53 in; ages 7–9; driver, hybrid, 7-iron, wedge, putter, golf bag",
        "size_3": "54–59 in; ages 10–12; driver, fairway, hybrid, 7-iron, 9-iron, wedge, putter, golf bag",
    }
    connection.execute(
        """INSERT INTO products (
        sku, name, category_slug, description, price_kes, cost_cny, cost_kes,
        sizes, colors, status, stock, image, image_filename, featured,
        display_order, extra_attrs, gallery, feature_rows, price_usd, price_cny,
        website_visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Out of Stock', '0', ?, ?,
        0, 0, ?, ?, '[]', ?, ?, 1)""",
        (
            SKU, NAME, CATEGORY_SLUG, DESCRIPTION, PRICE_KES, COST_CNY, COST_KES,
            SIZES, COLORS, "/images/products/" + PRODUCT_IMAGES[0][1], PRODUCT_IMAGES[0][1],
            json.dumps(extra_attrs), json.dumps([filename for _, filename in PRODUCT_IMAGES[1:]]),
            PRICE_USD, PRICE_CNY,
        ),
    )
    connection.commit()
    saved = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    if saved["price_kes"] != PRICE_KES or saved["status"] != "Out of Stock" or saved["website_visible"] != 1:
        raise AssertionError("Saved junior-set commercial, availability or visibility data is incorrect")

    if not any(category["slug"] == CATEGORY_SLUG for category in catalog["categories"]):
        catalog["categories"].append({
            "slug": CATEGORY_SLUG,
            "label": CATEGORY_LABEL,
            "description": "Complete height-matched golf sets for junior players",
            "categoryType": "club",
            "displayOrder": 7,
        })
        catalog["categories"].sort(key=lambda category: category.get("displayOrder", 999))
    catalog["products"].append({
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": CATEGORY_SLUG,
        "categoryLabel": CATEGORY_LABEL,
        "description": DESCRIPTION,
        "priceKes": PRICE_KES,
        "priceUsd": PRICE_USD,
        "priceCny": PRICE_CNY,
        "sizes": SIZES,
        "colors": COLORS,
        "status": "Out of Stock",
        "stock": "0",
        "featured": False,
        "images": ["/images/products/" + filename for _, filename in PRODUCT_IMAGES],
    })
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added local junior-set listing, Kids category assets and supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
