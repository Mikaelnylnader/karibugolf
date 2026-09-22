"""Blog-only admin routes. Publication updates local files, never Netlify."""
from pathlib import Path
import secrets
import sqlite3
import sys

from flask import abort, flash, redirect, render_template, request, send_from_directory, session, url_for
from PIL import Image, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
import blog_engine as blog


def register_blog(app, get_db, dist_dir, database_path):
    # Resolve the database lazily so test environments never touch the real catalog.
    def csrf_token():
        if "blog_csrf" not in session:
            session["blog_csrf"] = secrets.token_urlsafe(32)
        return session["blog_csrf"]

    app.jinja_env.globals["blog_csrf_token"] = csrf_token

    @app.after_request
    def prevent_blog_admin_indexing(response):
        if request.path == "/blog" or request.path.startswith("/blog/"):
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
            response.headers["Cache-Control"] = "no-store"
        return response

    def verify_csrf():
        expected = session.get("blog_csrf", "")
        if not expected or not secrets.compare_digest(expected, request.form.get("csrf_token", "")):
            abort(400, "This form has expired. Reload the editor and try again.")

    def get_post(post_id):
        conn = get_db()
        try:
            row = conn.execute("SELECT * FROM blog_posts WHERE id=?", (post_id,)).fetchone()
            if not row:
                abort(404)
            return dict(row)
        finally:
            conn.close()

    def rebuild():
        try:
            count = blog.build_blog(database_path(), dist_dir)
            flash(f"Local blog updated: {count} published posts. Refresh the frontend to see them. Netlify was not deployed.", "success")
        except Exception:
            app.logger.exception("Local blog generation failed")
            flash("Your post was saved, but the local blog could not be updated. Retry with Rebuild local blog before deploying.", "danger")

    @app.route("/blog")
    def blog_list():
        conn = get_db()
        try:
            posts = conn.execute("SELECT * FROM blog_posts ORDER BY updated_at DESC, id DESC").fetchall()
        finally:
            conn.close()
        return render_template("blog_list.html", posts=posts)

    @app.route("/blog/new", methods=["GET", "POST"])
    @app.route("/blog/<int:post_id>/edit", methods=["GET", "POST"])
    def blog_edit(post_id=None):
        existing = get_post(post_id) if post_id else None
        post = existing or {"title": "", "slug": "", "excerpt": "", "content": "", "seo_title": "", "meta_description": "",
                            "category": blog.BLOG_CATEGORIES[0], "author": "Karibu Golf editorial team", "status": "draft", "cover_image": "", "cover_alt": ""}
        error = None
        if request.method == "POST":
            verify_csrf()
            post = dict(post)
            for key in ("title", "slug", "excerpt", "content", "seo_title", "meta_description", "category", "author", "cover_alt"):
                post[key] = request.form.get(key, "").strip()
            action = request.form.get("action", "draft")
            post["status"] = "published" if action == "publish" else "draft"
            if existing and existing.get("published_at"):
                post["slug"] = existing["slug"]  # Keep established URLs stable, including after unpublishing.
            else:
                post["slug"] = blog.slugify(post["slug"] or post["title"])
            try:
                if not post["title"] or not post["slug"]:
                    raise ValueError("Add a title and a valid URL slug.")
                limits = {"title": 140, "excerpt": 350, "seo_title": 90, "meta_description": 200, "author": 100, "cover_alt": 200, "content": 100000}
                for field, limit in limits.items():
                    if len(post[field]) > limit:
                        raise ValueError(f"{field.replace('_', ' ').title()} must be no longer than {limit:,} characters.")
                if post["category"] not in blog.BLOG_CATEGORIES or action not in ("draft", "publish"):
                    raise ValueError("Choose a valid category and publishing action.")
                if not post["author"]:
                    raise ValueError("Add an author or editorial team name.")
                if post["status"] == "published" and (not post["excerpt"] or not post["content"]):
                    raise ValueError("Add a summary and article body before publishing.")
                upload = request.files.get("cover_upload")
                if upload and upload.filename:
                    try:
                        with Image.open(upload.stream) as picture:
                            fmt = picture.format
                            picture.verify()
                        extension = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}.get(fmt)
                        if not extension:
                            raise ValueError("Cover images must be JPG, PNG or WebP.")
                    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
                        raise ValueError("Please choose a valid JPG, PNG or WebP image.")
                    if not post["cover_alt"]:
                        raise ValueError("Describe the cover image for readers using a screen reader.")
                    upload.stream.seek(0)
                    filename = secrets.token_hex(12) + extension
                    folder = Path(dist_dir) / "images/blog"
                    folder.mkdir(parents=True, exist_ok=True)
                    upload.save(folder / filename)
                    post["cover_image"] = "/images/blog/" + filename
                elif request.form.get("remove_cover"):
                    post["cover_image"] = ""
                if post["cover_image"] and not post["cover_alt"]:
                    raise ValueError("Describe the cover image for accessibility.")
                now = blog.utc_now()
                published_at = existing.get("published_at") if existing else None
                if post["status"] == "published" and not published_at:
                    published_at = now
                fields = ("slug", "title", "excerpt", "content", "category", "author", "cover_image", "cover_alt", "seo_title", "meta_description", "status")
                conn = get_db()
                try:
                    if existing:
                        conn.execute("UPDATE blog_posts SET " + ", ".join(f"{key}=?" for key in fields) + ",published_at=?,updated_at=? WHERE id=?",
                                     tuple(post[key] for key in fields) + (published_at, now, post_id))
                    else:
                        cursor = conn.execute("INSERT INTO blog_posts (" + ",".join(fields) + ",published_at,created_at,updated_at) VALUES (" + ",".join("?" for _ in range(len(fields) + 3)) + ")",
                                              tuple(post[key] for key in fields) + (published_at, now, now))
                        post_id = cursor.lastrowid
                    conn.commit()
                finally:
                    conn.close()
                flash("Post saved as " + post["status"] + ".", "success")
                if post["status"] == "published" or (existing and existing["status"] == "published"):
                    rebuild()
                return redirect(url_for("blog_edit", post_id=post_id))
            except sqlite3.IntegrityError:
                error = "That URL slug already belongs to another post. Choose a different one."
            except ValueError as exc:
                error = str(exc)
        return render_template("blog_form.html", post=post, categories=blog.BLOG_CATEGORIES, error=error), (400 if error else 200)

    @app.route("/blog/<int:post_id>/preview")
    def blog_preview(post_id):
        page = blog.render_page([], get_post(post_id), preview=True)
        return page, 200, {"X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store"}

    @app.route("/blog/rebuild", methods=["POST"])
    def blog_rebuild():
        verify_csrf()
        rebuild()
        return redirect(url_for("blog_list"))

    @app.route("/blog/plan")
    def blog_plan():
        plan = (ROOT / "content/kenya-blog-plan.md").read_text(encoding="utf-8")
        body, _ = blog.render_content(plan)
        return render_template("blog_plan.html", body=body)

    @app.route("/blog-assets/<path:filename>")
    def blog_assets(filename):
        if filename != "blog.css":
            abort(404)
        return send_from_directory(ROOT / "templates/blog", filename)
