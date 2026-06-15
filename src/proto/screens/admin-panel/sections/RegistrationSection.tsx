/**
 * Platform-admin · Registration & waitlist section. Faithful port of
 * #pane-registration from mockups/tadaify-mvp/admin-panel.html (lines
 * 1507–1749): cap KPIs, registration controls, bulk promote, cohort
 * telemetry, the waitlist queue, and the email-preview panel.
 *
 * Markup, copy, and class names mirror the mockup 1:1. Non-navigating
 * mockup handlers (cap update, promote, single-row actions, email preview)
 * become prototype alerts; the pause toggle and email-preview tabs use local
 * state. This pane contains no cross-section navigation or modal triggers.
 *
 * @implements fr-admin-panel
 */

import { useState } from "react";
import type { SectionProps } from "../adminPanelTypes";
import { registrationFixture } from "./registrationSectionFixture";

export function RegistrationSection({ onNavigate: _onNavigate, openModal: _openModal }: SectionProps) {
  const fx = registrationFixture();
  const [paused, setPaused] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState(0);

  const promoteN = () => {
    const n = fx.promoteDefault;
    if (n <= 0) {
      window.alert("Mockup — would prompt for N");
      return;
    }
    if (
      !window.confirm(
        `Promote ${n} users from waitlist? This sends "you're in" emails to the oldest ${n} positions.`,
      )
    ) {
      return;
    }
    window.alert(`Mockup — would call promote_n_from_waitlist(${n})`);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Registration &amp; waitlist</h1>
          <div className="sub">
            Cap registrations · manage the waitlist queue · run cohort campaigns. Per{" "}
            <a
              href="https://github.com/graspsoftwarepw/tadaify-app/issues/55"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--brand-primary)", textDecoration: "underline" }}
            >
              #55 F-WAITLIST-001
            </a>
            .
          </div>
        </div>
      </div>

      {/* State summary */}
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
        <div className="kpi">
          <div className="kpi-label">Cap</div>
          <div className="kpi-num">1,000</div>
          <div className="kpi-foot">Set 2026-03-04 by founder@</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Used</div>
          <div className="kpi-num">
            847 <span className="kpi-suffix">· 84.7%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "var(--bg-sunken)",
              borderRadius: "99px",
              overflow: "hidden",
              marginTop: "6px",
            }}
          >
            <div style={{ width: "84.7%", height: "100%", background: "var(--brand-primary)" }} />
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Slots free</div>
          <div className="kpi-num">153</div>
          <div className="kpi-foot">~18d at current rate</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Waitlist</div>
          <div className="kpi-num" style={{ color: "var(--warning)" }}>
            247
          </div>
          <div className="kpi-foot">oldest: 12d 4h</div>
        </div>
      </div>

      {/* Cap controls */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-h">
          <h2>Registration controls</h2>
          <span className="chip success" id="reg-state-label">
            {paused ? "Paused (everyone joins waitlist)" : "Open (cap-gated)"}
          </span>
        </div>
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, minWidth: "120px" }}>Hard cap</label>
            <input
              className="input ro-disable"
              type="number"
              defaultValue={fx.capValue}
              min={0}
              style={{ width: "140px" }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm ro-hide-write"
              onClick={() => window.alert("Mockup — would update cap to N (writes audit row)")}
            >
              Update cap
            </button>
            <span style={{ fontSize: "11.5px", color: "var(--fg-muted)", marginLeft: "auto" }}>
              When 0, all signups go to waitlist regardless.
            </span>
          </div>
          <hr style={{ border: 0, borderTop: "1px solid var(--border)" }} />
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, minWidth: "120px" }}>Pause registration</label>
            <button
              type="button"
              className={paused ? "toggle ro-disable on" : "toggle ro-disable"}
              onClick={() => setPaused((p) => !p)}
              aria-label="Pause registration"
            />
            <span style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>
              When paused, new signups go directly to waitlist regardless of cap.
            </span>
          </div>
        </div>
      </div>

      {/* Promote bulk */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-h">
          <h2>Promote from waitlist</h2>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px" }}>Promote</span>
          <input
            className="input"
            id="promote-n"
            type="number"
            defaultValue={fx.promoteDefault}
            min={1}
            max={fx.promoteMax}
            style={{ width: "100px" }}
          />
          <span style={{ fontSize: "13px" }}>oldest waitlist members.</span>
          <button type="button" className="btn btn-primary btn-sm ro-hide-write" onClick={promoteN}>
            Promote N now
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.alert("Mockup — would preview the email + recipients")}
          >
            Preview email
          </button>
        </div>
        <div className="info-box" style={{ marginTop: "10px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Promoting consumes <b>N slots</b> from the cap. Slots free will drop from {fx.slotsFreeNow} to{" "}
            <b id="slots-after">{fx.slotsAfter}</b>.
          </span>
        </div>
      </div>

      {/* Cohort telemetry */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-h">
          <h2>Cohort telemetry</h2>
          <span style={{ fontSize: "11px", color: "var(--fg-muted)" }}>
            activation = added 1+ block in first 24h
          </span>
        </div>
        <div className="cohort-row is-head">
          <div className="ch-h">Cohort</div>
          <div className="ch-h">Signups</div>
          <div className="ch-h">Activation</div>
          <div className="ch-h">7d retention</div>
        </div>
        {fx.cohorts.map((c) => (
          <div className="cohort-row" key={c.name}>
            <div>
              <b>{c.name}</b>
              <div style={{ color: "var(--fg-muted)", fontSize: "11.5px" }}>{c.note}</div>
            </div>
            <div>
              {c.signups}
              <div className="ch-bar">
                <div className="ch-fill" style={{ width: `${c.signupsPct}%` }} />
              </div>
            </div>
            <div>
              {c.activationInFlight ? (
                <>
                  —<div style={{ fontSize: "11px", color: "var(--fg-muted)" }}>in flight</div>
                </>
              ) : (
                <>
                  {c.activation}
                  <div className="ch-bar">
                    <div
                      className="ch-fill"
                      style={{
                        width: `${c.activationPct}%`,
                        background:
                          c.activationTone === "success" ? "var(--success)" : "var(--warning)",
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div>{c.retention}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="card-h" style={{ padding: "14px 18px 6px" }}>
              <h2>Waitlist queue · {fx.waitlistWaitingCount} waiting</h2>
              <span style={{ fontSize: "12px", color: "var(--fg-muted)" }}>drag rows to reorder</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: "34px" }}>#</th>
                    <th>Person</th>
                    <th>Email</th>
                    <th>Signed up</th>
                    <th>Confirmed</th>
                    <th>Waiting</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fx.queue.map((r) => (
                    <tr key={r.pos}>
                      <td>{r.pos === 1 ? <b>{r.pos}</b> : r.pos}</td>
                      <td>
                        <div className="row-mini">
                          <div className={r.avClass ? `av ${r.avClass}` : "av"}>{r.initial}</div>
                          <div className="rm-text">
                            <div className="rm-name">{r.name}</div>
                            <div className="rm-handle">{r.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{r.email}</span>
                      </td>
                      <td>{r.signedUp}</td>
                      <td>
                        {r.confirmed === "confirmed" ? (
                          <span className="chip success">✓ confirmed</span>
                        ) : (
                          <span className="chip warn">unconfirmed</span>
                        )}
                      </td>
                      <td>{r.pos === 1 ? <b>{r.waiting}</b> : r.waiting}</td>
                      <td>
                        {r.confirmed === "unconfirmed" ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs ro-hide-write"
                              onClick={() => window.alert("Mockup — resend email")}
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              className="iconbtn ro-hide-write"
                              title="Remove from waitlist"
                              onClick={() => window.alert("Mockup — remove from waitlist (prototype)")}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : r.topRow ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              className="btn btn-success btn-xs ro-hide-write"
                              onClick={() => window.alert("Mockup — promote single")}
                            >
                              Promote
                            </button>
                            <button
                              type="button"
                              className="iconbtn ro-hide-write"
                              title="Move to top"
                              onClick={() => window.alert("Mockup — move to top (prototype)")}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <polyline points="17 11 12 6 7 11" />
                                <polyline points="17 18 12 13 7 18" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success btn-xs ro-hide-write"
                            onClick={() => window.alert("Mockup — promote single")}
                          >
                            Promote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "16px", color: "var(--fg-muted)", fontSize: "12.5px" }}
                    >
                      <b>{fx.queueMore} more</b> · scroll within table or paginate ·{" "}
                      <button
                        type="button"
                        style={{
                          color: "var(--brand-primary)",
                          background: "none",
                          border: 0,
                          padding: 0,
                          font: "inherit",
                          cursor: "pointer",
                        }}
                        onClick={() => window.alert("Mockup — view all waitlist (prototype)")}
                      >
                        view all
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card-h" style={{ marginBottom: "6px" }}>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--fg-subtle)",
              }}
            >
              Email previews
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            {fx.emailTabs.map((t, i) => (
              <button
                type="button"
                key={t.label}
                className={i === activeEmailTab ? "btn btn-primary btn-xs" : "btn btn-ghost btn-xs"}
                onClick={() => setActiveEmailTab(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="email-preview">
            <div className="ep-h">
              <div>
                <b>From:</b> hello@tadaify.com
              </div>
              <div>
                <b>To:</b> {"{email}"}
              </div>
              <div>
                <b>Subject:</b> You're in! Claim your handle
              </div>
            </div>
            <div className="ep-body">
              <h2>You're in! 🎉</h2>
              <p>Hey {"{first_name}"},</p>
              <p>
                A spot opened up. Your tadaify handle is reserved for the next <b>72 hours</b>. Click below to
                set up your page in under 5 minutes.
              </p>
              <span className="ep-cta">Claim my handle →</span>
              <p style={{ fontSize: "12px", color: "var(--fg-muted)", marginTop: "14px" }}>
                If you don't claim within 72 hours, your spot rotates to the next person. We'll send one
                reminder before that happens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
