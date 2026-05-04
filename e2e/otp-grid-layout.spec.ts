/**
 * Playwright test suite for OTP grid layout fix (tadaify-app#178).
 *
 * Bug: `repeat(6, 1fr)` resolves to `minmax(auto, 1fr)` on <input> elements,
 * expanding each of 6 grid columns to ~325px (intrinsic min-content), pushing
 * inputs 4-6 off-viewport on a 460px form column.
 * Fix: `repeat(6, minmax(0, 1fr))` — forces min track size to 0.
 *
 * Covers: tadaify-app#178
 * Locked rules: feedback_bug_fix_must_have_tests.md, DEC-323, DEC-325
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X)
 *   - `.dev.vars` populated via `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - Mailpit accessible at http://localhost:54354
 *
 * Run: npx playwright test e2e/otp-grid-layout.spec.ts
 */

import { test, expect, Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ESM-compatible __dirname substitute
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Supabase local API (port-band 5435X for tadaify) */
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";

/** Service role key — read from .dev.vars if not in env */
const SERVICE_ROLE_KEY = (() => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Try relative to the spec file first, then relative to process.cwd()
  const candidates = [
    resolve(__dirname, "..", ".dev.vars"),
    resolve(process.cwd(), ".dev.vars"),
  ];
  for (const devVarsPath of candidates) {
    try {
      const content = readFileSync(devVarsPath, "utf-8");
      const match = content.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
      if (match?.[1]) return match[1].trim();
    } catch {
      // try next candidate
    }
  }
  return "";
})();

const MAILPIT_URL = "http://localhost:54354";

/** Handle prefix — all t178* rows cleaned up in afterAll */
const HANDLE_PREFIX = "t178";

// ---------------------------------------------------------------------------
// Helpers — Supabase cleanup
// ---------------------------------------------------------------------------

async function cleanupHandleReservations(prefix: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) return;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/handle_reservations?handle=ilike.${encodeURIComponent(prefix + "*")}`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );
    if (!res.ok && res.status !== 404) {
      console.warn(`[cleanup] handle_reservations cleanup returned ${res.status}`);
    }
  } catch (e) {
    console.warn("[cleanup] handle_reservations cleanup failed:", e);
  }
}

/**
 * Delete a Supabase auth user by email (admin API).
 * Best-effort — does NOT throw.
 */
async function deleteAuthUserByEmail(email: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) return;
  try {
    // List users and find by email
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (!listRes.ok) return;
    const data = (await listRes.json()) as { users?: Array<{ id: string; email: string }> };
    const user = (data.users ?? []).find((u) => u.email === email.toLowerCase());
    if (!user) return;

    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
  } catch (e) {
    console.warn(`[cleanup] deleteAuthUserByEmail(${email}) failed:`, e);
  }
}

// ---------------------------------------------------------------------------
// Helpers — Mailpit
// ---------------------------------------------------------------------------

async function clearMailpitForEmail(email: string): Promise<void> {
  try {
    const listRes = await fetch(
      `${MAILPIT_URL}/api/v1/messages?query=${encodeURIComponent(`to:${email}`)}`
    );
    if (!listRes.ok) return;
    const data = (await listRes.json()) as { messages?: Array<{ ID: string }> };
    const msgs = data.messages ?? [];
    for (const msg of msgs) {
      await fetch(`${MAILPIT_URL}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: [msg.ID] }),
      });
    }
  } catch {
    /* Mailpit not running — test proceeds anyway */
  }
}

// ---------------------------------------------------------------------------
// Helpers — Register form navigation (debounce-aware)
// ---------------------------------------------------------------------------

/**
 * Navigate to /register, fill the handle, wait for Continue to be enabled
 * (debounce guard), click it, choose "Continue with Email", fill email,
 * click "Send me a code".
 *
 * Ends when the OTP entry screen (heading "Check your email" or OTP group) is
 * expected — caller does the assertion.
 */
