# Growing the Game: shipped report

Published on 4 October 2026 at [karibugolf.com/growing-the-game/](https://karibugolf.com/growing-the-game/). Final reviewed deploy: `6ac2977f490adf3b984b2ae0`. Local QA URL: `http://127.0.0.1:4506/growing-the-game/`.

## Content and placement

The owner's suggestion became a clear mission page, a concise homepage section after "Good Golf. Real People.", an improved About origin paragraph, and a footer link. The original shop announcement, stock display, founder story and customer-clinic invitation remain in place. Junior support, scholarships, school partnerships, trade-ins and donations are explicitly future plans, as confirmed by the owner. No active programme, impact statistic or environmental certification is invented.

The brief uses the user's delegated permission to improve their suggestion, with the established brand direction and assets. It is not a fresh brand interview.

## ScrollCraft decisions

**Grammar: public commitment ledger.** Local plan anchors, visible status and a held desktop heading serve a practical mission better than a long cinematic sequence. Filmic one-shot and continuous world would bury the information in spectacle; chaptered editorial repeats the Journal; live surface implies operating programmes; typographic poster lacks room for the plans; gallery/catalog treats ambitions as merchandise; split stage would constrain phone reading; rhythmic cutlist fragments the explanation. A new grammar is justified by its future-status navigation and explicit ban on applications or donation checkout for programmes not launched.

Fingerprint gate: 6/6 differences against Shop, Departments, P790, Stock Room and About; 5/6 against Journal, sharing only its calm reading/quiet close pattern. The global brand navigation stays consistent; the page-local navigation is distinct.

| Beat / intended feeling | Device and reason |
|---|---|
| Clarity | Kinetic headline and independent photo/badge parallax. Copy stays on paper beside the photograph. |
| Trust | Natural-flow, once-only entrance. What Karibu offers today is readable immediately. |
| Possibility | Desktop sticky heading with real local anchors and revealed ambition entries. Phones use natural flow. |
| Optimism, the peak | Bespoke SVG growth path connects access, players and opportunities as the path itself enters view. |
| Agency | Normal-flow partnership desk with contextual WhatsApp inquiry. The ending remains visible and actionable. |

Signature sentence: "It's the mission page where more access, more players and more opportunities connect into one future for East African golf." The path and arriving nodes are driven by page-local JavaScript, not a shared-engine modification. No scroll filler or forced pin spans were added.

## Feel check and repairs

Reading the ordered screenshots produced clarity, trust, possibility, optimism and agency, matching the intended curve. The initial ledger title was too negative; it became "Our Plans. More Possibilities." The initial path timing was based on the section top and could finish before the drawing was visible. It now uses the visible SVG's bounds and completes while on screen. The last screen resolves into a real partnership question, not a disappearing effect.

No assets were generated. The existing fairway photograph and Karibu badge were reused; no photograph is presented as evidence of a junior programme or a founder portrait.

## Verification and boundaries

- Local and live mission suites passed with zero failures or runtime/resource errors: desktop 1440×1000, phone 390×844, compact phone 360×640, reduced motion, and JavaScript-disabled reading.
- Six screenshots per hero/growth sequence prove independent photo/badge/title motion and the path's visible progression. Entry text resolves fully; plan anchors land below navigation; keyboard focus and WhatsApp message context work; footer tap targets are at least 44px; no horizontal overflow or broken images was found.
- Existing About scroll/biography/clinic checks and the homepage People scroll checks passed. The original shop/stock/People sections and new homepage/About links were checked, including actual native navigation to the new route.
- Live homepage, About, mission, Blog, Shop and Stock return HTTP 200. The new route is in the sitemap. A discovered public `noindex` regression was fixed in the storefront layout: public pages now have `index, follow`, while robots.txt still excludes admin/API paths. This permits indexing; it does not promise rankings or a crawl date.
- Build, changed-file lint and diff checks pass. Repo-wide TypeScript checking still reports two pre-existing issues in `live-product-image.tsx` and `shop-scroll-shell.tsx`, outside this content change.
- Physical phone hardware was not tested. No programme application, funding, donation or payment flow was launched or tested.

Evidence retained locally in `.tmp/mission-qa/2026-10-04T18-15-21-171Z/` (live), `.tmp/mission-qa/2026-10-04T18-07-49-174Z/` (local), and `.tmp/about-scroll-qa/2026-10-04T18-08-00-034Z/`. The earlier failing run is preserved, not overwritten. Browser screenshots show the final package; native pointer lock/capture is disabled in every automated context.
