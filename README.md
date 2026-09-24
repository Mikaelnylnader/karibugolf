# Karibu Golf Kenya

The current Karibu Golf website uses React 19, Vinext and Vite. It contains the animated brand homepage, shop, detailed TaylorMade P790 product page, About, Journal and Contact pages.

## Local development

```powershell
npm install
npm run dev
```

The product-management dashboard remains in `backend/` and runs separately at `http://localhost:5000`.

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
