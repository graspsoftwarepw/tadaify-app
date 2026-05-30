/**
 * BlockEditorAnalyticsTile — analytics tile for the canonical block editor (preview column).
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html
 *   - 3-cell grid: today clicks / 7-day clicks / top source
 *   - "View in Insights →" deep-link below the tile
 *   - Block-level analytics (not page-level)
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export interface AnalyticsTileData {
  today: string;
  sevenDay: string;
  topSource: string;
  trending?: boolean;
}

export interface AnalyticsTileProps {
  data: AnalyticsTileData;
  /** Deep-link to Insights page for this block */
  insightsHref?: string;
  blockId?: string | null;
}

export function BlockEditorAnalyticsTile({
  data,
  insightsHref = "#",
  blockId: _blockId,
}: AnalyticsTileProps): ReactElement {
  return (
    <section className="section" aria-labelledby="analytics-section-h">
      <div className="section-head">
        <h4 id="analytics-section-h">Analytics</h4>
        {data.trending && (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(245,158,11,0.14)",
              color: "var(--brand-warm-dark, var(--brand-warm))",
              border: "1px solid rgba(245,158,11,0.45)",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
            }}
          >
            Trending ↑
          </span>
        )}
      </div>
      <div className="analytics-tile">
        <div className="a-cell">
          <div className="v">{data.today}</div>
          <div className="l">Today</div>
        </div>
        <div className="a-cell">
          <div className="v">{data.sevenDay}</div>
          <div className="l">7 days</div>
        </div>
        <div className="a-cell">
          <div className="v" style={{ fontSize: "13px" }}>{data.topSource}</div>
          <div className="l">Top source</div>
        </div>
      </div>
      <a className="analytics-deep" href={insightsHref}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        View in Insights →
      </a>
    </section>
  );
}
