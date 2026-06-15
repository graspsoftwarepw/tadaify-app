/**
 * Unit tests for POST /api/upload/avatar
 *
 * U1 — Worker upload route: validation + key generation (issue tadaify-app#138)
 * Covers: TR-tadaify-003 (backend-proxy upload, magic-byte validation, key pattern, auth)
 * ECN-138-01, ECN-138-02, ECN-138-08, ECN-138-11, ECN-138-13
 *
 * Hermetic: uses vi.fn() mocks for the R2 binding — no real miniflare, no real Supabase.
 * Per feedback_ci_unit_tests_allowed.md: unit tests stay hermetic and run in CI.
 * Playwright (S1–S6 in e2e/onboarding-avatar-upload.spec.ts) covers the full flow
 * against the miniflare-emulated R2 binding in local dev.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, detectImageType } from "./api.upload.avatar";

// ── Fetch mock helpers (hermetic — no real Supabase required) ─────────────────

/**
 * Stub global fetch to simulate Supabase /auth/v1/user returning the given
 * HTTP status and body. Used by auth-path tests.
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

const MOCK_SUPABASE_URL = "http://localhost:44210";
const MOCK_SERVICE_KEY = "test-service-key";
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Creates a fake R2 binding with vi.fn() — hermetic, no miniflare needed.
 * Unit tests assert that `put` is called with the correct key + content-type.
 */
function makeFakeR2(overrides?: { put?: ReturnType<typeof vi.fn> }) {
  return {
    put: overrides?.put ?? vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ objects: [] }),
  };
}

function makeContext(r2Overrides?: { put?: ReturnType<typeof vi.fn> }, envOverrides?: Record<string, string | undefined>) {
  return {
    cloudflare: {
      env: {
        SUPABASE_URL: MOCK_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: MOCK_SERVICE_KEY,
        AVATARS_R2: makeFakeR2(r2Overrides),
        ...envOverrides,
      },
    },
  };
}

