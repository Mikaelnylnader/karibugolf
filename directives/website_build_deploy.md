# Website Build & Deploy Workflow

## Overview

Build and deploy the Golf Kenya premium website with automatic product updates from Google Sheets.

## Current app-based storefront (October 2026)

- The authored frontend is in `app/` and `components/`. Build with `npm run build`, which runs the catalog export, vinext build and static export. The current publish directory is **`dist/static`**, not the legacy `website/` or the parent `dist/` directory.
- Deploy the reviewed package with `npx netlify deploy --prod --dir=dist/static --no-build --site 925395d9-2336-4f0d-81e0-21a72b3c9074`. Check authentication first and retain the existing site.
- Use native internal anchors in the static storefront. `next/link` introduced an RSC prefetch setup error in the exported About page on 4 October; this deployment has no RSC prefetch server. A targeted lint exception documents why a native anchor is needed.
- Run `execution/verify_about_scroll.mjs` for About updates. It checks the existing scroll states plus the founder biography, customer clinic invitation, WhatsApp inquiry, keyboard focus, compact phone layout and reduced motion. Preserve failed evidence and rerun after repair.
- Founder photographs: `execution/prepare_founder_photos.mjs` compresses the owner's three tournament PNGs without changing the originals. Keep the sticky founder introduction and the lower photographic spread in separate layout containers; otherwise the tall held introduction can overlap the lower captions even when overflow and transform tests pass. The About verifier now samples six positions per photograph, including this geometric overlap guard, full-image ratios, qualifying captions and static no-JavaScript/reduced-motion reading.
- Public pricing is KSh-only across purchase panels, catalogue cards and stock exhibits. Preserve CNY/USD fields and calculations in the backend and Sheet. Run `execution/verify_storefront_currency.mjs` against the reviewed package and production; it checks the five product pages, shop/category/home/stock views and KES offer schema without changing any product data.
- New static pages must be added to the route list in `execution/export-new-site-static.mjs`; the exporter also includes these routes in the sitemap. Run `execution/verify_mission.mjs` for Growing the Game changes. Its six-position animation checks use the visible SVG path rather than the section top, so a long heading cannot let the drawing finish offscreen. Chrome may return `strokeDashoffset` as `calc(...px)`; normalise that computed value before numeric assertions. Junior support, trade-ins and donations are future plans confirmed by the owner, not launched programmes.
- For homepage text-only requests, capture the live mission verifier with `--baseline` before editing, then pass `--compare-home=<baseline report.json>` when testing the new package. It compares original homepage section order, headings, stylesheets, images, paragraph count and DOM/class structure. The mission suite also samples the three growth-heading arrivals, checks the active plan index, and requires complete reduced-motion/no-JavaScript reading. Measure each reveal's stable outer wrapper; transform only its inner text so scroll geometry cannot feed back into itself.
- The public storefront layout uses `index, follow`. Do not gate public robots metadata on `process.env.NETLIFY`: the local build deliberately strips that variable, and this same package is uploaded to production. The former conditional exported `noindex, nofollow` on public pages. Keep `/admin/` and `/api/` disallowed in the exported robots.txt and verify the published public HTML metadata after deployment.
- Product additions: check the existing SKU in SQLite and Sheets before duplicating it. Public visibility is separate from availability: a product can have a page while status is `Out of Stock` and quantity is `0`. `execution/update_pro_v1_listing.py` defaults to a read-only plan; `--apply` targets only existing `GK-BL012`, preserves prices and unrelated fields, backs up the database/Sheet row, and copies the owner's four pictures. Do not invoke legacy bulk ball uploads or generators. The current Sheet exporter retains existing product order and appends new products.
- Pro V1 verification uses `execution/verify_pro_v1.mjs`: exact supplied pictures, category/product links, gallery/zoom, pack/colour enquiry, unavailable labels/schema/API, exclusion from home/shop stock and stock room, desktop/phone/compact/reduced/no-JavaScript product views. Non-club details have presentation overrides rather than shaft/flex language; the sleeve photo is inner packaging for the dozen listing. Wait for dialog exit animations and set deterministic keyboard tests to auto scrolling before measuring focus. Real phone hardware is not covered by headless checks.
- Pro V1x is the existing `GK-BL011`, not a new SKU. `execution/update_pro_v1x_listing.py` plans by default and `--apply` backs up the local database, generated catalogue and original Sheet row, copies the five supplied PNGs and refreshes only its local listing while preserving all prices. Use targeted Sheet connector updates for row 99 after resolving SKU/headers and reading cell metadata: visibility `TRUE`, status `Out of Stock`, quantity `0`, plus listing text/image. Keep existing Pro V1 (`GK-BL012`) visible but unavailable. `execution/verify_pro_v1.mjs <base> --pro-v1x` covers five pictures and both ball-category links; run without the flag for Pro V1 regression. Await image decoding before checking for broken no-JavaScript images, and retain specific failed URLs as evidence. The catalogue exporter automatically adds the new visible product route and sitemap entry.
- The Titleist Players men's glove uses existing `GK-GL005`. `execution/update_titleist_players_listing.py` reuses the targeted refresh helper with glove-specific configuration and four owner screenshots; apply only this SKU and preserve costs/prices. Resolve its Sheet row (112 at addition), then update listing/visibility/status/quantity cells without replacing currency cells or formatting. Product sizes and glove hand/fit are confirmed on restock; manufacturer reference sizes are not inventory. Verify with `execution/verify_pro_v1.mjs <base> --players-glove`, including accessories and gloves category links, gallery/zoom, unavailable schema/API and exclusion from stock sections. Two-column specifications use `.product-reference-table` for readable phone tables without changing wider iron tables. If Firecrawl returns a proxy tunnel error, use the official manufacturer page via the web tool rather than guessing specifications.

