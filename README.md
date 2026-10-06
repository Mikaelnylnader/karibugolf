# Karibu Golf Kenya

The current Karibu Golf website uses React 19, Vinext and Vite. It contains the animated brand homepage, shop, detailed TaylorMade P790 product page, About, Journal and Contact pages.

## Local development

```powershell
npm install
npm run dev
```

The product-management dashboard remains in `backend/` and runs separately at `http://localhost:5000`.

Preview the online admin, Clients and Sales areas locally with `npm run admin:local`, then open `http://127.0.0.1:8787/admin/`. Sales capture actual prices, quantities and dates, with totals, monthly figures and an editable history. This saves development records on this computer in `.tmp/admin-local-data.json` and makes no Google Sheets or Netlify calls. Build and review locally first; upload to Netlify only after explicit owner approval.

## Production build

```powershell
npm run build
```

The build creates the application and exports every public route to `dist/static/`. Netlify uses the settings in `netlify.toml` and publishes that directory.

## Main website source

- `app/` — pages and global styling
- `components/` — shared navigation, product and interface components
- `lib/` — product data and helpers
- `public/images/` — website photography and brand assets
- `execution/export-new-site-static.mjs` — deterministic Netlify static export

## Deployment

The GitHub repository is linked to the existing Karibu Golf project. Production is available at [karibugolf.com](https://karibugolf.com).

Credentials, the local SQLite database, build output and dependencies are excluded from Git.
