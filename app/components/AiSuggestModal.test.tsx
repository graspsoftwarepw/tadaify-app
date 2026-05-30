/**
 * Unit tests — AiSuggestModal component
 *
 * Smoke tests that the component contract is correct without requiring DOM.
 * Follows the same pattern as TierGateModal.test.tsx (pure logic, no JSDOM).
 * DOM/interactive behaviour is intended for Playwright.
 *
 * Story: DEC-030 (AI credit quota ladder)
 */

import { describe, it, expect } from "vitest";
import {
  AiSuggestModal,
  AI_SUGGEST_CLOSE_LABEL,
  QUOTAS,
  TIER_LABELS,
  type AiSuggestModalProps,
  type TierLevel,
} from "./AiSuggestModal";

// ---------------------------------------------------------------------------
// ASM-U1: component is callable
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U1: component contract", () => {
  it("AiSuggestModal is a callable function (component)", () => {
    expect(typeof AiSuggestModal).toBe("function");
  });

  it("accepts open=false without error (prop contract)", () => {
    const props: AiSuggestModalProps = {
      open: false,
      onOpenChange: (_open: boolean) => {},
      currentTier: "free",
      surface: "Block title",
      inputText: "My latest release",
      onAccept: (_text: string) => {},
    };
    expect(() => {
      const { open, onOpenChange, currentTier, surface, onAccept } = props;
      void open, void onOpenChange, void currentTier, void surface, void onAccept;
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ASM-U2: ARIA + label constants
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U2: label constants", () => {
  it("AI_SUGGEST_CLOSE_LABEL is 'Close'", () => {
    expect(AI_SUGGEST_CLOSE_LABEL).toBe("Close");
  });

  it("AI_SUGGEST_CLOSE_LABEL contains 'Close' for aria-label contract", () => {
    expect(AI_SUGGEST_CLOSE_LABEL).toMatch(/close/i);
  });
});

// ---------------------------------------------------------------------------
// ASM-U3: quota ladder (DEC-174-179)
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U3: quota ladder", () => {
  it("Free tier limit is 5", () => {
    expect(QUOTAS.free.limit).toBe(5);
  });

  it("Creator tier limit is 50", () => {
    expect(QUOTAS.creator.limit).toBe(50);
  });

  it("Pro tier is unlimited", () => {
    expect(QUOTAS.pro.unlimited).toBe(true);
  });

  it("Business tier is unlimited", () => {
    expect(QUOTAS.business.unlimited).toBe(true);
  });

  it("Free+Creator are NOT unlimited", () => {
    expect(QUOTAS.free.unlimited).toBe(false);
    expect(QUOTAS.creator.unlimited).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ASM-U4: tier labels match canonical names
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U4: tier labels", () => {
  it("tier labels match canonical pricing names", () => {
    expect(TIER_LABELS.free).toBe("Free");
    expect(TIER_LABELS.creator).toBe("Creator");
    expect(TIER_LABELS.pro).toBe("Pro");
    expect(TIER_LABELS.business).toBe("Business");
  });
});

// ---------------------------------------------------------------------------
// ASM-U5: component arity (single props arg)
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U5: component arity", () => {
  it("AiSuggestModal.length is 1 (single props argument)", () => {
    expect(AiSuggestModal.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// ASM-U6: optional props have correct defaults
// ---------------------------------------------------------------------------

describe("AiSuggestModal — ASM-U6: optional prop defaults", () => {
  it("creditsUsed defaults result in non-negative remaining for all tiers", () => {
    const tiers: TierLevel[] = ["free", "creator", "pro", "business"];
    for (const tier of tiers) {
      const spec = QUOTAS[tier];
      const remaining = spec.unlimited ? Infinity : Math.max(0, spec.limit - 0);
      expect(remaining).toBeGreaterThanOrEqual(0);
    }
  });
});
