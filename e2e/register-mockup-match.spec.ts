/**
 * Register page — visual mockup match (issue tadaify-app#142)
 *
 * S1-S6 per issue body § "Playwright test plan". Each test ships in this single
 * file per issue contract. NO `.fixme()`, NO `.skip()` per
 * `feedback_no_skip_only_spec_files.md` + DEC-323.
 *
 * Source of truth: `mockups/tadaify-mvp/register.html` (PR #125 canonical).
 *
 * Prerequisite for runs:
 *   - `./bin/worktree-env-init.sh && supabase start` (per #168)
 *   - `npm run dev` on http://localhost:5173 (or TEST_BASE_URL override)
 */

import { test, expect } from "@playwright/test";

// ────────────────────────────────────────────────────────────────────────────
// S1 — Visual: corner logo + preview-thumb card visible at desktop viewport
// Covers: BUG-142-1, BUG-142-2, ECN-142-04
// ────────────────────────────────────────────────────────────────────────────

test.describe("S1 — Corner logo + preview-thumb card visible (desktop)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("S1: corner logo + preview-thumb skeleton visible at desktop viewport", async ({ page }) => {
    // Covers: BUG-142-1, BUG-142-2, ECN-142-04
    await page.goto("/register?handle=t142s1");

    // Preview column visible (desktop only — collapses below 960px)
    const previewCol = page.locator(".preview-col").first();
    await expect(previewCol).toBeVisible();

    // logo-corner wrapper present in preview pane (item 1)
    const logoCorner = previewCol.locator(".logo-corner").first();
    await expect(logoCorner).toBeAttached();

    // Computed opacity ≥ 0.85 per item 1 (mockup spec: opacity 0.9)
    const opacity = await logoCorner.evaluate((el) =>
      parseFloat(getComputedStyle(el as HTMLElement).opacity || "1"),
    );
    expect(opacity).toBeGreaterThanOrEqual(0.85);

    // preview-thumb skeleton visible (item 2) with at least 5 child line elements
    // (3 dot spans + 5 line divs in mockup spec).
    const previewThumb = previewCol.locator(".preview-thumb").first();
    await expect(previewThumb).toBeVisible();
    const lineChildren = previewThumb.locator("> div");
    // The thumb has at minimum 5 line divs (after the 3-dot row): short / full / pill / pill / short
    const count = await lineChildren.count();
    expect(count).toBeGreaterThanOrEqual(6); // 1 dot-row + 5 lines
  });
});

// ────────────────────────────────────────────────────────────────────────────
// S2 — Visual: radial overlay on preview pane
// Covers: BUG-142-3
// ────────────────────────────────────────────────────────────────────────────

