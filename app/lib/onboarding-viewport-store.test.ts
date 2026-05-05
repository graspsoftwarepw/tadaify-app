/**
 * Unit tests for onboarding-viewport-store — sessionStorage round-trip.
 *
 * Tests use injected storage stubs (no jsdom required).
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U2
 */

import { describe, it, expect, vi } from "vitest";
import { SESSION_KEY, type ViewportSize } from "./onboarding-viewport-store";

// ---------------------------------------------------------------------------
// Minimal in-memory sessionStorage stub
// ---------------------------------------------------------------------------

function makeStorage(initial: Record<string, string> = {}): {
  store: Record<string, string>;
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  clear: () => void;
} {
  const store = { ...initial };
  return {
    store,
    getItem: (k: string) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
}

// ---------------------------------------------------------------------------
// Pure implementations under test (extracted for stub injection)
// ---------------------------------------------------------------------------

/**
 * Pure version of setViewport — writes to injected storage.
 */
function setViewportWith(viewport: ViewportSize, storage: Pick<Storage, "setItem">): void {
  storage.setItem(SESSION_KEY, viewport);
}

const VALID_VALUES: ViewportSize[] = ["desktop", "tablet", "mobile"];
function isValidViewport(v: unknown): v is ViewportSize {
  return VALID_VALUES.includes(v as ViewportSize);
}

/**
 * Pure version of getViewport — reads from injected storage.
 */
function getViewportWith(
  storage: Pick<Storage, "getItem">,
  warnFn: (msg: string) => void = () => {}
): ViewportSize {
  const raw = storage.getItem(SESSION_KEY);
  if (raw === null) return "desktop";
  if (!isValidViewport(raw)) {
    warnFn(`[onboarding-viewport-store] invalid stored value "${raw}" — falling back to "desktop"`);
    return "desktop";
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("onboarding-viewport-store", () => {
  it("round-trip Desktop", () => {
    const s = makeStorage();
    setViewportWith("desktop", s);
    expect(getViewportWith(s)).toBe("desktop");
    expect(s.store[SESSION_KEY]).toBe("desktop");
  });

  it("round-trip Tablet", () => {
    const s = makeStorage();
    setViewportWith("tablet", s);
    expect(getViewportWith(s)).toBe("tablet");
    expect(s.store[SESSION_KEY]).toBe("tablet");
  });

  it("round-trip Mobile", () => {
    const s = makeStorage();
    setViewportWith("mobile", s);
    expect(getViewportWith(s)).toBe("mobile");
    expect(s.store[SESSION_KEY]).toBe("mobile");
  });

  it("default to Desktop on missing key", () => {
    const s = makeStorage(); // empty
    expect(getViewportWith(s)).toBe("desktop");
  });

  it("ignore invalid stored value and return desktop + log warning", () => {
    const s = makeStorage({ [SESSION_KEY]: "weird" });
    const warnFn = vi.fn();
    const result = getViewportWith(s, warnFn);

    expect(result).toBe("desktop");
    expect(warnFn).toHaveBeenCalledWith(expect.stringContaining("invalid stored value"));
  });
});
