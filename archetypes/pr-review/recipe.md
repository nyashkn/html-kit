---
name: pr-review
when: use when rendering a PR review in reviewer voice: diff with margin notes, severity tags, jump links
---

# annotated-pull-request

**Use when:** rendering a PR review (reviewer voice) — diff with margin notes, severity tags, jump links. Reader is the PR author or another reviewer.

**Data shape:** PR metadata (title, num, author), summary verdict, list of files w/ hunks, per-hunk comments tagged severity (nit/suggest/block), top-level summary table.

## Gotchas

- (legacy): Keep diff hunks readable on narrow screens — don't fix-width to terminal columns.
- (legacy): Severity color: olive=nit, clay=suggest, rose=block. Stay consistent.
- (legacy): Give a verdict pill (approve / request-changes / comment) at top; readers skim for it.
- 2026-05-13: artifacts with 6+ sections need sticky right-rail TOC (≥1280px) w/ IntersectionObserver active-section marking. Hide rail under 1280px, fall back to top pill nav.
- 2026-05-13: include a summary strip at top with a jump-to-verdict/decision pill anchored to the most action-relevant section. Helps skimmers.
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
