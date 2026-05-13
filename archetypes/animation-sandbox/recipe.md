# animation-sandbox

**Use when:** tuning a single transition/animation in isolation — sliders for duration/easing, live preview.

**Data shape:** the element being animated, the property/properties (transform, opacity, etc.), default duration + easing, range bounds for sliders.

**Gotchas:**
- Inline JS for the slider → CSS-var binding. Keep it tiny.
- Show the easing curve as inline SVG so users see the shape, not just the name.
- Provide a "copy CSS" button that emits the final `transition:` string.
