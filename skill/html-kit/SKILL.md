---
name: html-kit
description: Render structured content as polished single-page HTML artifacts using Anthropic-palette archetypes (plans, decisions, comparisons, explainers, dashboards, incident timelines, PR writeups, weekly status). Trigger phrases - "render this as html", "make this a shareable artifact", "html artifact", "magazine-style writeup", "single-page report", "render the synth/plan/spec/decision doc as html", "dashboard from this data", "explain this visually". Output is a self-contained .html file inlined CSS/SVG/JS, no external assets, ready to paste into Notion/email/PR or share as a link.
---

# html-kit

Router skill. You will pick one archetype from `archetypes/`, learn its pattern
from the exemplar, then render new HTML adapting that pattern to the user's
data. Output is a single self-contained `.html` file (inline CSS, inline SVG,
inline JS — no external assets).

## Workflow

### Step 0 — Pick render pattern

Four patterns. Pick by task signature, not reflex. Full rationale (council
deliberation, anti-patterns, when to revisit) in
`references/delegation-rationale.md` — read only when an unusual case
arises.

| Pattern | Model | Context handoff | Use when |
|---|---|---|---|
| **A. Inline (default)** | Opus (main) | None — main has it | User actively iterating · output <500 lines · no parallel work waiting · taste shaping in-thread |
| **B. Sonnet sub-agent** | Sonnet | Brief.md (lossy) | Narrow: ALL of (pre-spec'd output, pre-shaped data, one-shot, reference render exists) |
| **C. Opus sub-agent** | Opus (peer) | Verbose brief w/ full convo excerpt + reference render path | Main has parallel work · context budget tight (>70%) · output >500 lines · taste matters but main blocked |
| **D. Agent team** | Opus × N | Shared task list + msg-passing | Render is synthesis step in a pipeline already running sub-agents (`/search:deep`, `/council`) · multi-artifact set (3+ related HTML files) |

**Hard signals:**
- Brief longer than the diff from inline render → A.
- Would need to paste conversation transcript verbatim → A or C (never B).
- Already running ≥2 sub-agents in this turn → D (don't fresh-delegate).
- Output >1500 lines OR main near compaction → C minimum, D if pipeline.

**Never Haiku** for HTML >300 lines (loses global coherence — callouts drift,
emphasis flattens). Haiku acceptable only for fully-deterministic <500 line
templating w/ no taste calls.

**Pipeline integration hooks:**
- `/search:deep` synthesis → spawn render-teammate w/ access to research-agent
  outputs (D, not C).
- `/council` synthesis → render-teammate sees all persona outputs directly via
  shared task list.
- Multi-artifact deliveries → 1 main + N render-teammates parallel.

**Delegation skeleton (B/C):**
1. Brief at `/tmp/render-brief-<topic>.md`:
   - Source content **verbatim** (summarization kills intent for B/C)
   - Archetype slug + reason
   - Output path
   - Reference render path (the prior aesthetic anchor)
   - User constraints (palette, voice, sections to emphasize)
2. Spawn `general-purpose` sub-agent. `model: opus` for C, `model: sonnet` for B:
   > "Read /tmp/render-brief-<topic>.md. Read the html-kit SKILL at
   > ~/.claude/skills/html-kit/SKILL.md. Follow Steps 2-9. Report the
   > absolute output path. Nothing else."
3. `run_in_background: true` only if user signaled bg or main has parallel
   work. Default foreground.
4. Main runs `open <path>` and Step 9 follow-up.

**Agent team skeleton (D):** see Claude Code agent-teams docs
(https://code.claude.com/docs/en/agent-teams). Give the render-teammate
access to upstream sub-agent outputs via shared task list, not a copy-paste
brief.

### Inline workflow (Steps 1-9)

1. **Read the user request + source content.** Identify what kind of artifact
   they want: a plan? an incident postmortem? a comparison of options? a
   status report? a code review? an explainer? a dashboard?
2. **List archetypes.** `ls archetypes/` in this repo (path: `html-kit/archetypes/`).
   Skim directory names — slugs are descriptive.
3. **Read 2-4 candidate `recipe.md` files** for the closest matches. Each
   recipe states when to use, expected data shape, and gotchas. Pick one.
4. **Read the chosen `exemplar.html` in full.** Study its structure: head,
   inline CSS tokens, layout grid, sections, components, JS behaviour. Note
   what's idiomatic vs incidental.
5. **Render new HTML.** Adapt the pattern to user's data. Keep the
   Anthropic palette (`--ivory`, `--clay`, `--slate`, `--oat`, `--olive`,
   `--g100..g700`, serif display + sans body + mono accent). Keep
   self-contained.
6. **Write to user-specified path** or default to `/tmp/<slug>-<topic>.html`
   where `<topic>` is a kebab-case 2-4 word summary of the source content.
7. **Auto-open immediately.** Run `open <absolute-path>` via Bash right after
   the Write. Don't ask permission, don't wait — user wants to see it now.
8. **Report the path back as `open <path>`** (literal `open ` prefix). Single
   line, no prose summary — the artifact speaks for itself. The `open ` prefix
   lets the user copy-paste straight into another terminal session.
9. **Follow up with `AskUserQuestion`** if the artifact contains decision
   points, recommendations, or open questions. Mirror the in-artifact options
   as a 2-4 question structured QA panel so the user can resolve in-chat
   without retyping. See `~/.claude/rules/ask-structured.md` for schema. Skip
   only if the artifact is purely informational (status report, explainer,
   slide deck) with nothing to decide.

## Archetype selection cheatsheet

| User wants… | Likely archetype |
|---|---|
| multi-step rollout, milestones, risks | `implementation-plan` |
| compare 2-N options/approaches | `exploration-code-approaches` or `exploration-visual-designs` |
| postmortem, timeline of an outage | `incident-timeline` |
| weekly/sprint update | `weekly-status` |
| PR review (reviewer voice) | `pr-review` |
| PR description (author voice) | `pr-description` |
| explain how a system works | `explainer` (concrete or abstract flavour) |
| boxes-and-arrows of a process | `annotated-flowchart` or `module-map` |
| design tokens / swatches | `design-system` |
| component states/variants sheet | `component-variants` |
| short presentation | `slide-deck` |
| hand-drawn-style figures for a post | `svg-figure-sheet` |
| tune a single transition | `animation-sandbox` |
| click-through screen prototype | `clickable-flow` |
| triage / kanban board | `triage-board` |
| feature flag editor | `feature-flag-editor` |
| editable prompt template w/ live preview | `prompt-tuner` |

If nothing fits cleanly, `implementation-plan` is the strongest general
template — it accommodates TLDR strip, sections, callouts, tables, sticky TOC.

## Lessons learned (read before rendering)

These come from a v2 incident on `hamilton-restate-plan` where v1 looked
flat and dense:

- **ASCII trees: `<pre class="tree">` only.** Never `<div>`. Style with
  `font-family: var(--mono); white-space: pre; overflow-x: auto;`. A `<div>`
  collapses whitespace and the tree falls apart on narrow screens.
- **Sticky right-rail TOC ≥1280px** for any artifact with 6+ sections. Use
  `IntersectionObserver` to mark the active section as the user scrolls. Hide
  rail under 1280px and fall back to a top pill nav.
- **Summary strip at top** with a "jump to verdict / decision / recommendation"
  pill anchored to the most action-relevant section. Helps skimmers.
- **TLDR strip with inline flow `A → B → C`** when the content has linear
  progression (plans, incidents, pipelines). Renders as a single line of
  pills with arrows between.
- **Selective accordions only.** Use `<details>` for genuinely deep / optional
  detail (long log excerpts, full risk tables). Do NOT collapse the main
  narrative — readers won't open them.
- **Self-contained always.** Inline CSS in `<style>`, inline SVG, inline JS.
  No CDN links, no external fonts (system stack is the brand).
- **Keep the exemplars verbatim.** When you read one, don't propose edits to
  it — it's the reference. Adapt by rendering a NEW file.

## Tokens

Reference palette + base typography lives in the html-kit project repo at
`tokens/anthropic-palette.css` (path relative to project root —
`~/Documents/dev_work/personal_productivity/html-kit/tokens/anthropic-palette.css`
when invoked from elsewhere). Don't `@import` it — copy the `:root { ... }`
block inline at the top of your `<style>` tag. This keeps each artifact
self-contained.

## Patterns

`patterns/<slug>.md` are cross-archetype reusable components (CSS + HTML
fragments). Read the relevant archetype recipe's `## Patterns` section to see
which apply, then inline the fragment + CSS into your render. Never `@import`
or external-link.

Current patterns:
- `patterns/decision-box.md` — closing verdict section w/ ordered list + CTA.
  Use at the end of any decision-bearing artifact.

To promote a new pattern from a finished render, invoke
`/html-kit:add-to-patterns` (companion sub-skill).

## Output discipline

- Single `.html` file. No supporting CSS / JS / image files.
- Default path `/tmp/<slug>-<topic>.html` if user didn't specify.
- After writing, report the absolute path in one line. Nothing else.
