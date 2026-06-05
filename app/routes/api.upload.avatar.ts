/**
 * @module SHARED
 * @covers TR-tadaify-003
 * POST /api/upload/avatar
 *
 * Backend-proxy avatar upload pipeline (TR-tadaify-003).
 *
 * Security model: Cloudflare Worker sits between client and R2.
 *   1. Content-Length header checked before reading body (reject 413 if > 2MB).
 *   2. Full body read; magic bytes verified server-side (JPG / PNG / WebP).
 *      Client-sent Content-Type is IGNORED as the authoritative check.
 *   3. Auth: Bearer JWT in Authorization header (Supabase JWT verified via /auth/v1/user).
 *   4. On success: generates `r2_key = avatars/<userId>/<uuid>.<ext>`, PUT to R2, return { r2_key }.
 *
 * Local dev: @cloudflare/vite-plugin auto-emulates AVATARS_R2 via miniflare
 * (filesystem-backed). No MOCK_R2 env var needed — the binding is always present.
 *
 * Env:
 *   SUPABASE_URL              — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key for JWT verification
 *   AVATAR_UPLOADS_ENABLED    — if "false", return 503 (runtime safety toggle via Cloudflare env var)
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: backend-proxy upload model, magic-byte validation, key pattern
 *
 * Unit tests: app/routes/api.upload.avatar.test.ts (U1)
 */

import type { Route } from "./+types/api.upload.avatar";

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
// Multipart requests include boundary/header overhead beyond the file bytes.
// Allow a bounded margin on the Content-Length pre-check so valid files near
// MAX_SIZE_BYTES are not falsely rejected. The authoritative file-size check
// runs after parsing the multipart body (post-read).
const MULTIPART_OVERHEAD_BYTES = 4096;

// Magic bytes for supported image types
// JPG: FF D8 FF
const JPG_MAGIC = [0xff, 0xd8, 0xff];
// PNG: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
// WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
const WEBP_PREFIX = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_SUFFIX = [0x57, 0x45, 0x42, 0x50]; // "WEBP" (at bytes 8–11)

// ── Types ────────────────────────────────────────────────────────────────────

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  AVATAR_UPLOADS_ENABLED?: string;
  /** Cloudflare R2 binding — provided by wrangler / miniflare in local dev via vite-plugin. */
  AVATARS_R2?: R2Bucket;
}

interface DetectedType {
  ext: string;
  contentType: string;
}

// ── Magic-byte detection ──────────────────────────────────────────────────────

/**
 * Detects image type from the first bytes of the file.
 * Returns null if the bytes do not match JPG, PNG, or WebP signatures.
 * Client-sent Content-Type is NOT used — only raw bytes are authoritative.
 */
export function detectImageType(bytes: Uint8Array): DetectedType | null {
  if (bytes.length < 12) return null;

  // JPG: FF D8 FF
  if (
    bytes[0] === JPG_MAGIC[0] &&
    bytes[1] === JPG_MAGIC[1] &&
    bytes[2] === JPG_MAGIC[2]
  ) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (PNG_MAGIC.every((b, i) => bytes[i] === b)) {
    return { ext: "png", contentType: "image/png" };
  }

  // WebP: RIFF at 0–3 + WEBP at 8–11
  if (
    WEBP_PREFIX.every((b, i) => bytes[i] === b) &&
    WEBP_SUFFIX.every((b, i) => bytes[8 + i] === b)
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }

  return null;
}

// ── UUID generation ────────────────────────────────────────────────────────────

function generateUuid(): string {
  // crypto.randomUUID() is available in both Cloudflare Workers and Node 19+.
  // Vitest test environment (Node) also has it from 19+.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older Node (unlikely in practice)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Auth helper ──────────────────────────────────────────────────────────────

async function verifyJwt(
  accessToken: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function action({ request, context }: Route.ActionArgs): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};

  // Feature flag: AVATAR_UPLOADS_ENABLED defaults true if unset (dev + test work out of the box).
  // In prod, set AVATAR_UPLOADS_ENABLED=false in Cloudflare Worker env vars as a runtime safety toggle.
  if (env.AVATAR_UPLOADS_ENABLED === "false") {
    return Response.json(
      { error: "avatar_uploads_disabled", message: "Avatar upload coming soon — skip for now" },
      { status: 503 }
    );
  }

  // Env check
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // ── Content-Length pre-check (cheap reject before reading body or hitting Supabase auth) ──

  const contentLengthHeader = request.headers.get("Content-Length");
  if (contentLengthHeader !== null) {
    const declared = parseInt(contentLengthHeader, 10);
    // Pre-check uses MAX_SIZE_BYTES + overhead margin because Content-Length
    // reflects the full multipart body (boundaries + headers + file bytes).
    // The authoritative exact-file-size check runs post-read on fileBytes.length.
    if (!isNaN(declared) && declared > MAX_SIZE_BYTES + MULTIPART_OVERHEAD_BYTES) {
      return Response.json(
        { error: "file_too_large", message: "File too large (max 2 MB)" },
        { status: 413 }
      );
    }
  }

  // R2 binding check — provided by wrangler (miniflare in local dev, real binding in prod)
  const r2 = env.AVATARS_R2;
  if (!r2) {
    console.error("[api.upload.avatar] R2 binding missing — check wrangler.jsonc r2_buckets declaration");
    return Response.json(
      { error: "r2_binding_missing", message: "R2 binding missing — check wrangler.jsonc r2_buckets declaration" },
      { status: 500 }
    );
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  // Primary: Authorization header (API consumers, unit tests).
  // Fallback: Supabase session cookie from same-origin browser request (real users).
  // This keeps auth resolution server-side — client code never parses document.cookie.

  let accessToken = "";
  const authHeader = request.headers.get("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7);
  } else {
    // Fallback: parse Supabase auth cookie (sb-<ref>-auth-token) server-side
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const sbCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("sb-") && c.includes("-auth-token="));
    if (sbCookie) {
      const eqIdx = sbCookie.indexOf("=");
      const val = sbCookie.slice(eqIdx + 1);
      try {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed?.access_token) accessToken = parsed.access_token as string;
      } catch {
        // Cookie value not JSON — ignore
      }
    }
  }

  let userId: string | null = null;
  if (accessToken) {
    userId = await verifyJwt(accessToken, supabaseUrl, serviceKey);
  }

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

  // ── Post-read size check (authoritative) ──────────────────────────────────

  if (fileBytes.length > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "file_too_large", message: "File too large (max 2 MB)" },
      { status: 413 }
    );
  }

  // ── Magic-byte type detection ──────────────────────────────────────────────

  const detected = detectImageType(fileBytes);
  if (!detected) {
    return Response.json(
      { error: "unsupported_type", message: "Only JPG / PNG / WebP allowed" },
      { status: 415 }
    );
  }

  // ── R2 PUT ────────────────────────────────────────────────────────────────

  const r2Key = `avatars/${userId}/${generateUuid()}.${detected.ext}`;

  try {
    await r2.put(r2Key, fileBytes, { httpMetadata: { contentType: detected.contentType } });
  } catch (err) {
    console.error("[api.upload.avatar] R2 PUT failed:", err);
    return Response.json(
      { error: "upload_failed", message: "Upload failed — please retry" },
      { status: 502 }
    );
  }

  console.info("[api.upload.avatar] uploaded", { userId, r2Key, size: fileBytes.length, type: detected.contentType });

  return Response.json({ r2_key: r2Key }, { status: 200 });
}
