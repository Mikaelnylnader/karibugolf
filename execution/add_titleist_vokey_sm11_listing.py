"""Add the Titleist Vokey SM11 wedge; read-only unless --apply is supplied.

The owner's 62% gross-margin rule is applied to Titleist's current US$199
base price using the catalogue's KSh/USD rate. The listing remains visible but
out of stock until Karibu confirms the exact physical wedge.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-WG010"
NAME = "Titleist Vokey SM11 Wedge"
SOURCE_PRICE_USD = 199.00
USD_TO_KES = 129.5
CNY_TO_KES = 21.24
MARGIN = 0.62
COST_KES = round(SOURCE_PRICE_USD * USD_TO_KES)
PRICE_KES = round(COST_KES / (1 - MARGIN))
COST_CNY = round(COST_KES / CNY_TO_KES)
PRICE_CNY = round(PRICE_KES / CNY_TO_KES)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
DESCRIPTION = (
    "Titleist Vokey Design SM11 wedge with six Tour-proven grinds, unified "
    "centre-of-gravity placement and the Vokey Spin System for cleaner contact, "
    "controlled flight and predictable spin. Karibu's planned range is right-handed "
    "only, with seven loft / bounce / grind models, Tour Chrome or Jet Black finish, "
    "and one standard steel shaft. This range is not currently in stock; exact future "
    "availability and shaft model / flex must be confirmed."
)
SIZES = "48.10 F; 50.08 F; 52.08 F; 54.08 M; 56.08 M; 58.04 T; 60.04 T"
COLORS = "Tour Chrome; Jet Black"
IMAGES = [
    ("Skärmbild 2026-10-06 143025.png", "titleist-vokey-sm11-wedge-back.png"),
    ("Skärmbild 2026-10-06 143037.png", "titleist-vokey-sm11-wedge-face.png"),
    ("Skärmbild 2026-10-06 143046.png", "titleist-vokey-sm11-wedge-sole.png"),
    ("Skärmbild 2026-10-06 143055.png", "titleist-vokey-sm11-wedge-profile.png"),
    ("Skärmbild 2026-10-06 143105.png", "titleist-vokey-sm11-wedge-address.png"),
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
        "titleist-vokey-sm11-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
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
        ) VALUES (?, ?, 'wedges', ?, ?, ?, ?, ?, ?, 'Out of Stock', '0', ?, ?,
        0, 0, ?, ?, '[]', ?, ?, 1)""",
        (
            SKU, NAME, DESCRIPTION, PRICE_KES, f"¥{COST_CNY:,}", f"Ksh{COST_KES:,}",
            SIZES, COLORS, "/images/products/" + IMAGES[0][1], IMAGES[0][1],
            json.dumps({"lie": "64°", "margin": MARGIN}),
            json.dumps([filename for _, filename in IMAGES[1:]]),
            PRICE_USD, float(PRICE_CNY),
        ),
    )
    connection.commit()
    saved = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    if saved["price_kes"] != PRICE_KES or saved["status"] != "Out of Stock":
        raise AssertionError("Saved SM11 commercial or availability data is incorrect")

    catalog["products"].append({
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": "wedges",
        "categoryLabel": "Wedges",
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
    print(f"Added local SM11 listing and copied supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--source", type=Path,
        default=Path("C:/Users/mikae/Pictures/Screenshots"),
    )
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
