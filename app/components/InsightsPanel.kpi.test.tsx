/**
 * InsightsPanel KPI wiring tests (real D1 data vs stub). Story: F-INSIGHTS-DASH-001.
 *
 * Node-only render via renderToStaticMarkup (project convention).
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InsightsPanel, type InsightsSummaryView } from "./InsightsPanel";

const SUMMARY: InsightsSummaryView = {
  windowDays: 7,
  pageviews: 1234,
  clicks: 56,
  todayUniques: 9,
  topBlocks: [{ blockId: "spotify", clicks: 40 }],
};

describe("InsightsPanel KPI tiles", () => {
  it("shows real numbers + window label and suppresses the fake delta when data is present", () => {
    const html = renderToStaticMarkup(
      <InsightsPanel handle="alex" tier="free" insights={SUMMARY} />,
    );
    expect(html).toContain("1,234"); // pageviews
    expect(html).toContain(">56<"); // clicks
    expect(html).toContain(">9<"); // uniques today
    expect(html).toContain("last 7 days");
    // The wired tiles drop their fabricated delta (▲ 12.4% is the pageviews
    // tile's stub delta). Other, not-yet-wired tiles keep their placeholders.
    expect(html).not.toContain("▲ 12.4%");
  });

  it("keeps the placeholder mockup numbers when no data is provided", () => {
    const html = renderToStaticMarkup(<InsightsPanel handle="alex" tier="pro" />);
    expect(html).toContain("2,007");
    expect(html).toContain("▲ 12.4%");
  });

  it("labels the window per tier (Business = all time)", () => {
    const html = renderToStaticMarkup(
      <InsightsPanel
        handle="alex"
        tier="business"
        insights={{ ...SUMMARY, windowDays: null }}
      />,
    );
    expect(html).toContain("all time");
  });
});
