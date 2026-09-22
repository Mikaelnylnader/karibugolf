#!/usr/bin/env python3
"""Back up the catalogue database and mark every product out of stock."""

import sqlite3
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE = PROJECT_ROOT / "backend" / "golf_kenya.db"
BACKUP_DIR = PROJECT_ROOT / ".tmp" / "backups" / f"inventory-{datetime.now():%Y%m%d-%H%M%S-%f}"


def main():
    BACKUP_DIR.mkdir(parents=True, exist_ok=False)
    backup_path = BACKUP_DIR / DATABASE.name

    source = sqlite3.connect(DATABASE)
    backup = sqlite3.connect(backup_path)
    source.backup(backup)
    backup.close()

    before = source.execute("SELECT status, COUNT(*) FROM products GROUP BY status").fetchall()
    source.execute(
        "UPDATE products SET status='Out of Stock', stock='0', updated_at=CURRENT_TIMESTAMP"
    )
    source.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_publish', '1')"
    )
    source.commit()
    total = source.execute(
        "SELECT COUNT(*) FROM products WHERE status='Out of Stock'"
    ).fetchone()[0]
    source.close()

    print(f"Backup: {backup_path}")
    print(f"Previous status counts: {before}")
    print(f"Products now out of stock: {total}")
    print("Auto-publish: ON")


if __name__ == "__main__":
    main()