async function navigateToRegisterOtpStep(
  page: Page,
  handle: string,
  email: string
): Promise<void> {
  await page.goto("/register");

  // Section A — handle
  const handleInput = page.locator("#handle-input");
  await expect(handleInput).toBeVisible({ timeout: 10_000 });
  await handleInput.fill(handle);

  const continueBtn = page.getByRole("button", { name: /continue/i }).first();
  await expect(continueBtn).toBeEnabled({ timeout: 8_000 });
  await continueBtn.click();

  // Section B — method selection
  await page.getByRole("button", { name: /continue with email/i }).click();

  // Section B-email — email input
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("button", { name: /send.*code/i }).click();

  // Wait for OTP screen
  await expect(
    page.locator('[role="group"][aria-label*="6-digit"]')
  ).toBeVisible({ timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Helpers — Layout assertions
// ---------------------------------------------------------------------------

/**
 * Assert that all 6 OTP inputs fit inside the form column's bounding box.
 *
 * @param page Playwright Page
 * @param formSelector CSS selector for the element that defines the column boundary
 */
async function assertOtpInputsFitColumn(
  page: Page,
  formSelector: string
): Promise<void> {
  const otpGroup = page.locator('[role="group"][aria-label*="6-digit"]');
  await expect(otpGroup).toBeVisible({ timeout: 10_000 });

  const inputs = otpGroup.locator("input");
  await expect(inputs).toHaveCount(6);

  const formEl = page.locator(formSelector);
  const formBox = await formEl.boundingBox();
  expect(formBox, `Form column (${formSelector}) must have a bounding box`).not.toBeNull();

  const formRight = formBox!.x + formBox!.width;

  for (let i = 0; i < 6; i++) {
    const input = inputs.nth(i);
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box, `OTP input ${i + 1} must have a bounding box`).not.toBeNull();

    const inputRight = box!.x + box!.width;
    expect(inputRight).toBeLessThanOrEqual(formRight + 2); // 2px tolerance for sub-pixel rounding
  }
}

// ---------------------------------------------------------------------------
// Suite lifecycle
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
  // Clean up any leftover auth users from prior runs
  await deleteAuthUserByEmail(`${HANDLE_PREFIX}s2@local.test`);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
  await deleteAuthUserByEmail(`${HANDLE_PREFIX}s2@local.test`);
});

// ---------------------------------------------------------------------------
// S1 — Register OTP layout fits form column at desktop 1440×900
// Covers: tadaify-app#178 (OTP grid overflow regression)
// ---------------------------------------------------------------------------

test("S1 — register OTP layout fits form column at 1440×900 desktop", async ({ page }) => {
  // Covers: tadaify-app#178 — root-cause regression (Grid `1fr` overflow on intrinsic min-content)

  await page.setViewportSize({ width: 1440, height: 900 });

  const handle = `${HANDLE_PREFIX}s1`;
  const email = `${HANDLE_PREFIX}s1@local.test`;

  await clearMailpitForEmail(email);
  await navigateToRegisterOtpStep(page, handle, email);

  // Layout assertion: all 6 inputs must be within the form column (maxWidth: 460)
  // Form column is the first child div of .register-grid-responsive
  await assertOtpInputsFitColumn(page, ".register-grid-responsive > div:first-child");

  // Additionally: no OTP input must overlap the aside (preview column)
  const aside = page.locator("aside.preview-col-hide-mobile");
  const asideBox = await aside.boundingBox();
  // At 1440px, the aside should be visible (not hidden by @media)
  expect(asideBox, "aside.preview-col-hide-mobile must be visible at 1440px").not.toBeNull();

  const otpGroup = page.locator('[role="group"][aria-label*="6-digit"]');
  const inputs = otpGroup.locator("input");

  for (let i = 0; i < 6; i++) {
    const box = await inputs.nth(i).boundingBox();
    if (box && asideBox) {
      // No input should start at or beyond the aside's left edge
      const inputRight = box.x + box.width;
      expect(inputRight).toBeLessThanOrEqual(asideBox.x + 2); // 2px rounding tolerance
    }
  }
});

// ---------------------------------------------------------------------------
// S2 — Login OTP layout fits form column at desktop 1440×900
// Covers: tadaify-app#178 — fix applies to /login OTP step as well
// ---------------------------------------------------------------------------

