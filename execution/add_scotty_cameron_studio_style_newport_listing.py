"""Add the Scotty Cameron Studio Style Newport locally.

Read-only unless --apply is supplied. With no supplier quote supplied, the
official US$499 retail price is recorded as the provisional cost basis and the
standing 62% gross-margin rule is applied. The listing remains visible but out
of stock until Karibu confirms its actual supplier cost and inventory.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-PT040"
NAME = "Scotty Cameron Studio Style Newport Putter"
CATEGORY_SLUG = "putters"
CATEGORY_LABEL = "Putters"
SOURCE_URL = "https://www.scottycameron.com/putters/studio-style/newport/"
SOURCE_PRICE_USD = 499
USD_TO_KES = 129.5
CNY_TO_KES = 19
MARGIN = 0.62
COST_KES = round(SOURCE_PRICE_USD * USD_TO_KES)
COST_CNY = round(COST_KES / CNY_TO_KES)
PRICE_KES = round(COST_KES / (1 - MARGIN))
PRICE_CNY = round(PRICE_KES / CNY_TO_KES, 2)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
SIZES = '33 in; 34 in; 35 in (manufacturer reference)'
COLORS = "Silver / Red"
DESCRIPTION = (
    "Scotty Cameron Studio Style Newport rounded blade putter precision milled "
    "from 303 stainless steel with a nickel-plated Studio Carbon Steel face "
    "insert, aerospace-inspired vibration damping, chain-link face milling and "
    "adjustable tungsten sole weights. Official stock lengths are 33, 34 and "
    "35 inches. This listing is currently out of stock; confirm the exact "
    "length, authenticity, included headcover and final supplier price before payment."
)
IMAGES = [
    (
        Path("C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-07 212138.png"),
        "scotty-cameron-studio-style-newport-hero.png",
    ),
    (
        Path("C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-07 212150.png"),
        "scotty-cameron-studio-style-newport-cavity.png",
    ),
    (
        Path("C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-07 212204.png"),
        "scotty-cameron-studio-style-newport-address.png",
    ),
    (
        Path("C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-07 212216.png"),
        "scotty-cameron-studio-style-newport-face.png",
    ),
]


def main(apply: bool) -> None:
    for source, _ in IMAGES:
        if not source.is_file():
            raise FileNotFoundError(source)

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

    print(
        json.dumps(
            {
                "sku": SKU,
                "name": NAME,
                "source_cost_usd": SOURCE_PRICE_USD,
                "usd_to_kes": USD_TO_KES,
                "cny_to_kes": CNY_TO_KES,
                "gross_margin": MARGIN,
                "cost_kes": COST_KES,
                "cost_cny_reference": COST_CNY,
                "price_kes": PRICE_KES,
                "price_cny": PRICE_CNY,
                "price_usd": PRICE_USD,
                "status": "Out of Stock",
                "stock": 0,
                "visible": True,
                "google_sheet_write": False,
                "images": [(str(source), filename) for source, filename in IMAGES],
                "apply": apply,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "scotty-cameron-studio-style-newport-"
        + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for source, filename in IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, folder / filename)

    extra_attrs = {
        "brand": "Scotty Cameron",
        "model": "Studio Style Newport",
        "source": SOURCE_URL,
        "source_cost_usd": SOURCE_PRICE_USD,
        "cost_basis": "Official US retail price; provisional until supplier quote",
        "usd_to_kes": USD_TO_KES,
        "cny_to_kes": CNY_TO_KES,
        "margin": MARGIN,
        "loft": "3.5°",
        "lie": "70°",
        "head_material": "303 stainless steel",
        "insert": "Studio Carbon Steel (SCS)",
        "offset": "Full shaft",
        "toe_flow": "Medium",
        "grip": "Full Contact Slim",
        "hand": "Right handed",
        "confirmation": "Exact length, authenticity, headcover, supplier price and availability required",
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
            f"¥{COST_CNY:,}",
            f"Ksh{COST_KES:,}",
            SIZES,
            COLORS,
            "/images/products/" + IMAGES[0][1],
            IMAGES[0][1],
            json.dumps(extra_attrs),
            json.dumps([filename for _, filename in IMAGES[1:]]),
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
        or saved["stock"] != "0"
        or saved["website_visible"] != 1
    ):
        raise AssertionError("Saved Newport commercial, availability or visibility data is incorrect")

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
            "images": ["/images/products/" + filename for _, filename in IMAGES],
        }
    )
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Added local Studio Style Newport listing and supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    arguments = parser.parse_args()
    main(arguments.apply)
