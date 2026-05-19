#!/usr/bin/env bun
// HTTP daemon for html-kit v0.4.0 — serves rendered artifacts with Pagefind search overlay,
// captures agent annotations, watches .html-kit/ dirs and rebuilds index on change.
// Singleton on port 63839; PID lock at ~/.html-kit/_daemon/.pid. Errors to stderr.

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, statSync, watch, openSync, readSync, closeSync, appendFileSync } from "fs";
import { join, resolve, sep } from "path";
import { homedir } from "os";

const PORT = 63839;
const HOME = homedir();
const KIT_HOME = join(HOME, ".html-kit");
const DAEMON_DIR = join(KIT_HOME, "_daemon");
const PID_FILE = join(DAEMON_DIR, ".pid");
const REPOS_FILE = join(DAEMON_DIR, "repos.json");
const INDEX_HTML = join(DAEMON_DIR, "index.html");
const PAGEFIND_DIR = join(DAEMON_DIR, "pagefind");
const PATTERN_FILE = join(import.meta.dir, "..", "patterns", "annotation-strip.md");

type ReposMap = Record<string, string>; // slug -> absolute artifact dir

function loadRepos(): ReposMap {
  if (!existsSync(REPOS_FILE)) return {};
  try { return JSON.parse(readFileSync(REPOS_FILE, "utf8")); } catch { return {}; }
}

function saveRepos(map: ReposMap) {
  writeFileSync(REPOS_FILE, JSON.stringify(map, null, 2) + "\n");
}

function log(...parts: unknown[]) {
  process.stderr.write(parts.join(" ") + "\n");
}

function logReq(method: string, path: string, status: number) {
  process.stderr.write(`[${new Date().toISOString()}] ${method} ${path} ${status}\n`);
}

// --- singleton lock -------------------------------------------------------
function acquireLock() {
  mkdirSync(DAEMON_DIR, { recursive: true });
  if (existsSync(PID_FILE)) {
    const prev = parseInt(readFileSync(PID_FILE, "utf8").trim(), 10);
    if (!Number.isNaN(prev)) {
      let alive = false;
      try { process.kill(prev, 0); alive = true; } catch { alive = false; }
      if (alive) {
        process.stderr.write(`daemon already running pid=${prev}\n`);
        process.exit(1);
      }
    }
  }
  writeFileSync(PID_FILE, String(process.pid) + "\n");
}

function releaseLock() {
  try { if (existsSync(PID_FILE)) unlinkSync(PID_FILE); } catch {}
}

// --- annotation-strip cache ----------------------------------------------
let annotationStripCache: string | null = null;
function loadAnnotationStrip(): string {
  if (annotationStripCache !== null) return annotationStripCache;
  if (!existsSync(PATTERN_FILE)) {
    annotationStripCache = `console.warn("[html-kit] annotation-strip pattern not built yet");`;
    return annotationStripCache;
  }
  const md = readFileSync(PATTERN_FILE, "utf8");
  const blocks = [...md.matchAll(/```(?:javascript|js)\n([\s\S]*?)\n```/g)].map(m => m[1]);
  annotationStripCache = blocks.length
    ? blocks.join("\n\n")
    : `console.warn("[html-kit] no js/javascript block in annotation-strip.md");`;
  return annotationStripCache;
}

// --- path safety ----------------------------------------------------------
function isSafePath(target: string, repos: ReposMap): boolean {
  const abs = resolve(target);
  const kitAbs = resolve(KIT_HOME);
  if (abs === kitAbs || abs.startsWith(kitAbs + sep)) return true;
  for (const dir of Object.values(repos)) {
    const repoAbs = resolve(dir);
    if (abs === repoAbs || abs.startsWith(repoAbs + sep)) return true;
  }
  return false;
}

// --- HTML injection -------------------------------------------------------
function injectOverlay(html: string): string {
  const headExtras =
    `<link rel="stylesheet" href="/pagefind/pagefind-component-ui.css">\n` +
    `<script src="/pagefind/pagefind-component-ui.js" type="module"></script>\n` +
    `<script src="/annotation-strip.js" defer></script>\n`;
  const bodyExtras = `<pagefind-config bundle-path="/pagefind/"></pagefind-config><pagefind-modal-trigger compact></pagefind-modal-trigger><pagefind-modal></pagefind-modal>\n`;
  let out = html;
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, headExtras + "</head>");
  } else {
    out = headExtras + out;
  }
  if (/<\/body>/i.test(out)) {
    out = out.replace(/<\/body>/i, bodyExtras + "</body>");
  } else {
    out = out + bodyExtras;
  }
  return out;
}

// --- SSE clients ----------------------------------------------------------
const sseClients = new Set<WritableStreamDefaultWriter<Uint8Array>>();
const encoder = new TextEncoder();

function broadcastSSE(event: string, data: string) {
  const payload = encoder.encode(`event: ${event}\ndata: ${data}\n\n`);
  for (const w of sseClients) {
    w.write(payload).catch(() => { sseClients.delete(w); });
  }
}

