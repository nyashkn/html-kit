---
name: implementation-notes
when: use when capturing what actually happened during a build vs. the plan, as a timestamped deviation log
---

# implementation-notes

**Use when:** capturing what actually happened during a build vs. what the plan said — a timestamped, filterable log of every deviation from plan, the conservative call made in the moment, and a short list of bullets to fold into the next attempt.

**Data shape:** doc header (branch/file, live-indicator dot), summary stat chips (deviation count, decisions-you-made-for-them count), filterable type chips (plan/dev/discovery/human-input), a vertical timeline of entries (timestamp, type badge, title, description, code refs, and — for deviations specifically — a chosen-vs-alternative sub-block), and a closing "fold into attempt #2" bullet list.

## Patterns
- none yet — the timeline-with-typed-node-colors is bespoke; don't reuse `patterns/swimlane-flow.md`, which is for multi-actor flows, not a single chronological log.

## Gotchas

- (legacy): this is a LOG, not a plan — write it in past tense, after the fact, from what genuinely happened, not as a forward-looking artifact.
- (legacy): every deviation entry needs the alternative that was NOT chosen, not just what was — the point is surfacing the fork, not just the outcome.
- (legacy): the closing bullets must be actionable for a re-attempt (e.g. "confirm X before writing Y"), not a restatement of the timeline.
- 2026-09-05: vendored from ThariqS/html-effectiveness `unknowns/09-implementation-notes.html` ("Know your unknowns" sub-page, during-implementation category).
- 2026-05-13: use `<details class="deep">` for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline `<style>`, inline SVG, inline JS. No CDN links, no `@import`, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
