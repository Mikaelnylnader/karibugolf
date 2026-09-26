#!/usr/bin/env python3
"""Prepare the Google Sheet for the online admin without hiding later edits."""

from __future__ import annotations

import sys
from pathlib import Path
from gspread.utils import rowcol_to_a1

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from sheet_sync import get_sheet  # noqa: E402


def main() -> None:
    sheet = get_sheet()
    headers = sheet.row_values(1)
    visibility_was_added = "Website Visible" not in headers
    if "Website Visible" not in headers:
        sheet.update_cell(1, len(headers) + 1, "Website Visible")
        headers.append("Website Visible")

    if "Selling Price (CNY)" not in headers and "Price Kenya (CNY)" in headers:
        price_cny_column = headers.index("Price Kenya (CNY)") + 1
        sheet.update_cell(1, price_cny_column, "Selling Price (CNY)")
        headers[price_cny_column - 1] = "Selling Price (CNY)"

    if "Selling Price (USD)" not in headers:
        sheet.update_cell(1, len(headers) + 1, "Selling Price (USD)")
        headers.append("Selling Price (USD)")

    sku_column = headers.index("SKU") + 1
    visibility_column = headers.index("Website Visible") + 1
    rows = sheet.get_all_values()
    skus = [row[sku_column - 1] if len(row) >= sku_column else "" for row in rows[1:]]

    if visibility_was_added and skus:
        values = [["TRUE" if sku.strip().lower() == "gk-ir-tmp" else "FALSE"] for sku in skus]
        start = rowcol_to_a1(2, visibility_column)
        end = rowcol_to_a1(len(values) + 1, visibility_column)
        sheet.update(values, f"{start}:{end}", value_input_option="RAW")

    cny_column = headers.index("Selling Price (CNY)") + 1
    kes_column = headers.index("Price Kenya (Ksh)") + 1
    usd_column = headers.index("Selling Price (USD)") + 1
    updates = []
    for row_number, row in enumerate(rows[1:], start=2):
        raw_cny = row[cny_column - 1] if len(row) >= cny_column else ""
        raw_kes = row[kes_column - 1] if len(row) >= kes_column else ""
        raw_usd = row[usd_column - 1] if len(row) >= usd_column else ""
        try:
            kes = float("".join(char for char in raw_kes if char.isdigit() or char in ".-"))
        except ValueError:
            kes = 0
        if not raw_cny.strip() and kes > 0:
            updates.append({"range": rowcol_to_a1(row_number, cny_column), "values": [[round(kes / 19, 2)]]})
        if not raw_usd.strip() and kes > 0:
            updates.append({"range": rowcol_to_a1(row_number, usd_column), "values": [[round(kes / 129.5, 2)]]})
    if updates:
        sheet.batch_update(updates, value_input_option="USER_ENTERED")

    print(f"Online admin columns ready for {len(skus)} products; filled {len(updates)} missing currency values.")


if __name__ == "__main__":
    main()
