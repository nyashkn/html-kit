# component-variants

**Use when:** showing every size/state/intent of one component on a single sheet for design review.

**Data shape:** component name, list of variants (size × intent × state matrix), one rendered instance per cell.

**Gotchas:**
- Use a real grid (rows=intent, cols=size) — don't list linearly.
- Include disabled/loading/hover states; reviewers care about the edges.
- Keep all variants on one page; no tabs or accordions.

## Gotchas

- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
