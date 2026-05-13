# slide-deck

**Use when:** turning a doc/Slack thread/synth into an arrow-key navigable deck for a meeting. No Keynote, no export.

**Data shape:** ordered list of slide objects, each with title + content blocks (bullets, image/svg, quote, table). 5-15 slides typical.

**Gotchas:**
- Bind ←/→/Space for nav; show slide N/M in a corner.
- One idea per slide. If a slide has 7 bullets, split it.
- Don't paginate live — render all sections, JS toggles `display`.
