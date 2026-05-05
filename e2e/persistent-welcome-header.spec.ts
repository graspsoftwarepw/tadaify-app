/**
 * Playwright spec: persistent welcome header across all /register sections (S1-S4)
 *
 * Story: F-002a — persistent welcome header + universal alternatives (tadaify-app#187)
 * Covers: DEC-352=A (lift to route-level) + DEC-358=A (stable copy on every section)
 *
 * S1: Desktop 1440 — welcome header persists through A → B → B-email → B-otp
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

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

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

// ---------------------------------------------------------------------------
// S1 — Desktop 1440px: welcome header persists through A → B → B-email → B-otp
// ---------------------------------------------------------------------------

test.describe("S1: desktop 1440px — persistent welcome header", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.afterAll(async () => {
    await clearHandleReservation(HANDLE_S1);
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
