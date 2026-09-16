# Contributing to html-kit

Thanks for your interest. html-kit is a Claude Code skill bundle plus a small
Bun toolchain. This guide covers the dev loop and the most common contribution:
adding a new archetype.

## Dev setup

Prerequisites: [Bun](https://bun.sh) >= 1.1 and Claude Code.

```bash
bun install           # dev deps: Playwright, Pagefind, @types/bun
./install.sh          # symlink the skills into ~/.agents/skills + ~/.claude/skills
```

`install.sh` is idempotent and refuses to clobber non-symlinks, so it's safe to
re-run after pulling updates or adding a skill.

## Running tests

The suite is [Playwright](https://playwright.dev):

```bash
bun run test            # headless run
bun run test:headed     # visible browser
bun run test:ui         # Playwright UI mode
```

If this is your first run, install the browser binaries once:

```bash
bunx playwright install
```

## Adding an archetype

An archetype is just a directory under `archetypes/`. To add one:

1. Create `archetypes/<slug>/exemplar.html` — a complete, self-contained page
   (inline CSS / SVG / JS, no external assets) using the Anthropic palette
   tokens from `tokens/anthropic-palette.css`. If it's vendored from a
   third-party source, keep its license header/provenance comment at the top
   and add it to `ATTRIBUTION.md` (note the exact license — upstream sources
   can change license over time, don't assume MIT).
2. Create `archetypes/<slug>/recipe.md` starting with frontmatter:
   ```yaml
   ---
   name: <slug>
   when: <one-line routing phrase the router skill matches on>
   ---
   ```
   followed by *when to use* this archetype, the *expected data shape*, and a
   `## Gotchas` section.
3. Run `bun run cheatsheet` — it regenerates the "Archetype selection
   cheatsheet" in `skills/html-kit/SKILL.md` and the archetype count in
   `README.md` from every `recipe.md`'s frontmatter. Don't hand-edit either
   table. CI runs `bun run cheatsheet --check` and fails if you forgot.

No installer edit is needed — archetypes are discovered at render time.

## Adding a skill

Drop a directory under `skills/<name>/` with a `SKILL.md` (YAML frontmatter +
body) and re-run `./install.sh`. Skills are auto-discovered; no edits to the
installer are required.

## Conventions

- **Commits** follow the existing style: `feat(vX.Y.Z): summary`,
  `fix(...)`, `docs(...)`.
- **Self-contained output** is the core invariant — never introduce external
  asset references into an exemplar or a render.
- Update `CHANGELOG.md` (Keep a Changelog format) for user-facing changes.
