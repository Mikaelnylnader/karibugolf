# Karibu About verification

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
