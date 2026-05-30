/**
 * One-off render verification — InsightsPanel.
 * Confirms mockup-fidelity structure renders. Not a real test of behaviour;
 * deletable after Owner visual review.
 */
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InsightsPanel } from "./InsightsPanel";

describe("InsightsPanel render smoke", () => {
  it("renders the insights structure", () => {
    const html = renderToStaticMarkup(
      <div className="app-dashboard-root" data-tier="pro">
        <div className="layout" data-tab="insights">
          <InsightsPanel handle="alexandra" tier="pro" />
        </div>
      </div>,
    );

    // Sanity assertions for mockup class names
    for (const cls of [
      "main-insights",
      "page-head",
      "page-head-row",
      "page-selector",
      "head-controls",
      "kpi-row",
      "kpi-tile",
      "kpi-spark",
      "chart-shell",
      "chart-canvas",
      "chart-pin",
      "sources-shell",
      "sources-method",
      "sources-grid",
      "source-list",
      "source-row",
      "src-detail",
      "top-block-row",
      "blocks-shell",
      "blocks-table",
      "three-up",
      "mini-card",
      "bar-list",
      "device-toggle-row",
      "crosstab-shell",
      "crosstab-table",
      "locked-grid",
      "locked-card",
      "lc-cta-footer",
      "saved-view-chip",
      "faux-row",
      "privacy-footer",
      "section-heading",
      "api-tile",
      "compare-toggle",
      "csv-btn",
      "updated-chip",
    ]) {
      expect(html, `expected class ${cls}`).toContain(cls);
    }

    // Dump to disk so verification step can paste an excerpt
    if (process.env.DUMP_INSIGHTS_HTML) {
      const fs = require("fs");
      fs.writeFileSync("/tmp/insights-rendered.html", html);
    }
  });
});
