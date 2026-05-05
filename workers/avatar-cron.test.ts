/**
 * Unit tests for avatar-cron scheduled handler wiring.
 *
 * Verifies that handleScheduled calls both runOrphanCleanup and
 * consumePendingR2Deletes, and handles missing env gracefully.
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * Codex Finding 2: scheduled handler wiring test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the cleanup module before importing the handler
vi.mock("~/lib/avatar-orphan-cleanup", () => ({
  runOrphanCleanup: vi.fn().mockResolvedValue({ deleted: [], kept: [], errors: [] }),
  consumePendingR2Deletes: vi.fn().mockResolvedValue({ processed: [], errors: [] }),
}));

// Mock mock-r2 for MOCK_R2 mode
vi.mock("~/lib/mock-r2", () => ({
  mockR2: {
    list: vi.fn().mockResolvedValue({ objects: [] }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { handleScheduled } from "./avatar-cron";
import { runOrphanCleanup, consumePendingR2Deletes } from "~/lib/avatar-orphan-cleanup";

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

  it("calls runOrphanCleanup and consumePendingR2Deletes in MOCK_R2 mode", async () => {
    await handleScheduled({
      MOCK_R2: "1",
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });

    expect(runOrphanCleanup).toHaveBeenCalledTimes(1);
    expect(consumePendingR2Deletes).toHaveBeenCalledTimes(1);
  });

  it("skips cron when SUPABASE_URL is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await handleScheduled({
      MOCK_R2: "1",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
    });

    expect(runOrphanCleanup).not.toHaveBeenCalled();
    expect(consumePendingR2Deletes).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing SUPABASE_URL")
    );
    errorSpy.mockRestore();
  });

  it("skips cron when no R2 binding is available", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await handleScheduled({
      SUPABASE_URL: "http://localhost:54351",
      SUPABASE_SERVICE_ROLE_KEY: "test-key",
      // No MOCK_R2, no AVATARS_R2
    });

    expect(runOrphanCleanup).not.toHaveBeenCalled();
    expect(consumePendingR2Deletes).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No R2 binding")
    );
    errorSpy.mockRestore();
  });
});
