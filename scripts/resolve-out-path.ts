#!/usr/bin/env bun
// Resolves the output path for a new html-kit render given a topic slug.
// Prints the absolute path to stdout; all errors and prompts go to stderr.

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, openSync, readSync, closeSync } from "fs";
import { join, dirname } from "path";

const slug = process.argv[2];
if (!slug) {
  process.stderr.write("Usage: bun scripts/resolve-out-path.ts <topic-slug>\n");
  process.exit(1);
}

function findGitRoot(start: string): string | null {
  let dir = start;
  while (true) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function nextNumber(dir: string): Promise<string> {
  const proc = Bun.spawn(["bun", join(import.meta.dir, "next-number.ts"), dir], {
    stdout: "pipe",
    stderr: "inherit",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return out.trim();
}

async function main() {
  const gitRoot = findGitRoot(process.cwd());

  if (gitRoot) {
    const kitDir = join(gitRoot, ".html-kit");
    mkdirSync(kitDir, { recursive: true });

    const configPath = join(kitDir, ".config.json");
    if (!existsSync(configPath)) {
      let addToGitignore = false;
      try {
        process.stderr.write("Add .html-kit/ to .gitignore? [y/N] ");
        const buf = Buffer.alloc(4);
        const fd = openSync("/dev/tty", "r");
        readSync(fd, buf, 0, buf.length, null);
        closeSync(fd);
        const answer = buf.toString().trim().toLowerCase();
        addToGitignore = answer === "y" || answer === "yes";
      } catch {
        // Non-TTY context (CI, piped input, sub-agent) — default to false, write config silently.
        addToGitignore = false;
      }
      writeFileSync(configPath, JSON.stringify({ addToGitignore }, null, 2) + "\n");
      if (addToGitignore) {
        const gitignorePath = join(gitRoot, ".gitignore");
        const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
        if (!existing.split("\n").some(l => l.trim() === ".html-kit/")) {
          appendFileSync(gitignorePath, (existing.endsWith("\n") || existing === "" ? "" : "\n") + ".html-kit/\n");
        }
      }
    }

    const nn = await nextNumber(kitDir);
    process.stdout.write(join(kitDir, `${nn}_${slug}.html`) + "\n");
  } else {
    const projectSlug = process.cwd().replace(/\//g, "-").replace(/^-/, "");
    const outDir = join(process.env.HOME!, ".html-kit", projectSlug);
    mkdirSync(outDir, { recursive: true });
    const nn = await nextNumber(outDir);
    process.stdout.write(join(outDir, `${nn}_${slug}.html`) + "\n");
  }
}

main().catch(e => { process.stderr.write(String(e) + "\n"); process.exit(1); });
