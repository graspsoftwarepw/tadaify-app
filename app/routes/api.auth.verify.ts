/**
 * POST /api/auth/verify
 *
 * Verifies a 6-digit email-OTP token via Supabase verifyOtp.
 * On success:
 *  1. Harvests handle + tos_version from raw_user_meta_data.
 *  2. Creates a profiles row (handle binding — DEC-291).
 *  3. Removes the matching handle_reservation (cleanup after signup).
 *
 * Called by: register.tsx Section B-otp.
 *
 * Framework: React Router 7 resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 *
 * Request body:  { email: string; token: string }
 * Response:
 *   200 { verified: true; handle: string; access_token: string }
 *   400 { error: string; code?: string }
 *   502 { error: string }
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-291/293/294/295/305/306
 */

import type { Route } from "./+types/api.auth.verify";
import { validateEmail, validateOtp } from "~/lib/auth-validator";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: { email?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Input validation ─────────────────────────────────────────────────────

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawToken = typeof body.token === "string" ? body.token.trim() : "";

  const emailResult = validateEmail(rawEmail);
  if (!emailResult.valid) {
    return Response.json({ error: "Invalid email address." }, { status: 400 });
  }

  const otpResult = validateOtp(rawToken);
  if (!otpResult.valid) {
    return Response.json({ error: "Invalid OTP code format." }, { status: 400 });
  }

  // ── Supabase OTP verify ──────────────────────────────────────────────────

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;
  const serviceKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    console.warn("[api.auth.verify] Supabase env vars not configured; stubbing verify");
    return Response.json(
      { verified: true, handle: "stub_handle", stub: true },
      { status: 200 }
    );
  }

  const verifyRes = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: rawEmail,
      token: rawToken,
      type: "email",
    }),
  });

  if (!verifyRes.ok) {
    const errText = await verifyRes.text().catch(() => "");
    let code = "otp_invalid";
    let errMsg = "Incorrect or expired code. Please try again.";
    try {
      const parsed = JSON.parse(errText) as {
        error_code?: string;
        msg?: string;
        message?: string;
      };
      if (parsed.error_code) code = parsed.error_code;
      if (parsed.msg || parsed.message) {
        errMsg = parsed.msg ?? parsed.message ?? errMsg;
      }
    } catch {
      // use defaults
    }
    console.error("[api.auth.verify] OTP verify failed:", verifyRes.status, errText);
    return Response.json({ error: errMsg, code }, { status: 400 });
  }

  // Parse verify response to get access token + user data
  const verifyData = (await verifyRes.json()) as {
    access_token?: string;
    user?: {
      id?: string;
      user_metadata?: { handle?: string; tos_version?: string };
    };
  };

  const userId = verifyData.user?.id;
  const accessToken = verifyData.access_token ?? "";
  const handle = verifyData.user?.user_metadata?.handle ?? "";
  const tosVersion = verifyData.user?.user_metadata?.tos_version ?? "v1";

  if (!userId || !handle) {
    console.error("[api.auth.verify] Missing userId or handle in verify response");
    return Response.json(
      { error: "Verification succeeded but user data is incomplete. Please contact support." },
      { status: 500 }
    );
  }

  // ── Handle race-condition pre-check (F3) ────────────────────────────────
  // SELECT id FROM profiles WHERE handle = $1 before INSERT.
  // If a row exists with a DIFFERENT id → another user claimed the handle first (EC-002).
  // Return 409 to UI with reason: "handle_taken".
  // If a row exists with the SAME id → idempotent retry by the same user (safe to proceed).

  const handleCheckRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=id&limit=1`,
    {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    }
  );

  if (handleCheckRes.ok) {
    const existing = (await handleCheckRes.json()) as Array<{ id: string }>;
    if (existing.length > 0 && existing[0].id !== userId) {
      // Different user already owns this handle — race condition EC-002
      return Response.json(
        { verified: false, error: "This handle was just claimed. Please pick a different one.", reason: "handle_taken" },
        { status: 409 }
      );
    }
    // If existing[0].id === userId → same user retrying → fall through to idempotent INSERT
  }

  // ── Create profiles row (service-role, bypasses RLS) ────────────────────

  const profilesInsertRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      handle,
      email: rawEmail,
      tos_version: tosVersion,
    }),
  });

  if (!profilesInsertRes.ok) {
    const errText = await profilesInsertRes.text().catch(() => "");
    console.error(
      "[api.auth.verify] profiles INSERT failed:",
      profilesInsertRes.status,
      errText
    );
    if (profilesInsertRes.status !== 409) {
      return Response.json(
        { error: "Account confirmed but profile creation failed. Please contact support." },
        { status: 502 }
      );
    }

    // ── 409 disambiguation (F3 round-2) ──────────────────────────────────
    // The pre-check above closes the obvious case, but a TOCTOU race remains
    // between pre-check and INSERT. On 409 we MUST re-query to learn which
    // row actually owns the handle:
    //   • row.id === userId → same user retrying → idempotent, proceed.
    //   • row.id !== userId → another user just claimed it → 409 handle_taken.
    //   • no row found      → unique-violation on a different column? bail.
    const postCheckRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=id&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!postCheckRes.ok) {
      return Response.json(
        { error: "Account confirmed but profile creation failed. Please contact support." },
        { status: 502 }
      );
    }

    const postCheckRows = (await postCheckRes.json()) as Array<{ id: string }>;
    if (postCheckRows.length === 0 || postCheckRows[0].id !== userId) {
      // Race lost — another user owns this handle now (or no row at all,
      // meaning the unique violation came from a different column we don't
      // currently expect; treat as handle_taken to be safe).
      return Response.json(
        { verified: false, error: "This handle was just claimed. Please pick a different one.", reason: "handle_taken" },
        { status: 409 }
      );
    }
    // Same user retrying — idempotent, fall through.
  }

  // ── Cleanup handle reservation (fire-and-forget) ─────────────────────────

  fetch(
    `${supabaseUrl}/rest/v1/handle_reservations?handle=eq.${encodeURIComponent(handle)}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  ).catch((err) => {
    console.warn("[api.auth.verify] handle_reservation cleanup failed:", err);
  });

  return Response.json({ verified: true, handle, access_token: accessToken }, { status: 200 });
}
