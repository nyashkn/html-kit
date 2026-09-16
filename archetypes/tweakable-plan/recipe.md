---
name: tweakable-plan
when: use when a plan's real risk is which decisions get revisited, not execution order: sort by likelihood-of-tweaking
---

# tweakable-plan

**Use when:** an implementation plan's real risk isn't execution order, it's WHICH DECISIONS get revisited — sort sections by likelihood-of-tweaking (highest first) instead of build order, flag schema/type choices with toggleable alternatives inline, and collapse the mechanical work to the bottom. Prefer plain `implementation-plan` when the plan is mostly sequencing, not decisions.

**Data shape:** chips (effort estimate, risk level), a sort-order banner explaining the likelihood-of-tweaking ordering up front, plan sections labeled high/low likelihood, schema/type-interface diagrams with flagged columns, choice-cards with a toggle button revealing an alternate approach + a tradeoff note, code blocks with margin annotations, and a final "mechanical work" section collapsed below everything decision-worthy.

## Patterns
- `patterns/decision-box.md` — the choice-card toggle (main vs. alt) should use this pattern's verdict-box chrome for the "picked" state.

## Gotchas

- (legacy): pick this over `implementation-plan` ONLY when 2+ real decision points exist that the reader might want to flip — if the plan is just ordered steps with no real forks, use the plain archetype.
- (legacy): the sort-order banner must be explicit and visible — readers expecting execution order will be confused if section A (a schema choice) reads before section B (a config change) with no explanation.
- (legacy): every choice-card's alternate view needs its own tradeoff line — a toggle with no stated cost isn't a real decision point, it's decoration.
- (legacy): the mechanical/boilerplate section at the bottom should genuinely be low-risk, low-decision work — don't bury a real decision there just because it's tedious to describe.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/08-implementation-plan.html` ("Know your unknowns" sub-page, pre-implementation category — original title "The tweakable plan"). Distinct from the existing `implementation-plan` archetype (upstream demo 16) which is execution-order, not decision-order.
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
