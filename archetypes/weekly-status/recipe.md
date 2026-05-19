# weekly-status

**Use when:** a recurring engineering/team status — what shipped, what slipped, a small chart, formatted for Monday-morning skimming.

**Data shape:** week range, headline metric(s), shipped list, slipped list, risks list, optional small bar/line chart, owner table.

## Gotchas

- (legacy): Lead with the headline metric and a delta vs last week. Skimmers need a number first.
- (legacy): Color slipped items with `--rose` or `--clay`; shipped with `--olive`.
- (legacy): Keep chart small (under 160px tall) — it's flavor, not the point.
- 2026-05-13: artifacts with 6+ sections need sticky right-rail TOC (≥1280px) w/ IntersectionObserver active-section marking. Hide rail under 1280px, fall back to top pill nav.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
