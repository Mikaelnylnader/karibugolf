"""Add the TaylorMade SIM2 Max Rescue; read-only unless --apply is supplied.

The owner's 62% gross-margin rule is applied to TaylorMade's current US$199.99
sale price using the catalogue's KSh/USD rate. The product stays visible but
out of stock until exact Karibu inventory is confirmed.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-HY001"
NAME = "TaylorMade SIM2 Max Rescue"
SOURCE_PRICE_USD = 199.99
USD_TO_KES = 129.5
CNY_TO_KES = 21.24
MARGIN = 0.62
COST_KES = round(SOURCE_PRICE_USD * USD_TO_KES)
PRICE_KES = round(COST_KES / (1 - MARGIN))
COST_CNY = round(COST_KES / CNY_TO_KES)
PRICE_CNY = round(PRICE_KES / CNY_TO_KES)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
DESCRIPTION = (
    "TaylorMade SIM2 Max Rescue hybrid with a redesigned V Steel sole, C300 "
    "Steel Twist Face and a Thru-Slot Speed Pocket for high launch, "
    "forgiveness and versatile performance from tee, fairway or rough. Loft, "
    "hand, shaft and flex choices are manufacturer references; exact Karibu "
    "availability must be confirmed. Currently out of stock."
)
SIZES = "3 (19°); 4 (22°); 5 (25°); 6 (28°); 7 (31°) (manufacturer reference)"
COLORS = "Black / White / Blue"
IMAGES = [
    ("JJI54_zoom_D.jpg", "taylormade-sim2-max-rescue-sole.jpg"),
    ("JJI54_zoom_D2.jpg", "taylormade-sim2-max-rescue-crown.jpg"),
    ("JJI54_zoom_D3.jpg", "taylormade-sim2-max-rescue-face.jpg"),
    ("JJI54_zoom_D4.jpg", "taylormade-sim2-max-rescue-profile.jpg"),
    ("JJI54_zoom_D5.jpg", "taylormade-sim2-max-rescue-headcover.jpg"),
]


def main(apply: bool, source: Path) -> None:
    for original, _ in IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)

    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    if connection.execute("SELECT 1 FROM products WHERE sku=?", (SKU,)).fetchone():
        raise RuntimeError(f"{SKU} already exists; this script only performs the initial add")
    if connection.execute("SELECT 1 FROM products WHERE lower(name)=lower(?)", (NAME,)).fetchone():
        raise RuntimeError(f"A local product named {NAME} already exists")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(product["sku"] == SKU or product["name"].lower() == NAME.lower()
           for product in catalog["products"]):
        raise RuntimeError(f"{SKU} or {NAME} already exists in the generated catalogue")

    print(json.dumps({
        "sku": SKU,
        "name": NAME,
        "source_cost_usd": SOURCE_PRICE_USD,
        "margin": MARGIN,
        "cost_kes": COST_KES,
        "price_kes": PRICE_KES,
        "price_usd": PRICE_USD,
        "price_cny": PRICE_CNY,
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "images": len(IMAGES),
        "apply": apply,
    }, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "taylormade-sim2-max-rescue-"
        + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for original, filename in IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / original, folder / filename)

    connection.execute(
        """INSERT INTO products (
        sku, name, category_slug, description, price_kes, cost_cny, cost_kes,
        sizes, colors, status, stock, image, image_filename, featured,
        display_order, extra_attrs, gallery, feature_rows, price_usd, price_cny,
        website_visible
        ) VALUES (?, ?, 'hybrids', ?, ?, ?, ?, ?, ?, 'Out of Stock', '0', ?, ?,
        0, 0, ?, ?, '[]', ?, ?, 1)""",
        (
            SKU, NAME, DESCRIPTION, PRICE_KES, f"¥{COST_CNY:,}", f"Ksh{COST_KES:,}",
            SIZES, COLORS, "/images/products/" + IMAGES[0][1], IMAGES[0][1],
            json.dumps({"launch": "High", "margin": MARGIN}),
            json.dumps([filename for _, filename in IMAGES[1:]]),
            PRICE_USD, float(PRICE_CNY),
        ),
    )
    connection.commit()
    saved = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    if saved["price_kes"] != PRICE_KES or saved["status"] != "Out of Stock":
        raise AssertionError("Saved Rescue commercial or availability data is incorrect")

    catalog["products"].append({
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": "hybrids",
        "categoryLabel": "Hybrids",
        "description": DESCRIPTION,
        "priceKes": PRICE_KES,
        "priceUsd": PRICE_USD,
        "priceCny": PRICE_CNY,
        "sizes": SIZES,
        "colors": COLORS,
        "status": "Out of Stock",
        "stock": "0",
        "featured": False,
        "images": ["/images/products/" + filename for _, filename in IMAGES],
    })
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Added local Rescue listing and copied supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
