/**
 * queries unit tests. Story: F-INSIGHTS-DASH-001.
 */

import { describe, it, expect } from "vitest";
import {
  windowStartDateKey,
  loadInsightsSummary,
  WINDOW_DAYS_BY_TIER,
  type D1Like,
} from "./queries";

const NOW = Date.parse("2026-05-31T12:00:00Z");

describe("windowStartDateKey", () => {
  it("maps tiers to inclusive window start (today + N-1 prior days)", () => {
    expect(windowStartDateKey("free", NOW)).toBe("2026-05-25"); // 7 days
    expect(windowStartDateKey("creator", NOW)).toBe("2026-03-03"); // 90 days (today + 89 prior)
    expect(windowStartDateKey("business", NOW)).toBeNull(); // unlimited
    expect(windowStartDateKey("nonsense", NOW)).toBe("2026-05-25"); // → free
  });

  it("free is 7 / creator 90 / pro 365 / business unlimited", () => {
    expect(WINDOW_DAYS_BY_TIER).toEqual({ free: 7, creator: 90, pro: 365, business: null });
  });
});

/** Fake D1 that routes each SQL to a canned result by a substring match. */
function fakeDb(routes: Array<{ match: string; results: unknown[] }>): D1Like {
  return {
    prepare(sql: string) {
      return {
        bind() {
          return {
            async all() {
              const hit = routes.find((r) => sql.includes(r.match));
              return { results: (hit?.results ?? []) as never[] };
            },
          };
        },
      };
    },
  };
}

describe("loadInsightsSummary", () => {
  it("derives pageviews/clicks/uniques/top-blocks for a windowed tier", async () => {
    const db = fakeDb([
      { match: "GROUP BY event_type", results: [
        { event_type: "view", n: 120 },
        { event_type: "click", n: 34 },
      ] },
      { match: "COUNT(DISTINCT visitor_day_hash)", results: [{ u: 41 }] },
      { match: "ORDER BY clicks DESC", results: [
        { block_id: "spotify", clicks: 20 },
        { block_id: "merch", clicks: 14 },
      ] },
    ]);
    const s = await loadInsightsSummary(db, "alex", { tier: "free", nowMs: NOW });
    expect(s.windowDays).toBe(7);
    expect(s.pageviews).toBe(120);
    expect(s.clicks).toBe(34);
    expect(s.todayUniques).toBe(41);
    expect(s.topBlocks).toEqual([
      { blockId: "spotify", clicks: 20 },
      { blockId: "merch", clicks: 14 },
    ]);
  });

  it("uses the unlimited query path for Business (windowDays null)", async () => {
    const seen: string[] = [];
    const db: D1Like = {
      prepare(sql: string) {
        seen.push(sql);
        return { bind: () => ({ all: async () => ({ results: [] as never[] }) }) };
      },
    };
    const s = await loadInsightsSummary(db, "alex", { tier: "business", nowMs: NOW });
    expect(s.windowDays).toBeNull();
    // The windowed (date_key >=) totals SQL must NOT be used for unlimited.
    expect(seen.some((q) => q.includes("date_key >= ?") && q.includes("GROUP BY event_type"))).toBe(false);
  });

  it("returns a zeroed summary if a query throws", async () => {
    const db: D1Like = {
      prepare() {
        return { bind: () => ({ all: async () => { throw new Error("d1 down"); } }) };
      },
    };
    const s = await loadInsightsSummary(db, "alex", { tier: "pro", nowMs: NOW });
    expect(s).toMatchObject({ pageviews: 0, clicks: 0, todayUniques: 0, topBlocks: [] });
  });
});
