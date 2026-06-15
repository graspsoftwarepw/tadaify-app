/**
 * The five global, centrally-rendered platform-admin modals. AdminPanelScreen
 * owns the open/close state and passes the active modal id plus a loose context
 * bag; this component renders the matching backdrop + modal faithfully from
 * mockups/tadaify-mvp/admin-panel.html (lines 2701–2942).
 *
 * Dismissal mirrors the mockup's openModal/closeModal/escClose helpers: Escape,
 * the × button, the Cancel/Close footer button, and a backdrop click all close.
 *
 * @implements fr-admin-panel
 */
import { useEffect, useState } from "react";

import type { AdminSection, AdminModalId, AdminCtx } from "../adminPanelTypes";
import {
  compUpgradeOptionsFixture,
  publishLegalOptionsFixture,
} from "./adminModalsFixture";

export function AdminModals({
  openId,
  ctx,
  onClose,
  onNavigate,
  onImpersonate,
}: {
  openId: AdminModalId | null;
  ctx: AdminCtx;
  onClose: () => void;
  onNavigate: (s: AdminSection) => void;
  onImpersonate: (handle: string) => void;
}) {
  const [hardDeleteInput, setHardDeleteInput] = useState("");

  useEffect(() => {
    if (!openId) return;
    const escClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", escClose);
    return () => document.removeEventListener("keydown", escClose);
  }, [openId, onClose]);

  // Reset the type-to-confirm field whenever the hard-delete modal (re)opens.
  useEffect(() => {
    if (openId === "hard-delete") setHardDeleteInput("");
  }, [openId]);

  if (!openId) return null;

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const compOptions = compUpgradeOptionsFixture();
  const legalOptions = publishLegalOptionsFixture();

  // user-detail dynamic bits (mockup populateModal fallbacks).
  const udName = ctx.name ?? "Maya Chen";
  const udHandle = ctx.handle ?? "maya_creates";
  const udEmail = ctx.email ?? "maya@example.com";
  const udTier = ctx.tier ?? "Pro";
  const udInitial = (udName || "?").charAt(0).toUpperCase();

  // take-down dynamic bits.
  const tdHandle = ctx.handle ?? "lukas_b";
  const tdReason = ctx.reason ?? "spam";

  // hard-delete confirmation gate.
  const hdHandle = ctx.handle ?? "lukas_b";
  const hardDeleteReady = hardDeleteInput === hdHandle;

  return (
    <div className="mb open" onClick={onBackdrop}>
      {openId === "user-detail" && (
        <div className="modal modal-lg">
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
          <div className="modal-h">
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div className="row-mini" style={{ gap: "12px" }}>
                <div
                  className="av"
                  style={{ width: "46px", height: "46px", fontSize: "19px" }}
                >
                  {udInitial}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{udName}</h3>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--fg-muted)",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      @{udHandle}
                    </span>{" "}
                    ·{" "}
                    <span className="chip tier-pro" style={{ marginLeft: "4px" }}>
                      {udTier}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-body">
            <div className="ud-grid">
              <div className="ud-section">
                <h4>Account</h4>
                <div className="ud-row">
                  <span className="ud-k">Email</span>
                  <span className="ud-v">{udEmail}</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Signup</span>
                  <span className="ud-v">2026-01-12</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Last active</span>
                  <span className="ud-v">2m ago</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">User ID</span>
                  <span className="ud-v" style={{ fontSize: "11px" }}>
                    usr_K7zX9p
                  </span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Status</span>
                  <span className="ud-v">
                    <span className="chip success">Active</span>
                  </span>
                </div>
              </div>
              <div className="ud-section">
                <h4>Billing</h4>
                <div className="ud-row">
                  <span className="ud-k">Stripe customer</span>
                  <span className="ud-v" style={{ fontSize: "11px" }}>
                    cus_K3jXp
                  </span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Subscription</span>
                  <span className="ud-v">Pro · monthly</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">MRR contribution</span>
                  <span className="ud-v">$19.99</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Lifetime value</span>
                  <span className="ud-v">$36.00</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Next billing</span>
                  <span className="ud-v">2026-05-12</span>
                </div>
              </div>
              <div className="ud-section">
                <h4>Page activity</h4>
                <div className="ud-row">
                  <span className="ud-k">Blocks</span>
                  <span className="ud-v">14</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Custom domain</span>
                  <span className="ud-v">— none</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Pageviews (30d)</span>
                  <span className="ud-v">2,007</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Clicks (30d)</span>
                  <span className="ud-v">847</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Public URL</span>
                  <span className="ud-v">
                    <a
                      href={`/${udHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      tadaify.com/{udHandle} ↗
                    </a>
                  </span>
                </div>
              </div>
              <div className="ud-section">
                <h4>Compliance</h4>
                <div className="ud-row">
                  <span className="ud-k">ToS accepted</span>
                  <span className="ud-v">v3.3 · 2026-02-19</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">PP accepted</span>
                  <span className="ud-v">v2.1 · 2026-01-12</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Reports against</span>
                  <span className="ud-v">0</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">Reports filed</span>
                  <span className="ud-v">2 (both dismissed)</span>
                </div>
                <div className="ud-row">
                  <span className="ud-k">GDPR exports</span>
                  <span className="ud-v">1 (Mar 4)</span>
                </div>
              </div>
            </div>

            <div className="ud-section" style={{ marginTop: "14px" }}>
              <h4>Recent activity</h4>
              <div className="feed-row" style={{ padding: "6px 0" }}>
                <div className="fr-ico pos">+</div>
                <div className="fr-text">
                  <div className="fr-title">Upgraded Free → Pro</div>
                  <div className="fr-meta">2m ago · Stripe sub_K3jX</div>
                </div>
              </div>
              <div className="feed-row" style={{ padding: "6px 0" }}>
                <div className="fr-ico info">i</div>
                <div className="fr-text">
                  <div className="fr-title">Added Stripe block</div>
                  <div className="fr-meta">14m ago · "Buy my preset pack"</div>
                </div>
              </div>
              <div className="feed-row" style={{ padding: "6px 0" }}>
                <div className="fr-ico info">i</div>
                <div className="fr-text">
                  <div className="fr-title">Edited bio</div>
                  <div className="fr-meta">38m ago</div>
                </div>
              </div>
              <div className="feed-row" style={{ padding: "6px 0" }}>
                <div className="fr-ico info">↗</div>
                <div className="fr-text">
                  <div className="fr-title">Logged in</div>
                  <div className="fr-meta">12h ago · Lisbon, PT · Safari iOS</div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button
              className="btn btn-ghost btn-sm ro-hide-write"
              onClick={() => onImpersonate(udHandle)}
            >
              Login as user
            </button>
            <button
              className="btn btn-ghost btn-sm ro-hide-write"
              onClick={() => window.alert("Mockup — would send custom email")}
            >
              Send email
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate("audit")}
            >
              View audit log
            </button>
            <button
              className="btn btn-danger-ghost btn-sm ro-hide-write"
              onClick={() => window.alert("Mockup — would suspend")}
            >
              Suspend
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}

      {openId === "takedown" && (
        <div className="modal">
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
          <div className="modal-h">
            <h3>Take down this page?</h3>
            <div className="modal-sub">
              <b>@{tdHandle}</b> · reason: <span>{tdReason}</span>
            </div>
          </div>
          <div className="modal-body">
            <div className="warning-box" style={{ marginBottom: "12px" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                Taking down a page is reversible (the user can appeal), but the
                public URL returns <b>410 Gone</b> immediately. The user receives
                an email explaining the decision.
              </div>
            </div>
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
              Reason shown to user (required)
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Plain-language explanation, ~50-200 chars"
              defaultValue="Page violated ToS §4.2 — links to a known scam site. Repeat offenders may be permanently suspended."
            />
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <div
                className="checkbox"
                onClick={(e) => e.currentTarget.classList.toggle("on")}
              ></div>
              <label style={{ fontSize: "13px" }}>
                Also suspend the creator's account (3+ violations rule)
              </label>
            </div>
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <div
                className="checkbox on"
                onClick={(e) => e.currentTarget.classList.toggle("on")}
              ></div>
              <label style={{ fontSize: "13px" }}>
                Send notification email to creator
              </label>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                window.alert(
                  "Mockup — would take down page + return 410 + email creator",
                );
                onClose();
              }}
            >
              Take down now
            </button>
          </div>
        </div>
      )}

      {openId === "hard-delete" && (
        <div className="modal">
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
          <div className="modal-h">
            <h3 style={{ color: "var(--danger)" }}>Hard-delete account</h3>
            <div className="modal-sub">
              This is irreversible. All user data, blocks, analytics, and Stripe
              subscriptions will be cancelled and purged.
            </div>
          </div>
          <div className="modal-body">
            <div className="warning-box">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <b>Deletes immediately:</b> Stripe subscriptions cancelled,{" "}
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                  delete_user_data()
                </code>{" "}
                RPC runs (cascade across 12 tables), Auth row removed. Audit log
                retains the record forever.
                <br />
                <br />
                <b>Use only when:</b> GDPR Article 17 erasure request, ToS
                violation requires hard removal, or duplicate test account.
              </div>
            </div>
            <p style={{ marginTop: "14px", fontSize: "13px" }}>
              Type the handle{" "}
              <b style={{ fontFamily: "var(--font-mono)" }}>@{hdHandle}</b> below
              to confirm.
            </p>
            <input
              className="input"
              type="text"
              placeholder={hdHandle}
              autoComplete="off"
              value={hardDeleteInput}
              onChange={(e) => setHardDeleteInput(e.target.value)}
            />
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={!hardDeleteReady}
              onClick={() => {
                window.alert(
                  "Mockup — would call delete_user_data() + cancel Stripe + delete auth row",
                );
                onClose();
              }}
            >
              Hard-delete forever
            </button>
          </div>
        </div>
      )}

      {openId === "comp-upgrade" && (
        <div className="modal">
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
          <div className="modal-h">
            <h3>Comp upgrade tier</h3>
            <div className="modal-sub">
              Grant a paid tier without charging the user. Recorded in audit log
              with reason.
            </div>
          </div>
          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
                User
              </label>
              <input
                className="input"
                type="text"
                placeholder="Search by handle…"
                defaultValue="@maya_creates"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
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
                  New tier
                </label>
                <select className="input">
                  {compOptions.tiers.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
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
                  Duration
                </label>
                <select className="input">
                  {compOptions.durations.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
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
                Reason (audit)
              </label>
              <input
                className="input"
                type="text"
                placeholder="e.g. PH winner, beta tester, support comp"
                defaultValue="Product Hunt #1 winner"
              />
            </div>
            <div className="info-box">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
              </svg>
              <span>
                If the user has an active paid sub, the comp grants additional
                months on top — Stripe billing pauses for the comp duration, then
                resumes.
              </span>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                window.alert("Mockup — would grant comp + write audit row");
                onClose();
              }}
            >
              Grant comp
            </button>
          </div>
        </div>
      )}

      {openId === "publish-legal" && (
        <div className="modal modal-lg">
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
          <div className="modal-h">
            <h3>Publish ToS v3.4</h3>
            <div className="modal-sub">
              This will replace v3.3 as the live document. Existing acceptances
              remain unless you force re-acceptance.
            </div>
          </div>
          <div
            className="modal-body"
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
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
                  Effective date (UTC)
                </label>
                <input
                  className="input"
                  type="datetime-local"
                  defaultValue="2026-04-27T00:00"
                />
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
                  Notification
                </label>
                <select className="input">
                  {legalOptions.notifications.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                padding: "11px",
                border: "1px solid var(--border)",
                borderRadius: "9px",
              }}
            >
              <button
                className="toggle"
                onClick={(e) => e.currentTarget.classList.toggle("on")}
                aria-label="Force re-acceptance"
              ></button>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13.5px" }}>
                  Force re-acceptance from all 847 active users
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--fg-muted)",
                    marginTop: "2px",
                  }}
                >
                  Every user sees an acceptance modal on next page load. Sessions
                  remain valid but actions are blocked until accepted. Use only
                  for material changes (refund policy, jurisdiction, data
                  sharing).
                </div>
              </div>
            </div>
            <div className="warning-box">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" />
                <line x1="12" y1="9" x2="12" y2="13" />
              </svg>
              <div>
                Once published, this version is immutable. Future changes require
                a new version number.
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => window.alert("Mockup — would save as draft revision")}
            >
              Save as draft
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                window.alert(
                  "Mockup — would publish v3.4 + leave existing acceptances intact",
                );
                onClose();
              }}
            >
              Publish v3.4
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
