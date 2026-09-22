"""Local blog storage and safe static publishing; never deploys or calls a network API."""
from datetime import datetime, timezone
from html import escape
from pathlib import Path
import json
import re
import sqlite3
import threading
import unicodedata
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup

ROOT = Path(__file__).resolve().parent
SITE_URL = "https://golfklcubskenya.netlify.app"
BLOG_CATEGORIES = ("Getting started", "Buying guides", "Where to play", "Golf life")
BUILD_LOCK = threading.RLock()
GENERATED_MARKER = "<!-- karibu-blog-generated -->"
ENV = Environment(loader=FileSystemLoader(str(ROOT / "templates" / "blog")),
                  autoescape=select_autoescape(["html", "xml"]))


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def ensure_schema(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'Getting started',
        author TEXT NOT NULL DEFAULT 'Karibu Golf editorial team',
        cover_image TEXT NOT NULL DEFAULT '',
        cover_alt TEXT NOT NULL DEFAULT '',
        seo_title TEXT NOT NULL DEFAULT '',
        meta_description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
        published_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )""")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_blog_status_published ON blog_posts(status, published_at DESC)")
    conn.execute("PRAGMA optimize")


def slugify(value):
    ascii_text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")[:100].rstrip("-")


def safe_link(value):
    """Only local links/fragments and ordinary HTTP(S) links; no script schemes."""
    if any(ord(c) < 32 for c in value) or "\\" in value:
        return ""
    if value.startswith(("/", "#")) and not value.startswith("//"):
        return value
    parsed = urlsplit(value)
    return value if parsed.scheme in ("https", "http") and parsed.netloc and not parsed.username else ""


def inline_text(text):
    # Escape everything first except links, which are validated and escaped separately.
    parts = []
    position = 0
    for match in re.finditer(r"\[([^\]\n]+)\]\(([^\s)]+)\)", text):
        parts.append(escape(text[position:match.start()]))
        label, href = match.groups()
        safe = safe_link(href)
        parts.append(f'<a href="{escape(safe, quote=True)}">{escape(label)}</a>' if safe else escape(label))
        position = match.end()
    parts.append(escape(text[position:]))
    result = "".join(parts)
    return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", result)


def render_content(content):
    """Small, documented Markdown subset. Raw HTML is always escaped."""
    blocks, paragraph, listing, toc = [], [], [], []
    list_type = None

    def flush():
        nonlocal list_type
        if paragraph:
            blocks.append("<p>" + inline_text(" ".join(paragraph)) + "</p>")
            paragraph.clear()
        if listing:
            blocks.append(f"<{list_type}>" + "".join(f"<li>{inline_text(x)}</li>" for x in listing) + f"</{list_type}>")
            listing.clear()
            list_type = None

    for line in content.splitlines() + [""]:
        line = line.strip()
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        bullet = re.match(r"^(?:[-*]|\d+\.)\s+(.+)$", line)
        if not line:
            flush()
        elif heading:
            flush()
            level = max(2, len(heading[1]))  # The post title is the only H1.
            anchor = f"section-{len(toc) + 1}"
            toc.append({"id": anchor, "title": heading[2]})
            blocks.append(f'<h{level} id="{anchor}">{inline_text(heading[2])}</h{level}>')
        elif bullet:
            kind = "ol" if line[0].isdigit() else "ul"
            if paragraph or (listing and list_type != kind):
                flush()
            list_type = kind
            listing.append(bullet[1])
        else:
            if listing:
                flush()
            paragraph.append(line)
    return Markup("\n".join(blocks)), toc


def published_posts(db_path):
    if not Path(db_path).exists():
        return []
    conn = sqlite3.connect(str(db_path))
    try:
        conn.row_factory = sqlite3.Row
        if not conn.execute("SELECT 1 FROM sqlite_master WHERE name='blog_posts'").fetchone():
            return []
        return [dict(row) for row in conn.execute(
            "SELECT * FROM blog_posts WHERE status='published' AND published_at <= ? ORDER BY published_at DESC, id DESC",
            (utc_now(),))]
    finally:
        conn.close()


def post_view(post, origin=SITE_URL):
    post = dict(post)
    if post.get("cover_image") and not re.fullmatch(r"/images/[A-Za-z0-9_./-]+", post["cover_image"]):
        post["cover_image"] = ""
    post["url"] = f'{origin}/blog/{post["slug"]}/'
    post["path"] = f'/blog/{post["slug"]}/'
    post["reading_minutes"] = max(1, (len(post["content"].split()) + 199) // 200)
    post["date_label"] = (post.get("published_at") or post["updated_at"])[:10]
    post["body_html"], post["toc"] = render_content(post["content"])
    return post


def render_page(posts, post=None, origin=SITE_URL, preview=False, nav="", footer=""):
    posts = [post_view(p, origin) for p in posts]
    detail = post_view(post, origin) if post else None
    title = (detail["seo_title"] or detail["title"]) if detail else "Kenya Golf Blog & Buying Guides | Karibu Golf"
    description = (detail["meta_description"] or detail["excerpt"]) if detail else "Practical guides for golfers in Kenya. Learn where to start, what to buy and how to prepare for your next round with the Karibu Golf Journal."
    canonical = detail["url"] if detail else origin + "/blog/"
    image_path = detail["cover_image"] if detail else "/images/blog/karibu-journal-social.png"
    image = origin + image_path if image_path else ""
    crumbs = [{"@type": "ListItem", "position": 1, "name": "Home", "item": origin + "/"},
              {"@type": "ListItem", "position": 2, "name": "Journal", "item": origin + "/blog/"}]
    schema = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": crumbs}]
    if detail:
        crumbs.append({"@type": "ListItem", "position": 3, "name": detail["title"], "item": canonical})
        article = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": detail["title"],
                   "description": description, "mainEntityOfPage": canonical, "url": canonical,
                   "dateModified": detail["updated_at"], "inLanguage": "en-KE",
                   "author": {"@type": "Organization" if detail["author"] == "Karibu Golf editorial team" else "Person", "name": detail["author"]},
                   "publisher": {"@type": "Organization", "name": "Karibu Golf", "url": origin}}
        if detail.get("published_at"):
            article["datePublished"] = detail["published_at"]
        if image:
            article["image"] = [image]
        schema.append(article)
    else:
        schema.append({"@context": "https://schema.org", "@type": "Blog", "name": "The Kenya Golf Journal",
                       "url": canonical, "inLanguage": "en-KE"})
    # Avoid script-tag breakouts in JSON-LD from user-entered text.
    schema_json = Markup(json.dumps(schema, ensure_ascii=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026"))
    return ENV.get_template("page.html").render(posts=posts, post=detail, title=title,
        description=description, canonical=canonical, image=image, schema_json=schema_json,
        preview=preview, nav=Markup(nav), footer=Markup(footer), categories=BLOG_CATEGORIES,
        year=datetime.now().year)


def atomic_text(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def build_blog(db_path, output_dir, origin=SITE_URL):
    """Refresh only blog-owned files and sitemap entries, preserving existing storefront edits."""
    from generate import render_nav, render_footer
    with BUILD_LOCK:
        output = Path(output_dir).resolve()
        blog_dir = output / "blog"
        if blog_dir.is_symlink():
            raise ValueError("Blog output cannot be a symbolic link")
        posts = published_posts(db_path)
        nav, footer = render_nav("blog"), render_footer()
        pages = {"index.html": render_page(posts, origin=origin, nav=nav, footer=footer)}
        for post in posts:
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", post["slug"]):
                raise ValueError("Invalid stored blog slug")
            pages[f'{post["slug"]}/index.html'] = render_page(posts, post, origin, nav=nav, footer=footer)
        for relative, html in pages.items():
            target = blog_dir / relative
            if not target.resolve().is_relative_to(blog_dir.resolve()):
                raise ValueError("Invalid blog output path")
            atomic_text(target, GENERATED_MARKER + "\n" + html)
        atomic_text(blog_dir / "blog.css", (ROOT / "templates/blog/blog.css").read_text(encoding="utf-8"))
        # Only withdraw pages generated by this module; never delete unrelated files.
        for stale in blog_dir.glob("*/index.html"):
            if (stale.relative_to(blog_dir).as_posix() not in pages
                    and stale.resolve().is_relative_to(blog_dir.resolve())
                    and stale.read_text(encoding="utf-8").startswith(GENERATED_MARKER)):
                stale.unlink()
        update_sitemap(output, posts, origin)
        write_feed(output, posts, origin)
        return len(posts)


def update_sitemap(output, posts, origin):
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", ns)
    path = output / "sitemap.xml"
    root = ET.parse(path).getroot() if path.exists() else ET.Element(f"{{{ns}}}urlset")
    for node in list(root):
        loc = node.find(f"{{{ns}}}loc")
        if loc is not None and urlsplit(loc.text or "").path.startswith("/blog/"):
            root.remove(node)
    entries = [(origin + "/blog/", max((p["updated_at"] for p in posts), default=""))]
    entries += [(origin + f'/blog/{p["slug"]}/', p["updated_at"]) for p in posts]
    for url, modified in entries:
        node = ET.SubElement(root, f"{{{ns}}}url")
        ET.SubElement(node, f"{{{ns}}}loc").text = url
        if modified:
            ET.SubElement(node, f"{{{ns}}}lastmod").text = modified
    atomic_text(path, '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode"))


def write_feed(output, posts, origin):
    from email.utils import format_datetime
    root = ET.Element("rss", version="2.0")
    channel = ET.SubElement(root, "channel")
    for key, value in {"title": "The Kenya Golf Journal | Karibu Golf", "link": origin + "/blog/",
                       "description": "Practical golf guides for Kenya", "language": "en-ke"}.items():
        ET.SubElement(channel, key).text = value
    for post in posts[:30]:
        item = ET.SubElement(channel, "item")
        url = origin + f'/blog/{post["slug"]}/'
        for key, value in {"title": post["title"], "link": url, "guid": url,
                           "description": post["excerpt"], "pubDate": format_datetime(datetime.fromisoformat(post["published_at"]))}.items():
            ET.SubElement(item, key).text = value
    atomic_text(output / "blog/feed.xml", '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode"))
