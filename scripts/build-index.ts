#!/usr/bin/env bun
// Builds the cross-project search index for html-kit v0.4.0:
//   1. scans ~/.html-kit/<slug>/*.html + every registered repo's .html-kit/*.html
//   2. stages each artifact into ~/.html-kit/_daemon/staging/<slug>/<file>.html
//      via hardlink (fallback copy on cross-FS); mutates copy idempotently to
//      inject <meta data-pagefind-filter="project:<slug>"> if absent
//   3. runs `bunx pagefind --site ~/.html-kit/_daemon/staging --output-subdir ../pagefind`
//   4. renders ~/.html-kit/_daemon/index.html from .html-kit/03_v0.4.0-index-mockup.html
//      with real counts, per-project columns, latest tickets, ⌘K modal wired to pagefind
//
// Flags:
//   --incremental   skip re-staging files whose staged copy mtime >= source mtime
//   --verbose       per-file log lines
//
// All status output goes to stderr; exits non-zero on pagefind failure.
// Usage: bun scripts/build-index.ts [--incremental] [--verbose]

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  linkSync,
  copyFileSync,
  unlinkSync,
  rmSync,
} from "fs";
import { join, resolve, basename } from "path";
import { homedir } from "os";

const HOME = homedir();
const KIT_HOME = join(HOME, ".html-kit");
const DAEMON_DIR = join(KIT_HOME, "_daemon");
const STAGING_DIR = join(DAEMON_DIR, "staging");
const PAGEFIND_DIR = join(DAEMON_DIR, "pagefind");
const REPOS_FILE = join(DAEMON_DIR, "repos.json");
const INDEX_HTML = join(DAEMON_DIR, "index.html");
const TEMPLATE = resolve(import.meta.dir, "..", ".html-kit", "03_v0.4.0-index-mockup.html");

const SKIP_DIRS = new Set(["_daemon", "_index", "_old_tmp", "_archive"]);
const STAGED_MARKER = "<!-- html-kit:staged -->";

type Args = { incremental: boolean; verbose: boolean };
type ReposMap = Record<string, string>;
type Artifact = {
  project: string;
  filename: string;
  srcPath: string;
  stagedPath: string;
  mtimeMs: number;
  title: string;
  nn: string;
  archetype: string;
};

function parseArgs(argv: string[]): Args {
  return {
    incremental: argv.includes("--incremental"),
    verbose: argv.includes("--verbose"),
  };
}

function log(verbose: boolean, ...parts: unknown[]) {
  if (verbose) process.stderr.write(parts.join(" ") + "\n");
}

function loadRepos(): ReposMap {
  if (!existsSync(REPOS_FILE)) return {};
  try { return JSON.parse(readFileSync(REPOS_FILE, "utf8")); } catch { return {}; }
}

function listHtmlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith(".html") && !f.startsWith("."))
    .map(f => join(dir, f));
}

function extractTitle(html: string, fallback: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (m && m[1].trim()) return m[1].trim().replace(/\s+/g, " ");
  return fallback;
}

function guessArchetype(filename: string): string {
  const name = filename.toLowerCase();
  if (/triage|backlog|board/.test(name)) return "TRIAGE";
  if (/spec|rfc|adr|decision|config/.test(name)) return "SPEC";
  if (/explain|primer|overview|mockup|intro/.test(name)) return "EXPLAINER";
  if (/flow|pipeline|migration|journey|route/.test(name)) return "FLOW";
  if (/retro|postmortem|review|evaluation|status|update/.test(name)) return "RETRO";
  if (/index/.test(name)) return "EXPLAINER";
  return "EXPLAINER";
}

