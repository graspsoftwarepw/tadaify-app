/**
 * POST /api/auth/signup
 *
 * Sends a 6-digit email-OTP to the given address via Supabase signInWithOtp.
 * Captures handle + tos_version in raw_user_meta_data (DEC-306).
 *
 * Called by: register.tsx Section B-email → "Send code" CTA.
 *
 * Framework: React Router 7 resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 *
 * Request body:  { email: string; handle: string; tos_version: string }
 * Response:
 *   200 { sent: true }
 *   400 { error: string }
 *   429 { error: "rate_limited", retry_after_seconds: number }
 *   500 | 502 { error: string }
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-291 (B-modified flow), DEC-294 (force-email), DEC-306 (implicit ToS)
 *            DEC-342 (OTP resend rate-limit — BR-OTP-RATE-LIMIT-001)
 */

import type { Route } from "./+types/api.auth.signup";
import { validateEmail } from "~/lib/auth-validator";
import { validateHandle } from "~/lib/handle-validator";
import { hashEmail, acquireOtpSlot } from "~/lib/otp-rate-limit";

const TOS_VERSION_CURRENT = "v1";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: { email?: unknown; handle?: unknown; tos_version?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Input validation ─────────────────────────────────────────────────────

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawHandle = typeof body.handle === "string" ? body.handle.trim().toLowerCase() : "";
  const tosVersion =
    typeof body.tos_version === "string" ? body.tos_version : TOS_VERSION_CURRENT;

  const emailResult = validateEmail(rawEmail);
  if (!emailResult.valid) {
    return Response.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const handleResult = validateHandle(rawHandle);
  if (!handleResult.valid) {
    return Response.json(
      { error: "A valid handle is required." },
      { status: 400 }
    );
  }

  // ── Env / Supabase config ────────────────────────────────────────────────

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[api.auth.signup] Workers env bindings SUPABASE_URL / SUPABASE_ANON_KEY not set");
    return new Response(
      JSON.stringify({ error: "Workers env binding missing — see .dev.vars.example" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // ── Backend rate-limit — atomic slot acquisition (BR-OTP-RATE-LIMIT-001) ─

  const emailHash = await hashEmail(rawEmail);

  if (supabaseServiceRoleKey) {
    // acquireOtpSlot atomically checks + reserves/denies in one DB call.
    // On allowed=true a 'sent' row is already recorded; on allowed=false a
    // 'rate_limited' row is already recorded. No separate recordOtpAttempt needed.
    const rateLimitResult = await acquireOtpSlot(
      supabaseUrl,
      supabaseServiceRoleKey,
      emailHash,
      rawHandle || null
    );

    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: "rate_limited", retry_after_seconds: rateLimitResult.retry_after_seconds ?? 86400 },
        { status: 429 }
      );
    }
  } else {
    console.warn("[api.auth.signup] SUPABASE_SERVICE_ROLE_KEY not set — skipping rate-limit check");
  }

  // ── Supabase OTP send ────────────────────────────────────────────────────

  // Call Supabase Auth REST API directly (no SDK bundle in Workers).
  // signInWithOtp(email) with data payload → lands in raw_user_meta_data (DEC-306).
  const signupRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: rawEmail,
      data: {
        handle: rawHandle,
        tos_version: tosVersion,
      },
      create_user: true,
    }),
  });

  if (!signupRes.ok) {
    const errText = await signupRes.text().catch(() => "");
    let errMsg = "Failed to send verification code. Please try again.";
    try {
      const parsed = JSON.parse(errText) as { msg?: string; message?: string };
      if (parsed.msg || parsed.message) {
        errMsg = parsed.msg ?? parsed.message ?? errMsg;
      }
    } catch {
      // use default message
    }
    console.error("[api.auth.signup] Supabase OTP send failed:", signupRes.status, errText);
    return Response.json({ error: errMsg }, { status: 502 });
  }

  // Note: the 'sent' audit row is already recorded atomically by acquireOtpSlot.
  // No separate recordOtpAttempt call needed.

  return Response.json({ sent: true }, { status: 200 });
}
