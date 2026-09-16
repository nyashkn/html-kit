// Shared test fixture: an in-repo, committed artifact (tracked in git, see
// .gitignore's `!.html-kit/01_v0.3.0-before-after-eval.html` exception) so
// tests never depend on a personal homedir path or another private repo.
// Registered with the daemon under a dedicated slug (tests/global-setup.ts)
// that won't collide with the user's real repo registrations.
import { resolve } from "node:path";

// `bun run test` / CI's `bun run test` both run with cwd = the package.json
// directory (repo root) — avoids import.meta ESM/CJS interop issues Bun hits
// under Playwright's test-file transform.
export const REPO_ROOT = resolve(process.cwd());
export const FIXTURE_SLUG = "html-kit-ci-fixture";
export const FIXTURE_FILE = "01_v0.3.0-before-after-eval.html";
export const FIXTURE_ARTIFACT_PATH = resolve(REPO_ROOT, ".html-kit", FIXTURE_FILE);
