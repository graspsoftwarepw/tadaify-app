/**
 * Unit tests for avatar-cron scheduled handler wiring.
 *
 * Verifies that handleScheduled calls both runOrphanCleanup and
 * consumePendingR2Deletes, and handles missing env gracefully.
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * Codex Finding 2: scheduled handler wiring test
 *
 * Hermetic: mocks the cleanup module + uses a vi.fn() R2 binding.
 * No miniflare, no real Supabase. Per feedback_ci_unit_tests_allowed.md.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the cleanup module before importing the handler
vi.mock("~/lib/avatar-orphan-cleanup", () => ({
  runOrphanCleanup: vi.fn().mockResolvedValue({ deleted: [], kept: [], errors: [] }),
  consumePendingR2Deletes: vi.fn().mockResolvedValue({ processed: [], errors: [] }),
}));

import { handleScheduled } from "./avatar-cron";
import { runOrphanCleanup, consumePendingR2Deletes } from "~/lib/avatar-orphan-cleanup";

/** Minimal fake R2 binding — hermetic vi.fn() mock, no miniflare needed in unit tests. */
function makeFakeR2(): R2Bucket {
  return {
    put: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ objects: [] }),
    head: vi.fn().mockResolvedValue(null),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  } as unknown as R2Bucket;
}

describe("handleScheduled — avatar cron wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub fetch for Supabase REST calls (getBoundKeys, getUnconsumedDeletes)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls runOrphanCleanup and consumePendingR2Deletes when AVATARS_R2 binding is present", async () => {
    await handleScheduled({
      AVATARS_R2: makeFakeR2(),
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });

    expect(runOrphanCleanup).toHaveBeenCalledTimes(1);
    expect(consumePendingR2Deletes).toHaveBeenCalledTimes(1);
  });

  it("skips cron when SUPABASE_URL is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await handleScheduled({
      AVATARS_R2: makeFakeR2(),
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });

    expect(runOrphanCleanup).not.toHaveBeenCalled();
    expect(consumePendingR2Deletes).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing SUPABASE_URL")
    );
    errorSpy.mockRestore();
  });

  it("skips orphan cleanup when runOrphanCleanup throws but still runs GDPR queue", async () => {
    // Simulate getBoundKeys failure propagating as a throw from runOrphanCleanup
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    (runOrphanCleanup as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("getBoundKeys failed: HTTP 500 — Internal Server Error")
    );

    await handleScheduled({
      AVATARS_R2: makeFakeR2(),
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });

    // Orphan cleanup threw, but GDPR queue consumer still ran
    expect(consumePendingR2Deletes).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("orphan cleanup skipped"),
      expect.anything()
    );

    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it("skips cron when no R2 binding is available", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await handleScheduled({
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
      // No AVATARS_R2
    });

    expect(runOrphanCleanup).not.toHaveBeenCalled();
    expect(consumePendingR2Deletes).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No R2 binding")
    );
    errorSpy.mockRestore();
  });
});
