/**
 * queries — read-side D1 aggregation for the Insights dashboard.
 *
 * Reads the local-first `raw_events` table (F-INSIGHTS-D1-001). Creator-facing
 * numbers always exclude bots (`is_bot = 0`). The query window is tier-gated per
 * DEC-076/078 (Free 7d / Creator 90d / Pro 1y / Business unlimited) — a
 * Category B (cadence/window) gate, NOT a data-dimension gate (those stay
 * ungated per Category C).
 *
 * Pre-aggregation rollups are a later optimisation; at dev + early-prod scale
 * we group over raw_events directly.
 *
 * Story: F-INSIGHTS-DASH-001 (DEC-076/078/079).
 */

import { utcDateKey } from "./visitor-hash";

export type InsightsTier = "free" | "creator" | "pro" | "business";

/** Query-window length per tier (Category B gate). `null` = unlimited. */
export const WINDOW_DAYS_BY_TIER: Record<InsightsTier, number | null> = {
  free: 7,
  creator: 90,
  pro: 365,
  business: null,
};

function normalizeTier(tier: string): InsightsTier {
  return tier === "creator" || tier === "pro" || tier === "business" ? tier : "free";
}

/**
 * Inclusive lower-bound date_key for a tier's window, or null for unlimited.
 * e.g. free (7d) on 2026-05-31 → 2026-05-25 (today + 6 prior days = 7).
 */
export function windowStartDateKey(tier: string, nowMs: number): string | null {
  const days = WINDOW_DAYS_BY_TIER[normalizeTier(tier)];
  if (days == null) return null;
  return utcDateKey(nowMs - (days - 1) * 86_400_000);
}

// ── SQL (column order is the read contract) ────────────────────────────────

export const WINDOW_TOTALS_SQL =
  "SELECT event_type, COUNT(*) AS n FROM raw_events " +
  "WHERE handle = ? AND is_bot = 0 AND date_key >= ? GROUP BY event_type";

export const WINDOW_TOTALS_ALL_SQL =
  "SELECT event_type, COUNT(*) AS n FROM raw_events " +
  "WHERE handle = ? AND is_bot = 0 GROUP BY event_type";

export const TODAY_UNIQUES_SQL =
  "SELECT COUNT(DISTINCT visitor_day_hash) AS u FROM raw_events " +
  "WHERE handle = ? AND is_bot = 0 AND event_type = 'view' AND date_key = ? " +
  "AND visitor_day_hash <> ''";

export const TOP_BLOCKS_SQL =
  "SELECT block_id, COUNT(*) AS clicks FROM raw_events " +
  "WHERE handle = ? AND is_bot = 0 AND event_type = 'click' AND block_id <> '' AND date_key >= ? " +
  "GROUP BY block_id ORDER BY clicks DESC LIMIT ?";

export const TOP_BLOCKS_ALL_SQL =
  "SELECT block_id, COUNT(*) AS clicks FROM raw_events " +
  "WHERE handle = ? AND is_bot = 0 AND event_type = 'click' AND block_id <> '' " +
  "GROUP BY block_id ORDER BY clicks DESC LIMIT ?";

export interface TopBlock {
  blockId: string;
  clicks: number;
}

export interface InsightsSummary {
  /** Window length in days; null = unlimited (Business). */
  windowDays: number | null;
  pageviews: number;
  clicks: number;
  /** Unique visitors TODAY (DEC-079 — uniques are a per-day metric only). */
  todayUniques: number;
  topBlocks: TopBlock[];
}

/** Minimal D1 surface we depend on (keeps this unit-testable). */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

const TOP_BLOCKS_LIMIT = 5;

/**
 * Compute the dashboard summary for a handle over the tier window. Returns
 * zeroed metrics on any query error (the dashboard renders empty, never 500s).
 */
export async function loadInsightsSummary(
  db: D1Like,
  handle: string,
  opts: { tier: string; nowMs: number },
): Promise<InsightsSummary> {
  const windowDays = WINDOW_DAYS_BY_TIER[normalizeTier(opts.tier)];
  const start = windowStartDateKey(opts.tier, opts.nowMs);
  const todayKey = utcDateKey(opts.nowMs);

  const summary: InsightsSummary = {
    windowDays,
    pageviews: 0,
    clicks: 0,
    todayUniques: 0,
    topBlocks: [],
  };

  try {
    // Windowed view/click totals.
    const totals =
      start == null
        ? await db.prepare(WINDOW_TOTALS_ALL_SQL).bind(handle).all<{ event_type: string; n: number }>()
        : await db
            .prepare(WINDOW_TOTALS_SQL)
            .bind(handle, start)
            .all<{ event_type: string; n: number }>();
    for (const row of totals.results) {
      if (row.event_type === "view") summary.pageviews = Number(row.n) || 0;
      else if (row.event_type === "click") summary.clicks = Number(row.n) || 0;
    }

    // Today's unique visitors.
    const uniques = await db
      .prepare(TODAY_UNIQUES_SQL)
      .bind(handle, todayKey)
      .all<{ u: number }>();
    summary.todayUniques = Number(uniques.results[0]?.u ?? 0) || 0;

    // Top blocks by clicks.
    const top =
      start == null
        ? await db.prepare(TOP_BLOCKS_ALL_SQL).bind(handle, TOP_BLOCKS_LIMIT).all<{ block_id: string; clicks: number }>()
        : await db
            .prepare(TOP_BLOCKS_SQL)
            .bind(handle, start, TOP_BLOCKS_LIMIT)
            .all<{ block_id: string; clicks: number }>();
    summary.topBlocks = top.results.map((r) => ({
      blockId: String(r.block_id),
      clicks: Number(r.clicks) || 0,
    }));
  } catch {
    // Leave zeroed summary.
  }

  return summary;
}
