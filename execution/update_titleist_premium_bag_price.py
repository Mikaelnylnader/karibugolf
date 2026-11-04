"""Owner-approved GK-BG019 price override. Local only; plan unless --apply."""
import argparse
import copy
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).absolute().parents[1]
SKU = "GK-BG019"
PRICE = 49000


def main(apply=False):
    db = sqlite3.connect(f"file:{(ROOT/'backend/golf_kenya.db').as_posix()}?mode=rw", uri=True)
    db.row_factory = sqlite3.Row
    settings = dict(db.execute("SELECT key,value FROM settings"))
    if settings.get("auto_publish", "0") != "0":
        raise RuntimeError("Automatic publishing must remain off")
    records = [dict(r) for r in db.execute("SELECT * FROM products ORDER BY id")]
    matches = [r for r in records if r["sku"] == SKU]
    assert len(matches) == 1
    record = matches[0]
    assert float(record["cost_cny"]) == 1800 and float(record["cost_kes"]) == 34200
    cny_rate = float(settings.get("cny_to_kes", 19))
    usd_rate = float(settings.get("usd_to_kes", 129.5))
    cny, usd = round(PRICE / cny_rate, 2), round(PRICE / usd_rate, 2)
    margin = (PRICE - float(record["cost_kes"])) / PRICE
    attrs = json.loads(record["extra_attrs"] or "{}")
    attrs.update(margin=margin, price_override_kes=PRICE, pricing_basis="owner-approved fixed KSh price")
    catalog_path = ROOT / "lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    original_catalog = copy.deepcopy(catalog)
    products = [p for p in catalog["products"] if p["sku"] == SKU]
    assert len(products) == 1
    products[0].update(priceKes=PRICE, priceCny=cny, priceUsd=usd)
    fixtures = []
    for relative in [".tmp/admin-local-data.json", ".tmp/titleist-premium-bag/admin-preview.json"]:
        file = ROOT / relative
        if not file.exists():
            continue
        data = json.loads(file.read_text(encoding="utf-8"))
        headers = data["Sheet1"][0]
        rows = [r for r in data["Sheet1"][1:] if r[headers.index("SKU")] == SKU]
        assert len(rows) == 1
        for key, value in {"Price Kenya (Ksh)": PRICE, "Selling Price (CNY)": cny, "Selling Price (USD)": usd, "Margin": margin, "Profit CNY": round(cny-1800, 2), "Profit (CNY)": round(cny-1800, 2), "Profit Ksh": PRICE-34200}.items():
            if key in headers:
                rows[0][headers.index(key)] = value
        fixtures.append((file, data))
    print(json.dumps(dict(apply=apply, sku=SKU, previousPrice=record["price_kes"], priceKes=PRICE, priceCny=cny, priceUsd=usd, margin=margin, costCny=1800, costKes=34200), indent=2))
    if not apply:
        db.close()
        return
    backup = ROOT / ".tmp/backups" / ("titleist-premium-price-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup / "catalog-before.db") as saved:
        db.backup(saved)
    shutil.copy2(catalog_path, backup / "catalog-before.json")
    for index, (file, data) in enumerate(fixtures):
        shutil.copy2(file, backup / f"fixture-{index}-before.json")
        file.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    db.execute("UPDATE products SET price_kes=?,price_cny=?,price_usd=?,extra_attrs=? WHERE sku=?", (PRICE, cny, usd, json.dumps(attrs), SKU))
    assert db.total_changes == 1
    db.commit()
    after = [dict(r) for r in db.execute("SELECT * FROM products ORDER BY id")]
    assert [r for r in after if r["sku"] != SKU] == [r for r in records if r["sku"] != SKU]
    saved = next(r for r in after if r["sku"] == SKU)
    assert {k:v for k,v in saved.items() if k not in {"price_kes","price_cny","price_usd","extra_attrs"}} == {k:v for k,v in record.items() if k not in {"price_kes","price_cny","price_usd","extra_attrs"}}
    db.close()
    assert [p for p in catalog["products"] if p["sku"] != SKU] == [p for p in original_catalog["products"] if p["sku"] != SKU]
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print("Local price updated; no network/publishing. Backup:", backup)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    main(parser.parse_args().apply)
