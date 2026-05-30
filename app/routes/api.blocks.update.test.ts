/**
 * U3 — PATCH /api/blocks/:id (update)
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#4, ECN-CRUD-02/08
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action } from "./api.blocks.$id";
import * as cachePurge from "~/lib/cache-purge";

const SUPABASE_URL = "http://localhost:54321";
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

function makeRequest(opts: {
  method?: string;
  body?: unknown;
  bearer?: string;
}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;
  return new Request(`http://localhost/api/blocks/${BLOCK_ID}`, {
    method: opts.method ?? "PATCH",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

function makeParams() {
  return { id: BLOCK_ID };
}

const MOCK_UPDATED_BLOCK = {
  id: BLOCK_ID,
  page_id: "aaaaaaaa-0000-0000-0000-000000000001",
  user_id: USER_ID,
  block_type: "link",
  title: "Updated Title",
  url: "https://example.com/new",
  is_visible: true,
  position: 0,
  meta: null,
  created_at: "2026-05-06T00:00:00Z",
  updated_at: "2026-05-06T01:00:00Z",
};

describe("U3 — PATCH /api/blocks/:id update", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("PATCH /api/blocks/:id updates fields and returns 200", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // PATCH /rest/v1/blocks → 200 with updated block
    const headers = new Headers({ "Content-Range": "0-0/1" });
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([MOCK_UPDATED_BLOCK]), { status: 200, headers })
    );

    const res = (await action({
      request: makeRequest({ body: { title: "Updated Title" }, bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { block: typeof MOCK_UPDATED_BLOCK };
    expect(body.block.title).toBe("Updated Title");
  });

  it("PATCH on another user's block returns 404 (RLS hides)", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );
    // PATCH returns empty array — RLS filtered the row out (0 rows matched)
    const headers = new Headers({ "Content-Range": "*/0" });
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200, headers })
    );

    const res = (await action({
      request: makeRequest({ body: { title: "Hack" }, bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(404);
  });

  it("PATCH with empty body returns 400", async () => {
    // /auth/v1/user → ok
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 })
    );

    const res = (await action({
      request: makeRequest({ body: {}, bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Validation failed");
  });

  // U4 — TR-tadaify-010 cache-purge hook (#202)
  it("calls purgeCacheForHandle after successful PATCH", async () => {
    const purgeSpy = vi
      .spyOn(cachePurge, "purgeCacheForHandle")
      .mockResolvedValue({ ok: true });

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: USER_ID }), { status: 200 }),
    );
    const headers = new Headers({ "Content-Range": "0-0/1" });
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([MOCK_UPDATED_BLOCK]), { status: 200, headers }),
    );
    // profiles lookup for handle
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([{ handle: "alex" }]), { status: 200 }),
    );

    await action({
      request: makeRequest({ body: { title: "x" }, bearer: "tok" }),
      context: makeContext(),
      params: makeParams(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(purgeSpy).toHaveBeenCalledTimes(1);
    expect(purgeSpy.mock.calls[0][0]).toBe("alex");
    purgeSpy.mockRestore();
  });
});
