/**
 * GET /api/block-thumb/:key
 *
 * Serves a block thumbnail's bytes from R2 (the AVATARS_R2 bucket, under the
 * `block-thumbs/` prefix). The `key` param is the base64url-encoded r2_key.
 *
 * Auth: not required for reading — the r2_key is an unguessable capability
 * token, and public pages render block thumbnails without auth.
 *
 * Story: F-BLOCK-LINK-COMPLETE-001 (#289).
 */

import type { Route } from "./+types/api.block-thumb.$key";

interface WorkerEnv {
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

  let r2Key: string;
  try {
    r2Key = atob(rawKey.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return new Response("Invalid key encoding", { status: 400 });
  }

  if (!r2Key.startsWith("block-thumbs/")) {
    return new Response("Invalid key", { status: 400 });
  }

  const r2 = env.AVATARS_R2;
  if (!r2) {
    return new Response("R2 binding missing", { status: 500 });
  }

  const obj = await r2.get(r2Key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  const httpMeta = (obj as { httpMetadata?: { contentType?: string } }).httpMetadata;
  headers.set("Content-Type", httpMeta?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=604800, immutable");

  const body = (obj as { body?: ReadableStream }).body;
  return new Response(body ?? null, { status: 200, headers });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Encodes an R2 key as a base64url string for use in the URL param. */
export function encodeR2Key(r2Key: string): string {
  return btoa(r2Key).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Builds the read URL for a stored block-thumbnail r2_key. Used by the editor
 * form preview and the public Link renderer. A non-`block-thumbs/` value (e.g.
 * a legacy absolute URL) is returned unchanged so it still renders.
 */
export function buildBlockThumbUrl(thumb: string): string {
  if (!thumb) return thumb;
  if (!thumb.startsWith("block-thumbs/")) return thumb;
  return `/api/block-thumb/${encodeR2Key(thumb)}`;
}
