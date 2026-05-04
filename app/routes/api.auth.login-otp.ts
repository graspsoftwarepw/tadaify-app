/**
 * POST /api/auth/login-otp
 *
 * Sends a 6-digit email-OTP to a returning user.
 * Unlike /api/auth/signup this route does NOT create a new user
 * (shouldCreateUser: false / create_user: false) and does NOT require a handle.
 *
 * Called by: login.tsx email path — "Send me a code" CTA.
 *
 * Framework: React Router 7 resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 *
 * Request body:  { email: string }
 * Response:
 *   200 { sent: true }
 *   400 { error: string }
 *   429 { error: "rate_limited", retry_after_seconds: number }
 *   502 { error: string }
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-307 (separate login reuses email-OTP; returning user → dashboard)
 *            DEC-342 (OTP resend rate-limit — BR-OTP-RATE-LIMIT-001)
 */

import type { Route } from "./+types/api.auth.login-otp";
import { validateEmail } from "~/lib/auth-validator";
import { hashEmail, acquireOtpSlot, finalizeOtpSlot, recordOtpAttempt } from "~/lib/otp-rate-limit";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Input validation ─────────────────────────────────────────────────────

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  const emailResult = validateEmail(rawEmail);
  if (!emailResult.valid) {
    // Stable error code (not human text) so login.tsx can branch reliably.
    // issue tadaify-app#176.
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  // ── Env / Supabase config ────────────────────────────────────────────────

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Local dev without bindings — return a stub response
    console.warn("[api.auth.login-otp] Supabase env vars not configured; stubbing OTP send");
    return Response.json({ sent: true, stub: true }, { status: 200 });
  }

  // ── Backend rate-limit — atomic slot acquisition (BR-OTP-RATE-LIMIT-001) ─

  const emailHash = await hashEmail(rawEmail);

  let rateLimitResult: Awaited<ReturnType<typeof acquireOtpSlot>> | null = null;

  if (supabaseServiceRoleKey) {
    // acquireOtpSlot atomically reserves a slot (outcome='reserved') and returns
    // its UUID. Caller MUST finalize after Auth send via finalizeOtpSlot.
    // In legacy fallback mode, caller MUST call recordOtpAttempt instead.
    rateLimitResult = await acquireOtpSlot(
      supabaseUrl,
      supabaseServiceRoleKey,
      emailHash,
      null
    );

    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: "rate_limited", retry_after_seconds: rateLimitResult.retry_after_seconds ?? 86400 },
        { status: 429 }
      );
    }
  } else {
    console.warn("[api.auth.login-otp] SUPABASE_SERVICE_ROLE_KEY not set — skipping rate-limit check");
  }

  // ── Supabase OTP send ────────────────────────────────────────────────────

  // Call Supabase Auth REST API with create_user: false — login only, no new account.
  const otpRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: rawEmail,
      create_user: false,
    }),
  });

  if (!otpRes.ok) {
    const errText = await otpRes.text().catch(() => "");
    console.error("[api.auth.login-otp] Supabase OTP send failed:", otpRes.status, errText);

    // Finalize the reserved slot as 'failed' — does NOT consume a successful-send cap slot.
    if (supabaseServiceRoleKey && rateLimitResult?.reservation_id && rateLimitResult.mode === "atomic") {
      finalizeOtpSlot(supabaseUrl, supabaseServiceRoleKey, rateLimitResult.reservation_id, "failed");
    }

    // Pattern-match on the Supabase "signups not allowed for otp" phrase.
    // We intentionally do substring/case-insensitive matching so minor Supabase
    // wording tweaks don't regress the detection (issue tadaify-app#176).
    const lowerErrText = errText.toLowerCase();
    if (
      lowerErrText.includes("signups not allowed") ||
      lowerErrText.includes("signup not allowed") ||
      lowerErrText.includes("user not found") ||
      lowerErrText.includes("no user found") ||
      lowerErrText.includes("otp not available") ||
      lowerErrText.includes("only existing users")
    ) {
      return Response.json({ error: "no_account" }, { status: 400 });
    }

    // All other upstream errors → generic server_error (no info leak).
    return Response.json({ error: "server_error" }, { status: 502 });
  }

  // Finalize the slot as 'sent' — completes the two-phase reservation.
  if (supabaseServiceRoleKey && rateLimitResult) {
    if (rateLimitResult.mode === "atomic" && rateLimitResult.reservation_id) {
      finalizeOtpSlot(supabaseUrl, supabaseServiceRoleKey, rateLimitResult.reservation_id, "sent");
    } else if (rateLimitResult.mode === "legacy") {
      // Fallback path: RPC was unavailable, so record the successful send via REST.
      recordOtpAttempt(supabaseUrl, supabaseServiceRoleKey, emailHash, null, "sent");
    }
  }

  return Response.json({ sent: true }, { status: 200 });
}
