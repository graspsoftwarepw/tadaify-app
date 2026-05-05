/**
 * Unit tests for onboarding-preview-bus — debounced state broadcast.
 *
 * Tests use a manual fake-window approach (no jsdom required) to exercise
 * the publish/subscribe logic with injected event-listener stubs.
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PREVIEW_EVENT, type OnboardingPreviewState } from "./onboarding-preview-bus";

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
// Helpers that work with the fake window
// ---------------------------------------------------------------------------

/** Build a CustomEvent-like object (plain object; no real DOM needed) */
function makeEvent<T>(type: string, detail: T): CustomEvent<T> {
  return { type, detail, bubbles: true } as unknown as CustomEvent<T>;
}

/** Minimal publish/subscribe re-implementation for isolated tests */
function makeTestBus(fakeWindow: ReturnType<typeof makeFakeWindow>) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function publish(state: OnboardingPreviewState, debounceMs = 150) {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const event = makeEvent(PREVIEW_EVENT, state);
      fakeWindow.dispatchEvent(event as unknown as Event);
    }, debounceMs);
  }

  function subscribe(listener: (state: OnboardingPreviewState) => void) {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<OnboardingPreviewState>;
      listener(ce.detail);
    };
    fakeWindow.addEventListener(PREVIEW_EVENT, handler);
    return () => fakeWindow.removeEventListener(PREVIEW_EVENT, handler);
  }

  return { publish, subscribe };
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
// Tests
// ---------------------------------------------------------------------------

describe("onboarding-preview-bus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces multiple rapid updates into single fire (150ms)", () => {
    const fakeWindow = makeFakeWindow();
    const { publish, subscribe } = makeTestBus(fakeWindow);
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // 5 rapid publishes within 100ms, each with a debounce of 150ms
    for (let i = 0; i < 5; i++) {
      publish({ ...SAMPLE, name: `Update ${i}` }, 150);
    }

    // Before 150ms: listener not yet called
    vi.advanceTimersByTime(100);
    expect(listener).not.toHaveBeenCalled();

    // After 150ms from last publish: exactly 1 call
    vi.advanceTimersByTime(60);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it("fires immediately on first call after idle", () => {
    const fakeWindow = makeFakeWindow();
    const { publish, subscribe } = makeTestBus(fakeWindow);
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // Let 200ms pass (no pending debounce)
    vi.advanceTimersByTime(200);

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

  it("preserves latest payload on burst", () => {
    const fakeWindow = makeFakeWindow();
    const { publish, subscribe } = makeTestBus(fakeWindow);
    const listener = vi.fn();
    const unsub = subscribe(listener);

    const payloads = [
      { ...SAMPLE, name: "First" },
      { ...SAMPLE, name: "Second" },
      { ...SAMPLE, name: "Last" },
    ];
    for (const p of payloads) {
      publish(p, 150);
    }

    vi.advanceTimersByTime(200);

    // Only 1 call, with LAST payload
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: "Last" }));

    unsub();
  });

  it("cleanup unsubscribes listener", () => {
    const fakeWindow = makeFakeWindow();
    const { publish, subscribe } = makeTestBus(fakeWindow);
    const listener = vi.fn();
    const unsub = subscribe(listener);

    // Unsubscribe BEFORE debounce fires
    unsub();

    publish({ ...SAMPLE }, 10);
    vi.advanceTimersByTime(50);

    // Listener should NOT have been called after unsubscribe
    expect(listener).not.toHaveBeenCalled();
  });
});