// --- filewatch + index rebuild -------------------------------------------
let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    rebuildTimer = null;
    const buildScript = join(import.meta.dir, "build-index.ts");
    if (!existsSync(buildScript)) {
      log("[html-kit-daemon] build-index.ts not found, skipping rebuild");
      broadcastSSE("index:updated", JSON.stringify({ ts: Date.now(), skipped: true }));
      return;
    }
    const proc = Bun.spawn(["bun", buildScript], { stdout: "inherit", stderr: "inherit" });
    proc.exited.then(() => {
      broadcastSSE("index:updated", JSON.stringify({ ts: Date.now() }));
    });
  }, 500);
}

function setupWatchers(repos: ReposMap) {
  const dirs = new Set<string>();
  if (existsSync(KIT_HOME)) dirs.add(KIT_HOME);
  for (const dir of Object.values(repos)) {
    if (existsSync(dir)) dirs.add(dir);
  }
  for (const dir of dirs) {
    try {
      watch(dir, { recursive: true }, () => scheduleRebuild());
    } catch (e) {
      log(`[html-kit-daemon] watch failed for ${dir}: ${String(e)}`);
    }
  }
  return dirs.size;
}

// --- routes ---------------------------------------------------------------
function notFound(msg: string): Response {
  return new Response(msg, { status: 404, headers: { "content-type": "text/plain" } });
}

function serveStaticFile(absPath: string, contentType?: string): Response {
  if (!existsSync(absPath)) return notFound(`not found: ${absPath}`);
  const data = readFileSync(absPath);
  const ct = contentType || inferContentType(absPath);
  return new Response(data, { status: 200, headers: { "content-type": ct } });
}

