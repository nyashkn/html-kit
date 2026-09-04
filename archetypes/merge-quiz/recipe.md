# merge-quiz

**Use when:** verifying you actually understood a large diff before merging it — a merge-readiness report (before/after mental model, non-obvious behaviors introduced) paired with a must-pass quiz whose wrong answers link straight back to the section that explains the right one.

**Data shape:** branch/diff header (branch name, file/commit stats, +/- line counts), a before/after mental-model diagram of what the change actually does end-to-end, N "non-obvious behavior" cards (what/why/where, each citing real file:line refs), a quiz section (N questions, each with options, immediate right/wrong feedback that quotes the source excerpt it came from), and a result card that differs on pass (merge checklist) vs. fail (re-read links back to the specific section skimmed).

## Patterns
- none yet — the quiz-with-source-quoting-feedback loop is bespoke to this archetype.

## Gotchas

- (legacy): quiz questions must test understanding of the NON-OBVIOUS behaviors specifically (the cards above), not trivia about the diff stats — a question anyone could answer from the file list alone defeats the point.
- (legacy): wrong-answer feedback must quote the actual source excerpt and link back to the exact card/section, not just say "read more carefully."
- (legacy): failing the quiz must genuinely gate the "ready to merge" state in the UI — if pass/fail has no visible consequence, this degrades to a plain incident-style report.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/11-change-quiz.html` ("Know your unknowns" sub-page, post-implementation category — original title "Quiz me before I merge").
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
