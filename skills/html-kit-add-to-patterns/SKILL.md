---
name: html-kit-add-to-patterns
description: Extract a reusable cross-archetype pattern (CSS + HTML fragment + when-to-use) from a finished HTML artifact and add it to html-kit's patterns/ directory. Use when a render produced a component (verdict box, dual-axis rails, hover-bands, etc.) that's worth promoting for reuse across archetypes. Trigger phrases - "add this to patterns", "promote this component", "save this pattern".
allowed-tools: Bash(bun ${CLAUDE_SKILL_DIR}/scripts/*)
---

# html-kit:add-to-patterns

Companion to the `html-kit` router skill. Promotes a reusable visual /
interaction component from a one-off render into a documented pattern —
repo-relative `patterns/<slug>.md` when run inside the html-kit git
checkout, `~/.html-kit/_patterns/<slug>.md` (upstream via PR) otherwise —
then cross-links from any archetype recipe that should reference it.

Source artifacts now live in `<project>/.html-kit/NN_*.html` (in-repo) or
`~/.html-kit/<project-slug>/NN_*.html` (no-git fallback), not `/tmp/`.

## When to invoke

- A finished artifact contains a component the user explicitly likes ("I prefer the detail in §09…")
- Same component pattern would help in 2+ archetypes (cross-cutting, not archetype-specific)
- Pattern is expressible as a small CSS + HTML fragment (<60 lines)

If the component is one-archetype-only, edit that archetype's exemplar instead.
Patterns are for cross-cutting things.

## Workflow

0. **Determine install mode.** Run
   `test -f .claude-plugin/plugin.json && grep -q '"name": "html-kit"' .claude-plugin/plugin.json`
   in the current working directory. If it succeeds, you're inside the
   html-kit git checkout itself and may write to the repo directly (steps
   4-6, 8 below). If it fails, `${CLAUDE_SKILL_DIR}` points at an installed
   copy — a versioned plugin cache (lost on the next update) or a symlink
   into someone else's checkout — never write pattern/recipe files there.
   Use the outside-checkout branch of steps 4-6 and skip step 8 instead.
1. **Identify source.** Get the artifact path + the section / component the user
   wants to promote. If user pointed at a fragment by anchor (`#s09`), that's
   the source of truth — read just that block.
2. **Extract spec.** From the source, pull:
   - HTML fragment (clean copy, generic class names — no `id="s09"` etc.)
   - CSS rules required (use `var(--token)` for palette refs, never hex)
   - Token dependencies (which `${CLAUDE_SKILL_DIR}/tokens/anthropic-palette.css`
     vars it needs)
   - `data-component="<name>"` attribute on the wrapper element — every
     pattern must declare its component name so render-audit (v0.3.0+) can
     verify it landed.
3. **Pick a slug.** Kebab-case, descriptive, noun-phrase. `decision-box`,
   `dual-axis-rails`, `hover-highlight-bands`, `tldr-flow-strip`. Check
   `${CLAUDE_SKILL_DIR}/patterns/` first — don't duplicate.
4. **Write the pattern file**, following this skeleton:
   ```markdown
   # Pattern: <slug>

   <one-line description: cross-archetype component for X>

   ## When to use
   - <bullet>
   - <bullet>

   ## Spec
   - <visual / structural spec, terse>

   ## Exemplar fragment
   ```html
   <!-- minimal HTML to copy-paste, wrapper carries data-component="<name>" -->
   ```

   ## CSS
   ```css
   /* minimal CSS, uses var(--token) refs */
   ```

   ## Pairs well with
   - <other patterns or archetypes>

   ## Ancestry
   <where it came from: artifact path + session date + user feedback that prompted promotion>
   ```
   - **Inside the checkout:** write repo-relative `patterns/<slug>.md`.
   - **Outside the checkout:** write `~/.html-kit/_patterns/<slug>.md`
     instead — it survives plugin updates and isn't someone else's checkout
     — and tell the user how to upstream it (open a PR against the html-kit
     repo adding this file under `patterns/`).
5. **Cross-link from archetype recipes** (checkout mode only). For every
   archetype where the pattern applies, append a `## Patterns` section to
   its `archetypes/<slug>/recipe.md`, with a repo-relative reference —
   never `${CLAUDE_SKILL_DIR}`-prefixed or absolute:
   ```markdown
   ## Patterns
   - `patterns/decision-box.md` — for the closing verdict section
   ```
   Outside a checkout, skip this — list the archetypes that should
   cross-link in your report / upstream-PR note instead of editing files.
6. **If pattern is a hard rule, append to recipe `## Gotchas`** in every
   archetype where it's mandatory (checkout mode only). Format:
   ```
   - YYYY-MM-DD: decision-bearing artifacts MUST end with patterns/decision-box.md (hard rule, not optional).
   ```
   Do NOT touch the router `SKILL.md` — the lessons-learned section was
   removed in v0.3.0. Rules now live in recipes. Outside a checkout, note
   the intended hard rule in your report instead.
7. **Validate via render-audit.** Re-run
   `bun ${CLAUDE_SKILL_DIR}/scripts/render-audit.ts <source-artifact-path>`
   to confirm the source still passes after any touch-ups. If you edited the
   source's hex → `var(--token)` while extracting, write the edited copy to
   `.html-kit/_archive/` (gitignored) instead of mutating the original.
8. **Commit** (checkout mode only). `feat(patterns): promote <slug> from
   <source-artifact>`. Do NOT tag — patterns accumulate continuously, not on
   version cadence. Outside a checkout there's nothing of this skill's to
   commit — the pattern file lives under `~/.html-kit/_patterns/`.
9. **Report back.** One line: `pattern saved → patterns/<slug>.md` (checkout
   mode) or `pattern saved → ~/.html-kit/_patterns/<slug>.md` (upstream via
   PR) + the archetypes you cross-linked or would cross-link. No prose
   summary.

## Inputs the user (or main agent) should provide

- **Required:** artifact path + which component (section anchor, screenshot, or "the verdict box at the bottom")
- **Optional:** suggested slug, archetypes to cross-link, ancestry note ("KN flagged 2026-05-14 because…")

If anything required is missing, ask via `AskUserQuestion` (single question).

## Gotchas

- **Token discipline.** Patterns must use `var(--clay)`, not `#D97757`. If the
  source artifact has hex literals, rewrite them — patterns are reusable, hex
  isn't.
- **No archetype-specific logic.** If the pattern only makes sense in one
  archetype, it doesn't belong in `patterns/`. Edit that archetype instead.
- **Don't over-promote.** A pattern needs ≥2 plausible consumers. If you can't
  name two archetypes that'd use it, skip — premature reuse.
- **Ancestry is not optional.** Future-you needs to know where this came from
  and what user feedback validated it. Reference the `.html-kit/NN_*.html`
  source path + session date + the user-feedback line that prompted promotion.
- **data-component is mandatory.** Wrapper element in the exemplar fragment
  must carry `data-component="<name>"`. Render-audit warns when it's missing.
