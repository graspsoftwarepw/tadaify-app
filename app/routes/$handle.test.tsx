/**
 * U2 — GET /:handle public render loader + meta + cache-headers
 *
 * Strategy: drive the route's `loader` and `meta` exports directly with
 * mocked fetch (Supabase REST) — no React render needed. Matches the
 * loader-only test pattern used elsewhere in the codebase (e.g. the API
 * route specs).
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: BR-BLOCK-RENDER-001..005, TR-tadaify-009, ECN-RENDER-01/02/03
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loader,
  meta,
  CACHE_CONTROL_200,
  CACHE_CONTROL_404,
  type LoaderData,
} from "./$handle";

const SUPABASE_URL = "http://localhost:54321";
const SERVICE_KEY = "test-service-key";
const USER_ID = "00000000-0000-0000-0000-000000000202";
const PAGE_ID = "11111111-0000-0000-0000-000000000202";

function makeContext() {
  return {
    cloudflare: {
      env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY },
    },
  };
}

function makeRequest(path: string): Request {
  return new Request(`http://localhost${path}`, { method: "GET" });
}

function makeArgs(handle: string) {
  return {
    request: makeRequest(`/${handle}`),
    context: makeContext(),
    params: { handle },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Mock layered Supabase REST responses in the order the loader issues them:
//   1. profiles ?handle=eq.<h>
//   2. pages    ?user_id=eq.<id>&is_homepage=eq.true&published_at=not.is.null
//   3. profile_extras ?user_id=eq.<id>
//   3b. account_settings ?id=eq.<id> (pinned_message + pinned_enabled)
//   4. blocks   ?page_id=eq.<id>
function mockSupabaseStack(opts: {
  profile: Array<Record<string, unknown>>;
  page?: Array<Record<string, unknown>>;
  extras?: Array<Record<string, unknown>>;
  pinned?: Array<Record<string, unknown>>;
  blocks?: Array<Record<string, unknown>>;
}) {
  const fetchMock = vi.fn();
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(opts.profile), { status: 200 }),
  );
  if (opts.profile.length === 0) {
    return fetchMock;
  }
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(opts.page ?? []), { status: 200 }),
  );
  if ((opts.page ?? []).length === 0) {
    return fetchMock;
  }
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(opts.extras ?? []), { status: 200 }),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(opts.pinned ?? []), { status: 200 }),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(opts.blocks ?? []), { status: 200 }),
  );
  return fetchMock;
}

const PROFILE_ROW = {
  id: USER_ID,
  handle: "alex",
  display_name: "Alex Test",
  bio: "Tester bio",
};

const PAGE_ROW = {
  id: PAGE_ID,
  user_id: USER_ID,
  title: "Home",
};

describe("U2 — GET /:handle loader (cache + headers + visibility + order)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // each test installs its own mock
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns 200 with loader data for a published handle", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [{ avatar_r2_key: "avatars/u/a.jpg" }],
      blocks: [
        { id: "b1", block_type: "link", title: "T1", url: "u", position: 0, is_visible: true, meta: null },
      ],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as LoaderData;
    expect(body.handle).toBe("alex");
    expect(body.displayName).toBe("Alex Test");
    expect(body.blocks).toHaveLength(1);
    expect(body.pinnedMessage).toBeNull();
  });

  it("surfaces the pinned message when pinned_enabled is true", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      pinned: [{ pinned_message: "New drop Friday 📣", pinned_enabled: true }],
      blocks: [],
    }) as unknown as typeof fetch;

    const body = (await (await loader(makeArgs("alex"))).json()) as LoaderData;
    expect(body.pinnedMessage).toBe("New drop Friday 📣");
  });

  it("omits the pinned message when pinned_enabled is false", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      pinned: [{ pinned_message: "Hidden", pinned_enabled: false }],
      blocks: [],
    }) as unknown as typeof fetch;

    const body = (await (await loader(makeArgs("alex"))).json()) as LoaderData;
    expect(body.pinnedMessage).toBeNull();
  });

  it("returns 404 for an unknown handle", async () => {
    globalThis.fetch = mockSupabaseStack({ profile: [] }) as unknown as typeof fetch;

    try {
      await loader(makeArgs("ghost"));
      throw new Error("expected throw");
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(Response);
      const res = thrown as Response;
      expect(res.status).toBe(404);
    }
  });

  it("returns 404 (not 403) when the page exists but is unpublished", async () => {
    // Profile exists, but pages query (filtered by published_at NOT NULL)
    // returns zero rows — this is the "drafted" case.
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [],
    }) as unknown as typeof fetch;

    try {
      await loader(makeArgs("alex"));
      throw new Error("expected throw");
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(Response);
      const res = thrown as Response;
      expect(res.status).toBe(404);
      // No info-leak — same response shape as the "unknown handle" case.
    }
  });

  it("sets Cache-Control public, max-age=3600, s-maxage=3600 on 200", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [],
      blocks: [],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    expect(res.headers.get("Cache-Control")).toBe(CACHE_CONTROL_200);
    expect(CACHE_CONTROL_200).toBe("public, max-age=3600, s-maxage=3600");
  });

  it("sets Cache-Control max-age=300 on 404", async () => {
    globalThis.fetch = mockSupabaseStack({ profile: [] }) as unknown as typeof fetch;

    try {
      await loader(makeArgs("ghost"));
      throw new Error("expected throw");
    } catch (thrown) {
      const res = thrown as Response;
      expect(res.headers.get("Cache-Control")).toBe(CACHE_CONTROL_404);
      expect(CACHE_CONTROL_404).toBe("public, max-age=300, s-maxage=300");
    }
  });

  it("does NOT emit a Set-Cookie header on 200 responses (privacy-first)", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [],
      blocks: [],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  it("meta() emits og:title, og:description, og:image when avatar exists", async () => {
    const data: LoaderData = {
      handle: "alex",
      displayName: "Alex Test",
      bio: "Tester bio",
      avatarUrl: "/api/avatar/abc123",
      pageTitle: "Home",
      blocks: [],
    };
    const tags = meta({ data } as unknown as Parameters<typeof meta>[0]);
    const flat = JSON.stringify(tags);
    expect(flat).toContain("og:title");
    expect(flat).toContain("og:description");
    expect(flat).toContain("og:image");
    expect(flat).toContain("/api/avatar/abc123");
  });

  // Codex round-1 finding #3: og:image must be an absolute URL or social
  // crawlers reject it. The loader stores the path; meta() prepends the
  // canonical origin.
  it("meta() emits og:image / twitter:image as absolute https://tadaify.com URLs", async () => {
    const data: LoaderData = {
      handle: "alex",
      displayName: "Alex Test",
      bio: "Tester bio",
      avatarUrl: "/api/avatar/abc123",
      pageTitle: "Home",
      blocks: [],
    };
    const tags = meta({ data } as unknown as Parameters<typeof meta>[0]);

    const ogImage = (tags as Array<Record<string, string>>).find(
      (t) => t.property === "og:image",
    );
    const twImage = (tags as Array<Record<string, string>>).find(
      (t) => t.name === "twitter:image",
    );

    expect(ogImage?.content).toBe("https://tadaify.com/api/avatar/abc123");
    expect(twImage?.content).toBe("https://tadaify.com/api/avatar/abc123");
    expect(ogImage?.content?.startsWith("https://tadaify.com/")).toBe(true);
  });

  it("meta() leaves an already-absolute avatar URL unchanged (idempotent)", async () => {
    const data: LoaderData = {
      handle: "alex",
      displayName: "Alex Test",
      bio: "",
      avatarUrl: "https://cdn.example.com/u/abc.jpg",
      pageTitle: "Home",
      blocks: [],
    };
    const tags = meta({ data } as unknown as Parameters<typeof meta>[0]);
    const ogImage = (tags as Array<Record<string, string>>).find(
      (t) => t.property === "og:image",
    );
    expect(ogImage?.content).toBe("https://cdn.example.com/u/abc.jpg");
  });

  it("orders blocks by position ASC", async () => {
    // Returned out of order — loader must sort.
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [],
      blocks: [
        { id: "b3", block_type: "link", title: "T3", url: null, position: 2, is_visible: true, meta: null },
        { id: "b1", block_type: "link", title: "T1", url: null, position: 0, is_visible: true, meta: null },
        { id: "b2", block_type: "link", title: "T2", url: null, position: 1, is_visible: true, meta: null },
      ],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    const body = (await res.json()) as LoaderData;
    expect(body.blocks.map((b) => b.id)).toEqual(["b1", "b2", "b3"]);
  });

  it("filters out is_visible=false blocks", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [],
      blocks: [
        { id: "b1", block_type: "link", title: "T1", url: null, position: 0, is_visible: true, meta: null },
        { id: "b2", block_type: "link", title: "T2", url: null, position: 1, is_visible: false, meta: null },
        { id: "b3", block_type: "link", title: "T3", url: null, position: 2, is_visible: true, meta: null },
      ],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    const body = (await res.json()) as LoaderData;
    expect(body.blocks.map((b) => b.id)).toEqual(["b1", "b3"]);
  });

  it("returns 301 to canonical lowercase URL when handle has uppercase chars (ECN-RENDER-01)", async () => {
    // No fetch should fire — short-circuited before Supabase.
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const res = await loader(makeArgs("Alex"));
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("/alex");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 200 for a published page with zero blocks (ECN-RENDER-03)", async () => {
    globalThis.fetch = mockSupabaseStack({
      profile: [PROFILE_ROW],
      page: [PAGE_ROW],
      extras: [],
      blocks: [],
    }) as unknown as typeof fetch;

    const res = await loader(makeArgs("alex"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as LoaderData;
    expect(body.blocks).toEqual([]);
  });
});
