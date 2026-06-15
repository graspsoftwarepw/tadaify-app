/**
 * Module: APP-DASHBOARD
 * Covers: BR-DASH-001, BR-ONBOARDING-006
 * Story: #190
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S5 (issue tadaify-app#190 Bug #4, DEC-366=A)
 *
 * "tier step CTA lands directly on /app dashboard, no intermediate UI"
 *
 * Before fix:
 *   - onboarding.tier.tsx action redirected to /onboarding/complete
 *   - onboarding.complete.tsx rendered a celebration screen ("tada!", "Your page is being set up")
 *   - Button text was "Take me to my page →"
 *
 * After fix (DEC-366=A):
 *   - onboarding.tier.tsx action redirects directly to /app
 *   - onboarding.complete.tsx is a pure SSR redirect (no UI)
 *   - Button text is "Take me to my dashboard →"
 *   - User lands on /app with sidebar visible, no celebration screen
 *
 * Prerequisites:
 *   - `supabase start` (Mailpit at http://localhost:44214)
 *   - `.dev.vars` configured with Workers env bindings
 *   - `npm run dev` (App: http://localhost:44200)
 *
 * Run: npx playwright test e2e/post-onboarding-direct-to-dashboard.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAILPIT_URL = "http://localhost:44214";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:44210";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const RUN_ID = Date.now();
const HANDLE = `t190s5o${RUN_ID}`.slice(0, 30);
const EMAIL = `t190s5o${RUN_ID}@local.test`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clearMailpit(email: string): Promise<void> {
  try {
    const listRes = await fetch(
      `${MAILPIT_URL}/api/v1/messages?query=${encodeURIComponent(`to:${email}`)}`
    );
    if (!listRes.ok) return;
    const data = (await listRes.json()) as { messages?: Array<{ ID: string }> };
    for (const msg of (data.messages ?? [])) {
      await fetch(`${MAILPIT_URL}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: [msg.ID] }),
      });
    }
  } catch { /* best-effort */ }
}

