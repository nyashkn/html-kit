#!/usr/bin/env bun
// Auto-discover .html-kit/ dirs under configured scan roots and merge into
// ~/.html-kit/_daemon/repos.json. Used both at daemon startup and via
// POST /api/discover.
//
// Config: ~/.html-kit/_daemon/config.json
//   { "scanRoots": ["~/code"], "maxDepth": 6 }
// Defaults applied if config missing or fields absent.
//
// Exports discoverRoots() for in-process use. CLI form:
//   bun scripts/discover-roots.ts [--dry-run] [--verbose]
//
// All status output goes to stderr; CLI exits 0 even when nothing found.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join, resolve, basename } from "path";
import { homedir } from "os";

const HOME = homedir();
const KIT_HOME = join(HOME, ".html-kit");
const DAEMON_DIR = join(KIT_HOME, "_daemon");
const CONFIG_FILE = join(DAEMON_DIR, "config.json");
const REPOS_FILE = join(DAEMON_DIR, "repos.json");

const DEFAULT_SCAN_ROOTS = [join(HOME, "code")];
const DEFAULT_MAX_DEPTH = 6;
const SKIP_NAMES = new Set([
  "node_modules", ".git", ".html-kit", "_archive",
  "Library", "vendor", "dist", "build", ".next",
  ".venv", "venv", "__pycache__", ".turbo", ".cache",
]);

type ReposMap = Record<string, string>;
export type DiscoverResult = {
  added: string[];          // slugs newly added
  existing: number;         // count already in repos.json before scan
  scanned: number;          // total .html-kit dirs found on disk
  durationMs: number;
  scanRoots: string[];
};

type Config = { scanRoots: string[]; maxDepth: number };

function expandHome(p: string): string {
  if (p === "~") return HOME;
  if (p.startsWith("~/")) return join(HOME, p.slice(2));
  return p;
}

function loadConfig(): Config {
  let raw: Partial<Config> = {};
  if (existsSync(CONFIG_FILE)) {
    try { raw = JSON.parse(readFileSync(CONFIG_FILE, "utf8")); } catch { /* fall through */ }
  }
  const rootsIn = Array.isArray(raw.scanRoots) && raw.scanRoots.length > 0
    ? raw.scanRoots
    : DEFAULT_SCAN_ROOTS;
  const scanRoots = rootsIn.map(expandHome).map(p => resolve(p));
  const maxDepth = typeof raw.maxDepth === "number" && raw.maxDepth > 0
    ? raw.maxDepth
    : DEFAULT_MAX_DEPTH;
  return { scanRoots, maxDepth };
}

function loadRepos(): ReposMap {
  if (!existsSync(REPOS_FILE)) return {};
  try { return JSON.parse(readFileSync(REPOS_FILE, "utf8")); } catch { return {}; }
}

function saveRepos(map: ReposMap) {
  mkdirSync(DAEMON_DIR, { recursive: true });
  writeFileSync(REPOS_FILE, JSON.stringify(map, null, 2) + "\n");
}

// Walk dir, collect every parent of a .html-kit subdir. Skips SKIP_NAMES.
function findHtmlKitDirs(root: string, maxDepth: number): string[] {
  const hits: string[] = [];
  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;
    let entries: string[];
    try { entries = readdirSync(dir); } catch { return; }

    // If this dir contains .html-kit/, record its parent (the repo dir).
    if (entries.includes(".html-kit")) {
      const kitPath = join(dir, ".html-kit");
      try {
        if (statSync(kitPath).isDirectory()) hits.push(dir);
      } catch { /* ignore */ }
    }

    for (const name of entries) {
      if (SKIP_NAMES.has(name)) continue;
      if (name.startsWith(".") && name !== ".claude") continue; // allow .claude/worktrees
      const next = join(dir, name);
      let st;
      try { st = statSync(next); } catch { continue; }
      if (!st.isDirectory()) continue;
      walk(next, depth + 1);
    }
  }
  walk(root, 0);
  return hits;
}

// Canonical slug = basename of repo dir. Matches existing short-slug convention
// already in repos.json (my-app, html-kit, example-insights, etc.).
function slugFor(repoDir: string): string {
  return basename(repoDir);
}

export async function discoverRoots(
  opts: { verbose?: boolean; persist?: boolean } = {},
): Promise<DiscoverResult> {
  const verbose = opts.verbose ?? false;
  const persist = opts.persist ?? true;

  const t0 = Date.now();
  const cfg = loadConfig();
  const repos = loadRepos();
  const existingDirs = new Set(Object.values(repos).map(p => resolve(p)));
  const existingCount = Object.keys(repos).length;

  const allHits: string[] = [];
  for (const root of cfg.scanRoots) {
    if (!existsSync(root)) {
      if (verbose) process.stderr.write(`[discover-roots] skip missing root: ${root}\n`);
      continue;
    }
    allHits.push(...findHtmlKitDirs(root, cfg.maxDepth));
  }

  const added: string[] = [];
  for (const repoDir of allHits) {
    const abs = resolve(repoDir);
    if (existingDirs.has(abs)) continue;
    const slug = slugFor(abs);
    // collision handling: if slug taken by different dir, suffix w/ -2 etc.
    let finalSlug = slug;
    let n = 2;
    while (repos[finalSlug] && resolve(repos[finalSlug]) !== abs) {
      finalSlug = `${slug}-${n}`;
      n++;
    }
    repos[finalSlug] = abs;
    existingDirs.add(abs);
    added.push(finalSlug);
    if (verbose) process.stderr.write(`[discover-roots] + ${finalSlug} -> ${abs}\n`);
  }

  if (persist && added.length > 0) saveRepos(repos);

  const durationMs = Date.now() - t0;
  if (verbose) {
    const label = persist ? "" : "DRY RUN ";
    process.stderr.write(
      `[discover-roots] ${label}scanned=${allHits.length} added=${added.length} ` +
      `existing=${existingCount} durationMs=${durationMs}\n`,
    );
  }

  return {
    added,
    existing: existingCount,
    scanned: allHits.length,
    durationMs,
    scanRoots: cfg.scanRoots,
  };
}

// CLI entrypoint
if (import.meta.main) {
  const verbose = process.argv.includes("--verbose");
  const dryRun = process.argv.includes("--dry-run");
  discoverRoots({ verbose: verbose || dryRun, persist: !dryRun })
    .then(r => {
      if (!dryRun) process.stdout.write(JSON.stringify(r, null, 2) + "\n");
    })
    .catch(e => { process.stderr.write(String(e) + "\n"); process.exit(1); });
}
