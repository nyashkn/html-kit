# feature-flag-editor

**Use when:** editing a feature-flag config interactively — toggles grouped by area, dependency warnings, copy-diff export.

**Data shape:** flag list (key, current value, area, depends-on), grouping by area, dependency edges between flags.

**Gotchas:**
- Show a warning chip when a flag's prerequisite is off — silent broken state is the failure mode.
- "Copy diff" must emit ONLY the changed keys, not the whole config.
- Group toggles by area; flat lists of 30 flags are unscannable.

## Gotchas

- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
