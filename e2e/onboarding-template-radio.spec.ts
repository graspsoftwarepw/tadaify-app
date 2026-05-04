/**
 * S2 — Bug #5 regression: multi-select template radio (broken state management)
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-004 / ECN-136-07 / DEC-297=B
 *
 * Before fix:
 *   - defaultChecked (uncontrolled) + stale React state → both Chopin and Custom
 *     appeared visually selected simultaneously.
 *   - CTA text stayed "Continue with Chopin →" regardless of which card was clicked.
 *
 * After fix:
 *   - Radio selection is controlled via URL ?tpl= param + setSearchParams.
 *   - Exactly ONE card is highlighted at any time.
 *   - CTA text updates to match selected template.
 *
 * Run: npx playwright test e2e/onboarding-template-radio.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// S2 — exactly one card selected at a time, CTA text updates, URL updates
// Covers: Bug #5 (tadaify-app#188)
// ---------------------------------------------------------------------------

test("S2 — template radio: exactly one card selected at a time, CTA and URL update (Bug #5)", async ({
  page,
}) => {
  const handle = "t188s2";

  await page.goto(`/onboarding/template?handle=${handle}&name=Test&platforms=instagram&socials=%7B%7D&bio=&av=`);

  // Wait for template cards to appear
  await expect(page.locator("input[name='tpl'][value='chopin']")).toBeVisible({
    timeout: 10_000,
  });

  // Default selection: chopin should be checked (it's the default in URL-derived state)
  // The component defaults to "chopin" when no ?tpl= is provided
  const chopinRadio = page.locator("input[name='tpl'][value='chopin']");
  const customRadio = page.locator("input[name='tpl'][value='custom']");
  const neonRadio = page.locator("input[name='tpl'][value='neon']");

  // Initial state — chopin is default (no ?tpl= in URL, component defaults to "chopin")
  await expect(chopinRadio).toBeChecked();
  await expect(customRadio).not.toBeChecked();

  // CTA text should mention "Chopin"
  const submitBtn = page.locator("button[type='submit']");
  await expect(submitBtn).toContainText(/Chopin/i);

  // --- Click Custom ---
  await customRadio.click();

  // After click: only Custom should be checked
  await expect(customRadio).toBeChecked({ timeout: 5_000 });
  await expect(chopinRadio).not.toBeChecked();

  // URL should update to ?tpl=custom
  await expect(page).toHaveURL(/tpl=custom/, { timeout: 5_000 });

  // CTA text updates to "Custom"
  await expect(submitBtn).toContainText(/Custom/i);

  // --- Click Neon ---
  await neonRadio.click();

  // After click: only Neon should be checked
  await expect(neonRadio).toBeChecked({ timeout: 5_000 });
  await expect(customRadio).not.toBeChecked();
  await expect(chopinRadio).not.toBeChecked();

  // URL updates to ?tpl=neon
  await expect(page).toHaveURL(/tpl=neon/, { timeout: 5_000 });

  // CTA text updates to "Neon"
  await expect(submitBtn).toContainText(/Neon/i);

  // --- Count selected cards (regression: bug had TWO selected simultaneously) ---
  const allRadios = page.locator("input[name='tpl']");
  const count = await allRadios.count();
  let checkedCount = 0;
  for (let i = 0; i < count; i++) {
    if (await allRadios.nth(i).isChecked()) checkedCount++;
  }
  expect(checkedCount).toBe(1);
});
