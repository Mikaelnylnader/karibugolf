"""
Google Sheets sync module for Karibu Golf Admin.

Syncs product data from SQLite to Google Sheet.
Uses gspread with OAuth 2.0 installed app credentials (Desktop app type).

Setup:
1. Place your OAuth 2.0 credentials JSON (Desktop app type) at
   backend/credentials/google-sheet-key.json
2. Share the target sheet with any email that has access
3. On first sync, a browser will open for you to authorize
4. Restart the admin
"""
import os
import json
import csv
import io
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_DIR = BASE_DIR / "credentials"
DEFAULT_CRED = CREDENTIALS_DIR / "google-sheet-key.json"
AUTHORIZED_USER = CREDENTIALS_DIR / "authorized_user.json"
SHEET_ID = "1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY"
SHEET_TAB = "Sheet1"

COLUMN_MAP = [
    ("sku", "SKU"),
    ("name", "Name"),
    ("category_slug", "Category"),
    ("price_kes", "Price Kenya (Ksh)"),
    ("cost_cny", "Cost China (CNY)"),
    ("cost_kes", "Cost China (Ksh)"),
    ("sizes", "Sizes"),
    ("colors", "Colors"),
    ("description", "Description"),
    ("status", "Status"),
    ("stock", "Stock"),
]

REVERSE_CATEGORY = {
    "drivers": "drivers", "golf_irons": "irons", "putters": "putters",
    "woods": "woods", "wedges": "wedges", "hybrids": "hybrids",
    "mens_polos": "apparel", "mens_pants": "apparel", "mens_jackets": "apparel",
    "mens_shorts": "apparel", "womens_polos": "apparel", "womens_skirts": "apparel",
    "womens_pants": "apparel", "womens_dresses": "apparel", "womens_jackets": "apparel",
    "womens_tops": "apparel",
    "mens_shoes": "shoes", "womens_shoes": "shoes",
    "bags": "bags", "gloves": "gloves",
    "hats_and_caps": "hats & caps", "accessories": "accessories",
    "balls": "balls", "grips": "grips", "range_finders": "range finders",
}


def is_configured():
    """Check if either credentials file or existing authorized token exists."""
    return DEFAULT_CRED.exists() or AUTHORIZED_USER.exists()


def get_client():
    """Get an authenticated gspread client using OAuth 2.0 installed app flow.
    
    Uses gspread.oauth() which:
    - First time: opens a browser for the user to authorize
    - Saves the token to authorized_user.json for subsequent runs
    """
    import gspread
    return gspread.oauth(
        credentials_filename=str(DEFAULT_CRED),
        authorized_user_filename=str(AUTHORIZED_USER),
        open_browser=True,
    )


def get_sheet():
    client = get_client()
    return client.open_by_key(SHEET_ID).sheet1


def sync_product_to_sheet(product_dict):
    if not is_configured():
        return False
    try:
        sheet = get_sheet()
        sku_column = sheet.col_values(1)
        headers = sheet.row_values(1)

        row_data = {}
        for db_field, sheet_col in COLUMN_MAP:
            val = product_dict.get(db_field, "")
            if db_field == "category_slug":
                val = REVERSE_CATEGORY.get(val, val)
            elif db_field == "price_kes":
                val = f"KES {int(val):,}" if val else ""
            row_data[sheet_col] = str(val)

        sku = product_dict.get("sku", "")
        if sku in sku_column:
            row_num = sku_column.index(sku) + 1
            for col_idx, header in enumerate(headers, 1):
                if header in row_data:
                    sheet.update_cell(row_num, col_idx, row_data[header])
        else:
            new_row = [row_data.get(h, "") for h in headers]
            sheet.append_rows([new_row])
        return True
    except Exception as e:
        print(f"Sheet sync error: {e}")
        return False


def sync_delete_from_sheet(sku):
    if not is_configured():
        return False
    try:
        sheet = get_sheet()
        sku_column = sheet.col_values(1)
        if sku in sku_column:
            row_num = sku_column.index(sku) + 1
            sheet.delete_rows(row_num)
        return True
    except Exception as e:
        print(f"Sheet delete error: {e}")
        return False


def get_sheet_status():
    if not is_configured():
        return {"configured": False, "message": "Not connected. Add credentials/google-sheet-key.json"}
    try:
        sheet = get_sheet()
        row_count = len(sheet.col_values(1)) - 1
        return {"configured": True, "row_count": max(0, row_count), "message": f"Connected ({max(0, row_count)} rows)"}
    except Exception as e:
        return {"configured": False, "message": f"Error: {e}"}
