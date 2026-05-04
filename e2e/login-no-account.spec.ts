/**
 * Playwright spec for issue tadaify-app#176 — friendly no-account UX on /login.
 *
 * Covers: BR-AUTH-05 (sign-in via OTP), TR-AUTH-01 (Supabase OTP)
 *         + acceptance criteria S1..S4 from issue tadaify-app#176.
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) — Mailpit at http://localhost:54354
 *   - `.dev.vars` configured with Workers env bindings
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Run: npx playwright test e2e/login-no-account.spec.ts
 *
 * Selector strategy mirrors e2e/register-cascade.spec.ts (Layer 5/6 pattern).
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAILPIT_URL = "http://localhost:54354";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  // local-dev demo JWT (safe — local only)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// Per-spec handle prefix — cleaned up in afterAll (Layer 3)
const HANDLE_PREFIX = "t176";

// ---------------------------------------------------------------------------
// Mailpit helpers (Layer 5 — copied verbatim from register-cascade.spec.ts)
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
    // Mailpit not running — test will fail naturally at email check step
  }
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
            const msg = (await msgRes.json()) as { Subject: string; HTML: string; Text: string };
            const fullContent = (msg.HTML ?? "") + (msg.Text ?? "");
            const match = fullContent.match(/\b(\d{6})\b/);
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

// ---------------------------------------------------------------------------
// Cleanup helper — best-effort (Layer 3)
// ---------------------------------------------------------------------------

async function cleanupHandleReservations(prefix: string): Promise<void> {
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
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Cleanup hooks
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

// ---------------------------------------------------------------------------
// S1 — Happy CTA flow
// Covers: issue tadaify-app#176 AC1 — non-existent email → no-account UI + CTA
// ---------------------------------------------------------------------------

test("S1 — happy CTA flow: /login no-account → CTA opens /register", async ({ page }) => {
  // A confidently non-existent address — random suffix avoids collisions
  // even if a previous run somehow leaked through cleanup.
  const email = `${HANDLE_PREFIX}-noacct-${Date.now()}@local.test`;

  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.getByRole("button", { name: /send me a code/i }).click();

  // No-account block must appear with the entered email pre-filled in CTA
  const block = page.getByTestId("no-account-block");
  await expect(block).toBeVisible({ timeout: 10_000 });
  await expect(block).toContainText(email);

  const cta = page.getByTestId("create-account-cta");
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).toBe(`/register?email=${encodeURIComponent(email)}`);

  // Click the CTA → /register opens with the email param
  await cta.click();
  await expect(page).toHaveURL(/\/register\?email=/);
});

// ---------------------------------------------------------------------------
// S2 — Register pre-fill from ?email=
// Covers: issue tadaify-app#176 AC2 — pre-filled email on /register
// ---------------------------------------------------------------------------

test("S2 — register pre-fill: visiting /register?email=<...> populates the email input", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}s2`;
  const email = `${HANDLE_PREFIX}s2@local.test`;

  await clearMailpitForEmail(email);

  // Land directly on /register?email=<...> as if redirected from the no-account CTA
  await page.goto(`/register?email=${encodeURIComponent(email)}`);

  // Section A — handle is still required; fill it and continue
  await page.locator("#handle-input").fill(handle);
  const continueBtn = page.getByRole("button", { name: /continue/i }).first();
  await expect(continueBtn).toBeEnabled({ timeout: 8_000 });
  await continueBtn.click();

  // Section B → click "Continue with Email" → Section B-email shows the input
  await page.getByRole("button", { name: /continue with email/i }).click();

  // The email input MUST be pre-filled (no-account → register flow)
  const emailInput = page.locator("#email-input");
  await expect(emailInput).toHaveValue(email, { timeout: 5_000 });

  // Send the code — the register flow advances to "check your email" with a real
  // OTP delivered to Mailpit. We assert the email arrived (proves the prefilled
  // address was used by the backend); full post-OTP redirect is out of scope here
  // and is already covered by register-cascade.spec.ts S1.
  await page.getByRole("button", { name: /send.*code/i }).click();
  await expect(
    page.getByRole("heading", { name: /check your email/i })
  ).toBeVisible({ timeout: 15_000 });
  const code = await getMailpitOtp(email, 30_000);
  expect(code).not.toBeNull();
});

// ---------------------------------------------------------------------------
// S3 — Happy login NOT regressed
// Covers: issue tadaify-app#176 AC3 — existing user still flows through /login
// ---------------------------------------------------------------------------

test("S3 — existing-user login still works (regression guard)", async ({ page }) => {
  // Existing-user happy path: when the backend reports { sent: true }, /login
  // MUST NOT render the no-account block — the OTP entry section MUST render
  // instead. We mock POST /api/auth/login-otp to remove flakiness from
  // upstream Supabase / Mailpit timing; the real OTP delivery flow is covered
  // separately by register-cascade.spec.ts S1.
  const email = `${HANDLE_PREFIX}-existing@local.test`;

  await page.route("**/api/auth/login-otp", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sent: true }),
    });
  });

  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.getByRole("button", { name: /send me a code/i }).click();

  // The no-account block MUST NOT appear for an existing user
  await expect(page.getByTestId("no-account-block")).not.toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId("create-account-cta")).not.toBeVisible();

  // The OTP entry section MUST render (6-digit grid), proving we advanced
  // past the email step exactly as the legacy login flow does.
  await expect(page.getByRole("textbox", { name: /digit 1/i })).toBeVisible({ timeout: 5_000 });
});

