/**
 * POST /api/blocks/reorder — atomically reorder all blocks on a page
 *
 * Auth:    Bearer JWT or sb-*-auth-token cookie
 * DB:      calls reorder_blocks(p_page_id, p_ordered_ids[]) SECURITY DEFINER RPC
 *
 * Request body: { page_id: string (UUID), ordered_ids: string[] (UUIDs) }
 * Response:     200 + { ok: true }
 * Error:        401 on missing auth; 400 on validation; 422 on RPC invalid_input;
 *               500 on misconfig
 *
 * Notes:
 * - ECN-CRUD-04: ordered_ids containing cross-page block → RPC raises invalid_input → 422
 * - ECN-CRUD-05: ordered_ids length mismatch → RPC raises invalid_input → 422
 * - ECN-CRUD-06: concurrent reorders → DB row-locking; second write wins; client refetches
 * - TODO: call purgeCacheForHandle(handle) once #202 wires in TR-tadaify-010
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-003, AC#4, ECN-CRUD-04/05/06
 */

import type { Route } from "./+types/api.blocks.reorder";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";
import {
  purgeCacheForHandleAndAwait,
  type CachePurgeWaitable,
} from "~/lib/cache-purge";
import { resolveHandleForUser } from "~/lib/resolve-handle-for-purge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CF_ZONE_ID?: string;
  CF_API_TOKEN?: string;
}

// ── Validation helpers ────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_REGEX.test(v);
}

interface ReorderInput {
  page_id: string;
  ordered_ids: string[];
}

function validateReorder(
  body: unknown
): { ok: true; data: ReorderInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Validation failed: request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  if (!isUuid(b.page_id)) {
    return { ok: false, error: "Validation failed: page_id must be a valid UUID" };
  }
  if (!Array.isArray(b.ordered_ids) || b.ordered_ids.length === 0) {
    return { ok: false, error: "Validation failed: ordered_ids must be a non-empty array" };
  }
  for (const id of b.ordered_ids) {
    if (!isUuid(id)) {
      return {
        ok: false,
        error: "Validation failed: each id in ordered_ids must be a valid UUID",
      };
    }
  }

  return {
    ok: true,
    data: { page_id: b.page_id as string, ordered_ids: b.ordered_ids as string[] },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEnv(context: unknown): WorkerEnv {
  return (
    (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {}
  );
}

function getCtx(context: unknown): CachePurgeWaitable | undefined {
  return (context as { cloudflare?: { ctx?: CachePurgeWaitable } }).cloudflare
    ?.ctx;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = getEnv(context);
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(
    accessToken,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateReorder(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { page_id, ordered_ids } = validation.data;

  // Call reorder_blocks RPC — passes user's own JWT for SECURITY DEFINER auth check
  const rpcRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/reorder_blocks`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_page_id: page_id, p_ordered_ids: ordered_ids }),
    }
  );

  if (!rpcRes.ok) {
    const text = await rpcRes.text();

    // PostgREST maps SQLSTATE 22023 (invalid_input) to 400; pass through as 422
    // so the client can distinguish "bad request" from "failed validation"
    if (rpcRes.status === 400) {
      let detail = "invalid_input";
      try {
        const parsed = JSON.parse(text) as { message?: string };
        detail = parsed.message ?? detail;
      } catch { /* ignore */ }
      return Response.json({ error: detail }, { status: 422 });
    }

    if (rpcRes.status === 403 || rpcRes.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[api.blocks.reorder] RPC error:", rpcRes.status, text);
    return Response.json({ error: "Reorder failed", detail: text }, { status: 500 });
  }

  // TR-tadaify-010 — purge edge cache after successful reorder.
  // Registered with ctx.waitUntil() so the runtime keeps the purge alive
  // past the response.
  const handle = await resolveHandleForUser(
    userId,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  );
  if (handle) {
    purgeCacheForHandleAndAwait(getCtx(context), handle, undefined, {
      CF_ZONE_ID: env.CF_ZONE_ID,
      CF_API_TOKEN: env.CF_API_TOKEN,
    });
  }

  return Response.json({ ok: true }, { status: 200 });
}
