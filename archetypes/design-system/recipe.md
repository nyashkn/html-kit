---
name: design-system
when: use when rendering design tokens (colors, type scale, spacing) from a repo as live, copy-pasteable swatches
---

# design-system

**Use when:** rendering tokens (colors, type scale, spacing) pulled from a repo as live, copy-pasteable swatches.

**Data shape:** color tokens (name, hex, role), type scale (size, line-height, weight, sample), spacing scale (px or rem values), optional radii/shadows.

## Gotchas

- (legacy): Each swatch should show the real color rendered + the token name + the value — all three.
- (legacy): Add a "click to copy" affordance (small JS) for power users.
- (legacy): Group by role (brand / semantic / neutral), not alphabetical.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
