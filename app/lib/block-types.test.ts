/**
 * Unit tests — block-types registry (U2)
 *
 * Tests BLOCK_TYPES catalog integrity and helper functions.
 * Runs in Node environment (no JSDOM).
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: U2 (5 cases), TR (registry shape)
 */

import { describe, it, expect } from "vitest";
import {
  BLOCK_TYPES,
  BLOCK_CATEGORIES,
  TIER_LEVELS,
  TIER_RANK,
  isBlockTypeLocked,
  getBlockType,
} from "./block-types";

// ---------------------------------------------------------------------------
// U2-1: BLOCK_TYPES registry has 12 entries
// ---------------------------------------------------------------------------

describe("BLOCK_TYPES — U2-1: registry has 12 entries", () => {
  it("exports exactly 12 block type entries", () => {
    expect(BLOCK_TYPES).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// U2-2: every entry has required fields
// ---------------------------------------------------------------------------

describe("BLOCK_TYPES — U2-2: every entry has id + name + description + icon + category + defaultMeta", () => {
  for (const bt of BLOCK_TYPES) {
    it(`entry '${bt.id}' has all required fields`, () => {
      expect(typeof bt.id).toBe("string");
      expect(bt.id.trim().length).toBeGreaterThan(0);

      expect(typeof bt.name).toBe("string");
      expect(bt.name.trim().length).toBeGreaterThan(0);

      expect(typeof bt.description).toBe("string");
      expect(bt.description.trim().length).toBeGreaterThan(0);

      expect(typeof bt.icon).toBe("string");
      expect(bt.icon.trim().length).toBeGreaterThan(0);

      expect(typeof bt.category).toBe("string");
      expect(BLOCK_CATEGORIES as readonly string[]).toContain(bt.category);

      expect(bt.defaultMeta).toBeDefined();
      expect(typeof bt.defaultMeta).toBe("object");
    });
  }
});

// ---------------------------------------------------------------------------
// U2-3: no duplicate ids
// ---------------------------------------------------------------------------

describe("BLOCK_TYPES — U2-3: no duplicate ids", () => {
  it("all ids are unique", () => {
    const ids = BLOCK_TYPES.map((bt) => bt.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// U2-4: category values constrained to known set
// ---------------------------------------------------------------------------

describe("BLOCK_TYPES — U2-4: category values are constrained to known set", () => {
  it("every entry's category is in BLOCK_CATEGORIES", () => {
    const validCategories = new Set<string>(BLOCK_CATEGORIES);
    for (const bt of BLOCK_TYPES) {
      expect(validCategories.has(bt.category)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// U2-5 (bonus): isBlockTypeLocked helper
// ---------------------------------------------------------------------------

describe("isBlockTypeLocked — U2-5: tier-gating logic", () => {
  const customHtml = BLOCK_TYPES.find((bt) => bt.id === "custom-html");
  const link = BLOCK_TYPES.find((bt) => bt.id === "link");
  const countdown = BLOCK_TYPES.find((bt) => bt.id === "countdown");

  it("custom-html (Pro+) is locked for free tier", () => {
    expect(customHtml).toBeDefined();
    expect(isBlockTypeLocked(customHtml!, "free")).toBe(true);
  });

  it("custom-html (Pro+) is locked for creator tier", () => {
    expect(isBlockTypeLocked(customHtml!, "creator")).toBe(true);
  });

  it("custom-html (Pro+) is NOT locked for pro tier", () => {
    expect(isBlockTypeLocked(customHtml!, "pro")).toBe(false);
  });

  it("custom-html (Pro+) is NOT locked for business tier", () => {
    expect(isBlockTypeLocked(customHtml!, "business")).toBe(false);
  });

  it("link (no tier requirement) is NOT locked for free tier", () => {
    expect(link).toBeDefined();
    expect(isBlockTypeLocked(link!, "free")).toBe(false);
  });

  it("TIER_RANK reflects ascending privilege order", () => {
    expect(TIER_RANK.free).toBeLessThan(TIER_RANK.creator);
    expect(TIER_RANK.creator).toBeLessThan(TIER_RANK.pro);
    expect(TIER_RANK.pro).toBeLessThan(TIER_RANK.business);
  });

  it("getBlockType returns entry by id", () => {
    expect(getBlockType("link")?.id).toBe("link");
    expect(getBlockType("nonexistent")).toBeUndefined();
  });

  it("countdown entry ships with the expected default meta contract", () => {
    expect(countdown).toBeDefined();
    expect(countdown?.defaultMeta).toMatchObject({
      label: "Next live in",
      icon: "flame",
      targetAt: "",
      style: "boxed",
      linkLabel: "",
      linkUrl: "",
      autoHide: true,
      replacementCopy: "",
    });
  });

  it("TIER_LEVELS covers all 4 tiers", () => {
    expect(TIER_LEVELS).toHaveLength(4);
    expect(TIER_LEVELS).toContain("free");
    expect(TIER_LEVELS).toContain("pro");
  });
});
