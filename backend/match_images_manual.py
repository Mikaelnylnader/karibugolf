#!/usr/bin/env python3
"""Final manual matching for remaining images."""
import sqlite3
import re
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "golf_kenya.db")
IMG_DIR = os.path.join(BASE_DIR, "..", "dist", "images", "products")


def safe_basename(name):
    s = name.replace(" ", "_").replace("/", "_")
    return re.sub(r"[^a-zA-Z0-9_-]", "", s)


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Known manual mappings: product SKU -> (main_image, [gallery_images])
    manual = {
        # TaylorMade Stealth
        "GK-IR-TMS": ("Stealth_1.jpg", ["Stealth_2.jpg", "Stealth_3.jpg", "Stealth_4.jpg"]),
        # Callaway Ai Smoke HL Irons
        "GK-IR004": ("Callaway_AiSmokeHL_1.jpg",
                     ["Callaway_AiSmokeHL_2.jpg", "Callaway_AiSmokeHL_3.jpg",
                      "Callaway_AiSmokeHL_4.jpg", "Callaway_AiSmokeHL_5.jpg"]),
        # TaylorMade Qi Max Irons
        "GK-IR002": ("QiMax_1.jpg",
                     ["QiMax_2.jpg", "QiMax_3.jpg", "QiMax_4.jpg"]),
    }

    # Gallery images that belong to existing products (add to existing galleries)
    gallery_additions = {
        # Callaway Duffle Bag with Shoe Compartment
        "GK-BG001": ["Callaway_Duffle_Bag_2.jpg", "Callaway_Duffle_Bag_3.jpg",
                     "Callaway_Duffle_Bag_4.jpg", "Callaway_Duffle_Bag_5.jpg"],
        # Titleist Boston Bag
        "GK-BG013": ["Titleist_BRW_Boston_Bag_2.jpg", "Titleist_BRW_Boston_Bag_3.jpg",
                     "Titleist_BRW_Boston_Bag_4.jpg", "Titleist_BRW_Boston_Bag_5.jpg",
                     "Titleist_BRW_Boston_Bag_6.jpg"],
        # Callaway Golf Shoe Bag
        "GK-BG002": ["Callaway_Golf_Shoe_Bag_black.jpg", "Callaway_Golf_Shoe_Bag_white.jpg"],
        # Malbon Amongst The Cypress Stand Bag
        "GK-BG016": ["Malbon_Amongst_Cypress_2.jpg", "Malbon_Amongst_Cypress_3.jpg",
                     "Malbon_Amongst_Cypress_4.jpg"],
    }

    # Apply manual main image matches
    for sku, (main_img, gallery) in manual.items():
        p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
        if p and not p["image_filename"]:
            img_path = f"/images/products/{main_img}"
            conn.execute(
                """UPDATE products SET image_filename=?, image=?, gallery=?, updated_at=CURRENT_TIMESTAMP
                   WHERE sku=?""",
                (main_img, img_path, json.dumps(gallery), sku),
            )
            print(f"✅ {sku}: {main_img} + {len(gallery)} gallery images")
        elif p:
            print(f"⚠️  {sku}: already has image {p['image_filename']}, skipped")

    # Apply gallery additions to existing products
    for sku, add_images in gallery_additions.items():
        p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
        if p:
            try:
                existing = json.loads(p["gallery"] or "[]")
            except:
                existing = []
            new_images = [f for f in add_images if f not in existing]
            if new_images:
                updated = existing + new_images
                conn.execute("UPDATE products SET gallery=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
                             (json.dumps(updated), sku))
                print(f"📸 {sku}: added {len(new_images)} gallery images (total: {len(updated)})")
            else:
                print(f"   {sku}: gallery already has these images")

    conn.commit()

    # Print final stats
    with_img = conn.execute("SELECT COUNT(*) FROM products WHERE image_filename != ''").fetchone()[0]
    total = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    still_no_img = [r for r in conn.execute(
        "SELECT sku, name FROM products WHERE image_filename = ''"
    ).fetchall()]

    print(f"\n{'='*50}")
    print(f"📊 Final: {with_img}/{total} products have images ({total - with_img} still missing)")

    if still_no_img:
        print(f"\n❌ Still no image for:")
        for r in still_no_img:
            print(f"   {r['sku']:15s} {r['name']}")

    # Check remaining unused files
    all_files = set(f for f in os.listdir(IMG_DIR) if not f.startswith("__cat_"))
    used_files = set()
    for r in conn.execute("SELECT image_filename FROM products WHERE image_filename != ''").fetchall():
        used_files.add(r["image_filename"])
    for r in conn.execute("SELECT gallery FROM products WHERE gallery != '[]'").fetchall():
        try:
            for f in json.loads(r["gallery"]):
                used_files.add(f)
        except:
            pass
    unused = sorted(all_files - used_files)
    if unused:
        print(f"\n🖼️  Still unused image files ({len(unused)}):")
        for f in unused:
            print(f"   {f}")

    conn.close()


if __name__ == "__main__":
    main()
