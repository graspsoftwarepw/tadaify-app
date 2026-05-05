/**
 * Unit tests for POST /api/upload/avatar
 *
 * U1 — Worker upload route: validation + key generation (issue tadaify-app#138)
 * Covers: TR-tadaify-003 (backend-proxy upload, magic-byte validation, key pattern, auth)
 * ECN-138-01, ECN-138-02, ECN-138-08, ECN-138-11, ECN-138-13
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, detectImageType } from "./api.upload.avatar";
import { mockR2 } from "~/lib/mock-r2";

// ── Fetch mock helpers (hermetic — no real Supabase required) ─────────────────

/**
 * Stub global fetch to simulate Supabase /auth/v1/user returning the given
 * HTTP status. Used by tests that exercise the JWT-verification path without
 * MOCK_R2 mode (i.e. tokens that don't start with "mock-user-").
 */
function mockAuthFetch(status: number, body: unknown = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    )
  );
}

// ── Test fixtures: minimal valid magic bytes ───────────────────────────────────

// JPG: FF D8 FF + padding
const JPG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
// PNG: 89 50 4E 47 0D 0A 1A 0A + padding
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
// WebP: RIFF + 4-byte size + WEBP
const WEBP_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x24, 0x00, 0x00, 0x00, // size
  0x57, 0x45, 0x42, 0x50, // WEBP
]);
// PDF disguised as JPG: starts with %PDF
const PDF_AS_JPG = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x00, 0x00, 0x00, 0x00]);

// ── detectImageType tests (pure function) ──────────────────────────────────────

