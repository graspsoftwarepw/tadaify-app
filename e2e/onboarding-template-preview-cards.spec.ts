/**
 * S6 — Bug #4a regression: template preview cards were stubs (emoji + tagline only)
 *
 * Issue: tadaify-app#188
 * Covers: BR-ONBOARDING-004 / ECN-136-07
 *
 * Before fix:
 *   - Each of 6 template cards showed only emoji + name + 1-line tagline.
 *   - No styled mini-preview with that template's font/colors/sample content.
 *
 * After fix (per mockups/tadaify-mvp/onboarding-template.html):
 *   - Each card has a .tpl-preview.preview-<id> element with styled CSS.
 *   - Preview contains a sample name, bio, and link element (except custom).
 *   - Font-family per template: Chopin/Minimal/Nightfall → Georgia/serif, Neon/Sunrise → Inter.
 *
 * Run: npx playwright test e2e/onboarding-template-preview-cards.spec.ts
 */

import { test, expect } from "@playwright/test";

// Expected font families per template (from CSS in onboarding.template.tsx)
const TEMPLATE_FONT_EXPECTATIONS: Array<{
  id: string;
  name: string;
  fontKeyword: string;
}> = [
  { id: "chopin",    name: "Chopin",    fontKeyword: "Georgia" },
  { id: "neon",      name: "Neon",      fontKeyword: "Inter" },
  { id: "minimal",   name: "Minimal",   fontKeyword: "Georgia" },
  { id: "nightfall", name: "Nightfall", fontKeyword: "Georgia" },
  { id: "sunrise",   name: "Sunrise",   fontKeyword: "Inter" },
  { id: "custom",    name: "Custom",    fontKeyword: "" }, // custom uses a hatched pattern, no font assertion
];

// ---------------------------------------------------------------------------
// S6 — template cards have styled mini-previews (Bug #4a)
// ---------------------------------------------------------------------------

test("S6 — template cards: each has a styled mini-preview with sample content (Bug #4a)", async ({
  page,
}) => {
  const handle = "t188s6";

  await page.goto(
    `/onboarding/template?handle=${handle}&name=Test&platforms=instagram&socials=%7B%7D&bio=&av=`
  );

  // Wait for template cards
  await expect(page.locator("input[name='tpl'][value='chopin']")).toBeVisible({
    timeout: 10_000,
  });

  for (const tmpl of TEMPLATE_FONT_EXPECTATIONS) {
    // The preview element should have the class .preview-<id>
    const previewEl = page.locator(`.preview-${tmpl.id}`);
    await expect(previewEl).toBeVisible({ timeout: 5_000 });

    // Preview must contain a sample name element
    const previewName = previewEl.locator(".preview-name");
    await expect(previewName).toBeVisible({ timeout: 3_000 });

    // For non-custom templates, a sample link should also exist
    if (tmpl.id !== "custom") {
      const previewLink = previewEl.locator(".preview-link");
      await expect(previewLink).toBeVisible({ timeout: 3_000 });
    }

    // Font-family check via computed style (where expected)
    if (tmpl.fontKeyword) {
      const computedFont = await previewName.evaluate((el) =>
        getComputedStyle(el).fontFamily
      );
      // Font stack may include fallbacks — just verify the keyword appears
      expect(computedFont.toLowerCase()).toContain(tmpl.fontKeyword.toLowerCase());
    }
  }
});