function parseNnAndSlug(filename: string): { nn: string; slug: string } {
  const base = basename(filename, ".html");
  const m = base.match(/^(\d{2})_(.*)$/);
  if (m) return { nn: m[1], slug: m[2] };
  return { nn: "--", slug: base };
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortMtime(ms: number): string {
  const d = new Date(ms);
  const mon = d.toLocaleString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${mon} ${day} ${hh}:${mm}`;
}

// --- stage one file -------------------------------------------------------
function stageFile(srcPath: string, project: string, args: Args): string {
  const projectDir = join(STAGING_DIR, project);
  mkdirSync(projectDir, { recursive: true });
  const filename = basename(srcPath);
  const stagedPath = join(projectDir, filename);

  // incremental skip
  if (args.incremental && existsSync(stagedPath)) {
    try {
      const srcM = statSync(srcPath).mtimeMs;
      const stM = statSync(stagedPath).mtimeMs;
      if (stM >= srcM) {
        log(args.verbose, `[stage] skip ${project}/${filename} (fresh)`);
        return stagedPath;
      }
    } catch { /* fall through to re-stage */ }
  }

  // remove existing staged copy if present (we always rewrite content)
  if (existsSync(stagedPath)) {
    try { unlinkSync(stagedPath); } catch { /* ignore */ }
  }

  // hardlink first; fall back to copy on cross-FS / permission errors
  let copied = false;
  try {
    linkSync(srcPath, stagedPath);
  } catch {
    copyFileSync(srcPath, stagedPath);
    copied = true;
  }

  // mutate staged file in place to inject pagefind filter meta — only safe
  // if we have an independent copy. If hardlink succeeded, we'd be editing
  // the user's source, so re-do as copy.
  let html = readFileSync(stagedPath, "utf8");
  if (!html.includes(STAGED_MARKER)) {
    if (!copied) {
      // upgrade hardlink to copy by unlinking + rewriting
      try { unlinkSync(stagedPath); } catch { /* ignore */ }
      copyFileSync(srcPath, stagedPath);
      html = readFileSync(stagedPath, "utf8");
    }
    const inject =
      `${STAGED_MARKER}\n` +
      `<meta data-pagefind-filter="project:${htmlEscape(project)}">\n`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>\n${inject}`);
    } else {
      html = inject + html;
    }
    writeFileSync(stagedPath, html);
  }

  log(args.verbose, `[stage] ${project}/${filename}`);
  return stagedPath;
}

// --- collect every artifact across HOME + repos --------------------------
function collectArtifacts(repos: ReposMap, args: Args): Artifact[] {
  const out: Artifact[] = [];
  const seen = new Set<string>(); // dedupe by absolute src path

  const ingest = (project: string, srcPath: string) => {
    const abs = resolve(srcPath);
    if (seen.has(abs)) return;
    seen.add(abs);
    let st;
    try { st = statSync(abs); } catch { return; }
    if (!st.isFile()) return;
    const stagedPath = stageFile(abs, project, args);
    let html = "";
    try { html = readFileSync(stagedPath, "utf8"); } catch { /* keep empty */ }
    const filename = basename(abs);
    const { nn, slug } = parseNnAndSlug(filename);
    const title = extractTitle(html, slug.replace(/[-_]/g, " "));
    out.push({
      project,
      filename,
      srcPath: abs,
      stagedPath,
      mtimeMs: st.mtimeMs,
      title,
      nn,
      archetype: guessArchetype(filename),
    });
  };

  // ~/.html-kit/<slug>/*.html
  if (existsSync(KIT_HOME)) {
    for (const entry of readdirSync(KIT_HOME)) {
      if (SKIP_DIRS.has(entry)) continue;
      const dir = join(KIT_HOME, entry);
      let st;
      try { st = statSync(dir); } catch { continue; }
      if (!st.isDirectory()) continue;
      for (const f of listHtmlFiles(dir)) ingest(entry, f);
    }
  }

  // registered repos: <dir>/.html-kit/*.html (skip _archive)
  for (const [slug, repoDir] of Object.entries(repos)) {
    const kitDir = join(repoDir, ".html-kit");
    if (!existsSync(kitDir)) continue;
    for (const f of listHtmlFiles(kitDir)) ingest(slug, f);
  }

  return out;
}

