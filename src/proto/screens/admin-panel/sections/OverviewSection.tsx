/**
 * Platform-admin · Overview section. Faithful port of the #pane-overview pane
 * in mockups/tadaify-mvp/admin-panel.html: the 7-tile KPI row, two area charts
 * (daily signups + MRR growth), the tier-mix breakdown, quick actions, the
 * recent-events feed and the open-support-tickets list.
 *
 * Renders the pane's inner markup only — the `.pane` wrapper is owned by
 * AdminPanelScreen. Presentational, local-state only; data from the typed
 * overviewSectionFixture factories.
 *
 * @implements fr-admin-panel
 */
import { useState } from "react";
import type { SectionProps } from "../adminPanelTypes";
import {
  mrrRangeTabsFixture,
  mrrSeriesFixture,
  overviewHeadFixture,
  overviewKpisFixture,
  overviewStatusTileFixture,
  quickActionsFixture,
  recentEventsFixture,
  signupRangeTabsFixture,
  signupsSeriesFixture,
  supportTicketsFixture,
  tierMixFixture,
  type ChartSeries,
} from "./overviewSectionFixture";

/** Build the open polyline `d` for a series. */
function linePath(s: ChartSeries): string {
  return s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
}

/** Build the closed area `d` (line, then down to the baseline and back). */
function areaPath(s: ChartSeries, baseline: number): string {
  const last = s.points[s.points.length - 1];
  const first = s.points[0];
  return `${linePath(s)} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
}

export function OverviewSection({ onNavigate }: SectionProps) {
  const head = overviewHeadFixture();
  const kpis = overviewKpisFixture();
  const status = overviewStatusTileFixture();
  const signups = signupsSeriesFixture();
  const mrr = mrrSeriesFixture();
  const tiers = tierMixFixture();
  const actions = quickActionsFixture();
  const events = recentEventsFixture();
  const tickets = supportTicketsFixture();

  const [signupRanges, setSignupRanges] = useState(signupRangeTabsFixture());
  const [mrrRanges, setMrrRanges] = useState(mrrRangeTabsFixture());

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{head.title}</h1>
          <div className="sub">{head.sub}</div>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.alert("Would refresh KPIs from D1 + WAE (prototype)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm ro-disable"
            onClick={() => window.alert("Log custom event (prototype)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Log custom event
          </button>
        </div>
      </div>

      {/* KPI ROW (7 tiles) */}
      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-num">
              {k.value}
              {k.suffix ? <span className="kpi-suffix">{k.suffix}</span> : null}
            </div>
            <span className={`kpi-delta ${k.deltaDir}`}>{k.delta}</span>
            <div className="kpi-foot">{k.foot}</div>
          </div>
        ))}
        <div className="kpi kpi-status">
          <div className="ks-ico">{status.icon}</div>
          <div className="ks-text">
            <div className="ks-title">{status.title}</div>
            <div className="ks-sub">{status.sub}</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Left col: charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="chart-shell">
            <div className="card-h">
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "none", letterSpacing: 0, color: "var(--fg)", margin: 0 }}>Daily signups</h2>
                <div className="card-sub" style={{ marginTop: 2 }}>Last 30 days · spike on Apr 12 was the Product Hunt launch.</div>
              </div>
              <div className="seg-tabs">
                {signupRanges.map((t) => (
                  <button
                    key={t.range}
                    type="button"
                    className={t.active ? "active" : undefined}
                    data-range={t.range}
                    onClick={() => setSignupRanges((rs) => rs.map((r) => ({ ...r, active: r.range === t.range })))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-canvas">
              <svg viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-sign" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="rgba(156,163,175,0.18)" strokeDasharray="3 4" strokeWidth="1">
                  {signups.yTicks.map((t) => (
                    <line key={t.label} x1="40" y1={t.y - 4} x2="780" y2={t.y - 4} />
                  ))}
                </g>
                <g fontFamily="Inter" fontSize="9" fill="#9CA3AF">
                  {signups.yTicks.map((t) => (
                    <text key={t.label} x="34" y={t.y} textAnchor="end">{t.label}</text>
                  ))}
                </g>
                <path d={areaPath(signups, 150)} fill="url(#grad-sign)" />
                <path d={linePath(signups)} fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={signups.marker.x} cy={signups.marker.y} r="4.5" fill="#6366F1" stroke="#fff" strokeWidth="2" />
                <text x={signups.marker.x} y={signups.marker.y - 12} textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#6366F1" fontWeight="700">{signups.marker.label}</text>
                <g fontFamily="Inter" fontSize="9" fill="#9CA3AF" textAnchor="middle">
                  {signups.xTicks.map((t) => (
                    <text key={t.label} x={t.x} y="170">{t.label}</text>
                  ))}
                </g>
              </svg>
            </div>
          </section>

          <section className="chart-shell">
            <div className="card-h">
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "none", letterSpacing: 0, color: "var(--fg)", margin: 0 }}>MRR growth</h2>
                <div className="card-sub" style={{ marginTop: 2 }}>Monthly recurring revenue · last 12 months.</div>
              </div>
              <div className="seg-tabs">
                {mrrRanges.map((t) => (
                  <button
                    key={t.range}
                    type="button"
                    className={t.active ? "active" : undefined}
                    onClick={() => setMrrRanges((rs) => rs.map((r) => ({ ...r, active: r.range === t.range })))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-canvas">
              <svg viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-mrr" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="rgba(156,163,175,0.18)" strokeDasharray="3 4" strokeWidth="1">
                  {mrr.yTicks.map((t) => (
                    <line key={t.label} x1="40" y1={t.y - 4} x2="780" y2={t.y - 4} />
                  ))}
                </g>
                <g fontFamily="Inter" fontSize="9" fill="#9CA3AF">
                  {mrr.yTicks.map((t) => (
                    <text key={t.label} x="34" y={t.y} textAnchor="end">{t.label}</text>
                  ))}
                </g>
                <path d={areaPath(mrr, 150)} fill="url(#grad-mrr)" />
                <path d={linePath(mrr)} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <g fill="#10B981">
                  {mrr.points.filter((_, i) => i % 2 === 0).map((p) => (
                    <circle key={p.x} cx={p.x} cy={p.y} r="3" />
                  ))}
                  <circle cx={mrr.marker.x} cy={mrr.marker.y} r="4" stroke="#fff" strokeWidth="2" />
                </g>
                <text x={mrr.marker.x} y={mrr.marker.y - 8} textAnchor="end" fontFamily="Inter" fontSize="10" fill="#10B981" fontWeight="700">{mrr.marker.label}</text>
                <g fontFamily="Inter" fontSize="9" fill="#9CA3AF" textAnchor="middle">
                  {mrr.xTicks.map((t) => (
                    <text key={t.label} x={t.x} y="170">{t.label}</text>
                  ))}
                </g>
              </svg>
            </div>
          </section>

          {/* Tier breakdown */}
          <div className="card">
            <div className="card-h"><h2>Tier mix · paying</h2></div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {tiers.map((t) => (
                <div key={t.label} style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span>{t.label}</span>
                    <b>{t.count}</b>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--bg-sunken)", overflow: "hidden" }}>
                    <div style={{ width: `${t.pct}%`, height: "100%", background: t.color }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 3 }}>{t.foot}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: events feed + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-h"><h2>Quick actions</h2></div>
            <div className="qa-grid">
              {actions.map((a) => (
                <button
                  key={a.title}
                  type="button"
                  className={`qa-btn${a.readOnly ? " ro-disable" : ""}`}
                  onClick={() => onNavigate(a.section)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {a.iconPaths.map((p, i) => {
                      if (p.tag === "path") return <path key={i} d={p.d} />;
                      if (p.tag === "circle") return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />;
                      if (p.tag === "polyline") return <polyline key={i} points={p.points} />;
                      return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} />;
                    })}
                  </svg>
                  <span>
                    {a.title}
                    <br />
                    <span style={{ fontWeight: 400, color: a.subColor, fontSize: 11 }}>{a.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h2>Recent events</h2>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => onNavigate("audit")}>View all →</button>
            </div>
            {events.map((e, i) => (
              <div className="feed-row" key={i}>
                <div className={`fr-ico ${e.tone}`}>{e.icon}</div>
                <div className="fr-text">
                  <div className="fr-title">
                    {e.title.map((seg, j) => {
                      if (seg.chip) return <span key={j} className={seg.chip.cls}>{seg.chip.label}</span>;
                      if (seg.bold) return <b key={j}>{seg.text}</b>;
                      return <span key={j}>{seg.text}</span>;
                    })}
                  </div>
                  <div className="fr-meta">{e.meta}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><h2>Open support tickets</h2></div>
            <div style={{ fontSize: 13 }}>
              {tickets.map((t, i) => (
                <div
                  key={t.subject}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: i < tickets.length - 1 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <div>
                    {t.subjectBold ? <b>{t.subject}</b> : t.subject}
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{t.who}</div>
                  </div>
                  <span className={t.chipCls}>{t.chip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
