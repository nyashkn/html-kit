---
name: design-reaction-review
when: use when the reviewer needs to react per-element across 3-4 wildly different visual directions of the same data
---

# design-reaction-review

**Use when:** near-identical to `exploration-visual-designs`, but the reviewer needs to react to specific elements inline instead of picking a whole direction — renders the SAME data/queue in 3-4 wildly different visual languages (ops console, editorial, kanban, terminal, ...) with per-element steal/skip chips that assemble a written reply as you click.

**Data shape:** the shared underlying dataset (same across every direction — say so explicitly so the reader knows it's constant), N direction blocks each a fully-rendered live mock in a distinct visual language, a "this direction says:" one-liner per block, per-element steal/skip chips mapped to specific UI pieces (not whole directions), and an assembled reply built from the checked chips.

## Patterns
- `patterns/option-card.md` — reuse for the direction-picker chrome around each mock if a summary grid is added above the four blocks.

## Gotchas

- (legacy): pick this over `exploration-visual-designs` only when the reviewer needs to mix-and-match elements ACROSS directions (steal X from direction 2, skip Y from direction 1) — if they're picking ONE whole direction, use the simpler archetype instead.
- (legacy): each direction must be a genuinely different visual language, not a palette swap — the four exemplar directions (dark ops console, editorial serif, kanban board, terminal) are the calibration bar.
- (legacy): chips must be scoped to specific elements, not the direction as a whole, or the assembled reply is just "I like direction 2."
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/03-design-directions.html` ("Know your unknowns" sub-page, pre-implementation category — original title "Four design directions").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
