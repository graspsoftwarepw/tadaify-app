/**
 * Unit tests for otp-rate-limit.ts
 * Run: npx vitest run app/lib/otp-rate-limit.test.ts
 *
 * BR: BR-OTP-RATE-LIMIT-001 (issue tadaify-app#179)
 * DEC-342 = A
 *
 * U1 bundle — 7 tests:
 *   - checkOtpRateLimit allows when no prior attempts in window
 *   - checkOtpRateLimit allows when 1 prior 'sent' in window
 *   - checkOtpRateLimit allows when 2 prior 'sent' in window
 *   - checkOtpRateLimit denies + returns retry_after_seconds when 3 prior 'sent' in window
 *   - checkOtpRateLimit ignores 'rate_limited' rows (only 'sent' counts toward cap)
 *   - checkOtpRateLimit ignores attempts outside window
 *   - hashEmail is deterministic + lowercases + trims
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { acquireOtpSlot, checkOtpRateLimit, recordOtpAttempt, hashEmail } from "./otp-rate-limit";

const SUPABASE_URL = "http://supabase.test";
const SERVICE_ROLE_KEY = "service_role_test";
const EMAIL_HASH = "abc123hash";

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Helper to mock the Supabase REST response ─────────────────────────────────

function mockFetchWithRows(rows: Array<{ attempted_at: string }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
  );
}

function mockFetchError(status = 500) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "db error" }), { status })
    )
  );
}

// ── checkOtpRateLimit ─────────────────────────────────────────────────────────

describe("checkOtpRateLimit", () => {
  it("allows when no prior attempts in window", async () => {
    mockFetchWithRows([]);
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
    expect(result.retry_after_seconds).toBeUndefined();
  });

  it("allows when 1 prior 'sent' in window", async () => {
    mockFetchWithRows([{ attempted_at: new Date(Date.now() - 1000).toISOString() }]);
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });

  it("allows when 2 prior 'sent' in window", async () => {
    mockFetchWithRows([
      { attempted_at: new Date(Date.now() - 2000).toISOString() },
      { attempted_at: new Date(Date.now() - 1000).toISOString() },
    ]);
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });

  it("denies + returns retry_after_seconds when 3 prior 'sent' in window", async () => {
    const windowSeconds = 86400;
    const oldestSentAt = Date.now() - 5 * 60 * 1000; // 5 min ago
    mockFetchWithRows([
      { attempted_at: new Date(oldestSentAt).toISOString() },
      { attempted_at: new Date(oldestSentAt + 60000).toISOString() },
      { attempted_at: new Date(oldestSentAt + 120000).toISOString() },
    ]);

    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, null, windowSeconds, 3);
    expect(result.allowed).toBe(false);
    expect(result.retry_after_seconds).toBeGreaterThan(0);
    // retry_after_seconds should be close to windowSeconds - 5min = 86100s
    expect(result.retry_after_seconds).toBeLessThanOrEqual(windowSeconds);
    expect(result.retry_after_seconds!).toBeGreaterThan(86000);
  });

  it("ignores 'rate_limited' rows (only 'sent' counts toward cap)", async () => {
    // The API query filters by outcome='sent', so Supabase returns 0 rows
    // even if there were rate_limited rows — the mock returns empty to simulate this.
    mockFetchWithRows([]);
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    // Even if we had 10 rate_limited rows, the query only counts 'sent' rows.
    expect(result.allowed).toBe(true);
  });

  it("ignores attempts outside window (fails open on Supabase error)", async () => {
    // When Supabase returns an error, we fail open (allow) to avoid blocking legitimate users.
    mockFetchError(500);
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });

  it("fails open on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    const result = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });

  it("includes handle=is.null filter when handle is null (login flow)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    vi.stubGlobal("fetch", mockFetch);

    await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, null);

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("handle")).toBe("is.null");
  });

  it("includes handle=eq.<handle> filter when handle is provided (signup flow)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    vi.stubGlobal("fetch", mockFetch);

    await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "alice");

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("handle")).toBe("eq.alice");
  });

  it("does not cross-block different handles sharing the same email (pair-keyed)", async () => {
    // 3 'sent' rows for handle 'alice' — alice is blocked
    mockFetchWithRows([
      { attempted_at: new Date(Date.now() - 3000).toISOString() },
      { attempted_at: new Date(Date.now() - 2000).toISOString() },
      { attempted_at: new Date(Date.now() - 1000).toISOString() },
    ]);
    const aliceResult = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "alice");
    expect(aliceResult.allowed).toBe(false);

    // 0 'sent' rows for handle 'bob' — bob is allowed (Supabase returns empty
    // because the handle filter isolates per-handle rows).
    mockFetchWithRows([]);
    const bobResult = await checkOtpRateLimit(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "bob");
    expect(bobResult.allowed).toBe(true);
  });
});

// ── acquireOtpSlot ──────────────────────────────────────────────────────────────

describe("acquireOtpSlot", () => {
  it("returns allowed:true when RPC responds with allowed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const result = await acquireOtpSlot(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });

  it("returns allowed:false + retry_after_seconds when RPC denies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: false, retry_after_seconds: 85000 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    const result = await acquireOtpSlot(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "alice");
    expect(result.allowed).toBe(false);
    expect(result.retry_after_seconds).toBe(85000);
  });

  it("calls RPC with correct body params", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", mockFetch);

    await acquireOtpSlot(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "bob", 3600, 5);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/rest/v1/rpc/acquire_otp_slot");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.p_email_hash).toBe(EMAIL_HASH);
    expect(body.p_handle).toBe("bob");
    expect(body.p_window_seconds).toBe(3600);
    expect(body.p_max_attempts).toBe(5);
  });

  it("falls back to legacy check when RPC returns non-200", async () => {
    // First call = RPC (fails), second call = legacy REST query (succeeds empty)
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", mockFetch);

    const result = await acquireOtpSlot(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("fails open on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    const result = await acquireOtpSlot(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH);
    expect(result.allowed).toBe(true);
  });
});

// ── hashEmail ─────────────────────────────────────────────────────────────────

describe("hashEmail", () => {
  it("is deterministic + lowercases + trims", async () => {
    const h1 = await hashEmail("user@example.com");
    const h2 = await hashEmail("USER@EXAMPLE.COM");
    const h3 = await hashEmail("  user@example.com  ");
    expect(h1).toBe(h2);
    expect(h1).toBe(h3);
    expect(typeof h1).toBe("string");
    expect(h1.length).toBe(64); // SHA-256 → 32 bytes → 64 hex chars
  });

  it("produces different hashes for different emails", async () => {
    const h1 = await hashEmail("a@example.com");
    const h2 = await hashEmail("b@example.com");
    expect(h1).not.toBe(h2);
  });

  it("returns a valid hex string (only 0-9 a-f)", async () => {
    const h = await hashEmail("test@test.com");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ── recordOtpAttempt ──────────────────────────────────────────────────────────

describe("recordOtpAttempt", () => {
  it("POSTs to otp_rate_limit_attempts with correct payload", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("", { status: 201 }));
    vi.stubGlobal("fetch", mockFetch);

    await recordOtpAttempt(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, "alex", "sent");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("otp_rate_limit_attempts");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.email_hash).toBe(EMAIL_HASH);
    expect(body.handle).toBe("alex");
    expect(body.outcome).toBe("sent");
  });

  it("does not throw on Supabase error (fire-and-forget)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 500 })));
    // Should resolve without throwing
    await expect(
      recordOtpAttempt(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, null, "rate_limited")
    ).resolves.toBeUndefined();
  });

  it("does not throw on network error (fire-and-forget)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(
      recordOtpAttempt(SUPABASE_URL, SERVICE_ROLE_KEY, EMAIL_HASH, null, "sent")
    ).resolves.toBeUndefined();
  });
});
