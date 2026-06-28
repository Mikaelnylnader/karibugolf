#!/usr/bin/env python3
"""Final cleanup: attach remaining gallery images."""
import sqlite3
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "golf_kenya.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Gallery images to attach to existing products
    updates = {
        "GK-IR004": ["Callaway_AiSmokeHL_2.jpg", "Callaway_AiSmokeHL_3.jpg",
                     "Callaway_AiSmokeHL_4.jpg", "Callaway_AiSmokeHL_5.jpg"],  # HL Irons gallery
        "GK-IR002": ["QiMax_1.jpg", "QiMax_2.jpg", "QiMax_3.jpg", "QiMax_4.jpg"],  # Qi Max gallery
        "GK-BG013": ["Titleist_BRW_Boston_Bag_7.jpg"],  # Extra bag photo
    }

    for sku, add_images in updates.items():
        p = conn.execute("SELECT * FROM products WHERE sku = ?", (sku,)).fetchone()
        if not p:
            print(f"❌ Product {sku} not found!")
            continue
        try:
            existing = json.loads(p["gallery"] or "[]")
        except:
            existing = []
        new_ones = [f for f in add_images if f not in existing]
        if new_ones:
            updated = existing + new_ones
            conn.execute("UPDATE products SET gallery=?, updated_at=CURRENT_TIMESTAMP WHERE sku=?",
                         (json.dumps(updated), sku))
            print(f"✅ {sku}: added {len(new_ones)} gallery images ({len(updated)} total)")
        else:
            print(f"   {sku}: already has all images")

    conn.commit()

    # Final summary
    all_products = conn.execute("""
        SELECT sku, name, image_filename,
               CASE WHEN gallery != '[]' THEN 1 ELSE 0 END as has_gallery
        FROM products ORDER BY sku
    """).fetchall()

    with_img = sum(1 for p in all_products if p["image_filename"])
    with_gallery = sum(1 for p in all_products if p["has_gallery"])
    
    print(f"\n{'='*50}")
    print(f"  FINAL SUMMARY")
    print(f"{'='*50}")
    print(f"  📦 {len(all_products)} total products")
    print(f"  🖼️  {with_img} have main images")
    print(f"  🖼️  {with_gallery} have gallery images")
    print(f"  ❌ {len(all_products) - with_img} still missing images")

    conn.close()


if __name__ == "__main__":
    main()
