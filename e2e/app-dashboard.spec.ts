/**
 * Playwright test suite — App Dashboard (F-APP-DASHBOARD-001a, #171)
 *
 * Covers: BR-Slice-C, AC#1-AC#26, TR-tadaify-005, ECN-26a-01..26
 * DEC-332=D: welcome banner must never say "your page is live"
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - Mailpit accessible at http://localhost:54354
 *
 * Per-test handle isolation: t26as1–t26as7
 * Cleanup: afterAll deletes auth users + handle_reservations for t26as* prefix
 *
 * Per `feedback_tadaify_per_playwright_test_authorization.md`:
 * every test must be individually approved during local click-test before commit.
 *
 * Run: npx playwright test e2e/app-dashboard.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  // fallback: well-known local demo service-role JWT (safe — local dev only)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const MAILPIT_URL = "http://localhost:54354";

/** Handle prefix — all t26as* rows cleaned up in afterAll */
const HANDLE_PREFIX = "t26as";

// ---------------------------------------------------------------------------
// Helpers — Mailpit
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers — OTP entry (6-digit paste pattern from register-cascade.spec.ts)
// ---------------------------------------------------------------------------

async function enterOtp(page: Page, code: string): Promise<void> {
  const firstDigit = page.getByRole("textbox", { name: /digit 1/i });
  await firstDigit.click();
  await firstDigit.evaluate((el, value) => {
    const clipboardEvent = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(clipboardEvent, "clipboardData", {
      value: { getData: () => value },
    });
    el.dispatchEvent(clipboardEvent);
  }, code);
}

// ---------------------------------------------------------------------------
// Helpers — Supabase REST cleanup
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
      console.warn(`[cleanup] handle_reservations DELETE returned ${res.status}`);
    }
  } catch (e) {
    console.warn("[cleanup] handle_reservations cleanup failed:", e);
  }
}

async function cleanupAuthUsers(prefix: string): Promise<void> {
  // List and delete all auth users whose email starts with the prefix pattern
  try {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?per_page=100`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!res.ok) return;
    const data = (await res.json()) as { users?: Array<{ id: string; email?: string }> };
    const testUsers = (data.users ?? []).filter(
      (u) => u.email?.startsWith(prefix + "@") || u.email?.startsWith(prefix)
    );
    for (const u of testUsers) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
    }
  } catch (e) {
    console.warn("[cleanup] auth users cleanup failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Helpers — Register + complete wizard (shared across multiple tests)
// ---------------------------------------------------------------------------

/**
 * Complete Slice B (OTP register) for a given handle + email.
 * After this the user is authenticated (session cookie set by the app).
 */
async function registerViaOtp(
  page: Page,
  handle: string,
  email: string
): Promise<void> {
  await clearMailpitForEmail(email);

  // Step A: handle claim
  await page.goto("/register");
  await page.locator("#handle-input").fill(handle);
  const continueBtn = page.getByRole("button", { name: /continue/i }).first();
  await expect(continueBtn).toBeEnabled({ timeout: 6_000 });
  await continueBtn.click();

  // Step B: method — email
  await page.getByRole("button", { name: /continue with email/i }).click();
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("button", { name: /send.*code/i }).click();

  // Step C: OTP from Mailpit
  await expect(page).toHaveURL(/\/api\/auth\/verify|\/register/, { timeout: 10_000 });
  const otp = await getMailpitOtp(email);
  if (!otp) throw new Error(`[registerViaOtp] OTP not received for ${email}`);
  await enterOtp(page, otp);
  await page.getByRole("button", { name: /verify|confirm/i }).click();

  // Should redirect to /onboarding/welcome
  await expect(page).toHaveURL(/\/onboarding\/welcome/, { timeout: 10_000 });
  expect(new URL(page.url()).searchParams.get("handle")).toBe(handle);
}

/**
 * Complete the full 5-step wizard for a handle that has been registered.
 * Navigates from /onboarding/welcome through to /onboarding/complete.
 * After this, "Go to dashboard →" link is visible.
 */
async function completeWizard(
  page: Page,
  handle: string,
  displayName: string
): Promise<void> {
  // Step 1 — Welcome: select instagram
  await expect(page).toHaveURL(/\/onboarding\/welcome/);
  await page.locator("input[name='platform'][value='instagram']").check();
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });

  // Step 2 — Social: skip socials
  await page.locator("button[name='intent'][value='skip']").click();
  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 8_000 });

  // Step 3 — Profile: name + bio
  await page.locator("input#name").fill(displayName);
  await page.locator("textarea#bio").fill(`Bio for ${handle}`);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  // Step 4 — Template: accept default
  await expect(page.locator("input[name='tpl']").first()).toBeVisible({ timeout: 5_000 });
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/tier/, { timeout: 8_000 });

  // Step 5 — Tier: free plan
  await expect(page.locator("button[type='submit']")).toBeVisible({ timeout: 5_000 });
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/complete/, { timeout: 8_000 });
}

// ---------------------------------------------------------------------------
// Global lifecycle
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
  await cleanupAuthUsers(HANDLE_PREFIX);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
  await cleanupAuthUsers(HANDLE_PREFIX);
});

// ---------------------------------------------------------------------------
// S1 — Happy path: complete onboarding → land on /app → see ready dashboard
// Prerequisite: Slice B + Slice C for t26as1
// Covers: Visual checklist, AC#1, ECN-26a-05, DEC-332=D
// ---------------------------------------------------------------------------

test("S1 — complete onboarding → /app ready dashboard", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}1`;
  const email = `${handle}@example.com`;
  const displayName = "App Test One";

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, displayName);

  // Go to dashboard from /onboarding/complete
  await expect(page.getByRole("link", { name: /go to (your )?dashboard/i })).toBeVisible({
    timeout: 5_000,
  });
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Appbar: wordmark visible (3-span DEC-WORDMARK-01)
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });

  // Sidebar: Homepage nav active
  await expect(page.locator("[data-testid='app-sidebar']")).toBeVisible();
  // Homepage nav item should be active
  await expect(page.locator("[data-nav='page'][aria-current='page']")).toBeVisible();

  // Welcome banner with DEC-332=D copy (NOT "your page is live")
  const banner = page.locator("[data-testid='welcome-banner']");
  await expect(banner).toBeVisible();
  const bannerText = await banner.textContent();
  expect(bannerText?.toLowerCase()).not.toContain("your page is live");
  expect(bannerText?.toLowerCase()).toContain("add your first block to publish");

  // Empty-state quick-start cards (no blocks yet)
  await expect(page.locator("[data-testid='empty-state-cards']")).toBeVisible();
});

