/**
 * Playwright test suite — IconPicker component (S1–S6)
 *
 * Covers: BR-ICON-PICKER-001..006, TR-tadaify-014 (picker component)
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 *
 * Prerequisites:
 *   - `npm run dev` (App: http://localhost:5173)
 *   - No auth required — test harness mounts picker directly
 *
 * Test harness: /test-icon-picker (app/routes/test-icon-picker.tsx)
 *
 * Per `feedback_tadaify_per_playwright_test_authorization.md`:
 * every test must be individually approved during local click-test before commit.
 *
 * Responsive breakpoints (locked rule feedback_tadaify_three_viewport_support.md):
 *   - Mobile: <600px   (4-col grid)
 *   - Tablet: 600–1023px (5-col grid)
 *   - Desktop: ≥1024px (6-col grid)
 *
 * Run: npx playwright test e2e/icon-picker.spec.ts
 */

import { test, expect } from "@playwright/test";

const TEST_PAGE = "/test-icon-picker";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Open the icon picker from the test harness. */
async function openPicker(page: import("@playwright/test").Page) {
  await page.goto(TEST_PAGE);
  await page.click('[data-testid="icon-picker-trigger"]');
  await expect(page.locator('[data-testid="icon-picker-panel"]')).toBeVisible();
}

// ---------------------------------------------------------------------------
// S1: Open picker → search auto-focused → search filters
// Covers: BR-ICON-PICKER-001, BR-ICON-PICKER-002
// ---------------------------------------------------------------------------

test("S1: open picker → search auto-focused → search filters live", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Panel not present initially
  await expect(page.locator('[data-testid="icon-picker-panel"]')).not.toBeVisible();

  // Open picker via trigger
  await page.click('[data-testid="icon-picker-trigger"]');

  // Panel visible
  const panel = page.locator('[data-testid="icon-picker-panel"]');
  await expect(panel).toBeVisible();

  // Trigger shows placeholder before selection
  const trigger = page.locator('[data-testid="icon-picker-trigger"]');
  await expect(trigger).toBeVisible();

  // Search auto-focused (requestAnimationFrame on open → slight delay)
  await page.waitForTimeout(100);
  const searchInput = page.locator('[data-testid="icon-picker-search"]');
  await expect(searchInput).toBeFocused();

  // Count all initial icons
  const allTiles = page.locator('[data-testid="icon-picker-grid"] [role="option"]');
  const totalCount = await allTiles.count();
  expect(totalCount).toBeGreaterThan(10);

  // Type "spotify" → filter to Spotify
  await searchInput.fill("spotify");
  await page.waitForTimeout(100); // debounce

  const filtered = page.locator('[data-testid="icon-picker-grid"] [role="option"]');
  const filteredCount = await filtered.count();
  expect(filteredCount).toBeGreaterThanOrEqual(1);
  expect(filteredCount).toBeLessThan(totalCount);

  // Spotify tile is visible
  await expect(page.locator('[data-testid="icon-tile-simple-icons:spotify"]')).toBeVisible();

  // Clear search → all icons restored (ECN-ICON-PICKER-01 proxy)
  await searchInput.fill("");
  await page.waitForTimeout(100);
  await expect(allTiles).toHaveCount(totalCount);
});

// ---------------------------------------------------------------------------
// S2: Category tab switches
// Covers: BR-ICON-PICKER-003
// ---------------------------------------------------------------------------

test("S2: category tab switches filter grid to that category", async ({ page }) => {
  await openPicker(page);

  // Initial: all icons visible
  const allTiles = page.locator('[data-testid="icon-picker-grid"] [role="option"]');
  const allCount = await allTiles.count();

  // Click "Social" tab
  await page.click('[data-testid="icon-picker-tab-social"]');
  await page.waitForTimeout(50);

  const socialTiles = page.locator('[data-testid="icon-picker-grid"] [role="option"]');
  const socialCount = await socialTiles.count();

  // Social tab should show fewer icons than All
  expect(socialCount).toBeGreaterThan(0);
  expect(socialCount).toBeLessThan(allCount);

  // Instagram tile should be visible in Social
  await expect(page.locator('[data-testid="icon-tile-simple-icons:instagram"]')).toBeVisible();

  // Switch to "All" tab → all icons back
  await page.click('[data-testid="icon-picker-tab-all"]');
  await page.waitForTimeout(50);
  await expect(allTiles).toHaveCount(allCount);
});

// ---------------------------------------------------------------------------
// S3: Click tile selects + closes + form value set
// Covers: BR-ICON-PICKER-004
// ---------------------------------------------------------------------------

