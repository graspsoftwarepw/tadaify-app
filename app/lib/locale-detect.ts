/**
 * Locale detection from HTTP request headers.
 * Pure function — no side effects, fully testable.
 *
 * Strategy (in priority order):
 *  1. Cloudflare cf-ipcountry header (two-letter ISO 3166-1 country code)
 *  2. Accept-Language header (first language tag, e.g. "pl", "en-US")
 *  3. Default: "en"
 *
 * Returns a 2-letter locale string: "pl" | "en" | fallback "en".
 * Only "pl" is treated specially (suffix variant for handle suggestions).
 */

export type Locale = "pl" | "en";

/**
 * Detect locale from request headers.
 * @param headers - Web standard Headers object (or a compatible record)
 */
export function detectLocale(headers: Headers | Record<string, string>): Locale {
  const get = (key: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(key);
    }
    // Case-insensitive lookup for plain record
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === lower) return v;
    }
    return null;
  };

  // 1. Cloudflare country code
  const cfCountry = get("cf-ipcountry");
  if (cfCountry) {
    const country = cfCountry.toUpperCase();
    if (country === "PL") return "pl";
    // All other countries → "en" (we don't have other locale-specific variants yet)
    return "en";
  }

  // 2. Accept-Language header
  const acceptLang = get("accept-language");
  if (acceptLang) {
    // e.g. "pl,en-US;q=0.9,en;q=0.8" → first tag is "pl"
    const firstTag = acceptLang.split(",")[0].trim().toLowerCase();
    // Strip quality value if present: "en-US;q=0.9" → "en-US"
    const langOnly = firstTag.split(";")[0].trim();
    const primary = langOnly.split("-")[0]; // "en-US" → "en", "pl" → "pl"
    if (primary === "pl") return "pl";
    return "en";
  }

  return "en";
}

/**
 * Detect locale from a Cloudflare Workers Request.
 * Thin wrapper over detectLocale for use in loaders/actions.
 */
export function detectLocaleFromRequest(request: Request): Locale {
  return detectLocale(request.headers);
}
