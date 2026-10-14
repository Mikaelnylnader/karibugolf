# Storefront campaign verification, 14 October 2026

Reviewed package: `dist/static`, 88 public routes, 27 existing product pages. Campaign source is the retained published version 7, integrated at `/campaign/`, not a new Sites publication. Main navigation/footer now link to Campaign.

## Final local evidence

- `verify_campaign_page.mjs`: all 11 configurations passed, zero page/request errors; desktop, phone, compact, 606×604 in-app, laptop, minimum desktop, short phone, narrow, reduced motion, enlarged text and no JavaScript. Four dialogs per JavaScript configuration, selection carried into the final enquiry, Escape/focus restoration and FAQ/menu checks passed. Evidence: `.tmp/campaign-qa/functional-2026-10-14T11-52-00-912Z/`.
- `verify_campaign_integration.mjs`: direct `/campaign/#rewards` link, canonical, indexability, sitemap, no payment form, selected-tier enquiry and dark dialog focus ring passed. Ten header widths and five existing-page regressions passed. Evidence: `.tmp/campaign-qa/integration-2026-10-14T11-51-17-394Z/`.
- Final Scroll Craft scene sampling: 46 desktop and 47 phone frames; no dead scroll reported, measured media cues clear 4.5:1 at their worst frames. Final contact sheets visually inspected alongside full-size opening, fitting and rewards captures. Evidence: `.tmp/campaign-qa/final-scenes-desktop/` and `final-scenes-phone/`. Static copy, dialogs and actual reading order additionally covered by the functional/integration verifiers; automated contrast does not certify every element.
- Product SEO passed all 27 pages. Currency regression passed all 34 existing shop/home/product routes, which remain KSh-only. Campaign amounts are expressly proposed USD contributions, not product prices.
- Current production manifest (deploy `6ace8ef65cca9193aa7be3b7`): all 339 image hashes preserved, no missing public pages and no changed admin hashes. Netlify manifest paths are lowercased; comparing them case-sensitively to Windows-built filenames produces false missing-image/page findings. Obsolete hashed JavaScript/CSS bundles are replaced by the current build.
- Targeted type-aware lint and Git whitespace checks passed. Shared engine JavaScript and image files are unchanged; no inventory, price, stock or Sheet mutations.

## Repairs and retained failed evidence

The first sandbox build/preview attempt could not access loopback; the supported Node build/export succeeded with approved loopback access. The first browser run had no active preview server; starting the local static server resolved it. Initial integration assertions incorrectly expected the forest body colour on shop routes; a read-only production comparison established their existing dark engine ground. A repeated direct rewards-link test then exposed an initial-anchor race when pinned chapters expanded. The page now restores the initial fragment after font/engine layout, without changing ordinary scrolling. Earlier failed reports remain in `.tmp/campaign-qa/` and are superseded by the final passes above. Keyboard focus on light chapters/dialogs uses a contrasting green outline.

## Feel check and limits

Intended: Welcome → Recognition → Trust → Clarity → Belonging → Agency → Resolve. Observed from the visual sequence: welcoming → understanding the plan → founder trust → fitting clarity → community belonging → reward choice → a clear enquiry invitation. The existing signature fitting alignment and chapter pacing are retained; administrative terms remain in natural flow. Wording now makes the studio a future plan and labels the action `Explore rewards`, resolving the ambiguity of a live-site `Back this project` button while payments remain closed.

All plans/rewards remain proposed. No goal, deadline, payment route, supporter count or confirmed booking has been invented. Headless Chrome checks do not certify real iOS touch behaviour. No assets were generated and no generation credits were spent. The original campaign Site and its audience were not changed.
