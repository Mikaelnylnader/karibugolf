"""Refresh the existing Pro V1 listing without changing prices or other stock.

Defaults to a read-only plan. --apply copies the owner's images, backs up the
database and affected Sheet row, then updates only this product's listing fields.
No legacy website generator or automatic deployment is invoked.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from sheet_sync import get_sheet  # noqa: E402

SKU = "GK-BL012"
DESCRIPTION = (
    "Titleist Pro V1 golf balls with a mid-flight profile, low long-game spin "
    "and soft feel. Cast urethane cover for greenside control. White, dozen "
    "pack. Currently out of stock; ask Karibu Golf about future availability."
)
IMAGES = [
    ("Prov1.png", "titleist-pro-v1-box.png"),
    ("Prov1 2.png", "titleist-pro-v1-ball.png"),
    ("prov1 1.png", "titleist-pro-v1-alignment.png"),
    ("prov1 3.png", "titleist-pro-v1-sleeve.png"),
]
FIELDS = {
    "Name": "Titleist Pro V1 Golf Balls", "Category": "balls",
    "Description": DESCRIPTION, "Sizes": "Dozen (12 balls)", "Colors": "White",
    "Status": "Out of Stock", "Stock": "0", "Website Visible": "TRUE",
    "Image": "/images/products/titleist-pro-v1-box.png",
}


def prepare(apply: bool, source: Path) -> None:
    from gspread.utils import rowcol_to_a1

    for filename, _ in IMAGES:
        if not (source / filename).is_file():
            raise FileNotFoundError(source / filename)
    connection = sqlite3.connect(ROOT / "backend/golf_kenya.db")
    connection.row_factory = sqlite3.Row
    matches = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchall()
    if len(matches) != 1 or matches[0]["category_slug"] != "balls":
        raise RuntimeError("Expected one existing Pro V1 golf-ball record")
    before = dict(matches[0])
    sheet = get_sheet()
    headers = sheet.row_values(1)
    if any(label not in headers for label in FIELDS):
        raise RuntimeError("Required listing columns are missing; no changes made")
    sku_column = sheet.col_values(headers.index("SKU") + 1)
    rows = [index + 1 for index, value in enumerate(sku_column) if value == SKU]
    if len(rows) != 1:
        raise RuntimeError("Expected one existing Pro V1 row in Google Sheets")
    row_number = rows[0]
    before_row = sheet.row_values(row_number)
    print(json.dumps({"sku": SKU, "row": row_number, "status": "Out of Stock",
                      "stock": 0, "visible": True, "images": [name for _, name in IMAGES],
                      "prices": "Preserve existing local and Sheet prices",
                      "apply": apply}, indent=2))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / ("pro-v1-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    (backup / "sheet-row-before.json").write_text(
        json.dumps({"headers": headers, "row": row_number, "values": before_row}, indent=2), encoding="utf-8"
    )
    for original, filename in IMAGES:
        for destination in [ROOT / "images/products", ROOT / "public/images/products"]:
            destination.mkdir(parents=True, exist_ok=True)
            target = destination / filename
            if target.exists():
                shutil.copy2(target, backup / (destination.parent.parent.name + "-" + filename))
            shutil.copy2(source / original, target)

    updates = [{"range": rowcol_to_a1(row_number, headers.index(label) + 1), "values": [[value]]}
               for label, value in FIELDS.items()]
    sheet.batch_update(updates, value_input_option="RAW")
    # Targeted updates leave all prices, costs and unrelated records untouched.
    connection.execute(
        """UPDATE products SET name=?, description=?, sizes=?, colors=?, status='Out of Stock',
        stock='0', website_visible=1, image=?, image_filename=?, gallery=?,
        extra_attrs=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?""",
        (FIELDS["Name"], DESCRIPTION, FIELDS["Sizes"], FIELDS["Colors"], FIELDS["Image"],
         IMAGES[0][1], json.dumps([name for _, name in IMAGES[1:]]),
         json.dumps({**json.loads(before.get("extra_attrs") or "{}"), "qty": "Dozen (12)", "colors": "White"}), SKU),
    )
    connection.commit()
    after = dict(connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone())
    connection.close()
    for price in ["price_kes", "price_cny", "price_usd", "cost_cny", "cost_kes"]:
        if after[price] != before[price]:
            raise AssertionError(f"Unexpected price change: {price}")
    final_row = sheet.row_values(row_number)
    for label, value in FIELDS.items():
        if final_row[headers.index(label)] != value:
            raise AssertionError(f"Sheet verification failed: {label}")
    for index, label in enumerate(headers):
        if label not in FIELDS and (final_row[index] if index < len(final_row) else "") != (before_row[index] if index < len(before_row) else ""):
            raise AssertionError(f"Unrelated Sheet field changed: {label}")
    print(f"Verified {SKU}: out of stock, four photos, unchanged prices. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    args = parser.parse_args()
    prepare(args.apply, args.source)
