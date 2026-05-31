/**
 * POST /api/upload/block-thumb
 *
 * Backend-proxy upload for a block's custom thumbnail (Link block, #289).
 *
 * Mirrors the avatar pipeline (TR-tadaify-003): the Cloudflare Worker sits
 * between client and R2 and is the authoritative validator.
 *   1. Content-Length pre-check (cheap reject before reading the body).
 *   2. Auth: Bearer JWT or Supabase auth cookie → Supabase user id.
 *   3. Full body read; magic bytes verified server-side (JPG / PNG / WebP).
 *      The client-sent Content-Type is IGNORED.
 *   4. On success: r2_key = `block-thumbs/<userId>/<uuid>.<ext>`, PUT to R2,
 *      return { r2_key }.
 *
 * Storage: reuses the existing AVATARS_R2 bucket under a distinct
 * `block-thumbs/` prefix — no new bucket provisioning needed. Local dev gets a
 * miniflare-backed binding from @cloudflare/vite-plugin automatically.
 *
 * Story: F-BLOCK-LINK-COMPLETE-001 (#289).
 */

import type { Route } from "./+types/api.upload.block-thumb";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";
import { detectImageType } from "./api.upload.avatar";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (matches the form copy)
const MULTIPART_OVERHEAD_BYTES = 4096;

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  AVATARS_R2?: R2Bucket;
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function action({ request, context }: Route.ActionArgs): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // ── Content-Length pre-check ───────────────────────────────────────────────
  const contentLengthHeader = request.headers.get("Content-Length");
  if (contentLengthHeader !== null) {
    const declared = parseInt(contentLengthHeader, 10);
    if (!isNaN(declared) && declared > MAX_SIZE_BYTES + MULTIPART_OVERHEAD_BYTES) {
      return Response.json(
        { error: "file_too_large", message: "File too large (max 5 MB)" },
        { status: 413 }
      );
    }
  }

  const r2 = env.AVATARS_R2;
  if (!r2) {
    console.error("[api.upload.block-thumb] R2 binding missing");
    return Response.json({ error: "r2_binding_missing" }, { status: 500 });
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const accessToken = extractAccessToken(request);
  const userId = accessToken
    ? await resolveUserId(accessToken, supabaseUrl, serviceKey)
    : null;
  if (!userId) {
    return Response.json({ error: "Missing or invalid authorization" }, { status: 401 });
  }

  // ── Multipart body parsing ─────────────────────────────────────────────────
  let fileBytes: Uint8Array;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return Response.json({ error: "Missing file field in multipart body" }, { status: 400 });
    }
    const arrayBuf = await (file as File).arrayBuffer();
    fileBytes = new Uint8Array(arrayBuf);
  } catch {
    return Response.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  // ── Post-read size + magic-byte checks (authoritative) ─────────────────────
  if (fileBytes.length > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "file_too_large", message: "File too large (max 5 MB)" },
      { status: 413 }
    );
  }

  const detected = detectImageType(fileBytes);
  if (!detected) {
    return Response.json(
      { error: "unsupported_type", message: "Only JPG / PNG / WebP allowed" },
      { status: 415 }
    );
  }

  // ── R2 PUT ─────────────────────────────────────────────────────────────────
  const r2Key = `block-thumbs/${userId}/${generateUuid()}.${detected.ext}`;
  try {
    await r2.put(r2Key, fileBytes, { httpMetadata: { contentType: detected.contentType } });
  } catch (err) {
    console.error("[api.upload.block-thumb] R2 PUT failed:", err);
    return Response.json({ error: "upload_failed", message: "Upload failed — please retry" }, { status: 502 });
  }

  return Response.json({ r2_key: r2Key }, { status: 200 });
}
