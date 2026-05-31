/**
 * validate-link-url — pure validation for a Link block's destination URL.
 *
 * Used by both the editor form (inline error) and the server (`/api/blocks`).
 * Security: rejects `javascript:` / `data:` and other non-http(s) schemes so a
 * stored block can never render an XSS or data-exfil anchor.
 *
 * Story: F-BLOCK-LINK-COMPLETE-001 (#289).
 */

import { normalizeUrl } from "~/lib/normalize-url";

/** Max stored URL length (matches the issue spec). */
export const MAX_URL_LENGTH = 2048;

/** Explicit blocklist — schemes that must never be accepted for a link. */
const DANGEROUS_SCHEME = /^\s*(javascript|data|vbscript|file|blob|about|mailto|tel):/i;

export type LinkUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Validate + normalize a link destination. Returns the canonical (https-prepended)
 * URL on success, or a human error string on failure.
 */
export function validateLinkUrl(raw: unknown): LinkUrlResult {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return { ok: false, error: "URL is required." };

  if (DANGEROUS_SCHEME.test(trimmed)) {
    return { ok: false, error: "Only http(s) links are allowed." };
  }

  const url = normalizeUrl(trimmed);
  if (url.length > MAX_URL_LENGTH) {
    return { ok: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters).` };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "Enter a valid URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http(s) links are allowed." };
  }
  // Require a dotted hostname so "https://foo" (no TLD) is rejected.
  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return { ok: false, error: "Enter a valid URL (include a domain)." };
  }

  return { ok: true, url };
}
