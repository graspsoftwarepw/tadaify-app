/**
 * Playwright test suite for onboarding wizard skeleton (#165 / #136).
 *
 * Covers: BR-Slice-C / BR-ONBOARDING-001..006 / DEC-310=B / DEC-311=A / DEC-332=D
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with env-setup reliability fix (#168)
 *   - `.dev.vars` populated via `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Layer 1: URL-state-machine traversal (no auth required — wizard is pre-auth)
 * Layer 2: per-test handle isolation (t165s1–t165s5 prefixed handles)
 * Layer 3: afterAll cleanup hook (DELETE handle_reservations where handle ilike t165%)
 * Layer 4: debounce-aware waits where needed
 *
 * Run: npx playwright test e2e/onboarding-wizard.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

/** Handle prefix — all t165* rows cleaned up in afterAll */
const HANDLE_PREFIX = "t165";

// ---------------------------------------------------------------------------
// Helpers — cleanup (Layer 3)
// ---------------------------------------------------------------------------

async function cleanupHandleReservations(prefix: string): Promise<void> {
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
// Global lifecycle
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  // Pre-run cleanup: remove stale reservations from interrupted prior runs
  await cleanupHandleReservations(HANDLE_PREFIX);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

// ---------------------------------------------------------------------------
// S1 — Happy path full 5-step walkthrough → /onboarding/complete
// Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
// ---------------------------------------------------------------------------

test("S1 — happy path: full 5-step walkthrough reaches complete page", async ({ page }) => {
  // Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
  const handle = `${HANDLE_PREFIX}s1`;

  // Step 1 — Welcome (platform picker)
  await page.goto(`/onboarding/welcome?handle=${handle}`);
  await expect(page.locator("input[name='platform'][value='instagram']")).toBeVisible({
    timeout: 10_000,
  });

  // Select at least one platform (instagram)
  await page.locator("input[name='platform'][value='instagram']").check();
  await expect(page.locator("input[name='platform'][value='instagram']")).toBeChecked();

  // Continue → Step 2 (social handles)
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });
  expect(new URL(page.url()).searchParams.get("handle")).toBe(handle);
  expect(new URL(page.url()).searchParams.get("platforms")).toContain("instagram");

  // Step 2 — Social handles (enter instagram handle)
  await page.locator("input#social_instagram").fill("testuser165");

  // Continue → Step 3 (profile)
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 8_000 });

  // Step 3 — Profile (name + bio)
  await page.locator("input#name").fill("Test User");
  await page.locator("textarea#bio").fill("Test bio for S1");

  // Continue → Step 4 (template)
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  // Step 4 — Template picker (chopin is default)
  await expect(page.locator("input[name='tpl'][value='chopin']")).toBeVisible({ timeout: 5_000 });
  // chopin is pre-selected as default; no extra click needed
  // Continue → Step 5 (tier)
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/tier/, { timeout: 8_000 });

  // Step 5 — Tier (read-only, DEC-311=A)
  await expect(page.locator("button[type='submit']")).toBeVisible({ timeout: 5_000 });
  // "Start for free →" button
  await page.locator("button[type='submit']").click();

  // Complete page
  await expect(page).toHaveURL(/\/onboarding\/complete/, { timeout: 8_000 });
  // DEC-311=A: tier=free on complete
  expect(new URL(page.url()).searchParams.get("tier")).toBe("free");
  // DEC-332=D: welcome heading with handle
  await expect(page.getByRole("heading", { name: new RegExp(`@${handle}`, "i") })).toBeVisible({
    timeout: 5_000,
  });
  // DEC-332=D: page coming-soon semantics
  await expect(page.getByText(/your page is being set up/i)).toBeVisible();
  // Go to dashboard CTA visible (aria-label="Go to your dashboard")
  await expect(page.getByRole("link", { name: /go to (your )?dashboard/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// S2 — Back navigation preserves URL state across steps
// Covers: BR-Slice-C / DEC-310=B
// ---------------------------------------------------------------------------

test("S2 — back navigation: URL state preserved across back/forward traversal", async ({
  page,
}) => {
  // Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
  const handle = `${HANDLE_PREFIX}s2`;

  // Step 1 — Welcome: select instagram + youtube
  await page.goto(`/onboarding/welcome?handle=${handle}`);
  await page.locator("input[name='platform'][value='instagram']").check();
  await page.locator("input[name='platform'][value='youtube']").check();
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });

  // Step 2 — Social: skip socials to reach step 3
  await page.locator("button[name='intent'][value='skip']").click();
  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 8_000 });

  // Step 3 — Profile: fill name
  await page.locator("input#name").fill("Back Test");
  await page.locator("textarea#bio").fill("back nav bio");

  // Navigate Back → Step 2
  await page.getByRole("link", { name: /← back|back to social/i }).click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });

  // URL must still carry handle from step 1
  const socialUrl = new URL(page.url());
  expect(socialUrl.searchParams.get("handle")).toBe(handle);

  // Navigate Back again → Step 1
  await page.getByRole("link", { name: /← back|back to platform/i }).click();
  await expect(page).toHaveURL(/\/onboarding\/welcome/, { timeout: 8_000 });
  expect(new URL(page.url()).searchParams.get("handle")).toBe(handle);

  // Forward from step 1: re-select instagram + continue
  await page.locator("input[name='platform'][value='instagram']").check();
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });

  // Skip socials again → profile
  await page.locator("button[name='intent'][value='skip']").click();
  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 8_000 });

  // Profile fields should be empty (URL-state not pre-filled because we navigated away
  // and back; form is blank on direct arrival without URL state)
  // Fill name again and continue forward to complete the path
  await page.locator("input#name").fill("Back Test");
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  // Verify handle is still in the URL (preserved through the traversal)
  expect(new URL(page.url()).searchParams.get("handle")).toBe(handle);
});