- FootJoy Pure Touch Limited uses existing `GK-GL010`. Refresh with `execution/update_footjoy_pure_touch_listing.py` (read-only by default; `--apply` preserves prices, backs up data and copies the four owner PNGs). Resolve the current Sheet row (117 at addition), then change only listing/image, website visibility and out-of-stock quantity cells. `execution/verify_pro_v1.mjs <base> --pure-touch` covers its four images, glove configuration, schema/API and exclusion from stock sections. Manufacturer size/hand ranges are reference information, not inventory. Google Sheets automatically adds a hyperlink to a newly entered image URL: allow exactly that link in post-write formatting comparisons and compare object keys canonically, while preserving other formats and currency cells.

- Live product image checks must resolve absolute and relative Sheet image URLs against the storefront origin before comparison; the same photograph can be represented either way. Do not rewrite a valid catalogue image to satisfy a path-only test.

- StaSof refresh uses existing `GK-GL008` (not the old "StaSoft" spelling): `execution/update_footjoy_stasof_listing.py` preserves pricing, backs up data, copies four supplied product photos and the shared size-guide image without altering the originals. Resolve the current Sheet row (115 at addition) and use targeted listing/visibility/status/quantity updates; do not replace currency cells. `--stasof` on the product verifier checks unavailable product/gallery/API behaviour. `execution/verify_glove_guides.mjs` checks the shared size-guide section on every published glove page and its absence on non-gloves, including phone, keyboard, modal zoom, full-size no-JavaScript fallback and exact image hashes. The supplied size picture is general guidance, not a universal FootJoy/Titleist conversion. FootJoy's official chart uses middle-finger length from the palm, whereas the supplied picture shows wrist-to-fingertip length; explicitly distinguish these. Link to the manufacturer fitting chart and printable tool rather than transcribing malformed scraped chart cells.

- Before decoding all product images in QA, set offscreen lazy images to eager loading and bound the wait. A newly added lower-page size chart can otherwise leave `decode()` pending indefinitely even though the image serves correctly and the guide itself passes its visual tests.
- Product modals must sit above the site's explicit overlay layer (`z-index:150`). Use `z-index:160` for the glove guide popup and verify both computed stacking and hit-testing at its centre; visibility/size assertions alone can pass while the popup is blurred behind its backdrop.

