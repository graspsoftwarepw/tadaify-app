/**
 * Module: BLOCKS
 * Covers: BR-DASH-004, TR-tadaify-008
 * Story: #200
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright test suite — BlockEditorModal shell (S1–S7)
 *
 * Covers: BR-BLOCK-EDITOR-001..004, TR-tadaify-008
 * Story: tadaify-app#200 F-BLOCK-INFRA-EDITOR-MODAL-001
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) — NOT required for shell-only tests
 *     (test harness page is static, no auth needed)
 *   - `npm run dev` (App: http://localhost:5173)
 *
 * Test harness: /test-block-editor-modal (app/routes/test-block-editor-modal.tsx)
 * No auth required — test harness mounts modal directly.
 *
 * Per `feedback_tadaify_per_playwright_test_authorization.md`:
 * every test must be individually approved during local click-test before commit.
 *
 * Run: npx playwright test e2e/block-editor-modal.spec.ts
 */

import { test, expect } from "@playwright/test";

const TEST_PAGE = "/test-block-editor-modal";

// ---------------------------------------------------------------------------
// S1: Open + close via X button
// Covers: BR-BLOCK-EDITOR-002
// ---------------------------------------------------------------------------

test("S1: open editor via button and close via X button", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Modal not present initially
  await expect(page.getByRole("dialog")).not.toBeVisible();

  // Open modal
  await page.click("#open-editor-btn");

  // Dialog visible with correct ARIA attributes
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  // Close via X button
  await page.click('[aria-label="Close editor"]');

  // Dialog closed, focus should return to opener
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#open-editor-btn")).toBeFocused();
});

// ---------------------------------------------------------------------------
// S2: Esc key closes
// Covers: BR-BLOCK-EDITOR-002
// ---------------------------------------------------------------------------

