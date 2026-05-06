/**
 * avatar-validator — client-side file validation for avatar uploads.
 *
 * Runs BEFORE the POST request for fast user feedback.
 * Server-side Worker route is the AUTHORITATIVE gate (magic-byte check + size).
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: client-side file validation (fast feedback only)
 *
 * Unit tests: app/lib/avatar-validator.test.ts (U2)
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum allowed file size in bytes (2 MB). */
export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 097 152

/** Allowed MIME types (client-side hint only; server validates via magic bytes). */
export const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type AvatarValidationReason = "too_large" | "wrong_type";

export type AvatarValidationResult =
  | { ok: true; warning?: "non_square" }
  | { ok: false; reason: AvatarValidationReason };

export interface AvatarFileMeta {
  type: string;
  size: number;
  /** Optional — provided when the caller has read image dimensions. */
  width?: number;
  height?: number;
}

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validates an avatar file based on MIME type and size.
 *
 * @param file - File metadata (type, size, optional width/height)
 * @returns AvatarValidationResult
 *
 * Rules (in order of precedence):
 * 1. Reject if size > AVATAR_MAX_SIZE_BYTES → { ok: false, reason: "too_large" }
 * 2. Reject if MIME type not in AVATAR_ALLOWED_TYPES → { ok: false, reason: "wrong_type" }
 * 3. Warn (ok: true) if image is non-square (for UX hint only — not a rejection)
 */
export function validateAvatarFile(file: AvatarFileMeta): AvatarValidationResult {
  // Rule 1: size check (client-side gate for fast feedback)
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  // Rule 2: MIME type check (hint only — server checks magic bytes)
  if (!(AVATAR_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, reason: "wrong_type" };
  }

  // Rule 3: non-square warning (soft — does not reject)
  if (file.width !== undefined && file.height !== undefined) {
    if (file.width !== file.height) {
      return { ok: true, warning: "non_square" };
    }
  }

  return { ok: true };
}

// ── Error messages ─────────────────────────────────────────────────────────────

export const AVATAR_ERROR_MESSAGES: Record<AvatarValidationReason, string> = {
  too_large: "File too large (max 2 MB)",
  wrong_type: "Only JPG / PNG / WebP allowed",
};
