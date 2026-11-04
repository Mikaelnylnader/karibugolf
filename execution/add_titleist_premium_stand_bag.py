"""Add GK-BG019 locally, plan by default. No Sheet calls, Git or deployment.

Owner cost: 1800 RMB; current admin defaults: 19 KSh/RMB, 129.5 KSh/USD;
standing 62% gross margin. Official reference is TB20SXSF-01, not verified
identification or authenticity of the supplied physical bag.
"""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).absolute().parents[1]
SKU="GK-BG019"
COST_CNY=1800
BACKUP_PREFIX="titleist-premium-bag-"
EXTRA_ATTRS=dict(reference_model="TB20SXSF-01",model_label_verified=False,source_url="https://www.titleist.com/product/premium-stand-bag/051GB1T.html")
NAME="Titleist Premium Stand Bag - Black/White"
DESCRIPTION="Black/White Titleist stand bag visually matched to the Tour-inspired Premium Stand Bag (manufacturer reference TB20SXSF-01). Exact model label, condition, accessories and availability must be confirmed. AI-enhanced supplied-photo references; official specifications are not verified measurements of this item."
SIZES="Stand bag - confirm model label"
COLOURS="Black / White"
VIEWS=["hero","top-front","rear","upright-side"]
IMAGES=[f"/images/products/gk-bg019/titleist-premium-stand-bag-{view}.webp" for view in VIEWS]


def main(apply):
    db=sqlite3.connect(f"file:{(ROOT/'backend/golf_kenya.db').as_posix()}?mode=rw",uri=True)
    db.row_factory=sqlite3.Row
    settings=dict(db.execute("SELECT key,value FROM settings"))
    if settings.get("auto_publish","0")!="0":
        raise RuntimeError("Automatic publishing must stay OFF")
    if db.execute("SELECT 1 FROM products WHERE sku=? OR lower(name)=lower(?)",(SKU,NAME)).fetchone():
        raise RuntimeError("Existing bag; refusing duplicate add")
    catalog_path=ROOT/"lib/catalog.generated.json"
    catalog=json.loads(catalog_path.read_text(encoding="utf-8"))
    if any(p["sku"]==SKU for p in catalog["products"]):
        raise RuntimeError("Bag already exists in catalogue")
    for image in IMAGES:
        if not (ROOT/"public"/image.lstrip("/")).is_file():
            raise FileNotFoundError(image)
    rate=float(settings.get("cny_to_kes",19)); usd_rate=float(settings.get("usd_to_kes",129.5))
    cost=COST_CNY; cost_kes=round(cost*rate); price=round(cost_kes/.38)
    price_cny=round(price/rate,2); price_usd=round(price/usd_rate,2)
    product=dict(sku=SKU,slug=SKU.lower(),name=NAME,categorySlug="bags",categoryLabel="Golf Bags",description=DESCRIPTION,priceKes=price,priceCny=price_cny,priceUsd=price_usd,sizes=SIZES,colors=COLOURS,status="Out of Stock",stock="0",featured=False,images=IMAGES)
    summary=dict(apply=apply,product=product,costCny=cost,costKes=cost_kes,margin=.62,cnyToKes=rate,usdToKes=usd_rate,websiteVisible=False)
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    if not apply:
        db.close();return
    backup=ROOT/".tmp/backups"/(BACKUP_PREFIX+datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup/"catalog-before.db") as saved:db.backup(saved)
    shutil.copy2(catalog_path,backup/"catalog-before.json")
    local_path=ROOT/".tmp/admin-local-data.json"
    local=json.loads(local_path.read_text(encoding="utf-8")) if local_path.exists() else None
    if local:
        headers=local["Sheet1"][0]
        if any(len(r)>headers.index("SKU") and r[headers.index("SKU")]==SKU for r in local["Sheet1"][1:]):
            raise RuntimeError("Local admin already contains this SKU")
        shutil.copy2(local_path,backup/"admin-before.json")
    attrs=dict(margin=.62,stock_confirmed=False,publication="offline draft",**EXTRA_ATTRS)
    db.execute("""INSERT INTO products(sku,name,category_slug,description,price_kes,cost_cny,cost_kes,sizes,colors,status,stock,image,image_filename,extra_attrs,gallery,price_usd,price_cny,website_visible)
      VALUES(?,?,'bags',?,?,?,?,?,?,'Out of Stock','0',?,?,?,?,?,?,0)""",
      (SKU,NAME,DESCRIPTION,price,str(cost),str(cost_kes),SIZES,COLOURS,IMAGES[0],IMAGES[0].removeprefix("/images/products/"),json.dumps(attrs),json.dumps([i.removeprefix("/images/products/") for i in IMAGES[1:]]),price_usd,price_cny))
    db.commit();db.close()
    catalog["products"].append(product)
    catalog["generatedAt"]=datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if local:
        values={"SKU":SKU,"Name":NAME,"Category":"bags","Description":DESCRIPTION,"Sizes":SIZES,"Colors":COLOURS,"Cost China (CNY)":cost,"Cost China (Ksh)":cost_kes,"Selling Price (CNY)":price_cny,"Price Kenya (Ksh)":price,"Selling Price (USD)":price_usd,"Status":"Out of Stock","Stock":0,"Image":IMAGES[0],"Website Visible":"FALSE"}
        local["Sheet1"].append([values.get(h,"") for h in headers])
        local_path.write_text(json.dumps(local,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (backup/"addition.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Saved local bag; no network or publication. Backup:",backup)


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--apply",action="store_true")
    main(parser.parse_args().apply)