- WeatherSof uses existing `GK-GL009`. Refresh with `execution/update_footjoy_weathersof_listing.py` (read-only unless `--apply`) and resolve its Sheet row (116 at addition); preserve prices/costs and update only listing, visibility, status and quantity. Use `execution/verify_pro_v1.mjs <base> --weathersof`, plus the shared glove-guide and currency suites. The supplied green-packaging photographs are reference images; FootJoy's `004WEA` page redirects to a prior-generation two-pack. Label it as a technology reference, not a promise of pack contents or the newest MicroTac construction. Confirm version, hand, fit and pack contents on restock.

- Women's WeatherSof is a separate `GK-GL011` listing added with `execution/add_footjoy_womens_weathersof_listing.py`; it clones commercial values from men's `GK-GL009` while keeping stock `0`, status `Out of Stock` and website visibility on. Add its Sheet row with `execution/upsert_footjoy_womens_weathersof_sheet.py`, which clones the men's formatted row and replaces only the new product's listing fields. The 16 supplied photographs cover five reference colour options: White / Black, Black, Navy, White / Pink and White / Turquoise. FootJoy lists women's S, M, ML and L plus Regular Left and Regular Right, but these are manufacturer options, not current Karibu inventory. The supplied measurement graphic is explicitly a men's general reference on this page. Verify with `execution/verify_pro_v1.mjs <base> --womens-weathersof`, the shared glove-guide suite and currency checks.
- Long or lazy-loaded glove galleries can make Playwright's pre-click auto-scroll put the fitting shortcut under the sticky product-section bar or measure the target while the page is still shifting. The guide verifier now eagerly decodes page images with a bounded wait, asserts the real anchor target and scrolls the stable target into view before checking its CSS offset; this avoids false pointer-interception and no-JavaScript layout-shift failures on a slower production CDN.
- Product pages with many photographs use a horizontal, swipeable thumbnail strip on phones so the purchase panel is not buried. When checking every offscreen thumbnail, call the actual button's DOM click method; Playwright cannot always auto-scroll a nested horizontal strip even though a user can swipe it normally.

- If Windows Application Control blocks the local `workerd.exe` (Wrangler reports `spawn UNKNOWN`), do not disable or bypass the policy. The framework has a supported Node production renderer: `node execution/build_vinext_static.mjs --node` then `node execution/export-new-site-static.mjs --node` uses it to generate the same static route set. Run the full relevant product/guide/currency checks before publishing. These explicit options do not change default Cloudflare builds or live hosting.

- Production visual QA can itself exhaust Google Sheets' 60-per-user-per-minute read quota: each price/image component reads the live endpoint. Netlify error logs identify upstream HTTP 429, surfaced as 500 by the public endpoint. Do not run repeated live browser suites against the Sheet at full speed. The product, glove-guide and currency verifiers accept `--api-snapshot`: one real live catalogue read, then that verified response is replayed for visual contexts. Reports explicitly distinguish this from direct API testing. Wait for the quota window to recover and retain separate direct live API evidence; this test mode does not alter the website or its API. Wait for `footer.shared-footer` to parse the static body rather than network-idle or readyState, which external deferred requests can hold open.

## Current production workflow (September 2026)

- The current public website is `dist/`, not the legacy `website/` or `.tmp/website/` folders described below.
- Existing Netlify project: `golfklcubskenya`, ID `925395d9-2336-4f0d-81e0-21a72b3c9074`; primary domain: `https://karibugolf.com`.
- Check authentication with `netlify status`. If the workspace is unlinked, use `netlify link --id 925395d9-2336-4f0d-81e0-21a72b3c9074`; do not create another site.
- After explicit production approval, publish the already-reviewed static files with `netlify deploy --prod --dir=dist --no-build --site 925395d9-2336-4f0d-81e0-21a72b3c9074` from the project root.
- Do not run a legacy generator for deployment. A full rebuild can overwrite manual storefront changes. Blog-only generation uses `execution/manage_blog.py` and excludes drafts.
- Only upload `dist/`. Keep the Flask admin, databases, credentials, backups, and unpublished blog drafts local.
- Check local image/script/media references before uploading. The footer badge is `/images/karibu-badge-color.svg`; the former `karibu-logo-small.png` file is absent.
- Verify the production homepage, `/blog/`, `/sitemap.xml`, and versioned WhatsApp QR after Netlify reports the deploy ready.
- Product saves in the local backend auto-generate `dist/` and deploy to this existing Netlify project. Auto-publish is ON by default and persisted as the `auto_publish` setting in SQLite; the dashboard switch can disable it.
- Public stock labels are binary: database status `In Stock` displays as **In Stock**; every other status displays as **Out of Stock** and uses Schema.org `OutOfStock` structured data.

