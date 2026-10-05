"""Refresh the existing Players men's glove. Read-only unless --apply is supplied."""
import argparse
from pathlib import Path
from update_pro_v1x_listing import prepare

DESCRIPTION = (
    "Titleist Players Men's Golf Glove in Pearl (white). Select cabretta leather, "
    "breathable perforations and reinforced cuff and thumb. Size, glove hand and fit "
    "to be confirmed on restock. Currently out of stock; ask about future availability."
)
IMAGES = [
    ("Skärmbild 2026-10-04 171804.png", "titleist-players-glove-back.png"),
    ("Skärmbild 2026-10-04 171736.png", "titleist-players-glove-palm.png"),
    ("Skärmbild 2026-10-04 171750.png", "titleist-players-glove-grip.png"),
    ("Skärmbild 2026-10-04 171717.png", "titleist-players-glove-packaging.png"),
]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Pictures/Screenshots"))
    args = parser.parse_args()
    prepare(args.apply, args.source, sku="GK-GL005", name="Titleist Players Men's Golf Glove",
            category="gloves", label="Gloves", description=DESCRIPTION,
            sizes="Confirm size, glove hand and fit on restock", colors="Pearl (white)",
            images=IMAGES, backup_prefix="titleist-players-glove")
