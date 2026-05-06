/**
 * U1 — ThemeToggleButton component (issue tadaify-app#142)
 *
 * Static-analysis unit tests for the ThemeToggleButton component.
 *
 * The component itself is exercised at runtime via the existing
 * `app/components/AppThemeToggle.test.ts` suite (theme-utils helpers it
 * depends on — toggle, persist, read-on-mount, blocked-storage fallback).
 *
 * This file adds the U1 contract from issue #142 § "Unit test plan":
 *  - "renders sun icon by default" — sun SVG markup is present
 *  - "renders moon icon when body has dark-mode class" — moon SVG markup is present
 *  - "has aria-label containing 'theme'" — aria-label / aria-pressed wired so screen
 *    readers see "theme" / "mode" semantics
 *  - "click toggles body class + localStorage" — onClick handler calls applyTheme +
 *    nextTheme + uses body.classList + localStorage (proven by AppThemeToggle.test.ts
 *    on the helpers — this file proves the WIRING is in place in the component).
 *
 * Pattern matches the existing source-analysis convention used in
 * register.test.tsx and WelcomeHeader.test.tsx — vitest runs in `node`
 * environment without jsdom/React rendering.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const src = readFileSync(
  fileURLToPath(new URL("./ThemeToggleButton.tsx", import.meta.url)),
  "utf8",
);

// ---------------------------------------------------------------------------
// U1-1: renders sun icon by default
// ---------------------------------------------------------------------------

describe("ThemeToggleButton — renders sun icon by default", () => {
  it("renders sun icon by default", () => {
    // Sun icon is identified by class name "theme-icon-sun" + circle cx/cy attrs
    expect(src).toContain("theme-icon-sun");
    expect(src).toMatch(/<circle[^>]*cx="12"[^>]*cy="12"[^>]*r="4"/);
  });

  it("default theme state is 'light' (sun-visible)", () => {
    // Initial useState<Theme>("light") — light state means sun visible
    expect(src).toMatch(/useState<Theme>\(["']light["']\)/);
  });
});

// ---------------------------------------------------------------------------
// U1-2: renders moon icon when body has dark-mode class
// ---------------------------------------------------------------------------

describe("ThemeToggleButton — renders moon icon when dark", () => {
  it("renders moon icon markup", () => {
    // Moon icon is identified by class name "theme-icon-moon" + the crescent path
    expect(src).toContain("theme-icon-moon");
    expect(src).toMatch(/M21 12\.79A9 9 0 1 1 11\.21 3 7 7 0 0 0 21 12\.79z/);
  });

  it("uses applyTheme(theme, body.classList, storage) — body class drives icon swap", () => {
    // The component delegates to applyTheme which toggles "dark-mode" on body.classList
    // (verified at runtime by AppThemeToggle.test.ts U3-1).
    expect(src).toContain("applyTheme(initial, getBodyClassList(), getBrowserStorage())");
    expect(src).toContain("applyTheme(next, getBodyClassList(), getBrowserStorage())");
  });
});

// ---------------------------------------------------------------------------
// U1-3: has aria-label containing 'theme' or 'mode' (case-insensitive)
// ---------------------------------------------------------------------------

describe("ThemeToggleButton — accessibility", () => {
  it("has aria-label containing 'mode' (per ECN-142-08 + S4 selector contract)", () => {
    // S4 in issue #142 selects `[aria-label*="theme"]` OR equivalent. The component
    // uses "Switch to dark mode" / "Switch to light mode" — both contain "mode".
    // Locked rule: aria-label must mention either "theme" or "mode" so the toggle is
    // discoverable to assistive tech regardless of state.
    expect(src).toMatch(/aria-label=\{theme === ["']light["'] \?\s*["']Switch to dark mode["']/);
    expect(src).toMatch(/["']Switch to light mode["']/);
  });

  it("has aria-pressed reflecting the current theme state", () => {
    // aria-pressed={theme === "dark"} → true when dark, false when light
    expect(src).toMatch(/aria-pressed=\{theme === ["']dark["']\}/);
  });

  it("has data-testid='theme-toggle' for Playwright targeting", () => {
    expect(src).toContain('data-testid="theme-toggle"');
  });
});

// ---------------------------------------------------------------------------
// U1-4: click toggles body class + localStorage (wiring verified)
// ---------------------------------------------------------------------------

describe("ThemeToggleButton — click toggles body class + localStorage", () => {
  it("onClick calls toggle()", () => {
    expect(src).toMatch(/onClick=\{toggle\}/);
  });

  it("toggle() computes nextTheme + applies it to body class + storage", () => {
    // toggle() body must:
    //   1. compute nextTheme(theme)
    //   2. setTheme(next)
    //   3. applyTheme(next, body.classList, localStorage)
    expect(src).toMatch(/const next = nextTheme\(theme\)/);
    expect(src).toMatch(/setTheme\(next\)/);
    expect(src).toMatch(/applyTheme\(next, getBodyClassList\(\), getBrowserStorage\(\)\)/);
  });

  it("imports nextTheme + applyTheme from theme-utils (wiring contract)", () => {
    expect(src).toMatch(/from ["']~\/lib\/theme-utils["']/);
    expect(src).toContain("applyTheme");
    expect(src).toContain("nextTheme");
    expect(src).toContain("readInitialTheme");
  });
});
