import { test, expect } from "@playwright/test";
import { unlinkSync, existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// We exercise the annotation API against a real registered artifact path.
// Each test cleans up its own .annotations.jsonl after running so runs are
// isolated and don't leak state into the user's repo.

const ARTIFACT = join(
  homedir(),
  "code/my-app/.html-kit/02_fusion-explainer-and-fit.html",
);
const ANN_FILE = ARTIFACT + ".annotations.jsonl";

function cleanup() {
  try { if (existsSync(ANN_FILE)) unlinkSync(ANN_FILE); } catch { /* ignore */ }
}

test.describe.serial("annotation API", () => {
  test.beforeEach(cleanup);
  test.afterAll(cleanup);

  test("/annotation-strip.js is served and references data-component", async ({ request }) => {
    const r = await request.get("/annotation-strip.js");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("javascript");
    const body = await r.text();
    expect(body.length).toBeGreaterThan(100);
    expect(body).toContain("data-component");
  });

  test("artifact pages get the annotation-strip script injected", async ({ request }) => {
    const r = await request.get("/my-app/02_fusion-explainer-and-fit.html");
    expect(r.status()).toBe(200);
    const html = await r.text();
    expect(html).toMatch(/<script[^>]+annotation-strip\.js[^>]*>/);
  });

  test("POST /api/annotate appends a record and returns cursor", async ({ request }) => {
    const record = { type: "highlight", selector: "[data-component=verdict]", note: "spec-A", ts: 111 };
    const r = await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: record,
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body).toMatchObject({ ok: true, cursor: expect.any(Number) });
    expect(body.cursor).toBeGreaterThan(0);

    expect(existsSync(ANN_FILE)).toBe(true);
    const lines = readFileSync(ANN_FILE, "utf8").trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject(record);
  });

  test("GET /api/annotations returns appended records", async ({ request }) => {
    await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: { type: "comment", selector: "h2", note: "first", ts: 1 },
      headers: { "content-type": "application/json" },
    });
    await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: { type: "comment", selector: "h2", note: "second", ts: 2 },
      headers: { "content-type": "application/json" },
    });

    const r = await request.get(`/api/annotations/${encodeURIComponent(ARTIFACT)}`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.records).toHaveLength(2);
    expect(body.records[0]).toMatchObject({ note: "first" });
    expect(body.records[1]).toMatchObject({ note: "second" });
    expect(body.cursor).toBeGreaterThan(0);
  });

  test("GET ?since=<cursor> filters records past the cursor", async ({ request }) => {
    const first = await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: { note: "before-cursor", ts: 1 },
      headers: { "content-type": "application/json" },
    });
    const firstBody = await first.json();
    const cursorAfterFirst = firstBody.cursor as number;

    await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: { note: "after-cursor", ts: 2 },
      headers: { "content-type": "application/json" },
    });

    const r = await request.get(
      `/api/annotations/${encodeURIComponent(ARTIFACT)}?since=${cursorAfterFirst}`,
    );
    const body = await r.json();
    expect(body.records).toHaveLength(1);
    expect(body.records[0]).toMatchObject({ note: "after-cursor" });
  });

  test("GET on unannotated artifact returns empty records", async ({ request }) => {
    const r = await request.get(`/api/annotations/${encodeURIComponent(ARTIFACT)}`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body).toEqual({ records: [], cursor: 0 });
  });

  test("POST with invalid JSON returns 400", async ({ request }) => {
    // Pass raw bytes so playwright doesn't re-serialize the string as valid JSON
    const r = await request.post(`/api/annotate?path=${encodeURIComponent(ARTIFACT)}`, {
      data: Buffer.from("{not json"),
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });

  test("POST without path query param returns 400", async ({ request }) => {
    const r = await request.post(`/api/annotate`, {
      data: { note: "x" },
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });

  test("POST against a path outside registered repos returns 403", async ({ request }) => {
    const evilPath = "/etc/passwd";
    const r = await request.post(`/api/annotate?path=${encodeURIComponent(evilPath)}`, {
      data: { note: "escape attempt" },
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(403);
  });
});
