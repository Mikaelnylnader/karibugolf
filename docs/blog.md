# Karibu Golf Journal

## Write and publish

Open the backend at http://localhost:5000/blog. The sidebar also has Blog posts and Kenya content plan links.

1. Write a post, or edit one of the three researched starter drafts.
2. Enter a title, summary, category, author and article body. The formatting buttons insert headings, bold, bullets and links. Raw HTML is deliberately not executed.
3. Optionally upload an owned/licensed JPG, PNG or WebP with descriptive alt text. Add a unique SEO title and search description, or let them default to the post title and summary.
4. Save draft, then Preview saved post. Unsaved changes are not included in previews.
5. Publish to local blog. Refresh http://localhost:8080/blog/ after the success message.
6. Deploy to Netlify separately only when ready to publish online. Blog saves never trigger a Netlify deployment, even if the product auto-publish switch is on.

To withdraw a post, choose Unpublish to draft. Its generated article file, sitemap entry and RSS item are removed on a successful local rebuild. Keep the draft for later; no permanent-delete button is provided. Slugs become immutable after first publication so established links cannot accidentally change.

Drafts are excluded from static output. Backend pages carry noindex/no-store headers. The existing local Flask admin does not have authentication: drafts are not an access-controlled document store. Keep the admin on a trusted computer/network; do not publicly host it as-is.

## Local-only integration

`blog_engine.py` owns the new `blog_posts` SQLite table, safe article formatting, static templates, the blog output and sitemap/RSS updates. `backend/blog_admin.py` registers the new routes and validates CSRF tokens on its forms. Existing product and order routes are unchanged.

`python execution/manage_blog.py` makes a SQLite backup (including WAL state), ensures the new schema exists and rebuilds only the blog. `--seed-drafts` adds the three starter drafts once without overwriting existing posts. `--link-nav` inserts the journal link in current generated storefront pages, backing up every page changed. This avoids a full catalog regeneration overwriting pre-existing manual storefront edits.

`generate.py --db` also includes the blog on subsequent full-site generation. Its existing non-blog cleanup behavior is otherwise unchanged; use the blog-only rebuild when changing articles.

Backups from setup are under `.tmp/backups/blog-*`. Keep important backups elsewhere before cleaning `.tmp`.

## SEO and content

The public blog has descriptive URLs, one H1 per article, canonical/meta/Open Graph/X fields, BlogPosting and BreadcrumbList JSON-LD, real publication/update timestamps, a reading time, internal links, and an RSS feed. Only published records enter the sitemap and RSS. Article social images use each post's actual cover; a coverless post does not inherit the journal card. The journal index uses the original generated Karibu social card.

The canonical origin follows the existing website: https://golfklcubskenya.netlify.app. If the domain changes, update the trusted origin in both `generate.py` and `blog_engine.py`, regenerate and then deploy. Do not derive the public origin from an arbitrary request Host header.

The content plan is available at /blog/plan and stored in `content/kenya-blog-plan.md`. Starter copy is in `content/blog-starters.json` and seeded as drafts only. Review club details, product links and authorship before publishing. No visits, product tests, search volumes or ranking guarantees are implied by the research.

Localhost cannot be indexed by Google. After authorized deployment, validate representative article markup with Google's Rich Results Test, submit the public sitemap in Search Console and inspect the published URLs. Monitor real queries and enquiries before deciding what to write next.

## Checks

Run `python -m unittest tests.test_blog tests.test_admin_pricing -v` in the workspace environment. Blog tests use a disposable database/output folder and do not deploy, sync Google Sheets or add test records to the real catalog.
