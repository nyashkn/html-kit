---
name: buy-in-pitch
when: use when pitching a shipped-but-not-yet-approved feature for sign-off, pre-answering reviewer objections
---

# buy-in-pitch

**Use when:** pitching a shipped-but-not-yet-approved feature for sign-off — leads with a demo of the actual flow, pre-answers every objection a reviewer was about to raise with cited evidence, and names exactly who needs to approve what.

**Data shape:** doc title + a "when shipped" timechip, an embedded demo player (can be a staged/animated mock of the real flow), a one-paragraph pitch, an objections list as expandable Q&A cards each backed by an evidence reference/link, a spec table, two-column risk/needs cards, an approver list (name, role, exactly what they're being asked to sign off on), and a closing bottom-line statement.

## Patterns
- `patterns/decision-box.md` — the closing bottom-line statement should read like this pattern's verdict box.

## Gotchas

- (legacy): objections must be REAL objections a skeptical reviewer would actually raise, each with a citable answer — a pitch doc that only answers softball questions isn't doing its job.
- (legacy): the approver list must name a specific person/role and a specific thing they're approving, never a vague "stakeholders should review."
- (legacy): the demo should show the ACTUAL flow, not a decorative animation — if there's nothing real to demo yet, this is the wrong archetype (use `implementation-plan` instead).
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/10-pitch-doc.html` ("Know your unknowns" sub-page, post-implementation category — original title "The buy-in doc").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
