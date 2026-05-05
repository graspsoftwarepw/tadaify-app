/**
 * S3 — Bug #6a regression: tier page had no CTA (dead-lock)
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-005 / DEC-311=A
 *
 * Before fix:
 *   - /onboarding/tier rendered 4 tier cards + footnote but NO Continue button.
 *   - User could not finish onboarding — dead-lock. Only escape was manual URL navigation.
 *
 * After fix:
 *   - "Take me to my page →" button is visible and clickable.
 *   - Clicking it navigates to /onboarding/complete with tier=free.
 *   - Back button linking to /onboarding/template is also present.
 *
 * Run: npx playwright test e2e/onboarding-tier-completion.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// S3 — tier CTA is visible and functional (Bug #6a)
// Covers: Bug #6a (tadaify-app#188)
// ---------------------------------------------------------------------------

test("S3 — tier CTA 'Take me to my page →' is visible and clickable, Back link present (Bug #6a)", async ({
  page,
}) => {
  const handle = "t188s3";

  // Navigate directly to tier step with accumulated params
  await page.goto(
    `/onboarding/tier?handle=${handle}&name=S3Test&tpl=chopin&platforms=instagram&socials=%7B%7D&bio=&av=`
  );

  // Wait for tier comparison grid
  await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

  // Continue button MUST be visible (Bug #6a fix)
  const ctaBtn = page.locator("button[type='submit']");
  await expect(ctaBtn).toBeVisible({ timeout: 5_000 });
  await expect(ctaBtn).toContainText(/Take me to my page/i);
  await expect(ctaBtn).toBeEnabled();

  // Back button MUST be present, linking to /onboarding/template
  const backLink = page.getByRole("link", { name: /← back|back to template/i });
  await expect(backLink).toBeVisible({ timeout: 5_000 });
  const backHref = await backLink.getAttribute("href");
  expect(backHref).toMatch(/\/onboarding\/template/);

  // Click CTA → should navigate to /onboarding/complete with tier=free
  await ctaBtn.click();
  await expect(page).toHaveURL(/\/onboarding\/complete/, { timeout: 8_000 });

  const url = new URL(page.url());
  expect(url.searchParams.get("tier")).toBe("free");
});
