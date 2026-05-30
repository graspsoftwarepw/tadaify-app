/**
 * Unit tests for user-export-data Edge Function
 * Story: F-APP-DASHBOARD-001a (#171) — Codex review P2 fix (PR #174)
 * Story: F-ONBOARDING-001d (#139) — profile_extras added (ECN-139-07)
 *
 * Tests the error-propagation behaviour added in the Codex P2 fix:
 *   U_EXPORT_1: returns 500 with failed_dataset when profiles read fails
 *   U_EXPORT_2: returns 500 with failed_dataset when blocks read fails
 *   U_EXPORT_3: happy path returns 200 with all 5 datasets (incl. profile_extras)
 *   U_EXPORT_4: profile_extras read failure → 500 (ECN-139-07 / TR-tadaify-007)
 *   U_EXPORT_5: profile_extras.tier_slug included in happy-path export payload
 *
 * Run: npx vitest run supabase/functions/user-export-data/index.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Deno shim ─────────────────────────────────────────────────────────────────
// The Edge Function uses Deno APIs. Stub them before importing.

const mockEnv: Record<string, string> = {
  SUPABASE_URL: "http://supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

vi.stubGlobal("Deno", {
  env: { get: (key: string) => mockEnv[key] ?? "" },
  serve: (handler: (req: Request) => Promise<Response>) => {
    // Capture the handler so tests can call it directly
    (globalThis as unknown as { _edgeHandler: typeof handler })._edgeHandler = handler;
  },
});

// ── Supabase client mock ──────────────────────────────────────────────────────

type MockResponse<T> = { data: T | null; error: { message: string } | null };

interface MockClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
}

let mockClient: MockClient;

// Per-test overridable query results
let profilesResult: MockResponse<unknown[]>;
let settingsResult: MockResponse<unknown[]>;
let pagesResult: MockResponse<unknown[]>;
let blocksResult: MockResponse<unknown[]>;
let profileExtrasResult: MockResponse<unknown[]>;

// Stub the types-only side-effect import (Deno-only specifier; harmless in Node).
vi.mock("jsr:@supabase/functions-js/edge-runtime.d.ts", () => ({}));

vi.mock("npm:@supabase/supabase-js@2.49.1", () => {
  return {
    createClient: () => mockClient,
    // Re-export PostgrestError type (used as instanceof — not needed at runtime)
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEST_USER_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const VALID_JWT = "valid.jwt.token";

function makeRequest(jwt: string = VALID_JWT): Request {
  return new Request("http://supabase.test/functions/v1/user-export-data", {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

async function callHandler(req: Request): Promise<Response> {
  const handler = (globalThis as unknown as { _edgeHandler: (r: Request) => Promise<Response> })
    ._edgeHandler;
  return handler(req);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  // Default happy-path results
  profilesResult = { data: [{ id: TEST_USER_ID, handle: "testuser" }], error: null };
  settingsResult = { data: [{ id: TEST_USER_ID, theme: "dark" }], error: null };
  pagesResult = { data: [{ id: "page-1", user_id: TEST_USER_ID }], error: null };
  blocksResult = { data: [{ id: "block-1", user_id: TEST_USER_ID }], error: null };
  profileExtrasResult = {
    data: [{ user_id: TEST_USER_ID, tier_slug: "free" }],
    error: null,
  };

  mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: TEST_USER_ID, email: "test@example.com" } },
        error: null,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      const resultMap: Record<string, MockResponse<unknown[]>> = {
        profiles: profilesResult,
        account_settings: settingsResult,
        pages: pagesResult,
        blocks: blocksResult,
        profile_extras: profileExtrasResult,
      };
      const res = resultMap[table] ?? { data: [], error: null };
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(res),
      };
    }),
  };

  // Import (or re-import) the module to register the Deno.serve handler
  vi.resetModules();
  await import("./index.ts");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── U_EXPORT_1: profiles read failure → 500 with failed_dataset ──────────────

describe("user-export-data — U_EXPORT_1: profiles read failure", () => {
  it("returns 500 with failed_dataset='profiles' when profiles read fails", async () => {
    profilesResult = { data: null, error: { message: "connection refused" } };

    const res = await callHandler(makeRequest());
    const body = (await res.json()) as { error: string; failed_dataset: string };

    expect(res.status).toBe(500);
    expect(body.error).toBe("export_failed");
    expect(body.failed_dataset).toBe("profiles");
  });
});

// ── U_EXPORT_2: blocks read failure → 500 with failed_dataset ────────────────

describe("user-export-data — U_EXPORT_2: blocks read failure", () => {
  it("returns 500 with failed_dataset='blocks' when blocks read fails", async () => {
    blocksResult = { data: null, error: { message: "timeout" } };

    const res = await callHandler(makeRequest());
    const body = (await res.json()) as { error: string; failed_dataset: string };

    expect(res.status).toBe(500);
    expect(body.error).toBe("export_failed");
    expect(body.failed_dataset).toBe("blocks");
  });
});

// ── U_EXPORT_3: happy path ────────────────────────────────────────────────────

describe("user-export-data — U_EXPORT_3: happy path returns 200 with all 5 datasets", () => {
  it("returns 200 with all 5 datasets on success (incl. profile_extras)", async () => {
    const res = await callHandler(makeRequest());
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    // All five keys must be present
    expect(body).toHaveProperty("profile");
    expect(body).toHaveProperty("account_settings");
    expect(body).toHaveProperty("profile_extras");
    expect(body).toHaveProperty("pages");
    expect(body).toHaveProperty("blocks");
    // Metadata fields
    expect(body).toHaveProperty("exported_at");
    expect(body).toHaveProperty("user_id", TEST_USER_ID);
    expect(body).toHaveProperty("email", "test@example.com");
    // Content-Disposition header present
    expect(res.headers.get("Content-Disposition")).toMatch(/attachment; filename=/);
  });
});

// ── U_EXPORT_4: profile_extras read failure → 500 ────────────────────────────
// Covers ECN-139-07 / TR-tadaify-007: export must include profile_extras or fail clearly

describe("user-export-data — U_EXPORT_4: profile_extras read failure", () => {
  it("returns 500 with failed_dataset='profile_extras' when profile_extras read fails", async () => {
    profileExtrasResult = { data: null, error: { message: "relation does not exist" } };

    const res = await callHandler(makeRequest());
    const body = (await res.json()) as { error: string; failed_dataset: string };

    expect(res.status).toBe(500);
    expect(body.error).toBe("export_failed");
    expect(body.failed_dataset).toBe("profile_extras");
  });
});

// ── U_EXPORT_5: tier_slug included in export payload ─────────────────────────
// Covers ECN-139-07 / GDPR Art. 20 / TR-tadaify-007

describe("user-export-data — U_EXPORT_5: tier_slug present in export payload", () => {
  it("exported profile_extras contains tier_slug='free'", async () => {
    const res = await callHandler(makeRequest());
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    const extras = body.profile_extras as { tier_slug: string } | null;
    expect(extras).not.toBeNull();
    expect(extras?.tier_slug).toBe("free");
  });

  it("profile_extras is null in export when user has no extras row (new user pre-onboarding)", async () => {
    profileExtrasResult = { data: [], error: null };

    const res = await callHandler(makeRequest());
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    // (extras as unknown[])[0] ?? null → null when array is empty
    expect(body.profile_extras).toBeNull();
  });
});
