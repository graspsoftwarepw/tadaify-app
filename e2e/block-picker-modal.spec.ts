/**
 * Playwright test suite — BlockPickerModal shell (S1–S7)
 *
 * Covers: BR-BLOCK-PICKER-001..005, TR (component, registry, search, filter, onSelect)
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 *
 * Prerequisites:
 *   - `npm run dev` (App: http://localhost:5173)
 *   - No auth required — test harness mounts modal directly
 *
 * Test harness: /test-block-picker-modal (app/routes/test-block-picker-modal.tsx)
 *
 * Per `feedback_tadaify_per_playwright_test_authorization.md`:
 * every test must be individually approved during local click-test before commit.
 *
 * Responsive breakpoints (locked rule feedback_tadaify_three_viewport_support.md):
 *   - Mobile: <600px (1 col)
 *   - Tablet: 600–1023px (2 col)
 *   - Desktop: ≥1024px (3 col)
 *
 * Run: npx playwright test e2e/block-picker-modal.spec.ts
 */

import { test, expect } from "@playwright/test";

const TEST_PAGE = "/test-block-picker-modal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Open the picker modal from the test harness. */
async function openPicker(page: import("@playwright/test").Page) {
  await page.goto(TEST_PAGE);
  await page.click('[data-testid="open-picker-btn"]');
  await expect(page.locator('[data-testid="block-picker-modal-box"]')).toBeVisible();
}

// ---------------------------------------------------------------------------
// S1: Open picker + search filters
// Covers: BR-BLOCK-PICKER-001, BR-BLOCK-PICKER-002
// ---------------------------------------------------------------------------

test("S1: open picker modal + search auto-focused + search filters cards + clear restores all", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Modal not present initially
  await expect(page.locator('[data-testid="block-picker-modal-box"]')).not.toBeVisible();

  // Open modal
  await page.click('[data-testid="open-picker-btn"]');

  // Dialog visible
  const modal = page.locator('[data-testid="block-picker-modal-box"]');
  await expect(modal).toBeVisible();

  // Search input auto-focused within 300ms (mockup contract: 200ms + tolerance)
  await page.waitForTimeout(300);
  const searchInput = page.locator('[data-testid="block-picker-search"]');
  await expect(searchInput).toBeFocused();

  // Count all initial cards
  const allCards = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  const totalCount = await allCards.count();
  expect(totalCount).toBeGreaterThan(1);

  // Type search query — "countdown" should match 1 card
  await searchInput.fill("countdown");
  const filtered = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  const filteredCount = await filtered.count();
  expect(filteredCount).toBeGreaterThanOrEqual(1);
  expect(filteredCount).toBeLessThan(totalCount);

  // Verify countdown card is present
  await expect(page.locator('[data-block-type="countdown"]')).toBeVisible();

  // Clear search — all cards restored (ECN-PICKER-01)
  await searchInput.fill("");
  await expect(allCards).toHaveCount(totalCount);
});

// ---------------------------------------------------------------------------
// S2: Category tab switches grid
// Covers: BR-BLOCK-PICKER-003
// ---------------------------------------------------------------------------

test("S2: category tab switches grid filter; All restores full list", async ({ page }) => {
  await openPicker(page);

  // Click "Social" tab
  await page.click('[data-testid="tab-social"]');

  // Only social-category cards visible
  const socialCards = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  const socialCount = await socialCards.count();
  expect(socialCount).toBeGreaterThan(0);

  // Check all visible cards are social category
  // (social block: social icons row has data-block-type="social")
  await expect(page.locator('[data-block-type="social"]')).toBeVisible();

  // Ensure heading (content category) is NOT visible
  await expect(page.locator('[data-block-type="heading"]')).not.toBeVisible();

  // Click "All" tab — full list restored
  await page.click('[data-testid="tab-all"]');
  const allCards = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  const allCount = await allCards.count();
  expect(allCount).toBeGreaterThan(socialCount);
});

// ---------------------------------------------------------------------------
// S3: Card click fires onSelect + closes picker
// Covers: BR-BLOCK-PICKER-004
// ---------------------------------------------------------------------------

test("S3: click non-locked card → onSelect fired + picker closes", async ({ page }) => {
  // Use creator tier (heading card is not locked)
  await page.goto(TEST_PAGE);
  await page.click('[data-testid="tier-btn-creator"]');
  await page.click('[data-testid="open-picker-btn"]');

  // Click "Heading / text" card
  await page.click('[data-block-type="heading"]');

  // Picker closes
  await expect(page.locator('[data-testid="block-picker-modal-box"]')).not.toBeVisible();

  // onSelect was called: [data-selected-type] element reflects selected type
  const selectedEl = page.locator('[data-testid="selected-type"]');
  await expect(selectedEl).toBeVisible();
  await expect(selectedEl).toHaveAttribute("data-selected-type", "heading");
});

