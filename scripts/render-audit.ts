#!/usr/bin/env bun
// Audits a rendered html-kit HTML file for required palette tokens and structural rules.
// Exits 0 on pass, 1 on failure; prints [OK], [FAIL], or [WARN] prefixed lines.

import { readFileSync } from "fs";

const htmlPath = process.argv[2];
if (!htmlPath) {
  process.stderr.write("Usage: bun scripts/render-audit.ts <html-path>\n");
  process.exit(1);
}

let content: string;
try {
  content = readFileSync(htmlPath, "utf8");
} catch (e) {
  process.stderr.write(`Cannot read file: ${htmlPath}\n`);
  process.exit(1);
}

let failed = false;

// Check 1: at least one palette token in a :root block
const rootBlockMatch = content.match(/:root\s*\{([^}]*)\}/s);
const rootBlock = rootBlockMatch ? rootBlockMatch[1] : "";
const hasPaletteToken = /--clay|--ivory|--slate/.test(rootBlock);
if (hasPaletteToken) {
  console.log("[OK] palette token (--clay / --ivory / --slate) found in :root block");
} else {
  console.log("[FAIL] no --clay / --ivory / --slate token in :root block — run inject-palette.ts");
  failed = true;
}

// Check 2: forbidden <div class="tree" — must be <pre class="tree">
if (/<div\s[^>]*class="[^"]*\btree\b/.test(content)) {
  console.log('[FAIL] found <div class="tree"> — must use <pre class="tree"> instead');
  failed = true;
} else {
  console.log('[OK] no forbidden <div class="tree"> usage');
}

// Check 3: at least one data-component attribute (warn only)
if (/data-component="[^"]+"/.test(content)) {
  console.log('[OK] data-component attribute found on wrapper element');
} else {
  console.log('[WARN] no data-component="..." attribute found — consider adding to top-level wrapper');
}

process.exit(failed ? 1 : 0);
