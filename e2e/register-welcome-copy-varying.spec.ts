/**
 * S1 — Varying welcome header copy per /register section (DEC-358=B, tadaify-app#196)
 *
 * Spec: "varying header copy: 'Hey' on A → 'almost there' on B-otp → 'Welcome' on C"
 *
 * Walk through the register flow with a seeded handle. Assert that the header
 * text changes according to the DEC-358=B contract:
 *   A / B / B-email        → "Hey @{handle} 👋"
 *   B-otp / B-password-toggle  → "@{handle}, almost there..."
 *   C (post-signup)        → "Welcome @{handle}!"
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with Mailpit on :54354
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Run: npx playwright test e2e/register-welcome-copy-varying.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  // fallback to known local demo JWT (safe — local dev only)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const MAILPIT_URL = "http://localhost:54354";

// Unique handle/email per run (timestamp suffix avoids cross-run collisions)
const RUN_ID = Date.now();
const HANDLE = `t196vary`;
// use a unique email per run so Mailpit doesn't pick up stale messages
const EMAIL = `test-bug196-varying-copy-${RUN_ID}@local.test`;

// ---------------------------------------------------------------------------
// Helpers — cleanup
// ---------------------------------------------------------------------------

async function clearHandleReservation(handle: string): Promise<void> {
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

async function deleteAuthUserByEmail(email: string): Promise<void> {
  try {
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
  } catch {
    // best-effort
  }
}

async function clearMailpitForEmail(email: string): Promise<void> {
  try {
    const listRes = await fetch(
      `${MAILPIT_URL}/api/v1/messages?query=${encodeURIComponent(`to:${email}`)}`
    );
    if (!listRes.ok) return;
    const data = (await listRes.json()) as { messages?: Array<{ ID: string }> };
    for (const msg of data.messages ?? []) {
      await fetch(`${MAILPIT_URL}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: [msg.ID] }),
      });
    }
  } catch {
    // Mailpit not running — test will fail naturally at OTP step
  }
}

// ---------------------------------------------------------------------------
// Helpers — OTP via Mailpit (per feedback_supabase_local_inbucket_for_auth_testing.md)
// ---------------------------------------------------------------------------

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
            const msg = (await msgRes.json()) as { Text?: string; HTML?: string };
            const text = msg.Text ?? msg.HTML ?? "";
            const match = text.match(/\b(\d{6})\b/);
            if (match) return match[1];
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

async function enterOtp(page: Page, code: string): Promise<void> {
  const firstDigit = page.getByRole("textbox", { name: /digit 1/i });
  await firstDigit.click();
  await firstDigit.evaluate((el, value) => {
    const dt = new DataTransfer();
    dt.setData("text", value);
    const evt = new ClipboardEvent("paste", {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(evt);
  }, code);
}

// ---------------------------------------------------------------------------
// Suite setup / teardown
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await clearHandleReservation(HANDLE);
  await clearMailpitForEmail(EMAIL);
  await deleteAuthUserByEmail(EMAIL);
});

test.afterAll(async () => {
  await clearHandleReservation(HANDLE);
  await deleteAuthUserByEmail(EMAIL);
  await clearMailpitForEmail(EMAIL);
});

// ---------------------------------------------------------------------------
// S1 — Varying copy: Hey on A → almost there on B-otp → Welcome on C
//
// Covers: BR-002a (varying welcome copy, DEC-358=B)
// ---------------------------------------------------------------------------

test("varying header copy: 'Hey' on A → 'almost there' on B-otp → 'Welcome' on C", async ({ page }) => {
  await page.goto("/register");

  // ── Section A — Hey @{handle} 👋 ─────────────────────────────────────────
  await page.fill("#handle-input", HANDLE);

  // Header updates reactively (no debounce on header text)
  await expect(page.locator("header.welcome-header")).toContainText(`Hey @${HANDLE}`, {
    timeout: 3_000,
  });
  // Emoji is present in the Hey variant
  await expect(page.locator("header.welcome-header")).toContainText("👋");
  // B-otp / C copy must NOT appear on section A
  await expect(page.locator("header.welcome-header")).not.toContainText("almost there");
  await expect(page.locator("header.welcome-header")).not.toContainText("Welcome");

  // ── Section B — Hey @{handle} 👋 (same as A after Continue click) ────────
  await expect(page.locator("#handle-availability")).toContainText("Available!", { timeout: 8_000 });
  await page.click("button:has-text('Continue')");
  await expect(page.locator("[aria-label='Choose sign-in method']")).toBeVisible({ timeout: 8_000 });

  // Header still shows Hey on B
  await expect(page.locator("header.welcome-header")).toContainText(`Hey @${HANDLE}`);
  await expect(page.locator("header.welcome-header")).not.toContainText("almost there");

  // ── Section B-email — Hey @{handle} 👋 ───────────────────────────────────
  await page.click("button:has-text('Continue with Email')");
  await expect(page.locator("[aria-label='Enter email']")).toBeVisible({ timeout: 8_000 });

  await expect(page.locator("header.welcome-header")).toContainText(`Hey @${HANDLE}`);
  await expect(page.locator("header.welcome-header")).not.toContainText("almost there");

  // ── Send OTP code ─────────────────────────────────────────────────────────
  await page.fill("input[type='email']", EMAIL);
  await page.click("button:has-text('Send')");

  // ── Section B-otp — @{handle}, almost there... ───────────────────────────
  // Wait for OTP input grid to appear
  await page.waitForSelector("[aria-label='Enter verification code']", { timeout: 15_000 });

  // Header must switch to "almost there" copy
  await expect(page.locator("header.welcome-header")).toContainText(
    `@${HANDLE}, almost there...`,
    { timeout: 5_000 }
  );
  // Hey variant must no longer be shown (exact check: "Hey @" starts are gone)
  await expect(page.locator("header.welcome-header")).not.toContainText("Hey @");

  // ── Enter OTP via Mailpit (real email flow per DEC auth testing rules) ────
  const otp = await getMailpitOtp(EMAIL, 30_000);
  expect(otp, "OTP email must arrive in Mailpit within 30s").not.toBeNull();
  await enterOtp(page, otp!);

  // ── Section B-password-toggle — @{handle}, almost there... ───────────────
  await expect(page.locator("[aria-label='Login preference']")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("header.welcome-header")).toContainText(
    `@${HANDLE}, almost there...`,
    { timeout: 3_000 }
  );

  // Continue with OTP (default — no password toggle needed)
  await page.click("button:has-text('Continue with OTP')");

  // ── Section C — Welcome @{handle}! ───────────────────────────────────────
  // DEC-358=B contract: Section C MUST render "Welcome @{handle}!" on the
  // /register route before the auto-redirect to /onboarding/welcome.
  // Assert the header copy unconditionally — if the app skips C and redirects
  // straight to onboarding, this assertion correctly fails the test.
  await expect(page.locator("header.welcome-header")).toContainText(
    `Welcome @${HANDLE}!`,
    { timeout: 15_000 }
  );
  // "almost there" must be gone on C
  await expect(page.locator("header.welcome-header")).not.toContainText("almost there");

  // Now wait for the auto-redirect to /onboarding/welcome
  await expect(
    page.locator("[data-testid='onboarding-welcome']")
  ).toBeVisible({ timeout: 15_000 });
});
