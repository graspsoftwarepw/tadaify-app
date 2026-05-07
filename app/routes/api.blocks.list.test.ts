/**
 * U1 — GET /api/blocks?page_id=<uuid>
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#9, ECN-CRUD-12/13
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader } from "./api.blocks";

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
  pageId?: string | null;
  bearer?: string;
}): Request {
  const url = new URL("http://localhost/api/blocks");
  if (opts.pageId !== undefined && opts.pageId !== null) {
    url.searchParams.set("page_id", opts.pageId);
  }
  const headers: Record<string, string> = {};
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request(url.toString(), { method: "GET", headers });
}

const MOCK_BLOCKS = [
  {
    id: "cccccccc-0000-0000-0000-000000000001",
    page_id: PAGE_ID,
    user_id: USER_ID,
    block_type: "link",
    title: "Block A",
    url: "https://example.com",
    is_visible: true,
    position: 0,
    meta: null,
    created_at: "2026-05-06T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
  {
    id: "cccccccc-0000-0000-0000-000000000002",
    page_id: PAGE_ID,
    user_id: USER_ID,
    block_type: "link",
    title: "Block B",
    url: "https://example.org",
    is_visible: true,
    position: 1,
    meta: null,
    created_at: "2026-05-06T00:00:01Z",
    updated_at: "2026-05-06T00:00:01Z",
  },
];

describe("U1 — GET /api/blocks list", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("GET /api/blocks?page_id=<uuid> returns own blocks ordered by position", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // /rest/v1/blocks → ok with 2 rows
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(MOCK_BLOCKS), { status: 200 })
    );

    const res = (await loader({
      request: makeRequest({ pageId: PAGE_ID, bearer: "tok" }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { blocks: typeof MOCK_BLOCKS };
    expect(body.blocks).toHaveLength(2);
    expect(body.blocks[0].position).toBe(0);
    expect(body.blocks[1].position).toBe(1);

    // Verify that the Supabase REST call includes order=position.asc
    const blocksCall = mockFetch.mock.calls[1];
    expect(blocksCall[0]).toContain("order=position.asc");
    expect(blocksCall[0]).toContain(`page_id=eq.${PAGE_ID}`);
  });

  it("GET without JWT returns 401", async () => {
    const res = (await loader({
      request: makeRequest({ pageId: PAGE_ID }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(401);
  });

  it("GET with another user's page_id returns empty array (RLS filters)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // Supabase RLS returns empty array (0 rows visible to this user)
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    const otherPageId = "dddddddd-0000-0000-0000-000000000001";
    const res = (await loader({
      request: makeRequest({ pageId: otherPageId, bearer: "tok" }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { blocks: unknown[] };
    expect(body.blocks).toHaveLength(0);
  });

  it("GET without page_id query param returns 400 (Zod)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );

    const res = (await loader({
      request: makeRequest({ bearer: "tok" }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("page_id");
  });
});
