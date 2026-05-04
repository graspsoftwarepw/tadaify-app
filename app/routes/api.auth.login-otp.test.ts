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

  it("returns 502 + 'server_error' on unexpected Supabase failure", async () => {
    // A genuinely unexpected upstream error (e.g. Supabase 500 / unrelated 4xx)
    // → mapped to generic server_error so we don't leak internal text. issue tadaify-app#176.
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ msg: "Internal error" }), { status: 500 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(502);
    expect(data.error).toBe("server_error");
  });

  it("returns 200 + sent:true on existing user happy path", async () => {
    // Supabase 200 → Resend OTP delivered → JSON contract { sent: true }. issue tadaify-app#176.
    const mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "existing@example.com" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { sent: boolean };
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);
  });

  it("returns 400 + error code 'no_account' when Supabase responds with `Signups not allowed for otp`", async () => {
    // The canonical Supabase phrase for "this email is not registered when create_user=false".
    // Our handler maps it to a stable client contract: { error: "no_account" }. issue tadaify-app#176.
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ msg: "Signups not allowed for otp" }),
        { status: 400 }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "noaccount@example.com" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBe("no_account");
  });

  it("returns 400 + 'invalid_email' on malformed email", async () => {
    // Note: validation runs before Supabase fetch; the contract here is that the
    // 400 response carries an error string the client can branch on. issue tadaify-app#176.
    // The client's login.tsx falls through to the generic-error branch for this code.
    const res = await action({
      request: makeRequest({ email: "not-an-email" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBe("invalid_email");
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

// ── Rate-limit (BR-OTP-RATE-LIMIT-001 / DEC-342) — U3 ───────────────────────

describe("api.auth.login-otp — rate-limit (BR-OTP-RATE-LIMIT-001)", () => {
  const supabaseEnvWithSR = {
    SUPABASE_URL: "http://supabase.test",
    SUPABASE_ANON_KEY: "anon_key",
    SUPABASE_SERVICE_ROLE_KEY: "service_role_key",
  };

  it("returns 429 with retry_after_seconds when rate-limit denies", async () => {
    // First fetch call = rate-limit check (GET) → returns 3 rows = denied
    // Second fetch call would be OTP send — should NOT happen
    const mockFetch = vi
      .fn()
      // rate-limit GET — returns 3 'sent' rows → denied
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { attempted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
            { attempted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
            { attempted_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() },
          ]),
          { status: 200 }
        )
      )
      // audit INSERT for rate_limited outcome
      .mockResolvedValueOnce(new Response("", { status: 201 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "blocked@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    const data = (await res.json()) as { error: string; retry_after_seconds: number };
    expect(res.status).toBe(429);
    expect(data.error).toBe("rate_limited");
    expect(typeof data.retry_after_seconds).toBe("number");
    expect(data.retry_after_seconds).toBeGreaterThan(0);
  });

  it("records 'sent' row on successful Supabase send", async () => {
    const mockFetch = vi
      .fn()
      // rate-limit GET → 0 rows = allowed
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      // OTP send → 200
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      // audit INSERT for 'sent'
      .mockResolvedValueOnce(new Response("", { status: 201 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    expect(res.status).toBe(200);

    // Allow fire-and-forget INSERT to settle
    await new Promise((r) => setTimeout(r, 10));

    // The 3rd fetch call is the audit INSERT
    const postCalls = (mockFetch.mock.calls as Array<[string, RequestInit]>).filter(
      ([url, init]) =>
        url.includes("otp_rate_limit_attempts") && init?.method === "POST"
    );
    expect(postCalls.length).toBeGreaterThan(0);
    const body = JSON.parse(postCalls[0][1].body as string) as Record<string, unknown>;
    expect(body.outcome).toBe("sent");
  });

  it("records 'rate_limited' row when denied (audit trail for abuse review)", async () => {
    const mockFetch = vi
      .fn()
      // rate-limit GET → 3 rows = denied
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { attempted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
            { attempted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
            { attempted_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() },
          ]),
          { status: 200 }
        )
      )
      // audit INSERT for 'rate_limited'
      .mockResolvedValueOnce(new Response("", { status: 201 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "blocked@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    expect(res.status).toBe(429);

    // Allow fire-and-forget
    await new Promise((r) => setTimeout(r, 10));
    // At minimum, an insert POST was made
    const postCalls = mockFetch.mock.calls.filter(
      (call: unknown[]) =>
        String(call[0]).includes("otp_rate_limit_attempts") &&
        (call[1] as RequestInit | undefined)?.method === "POST"
    );
    expect(postCalls.length).toBeGreaterThan(0);
    const body = JSON.parse((postCalls[0][1] as RequestInit).body as string) as Record<string, unknown>;
    expect(body.outcome).toBe("rate_limited");
  });
});
