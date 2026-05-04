/**
 * Unit tests for user-export-data Edge Function
 * Story: F-APP-DASHBOARD-001a (#171) — Codex review P2 fix (PR #174)
 *
 * Tests the error-propagation behaviour added in the Codex P2 fix:
 *   U_EXPORT_1: returns 500 with failed_dataset when profiles read fails
 *   U_EXPORT_2: returns 500 with failed_dataset when blocks read fails
 *   U_EXPORT_3: happy path returns 200 with all 4 datasets
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

vi.mock("https://esm.sh/@supabase/supabase-js@2", () => {
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

describe("user-export-data — U_EXPORT_3: happy path", () => {
  it("returns 200 with all 4 datasets on success", async () => {
    const res = await callHandler(makeRequest());
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    // All four keys must be present
    expect(body).toHaveProperty("profile");
    expect(body).toHaveProperty("account_settings");
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
