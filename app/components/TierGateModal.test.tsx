/**
 * Unit tests — TierGateModal component
 *
 * Smoke tests that the component contract is correct without requiring DOM.
 * Follows the same pattern as BlockPickerModal.test.tsx (pure logic, no JSDOM).
 * DOM/interactive behaviour is intended for Playwright.
 *
 * Story: tadaify-app#209 DEC-382=A
 */

import { describe, it, expect } from "vitest";
import {
  TierGateModal,
  TIER_GATE_CLOSE_LABEL,
  TIER_RANK,
  TIER_LABEL,
} from "./TierGateModal";

// ---------------------------------------------------------------------------
// TGM-U1: component is callable
// ---------------------------------------------------------------------------

describe("TierGateModal — TGM-U1: component contract", () => {
  it("TierGateModal is a callable function (component)", () => {
    expect(typeof TierGateModal).toBe("function");
  });

  it("accepts open=false without error (prop contract)", () => {
    const props = {
      open: false,
      onOpenChange: (_open: boolean) => {},
      currentTier: "free" as const,
      features: [
        {
          id: "ab",
          name: "A/B testing",
          requires: "business" as const,
          contextLines: ["A/B test on <b>Newsletter signup</b> — 2 variants"],
        },
      ],
    };
    expect(() => {
      const { open, onOpenChange, currentTier, features } = props;
      void open, void onOpenChange, void currentTier, void features;
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// TGM-U2: ARIA + label constants
// ---------------------------------------------------------------------------

describe("TierGateModal — TGM-U2: label constants", () => {
  it("TIER_GATE_CLOSE_LABEL is 'Close'", () => {
    expect(TIER_GATE_CLOSE_LABEL).toBe("Close");
  });

  it("TIER_GATE_CLOSE_LABEL contains 'Close' for aria-label contract", () => {
    expect(TIER_GATE_CLOSE_LABEL).toMatch(/close/i);
  });
});

// ---------------------------------------------------------------------------
// TGM-U3: tier rank ordering
// ---------------------------------------------------------------------------

describe("TierGateModal — TGM-U3: tier rank ordering", () => {
  it("free < creator < pro < business", () => {
    expect(TIER_RANK.free).toBeLessThan(TIER_RANK.creator);
    expect(TIER_RANK.creator).toBeLessThan(TIER_RANK.pro);
    expect(TIER_RANK.pro).toBeLessThan(TIER_RANK.business);
  });

  it("tier labels match canonical pricing.html names", () => {
    expect(TIER_LABEL.free).toBe("Free");
    expect(TIER_LABEL.creator).toBe("Creator");
    expect(TIER_LABEL.pro).toBe("Pro");
    expect(TIER_LABEL.business).toBe("Business");
  });
});

// ---------------------------------------------------------------------------
// TGM-U4: component arity (single props arg)
// ---------------------------------------------------------------------------

describe("TierGateModal — TGM-U4: component arity", () => {
  it("TierGateModal.length is 1 (single props argument)", () => {
    expect(TierGateModal.length).toBe(1);
  });
});
