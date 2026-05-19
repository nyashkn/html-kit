# exploration-visual-designs

**Use when:** presenting 2-N visual/layout/palette directions for live reaction (not imagination).

**Data shape:** N design panes, each a fully rendered mini-mockup (hero, list, card, etc.) plus 1-2 line caption naming the trade-off it explores.

## Gotchas

- (legacy): Each pane must render the *real* thing, not a wireframe — the point is to react to live pixels.
- (legacy): Constrain each pane to similar bounding box so eye can compare.
- (legacy): Avoid labeling "Option A / B / C" generically; give each direction a name.
- 2026-05-13: include a summary strip at top with a jump-to-verdict/decision pill anchored to the most action-relevant section. Helps skimmers.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
