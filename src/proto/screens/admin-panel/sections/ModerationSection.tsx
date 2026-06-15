/**
 * Moderation section of the platform-admin panel: the report inbox queue,
 * KPI row, take-down history, and repeat offenders. Faithful port of
 * mockups/tadaify-mvp/admin-panel.html (#pane-moderation).
 *
 * Take-down opens the global takedown modal; dismiss / take-down resolve a
 * row in place (local state). All other actions are non-navigating prototype
 * stubs. Row + queue data lives in moderationSectionFixture.
 *
 * @implements fr-admin-panel
 */
import { useState } from "react";

import type { SectionProps } from "../adminPanelTypes";
import {
  moderationKpisFixture,
  moderationReasonFiltersFixture,
  moderationReportsFixture,
  moderationSortFiltersFixture,
  moderationStateFiltersFixture,
  repeatOffendersFixture,
  takeDownHistoryFixture,
  type ReportAction,
} from "./moderationSectionFixture";

type ResolvedState = { tone: "danger" | "success"; label: string };

export function ModerationSection({ onNavigate: _onNavigate, openModal }: SectionProps) {
  const kpis = moderationKpisFixture();
  const reports = moderationReportsFixture();
  const history = takeDownHistoryFixture();
  const repeatOffenders = repeatOffendersFixture();

  /** Per-row resolution: replaces the action cluster with a status chip. */
  const [resolved, setResolved] = useState<Record<string, ResolvedState>>({});

  function handleAction(reportId: string, handle: string, action: ReportAction) {
    if (action.kind === "takedown") {
      openModal("takedown", { handle, reason: action.reason });
      return;
    }
    if (action.kind === "dismiss") {
      setResolved((prev) => ({
        ...prev,
        [reportId]: { tone: "success", label: "Dismissed · not violating" },
      }));
      return;
    }
    window.alert(action.message);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Content moderation</h1>
          <div className="sub">Review reports against creator pages. Take down, warn, suspend, or dismiss.</div>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.alert("Mockup — would open ToS reference")}
          >
            View ToS rules
          </button>
        </div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
        {kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-num" style={kpi.numColor ? { color: kpi.numColor } : undefined}>
              {kpi.num}
            </div>
            <div className="kpi-foot">{kpi.foot}</div>
          </div>
        ))}
      </div>

      <div className="filters">
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="input" type="search" placeholder="Search by handle or reporter…" />
        </div>
        <select className="input" defaultValue="All states">
          {moderationStateFiltersFixture().map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select className="input" defaultValue="All reasons">
          {moderationReasonFiltersFixture().map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select className="input" defaultValue="Sort: oldest first">
          {moderationSortFiltersFixture().map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Inbox: 3 open reports */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h2>Inbox · 3 open</h2>
        </div>

        {reports.map((report, index) => {
          const resolution = resolved[report.id];
          return (
            <div
              key={report.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 11,
                padding: "14px 16px",
                marginBottom: index === reports.length - 1 ? undefined : 10,
                opacity: resolution ? 0.4 : undefined,
              }}
              data-row={report.id}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="row-mini" style={{ minWidth: 200 }}>
                  <div className={`av ${report.avatarTone}`}>{report.avatarInitial}</div>
                  <div className="rm-text">
                    <div className="rm-name">{report.name}</div>
                    <div className="rm-handle">{report.url}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {report.chips.map((chip, i) => (
                      <span key={i} className={chip.tone ? `chip ${chip.tone}` : "chip"}>
                        {chip.label}
                      </span>
                    ))}
                    <span style={{ marginLeft: 8, color: "var(--fg-muted)", fontSize: 12 }}>{report.timing}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    <b>{report.notesLabel}</b> {report.notes}
                  </div>
                </div>
                <div className="mod-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {resolution ? (
                    <span className={`chip ${resolution.tone}`}>{resolution.label}</span>
                  ) : (
                    report.actions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        className={
                          (action.kind === "takedown" ? "btn btn-danger btn-sm" : "btn btn-ghost btn-sm") +
                          (action.writeGated ? " ro-hide-write" : "")
                        }
                        onClick={() => handleAction(report.id, report.handle, action)}
                      >
                        {action.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-h">
            <h2>Take-down history · last 30 days</h2>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Page</th>
                  <th>Reason</th>
                  <th>Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={`${row.when}-${row.page}`}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{row.when}</span>
                    </td>
                    <td>{row.page}</td>
                    <td>
                      <span className={row.reason.tone ? `chip ${row.reason.tone}` : "chip"}>{row.reason.label}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{row.reviewer}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h2>Repeat offenders</h2>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginBottom: 8 }}>
            Creators with ≥2 ToS violations in 90d.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {repeatOffenders.map((offender) => (
              <div
                key={offender.name}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: 10,
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                }}
              >
                <div className="row-mini" style={{ flex: 1 }}>
                  <div className={`av ${offender.avatarTone}`}>{offender.avatarInitial}</div>
                  <div className="rm-text">
                    <div className="rm-name">{offender.name}</div>
                    <div className="rm-handle">{offender.meta}</div>
                  </div>
                </div>
                <span className={`chip ${offender.status.tone}`}>{offender.status.label}</span>
              </div>
            ))}
          </div>
          <div className="empty" style={{ marginTop: 14, padding: "18px 12px" }}>
            <div className="em-ico">✓</div>
            <div className="em-title" style={{ fontSize: 14 }}>
              Mostly quiet
            </div>
            <div className="em-sub">Only 2 repeat offenders in the last 90 days.</div>
          </div>
        </div>
      </div>
    </>
  );
}
