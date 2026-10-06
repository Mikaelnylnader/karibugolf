"""Refresh the existing L.A.B. Golf OZ.1 listing; read-only unless --apply.

The existing supplier cost is preserved. Karibu's standing 62% gross-margin
rule is applied to that cost, and the product remains visible but out of stock.
"""

import argparse
import json
import re
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-PT036"
NAME = "L.A.B. Golf OZ.1 Custom Putter"
MARGIN = 0.62
USD_TO_KES = 129.5
CNY_TO_KES = 21.24
COST_KES = 12_744
COST_CNY = 600
PRICE_KES = round(COST_KES / (1 - MARGIN))
PRICE_CNY = round(PRICE_KES / CNY_TO_KES)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
DESCRIPTION = (
    "L.A.B. Golf OZ.1 custom mallet putter with Lie Angle Balance and a soft-feeling, "
    "no-insert 6061-aluminum construction. Karibu currently offers the right-handed "
    "Standard build with Standard head weight in Black. No fitting service is currently "
    "available. Length, lie angle, shaft, alignment and grip must be confirmed before "
    "ordering. Currently out of stock; additional finishes will be added when their "
    "product images are supplied."
)
SIZES = "28–38 in (standard)"
COLORS = "Black"
IMAGES = [
    ("OZ.1 1.png", "lab-golf-oz1-custom-putter-black-address.png", "Black"),
    ("OZ.1 2.png", "lab-golf-oz1-custom-putter-black-front.png", "Black"),
    ("OZ.1 3.png", "lab-golf-oz1-custom-putter-black-rear.png", "Black"),
    ("OZ.1 4.png", "lab-golf-oz1-custom-putter-black-sole.png", "Black"),
    ("OZ.1 5.png", "lab-golf-oz1-custom-putter-black-profile.png", "Black"),
    ("OZ.1.png", "lab-golf-oz1-custom-putter-black-angled-face.png", "Black"),
]


def amount(value: object) -> int:
    digits = re.sub(r"[^0-9.-]", "", str(value or ""))
    return round(float(digits)) if digits else 0


def main(apply: bool, source: Path) -> None:
    for original, _, _ in IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)

    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    current = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone()
    if not current:
        raise RuntimeError(f"Expected existing hidden product {SKU}")
    if amount(current["cost_kes"]) != COST_KES or amount(current["cost_cny"]) != COST_CNY:
        raise RuntimeError(
            f"Unexpected {SKU} supplier cost: {current['cost_kes']} / {current['cost_cny']}"
        )

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    duplicate = next(
        (
            product for product in catalog["products"]
            if product["sku"] != SKU and product["name"].lower() == NAME.lower()
        ),
        None,
    )
    if duplicate:
        raise RuntimeError(f"A different catalogue product already uses {NAME}")

    plan = {
        "sku": SKU,
        "mode": "refresh-existing",
        "old_name": current["name"],
        "new_name": NAME,
        "supplier_cost_kes_preserved": COST_KES,
        "supplier_cost_cny_preserved": COST_CNY,
        "margin": MARGIN,
        "old_price_kes": current["price_kes"],
        "new_price_kes": PRICE_KES,
        "price_usd": PRICE_USD,
        "price_cny": PRICE_CNY,
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "images": len(IMAGES),
        "finishes": sorted({finish for _, _, finish in IMAGES}),
        "ignored_attachment": "DF3i 6.png (exact duplicate of an existing DF3 image)",
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "lab-golf-oz1-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for original, filename, _ in IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / original, folder / filename)

    extra_attrs = json.loads(current["extra_attrs"] or "{}")
    extra_attrs.update({
        "effective_loft": "3°",
        "margin": MARGIN,
        "insert": "No insert",
        "supplier_cost_basis": "Existing GK-PT036 catalogue cost",
        "official_reference_price_usd": 499,
        "source": "https://labgolf.com/products/oz1-custom",
    })
    connection.execute(
        """UPDATE products SET
        name=?, description=?, price_kes=?, sizes=?, colors=?, status='Out of Stock',
        stock='0', image=?, image_filename=?, extra_attrs=?, gallery=?,
        feature_rows='[]', price_usd=?, price_cny=?, website_visible=1,
        updated_at=CURRENT_TIMESTAMP
        WHERE sku=?""",
        (
            NAME, DESCRIPTION, PRICE_KES, SIZES, COLORS,
            "/images/products/" + IMAGES[0][1], IMAGES[0][1],
            json.dumps(extra_attrs), json.dumps([filename for _, filename, _ in IMAGES[1:]]),
            PRICE_USD, float(PRICE_CNY), SKU,
        ),
    )
    connection.commit()
    saved = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone()
    if amount(saved["cost_kes"]) != COST_KES or amount(saved["cost_cny"]) != COST_CNY:
        raise AssertionError("Supplier cost changed unexpectedly")
    if saved["price_kes"] != PRICE_KES or saved["status"] != "Out of Stock" or saved["website_visible"] != 1:
        raise AssertionError("Saved OZ.1 commercial, availability or visibility data is incorrect")
    connection.close()

    entry = {
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": "putters",
        "categoryLabel": "Putters",
        "description": DESCRIPTION,
        "priceKes": PRICE_KES,
        "priceUsd": PRICE_USD,
        "priceCny": PRICE_CNY,
        "sizes": SIZES,
        "colors": COLORS,
        "status": "Out of Stock",
        "stock": "0",
        "featured": False,
        "images": ["/images/products/" + filename for _, filename, _ in IMAGES],
    }
    existing_index = next(
        (index for index, product in enumerate(catalog["products"]) if product["sku"] == SKU),
        None,
    )
    if existing_index is None:
        catalog["products"].append(entry)
    else:
        catalog["products"][existing_index] = entry
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Refreshed {SKU}, preserved supplier costs and copied six supplied OZ.1 images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
