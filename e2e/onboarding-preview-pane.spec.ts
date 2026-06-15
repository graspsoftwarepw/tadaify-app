/**
 * Module: ONBOARDING
 * Covers: BR-ONBOARDING-003
 * Story: #137
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright test suite for onboarding preview pane (tadaify-app#137).
 *
 * Covers: S1-S5 per issue #137 test plan.
 * TR-tadaify-006: tdf:onboarding:state-update event contract.
 * DEC-297=B: tier step has no preview pane (single-column).
 * DEC-332=D: complete step has handle-claim composition (no preview pane).
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X)
 *   - `.dev.vars` populated via `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:44200)
 *
 * Per-test handle isolation (t137s1..t137s5 prefix).
 * AfterAll cleanup hook: DELETE handle_reservations where handle ilike 't137%'.
 *
 * Run: npx playwright test e2e/onboarding-preview-pane.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:44210";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const HANDLE_PREFIX = "t137";

// ---------------------------------------------------------------------------
// Helpers — cleanup
// ---------------------------------------------------------------------------

async function cleanupHandleReservations(prefix: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) {
    console.warn(
      "[cleanup] SUPABASE_SERVICE_ROLE_KEY not set — skipping handle_reservations cleanup."
    );
    return;
  }
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

// ---------------------------------------------------------------------------
// Suite setup / teardown
// ---------------------------------------------------------------------------

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

// ---------------------------------------------------------------------------
// S1 — Preview pane mounts on welcome/social/profile/template
// ---------------------------------------------------------------------------

test("S1: preview pane visible on welcome/social/profile/template steps", async ({ page }) => {
  // Covers: BR-Slice-C, ECN-137-09; verifies visual checklist items 1-3.
  const handle = "t137s1";

  // welcome
  await page.goto(`http://localhost:44200/onboarding/welcome?handle=${handle}`);
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();
  await expect(page.locator("[data-testid='viewport-switcher']")).toBeVisible();

  // social
  await page.goto(`http://localhost:44200/onboarding/social?handle=${handle}&platforms=instagram`);
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();

  // profile
  await page.goto(`http://localhost:44200/onboarding/profile?handle=${handle}&platforms=instagram&socials=%7B%7D`);
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();
  await expect(page.locator("iframe[data-onboarding-preview]")).toBeVisible();

  // template
  await page.goto(
    `http://localhost:44200/onboarding/template?handle=${handle}&platforms=instagram&socials=%7B%7D&name=T137+User&bio=`
  );
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();
});

// ---------------------------------------------------------------------------
// S2 — State broadcast updates iframe within 200ms
// ---------------------------------------------------------------------------

test("S2: state broadcast updates iframe within 200ms (debounce contract)", async ({ page }) => {
  // Covers: BR-Slice-C; verifies visual checklist item 5 + live propagation.
  const handle = "t137s2";

  await page.goto(
    `http://localhost:44200/onboarding/profile?handle=${handle}&platforms=&socials=%7B%7D`
  );

  // Wait for preview pane to be visible
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();

  // Type into name field — should trigger broadcast
  const nameInput = page.locator("#name");
  await nameInput.fill("Live Test");

  // Wait up to 200ms + a small rendering buffer for the iframe to update
  await page.waitForTimeout(300);

  // Retrieve the iframe srcdoc via evaluate
  const srcdoc = await page.locator("iframe[data-onboarding-preview]").evaluate(
    (el) => (el as HTMLIFrameElement).srcdoc ?? ""
  );

  expect(srcdoc).toContain("Live Test");
});

// ---------------------------------------------------------------------------
// S6 — Social input propagates to iframe preview
// ---------------------------------------------------------------------------

test("S6: social input updates iframe preview with social handle after debounce", async ({
  page,
}) => {
  // Covers: Finding 1 from Codex follow-up review — platforms/socials rendering.
  const handle = "t137s6";

  await page.goto(
    `http://localhost:44200/onboarding/social?handle=${handle}&platforms=instagram`
  );

  // Wait for preview pane
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();

  // Type into the instagram social input
  const instagramInput = page.locator("[data-platform='instagram'] input, input[name='instagram'], input[placeholder*='instagram' i]").first();
  await instagramInput.fill("@mycoolhandle");

  // Wait for debounce (150ms) + render buffer
  await page.waitForTimeout(400);

  // Verify the iframe srcdoc contains the social handle
  const srcdoc = await page.locator("iframe[data-onboarding-preview]").evaluate(
    (el) => (el as HTMLIFrameElement).srcdoc ?? ""
  );

  expect(srcdoc).toContain("@mycoolhandle");
  expect(srcdoc).toContain("instagram");
});

// ---------------------------------------------------------------------------
// S3 — 3-viewport switcher persists across steps via sessionStorage
// ---------------------------------------------------------------------------

test("S3: viewport switcher persists via sessionStorage across steps", async ({ page }) => {
  // Covers: BR-Slice-C, ECN-137-03, ECN-137-04; verifies visual checklist item 2.
  const handle = "t137s3";

  // Go to profile step and click Tablet
  await page.goto(
    `http://localhost:44200/onboarding/profile?handle=${handle}&platforms=&socials=%7B%7D`
  );
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();

  const tabletBtn = page.locator("[data-testid='viewport-btn-tablet']");
  await tabletBtn.click();
  await expect(tabletBtn).toHaveAttribute("aria-checked", "true");

  // Navigate to template step
  await page.goto(
    `http://localhost:44200/onboarding/template?handle=${handle}&platforms=&socials=%7B%7D&name=T137+User&bio=`
  );
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();

  // Tablet should still be active (sessionStorage restore)
  await expect(
    page.locator("[data-testid='viewport-btn-tablet']")
  ).toHaveAttribute("aria-checked", "true");

  // Reload and check sessionStorage restore
  await page.reload();
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).toBeVisible();
  await expect(
    page.locator("[data-testid='viewport-btn-tablet']")
  ).toHaveAttribute("aria-checked", "true");
});

// ---------------------------------------------------------------------------
// S4 — Tier step has no preview pane (DEC-297=B)
// ---------------------------------------------------------------------------

test("S4: tier step renders without preview pane (single-column layout)", async ({ page }) => {
  // Covers: DEC-297=B; verifies visual checklist item 7.
  const handle = "t137s4";

  await page.goto(
    `http://localhost:44200/onboarding/tier?handle=${handle}&platforms=&socials=%7B%7D&name=T137User&tpl=chopin`
  );

  // No preview pane
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).not.toBeVisible();
  await expect(page.locator("iframe[data-onboarding-preview]")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S5 — Complete step has DEC-332=D handle-claim composition (no preview)
// ---------------------------------------------------------------------------

test("S5: complete step has DEC-332=D handle-claim composition (no preview pane)", async ({
  page,
}) => {
  // Covers: DEC-332=D; verifies visual checklist item 8.
  const handle = "t137s5";

  await page.goto(
    `http://localhost:44200/onboarding/complete?handle=${handle}&tier=free&tpl=chopin&name=T137User`
  );

  // No preview pane on complete step
  await expect(page.locator("[data-testid='onboarding-preview-pane']")).not.toBeVisible();
  await expect(page.locator("iframe[data-onboarding-preview]")).not.toBeVisible();

  // DEC-332=D copy: "Set up your page" OR "page is being set up"
  const bodyText = await page.locator("body").textContent();
  const hasDec332D =
    (bodyText?.includes("set up") ?? false) ||
    (bodyText?.includes("being set up") ?? false) ||
    (bodyText?.includes("Go to dashboard") ?? false);
  expect(hasDec332D).toBe(true);
});
