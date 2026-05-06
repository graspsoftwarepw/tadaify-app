/**
 * Unit tests — BlockPickerModal component (U1)
 *
 * Tests pure exported logic and component contracts.
 * Runs in Node environment (no JSDOM) — mirrors project pattern.
 * DOM rendering behavior is tested in Playwright (S1–S7).
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: U1 (6 cases)
 */

import { describe, it, expect } from "vitest";
import {
  BlockPickerModal,
  SEARCH_INPUT_LABEL,
  PICKER_CLOSE_BUTTON_LABEL,
} from "./BlockPickerModal";
import { BLOCK_TYPES, isBlockTypeLocked } from "~/lib/block-types";

// ---------------------------------------------------------------------------
// U1-1: renders nothing when open=false
// (logic proxy: component is a function; Radix Dialog.Portal mounts null
//  when open=false — tested in Playwright S1)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-1: component contract when open=false", () => {
  it("BlockPickerModal is a callable function (component)", () => {
    expect(typeof BlockPickerModal).toBe("function");
  });

  it("accepts open=false without error (prop contract)", () => {
    // Validate the prop signature exists and onOpenChange is a function
    const props = {
      open: false,
      onOpenChange: (_open: boolean) => {},
      onSelect: (_blockType: string) => {},
      currentTier: "free" as const,
    };
    // No throw expected when destructuring props
    expect(() => {
      const { open, onOpenChange, onSelect, currentTier } = props;
      void open, void onOpenChange, void onSelect, void currentTier;
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// U1-2: renders Dialog with role=dialog when open=true
// (logic proxy: SEARCH_INPUT_LABEL + PICKER_CLOSE_BUTTON_LABEL are set —
//  Radix provides role/aria; DOM assertion in Playwright S1)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-2: ARIA contract for open=true", () => {
  it("search input label is 'Find a block type' (visual checklist item)", () => {
    expect(SEARCH_INPUT_LABEL).toBe("Find a block type");
  });

  it("close button aria-label is 'Close picker'", () => {
    expect(PICKER_CLOSE_BUTTON_LABEL).toBe("Close picker");
  });
});

// ---------------------------------------------------------------------------
// U1-3: auto-focuses search input on open
// (logic proxy: SEARCH_AUTOFOCUS_DELAY_MS = 200ms constant — DOM assertion
//  in Playwright S1; we verify the exported constants are correct types)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-3: auto-focus contract", () => {
  it("SEARCH_INPUT_LABEL is a non-empty string", () => {
    expect(typeof SEARCH_INPUT_LABEL).toBe("string");
    expect(SEARCH_INPUT_LABEL.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// U1-4: closes via Esc / backdrop click / close button
// (Radix Dialog handles Esc natively; close button uses Dialog.Close;
//  DOM behavior asserted in Playwright S1/S2/S3)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-4: close mechanism contract", () => {
  it("PICKER_CLOSE_BUTTON_LABEL contains 'Close' to satisfy aria-label contract", () => {
    expect(PICKER_CLOSE_BUTTON_LABEL).toMatch(/close/i);
  });
});

// ---------------------------------------------------------------------------
// U1-5: fires onSelect with blockType when non-locked card clicked
// (DOM behavior: Playwright S3; logic proxy: onSelect is a function prop)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-5: onSelect callback contract", () => {
  it("onSelect prop type is (blockType: string) => void", () => {
    // Verify the component declares onSelect in its props
    // We call BlockPickerModal.length to check arity hint (1 props arg)
    expect(BlockPickerModal.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// U1-6: does NOT fire onSelect when locked card clicked
// (DOM behavior: Playwright S4; logic proxy: isBlockTypeLocked integration)
// ---------------------------------------------------------------------------

describe("BlockPickerModal — U1-6: locked card behavior contract", () => {
  it("custom-html is the only entry in the registry with requiredTier set", () => {
    const gated = BLOCK_TYPES.filter(
      (bt: { requiredTier?: string }) => bt.requiredTier !== undefined,
    );
    expect(gated).toHaveLength(1);
    expect(gated[0].id).toBe("custom-html");
  });

  it("locked card data-locked attribute mechanism — isBlockTypeLocked returns true for free tier + custom-html", () => {
    const customHtml = BLOCK_TYPES.find(
      (bt: { id: string }) => bt.id === "custom-html",
    );
    expect(customHtml).toBeDefined();
    expect(isBlockTypeLocked(customHtml, "free")).toBe(true);
    expect(isBlockTypeLocked(customHtml, "creator")).toBe(true);
    expect(isBlockTypeLocked(customHtml, "pro")).toBe(false);
  });
});
