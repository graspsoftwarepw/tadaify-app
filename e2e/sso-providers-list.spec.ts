/**
 * Playwright spec — SSO provider list after Apple SSO removal (DEC-346=C).
 *
 * Covers acceptance criteria S1, S2, S3 from issue tadaify-app#183.
 *
 * Prerequisites:
 *   - `npm run dev` (App: http://localhost:5173)
 *   - No Supabase interaction needed — these are UI-only smoke checks.
 *
 * Run: npx playwright test e2e/sso-providers-list.spec.ts
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183 / DEC-346=C)
 * Covers: S1, S2, S3 per issue spec
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// S1 — /login: exactly 3 SSO provider buttons present, Apple absent
// ---------------------------------------------------------------------------

test("S1: /login — 2 OAuth buttons (Google, X) + email input — NO Apple button", async ({ page }) => {
  // Covers: BR-AUTH-05, DEC-346=C, DEC-308=C
  // /login layout: Google (ProviderBtn) + X (ProviderBtn) + inline email input.
  // Apple was previously the 3rd OAuth button — now permanently removed.
  await page.goto("/login");

  // Wait for the page to fully render
  await page.waitForLoadState("domcontentloaded");

  // OAuth provider buttons (Google + X)
  const googleBtn = page.getByRole("button", { name: /Continue with Google/i });
  const xBtn = page.getByRole("button", { name: /Continue with X/i });
  await expect(googleBtn).toBeVisible({ timeout: 8_000 });
  await expect(xBtn).toBeVisible({ timeout: 8_000 });

  // Email input is inline (not a ProviderBtn)
  const emailInput = page.locator("input[type='email']");
  await expect(emailInput).toBeVisible({ timeout: 8_000 });

  // Apple button must NOT be present anywhere on the page
  const appleBtn = page.getByRole("button", { name: /Continue with Apple/i });
  await expect(appleBtn).toHaveCount(0);

  // Count all "Continue with" OAuth buttons — must be exactly 2 (Google + X)
  const allProviderBtns = page.getByRole("button", { name: /^Continue with /i });
  await expect(allProviderBtns).toHaveCount(2);
});

// ---------------------------------------------------------------------------
// S2 — /register: exactly 3 SSO provider buttons present, Apple absent
// ---------------------------------------------------------------------------

test("S2: /register — 3 SSO buttons visible (Google, X, Email) — NO Apple", async ({ page }) => {
  // Covers: BR-AUTH-05, DEC-346=C, DEC-308=C
  await page.goto("/register");

  // Wait for the page to fully render
  await page.waitForLoadState("domcontentloaded");

  // Register page has a handle step (Section A) before provider buttons appear.
  // Fill a handle to advance to Section B where provider buttons are shown.
  const handleInput = page
    .getByRole("textbox", { name: /handle/i })
    .or(page.locator("input[placeholder*='handle'], input[type='text']").first());
  await handleInput.waitFor({ timeout: 8_000 });
  await handleInput.fill("test-s183-sso-check");

  // Click "Claim @test-s183-sso-check" or the primary CTA button to proceed
  const claimBtn = page
    .getByRole("button", { name: /claim|next|continue/i })
    .first();
  // Some builds auto-advance — wait either for the button or for Section B
  const sectionB = page.locator("[aria-label='Choose sign-in method']");
  await Promise.race([
    claimBtn.click().catch(() => {}),
    sectionB.waitFor({ timeout: 3_000 }).catch(() => {}),
  ]);

  // If the section B sentinel didn't appear yet, click the button explicitly
  if (!(await sectionB.isVisible().catch(() => false))) {
    await claimBtn.click().catch(() => {});
  }

  await sectionB.waitFor({ timeout: 8_000 });

  // Verify provider buttons
  const googleBtn = page.getByRole("button", { name: /Continue with Google/i });
  const xBtn = page.getByRole("button", { name: /Continue with X/i });
  const emailBtn = page.getByRole("button", { name: /Continue with Email/i });

  await expect(googleBtn).toBeVisible({ timeout: 8_000 });
  await expect(xBtn).toBeVisible({ timeout: 8_000 });
  await expect(emailBtn).toBeVisible({ timeout: 8_000 });

  // Apple button must NOT be present
  const appleBtn = page.getByRole("button", { name: /Continue with Apple/i });
  await expect(appleBtn).toHaveCount(0);

  // Count all "Continue with" buttons in Section B — must be exactly 3
  const allProviderBtns = sectionB.getByRole("button", { name: /^Continue with /i });
  await expect(allProviderBtns).toHaveCount(3);
});

// ---------------------------------------------------------------------------
// S3 — /login and /register: page text does NOT contain "Apple" or "iOS"
// ---------------------------------------------------------------------------

test("S3: /login — page text contains no 'Apple' or 'iOS' copy", async ({ page }) => {
  // Covers: DEC-346=C — no stale copy referencing Apple remains
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  const bodyText = await page.locator("body").innerText();

  // "Apple" must not appear in any user-visible text
  expect(bodyText).not.toMatch(/Apple/i);

  // "iOS users" was the provider hint — must be gone
  expect(bodyText).not.toMatch(/iOS users/i);
});

test("S3: /register — page text contains no 'Apple' or 'iOS' copy", async ({ page }) => {
  // Covers: DEC-346=C — no stale copy referencing Apple remains
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  // Advance to Section B (provider buttons) to get full body text
  const handleInput = page
    .getByRole("textbox", { name: /handle/i })
    .or(page.locator("input[placeholder*='handle'], input[type='text']").first());
  await handleInput.waitFor({ timeout: 8_000 });
  await handleInput.fill("test-s183-sso-text-check");

  const claimBtn = page
    .getByRole("button", { name: /claim|next|continue/i })
    .first();
  await claimBtn.click().catch(() => {});
  await page.locator("[aria-label='Choose sign-in method']").waitFor({ timeout: 8_000 });

  const bodyText = await page.locator("body").innerText();

  // "Apple" must not appear in any user-visible text
  expect(bodyText).not.toMatch(/Apple/i);

  // "iOS users" was the provider hint — must be gone
  expect(bodyText).not.toMatch(/iOS users/i);
});
