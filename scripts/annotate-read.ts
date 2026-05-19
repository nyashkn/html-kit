#!/usr/bin/env bun
// Agent-side helper to drain unread annotations for an artifact via the html-kit daemon.
// Prints JSONL records to stdout; persists cursor at <artifact-path>.annotations.cursor.
// Errors to stderr; exits 0 (non-blocking for agents) when daemon offline or no annotations.

import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DAEMON = "http://localhost:63839";

const artifact = process.argv[2];
if (!artifact) {
  process.stderr.write("Usage: bun scripts/annotate-read.ts <artifact-path>\n");
  process.exit(1);
}

async function main() {
  const abs = resolve(artifact);
  const annPath = abs + ".annotations.jsonl";
  const cursorPath = abs + ".annotations.cursor";

  if (!existsSync(annPath)) {
    // No annotations file yet — silent success.
    process.exit(0);
  }

  let cursor = 0;
  if (existsSync(cursorPath)) {
    const raw = readFileSync(cursorPath, "utf8").trim();
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) cursor = n;
  }

  const u = `${DAEMON}/api/annotations/${encodeURIComponent(abs)}?since=${cursor}`;
  let resp: Response;
  try {
    resp = await fetch(u);
  } catch (e) {
    const msg = String(e);
    if (msg.includes("ECONNREFUSED") || msg.includes("Unable to connect") || msg.includes("ConnectionRefused")) {
      process.stderr.write("daemon offline\n");
      process.exit(0);
    }
    process.stderr.write(`fetch error: ${msg}\n`);
    process.exit(0);
  }

  if (!resp.ok) {
    process.stderr.write(`daemon returned ${resp.status}\n`);
    process.exit(0);
  }

  const json = await resp.json() as { records: unknown[]; cursor: number };
  for (const rec of json.records) {
    process.stdout.write(JSON.stringify(rec) + "\n");
  }
  writeFileSync(cursorPath, String(json.cursor) + "\n");
}

main().catch(e => { process.stderr.write(String(e) + "\n"); process.exit(0); });
