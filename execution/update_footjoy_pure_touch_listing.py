"""Refresh the existing Pure Touch glove; read-only unless --apply is supplied."""
import argparse
from pathlib import Path
from update_pro_v1x_listing import prepare

DESCRIPTION = (
    "FootJoy Pure Touch Limited Men's Golf Glove in White. Select cabretta leather "
    "for a soft feel, with strategically placed elastic for a tailored fit. "
    "Size, glove hand and fit to be confirmed on restock. Currently out of stock; "
    "ask about future availability."
)
IMAGES = [
    ("Pure feel.png", "footjoy-pure-touch-set.png"),
    ("pure feel1.png", "footjoy-pure-touch-back.png"),
    ("pure feel3.png", "footjoy-pure-touch-palm.png"),
    ("pure feel2.png", "footjoy-pure-touch-packaging.png"),
]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    args = parser.parse_args()
    prepare(args.apply, args.source, sku="GK-GL010", name="FootJoy Pure Touch Limited Men's Golf Glove",
            category="gloves", label="Gloves", description=DESCRIPTION,
            sizes="Confirm size, glove hand and fit on restock", colors="White",
            images=IMAGES, backup_prefix="footjoy-pure-touch")
