# Category guides verification

Date: 8 October 2026

## Final package

- Source: authored Next/Vinext storefront.
- Reviewed export: `dist/static`.
- Local URL: `http://127.0.0.1:4515`.
- Production URL: `https://karibugolf.com`.
- Netlify deploy: `6ac7aee292059b8b1e0c73f0`, published after owner approval on 8 October 2026.

## Automated evidence

Command:

`node execution/verify_category_guides.mjs http://127.0.0.1:4515`

`node execution/verify_category_guides.mjs https://karibugolf.com`

Local and production results: `errors: []`, `failures: []`.

Representative routes:

- Drivers: flight instrument, 1 live product.
- Irons: gapping ladder, 5 live products.
- Wedges: turf and sole instrument, 3 live products.
- Golf Bags: load instrument and complete empty-collection state.
- Golf Balls: ball-specific contact model, 2 live products.
- Gloves: contact and weather model, 6 live products.
- Men’s Shoes: fit, traction and weather model with complete empty-collection state.

Coverage:

- 7 representative routes at 1440 × 900 desktop.
- 7 representative routes at 390 × 844 phone.
- 6 family representatives with reduced motion.
- Drivers and Golf Bags with JavaScript disabled.
- Every checked route returned HTTP 200.
- Three decision chapters and three keyboard-operable fit choices appeared on every route.
- Choice state and advice updated from the keyboard.
- Product counts matched the local catalogue.
- No horizontal overflow or broken category images.
- Reduced-motion rails remained untransformed and readable.
- No console or request errors in the final run.

The first run exposed two older iron cards whose first image pointed to an admin-only `/api/product-images/` route. `ShopProductCard` now uses the existing `productDisplayImage` public fallback. The rebuilt export and final run contain no broken images.

## Visual review

Reviewed at full size:

- Driver desktop opening: readable title, real category photography, distinct field and measurement planes, ledger clear of the primary copy.
- Iron phone opening: subject remains legible, headline and description remain above the ledger, no horizontal crop.
- Wedge desktop fit line: three-choice control, turf trace and result remain one coherent workbench.
- Golf Bag phone fit line: controls remain tappable and the load diagram resolves before the selected advice.

## Feel check

Intended: focus → orientation → curiosity → confidence → resolve.

Felt: focus → comparison → calm → control → resolve.

Diff: the lateral decision rail reads more as comparison than orientation, which is useful and still serves the decision task. The interactive fit workbench is the clearest peak. The product shelf or honest empty state resolves the page without competing with it.

## Limits

- A real iPhone was not available. The phone evidence is Chrome emulation and does not reproduce Safari’s exact scrolling or font rasterisation.
