# Karibu Golf product template

Use `components/golf-product-template.tsx` for future golf-club product pages. Pass a `GolfProduct` record defined in `lib/karibu-products.ts`. The P790 route shows the integration.

Layout: breadcrumb; multi-angle gallery with thumbnails and accessible enlargement; price, confirmed stock and flex choices; sticky section navigation; editorial image; four concise product features; detail image; manufacturer reference specification table; shaft options.

Keep the Karibu dark-green, lime and white palette, condensed display headings, readable body copy, mobile stacking and persistent site navigation. Product photographs should remain uncropped in the gallery. Do not invent photos, specifications, stock, prices, reviews or discounts.

Supply fresh product-specific data and images for each listing. The current P790 features, photos and specification table reference the TaylorMade DW-TC635 page linked in the data record. They are reference material, not verification of the exact physical inventory. Confirm compatibility with the actual stock before changing the reference note. Stock and prices come from the shop owner.

Enquiries use WhatsApp with the chosen flex, product, set and price. There is no online payment or backend stock connection. Make the WhatsApp destination configurable before adapting this template for a different business.

Netlify builds with NETLIFY=true and publishes dist/client. All dynamic article slugs are generated at build time. The existing GitHub main branch deploys to karibugolf.com.
