"""Add one offline Qi4D cap; plan by default, no network or publishing.

Uses the current admin currency defaults and standing 62% gross margin.
The database and live Sheet stay hidden; static catalogue is local review.
"""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).absolute().parents[1]
SKU = "GK-HC010"
COST_CNY = 70
BACKUP_PREFIX = "qi4d-cap-"
NAME = "TaylorMade Qi4D Golf Cap"
COLOURS = ["Navy", "Grey", "White", "Red"]
DESCRIPTION = "TaylorMade Qi4D golf cap with curved brim, front embroidery, side Qi4D branding and an adjustable rear strap, as shown in supplier references. Navy, Grey, White and Red colour preferences; exact fit and availability must be confirmed. AI-enhanced catalogue photos; request an unedited photo before ordering."
SIZES = "Adjustable - confirm size range"
IMAGES = [f"/images/products/gk-hc010/qi4d-cap-{c.lower()}.webp" for c in COLOURS]


def main(apply):
    database = ROOT / "backend/golf_kenya.db"
    db = sqlite3.connect(f"file:{database.as_posix()}?mode=rw", uri=True)
    db.row_factory = sqlite3.Row
    settings = dict(db.execute("SELECT key,value FROM settings"))
    if settings.get("auto_publish", "0") != "0":
        raise RuntimeError("Automatic publishing must be OFF")
    rate = float(settings.get("cny_to_kes", 19))
    usd_rate = float(settings.get("usd_to_kes", 129.5))
    cost_cny = COST_CNY
    cost_kes = round(cost_cny * rate)
    price_kes = round(cost_kes / .38)
    price_cny = round(price_kes / rate, 2)
    price_usd = round(price_kes / usd_rate, 2)
    catalog_path = ROOT / "lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    if db.execute("SELECT 1 FROM products WHERE sku=? OR lower(name)=lower(?)", (SKU, NAME)).fetchone() or any(p["sku"] == SKU for p in catalog["products"]):
        raise RuntimeError("Cap already exists; refusing duplicate addition")
    for image in IMAGES:
        if not (ROOT / "public" / image.lstrip("/")).is_file():
            raise FileNotFoundError(image)
    product = dict(sku=SKU, slug=SKU.lower(), name=NAME, categorySlug="hats_and_caps", categoryLabel="Hats & Caps", description=DESCRIPTION, priceKes=price_kes, priceCny=price_cny, priceUsd=price_usd, sizes=SIZES, colors=", ".join(COLOURS), status="Out of Stock", stock="0", featured=False, images=IMAGES)
    summary = dict(apply=apply, product=product, costCny=cost_cny, costKes=cost_kes, margin=.62, cnyToKes=rate, usdToKes=usd_rate, liveWebsiteVisible=False)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not apply:
        db.close()
        return
    backup = ROOT / ".tmp/backups" / (BACKUP_PREFIX + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        db.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")
    local_path = ROOT / ".tmp/admin-local-data.json"
    local = json.loads(local_path.read_text(encoding="utf-8")) if local_path.exists() else None
    if local:
        header = local["Sheet1"][0]
        if any(len(row) > header.index("SKU") and row[header.index("SKU")] == SKU for row in local["Sheet1"][1:]):
            raise RuntimeError("Cap already exists in local admin preview")
        shutil.copy2(local_path, backup / "admin-before.json")
    attrs = dict(margin=.62, cny_to_kes=rate, image_provenance="AI-enhanced supplier references", stock_confirmed=False, publication="offline draft")
    db.execute("""INSERT INTO products(sku,name,category_slug,description,price_kes,cost_cny,cost_kes,sizes,colors,status,stock,image,image_filename,extra_attrs,gallery,price_usd,price_cny,website_visible)
      VALUES(?,?,'hats_and_caps',?,?,?,?,?,?,'Out of Stock','0',?,?,?,?,?,?,0)""",
      (SKU, NAME, DESCRIPTION, price_kes, str(cost_cny), str(cost_kes), SIZES, product["colors"], IMAGES[0], IMAGES[0].removeprefix("/images/products/"), json.dumps(attrs), json.dumps([i.removeprefix("/images/products/") for i in IMAGES[1:]]), price_usd, price_cny))
    db.commit()
    db.close()
    catalog["products"].append(product)
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for image in IMAGES:
        target = ROOT / image.lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / "public" / image.lstrip("/"), target)
    if local:
        values = {"SKU": SKU, "Name": NAME, "Category": "hats_and_caps", "Description": DESCRIPTION, "Sizes": SIZES, "Colors": product["colors"], "Cost China (CNY)": cost_cny, "Cost China (Ksh)": cost_kes, "Selling Price (CNY)": price_cny, "Price Kenya (Ksh)": price_kes, "Selling Price (USD)": price_usd, "Status": "Out of Stock", "Stock": 0, "Image": IMAGES[0], "Website Visible": "FALSE"}
        local["Sheet1"].append([values.get(h, "") for h in header])
        local_path.write_text(json.dumps(local, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (backup / "addition.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved offline listing; no network writes or deployment. Backup: {backup}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    main(parser.parse_args().apply)
