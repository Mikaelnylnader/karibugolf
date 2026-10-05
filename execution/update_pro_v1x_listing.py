"""Refresh the existing Pro V1x locally; Sheets is updated with targeted connector cells.

Read-only by default. Preserve prices and all unrelated catalogue records.
"""
import argparse
import json
import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKU = "GK-BL011"
DESCRIPTION = (
    "Titleist Pro V1x golf balls with high flight, low long-game spin and "
    "higher iron and wedge spin than Pro V1. Firmer feel and a cast urethane "
    "cover. White, dozen pack. Currently out of stock; ask Karibu Golf about future availability."
)
IMAGES = [
    ("Prov2x.png", "titleist-pro-v1x-box.png"),
    ("Prov1x2.png", "titleist-pro-v1x-ball.png"),
    ("prov1x 1.png", "titleist-pro-v1x-angle.png"),
    ("Prov1x4.png", "titleist-pro-v1x-alignment.png"),
    ("prov1x 3.png", "titleist-pro-v1x-sleeve.png"),
]


def prepare(apply, source, *, sku=SKU, name="Titleist Pro V1x Golf Balls",
            category="balls", label="Balls", description=DESCRIPTION,
            sizes="Dozen (12 balls)", colors="White", images=IMAGES,
            backup_prefix="pro-v1x"):
    """Reusable, targeted existing-listing refresh; default retains the Pro V1x CLI."""
    for original, _ in images:
        if not (source / original).is_file():
            raise FileNotFoundError(source / original)
    connection = sqlite3.connect(ROOT / "backend/golf_kenya.db")
    connection.row_factory = sqlite3.Row
    rows = connection.execute("SELECT * FROM products WHERE sku=?", (sku,)).fetchall()
    if len(rows) != 1 or rows[0]["category_slug"] != category:
        raise RuntimeError(f"Expected one existing {sku} record in {category}")
    before = dict(rows[0])
    catalog_path = ROOT / "lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    print(json.dumps({"sku": sku, "name": name, "status": "Out of Stock",
                      "stock": 0, "visible": True, "price_kes_preserved": before["price_kes"],
                      "images": images, "apply": apply}, indent=2))
    if not apply:
        connection.close()
        return
    backup = ROOT / ".tmp/backups" / (backup_prefix + "-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")
    # Preserve the live Sheet row before connector edits, including formulas.
    sys.path.insert(0, str(ROOT / "backend"))
    from sheet_sync import get_sheet
    sheet = get_sheet()
    headers = sheet.row_values(1)
    matches = [i + 1 for i, value in enumerate(sheet.col_values(headers.index("SKU") + 1)) if value == sku]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one existing {sku} Sheet row")
    sheet_row = sheet.row_values(matches[0], value_render_option="FORMULA")
    (backup / "sheet-row-before.json").write_text(
        json.dumps({"headers": headers, "row": matches[0], "values": sheet_row}, indent=2), encoding="utf-8")
    for original, filename in images:
        for folder in [ROOT / "images/products", ROOT / "public/images/products"]:
            folder.mkdir(parents=True, exist_ok=True)
            target = folder / filename
            if target.exists():
                shutil.copy2(target, backup / (folder.parent.parent.name + "-" + filename))
            shutil.copy2(source / original, target)
    connection.execute(
        """UPDATE products SET name=?, description=?, sizes=?, colors=?,
        status='Out of Stock', stock='0', website_visible=1, image=?, image_filename=?,
        gallery=?, extra_attrs=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?""",
        (name, description, sizes, colors, "/images/products/" + images[0][1], images[0][1],
         json.dumps([filename for _, filename in images[1:]]),
         json.dumps({**json.loads(before.get("extra_attrs") or "{}"),
                     **({"qty": "Dozen (12)"} if category == "balls" else {}), "colors": colors}), sku))
    connection.commit()
    after = dict(connection.execute("SELECT * FROM products WHERE sku=?", (sku,)).fetchone())
    connection.close()
    for field in ["price_kes", "price_cny", "price_usd", "cost_cny", "cost_kes"]:
        if after[field] != before[field]:
            raise AssertionError(f"Unexpected price change: {field}")
    listing = {
        "sku": sku, "slug": sku.lower(), "name": after["name"], "categorySlug": category,
        "categoryLabel": label, "description": description, "priceKes": after["price_kes"],
        "priceUsd": after["price_usd"], "priceCny": after["price_cny"], "sizes": after["sizes"],
        "colors": colors, "status": "Out of Stock", "stock": "0", "featured": False,
        "images": ["/images/products/" + filename for _, filename in images],
    }
    existing = next((p for p in catalog["products"] if p["sku"] == sku), None)
    if existing:
        existing.update(listing)
    else:
        catalog["products"].append(listing)
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Local backend and storefront verified. Sheet write is separate. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    args = parser.parse_args()
    prepare(args.apply, args.source)
