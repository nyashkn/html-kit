# clickable-flow

**Use when:** prototyping a multi-screen interaction — N screens linked together so the user can feel the flow.

**Data shape:** ordered list of screens (each a small mockup), hotspot regions per screen mapping to next-screen target.

**Gotchas:**
- Keep fidelity low-medium; high-fi distracts from the interaction question.
- Single page, JS-swap visible screen — don't navigate to separate files.
- Add a "back to start" affordance so testers don't reload to retry.

## Gotchas

- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
