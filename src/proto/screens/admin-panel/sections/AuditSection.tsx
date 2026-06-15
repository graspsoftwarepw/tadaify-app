/**
 * Audit-log admin pane — faithful port of `#pane-audit` from
 * mockups/tadaify-mvp/admin-panel.html (lines 2295–2385).
 *
 * Insert-only log view: a search box, actor + time-range selects, type
 * segments that filter the table by row kind, and a sortable "When" column.
 * All non-navigating actions (CSV export, pagination, detail links) are inert
 * prototype handlers; no row mutates real data.
 *
 * @implements fr-admin-panel
 */
import { useState } from "react";

import type { SectionProps } from "../adminPanelTypes";
import {
  auditActorOptionsFixture,
  auditEntriesFixture,
  auditSegmentsFixture,
  auditTimeOptionsFixture,
  type AuditSegment,
} from "./auditSectionFixture";

const actorOptions = auditActorOptionsFixture();
const timeOptions = auditTimeOptionsFixture();
const segments = auditSegmentsFixture();
const entries = auditEntriesFixture();

export function AuditSection({ onNavigate, openModal }: SectionProps) {
  void onNavigate;
  void openModal;

  const [search, setSearch] = useState("");
  const [actor, setActor] = useState(actorOptions[0]);
  const [timeRange, setTimeRange] = useState(timeOptions[0]);
  const [activeKind, setActiveKind] = useState<AuditSegment["kind"]>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Audit log</h1>
          <div className="sub">
            Every admin action is recorded here. Insert-only · never deletable ·
            90-day rolling retention then archived.
          </div>
        </div>
        <div className="head-actions">
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() =>
              window.alert(
                "Mockup — would download admin-audit-" +
                  new Date().toISOString().slice(0, 10) +
                  ".csv (1,247 rows in current filter)",
              )
            }
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="input"
            type="search"
            placeholder="Search by actor email, target handle, or action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
        >
          {actorOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <select
          className="input"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          {timeOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "11.5px", color: "var(--fg-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</span>
        <div className="seg-tabs">
          {segments.map((seg) => (
            <button
              key={seg.kind}
              className={seg.kind === activeKind ? "active" : undefined}
              data-kind={seg.kind}
              type="button"
              onClick={() => setActiveKind(seg.kind)}
            >
              {seg.label}
              {seg.count ? (
                <>
                  {" "}
                  <span style={{ color: "var(--fg-muted)" }}>{seg.count}</span>
                </>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th
                  className={`sortable ${sortDir === "asc" ? "sorted-asc" : "sorted-desc"}`}
                  onClick={toggleSort}
                >
                  When (UTC) <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span>
                </th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Detail</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody id="audit-tbody">
              {entries.map((entry, i) => (
                <tr
                  key={i}
                  data-kind={entry.kind}
                  style={{ display: activeKind === "all" || activeKind === entry.kind ? undefined : "none" }}
                >
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{entry.when}</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{entry.actor}</span></td>
                  <td><span className={`chip${entry.chip ? ` ${entry.chip}` : ""}`}>{entry.action}</span></td>
                  <td>{entry.target}</td>
                  <td>
                    {entry.detailLink ? (
                      <>
                        <button
                          type="button"
                          style={{ color: "var(--brand-primary)", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
                          onClick={() => window.alert("View diff (prototype)")}
                        >
                          {entry.detailLink}
                        </button>
                        {entry.detail}
                      </>
                    ) : (
                      entry.detail
                    )}
                  </td>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{entry.ip}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", borderTop: "1px solid var(--border)", fontSize: "12.5px", color: "var(--fg-muted)", flexWrap: "wrap", gap: "8px" }}>
          <div>Showing <b style={{ color: "var(--fg)" }}>12</b> of <b style={{ color: "var(--fg)" }}>1,247</b> entries</div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button className="btn btn-ghost btn-xs" type="button" disabled>← Prev</button>
            <button className="btn btn-primary btn-xs" type="button">1</button>
            <button className="btn btn-ghost btn-xs" type="button" onClick={() => window.alert("Page 2 (prototype)")}>2</button>
            <button className="btn btn-ghost btn-xs" type="button" onClick={() => window.alert("Page 3 (prototype)")}>3</button>
            <span>…</span>
            <button className="btn btn-ghost btn-xs" type="button" onClick={() => window.alert("Next page (prototype)")}>Next →</button>
          </div>
        </div>
      </div>

      <div className="info-box" style={{ marginTop: "14px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        <span>The audit log is <b>insert-only</b>. No admin — including super-admins — can DELETE or UPDATE rows. The DB enforces this with a trigger that raises on UPDATE/DELETE. Compliance reviewers can request the full archive via legal@tadaify.com.</span>
      </div>
    </>
  );
}
