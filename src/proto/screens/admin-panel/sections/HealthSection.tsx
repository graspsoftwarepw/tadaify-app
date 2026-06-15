/**
 * System Health admin pane — faithful port of `#pane-health`
 * (mockups/tadaify-mvp/admin-panel.html). Renders the service grid, two live
 * traffic charts (requests/sec area + error-rate line), the recent-errors list
 * and the per-endpoint latency table. Returns the pane's inner markup only.
 *
 * @implements fr-admin-panel
 */

import type { SectionProps } from "../adminPanelTypes";
import {
  healthServicesFixture,
  healthRpsSeriesFixture,
  healthErrorSeriesFixture,
  healthErrorsFixture,
  healthLatencyFixture,
} from "./healthSectionFixture";

const services = healthServicesFixture();
const rps = healthRpsSeriesFixture();
const errSeries = healthErrorSeriesFixture();
const errors = healthErrorsFixture();
const latency = healthLatencyFixture();

const linePath = (pts: Array<[number, number]>) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`).join(" ");

const rpsLine = linePath(rps);
const rpsArea = `${rpsLine} L 720,150 L 60,150 Z`;
const errLine = linePath(errSeries);

export function HealthSection({ onNavigate, openModal }: SectionProps) {
  // This pane is read-only telemetry: no cross-section jumps or modals fire from it.
  void onNavigate;
  void openModal;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>System health</h1>
          <div className="sub">Live status of every backing service · last check: 12s ago · auto-refresh 30s</div>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.alert("Mockup — would re-run all health checks (prototype)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Re-check all
          </button>
        </div>
      </div>

      {/* Service grid */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h2>Services · 7/7 healthy</h2>
        </div>
        <div className="svc-grid">
          {services.map((svc) => (
            <div className="svc-card" key={svc.name}>
              <div className={`svc-dot ${svc.status}`} />
              <div className="svc-text">
                <div className="svc-name">{svc.name}</div>
                <div className="svc-meta">{svc.meta}</div>
              </div>
              {svc.href ? (
                <a className="svc-link" href={svc.href} target="_blank" rel="noreferrer" title="Status page">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  className="svc-link"
                  title="Status"
                  onClick={() => window.alert(`Status page for ${svc.name} (prototype)`)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" />
                    {svc.external ? <line x1="10" y1="14" x2="21" y2="3" /> : null}
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live traffic */}
      <div className="two-col">
        <section className="chart-shell">
          <div className="card-h">
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "var(--fg)",
                  margin: 0,
                }}
              >
                Requests / sec
              </h2>
              <div className="card-sub" style={{ marginTop: 2 }}>
                Last 60 minutes · sampled at 10s
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--brand-primary)", fontWeight: 600 }}>
              342
              <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 400 }}>/sec</span>
            </div>
          </div>
          <div className="chart-canvas">
            <svg viewBox="0 0 800 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-rps" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="rgba(156,163,175,0.18)" strokeDasharray="3 4" strokeWidth="1">
                <line x1="40" y1="40" x2="780" y2="40" />
                <line x1="40" y1="90" x2="780" y2="90" />
                <line x1="40" y1="140" x2="780" y2="140" />
              </g>
              <g fontFamily="Inter" fontSize="9" fill="#9CA3AF">
                <text x="34" y="44" textAnchor="end">500</text>
                <text x="34" y="94" textAnchor="end">250</text>
                <text x="34" y="144" textAnchor="end">0</text>
              </g>
              <path d={rpsArea} fill="url(#grad-rps)" />
              <path d={rpsLine} fill="none" stroke="#6366F1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        <section className="chart-shell">
          <div className="card-h">
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "var(--fg)",
                  margin: 0,
                }}
              >
                Error rate
              </h2>
              <div className="card-sub" style={{ marginTop: 2 }}>
                5xx + 4xx auth failures
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--success)", fontWeight: 600 }}>
              0.04
              <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 400 }}>%</span>
            </div>
          </div>
          <div className="chart-canvas">
            <svg viewBox="0 0 800 180" preserveAspectRatio="none">
              <g stroke="rgba(156,163,175,0.18)" strokeDasharray="3 4" strokeWidth="1">
                <line x1="40" y1="40" x2="780" y2="40" />
                <line x1="40" y1="90" x2="780" y2="90" />
                <line x1="40" y1="140" x2="780" y2="140" />
              </g>
              <g fontFamily="Inter" fontSize="9" fill="#9CA3AF">
                <text x="34" y="44" textAnchor="end">1.0%</text>
                <text x="34" y="94" textAnchor="end">0.5%</text>
                <text x="34" y="144" textAnchor="end">0%</text>
              </g>
              <path d={errLine} fill="none" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="380" cy="108" r="3.5" fill="#F59E0B" stroke="#fff" strokeWidth="1.5" />
              <text x="380" y="100" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#F59E0B" fontWeight="700">
                spike (Stripe webhook)
              </text>
            </svg>
          </div>
        </section>
      </div>

      {/* Recent errors */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h2>Recent errors · last 24h</h2>
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>grouped by message · 3 distinct</span>
        </div>
        {errors.map((err) => (
          <div className="err-row" key={err.message}>
            <div className="er-msg" title={err.title}>
              {err.message}
            </div>
            <div className="er-count">{err.count}</div>
            <div className="er-time">{err.time}</div>
          </div>
        ))}
      </div>

      {/* Latency p95 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h2>Latency by endpoint · p95 last hour</h2>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th style={{ textAlign: "right" }}>RPM</th>
                <th style={{ textAlign: "right" }}>p50</th>
                <th style={{ textAlign: "right" }}>p95</th>
                <th style={{ textAlign: "right" }}>p99</th>
                <th style={{ textAlign: "right" }}>Errors</th>
              </tr>
            </thead>
            <tbody>
              {latency.map((row) => (
                <tr key={row.endpoint}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{row.endpoint}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>{row.rpm}</td>
                  <td style={{ textAlign: "right" }}>{row.p50}</td>
                  <td style={{ textAlign: "right" }}>{row.p95}</td>
                  <td style={{ textAlign: "right" }}>{row.p99}</td>
                  <td style={{ textAlign: "right", color: `var(--${row.errorTone})` }}>{row.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