// ---------------------------------------------------------------------------
// S3 — Validator inline error: name required
// Covers: BR-Slice-C / DEC-310=B
// ---------------------------------------------------------------------------

test("S3 — validator: empty name shows inline error, stays on profile page", async ({
  page,
}) => {
  // Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
  // Direct URL navigation — no prior steps needed; wizard is URL-state-machine
  const handle = `${HANDLE_PREFIX}s3`;

  await page.goto(`/onboarding/profile?handle=${handle}`);
  await expect(page.locator("input#name")).toBeVisible({ timeout: 10_000 });

  // Submit without filling name
  await page.locator("button[type='submit']").click();

  // Inline error must appear
  await expect(page.locator("#name-error")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator("#name-error")).toContainText(/name is required/i);

  // Must NOT have navigated away — still on /onboarding/profile
  expect(page.url()).toMatch(/\/onboarding\/profile/);
});

// ---------------------------------------------------------------------------
// S4 — Tier step is read-only / always free (DEC-311=A)
// Covers: BR-Slice-C / DEC-311=A
// ---------------------------------------------------------------------------

test("S4 — tier step: tier=premium in URL is ignored, complete receives tier=free", async ({
  page,
}) => {
  // Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
  const handle = `${HANDLE_PREFIX}s4`;

  // Arrive at tier step with ?tier=premium — DEC-311=A says loader ignores it
  await page.goto(
    `/onboarding/tier?handle=${handle}&name=S4User&tpl=chopin&tier=premium`
  );

  // Tier comparison should be visible (read-only, no selection UI)
  await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

  // Free tier must be highlighted
  const freePlanCard = page.locator('[aria-label*="Free plan"]');
  await expect(freePlanCard).toBeVisible({ timeout: 5_000 });

  // "Start for free →" CTA — always free
  const submitBtn = page.locator("button[type='submit']");
  await expect(submitBtn).toBeVisible();
  await expect(submitBtn).toContainText(/start for free/i);

  await submitBtn.click();

  // Complete page: tier MUST be "free" regardless of the ?tier=premium we passed in
  await expect(page).toHaveURL(/\/onboarding\/complete/, { timeout: 8_000 });
  const completeUrl = new URL(page.url());
  expect(completeUrl.searchParams.get("tier")).toBe("free");
  // Also confirm "premium" does NOT appear as tier in URL
  expect(completeUrl.searchParams.get("tier")).not.toBe("premium");
});

// ---------------------------------------------------------------------------
// S5 — Complete page renders DEC-332=D handle-claim semantics
// Covers: BR-Slice-C / DEC-311=A / DEC-332=D
// ---------------------------------------------------------------------------

test("S5 — complete page: DEC-332=D semantics — welcome heading + page-setup copy visible", async ({
  page,
}) => {
  // Covers: BR-Slice-C / DEC-310=B / DEC-311=A / DEC-332=D
  const handle = `${HANDLE_PREFIX}s5`;

  // Direct navigation to complete with tier=free (valid post-wizard state)
  await page.goto(`/onboarding/complete?handle=${handle}&tier=free&tpl=chopin&name=S5User`);

  // DEC-332=D: welcome heading includes @handle
  await expect(
    page.getByRole("heading", { name: new RegExp(`@${handle}`, "i") })
  ).toBeVisible({ timeout: 10_000 });

  // DEC-332=D: "page is being set up" copy — NOT auto-live
  await expect(page.getByText(/your page is being set up/i)).toBeVisible();

  // "Go to dashboard →" CTA (DEC-332=D: set up your page / dashboard CTA)
  // aria-label="Go to your dashboard" — match either form
  await expect(page.getByRole("link", { name: /go to (your )?dashboard/i })).toBeVisible();

  // tadaify.com/<handle> URL display chip
  await expect(
    page.getByText(new RegExp(`tadaify\\.com/${handle}`, "i"))
  ).toBeVisible();

  // DEC-332=D: NO "View your page" CTA (page is NOT auto-live, Publish-gated)
  await expect(page.getByRole("link", { name: /view your page/i })).not.toBeVisible();
  await expect(page.getByRole("button", { name: /view your page/i })).not.toBeVisible();
});
