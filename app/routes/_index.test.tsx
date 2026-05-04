/**
 * Unit tests for / landing page (app/routes/_index.tsx)
 *
 * U1 — Landing FAQ does NOT promise guest mode (DEC-355=C cleanup, issue tadaify-app#184).
 *
 * Strategy: import landingFaqItems from ~/lib/landing-faq and assert the banned phrases
 * are absent from all answer strings. This avoids Node.js file I/O and is fully
 * compatible with the Cloudflare Workers TypeScript environment (tsconfig.cloudflare.json).
 *
 * Covers: DEC-355=C — F-001 guest-mode permanently dropped.
 * See: docs/decisions/0048-drop-f001-guest-mode-signup-first.md
 * See: feedback_tadaify_no_guest_mode_drafts.md
 */

import { describe, it, expect } from "vitest";
import { landingFaqItems } from "~/lib/landing-faq";

// Concatenate all FAQ answer strings for global phrase checks
const allAnswers = landingFaqItems.map((item) => item.a).join("\n");

describe("U1 — Landing FAQ does not promise guest mode (DEC-355=C)", () => {
  it("does not contain 'guest mode' in any FAQ answer", () => {
    expect(allAnswers.toLowerCase()).not.toContain("guest mode");
  });

  it("does not contain 'without signing up' in any FAQ answer", () => {
    expect(allAnswers.toLowerCase()).not.toContain("without signing up");
  });

  it("does not contain 'try before signup' in any FAQ answer", () => {
    expect(allAnswers.toLowerCase()).not.toContain("try before signup");
  });

  it("does not contain 'without even signing up' in any FAQ answer", () => {
    expect(allAnswers.toLowerCase()).not.toContain("without even signing up");
  });

  it("does not contain 'preview without account' in any FAQ answer", () => {
    expect(allAnswers.toLowerCase()).not.toContain("preview without account");
  });

  it("'How fast can I launch?' FAQ entry exists and does not reference guest mode editor", () => {
    const howFast = landingFaqItems.find((item) => item.q === "How fast can I launch?");
    expect(howFast).toBeDefined();
    expect(howFast!.a.toLowerCase()).not.toContain("guest mode");
    expect(howFast!.a.toLowerCase()).not.toContain("without signing up");
    expect(howFast!.a.toLowerCase()).not.toContain("without even signing up");
  });
});
