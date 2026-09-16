# Spec: html-kit as a 2026-standard plugin

Date: 2026-09-16 · Status: proposed · Base commit: `82fa96f`

Research notes:
- `~/.search-cache/synth/20260916-2015_claude-skill-plugin-packaging-best-practices.md`
- `~/.search-cache/synth/20260916-2015_html-artifact-skill-comparables.md`

## 1. Verdict

The core design is right. The exemplar + recipe pairs, the dated gotchas in each recipe, the searchable gallery of past renders and the annotation loop are all things no comparable repo has together.

The packaging is behind 2026 norms. html-kit is a symlinked skill bundle, not a plugin. It cannot be installed with `/plugin`, has no evals and no CI, and its script calls only work when the working directory is the html-kit repo.

## 2. Findings (verified 2026-09-16)

### 2.1 Where we diverge from best practice

| # | Finding | Evidence | Rule / source |
|---|---------|----------|---------------|
| F1 | No plugin manifest or marketplace | no `.claude-plugin/` | plugins-reference: `.claude-plugin/plugin.json` + `marketplace.json`; component dirs at plugin root |
| F2 | Skills live in `skill/`, not `skills/` | repo tree | plugin auto-discovery expects `skills/<name>/SKILL.md` |
| F3 | Script calls depend on cwd | `skill/html-kit/SKILL.md:56,63,128`: `bun scripts/resolve-out-path.ts`; drain skill uses `<html-kit-repo>` and `/Users/.../` placeholders | skills doc: use `${CLAUDE_SKILL_DIR}` in body and in `allowed-tools` so bundled scripts run without a prompt |
| F4 | No `allowed-tools` | SKILL.md frontmatter has only `name` and `description` | same as F3 |
| F5 | Cheatsheet has drifted | 28 cheatsheet rows vs 30 archetype dirs; README says 19 | hand-maintained index |
| F6 | Personal defaults are hardcoded | `scripts/discover-roots.ts:32`, `scripts/build-index.ts:317,324` assume one user's dev folder | no hardcoded or user-specific paths |
| F7 | Client and project names in public recipe gotchas | `archetypes/{annotated-flowchart,explainer,component-variants,clickable-flow}/recipe.md` name real clients, vendors and internal projects | open-source hygiene |
| F8 | No evals, no CI | no `evals/`, no `.github/workflows/` | `claude plugin eval` (6 grader types, `--threshold` CI gate) |
| F9 | Daemon started manually; annotations need a manual `/html-kit-drain` | README; SSE emits only `index:updated` (`scripts/html-kit-daemon.ts:162,169`) | plugin `monitors/monitors.json`: a session-lifetime command whose stdout lines reach Claude as notifications |
| F10 | Self-containment check is written as an instruction, not enforced | SKILL.md step 7 asks the agent to run `render-audit.ts` | hooks over prose: a `PostToolUse` hook is deterministic |

### 2.2 Already compliant

- `SKILL.md` is 151 lines, under the 500-line limit.
- The description is written in third person and includes trigger phrases.
- Deep detail lives one level down, in `references/`.
- Scripts exit non-zero with stderr messages instead of passing errors to the model.
- The skill-dir symlinks (`skill/html-kit/archetypes -> ../../archetypes`) resolve inside the plugin root. Per plugins-reference, those symlinks are **preserved** when the plugin is copied into the cache. The current layout survives plugin packaging.

## 3. Comparables (verified stars / last push)

