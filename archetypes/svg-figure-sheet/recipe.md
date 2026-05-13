# svg-figure-sheet

**Use when:** producing a set of inline SVG figures for a blog post / doc — vector art the user can tweak or copy out.

**Data shape:** ordered list of figures, each with caption + standalone SVG block. Often 3-8 figures.

**Gotchas:**
- Each figure must be a clean self-contained `<svg>` that can be copied independently.
- Use the palette tokens as `stroke`/`fill` — not arbitrary hex.
- Include a "copy SVG" affordance per figure so users can paste into their post.
