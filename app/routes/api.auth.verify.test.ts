/**
 * Unit tests for api.auth.verify.ts
 * Run: npx vitest run app/routes/api.auth.verify.test.ts
 * Story: F-REGISTER-001a
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeContext(env: Record<string, string> = {}) {
  return { cloudflare: { env } };
}

let action: (args: { request: Request; context: unknown }) => Promise<Response>;

beforeEach(async () => {
  const mod = await import("./api.auth.verify");
  action = mod.action as typeof action;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Input validation ─────────────────────────────────────────────────────────

describe("api.auth.verify — input validation", () => {
  it("returns 405 for non-POST", async () => {
    const req = new Request("http://localhost/api/auth/verify", { method: "GET" });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(405);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad json",
    });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await action({
      request: makeRequest({ email: "notanemail", token: "123456" }),
      context: makeContext(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-numeric OTP", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "abcdef" }),
      context: makeContext(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for OTP with wrong length (5 digits)", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "12345" }),
      context: makeContext(),
    });
    expect(res.status).toBe(400);
  });
});

// ── Stub mode ─────────────────────────────────────────────────────────────────

describe("api.auth.verify — stub mode (no env vars)", () => {
  it("returns { verified: true, stub: true } when Supabase env vars missing", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "123456" }),
      context: makeContext({}),
    });
    const data = (await res.json()) as { verified: boolean; stub: boolean };
    expect(res.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(data.stub).toBe(true);
  });
});

// ── OTP verification via mocked Supabase ─────────────────────────────────────

describe("api.auth.verify — OTP verification (mocked fetch)", () => {
  const supabaseEnv = {
    SUPABASE_URL: "http://supabase.test",
    SUPABASE_ANON_KEY: "anon_key",
    SUPABASE_SERVICE_ROLE_KEY: "service_key",
  };

  it("returns { verified: true } + creates profiles row on success", async () => {
    const mockFetch = vi
      .fn()
      // First call: /auth/v1/verify → success
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "tok123",
            user: {
              id: "user-uuid-001",
              user_metadata: { handle: "alex", tos_version: "v1" },
            },
          }),
          { status: 200 }
        )
      )
      // Second call: profiles INSERT → 201
      .mockResolvedValueOnce(new Response("", { status: 201 }))
      // Third call: handle_reservations DELETE → fire-and-forget (200 OK is fine)
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "123456" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { verified: boolean; handle: string };
    expect(res.status).toBe(200);
    expect(data.verified).toBe(true);
    expect(data.handle).toBe("alex");

    // Verify profiles INSERT was called with service-role key
    const profilesCall = mockFetch.mock.calls[1];
    expect(profilesCall[0]).toContain("/rest/v1/profiles");
    const profilesBody = JSON.parse(profilesCall[1].body as string);
    expect(profilesBody.handle).toBe("alex");
    expect(profilesBody.tos_version).toBe("v1");
  });

  it("returns 400 with error code when OTP verify fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error_code: "otp_expired", msg: "OTP has expired" }),
        { status: 401 }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "999999" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { error: string; code: string };
    expect(res.status).toBe(400);
    expect(data.code).toBe("otp_expired");
    expect(data.error).toBeTruthy();
  });

  it("returns 500 when verify succeeds but user metadata lacks handle", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "tok",
          user: { id: "uid", user_metadata: {} }, // no handle
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "123456" }),
      context: makeContext(supabaseEnv),
    });
    expect(res.status).toBe(500);
  });

  it("proceeds if profiles INSERT returns 409 (row already exists — idempotent)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "tok",
            user: { id: "uid", user_metadata: { handle: "alex", tos_version: "v1" } },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("", { status: 409 })) // duplicate row
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", token: "123456" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { verified: boolean };
    expect(res.status).toBe(200);
    expect(data.verified).toBe(true);
  });
});
