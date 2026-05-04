/**
 * Canonical CSS Grid template for the 6-digit OTP input grid.
 *
 * Bug regression-lock: must be `minmax(0, 1fr)`, NOT bare `1fr`.
 * Bare `1fr` resolves to `minmax(auto, 1fr)` which respects intrinsic
 * min-content on <input> (~325px), causing each column to expand far beyond
 * the form column width and pushing inputs 4-6 off-viewport.
 *
 * See issue tadaify-app#178.
 */
export const OTP_GRID_TEMPLATE = "repeat(6, minmax(0, 1fr))";
