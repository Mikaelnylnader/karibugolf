# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| Karibu Shop | Gallery / catalog | Sticky six-department index plus Fairway Trail | Layered photographic shop window | flow+parallax > in-view index > reveal+tilt gallery > flow service, 5.1vh desktop / 8.0vh phone | Service ledger resolving with completed department trail | Clickable Fairway Trail grows and marks the active department | Kenyan golf editorial, Fairway / Sand / Brass | 4500 |
| Karibu Departments | Gallery / catalog | Fixed accumulating Kit Ledger with direct category index | First category as a labelled full-bleed photographic object | object hero > 0-9 reveal/parallax chapters > product shelf > inquiry, 9.0vh desktop / 10.2vh phone / 13.0vh compact for Clubs | Collection-desk inquiry label after the live product shelf | Kit Ledger stamps visited categories and resolves as a completed kit | Kenyan golf editorial, Fairway / Sand / Coal / Brass | 4501 |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Gallery / catalog grammar with a sticky department index.
- Layered photographic shop-window hero without video.
- Flow-led reveal gallery at roughly 5.1 desktop viewport-heights and 8 phone viewport-heights.
- Service-ledger close with a completed navigation trace.
- Clickable Fairway Trail signature move.
- Accumulating category ledger with permanent visited stamps.
- First-category object hero followed by alternating photographic chapters.
- Product-shelf close resolving into a collection-desk inquiry label.
- Representative 8-act range at 9.0 desktop viewport-heights and 10.2 phone viewport-heights.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
