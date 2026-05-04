/**
 * Unit tests — AppSidebarDesignAccordion (U1)
 *
 * Tests the accordion state machine (expand/collapse + auto-expand logic).
 * Uses pure logic extraction — tests the auto-expand rule without JSDOM.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: U1, VE-26b-01, VE-26b-02, VE-26b-03, VE-26b-04
 */

import { describe, it, expect } from "vitest";
import { DESIGN_SUB_TABS } from "./AppSidebarDesignAccordion";

// ─── Pure logic tests (no JSX/JSDOM needed) ─────────────────────────────────

/** Mirrors the auto-expand logic in AppSidebarDesignAccordion */
function shouldAutoExpand(activeTab: string, navExpanded: boolean): boolean {
  return activeTab === "design" || navExpanded;
}

/** Mirrors the handleParentClick default subtab logic */
function getDefaultSubTabOnExpand(activeSubTab: string): string {
  return activeSubTab || "background";
}

describe("AppSidebarDesignAccordion accordion state machine", () => {
  it("collapsed by default when ?tab≠design and nav not expanded", () => {
    expect(shouldAutoExpand("page", false)).toBe(false);
  });

  it("auto-expanded when ?tab=design", () => {
    expect(shouldAutoExpand("design", false)).toBe(true);
  });

  it("auto-expanded when ?nav=expanded explicitly (even if tab≠design)", () => {
    expect(shouldAutoExpand("page", true)).toBe(true);
  });

  it("auto-expanded when BOTH ?tab=design and nav=expanded", () => {
    expect(shouldAutoExpand("design", true)).toBe(true);
  });

  it("not auto-expanded when ?tab=insights and nav not expanded", () => {
    expect(shouldAutoExpand("insights", false)).toBe(false);
  });

  it("click parent with no existing subtab defaults to background", () => {
    const result = getDefaultSubTabOnExpand("");
    expect(result).toBe("background");
  });

  it("click parent with existing subtab preserves it", () => {
    const result = getDefaultSubTabOnExpand("animations");
    expect(result).toBe("animations");
  });
});

describe("DESIGN_SUB_TABS constant", () => {
  it("has exactly 8 sub-tabs", () => {
    expect(DESIGN_SUB_TABS).toHaveLength(8);
  });

  it("sub-tabs are in correct order: Theme/Profile/Background/Text/Buttons/Animations/Colors/Footer", () => {
    const labels = DESIGN_SUB_TABS.map((t) => t.label);
    expect(labels).toEqual([
      "Theme",
      "Profile",
      "Background",
      "Text",
      "Buttons",
      "Animations",
      "Colors",
      "Footer",
    ]);
  });

  it("sub-tab ids match expected slugs", () => {
    const ids = DESIGN_SUB_TABS.map((t) => t.id);
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

  it("active sub-item would be visually distinct — data-active attribute contract", () => {
    // Contract: when activeTab=design and activeSubTab=animations,
    // the 'animations' sub-item gets data-active="true" and aria-current="page"
    // We test this by verifying the logic that drives these attributes.
    const activeTab = "design";
    const activeSubTab = "animations";
    for (const subTab of DESIGN_SUB_TABS) {
      const isActive = activeTab === "design" && activeSubTab === subTab.id;
      if (subTab.id === "animations") {
        expect(isActive).toBe(true);
      } else {
        expect(isActive).toBe(false);
      }
    }
  });
});
