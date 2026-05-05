/**
 * GET /api/avatar/:key
 *
 * Serves avatar bytes from R2 (MOCK_R2 or real binding).
 *
 * In production this would generate a presigned URL with 7-day TTL and redirect.
 * In MOCK_R2 mode it serves the bytes directly (no presigning needed).
 *
 * The `key` param is the full r2_key path (e.g. `avatars/user-id/uuid.jpg`).
 * The URL is encoded as a base64url param to avoid path conflicts.
 *
 * Auth: not required for reading (the r2_key itself is a sufficient capability token
 * — unguessable UUID; public pages render avatars without auth).
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: 7-day signed read URL, rotated on access
 */

import type { Route } from "./+types/api.avatar.$key";
import { mockR2 } from "~/lib/mock-r2";

interface WorkerEnv {
  MOCK_R2?: string;
  AVATARS_R2?: R2Bucket;
}

export async function loader({ request, params, context }: Route.LoaderArgs): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};
  const rawKey = params.key;

  if (!rawKey) {
    return new Response("Missing key", { status: 400 });
  }

  // Decode base64url key → actual R2 key
  let r2Key: string;
  try {
    r2Key = atob(rawKey.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return new Response("Invalid key encoding", { status: 400 });
  }

  // Validate key pattern: must start with "avatars/"
  if (!r2Key.startsWith("avatars/")) {
    return new Response("Invalid key", { status: 400 });
  }

  const mockMode = env.MOCK_R2 === "1";

  if (mockMode) {
    const obj = await mockR2.get(r2Key);
    if (!obj) {
      return new Response("Not found", { status: 404 });
    }
    const buf = await obj.arrayBuffer();
    const contentType = obj.httpMetadata?.contentType ?? "application/octet-stream";
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable", // 7 days
      },
    });
  }

  // Production: use real R2 binding
  const r2 = env.AVATARS_R2;
  if (!r2) {
    return new Response("R2 binding missing", { status: 500 });
  }

  const obj = await r2.get(r2Key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  // For production, stream the object directly.
  // In a full implementation, this would create a presigned URL with 7-day TTL
  // and redirect. For MVP, streaming is simpler and sufficient.
  const headers = new Headers();
  const httpMeta = (obj as { httpMetadata?: { contentType?: string } }).httpMetadata;
  headers.set("Content-Type", httpMeta?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=604800, immutable");

  const body = (obj as { body?: ReadableStream }).body;
  return new Response(body ?? null, { status: 200, headers });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Encodes an R2 key as a base64url string for use in the URL param.
 */
export function encodeR2Key(r2Key: string): string {
  return btoa(r2Key).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Builds the preview URL for an r2_key.
 * Used by the onboarding profile step to show the uploaded avatar.
 */
export function buildAvatarPreviewUrl(r2Key: string): string {
  return `/api/avatar/${encodeR2Key(r2Key)}`;
}
