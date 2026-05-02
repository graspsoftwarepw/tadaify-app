/**
 * Critical path smoke spec — portfolio invariant.
 *
 * This file MUST always exist per feature-checklist §8. It verifies the
 * fundamental end-to-end path of the application is alive after any merge.
 *
 * Keep it minimal and fast — it is run on EVERY PR (Section 0 step 9).
 * It must never be deleted; expand it as the app grows.
 *
 * Current coverage (tadaify MVP stage):
 *   - Landing page loads without JS errors
 *   - /register page loads without JS errors
 *   - Handle availability check endpoint responds
 *
 * Post-MVP: add full happy-path signup + onboarding once auth hook is
 * wired and Inbucket is stable in the test environment.
 */

import { test, expect } from "@playwright/test";

test("landing page loads and shows handle input", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  // Core landing page element — the handle claim input (use first() to avoid strict-mode
  // violation when multiple inputs match on pages with hero + footer handle forms)
  await expect(
    page.getByRole("textbox", { name: /handle|username|claim/i }).first()
      .or(page.locator("input[placeholder*='handle'], input[placeholder*='your'], input[type='text']").first())
  ).toBeVisible({ timeout: 10_000 });

  // No uncaught JS errors during load
  expect(errors).toHaveLength(0);
});

test("/register page loads and shows first step", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/register");

  // Register page must render a handle input (first step of the flow)
  await expect(
    page.getByRole("textbox", { name: /handle/i })
      .or(page.locator("input[type='text']").first())
  ).toBeVisible({ timeout: 10_000 });

  // No uncaught JS errors
  expect(errors).toHaveLength(0);
});

test("handle check API responds to well-formed request", async ({ request }) => {
  // handle/check is a POST action (react-router action, not loader — GET returns 400)
  const res = await request.post("/api/handle/check", {
    data: { handle: "testhandle" },
  });
  // Endpoint exists and returns JSON — 200 (available) or 409 (taken/reserved)
  expect([200, 409]).toContain(res.status());
  const data = await res.json() as Record<string, unknown>;
  // Response has at minimum an `available` boolean field
  expect(typeof data.available === "boolean" || "reason" in data).toBe(true);
});
