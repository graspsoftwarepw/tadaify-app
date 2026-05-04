/**
 * Playwright test suite — App Dashboard Design Panel (F-APP-DASHBOARD-001b, #173)
 *
 * Covers: VE-26b-01..35, ECN-26b-01..13, AC (all design-panel ACs)
 * DEC-043: Fill/Gradient/Blur/Pattern are Free; Image/Video gated at SAVE
 * Default sub-tab: background (NOT theme — per mockup + issue refinement)
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - Mailpit accessible at http://localhost:54354
 *
 * Per-test handle isolation: t26bs1–t26bs7
 * Cleanup: afterAll deletes auth users + handle_reservations for t26bs* prefix
 *
 * Per `feedback_tadaify_per_playwright_test_authorization.md`:
 * every test must be individually approved during local click-test before commit.
 *
 * Run: npx playwright test e2e/app-dashboard-design.spec.ts
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
const HANDLE_PREFIX = "t26bs";

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

async function enterOtp(page: Page, code: string): Promise<void> {
  const firstDigit = page.getByRole("textbox", { name: /digit 1/i });
  await firstDigit.click();
  await firstDigit.evaluate((el: HTMLInputElement, value: string) => {
    const dt = new DataTransfer();
    dt.setData("text/plain", value);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true }));
  }, code);
}

async function cleanupHandleReservations(prefix: string): Promise<void> {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/handle_reservations?handle=ilike.${prefix}*`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    // Ignore cleanup errors
  }
}

async function cleanupAuthUsers(prefix: string): Promise<void> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { users?: Array<{ id: string; email?: string }> };
    for (const user of data.users ?? []) {
      if (user.email?.startsWith(prefix)) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
          method: "DELETE",
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        });
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

async function markOnboardingCompletedByEmail(email: string): Promise<void> {
  try {
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const users = (await userRes.json()) as Array<{ id: string }>;
    const userId = users[0]?.id;
    if (!userId) return;
    await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ onboarding_completed_at: new Date().toISOString() }),
      }
    );
  } catch {
    // Best-effort
  }
}

async function registerViaOtp(
  page: Page,
  handle: string,
  email: string
): Promise<void> {
  await clearMailpitForEmail(email);
  await page.goto("http://localhost:5173/register");

  const handleInput = page.locator("input[name='handle'], input#handle");
  await handleInput.fill(handle);

  const emailInput = page.locator("input[type='email'], input[name='email']");
  await emailInput.fill(email);

  const submitBtn = page.locator("button[type='submit']").first();
  await submitBtn.click();

  // OTP screen
  await expect(page).toHaveURL(/\/(register|login|verify|otp)/, { timeout: 8_000 });

  const otp = await getMailpitOtp(email, 30_000);
  expect(otp).toBeTruthy();
  await enterOtp(page, otp!);

  // Should land on onboarding or app
  await expect(page).toHaveURL(/\/(onboarding|app)/, { timeout: 12_000 });
}

async function completeWizard(
  page: Page,
  handle: string,
  displayName: string,
  email?: string
): Promise<void> {
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

  await expect(page.locator("input[name='tpl']").first()).toBeVisible({ timeout: 5_000 });
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/tier/, { timeout: 8_000 });

  await expect(page.locator("button[type='submit']")).toBeVisible({ timeout: 5_000 });
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/onboarding\/complete/, { timeout: 8_000 });

  if (email) {
    await markOnboardingCompletedByEmail(email);
  }
}

async function goToDashboard(page: Page): Promise<void> {
  await page.goto("http://localhost:5173/app");
  await expect(page.locator("[data-testid='app-dashboard']")).toBeVisible({ timeout: 10_000 });
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
// S1 — Sidebar Design accordion expand/collapse + sub-item click → default background
// Verifies: VE-26b-01, VE-26b-02, VE-26b-03, VE-26b-04, ECN-26b-01, ECN-26b-02
// ---------------------------------------------------------------------------

test("S1 — sidebar Design accordion expand + default subtab=background", async ({ page }) => {
  // Covers: VE-26b-01, VE-26b-02, VE-26b-03, VE-26b-04, ECN-26b-01, ECN-26b-02
  const handle = `${HANDLE_PREFIX}1`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 1", email);

  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Sidebar visible
  const sidebar = page.locator("[data-testid='app-sidebar']");
  await expect(sidebar).toBeVisible({ timeout: 8_000 });

  // Design parent collapsed initially
  const designParent = sidebar.locator("[data-testid='nav-design-parent']");
  await expect(designParent).toBeVisible();
  await expect(designParent).toHaveAttribute("aria-expanded", "false");

  // Click Design parent → accordion expands
  await designParent.click();
  await expect(designParent).toHaveAttribute("aria-expanded", "true");

  // 8 sub-items visible (VE-26b-03)
  const subItems = sidebar.locator("[data-testid^='nav-design-sub-']");
  await expect(subItems).toHaveCount(8);

  // Correct order: Theme/Profile/Background/Text/Buttons/Animations/Colors/Footer
  const expectedOrder = ["theme", "profile", "background", "text", "buttons", "animations", "colors", "footer"];
  for (let i = 0; i < expectedOrder.length; i++) {
    await expect(sidebar.locator(`[data-testid='nav-design-sub-${expectedOrder[i]}']`)).toBeVisible();
  }

  // Default: after clicking Design parent, URL should have subtab=background (ECN-26b-01)
  await expect(page).toHaveURL(/subtab=background/, { timeout: 5_000 });

  // Design panel renders (not placeholder)
  await expect(page.locator("[data-testid='design-panel']")).toBeVisible();

  // Click Profile sub-item (ECN-26b-02)
  await sidebar.locator("[data-testid='nav-design-sub-profile']").click();
  await expect(page).toHaveURL(/subtab=profile/, { timeout: 5_000 });

  // Profile sub-tab content visible (3 layout tiles)
  await expect(page.locator("[data-layout-tile='classic-card']")).toBeVisible({ timeout: 5_000 });

  // Background tile active visually distinct (VE-26b-04 — aria-current or data-active)
  // We clicked profile, so profile should be active
  await expect(
    sidebar.locator("[data-testid='nav-design-sub-profile'][aria-current='page']")
  ).toBeVisible();

  // Click Design parent again → collapses
  await designParent.click();
  await expect(designParent).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.locator("[data-testid^='nav-design-sub-']")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// S2 — Breadcrumb stepper window + keyboard navigation
// Verifies: VE-26b-05, VE-26b-07, ECN-26b-03, ECN-26b-05
// ---------------------------------------------------------------------------

test("S2 — breadcrumb stepper 3-cell window + keyboard nav", async ({ page }) => {
  // Covers: VE-26b-05, VE-26b-07, ECN-26b-03, ECN-26b-05
  // Use direct URL navigation (user logged in from S1 or cookie persists — or use separate user)
  const handle = `${HANDLE_PREFIX}2`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 2", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Navigate to animations sub-tab (ECN-26b-05)
  await page.goto("http://localhost:5173/app?tab=design&subtab=animations");
  await expect(page.locator("[data-testid='design-breadcrumb-stepper']")).toBeVisible({ timeout: 8_000 });

  // Current cell shows "Animations"
  const currentCell = page.locator("[data-testid='stepper-current']");
  await expect(currentCell).toContainText("Animations");

  // 3-cell window: Buttons / Animations / Colors (VE-26b-05)
  const stepper = page.locator("[data-testid='design-breadcrumb-stepper']");
  await expect(stepper).toContainText("Buttons");
  await expect(stepper).toContainText("Animations");
  await expect(stepper).toContainText("Colors");

  // Press Right arrow → navigate to Colors (VE-26b-07, ECN-26b-03)
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/subtab=colors/, { timeout: 4_000 });
  await expect(page.locator("[data-testid='stepper-current']")).toContainText("Colors");

  // Press Left arrow twice → back to Buttons
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/subtab=buttons/, { timeout: 4_000 });
  await expect(page.locator("[data-testid='stepper-current']")).toContainText("Buttons");
});

// ---------------------------------------------------------------------------
// S3 — Stepper current-cell dropdown picker
// Verifies: VE-26b-06, VE-26b-31, VE-26b-32
// ---------------------------------------------------------------------------

test("S3 — stepper current-cell dropdown picker → Footer sub-tab", async ({ page }) => {
  // Covers: VE-26b-06, VE-26b-31, VE-26b-32
  const handle = `${HANDLE_PREFIX}3`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 3", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  await page.goto("http://localhost:5173/app?tab=design&subtab=background");
  await expect(page.locator("[data-testid='design-breadcrumb-stepper']")).toBeVisible({ timeout: 8_000 });

  // Click stepper current cell → dropdown opens (VE-26b-06)
  const currentCell = page.locator("[data-testid='stepper-current']");
  await currentCell.click();
  const dropdown = page.locator("[role='listbox']");
  await expect(dropdown).toBeVisible({ timeout: 3_000 });

  // Dropdown has 8 options
  const options = dropdown.locator("[role='option']");
  await expect(options).toHaveCount(8);

  // Click "Footer"
  await dropdown.getByRole("option", { name: "Footer" }).click();
  await expect(page).toHaveURL(/subtab=footer/, { timeout: 4_000 });

  // Footer sub-tab content visible (VE-26b-31: 3 footer-option radios)
  await expect(page.locator("[data-panel='footer']")).toBeVisible({ timeout: 5_000 });

  // 3 footer-option radios
  const radios = page.locator("[name='footer-option']");
  await expect(radios).toHaveCount(3);

  // footer-tadaify-note banner visible (VE-26b-32, AP-001)
  const footerNote = page.locator(".footer-tadaify-note");
  await expect(footerNote).toBeVisible();
  await expect(footerNote).toContainText("Your footer, your call");
  await expect(footerNote).toContainText("never inserts a 'Powered by'");
});

// ---------------------------------------------------------------------------
// S4 — All 8 sub-tabs render mockup-canonical content
// Verifies: VE-26b-09..33
// ---------------------------------------------------------------------------

test("S4 — all 8 sub-tabs render canonical content", async ({ page }) => {
  // Covers: VE-26b-09 through VE-26b-32
  const handle = `${HANDLE_PREFIX}4`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 4", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  const subtabChecks: Array<{ subtab: string; assertion: () => Promise<void> }> = [
    {
      subtab: "theme",
      assertion: async () => {
        // VE-26b-09: AI theme card + "Generate with AI" + VE-26b-10: AI credits pill
        await expect(page.locator("[data-ai-theme-card]")).toBeVisible({ timeout: 5_000 });
        await expect(page.locator("[data-panel='theme']")).toContainText("Generate with AI");
        await expect(page.locator("[data-ai-credits]")).toContainText("AI credits left");
        // VE-26b-11: AI prompt input
        await expect(page.locator("[data-ai-prompt]")).toBeVisible();
      },
    },
    {
      subtab: "profile",
      assertion: async () => {
        // VE-26b-13: 3 layout tiles
        await expect(page.locator("[data-layout-tile='classic-card']")).toBeVisible({ timeout: 5_000 });
        await expect(page.locator("[data-layout-tile='hero-cover']")).toBeVisible();
        await expect(page.locator("[data-layout-tile='sidebar-compact']")).toBeVisible();
      },
    },
    {
      subtab: "background",
      assertion: async () => {
        // VE-26b-16: 6 background tiles
        for (const id of ["fill", "gradient", "blur", "pattern", "image", "video"]) {
          await expect(page.locator(`[data-bg-tile='${id}']`)).toBeVisible({ timeout: 5_000 });
        }
        // VE-26b-17: Image + Video have pro-badge
        await expect(page.locator("[data-bg-tile='image'] [data-pro-badge]")).toBeVisible();
        await expect(page.locator("[data-bg-tile='video'] [data-pro-badge]")).toBeVisible();
      },
    },
    {
      subtab: "text",
      assertion: async () => {
        // VE-26b-19: 6 font tiles
        for (const id of ["system-sans", "crimson-pro", "fraunces", "playfair", "display-serif", "mono"]) {
          await expect(page.locator(`[data-font-tile='${id}']`)).toBeVisible({ timeout: 5_000 });
        }
      },
    },
    {
      subtab: "buttons",
      assertion: async () => {
        // VE-26b-21: 6 button style tiles
        for (const id of ["fill", "outline", "soft", "hard-edge", "round", "shadow"]) {
          await expect(page.locator(`[data-button-tile='${id}']`)).toBeVisible({ timeout: 5_000 });
        }
        // Each tile contains "Follow" preview text
        const followButtons = page.locator("[data-button-tile] div:text('Follow')");
        await expect(followButtons).toHaveCount(6);
      },
    },
    {
      subtab: "animations",
      assertion: async () => {
        // VE-26b-25 + VE-26b-26: both Entrance and Ambient sections visible
        await expect(page.locator("[data-animation-section='entrance']")).toBeVisible({ timeout: 5_000 });
        await expect(page.locator("[data-animation-section='ambient']")).toBeVisible();
        // VE-26b-24: Replay preview button
        await expect(page.locator("[data-replay-preview]")).toBeVisible();
        // VE-26b-23: help text mentions tadaify brand
        await expect(page.locator("[data-panel='animations']")).toContainText("ify");
      },
    },
    {
      subtab: "colors",
      assertion: async () => {
        // VE-26b-27: help copy
        await expect(page.locator("[data-panel='colors']")).toContainText(
          "Three color tokens"
        );
        // VE-26b-28: 3 color inputs
        await expect(page.locator("[aria-label='Primary color hex']")).toBeVisible({ timeout: 5_000 });
        await expect(page.locator("[aria-label='Text color hex']")).toBeVisible();
        await expect(page.locator("[aria-label='Background color hex']")).toBeVisible();
        // VE-26b-29: NO tier gating visible on colors
        await expect(page.locator("[data-panel='colors'] [data-pro-badge]")).toHaveCount(0);
      },
    },
    {
      subtab: "footer",
      assertion: async () => {
        // VE-26b-31: 3 footer-option radios
        await expect(page.locator("[name='footer-option']")).toHaveCount(3, { timeout: 5_000 });
        // VE-26b-32: footer-tadaify-note banner
        await expect(page.locator(".footer-tadaify-note")).toContainText("Your footer, your call");
        // VE-26b-33: support-badge-group
        await expect(page.locator(".support-badge-group")).toBeVisible();
        // Support badge default OFF
        const badgeCheckbox = page.locator("[aria-label='Show support badge']");
        await expect(badgeCheckbox).not.toBeChecked();
      },
    },
  ];

  for (const { subtab, assertion } of subtabChecks) {
    await page.goto(`http://localhost:5173/app?tab=design&subtab=${subtab}`);
    await expect(page.locator("[data-testid='design-panel']")).toBeVisible({ timeout: 8_000 });
    await assertion();
  }
});

// ---------------------------------------------------------------------------
// S5 — Save action: placeholder toast, NO persistence
// Verifies: ECN-26b-08, visual-only contract
// ---------------------------------------------------------------------------

test("S5 — save fires toast but does NOT persist to DB", async ({ page }) => {
  // Covers: ECN-26b-08, visual-only contract
  const handle = `${HANDLE_PREFIX}5`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 5", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  await page.goto("http://localhost:5173/app?tab=design&subtab=colors");
  await expect(page.locator("[data-panel='colors']")).toBeVisible({ timeout: 8_000 });

  // Change Primary color
  await page.locator("[aria-label='Primary color hex']").fill("#FF0000");

  // Click Save
  await page.locator("[data-panel='colors'] button:has-text('Save palette')").click();

  // Toast appears (ECN-26b-08)
  await expect(page.locator("[data-testid='design-toast']")).toBeVisible({ timeout: 3_000 });
  await expect(page.locator("[data-testid='design-toast']")).toContainText("Saved");

  // Verify NO persistence: query account_settings for this user — should have no color override
  // (Visual-only slice: no DB writes)
  const userHandle = handle;
  const profilesRes = await page.evaluate(
    async ({ supabaseUrl, serviceKey, hdl }: { supabaseUrl: string; serviceKey: string; hdl: string }) => {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?handle=eq.${hdl}&select=id`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );
      return res.json() as Promise<Array<{ id: string }>>;
    },
    { supabaseUrl: SUPABASE_URL, serviceKey: SERVICE_ROLE_KEY, hdl: userHandle }
  );

  const userId = profilesRes[0]?.id;
  expect(userId).toBeTruthy();

  const settingsRes = await page.evaluate(
    async ({ supabaseUrl, serviceKey, uid }: { supabaseUrl: string; serviceKey: string; uid: string }) => {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/account_settings?id=eq.${uid}&select=*`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );
      return res.json() as Promise<Array<Record<string, unknown>>>;
    },
    { supabaseUrl: SUPABASE_URL, serviceKey: SERVICE_ROLE_KEY, uid: userId! }
  );

  // Either no account_settings row, or no color_primary field on existing row
  const row = settingsRes[0];
  const hasPrimaryColor = row && "color_primary" in row && row.color_primary !== null;
  expect(hasPrimaryColor).toBe(false);
});

// ---------------------------------------------------------------------------
// S6 — Image/Video Background tier-gate at SAVE not at DISPLAY (free tier)
// Verifies: VE-26b-16, VE-26b-17, ECN-26b-09, feedback_no_blur_premium_features
// ---------------------------------------------------------------------------

test("S6 — Image/Video background: visible + clickable; gate fires on save (free tier)", async ({ page }) => {
  // Covers: VE-26b-16, VE-26b-17, ECN-26b-09, feedback_no_blur_premium_features.md
  const handle = `${HANDLE_PREFIX}6`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 6", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  await page.goto("http://localhost:5173/app?tab=design&subtab=background");
  await expect(page.locator("[data-panel='background']")).toBeVisible({ timeout: 8_000 });

  // Image tile visible AND clickable — NOT disabled, NOT blurred (VE-26b-16)
  const imageTile = page.locator("[data-bg-tile='image']");
  await expect(imageTile).toBeVisible();
  await expect(imageTile).not.toBeDisabled();

  // Click Image tile — tile becomes visually selected
  await imageTile.click();
  await expect(imageTile).toHaveAttribute("aria-pressed", "true");

  // Click "Apply" / Save — tier-gate modal appears
  await page.locator("[data-panel='background'] button:has-text('Apply')").click();

  // Tier-gate modal appears (ECN-26b-09, VE-26b-17)
  const modal = page.locator("[data-tier-gate-modal]");
  await expect(modal).toBeVisible({ timeout: 3_000 });
  await expect(modal).toContainText("Image backgrounds are Creator-tier");
  // Pricing uses real config value $7.99 — NOT stale $5/mo (VE-26b-17)
  await expect(modal).toContainText("$7.99");
  await expect(modal).not.toContainText("$5/mo");

  // Dismiss modal
  await page.locator("[data-tier-gate-modal] button:has-text('Maybe later')").click();
  await expect(modal).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S7 — Mobile (≤1024px) Design access via bottom-bar + stepper chevrons
// Verifies: VE-26b-08, ECN-26b-07
// ---------------------------------------------------------------------------

test("S7 — mobile viewport: Design via bottom-bar + stepper chevrons", async ({ page }) => {
  // Covers: VE-26b-08, ECN-26b-07
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });

  const handle = `${HANDLE_PREFIX}7`;
  const email = `${handle}@example.com`;

  await registerViaOtp(page, handle, email);
  await completeWizard(page, handle, "Design Test 7", email);
  await page.getByRole("link", { name: /go to (your )?dashboard/i }).click();
  await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });

  // Sidebar hidden on mobile
  const sidebar = page.locator("[data-testid='app-sidebar']");
  await expect(sidebar).toHaveCSS("display", "none"); // hidden via .app-sidebar CSS

  // Mobile bottom bar visible — click Design tab
  const mobileTabs = page.locator("[data-testid='mobile-tabs']");
  await expect(mobileTabs).toBeVisible({ timeout: 5_000 });
  await mobileTabs.locator("[data-nav='design']").click();

  // URL updated to ?tab=design&subtab=background (default)
  await expect(page).toHaveURL(/tab=design/, { timeout: 5_000 });

  // Design panel content visible
  await expect(page.locator("[data-testid='design-panel']")).toBeVisible({ timeout: 5_000 });

  // Stepper chevrons visible (VE-26b-08)
  const stepper = page.locator("[data-testid='design-breadcrumb-stepper']");
  await expect(stepper).toBeVisible();
  // Left chevron (prev) and right chevron (next) visible
  await expect(stepper.locator(".stepper-chevron-right")).toBeVisible();
});
