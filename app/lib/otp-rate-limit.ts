/**
 * OTP resend rate-limit utility
 *
 * Provides backend rate-limit checking and audit-trail recording for the
 * email-OTP resend flow on /register and /login.
 *
 * Policy (BR-OTP-RATE-LIMIT-001):
 *   - 3 successful sends per email-handle pair per rolling 24-hour window
 *   - Counted against 'sent' rows only ('rate_limited' rows do not count)
 *   - Returns retry_after_seconds when denied
 *
 * Privacy:
 *   - Raw email is never stored; only sha256(lower(trim(email))) hex string
 *   - Table is service_role only (RLS)
 *
 * Runtime: Cloudflare Workers (Web Crypto API for hashing — no Node crypto)
 *
 * Story: F-REGISTER-001a / issue tadaify-app#179
 * BR: BR-OTP-RATE-LIMIT-001
 */

export type OtpAttemptOutcome = "sent" | "rate_limited";

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest 'sent' row in the window falls out. Only set when allowed=false. */
  retry_after_seconds?: number;
}

/**
 * Hash an email address using sha256(lower(trim(email))).
 * Uses the Web Crypto API (available in all Workers + modern browsers).
 * Returns a lowercase hex string.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalised = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalised);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check whether a new OTP send is allowed for the given email hash.
 *
 * Queries the `otp_rate_limit_attempts` table via the Supabase REST API
 * (service_role key) and counts 'sent' rows within the sliding window.
 *
 * @param supabaseUrl        - SUPABASE_URL from Workers env
 * @param serviceRoleKey     - SUPABASE_SERVICE_ROLE_KEY from Workers env
 * @param emailHash          - sha256(lower(trim(email))) — from hashEmail()
 * @param windowSeconds      - Rolling window size in seconds (default: 86400 = 24h)
 * @param maxAttempts        - Max allowed 'sent' rows in window (default: 3)
 */
export async function checkOtpRateLimit(
  supabaseUrl: string,
  serviceRoleKey: string,
  emailHash: string,
  windowSeconds: number = 24 * 3600,
  maxAttempts: number = 3
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  // Query only 'sent' rows — 'rate_limited' rows do not count toward the cap.
  const url = new URL(`${supabaseUrl}/rest/v1/otp_rate_limit_attempts`);
  url.searchParams.set("select", "attempted_at");
  url.searchParams.set("email_hash", `eq.${emailHash}`);
  url.searchParams.set("outcome", "eq.sent");
  url.searchParams.set("attempted_at", `gte.${windowStart}`);
  url.searchParams.set("order", "attempted_at.asc");
  url.searchParams.set("limit", String(maxAttempts));

  let rows: Array<{ attempted_at: string }>;
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // On Supabase error, fail open (allow the send) to avoid blocking legitimate users.
      console.error("[otp-rate-limit] checkOtpRateLimit query failed:", res.status, await res.text().catch(() => ""));
      return { allowed: true };
    }

    rows = (await res.json()) as Array<{ attempted_at: string }>;
  } catch (err) {
    // Network error — fail open.
    console.error("[otp-rate-limit] checkOtpRateLimit fetch error:", err);
    return { allowed: true };
  }

  if (rows.length < maxAttempts) {
    return { allowed: true };
  }

  // Denied: compute retry_after_seconds from the oldest 'sent' row in window.
  // When that row's timestamp + windowSeconds passes, one slot opens up.
  const oldestSentAt = new Date(rows[0].attempted_at).getTime();
  const windowEndsAt = oldestSentAt + windowSeconds * 1000;
  const retryAfterMs = Math.max(0, windowEndsAt - Date.now());
  const retry_after_seconds = Math.ceil(retryAfterMs / 1000);

  return { allowed: false, retry_after_seconds };
}

/**
 * Record an OTP attempt in the audit table.
 *
 * Always called:
 *   - outcome='sent'         after Supabase OTP send succeeds
 *   - outcome='rate_limited' when the check denies the request
 *
 * Failures are logged but do NOT propagate — the primary response
 * (429 or 200) has already been determined by the caller.
 *
 * @param supabaseUrl    - SUPABASE_URL from Workers env
 * @param serviceRoleKey - SUPABASE_SERVICE_ROLE_KEY from Workers env
 * @param emailHash      - sha256(lower(trim(email)))
 * @param handle         - handle string or null (login flow has no handle yet)
 * @param outcome        - 'sent' | 'rate_limited'
 */
export async function recordOtpAttempt(
  supabaseUrl: string,
  serviceRoleKey: string,
  emailHash: string,
  handle: string | null,
  outcome: OtpAttemptOutcome
): Promise<void> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/otp_rate_limit_attempts`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email_hash: emailHash,
        handle: handle ?? null,
        outcome,
      }),
    });

    if (!res.ok) {
      console.error(
        "[otp-rate-limit] recordOtpAttempt INSERT failed:",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("[otp-rate-limit] recordOtpAttempt fetch error:", err);
  }
}
