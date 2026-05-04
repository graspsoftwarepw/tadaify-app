/**
 * U3 — Theme toggle persistence
 *
 * Tests the theme-utils helpers used by ThemeToggleButton and the /app route.
 * We test pure functions (readInitialTheme, applyTheme, nextTheme) with
 * injected stubs — no DOM/React environment needed.
 *
 * Extends the existing theme-utils.test.ts coverage with the persistence
 * scenarios relevant to the dashboard (account_settings.theme_pref).
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: U3 per issue spec (AC#4 / ECN-26a-16 / ECN-26a-17)
 */

import { describe, it, expect } from "vitest";
import {
  readInitialTheme,
  applyTheme,
  nextTheme,
  THEME_STORAGE_KEY,
} from "~/lib/theme-utils.js";

// ---------------------------------------------------------------------------
// Minimal stubs
// ---------------------------------------------------------------------------

function makeStorage(initial: Record<string, string> = {}): {
  store: Record<string, string>;
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
} {
  const store = { ...initial };
  return {
    store,
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
  };
}

function makeBlockedStorage(): {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
} {
  return {
    getItem: () => { throw new Error("Storage blocked"); },
    setItem: () => { throw new Error("Storage blocked"); },
  };
}

function makeClassList(initial: string[] = []): {
  classes: Set<string>;
  toggle: (token: string, force?: boolean) => boolean;
} {
  const classes = new Set(initial);
  return {
    classes,
    toggle: (token: string, force?: boolean) => {
      if (force === true)  { classes.add(token);    return true; }
      if (force === false) { classes.delete(token); return false; }
      if (classes.has(token)) { classes.delete(token); return false; }
      else { classes.add(token); return true; }
    },
  };
}

// ---------------------------------------------------------------------------
// U3-1: click toggles body.dark-mode + writes to localStorage
// ---------------------------------------------------------------------------

describe("applyTheme — toggles class + writes to storage", () => {
  it("applyTheme('dark') adds dark-mode class and writes to localStorage", () => {
    const storage = makeStorage();
    const classList = makeClassList();

    applyTheme("dark", classList, storage);

    expect(classList.classes.has("dark-mode")).toBe(true);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("dark");
  });

  it("applyTheme('light') removes dark-mode class and writes to localStorage", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "dark" });
    const classList = makeClassList(["dark-mode"]);

    applyTheme("light", classList, storage);

    expect(classList.classes.has("dark-mode")).toBe(false);
    expect(storage.store[THEME_STORAGE_KEY]).toBe("light");
  });
});

// ---------------------------------------------------------------------------
// U3-2: reads from localStorage on mount
// ---------------------------------------------------------------------------

describe("readInitialTheme — reads from localStorage", () => {
  it("returns stored 'dark' from localStorage", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "dark" });
    expect(readInitialTheme(storage, null)).toBe("dark");
  });

  it("returns stored 'light' from localStorage", () => {
    const storage = makeStorage({ [THEME_STORAGE_KEY]: "light" });
    expect(readInitialTheme(storage, null)).toBe("light");
  });

  it("falls back to prefers-dark when no stored value", () => {
    const storage = makeStorage();
    expect(readInitialTheme(storage, { matches: true })).toBe("dark");
  });

  it("defaults to 'light' when no storage and no prefers-dark", () => {
    expect(readInitialTheme(null, null)).toBe("light");
  });
});

// ---------------------------------------------------------------------------
// U3-3: nextTheme flips correctly (simulates debounced toggle)
// ---------------------------------------------------------------------------

describe("nextTheme — flips correctly", () => {
  it("light → dark", () => {
    expect(nextTheme("light")).toBe("dark");
  });

  it("dark → light", () => {
    expect(nextTheme("dark")).toBe("light");
  });

  it("rapid toggle sequence ends on correct value", () => {
    let t = nextTheme("light"); // dark
    t = nextTheme(t);           // light
    t = nextTheme(t);           // dark
    expect(t).toBe("dark");
  });
});

// ---------------------------------------------------------------------------
// U3-4: graceful fallback when localStorage blocked (ECN-26a-17)
// ---------------------------------------------------------------------------

describe("applyTheme — graceful fallback when storage blocked", () => {
  it("does not throw when localStorage blocked; class still toggles", () => {
    const blockedStorage = makeBlockedStorage();
    const classList = makeClassList();

    expect(() => {
      applyTheme("dark", classList, blockedStorage);
    }).not.toThrow();

    expect(classList.classes.has("dark-mode")).toBe(true);
  });

  it("readInitialTheme returns 'light' when localStorage blocked", () => {
    const blockedStorage = makeBlockedStorage();
    expect(() => {
      const theme = readInitialTheme(blockedStorage, null);
      expect(theme).toBe("light");
    }).not.toThrow();
  });
});
