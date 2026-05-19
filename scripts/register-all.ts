#!/usr/bin/env bun
// Backfills ~/.html-kit/_daemon/repos.json by walking ~/.html-kit/<slug>/ dirs
// and reverse-resolving each path-mangled slug back to its original cwd.
// Uses heuristic split-on-dash w/ filesystem existence check; falls back to
// .html-kit-meta.json (forward-compat). Writes via daemon if up, else direct.
//
// Usage: bun scripts/register-all.ts [--dry-run] [--verbose]
// All status output goes to stderr; exit 0 even when some slugs fail to resolve.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join, resolve } from "path";
import { homedir } from "os";

const HOME = homedir();
const KIT_HOME = join(HOME, ".html-kit");
const DAEMON_DIR = join(KIT_HOME, "_daemon");
const REPOS_FILE = join(DAEMON_DIR, "repos.json");
const DAEMON_URL = "http://localhost:63839/api/repos";

const SKIP_DIRS = new Set(["_daemon", "_index", "_old_tmp", "_archive"]);

type Args = { dryRun: boolean; verbose: boolean };
type ReposMap = Record<string, string>;

function parseArgs(argv: string[]): Args {
  return {
    dryRun: argv.includes("--dry-run"),
    verbose: argv.includes("--verbose"),
  };
}

function log(args: Args, ...parts: unknown[]) {
  if (args.verbose) process.stderr.write(parts.join(" ") + "\n");
}

function loadRepos(): ReposMap {
  if (!existsSync(REPOS_FILE)) return {};
  try { return JSON.parse(readFileSync(REPOS_FILE, "utf8")); } catch { return {}; }
}

function saveRepos(map: ReposMap) {
  mkdirSync(DAEMON_DIR, { recursive: true });
  writeFileSync(REPOS_FILE, JSON.stringify(map, null, 2) + "\n");
}

// Recursive split: tokens[start..] must form a path under `base`. At each
// position try greedy-longest-segment first, recursing on remainder. Returns
// the resolved absolute path if any combo exists on disk, else null.
function tryResolveTokens(base: string, tokens: string[]): string | null {
  if (tokens.length === 0) {
    return existsSync(base) ? base : null;
  }
  // Try consuming tokens[0..k] as a single path segment (joined w/ '-'),
  // longest-first so dashed folder names like `slack-pavillion-digest` resolve.
  for (let k = tokens.length; k >= 1; k--) {
    const segment = tokens.slice(0, k).join("-");
    const next = join(base, segment);
    if (!existsSync(next)) continue;
    if (k === tokens.length) {
      return next;
    }
    const rest = tryResolveTokens(next, tokens.slice(k));
    if (rest) return rest;
  }
  return null;
}

function resolveSlug(slug: string): string | null {
  // Forward-compat: explicit cwd in <slug>/.html-kit-meta.json
  const metaPath = join(KIT_HOME, slug, ".html-kit-meta.json");
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      if (meta && typeof meta.cwd === "string" && existsSync(meta.cwd)) {
        return meta.cwd;
      }
    } catch { /* fall through */ }
  }

  // Heuristic: slug = cwd-with-slashes-replaced-by-dashes
  // Anchor at $HOME (typically `/Users/<user>`), then iteratively split rest.
  const homeTokens = HOME.split("/").filter(Boolean); // e.g. ["Users", "njui"]
  const slugTokens = slug.split("-");
  // strip the home prefix tokens off the slug if it starts with them
  let i = 0;
  for (; i < homeTokens.length; i++) {
    if (slugTokens[i] !== homeTokens[i]) break;
  }
  if (i !== homeTokens.length) {
    // slug doesn't start with home prefix — not a path-mangled slug we can recover
    return null;
  }
  const remainder = slugTokens.slice(homeTokens.length);
  if (remainder.length === 0) return HOME;
  return tryResolveTokens(HOME, remainder);
}

async function postToDaemon(slug: string, dir: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 500);
    try {
      const res = await fetch(DAEMON_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, dir }),
        signal: ctrl.signal,
      });
      return res.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(KIT_HOME)) {
    process.stderr.write(`[register-all] ${KIT_HOME} does not exist; nothing to do\n`);
    return;
  }

  const entries = readdirSync(KIT_HOME);
  const resolved: Array<[string, string]> = [];
  const failed: string[] = [];

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const dir = join(KIT_HOME, entry);
    let st;
    try { st = statSync(dir); } catch { continue; }
    if (!st.isDirectory()) continue;

    const cwd = resolveSlug(entry);
    if (cwd) {
      log(args, `[register-all] resolved ${entry} -> ${cwd}`);
      resolved.push([entry, cwd]);
    } else {
      log(args, `[register-all] FAILED to resolve ${entry}`);
      failed.push(entry);
    }
  }

  // Also keep existing repos.json entries (e.g. manually registered)
  const existing = loadRepos();

  // Determine if daemon is reachable (single probe via dry POST? — simpler: try GET)
  let daemonUp = false;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 500);
    try {
      const res = await fetch(DAEMON_URL, { method: "GET", signal: ctrl.signal });
      daemonUp = res.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    daemonUp = false;
  }

  if (args.dryRun) {
    process.stderr.write(
      `[register-all] DRY RUN — found ${resolved.length} repos: ` +
      resolved.map(([s, d]) => `${s}=${d}`).join(", ") + "\n",
    );
    if (failed.length) {
      process.stderr.write(`[register-all] DRY RUN — ${failed.length} unresolved: ${failed.join(", ")}\n`);
    }
    return;
  }

  if (daemonUp) {
    let okCount = 0;
    for (const [slug, dir] of resolved) {
      if (await postToDaemon(slug, dir)) okCount++;
    }
    log(args, `[register-all] posted ${okCount}/${resolved.length} to daemon`);
  } else {
    // Merge into existing repos.json directly
    const merged: ReposMap = { ...existing };
    for (const [slug, dir] of resolved) {
      merged[slug] = resolve(dir);
    }
    saveRepos(merged);
    log(args, `[register-all] daemon down — wrote ${Object.keys(merged).length} entries to ${REPOS_FILE}`);
  }

  process.stderr.write(
    `[register-all] found ${resolved.length} repos: ` +
    resolved.map(([s, d]) => `${s}=${d}`).join(", ") + "\n",
  );
  if (failed.length) {
    process.stderr.write(`[register-all] ${failed.length} unresolved: ${failed.join(", ")}\n`);
  }
}

main().catch(e => {
  process.stderr.write(`[register-all] ${String(e)}\n`);
  process.exit(1);
});
