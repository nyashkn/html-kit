# annotated-flowchart

**Use when:** explaining a process (deploy pipeline, request flow, state machine) as a clickable flowchart with timings and failure paths.

**Data shape:** ordered nodes (rect for action, diamond for decision, circle for terminal), edges with labels, per-node detail (timing, what runs, failure handling).

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.

## Gotchas

- (legacy): Inline SVG; arrows need real coords. Don't try CSS for this.
- (legacy): Click-to-reveal node detail (JS toggle a side panel or `<details>` near the diagram).
- (legacy): Show the happy path as solid lines, failure paths as `stroke-dasharray` w/ `--rose`.
- 2026-05-13: when content has linear progression, render TLDR strip as a single line of pills with arrows between (A → B → C).
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
