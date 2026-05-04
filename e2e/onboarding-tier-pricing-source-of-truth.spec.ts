/**
 * S7 — Bug #6b regression: dual pricing source of truth on tier page
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-005 / DEC-279 / DEC-287 / DEC-311=A
 *
 * Before fix:
 *   - onboarding.tier.tsx hard-coded "$9" as Creator price.
 *   - app/lib/tier-gate.ts exports CREATOR_PRICE_MONTHLY = "$7.99".
 *   - Two files, two prices — violated DEC-279/287 single-source contract.
 *
 * After fix:
 *   - Tier page imports CREATOR_PRICE_MONTHLY from tier-gate.ts.
 *   - "$7.99" (or whatever the constant is at run-time) is displayed for Creator.
 *   - "$9" does NOT appear anywhere on the page.
 *
 * Run: npx playwright test e2e/onboarding-tier-pricing-source-of-truth.spec.ts
 */

import { test, expect } from "@playwright/test";

// The canonical Creator price per DEC-279/287
// This is what CREATOR_PRICE_MONTHLY exports at compile-time.
// If the constant ever changes, update here too (single source of truth).
const CANONICAL_CREATOR_PRICE = "$7.99";

// ---------------------------------------------------------------------------
// S7 — tier page shows $7.99 for Creator, NOT $9 (Bug #6b)
// ---------------------------------------------------------------------------

test("S7 — tier pricing: Creator shows $7.99 (CREATOR_PRICE_MONTHLY), $9 absent (Bug #6b)", async ({
  page,
}) => {
  const handle = "t188s7";

  await page.goto(
    `/onboarding/tier?handle=${handle}&name=S7Test&tpl=chopin&platforms=instagram&socials=%7B%7D&bio=&av=`
  );

  // Wait for the tier comparison grid
  await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

  // Canonical Creator price MUST appear on the page
  await expect(page.getByText(CANONICAL_CREATOR_PRICE)).toBeVisible({ timeout: 5_000 });

  // "$9" must NOT appear as a price anywhere in the body
  const bodyText = await page.locator("body").innerText();

  // "$9" must not appear — bug was it showed "$9" for Creator
  // We allow "$9" only if it's part of "$9X" pricing (like $99) — use word-boundary style check
  const dollarNineOccurrences = [...bodyText.matchAll(/\$9(?!\d)/g)];
  expect(dollarNineOccurrences.length).toBe(0);

  // Pro ($19) and Business ($49) may appear — verify they're visible
  await expect(page.getByText("$19")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText("$49")).toBeVisible({ timeout: 5_000 });

  // Creator tier card must be present (by plan name)
  await expect(page.getByText(/^Creator$/i)).toBeVisible({ timeout: 5_000 });
});
