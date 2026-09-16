---
name: throwaway-mock
when: use when mocking one interactive UI control before any real code is touched, narrower than clickable-flow
---

# throwaway-mock

**Use when:** mocking an interactive UI element (a toolbar, control surface, widget) before any real code is touched — clickable, toggleable variant placements, inline A/B questions, and a self-filling reply template. Narrower than `clickable-flow` (one control surface, not a multi-screen journey).

**Data shape:** the surface being mocked (e.g. a player + its toolbar), a segmented control switching between N layout/placement variants, the mocked tool/control states themselves (toggleable, clickable), inline A/B decision questions anchored to specific controls, and a reply template that fills itself in from the answered questions.

## Patterns
- none yet — the segmented-control variant switcher is bespoke; don't force it into `patterns/option-card.md`, which is for picking ONE option, not live-toggling between layout variants.

## Gotchas

- (legacy): every control in the mock must be genuinely interactive (click, toggle, drag) — a static screenshot with callouts is a different archetype (`annotated-flowchart` or plain screenshot).
- (legacy): the A/B questions must be anchored to a SPECIFIC control, not asked in the abstract — the reader should be able to click the control the question is about.
- (legacy): the self-filling reply template is the payoff; render it live from the question answers, not as placeholder text.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/04-toolbar-mock.html` ("Know your unknowns" sub-page, pre-implementation category — original title "Mock before you wire").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
