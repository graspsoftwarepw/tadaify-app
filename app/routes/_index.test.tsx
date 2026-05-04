/**
 * Unit tests for / landing page (app/routes/_index.tsx)
 *
 * U1 — Landing FAQ does NOT promise guest mode (DEC-355=C cleanup, issue tadaify-app#184).
 *
 * Strategy: read the source file as text and assert the banned phrases are absent.
 * This approach is stable for JSX inline content and does not require a jsdom renderer.
 * The source-file scan is intentional — it catches both rendered JSX strings and any
 * commented-out code that might mislead a reviewer.
 *
 * Banned phrases are checked ONLY in the FAQ answer strings (between the `a:` key and
 * the closing `},` of the same FAQ object). However, scanning the whole file is safe
 * because the DEC-355 comment itself uses different casing/phrasing. If that produces
 * false positives in CI, use the FAQ-block extraction below instead.
 *
 * Covers: DEC-355=C — F-001 guest-mode permanently dropped; see feedback_tadaify_no_guest_mode_drafts.md
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const indexSource = readFileSync(join(__dirname, "_index.tsx"), "utf-8");

// ── Extract only FAQ answer strings to avoid false positives in comments ───────────────
// The FAQ block is: [{ q: "...", a: "..." }, ...].map(
// We grab the array literal between `{[` and `].map(` at the FAQ section.
// If the regex can't find it we fall back to full file scan (still safe).
function extractFaqAnswers(src: string): string {
  const match = src.match(/faq-heading[\s\S]*?\{\[([\s\S]*?)\]\.map\(\s*\(\s*\{/);
  if (match) return match[1];
  // Fallback: scan the area around "How fast can I launch" ± 500 chars
  const idx = src.indexOf("How fast can I launch?");
  if (idx >= 0) return src.slice(Math.max(0, idx - 100), idx + 600);
  return src;
}

const faqSection = extractFaqAnswers(indexSource);

describe("U1 — Landing FAQ does not promise guest mode (DEC-355=C)", () => {
  it("does not contain 'guest mode' (case-insensitive) in FAQ answers", () => {
    // DEC-355=C comment mentions 'guest-mode' in a JS comment inside the FAQ block.
    // We check only for the user-visible string "guest mode" (with a space) to avoid
    // matching the comment. The comment says "guest-mode" (with a hyphen) — different.
    const visibleGuestMode = faqSection.match(/"[^"]*guest mode[^"]*"/gi);
    expect(visibleGuestMode).toBeNull();
  });

  it("does not contain 'without signing up' in FAQ answers", () => {
    expect(faqSection.toLowerCase()).not.toContain("without signing up");
  });

  it("does not contain 'try before signup' in FAQ answers", () => {
    expect(faqSection.toLowerCase()).not.toContain("try before signup");
  });

  it("does not contain 'without even signing up' in FAQ answers", () => {
    expect(faqSection.toLowerCase()).not.toContain("without even signing up");
  });

  it("does not contain 'preview without account' in FAQ answers", () => {
    expect(faqSection.toLowerCase()).not.toContain("preview without account");
  });

  it("FAQ 'How fast can I launch?' answer does not reference guest mode editor", () => {
    const howFastIdx = faqSection.indexOf("How fast can I launch?");
    expect(howFastIdx).toBeGreaterThan(-1); // FAQ entry still exists
    const afterHowFast = faqSection.slice(howFastIdx, howFastIdx + 400);
    expect(afterHowFast.toLowerCase()).not.toContain("guest mode");
    expect(afterHowFast.toLowerCase()).not.toContain("without signing up");
    expect(afterHowFast.toLowerCase()).not.toContain("without even signing up");
  });
});