test("S2: Esc key closes the modal", async ({ page }) => {
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S3: Backdrop click closes; modal interior click does NOT
// Covers: BR-BLOCK-EDITOR-002
// ---------------------------------------------------------------------------

test("S3: backdrop click closes; clicking inside modal does not close", async ({ page }) => {
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  // Click on the modal interior (form area) — should NOT close
  await page.click('[data-testid="block-editor-modal-box"]', { position: { x: 200, y: 200 } });
  await expect(page.getByRole("dialog")).toBeVisible();

  // Click on the backdrop (outside the modal box) — Radix Dialog.Overlay handles this
  // We click on the fixed overlay element which Radix sets as Dialog.Overlay
  // The overlay covers the full viewport; clicking outside the modal box triggers close.
  // Use force: true to click the overlay behind the modal at a corner position.
  const viewportSize = page.viewportSize();
  if (viewportSize) {
    // Click far top-left corner — outside the modal box (modal is centered)
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// S4: Focus trap — Tab cycles within modal
// Covers: BR-BLOCK-EDITOR-004 (a11y), TR-radix-focus-trap
// ---------------------------------------------------------------------------

test("S4: Tab key cycles focus within modal only (focus trap)", async ({ page }) => {
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  // Tab through focusable elements ≥10 times
  // Focus must never reach #open-editor-btn (which is outside the modal)
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const focusedOutsideModal = await page.evaluate(() => {
      const focused = document.activeElement;
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? !dialog.contains(focused) && focused !== document.body : false;
    });
    expect(focusedOutsideModal).toBe(false);
  }

  // Shift+Tab should also cycle backward within the modal
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Shift+Tab");
    const focusedOutsideModal = await page.evaluate(() => {
      const focused = document.activeElement;
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? !dialog.contains(focused) && focused !== document.body : false;
    });
    expect(focusedOutsideModal).toBe(false);
  }
});

// ---------------------------------------------------------------------------
// S5 / S5b: Responsive — single-column body at mobile AND tablet viewports
// Covers: BR-BLOCK-EDITOR-003, feedback_tadaify_three_viewport_support.md
// 3-viewport contract: mobile <600px, tablet 600-1023px, desktop ≥1024px
// Both mobile AND tablet must stack to single column (breakpoint is <1024px).
// ---------------------------------------------------------------------------

test("S5: mobile viewport (375×667) shows single-column stacked body", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  // Both form and preview columns should be visible (stacked vertically, not hidden)
  const colPreview = page.locator("#col-preview");
  await expect(colPreview).toBeVisible();

  // Preview should be stacked below the form (single-column grid at <1024px)
  // Verify both are present and the grid is single-column by checking that
  // the preview top edge is below the form bottom edge (vertically stacked).
  const formBounds = await page.locator('[data-testid="block-editor-modal-box"] .border-r, [data-testid="block-editor-modal-box"] .border-b').first().boundingBox();
  const previewBounds = await colPreview.boundingBox();
  if (formBounds && previewBounds) {
    expect(previewBounds.y).toBeGreaterThanOrEqual(formBounds.y + formBounds.height - 1);
  }

  // Footer should be visible without scrolling (sticky)
  const footer = page.locator('[role="dialog"] footer');
  await expect(footer).toBeVisible();

  // Modal box should fill full viewport on mobile (<720px)
  const modalBox = page.locator('[data-testid="block-editor-modal-box"]');
  const modalBounds = await modalBox.boundingBox();
  expect(modalBounds?.width).toBeGreaterThan(300);
});

test("S5b: tablet viewport (900×800) shows single-column stacked body — not side-by-side", async ({
  page,
}) => {
  // 900px is mid-tablet (600-1023px range). Per 3-viewport contract the grid
  // must collapse to single column — same as mobile, not the desktop 2-column split.
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  const colPreview = page.locator("#col-preview");
  await expect(colPreview).toBeVisible();

  // Preview must be stacked BELOW the form (not side-by-side).
  // In single-column layout, preview top is at or below form bottom.
  // In two-column layout, both columns start at roughly the same Y — we guard against that.
  const formBounds = await page
    .locator(
      '[data-testid="block-editor-modal-box"] .border-r, [data-testid="block-editor-modal-box"] .border-b',
    )
    .first()
    .boundingBox();
  const previewBounds = await colPreview.boundingBox();
  if (formBounds && previewBounds) {
    // Single-column: preview top ≥ form bottom
    expect(previewBounds.y).toBeGreaterThanOrEqual(formBounds.y + formBounds.height - 1);
    // Additional guard: columns must NOT be horizontally adjacent (same Y ± 10px)
    const horizontallyAdjacent = Math.abs(previewBounds.y - formBounds.y) < 10;
    expect(horizontallyAdjacent).toBe(false);
  }

  // Footer visible
  const footer = page.locator('[role="dialog"] footer');
  await expect(footer).toBeVisible();
});

// ---------------------------------------------------------------------------
// S6: Sub-modal stacking — delete confirm inside editor
// Covers: BR-BLOCK-EDITOR-004
// ---------------------------------------------------------------------------

test("S6: sub-modal stacking — open delete confirm inside editor; Esc closes LIFO", async ({
  page,
}) => {
  await page.goto(TEST_PAGE);

  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  // Open delete sub-modal from inside editor
  await page.click("#delete-trigger-btn");

  // Both dialogs should be in the DOM
  const dialogs = page.getByRole("dialog");
  await expect(dialogs).toHaveCount(2);

  // Sub-modal box should be visible
  await expect(page.locator('[data-testid="delete-submodal-box"]')).toBeVisible();

  // Nested dialog must have an accessible name (Finding 4 — a11y contract)
  const deleteDialog = page.getByRole("dialog", { name: "Delete block?" });
  await expect(deleteDialog).toBeVisible();

  // Press Esc — only sub-modal closes (editor stays open)
  await page.keyboard.press("Escape");

  // Sub-modal box gone
  await expect(page.locator('[data-testid="delete-submodal-box"]')).not.toBeVisible();

  // Editor dialog still open
  const remainingDialogs = page.getByRole("dialog");
  await expect(remainingDialogs).toHaveCount(1);

  // Press Esc again — editor closes
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S7: Body scroll locked when editor open
// Covers: TR-radix-scroll-lock
// ---------------------------------------------------------------------------

test("S7: body scroll locked when modal open; restored on close", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Scroll body down to mid-page
  await page.evaluate(() => window.scrollTo(0, 400));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  expect(scrollBefore).toBeGreaterThan(0);

  // Open modal
  await page.click("#open-editor-btn");
  await expect(page.getByRole("dialog")).toBeVisible();

  // Attempt scroll — body should be locked (overflow:hidden applied by Radix)
  await page.mouse.wheel(0, 500);
  const scrollDuringModal = await page.evaluate(() => window.scrollY);
  // Scroll should not have changed significantly while modal is open
  // Radix applies overflow:hidden to body which prevents scrolling
  expect(Math.abs(scrollDuringModal - scrollBefore)).toBeLessThan(50);

  // Close modal
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();

  // Scroll should be restored (Radix restores overflow on close)
  const scrollAfter = await page.evaluate(() => window.scrollY);
  // Scroll position restored to approximately what it was before
  expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
});