// --- run pagefind --------------------------------------------------------
async function runPagefind(): Promise<{ ok: boolean; elapsedMs: number; stderr: string }> {
  // Wipe previous pagefind output so deleted artifacts don't linger.
  if (existsSync(PAGEFIND_DIR)) {
    try { rmSync(PAGEFIND_DIR, { recursive: true, force: true }); } catch { /* ignore */ }
  }
  const t0 = Date.now();
  const proc = Bun.spawn(
    ["bunx", "pagefind", "--site", STAGING_DIR, "--output-subdir", "../pagefind"],
    { stdout: "pipe", stderr: "pipe" },
  );
  const stderrText = await new Response(proc.stderr).text();
  const exit = await proc.exited;
  return { ok: exit === 0, elapsedMs: Date.now() - t0, stderr: stderrText };
}

// --- render index.html ---------------------------------------------------
function renderRow(a: Artifact, project: string): string {
  const tag = a.archetype;
  return (
    `      <a class="index-row" data-component="index-row" ` +
    `href="/${htmlEscape(project)}/${htmlEscape(a.filename)}" ` +
    `data-archetype="${htmlEscape(tag)}">\n` +
    `        <span class="row-nn">${htmlEscape(a.nn)}_</span>\n` +
    `        <span class="row-title">${htmlEscape(a.title)}</span>\n` +
    `        <span class="archetype-chip" data-archetype="${htmlEscape(tag)}">${htmlEscape(tag)}</span>\n` +
    `        <span class="row-mtime">${htmlEscape(shortMtime(a.mtimeMs))}</span>\n` +
    `      </a>`
  );
}

function prettyProjectLabel(project: string, repos: ReposMap): { primary: string; secondary: string } {
  // Prefer registered repo path: primary = basename(dir), secondary = path under common dev root
  const dir = repos[project];
  if (dir) {
    const segments = dir.split("/").filter(Boolean);
    const primary = segments[segments.length - 1] || project;
    const devRoot = "code";
    const idx = dir.indexOf(devRoot);
    const secondary = idx >= 0 ? dir.slice(idx + devRoot.length + 1) : dir;
    return { primary, secondary };
  }
  // Fallback for ~/.html-kit/<slug>/ entries (slug = cwd path-mangled, slashes → '-')
  // Strip common prefix; show remainder as secondary, last segment as primary.
  const stripped = project.replace(/^Users-[^-]+-code-/, "");
  if (stripped !== project) {
    const tokens = stripped.split("-");
    const primary = tokens.length > 1 ? tokens.slice(-2).join("-") : tokens[0];
    return { primary, secondary: stripped };
  }
  return { primary: project, secondary: "" };
}

function renderProjectSection(project: string, artifacts: Artifact[], repos: ReposMap): string {
  // sort artifacts within project by mtime desc
  const sorted = artifacts.slice().sort((a, b) => b.mtimeMs - a.mtimeMs);
  const rows = sorted.map(a => renderRow(a, project)).join("\n");
  const docLabel = artifacts.length === 1 ? "doc" : "docs";
  const { primary, secondary } = prettyProjectLabel(project, repos);
  const secondaryHtml = secondary
    ? `        <span class="project-path">${htmlEscape(secondary)}</span>\n`
    : "";
  return (
    `    <section class="project-section" data-component="project-section" ` +
    `data-project="${htmlEscape(project)}">\n` +
    `      <div class="project-head" data-component="project-head">\n` +
    `        <h2>${htmlEscape(primary)}</h2>\n` +
    secondaryHtml +
    `        <span class="project-count">· ${artifacts.length} ${docLabel}</span>\n` +
    `      </div>\n` +
    rows + "\n" +
    `    </section>`
  );
}

