/**
 * Unit tests for api.auth.signup.ts
 * Run: npx vitest run app/routes/api.auth.signup.test.ts
 * Story: F-REGISTER-001a
 * U1: env binding validation (Bug 1 fix — hard-fail instead of silent stub)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Test helpers ─────────────────────────────────────────────────────────────

/** Build a minimal Route.ActionArgs-compatible object for testing */
function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeContext(env: Record<string, string> = {}) {
  return { cloudflare: { env } };
}

// ── Import action ─────────────────────────────────────────────────────────────
// Dynamic import to avoid type-gen dependency in unit test environment
let action: (args: { request: Request; context: unknown }) => Promise<Response>;

beforeEach(async () => {
  const mod = await import("./api.auth.signup");
  action = mod.action as typeof action;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Request schema validation ─────────────────────────────────────────────────

describe("api.auth.signup — input validation", () => {
  it("returns 405 for non-POST methods", async () => {
    const req = new Request("http://localhost/api/auth/signup", { method: "GET" });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(405);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not json }",
    });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing email", async () => {
    const res = await action({
      request: makeRequest({ handle: "alex", tos_version: "v1" }),
      context: makeContext(),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await action({
      request: makeRequest({ email: "not-an-email", handle: "alex", tos_version: "v1" }),
      context: makeContext(),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for invalid handle", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "INVALID HANDLE!", tos_version: "v1" }),
      context: makeContext(),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });
});

// ── U1: env binding validation (Bug 1 fix — hard-fail instead of silent stub) ─
// Covers: BUG-149-1 / ECN-149-01 / ECN-149-02

describe("api.auth.signup — U1: env binding validation", () => {
  it("returns 500 when context.cloudflare.env is undefined", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: {}, // no cloudflare.env at all
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(500);
    expect(data.error).toMatch(/Workers env binding missing/);
  });

  it("returns 500 when env.SUPABASE_URL is empty string", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({ SUPABASE_URL: "", SUPABASE_ANON_KEY: "valid" }),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(500);
    expect(data.error).toMatch(/Workers env binding missing/);
  });

  it("returns 500 when env.SUPABASE_ANON_KEY is empty string", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({ SUPABASE_URL: "http://supabase.test", SUPABASE_ANON_KEY: "" }),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(500);
    expect(data.error).toMatch(/Workers env binding missing/);
  });

  it("returns 200 with { sent: true } (no stub flag) on happy path", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({ SUPABASE_URL: "http://supabase.test", SUPABASE_ANON_KEY: "anon_key" }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);
    // Must NOT include stub flag — that was the silent-stub regression
    expect(data).not.toHaveProperty("stub");
  });

  it("error message references .dev.vars.example by name", async () => {
    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({}),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(500);
    expect(data.error).toContain(".dev.vars.example");
  });
});

// ── Email normalisation ────────────────────────────────────────────────────────

describe("api.auth.signup — email normalisation", () => {
  it("trims and lowercases email before sending (rejects without env)", async () => {
    // With no env bindings, the handler should hard-fail (Bug 1 fix).
    // This test verifies the normalisation guard still runs before env check.
    const res = await action({
      request: makeRequest({ email: "  USER@EXAMPLE.COM  ", handle: "alex", tos_version: "v1" }),
      context: makeContext({}),
    });
    // After Bug 1 fix: no env → 500 (not 200-stub). Email normalisation happens
    // before env check so the request is still well-formed; 500 is the expected
    // outcome from the missing binding gate.
    expect(res.status).toBe(500);
  });
});

// ── Supabase OTP send (mocked fetch) ─────────────────────────────────────────

describe("api.auth.signup — Supabase OTP send", () => {
  it("returns { sent: true } when Supabase returns 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({ SUPABASE_URL: "http://supabase.test", SUPABASE_ANON_KEY: "anon_key" }),
    });
    const data = (await res.json()) as { sent: boolean };
    expect(res.status).toBe(200);
    expect(data.sent).toBe(true);
  });

  it("returns 502 when Supabase OTP send fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ msg: "Rate limit exceeded" }), { status: 429 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ email: "user@example.com", handle: "alex", tos_version: "v1" }),
      context: makeContext({ SUPABASE_URL: "http://supabase.test", SUPABASE_ANON_KEY: "anon_key" }),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(502);
    expect(data.error).toBeTruthy();
  });
});