function inferContentType(p: string): string {
  if (p.endsWith(".html")) return "text/html; charset=utf-8";
  if (p.endsWith(".css")) return "text/css; charset=utf-8";
  if (p.endsWith(".js") || p.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (p.endsWith(".json")) return "application/json; charset=utf-8";
  if (p.endsWith(".wasm")) return "application/wasm";
  if (p.endsWith(".pf_meta") || p.endsWith(".pf_index")) return "application/octet-stream";
  return "application/octet-stream";
}

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method;

  // index
  if ((method === "GET" || method === "HEAD") && pathname === "/") {
    if (!existsSync(INDEX_HTML)) {
      return new Response("index not built — run bun scripts/build-index.ts", { status: 404, headers: { "content-type": "text/plain" } });
    }
    return serveStaticFile(INDEX_HTML, "text/html; charset=utf-8");
  }

  // SSE
  if ((method === "GET" || method === "HEAD") && pathname === "/events") {
    const stream = new ReadableStream({
      start(controller) {
        const writer = {
          write(chunk: Uint8Array) { controller.enqueue(chunk); return Promise.resolve(); },
          close() { try { controller.close(); } catch {} return Promise.resolve(); },
        } as unknown as WritableStreamDefaultWriter<Uint8Array>;
        sseClients.add(writer);
        controller.enqueue(encoder.encode(`event: hello\ndata: ${Date.now()}\n\n`));
        const ka = setInterval(() => {
          try { controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`)); }
          catch { clearInterval(ka); sseClients.delete(writer); }
        }, 30000);
      },
    });
    return new Response(stream, {
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
      },
    });
  }

  // annotation-strip
  if ((method === "GET" || method === "HEAD") && pathname === "/annotation-strip.js") {
    return new Response(loadAnnotationStrip(), {
      status: 200,
      headers: { "content-type": "text/javascript; charset=utf-8" },
    });
  }

  // pagefind static
  if ((method === "GET" || method === "HEAD") && pathname.startsWith("/pagefind/")) {
    const rel = pathname.slice("/pagefind/".length);
    const abs = resolve(PAGEFIND_DIR, rel);
    if (!abs.startsWith(resolve(PAGEFIND_DIR) + sep) && abs !== resolve(PAGEFIND_DIR)) {
      return new Response("forbidden", { status: 403 });
    }
    return serveStaticFile(abs);
  }

  // /p/<slug>/  or  /p/<slug>/<file>.html
  if ((method === "GET" || method === "HEAD") && pathname.startsWith("/p/")) {
    const rest = pathname.slice("/p/".length);
    const slashIdx = rest.indexOf("/");
    const slug = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
    const tail = slashIdx === -1 ? "" : rest.slice(slashIdx + 1);

    if (tail === "" || tail === "") {
      // /p/<slug>/  → index w/ scope querystring
      if (!existsSync(INDEX_HTML)) {
        return new Response("index not built — run bun scripts/build-index.ts", { status: 404, headers: { "content-type": "text/plain" } });
      }
      let html = readFileSync(INDEX_HTML, "utf8");
      const scopeScript = `<script>window.__HTMLKIT_SCOPE__=${JSON.stringify(slug)};</script>\n`;
      if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, scopeScript + "</head>");
      else html = scopeScript + html;
      return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }

    const repos = loadRepos();
    // Build ordered list of candidate dirs for this slug.
    const candidates: string[] = [];
    if (repos[slug]) {
      candidates.push(repos[slug]);
      candidates.push(join(repos[slug], ".html-kit"));
    }
    const kitDir = join(KIT_HOME, slug);
    if (existsSync(kitDir)) candidates.push(kitDir);
    if (candidates.length === 0) return notFound(`unknown slug: ${slug}`);

    let abs = "";
    for (const c of candidates) {
      const try_ = resolve(c, tail);
      if (existsSync(try_)) { abs = try_; break; }
    }
    if (!abs) return notFound(`not found: ${tail}`);
    if (!isSafePath(abs, repos)) {
      return new Response("forbidden", { status: 403, headers: { "content-type": "text/plain" } });
    }
    if (!existsSync(abs)) return notFound(`not found: ${tail}`);
    const raw = readFileSync(abs, "utf8");
    const injected = injectOverlay(raw);
    return new Response(injected, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // POST /api/annotate?path=<artifact-path>
  if (method === "POST" && pathname === "/api/annotate") {
    const artifactPath = url.searchParams.get("path");
    if (!artifactPath) return new Response("missing path", { status: 400 });
    const repos = loadRepos();
    const abs = resolve(artifactPath);
    if (!isSafePath(abs, repos)) return new Response("forbidden", { status: 403 });
    const annPath = abs + ".annotations.jsonl";
    const body = await req.text();
    let record: unknown;
    try { record = JSON.parse(body); } catch { return new Response("invalid json", { status: 400 }); }
    appendFileSync(annPath, JSON.stringify(record) + "\n");
    const cursor = statSync(annPath).size;
    return new Response(JSON.stringify({ ok: true, cursor }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  // GET /api/annotations/<artifact-path>?since=<cursor>
  if ((method === "GET" || method === "HEAD") && pathname.startsWith("/api/annotations/")) {
    const artifactPath = decodeURIComponent(pathname.slice("/api/annotations/".length));
    const repos = loadRepos();
    const abs = resolve(artifactPath);
    if (!isSafePath(abs, repos)) return new Response("forbidden", { status: 403 });
    const annPath = abs + ".annotations.jsonl";
    if (!existsSync(annPath)) {
      return new Response(JSON.stringify({ records: [], cursor: 0 }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }
    const since = parseInt(url.searchParams.get("since") || "0", 10) || 0;
    const fileSize = statSync(annPath).size;
    let text = "";
    if (since < fileSize) {
      const fd = openSync(annPath, "r");
      try {
        const buf = Buffer.alloc(fileSize - since);
        readSync(fd, buf, 0, buf.length, since);
        text = buf.toString("utf8");
      } finally { closeSync(fd); }
    }
    const records: unknown[] = [];
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try { records.push(JSON.parse(line)); } catch { /* skip malformed */ }
    }
    return new Response(JSON.stringify({ records, cursor: fileSize }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  // POST /api/repos
  if (method === "POST" && pathname === "/api/repos") {
    const body = await req.text();
    let parsed: { slug?: string; dir?: string };
    try { parsed = JSON.parse(body); } catch { return new Response("invalid json", { status: 400 }); }
    if (!parsed.slug || !parsed.dir) return new Response("missing slug or dir", { status: 400 });
    const repos = loadRepos();
    repos[parsed.slug] = resolve(parsed.dir);
    saveRepos(repos);
    // re-arm watchers for the new dir
    try { if (existsSync(parsed.dir)) watch(parsed.dir, { recursive: true }, () => scheduleRebuild()); } catch {}
    return new Response(JSON.stringify({ ok: true, repos }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  // GET /api/repos
  if ((method === "GET" || method === "HEAD") && pathname === "/api/repos") {
    return new Response(JSON.stringify(loadRepos()), {
      status: 200, headers: { "content-type": "application/json" },
    });
  }

  return notFound(`no route: ${method} ${pathname}`);
}

// --- main -----------------------------------------------------------------
async function main() {
  acquireLock();

  const cleanup = () => { releaseLock(); process.exit(0); };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", releaseLock);

  const repos = loadRepos();
  const watchedCount = setupWatchers(repos);

  Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);
      try {
        const res = await handle(req);
        logReq(req.method, url.pathname, res.status);
        return res;
      } catch (e) {
        process.stderr.write(`[html-kit-daemon] error ${url.pathname}: ${String(e)}\n`);
        logReq(req.method, url.pathname, 500);
        return new Response("internal error", { status: 500 });
      }
    },
  });

  log(`[html-kit-daemon] listening on http://localhost:${PORT}`);
  log(`[html-kit-daemon] watching ${watchedCount} dirs`);
  log(`[html-kit-daemon] pid=${process.pid}`);
}

main().catch(e => { process.stderr.write(String(e) + "\n"); releaseLock(); process.exit(1); });
