"""Add the women's FootJoy WeatherSof listing; read-only unless --apply is supplied.

The new item deliberately clones commercial values from the existing men's
WeatherSof row. Product text, imagery and availability are then set explicitly.
The Google Sheet is updated separately by
``upsert_footjoy_womens_weathersof_sheet.py`` so each mutation is auditable.
"""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-GL011"
BASE_SKU = "GK-GL009"
NAME = "FootJoy WeatherSof Women's Golf Glove"
DESCRIPTION = (
    "FootJoy WeatherSof Women's Golf Glove with FiberSof MicroTac, PowerNet mesh "
    "and an adjustable ComforTab closure. Reference colours shown: White / Black, "
    "Black, Navy, White / Pink and White / Turquoise. Currently out of stock; "
    "confirm colour, size and glove hand when stock returns."
)
SIZES = "S, M, ML, L; Regular Left, Regular Right (manufacturer reference)"
COLORS = "White / Black, Black, Navy, White / Pink, White / Turquoise"
IMAGES = [
    ("weahtersoft woman 1.png", "footjoy-weathersof-women-white-black-set.png"),
    ("weahtersoft woman 2.png", "footjoy-weathersof-women-white-black-back.png"),
    ("weahtersoft woman 3.png", "footjoy-weathersof-women-white-black-packaging.png"),
    ("weahtersoft woman 4.png", "footjoy-weathersof-women-white-black-palm.png"),
    ("weahtersoft woman black1.png", "footjoy-weathersof-women-black-set.png"),
    ("weahtersoft woman black2.png", "footjoy-weathersof-women-black-back.png"),
    ("weahtersoft woman black3.png", "footjoy-weathersof-women-black-packaging.png"),
    ("weahtersoft woman blue1.png", "footjoy-weathersof-women-navy-set.png"),
    ("weahtersoft woman blue2.png", "footjoy-weathersof-women-navy-back.png"),
    ("weahtersoft woman blue3.png", "footjoy-weathersof-women-navy-packaging.png"),
    ("weahtersoft woman pink.png", "footjoy-weathersof-women-pink-set.png"),
    ("weahtersoft woman pink1.png", "footjoy-weathersof-women-pink-back.png"),
    ("weahtersoft woman pink3.png", "footjoy-weathersof-women-pink-packaging.png"),
    ("weahtersoft woman turk.png", "footjoy-weathersof-women-turquoise-set.png"),
    ("weahtersoft woman turk1.png", "footjoy-weathersof-women-turquoise-back.png"),
    ("weahtersoft woman turk2.png", "footjoy-weathersof-women-turquoise-packaging.png"),
]


def main(apply: bool, source: Path) -> None:
    for original, _ in IMAGES:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)

    db_path = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    matches = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchall()
    if matches:
        raise RuntimeError(f"{SKU} already exists; this script only performs the initial add")
    bases = connection.execute("SELECT * FROM products WHERE sku=?", (BASE_SKU,)).fetchall()
    if len(bases) != 1 or bases[0]["category_slug"] != "gloves":
        raise RuntimeError(f"Expected exactly one {BASE_SKU} glove to supply commercial values")
    base = dict(bases[0])
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(product["sku"] == SKU for product in catalog["products"]):
        raise RuntimeError(f"{SKU} already exists in generated catalogue")

    plan = {
        "sku": SKU,
        "name": NAME,
        "price_kes_from": BASE_SKU,
        "price_kes": base["price_kes"],
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "colour_options": COLORS.split(", "),
        "images": len(IMAGES),
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "footjoy-weathersof-women-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
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
        ) VALUES (?, ?, 'gloves', ?, ?, ?, ?, ?, ?, 'Out of Stock', '0', ?, ?,
        0, 0, ?, ?, '[]', ?, ?, 1)""",
        (
            SKU, NAME, DESCRIPTION, base["price_kes"], base["cost_cny"], base["cost_kes"],
            SIZES, COLORS, "/images/products/" + IMAGES[0][1], IMAGES[0][1],
            json.dumps({"colors": COLORS, "player": "Women"}),
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
        "categorySlug": "gloves",
        "categoryLabel": "Gloves",
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
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added local listing and copied supplied images. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    arguments = parser.parse_args()
    main(arguments.apply, arguments.source)
