---
name: module-map
when: use when explaining an unfamiliar package/module: boxes-and-arrows of internal structure, hot path highlighted
---

# module-map

**Use when:** explaining an unfamiliar package/module — boxes-and-arrows of internal structure, hot path highlighted, entry points listed.

**Data shape:** list of modules (boxes) w/ short purpose, edges between them (call/import), 1-2 entry points, a "hot path" sequence to highlight.

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.

## Gotchas

- (legacy): Inline SVG for the diagram; don't try CSS-grid the boxes — arrows need real coords.
- (legacy): Highlight the hot path with `--clay` strokes; everything else `--g500`.
- (legacy): Pair the diagram with a list of entry points and a 3-line "where to start reading" note.
- 2026-05-13: pre.tree must be <pre>, not <div>. <div> collapses whitespace and breaks tree on narrow screens.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
