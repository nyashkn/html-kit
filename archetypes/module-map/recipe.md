# module-map

**Use when:** explaining an unfamiliar package/module — boxes-and-arrows of internal structure, hot path highlighted, entry points listed.

**Data shape:** list of modules (boxes) w/ short purpose, edges between them (call/import), 1-2 entry points, a "hot path" sequence to highlight.

**Gotchas:**
- Inline SVG for the diagram; don't try CSS-grid the boxes — arrows need real coords.
- Highlight the hot path with `--clay` strokes; everything else `--g500`.
- Pair the diagram with a list of entry points and a 3-line "where to start reading" note.
