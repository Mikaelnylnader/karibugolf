import io
import json
from pathlib import Path
import re
import sqlite3
import sys
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

from flask import Flask
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))
import blog_engine as blog
from blog_admin import register_blog


class BlogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.output = Path(self.temp.name) / "dist"
        self.output.mkdir()
        self.database = Path(self.temp.name) / "test.db"
        self.app = Flask("blog_test", template_folder=str(ROOT / "backend/templates"))
        self.app.config.update(TESTING=True, SECRET_KEY="tests-only")
        register_blog(self.app, self.get_db, self.output, lambda: self.database)
        conn = self.get_db()
        blog.ensure_schema(conn)
        conn.commit()
        conn.close()
        self.client = self.app.test_client()
        with self.client.session_transaction() as session:
            session["blog_csrf"] = "test-token"

    def tearDown(self):
        self.temp.cleanup()

    def get_db(self):
        conn = sqlite3.connect(self.database)
        conn.row_factory = sqlite3.Row
        return conn

    def fields(self, **changes):
        data = {"csrf_token": "test-token", "title": "Getting started in Nairobi", "slug": "nairobi-golf",
                "excerpt": "A practical local introduction.", "content": "An original introduction.\n\n## Your first lesson\n\nTry a coached session.\n\n- Ask about clubs\n- Check access\n\n[Shop](/categories/)",
                "category": "Getting started", "author": "Karibu Golf editorial team", "seo_title": "Golf in Nairobi | Karibu",
                "meta_description": "Plan a first session and choose what to bring.", "cover_alt": "", "action": "draft"}
        data.update(changes)
        return data

    def stored(self, post_id=1):
        conn = self.get_db()
        try:
            row = conn.execute("SELECT * FROM blog_posts WHERE id=?", (post_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def test_draft_persistence_editor_and_noindex_preview(self):
        result = self.client.post("/blog/new", data=self.fields())
        self.assertEqual(result.status_code, 302)
        self.assertEqual(self.stored()["status"], "draft")
        self.assertEqual(blog.published_posts(self.database), [])
        blog.build_blog(self.database, self.output)
        self.assertFalse((self.output / "blog/nairobi-golf/index.html").exists())
        preview = self.client.get("/blog/1/preview")
        self.assertEqual(preview.status_code, 200)
        self.assertIn("noindex", preview.headers["X-Robots-Tag"])
        self.assertIn("Your first lesson", preview.text)
        self.assertEqual(self.client.get("/blog/1/edit").status_code, 200)
        self.assertEqual(self.client.get("/blog").status_code, 200)
        self.assertEqual(self.client.get("/blog/plan").status_code, 200)

    def test_publish_updates_html_sitemap_feed_and_never_deploys(self):
        existing_sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://golfklcubskenya.netlify.app/categories/</loc></url></urlset>'
        (self.output / "sitemap.xml").write_text(existing_sitemap, encoding="utf-8")
        with patch("subprocess.run", side_effect=AssertionError("No deploy subprocess permitted")):
            result = self.client.post("/blog/new", data=self.fields(action="publish"))
        self.assertEqual(result.status_code, 302)
        post = self.stored()
        self.assertEqual(post["status"], "published")
        html = (self.output / "blog/nairobi-golf/index.html").read_text(encoding="utf-8")
        self.assertEqual(len(re.findall(r"<h1[ >]", html)), 1)
        self.assertIn('<meta property="og:type" content="article">', html)
        self.assertIn('<title>Golf in Nairobi | Karibu</title>', html)
        self.assertIn('rel="canonical" href="https://karibugolf.com/blog/nairobi-golf/"', html)
        schemas = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)[1])
        article = schemas[1]
        self.assertEqual(article["@type"], "BlogPosting")
        self.assertEqual(article["headline"], post["title"])
        self.assertEqual(article["datePublished"], post["published_at"])
        self.assertNotIn("image", article)  # No inherited site-wide image for a post without a cover.
        self.assertNotIn('property="og:image"', html)
        self.assertEqual(article["author"]["name"], post["author"])
        sitemap = ET.parse(self.output / "sitemap.xml")
        urls = [x.text for x in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        # Blog publishing preserves existing non-blog sitemap URLs verbatim.
        self.assertIn("https://golfklcubskenya.netlify.app/categories/", urls)
        self.assertIn(blog.SITE_URL + "/blog/nairobi-golf/", urls)
        feed = ET.parse(self.output / "blog/feed.xml")
        self.assertEqual(feed.findtext("channel/item/title"), post["title"])

    def test_edit_stable_slug_and_unpublish_withdraws_only_generated_files(self):
        self.client.post("/blog/new", data=self.fields(action="publish"))
        first_date = self.stored()["published_at"]
        self.client.post("/blog/1/edit", data=self.fields(action="publish", slug="changed-url", title="Updated title"))
        self.assertEqual(self.stored()["slug"], "nairobi-golf")
        self.assertEqual(self.stored()["published_at"], first_date)
        self.assertIn("Updated title", (self.output / "blog/nairobi-golf/index.html").read_text(encoding="utf-8"))
        unrelated = self.output / "blog/manual/index.html"
        unrelated.parent.mkdir()
        unrelated.write_text("Unrelated user page", encoding="utf-8")
        self.client.post("/blog/1/edit", data=self.fields(action="draft"))
        self.assertFalse((self.output / "blog/nairobi-golf/index.html").exists())
        self.assertEqual(unrelated.read_text(), "Unrelated user page")
        self.assertNotIn("nairobi-golf", (self.output / "sitemap.xml").read_text())
        self.assertNotIn("nairobi-golf", (self.output / "blog/feed.xml").read_text())

    def test_form_errors_csrf_and_unknown_posts(self):
        self.assertEqual(self.client.post("/blog/new", data=self.fields(csrf_token="")).status_code, 400)
        self.assertEqual(self.client.post("/blog/new", data=self.fields(title="")).status_code, 400)
        self.assertEqual(self.client.post("/blog/new", data=self.fields(action="publish", content="")).status_code, 400)
        self.assertEqual(self.client.post("/blog/new", data=self.fields(category="Unknown")).status_code, 400)
        self.assertEqual(self.client.get("/blog/99/preview").status_code, 404)
        self.client.post("/blog/new", data=self.fields())
        self.assertEqual(self.client.post("/blog/new", data=self.fields()).status_code, 400)
        self.assertEqual(len(blog.published_posts(self.database)), 0)

    def test_content_and_metadata_are_escaped(self):
        payload = '</script><script>alert("x")</script>'
        data = self.fields(title=payload, seo_title=payload, content='## Title\n\n<script>alert(1)</script>\n\n[bad](javascript:alert) [good](https://example.com) **bold**', action="publish")
        self.client.post("/blog/new", data=data)
        html = (self.output / "blog/nairobi-golf/index.html").read_text(encoding="utf-8")
        self.assertNotIn(payload, html)
        self.assertNotIn('href="javascript:', html)
        self.assertIn('<a href="https://example.com">good</a>', html)
        self.assertIn('<strong>bold</strong>', html)
        schemas = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)[1])
        self.assertEqual(schemas[1]["headline"], payload)

    def test_cover_upload_validated_and_record_specific_metadata(self):
        stream = io.BytesIO()
        Image.new("RGB", (10, 10), "green").save(stream, format="PNG")
        stream.seek(0)
        data = self.fields(action="publish", cover_alt="A golf image", cover_upload=(stream, "golf.png"))
        self.assertEqual(self.client.post("/blog/new", data=data).status_code, 302)
        post = self.stored()
        self.assertTrue((self.output / post["cover_image"].lstrip("/")).exists())
        html = (self.output / "blog/nairobi-golf/index.html").read_text(encoding="utf-8")
        self.assertIn(blog.SITE_URL + post["cover_image"], html)
        bad = self.fields(slug="bad-upload", cover_upload=(io.BytesIO(b"<svg onload=alert(1)>"), "image.png"))
        self.assertEqual(self.client.post("/blog/new", data=bad).status_code, 400)

    def test_migration_idempotent_preserves_rows_and_index(self):
        self.client.post("/blog/new", data=self.fields())
        conn = self.get_db()
        blog.ensure_schema(conn)
        blog.ensure_schema(conn)
        self.assertEqual(conn.execute("SELECT COUNT(*) FROM blog_posts").fetchone()[0], 1)
        plan = conn.execute("EXPLAIN QUERY PLAN SELECT * FROM blog_posts WHERE status='published' ORDER BY published_at DESC").fetchall()
        self.assertIn("idx_blog_status_published", str([tuple(row) for row in plan]))
        conn.close()

    def test_three_researched_drafts_can_publish_with_valid_metadata(self):
        seeds = json.loads((ROOT / "content/blog-starters.json").read_text(encoding="utf-8"))
        for seed in seeds:
            response = self.client.post("/blog/new", data=self.fields(**seed, action="publish"))
            self.assertEqual(response.status_code, 302)
            html = (self.output / "blog" / seed["slug"] / "index.html").read_text(encoding="utf-8")
            self.assertIn(seed["seo_title"], html)
            schemas = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)[1])
            self.assertEqual(schemas[1]["headline"], seed["title"])
            self.assertEqual(schemas[1]["description"], seed["meta_description"])
            for link in re.findall(r'\]\((/categories/[^)]+)\)', seed["content"]):
                self.assertTrue((ROOT / "dist" / link.lstrip("/")).exists(), link)
        sitemap = ET.parse(self.output / "sitemap.xml")
        urls = [x.text for x in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertEqual(len(urls), 4)
        blog.build_blog(self.database, self.output)
        self.assertEqual(len(list(ET.parse(self.output / "sitemap.xml").iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"))), 4)

    def test_build_failure_is_reported_without_losing_saved_post(self):
        with patch.object(blog, "build_blog", side_effect=OSError("disk problem")):
            with self.assertLogs(self.app.logger, level="ERROR"):
                response = self.client.post("/blog/new", data=self.fields(action="publish"), follow_redirects=True)
        self.assertEqual(self.stored()["title"], "Getting started in Nairobi")
        self.assertIn("could not be updated", response.text)


if __name__ == "__main__":
    unittest.main()
