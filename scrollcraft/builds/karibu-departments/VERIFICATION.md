# Karibu Golf department pages verification

Status: shipped to production on 2026-09-24.

- Production: https://karibugolf.com/shop/clubs/
- Preview reviewed: https://6ab5495323ad249bb6e5e69c--golfklcubskenya.netlify.app/shop/clubs/
- Netlify production deploy: `6ab54aee1cfaf1b9a8557f63`

## Reviewed scope

- Six department pages: Clubs, Shoes, Apparel, Bags, Balls and Accessories.
- Twenty-five category pages.
- Twenty-five generated and optimized category photographs.
- Category index navigation, product shelves, product links and WhatsApp inquiry routes.

## Build and route checks

- `npm run build`: passed.
- Static export: passed for all site routes and all catalog products.
- Local production package: 6/6 departments and 25/25 categories passed.
- Netlify preview package: 6/6 departments and 25/25 categories passed.
- Live custom domain: 6/6 departments and 25/25 categories passed.
- Broken generated images: 0.
- Console errors: 0.
- Failed requests: 0.
- Horizontal overflow: 0px on every checked department and category route.
- WhatsApp target: `+254 116 416 105` on every department page.
- Kit Ledger: complete on all six department pages.

The deterministic route sweep is `execution/verify_department_scroll.mjs`.

## Scroll Craft harness

Representative Clubs route:

| Pass | Viewport | Page length | Result | Evidence |
|---|---:|---:|---|---|
| Desktop | default desktop | 9.0vh | No dead scroll | `lab/desktop/sheet.png` |
| Phone | 390 by 844 | 10.2vh | No dead scroll | `lab/mobile-rerun/sheet.png` |
| Compact phone | 360 by 640 | 13.0vh | No dead scroll | `lab/compact-rerun/sheet.png` |
| Reduced motion | 390 by 844 | All content reachable, reveal floor visible | Passed | `lab/reduced/sheet.png` |

Additional reviewed frames:

- `lab/qa/drivers-desktop.png`: final deeper category-page hero.
- `lab/qa/apparel-mobile.png`: 10 of 10 category ledger completion on mobile.
- `.tmp/category-contact.webp`: 5 by 5 source-image cohesion contact sheet.

The initial compact pass measured 18.6vh because a global 360px rule collapsed the product preview to one column. The final rule restores a compact two-column six-product preview, and the superseding pass measures 13.0vh.

## Accessibility and fallback

- Reduced motion removes positional transforms and reveal clipping while retaining every image, label, category link and product route.
- Kit Ledger entries are semantic links with `aria-current` on the active category.
- Primary content does not depend on hover or pointer input.
- Generated imagery contains no baked-in copy, logos or interactive labels.
- Focus-visible remains inherited from the Scroll Craft taste floor.
- Mobile ledger is horizontally reachable without causing page overflow.

## Feel check

Intended curve:

1. Recognition.
2. Curiosity.
3. Confidence.
4. Delight.
5. Control.
6. Readiness.

Cold contact-sheet read:

1. Recognition: the department opens on a familiar, fully legible golf object.
2. Curiosity: the first image-to-copy handoff and stamped ledger establish the route.
3. Confidence: the alternating Fairway, Sand and Coal chapters make the range feel organized.
4. Satisfaction: Putters resolves the club journey and completes the six-part ledger.
5. Control: the live product shelf presents prices and stock states without another motion device.
6. Readiness: the green inquiry plate finishes on a direct human-help route.

Diff and correction:

- The planned peak described delight. The cold read was closer to satisfaction, because ledger completion feels orderly rather than surprising. This is appropriate for a shop category journey, so the visual peak was retained.
- The first compact pass felt laborious at the product shelf. The two-column six-product phone preview corrected the pacing while preserving access to full category inventory.

## Fingerprint gate

The build shares the Gallery / catalog grammar and photographic world with the main Karibu Shop. It differs on nav treatment, hero device, sequence shape, close pattern and signature move, so it clears the required 4 of 6 gate with 5 of 6 differences.
