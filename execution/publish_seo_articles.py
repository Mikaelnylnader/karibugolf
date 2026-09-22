#!/usr/bin/env python3
"""Back up the catalogue DB, publish the curated SEO article set, and rebuild the blog."""

from datetime import datetime
import json
from pathlib import Path
import sqlite3
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import blog_engine as blog

DATABASE = ROOT / "backend" / "golf_kenya.db"
ARTICLES = ROOT / "content" / "seo-articles-2026.json"


def validate(article):
    required = {
        "title", "slug", "excerpt", "content", "category", "author",
        "cover_image", "cover_alt", "seo_title", "meta_description",
    }
    missing = required - article.keys()
    if missing:
        raise ValueError(f"{article.get('slug', 'article')}: missing {sorted(missing)}")
    if article["category"] not in blog.BLOG_CATEGORIES:
        raise ValueError(f"{article['slug']}: invalid category")
    if len(article["seo_title"]) > 90 or len(article["meta_description"]) > 200:
        raise ValueError(f"{article['slug']}: SEO metadata is too long")
    if len(article["content"].split()) < 700:
        raise ValueError(f"{article['slug']}: article is under 700 words")
    if not article["content"].count("## Frequently asked questions") == 1:
        raise ValueError(f"{article['slug']}: requires one FAQ section")
    if "## Sources" not in article["content"]:
        raise ValueError(f"{article['slug']}: requires a sources section")


def main():
    articles = json.loads(ARTICLES.read_text(encoding="utf-8"))
    if len(articles) != 5 or len({article["slug"] for article in articles}) != 5:
        raise ValueError("Exactly five articles with unique slugs are required")
    for article in articles:
        validate(article)

    backup_dir = ROOT / ".tmp" / "backups" / f"seo-blog-{datetime.now():%Y%m%d-%H%M%S-%f}"
    backup_dir.mkdir(parents=True)
    connection = sqlite3.connect(DATABASE)
    backup = sqlite3.connect(backup_dir / "catalog.db")
    connection.backup(backup)
    backup.close()
    blog.ensure_schema(connection)

    now = blog.utc_now()
    for article in articles:
        values = tuple(article[key] for key in (
            "slug", "title", "excerpt", "content", "category", "author",
            "cover_image", "cover_alt", "seo_title", "meta_description",
        ))
        connection.execute("""
            INSERT INTO blog_posts
                (slug,title,excerpt,content,category,author,cover_image,cover_alt,
                 seo_title,meta_description,status,published_at,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,'published',?,?,?)
            ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
                category=excluded.category, author=excluded.author,
                cover_image=excluded.cover_image, cover_alt=excluded.cover_alt,
                seo_title=excluded.seo_title, meta_description=excluded.meta_description,
                status='published', published_at=COALESCE(blog_posts.published_at, excluded.published_at),
                updated_at=excluded.updated_at
        """, values + (now, now, now))
    connection.commit()
    connection.close()

    count = blog.build_blog(DATABASE, ROOT / "dist", blog.SITE_URL)
    print(f"Published articles in generated blog: {count}")
    print(f"Backup: {backup_dir / 'catalog.db'}")
    for article in articles:
        print(f"- {blog.SITE_URL}/blog/{article['slug']}/ ({len(article['content'].split())} words)")


if __name__ == "__main__":
    main()
