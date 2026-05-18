# prompt-tuner

**Use when:** iterating on a prompt template with variable slots — editable template on left, N sample inputs re-rendering live on right.

**Data shape:** prompt template w/ `{{var}}` placeholders, list of variable names, 3-5 sample input sets, optional model/temperature controls.

## Gotchas

- (legacy): Highlight `{{var}}` slots in the template w/ `--clay` background.
- (legacy): Live re-render on every keystroke — debouncing kills the feedback loop.
- (legacy): "Copy final prompt" button per sample so users can paste a single rendered version.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
