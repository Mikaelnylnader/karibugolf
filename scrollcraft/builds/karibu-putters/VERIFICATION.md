# Karibu Putters verification

## Release

Verified local static package: `dist/static/shop/clubs/putters/index.html`

Preview reviewed at: `http://127.0.0.1:4515/shop/clubs/putters/`

Production reviewed at: `https://karibugolf.com/shop/clubs/putters/`

Netlify deploy `6ac7aee292059b8b1e0c73f0` was published after owner approval on 8 October 2026.

## Automated evidence

Harness: `execution/verify_putters_scroll.mjs`

Local and production result: PASS, with empty errors and failures arrays.

Configurations:

- Desktop: 1440 × 900
- Phone: 390 × 844
- Compact phone: 360 × 640
- Reduced motion: 390 × 844
- No JavaScript: 390 × 844

Assertions passed:

- HTTP 200 in every browser run
- 4 putter-style chapters
- 47 Tour markers, split 35 mallet and 12 blade
- 7 live catalogue products
- working PGA TOUR and PING source links
- keyboard activation of the stroke selector
- complete default fitting advice without JavaScript
- complete Tour figures without JavaScript
- zero broken images
- zero console or failed-request errors
- zero horizontal page overflow
- a healthy shape-rail travel of 3348px desktop, 1661px phone and 1534px compact phone
- fully visible Tour markers under reduced motion

Screenshots and the machine-readable report are in `scrollcraft/builds/karibu-putters/lab/`. The lab folder is evidence only and is not part of the deployment package.

## Visual findings and fixes

The first desktop pass established a strong layered opening and a legible Tour balance. Three defects were found during the phone and intermediate-state review:

1. The focal putter crossed the phone headline. The product plane was moved higher and its travel shortened so the complete title remains readable.
2. Early Tour markers could translate below the comparison frame. The physical board now clips its marker field while the markers settle.
3. The inherited fixed Clubs ledger obscured the Tour and fitting content. It is now suppressed only on this putter editorial route; the page keeps a visible return to Clubs and the global shop navigation.

The phone hero was refined again so both the product count and `Find your shape` destination are visible in the opening viewport.

## Feel check

Intended curve:

Focus → Recognition → Curiosity → Surprise → Confidence → Resolve

Cold rendered pass:

Focus → Orientation → Pause → Surprise → Understanding → Resolve

Difference and response:

- The shape rail felt more like orientation than recognition. That is useful for a comparison page and did not compete with the peak, so its factual labels and pacing were retained.
- The quiet Tour question read as a pause rather than curiosity. That silence improved the arrival of the 35-to-12 peak, so it was kept deliberately sparse.
- The Tour balance was the clearest and largest visual change in both desktop and phone contact sheets. It remained the single peak.
- The final live catalogue and WhatsApp handoff left visible content on screen and resolved the page instead of fading to an empty frame.

## Source boundary

Tour figures and quoted reasons are attributed in the page to PGA TOUR's 25 November 2025 equipment report. Stroke-type guidance is presented as a starting point and links to PING's current straight, slight-arc and strong-arc fitting framework. The copy expressly avoids treating Tour prevalence as a fitting rule.
