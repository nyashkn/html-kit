import { defineConfig, devices } from "@playwright/test";

// Targets the html-kit daemon already running on :63839. Tests assume the
// daemon is up — run `bun scripts/html-kit-daemon.ts` (or rely on the
// background daemon) before `bunx playwright test`. No webServer block here
// because the daemon is singleton-locked and shouldn't be killed/respawned
// by the test runner.
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  timeout: 15_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:63839",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
