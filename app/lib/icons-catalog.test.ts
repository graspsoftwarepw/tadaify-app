/**
 * Unit tests — icon catalog + icon search (U1)
 *
 * Tests ICON_CATALOG registry shape + integrity.
 * Runs in Node environment (no JSDOM).
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: U1 (6 cases), TR-tadaify-014 (registry)
 */

import { describe, it, expect } from "vitest";
import {
  ICON_CATALOG,
  ICON_CATALOG_COUNT,
  ICON_CATEGORIES,
  type IconEntry,
  type IconSource,
} from "./icons-catalog";
import { filterIcons, ICON_CATEGORY_ALL } from "./icon-search";

// ---------------------------------------------------------------------------
// U1-1: catalog has ≥100 entries
// ---------------------------------------------------------------------------

describe("ICON_CATALOG — U1-1: catalog size ≥ 100", () => {
  it("exports at least 100 icon entries", () => {
    expect(ICON_CATALOG.length).toBeGreaterThanOrEqual(100);
  });

  it("ICON_CATALOG_COUNT matches actual array length", () => {
    expect(ICON_CATALOG_COUNT).toBe(ICON_CATALOG.length);
  });
});

// ---------------------------------------------------------------------------
// U1-2: every entry has required fields
// ---------------------------------------------------------------------------

describe("ICON_CATALOG — U1-2: every entry has required fields", () => {
  for (const entry of ICON_CATALOG) {
    it(`entry '${entry.id}' has id, source, name, category, tags`, () => {
      // id
      expect(typeof entry.id).toBe("string");
      expect(entry.id.trim().length).toBeGreaterThan(0);
      // source
      expect(["lucide", "simple-icons"] as IconSource[]).toContain(entry.source);
      // name
      expect(typeof entry.name).toBe("string");
      expect(entry.name.trim().length).toBeGreaterThan(0);
      // category
      expect(ICON_CATEGORIES as readonly string[]).toContain(entry.category);
      // tags — ≥2 tags per entry (AC item 3 spec quality)
      expect(Array.isArray(entry.tags)).toBe(true);
      expect(entry.tags.length).toBeGreaterThanOrEqual(2);
    });
  }
});

// ---------------------------------------------------------------------------
// U1-3: no duplicate IDs
// ---------------------------------------------------------------------------

describe("ICON_CATALOG — U1-3: no duplicate IDs", () => {
  it("all entry IDs are unique", () => {
    const ids = ICON_CATALOG.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// U1-4: ID format matches source
// ---------------------------------------------------------------------------

describe("ICON_CATALOG — U1-4: ID format matches declared source", () => {
  for (const entry of ICON_CATALOG) {
    it(`entry '${entry.id}' ID prefix matches source`, () => {
      if (entry.source === "lucide") {
        expect(entry.id.startsWith("lucide:")).toBe(true);
      } else if (entry.source === "simple-icons") {
        expect(entry.id.startsWith("simple-icons:")).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// U1-5: valid categories across all 7
// ---------------------------------------------------------------------------

describe("ICON_CATALOG — U1-5: all 7 categories have at least 5 entries", () => {
  for (const cat of ICON_CATEGORIES) {
    it(`category '${cat}' has at least 5 entries`, () => {
      const count = ICON_CATALOG.filter((e) => e.category === cat).length;
      expect(count).toBeGreaterThanOrEqual(5);
    });
  }
});

// ---------------------------------------------------------------------------
// U1-6: filterIcons behaves correctly
// ---------------------------------------------------------------------------

describe("filterIcons — U1-6: search + category filter logic", () => {
  it("empty query + ALL returns full catalog", () => {
    const result = filterIcons(ICON_CATALOG, "", ICON_CATEGORY_ALL);
    expect(result.length).toBe(ICON_CATALOG.length);
  });

  it("'spotify' query returns Spotify entry", () => {
    const result = filterIcons(ICON_CATALOG, "spotify", ICON_CATEGORY_ALL);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((e) => e.id === "simple-icons:spotify")).toBe(true);
  });

  it("category 'social' with empty query returns only social entries", () => {
    const result = filterIcons(ICON_CATALOG, "", "social");
    expect(result.every((e) => e.category === "social")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("query that matches nothing in category returns empty array", () => {
    const result = filterIcons(ICON_CATALOG, "zzznonexistent", ICON_CATEGORY_ALL);
    expect(result).toHaveLength(0);
  });

  it("special char '+' in query does not throw (ECN-ICON-PICKER-02)", () => {
    expect(() => filterIcons(ICON_CATALOG, "a+b", ICON_CATEGORY_ALL)).not.toThrow();
  });

  it("special char '-' in query does not throw (ECN-ICON-PICKER-02)", () => {
    expect(() => filterIcons(ICON_CATALOG, "buy-me", ICON_CATEGORY_ALL)).not.toThrow();
  });

  it("filter is AND-combined: category + query must both match", () => {
    // 'spotify' is in music-video — it should appear when filtering by music-video
    const resultMatch = filterIcons(ICON_CATALOG, "spotify", "music-video");
    expect(resultMatch.some((e) => e.id === "simple-icons:spotify")).toBe(true);

    // 'spotify' should NOT appear when filtering by 'shop'
    const resultMiss = filterIcons(ICON_CATALOG, "spotify", "shop");
    expect(resultMiss.some((e) => e.id === "simple-icons:spotify")).toBe(false);
  });

  it("case-insensitive search for 'SPOTIFY' matches spotify", () => {
    const result = filterIcons(ICON_CATALOG, "SPOTIFY", ICON_CATEGORY_ALL);
    expect(result.some((e) => e.id === "simple-icons:spotify")).toBe(true);
  });

  it("does not mutate the original catalog array", () => {
    const originalLength = ICON_CATALOG.length;
    filterIcons(ICON_CATALOG, "link", "popular");
    expect(ICON_CATALOG.length).toBe(originalLength);
  });
});
