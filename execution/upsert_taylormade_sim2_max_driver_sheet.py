"""Add the SIM2 Max Driver Sheet row with the owner's 62% gross margin."""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from sheet_sync import get_sheet  # noqa: E402
from add_taylormade_sim2_max_driver_listing import (  # noqa: E402
    COLORS, COST_CNY, COST_KES, DESCRIPTION, MARGIN, NAME, PRICE_CNY,
    PRICE_KES, PRICE_USD, SIZES, SKU,
)


SOURCE_SKU = "GK-IR005"
IMAGE = "https://karibugolf.com/images/products/taylormade-sim2-max-driver-sole.jpg"


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
    if SKU in sku_values:
        raise RuntimeError(f"{SKU} already exists in Sheet")
    if sku_values.count(SOURCE_SKU) != 1:
        raise RuntimeError(f"Expected exactly one {SOURCE_SKU} Sheet row")
    source_row = sku_values.index(SOURCE_SKU) + 1
    target_row = len(sku_values) + 1
    if target_row > sheet.row_count:
        raise RuntimeError("Target row is outside the current Sheet grid")
    if sheet.row_values(target_row):
        raise RuntimeError(f"Target row {target_row} is not blank")

    source_before = sheet.row_values(source_row, value_render_option="UNFORMATTED_VALUE")
    source = source_before + [""] * (len(headers) - len(source_before))
    values = source[:len(headers)]
    overrides = {
        "Image": IMAGE,
        "SKU": SKU,
        "Name": NAME,
        "Category": "Drivers",
        "Description": DESCRIPTION,
        "Sizes": SIZES,
        "Colors": COLORS,
        "Cost China (CNY)": f"¥{COST_CNY:,}",
        "Cost China (Ksh)": f"Ksh{COST_KES:,}",
        "Margin": MARGIN,
        "Selling Price (CNY)": f"¥{PRICE_CNY:,}",
        "Price Kenya (Ksh)": f"Ksh{PRICE_KES:,}",
        "Profit CNY": f"¥{PRICE_CNY - COST_CNY:,}",
        "Profit Ksh": f"Ksh{PRICE_KES - COST_KES:,}",
        "Status": "Out of Stock",
        "Stock": 0,
        "Date Added": "2026-10-05",
        "Profit (CNY)": f"¥{PRICE_CNY - COST_CNY:,}",
        "Website Visible": True,
        "Selling Price (USD)": PRICE_USD,
    }
    missing = [header for header in overrides if header not in headers]
    if missing:
        raise RuntimeError(f"Missing Sheet headers: {missing}")
    for header, value in overrides.items():
        values[headers.index(header)] = value

    print(json.dumps({
        "sheet": sheet.title,
        "sheet_id": sheet.id,
        "source_row": source_row,
        "target_row": target_row,
        "sku": SKU,
        "margin": values[headers.index("Margin")],
        "cost_kes": values[headers.index("Cost China (Ksh)")],
        "price_kes": values[headers.index("Price Kenya (Ksh)")],
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "apply": apply,
    }, indent=2, ensure_ascii=False))
    if not apply:
        return

    backup = ROOT / ".tmp/backups" / (
        "taylormade-sim2-max-driver-sheet-"
        + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    (backup / "rows-before.json").write_text(json.dumps({
        "headers": headers,
        "source_row": source_row,
        "source": sheet.row_values(source_row, value_render_option="FORMULA"),
        "target_row": target_row,
        "target": sheet.row_values(target_row, value_render_option="FORMULA"),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    requests = [
        {"copyPaste": {
            "source": {"sheetId": sheet.id, "startRowIndex": source_row - 1,
                       "endRowIndex": source_row, "startColumnIndex": 0,
                       "endColumnIndex": len(headers)},
            "destination": {"sheetId": sheet.id, "startRowIndex": target_row - 1,
                            "endRowIndex": target_row, "startColumnIndex": 0,
                            "endColumnIndex": len(headers)},
            "pasteType": "PASTE_NORMAL",
        }},
        {"updateCells": {
            "range": {"sheetId": sheet.id, "startRowIndex": target_row - 1,
                      "endRowIndex": target_row, "startColumnIndex": 0,
                      "endColumnIndex": len(headers)},
            "rows": [{"values": [{"userEnteredValue": cell_value(value)} for value in values]}],
            "fields": "userEnteredValue",
        }},
        {"updateCells": {
            "range": {"sheetId": sheet.id, "startRowIndex": target_row - 1,
                      "endRowIndex": target_row, "startColumnIndex": 0,
                      "endColumnIndex": 1},
            "rows": [{"values": [{
                "userEnteredFormat": {"textFormat": {"link": {"uri": IMAGE}}}
            }]}],
            "fields": "userEnteredFormat.textFormat.link",
        }},
        {"updateCells": {
            "range": {"sheetId": sheet.id, "startRowIndex": target_row - 1,
                      "endRowIndex": target_row,
                      "startColumnIndex": headers.index("Stock"),
                      "endColumnIndex": headers.index("Stock") + 1},
            "rows": [{"values": [{
                "userEnteredFormat": {"numberFormat": {"type": "NUMBER", "pattern": "0"}}
            }]}],
            "fields": "userEnteredFormat.numberFormat",
        }},
    ]
    sheet.spreadsheet.batch_update({"requests": requests})

    actual = sheet.row_values(target_row, value_render_option="UNFORMATTED_VALUE")
    actual += [""] * (len(headers) - len(actual))
    if actual[:len(headers)] != values:
        raise AssertionError(json.dumps({"expected": values, "actual": actual}, ensure_ascii=False, indent=2))
    if sheet.row_values(source_row, value_render_option="UNFORMATTED_VALUE") != source_before:
        raise AssertionError("Source SIM2 Max irons row changed unexpectedly")
    print(f"Added {SKU} to {sheet.title}!A{target_row}:V{target_row}. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    arguments = parser.parse_args()
    main(arguments.apply)