The January instructions below describe the legacy website and are retained for reference.

## Current Status (January 2026)

✅ **Ready for Netlify Deployment**
- Website generated at `website/` folder
- All images local and verified
- Brand logos (8 SVG files)
- Product images (5 products + 3 lifestyle)
- Category images (Unsplash URLs)

## Quick Deploy

### Netlify Drop (Recommended - No Account Needed)

```bash
# 1. Generate latest website
python execution/build_website_v4.py

# 2. Open Netlify Drop
Start-Process "https://app.netlify.com/drop"

# 3. Open website folder
explorer "C:\Users\mikae\Documents\Golf Kenya\website"

# 4. Drag the website folder onto Netlify Drop page
# 5. Get your live URL!
```

### Preview Locally First

```bash
cd "C:\Users\mikae\Documents\Golf Kenya\website"
python -m http.server 8080
# Open http://localhost:8080
```

## Website Contents

```
website/
├── index.html              # 1 file
├── styles.css              # 1 file
├── script.js               # 1 file
└── images/
    ├── products/           # 8 files (~6 MB total)
    │   ├── J.Lindeberg_Braided_Belt___Black.png
    │   ├── J.Lindeberg_Braided_Belt___Navy.png
    │   ├── J.Lindeberg_Braided_Belt___White.png
    │   ├── Malbon_Puffer_Jacket___Navy.jpg
    │   ├── Malbon_Puffer_Jacket___White.jpg
    │   ├── jlindeberg_belt_lifestyle.png
    │   ├── malbon_puffer_jacket_male.png
    │   └── malbon_puffer_jacket_female.png
    └── brands/             # 8 files (~20 KB total)
        ├── taylormade.svg
        ├── callaway.svg
        ├── jlindeberg.svg
        ├── titleist.svg
        ├── malbon.svg
        ├── footjoy.svg
        ├── ping.svg
        └── cobra.svg
```

## Update Workflow

When you make changes:

```
1. Edit Google Sheet (add/remove products)
   OR Edit build_website_v4.py (change brands/categories)
        ↓
2. Run: python execution/build_website_v4.py
        ↓
3. Preview: cd website && python -m http.server 8080
        ↓
4. Deploy: Drag website/ folder to Netlify Drop
        ↓
5. Site is live!
```

## Netlify After Deployment

Once deployed via Netlify Drop:
1. Create a free Netlify account to keep the site
2. Change site name to `golfkenya.netlify.app` (if available)
3. Or connect custom domain `golfkenya.com`

## Key Scripts

| Script | Purpose |
|--------|---------|
| `execution/build_website_v4.py` | Generate website from Google Sheet |
| `execution/download_belt_images.py` | Download product images from Drive |
| `execution/generate_lifestyle_gemini.py` | Generate AI lifestyle photos |

## Image Verification

Before deploying, verify all images work:

```powershell
# Check product images
Get-ChildItem "website\images\products" | ForEach-Object { "$($_.Name): $([math]::Round($_.Length/1KB,1)) KB" }

# Check brand logos
Get-ChildItem "website\images\brands" | ForEach-Object { "$($_.Name): $([math]::Round($_.Length/1KB,1)) KB" }
```

All images should show file sizes (not 0 KB).

## Troubleshooting

### Images not showing
- Check file names match exactly (case-sensitive)
- Verify files exist in `website/images/products/`
- Run `python execution/build_website_v4.py` to regenerate

### Brand logos broken
- All brand logos are now local SVG files
- Check `website/images/brands/` has all 8 SVG files
- If missing, re-download or create text SVGs

### Categories not showing images
- Category images use Unsplash URLs (external)
- Requires internet connection
- Test by opening website in browser

## Learnings

- Use local files for reliability (brand logos, product images)
- External URLs (Unsplash) are fine for decorative images
- Always verify images before deploying
- Netlify Drop is easiest deployment method
- No npm/node required - pure HTML/CSS/JS
