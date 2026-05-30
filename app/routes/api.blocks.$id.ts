/**
 * PATCH /api/blocks/:id  — update block fields
 * DELETE /api/blocks/:id — hard-delete block (DEC-374=B)
 *
 * Auth:    Bearer JWT or sb-*-auth-token cookie
 * DB:      Supabase REST as user role (RLS enforces ownership)
 *
 * PATCH response:  200 + { block: Block }
 * DELETE response: 204
 * Error:           401 on missing auth; 400 on validation; 404 on RLS deny; 500 on misconfig
 *
 * Notes:
 * - ECN-CRUD-02: DELETE another user's block returns 404 (not 403 — no info leak)
 * - ECN-CRUD-08: PATCH on block whose page was deleted returns 4xx (FK / RLS)
 * - DEC-374=B: hard-delete only; no soft-delete column; confirm modal is in dashboard UI
 * - TODO: call purgeCacheForHandle(handle) after mutation once #202 wires in TR-tadaify-010
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, BR-BLOCK-CRUD-002, AC#4, ECN-CRUD-02
 */

import type { Route } from "./+types/api.blocks.$id";
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

/**
 * Cache purge for the authenticated creator's public page, attached to the
 * Worker's ExecutionContext via `ctx.waitUntil()` so the runtime stays alive
 * until the CF purge fetch completes. Lookup + purge errors are absorbed —
 * purge must never break the CRUD path.
 * TR-tadaify-010 (#202), Codex round-1 finding (waitUntil).
 */
async function firePurgeForUser(
  userId: string,
  env: WorkerEnv,
  ctx: CachePurgeWaitable | undefined,
): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  const handle = await resolveHandleForUser(
    userId,
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!handle) return;
  purgeCacheForHandleAndAwait(ctx, handle, undefined, {
    CF_ZONE_ID: env.CF_ZONE_ID,
    CF_API_TOKEN: env.CF_API_TOKEN,
  });
}

export interface Block {
  id: string;
  page_id: string;
  user_id: string;
  block_type: string;
  title: string;
  url: string | null;
  is_visible: boolean;
  position: number;
  meta: unknown;
  created_at: string;
  updated_at: string;
}

// ── Validation helpers ────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_REGEX.test(v);
}

interface UpdateBlockInput {
  block_type?: string;
  title?: string;
  url?: string | null;
  is_visible?: boolean;
  meta?: unknown;
}

function validateUpdateBlock(
  body: unknown
): { ok: true; data: UpdateBlockInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Validation failed: request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  const allowedKeys = ["block_type", "title", "url", "is_visible", "meta"];
  const provided = Object.keys(b).filter((k) => allowedKeys.includes(k));
  if (provided.length === 0) {
    return { ok: false, error: "Validation failed: at least one field must be provided for update" };
  }

  const data: UpdateBlockInput = {};
  if ("block_type" in b) {
    if (typeof b.block_type !== "string" || b.block_type.trim() === "") {
      return { ok: false, error: "Validation failed: block_type must be a non-empty string" };
    }
    data.block_type = b.block_type;
  }
  if ("title" in b) {
    if (typeof b.title !== "string") {
      return { ok: false, error: "Validation failed: title must be a string" };
    }
    data.title = b.title;
  }
  if ("url" in b) {
    data.url =
      b.url === null || b.url === undefined
        ? null
        : typeof b.url === "string"
        ? b.url
        : null;
  }
  if ("is_visible" in b) {
    if (typeof b.is_visible !== "boolean") {
      return { ok: false, error: "Validation failed: is_visible must be a boolean" };
    }
    data.is_visible = b.is_visible;
  }
  if ("meta" in b) {
    data.meta = b.meta;
  }

  return { ok: true, data };
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

export async function action({ request, context, params }: Route.ActionArgs) {
  const method = request.method.toUpperCase();
  if (method !== "PATCH" && method !== "DELETE") {
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

  const blockId = params.id;
  if (!isUuid(blockId)) {
    return Response.json({ error: "Invalid block id" }, { status: 400 });
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────

  if (method === "DELETE") {
    // RLS blocks_own_delete will filter to 0 rows if caller != owner
    // We check rows affected to return 404 on missing/wrong-owner (ECN-CRUD-02)
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blocks?id=eq.${encodeURIComponent(blockId)}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=minimal,count=exact",
        },
      }
    );

    if (!deleteRes.ok) {
      const text = await deleteRes.text();
      if (deleteRes.status === 403 || deleteRes.status === 401) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      console.error("[api.blocks.$id DELETE] error:", deleteRes.status, text);
      return Response.json({ error: "Delete failed" }, { status: 500 });
    }

    // Check Content-Range header to detect 0 rows affected (wrong owner or missing)
    const contentRange = deleteRes.headers.get("Content-Range") ?? "";
    // PostgREST returns "*/0" when 0 rows were affected
    if (contentRange.endsWith("/0")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // TR-tadaify-010 — purge edge cache after successful DELETE.
    await firePurgeForUser(userId, env, getCtx(context));

    return new Response(null, { status: 204 });
  }

  // ── PATCH ───────────────────────────────────────────────────────────────────

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateUpdateBlock(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?id=eq.${encodeURIComponent(blockId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,count=exact",
      },
      body: JSON.stringify(validation.data),
    }
  );

  if (!updateRes.ok) {
    const text = await updateRes.text();
    if (updateRes.status === 403 || updateRes.status === 401) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[api.blocks.$id PATCH] error:", updateRes.status, text);
    return Response.json({ error: "Update failed", detail: text }, { status: 500 });
  }

  const blocks = (await updateRes.json()) as Block[];
  if (!blocks.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // TR-tadaify-010 — purge edge cache after successful PATCH.
  await firePurgeForUser(userId, env, getCtx(context));

  return Response.json({ block: blocks[0] }, { status: 200 });
}
