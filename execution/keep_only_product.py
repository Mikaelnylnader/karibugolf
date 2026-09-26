#!/usr/bin/env python3
"""Back up the catalogue, keep one product, and set its live inventory state."""

from __future__ import annotations

import argparse
import csv
import sqlite3
from datetime import datetime
from pathlib import Path
from urllib.parse import quote


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE = PROJECT_ROOT / "backend" / "golf_kenya.db"
BACKUP_ROOT = PROJECT_ROOT / ".tmp" / "backups"
SHEET_ID = "1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY"
SHEET_TAB = "Sheet1"
AUTHORIZED_USER = PROJECT_ROOT / "backend" / "credentials" / "authorized_user.json"


def keep_only_sheet_product(sku: str, stock: int, backup_dir: Path) -> None:
    import requests
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    credentials = Credentials.from_authorized_user_file(AUTHORIZED_USER, scopes)
    credentials.refresh(Request())
    headers = {"Authorization": f"Bearer {credentials.token}", "Content-Type": "application/json"}
    tab = quote(SHEET_TAB, safe="")
    values_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}"
    response = requests.get(
        values_url,
        headers=headers,
        params={"valueRenderOption": "FORMULA"},
        timeout=30,
    )
    response.raise_for_status()
    values = response.json().get("values", [])
    if not values or "SKU" not in values[0]:
        raise RuntimeError("Google Sheet has no SKU header")

    with (backup_dir / "google-sheet-before.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        csv.writer(handle).writerows(values)

    sheet_headers = values[0]
    sku_index = sheet_headers.index("SKU")
    candidates = [
        row for row in values[1:]
        if len(row) > sku_index and str(row[sku_index]).lower() == sku.lower()
    ]
    if not candidates:
        raise RuntimeError(f"Google Sheet does not contain {sku}")

    price_index = sheet_headers.index("Price Kenya (Ksh)") if "Price Kenya (Ksh)" in sheet_headers else -1
    retained = next(
        (row for row in reversed(candidates) if price_index >= 0 and len(row) > price_index and "171,000" in str(row[price_index])),
        candidates[-1],
    )
    retained = [*retained, *([""] * (len(sheet_headers) - len(retained)))]
    retained = retained[:len(sheet_headers)]
    retained[sheet_headers.index("Status")] = "In Stock"
    retained[sheet_headers.index("Stock")] = str(stock)

    update_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}!A2"
    update = requests.put(
        update_url,
        headers=headers,
        params={"valueInputOption": "USER_ENTERED"},
        json={"range": f"{SHEET_TAB}!A2", "majorDimension": "ROWS", "values": [retained]},
        timeout=30,
    )
    update.raise_for_status()
    clear_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}!A3:ZZ:clear"
    cleared = requests.post(clear_url, headers=headers, json={}, timeout=30)
    cleared.raise_for_status()
    print(f"Google Sheet: retained one {sku} row and cleared {len(values) - 2} other rows")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku", required=True, help="The single SKU to retain")
    parser.add_argument("--stock", type=int, default=1, help="Inventory quantity for the retained product")
    parser.add_argument("--db", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--apply", action="store_true", help="Apply changes after showing the planned result")
    parser.add_argument("--sync-sheet", action="store_true", help="Apply the same cleanup to the connected Google Sheet")
    args = parser.parse_args()

    database = args.db.resolve()
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    retained = connection.execute(
        "SELECT * FROM products WHERE lower(sku) = lower(?)", (args.sku,)
    ).fetchone()
    if retained is None:
        connection.close()
        raise SystemExit(f"Product not found: {args.sku}")

    total = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    print(f"Database: {database}")
    print(f"Keep: {retained['sku']} — {retained['name']}")
    print(f"Remove: {total - 1} products")
    print(f"Retained inventory: In Stock · {args.stock}")
    if not args.apply:
        connection.close()
        print("Dry run only. Add --apply to make these changes.")
        return

    backup_dir = BACKUP_ROOT / f"keep-only-{retained['sku'].lower()}-{datetime.now():%Y%m%d-%H%M%S-%f}"
    backup_dir.mkdir(parents=True, exist_ok=False)
    backup_database = backup_dir / database.name
    backup = sqlite3.connect(backup_database)
    connection.backup(backup)
    backup.close()

    removed = connection.execute(
        "SELECT * FROM products WHERE lower(sku) <> lower(?) ORDER BY sku", (args.sku,)
    ).fetchall()
    with (backup_dir / "removed-products.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=removed[0].keys() if removed else retained.keys())
        writer.writeheader()
        writer.writerows(dict(row) for row in removed)

    try:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("DELETE FROM products WHERE lower(sku) <> lower(?)", (args.sku,))
        connection.execute(
            """UPDATE products
               SET status='In Stock', stock=?, updated_at=CURRENT_TIMESTAMP
               WHERE lower(sku)=lower(?)""",
            (str(args.stock), args.sku),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        connection.close()
        raise

    final_rows = connection.execute(
        "SELECT sku, name, status, stock FROM products ORDER BY sku"
    ).fetchall()
    connection.close()
    if len(final_rows) != 1 or final_rows[0]["sku"].lower() != args.sku.lower():
        raise SystemExit("Post-change verification failed; restore from the recorded backup.")

    print(f"Backup: {backup_database}")
    print(f"Removed rows: {backup_dir / 'removed-products.csv'}")
    print(f"Final catalogue: {dict(final_rows[0])}")
    if args.sync_sheet:
        keep_only_sheet_product(args.sku, args.stock, backup_dir)


if __name__ == "__main__":
    main()
