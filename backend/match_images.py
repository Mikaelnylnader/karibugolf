#!/usr/bin/env python3
"""Match existing product images to database products."""
import sqlite3
import re
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "golf_kenya.db")
IMG_DIR = os.path.join(BASE_DIR, "..", "dist", "images", "products")


def safe_basename(name):
    s = name.replace(" ", "_").replace("/", "_")
    s = re.sub(r"[^a-zA-Z0-9_-]", "", s)
    return s


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    all_files = [f for f in os.listdir(IMG_DIR) if not f.startswith("__cat_")]
    print(f"Total image files: {len(all_files)}")

    products = conn.execute("SELECT sku, name FROM products ORDER BY name").fetchall()
    matched = 0
    has_gallery = 0
    unmatched_products = []
    unmatched_images = list(all_files)

    for p in products:
        base = safe_basename(p["name"])
        ext = ".jpg"
        main_img = None
        gallery = []

        for f in all_files:
            f_base = f.rsplit(".", 1)[0]
            # Main image: exact match
            if f_base == base:
                main_img = f
            # Gallery images: _2, _3, _4 suffix
            elif f_base.startswith(base + "_") and f_base[len(base) + 1:].isdigit():
                gallery.append(f)

        if main_img:
            img_path = f"/images/products/{main_img}"
            gallery_json = json.dumps(gallery)

            conn.execute(
                """UPDATE products SET image_filename=?, image=?, gallery=?, updated_at=CURRENT_TIMESTAMP
                   WHERE sku=?""",
                (main_img, img_path, gallery_json, p["sku"]),
            )
            matched += 1
            if gallery:
                has_gallery += 1

            # Remove matched files from unmatched list
            for f in [main_img] + gallery:
                if f in unmatched_images:
                    unmatched_images.remove(f)
        else:
            unmatched_products.append((p["sku"], p["name"]))

    conn.commit()
    conn.close()

    print(f"\n✅ {matched} products matched with images")
    print(f"📸 {has_gallery} products have gallery images")
    print(f"❌ {len(unmatched_products)} products still without images:")
    for sku, name in unmatched_products[:20]:
        print(f"   {sku:15s} {name}")
    if len(unmatched_products) > 20:
        print(f"   ... and {len(unmatched_products) - 20} more")

    print(f"\n🖼️  {len(unmatched_images)} image files not matched to any product:")
    for f in unmatched_images[:15]:
        print(f"   {f}")
    if len(unmatched_images) > 15:
        print(f"   ... and {len(unmatched_images) - 15} more")


if __name__ == "__main__":
    main()
