/**
 * S4 — Bugs #4b + #6d regression: "coming in a future update" leak
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-004 / BR-ONBOARDING-005
 *
 * Before fix:
 *   - Step 4 (template) had a right pane: "Live preview · Coming in a future update."
 *   - Step 5 (tier) had a right pane with the same deferred-feature copy.
 *
 * After fix:
 *   - Neither Step 4 nor Step 5 contains the "coming in a future update" copy.
 *   - Deferred-feature markers must NEVER appear in user-facing flows.
 *
 * Run: npx playwright test e2e/onboarding-no-coming-soon-leaks.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// S4 — no "coming in a future update" on Step 4 (Bug #4b) or Step 5 (Bug #6d)
// ---------------------------------------------------------------------------

test("S4 — Step 4 (template): no 'coming in a future update' in page body (Bug #4b)", async ({
  page,
}) => {
  const handle = "t188s4a";

  await page.goto(
    `/onboarding/template?handle=${handle}&name=S4Test&platforms=instagram&socials=%7B%7D&bio=&av=`
  );

  // Wait for template cards to load
  await expect(page.locator("input[name='tpl'][value='chopin']")).toBeVisible({
    timeout: 10_000,
  });

  // No "coming in a future update" copy anywhere in the body
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.toLowerCase()).not.toContain("coming in a future update");
  expect(bodyText.toLowerCase()).not.toContain("live preview");
});

test("S4 — Step 5 (tier): no 'coming in a future update' in page body (Bug #6d)", async ({
  page,
}) => {
  const handle = "t188s4b";

  await page.goto(
    `/onboarding/tier?handle=${handle}&name=S4Test&tpl=chopin&platforms=instagram&socials=%7B%7D&bio=&av=`
  );

  // Wait for tier grid to load
  await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

  // No "coming in a future update" copy anywhere in the body
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.toLowerCase()).not.toContain("coming in a future update");
  expect(bodyText.toLowerCase()).not.toContain("live preview");
});
