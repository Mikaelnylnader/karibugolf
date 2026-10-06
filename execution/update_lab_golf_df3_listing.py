"""Refresh the existing L.A.B. Golf DF3 listing; read-only unless --apply.

The existing supplier cost is preserved. Karibu's standing 62% gross-margin
rule is applied to that cost, and the product remains visible but out of stock
until an exact custom build is confirmed.
"""

import argparse
import json
import re
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-PT034"
NAME = "L.A.B. Golf DF3 Custom Putter"
MARGIN = 0.62
USD_TO_KES = 129.5
CNY_TO_KES = 21.24
COST_KES = 12_744
COST_CNY = 600
PRICE_KES = round(COST_KES / (1 - MARGIN))
PRICE_CNY = round(PRICE_KES / CNY_TO_KES)
PRICE_USD = round(PRICE_KES / USD_TO_KES, 2)
DESCRIPTION = (
    "L.A.B. Golf DF3 custom mallet putter with Lie Angle Balance and a fully "
    "CNC-milled 6061-aluminum head. This is the no-insert DF3, offered here as "
    "a custom-fit reference in Black, Blue and Pink. Hand, putting style, head "
    "weight, length, lie angle, shaft, alignment and grip are not current Karibu "
    "inventory. Currently out of stock; the exact build must be confirmed."
)
SIZES = (
    "28–38 in (standard); 36–40 in (counterbalanced); "
    "38–46 in (ArmLock); 40–50 in (sweeper)"
)
COLORS = "Black; Blue; Pink"
IMAGES = [
    ("DF31.png", "lab-golf-df3-custom-putter-black-address.png", "Black"),
    ("DF3 1.png", "lab-golf-df3-custom-putter-black-front.png", "Black"),
    ("DF3 2.png", "lab-golf-df3-custom-putter-black-rear.png", "Black"),
    ("DF3i 5.png", "lab-golf-df3-custom-putter-black-profile.png", "Black"),
    ("DF3 blue.png", "lab-golf-df3-custom-putter-blue-address.png", "Blue"),
    ("DF3 blue 4.png", "lab-golf-df3-custom-putter-blue-front.png", "Blue"),
    ("DF3 blue 3.png", "lab-golf-df3-custom-putter-blue-sole.png", "Blue"),
    ("DF3 blue 1.png", "lab-golf-df3-custom-putter-blue-rear.png", "Blue"),
    ("DF3 pink 1.png", "lab-golf-df3-custom-putter-pink-address.png", "Pink"),
    ("DF3 pink 4.png", "lab-golf-df3-custom-putter-pink-front.png", "Pink"),
    ("DF3 pink 3.png", "lab-golf-df3-custom-putter-pink-sole.png", "Pink"),
    ("DF3 pink 2.png", "lab-golf-df3-custom-putter-pink-rear.png", "Pink"),
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
        (product for product in catalog["products"] if product["sku"] != SKU and product["name"].lower() == NAME.lower()),
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
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "lab-golf-df3-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
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
        "supplier_cost_basis": "Existing GK-PT034 catalogue cost",
        "source": "https://labgolf.com/products/df3-custom",
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
        raise AssertionError("Saved DF3 commercial, availability or visibility data is incorrect")
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
    existing_index = next((index for index, product in enumerate(catalog["products"]) if product["sku"] == SKU), None)
    if existing_index is None:
        catalog["products"].append(entry)
    else:
        catalog["products"][existing_index] = entry
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Refreshed {SKU}, preserved supplier costs and copied 12 unique supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
