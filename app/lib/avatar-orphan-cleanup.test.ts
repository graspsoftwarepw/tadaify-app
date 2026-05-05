/**
 * Unit tests for avatar-orphan-cleanup — orphan cleanup logic + GDPR delete helper.
 *
 * U3 — Orphan cleanup query + R2 delete on GDPR (issue tadaify-app#138)
 * Covers: TR-tadaify-003 (24h orphan cleanup, GDPR R2 delete)
 * ECN-138-06 (abandoned wizard — orphan cleanup), ECN-138-12 (GDPR Art. 17)
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  runOrphanCleanup,
  deleteUserAvatarObjects,
  ORPHAN_TTL_MS,
  type R2BucketLike,
  type R2ListResult,
} from "./avatar-orphan-cleanup";

// ── Mock R2 bucket ────────────────────────────────────────────────────────────

class MockBucket implements R2BucketLike {
  private store = new Map<string, { key: string; uploadedAt: Date }>();
  public deletedKeys: string[] = [];

  seed(key: string, ageMs: number) {
    this.store.set(key, {
      key,
      uploadedAt: new Date(Date.now() - ageMs),
    });
  }

  async list(options?: { prefix?: string }): Promise<R2ListResult> {
    const prefix = options?.prefix ?? "";
    const objects = [];
    for (const obj of this.store.values()) {
      if (obj.key.startsWith(prefix)) objects.push(obj);
    }
    return { objects };
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.deletedKeys.push(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = Date.now();
const USER_A = "user-a";
const USER_B = "user-b";
const KEY_A1 = `avatars/${USER_A}/uuid1.jpg`;
const KEY_A2 = `avatars/${USER_A}/uuid2.png`;
const KEY_B1 = `avatars/${USER_B}/uuid3.jpg`;

// ── runOrphanCleanup tests ────────────────────────────────────────────────────

describe("runOrphanCleanup — U3", () => {
  let bucket: MockBucket;

  beforeEach(() => {
    bucket = new MockBucket();
  });

  it("lists r2_keys older than 24h with no profile_extras binding → deletes them", async () => {
    // KEY_A1 is 25h old and unbound — should be deleted
    bucket.seed(KEY_A1, ORPHAN_TTL_MS + 1 * 60 * 60 * 1000);

    const result = await runOrphanCleanup({
      r2: bucket,
      getBoundKeys: async () => new Set<string>(),
      now: NOW,
    });

    expect(result.deleted).toContain(KEY_A1);
    expect(result.kept).toHaveLength(0);
    expect(bucket.has(KEY_A1)).toBe(false);
  });

  it("ignores keys < 24h old (still within TTL)", async () => {
    // KEY_A1 is only 1h old — too fresh to clean up
    bucket.seed(KEY_A1, 1 * 60 * 60 * 1000);

    const result = await runOrphanCleanup({
      r2: bucket,
      getBoundKeys: async () => new Set<string>(),
      now: NOW,
    });

    expect(result.deleted).toHaveLength(0);
    expect(result.kept).toContain(KEY_A1);
  });

  it("ignores keys bound to a profile_extras row (avatar_r2_key set)", async () => {
    // KEY_A1 is 25h old BUT bound to a profile_extras row — must NOT be deleted
    bucket.seed(KEY_A1, ORPHAN_TTL_MS + 1 * 60 * 60 * 1000);

    const result = await runOrphanCleanup({
      r2: bucket,
      getBoundKeys: async () => new Set<string>([KEY_A1]),
      now: NOW,
    });

    expect(result.deleted).toHaveLength(0);
    expect(result.kept).toContain(KEY_A1);
  });

  it("deletes only unbound old keys, keeps bound and fresh keys", async () => {
    // KEY_A1: old + unbound → delete
    bucket.seed(KEY_A1, ORPHAN_TTL_MS + 2 * 60 * 60 * 1000);
    // KEY_A2: old + bound → keep
    bucket.seed(KEY_A2, ORPHAN_TTL_MS + 2 * 60 * 60 * 1000);
    // KEY_B1: fresh + unbound → keep (too new)
    bucket.seed(KEY_B1, 30 * 60 * 1000);

    const result = await runOrphanCleanup({
      r2: bucket,
      getBoundKeys: async () => new Set<string>([KEY_A2]),
      now: NOW,
    });

    expect(result.deleted).toEqual([KEY_A1]);
    expect(result.kept).toContain(KEY_A2);
    expect(result.kept).toContain(KEY_B1);
  });

  it("records errors if R2 delete throws, continues with remaining objects", async () => {
    bucket.seed(KEY_A1, ORPHAN_TTL_MS + 1 * 60 * 60 * 1000);
    bucket.seed(KEY_B1, ORPHAN_TTL_MS + 1 * 60 * 60 * 1000);

    // Patch delete to throw on KEY_A1
    const originalDelete = bucket.delete.bind(bucket);
    bucket.delete = async (key: string) => {
      if (key === KEY_A1) throw new Error("simulated R2 error");
      return originalDelete(key);
    };

    const result = await runOrphanCleanup({
      r2: bucket,
      getBoundKeys: async () => new Set<string>(),
      now: NOW,
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].key).toBe(KEY_A1);
    expect(result.deleted).toContain(KEY_B1);
  });
});

// ── deleteUserAvatarObjects tests ──────────────────────────────────────────────

describe("deleteUserAvatarObjects — GDPR delete helper — U3", () => {
  let bucket: MockBucket;

  beforeEach(() => {
    bucket = new MockBucket();
  });

  it("deletes all keys under avatars/<userId>/ prefix", async () => {
    bucket.seed(KEY_A1, 1000);
    bucket.seed(KEY_A2, 1000);
    bucket.seed(KEY_B1, 1000); // different user — must NOT be deleted

    const result = await deleteUserAvatarObjects(bucket, USER_A);

    expect(result.deleted).toContain(KEY_A1);
    expect(result.deleted).toContain(KEY_A2);
    expect(result.deleted).not.toContain(KEY_B1);
    expect(bucket.has(KEY_A1)).toBe(false);
    expect(bucket.has(KEY_A2)).toBe(false);
    expect(bucket.has(KEY_B1)).toBe(true); // untouched
  });

  it("returns empty deleted array when user has no avatar objects", async () => {
    // No objects seeded for USER_A
    const result = await deleteUserAvatarObjects(bucket, USER_A);
    expect(result.deleted).toHaveLength(0);
  });

  it("GDPR delete handler enqueues R2 delete for user's avatar_r2_key (mock SDK assertion)", async () => {
    bucket.seed(KEY_A1, 1000);

    await deleteUserAvatarObjects(bucket, USER_A);

    // Assert SDK was called (mock bucket records deleted keys)
    expect(bucket.deletedKeys).toContain(KEY_A1);
  });
});
