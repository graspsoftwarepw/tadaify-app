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
 *   500 { error: string }
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-291 (B-modified flow), DEC-294 (force-email), DEC-306 (implicit ToS)
 */

import type { Route } from "./+types/api.auth.signup";
import { validateEmail } from "~/lib/auth-validator";
import { validateHandle } from "~/lib/handle-validator";

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

  // ── Supabase OTP send ────────────────────────────────────────────────────

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Local dev without bindings — return a stub response so UI can be tested
    console.warn("[api.auth.signup] Supabase env vars not configured; stubbing OTP send");
    return Response.json({ sent: true, stub: true }, { status: 200 });
  }

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

  return Response.json({ sent: true }, { status: 200 });
}
