"""Prepare matching AI colour views and refresh only the offline TaylorMade stand bag gallery."""
import argparse
import json
import shutil
import sqlite3
import subprocess
import hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(__file__).absolute().parents[1]
SKU = "GK-BG020"
from add_taylormade_stand_bag import bag as config
IMAGES = config.IMAGES


def main(apply):
    jobs = json.loads((ROOT/".tmp/taylormade-stand-bag/expanded-jobs.json").read_text(encoding="utf-8"))
    assert len(jobs["records"]) == 16
    db = sqlite3.connect(f"file:{(ROOT/'backend/golf_kenya.db').as_posix()}?mode=rw", uri=True)
    db.row_factory = sqlite3.Row
    before = [dict(r) for r in db.execute("SELECT * FROM products ORDER BY id")]
    product = next(r for r in before if r["sku"] == SKU)
    settings = dict(db.execute("SELECT key,value FROM settings"))
    assert settings.get("auto_publish","0") == "0"
    catalog_path = ROOT/"lib/catalog.generated.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    target = next(p for p in catalog["products"] if p["sku"] == SKU)
    assert product["price_kes"] == target["priceKes"] == 27500
    print(json.dumps(dict(apply=apply,sku=SKU,colourViews=26,groupPhoto="lower overview section only",priceKes=27500)))
    if not apply:
        db.close()
        return
    backup = ROOT/".tmp/backups"/("taylormade-stand-gallery-"+datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"))
    backup.mkdir(parents=True)
    with sqlite3.connect(backup/"catalog-before.db") as saved:
        db.backup(saved)
    shutil.copy2(catalog_path,backup/"catalog-before.json")
    for job in jobs["records"]:
        image = f"images/products/gk-bg020/taylormade-stand-bag-{job['colour']}-{job['view']}.webp"
        output = ROOT/"public"/image
        if not output.exists():
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-n","-i",job["source"],"-frames:v","1","-c:v","libwebp","-quality","90","-compression_level","6",str(output)],check=True)
        shutil.copy2(output,ROOT/image)
        job["output"] = str(output)
        job["sha256"] = hashlib.sha256(output.read_bytes()).hexdigest()
    for image in IMAGES:
        assert (ROOT/"public"/image.lstrip("/")).is_file()
    db.execute("UPDATE products SET gallery=? WHERE sku=?",(json.dumps([i.removeprefix("/images/products/") for i in IMAGES[1:]]),SKU))
    assert db.total_changes == 1
    db.commit()
    after = [dict(r) for r in db.execute("SELECT * FROM products ORDER BY id")]
    for a,b in zip(after,before):
        assert {k:v for k,v in a.items() if k!="gallery"} == {k:v for k,v in b.items() if k!="gallery"}
        if a["sku"]!=SKU:
            assert a==b
    db.close()
    target["images"] = IMAGES
    catalog["generatedAt"] = datetime.now(timezone.utc).isoformat()
    catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (ROOT/".tmp/taylormade-stand-bag/expanded-manifest.json").write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Gallery updated locally. Costs, price, stock and visibility unchanged. Backup:",backup)


if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    main(parser.parse_args().apply)
