/**
 * SettingsGdpr — GDPR & data sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-gdpr.html (1736 LOC)
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real API wiring — all handlers are stubs with TODO comments.
 *
 * Sections (in order):
 *   1. Export ready notification bar (conditionally visible)
 *   2. Data export hero (GDPR Art. 20) + "Request export" button → modal
 *   3. Recent exports table
 *   4. Cookies tadaify uses (read-only, essential only)
 *   5. Visitor cookie banner (preview + style picker)
 *   6. Personal data on tadaify (stat grid + breakdown expander)
 *   7. Policies you've accepted (table)
 *   8. DPA / subprocessors (Pro+ gated at click, fully visible)
 *   9. Right to be forgotten (cross-link → Danger zone)
 *
 * Modal:
 *   - Export request modal (centered, NEVER drawer)
 *
 * Tier gating: DPA section visible on all tiers; gate fires at click only
 *   (feedback_no_blur_premium_features 2026-04-26).
 *
 * body[data-*] → .app-dashboard-root[data-*] per constraint.
 * @keyframes prefixed with gdpr- to avoid global collisions.
 *
 * Story: F-APP-SETTINGS-GDPR-001 (#36)
 */

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ExportState = "default" | "pending" | "ready";
type BannerStyle = "bar" | "corner" | "modal";
type Tier = "free" | "creator" | "pro" | "business";

