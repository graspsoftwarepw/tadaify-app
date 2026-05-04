/**
 * Unit tests — DesignPanel (U3)
 *
 * Tests normalizeSubTab + active panel selection logic.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: U3, ECN-26b-12, DEFAULT_DESIGN_SUBTAB contract
 */

import { describe, it, expect, vi } from "vitest";
import { normalizeSubTab, DEFAULT_DESIGN_SUBTAB } from "./DesignPanel";

describe("normalizeSubTab", () => {
  it("renders DesignBackground component when ?subtab=background (DEFAULT)", () => {
    expect(normalizeSubTab("background")).toBe("background");
  });

  it("renders DesignAnimations when ?subtab=animations", () => {
    expect(normalizeSubTab("animations")).toBe("animations");
  });

  it("defaults to background when ?subtab missing (null)", () => {
    expect(normalizeSubTab(null)).toBe(DEFAULT_DESIGN_SUBTAB);
    expect(DEFAULT_DESIGN_SUBTAB).toBe("background");
  });

  it("defaults to background when ?subtab missing (undefined)", () => {
    expect(normalizeSubTab(undefined)).toBe(DEFAULT_DESIGN_SUBTAB);
  });

  it("defaults to background when ?subtab empty string", () => {
    expect(normalizeSubTab("")).toBe(DEFAULT_DESIGN_SUBTAB);
  });

  it("invalid ?subtab=foobar falls back to background", () => {
    const result = normalizeSubTab("foobar");
    expect(result).toBe("background");
  });

  it("all valid sub-tab ids are accepted", () => {
    const validIds = ["theme", "profile", "background", "text", "buttons", "animations", "colors", "footer"];
    for (const id of validIds) {
      expect(normalizeSubTab(id)).toBe(id);
    }
  });

  it("DEFAULT_DESIGN_SUBTAB is background per issue #173 spec", () => {
    expect(DEFAULT_DESIGN_SUBTAB).toBe("background");
  });
});

describe("DEFAULT_DESIGN_SUBTAB", () => {
  it("is 'background' — not 'theme' (corrected per Codex review of #173)", () => {
    // This is the canonical lock. If this fails, the default sub-tab
    // has been changed. The default MUST be 'background' per:
    //   - mockup line 3077: <div class="design-panel active" data-panel="background">
    //   - issue #173 spec: "Default sub-tab MUST be background (not theme)"
    expect(DEFAULT_DESIGN_SUBTAB).toBe("background");
  });
});
