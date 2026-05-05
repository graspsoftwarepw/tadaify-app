/**
 * Unit tests for onboarding-viewport-store — sessionStorage round-trip.
 *
 * Tests exercise the real setViewport/getViewport exports with a stubbed
 * globalThis.window and globalThis.sessionStorage so no jsdom is needed.
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Minimal in-memory sessionStorage stub
// ---------------------------------------------------------------------------

function makeStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    store,
    getItem: (k: string): string | null =>
      Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (_i: number): string | null => null,
  };
}

// ---------------------------------------------------------------------------
// Tests — each test freshly imports the real module via vi.resetModules()
// ---------------------------------------------------------------------------

describe("onboarding-viewport-store", () => {
  let storage: ReturnType<typeof makeStorage>;
  let originalWindow: typeof globalThis.window;
  let originalSessionStorage: typeof globalThis.sessionStorage;

  beforeEach(() => {
    storage = makeStorage();
    originalWindow = globalThis.window;
    originalSessionStorage = globalThis.sessionStorage;

    // Stub so typeof window !== "undefined" in the real module
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof globalThis.window === "undefined") {
      (globalThis as any).window = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).sessionStorage = storage;
  });

  afterEach(() => {
    vi.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = originalWindow;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).sessionStorage = originalSessionStorage;
  });

  async function loadStore() {
    const mod = await import("./onboarding-viewport-store");
    return {
      setViewport: mod.setViewport,
      getViewport: mod.getViewport,
      SESSION_KEY: mod.SESSION_KEY,
    };
  }

  it("round-trip Desktop", async () => {
    const { setViewport, getViewport, SESSION_KEY } = await loadStore();
    setViewport("desktop");
    expect(getViewport()).toBe("desktop");
    expect(storage.store[SESSION_KEY]).toBe("desktop");
  });

  it("round-trip Tablet", async () => {
    const { setViewport, getViewport, SESSION_KEY } = await loadStore();
    setViewport("tablet");
    expect(getViewport()).toBe("tablet");
    expect(storage.store[SESSION_KEY]).toBe("tablet");
  });

  it("round-trip Mobile", async () => {
    const { setViewport, getViewport, SESSION_KEY } = await loadStore();
    setViewport("mobile");
    expect(getViewport()).toBe("mobile");
    expect(storage.store[SESSION_KEY]).toBe("mobile");
  });

  it("defaults to Desktop on missing key", async () => {
    const { getViewport } = await loadStore();
    // storage is empty — no key set
    expect(getViewport()).toBe("desktop");
  });

  it("falls back to desktop on invalid stored value and logs warning", async () => {
    const { SESSION_KEY } = await import("./onboarding-viewport-store");
    storage.store[SESSION_KEY] = "weird";
    vi.resetModules();

    const { getViewport } = await loadStore();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = getViewport();

    expect(result).toBe("desktop");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("invalid stored value"));
    warnSpy.mockRestore();
  });

  it("uses correct SESSION_KEY", async () => {
    const { SESSION_KEY } = await loadStore();
    expect(SESSION_KEY).toBe("tadaify:onboarding:viewport");
  });

  it("swallows storage exception on setViewport", async () => {
    // Make setItem throw to simulate private browsing strict mode
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    vi.resetModules();

    const { setViewport } = await loadStore();
    // Should not throw
    expect(() => setViewport("tablet")).not.toThrow();
  });

  it("returns desktop when getItem throws", async () => {
    storage.getItem = () => {
      throw new Error("SecurityError");
    };
    vi.resetModules();

    const { getViewport } = await loadStore();
    expect(getViewport()).toBe("desktop");
  });
});