const TIER_RANK: Record<Tier, number> = { free: 0, creator: 1, pro: 2, business: 3 };

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsGdpr() {
  // ── Tier (TODO: wire to subscription API) ─────────────────────────────────
  const [tier] = useState<Tier>("creator");

  // ── Export state ──────────────────────────────────────────────────────────
  const [exportState, setExportState] = useState<ExportState>("default");

  // ── Export modal ──────────────────────────────────────────────────────────
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);

  const openExportModal = useCallback(() => {
    setExportInProgress(false);
    setExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setExportModalOpen(false);
    setExportInProgress(false);
  }, []);

  const startExport = useCallback(() => {
    // TODO: wire to POST /api/gdpr/export-data
    setExportInProgress(true);
    setTimeout(() => {
      setExportModalOpen(false);
      setExportInProgress(false);
      setExportState("ready");
    }, 2200);
  }, []);

  // ── Banner style picker ───────────────────────────────────────────────────
  const [bannerStyle, setBannerStyle] = useState<BannerStyle>("bar");

  const selectBannerStyle = useCallback((style: BannerStyle) => {
    if (style === "modal" && TIER_RANK[tier] < TIER_RANK.pro) {
      // TODO: wire to TierGate.checkAndProceed with upgrade redirect to /pricing?upgrade=pro
      return;
    }
    // TODO: wire to PATCH /api/settings/cookie-banner-style
    setBannerStyle(style);
  }, [tier]);

  // ── Breakdown expander ────────────────────────────────────────────────────
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const toggleBreakdown = useCallback(() => {
    setBreakdownOpen((v) => !v);
  }, []);

  // ── Subprocessor notifications toggle (Pro+ gated at click) ───────────────
  const [subprocNotify, setSubprocNotify] = useState(true);

  const toggleSubprocNotify = useCallback(() => {
    if (TIER_RANK[tier] < TIER_RANK.pro) {
      // TODO: wire to TierGate.checkAndProceed with upgrade redirect
      return;
    }
    // TODO: wire to PATCH /api/settings/subprocessor-notifications
    setSubprocNotify((v) => !v);
  }, [tier]);

  // ── Export include checkboxes ─────────────────────────────────────────────
  const [exportIncludes, setExportIncludes] = useState<Record<string, boolean>>({
    profile: true,
    pages: true,
    subscribers: true,
    bookings: true,
    analytics: true,
    billing: true,
    audit: true,
    files: true,
  });

  const toggleInclude = useCallback((key: string) => {
    setExportIncludes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ============================================================
           SETTINGS CONTENT: GDPR & DATA
           ============================================================ */}
      <div className="settings-content" id="pane-gdpr" data-tab="gdpr">

        {/* ===========================================================
             EXPORT READY NOTIFICATION BAR
             =========================================================== */}
        {exportState === "ready" && (
          <div className="gdpr-export-ready-bar" role="status">
            <div className="gdpr-erb-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="gdpr-erb-text">
              <div className="gdpr-erb-title">Your data export is ready</div>
              <div className="gdpr-erb-sub">Generated 4 minutes ago · 18.4 MB ZIP · Expires in 6 days, 23 hours</div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                // TODO: wire to presigned S3 download URL
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <polyline points="8 17 12 21 16 17" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.9 18.6A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 5 17.3" />
              </svg>
              Download ZIP
            </button>
          </div>
        )}

        {/* ===========================================================
             SECTION 1 — DATA EXPORT (GDPR Art. 20)
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title gdpr-with-action">
            <span>Export your data · GDPR Art. 20</span>
            <span className="chip success">All tiers</span>
          </div>

          <div className="gdpr-export-hero">
            <div className="gdpr-icon-bubble" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <p className="gdpr-ehead-title">You own your data.</p>
              <p className="gdpr-ehead-sub">
                Export everything you've created on tadaify in a machine-readable format
                (<code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>JSON</code> + <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>CSV</code>),
                packaged as a single ZIP. Includes a <strong>README</strong> explaining the file structure
                so you (or another platform) can read every record without docs.
              </p>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className="btn btn-primary btn-sm"
                  id="request-export-btn"
                  disabled={exportState === "pending"}
                  onClick={openExportModal}
                >
                  {exportState === "pending" ? (
                    <>
                      <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "gdpr-spin 0.8s linear infinite" }} />
                      Export in progress…
                    </>
                  ) : exportState === "ready" ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Request another export
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Request export
                    </>
                  )}
                </button>
                <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                  Limit: <strong>1 export per hour</strong> · Email arrives in ~2 min for a typical creator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===========================================================
             RECENT EXPORTS TABLE
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title gdpr-with-action">
            <span>Recent exports</span>
            <span className="chip">Last 90 days</span>
          </div>
          <table className="gdpr-data-table" aria-label="Recent data exports">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Requested</th>
                <th style={{ width: "18%" }}>Status</th>
                <th style={{ width: "14%" }}>Size</th>
                <th style={{ width: "23%" }}>Expires</th>
                <th className="gdpr-col-action" style={{ width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="gdpr-col-date">2026-04-26 · 09:14 UTC</td>
                <td><span className="gdpr-pill-status ready"><span className="dot" />Ready</span></td>
                <td className="gdpr-col-size">18.4 MB</td>
                <td className="gdpr-col-exp">in 6d 23h · 4/5 downloads left</td>
                <td className="gdpr-col-action">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      // TODO: wire to presigned S3 download URL
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.9 18.6A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 5 17.3" /></svg>
                    Download
                  </button>
                </td>
              </tr>
              <tr>
                <td className="gdpr-col-date">2026-04-12 · 14:02 UTC</td>
                <td><span className="gdpr-pill-status expired"><span className="dot" />Expired</span></td>
                <td className="gdpr-col-size">17.9 MB</td>
                <td className="gdpr-col-exp">expired 7d ago</td>
                <td className="gdpr-col-action">
                  <button className="btn btn-ghost btn-xs" disabled title="Link expired — request a new export">Unavailable</button>
                </td>
              </tr>
              <tr>
                <td className="gdpr-col-date">2026-03-18 · 10:47 UTC</td>
                <td><span className="gdpr-pill-status expired"><span className="dot" />Expired</span></td>
                <td className="gdpr-col-size">15.2 MB</td>
                <td className="gdpr-col-exp">expired 1mo ago</td>
                <td className="gdpr-col-action">
                  <button className="btn btn-ghost btn-xs" disabled>Unavailable</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="gdpr-table-footnote">
            <span className="gdpr-fn-key">Retention:</span> exports are kept for <strong>7 days</strong>, downloadable up to <strong>5 times</strong>.
            After that the file is deleted from S3 and the link returns 403.
            Need a permanent copy? Save the ZIP to your own storage.
          </p>
        </div>

        {/* ===========================================================
             SECTION 2 — COOKIES TADAIFY USES (read-only, essential only)
             Per feedback_tadaify_privacy_first_no_tracking_creators (2026-04-27):
             tadaify NEVER sets analytics or marketing cookies in the creator's
             browser. No toggles — nothing to opt out of.
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title">Cookies tadaify uses</div>
          <p className="gdpr-section-lead">
            We use only essential cookies — login session, security, CSRF protection.
            <strong> No analytics tracking. No marketing cookies. No third-party scripts.</strong>
            {" "}This isn't a setting because there's nothing to opt out of.
          </p>

          <div className="gdpr-cookie-row">
            <div className="gdpr-cookie-info">
              <div className="gdpr-cookie-name">
                Essential
                <span className="chip">Always on</span>
              </div>
              <div className="gdpr-cookie-desc">
                The only cookies we set on your dashboard session. Required to keep you logged in
                and prevent cross-site request forgery. Cannot be disabled — without these the
                dashboard cannot identify you.
              </div>
              <ul className="gdpr-cookie-meta-list">
                <li><code>tadaify_session</code> · session, HttpOnly · 30 days</li>
                <li><code>tadaify_csrf</code> · session · cleared on tab close</li>
              </ul>
            </div>
            <button
              className="toggle on disabled"
              aria-label="Essential cookies — always on"
              aria-checked="true"
              disabled
            />
          </div>

          <p className="gdpr-section-lead" style={{ marginTop: 18, fontSize: 13 }}>
            Want to verify? Open DevTools → Application → Cookies on any tadaify page.
            You'll see the two cookies above and nothing else from <code>tadaify.com</code>.
            {" "}<a href="/legal#cookie" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>View full Cookie Policy →</a>
          </p>
        </div>

        {/* ===========================================================
             SECTION 2b — VISITOR COOKIE BANNER
             Configures consent banner shown to VISITORS on the creator's
             published pages. tadaify-side analytics still off.
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title gdpr-with-action">
            <span>Visitor cookie banner</span>
            <a href="/legal#cookie" style={{ color: "var(--brand-primary)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              View Cookie Policy →
            </a>
          </div>
          <p className="gdpr-section-lead">
            Choose how the consent banner appears to <strong>visitors on your public page</strong>.
            Only essential cookies are set by default; first-party visitor analytics for your{" "}
            <a href="/app?tab=insights" style={{ color: "var(--brand-primary)" }}>Insights</a> dashboard
            (page views, click counts) are opt-in via the banner. We never load Meta Pixel,
            Google Ads, or any third-party tracker on your behalf.
          </p>

          {/* Banner preview */}
          <div className="gdpr-banner-preview-wrap">
            <div className="gdpr-banner-preview-label">Cookie banner preview · how it appears on your public page</div>

            <div className="gdpr-banner-preview-stage">
              <div className="gdpr-stage-fauxnav" aria-hidden="true">
                <span /><span /><span />
              </div>
              <div className="gdpr-stage-faux-label" aria-hidden="true">tadaify.com/alexandra</div>

              {/* Bottom bar preview */}
              {bannerStyle === "bar" && (
                <div className="gdpr-banner-bar">
                  <div className="gdpr-bb-text">
                    We use cookies for analytics and to make your visit better.
                    <small>You can change your preferences any time.</small>
                  </div>
                  <div className="gdpr-bb-actions">
                    <button className="btn btn-ghost">Reject all</button>
                    <button className="btn btn-ghost">Customize</button>
                    <button className="btn btn-primary">Accept all</button>
                  </div>
                </div>
              )}

              {/* Corner card preview */}
              {bannerStyle === "corner" && (
                <div className="gdpr-banner-corner">
                  <div className="gdpr-bc-title">Cookies?</div>
                  <div className="gdpr-bc-desc">We use cookies for analytics. You can change preferences any time.</div>
                  <div className="gdpr-bc-actions">
                    <button className="btn btn-ghost">Reject</button>
                    <button className="btn btn-primary">Accept</button>
                  </div>
                </div>
              )}

              {/* Modal preview */}
              {bannerStyle === "modal" && (
                <div className="gdpr-banner-modal-wrap">
                  <div className="gdpr-banner-modal">
                    <div className="gdpr-bm-title">Before you continue…</div>
                    <div className="gdpr-bm-desc">We use cookies for analytics and to make your visit better. Choose your preferences:</div>
                    <div className="gdpr-bm-actions">
                      <button className="btn btn-ghost">Reject all</button>
                      <button className="btn btn-ghost">Customize</button>
                      <button className="btn btn-primary">Accept all</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="gdpr-banner-style-picker" role="tablist" aria-label="Cookie banner style">
              <button
                className={`gdpr-bsp-btn${bannerStyle === "bar" ? " active" : ""}`}
                data-style="bar"
                onClick={() => selectBannerStyle("bar")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="17" width="18" height="4" rx="1" /></svg>
                Bottom bar
              </button>
              <button
                className={`gdpr-bsp-btn${bannerStyle === "corner" ? " active" : ""}`}
                data-style="corner"
                onClick={() => selectBannerStyle("corner")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="13" y="14" width="8" height="7" rx="1" /></svg>
                Corner card
              </button>
              <button
                className={`gdpr-bsp-btn${bannerStyle === "modal" ? " active" : ""}`}
                data-style="modal"
                onClick={() => selectBannerStyle("modal")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="6" y="8" width="12" height="9" rx="1" /></svg>
                Centered modal
                <span className="gdpr-bsp-pro-tag">Pro</span>
              </button>
            </div>
          </div>

          <p className="gdpr-section-lead" style={{ marginTop: 14, fontSize: "12.5px" }}>
            Banner style is the only setting here — visitor consent itself is handled by the
            banner above. Changes save automatically when you switch styles.
          </p>
        </div>

        {/* ===========================================================
             SECTION 3 — PERSONAL DATA ON TADAIFY
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title">Personal data on tadaify</div>
          <p className="gdpr-section-lead">
            What we currently store on your account. This is the same dataset you'll receive
            when you request an export above.
          </p>

          <div className="gdpr-data-summary">
            <div className="gdpr-data-stat">
              <div className="gdpr-ds-num">8</div>
              <div className="gdpr-ds-label">Pages</div>
            </div>
            <div className="gdpr-data-stat">
              <div className="gdpr-ds-num">142</div>
              <div className="gdpr-ds-label">Blocks across all pages</div>
            </div>
            <div className="gdpr-data-stat">
              <div className="gdpr-ds-num">1,847</div>
              <div className="gdpr-ds-label">Newsletter subscribers</div>
            </div>
            <div className="gdpr-data-stat">
              <div className="gdpr-ds-num">63</div>
              <div className="gdpr-ds-label">Bookings (Schedule)</div>
            </div>
            <div className="gdpr-data-stat">
              <div className="gdpr-ds-num">42.7 MB</div>
              <div className="gdpr-ds-label">Uploaded files</div>
            </div>
          </div>

          <button
            className={`gdpr-breakdown-toggle${breakdownOpen ? " open" : ""}`}
            id="breakdown-toggle"
            onClick={toggleBreakdown}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {breakdownOpen ? "Hide detailed breakdown" : "View detailed breakdown"}
          </button>

          {breakdownOpen && (
            <div className="gdpr-breakdown-panel" id="breakdown-panel">
              <table className="gdpr-breakdown-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Count / Size</th>
                    <th>Stored in</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Profile (name, bio, avatar URL, email)</td>           <td className="num">1 record</td><td>users</td></tr>
                  <tr><td>Pages (Home, About, Blog, Schedule, …)</td>           <td className="num">8</td>       <td>pages</td></tr>
                  <tr><td>Blocks (links, posts, FAQ items, etc.)</td>           <td className="num">142</td>     <td>blocks</td></tr>
                  <tr><td>Newsletter subscribers + double opt-in audit</td>     <td className="num">1,847</td>   <td>subscribers, doi_log</td></tr>
                  <tr><td>Newsletter sends &amp; open/click events</td>         <td className="num">12,304</td>  <td>email_events</td></tr>
                  <tr><td>Schedule bookings (incl. notes + answers)</td>        <td className="num">63</td>      <td>bookings</td></tr>
                  <tr><td>Page-view events (last 12 months)</td>                <td className="num">38,902</td>  <td>pageviews</td></tr>
                  <tr><td>Click events on blocks (last 12 months)</td>          <td className="num">9,418</td>   <td>click_events</td></tr>
                  <tr><td>Uploaded files (avatar, page covers, post images)</td><td className="num">217 files · 42.7 MB</td><td>S3 (storage.tadaify.com)</td></tr>
                  <tr><td>Billing history (invoices, charges)</td>              <td className="num">14 invoices</td><td>Stripe (mirror in invoices)</td></tr>
                  <tr><td>Login &amp; settings audit log</td>                   <td className="num">412 events</td><td>audit_log</td></tr>
                  <tr><td>Cookie consent decisions you made</td>                <td className="num">9 changes</td><td>user_consent</td></tr>
                </tbody>
              </table>
              <p className="gdpr-table-footnote">
                <span className="gdpr-fn-key">Storage costs</span> are included in your plan. We never sell, rent, or share this data with third parties.
                See the <a href="/legal#privacy" style={{ color: "var(--brand-primary)" }}>Privacy Policy</a> for the full list of subprocessors.
              </p>
            </div>
          )}
        </div>

        {/* ===========================================================
             SECTION 4 — PRIVACY POLICIES YOU'VE ACCEPTED
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title gdpr-with-action">
            <span>Policies you've accepted</span>
            <a href="/legal" style={{ color: "var(--brand-primary)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Open Legal page →</a>
          </div>
          <p className="gdpr-section-lead">
            Every version of every policy you accepted, with the exact text you saw at the time.
            On <strong>material</strong> changes you'll be re-prompted on next login (per consent version policy).
          </p>

          <table className="gdpr-data-table" aria-label="Accepted policies">
            <thead>
              <tr>
                <th style={{ width: "35%" }}>Policy</th>
                <th style={{ width: "15%" }}>Version</th>
                <th style={{ width: "23%" }}>Accepted on</th>
                <th className="gdpr-col-action" style={{ width: "27%" }}>View</th>
              </tr>
            </thead>
            <tbody>
              <tr className="gdpr-policy-row">
                <td>Terms of Service</td>
                <td><span className="gdpr-ver-tag">v3</span></td>
                <td className="gdpr-col-date">2026-03-04 · 18:22 UTC</td>
                <td className="gdpr-col-action">
                  <a href="/legal#tos">View v3</a>
                  <a
                    className="gdpr-changed-link"
                    href="#"
                    onClick={(e) => { e.preventDefault(); /* TODO: open diff modal for v3 vs v4 */ }}
                  >
                    View what changed →
                  </a>
                </td>
              </tr>
              <tr className="gdpr-policy-row">
                <td>Privacy Policy</td>
                <td><span className="gdpr-ver-tag">v2</span></td>
                <td className="gdpr-col-date">2026-02-12 · 09:01 UTC</td>
                <td className="gdpr-col-action">
                  <a href="/legal#privacy">View v2</a>
                </td>
              </tr>
              <tr className="gdpr-policy-row">
                <td>Cookie Policy</td>
                <td><span className="gdpr-ver-tag">v2</span></td>
                <td className="gdpr-col-date">2026-02-12 · 09:01 UTC</td>
                <td className="gdpr-col-action">
                  <a href="/legal#cookie">View v2</a>
                </td>
              </tr>
              <tr className="gdpr-policy-row">
                <td>Subprocessor list</td>
                <td><span className="gdpr-ver-tag new">v4 available</span></td>
                <td className="gdpr-col-date">2026-01-30 · 14:55 UTC</td>
                <td className="gdpr-col-action">
                  <a href="/legal#subprocessors">View v3 (your accepted)</a>
                  <a
                    className="gdpr-changed-link"
                    href="#"
                    onClick={(e) => { e.preventDefault(); /* TODO: open diff modal for subprocessor list v3 vs v4 */ }}
                  >
                    View what changed →
                  </a>
                </td>
              </tr>
              <tr className="gdpr-policy-row">
                <td>Acceptable Use Policy</td>
                <td><span className="gdpr-ver-tag">v1</span></td>
                <td className="gdpr-col-date">2025-11-08 · 11:30 UTC</td>
                <td className="gdpr-col-action">
                  <a href="/legal#aup">View v1</a>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="gdpr-table-footnote">
            We never silently update policies. Material changes (new subprocessor, broader data use, scope expansion)
            require explicit re-acceptance on your next login. Cosmetic changes (typos, layout) do not.
          </p>
        </div>

        {/* ===========================================================
             SECTION 5 — DPA / GDPR CONTROLLER-PROCESSOR (Pro+)
             Feature stays VISIBLE per feedback_no_blur_premium_features:
             tier banner appears only when tier < pro. Gate fires at click.
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title gdpr-with-action">
            <span>Data processing agreement (DPA) &amp; subprocessors</span>
            <span className="chip pro">Pro+</span>
          </div>

          {/* Tier banner — shown only when tier < pro */}
          {TIER_RANK[tier] < TIER_RANK.pro && (
            <div className="tier-banner" id="dpa-tier-banner" role="note">
              <span className="tb-ico" aria-hidden="true">📜</span>
              <div className="tb-text">
                <div className="tb-title">DPA + subprocessor notifications unlock on Pro</div>
                <div className="tb-sub">Browse the section below — when you click <strong>Download DPA</strong> or enable a notification we'll prompt to upgrade.</div>
              </div>
              <a href="/pricing?upgrade=pro" className="btn btn-primary btn-sm">Upgrade to Pro →</a>
            </div>
          )}

          <p className="gdpr-section-lead">
            <strong>You are the controller</strong> for your visitor data (newsletter signups, booking submissions, page-view logs).
            <strong> tadaify is the processor</strong> — we store and serve that data on your behalf, and only on your instructions.
            The DPA below is the legal agreement between us.
          </p>

          <div className="gdpr-dpa-row">
            <div className="gdpr-dpa-info">
              <div className="gdpr-dpa-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fg-muted)" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Data Processing Agreement (DPA) — v3 · 12 pages
              </div>
              <div className="gdpr-dpa-desc">
                Standard Contractual Clauses (SCCs) module 3, GDPR Art. 28-compliant.
                Pre-signed by tadaify; counter-signature optional.
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (TIER_RANK[tier] < TIER_RANK.pro) {
                  // TODO: wire to TierGate.checkAndProceed with upgrade redirect
                  return;
                }
                // TODO: wire to GET /api/gdpr/dpa.pdf — download DPA-v3.pdf (172 KB)
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <polyline points="8 17 12 21 16 17" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.9 18.6A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 5 17.3" />
              </svg>
              Download DPA
            </button>
          </div>

          <div className="gdpr-dpa-row">
            <div className="gdpr-dpa-info">
              <div className="gdpr-dpa-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fg-muted)" }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Subprocessor change notifications
              </div>
              <div className="gdpr-dpa-desc">
                Email us when tadaify adds, removes, or changes a subprocessor (Stripe, Cloudflare, Resend, AWS, …).
                30 days advance notice on new subprocessors per the DPA.
              </div>
            </div>
            <button
              className={`toggle${subprocNotify ? " on" : ""}`}
              id="toggle-subproc-notify"
              aria-label="Subprocessor change notifications"
              aria-checked={String(subprocNotify) as "true" | "false"}
              onClick={toggleSubprocNotify}
            />
          </div>

          <div className="gdpr-dpa-row">
            <div className="gdpr-dpa-info">
              <div className="gdpr-dpa-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--fg-muted)" }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Current subprocessors (4 active)
              </div>
              <div className="gdpr-dpa-desc">
                <code>Stripe</code> · payments &amp; billing{" "}·{" "}
                <code>Resend</code> · transactional + marketing email{" "}·{" "}
                <code>Cloudflare</code> · CDN + DDoS{" "}·{" "}
                <code>AWS</code> · storage + compute (eu-west-1)
              </div>
            </div>
            <a href="/legal#subprocessors" className="btn btn-ghost btn-sm">View list →</a>
          </div>
        </div>

        {/* ===========================================================
             SECTION 6 — ERASURE CROSS-LINK (GDPR Art. 17)
             Deletion lives in Danger zone tab — this tab only cross-links.
             =========================================================== */}
        <div className="settings-section">
          <div className="settings-section-title">Right to be forgotten · GDPR Art. 17</div>

          <div className="gdpr-erasure-card">
            <div className="gdpr-ec-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div className="gdpr-ec-body">
              <div className="gdpr-ec-title">Delete your account &amp; erase all your data</div>
              <div className="gdpr-ec-desc">
                To exercise your right to erasure, head to the <strong>Danger zone</strong> tab.
                That flow cancels any active subscription, releases custom domains, removes all your pages and blocks,
                and deletes every record listed in the <em>Personal data</em> section above. Action cannot be undone.
              </div>
              <a href="/app?tab=settings&subtab=danger" className="gdpr-ec-link">
                Go to Danger zone tab
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>{/* /.settings-content */}


      {/* ============================================================
           EXPORT REQUEST MODAL (centered — NEVER a drawer)
           ============================================================ */}
      {exportModalOpen && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="export-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeExportModal(); }}
        >
          <div className="modal modal-wide">
            <button className="modal-close-x" onClick={closeExportModal} aria-label="Close">×</button>
            <h3 id="export-modal-title">Request data export</h3>
            <p className="modal-sub">
              Choose what to include. We'll assemble the ZIP, email you the download link, and keep it
              available for 7 days. Limit: 1 export per hour.
            </p>

            <div className="gdpr-export-include-list" role="group" aria-label="Data categories to include">
              {([
                { key: "profile",     name: "Profile & identity",  meta: "Name, bio, avatar, email, pronouns" },
                { key: "pages",       name: "Pages & blocks",       meta: "All 8 pages, 142 blocks, theme + style" },
                { key: "subscribers", name: "Subscribers",          meta: "Newsletter signups, contact form submissions, double opt-in audit" },
                { key: "bookings",    name: "Bookings",             meta: "Schedule page bookings, attendee answers, status" },
                { key: "analytics",   name: "Analytics",            meta: "Page views + click counts · last 12 months · aggregated daily" },
                { key: "billing",     name: "Billing history",      meta: "14 invoices, past charges, refunds (mirrored from Stripe)" },
                { key: "audit",       name: "Audit log",            meta: "Login history, settings changes, consent decisions" },
                { key: "files",       name: "Uploaded files",       meta: "217 files · 42.7 MB · avatar, covers, post images" },
              ] as const).map(({ key, name, meta }) => (
                <label
                  key={key}
                  className={`gdpr-export-include-row${exportIncludes[key] ? " checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={exportIncludes[key]}
                    onChange={() => toggleInclude(key)}
                  />
                  <div>
                    <div className="gdpr-ei-name">{name}</div>
                    <div className="gdpr-ei-meta">{meta}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="gdpr-export-format-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>
              Format: <code>ZIP</code> containing one <code>.json</code> + one <code>.csv</code> per category, plus <code>README.md</code>
            </div>

            {exportInProgress && (
              <div className="gdpr-export-progress" role="status">
                <div className="gdpr-ep-row">
                  <span className="gdpr-spinner" aria-hidden="true" />
                  <span>Preparing your data… (~2 min for a typical creator)</span>
                </div>
                <div className="gdpr-ep-bar"><div /></div>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "10px 0 0" }}>
                  You can close this dialog — we'll email you when it's ready.
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={closeExportModal}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                id="generate-export-btn"
                disabled={exportInProgress}
                onClick={startExport}
              >
                {exportInProgress ? (
                  "Export queued…"
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <polyline points="8 17 12 21 16 17" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.9 18.6A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 5 17.3" />
                    </svg>
                    Generate export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
