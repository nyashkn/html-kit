---
name: html-kit-add-to-patterns
description: Extract a reusable cross-archetype pattern (CSS + HTML fragment + when-to-use) from a finished HTML artifact and add it to html-kit's patterns/ directory. Use when a render produced a component (verdict box, dual-axis rails, hover-bands, etc.) that's worth promoting for reuse across archetypes. Trigger phrases - "add this to patterns", "promote this component", "save this pattern".
---

# html-kit:add-to-patterns

Companion to the `html-kit` router skill. Promotes a reusable visual /
interaction component from a one-off render into a documented pattern at
`~/code/html-kit/patterns/<slug>.md`,
then cross-links from any archetype recipe that should reference it.

## When to invoke

- A finished artifact contains a component the user explicitly likes ("I prefer the detail in §09…")
- Same component pattern would help in 2+ archetypes (cross-cutting, not archetype-specific)
- Pattern is expressible as a small CSS + HTML fragment (<60 lines)

If the component is one-archetype-only, edit that archetype's exemplar instead.
Patterns are for cross-cutting things.

## Workflow

1. **Identify source.** Get the artifact path + the section / component the user
   wants to promote. If user pointed at a fragment by anchor (`#s09`), that's
   the source of truth — read just that block.
2. **Extract spec.** From the source, pull:
   - HTML fragment (clean copy, generic class names — no `id="s09"` etc.)
   - CSS rules required (use `var(--token)` for palette refs, never hex)
   - Token dependencies (which `tokens/anthropic-palette.css` vars it needs)
3. **Pick a slug.** Kebab-case, descriptive, noun-phrase. `decision-box`,
   `dual-axis-rails`, `hover-highlight-bands`, `tldr-flow-strip`. Check
   `patterns/` first — don't duplicate.
4. **Write `patterns/<slug>.md`** following this skeleton:
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
   <!-- minimal HTML to copy-paste -->
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
5. **Cross-link from archetype recipes.** For every archetype where the pattern
   applies, append a `## Patterns` section to its `recipe.md`:
   ```markdown
   ## Patterns
   - `patterns/decision-box.md` — for the closing verdict section
   ```
6. **Update SKILL.md (router) lessons-learned** if the pattern represents a
   hard rule (not just an option). E.g. "always end decision artifacts w/
   `decision-box`" is a hard rule. "Layered flavour can use `dual-axis-rails`"
   is just an option — recipe link is enough.
7. **Commit.** `feat(patterns): promote <slug> from <source-artifact>`. Do NOT
   tag — patterns accumulate continuously, not on version cadence.
8. **Report back.** One line: `pattern saved → patterns/<slug>.md` + the
   archetypes you cross-linked. No prose summary.

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
  and what user feedback validated it.
