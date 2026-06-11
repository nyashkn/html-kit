# html-kit

Turn any plan, spec, decision doc, synth, or dataset into a polished,
self-contained single-page HTML artifact — styled in the Anthropic palette —
with one `/html-kit` command inside Claude Code.

<!-- TODO: add hero screenshot of a rendered artifact -->

> **Status: alpha (v0.x).** The skill workflow is stable, but the daemon, index,
> and annotation surfaces are evolving. Paths, ports, and APIs may change
> between minor versions.

## Why use this

- **One command, shareable output.** You hand Claude Code your raw content; it
  picks the right template, renders a single `.html` file with inline CSS / SVG
  / JS, and opens it. No external assets — paste it into Notion, email, a PR, or
  serve it as a link.
- **19 battle-tested archetypes.** Implementation plans, incident timelines,
  PR reviews, explainers, dashboards, slide decks, triage boards, and more —
  each one a vendored, MIT-licensed exemplar plus a `recipe.md` that tells the
  agent when to use it and how to adapt it.
- **Consistent house style.** Every artifact uses the same Anthropic palette
  tokens and component vocabulary, so a folder of renders looks like one
  product, not fifteen ad-hoc pages.
- **A read/write loop, not just one-shot output.** A local daemon serves all
  your artifacts at one URL with full-text search (Cmd+K), and an annotation
  strip lets you accept / reject / comment / tag inline in the browser — then
  `/html-kit-drain` feeds your notes back to the agent for the next revision.

## Quick start

Prerequisites: [Bun](https://bun.sh) and Claude Code.

```bash
git clone git@github.com:nyashkn/html-kit.git
cd html-kit
bun install
./install.sh          # symlinks the skills into ~/.agents/skills + ~/.claude/skills
```

Restart Claude Code, then in any session:

```
/html-kit  <paste or point at your source content>
```

The skill browses `archetypes/`, reads a few `recipe.md` files to choose the
best fit, studies the matching `exemplar.html`, and renders new HTML adapted to
your data — saved under `.html-kit/NN_<topic>.html` in the current repo (or
`~/.html-kit/<project>/` outside a repo) and auto-opened.

To uninstall: `./install.sh --uninstall`.

## What's in here

```
html-kit/
├── archetypes/<slug>/          # 19 archetypes, one dir each
│   ├── exemplar.html           # vendored MIT exemplar (some have flavour variants)
│   └── recipe.md               # when to use, expected data shape, gotchas
├── patterns/<slug>.md          # cross-archetype reusable fragments
│   ├── decision-box.md  option-card.md  swimlane-flow.md  annotation-strip.md
├── tokens/anthropic-palette.css  # shared CSS custom properties (palette + type)
├── assets/pagefind-overrides.css # Anthropic skin for the search modal
├── scripts/                    # Bun helper scripts (see below)
├── skill/<name>/SKILL.md       # the three Claude Code skills (see below)
├── tests/                      # Playwright suite
├── install.sh                  # idempotent symlink installer
├── LICENSE  ATTRIBUTION.md  CHANGELOG.md
```

### Skills

| Skill | Invoke | What it does |
|---|---|---|
| `html-kit` | `/html-kit` | Router. Picks an archetype, learns its pattern, renders a new self-contained artifact, audits it, opens it. |
| `html-kit-add-to-patterns` | `/html-kit:add-to-patterns` | Extracts a reusable cross-archetype pattern (CSS + HTML fragment + when-to-use) from a finished artifact and promotes it into `patterns/`. |
| `html-kit-drain` | `/html-kit-drain` | Reads pending browser annotations for the artifact in focus and acts on them inline (accept / reject / comment / tag). |

All three are auto-discovered and symlinked by `install.sh` — drop a new
directory under `skill/` with a `SKILL.md` and re-run the installer.

### Scripts (Bun)

There *is* a small toolchain behind the skill — it's not pure-prompt:

- `resolve-out-path.ts` — decides where an artifact is written (in-repo
  `.html-kit/` vs `~/.html-kit/<project>/`), with a first-use gitignore prompt.
- `inject-palette.ts` — emits the `:root { … }` token block to inline.
- `render-audit.ts` — fails a render that's missing palette tokens.
- `next-number.ts` — assigns the next `NN_` prefix.
- `build-index.ts` (`bun run html-kit:index`) — scans every registered repo's
  `.html-kit/` plus `~/.html-kit/`, runs [Pagefind](https://pagefind.app) for
  full-text search, and renders a dense index page.
- `html-kit-daemon.ts` — singleton on port **63839** (`Bun.serve`). Serves the
  index, every registered artifact, the Pagefind bundle, the annotation API +
  SSE filewatch, and the auto-attached annotation strip.
- `annotate-read.ts` — cursor-paginated reader for the per-artifact annotation
  log (the engine behind `/html-kit-drain`).
- `register-all.ts` / `discover-roots.ts` — repo registration + discovery.

### The annotation loop (v0.4.x)

1. Render an artifact with `/html-kit`.
2. The daemon serves it with a Cmd+K search modal and an annotation strip on
   `[data-annotatable]` components (accept / reject / comment / tag). In
   `file://` mode (no daemon) annotations fall back to `localStorage` with a
   "Copy annotations" JSONL button.
3. `/html-kit-drain` reads your pending notes and routes them into the next
   revision.

## Tests

```bash
bun test            # Playwright suite (tests/)
bun test:headed     # with a visible browser
bun test:ui         # Playwright UI mode
```

See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) for the dev loop and how to add
an archetype.

## Roadmap

- Per-archetype skills (`/html-kit:plan`, `/html-kit:incident`, etc.)
- CLI extraction so non-Claude consumers can render directly.
- Spec adapter — auto-render approved specs as `implementation-plan` artifacts.

## License & attribution

MIT — see [`LICENSE`](LICENSE).

The HTML exemplars are vendored from
[ThariqS/html-effectiveness](https://github.com/ThariqS/html-effectiveness)
under MIT; each `exemplar.html` carries an inline `<!-- source: … | MIT license -->`
comment, and [`ATTRIBUTION.md`](ATTRIBUTION.md) rolls up the provenance.
