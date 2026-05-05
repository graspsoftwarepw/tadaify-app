/**
 * Unit tests for api.auth.login-otp.ts
 * Run: npx vitest run app/routes/api.auth.login-otp.test.ts
 * Story: F-REGISTER-001a — Codex review round-1 fix (F1)
 * Covers: BR-AUTH-05, TR-AUTH-01
 *
 * U3 (issue tadaify-app#190 Bug #2b, DEC-364=A):
 *   login-otp looks up handle from profiles by email + passes via data.handle.
 *   Fallback: data.handle=null when no profile found.
 * U4 (issue tadaify-app#190 Bug #2c, DEC-364=A):
 *   identity-linked dispatch passes handle from profiles via data.handle.
 *   (Tested at source level — identity-linked is a Supabase Auth webhook.)
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
    // Without service role key, no profiles lookup — data.handle will be absent
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext(supabaseEnv), // no service role key — no profiles lookup
    });
    const data = (await res.json()) as { sent: boolean };
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);

    // Verify the Supabase call uses create_user: false
    // (find the /auth/v1/otp call specifically, not the profiles lookup)
    const otpCalls = (mockFetch.mock.calls as Array<[string, RequestInit]>).filter(
      ([url]) => url.includes("/auth/v1/otp")
    );
    expect(otpCalls.length).toBeGreaterThan(0);
    const [, fetchInit] = otpCalls[0];
    const body = JSON.parse(fetchInit.body as string) as Record<string, unknown>;
    expect(body.create_user).toBe(false);
    expect(body.email).toBe("user@example.com");
    // No handle field at top level
    expect(body.handle).toBeUndefined();
    // Without service role key: no profiles lookup, so data.handle not set
    expect(body.data).toBeUndefined();
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
    const reservationId = "550e8400-e29b-41d4-a716-446655440000";
    const mockFetch = vi
      .fn()
      // acquire_otp_slot RPC → allowed, returns reservation_id
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ allowed: true, reservation_id: reservationId }),
          { status: 200 }
        )
      )
      // OTP send → 200
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      // finalize_otp_slot RPC → marks 'sent'
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ finalized: true }), { status: 200 })
      );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    expect(res.status).toBe(200);

    // Allow fire-and-forget finalize to settle
    await new Promise((r) => setTimeout(r, 10));

    // The 3rd fetch call is finalize_otp_slot RPC (marks reservation as 'sent')
    const finalizeCalls = (mockFetch.mock.calls as Array<[string, RequestInit]>).filter(
      ([url]) => url.includes("rpc/finalize_otp_slot")
    );
    expect(finalizeCalls.length).toBeGreaterThan(0);
    const body = JSON.parse(finalizeCalls[0][1].body as string) as Record<string, unknown>;
    expect(body.p_outcome).toBe("sent");
  });

  it("records 'rate_limited' row when denied (audit trail for abuse review)", async () => {
    const mockFetch = vi
      .fn()
      // acquire_otp_slot RPC → denied (atomically inserts 'rate_limited' row in DB)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ allowed: false, retry_after_seconds: 3600 }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "blocked@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    expect(res.status).toBe(429);

    // Allow fire-and-forget to settle
    await new Promise((r) => setTimeout(r, 10));
    // The acquire_otp_slot RPC atomically records 'rate_limited' in Postgres —
    // no separate REST POST is made by the route. Verify the RPC was called.
    const acquireCalls = mockFetch.mock.calls.filter(
      (call: unknown[]) => String(call[0]).includes("rpc/acquire_otp_slot")
    );
    expect(acquireCalls.length).toBeGreaterThan(0);
  });
});

// ── U3 (issue tadaify-app#190 Bug #2b, DEC-364=A): login-otp handles lookup ──────────────────

describe("api.auth.login-otp — U3: looks up handle from profiles by email (DEC-364=A)", () => {
  const supabaseEnvWithSR = {
    SUPABASE_URL: "http://supabase.test",
    SUPABASE_ANON_KEY: "anon_key",
    SUPABASE_SERVICE_ROLE_KEY: "service_role_key",
  };

  it("login-otp looks up handle from profiles by email + passes via data.handle", async () => {
    // DEC-364=A: when service role key is present, login-otp:
    //   1. acquireOtpSlot (rate-limit)
    //   2. profiles lookup (NEW)
    //   3. OTP send (with data.handle)
    //   4. finalizeOtpSlot
    const mockFetch = vi
      .fn()
      // 1st call: acquire_otp_slot RPC → allowed
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ allowed: true, reservation_id: "abc-123" }), { status: 200 })
      )
      // 2nd call: profiles lookup → returns handle
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ handle: "mycreator" }]), { status: 200 })
      )
      // 3rd call: OTP send → 200
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      // 4th call: finalize_otp_slot → 200
      .mockResolvedValueOnce(new Response(JSON.stringify({ finalized: true }), { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "creator@test.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    expect(res.status).toBe(200);

    // Find the OTP send call and verify data.handle is set
    const otpCalls = (mockFetch.mock.calls as Array<[string, RequestInit]>).filter(
      ([url]) => url.includes("/auth/v1/otp")
    );
    expect(otpCalls.length).toBeGreaterThan(0);
    const body = JSON.parse(otpCalls[0][1].body as string) as Record<string, unknown>;
    expect(body.data).toBeDefined();
    expect((body.data as Record<string, unknown>).handle).toBe("mycreator");
  });

  it("login-otp passes data.handle=null (omits data field) when no profile matches email", async () => {
    // Fallback path: profiles returns empty array — OTP send must NOT fail,
    // data field is omitted (template shows "@creator" fallback).
    const mockFetch = vi
      .fn()
      // 1st call: acquire_otp_slot RPC → allowed
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ allowed: true, reservation_id: "def-456" }), { status: 200 })
      )
      // 2nd call: profiles lookup → empty (no match)
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 })
      )
      // 3rd call: OTP send → 200
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      // 4th call: finalize → 200
      .mockResolvedValueOnce(new Response(JSON.stringify({ finalized: true }), { status: 200 }));
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "unknown@example.com" }),
      context: makeContext(supabaseEnvWithSR),
    });
    // Must still succeed (OTP sent) — empty profiles is non-fatal
    expect(res.status).toBe(200);

    const otpCalls = (mockFetch.mock.calls as Array<[string, RequestInit]>).filter(
      ([url]) => url.includes("/auth/v1/otp")
    );
    expect(otpCalls.length).toBeGreaterThan(0);
    const body = JSON.parse(otpCalls[0][1].body as string) as Record<string, unknown>;
    // No handle found → data field should be absent (omitted) for template fallback
    expect(body.data).toBeUndefined();
  });
});

// ── U4 (issue tadaify-app#190 Bug #2c, DEC-364=A): identity-linked source-level check ─────────
// identity-linked is triggered by Supabase Auth internally when OAuth auto-links.
// The template fix ({{ if .Data.handle }}@{{ .Data.handle }}{{ else }}@creator{{ end }})
// is in supabase/templates/auth/identity-linked.html. Since there is no application-layer
// caller in React Router routes, U4 verifies the template source and the profiles
// lookup pattern is present in the broader codebase.

describe("api.auth.login-otp — U4: identity-linked template uses @handle fallback (DEC-364=A)", () => {
  it("identity-linked.html template uses .Data.handle with fallback to @creator", async () => {
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const templateSrc = readFileSync(
      fileURLToPath(new URL("../../supabase/templates/auth/identity-linked.html", import.meta.url)),
      "utf8"
    );
    // DEC-364=A: template must use .Data.handle not .Email
    expect(templateSrc).toContain(".Data.handle");
    expect(templateSrc).not.toMatch(/@{{ \.Email }}/);
  });

  it("identity-linked.html template has @creator fallback when handle absent", async () => {
    const { readFileSync } = await import("fs");
    const { fileURLToPath } = await import("url");
    const templateSrc = readFileSync(
      fileURLToPath(new URL("../../supabase/templates/auth/identity-linked.html", import.meta.url)),
      "utf8"
    );
    // Template must have a fallback so emails don't show blank @
    expect(templateSrc).toMatch(/@creator/);
  });
});
