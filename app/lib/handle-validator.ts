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
 * Generate locale-aware alternative handle suggestions.
 *
 * Strategy:
 *  - PL locale  → prefer `<handle>_pl` suffix variant
 *  - EN/default → prefer `the_<handle>` prefix variant
 *  - Always include `its_<handle>` as a third fallback
 *
 * Returns up to 3 alternatives. Each is validated before being included;
 * if a variant is too long (>30 chars) it is dropped.
 */
export function generateAlternatives(
  handle: string,
  locale: "pl" | "en" | string
): string[] {
  const alts: string[] = [];

  if (locale === "pl") {
    // PL-first: append _pl suffix
    const plVariant = `${handle}_pl`;
    if (plVariant.length <= 30) alts.push(plVariant);

    const theVariant = `the_${handle}`;
    if (theVariant.length <= 30) alts.push(theVariant);
  } else {
    // EN / default: prepend the_
    const theVariant = `the_${handle}`;
    if (theVariant.length <= 30) alts.push(theVariant);

    const plVariant = `${handle}_pl`;
    if (plVariant.length <= 30) alts.push(plVariant);
  }

  // Third option: its_ prefix
  const itsVariant = `its_${handle}`;
  if (itsVariant.length <= 30 && !alts.includes(itsVariant)) {
    alts.push(itsVariant);
  }

  // Each alt must itself be valid (don't suggest blocked words)
  return alts
    .filter((a) => validateHandle(a).valid)
    .slice(0, 3);
}
