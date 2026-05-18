#!/usr/bin/env bun
// Reads tokens/anthropic-palette.css from the repo root and prints the :root { ... }
// block contents to stdout, ready for the rendering agent to paste into a template.

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";

function findRepoRoot(start: string): string | null {
  let dir = start;
  while (true) {
    if (existsSync(join(dir, "tokens", "anthropic-palette.css"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const repoRoot = findRepoRoot(import.meta.dir);
if (!repoRoot) {
  process.stderr.write("Cannot locate tokens/anthropic-palette.css relative to scripts/\n");
  process.exit(1);
}

const palettePath = join(repoRoot, "tokens", "anthropic-palette.css");
const css = readFileSync(palettePath, "utf8");

const match = css.match(/:root\s*\{([^}]*)\}/s);
if (!match) {
  process.stderr.write("No :root { } block found in anthropic-palette.css\n");
  process.exit(1);
}

process.stdout.write(`:root {\n${match[1].trimEnd()}\n}\n`);
