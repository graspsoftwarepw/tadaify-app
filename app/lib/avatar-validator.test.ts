/**
 * Unit tests for avatar-validator — client-side file validation.
 *
 * U2 — Client-side file validator (issue tadaify-app#138)
 * Covers: TR-tadaify-003 (client-side validation rules)
 */

import { describe, it, expect } from "vitest";
import {
  validateAvatarFile,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_ERROR_MESSAGES,
  type AvatarFileMeta,
} from "./avatar-validator";

describe("validateAvatarFile — U2", () => {
  // ── U2-1: accepts JPG ≤ 2MB ─────────────────────────────────────────────────
  it("accepts JPG ≤ 2MB", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: 1_500_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
  });

  // ── U2-2: accepts PNG ≤ 2MB ──────────────────────────────────────────────────
  it("accepts PNG ≤ 2MB", () => {
    const file: AvatarFileMeta = { type: "image/png", size: 500_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
  });

  // ── U2-3: accepts WebP ≤ 2MB ─────────────────────────────────────────────────
  it("accepts WebP ≤ 2MB", () => {
    const file: AvatarFileMeta = { type: "image/webp", size: 800_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
  });

  // ── U2-4: rejects > 2MB ──────────────────────────────────────────────────────
  it("rejects > 2MB with reason too_large", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: 2_100_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("too_large");
    }
  });

  // ── U2-5: rejects unsupported type ───────────────────────────────────────────
  it("rejects application/pdf with reason wrong_type", () => {
    const file: AvatarFileMeta = { type: "application/pdf", size: 500_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("wrong_type");
    }
  });

  it("rejects image/gif with reason wrong_type", () => {
    const file: AvatarFileMeta = { type: "image/gif", size: 100_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("wrong_type");
    }
  });

  // ── U2-6: warns on non-square aspect ─────────────────────────────────────────
  it("warns on non-square aspect ratio but does not reject", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: 500_000, width: 1000, height: 500 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warning).toBe("non_square");
    }
  });

  it("does not warn on square aspect ratio", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: 500_000, width: 800, height: 800 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warning).toBeUndefined();
    }
  });

  // ── U2-7: no false negatives on edge sizes ───────────────────────────────────
  it("accepts exactly 2MB (AVATAR_MAX_SIZE_BYTES boundary — no false negative)", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: AVATAR_MAX_SIZE_BYTES };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(true);
  });

  it("rejects 2MB + 1 byte (one byte over limit)", () => {
    const file: AvatarFileMeta = { type: "image/jpeg", size: AVATAR_MAX_SIZE_BYTES + 1 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(false);
  });

  // ── Error message constants ───────────────────────────────────────────────────
  it("AVATAR_ERROR_MESSAGES has too_large message", () => {
    expect(AVATAR_ERROR_MESSAGES.too_large).toBeTruthy();
    expect(AVATAR_ERROR_MESSAGES.too_large).toContain("2 MB");
  });

  it("AVATAR_ERROR_MESSAGES has wrong_type message", () => {
    expect(AVATAR_ERROR_MESSAGES.wrong_type).toBeTruthy();
    expect(AVATAR_ERROR_MESSAGES.wrong_type).toContain("JPG");
  });

  // ── Size rejects before type check ───────────────────────────────────────────
  it("rejects on size first even if type is wrong (size-check has priority)", () => {
    // Both invalid — should return too_large (size checked first)
    const file: AvatarFileMeta = { type: "application/pdf", size: 5_000_000 };
    const result = validateAvatarFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("too_large");
    }
  });
});
