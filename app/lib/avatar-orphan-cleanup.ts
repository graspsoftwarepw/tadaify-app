/**
 * avatar-orphan-cleanup — Worker cron logic for cleaning up unbound R2 avatar objects.
 *
 * Strategy:
 *   1. Query `profile_extras` for all `avatar_r2_key` values (bound keys).
 *   2. List all objects under `avatars/` prefix in R2 that are older than ORPHAN_TTL_MS.
 *   3. Delete any R2 object whose key is NOT in the set of bound keys.
 *
 * In local dev, AVATARS_R2 is emulated by miniflare via @cloudflare/vite-plugin.
 * In production, it runs against the real R2 binding.
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: 24h orphan cleanup cron
 *
 * GDPR note: GDPR-triggered R2 deletes are handled separately via the
 * `enqueueR2DeleteForUser` helper (called from `delete_user_data()` wiring).
 *
 * Unit tests: app/lib/avatar-orphan-cleanup.test.ts (U3)
 */

/** Orphan TTL: 24 hours. Objects younger than this are kept even if unbound. */
export const ORPHAN_TTL_MS = 24 * 60 * 60 * 1000;

// ── Interface ──────────────────────────────────────────────────────────────────

export interface R2ListResult {
  objects: Array<{ key: string; uploaded: Date }>;
}

export interface R2BucketLike {
  list(options?: { prefix?: string }): Promise<R2ListResult>;
  delete(key: string): Promise<void>;
}

export interface AvatarCleanupDeps {
  r2: R2BucketLike;
  /** Returns all currently bound avatar_r2_key values from profile_extras. */
  getBoundKeys(): Promise<Set<string>>;
  /** Current time (injectable for tests). Defaults to Date.now(). */
  now?: number;
}

export interface CleanupResult {
  deleted: string[];
  kept: string[];
  errors: Array<{ key: string; error: string }>;
}

// ── Orphan cleanup ─────────────────────────────────────────────────────────────

/**
 * Runs the orphan cleanup pass.
 *
 * Lists all `avatars/` prefixed objects in R2, filters to those:
 *   - Older than ORPHAN_TTL_MS
 *   - NOT referenced by any `profile_extras.avatar_r2_key`
 * and deletes them.
 */
export async function runOrphanCleanup(deps: AvatarCleanupDeps): Promise<CleanupResult> {
  const now = deps.now ?? Date.now();
  const result: CleanupResult = { deleted: [], kept: [], errors: [] };

  const [listResult, boundKeys] = await Promise.all([
    deps.r2.list({ prefix: "avatars/" }),
    deps.getBoundKeys(),
  ]);

  for (const obj of listResult.objects) {
    const ageMs = now - obj.uploaded.getTime();

    // Keep objects that are still "fresh" (within TTL)
    if (ageMs < ORPHAN_TTL_MS) {
      result.kept.push(obj.key);
      continue;
    }

    // Keep objects that are bound to a profile_extras row
    if (boundKeys.has(obj.key)) {
      result.kept.push(obj.key);
      continue;
    }

    // Delete orphan
    try {
      await deps.r2.delete(obj.key);
      result.deleted.push(obj.key);
    } catch (err) {
      result.errors.push({
        key: obj.key,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

// ── GDPR delete helper ─────────────────────────────────────────────────────────

export interface GdprDeleteDeps {
  r2: R2BucketLike;
  /** Lists all R2 keys under `avatars/<userId>/` prefix. */
}

/**
 * Enqueues R2 delete for a specific user's avatar objects.
 * Called from the `delete_user_data()` wiring at account deletion time.
 * Deletes synchronously via the R2 binding (miniflare in local dev, real binding in prod).
 */
export async function deleteUserAvatarObjects(
  r2: R2BucketLike,
  userId: string
): Promise<{ deleted: string[] }> {
  const prefix = `avatars/${userId}/`;
  const listResult = await r2.list({ prefix });
  const deleted: string[] = [];

  for (const obj of listResult.objects) {
    await r2.delete(obj.key);
    deleted.push(obj.key);
  }

  return { deleted };
}

// ── GDPR queue consumer (pending_r2_deletes) ──────────────────────────────────
//
// Reads unconsumed rows from `pending_r2_deletes`, deletes each R2 key,
// and marks the row consumed only after successful deletion.
// Failed rows remain pending for the next cron tick (partial-failure safe).
//
// Wired into the Worker cron entry point alongside runOrphanCleanup.
// ECN-138-12: GDPR Art. 17 cross-storage cleanup.

export interface PendingR2DeleteRow {
  id: number;
  r2_key: string;
}

export interface QueueConsumerDeps {
  r2: R2BucketLike;
  /** Returns rows from pending_r2_deletes WHERE consumed_at IS NULL. */
  getUnconsumedDeletes(): Promise<PendingR2DeleteRow[]>;
  /** Sets consumed_at = now() for the given row id. */
  markConsumed(id: number): Promise<void>;
}

export interface QueueConsumerResult {
  processed: PendingR2DeleteRow[];
  errors: Array<{ id: number; r2_key: string; error: string }>;
}

/**
 * Consumes the pending_r2_deletes queue: deletes each R2 key then marks consumed.
 * Per-row failure isolation: a failed row stays pending; other rows proceed.
 */
export async function consumePendingR2Deletes(
  deps: QueueConsumerDeps
): Promise<QueueConsumerResult> {
  const result: QueueConsumerResult = { processed: [], errors: [] };
  const rows = await deps.getUnconsumedDeletes();

  for (const row of rows) {
    try {
      await deps.r2.delete(row.r2_key);
      await deps.markConsumed(row.id);
      result.processed.push(row);
    } catch (err) {
      result.errors.push({
        id: row.id,
        r2_key: row.r2_key,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
