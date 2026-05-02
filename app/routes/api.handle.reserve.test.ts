/**
 * Unit tests for api.handle.reserve.ts
 * Run: npx vitest run app/routes/api.handle.reserve.test.ts
 * Story: F-REGISTER-001a — Codex review round-1 fix (F4)
 * Covers: BR-AUTH-07, TR-AUTH-04
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/handle/reserve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeContext(env: Record<string, string> = {}) {
  return { cloudflare: { env } };
}

const supabaseEnv = {
  SUPABASE_URL: "http://supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service_key",
};

let action: (args: { request: Request; context: unknown }) => Promise<Response>;

beforeEach(async () => {
  const mod = await import("./api.handle.reserve");
  action = mod.action as typeof action;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Input validation ─────────────────────────────────────────────────────────

describe("api.handle.reserve — input validation", () => {
  it("returns 405 for non-POST", async () => {
    const req = new Request("http://localhost/api/handle/reserve", { method: "GET" });
    const res = await action({ request: req, context: makeContext() });
    expect(res.status).toBe(405);
  });

  it("returns 400 for invalid handle", async () => {
    const res = await action({
      request: makeRequest({ handle: "INVALID HANDLE!" }),
      context: makeContext(),
    });
    expect(res.status).toBe(400);
  });
});

// ── Stub mode ─────────────────────────────────────────────────────────────────

describe("api.handle.reserve — stub mode", () => {
  it("returns reservation stub when Supabase env vars missing", async () => {
    const res = await action({
      request: makeRequest({ handle: "alex" }),
      context: makeContext({}),
    });
    const data = (await res.json()) as { reserved: boolean; handle: string; expires_at: string };
    expect(res.status).toBe(201);
    expect(data.reserved).toBe(true);
    expect(data.handle).toBe("alex");
  });
});

// ── Profiles pre-check (F4) ───────────────────────────────────────────────────

describe("api.handle.reserve — profiles pre-check (F4)", () => {
  it("returns 409 handle_taken when handle already claimed in profiles", async () => {
    const mockFetch = vi
      .fn()
      // First call: profiles pre-check → handle found in profiles (claimed)
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "existing-user-uuid" }]), { status: 200 })
      );

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "alex" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { reserved: boolean; reason: string };
    expect(res.status).toBe(409);
    expect(data.reserved).toBe(false);
    expect(data.reason).toBe("handle_taken");

    // Verify we queried profiles table
    const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/rest/v1/profiles");
    expect(url).toContain("handle=eq.alex");

    // Verify we did NOT proceed to INSERT into handle_reservations
    expect(mockFetch.mock.calls.length).toBe(1);
  });

  it("proceeds to reservation when profiles check returns empty (handle not claimed)", async () => {
    const mockFetch = vi
      .fn()
      // First call: profiles pre-check → empty (handle not claimed)
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 })
      )
      // Second call: expired reservations DELETE (cleanup)
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      // Third call: handle_reservations INSERT → 201
      .mockResolvedValueOnce(new Response("", { status: 201 }));

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "newhandle" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { reserved: boolean; handle: string };
    expect(res.status).toBe(201);
    expect(data.reserved).toBe(true);
    expect(data.handle).toBe("newhandle");
  });

  it("falls through to reservation if profiles check errors (network blip)", async () => {
    const mockFetch = vi
      .fn()
      // First call: profiles pre-check → network error
      .mockRejectedValueOnce(new Error("Network error"))
      // Second call: expired reservations DELETE
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      // Third call: handle_reservations INSERT → 201
      .mockResolvedValueOnce(new Response("", { status: 201 }));

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "newhandle" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { reserved: boolean };
    expect(res.status).toBe(201);
    expect(data.reserved).toBe(true);
  });

  it("returns 409 active_reservation when handle_reservations INSERT conflicts", async () => {
    const mockFetch = vi
      .fn()
      // profiles pre-check → empty
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      // expired DELETE
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      // INSERT → conflict (handle already actively reserved by another session)
      .mockResolvedValueOnce(new Response("", { status: 409 }));

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "takenhandle" }),
      context: makeContext(supabaseEnv),
    });
    const data = (await res.json()) as { reserved: boolean; reason: string };
    expect(res.status).toBe(409);
    expect(data.reserved).toBe(false);
    expect(data.reason).toBe("active_reservation");
  });
});

// ── U4: TTL env-var resolution + default fallback (Bug 6 fix) ────────────────

describe("api.handle.reserve — U4: TTL env-var resolution", () => {
  /** Helper: run reservation and extract expires_at delta in seconds */
  async function getExpiresAtDeltaSeconds(
    envOverride: Record<string, string>,
    nowMs = Date.now()
  ): Promise<number> {
    vi.useFakeTimers();
    vi.setSystemTime(nowMs);

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 })) // profiles check
      .mockResolvedValueOnce(new Response("", { status: 200 })) // expired DELETE
      .mockResolvedValueOnce(new Response("", { status: 201 })); // INSERT

    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "testttl" }),
      context: makeContext({ ...supabaseEnv, ...envOverride }),
    });

    vi.useRealTimers();

    const data = (await res.json()) as { reserved: boolean; expires_at: string };
    expect(res.status).toBe(201);
    const expiresMs = new Date(data.expires_at).getTime();
    return (expiresMs - nowMs) / 1000;
  }

  it("uses HANDLE_RESERVATION_TTL_SECONDS from env when set", async () => {
    const delta = await getExpiresAtDeltaSeconds({ HANDLE_RESERVATION_TTL_SECONDS: "30" });
    // Allow 2s tolerance for any timing jitter
    expect(delta).toBeGreaterThanOrEqual(28);
    expect(delta).toBeLessThanOrEqual(32);
  });

  it("falls back to 600 (10 min) when env var unset", async () => {
    const delta = await getExpiresAtDeltaSeconds({});
    expect(delta).toBeGreaterThanOrEqual(598);
    expect(delta).toBeLessThanOrEqual(602);
  });

  it("falls back to 600 when env var is empty string", async () => {
    const delta = await getExpiresAtDeltaSeconds({ HANDLE_RESERVATION_TTL_SECONDS: "" });
    expect(delta).toBeGreaterThanOrEqual(598);
    expect(delta).toBeLessThanOrEqual(602);
  });

  it("falls back to 600 when env var is non-numeric", async () => {
    const delta = await getExpiresAtDeltaSeconds({ HANDLE_RESERVATION_TTL_SECONDS: "abc" });
    expect(delta).toBeGreaterThanOrEqual(598);
    expect(delta).toBeLessThanOrEqual(602);
  });

  it("rejects negative TTL with 500 and does not create reservation", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const res = await action({
      request: makeRequest({ handle: "testnegttl" }),
      context: makeContext({ ...supabaseEnv, HANDLE_RESERVATION_TTL_SECONDS: "-10" }),
    });
    const data = (await res.json()) as { error: string };
    expect(res.status).toBe(500);
    expect(data.error).toBe("invalid TTL config");
    // No fetch calls should have been made (reservation was rejected before any DB call)
    expect(mockFetch.mock.calls.length).toBe(0);
  });
});