test.describe("S2 — Radial overlay on preview pane", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("S2: .preview-col has radial-gradient overlay (::before pseudo or background)", async ({ page }) => {
    // Covers: BUG-142-3
    await page.goto("/register?handle=t142s2");
    const previewCol = page.locator(".preview-col").first();
    await expect(previewCol).toBeVisible();

    // Inspect ::before pseudo-element for radial-gradient OR fall back to the
    // element's own background-image. Either is an acceptable mockup match
    // because some browsers compose ::before differently.
    const hasRadial = await previewCol.evaluate((el) => {
      const beforeBg = getComputedStyle(el as HTMLElement, "::before").backgroundImage || "";
      const ownBg = getComputedStyle(el as HTMLElement).backgroundImage || "";
      return beforeBg.includes("radial-gradient") || ownBg.includes("radial-gradient");
    });
    expect(hasRadial).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// S3 — Copy match: top-right link reads "Log in →"
// Covers: BUG-142-4, ECN-142-07
// ────────────────────────────────────────────────────────────────────────────

test.describe("S3 — Top-right link reads 'Log in →'", () => {
  test("S3: auth-bar shows 'Log in →' link, not 'Sign in'", async ({ page }) => {
    // Covers: BUG-142-4, ECN-142-07
    await page.goto("/register?handle=t142s3");

    // The new link contains "Log in" (case-insensitive)
    const logIn = page.getByRole("link", { name: /log in/i });
    await expect(logIn.first()).toBeVisible();

    // The exact-match old "Sign in" link is gone
    const oldSignIn = page.getByRole("link", { name: /^sign in$/i });
    await expect(oldSignIn).toHaveCount(0);

    // Routes to /login (ECN-142-07)
    const href = await logIn.first().getAttribute("href");
    expect(href).toBe("/login");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// S4 — Theme toggle present + functional + persisted
// Covers: BUG-142-5, ECN-142-08
// ────────────────────────────────────────────────────────────────────────────

test.describe("S4 — Theme toggle present + functional", () => {
  test("S4: theme toggle button visible, click toggles body.dark-mode, persists across reload", async ({ page }) => {
    // Covers: BUG-142-5, ECN-142-08
    await page.goto("/register?handle=t142s4");

    // Resolve the toggle by data-testid (component contract). The aria-label
    // contains "mode" ("Switch to dark mode" / "Switch to light mode") which
    // matches the issue's `[aria-label*="theme"]` semantic intent (theme/mode).
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();

    // Confirm aria-label is wired (light-mode default)
    const ariaLabel = await toggle.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(/(theme|mode)/i.test(ariaLabel || "")).toBe(true);

    // Initial state: body should not have dark-mode (default light)
    const initialDark = await page.evaluate(() => document.body.classList.contains("dark-mode"));
    expect(initialDark).toBe(false);

    // Click → body.dark-mode toggles ON
    await toggle.click();
    const afterClickDark = await page.evaluate(() => document.body.classList.contains("dark-mode"));
    expect(afterClickDark).toBe(true);

    // Persistence: localStorage must have the choice; reload preserves
    const stored = await page.evaluate(() => localStorage.getItem("tadaify.theme"));
    expect(stored).toBe("dark");

    await page.reload();
    const afterReloadDark = await page.evaluate(() => document.body.classList.contains("dark-mode"));
    expect(afterReloadDark).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// S5 — Sub-copy reads "Your public URL will be:"
// Covers: BUG-142-6
// ────────────────────────────────────────────────────────────────────────────

test.describe("S5 — Sub-copy reads 'Your public URL will be:'", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("S5: preview pane sub-copy contains 'Your public URL will be:' literal", async ({ page }) => {
    // Covers: BUG-142-6
    await page.goto("/register?handle=t142s5");
    const previewCol = page.locator(".preview-col").first();
    await expect(previewCol).toBeVisible();

    // Locate the sub-copy in the preview pane (NOT the form-field <label> which
    // also says "Your public URL"). Scoped under .preview-col.
    await expect(previewCol.getByText("Your public URL will be:", { exact: false })).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// S6 — Reduced-motion preference respected
// Covers: BUG-142-1, ECN-142-05
// ────────────────────────────────────────────────────────────────────────────

test.describe("S6 — Reduced-motion preference respected", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
    colorScheme: "light",
  });

  test("S6: with prefers-reduced-motion=reduce, .logo-corner descendants have no running animation", async ({ page }) => {
    // Covers: BUG-142-1, ECN-142-05
    await page.goto("/register?handle=t142s6");
    const logoCorner = page.locator(".logo-corner").first();
    await expect(logoCorner).toBeAttached();

    // Inspect every descendant's computed animation: must be 'none' OR
    // animation-play-state: paused. The page <style> block enforces this via
    // `@media (prefers-reduced-motion: reduce) .logo-corner * { animation-play-state: paused; }`.
    const violators = await logoCorner.evaluate((el) => {
      const out: Array<{ name: string; state: string; duration: string }> = [];
      const all = (el as HTMLElement).querySelectorAll("*");
      for (const node of Array.from(all)) {
        const cs = getComputedStyle(node as HTMLElement);
        const name = cs.animationName || "none";
        const state = cs.animationPlayState || "running";
        const duration = cs.animationDuration || "0s";
        // A descendant violates reduced-motion only if it has a real animation
        // running (name != none AND duration > 0 AND state == running).
        if (name !== "none" && state === "running" && parseFloat(duration) > 0.01) {
          out.push({ name, state, duration });
        }
      }
      return out;
    });
    expect(violators).toEqual([]);
  });
});
