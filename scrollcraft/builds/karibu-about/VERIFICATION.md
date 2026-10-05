# Karibu About verification

## Founder photos and KSh-only storefront, 5 October 2026

### Final-source scope and experience

This extends the existing About page rather than introducing a new page grammar. Hospitality procession, site navigation, opening aperture and open-circle contact close are retained. The seven alternatives would require redesigning the requested page; the fingerprint registry records this as maintenance, not a new row or a fabricated four-of-six pass. Brief uses the owner's actual photographs and updated biography plus the existing approved direction, not a new interview or invented quotation.

Journey: meet Mikael beside the tee-off photograph; read his playing/coaching story and travelled path; see putting and walking photographs; reach the existing community invitation. Intended feelings: recognition, trust, connection, belonging. Cold review of the rendered frames: personal, grounded, candid, welcoming. The first desktop review felt cluttered at the lower spread because a sticky caption overlapped the putting caption. Separating the introduction's sticky container from the lower spread restored the intended quiet connection. The opening aperture remains the page-wide peak and signature; no additional pinning, video, artificial tournament imagery or empty spans were added.

Device score: natural-flow print mask at founder identity; existing steady prose and drawn career trace; independently settling photographic frames in an asymmetric desktop spread; gentler one-column phone movement; fully static reduced-motion/no-JavaScript frames. Photo progress is measured from stable outer figures. All captions sit outside photographs on a solid branded ground. The supplied images themselves identify the event as qualifying, so new captions use that description; the biography's playing/coaching claims remain owner-supplied.

### Assets

`execution/prepare_founder_photos.mjs` creates full-frame 1536×1024 WebP delivery copies from the three Downloads PNGs. Originals were hash-checked unchanged. Combined transfer size is 639,648 bytes rather than 6,386,255 bytes of PNGs. No crop, invented scene, recolouring, paid generation, or shared-engine change. The walking image retains the markings in the supplied photograph, including its embedded arrows; those are not website controls.

### Local acceptance and preserved findings

- `npm run build`: passed, including the unchanged five-product catalogue.
- Targeted lint of the About source, local choreography, edited purchase/card components and execution tests: passed. Existing unrelated no-img-element and native-link lint findings in the category/stock sources were not repaired as part of this request; native static navigation remains deliberate for this export.
- Final About run: `.tmp/about-scroll-qa/2026-10-05T07-15-06-199Z/report.json`, no errors or failures. Covers desktop 1440×1000, phone 390×844, compact 360×640, reduced motion and no JavaScript.
- Six positions per photograph in four motion/layout contexts: 72 image-state samples, full 3:2 image ratios, all qualifying captions, distinct painted frame transforms, complete final masks, no horizontal overflow, no intro/gallery overlap. Existing biography, customer invitation, career trace, community photograph, inquiry URL and keyboard focus regression checks also pass.
- The earlier `.tmp/about-scroll-qa/2026-10-05T07-11-09-618Z` mechanical run was green but its visual review exposed sticky caption overlap. The later run supersedes it with an explicit overlap assertion and the separate sticky container fix. Do not treat the first green result as visual acceptance.
- Desktop ScrollCraft harness: `.tmp/founder-scroll-harness/desktop/report.json`. Nineteen samples of the retained pinned/pan sequences, no dead scroll, media cues at least 4.5:1 at their worst sampled frame. The harness does not sample these natural-flow photos automatically; the 72 custom photo samples cover that gap.
- Reviewed contact sheets: final desktop putting and phone walking sheets inside the final About QA directory, retained desktop harness sheet, and full-size desktop intro/pair, phone, compact and reduced frames. Final images/captions remain complete and separate from prose; no copied frame has been reused as evidence for the revised source.
- KSh-only run: `.tmp/storefront-currency-qa/2026-10-05T07-15-16-463Z/report.json`, all 12 routes pass. Five product pages, homepage, main shop, stock room, clubs/irons/balls category views have no public RMB/USD prices or foreign-price elements; offer schema stays KES.
- The backend, Google Sheet, exchange-rate formulas, product amounts, quantities and availability were not edited for this presentation change.

### Limits

Headless real Chrome with phone-sized viewports is not physical phone/touch testing. No new forms, reservations, registrations or messages are sent. No tournament year or photographer credit was invented. Existing image markings are retained. This report supplements, not replaces, the earlier page-history evidence below.

### Production acceptance for this update

- Published to `https://karibugolf.com` by Netlify deploy `6ac34f745d734bc2e26ddeba`.
- Live About suite: `.tmp/about-scroll-qa/2026-10-05T07-20-00-919Z/report.json`, no errors or failures. All 72 founder photo samples, the static fallbacks and the existing About interactions/scroll assertions repeated against production. The live desktop pair was visually inspected after deployment.
- Live pricing suite: `.tmp/storefront-currency-qa/2026-10-05T07-20-01-552Z/report.json`, all 12 routes pass with KSh-only public display and KES offers. Backend RMB/USD data is retained.

## Build

- `npm run build`: passed.
- Static export: `dist/static/about/index.html`.
- Page length: 12.8 viewport heights on desktop, 12.6 on the 390 × 844 phone simulation, 7.0 with reduced motion.
- ScrollCraft preflight: Node, FFmpeg, WebP, Playwright and Chrome available. The optional Kie.ai key was absent and was not needed because the build reused local photography.

## Automated browser acceptance

`node execution/verify_about_scroll.mjs http://127.0.0.1:4505`

- ScrollCraft mounted.
- Hero aperture produced distinct opening, midpoint and resolved states.
- Desktop service rail overflow measured 3,224px and travelled through distinct transforms.
- Mobile service rail overflow measured 1,334px and remained inside the document viewport.
- Three service promises and the `/contact` handoff were present.
- No broken images, console errors, failed requests or document-level horizontal overflow.
- Reduced motion replaced pinned travel and the lateral rail with a readable grid. All promises remained visible.

The ScrollCraft harness was run against desktop, mobile and reduced-motion contexts. Final results:

- No dead scroll detected.
- All media-overlaid cues cleared 4.5:1 contrast at their worst sampled frame.
- Contact sheets and full-size frames were reviewed in `lab/harness-desktop-final`, `lab/harness-mobile-final` and `lab/harness-reduced-final`.

## Visual review and feel check

Intended curve: recognition, grounding, intimacy, confidence, resolve.

Cold read of the rendered sequence: welcome, calm, closeness, confidence, invitation. “Calm” replaced the brief’s word “grounding,” but it serves the same quiet beat before the people section. No structural change was needed. The peak remained the aperture opening and the close resolved as planned.

The first pass found two issues and the later runs supersede it:

1. Reduced motion retained the flex rail. The page now overrides it with a two-column grid and a one-column phone grid.
2. Early contrast sampling found the golfer image painted above the localized hero shade and the people copy arrived before its lime ground. The shade now sits between media and copy, and the people ground completes before the dark copy enters.

## Limits

Mobile was verified in real Chrome with simulated 390 × 844 and 360-class responsive behavior, not on a physical phone. The page contains no scrubbed video, WebGL or device-decoder dependency.

## Production

- Live URL: `https://karibugolf.com/about/`
- Netlify deploy: `6abfb664f54ad594cea4e979`
- The production run repeated the desktop, mobile and reduced-motion assertions with no failures, browser errors, failed requests, broken images or overflow.
