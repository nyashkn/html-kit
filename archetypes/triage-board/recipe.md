---
name: triage-board
when: use when ordering N tickets/items across columns (Now/Next/Later/Cut) with drag-and-drop and export
---

# triage-board

**Use when:** ordering N tickets/items across columns (Now / Next / Later / Cut) with drag-and-drop, then exporting the result.

**Data shape:** list of tickets (id, title, owner, size estimate), set of column names, initial assignment per ticket.

## Gotchas

- (legacy): HTML5 drag-and-drop is fine for this scale; don't pull in a library.
- (legacy): Column counts at top of each column update live as items move.
- (legacy): "Copy as markdown" button at top — the export is half the value of the artifact.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
