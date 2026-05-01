/**
 * Unit tests for api.auth.login-otp.ts
 * Run: npx vitest run app/routes/api.auth.login-otp.test.ts
 * Story: F-REGISTER-001a — Codex review round-1 fix (F1)
 * Covers: BR-AUTH-05, TR-AUTH-01
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/login-otp", {
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
  const mod = await import("./api.auth.login-otp");
  action = mod.action as typeof action;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Input validation ─────────────────────────────────────────────────────────

describe("api.auth.login-otp — input validation", () => {
  it("returns 405 for non-POST", async () => {
    const req = new Request("http://localhost/api/auth/login-otp", { method: "GET" });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(405);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/login-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad json",
    });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing email", async () => {
    const res = await action({
      request: makeRequest({}),
      context: makeContext(),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await action({
      request: makeRequest({ email: "not-an-email" }),
      context: makeContext(),
    });
    expect(res.status).toBe(400);
  });

  it("does NOT require handle or tos_version (login only)", async () => {
    // Stub mode — only email required. No handle / tos_version.
    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext({}),
    });
    expect(res.status).toBe(200);
  });
});

// ── Stub mode ─────────────────────────────────────────────────────────────────

describe("api.auth.login-otp — stub mode (no env vars)", () => {
  it("returns { sent: true, stub: true } when Supabase env vars missing", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext({}),
    });
    const data = (await res.json()) as { sent: boolean; stub: boolean };
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);
    expect(data.stub).toBe(true);
  });
});

// ── Supabase OTP send (mocked fetch) ─────────────────────────────────────────

describe("api.auth.login-otp — Supabase OTP send", () => {
  const supabaseEnv = {
    SUPABASE_URL: "http://supabase.test",
    SUPABASE_ANON_KEY: "anon_key",
  };

  it("sends OTP with create_user: false (no new account creation)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { sent: boolean };
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);

    // Verify the Supabase call uses create_user: false
    const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(fetchInit.body as string) as Record<string, unknown>;
    expect(body.create_user).toBe(false);
    expect(body.email).toBe("user@example.com");
    // No handle or data payload in login-otp
    expect(body.data).toBeUndefined();
    expect(body.handle).toBeUndefined();
  });

  it("returns 502 when Supabase OTP send fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ msg: "User not found" }), { status: 400 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "unknown@example.com" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(502);
    expect(data.error).toBeTruthy();
  });

  it("trims and lowercases email before sending", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    await action({
      request: makeRequest({ email: "  USER@EXAMPLE.COM  " }),
      context: makeContext(supabaseEnv),
    });

    const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(fetchInit.body as string) as Record<string, unknown>;
    expect(body.email).toBe("user@example.com");
  });
});
