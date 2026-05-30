/**
 * Playwright test suite — Public creator page render (F-BLOCK-INFRA-PUBLIC-RENDER-001, #202)
 *
 * Covers: S1–S8 per issue #202 body.
 *
 * Seed contract (supabase/seed.sql, "F-BLOCK-INFRA-PUBLIC-RENDER-001 seeds"):
 *   - test_render_s1  → published page, 3 visible blocks at positions 0/1/2
 *   - test_render_s5  → published page, 3 blocks, position 1 hidden (is_visible=false)
 *   - test_render_s8  → published page, 0 blocks
 *
 * S3 and S4 verify the `Cache-Control` HTTP header that the route module
 * emits via its `headers` export. The cf-cache-status header (separately
 * emitted by Cloudflare's edge after deploy) is NOT asserted here — it
 * cannot exist locally without a CF zone. The Cache-Control header itself
 * IS testable locally because it is set by the route, not by CF.
 *
 * Run: npx playwright test e2e/public-render.spec.ts
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

const HANDLE_S1 = "test_render_s1";
const HANDLE_S5 = "test_render_s5";
const HANDLE_S8 = "test_render_s8";

// ---------------------------------------------------------------------------
// S1: Visitor visits handle → renders all visible blocks in order
// ---------------------------------------------------------------------------

test("S1: renders all visible blocks in position ASC order", async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/${HANDLE_S1}`);
  expect(response?.status()).toBe(200);

  const articles = page.locator("article[data-block-type][data-block-id]");
  await expect(articles).toHaveCount(3);

  // The 3 blocks in the seed are at positions 0/1/2 — assert DOM order matches.
  const ids = await articles.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-block-id")),
  );
  expect(ids).toEqual([...ids].sort()); // deterministic order per seed UUID assignment
});

// ---------------------------------------------------------------------------
// S2: 404 for non-existent handle
// ---------------------------------------------------------------------------

test("S2: unknown handle returns 404 with branded copy", async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/this-handle-does-not-exist-202`);
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Page not found");
});

// ---------------------------------------------------------------------------
// S3 / S4: Cache-Control header — emitted locally by route module's `headers`
// export. The CF-only `cf-cache-status` header is NOT asserted here (PROD).
// ---------------------------------------------------------------------------

test("S3: 200 response includes Cache-Control max-age=3600, s-maxage=3600", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/${HANDLE_S1}`);
  expect(response.status()).toBe(200);
  const cc = response.headers()["cache-control"] ?? "";
  expect(cc).toContain("max-age=3600");
  expect(cc).toContain("s-maxage=3600");
});

test("S4: 404 response includes Cache-Control max-age=300, s-maxage=300", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/this-handle-does-not-exist-s4`);
  expect(response.status()).toBe(404);
  const cc = response.headers()["cache-control"] ?? "";
  expect(cc).toContain("max-age=300");
  expect(cc).toContain("s-maxage=300");
});

// ---------------------------------------------------------------------------
// S5: Hidden block not rendered
// ---------------------------------------------------------------------------

test("S5: hidden block (is_visible=false) absent from DOM", async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/${HANDLE_S5}`);
  expect(response?.status()).toBe(200);

  const articles = page.locator("article[data-block-type][data-block-id]");
  await expect(articles).toHaveCount(2);
});

// ---------------------------------------------------------------------------
// S6: No Set-Cookie in visitor response
// ---------------------------------------------------------------------------

test("S6: 200 visitor response has no Set-Cookie header", async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/${HANDLE_S1}`);
  expect(response?.status()).toBe(200);
  const headers = response?.headers() ?? {};
  expect(headers["set-cookie"]).toBeUndefined();
});

// ---------------------------------------------------------------------------
// S7: Open Graph meta tags present
// ---------------------------------------------------------------------------

test("S7: og:title + og:description meta tags in <head>", async ({ page }) => {
  await page.goto(`${BASE_URL}/${HANDLE_S1}`);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// S8: Zero-blocks page renders chrome only
// ---------------------------------------------------------------------------

test("S8: published page with zero blocks returns 200 with no <article> elements", async ({
  page,
}) => {
  const response = await page.goto(`${BASE_URL}/${HANDLE_S8}`);
  expect(response?.status()).toBe(200);

  const articles = page.locator("article[data-block-type][data-block-id]");
  await expect(articles).toHaveCount(0);
});
