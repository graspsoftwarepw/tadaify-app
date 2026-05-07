/**
 * Unit tests — icon resolver (U2)
 *
 * Tests renderIcon() behavior: known IDs, unknown IDs, fallback, props.
 * Runs in Node environment (no JSDOM) — no React rendering, only
 * structural/contract assertions.
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: U2 (6 cases), TR-tadaify-014 (resolver), AC items 4, 9, 11
 */

import { describe, it, expect } from "vitest";
import React from "react";
import { renderIcon, FALLBACK_ICON_ID, DEFAULT_ICON_SIZE } from "./icon-resolve";

// ---------------------------------------------------------------------------
// U2-1: known lucide ID resolves to a React element
// ---------------------------------------------------------------------------

describe("renderIcon — U2-1: known lucide ID resolves", () => {
  it("renderIcon('lucide:link') returns a React element (not null)", () => {
    const el = renderIcon("lucide:link");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });

  it("renderIcon('lucide:heart') returns a React element", () => {
    const el = renderIcon("lucide:heart");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });

  it("renderIcon('lucide:spotify') — non-lucide name still handled (fallback)", () => {
    // 'spotify' is not in the lucide registry — should return fallback element
    const el = renderIcon("lucide:spotify");
    expect(React.isValidElement(el)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// U2-2: known simple-icons ID resolves to inline SVG element
// ---------------------------------------------------------------------------

describe("renderIcon — U2-2: known simple-icons ID resolves to SVG", () => {
  it("renderIcon('simple-icons:spotify') returns a React element", () => {
    const el = renderIcon("simple-icons:spotify");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });

  it("simple-icons SVG element has type 'svg'", () => {
    const el = renderIcon("simple-icons:spotify");
    expect(React.isValidElement(el)).toBe(true);
    if (React.isValidElement(el)) {
      expect(el.type).toBe("svg");
    }
  });

  it("simple-icons SVG element has brand-color fill (non-empty string)", () => {
    const el = renderIcon("simple-icons:spotify");
    if (React.isValidElement(el)) {
      const props = el.props as Record<string, unknown>;
      // fill should be "#1ED760" (spotify green)
      expect(typeof props.fill).toBe("string");
      expect((props.fill as string).startsWith("#")).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// U2-3: unknown ID returns fallback (HelpCircle)
// ---------------------------------------------------------------------------

describe("renderIcon — U2-3: unknown ID returns fallback element", () => {
  it("unknown lucide ID returns fallback React element", () => {
    const el = renderIcon("lucide:nonexistentIconXyz");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });

  it("unknown simple-icons ID returns fallback React element", () => {
    const el = renderIcon("simple-icons:nonexistent-brand-xyz");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });

  it("completely malformed ID returns fallback React element", () => {
    const el = renderIcon("not-a-real:prefix:anything");
    expect(el).not.toBeNull();
    expect(React.isValidElement(el)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// U2-4: null/undefined/empty ID returns null
// ---------------------------------------------------------------------------

describe("renderIcon — U2-4: null/undefined/empty ID returns null", () => {
  it("renderIcon(null) returns null", () => {
    expect(renderIcon(null)).toBeNull();
  });

  it("renderIcon(undefined) returns null", () => {
    expect(renderIcon(undefined)).toBeNull();
  });

  it("renderIcon('') returns null", () => {
    expect(renderIcon("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// U2-5: props.size is passed to the rendered element
// ---------------------------------------------------------------------------

describe("renderIcon — U2-5: size prop is respected", () => {
  it("renderIcon with size=32 produces element with size=32", () => {
    const el = renderIcon("lucide:link", { size: 32 });
    if (React.isValidElement(el)) {
      const props = el.props as Record<string, unknown>;
      expect(props.size).toBe(32);
    }
  });

  it("renderIcon with size=32 for simple-icons produces SVG width=32", () => {
    const el = renderIcon("simple-icons:spotify", { size: 32 });
    if (React.isValidElement(el)) {
      const props = el.props as Record<string, unknown>;
      expect(props.width).toBe(32);
      expect(props.height).toBe(32);
    }
  });

  it("FALLBACK_ICON_ID is a non-empty string", () => {
    expect(typeof FALLBACK_ICON_ID).toBe("string");
    expect(FALLBACK_ICON_ID.length).toBeGreaterThan(0);
  });

  it("DEFAULT_ICON_SIZE is a positive number", () => {
    expect(typeof DEFAULT_ICON_SIZE).toBe("number");
    expect(DEFAULT_ICON_SIZE).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// U2-6: className prop is threaded through
// ---------------------------------------------------------------------------

describe("renderIcon — U2-6: className prop is respected", () => {
  it("renderIcon with className passes it to element", () => {
    const el = renderIcon("lucide:link", { className: "my-icon-class" });
    if (React.isValidElement(el)) {
      const props = el.props as Record<string, unknown>;
      expect(props.className).toBe("my-icon-class");
    }
  });

  it("renderIcon simple-icons with className passes it to SVG element", () => {
    const el = renderIcon("simple-icons:spotify", { className: "brand-icon" });
    if (React.isValidElement(el)) {
      const props = el.props as Record<string, unknown>;
      expect(props.className).toBe("brand-icon");
    }
  });
});
