/**
 * U5 — POST /api/blocks/reorder
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-003, AC#4, ECN-CRUD-04/05
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.blocks.reorder";

const SUPABASE_URL = "http://localhost:54321";
const SERVICE_KEY = "test-service-key";
const PAGE_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const USER_ID = "bbbbbbbb-0000-0000-0000-000000000001";
const IDS = [
  "cccccccc-0000-0000-0000-000000000003",
  "cccccccc-0000-0000-0000-000000000001",
  "cccccccc-0000-0000-0000-000000000002",
];

function makeContext() {
  return {
    cloudflare: {
      env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
    },
  };
}

function makeRequest(opts: { body?: unknown; bearer?: string }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request("http://localhost/api/blocks/reorder", {
    method: "POST",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

describe("U5 — POST /api/blocks/reorder", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("POST /api/blocks/reorder with valid ordered_ids returns 200; positions update", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // RPC call → 200 (void returns empty body from PostgREST)
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(null), { status: 200 })
    );

    const res = (await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, ordered_ids: IDS },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);

    // Verify RPC was called with correct params
    const rpcCall = mockFetch.mock.calls[1];
    expect(rpcCall[0]).toContain("/rpc/reorder_blocks");
    const rpcBody = JSON.parse(rpcCall[1].body as string) as {
      p_page_id: string;
      p_ordered_ids: string[];
    };
    expect(rpcBody.p_page_id).toBe(PAGE_ID);
    expect(rpcBody.p_ordered_ids).toEqual(IDS);
  });

  it("POST with mismatched length returns 4xx (RPC invalid_input → 422)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // RPC raises invalid_input — PostgREST returns 400
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "22023",
          message: "invalid_input: ordered_ids missing some page blocks",
        }),
        { status: 400 }
      )
    );

    // Only send 2 ids out of 3 (length mismatch — ECN-CRUD-05)
    const res = (await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, ordered_ids: IDS.slice(0, 2) },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    // Worker translates RPC 400 → 422 for client to distinguish validation vs server error
    expect(res.status).toBe(422);
  });

  it("POST with id from different page returns 4xx (RPC invalid_input → 422)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // RPC raises invalid_input — cross-page block detected (ECN-CRUD-04)
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "22023",
          message: "invalid_input: ordered_ids cross-page or wrong owner",
        }),
        { status: 400 }
      )
    );

    const crossPageId = "dddddddd-0000-0000-0000-000000000099";
    const res = (await action({
      request: makeRequest({
        body: { page_id: PAGE_ID, ordered_ids: [...IDS, crossPageId] },
        bearer: "tok",
      }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(422);
  });
});
