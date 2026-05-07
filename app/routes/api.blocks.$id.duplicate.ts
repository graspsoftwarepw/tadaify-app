/**
 * POST /api/blocks/:id/duplicate — duplicate a block via duplicate_block() RPC
 *
 * Auth:    Bearer JWT or sb-*-auth-token cookie
 * DB:      calls duplicate_block(p_block_id) SECURITY DEFINER RPC via Supabase REST
 *
 * Response: 200 + { block_id: string }   — id of the new (duplicate) block
 * Error:    401 on missing auth; 404 on wrong owner or not found; 500 on misconfig
 *
 * Notes:
 * - The RPC raises permission_denied (42501) if caller does not own the source block.
 *   PostgREST surfaces this as a 403; we translate to 404 to avoid info-leak (ECN-CRUD-02).
 * - TODO: call purgeCacheForHandle(handle) once #202 wires in TR-tadaify-010
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-004, AC#4, ECN-CRUD-02/03
 */

import type { Route } from "./+types/api.blocks.$id.duplicate";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEnv(context: unknown): WorkerEnv {
  return (
    (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {}
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function action({ request, context, params }: Route.ActionArgs) {
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

  const blockId = params.id;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!blockId || !uuidRegex.test(blockId)) {
    return Response.json({ error: "Invalid block id" }, { status: 400 });
  }

  // Call duplicate_block RPC — passes user's own JWT so the SECURITY DEFINER
  // function can verify auth.uid() = block.user_id
  const rpcRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/duplicate_block`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_block_id: blockId }),
    }
  );

  if (!rpcRes.ok) {
    const text = await rpcRes.text();
    // 403 from PostgREST = permission_denied from the RPC — hide existence
    if (rpcRes.status === 403 || rpcRes.status === 401) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[api.blocks.$id.duplicate] RPC error:", rpcRes.status, text);
    return Response.json({ error: "Duplicate failed", detail: text }, { status: 500 });
  }

  // RPC returns the new block uuid directly as a JSON string
  const newBlockId = (await rpcRes.json()) as string;
  return Response.json({ block_id: newBlockId }, { status: 200 });
}
