# prompt-tuner

**Use when:** iterating on a prompt template with variable slots — editable template on left, N sample inputs re-rendering live on right.

**Data shape:** prompt template w/ `{{var}}` placeholders, list of variable names, 3-5 sample input sets, optional model/temperature controls.

**Gotchas:**
- Highlight `{{var}}` slots in the template w/ `--clay` background.
- Live re-render on every keystroke — debouncing kills the feedback loop.
- "Copy final prompt" button per sample so users can paste a single rendered version.
