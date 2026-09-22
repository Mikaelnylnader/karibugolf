# Website Build & Deploy Workflow

## Overview

Build and deploy the Golf Kenya premium website with automatic product updates from Google Sheets.

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