// ---------------------------------------------------------------------------
// S4 — Generic error no-leak
// Covers: issue tadaify-app#176 AC4 — server_error renders generic text
// ---------------------------------------------------------------------------

test("S4 — server_error renders generic text, NOT email-specific CTA", async ({ page }) => {
  const email = `${HANDLE_PREFIX}-srv-${Date.now()}@local.test`;

  // Intercept POST /api/auth/login-otp and force a server_error response
  // (mocking Supabase 500 deterministically via route fulfillment).
  await page.route("**/api/auth/login-otp", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "server_error" }),
    });
  });

  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.getByRole("button", { name: /send me a code/i }).click();

  // Generic inline error MUST be visible …
  const inlineError = page.getByRole("alert").filter({
    hasText: /something went wrong/i,
  });
  await expect(inlineError).toBeVisible({ timeout: 5_000 });

  // … and the no-account block + email-specific CTA MUST NOT appear (no-leak guarantee)
  await expect(page.getByTestId("no-account-block")).not.toBeVisible();
  await expect(page.getByTestId("create-account-cta")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S5 — Stale no-account block regression (Codex review F1)
// After a no_account response, a subsequent non-no_account response (e.g.
// server_error or invalid_email) MUST clear the no-account block and show the
// inline error instead.
// ---------------------------------------------------------------------------

test("S5 — stale no-account block clears on subsequent non-no_account submit", async ({ page }) => {
  const email = `${HANDLE_PREFIX}-stale-${Date.now()}@local.test`;
  let callCount = 0;

  // First call → no_account; second call → server_error
  await page.route("**/api/auth/login-otp", async (route) => {
    callCount++;
    if (callCount === 1) {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({ error: "no_account" }),
      });
    } else {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "server_error" }),
      });
    }
  });

  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.getByRole("button", { name: /send me a code/i }).click();

  // First submit — no-account block MUST appear
  await expect(page.getByTestId("no-account-block")).toBeVisible({ timeout: 5_000 });

  // Second submit (same email) — simulate retry that hits server_error
  await page.getByRole("button", { name: /send me a code/i }).click();

  // No-account block MUST be gone; inline generic error MUST be visible
  const inlineError = page.getByRole("alert").filter({
    hasText: /something went wrong/i,
  });
  await expect(inlineError).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId("no-account-block")).not.toBeVisible();
  await expect(page.getByTestId("create-account-cta")).not.toBeVisible();
});
