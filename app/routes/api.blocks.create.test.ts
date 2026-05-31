/**
 * U2 — POST /api/blocks (create)
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#4, ECN-CRUD-01/10/11
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.blocks";
import * as cachePurge from "~/lib/cache-purge";

const SUPABASE_URL = "http://localhost:54321";
const SERVICE_KEY = "test-service-key";
const PAGE_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const USER_ID = "bbbbbbbb-0000-0000-0000-000000000001";

function makeContext() {
  return {
    cloudflare: {
      env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
    },
  };
}

function makeRequest(opts: {
  method?: string;
  body?: unknown;
  bearer?: string;
}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request("http://localhost/api/blocks", {
    method: opts.method ?? "POST",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

const MOCK_CREATED_BLOCK = {
  id: "cccccccc-0000-0000-0000-000000000001",
  page_id: PAGE_ID,
  user_id: USER_ID,
  block_type: "link",
  title: "My link",
  url: "https://example.com",
  is_visible: true,
  position: 0,
  meta: null,
  created_at: "2026-05-06T00:00:00Z",
  updated_at: "2026-05-06T00:00:00Z",
};

describe("U2 — POST /api/blocks create", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("POST /api/blocks with valid body inserts row + returns 201 with new id", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // GET position query (MAX position) → empty = first block
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    // POST /rest/v1/blocks → 201 with created block
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([MOCK_CREATED_BLOCK]), { status: 201 })
    );

    const res = (await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, block_type: "link", title: "My link", url: "https://example.com" },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(201);
    const body = (await res.json()) as { block: typeof MOCK_CREATED_BLOCK };
    expect(body.block.id).toBe(MOCK_CREATED_BLOCK.id);
    expect(body.block.position).toBe(0);
  });

  it("POST without JWT returns 401", async () => {
    const res = (await action({
      request: makeRequest({ body: { page_id: PAGE_ID, block_type: "link" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("POST with page_id user doesn't own returns 4xx (RLS rejects)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // Position query → empty
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    // Insert rejected by RLS (403 from PostgREST)
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "permission denied" }), { status: 403 })
    );

    const otherPageId = "eeeeeeee-0000-0000-0000-000000000001";
    const res = (await action({
      request: makeRequest({
        body: { page_id: otherPageId, block_type: "link", url: "https://example.com" },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  it("POST with missing required field (page_id) returns 400 (Zod)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );

    const res = (await action({
      request: makeRequest({
        body: { block_type: "link" }, // missing page_id
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Validation failed");
  });

  it("POST with own user_id but another user's page_id returns 4xx (page ownership RLS)", async () => {
    // /auth/v1/user → ok (user B)
    const USER_B = "bbbbbbbb-0000-0000-0000-000000000002";
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_B }), { status: 200 })
    );
    // Position query
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );
    // Insert rejected — user B supplies page owned by user A; INSERT RLS page ownership check fails
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "permission denied for table blocks" }), { status: 403 })
    );

    const res = (await action({
      request: makeRequest({
        // PAGE_ID belongs to USER_ID (user A), not user B
        body: { page_id: PAGE_ID, block_type: "link", url: "https://example.com" },
        bearer: "tok-user-b",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  // U4 — TR-tadaify-010 cache-purge hook (#202)
  // Codex round-1 fix: route calls `purgeCacheForHandleAndAwait` (the
  // waitUntil-aware wrapper), so the spy targets that. The wrapper still
  // delegates to `purgeCacheForHandle` internally — covered by its own unit
  // tests in `app/lib/cache-purge.test.ts`.
  it("calls purgeCacheForHandle (via purgeCacheForHandleAndAwait) with the creator's handle after successful INSERT", async () => {
    const purgeSpy = vi
      .spyOn(cachePurge, "purgeCacheForHandleAndAwait")
      .mockResolvedValue({ ok: true });

    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    // GET position query
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    // POST /rest/v1/blocks → 201
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([MOCK_CREATED_BLOCK]), { status: 201 }),
    );
    // profiles lookup for handle → returns the creator's handle
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ handle: "alex" }]), { status: 200 }),
    );

    await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, block_type: "link", title: "x", url: "https://example.com" },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(purgeSpy).toHaveBeenCalledTimes(1);
    // purgeCacheForHandleAndAwait(ctx, handle, customDomain, env) — handle is arg[1]
    expect(purgeSpy.mock.calls[0][1]).toBe("alex");
    purgeSpy.mockRestore();
  });

  // U4b — Codex round-1 finding: purge must be registered with ctx.waitUntil()
  // Real `purgeCacheForHandleAndAwait` runs (no spy) — internal CF fetch is
  // a no-op because no CF_API_TOKEN is set in the test env.
  it("registers the purge promise with cloudflare.ctx.waitUntil()", async () => {
    const waitUntilSpy = vi.fn();

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([MOCK_CREATED_BLOCK]), { status: 201 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ handle: "alex" }]), { status: 200 }),
    );

    await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, block_type: "link", title: "x", url: "https://example.com" },
        bearer: "tok",
      }),
      context: {
        cloudflare: {
          env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
          ctx: { waitUntil: waitUntilSpy },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(waitUntilSpy).toHaveBeenCalledTimes(1);
    expect(waitUntilSpy.mock.calls[0][0]).toBeInstanceOf(Promise);
  });
});
