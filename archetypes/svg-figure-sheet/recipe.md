# svg-figure-sheet

**Use when:** producing a set of inline SVG figures for a blog post / doc — vector art the user can tweak or copy out.

**Data shape:** ordered list of figures, each with caption + standalone SVG block. Often 3-8 figures.

## Gotchas

- (legacy): Each figure must be a clean self-contained `<svg>` that can be copied independently.
- (legacy): Use the palette tokens as `stroke`/`fill` — not arbitrary hex.
- (legacy): Include a "copy SVG" affordance per figure so users can paste into their post.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