describe("detectImageType — U1 (pure function)", () => {
  it("detects JPG via magic bytes (FF D8 FF)", () => {
    const result = detectImageType(JPG_BYTES);
    expect(result).not.toBeNull();
    expect(result?.ext).toBe("jpg");
    expect(result?.contentType).toBe("image/jpeg");
  });

  it("detects PNG via magic bytes (89 50 4E 47 0D 0A 1A 0A)", () => {
    const result = detectImageType(PNG_BYTES);
    expect(result).not.toBeNull();
    expect(result?.ext).toBe("png");
    expect(result?.contentType).toBe("image/png");
  });

  it("detects WebP via magic bytes (RIFF...WEBP)", () => {
    const result = detectImageType(WEBP_BYTES);
    expect(result).not.toBeNull();
    expect(result?.ext).toBe("webp");
    expect(result?.contentType).toBe("image/webp");
  });

  it("rejects PDF disguised as JPG — magic-byte mismatch", () => {
    const result = detectImageType(PDF_AS_JPG);
    expect(result).toBeNull();
  });

  it("returns null for empty bytes", () => {
    expect(detectImageType(new Uint8Array([]))).toBeNull();
  });

  it("returns null for bytes shorter than 12 (too short to classify)", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

// ── action handler tests ───────────────────────────────────────────────────────

const MOCK_SUPABASE_URL = "http://localhost:54351";
const MOCK_SERVICE_KEY = "test-service-key";
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_TOKEN = `mock-user-${MOCK_USER_ID}`;

function makeContext(overrides?: Record<string, string | undefined>) {
  return {
    cloudflare: {
      env: {
        SUPABASE_URL: MOCK_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: MOCK_SERVICE_KEY,
        MOCK_R2: "1",
        ...overrides,
      },
    },
  };
}

async function makeMultipartRequest(
  bytes: Uint8Array,
  opts: { bearer?: string; contentLength?: number } = {}
): Promise<Request> {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const formData = new FormData();
  formData.append("file", blob, "test.jpg");

  const headers: Record<string, string> = {};
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  if (opts.contentLength !== undefined) {
    headers["Content-Length"] = String(opts.contentLength);
  }

  return new Request("http://localhost/api/upload/avatar", {
    method: "POST",
    headers,
    body: formData,
  });
}

describe("POST /api/upload/avatar — action handler — U1", () => {
  beforeEach(() => {
    mockR2.clear();
  });

  afterEach(() => {
    mockR2.clear();
    vi.restoreAllMocks();
  });

  // ── Method check ────────────────────────────────────────────────────────────
  it("rejects non-POST with 405", async () => {
    const req = new Request("http://localhost/api/upload/avatar", { method: "GET" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(405);
  });

  // ── Auth checks ─────────────────────────────────────────────────────────────
  it("rejects 401 on missing auth in MOCK_R2 mode (no anonymous fallback)", async () => {
    // MOCK_R2 mode: no Authorization header and no cookie → 401 (TR-tadaify-003 requires auth)
    const req = await makeMultipartRequest(JPG_BYTES, {}); // no bearer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("rejects 401 on missing auth when MOCK_R2 is NOT set", async () => {
    // Non-MOCK_R2 mode: no Authorization header and no cookie → 401
    // Provide a fake AVATARS_R2 binding so the R2 check passes (we're testing auth, not R2)
    const req = await makeMultipartRequest(JPG_BYTES, {});
    const ctx = makeContext({ MOCK_R2: undefined, AVATARS_R2: "fake-binding" as unknown as string });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("rejects 401 on invalid JWT (non-mock-user format with MOCK_R2)", async () => {
    // Malformed token — doesn't match "mock-user-<id>", so code falls through to
    // verifyJwt(). Stub fetch to simulate Supabase returning 401 (no real network).
    mockAuthFetch(401, { message: "Invalid JWT" });
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "invalid-jwt-token" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("accepts auth from Supabase session cookie (server-side parsing)", async () => {
    // Simulate a Supabase auth cookie containing a mock-user-* access token.
    // Server parses Cookie header when Authorization is absent.
    const cookieValue = encodeURIComponent(JSON.stringify({ access_token: MOCK_TOKEN }));
    const req = new Request("http://localhost/api/upload/avatar", {
      method: "POST",
      headers: {
        Cookie: `sb-test-auth-token=${cookieValue}`,
      },
      body: (() => {
        const fd = new FormData();
        fd.append("file", new Blob([JPG_BYTES], { type: "application/octet-stream" }), "test.jpg");
        return fd;
      })(),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toMatch(/^avatars\//);
  });

  // ── Content-Length pre-check (ECN-138-01) ────────────────────────────────────
  it("rejects 413 on Content-Length > 2MB before reading body", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, {
      bearer: MOCK_TOKEN,
      contentLength: 2 * 1024 * 1024 + 1, // 2MB + 1 byte
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(413);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("file_too_large");
  });

  // ── Magic-byte checks (ECN-138-02, ECN-138-08) ─────────────────────────────
  it("rejects 415 on magic-byte mismatch (PDF disguised as JPG)", async () => {
    const req = await makeMultipartRequest(PDF_AS_JPG, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(415);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("unsupported_type");
  });

  // ── Happy paths: accepts image types ────────────────────────────────────────
  it("accepts JPG via magic bytes — returns 200 + r2_key", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toBeTruthy();
    expect(body.r2_key).toMatch(/^avatars\/.+\/.+\.jpg$/);
  });

  it("accepts PNG via magic bytes — returns 200", async () => {
    const req = await makeMultipartRequest(PNG_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toMatch(/\.png$/);
  });

  it("accepts WebP via magic bytes (RIFF...WEBP) — returns 200", async () => {
    const req = await makeMultipartRequest(WEBP_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toMatch(/\.webp$/);
  });

  // ── Key pattern (TR-tadaify-003) ─────────────────────────────────────────────
  it("key pattern matches avatars/<userId>/<uuid>.<ext>", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    const body = await res.json() as { r2_key: string };
    // pattern: avatars/<userId>/<uuid>.<ext>
    const regex = new RegExp(`^avatars/${MOCK_USER_ID}/[0-9a-f-]{36}\\.jpg$`);
    expect(body.r2_key).toMatch(regex);
  });

  // ── Feature flag (ECN-138-13) ─────────────────────────────────────────────────
  it("returns 503 when AVATAR_UPLOADS_ENABLED=false (prod gating)", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    const ctx = makeContext({ AVATAR_UPLOADS_ENABLED: "false" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(503);
  });

  // ── Missing env (ECN-138-11) ─────────────────────────────────────────────────
  it("returns 500 when Workers env binding missing", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    const ctx = { cloudflare: { env: {} } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(500);
  });

  it("returns 500 with R2 binding missing message when MOCK_R2 not set and no real binding", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    const ctx = makeContext({ MOCK_R2: undefined });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("r2_binding_missing");
  });

  // ── MOCK_R2 stores object ─────────────────────────────────────────────────────
  it("stores uploaded file in MOCK_R2 store", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(mockR2.has(body.r2_key)).toBe(true);
  });

  // ── Logging (TR-tadaify-003: audit log) ──────────────────────────────────────
  it("logs request for audit on successful upload", async () => {
    const logSpy = vi.spyOn(console, "info");
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: MOCK_TOKEN });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await action({ request: req, context: makeContext() } as any);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[api.upload.avatar] uploaded"),
      expect.objectContaining({ userId: MOCK_USER_ID })
    );
    logSpy.mockRestore();
  });
});
