/**
 * Unit tests for POST /api/account/dismiss-welcome.
 *
 * Covers: F-APP-DASHBOARD-001a (#171) — AC#11 / ECN-26a-06.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.account.dismiss-welcome";

const SUPABASE_URL = "http://localhost:54351";
const SERVICE_KEY = "test-service-key";

function makeContext() {
  return {
    cloudflare: {
      env: {
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
      },
    },
  };
}

function makeRequest(opts: {
  method?: string;
  cookie?: string;
  bearer?: string;
}): Request {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers["Cookie"] = opts.cookie;
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request("http://localhost/api/account/dismiss-welcome", {
    method: opts.method ?? "POST",
    headers,
  });
}

describe("api.account.dismiss-welcome — auth + persistence (mocked fetch)", () => {
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
    const ctx = makeContext();
    const req = makeRequest({ method: "GET" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(405);
  });

  it("returns 500 when Workers env binding missing", async () => {
    const req = makeRequest({ bearer: "tok" });
    const res = (await action({
      request: req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: { cloudflare: { env: {} } } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(500);
  });

  it("returns 401 when no auth cookie or bearer token", async () => {
    const ctx = makeContext();
    const req = makeRequest({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("returns 401 when access_token is rejected by Supabase /auth/v1/user", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 })
    );
    const ctx = makeContext();
    const req = makeRequest({ bearer: "bad-token" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("upserts welcome_dismissed=true on happy path with cookie auth", async () => {
    // 1) /auth/v1/user → ok, returns user.id
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "user-uuid-1" }), { status: 200 })
    );
    // 2) POST /rest/v1/account_settings → ok
    mockFetch.mockResolvedValueOnce(new Response("", { status: 201 }));

    const cookieJson = encodeURIComponent(
      JSON.stringify({ access_token: "tok123" })
    );
    const ctx = makeContext();
    const req = makeRequest({ cookie: `sb-local-auth-token=${cookieJson}` });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);

    // The upsert call should send id + welcome_dismissed=true
    const upsertCall = mockFetch.mock.calls[1];
    expect(upsertCall[0]).toBe(`${SUPABASE_URL}/rest/v1/account_settings`);
    const upsertBody = JSON.parse(upsertCall[1].body as string);
    expect(upsertBody.id).toBe("user-uuid-1");
    expect(upsertBody.welcome_dismissed).toBe(true);
    expect(upsertCall[1].headers.Prefer).toContain("resolution=merge-duplicates");
  });

  it("returns 500 when account_settings upsert fails", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "user-uuid-1" }), { status: 200 })
    );
    mockFetch.mockResolvedValueOnce(
      new Response("conflict", { status: 409 })
    );

    const ctx = makeContext();
    const req = makeRequest({ bearer: "tok123" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await action({ request: req, context: ctx } as any)) as Response;
    expect(res.status).toBe(500);
  });
});
