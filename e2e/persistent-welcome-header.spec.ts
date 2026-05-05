/**
 * Playwright spec: persistent welcome header across all /register sections (S1-S4)
 *
 * Story: F-002a — persistent welcome header + universal alternatives (tadaify-app#187)
 * Covers: DEC-352=A (lift to route-level) + DEC-358=A (stable copy on every section)
 *
 * S1: Desktop 1440 — welcome header persists through A → B → B-email → B-otp → B-password-toggle → C
 * S2: Tablet 768×1024 — welcome header visible + non-overlapping on all sections
 * S3: Mobile 375×812 — header height ≤56px + aria-live="polite"
 * S4: Real-time handle update — header text tracks handle input character-by-character
 *
 * Prerequisites:
 *   - `supabase start` + `npm run dev` (App: http://localhost:5173)
 *   - Supabase service-role key available in env or fallback JWT used
 *
 * Run: npx playwright test e2e/persistent-welcome-header.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const MAILPIT_URL = "http://localhost:54354";

// Unique per-test handle prefix to avoid collisions with parallel test runs
const HANDLE_S1 = "t002as1hdr";
const HANDLE_S4 = "t002as4upd";

// ---------------------------------------------------------------------------
// Helpers
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
    // best-effort cleanup
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
    // best-effort cleanup
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
// S1 — Desktop 1440px: welcome header persists through full flow
//      A → B → B-email → B-otp → B-password-toggle → C
// ---------------------------------------------------------------------------

test.describe("S1: desktop 1440px — persistent welcome header", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const S1_EMAIL = `t002as1hdr-${Date.now()}@local.test`;

  test.afterAll(async () => {
    await clearHandleReservation(HANDLE_S1);
    await deleteAuthUserByEmail(S1_EMAIL);
    await clearMailpitForEmail(S1_EMAIL);
  });

  test("welcome header visible on Section A with correct handle + brand wordmark", async ({ page }) => {
    await page.goto("/register");

    // Type handle
    await page.fill("#handle-input", HANDLE_S1);

    // Wait for header to update (real-time, no debounce on header)
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);

    // Brand wordmark must have all 3 spans
    await expect(page.locator("header.welcome-header .brand-wordmark")).toBeVisible();
  });

  test("welcome header persists on Section B after Continue click", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", HANDLE_S1);

    // Wait for availability check (300ms debounce + DB round-trip)
    await expect(page.locator("#handle-availability")).toContainText("Available!", { timeout: 5000 });

    // Proceed to Section B
    await page.click("button:has-text('Continue')");
    await expect(page.locator("[aria-label='Choose sign-in method']")).toBeVisible();

    // Header must still be visible with the same handle
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);
  });

  test("welcome header persists on Section B-email after Email click", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", HANDLE_S1);
    await expect(page.locator("#handle-availability")).toContainText("Available!", { timeout: 5000 });
    await page.click("button:has-text('Continue')");
    await expect(page.locator("[aria-label='Choose sign-in method']")).toBeVisible();

    // Click email flow
    await page.click("button:has-text('Continue with Email')");
    await expect(page.locator("[aria-label='Enter email']")).toBeVisible();

    // Header still visible + same handle
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);
  });

  test("welcome header persists through B-otp → B-password-toggle → C (full email OTP flow)", async ({ page }) => {
    await clearMailpitForEmail(S1_EMAIL);
    await page.goto("/register");
    await page.fill("#handle-input", HANDLE_S1);
    await expect(page.locator("#handle-availability")).toContainText("Available!", { timeout: 5000 });
    await page.click("button:has-text('Continue')");
    await expect(page.locator("[aria-label='Choose sign-in method']")).toBeVisible();

    // Email flow → enter email → send code
    await page.click("button:has-text('Continue with Email')");
    await expect(page.locator("[aria-label='Enter email']")).toBeVisible();
    await page.fill("input[type='email']", S1_EMAIL);
    await page.click("button:has-text('Send')");

    // ── B-otp: header persists ──
    await page.waitForSelector("[aria-label='Enter verification code']", { timeout: 15000 });
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);

    // Fetch OTP from Mailpit and enter it
    const otp = await getMailpitOtp(S1_EMAIL);
    expect(otp).not.toBeNull();
    await enterOtp(page, otp!);

    // ── B-password-toggle: header persists ──
    await expect(page.locator("[aria-label='Login preference']")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);

    // Continue with default OTP mode
    await page.click("button:has-text('Continue →')");

    // ── Section C (success): header persists ──
    await expect(page.locator("[aria-label='Registration complete']")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText(`@${HANDLE_S1}`);
  });
});

// ---------------------------------------------------------------------------
// S2 — Tablet 768×1024: header visible + non-overlapping on all sections
// ---------------------------------------------------------------------------

test.describe("S2: tablet 768×1024 — welcome header visible + proportionally scaled", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("welcome header is visible on Section A at tablet viewport", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", "t002as2tab");

    // Header must be visible on tablet
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText("@t002as2tab");
  });

  test("welcome header does not overlap form elements on tablet", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", "t002as2tab");

    const headerBox = await page.locator("header.welcome-header").boundingBox();
    const handleInputBox = await page.locator("#handle-input").boundingBox();

    expect(headerBox).not.toBeNull();
    expect(handleInputBox).not.toBeNull();

    if (headerBox && handleInputBox) {
      // Header bottom must be above (or at) handle input top — no overlap
      const headerBottom = headerBox.y + headerBox.height;
      expect(headerBottom).toBeLessThanOrEqual(handleInputBox.y);
    }
  });

  test("welcome header persists on Section B at tablet viewport", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", "t002as2tab");
    await expect(page.locator("#handle-availability")).toContainText("Available!", { timeout: 5000 });
    await page.click("button:has-text('Continue')");
    await expect(page.locator("[aria-label='Choose sign-in method']")).toBeVisible();

    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText("@t002as2tab");
  });
});

// ---------------------------------------------------------------------------
// S3 — Mobile 375×812: header height ≤56px + aria-live="polite"
// ---------------------------------------------------------------------------

test.describe("S3: mobile 375×812 — header height constraint + a11y", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("welcome header height is ≤56px on mobile", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#handle-input", "t002as3mob");

    await expect(page.locator("header.welcome-header")).toBeVisible();

    const box = await page.locator("header.welcome-header").boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Per issue spec: max-height 56px on mobile
      expect(box.height).toBeLessThanOrEqual(56);
    }
  });

  test("header.welcome-header has aria-live='polite' (a11y, ECN-002a-06)", async ({ page }) => {
    await page.goto("/register");

    // Check aria-live attribute on the header element
    const ariaLive = await page.locator("header.welcome-header").getAttribute("aria-live");
    expect(ariaLive).toBe("polite");
  });

  test("welcome header visible on mobile with placeholder when no handle typed", async ({ page }) => {
    await page.goto("/register");

    // On fresh load, header should show placeholder 'yourname'
    await expect(page.locator("header.welcome-header")).toBeVisible();
    await expect(page.locator("header.welcome-header")).toContainText("yourname");
  });
});

// ---------------------------------------------------------------------------
// S4 — Real-time handle update: header tracks handle input character-by-character
// ---------------------------------------------------------------------------

test.describe("S4: real-time handle update — header tracks input without debounce", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.afterAll(async () => {
    await clearHandleReservation(HANDLE_S4);
  });

  test("header text updates character-by-character as user types handle", async ({ page }) => {
    await page.goto("/register");

    const input = page.locator("#handle-input");
    const header = page.locator("header.welcome-header");

    // Start with empty — header shows placeholder
    await expect(header).toContainText("yourname");

    // Type one character at a time and verify header updates
    const chars = "t002";
    for (let i = 0; i < chars.length; i++) {
      await input.type(chars[i], { delay: 50 });
      const typed = chars.slice(0, i + 1);
      await expect(header).toContainText(`@${typed}`);
    }
  });

  test("header shows @yourname placeholder when handle input is cleared (ECN-002a-01)", async ({ page }) => {
    await page.goto("/register");

    const input = page.locator("#handle-input");
    await input.fill("t002as4upd");

    // Header shows handle
    await expect(page.locator("header.welcome-header")).toContainText("@t002as4upd");

    // Clear input
    await input.fill("");

    // Header falls back to placeholder
    await expect(page.locator("header.welcome-header")).toContainText("yourname");
  });
});
