/**
 * visitor-hash — cookieless, daily-rotating visitor identifier (DEC-075).
 *
 * Privacy-first unique-visitor counting with NO cookie and NO persistent
 * fingerprint. We derive a per-day salt from a server secret + the UTC date,
 * then hash (salt | ip | user-agent | handle) into a short token. Two visits
 * on the SAME day from the same person+page collapse to the same token; the
 * NEXT day's salt is different, so the token cannot be correlated across days
 * (the salt "forgets itself daily" — matching the user-facing copy).
 *
 * The token is stored only as a WAE blob and used for COUNT(DISTINCT) at
 * rollup time. The raw IP is never stored.
 *
 * Story: F-INSIGHTS-CAPTURE-001 (DEC-075).
 */

/** SHA-256 hex digest via Web Crypto (available in Workers + the test env). */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/** UTC date key (YYYY-MM-DD) for the given epoch millis. */
export function utcDateKey(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

/**
 * Per-day salt: deterministic within a UTC day, unrecoverable across days
 * (depends on a server secret the client never sees + the date).
 */
export async function dailySalt(secret: string, dateKey: string): Promise<string> {
  return sha256Hex(`salt:${secret}:${dateKey}`);
}

export interface VisitorHashInput {
  /** Server secret (env DAILY_SALT_SECRET). */
  secret: string;
  /** UTC date key (YYYY-MM-DD). */
  dateKey: string;
  /** Visitor IP (request.cf / CF-Connecting-IP). Never stored. */
  ip: string;
  /** Visitor user-agent. */
  userAgent: string;
  /** Creator handle (the analytics partition key). */
  handle: string;
}

/**
 * Compute the daily visitor token. Truncated to 16 hex chars (64 bits): enough
 * to keep daily collisions negligible at creator scale while shedding bits that
 * would make the value more reversible.
 */
export async function visitorDayHash(input: VisitorHashInput): Promise<string> {
  const salt = await dailySalt(input.secret, input.dateKey);
  const full = await sha256Hex(
    `${salt}|${input.ip}|${input.userAgent}|${input.handle}`,
  );
  return full.slice(0, 16);
}
