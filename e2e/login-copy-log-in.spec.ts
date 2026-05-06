/**
 * S1 (smoke-test-2026-05-06 WARN-1) — login page uses "Log in" copy, not "Sign in"
 *
 * Brand lock: register page and landing use "Log in →"; login page must match.
 * Verifies three user-visible strings:
 *   1. Page <title> contains "Log in — tadaify"
 *   2. Meta description contains "Log in to your tadaify account"
 *   3. Visible paragraph on page contains "Log in to your tadaify account."
 *
 * Also regression-locks that "Sign in" does NOT appear as visible text
 * (allows DOM attribute values that are never surfaced to users to be excluded
 * via the locator strategy — we check getByText which only finds visible copy).
 *
 * Story: smoke-test-fixes-2026-05-06 (WARN-1)
 * Covers: feedback_brand_lock_sweep_all_renderings.md
 *
 * Prerequisites:
 *   - `npm run dev` (App: http://localhost:5173)
 *   No auth required — /login is a public route.
 *
 * Run: npx playwright test e2e/login-copy-log-in.spec.ts
 */

import { test, expect } from "@playwright/test";

test.describe("S1 — /login page uses 'Log in' brand copy", () => {
  test("page title contains 'Log in — tadaify'", async ({ page }) => {
    // Covers: feedback_brand_lock_sweep_all_renderings.md
    await page.goto("/login");
    await expect(page).toHaveTitle(/Log in — tadaify/);
  });

  test("visible paragraph reads 'Log in to your tadaify account.'", async ({ page }) => {
    // Covers: WARN-1 fix — login.tsx line ~301 was "Sign in to your tadaify account."
    await page.goto("/login");
    await expect(page.getByText("Log in to your tadaify account.")).toBeVisible();
  });

  test("does NOT show 'Sign in to your tadaify account.' as visible text", async ({ page }) => {
    // Regression-lock: the old copy must be gone
    await page.goto("/login");
    await expect(page.getByText("Sign in to your tadaify account.")).not.toBeVisible();
  });
});