function buildIndexList(artifacts: Artifact[]): { list: string; projectCount: number } {
  const byProject = new Map<string, Artifact[]>();
  for (const a of artifacts) {
    const arr = byProject.get(a.project) || [];
    arr.push(a);
    byProject.set(a.project, arr);
  }
  // sort projects by most-recently-touched first
  const sorted = Array.from(byProject.entries()).sort((a, b) => {
    const am = Math.max(...a[1].map(x => x.mtimeMs));
    const bm = Math.max(...b[1].map(x => x.mtimeMs));
    return bm - am;
  });
  const repos = loadRepos();
  const sections = sorted.map(([project, arts]) => renderProjectSection(project, arts, repos));
  return { list: sections.join("\n\n"), projectCount: sorted.length };
}

function renderIndex(template: string, artifacts: Artifact[]): string {
  const { list, projectCount } = buildIndexList(artifacts);
  const docCount = artifacts.length;
  const nowIso = new Date().toISOString().replace("T", " ").slice(0, 16);

  let html = template;

  // 1. summary counts + timestamp
  html = html.replace(
    /<div class="summary">[\s\S]*?<\/div>/,
    `<div class="summary">\n` +
    `      <b>${docCount}</b> docs <span class="dot">·</span> ` +
    `<b>${projectCount}</b> projects <span class="dot">·</span> updated ${htmlEscape(nowIso)}\n` +
    `    </div>`,
  );

  // 2. replace index-list contents between BUILD-INDEX-LIST markers
  html = html.replace(
    /(<!-- BUILD-INDEX-LIST:start -->)[\s\S]*?(<!-- BUILD-INDEX-LIST:end -->)/,
    `$1\n\n${list}\n\n    $2`,
  );

  // 3. wire pagefind UI assets in head if not already present
  const pagefindAssets =
    `<link rel="stylesheet" href="/pagefind/pagefind-component-ui.css">\n` +
    `<link rel="stylesheet" href="/pagefind-overrides.css">\n` +
    `<script src="/pagefind/pagefind-component-ui.js" defer></script>\n`;
  if (!/pagefind-component-ui\.css/.test(html)) {
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${pagefindAssets}</head>`);
    }
  } else if (!/pagefind-overrides\.css/.test(html)) {
    html = html.replace(
      /<link[^>]+pagefind-component-ui\.css[^>]*>/i,
      `$&\n<link rel="stylesheet" href="/pagefind-overrides.css">`,
    );
  }
  // 4. pagefind web components are already in the template; only inject if missing
  const pagefindWebComponents =
    `<pagefind-config bundle-path="/pagefind/"></pagefind-config>\n` +
    `<pagefind-modal-trigger compact></pagefind-modal-trigger>\n` +
    `<pagefind-modal></pagefind-modal>\n`;
  if (!/<pagefind-config\b/.test(html)) {
    if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${pagefindWebComponents}</body>`);
    } else {
      html += pagefindWebComponents;
    }
  }

  return html;
}

// --- main ----------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(STAGING_DIR, { recursive: true });

  if (!existsSync(TEMPLATE)) {
    process.stderr.write(`[build-index] template missing: ${TEMPLATE}\n`);
    process.exit(1);
  }

  const repos = loadRepos();
  const artifacts = collectArtifacts(repos, args);

  const projectSet = new Set(artifacts.map(a => a.project));
  process.stderr.write(
    `[build-index] staged ${artifacts.length} artifacts across ${projectSet.size} projects\n`,
  );

  const { ok, elapsedMs, stderr } = await runPagefind();
  if (!ok) {
    process.stderr.write(`[build-index] pagefind failed:\n${stderr}\n`);
    process.exit(1);
  }
  process.stderr.write(
    `[build-index] pagefind built in ${(elapsedMs / 1000).toFixed(1)}s\n`,
  );

  const template = readFileSync(TEMPLATE, "utf8");
  const rendered = renderIndex(template, artifacts);
  writeFileSync(INDEX_HTML, rendered);
  process.stderr.write(`[build-index] index written to ${INDEX_HTML}\n`);
}

main().catch(e => {
  process.stderr.write(`[build-index] ${String(e)}\n`);
  process.exit(1);
});
