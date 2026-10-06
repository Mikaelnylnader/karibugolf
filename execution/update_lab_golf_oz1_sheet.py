"""Refresh the existing OZ.1 Sheet row while preserving its supplier cost."""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from sheet_sync import get_sheet  # noqa: E402
from update_lab_golf_oz1_listing import (  # noqa: E402
    COLORS, COST_CNY, COST_KES, DESCRIPTION, MARGIN, NAME, PRICE_CNY,
    PRICE_KES, PRICE_USD, SIZES, SKU,
)


IMAGE = "https://karibugolf.com/images/products/lab-golf-oz1-custom-putter-black-address.png"


def amount(value: object) -> int:
    digits = re.sub(r"[^0-9.-]", "", str(value or ""))
    return round(float(digits)) if digits else 0


def cell_value(value):
    if isinstance(value, bool):
        return {"boolValue": value}
    if isinstance(value, (int, float)):
        return {"numberValue": value}
    return {"stringValue": str(value)}


def main(apply: bool) -> None:
    sheet = get_sheet()
    metadata = sheet.spreadsheet.fetch_sheet_metadata(params={"includeGridData": "false"})
    matches = [
        item for item in metadata["sheets"]
        if item["properties"]["title"] == sheet.title
        and item["properties"]["sheetId"] == sheet.id
    ]
    if len(matches) != 1:
        raise RuntimeError("Could not resolve the configured catalogue sheet by title and sheetId")
    headers = sheet.row_values(1)
    sku_values = sheet.col_values(headers.index("SKU") + 1)
    if sku_values.count(SKU) != 1:
        raise RuntimeError(f"Expected exactly one {SKU} Sheet row")
    target_row = sku_values.index(SKU) + 1
    before = sheet.row_values(target_row, value_render_option="UNFORMATTED_VALUE")
    before += [""] * (len(headers) - len(before))
    if amount(before[headers.index("Cost China (Ksh)")]) != COST_KES:
        raise RuntimeError(f"Unexpected {SKU} KSh supplier cost")
    if amount(before[headers.index("Cost China (CNY)")]) != COST_CNY:
        raise RuntimeError(f"Unexpected {SKU} CNY supplier cost")

    overrides = {
        "Image": IMAGE,
        "Name": NAME,
        "Category": "Putters",
        "Description": DESCRIPTION,
        "Sizes": SIZES,
        "Colors": COLORS,
        "Margin": MARGIN,
        "Selling Price (CNY)": f"¥{PRICE_CNY:,}",
        "Price Kenya (Ksh)": f"Ksh{PRICE_KES:,}",
        "Profit CNY": f"¥{PRICE_CNY - COST_CNY:,}",
        "Profit Ksh": f"Ksh{PRICE_KES - COST_KES:,}",
        "Status": "Out of Stock",
        "Stock": 0,
        "Profit (CNY)": f"¥{PRICE_CNY - COST_CNY:,}",
        "Website Visible": True,
        "Selling Price (USD)": PRICE_USD,
    }
    missing = [header for header in overrides if header not in headers]
    if missing:
        raise RuntimeError(f"Missing Sheet headers: {missing}")

    print(json.dumps({
        "sheet": sheet.title,
        "sheet_id": sheet.id,
        "target_row": target_row,
        "sku": SKU,
        "supplier_cost_kes_preserved": before[headers.index("Cost China (Ksh)")],
        "supplier_cost_cny_preserved": before[headers.index("Cost China (CNY)")],
        "old_price_kes": before[headers.index("Price Kenya (Ksh)")],
        "new_price_kes": overrides["Price Kenya (Ksh)"],
        "margin": MARGIN,
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "apply": apply,
    }, indent=2, ensure_ascii=False))
    if not apply:
        return

    backup = ROOT / ".tmp/backups" / (
        "lab-golf-oz1-sheet-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    (backup / "row-before.json").write_text(json.dumps({
        "headers": headers,
        "target_row": target_row,
        "unformatted": before,
        "formulas": sheet.row_values(target_row, value_render_option="FORMULA"),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    requests = []
    for header, value in overrides.items():
        column = headers.index(header)
        requests.append({"updateCells": {
            "range": {
                "sheetId": sheet.id,
                "startRowIndex": target_row - 1,
                "endRowIndex": target_row,
                "startColumnIndex": column,
                "endColumnIndex": column + 1,
            },
            "rows": [{"values": [{"userEnteredValue": cell_value(value)}]}],
            "fields": "userEnteredValue",
        }})
    requests.extend([
        {"updateCells": {
            "range": {
                "sheetId": sheet.id,
                "startRowIndex": target_row - 1,
                "endRowIndex": target_row,
                "startColumnIndex": headers.index("Image"),
                "endColumnIndex": headers.index("Image") + 1,
            },
            "rows": [{"values": [{"userEnteredFormat": {"textFormat": {"link": {"uri": IMAGE}}}}]}],
            "fields": "userEnteredFormat.textFormat.link",
        }},
        {"updateCells": {
            "range": {
                "sheetId": sheet.id,
                "startRowIndex": target_row - 1,
                "endRowIndex": target_row,
                "startColumnIndex": headers.index("Stock"),
                "endColumnIndex": headers.index("Stock") + 1,
            },
            "rows": [{"values": [{"userEnteredFormat": {"numberFormat": {"type": "NUMBER", "pattern": "0"}}}]}],
            "fields": "userEnteredFormat.numberFormat",
        }},
    ])
    sheet.spreadsheet.batch_update({"requests": requests})

    actual = sheet.row_values(target_row, value_render_option="UNFORMATTED_VALUE")
    actual += [""] * (len(headers) - len(actual))
    if amount(actual[headers.index("Cost China (Ksh)")]) != COST_KES or amount(actual[headers.index("Cost China (CNY)")]) != COST_CNY:
        raise AssertionError("Supplier cost changed unexpectedly")
    expected = before[:]
    for header, value in overrides.items():
        expected[headers.index(header)] = value
    mismatches = {
        header: {"expected": expected[index], "actual": actual[index]}
        for index, header in enumerate(headers)
        if actual[index] != expected[index]
    }
    if mismatches:
        raise AssertionError(json.dumps(mismatches, ensure_ascii=False, indent=2))
    print(f"Updated {SKU} in {sheet.title}!A{target_row}:V{target_row}. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    arguments = parser.parse_args()
    main(arguments.apply)
