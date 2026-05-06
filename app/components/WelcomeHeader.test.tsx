/**
 * Unit tests for WelcomeHeader component (U1)
 *
 * Story: F-002a — persistent welcome header (DEC-352=A + DEC-358=A)
 * Issue: tadaify-app#187
 *
 * Tests use fs.readFileSync (static source analysis) so they run under vitest
 * node environment without jsdom/React rendering. This mirrors the existing
 * pattern in register.test.tsx.
 *
 * U1 tests:
 *  - "renders handle from props"
 *  - "uses 'yourname' placeholder when handle is empty string"
 *  - "renders 'tada!ify' brand wordmark with 3 spans (ta + da! + ify)"
 *  - "has aria-live='polite' on header element"
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const src = readFileSync(
  fileURLToPath(new URL("./WelcomeHeader.tsx", import.meta.url)),
  "utf8"
);

// ---------------------------------------------------------------------------
// U1: WelcomeHeader source analysis
// ---------------------------------------------------------------------------

describe("WelcomeHeader — renders handle from props", () => {
  it("renders handle from props — contains @{handle || 'yourname'} pattern", () => {
    // Source must use handle prop to render @handle
    expect(src).toMatch(/@\{handle/);
  });

  it("uses 'yourname' placeholder when handle is empty string", () => {
    // Source must fallback to 'yourname' when handle is empty
    expect(src).toContain("yourname");
    // The pattern: handle || "yourname"
    expect(src).toMatch(/handle\s*\|\|\s*["']yourname["']/);
  });
});

describe("WelcomeHeader — brand wordmark", () => {
  it("renders 'tada!ify' brand wordmark with 3 spans (ta + da! + ify)", () => {
    // Must have all three wordmark parts
    expect(src).toContain("wm-ta");
    expect(src).toContain("wm-da");
    expect(src).toContain("wm-ify");
  });

  it("wordmark spans use correct CSS variable colors (DEC-WORDMARK-01)", () => {
    // ta → indigo (var(--wm-ta))
    // da! → warm (var(--wm-da))
    // ify → dark (var(--wm-ify))
    expect(src).toContain("var(--wm-ta)");
    expect(src).toContain("var(--wm-da)");
    expect(src).toContain("var(--wm-ify)");
  });

  it("wordmark text contains 'ta', 'da!', 'ify' in source", () => {
    // Each span contains its literal text
    expect(src).toContain(">ta<");
    expect(src).toContain(">da!</");
    expect(src).toContain(">ify<");
  });
});

describe("WelcomeHeader — accessibility", () => {
  it("has aria-live='polite' on header element", () => {
    expect(src).toContain('aria-live="polite"');
  });

  it("has className='welcome-header' for Playwright targeting", () => {
    expect(src).toContain("welcome-header");
  });

  it("emoji is aria-hidden to avoid screen reader noise", () => {
    expect(src).toContain('aria-hidden');
  });
});

describe("WelcomeHeader — welcome copy", () => {
  it("contains 'welcome to' copy text", () => {
    expect(src).toContain("welcome to");
  });

  it("contains 'Hey' greeting", () => {
    expect(src).toContain("Hey");
  });

  it("contains the 👋 wave emoji", () => {
    expect(src).toContain("👋");
  });
});
