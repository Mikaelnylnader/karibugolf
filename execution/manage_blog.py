"""Initialize/seed draft posts and build the local journal without deploying or rebuilding the catalog."""
import argparse
from datetime import datetime
import json
from pathlib import Path
import shutil
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import blog_engine as blog


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed-drafts", action="store_true")
    parser.add_argument("--link-nav", action="store_true")
    args = parser.parse_args()
    db = ROOT / "backend/golf_kenya.db"
    if not db.exists():
        raise FileNotFoundError("Existing catalog database required")
    backup = ROOT / ".tmp/backups" / ("blog-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f"))
    backup.mkdir(parents=True)
    with sqlite3.connect(db) as conn:
        with sqlite3.connect(backup / "catalog.db") as saved:
            conn.backup(saved)
        blog.ensure_schema(conn)
        if args.seed_drafts:
            seeds = json.loads((ROOT / "content/blog-starters.json").read_text(encoding="utf-8"))
            for seed in seeds:
                now = blog.utc_now()
                conn.execute("""INSERT OR IGNORE INTO blog_posts
                    (slug,title,excerpt,content,category,seo_title,meta_description,status,created_at,updated_at)
                    VALUES (?,?,?,?,?,?,?,'draft',?,?)""", tuple(seed[key] for key in
                    ("slug", "title", "excerpt", "content", "category", "seo_title", "meta_description")) + (now, now))
        conn.commit()
    if args.link_nav:
        nav = '<li><a href="/#products" class="nav-link">Shop</a></li>'
        foot = '<li><a href="/#products">Shop</a></li>'
        changed = 0
        for path in (ROOT / "dist").rglob("*.html"):
            if "blog" in path.relative_to(ROOT / "dist").parts or path.is_symlink():
                continue
            content = path.read_text(encoding="utf-8")
            if 'href="/blog/"' in content:
                continue
            updated = content.replace(nav, nav + '\n                <li><a href="/blog/" class="nav-link">Journal</a></li>')
            updated = updated.replace(foot, foot + '\n                        <li><a href="/blog/">Golf Journal</a></li>')
            if updated != content:
                saved_path = backup / "navigation" / path.relative_to(ROOT / "dist")
                saved_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, saved_path)
                blog.atomic_text(path, updated)
                changed += 1
        print(f"Navigation updated on {changed} pages; originals backed up.")
    count = blog.build_blog(db, ROOT / "dist")
    print(f"Local journal ready: {count} published posts. Drafts remain private to the admin.")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
