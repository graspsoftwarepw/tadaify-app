/**
 * U6 — POST /api/blocks/:id/duplicate
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-004, AC#4, ECN-CRUD-02/03
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.blocks.$id.duplicate";
import * as cachePurge from "~/lib/cache-purge";

const SUPABASE_URL = "http://localhost:54321";
const SERVICE_KEY = "test-service-key";
const BLOCK_ID = "cccccccc-0000-0000-0000-000000000001";
const USER_ID = "bbbbbbbb-0000-0000-0000-000000000001";
const NEW_BLOCK_ID = "dddddddd-0000-0000-0000-000000000001";

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
  return new Request(`http://localhost/api/blocks/${BLOCK_ID}/duplicate`, {
    method: "POST",
    headers,
  });
}

function makeParams(id = BLOCK_ID) {
  return { id };
}

describe("U6 — POST /api/blocks/:id/duplicate", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("POST /api/blocks/:id/duplicate creates new row at source+1; shifts subsequent", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // RPC duplicate_block → returns new block uuid
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(NEW_BLOCK_ID), { status: 200 })
    );

    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { block_id: string };
    expect(body.block_id).toBe(NEW_BLOCK_ID);

    // Verify RPC was called with correct param
    const rpcCall = mockFetch.mock.calls[1];
    expect(rpcCall[0]).toContain("/rpc/duplicate_block");
    const rpcBody = JSON.parse(rpcCall[1].body as string) as { p_block_id: string };
    expect(rpcBody.p_block_id).toBe(BLOCK_ID);
  });

  it("POST on last block creates new at MAX+1, no shifts needed (RPC handles)", async () => {
    // This tests that the route passes through correctly; the actual MAX+1 logic
    // lives in the duplicate_block() RPC (tested in P3 pgTAP).
    // At the Worker layer, the response is identical — we verify 200 + block_id.
    const LAST_BLOCK_ID = "cccccccc-0000-0000-0000-000000000099";
    const NEW_LAST_ID = "dddddddd-0000-0000-0000-000000000099";

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(NEW_LAST_ID), { status: 200 })
    );

    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(LAST_BLOCK_ID),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { block_id: string };
    expect(body.block_id).toBe(NEW_LAST_ID);
  });

  it("POST on another user's block returns 404 (permission_denied maps to 404)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // RPC raises permission_denied → PostgREST returns 403
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ code: "42501", message: "permission_denied" }),
        { status: 403 }
      )
    );

    const res = (await action({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  // U4 — TR-tadaify-010 cache-purge hook (#202)
  // Codex round-1 fix: spy on the waitUntil-aware wrapper used by the route.
  it("calls purgeCacheForHandle (via purgeCacheForHandleAndAwait) after successful duplicate", async () => {
    const purgeSpy = vi
      .spyOn(cachePurge, "purgeCacheForHandleAndAwait")
      .mockResolvedValue({ ok: true });

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    // RPC returns the new block uuid
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(NEW_BLOCK_ID), { status: 200 }),
    );
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
  it("registers the purge promise with cloudflare.ctx.waitUntil() on duplicate", async () => {
    const waitUntilSpy = vi.fn();

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(NEW_BLOCK_ID), { status: 200 }),
    );
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
