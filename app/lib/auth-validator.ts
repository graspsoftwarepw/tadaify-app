/**
 * Auth validation — pure, side-effect-free.
 * Used by both API routes (server-side) and client-side UI checks.
 *
 * Covers:
 *  - email format validation (RFC 5322 simplified)
 *  - password rules: ≥8 chars, ≥1 letter, ≥1 digit, match validation
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-291 (B-modified flow), DEC-295 (inline post-OTP password toggle)
 */

// ─── Email ────────────────────────────────────────────────────────────────────

/**
 * Simplified RFC 5322 email regex.
 * Covers the overwhelming majority of valid addresses without the full
 * ABNF complexity. Rejects obvious non-emails quickly.
 */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export type EmailValidationResult =
  | { valid: true }
  | { valid: false; reason: "empty" | "invalid_format" };

/**
 * Validates an email address.
 * Input is trimmed but NOT lowercased here — callers should normalise before storage.
 */
export function validateEmail(raw: string): EmailValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, reason: "empty" };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, reason: "invalid_format" };
  return { valid: true };
}

export const EMAIL_ERROR_MESSAGES: Record<
  Exclude<EmailValidationResult, { valid: true }>["reason"],
  string
> = {
  empty: "Email address is required.",
  invalid_format: "Enter a valid email address.",
};

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * Password requirements (DEC-295):
 *  - minimum 8 characters
 *  - at least 1 letter
 *  - at least 1 digit
 */
export const PASSWORD_MIN_LENGTH = 8;
const LETTER_REGEX = /[a-zA-Z]/;
const DIGIT_REGEX = /[0-9]/;

export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; reason: "empty" | "too_short" | "no_letter" | "no_digit" };

export function validatePassword(raw: string): PasswordValidationResult {
  if (!raw) return { valid: false, reason: "empty" };
  if (raw.length < PASSWORD_MIN_LENGTH) return { valid: false, reason: "too_short" };
  if (!LETTER_REGEX.test(raw)) return { valid: false, reason: "no_letter" };
  if (!DIGIT_REGEX.test(raw)) return { valid: false, reason: "no_digit" };
  return { valid: true };
}

export const PASSWORD_ERROR_MESSAGES: Record<
  Exclude<PasswordValidationResult, { valid: true }>["reason"],
  string
> = {
  empty: "Password is required.",
  too_short: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  no_letter: "Password must contain at least one letter.",
  no_digit: "Password must contain at least one digit.",
};

// ─── Password match ───────────────────────────────────────────────────────────

export type PasswordMatchResult =
  | { valid: true }
  | { valid: false; reason: "mismatch" | "confirm_empty" };

export function validatePasswordMatch(
  password: string,
  confirm: string
): PasswordMatchResult {
  if (!confirm) return { valid: false, reason: "confirm_empty" };
  if (password !== confirm) return { valid: false, reason: "mismatch" };
  return { valid: true };
}

export const PASSWORD_MATCH_ERROR_MESSAGES: Record<
  Exclude<PasswordMatchResult, { valid: true }>["reason"],
  string
> = {
  confirm_empty: "Please confirm your password.",
  mismatch: "Passwords do not match.",
};

// ─── OTP ──────────────────────────────────────────────────────────────────────

/**
 * Validates a 6-digit numeric OTP token.
 */
export type OtpValidationResult =
  | { valid: true }
  | { valid: false; reason: "empty" | "wrong_length" | "non_numeric" };

export function validateOtp(raw: string): OtpValidationResult {
  if (!raw) return { valid: false, reason: "empty" };
  if (!/^\d+$/.test(raw)) return { valid: false, reason: "non_numeric" };
  if (raw.length !== 6) return { valid: false, reason: "wrong_length" };
  return { valid: true };
}

export const OTP_ERROR_MESSAGES: Record<
  Exclude<OtpValidationResult, { valid: true }>["reason"],
  string
> = {
  empty: "Enter the 6-digit code from your email.",
  wrong_length: "Code must be exactly 6 digits.",
  non_numeric: "Code must contain digits only.",
};