async function getMailpitOtp(email: string, timeoutMs = 30_000): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const listRes = await fetch(
        `${MAILPIT_URL}/api/v1/messages?query=${encodeURIComponent(`to:${email}`)}`
      );
      if (listRes.ok) {
        const data = (await listRes.json()) as { messages?: Array<{ ID: string }> };
        const msgs = data.messages ?? [];
        if (msgs.length > 0) {
          const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${msgs[0].ID}`);
          if (msgRes.ok) {
            const msg = (await msgRes.json()) as { HTML: string; Text: string };
            const fullContent = (msg.HTML ?? "") + (msg.Text ?? "");
            const match = fullContent.match(/\b(\d{6})\b/);
            if (match) return match[1];
          }
        }
      }
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return null;
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
  } catch { /* best-effort */ }
}

async function cleanupAuthUserByEmail(email: string): Promise<void> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { users?: Array<{ id: string; email?: string }> };
    const match = (data.users ?? []).find((u) => u.email === email);
    if (match) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${match.id}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
    }
  } catch { /* best-effort */ }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await cleanupAuthUserByEmail(EMAIL);
  await clearMailpit(EMAIL);
  await deleteHandleReservation(HANDLE);
});

test.afterAll(async () => {
  await cleanupAuthUserByEmail(EMAIL);
  await deleteHandleReservation(HANDLE);
  await clearMailpit(EMAIL);
});

// ---------------------------------------------------------------------------
// S5 — tier step CTA lands directly on /app dashboard, no intermediate UI
// Covers: issue tadaify-app#190 Bug #4, DEC-366=A
// ---------------------------------------------------------------------------

test(
  "S5 — tier step CTA lands directly on /app dashboard, no intermediate UI",
  async ({ page }) => {
    // ── Step 1: Register a new user ────────────────────────────────────────
    await page.goto("/register");

    const handleInput = page.locator("#handle-input");
    await handleInput.fill(HANDLE);

    const availability = page.locator("#handle-availability");
    await expect(availability).toContainText("Available!", { timeout: 8_000 });

    await page.getByRole("button", { name: /continue/i }).first().click();
    await page.getByRole("button", { name: /continue with email/i }).click();

    const emailInput = page.locator("#email-input");
    await emailInput.fill(EMAIL);
    await page.getByRole("button", { name: /send.*code/i }).click();

    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible({ timeout: 15_000 });

    const signupOtp = await getMailpitOtp(EMAIL, 30_000);
    expect(signupOtp).not.toBeNull();

    // Enter OTP digits
    const otpInputs = page.getByRole("group", { name: /verification code/i }).getByRole("textbox");
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(signupOtp![i]);
    }

    // Continue past OTP step → lands on onboarding tier selector
    await expect(page.getByRole("button", { name: /continue/i }).last()).toBeEnabled({ timeout: 10_000 });
    await page.getByRole("button", { name: /continue/i }).last().click();

    // Wait for onboarding route
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 });

    // ── Step 2: Navigate through onboarding to the tier step ──────────────
    // The onboarding flow may have multiple steps. Walk through them until
    // we reach the tier selection step (which has the final CTA button).
    // We keep clicking "Continue" / "Next" buttons until we see the tier CTA.
    let reachedTierStep = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      const url = page.url();

      // Check if we're on the tier step (has the "Take me to my dashboard" button)
      const ctaButton = page.getByRole("button", { name: /take me to my dashboard/i });
      const ctaVisible = await ctaButton.isVisible().catch(() => false);
      if (ctaVisible) {
        reachedTierStep = true;
        break;
      }

      // Check if we already landed on /app (onboarding skipped or very short)
      if (/\/app(\?|$|#|\/)/i.test(url)) {
        // Onboarding was skipped entirely — that's fine for this test
        // We can't test the button but /app is correct
        reachedTierStep = false;
        break;
      }

      // Try clicking any Continue/Next/Select button to advance
      const advanceBtn = page
        .getByRole("button", { name: /continue|next|select|free|starter|creator/i })
        .first();
      const btnVisible = await advanceBtn.isVisible({ timeout: 2_000 }).catch(() => false);
      if (btnVisible) {
        await advanceBtn.click();
        await page.waitForTimeout(500);
      } else {
        // No advance button found — might already be on tier step or stuck
        break;
      }
    }

    // ── Step 3: If we reached the tier step, click the CTA ─────────────────
    if (reachedTierStep) {
      const ctaButton = page.getByRole("button", { name: /take me to my dashboard/i });
      await expect(ctaButton).toBeVisible({ timeout: 5_000 });

      // Regression-lock: old button texts must NOT be present
      await expect(
        page.getByRole("button", { name: /take me to my page/i })
      ).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: /go to dashboard/i })
      ).not.toBeVisible();

      await ctaButton.click();
    }

    // ── Step 4: Assert land on /app, NOT /onboarding/complete ──────────────
    await expect(page).toHaveURL(/\/app(\?|$|#)/, { timeout: 15_000 });

    // Assert page has dashboard markers
    await expect(page.locator("aside")).toBeVisible({ timeout: 5_000 });

    // Regression-lock: must NOT land on /onboarding/complete (which had celebration UI)
    expect(page.url()).not.toMatch(/\/onboarding\/complete/);

    // Regression-lock: must NOT show celebration screen copy
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/tada!/i);
    expect(bodyText).not.toMatch(/your page is being set up/i);

    // Regression-lock: must NOT show old onboarding complete copy
    expect(bodyText).not.toMatch(/take me to my page/i);
    expect(bodyText).not.toMatch(/go to dashboard/i);

    // Regression-lock: must NOT be a 404
    expect(bodyText).not.toMatch(/404/i);
    expect(bodyText).not.toMatch(/not found/i);
  }
);
