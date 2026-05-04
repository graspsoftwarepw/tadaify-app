/**
 * S1 + S2 — Landing page: no guest-mode promise + no unauth editor surface (DEC-355=C)
 *
 * Verifies that F-001 guest-mode editor has been fully removed from the public-facing
 * landing page and that no unauth editor route is reachable.
 *
 * DEC-355=C (2026-05-04): F-001 guest-mode permanently dropped. Tadaify is signup-first.
 * See: feedback_tadaify_no_guest_mode_drafts.md
 * Issue: tadaify-app#184
 *
 * Covers:
 *   - S1: Landing FAQ does not mention guest mode or "without signing up"
 *   - S2: Unauth editor routes (/editor, /edit, /draft, /try) return 404 or redirect to /register
 */

import { test, expect } from "@playwright/test";

// ── S1 — Landing FAQ does not promise guest mode ──────────────────────────────────────

test.describe("S1 — Landing FAQ contains no guest-mode promise", () => {
  test("visit / and verify FAQ section has no guest-mode keywords", async ({ page }) => {
    // Covers: DEC-355=C — "guest mode" removed from landing copy
    await page.goto("/");

    // Wait for FAQ section to be visible
    const faqSection = page.getByRole("region", { name: /question|faq/i });
    // Fall back to the heading if role=region isn't used
    const faqHeading = page.locator("#faq-heading, [id='faq-heading']");
    const faqEl = (await faqSection.count()) > 0 ? faqSection : faqHeading.locator("..");

    await expect(faqHeading).toBeVisible({ timeout: 10_000 });

    // Get the text content of the FAQ section (all Q&A text)
    const faqText = await page.locator("section:has(#faq-heading)").textContent() ?? "";

    // Assert no guest-mode phrases in rendered text
    expect(faqText.toLowerCase()).not.toContain("guest mode");
    expect(faqText.toLowerCase()).not.toContain("without signing up");
    expect(faqText.toLowerCase()).not.toContain("without even signing up");
    expect(faqText.toLowerCase()).not.toContain("try before signup");
    expect(faqText.toLowerCase()).not.toContain("preview without account");
    expect(faqText.toLowerCase()).not.toContain("guest editor");
  });

  test("'How fast can I launch?' answer does not reference guest mode", async ({ page }) => {
    // Covers: DEC-355=C — specific FAQ entry that had the banned phrase
    await page.goto("/");

    // Open the FAQ entry if it's a <details> element
    const howFastEntry = page.locator("details:has-text('How fast can I launch')");
    if (await howFastEntry.count() > 0) {
      await howFastEntry.first().click();
    }

    const entryText =
      (await page.locator("details:has-text('How fast can I launch')").textContent()) ?? "";

    expect(entryText.toLowerCase()).not.toContain("guest mode");
    expect(entryText.toLowerCase()).not.toContain("without signing up");
    expect(entryText.toLowerCase()).not.toContain("without even signing up");
  });
});

// ── S2 — No unauth editor surface ────────────────────────────────────────────────────

test.describe("S2 — Unauth editor routes return 404 or redirect to /register", () => {
  const unauthEditorRoutes = ["/try", "/editor", "/edit", "/draft"];

  for (const route of unauthEditorRoutes) {
    test(`${route} returns 404 or redirects to /register (not a working unauth editor)`, async ({
      page,
    }) => {
      // Covers: DEC-355=C — no /try guest-mode editor route
      const response = await page.goto(route, { waitUntil: "commit" });

      const finalUrl = page.url();
      const status = response?.status() ?? 0;

      const is404 = status === 404;
      const isRedirectedToRegister = finalUrl.includes("/register");

      // Must be either a 404 OR a redirect to /register — never a working editor
      expect(
        is404 || isRedirectedToRegister,
        `Route ${route} should return 404 or redirect to /register, got status=${status} finalUrl=${finalUrl}`,
      ).toBe(true);

      // Extra safety: the page must NOT show an editor UI (canvas, block picker)
      if (!is404 && !isRedirectedToRegister) {
        // If somehow a page loads, it must not contain editor-specific elements
        const hasBlockEditor = await page.locator('[data-testid="block-editor"], .block-editor, [aria-label*="editor"]').count();
        expect(hasBlockEditor, `Route ${route} rendered a block editor — unauth editor surface found`).toBe(0);
      }
    });
  }
});
