"""Import Markdown files with simple front matter as private blog drafts.

The command plans by default. Pass --apply to back up the catalogue database and
insert or update draft rows. Published posts are never overwritten.
"""

import argparse
from datetime import datetime
from pathlib import Path
import shutil
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import blog_engine as blog


REQUIRED = (
    "slug",
    "title",
    "category",
    "seo_title",
    "meta_description",
    "excerpt",
)


def read_draft(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise ValueError(f"{path}: expected front matter beginning with ---")
    try:
        header, content = text[4:].split("\n---\n", 1)
    except ValueError as error:
        raise ValueError(f"{path}: front matter is not closed with ---") from error

    values: dict[str, str] = {}
    for number, line in enumerate(header.splitlines(), start=2):
        if not line.strip():
            continue
        if ":" not in line:
            raise ValueError(f"{path}:{number}: expected key: value")
        key, value = line.split(":", 1)
        values[key.strip()] = value.strip()

    missing = [key for key in REQUIRED if not values.get(key)]
    if missing:
        raise ValueError(f"{path}: missing {', '.join(missing)}")
    if values["category"] not in blog.BLOG_CATEGORIES:
        raise ValueError(
            f"{path}: category must be one of {', '.join(blog.BLOG_CATEGORIES)}"
        )
    if values.get("status", "draft") != "draft":
        raise ValueError(f"{path}: importer only accepts private drafts")
    if len(values["seo_title"]) > 60:
        raise ValueError(f"{path}: SEO title is longer than 60 characters")
    if len(values["meta_description"]) > 160:
        raise ValueError(f"{path}: meta description is longer than 160 characters")
    if not content.strip():
        raise ValueError(f"{path}: article content is empty")

    values["content"] = content.strip()
    values["author"] = values.get("author", "Karibu Golf editorial team")
    values["cover_image"] = values.get("cover_image", "")
    values["cover_alt"] = values.get("cover_alt", "")
    return values


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    drafts = [read_draft(path.resolve()) for path in args.files]
    if len({draft["slug"] for draft in drafts}) != len(drafts):
        raise ValueError("Draft slugs must be unique")

    db = ROOT / "backend/golf_kenya.db"
    if not db.exists():
        raise FileNotFoundError("Existing catalogue database required")

    with sqlite3.connect(db) as conn:
        conn.row_factory = sqlite3.Row
        blog.ensure_schema(conn)
        existing = {
            row["slug"]: dict(row)
            for row in conn.execute(
                f"SELECT slug, status FROM blog_posts WHERE slug IN ({','.join('?' for _ in drafts)})",
                [draft["slug"] for draft in drafts],
            )
        }

    for draft in drafts:
        current = existing.get(draft["slug"])
        if current and current["status"] == "published":
            raise ValueError(
                f"{draft['slug']}: refusing to overwrite an already-published post"
            )
        action = "update draft" if current else "create draft"
        print(f"{action}: {draft['slug']} — {draft['title']}")

    if not args.apply:
        print("Plan only. Re-run with --apply to write the private drafts.")
        return

    backup = ROOT / ".tmp/backups" / (
        "blog-import-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    )
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(db, backup / "golf_kenya.db")

    now = blog.utc_now()
    with sqlite3.connect(db) as conn:
        blog.ensure_schema(conn)
        for draft in drafts:
            conn.execute(
                """
                INSERT INTO blog_posts
                    (slug, title, excerpt, content, category, author,
                     cover_image, cover_alt, seo_title, meta_description,
                     status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?)
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
                    status='draft',
                    published_at=NULL,
                    updated_at=excluded.updated_at
                """,
                (
                    draft["slug"],
                    draft["title"],
                    draft["excerpt"],
                    draft["content"],
                    draft["category"],
                    draft["author"],
                    draft["cover_image"],
                    draft["cover_alt"],
                    draft["seo_title"],
                    draft["meta_description"],
                    now,
                    now,
                ),
            )
        conn.commit()

    print(f"Imported {len(drafts)} private drafts.")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
