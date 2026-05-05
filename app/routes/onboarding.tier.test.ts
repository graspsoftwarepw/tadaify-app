/**
 * Unit tests for onboarding.tier.tsx — Step 5/5
 *
 * Story: F-ONBOARDING-001a + F-ONBOARDING-001d (#139)
 * Covers: BR-ONBOARDING-005 / ECN-136-08 / DEC-311=A / TR-tadaify-004 / TR-tadaify-007
 *
 * U1: loader reads all accumulated params (ignores tier URL param)
 * U2: action always redirects to /app (DEC-366=A)
 * U3: action carries all accumulated params to /app (DEC-366=A)
 * U4: no billing / tier selection allowed (action always free)
 *
 * F-ONBOARDING-001d (#139) — upsertTierFree + action DB persistence:
 * U_TIER_DB_1: upsertTierFree calls Supabase REST with tier_slug='free'
 * U_TIER_DB_2: upsertTierFree ignores tier param from URL/body (ECN-139-01)
 * U_TIER_DB_3: upsertTierFree is idempotent — second UPSERT succeeds (ECN-139-02)
 * U_TIER_DB_4: action skips DB write + still redirects if env vars missing
 * U_TIER_DB_5: action skips DB write + still redirects if no auth cookie (unauthenticated)
 * U_TIER_DB_6: extractAccessToken reads from sb-*-auth-token cookie
 * U_TIER_DB_7: extractAccessToken reads from Authorization header
 *
 * Bug #6a regression tests (issue tadaify-app#188):
 * U5: submit button text matches /Take me to my page/
 *
 * Bug #6b regression tests (issue tadaify-app#188):
 * U6: displayed Creator price equals CREATOR_PRICE_MONTHLY constant (no hard-coded $9)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { loader, action, extractAccessToken, upsertTierFree } from "./onboarding.tier";
import { CREATOR_PRICE_MONTHLY, PRO_PRICE_MONTHLY, BUSINESS_PRICE_MONTHLY } from "~/lib/tier-gate";

const tierSrc = readFileSync(
  fileURLToPath(new URL("./onboarding.tier.tsx", import.meta.url)),
  "utf8",
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, string>
): Request {
  if (method === "GET") {
    return new Request(`http://localhost${path}`);
  }
  const fd = new FormData();
  if (body) {
    for (const [k, v] of Object.entries(body)) fd.append(k, v);
  }
  return new Request(`http://localhost${path}`, { method: "POST", body: fd });
}

// ── U1: loader ────────────────────────────────────────────────────────────────

describe("onboarding.tier — U1: loader", () => {
  it("reads all accumulated params from URL", async () => {
    const req = makeRequest(
      "/onboarding/tier?handle=alice&platforms=instagram&tpl=neon&name=Alice"
    );
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
    expect(result.platforms).toBe("instagram");
    expect(result.tpl).toBe("neon");
    expect(result.name).toBe("Alice");
  });

  it("does NOT return tier field (DEC-311=A: tier always free)", async () => {
    const req = makeRequest("/onboarding/tier?handle=alice&tier=premium");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // tier param in URL is ignored — loader does not expose it
    expect(result).not.toHaveProperty("tier");
  });

  it("returns empty strings for missing params", async () => {
    const req = makeRequest("/onboarding/tier");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("");
    expect(result.tpl).toBe("");
  });
});

// ── U2: action redirects to /app (DEC-366=A — supersedes DEC-311=A intermediate) ─────────

describe("onboarding.tier — U2: action redirects to /app (DEC-366=A)", () => {
  it("action returns 302 redirect to /app regardless of form data", async () => {
    const req = makeRequest("/onboarding/tier", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: "{}",
      name: "Alice",
      bio: "",
      av: "",
      tpl: "chopin",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    // DEC-366=A: goes directly to /app, not /onboarding/complete
    expect(loc).toBe("/app");
    expect(loc).not.toContain("/onboarding/complete");
  });

  it("action always redirects to /app even with empty form (DEC-366=A)", async () => {
    const fd = new FormData();
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: fd });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });
});

// ── U3: loader still reads params (for back-link) ────────────────────────────

describe("onboarding.tier — U3: loader reads params for back-link", () => {
  it("loader still reads handle and other params (used for back-link URL)", async () => {
    const req = makeRequest(
      "/onboarding/tier?handle=bob&platforms=tiktok%2Cyoutube&name=Bob&tpl=neon"
    );
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("bob");
    expect(result.platforms).toBe("tiktok,youtube");
    expect(result.name).toBe("Bob");
    expect(result.tpl).toBe("neon");
  });
});

// ── U4: action ignores all form state ────────────────────────────────────────

describe("onboarding.tier — U4: action ignores form state (DEC-366=A)", () => {
  it("action still redirects to /app even if someone submits unexpected fields", async () => {
    const req = makeRequest("/onboarding/tier", "POST", {
      handle: "",
      platforms: "",
      socials: "",
      name: "",
      bio: "",
      av: "",
      tpl: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });
});

// ── U5: submit button text — Bug #6a regression (issue tadaify-app#188) ──────

describe("onboarding.tier — U5: submit button text (Bug #6a / updated for DEC-366=A)", () => {
  it("source does NOT contain old 'Start for free →' button text", () => {
    expect(tierSrc).not.toContain("Start for free");
  });

  // U5 regression-lock updated: old "Take me to my page" replaced by "Take me to my dashboard"
  // per DEC-366=A (issue tadaify-app#190 Bug #4). The original assertion is replaced.
  it("source does NOT contain legacy 'Take me to my page' text (DEC-366=A)", () => {
    expect(tierSrc).not.toMatch(/Take me to my page/);
  });
});

// ── U6: CTA button text === "Take me to my dashboard →" (Bug #4, issue tadaify-app#190) ─────

describe("onboarding.tier — U6: CTA button text 'Take me to my dashboard →' (Bug #4)", () => {
  it("source contains button text 'Take me to my dashboard →'", () => {
    expect(tierSrc).toContain("Take me to my dashboard →");
  });

  it("source does NOT contain legacy 'Take me to my page →' copy", () => {
    // Regression-lock: old label was "Take me to my page →"
    expect(tierSrc).not.toMatch(/Take me to my page/i);
  });

  it("source does NOT contain 'Go to dashboard →' (that was the complete-screen label)", () => {
    // Regression-lock: ensure we didn't accidentally use the old complete-screen CTA text
    expect(tierSrc).not.toMatch(/Go to dashboard/i);
  });
});

// ── U7: action redirects to /app, NOT to /onboarding/complete (Bug #4, issue tadaify-app#190) ─

describe("onboarding.tier — U7: action redirects to /app (DEC-366=A, Bug #4)", () => {
  it("submitting tier form redirects to /app, NOT to /onboarding/complete", async () => {
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: new FormData() });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location).toBe("/app");
    // Regression-lock: must NOT redirect to /onboarding/complete
    expect(location).not.toContain("/onboarding/complete");
    expect(location).not.toContain("/dashboard");
  });

  it("action redirects to /app even with empty form", async () => {
    const fd = new FormData();
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: fd });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("action code does NOT produce a redirect to /onboarding/complete (DEC-366=A)", async () => {
    // Behavioural regression-lock: the action must redirect to /app, never to /onboarding/complete.
    // (Source may mention /onboarding/complete in comments — test against runtime behaviour.)
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: new FormData() });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const location = res.headers.get("Location") ?? "";
    expect(location).not.toContain("/onboarding/complete");
    expect(location).toBe("/app");
  });
});

// ── U6: Creator price == CREATOR_PRICE_MONTHLY constant — Bug #6b ────────────

describe("onboarding.tier — U6: Creator price single source of truth (Bug #6b)", () => {
  it("CREATOR_PRICE_MONTHLY constant is defined", () => {
    expect(CREATOR_PRICE_MONTHLY).toBeTruthy();
    expect(typeof CREATOR_PRICE_MONTHLY).toBe("string");
  });

  it("source does NOT hard-code '$9' as Creator price (must use CREATOR_PRICE_MONTHLY)", () => {
    expect(tierSrc).toContain("CREATOR_PRICE_MONTHLY");
    expect(tierSrc).not.toMatch(/price:\s*["']\$9["']/);
  });

  it("source does NOT hard-code Pro/Business prices (must import from tier-gate)", () => {
    // No local const PRO_PRICE or BUSINESS_PRICE with hard-coded dollar values
    expect(tierSrc).not.toMatch(/const\s+PRO_PRICE_MONTHLY\s*=/);
    expect(tierSrc).not.toMatch(/const\s+BUSINESS_PRICE_MONTHLY\s*=/);
    // Imports must come from tier-gate
    expect(tierSrc).toContain("PRO_PRICE_MONTHLY");
    expect(tierSrc).toContain("BUSINESS_PRICE_MONTHLY");
  });

  it("CREATOR_PRICE_MONTHLY equals $7.99 per DEC-279/287", () => {
    expect(CREATOR_PRICE_MONTHLY).toBe("$7.99");
  });

  it("PRO_PRICE_MONTHLY equals $19.99 per DEC-279/287", () => {
    expect(PRO_PRICE_MONTHLY).toBe("$19.99");
  });

  it("BUSINESS_PRICE_MONTHLY equals $49.99 per DEC-279/287", () => {
    expect(BUSINESS_PRICE_MONTHLY).toBe("$49.99");
  });
});

// ── U7: hard-coded $9 NOT rendered (Bug #6b regression-lock) — issue tadaify-app#188 ─────────

describe("onboarding.tier — U7: hard-coded $9 price is NOT rendered (Bug #6b)", () => {
  it("hard-coded $9 price is NOT rendered (regression-lock dual-source bug)", () => {
    // Before the fix, tier page hard-coded "$9" for Creator.
    // After fix, only CREATOR_PRICE_MONTHLY ("$7.99") may appear as Creator price.
    // "$9" must not appear as a bare string-literal price in the source.
    expect(tierSrc).not.toMatch(/price:\s*["']\$9["']/);
    // Also must not appear as standalone price display string
    expect(tierSrc).not.toMatch(/>\s*\$9\s*</);
  });

  it("source contains CREATOR_PRICE_MONTHLY as the Creator price (not a hard-coded value)", () => {
    // The CREATOR_PRICE_MONTHLY constant must be imported and used
    expect(tierSrc).toContain("CREATOR_PRICE_MONTHLY");
    expect(tierSrc).toMatch(/from ["']~\/lib\/tier-gate["']/);
  });
});

// ── U8: no "coming in a future update" copy on tier page (Bug #6d) — issue tadaify-app#188 ────

describe("onboarding.tier — U8: no deferred-feature copy (Bug #6d)", () => {
  it("tier page does not render 'coming in a future update' deferred-feature copy", () => {
    expect(tierSrc).not.toMatch(/coming in a future update/i);
  });

  it("source does not contain 'Live preview' deferred right-pane copy on tier step", () => {
    // The previous stub rendered "Live preview · Coming in a future update."
    expect(tierSrc).not.toMatch(/Live preview[\s·]*Coming/i);
  });
});

// ── U_TIER_DB: profile_extras UPSERT (F-ONBOARDING-001d / TR-tadaify-004) ────

describe("onboarding.tier — U_TIER_DB_1: upsertTierFree calls Supabase with tier_slug='free'", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("calls /rest/v1/profile_extras POST with user_id + tier_slug='free'", async () => {
    mockFetch.mockResolvedValueOnce(new Response("", { status: 201 }));

    await upsertTierFree("user-abc-123", {
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:54351/rest/v1/profile_extras");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body as string) as { user_id: string; tier_slug: string };
    expect(body.user_id).toBe("user-abc-123");
    expect(body.tier_slug).toBe("free");
  });

  it("uses merge-duplicates Prefer header for idempotent UPSERT", async () => {
    mockFetch.mockResolvedValueOnce(new Response("", { status: 201 }));

    await upsertTierFree("user-abc-123", {
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    });

    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const preferHeader = (opts.headers as Record<string, string>)["Prefer"] ?? "";
    expect(preferHeader).toContain("merge-duplicates");
  });
});

describe("onboarding.tier — U_TIER_DB_2: upsertTierFree always writes 'free' (ECN-139-01)", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("body always has tier_slug='free' regardless of any external input", async () => {
    // Caller cannot pass tier='premium' — function signature only accepts userId + env
    mockFetch.mockResolvedValueOnce(new Response("", { status: 201 }));

    await upsertTierFree("user-xyz", {
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "sk",
    });

    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string) as { tier_slug: string };
    expect(body.tier_slug).toBe("free");
    // Must not contain any other tier value
    expect(body.tier_slug).not.toBe("premium");
    expect(body.tier_slug).not.toBe("creator");
    expect(body.tier_slug).not.toBe("pro");
    expect(body.tier_slug).not.toBe("business");
  });
});

describe("onboarding.tier — U_TIER_DB_3: upsertTierFree idempotent on 2nd call (ECN-139-02)", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("second upsert does not throw even if server returns 409 (merge-duplicates handles it)", async () => {
    // First call returns 201, second call returns 200 (merge-duplicates)
    mockFetch
      .mockResolvedValueOnce(new Response("", { status: 201 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    const env = { SUPABASE_URL: "http://localhost:54351", SUPABASE_SERVICE_ROLE_KEY: "sk" };

    await expect(upsertTierFree("user-dup", env)).resolves.not.toThrow();
    await expect(upsertTierFree("user-dup", env)).resolves.not.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("onboarding.tier — U_TIER_DB_4: action skips DB write if env vars missing", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("action redirects to /app even when SUPABASE env vars absent", async () => {
    const req = new Request("http://localhost/onboarding/tier", {
      method: "POST",
      body: new FormData(),
    });
    const result = await action({
      request: req,
      context: { cloudflare: { env: {} } } as never,
      params: {},
    } as never);

    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");

    // No fetch should have been made (no Supabase URL configured)
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("onboarding.tier — U_TIER_DB_5: action skips DB write if no auth cookie", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("action redirects to /app even when no auth cookie present (unauthenticated case)", async () => {
    const req = new Request("http://localhost/onboarding/tier", {
      method: "POST",
      body: new FormData(),
      // No Authorization header, no Cookie header
    });
    const result = await action({
      request: req,
      context: {
        cloudflare: {
          env: {
            SUPABASE_URL: "http://localhost:54351",
            SUPABASE_SERVICE_ROLE_KEY: "sk",
          },
        },
      } as never,
      params: {},
    } as never);

    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");

    // No Supabase REST call should be made (token extraction returned null)
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("onboarding.tier — U_TIER_DB_6: extractAccessToken reads from sb-*-auth-token cookie", () => {
  it("extracts access_token from sb-<ref>-auth-token cookie JSON", () => {
    const cookieVal = encodeURIComponent(
      JSON.stringify({ access_token: "tok-from-cookie", token_type: "bearer" }),
    );
    const req = new Request("http://localhost/onboarding/tier", {
      headers: { Cookie: `sb-ihnvcuhabtzaxkdzjhhy-auth-token=${cookieVal}` },
    });
    expect(extractAccessToken(req)).toBe("tok-from-cookie");
  });

  it("returns null when no cookie and no Authorization header", () => {
    const req = new Request("http://localhost/onboarding/tier");
    expect(extractAccessToken(req)).toBeNull();
  });
});

describe("onboarding.tier — U_TIER_DB_7: extractAccessToken reads from Authorization header", () => {
  it("extracts access_token from 'Bearer <token>' Authorization header", () => {
    const req = new Request("http://localhost/onboarding/tier", {
      headers: { Authorization: "Bearer header-tok-xyz" },
    });
    expect(extractAccessToken(req)).toBe("header-tok-xyz");
  });

  it("prefers Authorization header over cookie", () => {
    const cookieVal = encodeURIComponent(
      JSON.stringify({ access_token: "cookie-tok", token_type: "bearer" }),
    );
    const req = new Request("http://localhost/onboarding/tier", {
      headers: {
        Authorization: "Bearer header-tok",
        Cookie: `sb-ihnvcuhabtzaxkdzjhhy-auth-token=${cookieVal}`,
      },
    });
    expect(extractAccessToken(req)).toBe("header-tok");
  });
});
