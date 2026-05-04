/**
 * Unit tests — tier-gate.ts (U4)
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: U4, checkSaveAllowed, isCreatorPlus
 */

import { describe, it, expect } from "vitest";
import { isCreatorPlus, checkSaveAllowed } from "./tier-gate";

describe("isCreatorPlus", () => {
  it("isCreatorPlus(tier='free') returns false", () => {
    expect(isCreatorPlus("free")).toBe(false);
  });

  it("isCreatorPlus(tier='creator') returns true", () => {
    expect(isCreatorPlus("creator")).toBe(true);
  });

  it("isCreatorPlus(tier='pro') returns true", () => {
    expect(isCreatorPlus("pro")).toBe(true);
  });

  it("isCreatorPlus(tier='business') returns true", () => {
    expect(isCreatorPlus("business")).toBe(true);
  });
});

describe("checkSaveAllowed", () => {
  it("checkSaveAllowed(action='set-bg-image', currentTier='free') returns gate-required", () => {
    const result = checkSaveAllowed("set-bg-image", "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("creator-tier-required");
  });

  it("checkSaveAllowed(action='set-bg-image', currentTier='creator') returns allowed", () => {
    const result = checkSaveAllowed("set-bg-image", "creator");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("checkSaveAllowed(action='set-bg-fill', currentTier='free') returns allowed — Fill/Gradient/Blur/Pattern are Free per DEC-043", () => {
    const result = checkSaveAllowed("set-bg-fill", "free");
    expect(result.allowed).toBe(true);
  });

  it("checkSaveAllowed(action='set-color-primary', currentTier='free') returns allowed — color is Free per DEC-043", () => {
    const result = checkSaveAllowed("set-color-primary", "free");
    expect(result.allowed).toBe(true);
  });

  it("checkSaveAllowed(action='set-bg-video', currentTier='free') returns gate-required", () => {
    const result = checkSaveAllowed("set-bg-video", "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("creator-tier-required");
  });

  it("checkSaveAllowed(action='set-bg-video', currentTier='creator') returns allowed", () => {
    const result = checkSaveAllowed("set-bg-video", "creator");
    expect(result.allowed).toBe(true);
  });

  it("checkSaveAllowed(action='set-bg-video', currentTier='pro') returns allowed", () => {
    const result = checkSaveAllowed("set-bg-video", "pro");
    expect(result.allowed).toBe(true);
  });
});
