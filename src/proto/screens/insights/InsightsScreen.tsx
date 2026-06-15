/**
 * Creator Insights screen — the analytics view a creator opens at
 * Insights in the dashboard sidebar. Faithful port of
 * mockups/tadaify-mvp/app-insights.html (single-handle, Pro-tier static view):
 * the page header with page selector + time range + API tile, the hero KPI
 * row with sparklines, the activity-over-time chart, the explainable traffic
 * sources two-pane, the top-blocks table, the geo/devices/referrers cards,
 * the cross-tab matrix, the tier-gated power-feature cards, and the privacy
 * footer.
 *
 * Charts are hand-rolled inline SVG / CSS bars driven by the typed
 * insightsFixture — no charting dependency. Presentational, local-state only
 * (active time range, active traffic source, cross-tab dimensions, the
 * "show cities" toggle, and the methodology modal). Every internal decision
 * reference from the mockup is intentionally omitted; only user-facing copy
 * is reproduced.
 *
 * @implements fr-insights
 * @implements fr-globalui-view-layout
 */
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  insightsHeader,
  insightsKpis,
  insightsSeries,
  trafficSources,
  sourcesMethod,
  topBlocks,
  geoCountries,
  geoCities,
  devices,
  browsers,
  referrers,
  crosstab,
  powerFeatures,
  type BarItem,
  type Kpi,
  type TimeRange,
} from "./insightsFixture";
import "./insights-proto.css";

const noop = (what: string) => () => alert(`Mockup — would ${what}`);

