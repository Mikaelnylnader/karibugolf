"""Update only GK-HC010's local images; no price/stock/Sheet/publish changes."""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).absolute().parents[1]


def main(apply):
    catalog_path = ROOT / "lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    matches = [p for p in catalog["products"] if p["sku"] == "GK-HC010"]
    if len(matches) != 1:
        raise RuntimeError("Expected exactly one cap catalogue record")
    manifest = json.loads((ROOT / ".tmp/qi4d-cap-assets/gallery-manifest.json").read_text(encoding="utf-8"))
    images = ["/" + image["target"].removeprefix("public/") for image in manifest["images"]]
    if len(images) != 24 or len(set(images)) != 24:
        raise RuntimeError("Expected 24 unique gallery images")
    for image in images:
        if not (ROOT / "public" / image.lstrip("/")).is_file():
            raise FileNotFoundError(image)
    db = sqlite3.connect(ROOT / "backend/golf_kenya.db")
    db.row_factory = sqlite3.Row
    before = dict(db.execute("SELECT * FROM products WHERE sku='GK-HC010'").fetchone())
    if before["website_visible"] or before["price_kes"] != 3500 or before["stock"] != "0":
        raise RuntimeError("Unexpected visibility or commercial data; stop for review")
    print(json.dumps(dict(apply=apply,sku="GK-HC010",images=24,viewsPerColour=6,priceKes=before["price_kes"],websiteVisible=False)))
    if not apply:
        db.close()
        return
    backup = ROOT / ".tmp/backups" / ("qi4d-cap-gallery-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        db.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")
    db.execute("UPDATE products SET gallery=? WHERE sku='GK-HC010'", (json.dumps([i.removeprefix("/images/products/") for i in images[1:]]),))
    after = dict(db.execute("SELECT * FROM products WHERE sku='GK-HC010'").fetchone())
    assert {k:v for k,v in before.items() if k != "gallery"} == {k:v for k,v in after.items() if k != "gallery"}
    db.commit()
    db.close()
    matches[0]["images"] = images
    catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Local gallery expanded; commercial fields unchanged. Backup:", backup)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    main(parser.parse_args().apply)
