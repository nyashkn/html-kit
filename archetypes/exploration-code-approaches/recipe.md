# exploration-code-approaches

**Use when:** comparing 2-4 code-level solutions to the same problem (e.g. "debounced search — three approaches"). Reader needs to point at one.

**Data shape:** N approach objects, each with name, code snippet, trade-off bullets (pros/cons), complexity/perf notes.

**Gotchas:**
- Lay options side-by-side in a grid, not stacked — comparison is the point.
- Inline the actual code with syntax-style coloring; don't link out.
- End with a recommendation pill so the user has a default to react to.

## Gotchas

- 2026-05-13: include a summary strip at top with a jump-to-verdict/decision pill anchored to the most action-relevant section. Helps skimmers.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