// ---------------------------------------------------------------------------
// S2 — Onboarding-interrupt: register-only → /app shows finish-setup banner
// Prerequisite: Slice B only — do NOT walk wizard
// Covers: ECN-26a-01
// ---------------------------------------------------------------------------

test("S2 — register-only user → /app finish-setup banner", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}2`;
  const email = `${handle}@example.com`;

  // Complete only Slice B (OTP register, stops at /onboarding/welcome)
  await registerViaOtp(page, handle, email);
  // Do NOT walk wizard — navigate directly to /app
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Welcome banner should be visible with deep-link CTA to /onboarding/welcome
  const banner = page.locator("[data-testid='welcome-banner']");
  await expect(banner).toBeVisible({ timeout: 8_000 });

  // CTA should link to /onboarding/welcome (interrupted-welcome state)
  const cta = page.locator("[data-testid='welcome-banner'] a[href*='/onboarding/welcome']");
  await expect(cta).toBeVisible();
});

// ---------------------------------------------------------------------------
// S3 — Onboarding-interrupt: partial wizard (through /profile) → /app partial state
// Prerequisite: walk welcome → social → profile; skip template + tier
// Covers: ECN-26a-03
// ---------------------------------------------------------------------------

test("S3 — partial wizard through /profile → /app shows resume-to-template CTA", async ({
  page,
}) => {
  const handle = `${HANDLE_PREFIX}3`;
  const email = `${handle}@example.com`;
  const displayName = "App Test Three";

  await registerViaOtp(page, handle, email);

  // Walk only steps 1-3 (welcome → social → profile), stop before template
  await expect(page).toHaveURL(/\/onboarding\/welcome/);
  await page.locator("input[name='platform'][value='instagram']").check();
  await page.locator("button[name='intent'][value='continue']").click();
  await expect(page).toHaveURL(/\/onboarding\/social/, { timeout: 8_000 });

  await page.locator("button[name='intent'][value='skip']").click();
  await expect(page).toHaveURL(/\/onboarding\/profile/, { timeout: 8_000 });

  await page.locator("input#name").fill(displayName);
  await page.locator("textarea#bio").fill(`Bio for ${handle}`);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  // Stop here — navigate directly to /app
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Welcome banner CTA should deep-link to /onboarding/template (interrupted-profile state)
  const banner = page.locator("[data-testid='welcome-banner']");
  await expect(banner).toBeVisible({ timeout: 8_000 });

  // CTA links to /onboarding/template
  const cta = page.locator("[data-testid='welcome-banner'] a[href*='/onboarding/template']");
  await expect(cta).toBeVisible();

  // Empty-state cards still visible (no blocks)
  await expect(page.locator("[data-testid='empty-state-cards']")).toBeVisible();
});

// ---------------------------------------------------------------------------
// S4 — Theme toggle persists across reload
// Prerequisite: complete onboarding for t26as4
// Covers: Visual checklist theme toggle, AC#4
// ---------------------------------------------------------------------------

test("S4 — theme toggle persists across reload", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}4`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Theme Test");

  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });

  // Click theme toggle
  const toggle = page.locator("[data-testid='theme-toggle']");
  await expect(toggle).toBeVisible();
  await toggle.click();

  // body should have dark-mode class
  await expect(page.locator("body")).toHaveClass(/dark-mode/, { timeout: 3_000 });

  // Reload — dark mode should persist (written to localStorage)
  await page.reload();
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("body")).toHaveClass(/dark-mode/);

  // Toggle back to light
  await page.locator("[data-testid='theme-toggle']").click();
  await expect(page.locator("body")).not.toHaveClass(/dark-mode/, { timeout: 3_000 });

  // Reload — light mode should persist
  await page.reload();
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("body")).not.toHaveClass(/dark-mode/);
});

