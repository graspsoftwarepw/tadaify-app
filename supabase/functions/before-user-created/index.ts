/**
 * before-user-created Auth Hook
 *
 * Fires BEFORE a new user record is persisted by Supabase GoTrue.
 * Enforces the force-email policy (DEC-294): rejects any signup attempt
 * where the email field is NULL, empty, or a whitespace-only string.
 *
 * This covers two attack surfaces:
 *  1. OAuth providers that may skip email scope (e.g. X/Twitter without email permission)
 *  2. Direct API calls that supply no email
 *
 * Supabase auth hook contract:
 *  - Hook receives: { user: { email?: string; ... }, ... }
 *  - Hook MUST return: { decision: "continue" } to allow
 *                     { error: { message: string; http_code: number } } to reject
 *
 * Runtime: Deno (Supabase Edge Runtime v2)
 * Configuration: supabase/config.toml [auth.hook.before_user_created]
 *
 * Story: F-REGISTER-001a
 * DEC trail: DEC-294 (force-email Auth Hook ON)
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface HookPayload {
  user: {
    email?: string | null;
    phone?: string | null;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  };
}

interface HookResponse {
  decision?: "continue";
  error?: {
    message: string;
    http_code: number;
  };
}

serve(async (req: Request): Promise<Response> => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: HookPayload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: { message: "Invalid JSON payload", http_code: 400 } });
  }

  const email = payload?.user?.email;

  // DEC-294: reject NULL/empty/whitespace-only email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    console.warn(
      "[before-user-created] Rejected signup: missing or empty email.",
      { email_received: email ?? null }
    );
    return Response.json({
      error: {
        message:
          "An email address is required to create a tadaify account. " +
          "Sign in with a provider that shares your email, or use the email OTP path.",
        http_code: 422,
      },
    } satisfies HookResponse);
  }

  // Email present — allow the signup to proceed
  return Response.json({ decision: "continue" } satisfies HookResponse);
});
