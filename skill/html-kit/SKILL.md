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

### Step 0 — Pattern selection

Default to **Pattern A** (inline render in main thread). Deviate ONLY when:
- main context >70% used → Pattern C (Opus sub-agent)
- output projected >1500 lines → Pattern C
- already running ≥2 sub-agents this turn → Pattern D (agent team)
- Sonnet sub-agent (Pattern B) is almost always wrong — see `references/delegation-rationale.md` before choosing it.

Full deliberation, edge cases, and anti-patterns: `references/delegation-rationale.md`.

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

   Additional rendering rules:
   - Every top-level wrapper `<div>` carries `data-component="..."` where the
     value is one of: `header | status-strip | approach-grid | proposal-card |
     code-artifact | verdict | toc | deep-detail`. Use new component names if
     needed but be deliberate.
   - Decision-bearing artifacts MUST use option-card grid (see
     `patterns/option-card.md`), not `<ul>` markdown lists.
   - Code shown inside an artifact uses styled `<pre class="code">` component
     (dark bg, mono, syntax-token spans), NOT raw markdown fences. Reference:
     hamilton.html exemplar pattern.
   - Prefer 1-pager compact. Use `<details class="deep">` accordions ONLY for
     genuinely deep optional detail (long log excerpts, edge-case tables,
     references). Never wrap main narrative in accordions.

6. **Resolve output path.** Run `bun scripts/resolve-out-path.ts <topic-slug>`
   from the html-kit repo root. The script returns an absolute path: in-repo
   `.html-kit/NN_topic.html` if cwd is inside a git repo, else
   `~/.html-kit/<project-slug>/NN_topic.html`. On first use per repo, the
   script prompts whether to add `.html-kit/` to `.gitignore`. Honor
   user-specified path verbatim if explicitly given. `/tmp/` is no longer the
   default.
7. **Audit + auto-open.** Run `bun scripts/render-audit.ts <abs-path>` before
   opening. Fails on missing palette tokens or `<div class="tree">`. If audit
   fails: fix and re-write. If audit passes: run `open <abs-path>`. If `open`
   exits non-zero (Linux/headless), print the absolute path in a 3-line banner
   and stop.
8. **Report the path back as `open <path>`** (literal `open ` prefix). Single
   line, no prose summary — the artifact speaks for itself. The `open ` prefix
   lets the user copy-paste straight into another terminal session.
9. **Follow up with `AskUserQuestion`** if the artifact contains decision
   points, recommendations, or open questions. Mirror the in-artifact options
   as a 2-4 question structured QA panel so the user can resolve in-chat
   without retyping. See `~/.claude/rules/ask-structured.md` for schema. Skip
   only if the artifact is purely informational (status report, explainer,
   slide deck) with nothing to decide.
10. **On revision request, fatten the recipe.** If the user asks for a v2 /
    iteration / "make it more X", append one line to the chosen archetype's
    recipe.md under `## Gotchas`:

    - YYYY-MM-DD: picked <archetype>, user asked for v2 because <reason>. Fix: <what should have been different>.

    Recipes gain field knowledge from every revision. Selection accuracy compounds over use.

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

Per-archetype gotchas live in each recipe's "## Gotchas" section.

## Tokens

Palette + base typography source: `tokens/anthropic-palette.css`. At render
time call `bun scripts/inject-palette.ts` to get the `:root { ... }` block to
paste as the first `<style>` block in your render. Keeps artifacts
self-contained while making token edits a single-file change.

## Patterns

`patterns/<slug>.md` are cross-archetype reusable components (CSS + HTML
fragments). Read the relevant archetype recipe's `## Patterns` section to see
which apply, then inline the fragment + CSS into your render. Never `@import`
or external-link.

Current patterns:
- `patterns/decision-box.md` — closing verdict + ordered list + CTA
- `patterns/option-card.md` — 3-column option grid for decision-bearing artifacts
- `patterns/swimlane-flow.md` — multi-actor sequential flow

To promote a new pattern from a finished render, invoke
`/html-kit:add-to-patterns` (companion sub-skill).

## Output discipline

- Single `.html` file. No supporting CSS / JS / image files.
- Default path resolved via `bun scripts/resolve-out-path.ts` — not `/tmp/`.
- After writing, report the absolute path in one line. Nothing else.
