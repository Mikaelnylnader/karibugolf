# Karibu Golf About: ScrollCraft brief

## Evidence and scope

This is a targeted rebuild of the existing `/about/` page. The decisions below reuse the live Karibu Golf brand, the supplied local photography, the existing About copy, and the owner’s direction that Karibu Golf serves East Africa from Nairobi. No quotations, statistics, customer claims, or new service promises have been invented.

| Interview topic | Reused evidence | Decision for this update |
|---|---|---|
| Purpose | Explain what Karibu Golf stands for | Turn the static page into a short, welcoming brand story |
| Audience | New and experienced golfers across East Africa | Write plainly enough for a first-time golfer without talking down to experienced players |
| Core belief | “Karibu means welcome” and “more than the gear, it’s the people” | Make welcome the organizing idea, not a decorative tagline |
| Desired action | Contact Karibu Golf | Resolve on one clear “Let’s talk golf” link |
| Offer | Equipment, apparel, essentials, personal help, special orders and delivery | Keep the three promises factual and scannable |
| Place | Based in Nairobi, serving East Africa | Use place as context without narrowing the audience to Kenya alone |
| Assets | `hero.jpg`, `golf-moment.jpg`, `fairway-aerial.jpg`, `karibu-badge.svg` | Reuse verified local assets; generate nothing |
| Art direction | Existing fairway green, paper, lime and brass palette | Natural golf editorial with deep fairway shadow and warm paper sections |

## Page grammar

**Hospitality procession**, authored for this page. The unit is a threshold rather than a card or chapter. Each scene opens the frame further: aperture, invitation, shared table, service horizon, open-circle close. It forbids product grids, numbered chapters, a fixed index, and a generic spotlight button ending. The global site navigation remains, but the page’s own chrome is a thin “welcome line” that fills as the story opens.

This differs from every existing Karibu fingerprint on all six dimensions: a new grammar, non-navigation welcome-line chrome, aperture hero, pin/flow/pin/pan/flow sequence, open-circle contact close, and the Karibu aperture signature move.

## Journey and feeling curve

| Beat | Visitor learns | Intended feeling | What causes it |
|---|---|---|---|
| 1 | Karibu means welcome | Recognition | A small badge aperture opens into the golf course and a real golfer |
| 2 | The brand is based in Nairobi and serves East Africa | Grounding | A quiet editorial spread pairs place, purpose and local photography |
| 3 | The work is about people as much as equipment | Intimacy | A held field lets the two statements trade emphasis around one shared circle |
| 4 | What Karibu provides | Confidence | A lateral service horizon gives each practical promise its own space |
| 5 | A question can start a conversation | Resolve | The aperture becomes a complete open circle around the contact invitation |

## Peak, hook and silence

- **Peak:** the opening aperture grows from the Karibu badge until the golfer and course occupy the whole frame. It gets the largest visual change and the longest single held beat.
- **Tell-someone sentence:** “It’s the About page where the Karibu badge opens into the course and the same circle meets you again at the invitation.”
- **Authored silence:** the pale origin spread after the hero deliberately drops the scale and motion so the people statement can feel close rather than loud.
- **Ending:** the circle settles, the copy holds, and the contact link remains visible.

## Layer contract

| Plane | Asset and depth | Movement | Rule |
|---|---|---|---|
| Far course | `hero.jpg`, full bleed | Slow backward parallax | Always covers the stage |
| Mid aperture image | `golf-moment.jpg` | Faster restrained parallax inside a growing circular mask | The golfer stays visible at the right of the copy |
| Near rings | CSS/SVG circles | Scale and rotate from page-local progress | Never cover the headline or contact control |
| Typography | Semantic HTML | Stable, with one kinetic headline | Remains readable at the opening and on mobile |
| Atmosphere | Localized edge shade and grain | Opacity only | No full-frame overlay |

## Device plan and pacing

1. Pin + parallax + kinetic aperture hero, 2.8 viewport heights.
2. Flow + reveal origin spread, about 1.5 viewport heights.
3. Pin + cue people belief, 2.2 viewport heights.
4. Pan service horizon, 4.6 viewport heights with more than half a viewport of measured overflow.
5. Flow + bespoke aperture close, about 1.4 viewport heights.

Total target: roughly 12.5 viewport heights on desktop, with a separately composed mobile layout and a fully reachable reduced-motion version.

## Signature move

**Karibu aperture.** Page-local JavaScript derives a real painted-state value from hero and close positions. The hero’s circular window expands from the badge to reveal the golfer; the close reuses the same geometry as three arcs that settle into one complete invitation ring. It publishes compact `data-sc-verify-state` signatures for the mechanical check. This is not a ScrollCraft device parameter and does not alter the shared engine.

## Score table

| Criterion | Score | Evidence |
|---|---:|---|
| Emotional arc | 3 | Recognition, grounding, intimacy, confidence, resolve |
| Clear peak | 3 | One dominant aperture reveal at the opening |
| Structural specificity | 3 | Threshold-based hospitality procession |
| Device variety | 3 | Pin, parallax, kinetic, reveal, flow, pan |
| Brand fidelity | 3 | Existing palette, lockup, photography and factual copy |
| Mobile intent | 3 | Portrait crop, smaller aperture origin and stacked service fallback |
| Reduced motion | 3 | No lost content; rail becomes a readable grid |
| Accessibility | 3 | Semantic headings, real links, alt text, visible focus, no focusable pinned cue |

**Result: 24/24.** Proceed to implementation and verify against rendered evidence.
