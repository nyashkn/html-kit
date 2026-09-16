---
name: vocab-teacher
when: use when you need to learn an unfamiliar domain's vocabulary well enough to prompt precisely in it
---

# vocab-teacher

**Use when:** you need to learn an unfamiliar domain's vocabulary well enough to prompt precisely in it — pairs a vocabulary ladder with a live interactive demo so terms stop being abstract before you ask for the real work.

**Data shape:** domain name, a mental-model pipeline (ordered stages, one highlighted as "the creative/hard part"), a vocab ladder (term, one-line definition, a "say →" phrase showing how to actually use the term in a prompt), a live interactive demo with sliders/presets that maps 1:1 onto the vocab ladder above it, and a closing checklist of what to verify before handing the real task off.

## Patterns
- none yet — the live demo (sliders + before/after comparison) is bespoke per domain; don't force it into an existing pattern.

## Gotchas

- (legacy): the vocab ladder must be ordered from foundational → creative, matching the pipeline stages above it — don't alphabetize or randomize.
- (legacy): every "say →" line must be something a professional would actually type, not a restatement of the definition.
- (legacy): the interactive demo needs real before/after or A/B state, not decorative sliders — the point is proving the vocabulary maps to a visible effect.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/02-color-grading-explainer.html` ("Know your unknowns" sub-page, pre-implementation category — original title "Teach me my unknowns").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
