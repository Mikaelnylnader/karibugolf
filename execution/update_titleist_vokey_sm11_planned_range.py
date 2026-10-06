"""Update the existing SM11 listing to Karibu's planned range.

Read-only unless --apply is supplied. Commercial values, images, stock status,
and visibility remain unchanged.
"""

import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone

from add_titleist_vokey_sm11_listing import (
    COLORS, DESCRIPTION, ROOT, SIZES, SKU,
)


def main(apply: bool) -> None:
    database = ROOT / "backend/golf_kenya.db"
    catalog_path = ROOT / "lib/catalog.generated.json"
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    row = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone()
    if row is None:
        raise RuntimeError(f"{SKU} does not exist locally")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    matches = [product for product in catalog["products"] if product["sku"] == SKU]
    if len(matches) != 1:
        raise RuntimeError(f"Expected exactly one {SKU} catalogue product")

    plan = {
        "sku": SKU,
        "hand": ["Right handed"],
        "models": SIZES.split("; "),
        "finishes": COLORS.split("; "),
        "shaft": ["Standard steel shaft - exact model / flex to be confirmed"],
        "status": row["status"],
        "stock": row["stock"],
        "price_kes": row["price_kes"],
        "apply": apply,
    }
    print(json.dumps(plan, indent=2, ensure_ascii=False))
    if not apply:
        connection.close()
        return

    backup = ROOT / ".tmp/backups" / (
        "titleist-vokey-sm11-range-"
        + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        connection.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")

    connection.execute(
        "UPDATE products SET description=?, sizes=?, colors=? WHERE sku=?",
        (DESCRIPTION, SIZES, COLORS, SKU),
    )
    connection.commit()
    updated = connection.execute("SELECT * FROM products WHERE sku=?", (SKU,)).fetchone()
    connection.close()
    if (
        updated["description"] != DESCRIPTION
        or updated["sizes"] != SIZES
        or updated["colors"] != COLORS
        or updated["status"] != "Out of Stock"
        or int(updated["stock"]) != 0
    ):
        raise AssertionError("Saved SM11 planned-range data is incorrect")

    product = matches[0]
    product["description"] = DESCRIPTION
    product["sizes"] = SIZES
    product["colors"] = COLORS
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated local SM11 planned range. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    arguments = parser.parse_args()
    main(arguments.apply)
