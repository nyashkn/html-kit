---
name: requirements-interview
when: use when a feature is ambiguous enough that a plan would just encode guesses: interview one question at a time
---

# requirements-interview

**Use when:** a feature or change is ambiguous enough that a plan would just encode guesses — interview the user one question at a time, ordered by architectural blast radius (biggest-consequence decisions first), then hand back a decisions table and a ready-to-paste implementation prompt.

**Data shape:** feature/change name, an ordered list of questions (each with 2-4 options, a rationale for why it's asked, and its blast-radius rank), a progress rail showing answered vs. current vs. upcoming questions, a running decisions table (question, decision, rationale, redo affordance) built as questions are answered, and a final assembled implementation prompt generated from the full decisions table.

## Patterns
- `patterns/option-card.md` — the per-question option cards should follow this pattern's chrome.

## Gotchas

- (legacy): question order MUST be by blast radius (a wrong answer to question 1 should invalidate the most downstream work), not by convenience or the order they occurred to you.
- (legacy): the rail must show progress (answered/current/upcoming) — a bare list of questions with no state is just a form, not an interview.
- (legacy): the assembled prompt at the end must actually incorporate every decision from the table, not just gesture at "the choices above."
- (legacy): include a "type your own answer" escape hatch per question — canned options alone will miss the real answer often enough to matter.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/06-interview.html` ("Know your unknowns" sub-page, pre-implementation category — original title "The interview").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
