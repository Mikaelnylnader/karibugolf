"""Refresh existing FootJoy RainGrip locally; read-only unless --apply.

This is deliberately local-only. It preserves every commercial value on the
existing GK-GL007 record, backs up the database and generated catalogue, and
copies the owner's five screenshots byte-for-byte. Google Sheets is updated
only after the owner separately approves publishing.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-GL007"
NAME = "FootJoy RainGrip Pair Golf Gloves"
SOURCE_URL = "https://www.footjoy.eu/en/men/gloves/raingrip-pair/024PAI.html?dwvar_024PAI_color=66083E"
DESCRIPTION = (
    "FootJoy RainGrip Pair golf gloves in Black for wet-weather play. The "
    "water-absorbent Sure-Grip Autosuede knit palms are designed to conform to "
    "the hands and club in rain, while Quick-Dry material supports breathability, "
    "flexibility and comfort. Sold as a pair. Manufacturer size options are a "
    "reference only; exact Karibu availability must be confirmed. Currently out of stock."
)
SIZES = "S, M, ML, L, XL, XXL (manufacturer reference)"
COLORS = "Black"
IMAGES = [
    ("Skärmbild 2026-10-04 172252.png", "footjoy-raingrip-pair-set.png"),
    ("Skärmbild 2026-10-04 172313.png", "footjoy-raingrip-pair-packaging.png"),
    ("Skärmbild 2026-10-04 172323.png", "footjoy-raingrip-pair-grip.png"),
    ("Skärmbild 2026-10-04 172330.png", "footjoy-raingrip-pair-palm-left.png"),
    ("Skärmbild 2026-10-04 172340.png", "footjoy-raingrip-pair-palm-right.png"),
]
COMMERCIAL_FIELDS = ["price_kes", "price_cny", "price_usd", "cost_cny", "cost_kes"]


def main(apply: bool, source: Path) -> None:
    for original, _ in IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)

    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    rows = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchall()
    if len(rows) != 1 or rows[0]["category_slug"] != "gloves":
        raise RuntimeError(f"Expected one existing {SKU} record in gloves")
    before = dict(rows[0])
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))

    plan = {
        "sku": SKU,
        "name": NAME,
        "duplicate_prevented": True,
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "price_kes_preserved": before["price_kes"],
        "cost_cny_preserved": before["cost_cny"],
        "cost_kes_preserved": before["cost_kes"],
        "images": IMAGES,
        "google_sheet_write": False,
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "footjoy-raingrip-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    for original, filename in IMAGES:
        for folder in (ROOT / "images/products", ROOT / "public/images/products"):
            folder.mkdir(parents=True, exist_ok=True)
            target = folder / filename
            if target.exists():
                shutil.copy2(target, backup / f"{folder.parent.name}-{filename}")
            shutil.copy2(source / original, target)

    extra_attrs = {
        **json.loads(before.get("extra_attrs") or "{}"),
        "brand": "FootJoy",
        "source": SOURCE_URL,
        "style": "66083E",
        "pack": "Pair of gloves",
        "material": "Sure-Grip Autosuede knit palm / Quick-Dry back",
        "colors": COLORS,
    }
    connection.execute(
        """UPDATE products SET name=?, description=?, sizes=?, colors=?,
        status='Out of Stock', stock='0', website_visible=1, image=?, image_filename=?,
        gallery=?, extra_attrs=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?""",
        (
            NAME,
            DESCRIPTION,
            SIZES,
            COLORS,
            "/images/products/" + IMAGES[0][1],
            IMAGES[0][1],
            json.dumps([filename for _, filename in IMAGES[1:]]),
            json.dumps(extra_attrs),
            SKU,
        ),
    )
    connection.commit()
    after = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    for field in COMMERCIAL_FIELDS:
        if after[field] != before[field]:
            raise AssertionError(f"Unexpected commercial value change: {field}")

    listing = {
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": "gloves",
        "categoryLabel": "Gloves",
        "description": DESCRIPTION,
        "priceKes": after["price_kes"],
        "priceUsd": after["price_usd"],
        "priceCny": after["price_cny"],
        "sizes": SIZES,
        "colors": COLORS,
        "status": "Out of Stock",
        "stock": "0",
        "featured": False,
        "images": ["/images/products/" + filename for _, filename in IMAGES],
    }
    existing = next((product for product in catalog["products"] if product["sku"] == SKU), None)
    if existing:
        existing.update(listing)
    else:
        catalog["products"].append(listing)
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Local backend and storefront updated. Google Sheet unchanged. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("C:/Users/mikae/Pictures/Screenshots"),
    )
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
