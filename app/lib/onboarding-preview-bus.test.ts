/**
 * Unit tests for onboarding-preview-bus — debounced state broadcast.
 *
 * Tests exercise the real publish/subscribe exports with a stubbed
 * globalThis.window and globalThis.CustomEvent so no jsdom is needed.
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { OnboardingPreviewState } from "./onboarding-preview-bus";

// ---------------------------------------------------------------------------
// Minimal fake-window that supports addEventListener / removeEventListener /
// dispatchEvent — same shape as the real window API, no jsdom needed.
// ---------------------------------------------------------------------------

type Listener = (e: Event) => void;

function makeFakeWindow() {
  const listeners: Map<string, Set<Listener>> = new Map();
  return {
    addEventListener(type: string, handler: Listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener(type: string, handler: Listener) {
      listeners.get(type)?.delete(handler);
    },
    dispatchEvent(event: Event) {
      const type = event.type;
      for (const h of listeners.get(type) ?? []) {
        h(event);
      }
      return true;
    },
    listenerCount(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SAMPLE: OnboardingPreviewState = {
  handle: "testuser",
  name: "Test User",
  bio: "A bio",
  av: null,
  platforms: ["instagram"],
  socials: { instagram: "@testuser" },
  tpl: "chopin",
};

// ---------------------------------------------------------------------------
// Tests — each test freshly imports the real module via vi.resetModules()
// so the module-level debounceTimer is clean.
// ---------------------------------------------------------------------------

describe("onboarding-preview-bus", () => {
  let fakeWindow: ReturnType<typeof makeFakeWindow>;
  let originalWindow: typeof globalThis.window;
  let originalCustomEvent: typeof globalThis.CustomEvent;

  beforeEach(() => {
    vi.useFakeTimers();

    fakeWindow = makeFakeWindow();
    originalWindow = globalThis.window;
    originalCustomEvent = globalThis.CustomEvent;

    // Stub globalThis.window so the real module's typeof window !== "undefined"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = fakeWindow;

    // Stub CustomEvent constructor to produce objects our fakeWindow can dispatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).CustomEvent = class FakeCustomEvent {
      type: string;
      detail: unknown;
      bubbles: boolean;
      constructor(type: string, init?: { detail?: unknown; bubbles?: boolean }) {
        this.type = type;
        this.detail = init?.detail;
        this.bubbles = init?.bubbles ?? false;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    // Restore originals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = originalWindow;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).CustomEvent = originalCustomEvent;
  });

  async function loadBus() {
    const mod = await import("./onboarding-preview-bus");
    return { publish: mod.publish, subscribe: mod.subscribe, PREVIEW_EVENT: mod.PREVIEW_EVENT };
  }

  it("debounces multiple rapid updates into single fire (150ms)", async () => {
    const { publish, subscribe } = await loadBus();
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // 5 rapid publishes within 100ms, each with default 150ms debounce
    for (let i = 0; i < 5; i++) {
      publish({ ...SAMPLE, name: `Update ${i}` });
    }

    // Before 150ms: listener not yet called
    vi.advanceTimersByTime(100);
    expect(listener).not.toHaveBeenCalled();

    // After 150ms from last publish: exactly 1 call
    vi.advanceTimersByTime(60);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it("fires after debounce window on first call", async () => {
    const { publish, subscribe } = await loadBus();
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // Single publish with 10ms debounce
    publish({ ...SAMPLE, name: "Immediate" }, 10);

    // Not yet (< 10ms)
    vi.advanceTimersByTime(5);
    expect(listener).not.toHaveBeenCalled();

    // After 10ms: fires
    vi.advanceTimersByTime(10);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it("preserves latest payload on burst", async () => {
    const { publish, subscribe } = await loadBus();
    const listener = vi.fn();
    const unsub = subscribe(listener);

    const payloads = [
      { ...SAMPLE, name: "First" },
      { ...SAMPLE, name: "Second" },
      { ...SAMPLE, name: "Last" },
    ];
    for (const p of payloads) {
      publish(p);
    }

    vi.advanceTimersByTime(200);

    // Only 1 call, with LAST payload
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: "Last" }));

    unsub();
  });

  it("cleanup unsubscribes listener", async () => {
    const { publish, subscribe } = await loadBus();
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // Unsubscribe BEFORE debounce fires
    unsub();

    publish({ ...SAMPLE }, 10);
    vi.advanceTimersByTime(50);

    // Listener should NOT have been called after unsubscribe
    expect(listener).not.toHaveBeenCalled();
  });

  it("dispatches event with correct event name", async () => {
    const { publish, PREVIEW_EVENT } = await loadBus();
    expect(PREVIEW_EVENT).toBe("tdf:onboarding:state-update");

    const dispatchSpy = vi.spyOn(fakeWindow, "dispatchEvent");

    publish({ ...SAMPLE }, 0);
    vi.advanceTimersByTime(1);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const dispatched = dispatchSpy.mock.calls[0][0] as unknown as { type: string };
    expect(dispatched.type).toBe("tdf:onboarding:state-update");
  });
});
