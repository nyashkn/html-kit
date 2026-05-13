---
name: html-kit
description: Render structured content (plans, decisions, comparisons, dashboards) as polished single-page HTML artifacts using Anthropic-palette archetypes from html-effectiveness. Use when user wants HTML render of synth/plan/spec/decision doc, asks for a "magazine-style" artifact, or wants to share analysis as a self-contained shareable page.
---

# html-kit

Router skill. You will pick one archetype from `archetypes/`, learn its pattern
from the exemplar, then render new HTML adapting that pattern to the user's
data. Output is a single self-contained `.html` file (inline CSS, inline SVG,
inline JS — no external assets).

## Workflow

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

`tokens/anthropic-palette.css` is reference for the palette + base typography.
Don't `@import` it — copy the `:root { ... }` block inline at the top of your
`<style>` tag. This keeps each artifact self-contained.

## Output discipline

- Single `.html` file. No supporting CSS / JS / image files.
- Default path `/tmp/<slug>-<topic>.html` if user didn't specify.
- After writing, report the absolute path in one line. Nothing else.
