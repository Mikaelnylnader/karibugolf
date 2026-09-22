# Golf Kenya - Premium Golf E-Commerce

Premium golf equipment and apparel e-commerce website for the Kenyan market.

## Current workspace

This is the single master Golf Kenya project. It contains:

- the current generated Karibu Golf storefront in `dist/`;
- the Flask product-management dashboard in `backend/`;
- the local SQLite catalog in `backend/golf_kenya.db`;
- website generation and deployment scripts at the project root;
- the earlier static Golf Kenya storefront in `website/`; and
- the retired read-only API prototype in `legacy/fastapi-prototype/`.

## Local development (website + backend)

One command starts both the current storefront and the full product admin.

```powershell
# First run only
.\setup-dev.ps1

# Start the website and backend
.\start-dev.ps1
```

- Storefront: `http://localhost:8080`
- Product admin: `http://localhost:5000`
- Product list: `http://localhost:5000/products`
- Add product: `http://localhost:5000/products/new`
- Local API: `http://localhost:5000/api/products`

Backend changes belong in `backend/`. The current storefront is generated into
`dist/` from the SQLite product database.

## Website generation

```powershell
.\.venv\Scripts\python.exe generate.py
```

## Quick Links

- 📊 **Product Database:** [Google Sheet](https://docs.google.com/spreadsheets/d/1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY)
- 📁 **Product Images:** Google Drive "Product Images" folder
- 🌐 **Current Website Output:** `dist/` folder

## Project Structure

```
Golf Kenya/
├── directives/              # SOPs and workflows (READ THESE FIRST)
│   ├── website_workflow.md      # Main website generation workflow
│   ├── website_build_deploy.md  # Deployment instructions
│   └── generate_product_photos.md # AI image generation
├── backend/                 # Product admin, templates, and SQLite database
├── dist/                    # Current generated Karibu Golf storefront
├── execution/               # Supporting automation and local runner
├── legacy/                  # Preserved retired API prototype
├── website/                 # Earlier static storefront
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── images/
│       ├── products/        # Product & lifestyle images
│       └── brands/          # SVG brand logos
├── generate.py              # Generate dist/ from the backend database
├── .tmp/                    # Temporary files (gitignored)
├── setup-dev.ps1           # One-time local setup
├── start-dev.ps1           # Start website + backend
└── netlify.toml            # Current deployment configuration
```

## Key Scripts

| Script | Purpose |
|--------|---------|
| `build_website_v4.py` | **MAIN** - Generate website from Google Sheet |
| `generate_lifestyle_gemini.py` | Generate AI photos with Black models |
| `download_belt_images.py` | Download product images from Drive |

## Products (Current)

| Product | Category | Price (KES) |
|---------|----------|-------------|
| J.Lindeberg Braided Belt - Black | Accessories | 7,008 |
| J.Lindeberg Braided Belt - Navy | Accessories | 7,008 |
| J.Lindeberg Braided Belt - White | Accessories | 7,008 |
| Malbon Puffer Jacket - Navy | Apparel | 19,116 |
| Malbon Puffer Jacket - White | Apparel | 19,116 |

## Adding Products

1. Open `http://localhost:5000/products/new`.
2. Enter the product information and upload its images.
3. Save the product.
4. Use **Generate Website** in the admin dashboard to update `dist/`.

## API Keys & Credentials

- **Google Sheets/Drive**: `credentials.json` + `token.json`
- **OpenRouter (AI Images)**: set `OPENROUTER_API_KEY` in `.env`
- **AI Model**: `google/gemini-3-pro-image-preview` (Nano Banana Pro - best quality)

## Architecture

```
Google Sheet ──→ build_website_v4.py ──→ website/ ──→ Netlify
     ↑                    ↑
     │                    │
Product Data        Brand/Category Config
```

## Learnings Log

- Use local SVG files for brand logos (Wikipedia URLs fail)
- Google Gemini via OpenRouter works for AI image generation
- Unsplash URLs are reliable for category decoration images
- Netlify Drop is easiest deployment (no npm needed)
- Always verify images exist before deploying

---

*Last updated: January 2026*
