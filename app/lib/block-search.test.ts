/**
 * Unit tests — block-search filter helpers (U3)
 *
 * Tests pure filterBlockTypes() + getPopularBlockTypes() functions.
 * Runs in Node environment (no JSDOM).
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: U3 (4 cases), TR (search/filter)
 */

import { describe, it, expect } from "vitest";
import { BLOCK_TYPES } from "./block-types";
import {
  filterBlockTypes,
  getPopularBlockTypes,
  CATEGORY_ALL,
} from "./block-search";

// ---------------------------------------------------------------------------
// U3-1: filterBlockTypes — substring match (name / description / tags)
// case-insensitive
// ---------------------------------------------------------------------------

describe("filterBlockTypes — U3-1: substring match on name / description / tags, case-insensitive", () => {
  it("matches by name (case-insensitive)", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "LINK", CATEGORY_ALL);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((bt) => bt.id === "link")).toBe(true);
  });

  it("matches by description keyword", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "shopify", CATEGORY_ALL);
    // 'product' block mentions Shopify in description
    expect(result.some((bt) => bt.id === "product")).toBe(true);
  });

  it("matches by tag keyword", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "urgency", CATEGORY_ALL);
    // 'countdown' block has 'urgency' in tags
    expect(result.some((bt) => bt.id === "countdown")).toBe(true);
  });

  it("returns no results for a nonsense query", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "zzzzzzz_no_match", CATEGORY_ALL);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// U3-2: filterBlockTypes — empty query returns all
// ---------------------------------------------------------------------------

describe("filterBlockTypes — U3-2: empty query returns full catalog", () => {
  it("empty string returns all entries", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "", CATEGORY_ALL);
    expect(result).toHaveLength(BLOCK_TYPES.length);
  });

  it("whitespace-only query returns all entries", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "   ", CATEGORY_ALL);
    expect(result).toHaveLength(BLOCK_TYPES.length);
  });
});

// ---------------------------------------------------------------------------
// U3-3: filterBlockTypes — category filter returns only matching
// ---------------------------------------------------------------------------

describe("filterBlockTypes — U3-3: category filter returns only matching category", () => {
  it("filters to 'social' category only", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "", "social");
    expect(result.every((bt) => bt.category === "social")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters to 'shop' category only", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "", "shop");
    expect(result.every((bt) => bt.category === "shop")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("CATEGORY_ALL returns all entries (no category filter)", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "", CATEGORY_ALL);
    expect(result).toHaveLength(BLOCK_TYPES.length);
  });
});

// ---------------------------------------------------------------------------
// U3-4: filterBlockTypes — combines query + category (AND)
// ---------------------------------------------------------------------------

describe("filterBlockTypes — U3-4: query + category are AND-combined", () => {
  it("query 'youtube' + category 'music-video' returns only music-video matches", () => {
    const result = filterBlockTypes(BLOCK_TYPES, "youtube", "music-video");
    // All returned entries must be music-video category AND match 'youtube'
    expect(result.every((bt) => bt.category === "music-video")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("query matching entry A + category of entry B returns empty", () => {
    // 'newsletter' is communication category; querying 'newsletter' + category 'shop'
    const result = filterBlockTypes(BLOCK_TYPES, "newsletter", "shop");
    expect(result).toHaveLength(0);
  });

  it("getPopularBlockTypes returns only popular entries", () => {
    const popular = getPopularBlockTypes(BLOCK_TYPES);
    expect(popular.every((bt) => bt.popular === true)).toBe(true);
    expect(popular.length).toBeGreaterThan(0);
  });
});
