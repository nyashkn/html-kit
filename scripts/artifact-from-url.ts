#!/usr/bin/env bun
// Maps a html-kit daemon URL — flat `/<slug>/<file>.html` or legacy
// `/p/<slug>/<file>.html` — to the absolute artifact path on disk. Mirrors
// the route + candidate-dir resolution order in scripts/html-kit-daemon.ts's
// tryFlatArtifact()/serveArtifact() and scripts/build-index.ts's staging
// rules, reading the same ~/.html-kit/_daemon/repos.json.
// Prints the absolute path to stdout on success (exit 0). Prints an error to
// stderr and exits 1 if the URL isn't a resolvable artifact route.

import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";

const HOME = homedir();
const KIT_HOME = join(HOME, ".html-kit");
const REPOS_FILE = join(KIT_HOME, "_daemon", "repos.json");

// Same reserved top-level names the daemon refuses to treat as slug routes.
const RESERVED_TOP_LEVEL = new Set([
  "p",
  "api",
  "pagefind",
  "events",
  "annotation-strip.js",
  "pagefind-overrides.css",
]);

type ReposMap = Record<string, string>;

function loadRepos(): ReposMap {
  if (!existsSync(REPOS_FILE)) return {};
  try { return JSON.parse(readFileSync(REPOS_FILE, "utf8")); } catch { return {}; }
}

function fail(msg: string): never {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

const input = process.argv[2];
if (!input) {
  process.stderr.write("Usage: bun scripts/artifact-from-url.ts <daemon-url>\n");
  process.exit(1);
}

let pathname: string;
try {
  pathname = new URL(input).pathname;
} catch {
  // Not a full URL (e.g. someone passed just the path) — use it as-is.
  pathname = input.startsWith("/") ? input : `/${input}`;
}

// Legacy /p/<slug>/<file> -> strip the /p prefix, same as the daemon's 301.
const stripped = pathname.startsWith("/p/") ? pathname.slice(3) : pathname.slice(1);
const slashIdx = stripped.indexOf("/");
const slug = slashIdx === -1 ? stripped : stripped.slice(0, slashIdx);
const tail = slashIdx === -1 ? "" : stripped.slice(slashIdx + 1);

if (!slug || RESERVED_TOP_LEVEL.has(slug)) {
  fail(`not an artifact route: ${pathname}`);
}
if (!tail) {
  fail(`no file in URL (that's a scope index, not an artifact): ${pathname}`);
}

const repos = loadRepos();
const candidates: string[] = [];
if (repos[slug]) {
  candidates.push(repos[slug]);
  candidates.push(join(repos[slug], ".html-kit"));
}
const kitDir = join(KIT_HOME, slug);
if (existsSync(kitDir)) candidates.push(kitDir);

for (const c of candidates) {
  const candidate = resolve(c, tail);
  if (existsSync(candidate)) {
    process.stdout.write(candidate + "\n");
    process.exit(0);
  }
}

fail(`unresolvable: no known artifact for slug "${slug}" tail "${tail}" (checked ${candidates.length} candidate dir(s))`);
