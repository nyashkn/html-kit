import { test, expect } from "@playwright/test";

test.describe.serial("html-kit dashboard", () => {
  test("loads index with toolbar + rescan + search buttons", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "All artifacts", level: 1 })).toBeVisible();
    await expect(page.locator("button.rescan")).toBeVisible();
    await expect(page.locator('button.primary[data-component="search-launch"]')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("rescan button hits /api/discover and shows toast", async ({ page }) => {
    await page.goto("/");

    const discoverResp = page.waitForResponse(
      (r) => r.url().endsWith("/api/discover") && r.request().method() === "POST",
    );
    await page.locator("button.rescan").click();
    const resp = await discoverResp;
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(body).toMatchObject({
      scanned: expect.any(Number),
      added: expect.any(Array),
      existing: expect.any(Number),
      durationMs: expect.any(Number),
    });

    // Toast renders. When added=0, title is "Up to date" with 4s ttl.
    const toast = page.locator(".toast-stack .toast").first();
    await expect(toast).toBeVisible();
    await expect(toast.locator(".t-title")).toHaveText(/Up to date|new repo/);
    await expect(toast).toHaveClass(/show/);
    if (body.added.length === 0) {
      await expect(toast.locator(".t-title")).toHaveText("Up to date");
      await expect(toast.locator(".t-body")).toContainText(`Scanned`);
    }
  });

  test("rescan button resets to idle after no-op scan", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button.rescan");
    await btn.click();
    // Wait for the network roundtrip to complete; button re-enables when added=0.
    await page.waitForResponse((r) => r.url().endsWith("/api/discover"));
    await expect(btn).toBeEnabled({ timeout: 3_000 });
    await expect(btn).toHaveText(/Rescan/);
  });

  test("Meta+K opens pagefind search modal", async ({ page }) => {
    await page.goto("/");
    // Pagefind binds Cmd+K on macOS, Ctrl+K on Linux/Windows. Playwright's
    // headless chromium reports as Linux regardless of host OS, so try Ctrl
    // first then Meta. We accept either as a pass.
    await page.locator("body").focus();
    await page.keyboard.press("Control+K");
    const searchbox = page.getByRole("searchbox", { name: "Search this site" });
    try {
      await expect(searchbox).toBeVisible({ timeout: 1500 });
    } catch {
      await page.keyboard.press("Meta+K");
      await expect(searchbox).toBeVisible({ timeout: 1500 });
    }
  });

  test("search button opens pagefind search modal", async ({ page }) => {
    await page.goto("/");
    await page.locator('button.primary[data-component="search-launch"]').click();
    const searchbox = page.getByRole("searchbox", { name: "Search this site" });
    await expect(searchbox).toBeVisible();
  });

  test("typing a query returns results and clicking one navigates to a valid artifact", async ({ page }) => {
    await page.goto("/");
    await page.locator('button.primary[data-component="search-launch"]').click();
    const searchbox = page.getByRole("searchbox", { name: "Search this site" });
    await expect(searchbox).toBeVisible();
    await searchbox.fill("fusion");

    // Scope to links inside the pagefind dialog so we don't match dashboard
    // index rows behind the modal.
    const dialog = page.getByRole("dialog");
    const firstResult = dialog.getByRole("link").first();
    await expect(firstResult).toBeVisible({ timeout: 4_000 });

    const href = await firstResult.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/^\/[^/]+\/[^/]+\.html(#.+)?$/);

    await firstResult.click();
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain(href!.split("#")[0]);
    await expect(page).toHaveTitle(/.+/);
  });
});

test.describe("routing", () => {
  test("flat URL serves artifact", async ({ request }) => {
    const r = await request.get("/audit-redesign/04_checker-verifier-architecture.html");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("text/html");
  });

  test("legacy /p/ URL 301-redirects to flat form", async ({ request }) => {
    const r = await request.get("/p/audit-redesign/04_checker-verifier-architecture.html", {
      maxRedirects: 0,
    });
    expect(r.status()).toBe(301);
    expect(r.headers()["location"]).toBe("/audit-redesign/04_checker-verifier-architecture.html");
  });

  test("legacy /p/ URL followed lands on flat 200", async ({ request }) => {
    const r = await request.get("/p/my-app/02_fusion-explainer-and-fit.html");
    expect(r.status()).toBe(200);
    expect(r.url()).toContain("/my-app/02_fusion-explainer-and-fit.html");
    expect(r.url()).not.toContain("/p/");
  });

  test("unknown slug returns 404", async ({ request }) => {
    const r = await request.get("/no-such-slug-exists/foo.html");
    expect(r.status()).toBe(404);
  });

  test("reserved /api/repos still served as JSON", async ({ request }) => {
    const r = await request.get("/api/repos");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("application/json");
    const body = await r.json();
    expect(typeof body).toBe("object");
  });

  test("/api/discover POST returns DiscoverResult shape", async ({ request }) => {
    const r = await request.post("/api/discover");
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body).toMatchObject({
      added: expect.any(Array),
      existing: expect.any(Number),
      scanned: expect.any(Number),
      durationMs: expect.any(Number),
      scanRoots: expect.any(Array),
    });
  });

  test("scoped index /<slug>/ returns 200 with scope script", async ({ request }) => {
    const r = await request.get("/my-app/");
    expect(r.status()).toBe(200);
    const html = await r.text();
    expect(html).toContain("__HTMLKIT_SCOPE__");
    expect(html).toContain('"my-app"');
  });
});
