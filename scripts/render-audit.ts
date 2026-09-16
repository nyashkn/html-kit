#!/usr/bin/env bun
// Audits a rendered html-kit HTML file for required palette tokens and structural rules.
// Exits 0 on pass, 1 on failure; prints [OK], [FAIL], or [WARN] prefixed lines.
//
// External-asset checks scan a *stripped* copy of the HTML (pre/code bodies,
// HTML comments, and inline <script> bodies removed — <script> opening tags
// are kept so `<script src>` itself still gets checked, and <style> bodies
// are kept so CSS url()/@import checks still run) so that example markup
// shown as text, or JS string literals, don't false-positive. Inline
// <script type="module"> external `import ... from "https://..."` / dynamic
// `import("https://...")` is checked separately against the RAW script
// bodies, before stripping — that check has to see real script content.

import { readFileSync } from "fs";

export type AuditResult = { fails: string[]; warns: string[]; oks: string[] };

const EXTERNAL_RE = /^(?:https?:)?\/\//i;

function stripForExternalScan(content: string): string {
  let out = content;
  // HTML comments — entirely removed.
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  // <pre>...</pre> and <code>...</code> — entirely removed (example markup as text).
  out = out.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
  out = out.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, "");
  // inline <script>...</script> bodies dropped, tags kept (so <script src> still checked).
  out = out.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, "$1$2");
  return out;
}

function findExternalTagRefs(stripped: string): string[] {
  const out: string[] = [];
  const TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  const ATTR_RE = /\b(?:src|href|poster|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  for (const tagMatch of stripped.matchAll(TAG_RE)) {
    const tagName = tagMatch[1].toLowerCase();
    if (tagName === "a") continue; // <a href="https://..."> links are allowed
    const attrs = tagMatch[2];
    for (const am of attrs.matchAll(ATTR_RE)) {
      const val = am[1] ?? am[2] ?? am[3] ?? "";
      if (EXTERNAL_RE.test(val)) {
        out.push(tagMatch[0]);
        break; // one flag per tag
      }
    }
  }
  return out;
}

function findExternalCssRefs(stripped: string): string[] {
  const out: string[] = [];
  for (const m of stripped.matchAll(/@import\s+(?:url\(\s*)?["']?(?:https?:)?\/\/[^;"')]*/gi)) {
    out.push(m[0]);
  }
  // url(...) not already covered by an @import match above (avoid double-reporting
  // the same declaration twice).
  const importSpans = new Set(
    [...stripped.matchAll(/@import\s+(?:url\(\s*)?["']?(?:https?:)?\/\/[^;"')]*/gi)].map(m => m.index),
  );
  for (const m of stripped.matchAll(/url\(\s*["']?(?:https?:)?\/\/[^)]*\)?/gi)) {
    const overlapsImport = [...importSpans].some(
      idx => idx !== undefined && m.index !== undefined && Math.abs(idx - m.index) < 40,
    );
    if (!overlapsImport) out.push(m[0]);
  }
  return out;
}

function findExternalModuleImports(raw: string): string[] {
  const out: string[] = [];
  for (const sm of raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = sm[1];
    for (const im of body.matchAll(/\bfrom\s*["'](?:https?:)?\/\/[^"']*/gi)) out.push(im[0]);
    for (const im of body.matchAll(/\bimport\(\s*["'](?:https?:)?\/\/[^"']*/gi)) out.push(im[0]);
  }
  return out;
}

export function audit(content: string): AuditResult {
  const oks: string[] = [];
  const warns: string[] = [];
  const fails: string[] = [];

  // Check 1: palette token in :root block (any :root block — matchAll, not just first),
  // or custom palette declared.
  const hasCustomPaletteMeta =
    /(<meta\s+(?:[^>]*?\s+)?name=["']html-kit:palette["'](?:\s+[^>]*)?\s+content=["']custom["']|<meta\s+(?:[^>]*?\s+)?content=["']custom["'](?:\s+[^>]*)?\s+name=["']html-kit:palette["'])/.test(
      content,
    );
  const rootBlocks = [...content.matchAll(/:root\s*\{([^}]*)\}/gs)];
  const hasPaletteToken = rootBlocks.some(m => /--clay|--ivory|--slate/.test(m[1]));

  if (hasCustomPaletteMeta) {
    oks.push("[OK] custom palette declared — palette token check skipped");
  } else if (hasPaletteToken) {
    oks.push("[OK] palette token (--clay / --ivory / --slate) found in :root block");
  } else {
    fails.push("[FAIL] no --clay / --ivory / --slate token in :root block — run inject-palette.ts");
  }

  // Check 2: forbidden <div class="tree" — must be <pre class="tree">
  if (/<div\s[^>]*class="[^"]*\btree\b/.test(content)) {
    fails.push('[FAIL] found <div class="tree"> — must use <pre class="tree"> instead');
  } else {
    oks.push('[OK] no forbidden <div class="tree"> usage');
  }

  // Check 3: at least one data-component attribute (warn only)
  if (/data-component="[^"]+"/.test(content)) {
    oks.push('[OK] data-component attribute found on wrapper element');
  } else {
    warns.push('[WARN] no data-component="..." attribute found — consider adding to top-level wrapper');
  }

  // Check 4: external assets (self-containment check)
  const moduleImports = findExternalModuleImports(content); // must run BEFORE stripping
  const stripped = stripForExternalScan(content);
  const externalAssets = [
    ...new Set([...findExternalTagRefs(stripped), ...findExternalCssRefs(stripped), ...moduleImports]),
  ];

  if (externalAssets.length > 0) {
    const snippets = externalAssets.slice(0, 3).join(" | ");
    fails.push(`[FAIL] external asset: ${snippets} — inline it (artifact must be self-contained)`);
  } else {
    oks.push("[OK] no external assets detected");
  }

  return { fails, warns, oks };
}

if (import.meta.main) {
  const htmlPath = process.argv[2];
  if (!htmlPath) {
    process.stderr.write("Usage: bun scripts/render-audit.ts <html-path>\n");
    process.exit(1);
  }

  let content: string;
  try {
    content = readFileSync(htmlPath, "utf8");
  } catch {
    process.stderr.write(`Cannot read file: ${htmlPath}\n`);
    process.exit(1);
  }

  const { fails, warns, oks } = audit(content);
  for (const line of [...oks, ...warns, ...fails]) console.log(line);
  process.exit(fails.length > 0 ? 1 : 0);
}