function makeContextNoR2(envOverrides?: Record<string, string | undefined>) {
  return {
    cloudflare: {
      env: {
        SUPABASE_URL: MOCK_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: MOCK_SERVICE_KEY,
        AVATARS_R2: undefined,
        ...envOverrides,
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
    // Default: Supabase /auth/v1/user returns the mock user ID
    mockAuthFetch(200, { id: MOCK_USER_ID });
  });

  afterEach(() => {
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
  it("rejects 401 on missing auth (no Authorization header, no cookie)", async () => {
    mockAuthFetch(401, { message: "Missing token" });
    const req = await makeMultipartRequest(JPG_BYTES, {}); // no bearer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("rejects 401 on invalid JWT (Supabase returns 401)", async () => {
    mockAuthFetch(401, { message: "Invalid JWT" });
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "invalid-jwt-token" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("accepts auth from Supabase session cookie (server-side parsing)", async () => {
    // Stub fetch to return user ID when parsing a valid bearer from cookie
    mockAuthFetch(200, { id: MOCK_USER_ID });
    const cookieValue = encodeURIComponent(JSON.stringify({ access_token: "valid-jwt-from-cookie" }));
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
  it("rejects 413 on Content-Length clearly exceeding max + multipart overhead", async () => {
    const bearerToken = "valid-jwt";
    // 2MB + 4096 overhead + 1 byte — exceeds even the overhead margin
    const req = await makeMultipartRequest(JPG_BYTES, {
      bearer: bearerToken,
      contentLength: 2 * 1024 * 1024 + 4096 + 1,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(413);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("file_too_large");
  });

  it("does NOT reject 413 on Content-Length at MAX_SIZE + realistic multipart overhead", async () => {
    // A file of exactly 2MB in a multipart request has Content-Length > 2MB
    // due to boundary/header overhead. The pre-check must allow this through
    // to the authoritative post-read file-size check.
    const req = await makeMultipartRequest(JPG_BYTES, {
      bearer: "valid-jwt",
      contentLength: 2 * 1024 * 1024 + 500, // within the 4096 overhead margin
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    // Should NOT be 413 — the pre-check allows it through
    expect(res.status).not.toBe(413);
  });

  // ── Magic-byte checks (ECN-138-02, ECN-138-08) ─────────────────────────────
  it("rejects 415 on magic-byte mismatch (PDF disguised as JPG)", async () => {
    const req = await makeMultipartRequest(PDF_AS_JPG, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(415);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("unsupported_type");
  });

  // ── Happy paths: accepts image types ────────────────────────────────────────
  it("accepts JPG via magic bytes — returns 200 + r2_key", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toBeTruthy();
    expect(body.r2_key).toMatch(/^avatars\/.+\/.+\.jpg$/);
  });

  it("accepts PNG via magic bytes — returns 200", async () => {
    const req = await makeMultipartRequest(PNG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toMatch(/\.png$/);
  });

  it("accepts WebP via magic bytes (RIFF...WEBP) — returns 200", async () => {
    const req = await makeMultipartRequest(WEBP_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    expect(res.status).toBe(200);
    const body = await res.json() as { r2_key: string };
    expect(body.r2_key).toMatch(/\.webp$/);
  });

  // ── Key pattern (TR-tadaify-003) ─────────────────────────────────────────────
  it("key pattern matches avatars/<userId>/<uuid>.<ext>", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext() } as any)) as Response;
    const body = await res.json() as { r2_key: string };
    // pattern: avatars/<userId>/<uuid>.<ext>
    const regex = new RegExp(`^avatars/${MOCK_USER_ID}/[0-9a-f-]{36}\\.jpg$`);
    expect(body.r2_key).toMatch(regex);
  });

  // ── R2 put called with correct args ────────────────────────────────────────
  it("calls r2.put with correct key and content-type header", async () => {
    const fakePut = vi.fn().mockResolvedValue({});
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext({ put: fakePut }) } as any)) as Response;
    expect(res.status).toBe(200);
    expect(fakePut).toHaveBeenCalledTimes(1);
    const [calledKey, , calledOpts] = fakePut.mock.calls[0];
    expect(calledKey).toMatch(/^avatars\//);
    expect(calledOpts?.httpMetadata?.contentType).toBe("image/jpeg");
  });

  // ── Feature flag (ECN-138-13) ─────────────────────────────────────────────────
  it("returns 503 when AVATAR_UPLOADS_ENABLED=false (prod gating)", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    const ctx = makeContext(undefined, { AVATAR_UPLOADS_ENABLED: "false" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(503);
  });

  // ── Missing env (ECN-138-11) ─────────────────────────────────────────────────
  it("returns 500 when Workers env binding missing (no SUPABASE_URL)", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    const ctx = { cloudflare: { env: {} } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(500);
  });

  it("returns 500 with r2_binding_missing when AVATARS_R2 not set", async () => {
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    const ctx = makeContextNoR2();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("r2_binding_missing");
  });

  // ── R2 PUT failure → 502 ──────────────────────────────────────────────────────
  it("returns 502 when R2 put throws (upload_failed)", async () => {
    const fakePut = vi.fn().mockRejectedValue(new Error("simulated R2 error"));
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: makeContext({ put: fakePut }) } as any)) as Response;
    expect(res.status).toBe(502);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("upload_failed");
  });

  // ── Logging (TR-tadaify-003: audit log) ──────────────────────────────────────
  it("logs request for audit on successful upload", async () => {
    const logSpy = vi.spyOn(console, "info");
    const req = await makeMultipartRequest(JPG_BYTES, { bearer: "valid-jwt" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await action({ request: req, context: makeContext() } as any);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[api.upload.avatar] uploaded"),
      expect.objectContaining({ userId: MOCK_USER_ID })
    );
    logSpy.mockRestore();
  });
});
