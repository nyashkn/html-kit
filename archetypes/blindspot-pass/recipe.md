# blindspot-pass

**Use when:** before writing an implementation prompt against unfamiliar or unowned code — get Claude to scan the territory first and report the unknown unknowns, so the real prompt doesn't walk in blind.

**Data shape:** subject module/feature name and a short "what you asked for" framing, N blindspot cards (title, what a naive prompt misses, why it matters, a copyable prompt-fix line), an "asked vs. actually walking into" two-cell comparison, a stat strip, and a final assembled "better prompt" block built from the cards.

## Patterns
- `patterns/option-card.md` — if blindspot cards need a severity/copy-fix affordance, reuse the option-card chrome instead of inventing a new card style.

## Gotchas

- (legacy): the assembled "better prompt" at the bottom is the payoff — build it visibly from the cards above it (e.g. concatenated prompt-fix lines), don't just assert it exists.
- (legacy): each card needs a severity/category badge (e.g. security, perf, edge-case) so the reader can triage before reading all seven.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/01-blindspot-pass.html` ("Know your unknowns" sub-page, pre-implementation category).
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
