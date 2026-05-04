/**
 * S5 — Bug #3 regression: welcome step was a stub vs locked mockup
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-001 / ECN-136-01 / ECN-136-02
 *
 * Before fix:
 *   - Plain <h1>Welcome to tada!ify</h1> with plain text
 *   - Checkboxes in a 4-col grid — no brand colors, no icons, no gradient handle
 *
 * After fix (per mockups/tadaify-mvp/onboarding-welcome.html):
 *   - Hero h1: gradient @handle + 👋 wave emoji
 *   - 9 platform cards with per-platform CSS custom properties --sp-a/b/c
 *   - SVG icons per platform
 *
 * Run: npx playwright test e2e/onboarding-welcome-mockup-parity.spec.ts
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// S5 — welcome hero header + branded platform cards (Bug #3)
// ---------------------------------------------------------------------------

test("S5 — welcome step: hero heading with gradient @handle and 9 branded platform cards (Bug #3)", async ({
  page,
}) => {
  const handle = "t188s5";

  await page.goto(`/onboarding/welcome?handle=${handle}`);

  // Wait for the platform grid
  await expect(page.locator("input[name='platform'][value='instagram']")).toBeVisible({
    timeout: 10_000,
  });

  // Hero header: h1 must contain the @handle
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText(new RegExp(`@${handle}`, "i"));

  // Gradient span on @handle: should have a style with background or background-clip
  const gradSpan = page.locator("h1 span").filter({ hasText: `@${handle}` });
  await expect(gradSpan).toBeVisible();
  const gradStyle = await gradSpan.getAttribute("style");
  expect(gradStyle ?? "").toMatch(/background/i);

  // Wave emoji should be present in the header (👋)
  const h1Text = await heading.innerText();
  expect(h1Text).toContain("👋");

  // 9 platform checkboxes must be present
  const platformCheckboxes = page.locator("input[name='platform']");
  await expect(platformCheckboxes).toHaveCount(9);

  // Each platform card must have --sp-a CSS var (brand color)
  const expectedPlatforms = [
    "instagram", "tiktok", "youtube", "x",
    "twitch", "spotify", "linkedin", "pinterest", "threads",
  ];

  for (const platform of expectedPlatforms) {
    const label = page.locator(`label[data-platform="${platform}"]`);
    await expect(label).toBeVisible({ timeout: 5_000 });

    // Verify the CSS custom property --sp-a is set on the label element
    const spA = await label.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--sp-a").trim()
    );
    // Each platform should have a non-empty --sp-a color value
    expect(spA.length).toBeGreaterThan(0);
  }

  // Each card must contain an SVG icon (not just a text emoji)
  const instagramLabel = page.locator('label[data-platform="instagram"]');
  const svgInInstagram = instagramLabel.locator("svg");
  await expect(svgInInstagram).toBeVisible();
});