| Repo | Stars | Has | Lacks | Take from it |
|------|-------|-----|-------|--------------|
| [plannotator/effective-html](https://github.com/plannotator/effective-html) | 3.2k · 09-14 | Same source (Thariq's gallery); 6 skills; `.claude-plugin` + `.codex-plugin` + `skills.sh.json` | No gallery index, no feedback loop | Its multi-harness packaging layout |
| [backnotprop/plannotator](https://github.com/backnotprop/plannotator) | 8.7k · 09-16 | Browser annotation that feeds back into the agent loop | Scoped to plans and diffs only | Feedback payload shape; hook-driven round trip |
| [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer) | 9.8k · 08-28 | `plugins/` marketplace layout; 11 themes that can be swapped at runtime | No archetype method, no index | Theme presets (`tokens/<theme>.css`) |
| [dogum/html-artifacts](https://github.com/dogum/html-artifacts) | 147 · 09-14 | plugin.json; CI-built `.skill` release; gallery issue template | Static examples only | Issue template for community archetype submissions |
| [subsy/skill-cabinet](https://github.com/subsy/skill-cabinet) | 413 · 09-02 | Local daemon + browser catalog | Catalogs skills, not outputs | Daemon lifecycle UX |
| [anthropics/skills](https://github.com/anthropics/skills) | 177k · 09-10 | `theme-factory`, `frontend-design`, `web-artifacts-builder` | Not archetype-based | One theme showcase page |

**What sets html-kit apart:** the other projects cover at most two of these three: (a) an archetype library with recipes, (b) a searchable history of past artifacts, (c) annotation feedback into the agent. html-kit already has all three. The job is packaging and wiring, not new capability.

## 4. Target layout

```
html-kit/
├── .claude-plugin/
│   ├── plugin.json            # name, version, description, author, license, keywords
│   └── marketplace.json       # self-hosted marketplace, single plugin, source "./"
├── skills/                    # renamed from skill/
│   ├── html-kit/              # SKILL.md + references/ + symlinks (kept)
│   ├── html-kit-drain/
│   └── html-kit-add-to-patterns/
├── monitors/monitors.json     # P2
├── hooks/hooks.json           # P3: render-audit on Write
├── evals/                     # P3
├── archetypes/ patterns/ tokens/ assets/ scripts/   # unchanged, shared
├── skills.sh.json             # P4: npx skills grouping
└── install.sh                 # kept: dev / non-plugin install
```

## 5. Plan

### P0 — Hygiene before any public push (≈1 h)

1. Replace client and project names in recipe gotchas with generic descriptions ("a fintech money-flow map", "an email campaign preview"). Keep the lesson, drop the identity. (F7)
2. Remove the user-specific scan-root default: an empty `scanRoots` means no scan until configured; generalize the project-name stripping at `build-index.ts:324`. (F6)
3. Fix recipe formatting: `clickable-flow` line 21; order the `annotated-flowchart` entries by date, above the footer.
4. Commit the pending daemon and index fixes, then the recipe notes.

**Done when:** a grep for the known client, project and username strings over tracked files returns nothing.

### P1 — Plugin packaging (≈3 h)

1. `git mv skill skills`; update `install.sh` to glob `skills/*/SKILL.md`. (F2)
2. Add `.claude-plugin/plugin.json` and `marketplace.json`. Version from CHANGELOG (bump to `0.5.0`). (F1)
3. In all 3 SKILL.md files, replace `bun scripts/X.ts` with `bun "${CLAUDE_SKILL_DIR}/scripts/X.ts"`. Add `allowed-tools: Bash(bun ${CLAUDE_SKILL_DIR}/scripts/*)`. Remove the `<html-kit-repo>` and `/Users/.../` placeholders. (F3, F4)
4. Generate the cheatsheet: give each `recipe.md` a frontmatter `when:` line, and have `scripts/build-cheatsheet.ts` rewrite the table between markers in SKILL.md and the count in the README. (F5)
5. State the runtime requirement: Bun ≥ 1.x. Scripts exit with a clear message if `bun` is missing.

**Done when:** `claude --plugin-dir .` loads 3 skills; `/plugin marketplace add nyashkn/html-kit` then `/plugin install html-kit@html-kit` renders an artifact from an unrelated repo's cwd without permission prompts for bundled scripts.

**Check:** confirm `${CLAUDE_SKILL_DIR}/scripts` resolves through the preserved symlink after cache copy (it should, per plugins-reference "within the plugin's own directory").

### P2 — Live feedback loop via monitor (≈3 h) — highest value

1. Daemon: on annotation POST, `broadcastSSE("annotation:new", {artifact, item_id, type, value})`. (F9)
2. `scripts/annotation-monitor.ts`:
   - If port 63839 is closed, start the daemon detached (PID lock already prevents duplicates).
   - Subscribe to `/events`.
   - Print one line per `annotation:new` for artifacts under `$CLAUDE_PROJECT_DIR` or `~/.html-kit/<project>`.
   - Format: `html-kit annotation: <artifact> #<item_id> <type>: <value>`.
3. `monitors/monitors.json`:
   ```json
   [{
     "name": "html-kit-annotations",
     "command": "bun \"${CLAUDE_PLUGIN_ROOT}/scripts/annotation-monitor.ts\"",
     "description": "Annotations left on html-kit artifacts in the browser",
     "when": "on-skill-invoke:html-kit"
   }]
   ```
4. Keep `/html-kit-drain` as the fallback for non-interactive sessions and other harnesses, where monitors don't run. The drain cursor stays the single source of "already handled".

**Done when:** render an artifact, click accept or comment in the browser, and Claude receives a notification in the same session without a manual drain.

**Constraints (from docs):** interactive CLI only; runs unsandboxed at hook trust level; an update needs a session restart; cannot read `${user_config.*}`.

### P3 — Enforcement + evals + CI (≈3 h)

1. `hooks/hooks.json`: `PostToolUse` on `Write|Edit`. When the file path matches `.html-kit/*.html`, run `render-audit.ts`. Exit 2 with the missing tokens so the agent must fix them. Remove the prose step 7 audit instruction. (F10)
2. `evals/` — 6 cases:

   | Case | Graders |
   |------|---------|
   | route-plan: "render this plan as html" | `tool_used: Skill` (html-kit), `file_exists: .html-kit/*.html` |
   | route-negative: "summarize this in markdown" | `tool_used` absent Skill html-kit |
   | self-contained | `regex` output has no `<script src=`, `<link rel="stylesheet"`, `@import` |
   | archetype-pick: incident log | `llm`: picked `incident-timeline` |
   | drain | `tool_order`: Skill html-kit-drain, then Bash annotate-read |
   | baseline | `baseline` vs no-plugin on a dashboard render |

3. `.github/workflows/ci.yml`: Playwright suite + `claude plugin eval --threshold 0.8` (needs a `CLAUDE_CODE_OAUTH_TOKEN` secret from `claude setup-token`; run the `llm` and `baseline` graders on push to `main` only, to cap cost).

### P4 — Distribution + ecosystem (≈2 h, optional)

1. `skills.sh.json` grouping, so `npx skills add nyashkn/html-kit` works for Codex, Cursor, Gemini CLI and OpenCode.
2. README install matrix: `/plugin` · `npx skills add` · `install.sh`. Note that the daemon, monitor and hook are Claude Code only; other harnesses get archetypes + drain.
3. `.github/ISSUE_TEMPLATE/archetype-submission.yml` (from dogum).
4. Themes: `tokens/<name>.css` + `inject-palette.ts --theme <name>`. A second brand palette already appears in the gotchas, so the need is real. Ship 1 extra theme, not 11.

## 6. Explicitly not doing

- **Per-archetype skills (30 skills):** each description costs preload tokens and competes during routing. One router skill + a generated cheatsheet is cheaper. effective-html uses 6 skills for 6 modes, not per template.
- **MCP server:** scripts + monitor + hook cover every need; nothing requires a tool API.
- **`.codex-plugin` manifest:** add only when someone asks; SKILL.md already works there via `npx skills`.
- **React/Vite build pipeline (web-artifacts-builder style):** it conflicts with the single-file, no-build design.
- **Hosted publish (GitHub Pages / Vercel):** artifacts are often private client material.

## 7. Open decisions

1. **Name:** keep the `html-kit` plugin name, or namespace it (`nyashkn-html-kit`) to avoid collisions in public marketplaces?
2. **Monitor default:** `when: on-skill-invoke:html-kit` (recommended) or `always` (daemon up every session)?
3. **CI eval cost:** run `llm`/`baseline` graders on every PR, or only on `main`?
4. **Recipe gotchas:** genericize in place (recommended), or move personal ones to a gitignored `recipe.local.md` that is merged at read time?
