/**
 * block-search — Pure filter helpers for the block-type picker.
 *
 * These functions are intentionally free of React + browser globals so they
 * run in Node/vitest without a DOM environment.
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: BR-BLOCK-PICKER-002, BR-BLOCK-PICKER-003, TR (search)
 * Unit tests: app/lib/block-search.test.ts (U3)
 */

import type { BlockTypeMeta, BlockCategory } from "./block-types";

// ---------------------------------------------------------------------------
// Category filter sentinel
// ---------------------------------------------------------------------------

/** The "All" sentinel — when selectedCategory equals this, no category filter applied. */
export const CATEGORY_ALL = "all" as const;
export type CategoryFilterValue = BlockCategory | typeof CATEGORY_ALL;

// ---------------------------------------------------------------------------
// Core filter function
// ---------------------------------------------------------------------------

/**
 * Filter a catalog of block types by a free-text query and/or category.
 *
 * - `query`: substring match on `name + description + tags + category` (case-insensitive).
 *   Empty string = no text filter.
 * - `selectedCategory`: when `CATEGORY_ALL`, category filter is skipped.
 *   Otherwise only entries with `category === selectedCategory` pass.
 * - Filters are AND-combined: both must pass when both are non-trivial.
 *
 * Returns a new array; the original catalog is never mutated.
 */
export function filterBlockTypes(
  catalog: BlockTypeMeta[],
  query: string,
  selectedCategory: CategoryFilterValue,
): BlockTypeMeta[] {
  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;
  const hasCategoryFilter = selectedCategory !== CATEGORY_ALL;

  return catalog.filter((bt) => {
    // Category filter
    if (hasCategoryFilter && bt.category !== selectedCategory) return false;

    // Text filter
    if (hasQuery) {
      const haystack =
        `${bt.name} ${bt.description} ${bt.tags ?? ""} ${bt.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// "Popular" helper
// ---------------------------------------------------------------------------

/**
 * Returns only the entries marked as popular.
 * Used when the "Popular" pseudo-category tab is selected.
 */
export function getPopularBlockTypes(catalog: BlockTypeMeta[]): BlockTypeMeta[] {
  return catalog.filter((bt) => bt.popular === true);
}
