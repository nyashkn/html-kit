---
name: html-kit-drain
description: Read pending annotations written by the human against a specific html-kit artifact, then act on them inline. Use when the user has been reviewing a render in the browser (via the html-kit daemon on :63839) and says things like "drain", "read my notes", "what did I annotate", "pull my feedback", or "/html-kit-drain". One artifact per invocation — the artifact in current conversation focus.
---

# html-kit:drain

Cursor-paginated read of agent-targeted annotations written by the human via
the html-kit v0.4.0 annotation-strip web component. The strip writes JSONL
to `<artifact>.annotations.jsonl`; this skill drains everything past the
last-read cursor stored at `<artifact>.annotations.cursor` and hands the
content back into the conversation so you can respond inline.

## When to invoke

- User says "drain", "read my notes", "what did I leave", "/html-kit-drain"
- Inline conversation has just produced or referenced ONE html-kit artifact
  (rendered via `bun scripts/resolve-out-path.ts ...` or served by daemon at
  `http://localhost:63839/p/<slug>/<file>.html`) and the user has been
  reviewing it in the browser between turns
- User explicitly hands you an artifact path or daemon URL to drain

Do NOT use this skill to:
- Drain across multiple artifacts at once — call it per artifact
- Mutate annotations — this is a read+cursor-advance op only
- Pull from another repo's artifacts speculatively — only the one in focus

## Inputs

The skill resolves the target artifact from, in order:
1. Explicit path the user just gave you (`/tmp/foo.html`, `~/.html-kit/.../bar.html`, or a daemon URL)
2. The artifact path you most recently emitted in this conversation via
   `bun scripts/resolve-out-path.ts ...`
3. The daemon URL the user is currently looking at — ask if not already in
   conversation context

If you cannot identify a single artifact with confidence, STOP and ask. Never
guess across multiple recent artifacts — the annotation cursor advances on
read, so reading the wrong file silently loses the user's notes.

## URL → path mapping

Daemon URLs map back to absolute paths via `repos.json`:

```
http://localhost:63839/p/<slug>/<file>.html
  → cat ~/.html-kit/_daemon/repos.json | jq -r '."<slug>"'  (= repo root, or absent)
  → candidate1: <repoRoot>/<file>.html
  → candidate2: <repoRoot>/.html-kit/<file>.html
  → candidate3: ~/.html-kit/<slug>/<file>.html
  → first existsSync wins (same order daemon uses)
```

## Workflow

1. **Resolve the artifact.** Pin down ONE absolute path. If unclear → ask.
2. **Verify daemon is up.** `curl -sf -o /dev/null http://localhost:63839/api/repos` should return 200. If it isn't, fall back to reading
   `<artifact>.annotations.jsonl` directly off disk — the strip writes there
   even when the daemon is down.
3. **Drain via the helper.** Call:
   ```bash
   bun <html-kit-repo>/scripts/annotate-read.ts <absolute-artifact-path>
   ```
   The helper:
   - Reads `<artifact>.annotations.cursor` (byte offset, default 0)
   - Streams new lines from `<artifact>.annotations.jsonl` past the cursor
   - Prints raw JSONL to stdout, one record per line
   - Advances the cursor to current EOF on success
   - Exits 0 with no output if cursor is at EOF (= nothing new)
   - Exits 0 silently with stderr `"daemon offline"` if `ECONNREFUSED`
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
   - **tag** — record as metadata (use `mcp__signet__memory_store` for
     durable tags worth keeping across sessions)
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
user: /html-kit-drain
assistant: → resolving artifact …
           found: /Users/.../.html-kit/02_v0.4.0-interaction-loop.html
           bun /Users/.../scripts/annotate-read.ts …
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