test("S2 — login OTP layout fits form column at 1440×900 desktop", async ({ page }) => {
  // Covers: tadaify-app#178 — same minmax(0,1fr) fix in login.tsx:422

  await page.setViewportSize({ width: 1440, height: 900 });

  // Prerequisite: create a confirmed user via Supabase admin API so we can test the
  // login OTP flow without going through the full registration email flow.
  const email = `${HANDLE_PREFIX}s2@local.test`;
  await deleteAuthUserByEmail(email);

  if (SERVICE_ROLE_KEY) {
    // Create confirmed user via admin API
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        email_confirm: true,
        password: "TestPass123!",
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.warn(`[S2] Could not create test user: ${createRes.status} ${text}`);
    }
  } else {
    console.warn("[S2] SERVICE_ROLE_KEY not available — skipping user creation; test may fail");
  }

  // Navigate to /login
  await page.goto("/login");
  await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });

  // Fill email and request OTP
  await clearMailpitForEmail(email);
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("button", { name: /send.*code/i }).click();

  // Wait for OTP grid to appear
  await expect(
    page.locator('[role="group"][aria-label*="6-digit"]')
  ).toBeVisible({ timeout: 15_000 });

  // Login is a centered card (maxWidth: 460) — no aside column.
  // Assert inputs fit inside the card's outer container.
  await assertOtpInputsFitColumn(page, "form, [class*='card'], div[style*='max-width']");
});

// ---------------------------------------------------------------------------
// S3 — Edge viewport 961×900 (just above @media collapse at 960px)
// Covers: tadaify-app#178 — narrowest desktop viewport where aside is still shown
// ---------------------------------------------------------------------------

test("S3 — register OTP layout fits form column at edge viewport 961×900", async ({ page }) => {
  // Covers: tadaify-app#178 — edge of desktop range (most likely failure region at narrow desktops)

  // 961px is 1px above the @media (max-width: 960px) breakpoint at which
  // .preview-col-hide-mobile { display: none } activates.
  await page.setViewportSize({ width: 961, height: 900 });

  const handle = `${HANDLE_PREFIX}s3`;
  const email = `${HANDLE_PREFIX}s3@local.test`;

  await clearMailpitForEmail(email);
  await navigateToRegisterOtpStep(page, handle, email);

  // At 961px: both columns still visible — form is ~480px
  await assertOtpInputsFitColumn(page, ".register-grid-responsive > div:first-child");
});

// ---------------------------------------------------------------------------
// S4 — Mobile viewport 375×812 (preview-col collapsed)
// Covers: tadaify-app#178 — mobile layout where form is full-width
// ---------------------------------------------------------------------------

test("S4 — mobile 375×812: preview-col hidden, OTP inputs fit full-width form", async ({ page }) => {
  // Covers: tadaify-app#178 — mobile layout + 44px tap-target rule
  // (per feedback_tadaify_three_viewport_support.md)

  await page.setViewportSize({ width: 375, height: 812 });

  const handle = `${HANDLE_PREFIX}s4`;
  const email = `${HANDLE_PREFIX}s4@local.test`;

  await clearMailpitForEmail(email);
  await navigateToRegisterOtpStep(page, handle, email);

  // Verify preview col is hidden at mobile (existing @media rule)
  const aside = page.locator("aside.preview-col-hide-mobile");
  const asideDisplay = await aside.evaluate((el) =>
    window.getComputedStyle(el).display
  );
  expect(asideDisplay).toBe("none");

  // At mobile, form column is full-width — OTP inputs fill it
  // Use the register-grid wrapper as the right edge boundary
  const gridWrapper = page.locator(".register-grid-responsive");
  await assertOtpInputsFitColumn(page, ".register-grid-responsive");

  // Tap target requirement: each OTP input must be at least 44×44px
  const otpGroup = page.locator('[role="group"][aria-label*="6-digit"]');
  const inputs = otpGroup.locator("input");

  for (let i = 0; i < 6; i++) {
    const box = await inputs.nth(i).boundingBox();
    expect(box, `OTP input ${i + 1} must have a bounding box`).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  // Silence unused variable warning
  void gridWrapper;
});
