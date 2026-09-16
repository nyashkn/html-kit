---
name: reference-port-verify
when: use when porting a reference implementation and you need proof the semantics were understood before any port code
---

# reference-port-verify

**Use when:** porting a reference implementation from one language/system to another and you need PROOF Claude understood the semantics before any port code is written — matched excerpt pairs, margin gotcha notes, an edge-case table, and a preserved/changed/dropped breakdown.

**Data shape:** source and target language/file paths, N matched code-excerpt pairs (source snippet, target snippet, highlighted regions linked by numbered margin notes explaining WHY a region changed or must stay identical), an edge-case table (behavior, source handling, target handling, same/equivalent pill), and a three-column preserved/changed/dropped list summarizing the whole port.

## Patterns
- none yet — the matched-excerpt-with-margin-notes layout is bespoke; don't collapse it into a generic PR diff (`pr-review`) — this archetype is about semantics BEFORE code exists, not reviewing a diff after.

## Gotchas

- (legacy): every highlighted region in a code excerpt needs a numbered margin note — an unexplained highlight is worse than no highlight.
- (legacy): the edge-case table exists to surface behavior that DOESN'T obviously carry over (integer overflow, null handling, ordering guarantees) — don't pad it with cases that trivially port.
- (legacy): the preserved/changed/dropped columns are the actual sign-off artifact — get explicit agreement on the "dropped" column before writing the port, since that's where silent behavior loss happens.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/07-reference-port.html` ("Know your unknowns" sub-page, pre-implementation category — original title "Point at a reference").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
