/**
 * POST /api/handle/check
 *
 * Real-time handle availability check called by the landing-page claim form
 * (300ms debounce). Returns availability status + locale-aware alternatives.
 *
 * Framework: React Router 7 (Remix) resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 * DB:        Supabase local (dev) / Supabase cloud (prod) via service-role key.
 *
 * Request body:  { handle: string }
 * Response body: { available: boolean, reason?: string, alternatives?: string[] }
 */

import type { Route } from "./+types/api.handle.check";
import {
  validateHandle,
  generateAlternatives,
  HANDLE_ERROR_MESSAGES,
} from "~/lib/handle-validator";
import { detectLocaleFromRequest } from "~/lib/locale-detect";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: { handle?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = typeof body.handle === "string" ? body.handle.toLowerCase().trim() : "";

  // Client-side validation (fast, no DB)
  const validation = validateHandle(raw);
  if (!validation.valid) {
    return Response.json({
      available: false,
      reason: validation.reason,
      message: HANDLE_ERROR_MESSAGES[validation.reason],
      alternatives: [],
    });
  }

  const locale = detectLocaleFromRequest(request);

  // Query DB for active reservations and claimed handles
  // In Workers runtime, Supabase client is constructed from env bindings.
  // We use a lightweight fetch-based query to avoid bundling the Supabase SDK
  // (it's large). The service-role key is injected via Cloudflare secret.
  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  let available = true;
  let reason: string | undefined;

  if (supabaseUrl && serviceKey) {
    // Check handle_reservations (active reservations by OTHER sessions)
    const reservationRes = await fetch(
      `${supabaseUrl}/rest/v1/handle_reservations?handle=eq.${encodeURIComponent(raw)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=handle`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (reservationRes.ok) {
      const rows = (await reservationRes.json()) as { handle: string }[];
      if (rows.length > 0) {
        available = false;
        reason = "reserved";
      }
    }

    // Check profiles table (already claimed handles) — only if not already reserved
    if (available) {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?handle=eq.${encodeURIComponent(raw)}&select=handle`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileRes.ok) {
        const rows = (await profileRes.json()) as { handle: string }[];
        if (rows.length > 0) {
          available = false;
          reason = "taken";
        }
      }
      // If profileRes is not ok (e.g. profiles table doesn't exist yet in Story 0),
      // we treat as available. The reservation check is sufficient for landing.
    }
  }
  // If Supabase env vars aren't configured (local dev without bindings),
  // fall through as available=true — handle claim still works for testing.

  const alternatives =
    available ? [] : generateAlternatives(raw, locale);

  return Response.json({
    available,
    reason: available ? null : reason,
    alternatives,
  });
}
