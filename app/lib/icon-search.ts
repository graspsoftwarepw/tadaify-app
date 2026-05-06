/**
 * icon-search — Pure filter helpers for the icon picker.
 *
 * Intentionally free of React + browser globals so tests run in Node/vitest
 * without a DOM environment. Mirrors the block-search.ts pattern.
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: BR-ICON-PICKER-002, BR-ICON-PICKER-003, TR (search)
 * Unit tests: app/lib/icons-catalog.test.ts (U1)
 */

import type { IconEntry, IconCategory } from "./icons-catalog";

// ---------------------------------------------------------------------------
// Category filter sentinel
// ---------------------------------------------------------------------------

/** The "All" sentinel — when selectedCategory equals this, no category filter applied. */
export const ICON_CATEGORY_ALL = "all" as const;
export type IconCategoryFilterValue = IconCategory | typeof ICON_CATEGORY_ALL;

// ---------------------------------------------------------------------------
// Core filter function
// ---------------------------------------------------------------------------

/**
 * Filter the icon catalog by a free-text query and/or category.
 *
 * - `query`: substring match on `name + tags` (case-insensitive, escaped for regex safety).
 *   Empty string = no text filter.
 * - `category`: when `ICON_CATEGORY_ALL`, category filter is skipped.
 *   Otherwise only entries with `category === category` pass.
 * - Filters are AND-combined: both must pass when both are non-trivial.
 *
 * Special chars in `query` are escaped before matching (ECN-ICON-PICKER-02).
 * Returns a new array; the original catalog is never mutated.
 *
 * @param catalog - The full ICON_CATALOG array (or any subset)
 * @param query - Free-text search string (may contain special chars)
 * @param category - Category filter value or ICON_CATEGORY_ALL
 * @returns Filtered array of IconEntry objects
 */
export function filterIcons(
  catalog: IconEntry[],
  query: string,
  category: IconCategoryFilterValue = ICON_CATEGORY_ALL,
): IconEntry[] {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const hasCategoryFilter = category !== ICON_CATEGORY_ALL;

  // Escape special regex characters so "+", "-", "(", ")" etc don't throw
  // (ECN-ICON-PICKER-02: special chars in query)
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const queryLower = escapedQuery.toLowerCase();

  return catalog.filter((entry) => {
    // Category filter
    if (hasCategoryFilter && entry.category !== category) return false;

    // Text filter
    if (hasQuery) {
      const nameLower = entry.name.toLowerCase();
      const tagsLower = entry.tags.join(" ").toLowerCase();
      const haystack = `${nameLower} ${tagsLower}`;
      if (!haystack.includes(queryLower)) return false;
    }

    return true;
  });
}
