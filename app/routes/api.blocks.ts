/**
 * GET /api/blocks?page_id=<uuid>   — list blocks for a page, ordered by position ASC
 * POST /api/blocks                 — create a new block
 *
 * Auth:    Bearer JWT or sb-*-auth-token cookie (same scheme as other API routes)
 * DB:      Supabase REST as user role (RLS enforces ownership)
 *
 * GET response:  { blocks: Block[] }
 * POST response: 201 + { block: Block }
 * Error:         401 on missing auth; 400 on validation; 404 on RLS deny; 500 on misconfig
 *
 * Notes:
 * - ECN-CRUD-12: page_id belonging to another user returns { blocks: [] } (RLS filters to 0 rows)
 * - ECN-CRUD-13: GET without page_id returns 400
 * - ECN-CRUD-01: POST with another user's page_id returns 4xx (RLS INSERT policy rejects)
 * - ECN-CRUD-10: POST without page_id returns 400
 * - TODO: call purgeCacheForHandle(handle) after mutation once #202 wires in TR-tadaify-010
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#4, AC#9, ECN-CRUD-01/10/12/13
 */

import type { Route } from "./+types/api.blocks";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";
import { validateLinkUrl } from "~/lib/validate-link-url";
import {
  purgeCacheForHandleAndAwait,
  type CachePurgeWaitable,
} from "~/lib/cache-purge";
import { resolveHandleForUser } from "~/lib/resolve-handle-for-purge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CF_ZONE_ID?: string;
  CF_API_TOKEN?: string;
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

interface CreateBlockInput {
  page_id: string;
  block_type: string;
  title: string;
  url?: string | null;
  meta?: unknown;
}

function validateCreateBlock(
  body: unknown
): { ok: true; data: CreateBlockInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  if (!isUuid(b.page_id)) {
    return { ok: false, error: "Validation failed: page_id must be a valid UUID" };
  }
  if (typeof b.block_type !== "string" || b.block_type.trim() === "") {
    return { ok: false, error: "Validation failed: block_type is required" };
  }
  let url =
    b.url === undefined || b.url === null
      ? null
      : typeof b.url === "string"
      ? b.url
      : null;

  // Link blocks: validate + canonicalise the destination URL server-side
  // (defence in depth — the editor validates too). Rejects javascript:/data:
  // and other non-http(s) schemes.
  if (b.block_type === "link") {
    const r = validateLinkUrl(url ?? "");
    if (!r.ok) return { ok: false, error: `Validation failed: ${r.error}` };
    url = r.url;
  }

  return {
    ok: true,
    data: {
      page_id: b.page_id as string,
      block_type: b.block_type as string,
      title: typeof b.title === "string" ? b.title : "",
      url,
      meta: b.meta,
    },
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

// ── GET /api/blocks?page_id=<uuid> ────────────────────────────────────────────

export async function loader({ request, context }: Route.LoaderArgs) {
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

  const url = new URL(request.url);
  const pageId = url.searchParams.get("page_id");
  if (!pageId) {
    return Response.json(
      { error: "page_id query param is required" },
      { status: 400 }
    );
  }

  if (!isUuid(pageId)) {
    return Response.json({ error: "page_id must be a valid UUID" }, { status: 400 });
  }

  // Query blocks as the user (passing their token so RLS enforces ownership)
  const blocksRes = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?page_id=eq.${encodeURIComponent(pageId)}&order=position.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!blocksRes.ok) {
    const text = await blocksRes.text();
    console.error("[api.blocks GET] Supabase error:", blocksRes.status, text);
    return Response.json({ error: "Failed to fetch blocks" }, { status: 500 });
  }

  const blocks = (await blocksRes.json()) as Block[];
  return Response.json({ blocks });
}

// ── POST /api/blocks ──────────────────────────────────────────────────────────

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

  const validation = validateCreateBlock(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { page_id, block_type, title, url, meta } = validation.data;

  // Determine next position: MAX(position)+1 for the page (or 0 if no blocks yet)
  const posRes = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?page_id=eq.${encodeURIComponent(page_id)}&select=position&order=position.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  let nextPosition = 0;
  if (posRes.ok) {
    const rows = (await posRes.json()) as { position: number }[];
    if (rows.length > 0) nextPosition = rows[0].position + 1;
  }

  // Insert via RLS-enforced user token (blocks_own_insert WITH CHECK enforces page ownership)
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/blocks`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      page_id,
      user_id: userId,
      block_type,
      title,
      url: url ?? null,
      position: nextPosition,
      meta: meta ?? null,
    }),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    // RLS insert rejection (42501 / 403 from PostgREST) — hide block existence
    if (insertRes.status === 403 || insertRes.status === 401) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[api.blocks POST] Insert error:", insertRes.status, text);
    return Response.json({ error: "Insert failed", detail: text }, { status: 500 });
  }

  const blocks = (await insertRes.json()) as Block[];

  // TR-tadaify-010 — purge edge cache for the creator's public page.
  // Registered with ctx.waitUntil() so the Worker keeps the runtime alive
  // until the purge fetch settles. Purge failure must not fail the CRUD save.
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

  return Response.json({ block: blocks[0] }, { status: 201 });
}
