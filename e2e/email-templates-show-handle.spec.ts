/**
 * S2, S3 (issue tadaify-app#190 Bug #2, DEC-364=A)
 *
 * S2: "signup OTP email greets @{handle}, not @{email}"
 * S3: "login OTP email greets @{handle} from looked-up profile"
 *
 * Before fix (Bug #2):
 *   - Signup OTP email: "Hey @vvaser@gmail.com 👋" (email in greeting)
 *   - Login OTP email: "Welcome back, @vvaser@gmail.com" (email in greeting)
 *
 * After fix (DEC-364=A):
 *   - Signup OTP email: "Hey @<handle> 👋"
 *   - Login OTP email: "Welcome back, @<handle>"
 *   - Identity-linked email: "Hey @<handle>" (manual verification — OAuth trigger)
 *
 * Prerequisites:
 *   - `supabase start` (Mailpit at http://localhost:54354 — local port-band 5435X)
 *   - `.dev.vars` configured with Workers env bindings
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Run: npx playwright test e2e/email-templates-show-handle.spec.ts
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

// Unique seeds for this spec (prefix t190s2/s3) — unique per run for idempotency
const RUN_ID = Date.now();
const SIGNUP_HANDLE = `t190s2s${RUN_ID}`.slice(0, 30);
const SIGNUP_EMAIL = `t190s2s${RUN_ID}@local.test`;
const LOGIN_HANDLE = `t190s3l${RUN_ID}`.slice(0, 30);
const LOGIN_EMAIL = `t190s3l${RUN_ID}@local.test`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function clearMailpitForEmail(email: string): Promise<void> {
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
  } catch {
    // Mailpit not running — test will fail at email check step
  }
}

async function getMailpitEmailContent(email: string, timeoutMs = 30_000): Promise<{ subject: string; html: string; text: string } | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const listRes = await fetch(
        `${MAILPIT_URL}/api/v1/messages?query=${encodeURIComponent(`to:${email}`)}`
      );
      if (listRes.ok) {
        const data = (await listRes.json()) as { messages?: Array<{ ID: string; Subject: string }> };
        const msgs = data.messages ?? [];
        if (msgs.length > 0) {
          const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${msgs[0].ID}`);
          if (msgRes.ok) {
            const msg = (await msgRes.json()) as { Subject: string; HTML: string; Text: string };
            return { subject: msg.Subject ?? "", html: msg.HTML ?? "", text: msg.Text ?? "" };
          }
        }
      }
    } catch {
      // retry
    }
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
// S2 — signup OTP email greets @{handle}, not @{email}
// Covers Bug #2a (tadaify-app#190)
// ---------------------------------------------------------------------------

test.describe("S2 — signup OTP email greets @handle (DEC-364=A)", () => {
  test.beforeAll(async () => {
    await cleanupAuthUserByEmail(SIGNUP_EMAIL);
    await clearMailpitForEmail(SIGNUP_EMAIL);
    await deleteHandleReservation(SIGNUP_HANDLE);
  });

  test.afterAll(async () => {
    await cleanupAuthUserByEmail(SIGNUP_EMAIL);
    await deleteHandleReservation(SIGNUP_HANDLE);
    await clearMailpitForEmail(SIGNUP_EMAIL);
  });

  test("signup OTP email greets @{handle}, not @{email}", async ({ page }) => {
    await page.goto("/register");

    // Fill handle
    const handleInput = page.locator("#handle-input");
    await handleInput.fill(SIGNUP_HANDLE);

    // Wait for availability check
    const availability = page.locator("#handle-availability");
    await expect(availability).toContainText("Available!", { timeout: 8_000 });

    // Continue to method selection
    await page.getByRole("button", { name: /continue/i }).first().click();

    // Choose email path
    await page.getByRole("button", { name: /continue with email/i }).click();

    // Fill email
    const emailInput = page.locator("#email-input");
    await emailInput.fill(SIGNUP_EMAIL);

    // Send code
    await page.getByRole("button", { name: /send.*code/i }).click();

    // Wait for OTP screen to appear
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible({ timeout: 15_000 });

    // Retrieve email from Mailpit
    const email = await getMailpitEmailContent(SIGNUP_EMAIL, 30_000);
    expect(email).not.toBeNull();

    // Check HTML and text bodies INDEPENDENTLY (not concatenated)
    const htmlBody = email?.html ?? "";
    const textBody = email?.text ?? "";

    // HTML part MUST contain @handle
    expect(htmlBody).toContain(`@${SIGNUP_HANDLE}`);
    // Text part MUST contain @handle
    expect(textBody).toContain(`@${SIGNUP_HANDLE}`);

    // Regression-lock: email address must NOT appear as the @ greeting in EITHER part
    const emailPattern = new RegExp(`@${SIGNUP_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    expect(htmlBody).not.toMatch(emailPattern);
    expect(textBody).not.toMatch(emailPattern);
  });
});

// ---------------------------------------------------------------------------
// S3 — login OTP email greets @{handle} from looked-up profile
// Covers Bug #2b (tadaify-app#190)
// ---------------------------------------------------------------------------

test.describe("S3 — login OTP email greets @handle from profile lookup (DEC-364=A)", () => {
  test.beforeAll(async () => {
    await cleanupAuthUserByEmail(LOGIN_EMAIL);
    await clearMailpitForEmail(LOGIN_EMAIL);
    await deleteHandleReservation(LOGIN_HANDLE);
  });

  test.afterAll(async () => {
    await cleanupAuthUserByEmail(LOGIN_EMAIL);
    await deleteHandleReservation(LOGIN_HANDLE);
    await clearMailpitForEmail(LOGIN_EMAIL);
  });

  test("login OTP email greets @{handle} looked up from profile", async ({ page }) => {
    // Step 1: Register the user so they have a profile with a known handle.
    await page.goto("/register");
    const handleInput = page.locator("#handle-input");
    await handleInput.fill(LOGIN_HANDLE);

    const availability = page.locator("#handle-availability");
    await expect(availability).toContainText("Available!", { timeout: 8_000 });
    await page.getByRole("button", { name: /continue/i }).first().click();
    await page.getByRole("button", { name: /continue with email/i }).click();

    const emailInput = page.locator("#email-input");
    await emailInput.fill(LOGIN_EMAIL);
    await page.getByRole("button", { name: /send.*code/i }).click();
    await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible({ timeout: 15_000 });

    // Get OTP from Mailpit and complete registration
    const signupOtp = await getMailpitEmailContent(LOGIN_EMAIL, 30_000);
    expect(signupOtp).not.toBeNull();
    const otpMatch = ((signupOtp?.html ?? "") + (signupOtp?.text ?? "")).match(/\b(\d{6})\b/);
    expect(otpMatch).not.toBeNull();
    const otpCode = otpMatch![1];

    // Enter OTP digits
    const digits = page.getByRole("textbox");
    for (let i = 0; i < 6; i++) {
      await digits.nth(i).fill(otpCode[i]);
    }

    // Password toggle → continue with OTP mode (default)
    await expect(page.getByRole("button", { name: /continue/i }).last()).toBeEnabled({ timeout: 10_000 });
    await page.getByRole("button", { name: /continue/i }).last().click();

    // Wait for onboarding (Section C or onboarding redirect)
    await expect(page).toHaveURL(/\/(register|onboarding)/, { timeout: 10_000 });

    // Clear Mailpit for clean login test
    await clearMailpitForEmail(LOGIN_EMAIL);

    // Step 2: Log out (navigate to landing, then login)
    await page.goto("/login");

    // Step 3: Send login OTP
    await page.locator("#login-email").fill(LOGIN_EMAIL);
    await page.getByRole("button", { name: /send me a code/i }).click();

    // Wait for OTP entry or confirmation of sent
    await expect(
      page.getByRole("textbox", { name: /digit 1/i })
    ).toBeVisible({ timeout: 15_000 });

    // Step 4: Retrieve login OTP email from Mailpit and check greeting
    const loginEmail = await getMailpitEmailContent(LOGIN_EMAIL, 30_000);
    expect(loginEmail).not.toBeNull();

    // Check HTML and text bodies INDEPENDENTLY (not concatenated)
    const loginHtmlBody = loginEmail?.html ?? "";
    const loginTextBody = loginEmail?.text ?? "";

    // HTML part MUST greet with @handle
    expect(loginHtmlBody).toContain(`@${LOGIN_HANDLE}`);
    // Text part MUST greet with @handle
    expect(loginTextBody).toContain(`@${LOGIN_HANDLE}`);

    // Regression-lock: email address must NOT appear as the greeting target in EITHER part
    const loginEmailPattern = new RegExp(`@${LOGIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    expect(loginHtmlBody).not.toMatch(loginEmailPattern);
    expect(loginTextBody).not.toMatch(loginEmailPattern);
  });
});