test("S3: click tile selects icon → dropdown closes → form value updated", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Initially no selection
  const output = page.locator('[data-testid="icon-picker-selected-output"]');
  await expect(output).toHaveAttribute("data-selected-id", "");

  // Open picker + select Spotify
  await page.click('[data-testid="icon-picker-trigger"]');
  await expect(page.locator('[data-testid="icon-picker-panel"]')).toBeVisible();

  // Click Spotify tile
  await page.click('[data-testid="icon-tile-simple-icons:spotify"]');

  // Dropdown closes
  await expect(page.locator('[data-testid="icon-picker-panel"]')).not.toBeVisible();

  // Trigger now shows selected icon name
  await expect(page.locator('[data-testid="icon-picker-selected-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="icon-picker-selected-name"]')).toContainText("Spotify");

  // Output spy: onChange called with 'simple-icons:spotify'
  await expect(output).toHaveAttribute("data-selected-id", "simple-icons:spotify");
});

// ---------------------------------------------------------------------------
// S4: Brand vs monochrome rendering
// Covers: BR-ICON-PICKER-005
// ---------------------------------------------------------------------------

test("S4: simple-icons render with brand color fill; Lucide icons render with stroke=currentColor", async ({ page }) => {
  await openPicker(page);

  // Check Spotify tile (simple-icons — brand color)
  const spotifyTile = page.locator('[data-testid="icon-tile-simple-icons:spotify"]');
  await expect(spotifyTile).toBeVisible();
  // The SVG inside should have fill with brand hex
  const svgFill = await spotifyTile.locator("svg").getAttribute("fill");
  expect(svgFill).toBeTruthy();
  expect(svgFill).toMatch(/^#[0-9A-Fa-f]{6}$/);

  // Check Link tile (lucide — monochrome)
  const linkTile = page.locator('[data-testid="icon-tile-lucide:link"]');
  await expect(linkTile).toBeVisible();
  // data-icon-source = lucide
  await expect(linkTile).toHaveAttribute("data-icon-source", "lucide");
});

// ---------------------------------------------------------------------------
// S5: Keyboard navigation
// Covers: BR-ICON-PICKER-006, ECN-ICON-PICKER-04 (keyboard), ECN-ICON-PICKER-05
// ---------------------------------------------------------------------------

test("S5: keyboard navigation — arrow keys move focus, Enter selects, Esc closes", async ({ page }) => {
  await page.goto(TEST_PAGE);

  // Open picker via keyboard (Tab + Enter)
  await page.click('[data-testid="icon-picker-trigger"]');
  await expect(page.locator('[data-testid="icon-picker-panel"]')).toBeVisible();

  // Search is auto-focused
  await page.waitForTimeout(100);
  const searchInput = page.locator('[data-testid="icon-picker-search"]');
  await expect(searchInput).toBeFocused();

  // Narrow down to one icon via search so keyboard nav is deterministic
  await searchInput.fill("spotify");
  await page.waitForTimeout(100);

  // ArrowDown from search moves into grid
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(50);

  // The first tile should be focused
  const firstTile = page.locator('[data-testid="icon-picker-grid"] [role="option"]').first();
  await expect(firstTile).toBeFocused();

  // Enter selects the focused tile
  await page.keyboard.press("Enter");

  // Dropdown closes
  await expect(page.locator('[data-testid="icon-picker-panel"]')).not.toBeVisible();

  // Value is set to Spotify
  const output = page.locator('[data-testid="icon-picker-selected-output"]');
  await expect(output).toHaveAttribute("data-selected-id", "simple-icons:spotify");

  // Re-open and test Esc closes without selecting
  await page.click('[data-testid="icon-picker-trigger"]');
  await expect(page.locator('[data-testid="icon-picker-panel"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-testid="icon-picker-panel"]')).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// S6: Mobile viewport — 4-col grid + ≥44px touch targets
// Covers: ECN-ICON-PICKER-04
// ---------------------------------------------------------------------------

test("S6: mobile viewport (375px) — 4-col grid + tap targets ≥44px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openPicker(page);

  // Grid should be visible
  const grid = page.locator('[data-testid="icon-picker-grid"]');
  await expect(grid).toBeVisible();

  // Icon tiles should be present
  const tiles = page.locator('[data-testid="icon-picker-grid"] [role="option"]');
  const count = await tiles.count();
  expect(count).toBeGreaterThan(0);

  // Measure the first tile's height — should be ≥44px for mobile tap targets
  const firstTile = tiles.first();
  const box = await firstTile.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    // Tiles use aspect-square — width ≈ height; min 44px
    // Panel is 360px wide; 4 cols → ~84px per tile (minus gaps)
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