// ---------------------------------------------------------------------------
// S4: Locked card shows badge, does NOT fire onSelect
// Covers: BR-BLOCK-PICKER-005
// ---------------------------------------------------------------------------

test("S4: locked card (Free tier + custom-html) shows 🔒 badge + click does NOT fire onSelect", async ({ page }) => {
  // Switch to Free tier first
  await page.goto(TEST_PAGE);
  await page.click('[data-testid="tier-btn-free"]');
  await page.click('[data-testid="open-picker-btn"]');

  // Locate custom-html card
  const customHtmlCard = page.locator('[data-block-type="custom-html"]');
  await expect(customHtmlCard).toBeVisible();

  // Card has data-locked="true"
  await expect(customHtmlCard).toHaveAttribute("data-locked", "true");

  // Card shows 🔒 badge
  const badge = customHtmlCard.locator('[data-testid="locked-badge"]');
  await expect(badge).toBeVisible();

  // Click locked card — picker stays open
  await customHtmlCard.click();
  await expect(page.locator('[data-testid="block-picker-modal-box"]')).toBeVisible();

  // No [data-selected-type] element rendered (onSelect not called)
  await expect(page.locator('[data-testid="selected-type"]')).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S5: AI Suggest tab empty-state
// Covers: BR-BLOCK-PICKER-003
// ---------------------------------------------------------------------------

test("S5: AI Suggest tab shows special empty-state with ✨ icon and CTA button", async ({ page }) => {
  await openPicker(page);

  // Click AI Suggest tab
  await page.click('[data-testid="tab-ai-suggest"]');

  // Regular card grid replaced by AI Suggest empty state
  const aiState = page.locator('[data-testid="ai-suggest-empty-state"]');
  await expect(aiState).toBeVisible();

  // Verify copy (per mockup line 664)
  await expect(aiState).toContainText("AI Suggest is per field");

  // CTA button present
  const ctaBtn = page.locator('[data-testid="ai-suggest-preview-btn"]');
  await expect(ctaBtn).toBeVisible();
  await expect(ctaBtn).toContainText("Preview the AI Suggest modal");

  // Regular cards not visible
  const cards = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  await expect(cards).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// S6: No-search-match empty-state
// Covers: ECN-PICKER-05
// ---------------------------------------------------------------------------

test("S6: nonsense search query shows no-results empty state with 🔍 icon", async ({ page }) => {
  await openPicker(page);

  const searchInput = page.locator('[data-testid="block-picker-search"]');
  await searchInput.fill("zzzzzzz_no_match_at_all");

  // No cards
  const cards = page.locator('[data-testid="block-picker-card-grid"] [role="listitem"]');
  await expect(cards).toHaveCount(0);

  // Empty state shown
  const noResults = page.locator('[data-testid="no-results-empty-state"]');
  await expect(noResults).toBeVisible();
  await expect(noResults).toContainText("No block types match");
});

// ---------------------------------------------------------------------------
// S7: Mobile / tablet / desktop grid columns
// Covers: BR-BLOCK-PICKER-001 (responsive)
// Breakpoints: <600px = 1col, 600-1023px = 2col, ≥1024px = 3col
// ---------------------------------------------------------------------------

test("S7: mobile viewport (375×667) → 1-column card grid", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openPicker(page);

  const grid = page.locator('[data-testid="block-picker-card-grid"]');
  const columns = await grid.evaluate((el: HTMLElement) => {
    return getComputedStyle(el).gridTemplateColumns;
  });
  // 1 column = single value (no spaces between column widths)
  const colCount = columns.trim().split(/\s+/).length;
  expect(colCount).toBe(1);
});

test("S7: tablet viewport (768×1024) → 2-column card grid", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openPicker(page);

  const grid = page.locator('[data-testid="block-picker-card-grid"]');
  const columns = await grid.evaluate((el: HTMLElement) => {
    return getComputedStyle(el).gridTemplateColumns;
  });
  const colCount = columns.trim().split(/\s+/).length;
  expect(colCount).toBe(2);
});

test("S7: desktop viewport (1280×800) → 3-column card grid", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openPicker(page);

  const grid = page.locator('[data-testid="block-picker-card-grid"]');
  const columns = await grid.evaluate((el: HTMLElement) => {
    return getComputedStyle(el).gridTemplateColumns;
  });
  const colCount = columns.trim().split(/\s+/).length;
  expect(colCount).toBe(3);
});
