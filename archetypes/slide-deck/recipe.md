# slide-deck

**Use when:** turning a doc/Slack thread/synth into an arrow-key navigable deck for a meeting. No Keynote, no export.

**Data shape:** ordered list of slide objects, each with title + content blocks (bullets, image/svg, quote, table). 5-15 slides typical.

**Gotchas:**
- Bind ←/→/Space for nav; show slide N/M in a corner.
- One idea per slide. If a slide has 7 bullets, split it.
- Don't paginate live — render all sections, JS toggles `display`.

## Gotchas

- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
