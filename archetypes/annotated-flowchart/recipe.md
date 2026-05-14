# annotated-flowchart

**Use when:** explaining a process (deploy pipeline, request flow, state machine) as a clickable flowchart with timings and failure paths.

**Data shape:** ordered nodes (rect for action, diamond for decision, circle for terminal), edges with labels, per-node detail (timing, what runs, failure handling).

**Gotchas:**
- Inline SVG; arrows need real coords. Don't try CSS for this.
- Click-to-reveal node detail (JS toggle a side panel or `<details>` near the diagram).
- Show the happy path as solid lines, failure paths as `stroke-dasharray` w/ `--rose`.

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.
