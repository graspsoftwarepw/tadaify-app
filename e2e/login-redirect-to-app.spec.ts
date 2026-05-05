/**
 * S4 (issue tadaify-app#190 Bug #3)
 *
 * "login OTP success lands on /app dashboard, not 404"
 *
 * Before fix:
 *   - login.tsx:187 had navigate("/dashboard")
 *   - /dashboard route does not exist → 404 page after OTP verify
 *
 * After fix:
 *   - navigate("/app") — the canonical dashboard route
 *   - User lands on /app with sidebar visible, no 404
 *
 * Prerequisites:
 *   - `supabase start` (Mailpit at http://localhost:54354)
 *   - `.dev.vars` configured with Workers env bindings
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Run: npx playwright test e2e/login-redirect-to-app.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAILPIT_URL = "http://localhost:54354";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const HANDLE = "t190s4login";
const EMAIL = `t190s4login@local.test`;

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

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await clearMailpit(EMAIL);
  await deleteHandleReservation(HANDLE);
});

test.afterAll(async () => {
  await deleteHandleReservation(HANDLE);
  await clearMailpit(EMAIL);
});

// ---------------------------------------------------------------------------
// S4 — login OTP success lands on /app dashboard, not 404 (Bug #3)
// Covers: issue tadaify-app#190 Bug #3
// ---------------------------------------------------------------------------

test(
  "S4 — login OTP success lands on /app dashboard, not 404",
  async ({ page }) => {
    // ── Step 1: Register a new user so login has a valid account ─────────────
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

    // Continue through password toggle and/or onboarding
    await expect(page.getByRole("button", { name: /continue/i }).last()).toBeEnabled({ timeout: 10_000 });
    await page.getByRole("button", { name: /continue/i }).last().click();

    // Wait until we're past the OTP step
    await expect(page).toHaveURL(/\/(onboarding|app)/, { timeout: 15_000 });

    // ── Step 2: Navigate to /login (simulate sign-out) ───────────────────────
    await clearMailpit(EMAIL);
    await page.goto("/login");

    // ── Step 3: Log in with OTP ───────────────────────────────────────────────
    await page.locator("#login-email").fill(EMAIL);
    await page.getByRole("button", { name: /send me a code/i }).click();

    // Wait for OTP entry section
    await expect(page.getByRole("textbox", { name: /digit 1/i })).toBeVisible({ timeout: 15_000 });

    const loginOtp = await getMailpitOtp(EMAIL, 30_000);
    expect(loginOtp).not.toBeNull();

    // Enter OTP
    const loginOtpInputs = page.getByRole("textbox", { name: /digit/i });
    for (let i = 0; i < 6; i++) {
      await loginOtpInputs.nth(i).fill(loginOtp![i]);
    }

    // Verify OTP
    await page.getByRole("button", { name: /verify code/i }).click();

    // ── Step 4: Assert land on /app, NOT /dashboard (Bug #3 fix) ─────────────
    await expect(page).toHaveURL(/\/app(\?|$|#)/, { timeout: 10_000 });

    // Assert page has dashboard markers (sidebar or main content)
    // /app renders <aside class="app-sidebar"> or similar
    await expect(page.locator("aside")).toBeVisible({ timeout: 5_000 });

    // Regression-lock: must NOT be on /dashboard (which 404s)
    expect(page.url()).not.toMatch(/\/dashboard/);

    // Regression-lock: page must NOT show "404" or "not found"
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/404/i);
    expect(bodyText).not.toMatch(/not found/i);
    expect(bodyText).not.toMatch(/could not be found/i);
  }
);
