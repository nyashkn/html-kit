#!/usr/bin/env bun
// Health check for the html-kit daemon (scripts/html-kit-daemon.ts), used by
// skills so they don't need a raw `curl` permission prompt. GET / always
// resolves (200 w/ index.html, or 404 "index not built") when the daemon is
// up; only a connection failure means it's down.
// Prints "up <url>" or "down" to stdout. Always exits 0 — callers should
// never block on daemon availability, it's an optional accelerator.

const DAEMON = "http://localhost:63839";

async function main() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 1000);
  try {
    await fetch(DAEMON + "/", { signal: ctrl.signal });
    process.stdout.write(`up ${DAEMON}\n`);
  } catch {
    process.stdout.write("down\n");
  } finally {
    clearTimeout(timer);
  }
}

main();
