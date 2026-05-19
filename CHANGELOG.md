# Changelog

All notable changes to html-kit are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions
are pinned in `package.json` / skill manifests; the heading dates use ISO-8601.

## [Unreleased]

## [0.4.1] - 2026-05-19

Polish on top of v0.4.0 — modal skin matches the rest of html-kit, and a
companion skill drains agent-targeted annotations inline.

### Added

- **Pagefind modal Anthropic skin** (`assets/pagefind-overrides.css`) — a
  CSS overlay loaded immediately after `pagefind-component-ui.css`. Targets
  the `--pf-*` custom-property surface plus the `.pf-*` class names to swap
  in ivory background, serif modal heading, mono eyebrow, clay focus ring,
  paper close button, and ticket-styled result cards. Inherits palette vars
  from the host page via `var(--clay, …)` fallbacks so it degrades cleanly
  off-kit.
- **`/html-kit-drain` skill** (`skill/html-kit-drain/SKILL.md`) — Claude
  Code skill that drains pending annotations for the artifact in current
  conversation focus, advances the cursor, and acts on the rollup inline.
  Auto-discovered + symlinked by `install.sh`.

### Changed

- `scripts/html-kit-daemon.ts` — serves `/pagefind-overrides.css` from
  `assets/`, and `injectOverlay` now emits the overrides `<link>` AFTER
  `pagefind-component-ui.css` so cascade order is correct.
- `scripts/build-index.ts` — head injection adds the overrides `<link>`
  AFTER `pagefind-component-ui.css`, with a regex repair branch for
  templates that already shipped the component CSS.

### Notes

- `tsconfig.json` (already on disk since v0.3.0 with `types: ["bun"]`)
  satisfies `bunx tsc --noEmit` — the earlier LSP "errors" were stale
  diagnostics from before `bun install` populated `node_modules/@types/*`.
  Re-running the type check confirms a clean exit.

## [0.4.0] - 2026-05-19

Singleton daemon, central index, and human↔agent annotation loop.

### Added

- **Daemon** (`scripts/html-kit-daemon.ts`) — singleton on port `63839` backed
  by `Bun.serve`. PID lock at `~/.html-kit/_daemon/.pid`. Serves the index
  page, every registered artifact at `/p/<slug>/<file>.html`, pagefind bundle,
  annotation API, SSE filewatch broadcast, and the auto-attached
  `annotation-strip.js`.
- **Central index builder** (`scripts/build-index.ts`) — scans
  `~/.html-kit/<slug>/` and every registered repo's in-tree `.html-kit/`,
  hardlinks artifacts into a staging dir (with copy fallback for cross-FS),
  injects `<meta data-pagefind-filter="project:<slug>">`, runs `pagefind`,
  and renders a dense list view from `.html-kit/03_v0.4.0-index-mockup.html`.
- **Full-content search** — Pagefind 1.5.2 added as a dev dependency. Cmd+K
  opens the modal; project filter is wired via the injected meta tag.
- **Annotation strip** (`patterns/annotation-strip.md`) — new pattern with
  accept / reject / comment / tag controls. JS auto-attaches to
  `[data-component="ticket" | "proposal-card" | "row" | "option-card"]` and
  any `[data-annotatable]`. Writes via daemon POST or localStorage in
  `file://` mode (with a "Copy annotations" JSONL button as the fallback).
- **Annotation drain** (`scripts/annotate-read.ts`) — cursor-paginated reader
  for the per-artifact JSONL log. Exits 0 quietly when the daemon is offline
  or no log exists.
- **Repo registration** — `resolve-out-path.ts` fires a 500 ms timeout POST
  to `/api/repos` on every render, so freshly-touched repos appear in the
  index without a manual step. `scripts/register-all.ts` backfills the map
  by walking `~/.html-kit/` and reverse-resolving via
  `.html-kit-meta.json` (forward-compat) or recursive dash-split anchored at
  `$HOME`.
- **v0.4.0 design artifacts** —
  `.html-kit/02_v0.4.0-interaction-loop.html` (swim-flow render of the
  human↔agent loop) and `.html-kit/03_v0.4.0-index-mockup.html` (dense
  list-view template the builder consumes).

### Changed

- `package.json` — added the `html-kit:index` script and pinned `pagefind`.

### Fixed

- Daemon serves artifacts from three candidate dirs per slug
  (`repos[slug]`, `repos[slug]/.html-kit`, `~/.html-kit/<slug>`), so
  in-repo artifacts under `<repo>/.html-kit/` resolve correctly. First match
  wins.
- Pagefind asset path corrected to `pagefind-component-ui.css` (the
  `modal-ui.css` filename does not exist in 1.5).
- `<pagefind-config>` uses `bundle-path="/pagefind/"` (not `src=`), matching
  the 1.5 attribute contract.
- All route guards accept both `GET` and `HEAD` to avoid spurious 404s under
  `curl -I` probes.
- Auto-attach fence detection in the daemon now matches both ` ```javascript `
  and ` ```js ` blocks when extracting `annotation-strip.js`.
- Build-index strips the mock pagefind modal from the mockup template so
  only the live `<pagefind-modal>` web component renders.

## [0.3.2] - 2026-05-18

### Changed

- Refreshed the `html-kit-add-to-patterns` sub-skill for the v0.3.0 storage
  structure.

## [0.3.1] - 2026-05-17

### Added

- `.html-kit/_archive/` is auto-created on first render and always
  gitignored.

## [0.3.0] - 2026-05-17

### Added

- Bun-backed scripts replace the previous shell wrappers.
- `.html-kit/` is the canonical in-repo storage location.
- New `option-card` pattern.
- "Gotcha-fattening" recipes.

### Fixed

- Legacy `Gotchas` blocks merge cleanly when re-rendering.
- TTY guard in `resolve-out-path.ts` prevents prompt deadlock under
  non-interactive shells.

## [0.2.x] - earlier

- `swimlane-flow` pattern promoted from `access-onboarding-journey`.

[Unreleased]: https://github.com/nyashkn/html-kit/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/nyashkn/html-kit/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/nyashkn/html-kit/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/nyashkn/html-kit/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/nyashkn/html-kit/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/nyashkn/html-kit/releases/tag/v0.3.0
