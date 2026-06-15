/**
 * Settings · GDPR & data tab — the GDPR data rights that stay available even
 * though tadaify is cookieless: a ready-export banner, the data-export request
 * action (Art. 20) with a recent-exports table, the essential-cookies notice, a
 * "cookieless — no consent banner" explainer (NOT a cookie-consent config —
 * tadaify counts views without cookies/consent, so there is nothing to configure),
 * a personal-data summary with a detailed breakdown expander, the accepted-policies
 * table, the DPA & subprocessors block (Art. 28), and the right-to-be-forgotten
 * (Art. 17) cross-link. Ported from mockups/tadaify-mvp/app-settings-gdpr.html
 * minus the visitor cookie-consent-banner surface, which contradicts the
 * cookieless positioning (docs/domain/tadaify.md). Composed on the shared
 * SettingsShell primitives.
 *
 * This tab is mostly actions and exports — it never raises the shell save-bar.
 * Local state only: the request-export action opens a centred modal (category
 * checklist + Generate) that closes on Escape / backdrop / Cancel; the breakdown
 * expander toggles in place. Every outbound action (download export, view policy,
 * download DPA, erasure cross-link) is mocked with an alert — no dead links. Data
 * comes from the typed gdprFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, SettingsModal } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { gdprFixture } from "./gdprFixture";

const mock = (msg: string) => () => alert(msg);

export function GdprTab() {
  const fx = gdprFixture();
  const [exportOpen, setExportOpen] = useState(false);
  const [breakdown, setBreakdown] = useState(false);

  return (
    <>
      {/* Export ready banner */}
      <div className="export-ready-bar" role="status">
        <div className="erb-ico" aria-hidden>
          <S w={18}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </S>
        </div>
        <div className="erb-text">
          <div className="erb-title">Your data export is ready</div>
          <div className="erb-sub">
            Generated {fx.exportReadyAge} · {fx.exportReadySize} ZIP · Expires in {fx.exportReadyExpires}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" type="button" onClick={mock("Mockup — would download the presigned export URL")}>
          Download ZIP
        </button>
      </div>

      {/* Data export */}
      <SettingsSection title="Export your data · GDPR Art. 20" action={<span className="chip success">All tiers</span>}>
        <div className="export-hero">
          <div className="icon-bubble" aria-hidden>
            <S w={22}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </S>
          </div>
          <div>
            <p className="ehead-title">You own your data.</p>
            <p className="ehead-sub">
              Export everything you've created on tadaify in a machine-readable format (<code>JSON</code> + <code>CSV</code>), packaged
              as a single ZIP with a <strong>README</strong> explaining the file structure.
            </p>
            <div className="export-cta-row">
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setExportOpen(true)}>
                Request export
              </button>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Limit: 1 export per hour · email arrives in ~2 min</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Recent exports */}
      <SettingsSection title="Recent exports" action={<span className="chip">Last 90 days</span>}>
        <div className="table-scroll">
          <table className="data-table" aria-label="Recent data exports">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Status</th>
                <th>Size</th>
                <th>Expires</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {fx.exports.map((e) => (
                <tr key={e.id}>
                  <td className="mono">{e.requested}</td>
                  <td>
                    <span className={`chip ${e.status === "ready" ? "success" : "inv-void"}`}>
                      {e.status === "ready" ? "Ready" : "Expired"}
                    </span>
                  </td>
                  <td className="mono">{e.size}</td>
                  <td>{e.expires}</td>
                  <td className="col-action">
                    {e.status === "ready" ? (
                      <button className="btn btn-ghost btn-xs" type="button" onClick={mock("Mockup — would download the presigned export URL")}>
                        Download
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-xs" type="button" disabled title="Link expired — request a new export">
                        Unavailable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-footnote">
          Exports are kept for <strong>7 days</strong>, downloadable up to <strong>5 times</strong>. After that the file is deleted and
          the link returns 403.
        </p>
      </SettingsSection>

      {/* Essential cookies */}
      <SettingsSection title="Cookies tadaify uses">
        <p className="section-lead">
          We use only essential cookies — login session, security, CSRF protection. <strong>No analytics tracking. No marketing cookies.
          No third-party scripts.</strong> This isn't a setting because there's nothing to opt out of.
        </p>
        <div className="cookie-row">
          <div className="cookie-info">
            <div className="cookie-name">
              Essential <span className="chip">Always on</span>
            </div>
            <div className="cookie-desc">
              The only cookies we set on your dashboard session. Required to keep you logged in and prevent CSRF. Cannot be disabled.
            </div>
            <ul className="cookie-meta-list">
              <li>
                <code>tadaify_session</code> · session, HttpOnly · 30 days
              </li>
              <li>
                <code>tadaify_csrf</code> · session · cleared on tab close
              </li>
            </ul>
          </div>
          <span className="toggle on is-locked" role="img" aria-label="Essential cookies — always on" />
        </div>
      </SettingsSection>

      {/* No visitor cookie banner: tadaify is cookieless by design (no consent
          nag). Visitor analytics use privacy-preserving daily-salt hashing, so
          there is nothing for a visitor to consent to and no banner to configure. */}
      <SettingsSection title="Visitor analytics — cookieless, no consent banner">
        <p className="section-lead">
          tadaify counts your visits <strong>without cookies and without a consent banner</strong> — visitor analytics use
          privacy-preserving daily-salt hashing, never per-visitor tracking. There is no Meta Pixel, Google Ads, or third-party
          tracker, and nothing for your visitors to accept or reject. You still get your numbers in Insights.
        </p>
      </SettingsSection>

      {/* Personal data */}
      <SettingsSection title="Personal data on tadaify">
        <p className="section-lead">What we currently store on your account. This is the same dataset you'll receive when you request an export.</p>
        <div className="data-summary">
          {fx.stats.map((s) => (
            <div key={s.label} className="data-stat">
              <div className="ds-num">{s.num}</div>
              <div className="ds-label">{s.label}</div>
            </div>
          ))}
        </div>
        <button className="breakdown-toggle" type="button" aria-expanded={breakdown} onClick={() => setBreakdown((v) => !v)}>
          <span className={`bt-caret${breakdown ? " is-open" : ""}`}>›</span> View detailed breakdown
        </button>
        {breakdown && (
          <div className="table-scroll">
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Count / Size</th>
                  <th>Stored in</th>
                </tr>
              </thead>
              <tbody>
                {fx.breakdown.map((b) => (
                  <tr key={b.category}>
                    <td>{b.category}</td>
                    <td className="num mono">{b.count}</td>
                    <td className="mono">{b.storedIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>

      {/* Accepted policies */}
      <SettingsSection
        title="Policies you've accepted"
        action={
          <button className="field-link" type="button" onClick={mock("Mockup — would open the Legal page")}>
            Open Legal page →
          </button>
        }
      >
        <p className="section-lead">
          Every version of every policy you accepted, with the exact text you saw at the time. On <strong>material</strong> changes
          you'll be re-prompted on next login.
        </p>
        <div className="table-scroll">
          <table className="data-table" aria-label="Accepted policies">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Version</th>
                <th>Accepted on</th>
                <th className="col-action">View</th>
              </tr>
            </thead>
            <tbody>
              {fx.policies.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <span className={`ver-tag${p.newVersion ? " new" : ""}`}>{p.newVersion ? `${p.version} · new available` : p.version}</span>
                  </td>
                  <td className="mono">{p.acceptedOn}</td>
                  <td className="col-action">
                    <button className="field-link" type="button" onClick={mock(`Mockup — would open ${p.name} ${p.version}`)}>
                      View {p.version}
                    </button>
                    {p.changed && (
                      <button className="field-link changed-link" type="button" onClick={mock(`Mockup — would diff ${p.name} versions`)}>
                        View what changed →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-footnote">
          We never silently update policies. Material changes require explicit re-acceptance on your next login; cosmetic changes do not.
        </p>
      </SettingsSection>

      {/* DPA & subprocessors */}
      <SettingsSection title="Data processing agreement (DPA) & subprocessors" action={<span className="chip pro">Pro+</span>}>
        <p className="section-lead">
          <strong>You are the controller</strong> for your visitor data (newsletter signups, bookings, page-view logs).{" "}
          <strong>tadaify is the processor</strong> — we store and serve that data on your behalf, and only on your instructions.
        </p>
        <div className="dpa-row">
          <div className="dpa-info">
            <div className="dpa-title">
              <S w={16}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </S>
              Data Processing Agreement (DPA) — {fx.dpaVersion}
            </div>
            <div className="dpa-desc">Standard Contractual Clauses module 3, GDPR Art. 28-compliant. Pre-signed by tadaify; counter-signature optional.</div>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would download the DPA PDF (Pro feature, gated at click)")}>
            Download DPA
          </button>
        </div>
        <div className="dpa-row">
          <div className="dpa-info">
            <div className="dpa-title">
              <S w={16}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </S>
              Current subprocessors (4 active)
            </div>
            <div className="dpa-desc">
              {fx.subprocessors.map((sp) => (
                <span key={sp} className="subproc-pill">
                  {sp}
                </span>
              ))}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the subprocessor list")}>
            View list →
          </button>
        </div>
      </SettingsSection>

      {/* Right to be forgotten (cross-link) */}
      <SettingsSection title="Right to be forgotten · GDPR Art. 17">
        <div className="erasure-card">
          <div className="ec-ico" aria-hidden>
            <S w={20}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </S>
          </div>
          <div className="ec-body">
            <div className="ec-title">Delete your account & erase all your data</div>
            <div className="ec-desc">
              To exercise your right to erasure, head to the <strong>Danger zone</strong> tab. That flow cancels any active subscription,
              releases custom domains, removes all your pages and blocks, and deletes every record listed above. Cannot be undone.
            </div>
            <button className="field-link" type="button" onClick={mock("Mockup — would open the Danger zone tab")}>
              Go to Danger zone tab →
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Request export modal */}
      {exportOpen && (
        <SettingsModal
          title="Request data export"
          sub="Choose what to include. We'll assemble the ZIP, email you the download link, and keep it available for 7 days. Limit: 1 export per hour."
          onClose={() => setExportOpen(false)}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would queue the export and email the download link when ready");
                setExportOpen(false);
              }}
            >
              Generate export
            </button>
          }
        >
          <div className="export-include-list" role="group" aria-label="Data categories to include">
            {fx.exportCategories.map((c) => (
              <label key={c.name} className="export-include-row">
                <input type="checkbox" defaultChecked />
                <span>
                  <span className="ei-name">{c.name}</span>
                  <span className="ei-meta">{c.meta}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="export-format-pill">
            <S w={13}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </S>
            Format: <code>ZIP</code> with one <code>.json</code> + one <code>.csv</code> per category, plus <code>README.md</code>
          </div>
        </SettingsModal>
      )}
    </>
  );
}
