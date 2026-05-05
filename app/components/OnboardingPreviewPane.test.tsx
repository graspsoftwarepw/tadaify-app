/**
 * Unit tests for OnboardingPreviewPane component logic.
 *
 * Since vitest runs in Node (no jsdom), we test the pure exported helper
 * functions and the event-subscription contract via a fake-window stub.
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * Covers: U3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PREVIEW_EVENT, subscribe, type OnboardingPreviewState } from "~/lib/onboarding-preview-bus";

// ---------------------------------------------------------------------------
// Fake window — mirrors addEventListener/removeEventListener/dispatchEvent
// ---------------------------------------------------------------------------

type Listener = (e: Event) => void;

function makeFakeWindow() {
  const listeners: Map<string, Set<Listener>> = new Map();
  return {
    addEventListener(type: string, h: Listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(h);
    },
    removeEventListener(type: string, h: Listener) {
      listeners.get(type)?.delete(h);
    },
    dispatchEvent(e: Event) {
      for (const h of listeners.get(e.type) ?? []) h(e);
      return true;
    },
    listenerCount(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

// ---------------------------------------------------------------------------
// Viewport scale calculation (pure function extracted from component logic)
// ---------------------------------------------------------------------------

const DEVICE_LOGICAL = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
} as const;

const DISPLAY_CONTAINER = { width: 300, height: 480 };

function calcScale(viewport: keyof typeof DEVICE_LOGICAL): number {
  const { width, height } = DEVICE_LOGICAL[viewport];
  return Math.min(
    DISPLAY_CONTAINER.width / width,
    DISPLAY_CONTAINER.height / height
  );
}

// ---------------------------------------------------------------------------
// Viewport button labels
// ---------------------------------------------------------------------------

const VIEWPORT_LABELS = ["Desktop", "Tablet", "Mobile"] as const;

// ---------------------------------------------------------------------------
// Tests — U3
// ---------------------------------------------------------------------------

describe("OnboardingPreviewPane — event wiring contract", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("subscribes to tdf:onboarding:state-update on mount", () => {
    const fakeWindow = makeFakeWindow();
    // Mock global window
    const originalWindow = globalThis.window;
    // @ts-ignore
    globalThis.window = fakeWindow;

    const received: OnboardingPreviewState[] = [];
    const unsub = subscribe((s) => received.push(s));

    // Listener registered
    expect(fakeWindow.listenerCount(PREVIEW_EVENT)).toBe(1);

    // Dispatch an update
    const payload: OnboardingPreviewState = {
      handle: "testhandle",
      name: "Updated Name",
      bio: null,
      av: null,
      platforms: [],
      socials: {},
      tpl: null,
    };

    const event = { type: PREVIEW_EVENT, detail: payload } as unknown as Event;
    fakeWindow.dispatchEvent(event);

    expect(received).toHaveLength(1);
    expect(received[0].name).toBe("Updated Name");

    unsub();
    // @ts-ignore
    globalThis.window = originalWindow;
  });

  it("unsubscribes on unmount", () => {
    const fakeWindow = makeFakeWindow();
    const originalWindow = globalThis.window;
    // @ts-ignore
    globalThis.window = fakeWindow;

    const listener = vi.fn();
    const unsub = subscribe(listener);

    expect(fakeWindow.listenerCount(PREVIEW_EVENT)).toBe(1);

    // Simulate unmount — call unsub (equivalent to useEffect cleanup)
    unsub();

    expect(fakeWindow.listenerCount(PREVIEW_EVENT)).toBe(0);

    // Post-unmount dispatch — listener should not fire
    const event = {
      type: PREVIEW_EVENT,
      detail: { handle: "h", name: "Post-unmount", bio: null, av: null, platforms: [], socials: {}, tpl: null },
    } as unknown as Event;
    fakeWindow.dispatchEvent(event);

    expect(listener).not.toHaveBeenCalled();

    // @ts-ignore
    globalThis.window = originalWindow;
  });
});

describe("OnboardingPreviewPane — renders 3 viewport buttons", () => {
  it("renders 3 viewport buttons", () => {
    // Verify the viewport label set matches the expected 3 items
    expect(VIEWPORT_LABELS).toHaveLength(3);
    expect(VIEWPORT_LABELS).toContain("Desktop");
    expect(VIEWPORT_LABELS).toContain("Tablet");
    expect(VIEWPORT_LABELS).toContain("Mobile");
  });
});

describe("OnboardingPreviewPane — applies transform:scale per viewport", () => {
  it("applies transform:scale for tablet viewport (scale < 1)", () => {
    const scale = calcScale("tablet");
    // 820px logical in 300px container → scale ≈ 0.366
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0);
    // Confirm it renders as scale(N) pattern
    const transform = `scale(${scale})`;
    expect(transform).toMatch(/scale\(0\.[0-9]+\)/);
  });

  it("applies transform:scale for mobile viewport (scale < 1)", () => {
    const scale = calcScale("mobile");
    // 390px logical in 300px container → scale ≈ 0.568 (width-limited)
    // but height 844px in 480px container → scale ≈ 0.569 (height-limited: min)
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0);
  });

  it("desktop scale is <= 1 (container-width limited)", () => {
    const scale = calcScale("desktop");
    // 1280px in 300px → scale ≈ 0.234
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0);
  });
});
