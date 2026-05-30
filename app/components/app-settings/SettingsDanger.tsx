/**
 * SettingsDanger — Danger zone sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-danger.html (2071 LOC)
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real Stripe / account-deletion wiring — all handlers are stubs with
 * TODO comments pointing at the real implementation path.
 *
 * Sections (in order):
 *   1. Post-state banners  — cancel-confirmed / paused (conditionally visible)
 *   2. Cancel subscription — plan summary + AP-029 promise callout + 3-step modal
 *   3. Reactivate          — shown only after cancel-confirmed state
 *   4. Pause subscription  — Pro+ tier gate at click via TierGate stub
 *   5. Before you leave    — cross-link to GDPR & data export
 *   6. Delete account      — consequence list + before-checklist + GDPR Art.17 modal
 *   7. Accidentally clicked delete? — recovery instructions
 *   8. Account action history — read-only audit log
 *
 * Modals (centered, NEVER drawers per AP-013):
 *   - Cancel modal (3-step: reason → did you know? → confirm)
 *   - Pause modal  (duration picker + reason)
 *   - Delete account modal (type-email + password + ack checkbox)
 *
 * DEC trail honoured:
 *   AP-010   one-click cancel — no survey cascade, no rebuttals (single confirm)
 *   AP-013   no right-side drawers — every editor is a centered modal
 *   AP-017   no blur of premium UI — pause visible for all tiers, gate at click
 *   AP-029   pages stay live during dunning + cancellation grace
 *   AP-031   no fear-mongering copy — friendly-but-serious tone throughout
 *   DEC-PRICELOCK-01 reactivate before period_end keeps locked price for life
 *   DEC-DELETE-GRACE-01 30-day account-recovery window after delete (login restores)
 *   DEC-PAUSE-01 limited to 2 pauses per year
 *   F-COMPLIANCE-001 GDPR Art.17 erasure (type-email-to-confirm)
 *
 * Story: F-APP-SETTINGS-DANGER-001 (#39)
 */

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type DangerPageState =
  | "default"
  | "cancel-confirmed"
  | "paused";

type CancelStep = 1 | 2 | 3;

type Tier = "free" | "creator" | "pro" | "business";

