/**
 * S1 — Bug #1 regression: duplicate phone disclaimer on Section B
 *
 * Issue: tadaify-app#188
 * Covers: BR-REGISTER / DEC-291
 *
 * Before fix: TWO phone-disclaimer lines rendered on Section B:
 *   1. "✉️ All paths confirm your email. We never ask for your phone."
 *   2. "🔒 We never ask for your phone number. Ever."
 * After fix: only the 🔒 trust chip remains (exactly one disclaimer).
 *
 * Run: npx playwright test e2e/register-no-duplicate-phone-disclaimer.spec.ts
 */

import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const HANDLE_PREFIX = "t188s1";

async function cleanupHandleReservations(prefix: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) return;
  try {
    await fetch(
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
  } catch {
    // cleanup failures are non-fatal
  }
}

/** Generate a unique handle per run to avoid stale reservations across reruns */
function uniqueHandle(testInfo: { workerIndex: number }): string {
  return `${HANDLE_PREFIX}_${testInfo.workerIndex}_${Date.now().toString(36)}`;
}

test.beforeAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

// ---------------------------------------------------------------------------
// S1 — phone disclaimer renders exactly once on Section B
// Covers: Bug #1 (tadaify-app#188)
// ---------------------------------------------------------------------------

test("S1 — phone disclaimer renders exactly once on Section B (Bug #1)", async ({ page }, testInfo) => {
  // Navigate to /register
  await page.goto("/register");

  // Section A: claim a unique handle to advance to Section B (unique per run)
  const handle = uniqueHandle(testInfo);
  await expect(page.locator("input#handle")).toBeVisible({ timeout: 10_000 });
  await page.locator("input#handle").fill(handle);

  // Wait for handle availability check (debounce ~300ms)
  await page.waitForTimeout(500);

  // Click Continue on Section A
  const sectionAContinue = page.locator("button[type='submit']").first();
  await expect(sectionAContinue).toBeEnabled({ timeout: 8_000 });
  await sectionAContinue.click();

  // Section B should be visible — wait for provider buttons
  await expect(page.getByText(/Continue with Email/i)).toBeVisible({ timeout: 10_000 });

  // Count ALL occurrences of "never ask for your phone"
  const bodyText = await page.locator("body").innerText();
  const matches = bodyText.match(/never ask for your phone/gi) ?? [];

  // Bug #1 fix: exactly ONE phone disclaimer must appear (the 🔒 trust chip)
  expect(matches.length).toBe(1);

  // The ✉️ "all-paths" line must NOT be present
  expect(bodyText).not.toMatch(
    /All paths confirm your email\. We never ask for your phone\./i
  );

  // The 🔒 trust chip MUST still be present
  await expect(
    page.getByText(/We never ask for your phone number\. Ever\./i)
  ).toBeVisible();
});
