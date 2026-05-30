/**
 * U1 — cache-purge helper
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: TR-tadaify-010
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  purgeCacheForHandle,
  purgeCacheForHandleAndAwait,
} from "./cache-purge";

const ZONE = "zone-deadbeef";
const TOKEN = "real-token";

describe("U1 — purgeCacheForHandle", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("calls Cloudflare API with correct URL list (tadaify.com/<handle> only)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const result = await purgeCacheForHandle("alex", undefined, {
      CF_ZONE_ID: ZONE,
      CF_API_TOKEN: TOKEN,
    });

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`,
    );
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    const body = JSON.parse(init.body) as { files: string[] };
    expect(body.files).toEqual(["https://tadaify.com/alex"]);
  });

  it("no-ops when CF_API_TOKEN missing (returns ok=false, no fetch)", async () => {
    const result = await purgeCacheForHandle("alex", undefined, {
      CF_ZONE_ID: ZONE,
      // CF_API_TOKEN: undefined
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("token_missing");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("no-ops when CF_API_TOKEN is the placeholder value", async () => {
    const result = await purgeCacheForHandle("alex", undefined, {
      CF_ZONE_ID: ZONE,
      CF_API_TOKEN: "CHANGE_ME_VIA_WRANGLER_SECRET",
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("token_missing");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("includes both tadaify.com/<handle> AND custom domain when provided", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await purgeCacheForHandle("alex", "alexs.shop", {
      CF_ZONE_ID: ZONE,
      CF_API_TOKEN: TOKEN,
    });

    const init = mockFetch.mock.calls[0][1];
    const body = JSON.parse(init.body) as { files: string[] };
    expect(body.files).toEqual([
      "https://tadaify.com/alex",
      "https://alexs.shop/",
    ]);
  });

  it("returns ok=false on CF API 4xx/5xx (does not throw)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false }), { status: 403 }),
    );

    const result = await purgeCacheForHandle("alex", undefined, {
      CF_ZONE_ID: ZONE,
      CF_API_TOKEN: TOKEN,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("cf_403");
  });
});

describe("U1b — purgeCacheForHandleAndAwait (Codex round-1 waitUntil fix)", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("registers the in-flight purge promise with ctx.waitUntil()", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const waitUntilSpy = vi.fn();

    const result = await purgeCacheForHandleAndAwait(
      { waitUntil: waitUntilSpy },
      "alex",
      undefined,
      { CF_ZONE_ID: ZONE, CF_API_TOKEN: TOKEN },
    );

    expect(result.ok).toBe(true);
    expect(waitUntilSpy).toHaveBeenCalledTimes(1);
    expect(waitUntilSpy.mock.calls[0][0]).toBeInstanceOf(Promise);
  });

  it("still completes the purge when ctx is undefined (graceful fallback)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const result = await purgeCacheForHandleAndAwait(
      undefined,
      "alex",
      undefined,
      { CF_ZONE_ID: ZONE, CF_API_TOKEN: TOKEN },
    );

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
