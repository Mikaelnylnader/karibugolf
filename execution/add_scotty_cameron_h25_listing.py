"""Add the Scotty Cameron H25 Limited Teryllium Newport 2 locally.

Read-only unless --apply is supplied. The owner's RMB 400 supplier cost is
converted with the catalogue's 19 KSh/RMB rate and Karibu's standing 62%
gross-margin rule. The listing remains visible but out of stock until the
exact item, authenticity, handedness and availability are confirmed.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-PT037"
NAME = "Scotty Cameron H25 Limited Teryllium Newport 2"
CATEGORY_SLUG = "putters"
CATEGORY_LABEL = "Putters"
SOURCE_URL = (
    "https://www.scottycameron.com/articles/"
    "introducing-the-scotty-cameron-2025-h25-limited-teryllium-newport-2/"
)
COST_CNY = 400
CNY_TO_KES = 19
USD_TO_KES = 129.5
MARGIN = 0.62
COST_KES = round(COST_CNY * CNY_TO_KES)
PRICE_KES = round(COST_KES / (1 - MARGIN))
PRICE_CNY = round(PRICE_KES / CNY_TO_KES, 2)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
SIZES = "34.5 in"
COLORS = "Black PVD / Teryllium"
DESCRIPTION = (
    "The 2025 Scotty Cameron H25 Limited Teryllium Newport 2 pairs a modern "
    "Newport 2 blade with a Teryllium copper-alloy face inlay, gray vibration "
    "damping and a glare-resistant black PVD finish. The official limited "
    "release uses a 34.5-inch Tour Black shaft, gray Baby T grip and dedicated "
    "H25 headcover. This supplier listing is currently out of stock; the exact "
    "item, authenticity, handedness and availability must be confirmed before payment."
)
PRODUCT_IMAGES = [
    (
        "2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-3.jpg",
        "scotty-cameron-h25-teryllium-newport-2-sole.jpg",
    ),
    (
        "2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-2.jpg",
        "scotty-cameron-h25-teryllium-newport-2-insert.jpg",
    ),
    (
        "2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-1.jpg",
        "scotty-cameron-h25-teryllium-newport-2-face.jpg",
    ),
    (
        "2025-scotty-cameron-h25-ltd-teryllium-newport-2-art-img-5.jpg",
        "scotty-cameron-h25-teryllium-newport-2-address.jpg",
    ),
]


def main(apply: bool, source: Path) -> None:
    for original, _ in PRODUCT_IMAGES:
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
    if any(
        product["sku"] == SKU or product["name"].lower() == NAME.lower()
        for product in catalog["products"]
    ):
        raise RuntimeError(f"{SKU} or {NAME} already exists in the generated catalogue")

    plan = {
        "sku": SKU,
        "name": NAME,
        "category": {"slug": CATEGORY_SLUG, "label": CATEGORY_LABEL},
        "supplier_cost_cny": COST_CNY,
        "cny_to_kes": CNY_TO_KES,
        "usd_to_kes": USD_TO_KES,
        "gross_margin": MARGIN,
        "cost_kes": COST_KES,
        "price_kes": PRICE_KES,
        "price_cny": PRICE_CNY,
        "price_usd": PRICE_USD,
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
        "scotty-cameron-h25-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for original, filename in PRODUCT_IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / original, folder / filename)

    extra_attrs = {
        "brand": "Scotty Cameron",
        "source": SOURCE_URL,
        "supplier_cost_cny": COST_CNY,
        "cny_to_kes": CNY_TO_KES,
        "usd_to_kes": USD_TO_KES,
        "margin": MARGIN,
        "official_length": "34.5 in",
        "head": "Stainless steel modern Newport 2",
        "insert": "Teryllium copper alloy",
        "finish": "Black PVD",
        "shaft": "Tour Black",
        "grip": "Gray Baby T",
        "confirmation": "Exact item, authenticity, handedness and availability required",
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
            SKU,
            NAME,
            CATEGORY_SLUG,
            DESCRIPTION,
            PRICE_KES,
            COST_CNY,
            COST_KES,
            SIZES,
            COLORS,
            "/images/products/" + PRODUCT_IMAGES[0][1],
            PRODUCT_IMAGES[0][1],
            json.dumps(extra_attrs),
            json.dumps([filename for _, filename in PRODUCT_IMAGES[1:]]),
            PRICE_USD,
            PRICE_CNY,
        ),
    )
    connection.commit()
    saved = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    if (
        saved["price_kes"] != PRICE_KES
        or saved["status"] != "Out of Stock"
        or saved["website_visible"] != 1
    ):
        raise AssertionError("Saved H25 commercial, availability or visibility data is incorrect")

    catalog["products"].append(
        {
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
        }
    )
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Added local H25 listing and supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
