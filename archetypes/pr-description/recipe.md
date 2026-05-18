# pr-writeup

**Use when:** the PR author's writeup for reviewers — motivation, before/after, file-by-file tour with the *why*, where to focus the review.

**Data shape:** PR title, motivation paragraph, before/after side-by-side (code or behavior), per-file changes w/ rationale, "review focus" call-out list.

**Gotchas:**
- Lead with motivation, not the diff. Reviewers need to know *why* before *what*.
- Before/after as side-by-side panels, not stacked.
- Highlight 1-3 files as "focus here"; the rest get a one-line summary.

## Gotchas

- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
