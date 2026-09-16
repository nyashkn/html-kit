---
name: exploration-code-approaches
when: use when comparing 2-4 code-level solutions to the same problem and the reader needs to pick one
---

# exploration-code-approaches

**Use when:** comparing 2-4 code-level solutions to the same problem (e.g. "debounced search — three approaches"). Reader needs to point at one.

**Data shape:** N approach objects, each with name, code snippet, trade-off bullets (pros/cons), complexity/perf notes.

## Gotchas

- (legacy): Lay options side-by-side in a grid, not stacked — comparison is the point.
- (legacy): Inline the actual code with syntax-style coloring; don't link out.
- (legacy): End with a recommendation pill so the user has a default to react to.
- 2026-05-13: include a summary strip at top with a jump-to-verdict/decision pill anchored to the most action-relevant section. Helps skimmers.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.
- 2026-06-02: dedup recall report v2 — user wanted before/after execution detail. Fix: added scenario tabs (JS) + side-by-side BEFORE/AFTER CRM-record cards + field-delta tables + accordions for connected-record handling (deals/SO re-parent to survivor) grounded in real counts. Pattern works well when a comparison artifact must also EXPLAIN an execution; keep before/after as side-by-side cards, tabs for scenarios, accordions for deep handling.
- 2026-09-06: comparison cards floated without job context, user couldn't place value. Fix: teach job-first (pressure → where in loop → contrast), not cards-first. Each visual must answer "where in my session does this hit" before "dsh vs omp".

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
