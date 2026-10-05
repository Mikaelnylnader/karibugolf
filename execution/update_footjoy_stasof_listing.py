"""Refresh existing StaSof and copy the shared size chart; read-only without --apply."""
import argparse
import hashlib
import shutil
from pathlib import Path
from update_pro_v1x_listing import ROOT, prepare

DESCRIPTION = (
    "FootJoy StaSof Men's Golf Glove in Pearl / Black. Advanced performance leather, "
    "breathable mesh and perforations, and an angled ComforTab closure. "
    "Size, glove hand and fit to be confirmed on restock. Currently out of stock; "
    "ask about future availability."
)
IMAGES = [
    ("strasoft .png", "footjoy-stasof-set.png"),
    ("strasoft 1.png", "footjoy-stasof-back.png"),
    ("strasoft 3.png", "footjoy-stasof-palm.png"),
    ("strasoft 2.png", "footjoy-stasof-packaging.png"),
]
GUIDE = "ChatGPT Image Oct 4, 2026, 05_48_51 PM-2.png"

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source", type=Path, default=Path("C:/Users/mikae/Downloads"))
    args = parser.parse_args()
    source = args.source / GUIDE
    if not source.is_file():
        raise FileNotFoundError(source)
    # Refuse to overwrite a different guide: this is a shared asset across glove pages.
    targets = [ROOT / folder / "mens-golf-glove-size-guide.png"
               for folder in ["images/guides", "public/images/guides"]]
    for target in targets:
        if target.exists() and target.read_bytes() != source.read_bytes():
            raise RuntimeError(f"Existing shared guide differs: {target}")
    prepare(args.apply, args.source, sku="GK-GL008", name="FootJoy StaSof Men's Golf Glove",
            category="gloves", label="Gloves", description=DESCRIPTION,
            sizes="Confirm size, glove hand and fit on restock", colors="Pearl / Black",
            images=IMAGES, backup_prefix="footjoy-stasof")
    if args.apply:
        for target in targets:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            assert hashlib.sha256(source.read_bytes()).digest() == hashlib.sha256(target.read_bytes()).digest()
        print("Shared glove size guide copied unchanged; manufacturer sizing remains authoritative.")
