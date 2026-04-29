/**
 * POST /api/handle/reserve
 *
 * Creates a 15-minute handle reservation when user clicks "Claim your handle →"
 * on the landing page or the final CTA band.
 *
 * After a successful reservation, the client navigates to /register?handle=<slug>.
 *
 * Framework: React Router 7 (Remix) resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 * DB:        handle_reservations table (migration 20260429000001_handle_reservations.sql).
 *
 * Request body:  { handle: string }
 * Response:
 *   201 { reserved: true, handle: string, expires_at: string }
 *   409 { reserved: false, reason: "already_reserved" }
 *   400 { error: string }
 */

import type { Route } from "./+types/api.handle.reserve";
import {
  validateHandle,
  HANDLE_ERROR_MESSAGES,
} from "~/lib/handle-validator";

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

  const raw =
    typeof body.handle === "string" ? body.handle.toLowerCase().trim() : "";

  const validation = validateHandle(raw);
  if (!validation.valid) {
    return Response.json(
      { error: HANDLE_ERROR_MESSAGES[validation.reason] },
      { status: 400 }
    );
  }

  const env = context?.cloudflare?.env as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  // Capture request metadata for the reservation row
  const ip = request.headers.get("cf-connecting-ip") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;

  if (!supabaseUrl || !serviceKey) {
    // Local dev without Supabase bindings — return a stub reservation
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return Response.json(
      { reserved: true, handle: raw, expires_at: expiresAt },
      { status: 201 }
    );
  }

  // Cleanup expired reservations before inserting (lightweight hygiene)
  await fetch(
    `${supabaseUrl}/rest/v1/rpc/cleanup_expired_reservations`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  ).catch(() => {
    // Fire-and-forget — cleanup failure must not block reservation
  });

  // Insert reservation (upsert: if same handle reserved again, update timestamps)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const insertRes = await fetch(
    `${supabaseUrl}/rest/v1/handle_reservations`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        // On conflict (handle already reserved), return the existing row
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        handle: raw,
        reserved_at: new Date().toISOString(),
        expires_at: expiresAt,
        ip,
        user_agent: userAgent,
      }),
    }
  );

  if (!insertRes.ok) {
    const errBody = await insertRes.text().catch(() => "");
    // Check if this is a conflict on an ACTIVE reservation by someone else
    if (insertRes.status === 409) {
      return Response.json(
        { reserved: false, reason: "already_reserved" },
        { status: 409 }
      );
    }
    console.error("handle_reservations INSERT failed:", insertRes.status, errBody);
    return Response.json(
      { error: "Reservation failed — try again." },
      { status: 500 }
    );
  }

  return Response.json(
    { reserved: true, handle: raw, expires_at: expiresAt },
    { status: 201 }
  );
}
