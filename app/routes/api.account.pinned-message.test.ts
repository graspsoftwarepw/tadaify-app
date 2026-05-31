/**
 * Unit tests for POST /api/account/pinned-message.
 *
 * Story: F-PINNED-001 (tadaify-app#56 follow-up).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action, validatePinnedBody, PINNED_MESSAGE_MAX_LENGTH } from "./api.account.pinned-message";

const SUPABASE_URL = "http://localhost:54351";
const SERVICE_KEY = "test-service-key";

function makeContext() {
  return { cloudflare: { env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY } } };
}

function makeRequest(opts: { method?: string; cookie?: string; body?: unknown }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers["Cookie"] = opts.cookie;
  return new Request("http://localhost/api/account/pinned-message", {
    method: opts.method ?? "POST",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const AUTH_COOKIE = `sb-localhost-auth-token=${encodeURIComponent(
  JSON.stringify({ access_token: "valid-token" }),
)}`;

describe("validatePinnedBody", () => {
  it("requires a boolean pinned_enabled", () => {
    expect(validatePinnedBody({ pinned_message: "hi" }).ok).toBe(false);
    expect(validatePinnedBody({ pinned_enabled: "yes" }).ok).toBe(false);
  });

  it("trims the message and nullifies empties", () => {
    expect(validatePinnedBody({ pinned_enabled: true, pinned_message: "  hi  " })).toEqual({
      ok: true,
      data: { pinned_enabled: true, pinned_message: "hi" },
    });
    expect(validatePinnedBody({ pinned_enabled: false, pinned_message: "   " })).toEqual({
      ok: true,
      data: { pinned_enabled: false, pinned_message: null },
    });
    expect(validatePinnedBody({ pinned_enabled: true })).toEqual({
      ok: true,
      data: { pinned_enabled: true, pinned_message: null },
    });
  });

  it("rejects an over-long message", () => {
    expect(
      validatePinnedBody({ pinned_enabled: true, pinned_message: "x".repeat(PINNED_MESSAGE_MAX_LENGTH + 1) }).ok,
    ).toBe(false);
  });
});

describe("api.account.pinned-message action (mocked fetch)", () => {
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

  it("401 without auth", async () => {
    const res = (await action({
      request: makeRequest({ body: { pinned_enabled: true } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("400 on validation failure before resolving the user", async () => {
    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: { pinned_message: "hi" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("upserts account_settings for the resolved user", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-1" }) } as Response)
      .mockResolvedValueOnce({ ok: true, text: async () => "" } as Response);

    const res = (await action({
      request: makeRequest({
        cookie: AUTH_COOKIE,
        body: { pinned_enabled: true, pinned_message: "New drop Friday" },
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const [upsertUrl, init] = mockFetch.mock.calls[1];
    expect(upsertUrl).toContain("/rest/v1/account_settings");
    expect(init.method).toBe("POST");
    expect(init.headers.Prefer).toContain("merge-duplicates");
    expect(JSON.parse(init.body)).toEqual({
      id: "user-1",
      pinned_enabled: true,
      pinned_message: "New drop Friday",
    });
  });

  it("500 when the upsert fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-1" }) } as Response)
      .mockResolvedValueOnce({ ok: false, text: async () => "db error" } as Response);

    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: { pinned_enabled: false } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(500);
  });
});
