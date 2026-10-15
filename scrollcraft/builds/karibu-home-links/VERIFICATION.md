# Homepage destination sections: local verification

15 October 2026. Local preview: http://127.0.0.1:4517/#home-coaching (campaign section: `#home-campaign`). Not uploaded, committed or published during this request.

- Supported Node build passed and exported 88 routes. Catalogue generation was not run; existing prices, stock, product photos and options are unchanged.
- `node execution/verify_home_features.mjs http://127.0.0.1:4517` passed eight configurations and 96 section states, with no page/request errors. Desktop 1440×900, laptop 1280×604, phone 390×844, compact 360×640, narrow 320×740, reduced motion, 200% text and no JavaScript.
- Both links were actually followed in every configuration: `/Coaching/` and `/campaign/`. Each destination rendered its headline. Keyboard entry reaches visible, unobstructed actions. CTA opacity stays 1 throughout entry; no new pin or scroll delay.
- Existing homepage source is compared with Git HEAD after removing only the two new component calls/imports. It is otherwise byte-equivalent after line-ending normalization. All original sections and the single hero headline remain. Existing campaign FAQ edits were left untouched.
- Product SEO passed all 27 exported product pages. Targeted type-aware lint and Git whitespace checks passed for the new implementation and verifier.
- Final evidence: `.tmp/home-features-qa/2026-10-15T11-04-38-772Z/`. Visually inspected desktop/phone contact sheets and full-size coaching, campaign and enlarged-text frames. The photographs, titles, buttons and status copy are legible and separated; body copy is on opaque brand grounds, not over photography.

## Finding and repair

The first run (`2026-10-15T10-59-42-644Z`) found horizontal overflow at 200% text: the rem-based floor on EVERYONE was too large for a phone. Reduced the mobile floor while preserving the ordinary viewport-based size and allowing long headings to wrap. The final full rerun above supersedes those failures; evidence is retained.

## Feel check

Intended insertion: coaching possibility → existing people/trust → existing community purpose → campaign belonging/agency → existing contact resolve. Observed: a personal, practical next step from the photo and lessons link, then a broader invitation to help shape the future. The campaign's thin drawn seam separates its compact invitation from the retained contact close. The original hero and offer journey remain dominant. No extra dramatic hold or new competing peak was added.

Scroll Craft influenced the natural-flow pacing, photo settle, separate typographic campaign treatment, stable reading order and motion-off fallback. Existing photography was reused; no imagery or video was generated and no generation credits were spent. A new whole-page fingerprint is not claimed for this targeted extension.

## Storage and limits

Disk space was exhausted before the task. Removed only redundant PNGs from five older successful campaign QA runs, retaining their reports/contact sheets and all final/failed evidence. Cleared and regenerated only `dist/client` and `dist/static` during the repair; authored source was preserved. These generated outputs/captures can be recreated with their build/verification scripts. Available space remains low and should be addressed before future builds.

Headless Chrome does not certify real iOS touch behaviour. No new forms, payment route, reservation flow, programmes, confirmed availability or pricing were introduced. Campaign status explicitly remains pre-launch. Await owner approval before GitHub/Netlify publication, per the standing workflow.

## Approved publication

The owner approved push and publication after reviewing the local page on 15 October. Release uses `execution/deploy_netlify_homepage_delta.mjs`: read-only plan first, then `--apply`. It reuses the existing production file digests, updates only `/index.html`, `/index.rsc` and their new browser assets, and preserves all other published pages/assets. The pre-existing uncommitted campaign FAQ edit is not staged or published; its new browser chunk is explicitly excluded. Functions must hash identically to production or the release stops. The plan against deploy `6acf6f2d6e0a74752f2fff72` preserves 683 existing files, changes two homepage representations and adds 11 browser assets with zero function changes. Every unrelated original file hash is verified after deployment.

Source preservation in the homepage verifier uses the pre-addition commit `57e86a1` (override with `--source-base=<ref>` for an intentionally revised contract), so it remains valid after committing this release. The duplicate generated `dist/client` was removed to free space for publication; the approved `dist/static` package, authored source and QA evidence remain intact. This build copy is reproducible, not user data.
