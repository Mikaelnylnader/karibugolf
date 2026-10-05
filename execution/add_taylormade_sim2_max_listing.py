"""Add TaylorMade SIM2 Max irons; read-only unless --apply is supplied.

The item is a separate generation from the existing SIM Max record. Commercial
values are cloned from that nearest catalogue baseline, while imagery,
description, reference configuration and availability are set explicitly.
"""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-IR005"
BASE_SKU = "GK-IR-TMSM"
NAME = "TaylorMade SIM2 Max Irons"
DESCRIPTION = (
    "TaylorMade SIM2 Max game-improvement irons with Cap Back construction, "
    "a Thru-Slot Speed Pocket, Progressive Inverted Cone Technology and an "
    "ECHO Damping System. The 5–PW + AW set, hand, shaft and flex choices are "
    "manufacturer references; exact Karibu availability must be confirmed. "
    "Currently out of stock."
)
SIZES = "5–PW + AW (manufacturer set reference)"
COLORS = "Chrome / Black"
IMAGES = [
    ("TA164_zoom_D.jpg", "taylormade-sim2-max-irons-cavity.jpg"),
    ("TA164_zoom_D2.jpg", "taylormade-sim2-max-irons-address.jpg"),
    ("TA164_zoom_D3.jpg", "taylormade-sim2-max-irons-face.jpg"),
    ("TA164_zoom_D4.jpg", "taylormade-sim2-max-irons-sole.jpg"),
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
    bases = connection.execute("SELECT * FROM products WHERE sku=?", (BASE_SKU,)).fetchall()
    if len(bases) != 1 or bases[0]["category_slug"] != "golf_irons":
        raise RuntimeError(f"Expected one {BASE_SKU} iron set to supply commercial values")
    base = dict(bases[0])
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(product["sku"] == SKU for product in catalog["products"]):
        raise RuntimeError(f"{SKU} already exists in the generated catalogue")

    print(json.dumps({
        "sku": SKU,
        "name": NAME,
        "price_kes_from": BASE_SKU,
        "price_kes": base["price_kes"],
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
        "taylormade-sim2-max-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
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
        ) VALUES (?, ?, 'golf_irons', ?, ?, ?, ?, ?, ?, 'Out of Stock', '0', ?, ?,
        0, 0, ?, ?, '[]', ?, ?, 1)""",
        (
            SKU, NAME, DESCRIPTION, base["price_kes"], base["cost_cny"], base["cost_kes"],
            SIZES, COLORS, "/images/products/" + IMAGES[0][1], IMAGES[0][1],
            json.dumps({"set": "5–PW + AW", "category": "game-improvement irons"}),
            json.dumps([filename for _, filename in IMAGES[1:]]),
            base["price_usd"], base["price_cny"],
        ),
    )
    connection.commit()
    saved = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    for field in ("price_kes", "price_cny", "price_usd", "cost_cny", "cost_kes"):
        if saved[field] != base[field]:
            raise AssertionError(f"Commercial value was not cloned correctly: {field}")

    catalog["products"].append({
        "sku": SKU,
        "slug": SKU.lower(),
        "name": NAME,
        "categorySlug": "golf_irons",
        "categoryLabel": "Golf Irons",
        "description": DESCRIPTION,
        "priceKes": saved["price_kes"],
        "priceUsd": saved["price_usd"],
        "priceCny": saved["price_cny"],
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
    print(f"Added local listing and copied supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--source", type=Path, default=Path("C:/Users/mikae/Downloads")
    )
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
