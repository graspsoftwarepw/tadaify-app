/**
 * Maintenance-mode admin pane: toggle the app offline for non-admin users,
 * configure the maintenance window, and review history. Faithful port of
 * `<section id="pane-maintenance">` in mockups/tadaify-mvp/admin-panel.html.
 *
 * The maintenance toggle is local state — flipping it ON swaps the hero
 * status/icon/copy, reveals the countdown row, and (in the mockup) seeds the
 * 30-minute preset. Presets and the history table come from the fixture.
 *
 * @implements fr-admin-panel
 */

import { useState } from "react";
import type { SectionProps } from "../adminPanelTypes";
import {
  maintenanceHistoryFixture,
  maintenancePresetsFixture,
} from "./maintenanceSectionFixture";

export function MaintenanceSection(_props: SectionProps) {
  const presets = maintenancePresetsFixture();
  const history = maintenanceHistoryFixture();

  const [maintOn, setMaintOn] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  function toggleMaint() {
    const on = !maintOn;
    setMaintOn(on);
    // Mockup seeds the 30-minute preset the first time it goes ON.
    if (on && activePreset === null) setActivePreset(30);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Maintenance mode</h1>
          <div className="sub">
            Take the app offline for non-admin users. Admins continue to see the
            dashboard. Stored in{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--fg-muted)",
                background: "var(--bg-muted)",
                padding: "1px 5px",
                borderRadius: "4px",
              }}
            >
              app_settings.maintenance
            </code>
            .
          </div>
        </div>
      </div>

      <div className={maintOn ? "maint-hero is-on" : "maint-hero"} id="maint-hero">
        <div className="mh-status" id="maint-icon" style={{ position: "relative" }}>
          {maintOn ? "⚠" : "✓"}
        </div>
        <div className="mh-text">
          <div className="mh-title" id="maint-status-text">
            {maintOn ? "Maintenance ACTIVE" : "Online"}
          </div>
          <div className="mh-sub" id="maint-sub">
            {maintOn
              ? "Regular users see the Maintenance screen. You and other admins continue to see the dashboard."
              : "All users have full access. Toggle ON to take the app offline for non-admin users."}
          </div>
        </div>
        <div className="mh-toggle">
          <button
            type="button"
            className={
              maintOn
                ? "toggle toggle-lg toggle-danger ro-disable on"
                : "toggle toggle-lg toggle-danger ro-disable"
            }
            id="maint-toggle"
            onClick={toggleMaint}
            aria-label="Toggle maintenance mode"
          ></button>
        </div>
      </div>

      <div
        id="countdown-row"
        style={{ display: maintOn ? undefined : "none", marginTop: "14px" }}
        className="card"
      >
        <div className="card-h">
          <h2>Estimated time remaining</h2>
        </div>
        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="countdown" id="countdown">
            00:00
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>
            Users see this countdown on the maintenance screen.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>Configure maintenance window</h2>
        </div>
        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--fg-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Reason (shown to users)
            </label>
            <input
              className="input ro-disable"
              id="maint-reason"
              type="text"
              placeholder="e.g. Database maintenance — back online soon"
              defaultValue="Scheduled database maintenance — performance improvements"
            />
            <div style={{ fontSize: "11px", color: "var(--fg-muted)", marginTop: "4px" }}>
              This text appears verbatim on the maintenance screen, with markdown
              rendered.
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--fg-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Duration preset
            </label>
            <div className="preset-row">
              {presets.map((preset) =>
                preset.minutes === null ? (
                  <button
                    key={preset.label}
                    type="button"
                    className="preset-btn ro-disable"
                    onClick={() =>
                      document.getElementById("maint-end-input")?.focus()
                    }
                  >
                    {preset.label}
                  </button>
                ) : (
                  <button
                    key={preset.label}
                    type="button"
                    className={
                      activePreset === preset.minutes
                        ? "preset-btn ro-disable is-active"
                        : "preset-btn ro-disable"
                    }
                    data-min={preset.minutes}
                    onClick={() => setActivePreset(preset.minutes)}
                  >
                    {preset.label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--fg-muted)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Estimated end (UTC)
            </label>
            <input
              className="input ro-disable"
              id="maint-end-input"
              type="datetime-local"
              defaultValue="2026-04-26T15:00"
            />
          </div>

          <div className="warning-box ro-disable">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <b>Heads up.</b> Toggling ON immediately blocks all non-admin
              sessions. In-flight Stripe checkouts complete (Webhooks are not
              blocked). Public creator pages return a static maintenance HTML.
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary ro-hide-write"
              onClick={() =>
                window.alert(
                  "Would write to app_settings.maintenance and broadcast realtime update (prototype)",
                )
              }
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                window.alert(
                  "Would broadcast manual notification to all admin sessions (prototype)",
                )
              }
            >
              Notify admins
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>History</h2>
          <span style={{ fontSize: "11.5px", color: "var(--fg-muted)" }}>
            last 90 days
          </span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>When</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Started by</th>
                <th>Affected users</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.when}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {row.when}
                    </span>
                  </td>
                  <td>{row.duration}</td>
                  <td>{row.reason}</td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {row.startedBy}
                    </span>
                  </td>
                  <td>{row.affectedUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>CLI fallback</h2>
          <span style={{ fontSize: "11.5px", color: "var(--fg-muted)" }}>
            if the admin panel itself is unreachable
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            background: "#0B0F1E",
            color: "#E2E8F0",
            padding: "14px 16px",
            borderRadius: "9px",
            lineHeight: 1.6,
            overflowX: "auto",
          }}
        >
          <span style={{ color: "#6B7280" }}>
            -- Direct database fallback (psql or Supabase MCP read-only sql)
          </span>
          <br />
          <span style={{ color: "#93C5FD" }}>UPDATE</span> app_settings
          <br />
          {"   "}
          <span style={{ color: "#93C5FD" }}>SET</span> value ={" "}
          <span style={{ color: "#86EFAC" }}>
            {
              '\'{"enabled":true,"started_at":"2026-04-26T14:30Z","estimated_end":"2026-04-26T15:00Z","reason":"DB maintenance"}\''
            }
          </span>
          <br />
          {"  "}
          <span style={{ color: "#93C5FD" }}>WHERE</span> key ={" "}
          <span style={{ color: "#86EFAC" }}>{"'maintenance'"}</span>;
        </div>
      </div>
    </>
  );
}
