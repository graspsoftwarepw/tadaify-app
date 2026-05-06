/**
 * Worker scheduled handler — avatar cleanup cron.
 *
 * Runs two jobs on each cron tick:
 *   1. runOrphanCleanup — deletes R2 objects > 24h old that are not bound to any profile_extras row.
 *   2. consumePendingR2Deletes — processes the pending_r2_deletes queue (GDPR Art. 17).
 *
 * Both jobs are idempotent and partial-failure safe (per-row isolation).
 *
 * Wrangler trigger: [triggers] crons = ["0 3 * * *"] (daily at 03:00 UTC)
 *
 * Local dev: @cloudflare/vite-plugin provides miniflare-backed AVATARS_R2 binding.
 * No MOCK_R2 stub needed — the binding works the same in local and production.
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: 24h orphan cleanup cron, GDPR R2 delete queue consumer
 * ECN-138-06, ECN-138-12
 */

import {
  runOrphanCleanup,
  consumePendingR2Deletes,
  type R2BucketLike,
  type AvatarCleanupDeps,
  type QueueConsumerDeps,
} from "~/lib/avatar-orphan-cleanup";

interface CronEnv {
  AVATARS_R2?: R2Bucket;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Builds AvatarCleanupDeps from the Worker env.
 * getBoundKeys queries Supabase for all non-null avatar_r2_key values.
 */
function buildCleanupDeps(r2: R2BucketLike, supabaseUrl: string, serviceKey: string): AvatarCleanupDeps {
  return {
    r2,
    async getBoundKeys(): Promise<Set<string>> {
      const PAGE_SIZE = 1000;
      const keys = new Set<string>();
      let offset = 0;

      // Paginate through all profile_extras rows with non-null avatar_r2_key.
      // Fail closed: any non-2xx page throws, aborting the entire cleanup pass.
      while (true) {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/profile_extras?select=avatar_r2_key&avatar_r2_key=not.is.null&order=avatar_r2_key.asc&limit=${PAGE_SIZE}&offset=${offset}`,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          }
        );
        if (!res.ok) {
          const body = await res.text();
          console.error("[avatar-cron] Failed to fetch bound keys:", res.status, body);
          throw new Error(`getBoundKeys failed: HTTP ${res.status} — ${body}`);
        }
        const rows = (await res.json()) as Array<{ avatar_r2_key: string }>;
        for (const r of rows) {
          keys.add(r.avatar_r2_key);
        }
        if (rows.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      return keys;
    },
  };
}

/**
 * Builds QueueConsumerDeps from the Worker env.
 * Reads unconsumed rows from pending_r2_deletes and marks them consumed via Supabase REST.
 */
function buildQueueDeps(r2: R2BucketLike, supabaseUrl: string, serviceKey: string): QueueConsumerDeps {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  return {
    r2,
    async getUnconsumedDeletes() {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/pending_r2_deletes?select=id,r2_key&consumed_at=is.null&order=id.asc&limit=100`,
        { headers }
      );
      if (!res.ok) {
        console.error("[avatar-cron] Failed to fetch pending deletes:", res.status, await res.text());
        return [];
      }
      return (await res.json()) as Array<{ id: number; r2_key: string }>;
    },
    async markConsumed(id: number) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/pending_r2_deletes?id=eq.${id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ consumed_at: new Date().toISOString() }),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to mark row ${id} consumed: ${res.status}`);
      }
    },
  };
}

/**
 * Scheduled handler entry point — called by Workers cron trigger.
 */
export async function handleScheduled(env: CronEnv): Promise<void> {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[avatar-cron] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — skipping cron");
    return;
  }

  // R2 binding — provided by wrangler (miniflare in local dev, real binding in prod)
  const r2 = env.AVATARS_R2;
  if (!r2) {
    console.error("[avatar-cron] No R2 binding available — skipping cron");
    return;
  }

  // 1. Orphan cleanup — fail-closed: if getBoundKeys throws (e.g. Supabase
  //    outage), skip orphan cleanup entirely to avoid deleting valid avatars.
  const cleanupDeps = buildCleanupDeps(r2 as unknown as R2BucketLike, supabaseUrl, serviceKey);
  try {
    const cleanupResult = await runOrphanCleanup(cleanupDeps);
    console.info("[avatar-cron] orphan cleanup:", {
      deleted: cleanupResult.deleted.length,
      kept: cleanupResult.kept.length,
      errors: cleanupResult.errors.length,
    });
    if (cleanupResult.errors.length > 0) {
      console.warn("[avatar-cron] orphan cleanup errors:", cleanupResult.errors);
    }
  } catch (err) {
    console.error("[avatar-cron] orphan cleanup skipped — bound-key lookup failed:", err);
  }

  // 2. GDPR queue consumer — runs independently of orphan cleanup
  const queueDeps = buildQueueDeps(r2 as unknown as R2BucketLike, supabaseUrl, serviceKey);
  const queueResult = await consumePendingR2Deletes(queueDeps);
  console.info("[avatar-cron] GDPR queue:", {
    processed: queueResult.processed.length,
    errors: queueResult.errors.length,
  });
  if (queueResult.errors.length > 0) {
    console.warn("[avatar-cron] GDPR queue errors:", queueResult.errors);
  }
}
