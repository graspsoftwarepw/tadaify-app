/**
 * Unit tests for WelcomeHeader component (source-analysis style)
 *
 * Story: F-002a — persistent welcome header (DEC-352=A)
 *        F-002a-followup — varying copy (DEC-358=B, tadaify-app#196)
 *
 * Tests use fs.readFileSync (static source analysis) so they run under vitest
 * node environment without jsdom/React rendering. This mirrors the existing
 * pattern in register.test.tsx.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const src = readFileSync(
  fileURLToPath(new URL("./WelcomeHeader.tsx", import.meta.url)),
  "utf8"
);

// ---------------------------------------------------------------------------
// Component structure
// ---------------------------------------------------------------------------

describe("WelcomeHeader — renders handle from props", () => {
  it("renders handle from props — contains displayHandle pattern", () => {
    // Source must derive displayHandle from handle prop
    expect(src).toMatch(/displayHandle/);
  });

  it("uses 'yourname' placeholder when handle is empty string", () => {
    // Source must fallback to 'yourname' when handle is empty
    expect(src).toContain("yourname");
    expect(src).toMatch(/handle\s*\|\|\s*["']yourname["']/);
  });
});

describe("WelcomeHeader — brand wordmark", () => {
  it("renders 'tada!ify' brand wordmark with 3 spans (ta + da! + ify)", () => {
    expect(src).toContain("wm-ta");
    expect(src).toContain("wm-da");
    expect(src).toContain("wm-ify");
  });

  it("wordmark spans use correct CSS variable colors (DEC-WORDMARK-01)", () => {
    expect(src).toContain("var(--wm-ta)");
    expect(src).toContain("var(--wm-da)");
    expect(src).toContain("var(--wm-ify)");
  });

  it("wordmark text contains 'ta', 'da!', 'ify' in source", () => {
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

describe("WelcomeHeader — varying copy integration (DEC-358=B)", () => {
  it("imports getWelcomeCopy from register-welcome-copy helper", () => {
    expect(src).toContain("getWelcomeCopy");
    expect(src).toContain("register-welcome-copy");
  });

  it("accepts a 'section' prop of type RegisterSection", () => {
    expect(src).toContain("section: RegisterSection");
    expect(src).toContain("RegisterSection");
  });

  it("passes section and displayHandle to getWelcomeCopy", () => {
    expect(src).toMatch(/getWelcomeCopy\(section,\s*displayHandle\)/);
  });

  it("contains 'Hey' greeting for wave sections", () => {
    expect(src).toContain("Hey");
  });

  it("contains the 👋 wave emoji for Hey sections", () => {
    expect(src).toContain("👋");
  });

  it("contains 'welcome to' text for Hey sections", () => {
    expect(src).toContain("welcome to");
  });

  it("uses data-welcome-copy attribute for non-wave sections (Playwright selector)", () => {
    expect(src).toContain("data-welcome-copy");
  });
});
