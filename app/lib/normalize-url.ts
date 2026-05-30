/**
 * normalize-url — Auto-prepend https:// to bare URLs.
 *
 * Used by the Link button block form (and any future block type that captures
 * an outbound URL). The creator can paste `spotify.com/artist/...` and we save
 * `https://spotify.com/artist/...` — matches the issue body's "auto-prepend
 * https:// if user enters bare domain" contract (ECN-BLOCK-LINK-01).
 *
 * Rules:
 *   - Empty string (or whitespace-only) → returned as the empty string.
 *   - Already absolute (`http://`, `https://`) → returned as-is, just trimmed.
 *   - Protocol-relative (`//foo.com`) → upgraded to `https://foo.com`.
 *   - Anything else → `https://` prefix added.
 *
 * Intentionally tolerant: we do NOT reject obviously bad input here. The
 * server-side `/api/blocks` action already trusts the URL string (it stores
 * it as `url`), and the Link block public renderer escapes it via React's
 * default attribute encoding. A future hardening pass (ECN-BLOCK-LINK-02:
 * reject `javascript:` / `data:` schemes) belongs in the API action, not in
 * this client-side helper — keeping that separation lets the form preview
 * any user input verbatim.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 * Unit tests: app/lib/normalize-url.test.ts
 */

/** Prefix we add to bare URLs. */
export const DEFAULT_URL_SCHEME = "https://" as const;

/**
 * Normalise a user-entered URL string.
 *
 * @param raw - The raw value typed by the creator.
 * @returns The normalised URL (possibly with `https://` prepended), or `""`
 *          if the input was empty / whitespace-only.
 */
export function normalizeUrl(raw: string): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (trimmed.length === 0) return "";

  // Already-absolute http(s) — keep as-is. We intentionally lower-case the
  // scheme so `HTTPS://foo.com` becomes `https://foo.com` (cosmetic, but
  // keeps the stored value canonical).
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    // Splice the scheme back in lower-cased, preserve the rest verbatim.
    const schemeEnd = trimmed.indexOf("://") + 3;
    const scheme = trimmed.slice(0, schemeEnd).toLowerCase();
    return scheme + trimmed.slice(schemeEnd);
  }

  // Protocol-relative — `//foo.com/x` → `https://foo.com/x`.
  if (trimmed.startsWith("//")) {
    return `${DEFAULT_URL_SCHEME}${trimmed.slice(2)}`;
  }

  return `${DEFAULT_URL_SCHEME}${trimmed}`;
}
