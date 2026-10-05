"""Refresh the existing WeatherSof glove; read-only unless --apply is supplied."""
import argparse
from pathlib import Path
from update_pro_v1x_listing import prepare

DESCRIPTION = (
    "FootJoy WeatherSof Men's Golf Glove in White / Black. Soft feel, "
    "a secure adjustable closure and perforated fingers. "
    "Size, glove hand, fit and exact version to be confirmed on restock. "
    "Currently out of stock; ask about future availability."
)
IMAGES = [
    ("weahtersoft men.png", "footjoy-weathersof-set.png"),
    ("weahtersoft men 2.png", "footjoy-weathersof-back.png"),
    ("weahtersoft men 3.png", "footjoy-weathersof-palm.png"),
    ("weahtersoft men 1.png", "footjoy-weathersof-packaging.png"),
]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    args = parser.parse_args()
    prepare(args.apply, args.source, sku="GK-GL009", name="FootJoy WeatherSof Men's Golf Glove",
            category="gloves", label="Gloves", description=DESCRIPTION,
            sizes="Confirm size, glove hand and fit on restock", colors="White / Black",
            images=IMAGES, backup_prefix="footjoy-weathersof")
