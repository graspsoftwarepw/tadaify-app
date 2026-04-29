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

  // TODO (Slice B — Register): Once the `profiles` table lands, add a pre-INSERT check here:
  //   SELECT id FROM profiles WHERE handle = $1
  // If a row is found → return 409 { reserved: false, reason: "handle_taken" }
  // This prevents reserving a handle that is already claimed by a live account.
  // The profiles table does not exist yet — this guard is intentionally deferred.

  // Atomically clean up expired reservations for this handle before inserting.
  // Using a targeted DELETE rather than a server-side RPC so we don't depend on
  // the cleanup_expired_reservations function being present.
  await fetch(
    `${supabaseUrl}/rest/v1/handle_reservations?handle=eq.${encodeURIComponent(raw)}&expires_at=lt.${encodeURIComponent(new Date().toISOString())}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  ).catch(() => {
    // Fire-and-forget — cleanup failure must not block reservation
  });

  // Plain INSERT — no merge-duplicates.
  // If the handle is already actively reserved (PK conflict), Supabase returns 409
  // which we surface to the caller.  This is intentional security: a claimed handle
  // must not be silently upserted / overwritten via a direct API hit.
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const insertRes = await fetch(
    `${supabaseUrl}/rest/v1/handle_reservations`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
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
    if (insertRes.status === 409) {
      // PK conflict — handle is actively reserved by another session
      return Response.json(
        { reserved: false, reason: "active_reservation" },
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
