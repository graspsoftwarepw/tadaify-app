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
