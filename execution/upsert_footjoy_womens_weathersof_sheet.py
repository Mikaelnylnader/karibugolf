"""Create the women's WeatherSof Sheet row by cloning the men's price row."""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from sheet_sync import get_sheet  # noqa: E402

SKU = "GK-GL011"
BASE_SKU = "GK-GL009"
IMAGE = "https://karibugolf.com/images/products/footjoy-weathersof-women-white-black-set.png"
NAME = "FootJoy WeatherSof Women's Golf Glove"
DESCRIPTION = (
    "FootJoy WeatherSof Women's Golf Glove with FiberSof MicroTac, PowerNet mesh "
    "and an adjustable ComforTab closure. Reference colours shown: White / Black, "
    "Black, Navy, White / Pink and White / Turquoise. Currently out of stock; "
    "confirm colour, size and glove hand when stock returns."
)
SIZES = "S, M, ML, L; Regular Left, Regular Right (manufacturer reference)"
COLORS = "White / Black, Black, Navy, White / Pink, White / Turquoise"


def cell_value(value):
    if isinstance(value, bool):
        return {"boolValue": value}
    if isinstance(value, (int, float)):
        return {"numberValue": value}
    return {"stringValue": str(value)}


def main(apply: bool) -> None:
    sheet = get_sheet()
    headers = sheet.row_values(1)
    sku_col = headers.index("SKU") + 1
    sku_values = sheet.col_values(sku_col)
    if SKU in sku_values:
        raise RuntimeError(f"{SKU} already exists in Sheet")
    if sku_values.count(BASE_SKU) != 1:
        raise RuntimeError(f"Expected exactly one {BASE_SKU} Sheet row")
    source_row = sku_values.index(BASE_SKU) + 1
    target_row = len(sku_values) + 1
    if target_row > sheet.row_count:
        raise RuntimeError("Target row is outside the current Sheet grid")
    if sheet.row_values(target_row):
        raise RuntimeError(f"Target row {target_row} is not blank")
    source_before = sheet.row_values(source_row, value_render_option="UNFORMATTED_VALUE")
    source = source_before + [""] * (len(headers) - len(source_before))
    values = source[: len(headers)]
    overrides = {
        "Image": IMAGE, "SKU": SKU, "Name": NAME, "Category": "Gloves",
        "Description": DESCRIPTION, "Sizes": SIZES, "Colors": COLORS,
        "Status": "Out of Stock", "Stock": "0", "Website Visible": "TRUE",
    }
    for header, value in overrides.items():
        values[headers.index(header)] = value
    print(json.dumps({"source_row": source_row, "target_row": target_row, "sku": SKU,
                      "price_kes": values[headers.index("Price Kenya (Ksh)")],
                      "apply": apply}, indent=2, ensure_ascii=False))
    if not apply:
        return

    backup = ROOT / ".tmp/backups" / (
        "footjoy-weathersof-women-sheet-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    (backup / "rows-before.json").write_text(json.dumps({
        "headers": headers,
        "source_row": source_row,
        "source": sheet.row_values(source_row, value_render_option="FORMULA"),
        "target_row": target_row,
        "target": sheet.row_values(target_row, value_render_option="FORMULA"),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    sheet_id = sheet.id
    requests = [
        {"copyPaste": {
            "source": {"sheetId": sheet_id, "startRowIndex": source_row - 1,
                       "endRowIndex": source_row, "startColumnIndex": 0,
                       "endColumnIndex": len(headers)},
            "destination": {"sheetId": sheet_id, "startRowIndex": target_row - 1,
                            "endRowIndex": target_row, "startColumnIndex": 0,
                            "endColumnIndex": len(headers)},
            "pasteType": "PASTE_NORMAL",
        }},
        {"updateCells": {
            "range": {"sheetId": sheet_id, "startRowIndex": target_row - 1,
                      "endRowIndex": target_row, "startColumnIndex": 0,
                      "endColumnIndex": len(headers)},
            "rows": [{"values": [{"userEnteredValue": cell_value(value)} for value in values]}],
            "fields": "userEnteredValue",
        }},
        {"updateCells": {
            "range": {"sheetId": sheet_id, "startRowIndex": target_row - 1,
                      "endRowIndex": target_row, "startColumnIndex": 0,
                      "endColumnIndex": 1},
            "rows": [{"values": [{
                "userEnteredFormat": {"textFormat": {"link": {"uri": IMAGE}}}
            }]}],
            "fields": "userEnteredFormat.textFormat.link",
        }},
    ]
    sheet.spreadsheet.batch_update({"requests": requests})
    actual = sheet.row_values(target_row, value_render_option="UNFORMATTED_VALUE")
    actual += [""] * (len(headers) - len(actual))
    if actual[: len(headers)] != values:
        raise AssertionError(json.dumps({"expected": values, "actual": actual}, ensure_ascii=False, indent=2))
    if sheet.row_values(source_row, value_render_option="UNFORMATTED_VALUE") != source_before:
        raise AssertionError("Source WeatherSof row changed unexpectedly")
    print(f"Added {SKU} to row {target_row}. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    main(args.apply)
