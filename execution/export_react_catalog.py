"""Export the local Karibu catalog into the React storefront's build data."""

from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE = PROJECT_ROOT / "backend" / "golf_kenya.db"
DEFAULT_OUTPUT = PROJECT_ROOT / "lib" / "catalog.generated.json"
PRODUCT_IMAGE_DIR = PROJECT_ROOT / "images" / "products"


def parse_json_list(raw: str | None) -> list[str]:
    try:
        value = json.loads(raw or "[]")
    except json.JSONDecodeError:
        return []
    return [str(item) for item in value if isinstance(item, str)] if isinstance(value, list) else []


def image_url(filename: str | None) -> str:
    candidate = Path(filename or "").name
    if candidate and (PRODUCT_IMAGE_DIR / candidate).is_file():
        return f"/images/products/{candidate}"
    return "/images/clubs.jpg"


def export_catalog(database: Path, output: Path) -> tuple[int, int]:
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row
    categories = [
        dict(row)
        for row in connection.execute(
            """SELECT slug, label, description, category_type AS categoryType,
                      display_order AS displayOrder
               FROM categories ORDER BY display_order, label"""
        )
    ]
    rows = connection.execute(
        """SELECT p.sku, p.name, p.category_slug, c.label AS category_label,
                  p.description, p.price_kes, p.price_usd, p.price_cny,
                  p.sizes, p.colors, p.status, p.stock, p.image_filename,
                  p.gallery, p.featured, p.display_order
           FROM products p
           JOIN categories c ON c.slug = p.category_slug
           ORDER BY p.featured DESC, p.display_order, p.name"""
    ).fetchall()
    connection.close()

    products = []
    for row in rows:
        gallery = [
            image_url(filename)
            for filename in parse_json_list(row["gallery"])
            if (PRODUCT_IMAGE_DIR / Path(filename).name).is_file()
        ]
        primary = image_url(row["image_filename"])
        images = list(dict.fromkeys([primary, *gallery]))
        products.append(
            {
                "sku": row["sku"],
                "slug": row["sku"].lower(),
                "name": row["name"],
                "categorySlug": row["category_slug"],
                "categoryLabel": row["category_label"],
                "description": row["description"] or "",
                "priceKes": int(row["price_kes"] or 0),
                "priceUsd": float(row["price_usd"] or 0),
                "priceCny": float(row["price_cny"] or 0),
                "sizes": row["sizes"] or "",
                "colors": row["colors"] or "",
                "status": row["status"] or "Out of Stock",
                "stock": row["stock"] or "0",
                "featured": bool(row["featured"]),
                "images": images,
            }
        )

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "categories": categories,
        "products": products,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(categories), len(products)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    category_count, product_count = export_catalog(args.db.resolve(), args.output.resolve())
    print(f"Exported {product_count} products across {category_count} categories to {args.output}")


if __name__ == "__main__":
    main()
