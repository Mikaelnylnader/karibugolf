"""Targeted Sheet refresh for existing Cleveland RTX 6 SKU GK-WG006."""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from sheet_sync import get_sheet  # noqa: E402


SKU = "GK-WG006"
IMAGE = "https://karibugolf.com/images/products/cleveland-rtx6-zipcore-tour-satin-back.jpg"
DESCRIPTION = (
    "Cleveland RTX 6 ZipCore Tour Satin Wedge with HydraZip face technology, "
    "a low-density ZipCore and tightly spaced UltiZip grooves for spin and "
    "control from varied lies. Manufacturer loft, bounce, grind, hand and "
    "component choices are reference options rather than current Karibu "
    "inventory. Currently out of stock."
)
OVERRIDES = {
    "Image": IMAGE,
    "Name": "Cleveland RTX 6 ZipCore Tour Satin Wedge",
    "Category": "Wedges",
    "Description": DESCRIPTION,
    "Sizes": "46°–60°; LOW, LOW+, MID and FULL grinds (manufacturer reference)",
    "Colors": "Tour Satin",
    "Status": "Out of Stock",
    "Stock": 0,
    "Website Visible": True,
}


def cell_value(value):
    if isinstance(value, bool):
        return {"boolValue": value}
    if isinstance(value, (int, float)):
        return {"numberValue": value}
    return {"stringValue": str(value)}


def main(apply: bool) -> None:
    sheet = get_sheet()
    headers = sheet.row_values(1)
    sku_values = sheet.col_values(headers.index("SKU") + 1)
    matches = [index + 1 for index, value in enumerate(sku_values) if value == SKU]
    if len(matches) != 1:
        raise RuntimeError(f"Expected exactly one {SKU} Sheet row, found {matches}")
    row_number = matches[0]
    before_formula = sheet.row_values(row_number, value_render_option="FORMULA")
    before_unformatted = sheet.row_values(row_number, value_render_option="UNFORMATTED_VALUE")
    before_unformatted += [""] * (len(headers) - len(before_unformatted))

    price_headers = [
        "Cost China (CNY)", "Cost China (Ksh)", "Margin",
        "Selling Price (CNY)", "Price Kenya (Ksh)", "Profit CNY",
        "Profit Ksh", "Profit (CNY)", "Selling Price (USD)",
    ]
    preserved_prices = {
        header: before_unformatted[headers.index(header)] for header in price_headers
    }
    print(json.dumps({
        "sku": SKU,
        "row": row_number,
        "price_kes_preserved": preserved_prices["Price Kenya (Ksh)"],
        "status": "Out of Stock",
        "stock": 0,
        "visible": True,
        "apply": apply,
    }, indent=2, ensure_ascii=False))
    if not apply:
        return

    backup = ROOT / ".tmp/backups" / (
        "cleveland-rtx6-sheet-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    (backup / "row-before.json").write_text(json.dumps({
        "headers": headers,
        "row": row_number,
        "formulaValues": before_formula,
        "unformattedValues": before_unformatted,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    requests = []
    for header, value in OVERRIDES.items():
        column = headers.index(header)
        requests.append({"updateCells": {
            "range": {
                "sheetId": sheet.id,
                "startRowIndex": row_number - 1,
                "endRowIndex": row_number,
                "startColumnIndex": column,
                "endColumnIndex": column + 1,
            },
            "rows": [{"values": [{"userEnteredValue": cell_value(value)}]}],
            "fields": "userEnteredValue",
        }})
    image_column = headers.index("Image")
    requests.append({"updateCells": {
        "range": {
            "sheetId": sheet.id,
            "startRowIndex": row_number - 1,
            "endRowIndex": row_number,
            "startColumnIndex": image_column,
            "endColumnIndex": image_column + 1,
        },
        "rows": [{"values": [{
            "userEnteredFormat": {"textFormat": {"link": {"uri": IMAGE}}}
        }]}],
        "fields": "userEnteredFormat.textFormat.link",
    }})
    stock_column = headers.index("Stock")
    requests.append({"updateCells": {
        "range": {
            "sheetId": sheet.id,
            "startRowIndex": row_number - 1,
            "endRowIndex": row_number,
            "startColumnIndex": stock_column,
            "endColumnIndex": stock_column + 1,
        },
        "rows": [{"values": [{
            "userEnteredFormat": {"numberFormat": {"type": "NUMBER", "pattern": "0"}}
        }]}],
        "fields": "userEnteredFormat.numberFormat",
    }})
    sheet.spreadsheet.batch_update({"requests": requests})

    after = sheet.row_values(row_number, value_render_option="UNFORMATTED_VALUE")
    after += [""] * (len(headers) - len(after))
    for header, expected in OVERRIDES.items():
        actual = after[headers.index(header)]
        if header == "Stock":
            if float(actual) != 0:
                raise AssertionError(f"{header}: expected 0, found {actual!r}")
        elif header == "Website Visible":
            if actual is not True:
                raise AssertionError(f"{header}: expected TRUE, found {actual!r}")
        elif actual != expected:
            raise AssertionError(f"{header}: expected {expected!r}, found {actual!r}")
    for header, expected in preserved_prices.items():
        actual = after[headers.index(header)]
        if actual != expected:
            raise AssertionError(f"Commercial value changed in {header}: {expected!r} -> {actual!r}")
    print(f"Updated {SKU} in Sheet row {row_number}. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    main(args.apply)
