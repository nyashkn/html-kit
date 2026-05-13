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
