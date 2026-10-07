"""Refresh the existing Callaway Paradym Ai Smoke HL listing locally.

Read-only unless --apply. The tool updates only reference copy and the supplied
gallery. Prices, costs, stock, status, visibility, featured state and display
order are preserved independently in both SQLite and the generated catalogue.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-IR004"
NAME = "Callaway Paradym Ai Smoke HL Irons"
SOURCE_URL = "https://www.callawaygolf.com/golf-clubs/irons/irons-2024-paradym-ai-smoke-hl.html"
DESCRIPTION = (
    "Callaway Paradym Ai Smoke HL high-launch game-improvement irons for golfers "
    "with moderate-to-average swing speeds. The deep cavity-back design, Ai Smart "
    "Face and Dynamic Sole Design are built to increase launch, carry distance and "
    "forgiveness. Karibu set configuration: 4–PW + AW; confirm the fitted shaft, "
    "flex, hand and physical condition before ordering."
)
SIZES = "4–PW + AW"
COLORS = "Chrome / Smoke"
IMAGES = [
    ("irons-2024-paradym-ai-smoke-hl___1.jpg", "callaway-paradym-ai-smoke-hl-cavity.jpg"),
    ("irons-2024-paradym-ai-smoke-hl___3.jpg", "callaway-paradym-ai-smoke-hl-face.jpg"),
    ("irons-2024-paradym-ai-smoke-hl___2.jpg", "callaway-paradym-ai-smoke-hl-address.jpg"),
    ("irons-2024-paradym-ai-smoke-hl___4.jpg", "callaway-paradym-ai-smoke-hl-sole.jpg"),
]
DB_PROTECTED = [
    "price_kes",
    "price_cny",
    "price_usd",
    "cost_cny",
    "cost_kes",
    "status",
    "stock",
    "website_visible",
    "featured",
    "display_order",
]
CATALOG_PROTECTED = [
    "priceKes",
    "priceCny",
    "priceUsd",
    "status",
    "stock",
    "featured",
]


def main(apply: bool, source: Path) -> None:
    for original, _ in IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)

    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    rows = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchall()
    if len(rows) != 1 or rows[0]["category_slug"] != "golf_irons":
        raise RuntimeError(f"Expected one existing {SKU} record in golf_irons")
    database_before = dict(rows[0])

    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog_matches = [product for product in catalog["products"] if product["sku"] == SKU]
    if len(catalog_matches) != 1:
        raise RuntimeError(f"Expected one existing {SKU} generated catalogue record")
    catalog_before = dict(catalog_matches[0])

    print(
        json.dumps(
            {
                "sku": SKU,
                "name": NAME,
                "database_commercial_state_preserved": {
                    field: database_before[field] for field in DB_PROTECTED
                },
                "storefront_commercial_state_preserved": {
                    field: catalog_before[field] for field in CATALOG_PROTECTED
                },
                "images": IMAGES,
                "google_sheet_write": False,
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
        "callaway-ai-smoke-hl-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
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
        **json.loads(database_before.get("extra_attrs") or "{}"),
        "brand": "Callaway",
        "model": "Paradym Ai Smoke HL",
        "source": SOURCE_URL,
        "set": SIZES,
        "playerType": "High-launch game-improvement",
        "colors": COLORS,
    }
    connection.execute(
        """UPDATE products SET name=?, description=?, sizes=?, colors=?,
        image=?, image_filename=?, gallery=?, extra_attrs=?,
        updated_at=CURRENT_TIMESTAMP WHERE sku=?""",
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
    database_after = dict(
        connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone()
    )
    connection.close()

    for field in DB_PROTECTED:
        if database_after[field] != database_before[field]:
            raise AssertionError(f"Unexpected database commercial change: {field}")

    catalog_update = {
        "name": NAME,
        "description": DESCRIPTION,
        "sizes": SIZES,
        "colors": COLORS,
        "images": ["/images/products/" + filename for _, filename in IMAGES],
    }
    catalog_matches[0].update(catalog_update)
    for field in CATALOG_PROTECTED:
        if catalog_matches[0][field] != catalog_before[field]:
            raise AssertionError(f"Unexpected storefront commercial change: {field}")

    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Local database and storefront updated. Google Sheet unchanged. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--source", type=Path, default=Path("C:/Users/mikae/Downloads")
    )
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