/** Build an SVG path "d" from normalised 0..1 points across a 0..w / 0..h box. */
function sparkPath(points: number[], w: number, h: number, area: boolean): string {
  if (points.length === 0) return "";
  const step = w / (points.length - 1);
  const pts = points.map((p, i) => [i * step, h - p * (h - 2) - 1] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  if (!area) return line;
  return `${line} L${w},${h} L0,${h} Z`;
}

function Spark({ kpi }: { kpi: Kpi }) {
  const w = 200;
  const h = 36;
  const gradId = `proto-ins-spark-${kpi.id}`;
  return (
    <svg className="ins-kpi-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      {kpi.fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={kpi.color} stopOpacity="0.30" />
              <stop offset="100%" stopColor={kpi.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sparkPath(kpi.spark, w, h, true)} fill={`url(#${gradId})`} />
        </>
      )}
      <path d={sparkPath(kpi.spark, w, h, false)} fill="none" stroke={kpi.color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoTip({ label, body, wide }: { label: string; body: string; wide?: boolean }) {
  return (
    <span className="ins-tooltip-wrap">
      <button className="ins-info-icon" type="button" aria-label={label}>i</button>
      <span className={`ins-tooltip-popover${wide ? " is-wide" : ""}`}>{body}</span>
    </span>
  );
}

/** Activity-over-time chart: filled pageviews area + clicks line, axes + pin. */
function ActivityChart({ compare }: { compare: boolean }) {
  const series = insightsSeries();
  const W = 800;
  const H = 280;
  const padL = 40;
  const padR = 20;
  const top = 40;
  const bottom = 220;
  const max = 600;
  const n = series.length;
  const xAt = (i: number) => padL + ((W - padL - padR) * i) / (n - 1);
  const yAt = (v: number) => bottom - ((bottom - top) * v) / max;

  const pvLine = series.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(0)},${yAt(d.pageviews).toFixed(0)}`).join(" ");
  const pvArea = `${pvLine} L${xAt(n - 1).toFixed(0)},${bottom} L${xAt(0).toFixed(0)},${bottom} Z`;
  const clLine = series.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(0)},${yAt(d.clicks).toFixed(0)}`).join(" ");
  const prevLine = series.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(0)},${yAt(d.prevPageviews).toFixed(0)}`).join(" ");
  const annIdx = series.findIndex((d) => d.annotation);

  return (
    <div className="ins-chart-canvas">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="7-day activity chart: pageviews and clicks">
        <defs>
          <linearGradient id="proto-ins-ts-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="color-mix(in srgb, var(--fg-muted) 18%, transparent)" strokeDasharray="3 4" strokeWidth={1}>
          {[40, 100, 160, 220].map((y) => (
            <line key={y} x1={padL} y1={y} x2={W - padR} y2={y} />
          ))}
        </g>
        <g fontSize="10" fill="var(--fg-muted)">
          {[["600", 44], ["400", 104], ["200", 164], ["0", 224]].map(([t, y]) => (
            <text key={t as string} x={padL - 6} y={y as number} textAnchor="end">{t}</text>
          ))}
        </g>
        <g fontSize="10" fill="var(--fg-muted)" textAnchor="middle">
          {series.map((d, i) => (
            <text key={d.label} x={xAt(i)} y={252}>{d.label}</text>
          ))}
        </g>
        {compare && (
          <path d={prevLine} fill="none" stroke="var(--fg-subtle)" strokeWidth={1.6} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        <path d={pvArea} fill="url(#proto-ins-ts-area)" />
        <path d={pvLine} fill="none" stroke="var(--brand-primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <g fill="var(--brand-primary)">
          {series.map((d, i) => (
            <circle key={d.label} cx={xAt(i)} cy={yAt(d.pageviews)} r={d.annotation ? 4.5 : 3.5} stroke={d.annotation ? "var(--bg-elevated)" : undefined} strokeWidth={d.annotation ? 2 : undefined} />
          ))}
        </g>
        <path d={clLine} fill="none" stroke="var(--brand-warm)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <g fill="var(--brand-warm)">
          {series.map((d, i) => (
            <circle key={d.label} cx={xAt(i)} cy={yAt(d.clicks)} r={3} />
          ))}
        </g>
      </svg>
      {annIdx >= 0 && (
        <div
          className="ins-chart-pin"
          style={{ left: `${(xAt(annIdx) / W) * 100}%`, top: `${(yAt(series[annIdx].pageviews) / H) * 100 - 4}%` }}
          title={`${series[annIdx].label} — ${series[annIdx].annotation} · ${series[annIdx].pageviews} pageviews, ${series[annIdx].clicks} clicks`}
        >
          {series[annIdx].annotation}
        </div>
      )}
    </div>
  );
}

function BarList({ items }: { items: BarItem[] }) {
  return (
    <div className="ins-bar-list">
      {items.map((b) => (
        <div className="ins-bar-row" key={b.label}>
          <span className={`ins-bar-label${b.mono ? " is-mono" : ""}`}>{b.label}</span>
          <span className="ins-bar-track">
            <span className={`ins-bar-fill${b.warm ? " is-warm" : ""}${b.muted ? " is-muted" : ""}`} style={{ width: `${b.pct}%` }} />
          </span>
          <span className="ins-bar-pct">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function InsightsScreen() {
  const head = insightsHeader();
  const kpis = insightsKpis();
  const sources = trafficSources();
  const blocks = topBlocks();
  const ct = crosstab();
  const features = powerFeatures();

  const [range, setRange] = useState<TimeRange>("7d");
  const [pageMenu, setPageMenu] = useState(false);
  const [compare, setCompare] = useState(false);
  const [activeSource, setActiveSource] = useState(sources[0].id);
  const [showCities, setShowCities] = useState(false);
  const [ctRows, setCtRows] = useState("source");
  const [ctCols, setCtCols] = useState("block");
  const [method, setMethod] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPageMenu(false);
        setMethod(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const source = sources.find((s) => s.id === activeSource) ?? sources[0];

  return (
    <DashboardChrome profile={dashboardProfileFixture()} activeNav="insights">
      <div className="proto-insights">
        {/* ============ PAGE HEADER ============ */}
        <div className="ins-page-head">
          <div className="ins-page-head-row">
            <div className="ins-head-main">
              <h1>
                Insights
                <span className="ins-crumb-sep">·</span>
                <span className="ins-crumb-page">{head.pageName}</span>
              </h1>
              <div className="ins-sub">{head.subtitle}</div>

              <div className="ins-head-meta">
                {/* Page selector */}
                <div className="ins-page-selector">
                  <button
                    className="ins-page-trigger"
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={pageMenu}
                    onClick={(e) => { e.stopPropagation(); setPageMenu((v) => !v); }}
                  >
                    <S w={14}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></S>
                    <span>{head.pageName}</span>
                    <S w={14}><polyline points="6 9 12 15 18 9" /></S>
                  </button>
                  {pageMenu && (
                    <div className="ins-page-menu" role="menu" onClick={(e) => e.stopPropagation()}>
                      <div className="ins-page-menu-hint">Your pages (1 of 1)</div>
                      {head.pages.map((p) => (
                        <button className={`ins-page-menu-item${p.current ? " is-active" : ""}`} type="button" role="menuitem" key={p.id} onClick={() => setPageMenu(false)}>
                          <S w={14}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></S>
                          <span>{p.label}</span>
                          <span className="ins-page-menu-meta">{p.meta}</span>
                        </button>
                      ))}
                      <div className="ins-page-menu-divider" />
                      <button className="ins-page-menu-item is-disabled" type="button" role="menuitem" aria-disabled="true" title="Cross-page Insights view — coming with multi-page support">
                        <S w={14}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></S>
                        <span>All pages combined</span>
                        <span className="ins-page-menu-meta">soon</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Last updated chip */}
                <div className="ins-updated-chip">
                  <span className="ins-live-dot" />
                  <span>{head.updatedText}</span>
                </div>
              </div>
            </div>

            {/* Right cluster */}
            <div className="ins-head-controls">
              <div className="ins-time-range" role="tablist" aria-label="Time range">
                {head.ranges.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={range === r.id ? "is-active" : ""}
                    aria-selected={range === r.id}
                    onClick={() => setRange(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`ins-compare-toggle${compare ? " is-on" : ""}`}
                aria-pressed={compare}
                onClick={() => setCompare((v) => !v)}
              >
                <span className="ins-compare-check" />
                <span>Compare to previous</span>
              </button>

              <button className="btn btn-ghost ins-csv-btn" type="button" onClick={noop("download a CSV export")}>
                <S w={13}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></S>
                <span>Export CSV (daily)</span>
              </button>

              <button className="ins-api-tile is-active" type="button" onClick={noop("open API key management")} title="API access — Pro tier">
                <span className="ins-api-icon" aria-hidden>🔌</span>
                <span className="ins-api-text-long">API · {head.api.used} / {head.api.cap} req/h</span>
                <span className="ins-api-text-short">🔌 {head.api.used}/{head.api.cap}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============ HERO KPI ROW ============ */}
        <div className="ins-kpi-row">
          {kpis.map((k) => (
            <div className="ins-kpi-tile" key={k.id}>
              <div className="ins-kpi-label">
                {k.label}
                <InfoTip label={`About ${k.label}`} body={k.tip} wide={k.id === "uniques"} />
              </div>
              <div className="ins-kpi-num">
                {k.value}
                {k.suffix && <span className="ins-kpi-suffix">{k.suffix}</span>}
              </div>
              <span className={`ins-kpi-delta is-${k.deltaDir}`}>{k.delta}</span>
              <Spark kpi={k} />
              <div className="ins-kpi-foot">{k.foot}</div>
            </div>
          ))}
        </div>

        {/* ============ ACTIVITY OVER TIME ============ */}
        <section className="ins-panel">
          <div className="ins-panel-head">
            <div>
              <h2 className="ins-panel-title">Activity over time</h2>
              <p className="ins-panel-sub">Pageviews and clicks for the last 7 days. The spike on Tuesday matched your TikTok going viral.</p>
            </div>
            <div className="ins-chart-toggles" role="tablist" aria-label="Chart granularity">
              <button className="is-active" type="button">Daily</button>
              <button type="button" onClick={noop("re-bucket the data to hour-of-day")}>Hourly</button>
            </div>
          </div>
          <div className="ins-chart-legend">
            <span className="ins-legend-item"><span className="ins-legend-dot" /> Pageviews</span>
            <span className="ins-legend-item"><span className="ins-legend-dot is-clicks" /> Clicks</span>
            {compare && <span className="ins-legend-item"><span className="ins-legend-dot is-prev" /> Previous 7 days</span>}
          </div>
          <ActivityChart compare={compare} />
        </section>

        {/* ============ TRAFFIC SOURCES ============ */}
        <section className="ins-panel">
          <div className="ins-panel-head">
            <div>
              <h2 className="ins-panel-title">Traffic sources</h2>
              <p className="ins-panel-sub">Where your visitors actually came from. Click a source to see the blocks they clicked most.</p>
            </div>
          </div>

          <div className="ins-sources-method">
            <span className="ins-lock" aria-hidden>🔒</span>
            <div>
              <strong>How we know this:</strong> {sourcesMethod()}{" "}
              <button className="ins-link-btn" type="button" onClick={() => setMethod(true)}>Read the full methodology →</button>
            </div>
          </div>

          <div className="ins-sources-grid">
            <div className="ins-source-list" role="tablist" aria-label="Traffic sources">
              {sources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSource === s.id}
                  className={`ins-source-row${activeSource === s.id ? " is-active" : ""}`}
                  onClick={() => setActiveSource(s.id)}
                >
                  <span className="ins-src-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</span>
                  <div className="ins-src-mid">
                    <div className="ins-src-name">
                      {s.name}
                      {s.note && <span className="ins-src-note">{s.note}</span>}
                    </div>
                    <div className="ins-src-bar-track"><div className="ins-src-bar-fill" style={{ width: `${s.pct}%` }} /></div>
                  </div>
                  <div className="ins-src-pct">{s.pct}<span className="ins-src-pct-unit">%</span></div>
                  <div className="ins-src-count">{s.visits} visits</div>
                </button>
              ))}
            </div>

            <div className="ins-src-detail">
              <div className="ins-src-detail-head">
                <span className="ins-src-icon is-lg" style={{ color: source.iconColor }}>{source.icon}</span>
                <div>
                  <h4>{source.detailTitle}</h4>
                  <div className="ins-src-detail-meta">{source.detailMeta}</div>
                </div>
              </div>
              <div>
                {source.topBlocks.map((b, i) => (
                  <div className="ins-top-block-row" key={`${b.label}-${i}`}>
                    <span className="ins-tb-rank">{i + 1}.</span>
                    <span className="ins-tb-name"><span className="ins-tb-icon" aria-hidden>{b.icon}</span> <span className="ins-tb-label">{b.label}</span></span>
                    <span className="ins-tb-clicks">{b.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ TOP BLOCKS ============ */}
        <section className="ins-panel">
          <div className="ins-panel-head">
            <div>
              <h2 className="ins-panel-title">Top blocks <span className="ins-chip is-muted">all tiers</span></h2>
              <p className="ins-panel-sub">Every block on your page, ranked by clicks. Click a row to see traffic sources, hour-of-day, and time-series for that block.</p>
            </div>
            <div className="ins-sort-row">
              <span className="ins-sort-label">Sort by:</span>
              <select className="ins-select" defaultValue="clicks" onChange={noop("re-sort the table")}>
                <option value="clicks">Clicks (desc)</option>
                <option value="ctr">Click-through rate</option>
                <option value="position">Page position</option>
                <option value="recent">Recently changed</option>
              </select>
            </div>
          </div>

          <div className="ins-table-wrap">
            <table className="ins-blocks-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th className="ins-col-page">On page</th>
                  <th className="ins-num">Clicks</th>
                  <th className="ins-num">CTR</th>
                  <th className="ins-col-spark">Last 7 days</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id} onClick={noop("drill into the block detail view")}>
                    <td>
                      <div className="ins-b-name">
                        <span className="ins-b-icon" style={{ background: b.iconBg, color: b.iconColor }}>{b.icon}</span>
                        <span className="ins-b-label">{b.label}</span>
                      </div>
                    </td>
                    <td className="ins-col-page"><span className="ins-b-page-pill">{b.page}</span></td>
                    <td className="ins-num">{b.clicks}</td>
                    <td className="ins-num" style={b.ctrStrong ? { color: "var(--success)" } : undefined}>{b.ctr}</td>
                    <td className="ins-col-spark">
                      <svg className="ins-b-spark" viewBox="0 0 84 22" preserveAspectRatio="none" aria-hidden>
                        <path d={sparkPath(b.spark, 84, 22, false)} fill="none" stroke={b.sparkColor} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ins-blocks-foot">
            <span>Showing {blocks.length} of {blocks.length} blocks · clicks counted at every tier</span>
            <button className="ins-panel-action" type="button" onClick={noop("drill into the per-block detail view")}>Open block detail view →</button>
          </div>
        </section>

        {/* ============ AUDIENCE BREAKDOWN ============ */}
        <h2 className="ins-section-heading">Audience breakdown <span className="ins-chip is-muted">all tiers</span></h2>

        <div className="ins-three-up">
          <div className="ins-mini-card">
            <div className="ins-mc-head">
              <h3>🌍 Top countries</h3>
              <button className="ins-mc-action" type="button" onClick={() => setShowCities((v) => !v)}>{showCities ? "Hide cities" : "Show cities"}</button>
            </div>
            <BarList items={geoCountries()} />
            {showCities && (
              <div className="ins-cities-list">
                <div className="ins-cities-label">Top cities</div>
                <BarList items={geoCities()} />
              </div>
            )}
          </div>

          <div className="ins-mini-card">
            <div className="ins-mc-head">
              <h3>📱 Devices</h3>
              <button className="ins-mc-action" type="button" onClick={noop("expand the device drill-down")}>Detail →</button>
            </div>
            <BarList items={devices()} />
            <div className="ins-device-toggle-row">
              <strong>Browsers:</strong>
              {browsers().map((b, i) => (
                <span key={b}>{i === 0 ? "" : "· "}{b}</span>
              ))}
            </div>
          </div>

          <div className="ins-mini-card">
            <div className="ins-mc-head">
              <h3>🔗 Top referrers</h3>
              <button className="ins-mc-action" type="button" onClick={noop("show all referrers")}>All →</button>
            </div>
            <BarList items={referrers()} />
          </div>
        </div>

        {/* ============ CROSS-TAB ============ */}
        <section className="ins-panel">
          <div className="ins-panel-head">
            <div>
              <h2 className="ins-panel-title">Cross-tab analysis <span className="ins-chip is-muted">all tiers</span></h2>
              <p className="ins-panel-sub">Slice your data along any two dimensions. Default view: source × block. Click any cell to drill in.</p>
            </div>
            <button className="ins-panel-action" type="button" onClick={() => { setCtRows("source"); setCtCols("block"); }}>Reset to default</button>
          </div>

          <div className="ins-crosstab-help">
            <strong>How to read this:</strong> rows are one dimension, columns are another, cell value is total clicks where they intersect. Want to know if Tuesday's TikTok post drove Stripe-link clicks at 9 PM? Set <kbd>Rows = Hour of day</kbd>, <kbd>Cols = Block</kbd>, then filter source = TikTok in the source list above.
          </div>

          <div className="ins-crosstab-controls">
            <label htmlFor="ins-ct-rows">Rows:</label>
            <select id="ins-ct-rows" className="ins-select" value={ctRows} onChange={(e) => setCtRows(e.target.value)}>
              {ct.rowDims.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <label htmlFor="ins-ct-cols">Columns:</label>
            <select id="ins-ct-cols" className="ins-select" value={ctCols} onChange={(e) => setCtCols(e.target.value)}>
              {ct.rowDims.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <span className="ins-crosstab-meta">Showing <strong>{ct.summary}</strong> · 7-day window</span>
          </div>

          <div className="ins-crosstab-table-wrap">
            <table className="ins-crosstab-table" aria-label="Cross-tab: source by block click counts">
              <thead>
                <tr>
                  <th className="ins-row-header">Source ↓ / Block →</th>
                  {ct.cols.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {ct.rows.map((row) => (
                  <tr key={row.header}>
                    <td className="ins-row-header">{row.header}</td>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={`ins-ct-cell${cell.intensity === 0 ? " is-zero" : ""}`}
                        style={cell.intensity > 0 ? {
                          background: `color-mix(in srgb, var(--brand-primary) ${Math.round(cell.intensity * 100)}%, transparent)`,
                          color: cell.intensity >= 0.3 ? "#fff" : "var(--fg)",
                        } : undefined}
                        title={`${cell.value} clicks · ${cell.share} of all clicks`}
                        onClick={noop("drill into this source × block cell")}
                      >
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="ins-crosstab-foot">
            <strong>Reading the table:</strong> the darker the cell, the more clicks. Empty/dim cells are zero or near-zero. Tip: the brightest cell is your <em>most reliable funnel</em> — TikTok → Stripe checkout (186 clicks, 22% of all clicks).
          </p>
        </section>

        {/* ============ POWER FEATURES ============ */}
        <h2 className="ins-section-heading">Power features <span className="ins-chip is-muted">your tier: Pro</span></h2>

        <div className="ins-locked-grid">
          {features.map((f) => (
            <div className={`ins-locked-card${f.locked ? "" : " is-unlocked"}`} key={f.id}>
              <div className="ins-locked-card-head">
                <h3>{f.icon} {f.title}</h3>
                <span className={`ins-chip is-${f.tier}`}>{f.tier === "pro" ? "Pro+" : "Business"}</span>
              </div>
              <p className="ins-locked-card-sub">{f.sub}</p>
              <div className="ins-locked-card-body">
                <div className="ins-lc-preview">
                  {f.preview.kind === "chips" && (
                    <div className="ins-chip-cloud">
                      {f.preview.chips.map((c) => (
                        <span key={c.label} className={`ins-saved-view-chip${c.dashed ? " is-dashed" : ""}`}>
                          {c.dot && <span className="ins-sv-dot" style={{ background: c.dot }} />}
                          {c.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {f.preview.kind === "ab" && (
                    <div>
                      {f.preview.rows.map((r, i) => (
                        <div className={`ins-faux-row${r.winner ? " is-winner" : ""}`} key={i}>
                          <span className={`ins-faux-pic${r.winner ? " is-ok" : ""}`}>{r.tag}</span>
                          <span className="ins-faux-name">{r.label}</span>
                          <span className="ins-faux-num">{r.num}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {f.preview.kind === "kv" && (
                    <div className="ins-kv-list">
                      {f.preview.rows.map((r) => (
                        <div className="ins-kv-row" key={r.key}>
                          <span className="ins-kv-key">{r.key}</span>
                          {r.values.map((v) => <span className="ins-saved-view-chip" key={v}>{v}</span>)}
                        </div>
                      ))}
                    </div>
                  )}
                  {f.preview.kind === "replay" && (
                    <div className="ins-replay">
                      <div className="ins-replay-track">
                        <div className="ins-replay-head" />
                        <div className="ins-replay-time">21:14 ▼</div>
                      </div>
                      <div className="ins-replay-bounds"><span>← Apr 22, 21:00</span><span>Apr 22, 22:00 →</span></div>
                      <div className="ins-chip-cloud">
                        <span className="ins-saved-view-chip">▶ Play</span>
                        <span className="ins-saved-view-chip">1× speed</span>
                        <span className="ins-saved-view-chip">+ Mark moment</span>
                      </div>
                    </div>
                  )}
                  {f.preview.kind === "faux" && (
                    <div>
                      {f.preview.rows.map((r, i) => (
                        <div className="ins-faux-row" key={i}>
                          <span className="ins-faux-pic">{r.pic}</span>
                          <span className={`ins-faux-name${r.mono ? " is-mono" : ""}`}>{r.name}</span>
                          <span className="ins-faux-num">{r.num}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {f.locked && (
                  <div className="ins-lc-cta-footer" role="note">
                    <p className="ins-lc-cta-msg"><strong>{f.ctaMsg.split(".")[0]}.</strong>{f.ctaMsg.slice(f.ctaMsg.indexOf(".") + 1)}</p>
                    <button className="btn btn-primary btn-sm" type="button" onClick={noop("open the upgrade flow")}>{f.cta}</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ============ PRIVACY FOOTER ============ */}
        <div className="ins-privacy-footer" role="note">
          <span className="ins-lock-icon" aria-hidden>🔒</span>
          <div>
            <strong>Cookieless analytics.</strong> No cookie banner shown to your visitors. We chose this on purpose — fewer interruptions, more conversions, full privacy promise to your audience.{" "}
            <button className="ins-link-btn" type="button" onClick={() => setMethod(true)}>Read the full methodology →</button>
          </div>
        </div>
      </div>

      {/* ============ METHODOLOGY MODAL ============ */}
      {method && (
        <div className="ins-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ins-method-title" onClick={(e) => { if (e.target === e.currentTarget) setMethod(false); }}>
          <div className="ins-modal">
            <div className="ins-modal-head">
              <h3 id="ins-method-title">🔒 How tadaify measures your audience</h3>
              <span className="ins-modal-head-spacer" />
              <button className="ins-modal-close" type="button" aria-label="Close" onClick={() => setMethod(false)}>
                <S w={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="ins-modal-body">
              <p><strong>Cookieless by design.</strong> We never set cookies, never fingerprint, and never track visitors across sessions. That means no cookie banner interrupts your audience.</p>
              <p><strong>Unique visitors.</strong> We count unique visitors per day using a privacy-first method. If the same person visits Monday and Tuesday, we count them as two visitors — a slightly fuzzy number traded for a friction-free experience.</p>
              <p><strong>Traffic sources.</strong> {sourcesMethod()}</p>
            </div>
            <div className="ins-modal-foot">
              <span className="ins-modal-foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setMethod(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
