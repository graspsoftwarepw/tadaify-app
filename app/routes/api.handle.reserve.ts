/**
 * POST /api/handle/reserve
 *
 * Creates a handle reservation when user clicks "Claim your handle →" on the
 * landing page or the final CTA band.
 *
 * After a successful reservation, the client navigates to /register?handle=<slug>.
 *
 * Framework: React Router 7 (Remix) resource route — no default export.
 * Runtime:   Cloudflare Workers (DEC-FRAMEWORK-01).
 * DB:        handle_reservations table (migration 20260429000001_handle_reservations.sql).
 *
 * Reservation TTL: HANDLE_RESERVATION_TTL_SECONDS env var (default: 600 = 10 min).
 * DEC-326 = A: canonical 10 min (down from 15 min). SQL DEFAULT dropped in
 * migration 20260502000001_drop_handle_reservations_default.sql — JS computes
 * expires_at so it reflects the env-var value at runtime (testable without wait).
 *
 * Request body:  { handle: string }
 * Response:
 *   201 { reserved: true, handle: string, expires_at: string }
 *   409 { reserved: false, reason: "already_reserved" }
 *   400 { error: string }
 *   500 { error: "invalid TTL config" } — when HANDLE_RESERVATION_TTL_SECONDS is negative
 */

import type { Route } from "./+types/api.handle.reserve";
import {
  validateHandle,
  HANDLE_ERROR_MESSAGES,
} from "~/lib/handle-validator";

const DEFAULT_TTL_SECONDS = 600; // 10 min — DEC-326 = A

/**
 * Resolve TTL in milliseconds from the Workers env var.
 * Returns { ttlMs: number } on success, { error: string } on invalid config.
 */
function resolveTtlMs(env: Record<string, string> | undefined): { ttlMs: number } | { error: string } {
  const raw = env?.HANDLE_RESERVATION_TTL_SECONDS;

  if (raw === undefined || raw === null || raw === "") {
    return { ttlMs: DEFAULT_TTL_SECONDS * 1000 };
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    console.warn("[api.handle.reserve] HANDLE_RESERVATION_TTL_SECONDS is non-numeric:", raw, "— using default");
    return { ttlMs: DEFAULT_TTL_SECONDS * 1000 };
  }
  if (parsed <= 0) {
    return { error: "invalid TTL config" };
  }

  return { ttlMs: parsed * 1000 };
}

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

  // Resolve TTL — fail fast if config is invalid
  const ttlResult = resolveTtlMs(env);
  if ("error" in ttlResult) {
    console.error("[api.handle.reserve] Invalid TTL config:", env?.HANDLE_RESERVATION_TTL_SECONDS);
    return Response.json({ error: ttlResult.error }, { status: 500 });
  }
  const { ttlMs } = ttlResult;

  // Capture request metadata for the reservation row
  const ip = request.headers.get("cf-connecting-ip") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;

  if (!supabaseUrl || !serviceKey) {
    // Local dev without Supabase bindings — return a stub reservation
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();
    return Response.json(
      { reserved: true, handle: raw, expires_at: expiresAt },
      { status: 201 }
    );
  }

  // ── Profiles pre-check: reject if handle permanently claimed ────────────
  // The profiles table now exists (Slice B migration 20260501000001_profiles.sql).
  // If the handle is already in profiles → it is permanently claimed by a live account.
  // Return 409 immediately — do not proceed to INSERT into handle_reservations.

  const profilesCheckRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?handle=eq.${encodeURIComponent(raw)}&select=id&limit=1`,
    {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    }
  ).catch(() => null);

  if (profilesCheckRes?.ok) {
    const claimed = (await profilesCheckRes.json().catch(() => [])) as Array<{ id: string }>;
    if (claimed.length > 0) {
      return Response.json(
        { reserved: false, reason: "handle_taken" },
        { status: 409 }
      );
    }
  }
  // If the profiles check errors (e.g. network blip), fall through and let the reservation proceed.
  // The verify step will catch any race on INSERT.

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
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

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
