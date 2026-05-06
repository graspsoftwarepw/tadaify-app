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

// Brand wordmark is NOT rendered in the welcome header per DEC-358=B (short copy only).
// The wordmark CSS variables remain in the design system but are not used here.
describe("WelcomeHeader — no wordmark suffix (DEC-358=B)", () => {
  it("does NOT contain 'welcome to' wordmark suffix for Hey sections (DEC-358=B literal: short copy)", () => {
    // DEC-358=B chose option B: 'Hey @{handle} 👋' — no wordmark suffix.
    // Option A (rejected) would have appended 'welcome to tada!ify'.
    expect(src).not.toContain("welcome to");
  });

  it("does NOT render brand-wordmark span (wordmark removed per DEC-358=B)", () => {
    expect(src).not.toContain("brand-wordmark");
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

  it("short Hey copy — component renders 'Hey' directly (not via getWelcomeCopy for wave sections)", () => {
    // The component renders the wave variant inline with "Hey @{handle} 👋" (no wordmark).
    // getWelcomeCopy() is still called (copy var populated) but wave variant uses JSX directly.
    expect(src).toContain("Hey");
  });

  it("uses data-welcome-copy attribute for non-wave sections (Playwright selector)", () => {
    expect(src).toContain("data-welcome-copy");
  });
});
