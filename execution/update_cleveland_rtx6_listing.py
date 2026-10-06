"""Refresh existing Cleveland RTX 6 ZipCore listing; read-only without --apply.

The existing SKU and all commercial values are preserved. This tool only
updates verified reference copy, supplied imagery and public availability.
"""
import argparse
from pathlib import Path

from update_pro_v1x_listing import prepare


DESCRIPTION = (
    "Cleveland RTX 6 ZipCore Tour Satin Wedge with HydraZip face technology, "
    "a low-density ZipCore and tightly spaced UltiZip grooves for spin and "
    "control from varied lies. Manufacturer loft, bounce, grind, hand and "
    "component choices are reference options rather than current Karibu "
    "inventory. Currently out of stock."
)

IMAGES = [
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-1.jpg", "cleveland-rtx6-zipcore-tour-satin-back.jpg"),
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-2.jpg", "cleveland-rtx6-zipcore-tour-satin-face.jpg"),
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-3.jpg", "cleveland-rtx6-zipcore-tour-satin-grooves.jpg"),
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-4.jpg", "cleveland-rtx6-zipcore-tour-satin-cavity.jpg"),
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-5.jpg", "cleveland-rtx6-zipcore-tour-satin-sole.jpg"),
    ("CG23-Clubs-Wedges-RTX6-Zipcore-Tour-Satin-6.webp", "cleveland-rtx6-zipcore-tour-satin-topline.webp"),
]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--source", type=Path, default=Path("C:/Users/mikae/Downloads")
    )
    args = parser.parse_args()
    prepare(
        args.apply,
        args.source,
        sku="GK-WG006",
        name="Cleveland RTX 6 ZipCore Tour Satin Wedge",
        category="wedges",
        label="Wedges",
        description=DESCRIPTION,
        sizes="46°–60°; LOW, LOW+, MID and FULL grinds (manufacturer reference)",
        colors="Tour Satin",
        images=IMAGES,
        backup_prefix="cleveland-rtx6",
    )
