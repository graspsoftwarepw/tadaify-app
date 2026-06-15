/**
 * U4 — DELETE /api/blocks/:id (hard-delete, DEC-374=B)
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-002, AC#4, ECN-CRUD-02
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.blocks.$id";
import * as cachePurge from "~/lib/cache-purge";

const SUPABASE_URL = "http://localhost:44210";
const SERVICE_KEY = "test-service-key";
const BLOCK_ID = "cccccccc-0000-0000-0000-000000000001";
const USER_ID = "bbbbbbbb-0000-0000-0000-000000000001";

function makeContext() {
  return {
    cloudflare: {
      env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
    },
  };
}

function makeRequest(opts: { bearer?: string } = {}): Request {
  const headers: Record<string, string> = {};
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request(`http://localhost/api/blocks/${BLOCK_ID}`, {
    method: "DELETE",
    headers,
  });
}

function makeParams(id = BLOCK_ID) {
  return { id };
}

describe("U4 — DELETE /api/blocks/:id hard-delete", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("DELETE /api/blocks/:id removes row + returns 204", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // DELETE /rest/v1/blocks → 204 with Content-Range indicating 1 row affected
    const headers = new Headers({ "Content-Range": "0-0/1" });
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers }));

    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it("DELETE on another user's block returns 404 (ECN-CRUD-02 — no info leak)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // DELETE → 204 but Content-Range shows 0 rows affected (RLS blocked)
    const headers = new Headers({ "Content-Range": "*/0" });
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers }));

    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  it("DELETE on non-existent id returns 404", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // DELETE → 204 with 0 rows (no such block for this user)
    const headers = new Headers({ "Content-Range": "*/0" });
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers }));

    const nonExistentId = "ffffffff-0000-0000-0000-000000000099";
    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(nonExistentId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  // U4 — TR-tadaify-010 cache-purge hook (#202)
  // Codex round-1 fix: spy on the waitUntil-aware wrapper used by the route.
  it("calls purgeCacheForHandle (via purgeCacheForHandleAndAwait) after successful DELETE", async () => {
    const purgeSpy = vi
      .spyOn(cachePurge, "purgeCacheForHandleAndAwait")
      .mockResolvedValue({ ok: true });

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    const headers = new Headers({ "Content-Range": "0-0/1" });
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers }));
    // profiles lookup for handle
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ handle: "alex" }]), { status: 200 }),
    );

    await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(purgeSpy).toHaveBeenCalledTimes(1);
    expect(purgeSpy.mock.calls[0][1]).toBe("alex");
    purgeSpy.mockRestore();
  });

  // U4b — Codex round-1 finding: purge must be registered with ctx.waitUntil()
  it("registers the purge promise with cloudflare.ctx.waitUntil() on DELETE", async () => {
    const waitUntilSpy = vi.fn();

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    const headers = new Headers({ "Content-Range": "0-0/1" });
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers }));
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ handle: "alex" }]), { status: 200 }),
    );

    await action({
      request: makeRequest({ bearer: "tok" }),
      context: {
        cloudflare: {
          env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
          ctx: { waitUntil: waitUntilSpy },
        },
      },
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(waitUntilSpy).toHaveBeenCalledTimes(1);
    expect(waitUntilSpy.mock.calls[0][0]).toBeInstanceOf(Promise);
  });
});
