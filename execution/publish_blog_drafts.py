#!/usr/bin/env python3
"""Promote reviewed Markdown blog drafts into the public article collection.

The command plans by default. Pass --apply to back up the catalogue database and
article JSON, update the public source collection, and mark the matching database
rows as published. The website still needs its normal static build and deploy.
"""

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
from execution.import_blog_drafts import read_draft


DATABASE = ROOT / "backend" / "golf_kenya.db"
ARTICLES = ROOT / "content" / "seo-articles-2026.json"


def public_article(draft: dict[str, str]) -> dict[str, str]:
    for key in ("author", "cover_image", "cover_alt"):
        if not draft.get(key):
            raise ValueError(f"{draft['slug']}: {key} is required for publication")
    if not draft["cover_image"].startswith("/images/"):
        raise ValueError(f"{draft['slug']}: cover_image must use /images/")
    image = ROOT / "public" / draft["cover_image"].removeprefix("/")
    if not image.is_file() or image.stat().st_size == 0:
        raise ValueError(f"{draft['slug']}: cover image is missing or empty: {image}")
    if len(draft["content"].split()) < 700:
        raise ValueError(f"{draft['slug']}: article is under 700 words")
    if "## Frequently asked questions" not in draft["content"]:
        raise ValueError(f"{draft['slug']}: FAQ section is required")
    if "## Sources" not in draft["content"]:
        raise ValueError(f"{draft['slug']}: sources section is required")
    return {
        key: draft[key]
        for key in (
            "title",
            "slug",
            "excerpt",
            "category",
            "author",
            "cover_image",
            "cover_alt",
            "seo_title",
            "meta_description",
            "content",
        )
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    drafts = [read_draft(path.resolve()) for path in args.files]
    promoted = [public_article(draft) for draft in drafts]
    slugs = [article["slug"] for article in promoted]
    if len(set(slugs)) != len(slugs):
        raise ValueError("Draft slugs must be unique")

    articles = json.loads(ARTICLES.read_text(encoding="utf-8"))
    existing_by_slug = {article["slug"]: article for article in articles}
    if len(existing_by_slug) != len(articles):
        raise ValueError("Public article collection contains duplicate slugs")

    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row
        blog.ensure_schema(connection)
        database_posts = {
            row["slug"]: dict(row)
            for row in connection.execute(
                f"SELECT slug, status FROM blog_posts WHERE slug IN ({','.join('?' for _ in slugs)})",
                slugs,
            )
        }

    for article in promoted:
        source_action = "update public article" if article["slug"] in existing_by_slug else "add public article"
        database_action = database_posts.get(article["slug"], {}).get("status", "missing")
        print(f"{source_action}: {article['slug']} (database: {database_action})")

    if not args.apply:
        print("Plan only. Re-run with --apply to publish the reviewed articles locally.")
        return

    backup_dir = ROOT / ".tmp" / "backups" / (
        "blog-publish-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    )
    backup_dir.mkdir(parents=True, exist_ok=False)
    shutil.copy2(DATABASE, backup_dir / "golf_kenya.db")
    shutil.copy2(ARTICLES, backup_dir / ARTICLES.name)

    promoted_by_slug = {article["slug"]: article for article in promoted}
    updated_articles = [
        promoted_by_slug.get(article["slug"], article) for article in articles
    ]
    updated_articles.extend(
        article for article in promoted if article["slug"] not in existing_by_slug
    )
    blog.atomic_text(
        ARTICLES,
        json.dumps(updated_articles, ensure_ascii=False, indent=2) + "\n",
    )

    now = blog.utc_now()
    with sqlite3.connect(DATABASE) as connection:
        blog.ensure_schema(connection)
        for article in promoted:
            values = tuple(
                article[key]
                for key in (
                    "slug",
                    "title",
                    "excerpt",
                    "content",
                    "category",
                    "author",
                    "cover_image",
                    "cover_alt",
                    "seo_title",
                    "meta_description",
                )
            )
            connection.execute(
                """
                INSERT INTO blog_posts
                    (slug, title, excerpt, content, category, author,
                     cover_image, cover_alt, seo_title, meta_description,
                     status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
                ON CONFLICT(slug) DO UPDATE SET
                    title=excluded.title,
                    excerpt=excluded.excerpt,
                    content=excluded.content,
                    category=excluded.category,
                    author=excluded.author,
                    cover_image=excluded.cover_image,
                    cover_alt=excluded.cover_alt,
                    seo_title=excluded.seo_title,
                    meta_description=excluded.meta_description,
                    status='published',
                    published_at=COALESCE(blog_posts.published_at, excluded.published_at),
                    updated_at=excluded.updated_at
                """,
                values + (now, now, now),
            )
        connection.commit()

    print(f"Published {len(promoted)} articles into the local production source.")
    print(f"Backup: {backup_dir}")


if __name__ == "__main__":
    main()
