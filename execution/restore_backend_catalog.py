#!/usr/bin/env python3
"""Restore the private catalogue while keeping only selected products public."""

from __future__ import annotations

import argparse
import csv
import sqlite3
from datetime import datetime
from pathlib import Path
from urllib.parse import quote


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ACTIVE_DATABASE = PROJECT_ROOT / "backend" / "golf_kenya.db"
BACKUP_ROOT = PROJECT_ROOT / ".tmp" / "backups"
SHEET_ID = "1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY"
SHEET_TAB = "Sheet1"
AUTHORIZED_USER = PROJECT_ROOT / "backend" / "credentials" / "authorized_user.json"


def backup_database(database: Path, destination: Path) -> None:
    source = sqlite3.connect(database)
    saved = sqlite3.connect(destination)
    source.backup(saved)
    saved.close()
    source.close()


def restore_database(source_path: Path, live_sku: str, stock: int, backup_dir: Path) -> int:
    backup_database(ACTIVE_DATABASE, backup_dir / "catalog-before-restore.db")
    source = sqlite3.connect(source_path)
    destination = sqlite3.connect(ACTIVE_DATABASE)
    source.backup(destination)
    source.close()

    columns = {row[1] for row in destination.execute("PRAGMA table_info(products)")}
    if "website_visible" not in columns:
        destination.execute("ALTER TABLE products ADD COLUMN website_visible INTEGER DEFAULT 0")
    destination.execute("UPDATE products SET website_visible=0")
    destination.execute(
        """UPDATE products
           SET website_visible=1, status='In Stock', stock=?, updated_at=CURRENT_TIMESTAMP
           WHERE lower(sku)=lower(?)""",
        (str(stock), live_sku),
    )
    destination.commit()
    total = destination.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    published = destination.execute(
        "SELECT COUNT(*) FROM products WHERE website_visible=1"
    ).fetchone()[0]
    destination.close()
    if published != 1:
        raise RuntimeError(f"Expected one public product, found {published}")
    return total


def google_credentials():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    credentials = Credentials.from_authorized_user_file(AUTHORIZED_USER, scopes)
    credentials.refresh(Request())
    return credentials


def restore_sheet(csv_path: Path, live_sku: str, stock: int, backup_dir: Path) -> int:
    import requests

    credentials = google_credentials()
    request_headers = {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json",
    }
    tab = quote(SHEET_TAB, safe="")
    values_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}"
    current_response = requests.get(values_url, headers=request_headers, timeout=30)
    current_response.raise_for_status()
    current = current_response.json().get("values", [])
    with (backup_dir / "sheet-before-restore.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        csv.writer(handle).writerows(current)

    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        source = list(csv.reader(handle))
    if not source or "SKU" not in source[0]:
        raise RuntimeError("Sheet backup has no SKU header")
    headers = source[0]
    sku_index = headers.index("SKU")
    last_index: dict[str, int] = {}
    for index, row in enumerate(source[1:]):
        if len(row) > sku_index and row[sku_index].strip():
            last_index[row[sku_index].strip().lower()] = index
    rows = [
        row for index, row in enumerate(source[1:])
        if len(row) > sku_index
        and row[sku_index].strip()
        and last_index[row[sku_index].strip().lower()] == index
    ]
    status_index = headers.index("Status")
    stock_index = headers.index("Stock")
    for row in rows:
        row.extend([""] * (len(headers) - len(row)))
        if row[sku_index].strip().lower() == live_sku.lower():
            row[status_index] = "In Stock"
            row[stock_index] = str(stock)

    restored = [headers, *rows]
    update_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}!A1"
    update = requests.put(
        update_url,
        headers=request_headers,
        params={"valueInputOption": "USER_ENTERED"},
        json={"range": f"{SHEET_TAB}!A1", "majorDimension": "ROWS", "values": restored},
        timeout=60,
    )
    update.raise_for_status()
    clear_start = len(restored) + 1
    clear_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab}!A{clear_start}:ZZ:clear"
    clear = requests.post(clear_url, headers=request_headers, json={}, timeout=30)
    clear.raise_for_status()

    verify = requests.get(values_url, headers=request_headers, timeout=30)
    verify.raise_for_status()
    verified = verify.json().get("values", [])
    if len(verified) - 1 != len(rows):
        raise RuntimeError(f"Sheet verification failed: expected {len(rows)} rows, found {len(verified) - 1}")
    return len(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-backup", type=Path, required=True)
    parser.add_argument("--sheet-csv", type=Path, required=True)
    parser.add_argument("--live-sku", default="GK-IR-TMP")
    parser.add_argument("--stock", type=int, default=1)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    database_backup = args.database_backup.resolve()
    sheet_csv = args.sheet_csv.resolve()
    print(f"Database source: {database_backup}")
    print(f"Sheet source: {sheet_csv}")
    print(f"Only public product: {args.live_sku}")
    if not args.apply:
        print("Dry run only. Add --apply to restore both sources.")
        return

    backup_dir = BACKUP_ROOT / f"restore-private-catalog-{datetime.now():%Y%m%d-%H%M%S-%f}"
    backup_dir.mkdir(parents=True, exist_ok=False)
    total = restore_database(database_backup, args.live_sku, args.stock, backup_dir)
    sheet_rows = restore_sheet(sheet_csv, args.live_sku, args.stock, backup_dir)
    print(f"Safety backup: {backup_dir}")
    print(f"Backend products restored: {total}")
    print(f"Google Sheet products restored: {sheet_rows}")
    print(f"Public products: 1 ({args.live_sku})")


if __name__ == "__main__":
    main()
