/**
 * Pure helper for /register?email=<...> prefill normalisation.
 *
 * The /login page's "no account found" CTA links to
 * /register?email=<urlencoded>. The register page's loader passes the raw
 * value to the component, which needs to:
 *   1. Reject malformed input (defensive against URL tampering / typos).
 *   2. Normalise valid input (trim + lowercase) to match SET_EMAIL contract.
 *
 * Story: issue tadaify-app#176.
 */

import { validateEmail } from "./auth-validator";

/** Returns the normalised email when valid, otherwise `null`. */
export function normalizePrefillEmail(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  const candidate = raw.trim().toLowerCase();
  const result = validateEmail(candidate);
  return result.valid ? candidate : null;
}
