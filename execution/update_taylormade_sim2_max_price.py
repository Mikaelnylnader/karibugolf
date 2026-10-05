"""Correct the public KSh price for the existing SIM2 Max listing.

The command is read-only by default. ``--apply`` updates only the KSh selling
price for ``GK-IR005`` in SQLite, the generated catalogue, and its Google Sheet
row. Foreign-currency prices, costs, profit fields, availability, imagery, and
all unrelated products remain unchanged.
"""

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


SKU = "GK-IR005"
TARGET_PRICE_KES = 120_000
SHEET_PRICE = "Ksh120,000"


def load_local():
    database = ROOT / "backend/golf_kenya.db"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    rows = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchall()
    if len(rows) != 1:
        raise RuntimeError(f"Expected exactly one local {SKU} record")

    catalog_path = ROOT / "lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    products = [product for product in catalog["products"] if product.get("sku") == SKU]
    if len(products) != 1:
        raise RuntimeError(f"Expected exactly one catalogue {SKU} record")
    return database, connection, dict(rows[0]), catalog_path, catalog, products[0]


def main(apply: bool) -> None:
    database, connection, db_product, catalog_path, catalog, catalog_product = load_local()
    sheet = get_sheet()
    headers = sheet.row_values(1)
    if headers.count("SKU") != 1 or headers.count("Price Kenya (Ksh)") != 1:
        raise RuntimeError("Sheet requires unique SKU and Price Kenya (Ksh) headers")
    sku_values = sheet.col_values(headers.index("SKU") + 1)
    if sku_values.count(SKU) != 1:
        raise RuntimeError(f"Expected exactly one Sheet row for {SKU}")
    row = sku_values.index(SKU) + 1
    price_column = headers.index("Price Kenya (Ksh)") + 1
    sheet_before = sheet.row_values(row, value_render_option="FORMULA")
    sheet_before += [""] * (len(headers) - len(sheet_before))

    print(json.dumps({
        "sku": SKU,
        "sheet_row": row,
        "before": {
            "database_price_kes": db_product["price_kes"],
            "catalog_price_kes": catalog_product["priceKes"],
            "sheet_price_kes": sheet_before[price_column - 1],
        },
        "after": {
            "database_price_kes": TARGET_PRICE_KES,
            "catalog_price_kes": TARGET_PRICE_KES,
            "sheet_price_kes": SHEET_PRICE,
        },
        "preserved": "All other local, catalogue, and Sheet fields",
        "apply": apply,
    }, ensure_ascii=False, indent=2))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "taylormade-sim2-max-price-"
        + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")
    (backup / "sheet-row-before.json").write_text(json.dumps({
        "headers": headers,
        "row": row,
        "values": sheet_before,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    connection.execute(
        "UPDATE products SET price_kes=? WHERE sku=?", (TARGET_PRICE_KES, SKU)
    )
    if connection.total_changes != 1:
        raise AssertionError("SQLite price update did not affect exactly one record")
    connection.commit()

    catalog_product["priceKes"] = TARGET_PRICE_KES
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    sheet.spreadsheet.batch_update({"requests": [{
        "updateCells": {
            "range": {
                "sheetId": sheet.id,
                "startRowIndex": row - 1,
                "endRowIndex": row,
                "startColumnIndex": price_column - 1,
                "endColumnIndex": price_column,
            },
            "rows": [{"values": [{
                "userEnteredValue": {"stringValue": SHEET_PRICE}
            }]}],
            "fields": "userEnteredValue",
        }
    }]})

    saved_db = connection.execute(
        "SELECT price_kes FROM products WHERE sku=?", (SKU,)
    ).fetchone()[0]
    connection.close()
    saved_catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    saved_product = next(product for product in saved_catalog["products"] if product["sku"] == SKU)
    sheet_after = sheet.row_values(row, value_render_option="FORMULA")
    sheet_after += [""] * (len(headers) - len(sheet_after))

    expected_sheet = list(sheet_before)
    expected_sheet[price_column - 1] = SHEET_PRICE
    if saved_db != TARGET_PRICE_KES:
        raise AssertionError(f"SQLite price is {saved_db}, expected {TARGET_PRICE_KES}")
    if saved_product["priceKes"] != TARGET_PRICE_KES:
        raise AssertionError("Generated catalogue price was not saved")
    if sheet_after[:len(headers)] != expected_sheet[:len(headers)]:
        raise AssertionError(json.dumps({
            "expected_sheet_row": expected_sheet,
            "actual_sheet_row": sheet_after,
        }, ensure_ascii=False, indent=2))

    print(f"Updated {SKU} to KSh {TARGET_PRICE_KES:,}. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    arguments = parser.parse_args()
    main(arguments.apply)
