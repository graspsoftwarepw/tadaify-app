/**
 * POST /api/auth/password
 *
 * Updates the authenticated user's password (opt-in step post-OTP, DEC-295).
 * Requires a valid Supabase session JWT in the Authorization header.
 *
 * Called by: register.tsx Section B-password-toggle when user opts in to "Set password".
 *
 * Framework: React Router 7 resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 *
 * Request headers: Authorization: Bearer <access_token>
 * Request body:    { password: string }
 * Response:
 *   200 { updated: true }
 *   400 { error: string }
 *   401 { error: string }
 *   502 { error: string }
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * DEC trail: DEC-295 (inline post-OTP password toggle)
 */

import type { Route } from "./+types/api.auth.password";
import { validatePassword, PASSWORD_ERROR_MESSAGES } from "~/lib/auth-validator";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // ── Auth header ──────────────────────────────────────────────────────────

  const authHeader = request.headers.get("Authorization") ?? "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!accessToken) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  // ── Input validation ─────────────────────────────────────────────────────

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawPassword = typeof body.password === "string" ? body.password : "";
  const pwResult = validatePassword(rawPassword);
  if (!pwResult.valid) {
    return Response.json(
      { error: PASSWORD_ERROR_MESSAGES[pwResult.reason] },
      { status: 400 }
    );
  }

  // ── Supabase password update ─────────────────────────────────────────────

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[api.auth.password] Supabase env vars not configured; stubbing update");
    return Response.json({ updated: true, stub: true }, { status: 200 });
  }

  const updateRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: rawPassword }),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text().catch(() => "");
    let errMsg = "Password update failed. Please try again.";
    try {
      const parsed = JSON.parse(errText) as { msg?: string; message?: string };
      if (parsed.msg || parsed.message) {
        errMsg = parsed.msg ?? parsed.message ?? errMsg;
      }
    } catch {
      // use default
    }
    console.error("[api.auth.password] Supabase PUT /user failed:", updateRes.status, errText);
    return Response.json({ error: errMsg }, { status: 502 });
  }

  return Response.json({ updated: true }, { status: 200 });
}
