// Playwright globalSetup: register this repo's fixture artifacts with the
// already-running daemon (see playwright.config.ts — no webServer block,
// CI/local both start the daemon out-of-band) so annotation + routing tests
// have a real, in-repo artifact to target instead of a personal homedir path.
//
// POST /api/repos is additive (repos[slug] = dir, then persists the whole
// map) so this never touches the user's other registrations, and posting
// the same slug/dir again is a no-op — safe to run on every local run too.
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { FIXTURE_SLUG, REPO_ROOT } from "./fixture";

const DAEMON_URL = "http://localhost:63839";
const INDEX_HTML = join(homedir(), ".html-kit", "_daemon", "index.html");

export default async function globalSetup() {
  const res = await fetch(`${DAEMON_URL}/api/repos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug: FIXTURE_SLUG, dir: REPO_ROOT }),
  }).catch((e) => {
    throw new Error(
      `html-kit daemon unreachable on :63839 — start it first ` +
        `(bun scripts/html-kit-daemon.ts). ${e}`,
    );
  });
  if (!res.ok) throw new Error(`POST /api/repos failed: ${res.status}`);

  // Bootstrap the search index only when none exists yet (fresh ~/.html-kit,
  // e.g. a CI runner). Local dev already has one the daemon keeps fresh via
  // file watchers — skip so every test run doesn't pay for a full rebuild.
  if (!existsSync(INDEX_HTML)) {
    const build = spawnSync("bun", ["scripts/build-index.ts"], {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    if (build.status !== 0 && process.env.CI) {
      throw new Error("[global-setup] index build failed in CI");
    }
    if (build.status !== 0) {
      // If build-index.ts can't produce an index (e.g. a render template it
      // needs isn't available on this checkout), don't fail the whole suite:
      // tests that need a built index self-skip via HTML_KIT_INDEX_READY
      // below instead.
      console.error(
        "[global-setup] index build failed (see above) — dashboard tests " +
          "that require a built index.html will be skipped.",
      );
    }
  }

  process.env.HTML_KIT_INDEX_READY = existsSync(INDEX_HTML) ? "1" : "0";
}
