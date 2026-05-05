/**
 * Handle validation — pure, side-effect-free.
 * Used by both the API route (server-side) and client-side UI checks.
 *
 * Rules:
 *  - 3–30 characters
 *  - Must match: ^[a-z0-9](?:[a-z0-9_]{1,29})?$
 *    (starts with letter or digit; rest may include underscore; no leading dash)
 *  - Not in the BLOCKED_WORDS list
 *  - All input is lowercased before validation
 *
 * Note: The dispatch described hyphens in some places but the migration CHECK
 * constraint uses underscores (see 20260429000001_handle_reservations.sql).
 * The regex here matches the migration — underscores allowed, hyphens NOT,
 * so that handle is safe as a URL path segment (tadaify.com/<handle>).
 */

export const HANDLE_REGEX = /^[a-z0-9](?:[a-z0-9_]{1,29})?$/;

/**
 * Words permanently blocked from being used as handles.
 * Kept in sorted order for readability.
 */
export const BLOCKED_WORDS: ReadonlySet<string> = new Set([
  "about",
  "admin",
  "api",
  "app",
  "assets",
  "blog",
  "contact",
  "dev",
  "docs",
  "help",
  "login",
  "mail",
  "pricing",
  "privacy",
  "prod",
  "register",
  "staging",
  "status",
  "support",
  "tadaify",
  "terms",
  "trust",
  "www",
]);

export type HandleValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason:
        | "too_short"
        | "too_long"
        | "invalid_chars"
        | "blocked_word"
        | "empty";
    };

/**
 * Validates a handle string.
 * Input should already be lowercased — this function does NOT coerce case.
 */
export function validateHandle(handle: string): HandleValidationResult {
  if (!handle || handle.length === 0) {
    return { valid: false, reason: "empty" };
  }

  if (handle.length < 3) {
    return { valid: false, reason: "too_short" };
  }

  if (handle.length > 30) {
    return { valid: false, reason: "too_long" };
  }

  if (!HANDLE_REGEX.test(handle)) {
    return { valid: false, reason: "invalid_chars" };
  }

  if (BLOCKED_WORDS.has(handle)) {
    return { valid: false, reason: "blocked_word" };
  }

  return { valid: true };
}

/**
 * Human-readable error messages for each validation failure reason.
 */
export const HANDLE_ERROR_MESSAGES: Record<
  Exclude<HandleValidationResult, { valid: true }>["reason"],
  string
> = {
  empty: "Enter a handle to check availability.",
  too_short: "Too short — at least 3 characters.",
  too_long: "Too long — 30 characters max.",
  invalid_chars:
    "Only lowercase letters, numbers, and underscores. Must start with a letter or number.",
  blocked_word: "That handle is reserved — try another.",
};

/**
 * Generate universal alternative handle suggestions.
 *
 * DEC-357=D: locale parameter dropped — same output regardless of country.
 * Rationale: removes need for locale/country detection (privacy-minimal;
 * no IP-derived data collection). No `_pl` suffix bias.
 *
 * Universal strategy:
 *  1. `the_<handle>` prefix
 *  2. `<handle>2` numeric suffix
 *  3. `its_<handle>` prefix
 *
 * Returns up to 3 alternatives. Each is validated before being included;
 * if a variant is too long (>30 chars) it is dropped.
 *
 * The `locale` parameter is accepted but ignored for backwards compatibility
 * with existing call sites (api.handle.check.ts). Removing it entirely would
 * be a no-op since locale detection is also removed there (DEC-357=D).
 */
export function generateAlternatives(
  handle: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locale?: string
): string[] {
  const alts: string[] = [];

  // 1. the_ prefix
  const theVariant = `the_${handle}`;
  if (theVariant.length <= 30) alts.push(theVariant);

  // 2. numeric 2 suffix
  const numVariant = `${handle}2`;
  if (numVariant.length <= 30) alts.push(numVariant);

  // 3. its_ prefix
  const itsVariant = `its_${handle}`;
  if (itsVariant.length <= 30 && !alts.includes(itsVariant)) {
    alts.push(itsVariant);
  }

  // Each alt must itself be valid (don't suggest blocked words)
  return alts
    .filter((a) => validateHandle(a).valid)
    .slice(0, 3);
}
