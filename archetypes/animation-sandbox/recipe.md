---
name: animation-sandbox
when: use when tuning a single transition or animation in isolation with duration/easing sliders and a live preview
---

# animation-sandbox

**Use when:** tuning a single transition/animation in isolation — sliders for duration/easing, live preview.

**Data shape:** the element being animated, the property/properties (transform, opacity, etc.), default duration + easing, range bounds for sliders.

## Gotchas

- (legacy): Inline JS for the slider → CSS-var binding. Keep it tiny.
- (legacy): Show the easing curve as inline SVG so users see the shape, not just the name.
- (legacy): Provide a "copy CSS" button that emits the final `transition:` string.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
