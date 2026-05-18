# implementation-plan

**Use when:** handing off a multi-step plan — milestones on a timeline, data-flow diagram, inline mockups, risky code, risk table. The strongest general-purpose template.

**Data shape:** plan title, summary/verdict, milestones (date + name + scope), data-flow diagram (SVG boxes/arrows), risk table (risk + likelihood + mitigation), open questions.

**Gotchas:**
- Sticky right-rail TOC ≥1280px with IntersectionObserver active-state — plans get long.
- Summary strip at top with jump-to-verdict pill.
- ASCII trees (file structure, dependency graph) MUST be `<pre class="tree">` not `<div>`.
- TLDR strip `Phase 1 → Phase 2 → Phase 3` if linear; skip if not.

## Patterns
- `patterns/decision-box.md` — close the plan with a verdict box (`patterns/decision-box.md`). Anchor the summary-strip jump-pill to its `id`.

## Gotchas

- 2026-05-13: pre.tree must be <pre>, not <div>. <div> collapses whitespace and breaks tree on narrow screens.
- 2026-05-13: artifacts with 6+ sections need sticky right-rail TOC (≥1280px) w/ IntersectionObserver active-section marking. Hide rail under 1280px, fall back to top pill nav.
- 2026-05-13: include a summary strip at top with a jump-to-verdict/decision pill anchored to the most action-relevant section. Helps skimmers.
- 2026-05-13: when content has linear progression, render TLDR strip as a single line of pills with arrows between (A → B → C).
- 2026-05-13: use <details class="deep"> for genuinely deep optional detail only (log excerpts, edge cases). Never wrap the main narrative in accordions — readers won't open them.
- 2026-05-13: artifacts must be fully self-contained. Inline <style>, inline SVG, inline JS. No CDN links, no @import, no external fonts (system stack is the brand).
- 2026-05-13: never propose edits to exemplar.html — it's the reference. Adapt by rendering a NEW file.

Append a line here whenever a v2-request reveals a wrong-archetype pick or a recurring render failure for this archetype. Format:

- YYYY-MM-DD: <symptom> → <fix>. Picked over <alternative-archetype> because <reason that turned out wrong>.

Read this section before selecting this archetype next time. It's the field manual.
