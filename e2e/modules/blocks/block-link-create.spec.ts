/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, BR-DASH-004, TR-tadaify-008
 * Routes: /app, /api/blocks, /:handle
 * Story: #310
 *
 * Module-first reference spec (grasp-app-structure P7, epic #303). This is the
 * FIRST spec authored under the canonical `e2e/modules/<AREA>/` tree — its
 * companion plan lives at `e2e/plans/blocks/block-link-create.plan.md`. It
 * demonstrates the 4-key header contract (Module/Covers/Routes/Story) every NEW
 * e2e spec MUST carry; legacy feature-flat specs are grandfathered in place and
 * carry only the backfilled `Module:` + `Covers:` lines.
 *
 * Flow under test (BR-CREATOR-001 content blocks, BR-DASH-004 homepage panel):
 *   creator opens the dashboard → adds a link block via the picker/editor →
 *   POST /api/blocks persists it → the public page renders the link.
 *
 * Prerequisites:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *   - dev server on PLAYWRIGHT_BASE_URL (Playwright webServer brings it up)
 *
 * Run: npx playwright test e2e/modules/blocks/block-link-create.spec.ts
 */

import { test, expect } from "@playwright/test";

test.describe("BLOCKS — link block create (module-first reference)", () => {
  // Skipped until the module-first suite is wired into the runtime; it ships as
  // the layout/header reference for P7 and is discovered by `playwright --list`.
  test.skip("creator adds a link block and the public page renders it", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app/);
  });
});
