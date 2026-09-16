---
name: html-kit
description: Render structured content as polished single-page HTML artifacts using Anthropic-palette archetypes (plans, decisions, comparisons, explainers, dashboards, incident timelines, PR writeups, weekly status). Trigger phrases - "render this as html", "make this a shareable artifact", "html artifact", "magazine-style writeup", "single-page report", "render the synth/plan/spec/decision doc as html", "dashboard from this data", "explain this visually". Output is a self-contained .html file inlined CSS/SVG/JS, no external assets, ready to paste into Notion/email/PR or share as a link.
allowed-tools: Bash(bun ${CLAUDE_SKILL_DIR}/scripts/*) Bash(open *) Bash(xdg-open *)
---

# html-kit

Router skill. You will pick one archetype from `${CLAUDE_SKILL_DIR}/archetypes/`,
learn its pattern from the exemplar, then render new HTML adapting that
pattern to the user's data. Output is a single self-contained `.html` file
(inline CSS, inline SVG, inline JS — no external assets).

Requirements: Bun >= 1.1.

## Workflow

### Step 0 — Pattern selection

Default to **Pattern A** (inline render in main thread). Deviate ONLY when:
- main context >70% used → Pattern C (Opus sub-agent)
- output projected >1500 lines → Pattern C
- already running ≥2 sub-agents this turn → Pattern D (agent team)
- Sonnet sub-agent (Pattern B) is almost always wrong — see `${CLAUDE_SKILL_DIR}/references/delegation-rationale.md` before choosing it.

Full deliberation, edge cases, and anti-patterns: `${CLAUDE_SKILL_DIR}/references/delegation-rationale.md`.

### Inline workflow (Steps 1-10)

1. **Read the user request + source content.** Identify what kind of artifact
   they want: a plan? an incident postmortem? a comparison of options? a
   status report? a code review? an explainer? a dashboard?
2. **List archetypes.** `ls ${CLAUDE_SKILL_DIR}/archetypes/`. Skim directory
   names — slugs are descriptive.
3. **Read 2-4 candidate `${CLAUDE_SKILL_DIR}/archetypes/<slug>/recipe.md`
   files** for the closest matches. Each recipe states when to use, expected
   data shape, and gotchas. Also read `~/.html-kit/_gotchas/<archetype>.md`
   if it exists — it's the user's personal field manual on top of the
   shipped recipe. Pick one.
4. **Read the chosen `${CLAUDE_SKILL_DIR}/archetypes/<slug>/exemplar.html` in
   full.** Study its structure: head,
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
     `${CLAUDE_SKILL_DIR}/patterns/option-card.md`), not `<ul>` markdown lists.
   - Code shown inside an artifact uses styled `<pre class="code">` component
     (dark bg, mono, syntax-token spans), NOT raw markdown fences. Reference:
     hamilton.html exemplar pattern.
   - Prefer 1-pager compact. Use `<details class="deep">` accordions ONLY for
     genuinely deep optional detail (long log excerpts, edge-case tables,
     references). Never wrap main narrative in accordions.
   - Using a non-Anthropic palette on purpose (e.g. a client brand)? Add
     `<meta name="html-kit:palette" content="custom">` in `<head>` so the
     render audit skips the palette-token check. Self-containment is still
     enforced.

6. **Resolve output path.** Run
   `bun ${CLAUDE_SKILL_DIR}/scripts/resolve-out-path.ts <topic-slug>`. The
   script returns an absolute path: in-repo `.html-kit/NN_topic.html` if cwd
   is inside a git repo, else `~/.html-kit/<project-slug>/NN_topic.html`. On
   first use per repo, the script prompts whether to add `.html-kit/` to
   `.gitignore`. Honor user-specified path verbatim if explicitly given.
   `/tmp/` is no longer the default.
7. **Audit + auto-open.** In plugin mode a PostToolUse hook audits every
   write under `.html-kit/` and feeds failures back to you — fix them. If
   the output path is not under `.html-kit/` (user-specified path) or
   you're in manual install mode, run
   `bun ${CLAUDE_SKILL_DIR}/scripts/render-audit.ts <abs-path>` yourself.
   Fails on missing palette tokens or `<div class="tree">`. If audit fails:
   fix and re-write. If audit passes: open the file — `open <abs-path>` on
   macOS, `xdg-open <abs-path>` on Linux. If neither is available
   (headless), print the absolute path in a 3-line banner and stop.
8. **Report the path back as `open <path>`** (literal `open ` prefix). Single
   line, no prose summary — the artifact speaks for itself. The `open ` prefix
   lets the user copy-paste straight into another terminal session.
9. **Follow up with a structured question** if the artifact contains decision
   points, recommendations, or open questions: ask open decisions as a
   structured question if the harness has a question tool (e.g.
   `AskUserQuestion`), mirroring the in-artifact options as a 2-4 option
   panel so the user can resolve in-chat without retyping. Skip only if the
   artifact is purely informational (status report, explainer, slide deck)
   with nothing to decide.
10. **On revision request, capture the gotcha.** If the user asks for a v2 /
    iteration / "make it more X", append one line to
    `~/.html-kit/_gotchas/<archetype>.md` (create the dir/file if missing):

    - YYYY-MM-DD: picked <archetype>, user asked for v2 because <reason>. Fix: <what should have been different>.

    This works in both install modes — a plugin-mode write would land in the
    versioned cache and be lost on the next update, so gotchas never go
    there.

    Only when the current working directory IS an html-kit git checkout —
    `test -f .claude-plugin/plugin.json && grep -q '"name": "html-kit"'
    .claude-plugin/plugin.json` — may you instead (or additionally) edit the
    repo's own `archetypes/<slug>/recipe.md` directly under `## Gotchas`,
    using the same line format, and suggest a commit. Any reference you
    write into recipe or pattern text must be relative (e.g.
    `patterns/<slug>.md`), never an absolute path or a
    `${CLAUDE_SKILL_DIR}`-prefixed one.

    Recipes and the personal gotchas file gain field knowledge from every
    revision. Selection accuracy compounds over use.

## Archetype selection cheatsheet

<!-- cheatsheet:start -->
| User wants… | Likely archetype |
|---|---|
| tuning a single transition or animation in isolation with duration/easing sliders and a live preview | `animation-sandbox` |
| explaining a process as a clickable flowchart with timings and failure paths | `annotated-flowchart` |
| scanning unfamiliar or unowned code for the unknown unknowns before writing an implementation prompt | `blindspot-pass` |
| pitching a shipped-but-not-yet-approved feature for sign-off, pre-answering reviewer objections | `buy-in-pitch` |
| prototyping a multi-screen interaction so the user can click through and feel the flow | `clickable-flow` |
| showing every size/state/intent of one component on a single sheet for design review | `component-variants` |
| the reviewer needs to react per-element across 3-4 wildly different visual directions of the same data | `design-reaction-review` |
| rendering design tokens (colors, type scale, spacing) from a repo as live, copy-pasteable swatches | `design-system` |
| explaining how something works: an abstract concept, a repo-specific feature, or a layered system | `explainer` |
| comparing 2-4 code-level solutions to the same problem and the reader needs to pick one | `exploration-code-approaches` |
| presenting 2-N visual/layout/palette directions for live reaction, not imagination | `exploration-visual-designs` |
| editing a feature-flag config interactively with grouped toggles, dependency warnings, copy-diff export | `feature-flag-editor` |
| capturing what actually happened during a build vs. the plan, as a timestamped deviation log | `implementation-notes` |
| handing off a multi-step plan with milestones, a data-flow diagram, mockups, and a risk table | `implementation-plan` |
| writing a post-mortem of an outage: minute-by-minute timeline, log excerpts, follow-up checklist | `incident-timeline` |
| brainstorming candidate fixes for a named problem, grounded in the actual codebase across an effort spectrum | `intervention-brainstorm` |
| verifying you understood a large diff before merging: a readiness report plus a must-pass quiz | `merge-quiz` |
| explaining an unfamiliar package/module: boxes-and-arrows of internal structure, hot path highlighted | `module-map` |
| writing the PR author's description for reviewers: motivation, before/after, file-by-file tour | `pr-description` |
| rendering a PR review in reviewer voice: diff with margin notes, severity tags, jump links | `pr-review` |
| iterating on a prompt template with variable slots and live-rendering sample inputs | `prompt-tuner` |
| porting a reference implementation and you need proof the semantics were understood before any port code | `reference-port-verify` |
| a feature is ambiguous enough that a plan would just encode guesses: interview one question at a time | `requirements-interview` |
| turning a doc/Slack thread/synth into an arrow-key navigable deck for a meeting | `slide-deck` |
| producing a set of inline SVG figures for a blog post or doc that the user can tweak or copy out | `svg-figure-sheet` |
| mocking one interactive UI control before any real code is touched, narrower than clickable-flow | `throwaway-mock` |
| ordering N tickets/items across columns (Now/Next/Later/Cut) with drag-and-drop and export | `triage-board` |
| a plan's real risk is which decisions get revisited, not execution order: sort by likelihood-of-tweaking | `tweakable-plan` |
| you need to learn an unfamiliar domain's vocabulary well enough to prompt precisely in it | `vocab-teacher` |
| writing a recurring engineering/team status: what shipped, what slipped, formatted for skimming | `weekly-status` |
<!-- cheatsheet:end -->

If nothing fits cleanly, `implementation-plan` is the strongest general
template — it accommodates TLDR strip, sections, callouts, tables, sticky TOC.

## Lessons learned (read before rendering)

Per-archetype gotchas live in each recipe's "## Gotchas" section, plus
`~/.html-kit/_gotchas/<archetype>.md` if the user has personal notes there
(see step 3).

## Tokens

Palette + base typography source: `${CLAUDE_SKILL_DIR}/tokens/anthropic-palette.css`.
At render time call `bun ${CLAUDE_SKILL_DIR}/scripts/inject-palette.ts` to get
the `:root { ... }` block to paste as the first `<style>` block in your
render. Keeps artifacts self-contained while making token edits a
single-file change.

## Patterns

`${CLAUDE_SKILL_DIR}/patterns/<slug>.md` are cross-archetype reusable
components (CSS + HTML fragments). Read the relevant archetype recipe's
`## Patterns` section to see which apply, then inline the fragment + CSS
into your render. Never `@import` or external-link.

Current patterns:
- `${CLAUDE_SKILL_DIR}/patterns/decision-box.md` — closing verdict + ordered list + CTA
- `${CLAUDE_SKILL_DIR}/patterns/option-card.md` — 3-column option grid for decision-bearing artifacts
- `${CLAUDE_SKILL_DIR}/patterns/swimlane-flow.md` — multi-actor sequential flow

To promote a new pattern from a finished render, invoke
`/html-kit-add-to-patterns` (manual install) or
`/html-kit:html-kit-add-to-patterns` (plugin install) — companion sub-skill.

## Output discipline

- Single `.html` file. No supporting CSS / JS / image files.
- Default path resolved via `bun ${CLAUDE_SKILL_DIR}/scripts/resolve-out-path.ts`
  — not `/tmp/`.
- After writing, report the absolute path in one line. Nothing else.