const TIER_RANK: Record<Tier, number> = { free: 0, creator: 1, pro: 2, business: 3 };

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsDanger() {
  // ── Page-level state (mirrors mockup demo toolbar) ────────────────────────
  const [pageState, setPageState] = useState<DangerPageState>("default");
  const [tier] = useState<Tier>("creator"); // TODO: wire to subscription API

  const cancelConfirmed = pageState === "cancel-confirmed";
  const paused = pageState === "paused";

  // ── Cancel modal ──────────────────────────────────────────────────────────
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<CancelStep>(1);
  const [cancelDunning] = useState(false); // TODO: wire to billing state

  const CANCEL_SUBS: Record<CancelStep, string> = {
    1: "Tell us why (optional) so we can keep improving — or skip ahead.",
    2: "A couple of things you may have missed before you decide.",
    3: "Last step — here's exactly what happens when you cancel.",
  };

  const openCancelModal = useCallback(() => {
    setCancelStep(1);
    setCancelModalOpen(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setCancelStep(1);
  }, []);

  const handleCancelStep = useCallback((n: CancelStep) => {
    setCancelStep(n);
  }, []);

  const confirmCancel = useCallback(() => {
    // TODO: wire to Stripe subscriptions.update({ cancel_at_period_end: true })
    setCancelModalOpen(false);
    setPageState("cancel-confirmed");
  }, []);

  // ── Pause modal ───────────────────────────────────────────────────────────
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  const openPauseModal = useCallback(() => {
    // Tier gate at click — AP-017 (no blur of premium UI; gate fires at click)
    if (TIER_RANK[tier] < TIER_RANK.pro) {
      // TODO: wire to TierGate.checkAndProceed with upgrade redirect to /pricing?upgrade=pro&from=pause
      return;
    }
    // TODO: wire to Stripe subscription pause API
    setPauseModalOpen(true);
  }, [tier]);

  const confirmPause = useCallback(() => {
    // TODO: wire to Stripe subscription pause API
    // Real impl: stripe.subscriptions.update({ pause_collection: { behavior: 'mark_uncollectible' } })
    setPauseModalOpen(false);
    setPageState("paused");
  }, []);

  // ── Reactivate ────────────────────────────────────────────────────────────
  const reactivate = useCallback(() => {
    // TODO: wire to Stripe subscriptions.update({ cancel_at_period_end: false })
    // DEC-PRICELOCK-01: reactivating before period_end keeps the locked price
    setPageState("default");
  }, []);

  // ── Delete account modal ──────────────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAck, setDeleteAck] = useState(false);

  const USER_EMAIL = "alexandra@example.com"; // TODO: wire to user session

  const emailMatches = deleteEmail.toLowerCase().trim() === USER_EMAIL.toLowerCase().trim();
  const deleteValid = emailMatches && deletePassword.length > 0 && deleteAck;

  const openDeleteModal = useCallback(() => {
    // TODO: wire to account deletion flow
    setDeleteEmail("");
    setDeletePassword("");
    setDeleteAck(false);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    // TODO: wire to DELETE /api/account — GDPR Art.17 erasure request
    // Real impl: mark account as pending_deletion, cancel Stripe sub, queue 30-day cleanup job
    setDeleteModalOpen(false);
  }, []);

  const emailHintState = deleteEmail.length === 0 ? "neutral" : emailMatches ? "ok" : "error";

  // ── Reason radio state ────────────────────────────────────────────────────
  const [cancelReason, setCancelReason] = useState("");

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ============================================================
           SETTINGS CONTENT: DANGER ZONE
           ============================================================ */}
      <div className="settings-content" id="pane-danger" data-tab="danger">

        {/* ===========================================================
             POST-STATE BANNERS (shown only on cancel-confirmed / paused)
             =========================================================== */}

        {/* Cancel confirmed banner */}
        {cancelConfirmed && (
          <div className="post-state-banner is-success" id="banner-cancel-confirmed" role="status">
            <div className="psb-ico" aria-hidden="true">✓</div>
            <div className="psb-body">
              <div className="psb-title">You're on Free until Dec 1, 2026 — then your page stays live as Free tier. Thanks for being a creator!</div>
              <div className="psb-sub">All your blocks, links, and analytics are preserved. Reactivate anytime to keep your locked $7.99/mo price.</div>
            </div>
            <div className="psb-actions">
              <button
                className="btn btn-warm btn-sm"
                onClick={() => {
                  setPageState("default");
                  document.getElementById("reactivate-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Reactivate →
              </button>
            </div>
          </div>
        )}

        {/* Paused banner */}
        {paused && (
          <div className="post-state-banner is-warn" id="banner-paused" role="status">
            <div className="psb-ico" aria-hidden="true">⏸</div>
            <div className="psb-body">
              <div className="psb-title">Subscription paused until June 27, 2026 · Resume anytime</div>
              <div className="psb-sub">Your page stays live with full Creator features. We'll send a reminder 3 days before resume. No charges during the pause.</div>
            </div>
            <div className="psb-actions">
              <button
                className="btn btn-warm btn-sm"
                onClick={() => {
                  // TODO: wire to Stripe subscription resume API
                  // Real impl: stripe.subscriptions.update({ pause_collection: '' })
                  setPageState("default");
                }}
              >
                Resume now
              </button>
            </div>
          </div>
        )}

        {/* ===========================================================
             SECTION 1 — CANCEL SUBSCRIPTION
             =========================================================== */}
        {tier !== "free" && (
          <section className="settings-section danger-zone" id="cancel-section" aria-labelledby="sec-cancel">
            <div className="settings-section-title" id="sec-cancel">
              <span className="sst-emoji" aria-hidden="true">👋</span>
              Cancel subscription
            </div>

            <p className="section-lede">
              Sorry to see you considering this. Before you go, take a look at what cancelling means —
              the good news is that <strong>your page doesn't disappear</strong>.
            </p>

            {/* Current plan summary */}
            <div className="plan-summary" id="plan-summary">
              <div className="ps-emoji" aria-hidden="true">✨</div>
              <div className="ps-body">
                <div className="ps-title">
                  Creator{" "}
                  <span className="chip locked-life" style={{ marginLeft: 6 }}>🔒 Price locked for life</span>
                </div>
                <div className="ps-meta">
                  <b>$7.99/month</b> · billed monthly · renews <b>May 26, 2026</b> via Visa **** 4242
                </div>
                <div className="ps-chips">
                  <span className="chip success">● Active</span>
                  <span className="chip neutral">Started Apr 14, 2026</span>
                  <span className="chip neutral">12 days into period</span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <a href="/app?tab=settings&subtab=billing" className="btn btn-ghost btn-sm">
                  Manage in Billing →
                </a>
              </div>
            </div>

            {/* AP-029 promise — THE differentiator */}
            <div className="promise-callout" role="note">
              <div className="pc-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className="pc-body">
                <div className="pc-title">Your page stays live forever — even on Free tier</div>
                <div className="pc-sub">
                  When you cancel, <b>tadaify.com/alexandra</b> keeps working with your blocks, links, and analytics.
                  You drop down to <b>Free tier limits</b> after the period ends (8 blocks, no custom domain, basic analytics) —
                  but the page never goes dark. <em>This is what makes us different from Linktree.</em>
                </div>
              </div>
            </div>

            {!cancelConfirmed && (
              <>
                <button
                  className="btn btn-danger-ghost"
                  onClick={openCancelModal}
                  style={{ marginTop: 6 }}
                >
                  Cancel Creator subscription
                </button>
                <span style={{ fontSize: 12, color: "var(--fg-muted)", marginLeft: 10 }}>
                  No survey, no guilt trip — single confirm step.
                </span>
              </>
            )}
          </section>
        )}

        {/* ===========================================================
             SECTION 2 — REACTIVATE (visible only after cancel)
             =========================================================== */}
        {cancelConfirmed && (
          <section className="settings-section warn-zone" id="reactivate-section" aria-labelledby="sec-reactivate">
            <div className="settings-section-title" id="sec-reactivate">
              <span className="sst-emoji" aria-hidden="true">🔄</span>
              Reactivate before period ends
            </div>
            <p className="section-lede">
              Your subscription is set to cancel on <strong>Dec 1, 2026</strong>. Reactivate before then to keep your{" "}
              <strong>locked $7.99/mo price</strong> (DEC-PRICELOCK-01) — it never changes for as long as you stay subscribed.
            </p>
            <p style={{ fontSize: "12.5px", color: "var(--fg-muted)", marginBottom: 14, lineHeight: 1.55 }}>
              After Dec 1 your subscription truly expires; reactivating later will quote the current price (currently still $7.99/mo, but no guarantee).
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-warm" onClick={reactivate}>
                Reactivate at $7.99/mo →
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  // TODO: wire to Stripe Customer Portal payment method update
                }}
              >
                Update payment method first
              </button>
            </div>
          </section>
        )}

        {/* ===========================================================
             SECTION 3 — PAUSE SUBSCRIPTION (Pro+)
             =========================================================== */}
        <section className="settings-section warn-zone" id="pause-section" aria-labelledby="sec-pause">
          <div className="settings-section-title with-action" id="sec-pause">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--brand-warm-dark)" }}>
              <span className="sst-emoji" aria-hidden="true">⏸</span>
              Pause subscription
            </span>
            <span className="chip-tier-pro chip" style={{ textTransform: "none", letterSpacing: 0 }}>✨ Pro</span>
          </div>

          {/* Tier banner (Free / Creator only — Pro/Business hide this) */}
          {TIER_RANK[tier] < TIER_RANK.pro && (
            <div className="tier-banner" id="pause-tier-banner">
              <div className="tb-ico" aria-hidden="true">✨</div>
              <div className="tb-text">
                <div className="tb-title">Pause is a Pro feature</div>
                <div className="tb-sub">
                  Going on hiatus? Pause for 1–3 months instead of cancelling — your page stays live with full Pro features and you keep your locked price.
                </div>
              </div>
              <button
                className="btn btn-warm btn-sm"
                onClick={() => {
                  // TODO: wire to /pricing.html?upgrade=pro&from=pause
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          )}

          <p className="section-lede">
            Going on hiatus? Pause your subscription for 1–3 months. <strong>No charges during the pause</strong>,
            your page stays live with all Pro features, and you'll get a reminder 3 days before it resumes.{" "}
            <span style={{ color: "var(--fg-muted)" }}>(Limited to 2 pauses per year per DEC-PAUSE-01.)</span>
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-warm btn-sm" onClick={openPauseModal}>
              Pause subscription →
            </button>
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>2 pauses remaining this year</span>
          </div>
        </section>

        {/* ===========================================================
             SECTION 4 — EXPORT CROSS-LINK
             =========================================================== */}
        <section className="settings-section" aria-labelledby="sec-export">
          <div className="settings-section-title" id="sec-export">
            <span className="sst-emoji" aria-hidden="true">📦</span>
            Before you leave — download your data
          </div>
          <a href="/app?tab=settings&subtab=gdpr" className="crosslink-card" style={{ textDecoration: "none" }}>
            <div className="xc-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="xc-body">
              <div className="xc-title">Export everything as ZIP (JSON + CSV) →</div>
              <div className="xc-sub">Your profile, pages, blocks, subscribers, bookings, analytics, billing, audit log. Available in GDPR &amp; data tab.</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fg-subtle)", flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </section>

        {/* ===========================================================
             SECTION 5 — DELETE ACCOUNT (GDPR Art. 17)
             =========================================================== */}
        <section className="settings-section danger-zone" id="delete-section" aria-labelledby="sec-delete">
          <div className="settings-section-title with-action" id="sec-delete">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="sst-emoji" aria-hidden="true">🗑️</span>
              Permanently delete your tadaify account
            </span>
            <span className="chip neutral" style={{ textTransform: "none", letterSpacing: 0, fontWeight: 600 }}>GDPR Art. 17</span>
          </div>
          <p className="section-lede">
            This is the <strong>nuclear option</strong> — different from cancelling. Deletion permanently erases your account,
            your handle, and everything connected to it. There is a 30-day grace window during which logging in restores
            your account; after that, it's gone forever.
          </p>

          {/* Consequence list */}
          <ul className="consequence-list" aria-label="What deleting your account means">
            <li className="is-bad">
              <span className="cl-ico" aria-hidden="true">×</span>
              <div className="cl-body">
                <strong>Your tadaify page (<code>tadaify.com/alexandra</code>) is permanently deleted</strong>
                <span className="cl-meta">All inbound links to your page will 404 after the 30-day grace window. Update any external links pointing here before deleting.</span>
              </div>
            </li>
            <li className="is-bad">
              <span className="cl-ico" aria-hidden="true">×</span>
              <div className="cl-body">
                <strong>Your handle <code>@alexandra</code> becomes available for someone else</strong>
                <span className="cl-meta">After the grace period ends. We hold the handle for you for 30 days — sign back in within that window to recover everything.</span>
              </div>
            </li>
            <li className="is-bad">
              <span className="cl-ico" aria-hidden="true">×</span>
              <div className="cl-body">
                <strong>All your data is erased within 30 days</strong>
                <span className="cl-meta">Profile, blocks, pages, subscribers, bookings, blog posts, analytics. Audit log retained for 90 days for legal compliance, then deleted. Encrypted backups expire within 60 days.</span>
              </div>
            </li>
            <li className="is-bad">
              <span className="cl-ico" aria-hidden="true">×</span>
              <div className="cl-body">
                <strong>Active subscriptions are cancelled (no refund)</strong>
                <span className="cl-meta">You had access through your paid period. No proration refund unless you're within the 7-day money-back window (Apr 14–21, 2026).</span>
              </div>
            </li>
            <li className="is-warn">
              <span className="cl-ico" aria-hidden="true">!</span>
              <div className="cl-body">
                <strong>Your custom domain DNS records are NOT auto-removed</strong>
                <span className="cl-meta">After deletion, point <code>alexandra.com</code> elsewhere via your DNS provider — otherwise visitors hit a dangling domain. We can't manage your DNS for you.</span>
              </div>
            </li>
            <li className="is-good">
              <span className="cl-ico" aria-hidden="true">✓</span>
              <div className="cl-body">
                <strong>30-day recovery window</strong>
                <span className="cl-meta">If you change your mind, just sign in within 30 days using your existing email + password. Your account is fully restored — no support ticket needed.</span>
              </div>
            </li>
          </ul>

          {/* Before you go checklist */}
          <div style={{ margin: "18px 0 0" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--fg-subtle)", marginBottom: 8 }}>
              Before you go — recommended steps
            </div>
            <ul className="before-checklist">
              <li>
                <span className="bc-num">1</span>
                <div className="bc-body">
                  <div className="bc-title">Download all your data</div>
                  <div className="bc-sub">Get a ZIP of your blocks, subscribers, bookings, analytics. You can't ask for this after deletion.</div>
                </div>
                <a href="/app?tab=settings&subtab=gdpr" className="bc-link">GDPR &amp; data →</a>
              </li>
              <li>
                <span className="bc-num">2</span>
                <div className="bc-body">
                  <div className="bc-title">Notify your subscribers</div>
                  <div className="bc-sub">Send a final newsletter with your new contact info or alternative platform.</div>
                </div>
                <a href="/app?tab=newsletter" className="bc-link">Newsletter →</a>
              </li>
              <li>
                <span className="bc-num">3</span>
                <div className="bc-body">
                  <div className="bc-title">Update other sites pointing to your tadaify URL</div>
                  <div className="bc-sub">Instagram bio, TikTok link, YouTube about, business cards. Replace <code>tadaify.com/alexandra</code> with your new destination.</div>
                </div>
              </li>
              <li>
                <span className="bc-num">4</span>
                <div className="bc-body">
                  <div className="bc-title">Update your custom domain DNS (if you have one)</div>
                  <div className="bc-sub">Point <code>alexandra.com</code> away from tadaify before the grace window ends.</div>
                </div>
                <a href="/app?tab=domain" className="bc-link">Domain →</a>
              </li>
            </ul>
          </div>

          <button className="btn btn-danger" onClick={openDeleteModal} style={{ marginTop: 18 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
            Delete my account
          </button>
          <span style={{ fontSize: 12, color: "var(--fg-muted)", marginLeft: 10 }}>Type your email + password to confirm</span>
        </section>

        {/* ===========================================================
             SECTION 6 — RECOVERY
             =========================================================== */}
        <section className="settings-section" aria-labelledby="sec-recovery">
          <div className="settings-section-title" id="sec-recovery">
            <span className="sst-emoji" aria-hidden="true">🆘</span>
            Accidentally clicked delete?
          </div>
          <p className="section-lede" style={{ marginBottom: 0 }}>
            <strong>Sign in within 30 days</strong> using your existing email + password — your account is fully restored, no support ticket needed.
            After 30 days, contact{" "}
            <a href="mailto:support@tadaify.com" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>support@tadaify.com</a>{" "}
            within 90 days while the audit log is still retained — recovery isn't guaranteed but we'll try.
          </p>
        </section>

        {/* ===========================================================
             SECTION 7 — AUDIT LOG (read-only transparency)
             =========================================================== */}
        <section className="settings-section" aria-labelledby="sec-audit">
          <div className="settings-section-title with-action" id="sec-audit">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="sst-emoji" aria-hidden="true">📜</span>
              Account action history
            </span>
            <a href="/app?tab=settings&subtab=security" style={{ color: "var(--brand-primary)", fontSize: "12.5px", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
              Full security log →
            </a>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--fg-muted)", marginBottom: 14, lineHeight: 1.55 }}>
            Everything we record about cancel / pause / delete on your account. Retained for 90 days even after deletion for legal compliance.
          </p>

          <div className="audit-row is-reactivate">
            <span className="ar-ico" aria-hidden="true">↻</span>
            <div className="ar-body">
              <div className="ar-event">Subscription reactivated — <strong>$7.99/mo Creator</strong></div>
              <div className="ar-meta">From: 192.0.2.18 · MacBook Air · Stripe sub_1OZk4F</div>
            </div>
            <div className="ar-time">Apr 22, 14:08</div>
          </div>
          <div className="audit-row is-cancel">
            <span className="ar-ico" aria-hidden="true">×</span>
            <div className="ar-body">
              <div className="ar-event">Subscription cancelled at period end (<strong>Dec 1, 2026</strong>) · Reason: <em>Going on hiatus</em></div>
              <div className="ar-meta">From: 192.0.2.18 · MacBook Air · Stripe sub_1OZk4F</div>
            </div>
            <div className="ar-time">Apr 22, 13:55</div>
          </div>
          <div className="audit-row is-pause">
            <span className="ar-ico" aria-hidden="true">⏸</span>
            <div className="ar-body">
              <div className="ar-event">Subscription paused for 2 months (resume Jun 27, 2026)</div>
              <div className="ar-meta">From: 198.51.100.42 · iPhone Safari · Stripe sub_1OZk4F</div>
            </div>
            <div className="ar-time">Apr 18, 09:12</div>
          </div>
          <div className="audit-row is-delete-attempt">
            <span className="ar-ico" aria-hidden="true">?</span>
            <div className="ar-body">
              <div className="ar-event">Delete account modal opened — abandoned (closed without confirming)</div>
              <div className="ar-meta">From: 192.0.2.18 · MacBook Air · Session 8m</div>
            </div>
            <div className="ar-time">Apr 16, 22:34</div>
          </div>
        </section>

      </div>{/* /.settings-content */}


      {/* ============================================================
           CANCEL MODAL — 3-step flow (AP-010: single confirm, no survey cascade)
           Centered, NEVER drawer per AP-013
           ============================================================ */}
      {cancelModalOpen && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="cancel-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeCancelModal(); }}
        >
          <div className="modal modal-lg">
            <button className="modal-close-x" onClick={closeCancelModal} aria-label="Close">×</button>

            <h3 className="danger-h" id="cancel-modal-title">Cancel Creator subscription?</h3>
            <p className="modal-sub" id="cancel-step-sub">{CANCEL_SUBS[cancelStep]}</p>

            {/* Step indicator */}
            <div className="step-bar" aria-hidden="true">
              <div className={`step${cancelStep === 1 ? " is-active" : cancelStep > 1 ? " is-done" : ""}`} id="cancel-step-1">
                <span className="num">1</span> Why?
              </div>
              <div className={`step-line${cancelStep > 1 ? " is-done" : ""}`} />
              <div className={`step${cancelStep === 2 ? " is-active" : cancelStep > 2 ? " is-done" : ""}`} id="cancel-step-2">
                <span className="num">2</span> Did you know?
              </div>
              <div className={`step-line${cancelStep > 2 ? " is-done" : ""}`} />
              <div className={`step${cancelStep === 3 ? " is-active" : ""}`} id="cancel-step-3">
                <span className="num">3</span> Confirm
              </div>
            </div>

            {/* ====== STEP 1 ====== */}
            {cancelStep === 1 && (
              <div className="cancel-step-pane" id="cancel-pane-1">
                <p style={{ fontSize: "12.5px", color: "var(--fg-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
                  <strong>Optional.</strong> Skip if you'd rather just leave — we never block you with a survey (per AP-010).
                </p>
                <div className="reason-list" role="radiogroup" aria-label="Cancellation reason">
                  {[
                    { value: "too-expensive",    title: "Too expensive for what I use",  sub: "Heads up: dropping to Free still keeps your page live forever (AP-029)." },
                    { value: "found-alternative", title: "Found a better alternative",   sub: "We'd love to know which — tell us in the box below if you want." },
                    { value: "dont-use-enough",  title: "Don't use it enough",           sub: "Have you considered pausing instead? See step 2." },
                    { value: "hiatus",           title: "Going on hiatus",               sub: "Pause is probably what you want (Pro+, see step 2)." },
                    { value: "other",            title: "Other",                         sub: "Tell us in the box below." },
                  ].map((r) => (
                    <label
                      key={r.value}
                      className={`reason-row${cancelReason === r.value ? " is-checked" : ""}`}
                      data-reason={r.value}
                    >
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={r.value}
                        checked={cancelReason === r.value}
                        onChange={() => setCancelReason(r.value)}
                      />
                      <div className="r-body">
                        <div className="r-title">{r.title}</div>
                        <div className="r-sub">{r.sub}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <label className="field-label" htmlFor="cancel-feedback">Anything else? (optional)</label>
                <textarea
                  className="field-input"
                  id="cancel-feedback"
                  rows={3}
                  placeholder="Goes straight to feedback@tadaify.com — read by a human. Doesn't change your cancellation."
                  // TODO: wire to feedback API
                />

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={closeCancelModal}>Never mind, keep my plan</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleCancelStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {/* ====== STEP 2 — RETENTION ====== */}
            {cancelStep === 2 && (
              <div className="cancel-step-pane" id="cancel-pane-2">
                <div className="retention-card">
                  <div className="rc-eyebrow">Did you know?</div>
                  <div className="rc-title">You haven't tried these features yet</div>
                  <div className="rc-body">
                    Based on your activity over the last 30 days — these come with your current $7.99/mo Creator plan
                    and might change your mind:
                  </div>
                  <ul className="rc-feature-list">
                    <li>
                      <span className="rcf-emoji" aria-hidden="true">📧</span>
                      <div>
                        <b>Newsletter signup block (capped at 1k subscribers free)</b>
                        <span className="rcf-meta">You have 142 visitors but no email capture set up. Avg conversion: 2–4%.</span>
                      </div>
                    </li>
                    <li>
                      <span className="rcf-emoji" aria-hidden="true">📊</span>
                      <div>
                        <b>Last-30-day analytics with click attribution</b>
                        <span className="rcf-meta">Free tier loses per-block click breakdown. You currently get to see which blocks convert.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Pause alternative — visible to Pro+ in the cancel flow */}
                {TIER_RANK[tier] >= TIER_RANK.pro && (
                  <div className="pause-alt" id="cancel-pause-alt">
                    <div className="pa-ico" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    </div>
                    <div className="pa-body">
                      <div className="pa-title">
                        Pause instead — keep everything paused for 1–3 months{" "}
                        <span className="chip-tier-pro chip" style={{ textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>✨ Pro</span>
                      </div>
                      <div className="pa-sub">No charges during the pause, page stays live, your locked price stays locked. Better fit for a hiatus.</div>
                    </div>
                    <button
                      className="btn btn-warm btn-sm"
                      onClick={() => { closeCancelModal(); openPauseModal(); }}
                    >
                      Pause instead →
                    </button>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleCancelStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={closeCancelModal}>Never mind, keep my plan</button>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => handleCancelStep(3)}>Continue cancelling →</button>
                </div>
              </div>
            )}

            {/* ====== STEP 3 — CONFIRM ====== */}
            {cancelStep === 3 && (
              <div className="cancel-step-pane" id="cancel-pane-3">
                <p style={{ fontSize: "13.5px", color: "var(--fg)", margin: "0 0 12px", lineHeight: 1.55 }}>
                  Cancelling your <strong>Creator $7.99/mo</strong> subscription. Here's exactly what happens:
                </p>

                <ul className="consequence-list" style={{ marginBottom: 14 }}>
                  <li className="is-warn">
                    <span className="cl-ico" aria-hidden="true">!</span>
                    <div className="cl-body">
                      <strong>Your access to Creator features ends on Dec 1, 2026</strong>
                      <span className="cl-meta">You keep full Creator access for ~7 more months until your paid period ends.</span>
                    </div>
                  </li>
                  <li className="is-good">
                    <span className="cl-ico" aria-hidden="true">✓</span>
                    <div className="cl-body">
                      <strong>Your tadaify page stays live forever as Free tier (AP-029)</strong>
                      <span className="cl-meta">Your URL keeps working. You'll be limited to 8 blocks, no custom domain, basic analytics — but the page never goes dark. <em>This is what makes us different from Linktree.</em></span>
                    </div>
                  </li>
                  <li className="is-good">
                    <span className="cl-ico" aria-hidden="true">✓</span>
                    <div className="cl-body">
                      <strong>All your blocks, pages, subscribers, and analytics are preserved</strong>
                      <span className="cl-meta">Nothing is deleted. If you re-subscribe, everything is exactly where you left it.</span>
                    </div>
                  </li>
                  <li className="is-good">
                    <span className="cl-ico" aria-hidden="true">✓</span>
                    <div className="cl-body">
                      <strong>You can re-subscribe anytime before Dec 1 to keep your locked price</strong>
                      <span className="cl-meta">After Dec 1 the price returns to current rate (currently still $7.99/mo). DEC-PRICELOCK-01 protects you within the grace period.</span>
                    </div>
                  </li>
                </ul>

                {/* Dunning-specific note */}
                {cancelDunning && (
                  <div className="modal-warning" id="cancel-dunning-note">
                    <strong>Heads up:</strong> Your last payment failed (currently in the 7-day dunning window).
                    Your pages stay live during this period (AP-029). Cancellation still takes effect at period end —
                    no extra charge attempts.
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleCancelStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-sm" onClick={closeCancelModal}>Never mind, keep my plan</button>
                  <button className="btn btn-danger" onClick={confirmCancel}>
                    Cancel my subscription
                    {/* TODO: wire to Stripe subscriptions.update({ cancel_at_period_end: true }) */}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ============================================================
           PAUSE MODAL (Pro+) — pick duration + reason + confirm
           ============================================================ */}
      {pauseModalOpen && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="pause-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setPauseModalOpen(false); }}
        >
          <div className="modal">
            <button className="modal-close-x" onClick={() => setPauseModalOpen(false)} aria-label="Close">×</button>
            <h3 id="pause-modal-title" style={{ color: "var(--brand-warm-dark)" }}>Pause subscription</h3>
            <p className="modal-sub">
              No charges during the pause. Your page stays live with full Creator features.
              We'll send a reminder 3 days before resume so you can extend or cancel.
            </p>

            <label className="field-label">Pause for</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <label className="reason-row" style={{ flex: 1, minWidth: 90, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                <input type="radio" name="pause-duration" value="1" style={{ accentColor: "var(--brand-warm)" }} /> 1 month
              </label>
              <label className="reason-row" style={{ flex: 1, minWidth: 90, padding: "10px 12px", border: "1px solid var(--brand-warm)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, background: "rgba(245,158,11,0.06)" }}>
                <input type="radio" name="pause-duration" value="2" style={{ accentColor: "var(--brand-warm)" }} defaultChecked /> 2 months
              </label>
              <label className="reason-row" style={{ flex: 1, minWidth: 90, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                <input type="radio" name="pause-duration" value="3" style={{ accentColor: "var(--brand-warm)" }} /> 3 months
              </label>
            </div>

            <label className="field-label" htmlFor="pause-reason">Reason (optional)</label>
            <select className="field-input" id="pause-reason" style={{ appearance: "auto" }}>
              <option value="">— Select if you want —</option>
              <option value="travel">Travelling / off-grid</option>
              <option value="rebrand">Rebranding</option>
              <option value="break">Taking a creative break</option>
              <option value="seasonal">Seasonal business</option>
              <option value="other">Other</option>
            </select>
            <p className="field-hint">Auto-resumes <strong>Jun 27, 2026</strong>. You can resume earlier or extend up to 3 months total.</p>

            <div className="modal-info" style={{ marginTop: 14 }}>
              <strong>2 of 2 pauses remaining this year.</strong> Per DEC-PAUSE-01 — limited to prevent indefinite-pause loopholes.
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setPauseModalOpen(false)}>Cancel</button>
              <button className="btn btn-warm" onClick={confirmPause}>
                Pause for 2 months
                {/* TODO: wire to Stripe subscription pause API (pause_collection behavior) */}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ============================================================
           DELETE ACCOUNT MODAL — type-email + password + ack
           Per F-COMPLIANCE-001 / GDPR Art. 17
           ============================================================ */}
      {deleteModalOpen && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="delete-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false); }}
        >
          <div className="modal modal-lg">
            <button className="modal-close-x" onClick={() => setDeleteModalOpen(false)} aria-label="Close">×</button>
            <h3 className="danger-h" id="delete-modal-title">⚠️ Permanently delete your tadaify account</h3>
            <p className="modal-sub">
              This is the final step. Your account, page, handle, and all associated data will be erased within 30 days.
              You have a <strong>30-day grace period</strong> — sign in within that window to fully restore your account.
            </p>

            <div className="modal-warning">
              <strong>Heads up:</strong>{" "}
              Your custom domain DNS records (if any) are <strong>not auto-removed</strong>. Update <code>alexandra.com</code> to point elsewhere via your DNS provider before the grace window ends — otherwise visitors hit a dangling domain.
            </div>

            {/* Read-only account email */}
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Your account email</label>
              <input className="field-input" type="email" value={USER_EMAIL} readOnly />
            </div>

            {/* Type-email input */}
            <div style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="delete-confirm-email">
                Type your email address to confirm
              </label>
              <input
                className={`field-input${emailHintState === "ok" ? " is-ok" : emailHintState === "error" ? " is-error" : ""}`}
                type="email"
                id="delete-confirm-email"
                placeholder={USER_EMAIL}
                autoComplete="off"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
              />
              <div className={`field-hint${emailHintState === "ok" ? " is-ok" : emailHintState === "error" ? " is-error" : ""}`} id="delete-email-hint">
                {emailHintState === "neutral"
                  ? "Case-insensitive. Whitespace trimmed."
                  : emailHintState === "ok"
                  ? "✓ Email matches your account."
                  : `✗ Doesn't match. Should be: ${USER_EMAIL}`}
              </div>
            </div>

            {/* Password input */}
            <div style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="delete-confirm-password">Confirm with your password</label>
              <input
                className="field-input"
                type="password"
                id="delete-confirm-password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="field-hint">We re-verify here even if you're already signed in. This is destructive.</div>
            </div>

            {/* Final ack checkbox */}
            <label className="ack-row">
              <input
                type="checkbox"
                id="delete-ack"
                checked={deleteAck}
                onChange={(e) => setDeleteAck(e.target.checked)}
              />
              <div>
                <strong>I understand this is permanent.</strong>{" "}
                After the 30-day grace window, my account, handle (<code>@alexandra</code>),
                and all data are erased and cannot be recovered.
              </div>
            </label>

            {/* Recovery card */}
            <div className="recovery-card">
              <strong>Changed your mind during the grace period?</strong>{" "}
              Just sign in within 30 days using your existing email + password — your account is fully restored automatically.
              After 30 days, contact{" "}
              <a href="mailto:support@tadaify.com" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>support@tadaify.com</a>{" "}
              within 90 days while the audit log is still retained.
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteModalOpen(false)}>
                Never mind, keep my account
              </button>
              <button
                className="btn btn-danger"
                id="delete-confirm-btn"
                disabled={!deleteValid}
                onClick={confirmDelete}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                </svg>
                Delete my account forever
                {/* TODO: wire to DELETE /api/account — GDPR Art.17 erasure */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
