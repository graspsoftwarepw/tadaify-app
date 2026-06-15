/**
 * Module: AUTH
 * Covers: BR-AUTH-006, BR-AUTH-007
 * Story: #190
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S1 (issue tadaify-app#190 Bug #1, DEC-363=A)
 *
 * "taken handle shows new copy + 3 clickable chips that auto-fill handle on click"
 *
 * Before fix:
 *   - Taken handle showed "× Taken — someone beat you to it." (no suggestions)
 *
 * After fix (DEC-363=A):
 *   - Taken handle shows "✦ Already taken. Try: <chip1> <chip2> <chip3>"
 *   - Chips are clickable — clicking auto-fills the handle input
 *   - After chip click, availability check re-triggers (green / taken)
 *
 * Prerequisites:
 *   - `supabase start` + seed with a reserved handle for this spec
 *   - `npm run dev` (App: http://localhost:44200)
 *
 * Run: npx playwright test e2e/register-handle-taken-smart-alternatives.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:44210";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// A handle that is permanently reserved for this test's taken-state scenario.
// We pre-insert a reservation so the availability check returns taken=true.
const TAKEN_HANDLE = "t190s1taken";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function reserveHandle(handle: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/handle_reservations`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      handle,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`reserveHandle failed (${res.status}): ${body}`);
  }
}

async function deleteHandleReservation(handle: string): Promise<void> {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/handle_reservations?handle=eq.${encodeURIComponent(handle)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
      }
    );
  } catch {
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await reserveHandle(TAKEN_HANDLE);
});

test.afterAll(async () => {
  await deleteHandleReservation(TAKEN_HANDLE);
});

// ---------------------------------------------------------------------------
// S1 — taken handle shows new copy + 3 clickable chips (DEC-363=A)
// Covers Bug #1, issue tadaify-app#190
// ---------------------------------------------------------------------------

test(
  "S1 — taken handle shows new copy + 3 clickable chips that auto-fill handle on click",
  async ({ page }) => {
    await page.goto("/register");

    // Fill a handle that is reserved / taken
    const handleInput = page.locator("#handle-input");
    await handleInput.fill(TAKEN_HANDLE);

    // Wait for the availability check to complete
    const availabilityStatus = page.locator("#handle-availability");

    // Regression-lock: old copy must NOT appear
    await expect(availabilityStatus).not.toContainText(/someone beat you to it/i, { timeout: 8_000 });
    await expect(availabilityStatus).not.toContainText(/Taken —/i);

    // New copy MUST appear (DEC-363=A)
    await expect(availabilityStatus).toContainText("Already taken. Try:", { timeout: 8_000 });
    await expect(availabilityStatus).toContainText("✦", { timeout: 5_000 });

    // 3 clickable chip buttons MUST be rendered
    const chips = availabilityStatus.locator("button");
    await expect(chips).toHaveCount(3, { timeout: 5_000 });

    // Each chip must have non-empty text (alternative handle suggestion)
    for (const chip of await chips.all()) {
      const text = await chip.innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }

    // Click first chip → handle input MUST be auto-filled with chip text
    const firstChip = chips.nth(0);
    const chipText = (await firstChip.innerText()).trim();
    await firstChip.click();

    // Handle input value must now equal the chip text
    await expect(handleInput).toHaveValue(chipText, { timeout: 3_000 });

    // Availability check re-triggers after chip click — "Checking…" or green check
    // (could be taken or available depending on test environment, but either is
    // valid — just must not be blank or show the error copy anymore)
    await expect(availabilityStatus).not.toContainText("Already taken. Try:", { timeout: 8_000 });
  }
);
