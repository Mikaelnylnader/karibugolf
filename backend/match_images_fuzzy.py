#!/usr/bin/env python3
"""Match remaining unmatched images using smarter fuzzy matching."""
import sqlite3
import re
import os
import json
from difflib import SequenceMatcher

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "golf_kenya.db")
IMG_DIR = os.path.join(BASE_DIR, "..", "dist", "images", "products")


def safe_basename(name):
    s = name.replace(" ", "_").replace("/", "_")
    s = re.sub(r"[^a-zA-Z0-9_-]", "", s)
    return s


def normalize(s):
    """Normalize a string for comparison: lowercase, remove special chars."""
    return re.sub(r"[^a-z0-9]", "", s.lower())


def find_best_match(name, candidates, threshold=0.6):
    """Find the best fuzzy match for name among candidates."""
    n = normalize(name)
    best_score = 0
    best = None
    for c in candidates:
        score = SequenceMatcher(None, n, normalize(c)).ratio()
        if score > best_score:
            best_score = score
            best = c
    if best_score >= threshold:
        return best, best_score
    return None, 0


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Get all products and their names
    products = conn.execute("SELECT sku, name FROM products ORDER BY name").fetchall()
    product_map = {p["sku"]: p["name"] for p in products}

    # Get already-matched products
    matched_skus = set()
    for p in conn.execute("SELECT sku FROM products WHERE image_filename != ''").fetchall():
        matched_skus.add(p["sku"])

    # Get unmatched products
    unmatched_products = [p for p in products if p["sku"] not in matched_skus]

    # Get all image files not starting with __cat_
    all_files = [f for f in os.listdir(IMG_DIR) if not f.startswith("__cat_")]

    # Build a set of used filenames
    used_files = set()
    for r in conn.execute("SELECT image_filename FROM products WHERE image_filename != ''").fetchall():
        used_files.add(r["image_filename"])
    for r in conn.execute("SELECT gallery FROM products WHERE gallery != '[]'").fetchall():
        try:
            for f in json.loads(r["gallery"]):
                used_files.add(f)
        except:
            pass

    unused_files = [f for f in all_files if f not in used_files]
    print(f"Unused image files: {len(unused_files)}")

    # Strategy 1: Try each product name against unused files with fuzzy matching
    new_matches = 0
    for p in unmatched_products:
        name = p["name"]
        safe = safe_basename(name)
        
        # Look for exact match
        main_img = None
        gallery = []
        for f in unused_files:
            f_base = f.rsplit(".", 1)[0]
            if f_base == safe:
                main_img = f
            elif f_base.startswith(safe + "_") and f_base[len(safe) + 1:].isdigit():
                gallery.append(f)

        # Try normalized fuzzy match if no exact match
        if not main_img:
            best, score = find_best_match(safe, [f.rsplit(".", 1)[0] for f in unused_files])
            if best:
                # Find the actual file
                for f in unused_files:
                    if f.rsplit(".", 1)[0] == best:
                        main_img = f
                        break

        if main_img:
            img_path = f"/images/products/{main_img}"
            gallery_json = json.dumps(gallery)
            conn.execute(
                """UPDATE products SET image_filename=?, image=?, gallery=?, updated_at=CURRENT_TIMESTAMP
                   WHERE sku=?""",
                (main_img, img_path, gallery_json, p["sku"]),
            )
            new_matches += 1
            # Remove used files
            used_files.add(main_img)
            if main_img in unused_files:
                unused_files.remove(main_img)
            for g in gallery:
                used_files.add(g)
                if g in unused_files:
                    unused_files.remove(g)

    # Strategy 2: Match remaining images to existing products that may have different naming
    # Images like "Callaway_AiSmokeHL_1.jpg" -> product "Callaway Ai Smoke HL Irons"
    still_unused = sorted(unused_files)
    still_unmatched = [p for p in conn.execute(
        "SELECT sku, name FROM products WHERE image_filename = ''"
    ).fetchall()]

    print(f"\nNew matches (fuzzy): {new_matches}")
    print(f"Still unmatched products: {len(still_unmatched)}")
    print(f"Still unused images: {len(still_unused)}")

    # Show what's left
    if still_unmatched:
        print("\nUnmatched products:")
        for p in still_unmatched:
            print(f"  {p['sku']:15s} {p['name']}")

    if still_unused:
        print("\nUnused images:")
        for f in still_unused[:30]:
            print(f"  {f}")
        if len(still_unused) > 30:
            print(f"  ... and {len(still_unused) - 30} more")

    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
