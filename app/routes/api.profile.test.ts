/**
 * Unit tests for POST /api/profile.
 *
 * Story: F-PROFILE-SAVE-001 (tadaify-app#56 follow-up).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action, validateProfileBody, BIO_MAX_LENGTH } from "./api.profile";

const SUPABASE_URL = "http://localhost:44210";
const SERVICE_KEY = "test-service-key";

function makeContext() {
  return { cloudflare: { env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY } } };
}

function makeRequest(opts: { method?: string; cookie?: string; body?: unknown }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers["Cookie"] = opts.cookie;
  return new Request("http://localhost/api/profile", {
    method: opts.method ?? "POST",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const AUTH_COOKIE = `sb-localhost-auth-token=${encodeURIComponent(
  JSON.stringify({ access_token: "valid-token" }),
)}`;

describe("validateProfileBody", () => {
  it("accepts display_name + bio, trims, and nullifies empties", () => {
    expect(validateProfileBody({ display_name: "  Alex  ", bio: "  hi  " })).toEqual({
      ok: true,
      data: { display_name: "Alex", bio: "hi" },
    });
    expect(validateProfileBody({ display_name: "   " })).toEqual({
      ok: true,
      data: { display_name: null },
    });
  });

  it("rejects an over-long bio", () => {
    const r = validateProfileBody({ bio: "x".repeat(BIO_MAX_LENGTH + 1) });
    expect(r.ok).toBe(false);
  });

  it("rejects non-string fields and empty payloads", () => {
    expect(validateProfileBody({ bio: 42 }).ok).toBe(false);
    expect(validateProfileBody({}).ok).toBe(false);
    expect(validateProfileBody(null).ok).toBe(false);
  });
});

describe("api.profile action (mocked fetch)", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("rejects non-POST", async () => {
    const res = (await action({
      request: makeRequest({ method: "GET" }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(405);
  });

  it("401 when no auth cookie", async () => {
    const res = (await action({
      request: makeRequest({ body: { bio: "hi" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("400 on validation failure (before resolving the user)", async () => {
    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: {} }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("PATCHes profiles for the resolved user and returns the row", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-1" }) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "user-1", display_name: "Alex", bio: "hi" }],
      } as Response);

    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: { display_name: "Alex", bio: "hi" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; profile: { display_name: string } };
    expect(json.ok).toBe(true);
    expect(json.profile.display_name).toBe("Alex");

    const [patchUrl, patchInit] = mockFetch.mock.calls[1];
    expect(patchUrl).toContain("/rest/v1/profiles?id=eq.user-1");
    expect(patchInit.method).toBe("PATCH");
    expect(JSON.parse(patchInit.body)).toEqual({ display_name: "Alex", bio: "hi" });
  });

  it("500 when the PATCH fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-1" }) } as Response)
      .mockResolvedValueOnce({ ok: false, text: async () => "db error" } as Response);

    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: { bio: "hi" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(500);
  });
});
