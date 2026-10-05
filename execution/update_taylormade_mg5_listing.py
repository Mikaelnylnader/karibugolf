"""Refresh the existing TaylorMade MG5 wedge listing; read-only without --apply.

The existing SKU and all commercial values are preserved. This tool only
updates the product copy, verified reference options, supplied imagery and
public availability fields.
"""
import argparse
from pathlib import Path

from update_pro_v1x_listing import prepare


DESCRIPTION = (
    "TaylorMade MG5 Wedge, fully forged from carbon steel with Spin Tread "
    "Technology, a RAW face and aggressive saw-milled grooves. Manufacturer "
    "loft, grind, finish, hand and shaft choices are reference options; exact "
    "Karibu availability must be confirmed. Currently out of stock."
)

IMAGES = [
    ("N29140_zoom_D.jpg", "taylormade-mg5-wedge-back.jpg"),
    ("N29140_zoom_D2.jpg", "taylormade-mg5-wedge-face.jpg"),
    ("N29140_zoom_D3.jpg", "taylormade-mg5-wedge-face-angle.jpg"),
    ("N29140_zoom_D4.jpg", "taylormade-mg5-wedge-sole.jpg"),
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
        sku="GK-WG009",
        name="TaylorMade MG5 Wedge",
        category="wedges",
        label="Wedges",
        description=DESCRIPTION,
        sizes="46°–60°; LB, SC, SB, SX and HB grinds (manufacturer reference)",
        colors="Satin Chrome, Charcoal (manufacturer reference)",
        images=IMAGES,
        backup_prefix="taylormade-mg5",
    )
