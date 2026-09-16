---
name: html-kit-drain
description: Read pending annotations written by the human against a specific html-kit artifact, then act on them inline. Use when the user has been reviewing a render in the browser (via the html-kit daemon on :63839) and says things like "drain", "read my notes", "what did I annotate", "pull my feedback", or "/html-kit-drain". One artifact per invocation — the artifact in current conversation focus.
allowed-tools: Bash(bun ${CLAUDE_SKILL_DIR}/scripts/*)
---

# html-kit:drain

Cursor-paginated read of agent-targeted annotations written by the human via
the html-kit v0.4.0 annotation-strip web component. The strip writes JSONL
to `<artifact>.annotations.jsonl`; this skill drains everything past the
last-read cursor stored at `<artifact>.annotations.cursor` and hands the
content back into the conversation so you can respond inline.

## When to invoke

- User says "drain", "read my notes", "what did I leave", `/html-kit-drain`
  (manual install) or `/html-kit:html-kit-drain` (plugin install)
- Inline conversation has just produced or referenced ONE html-kit artifact
  (rendered via `bun ${CLAUDE_SKILL_DIR}/scripts/resolve-out-path.ts ...` or
  served by daemon at `http://localhost:63839/<slug>/<file>.html`, or the
  legacy `/p/<slug>/<file>.html` form) and the
  user has been reviewing it in the browser between turns
- User explicitly hands you an artifact path or daemon URL to drain

Do NOT use this skill to:
- Drain across multiple artifacts at once — call it per artifact
- Mutate annotations — this is a read+cursor-advance op only
- Pull from another repo's artifacts speculatively — only the one in focus

## Inputs

The skill resolves the target artifact from, in order:
1. Explicit path the user just gave you (`/tmp/foo.html`, `~/.html-kit/.../bar.html`, or a daemon URL)
2. The artifact path you most recently emitted in this conversation via
   `bun ${CLAUDE_SKILL_DIR}/scripts/resolve-out-path.ts ...`
3. The daemon URL the user is currently looking at — ask if not already in
   conversation context

If you cannot identify a single artifact with confidence, STOP and ask. Never
guess across multiple recent artifacts — the annotation cursor advances on
read, so reading the wrong file silently loses the user's notes.

## URL → path mapping

Daemon URLs (flat `/<slug>/<file>.html` or legacy `/p/<slug>/<file>.html`)
map back to absolute paths via `bun ${CLAUDE_SKILL_DIR}/scripts/artifact-from-url.ts <url>`
— it prints the absolute path on success, or exits 1 with a stderr message if
the URL isn't a resolvable artifact route. It resolves the same way the
daemon does: `repos.json` slug → repo root, then `<repoRoot>/.html-kit/`,
then `~/.html-kit/<slug>/` — first existing file wins.

## Workflow

1. **Resolve the artifact.** Pin down ONE absolute path (use
   `bun ${CLAUDE_SKILL_DIR}/scripts/artifact-from-url.ts <url>` if you only
   have a daemon URL). If unclear → ask.
2. **Verify daemon is up.** Run
   `bun ${CLAUDE_SKILL_DIR}/scripts/daemon-check.ts`. Prints `up <url>` or
   `down`; always exits 0. If it's down, skip straight to the offline
   fallback in step 3.
3. **Drain via the helper, or fall back to the raw file.** Call:
   ```bash
   bun ${CLAUDE_SKILL_DIR}/scripts/annotate-read.ts <absolute-artifact-path>
   ```
   The helper reads `<artifact>.annotations.cursor` (a byte offset, default
   0) and calls the daemon's `GET /api/annotations/<path>?since=<cursor>` —
   the daemon reads `<artifact>.annotations.jsonl` on its side and returns
   only the records past that offset. The helper prints raw JSONL to
   stdout, one record per line, and advances the cursor file to the
   daemon's reported offset on success.
   - Exits 0 with no output if cursor is at EOF (= nothing new)
   - Exits 0 silently with stderr `"daemon offline"` if the daemon is
     unreachable (`ECONNREFUSED`) — **when this happens, don't stop: read
     `<artifact>.annotations.jsonl` directly with the Read tool instead.**
     Every line is one JSON record; track how many lines you've already
     processed (compare against the byte offset in
     `<artifact>.annotations.cursor` if it exists, otherwise just note the
     line count you stop at) so a later drain doesn't re-surface the same
     annotations.
   - Exits 0 silently if the JSONL file does not exist (= no annotations yet)
4. **Parse and act.** Each line is one of:
   ```json
   {"id":"...","item_id":"...","type":"accept" | "reject" | "comment" | "tag","value":"...","at":"<iso8601>"}
   ```
   Group by `item_id`, summarize per-item, then act:
   - **accept** — confirm the proposal/decision; no further design churn
   - **reject** — propose a replacement or roll back; ask before destructive change
   - **comment** — quote the value and respond inline; route into the next
     edit if it implies one
   - **tag** — record as metadata; if a memory tool is available in this
     session, use it to store durable tags worth keeping across sessions
5. **Confirm the drain.** Tell the user how many records you read, the time
   range, and the per-item rollup before doing follow-up work.

## Gotchas

- **Cursor advances on read.** If you call the helper twice in a row the
  second call returns nothing — that's correct, not a bug.
- **Daemon-offline mode is silent.** If the strip ran in `file://` mode the
  user has annotations in their browser's localStorage, NOT on disk. Ask them
  to use the "Copy annotations" button on the strip — they'll paste JSONL
  into chat, and you handle that as the drain.
- **Annotations are per-artifact.** A redraw at the same path keeps the
  same JSONL; a fresh render at a new path starts a new log.
- **Order matters within an item.** Use `at` to order; the last `accept` or
  `reject` for a given `item_id` wins.

## Example session

```
user: /html-kit-drain (or /html-kit:html-kit-drain in plugin mode)
assistant: → resolving artifact …
           found: <repo>/.html-kit/02_v0.4.0-interaction-loop.html
           bun ${CLAUDE_SKILL_DIR}/scripts/annotate-read.ts …
           → 4 annotations across 2 items (5m 12s window)
             • lane-2-agent (reject) "too many phases, collapse to 3"
             • option-card-pagefind (accept)
             • lane-2-agent (comment) "the SSE arrow should be dotted"
             • lane-2-agent (tag) "v0.4.1-followup"
           Acting on rejection of lane-2-agent now —
           proposing 3-phase collapse: …
```

If the user does not want any of those follow-ups, they say so; do not
auto-apply the rejection in a destructive way (rerender into the same path
or overwrite without confirming on a high-cost change).

## Related

- `patterns/annotation-strip.md` — the strip itself, its DOM contract, and
  the JSONL schema this skill drains.
- `scripts/annotate-read.ts` — the underlying drain helper. Same exit codes.
- `scripts/html-kit-daemon.ts` — the daemon that captures POSTs from the
  strip and writes the JSONL.
- `scripts/daemon-check.ts` — no-prompt daemon health check.
- `scripts/artifact-from-url.ts` — no-prompt daemon URL → absolute path resolver.
