/**
 * Tests for app/lib/theme-utils.ts — covers Codex round-1 P3 finding on
 * PR #146: "the exact regression fixed by #145 can recur unnoticed without
 * at least a focused route/component test asserting these elements render
 * and the theme toggle changes body.dark-mode + persisted value."
 *
 * Strategy: extracted pure helpers from ThemeToggleButton are exercised
 * with injected Storage / MediaQueryMatcher / ClassList stubs. No DOM
 * environment required, so this fits the existing Node-only vitest config.
 * Component-render coverage (RTL) is deferred per `feedback_plan_then_tests.md`.
 */

import { describe, it, expect, vi } from "vitest";
import {
  readInitialTheme,
  applyTheme,
  nextTheme,
  THEME_STORAGE_KEY,
  type ThemeStorage,
  type MediaQueryMatcher,
  type ClassList,
} from "./theme-utils";

function makeStorage(initial: Record<string, string> = {}): ThemeStorage & {
  store: Record<string, string>;
} {
  const store: Record<string, string> = { ...initial };
  return {
    store,
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
  };
}

function makeClassList(): ClassList & { toggleSpy: ReturnType<typeof vi.fn> } {
  const toggleSpy = vi.fn();
  return { toggle: toggleSpy, toggleSpy };
}

describe("readInitialTheme", () => {
  it("returns stored 'light' verbatim", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "light" });
    expect(readInitialTheme(storage, { matches: true })).toBe("light");
  });

  it("returns stored 'dark' verbatim, ignoring prefers-color-scheme", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "dark" });
    expect(readInitialTheme(storage, { matches: false })).toBe("dark");
  });

  it("falls back to prefers-color-scheme when no stored value", () => {
    const storage = makeStorage();
    expect(readInitialTheme(storage, { matches: true })).toBe("dark");
    expect(readInitialTheme(storage, { matches: false })).toBe("light");
  });

  it("defaults to 'light' when storage is null AND no media matcher", () => {
    expect(readInitialTheme(null, null)).toBe("light");
  });

  it("ignores invalid stored values (treats as missing)", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "purple" });
    // Invalid → fall through to media query
    expect(readInitialTheme(storage, { matches: true })).toBe("dark");
    expect(readInitialTheme(storage, { matches: false })).toBe("light");
  });

  it("survives storage throwing on getItem (private mode)", () => {
    const storage: ThemeStorage = {
      getItem: () => {
        throw new Error("SecurityError: storage unavailable");
      },
      setItem: vi.fn(),
    };
    // Should NOT throw; falls through to media matcher
    expect(readInitialTheme(storage, { matches: true })).toBe("dark");
    expect(readInitialTheme(storage, null)).toBe("light");
  });

  it("treats matcher with matches=false as 'no preference'", () => {
    const storage = makeStorage();
    const matcher: MediaQueryMatcher = { matches: false };
    expect(readInitialTheme(storage, matcher)).toBe("light");
  });
});

describe("applyTheme", () => {
  it("toggles dark-mode class ON for 'dark' and persists", () => {
    const classList = makeClassList();
    const storage = makeStorage();
    const result = applyTheme("dark", classList, storage);
    expect(result).toBe("dark");
    expect(classList.toggleSpy).toHaveBeenCalledWith("dark-mode", true);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("dark");
  });

  it("toggles dark-mode class OFF for 'light' and persists", () => {
    const classList = makeClassList();
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "dark" });
    const result = applyTheme("light", classList, storage);
    expect(result).toBe("light");
    expect(classList.toggleSpy).toHaveBeenCalledWith("dark-mode", false);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("light");
  });

  it("survives storage throwing on setItem (private mode)", () => {
    const classList = makeClassList();
    const storage: ThemeStorage = {
      getItem: vi.fn(),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    // Should NOT throw — class still gets toggled
    expect(() => applyTheme("dark", classList, storage)).not.toThrow();
    expect(classList.toggleSpy).toHaveBeenCalledWith("dark-mode", true);
  });

  it("works with null classList (SSR / no DOM)", () => {
    const storage = makeStorage();
    expect(() => applyTheme("dark", null, storage)).not.toThrow();
    expect(storage.store[THEME_STORAGE_KEY]).toBe("dark");
  });

  it("works with null storage (no persistence available)", () => {
    const classList = makeClassList();
    expect(() => applyTheme("light", classList, null)).not.toThrow();
    expect(classList.toggleSpy).toHaveBeenCalledWith("dark-mode", false);
  });
});

describe("nextTheme", () => {
  it("light → dark", () => {
    expect(nextTheme("light")).toBe("dark");
  });

  it("dark → light", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("toggle round-trip (Codex regression scenario)", () => {
  it("simulates the user clicking the button: light → dark → light, asserting body.dark-mode + persistence at each step", () => {
    const classList = makeClassList();
    const storage = makeStorage();

    // Initial: light (no stored, no media-pref)
    let theme = readInitialTheme(storage, { matches: false });
    expect(theme).toBe("light");
    applyTheme(theme, classList, storage);
    expect(classList.toggleSpy).toHaveBeenLastCalledWith("dark-mode", false);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("light");

    // Click 1: → dark
    theme = nextTheme(theme);
    applyTheme(theme, classList, storage);
    expect(classList.toggleSpy).toHaveBeenLastCalledWith("dark-mode", true);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("dark");

    // Click 2: → light
    theme = nextTheme(theme);
    applyTheme(theme, classList, storage);
    expect(classList.toggleSpy).toHaveBeenLastCalledWith("dark-mode", false);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("light");

    // Subsequent visit: should resume from stored
    const resumed = readInitialTheme(storage, { matches: true });
    expect(resumed).toBe("light"); // stored wins over media pref
  });
});
