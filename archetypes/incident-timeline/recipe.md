# incident-timeline

**Use when:** post-mortem of an outage — minute-by-minute timeline, log excerpts, follow-up checklist.

**Data shape:** incident id/title, severity, duration, summary, ordered events (timestamp + actor + description), root cause section, action items w/ owners.

**Gotchas:**
- Use a vertical timeline rail (left edge dots + lines) — readers expect chronology to look like time.
- Long log excerpts: wrap in `<details>` so they don't dominate the page.
- Action items at the BOTTOM with checkbox affordance and owners — that's the artifact's lasting value.

## Patterns
- `patterns/swimlane-flow.md` — multi-actor lanes × stage columns w/ failure-path edges.

## Gotchas

- 2026-05-13: artifacts with 6+ sections need sticky right-rail TOC (≥1280px) w/ IntersectionObserver active-section marking. Hide rail under 1280px, fall back to top pill nav.
- 2026-05-13: when content has linear progression, render TLDR strip as a single line of pills with arrows between (A → B → C).
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
