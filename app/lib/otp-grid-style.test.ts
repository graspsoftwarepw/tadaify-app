/**
 * Unit tests for OTP_GRID_TEMPLATE constant — regression lock for tadaify-app#178.
 *
 * Bug: bare `1fr` resolves to `minmax(auto, 1fr)` which lets <input> min-content
 * (~325px) expand each track → 6 × 326 = 1953px overflow on a 460px form column.
 * Fix: `minmax(0, 1fr)` forces min track size to 0, allowing shrinkage.
 *
 * These tests regression-lock the constant so a future refactor cannot
 * accidentally revert to bare `1fr`.
 *
 * Covers: tadaify-app#178 (U1.1, U1.2)
 */

import { describe, it, expect } from "vitest";
import { OTP_GRID_TEMPLATE } from "./otp-grid-style";

describe("OTP_GRID_TEMPLATE — regression lock (tadaify-app#178)", () => {
  it("U1.1 — OTP grid template uses minmax(0, 1fr), NOT bare 1fr", () => {
    // Regression lock: the constant MUST be this exact string.
    // Bare `1fr` is WRONG — it resolves to `minmax(auto, 1fr)` which expands
    // <input> columns to ~325px each, overflowing the 460px form column.
    expect(OTP_GRID_TEMPLATE).toBe("repeat(6, minmax(0, 1fr))");
  });

  it("U1.2 — OTP grid template has exactly 6 tracks", () => {
    // Defensive: changing the repeat count would break the 6-digit OTP layout.
    // Parse the repeat(<count>, ...) first argument from the CSS function.
    // e.g. "repeat(6, minmax(0, 1fr))" → "6" → 6
    const match = OTP_GRID_TEMPLATE.match(/^repeat\((\d+),/);
    expect(match).not.toBeNull();
    const trackCount = parseInt(match![1], 10);
    expect(trackCount).toBe(6);
  });
});
