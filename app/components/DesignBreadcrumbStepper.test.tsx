/**
 * Unit tests — DesignBreadcrumbStepper (U2)
 *
 * Tests the deriveStepperWindow logic + keyboard navigation behavior.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: U2, VE-26b-05, VE-26b-07, ECN-26b-03
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deriveStepperWindow, SUB_TABS, isEditableTarget } from "./DesignBreadcrumbStepper";

describe("deriveStepperWindow", () => {
  it("first sub-tab (theme) shows null prev", () => {
    const result = deriveStepperWindow("theme");
    expect(result.prev).toBeNull();
    expect(result.current).toBe("theme");
    expect(result.next).toBe("profile");
  });

  it("default sub-tab (background) is third in order — index 2", () => {
    const result = deriveStepperWindow("background");
    expect(result.prev).toBe("profile");
    expect(result.current).toBe("background");
    expect(result.next).toBe("text");
  });

  it("last sub-tab (footer) shows null next", () => {
    const result = deriveStepperWindow("footer");
    expect(result.prev).toBe("colors");
    expect(result.current).toBe("footer");
    expect(result.next).toBeNull();
  });

  it("invalid sub-tab falls back to background (index 2)", () => {
    const result = deriveStepperWindow("foobar");
    expect(result.current).toBe("background");
    expect(result.prev).toBe("profile");
    expect(result.next).toBe("text");
  });

  it("animations sub-tab shows buttons prev and colors next", () => {
    const result = deriveStepperWindow("animations");
    expect(result.prev).toBe("buttons");
    expect(result.current).toBe("animations");
    expect(result.next).toBe("colors");
  });

  it("SUB_TABS has exactly 8 entries in correct order", () => {
    expect(SUB_TABS).toHaveLength(8);
    const ids = SUB_TABS.map((t) => t.id);
    expect(ids).toEqual([
      "theme",
      "profile",
      "background",
      "text",
      "buttons",
      "animations",
      "colors",
      "footer",
    ]);
  });
});

// isEditableTarget uses duck-typing on tagName/isContentEditable — testable
// in a pure node environment without a DOM shim.
function fakeEl(tagName: string, isContentEditable = false): EventTarget {
  return { tagName: tagName.toUpperCase(), isContentEditable } as unknown as EventTarget;
}

describe("isEditableTarget — keyboard isolation gate (P2 fix)", () => {
  it("returns true for INPUT element", () => {
    expect(isEditableTarget(fakeEl("INPUT"))).toBe(true);
  });

  it("returns true for TEXTAREA element", () => {
    expect(isEditableTarget(fakeEl("TEXTAREA"))).toBe(true);
  });

  it("returns true for SELECT element", () => {
    expect(isEditableTarget(fakeEl("SELECT"))).toBe(true);
  });

  it("returns true for contentEditable element", () => {
    expect(isEditableTarget(fakeEl("DIV", true))).toBe(true);
  });

  it("returns false for a plain button (arrow nav fires normally)", () => {
    expect(isEditableTarget(fakeEl("BUTTON"))).toBe(false);
  });

  it("returns false for a span (non-editable)", () => {
    expect(isEditableTarget(fakeEl("SPAN"))).toBe(false);
  });

  it("returns false for null (e.g. keyboard event with no target)", () => {
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe("DesignBreadcrumbStepper keyboard navigation (contract)", () => {
  it("ArrowRight from background should navigate to text", () => {
    const { next } = deriveStepperWindow("background");
    expect(next).toBe("text");
  });

  it("ArrowLeft from background should navigate to profile", () => {
    const { prev } = deriveStepperWindow("background");
    expect(prev).toBe("profile");
  });

  it("ArrowLeft on first sub-tab (theme) is no-op — prev is null", () => {
    const { prev } = deriveStepperWindow("theme");
    expect(prev).toBeNull();
  });

  it("ArrowRight on last sub-tab (footer) is no-op — next is null", () => {
    const { next } = deriveStepperWindow("footer");
    expect(next).toBeNull();
  });
});
