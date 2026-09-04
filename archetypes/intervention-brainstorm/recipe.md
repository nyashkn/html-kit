# intervention-brainstorm

**Use when:** brainstorming candidate interventions/fixes for a named problem (e.g. churn) and the ideas need to be grounded in the ACTUAL codebase, spread across a real effort spectrum, and reviewable with lightweight resonate checkboxes.

**Data shape:** the problem framing (with a metric if there is one), an effort spectrum strip running ship-this-afternoon ↔ quarter-long-bet with each idea plotted as a dot on it, N intervention cards (title, effort/impact chips, description, concrete code references), and resonate checkboxes on each card that assemble a reply of "the ones that landed."

## Patterns
- none yet — the spectrum-strip-with-plotted-dots is bespoke to this archetype.

## Gotchas

- (legacy): every intervention MUST cite a real file/function from the codebase — a brainstorm of generic advice ("improve onboarding") defeats the point of this archetype; use a plain bullet list instead.
- (legacy): the spectrum strip needs the dots positioned by ACTUAL estimated effort, not evenly spaced — bunching is informative (e.g. five quick wins vs. one big bet).
- (legacy): resonate checkboxes assemble a reply listing ONLY the checked ideas — don't require the reader to type anything to get a usable response.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/05-churn-brainstorm.html` ("Know your unknowns" sub-page, pre-implementation category — original title "Brainstorm the intervention").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