// ---------------------------------------------------------------------------
// S5 — Handle pill copies URL to clipboard
// Prerequisite: complete onboarding for t26as5
// Covers: Visual checklist handle-pill, AC#5
// ---------------------------------------------------------------------------

test("S5 — handle pill copies URL to clipboard", async ({ page, context }) => {
  const handle = `${HANDLE_PREFIX}5`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Handle Pill Test");

  // Grant clipboard permissions
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });
  await expect(page.locator("[data-testid='handle-pill']")).toBeVisible({ timeout: 8_000 });

  // Click handle pill
  await page.locator("[data-testid='handle-pill']").click();

  // Assert checkmark visual feedback
  await expect(
    page.locator("[data-clipboard-feedback='copied']")
  ).toBeVisible({ timeout: 3_000 });

  // Assert clipboard contains the correct URL
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(`https://tadaify.com/${handle}`);
});

// ---------------------------------------------------------------------------
// S6 — Welcome banner dismiss persists
// Prerequisite: complete onboarding for t26as6
// Covers: ECN-26a-06, AC#11
// ---------------------------------------------------------------------------

test("S6 — welcome banner dismiss persists after reload", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}6`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Dismiss Test");

  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  const banner = page.locator("[data-testid='welcome-banner']");
  await expect(banner).toBeVisible({ timeout: 8_000 });

  // Dismiss the banner
  await page.locator("[data-testid='welcome-banner-dismiss']").click();
  await expect(banner).not.toBeVisible({ timeout: 3_000 });

  // Reload — banner should NOT reappear
  await page.reload();
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });
  await expect(page.locator("[data-testid='welcome-banner']")).not.toBeVisible();

  // Verify via REST: account_settings.welcome_dismissed = true
  // First get the user id from auth
  const userRes = await page.evaluate(
    async ({ supabaseUrl, serviceKey }) => {
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=100`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });
      return res.ok ? res.json() : null;
    },
    { supabaseUrl: SUPABASE_URL, serviceKey: SERVICE_ROLE_KEY }
  );
  const users = (userRes as { users?: Array<{ id: string; email?: string }> })?.users ?? [];
  const user = users.find((u) => u.email === email);
  if (user) {
    const settingsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/account_settings?id=eq.${user.id}&select=welcome_dismissed`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const rows = (await settingsRes.json()) as Array<{ welcome_dismissed: boolean }>;
    expect(rows[0]?.welcome_dismissed).toBe(true);
  }
});

// ---------------------------------------------------------------------------
// S7 — Mobile viewport: bottom-bar visible, sidebar hidden
// Prerequisite: complete onboarding for t26as7; viewport 375×812
// Covers: Visual checklist mobile bottom-bar, AC#3, ECN-26a-12
// ---------------------------------------------------------------------------

test("S7 — mobile viewport: bottom-bar visible, sidebar hidden", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}7`;
  const email = `${handle}@example.com`;

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Mobile Test");

  await page.goto("/app");
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });
  await expect(page.locator("[data-testid='app-appbar']")).toBeVisible({ timeout: 8_000 });

  // Mobile tabs should be visible
  const mobileTabs = page.locator("[data-testid='mobile-tabs']");
  await expect(mobileTabs).toBeVisible();

  // Sidebar should be hidden (computed display: none)
  const sidebar = page.locator("[data-testid='app-sidebar']");
  const sidebarDisplay = await sidebar.evaluate((el) => {
    return window.getComputedStyle(el).display;
  });
  expect(sidebarDisplay).toBe("none");

  // Assert 5 mobile tabs render: Home/Design/Insights/Shop/Settings
  const tabs = [
    page.locator("[data-testid='mobile-tabs'] [data-nav='page']"),
    page.locator("[data-testid='mobile-tabs'] [data-nav='design']"),
    page.locator("[data-testid='mobile-tabs'] [data-nav='insights']"),
    page.locator("[data-testid='mobile-tabs'] [data-nav='shop']"),
    page.locator("[data-testid='mobile-tabs'] [data-nav='settings']"),
  ];
  for (const tab of tabs) {
    await expect(tab).toBeVisible();
  }
});
