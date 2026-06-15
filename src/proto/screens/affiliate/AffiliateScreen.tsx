/**
 * Affiliate program — the creator-side dashboard view a creator opens from the
 * sidebar Affiliate entry. Faithful port of mockups/tadaify-mvp/app-affiliate.html.
 *
 * Surfaces a 30%-recurring tagline, an auto-generated referral link (copy →
 * "Copied ✓"), an earnings dashboard (lifetime / month / pending), a share kit
 * (pre-written X + Instagram copy with copy-to-clipboard, plus downloadable
 * graphic tiles), a recent-referrals table, a Stripe Connect payout notice, and
 * an affiliate-terms opt-in line. Renders inside the shared dashboard chrome
 * (appbar + sidebar) with the Affiliate nav entry marked current. Presentational,
 * local-state only; data comes from the typed affiliateFixture.
 *
 * @implements fr-affiliate
 * @implements fr-globalui-view-layout
 */
import { useState } from "react";
import "./affiliate-proto.css";
import { DashboardChrome } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { affiliateFixture } from "./affiliateFixture";

export function AffiliateScreen() {
  const profile = dashboardProfileFixture();
  const fx = affiliateFixture(profile.handle);

  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedCopy, setCopiedCopy] = useState<string | null>(null);

  const flash = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 1600);
  };

  const copy = (text: string, onDone: () => void) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onDone, () => alert(`Mockup — copy this:\n${text}`));
    } else {
      onDone();
    }
  };

  const copyCopyBlock = (id: string, text: string) => {
    copy(text, () => {
      setCopiedCopy(id);
      setTimeout(() => setCopiedCopy((c) => (c === id ? null : c)), 1500);
    });
  };

  return (
    <DashboardChrome profile={profile} activeNav="affiliate">
      <div className="proto-affiliate">
        {/* ── Page head ── */}
        <div className="aff-head">
          <span className="aff-badge">{fx.badge}</span>
          <h1>Affiliate program</h1>
          <p className="sub">
            Earn <b>30% of every monthly subscription</b> from creators you refer to tadaify — for as
            long as they stay paid. No cap, no expiry. Payouts via Stripe Connect.
          </p>
        </div>

        {/* ── Hero: referral link ── */}
        <section className="aff-ref-card" aria-label="Your referral link">
          <h2 className="ttl">Your referral link</h2>
          <p className="lead">
            Auto-generated from your handle. Anyone who signs up via this link is locked to you for life.
          </p>
          <div className="ref-link-row">
            <code className="ref-link">{fx.refUrl}</code>
            <button
              type="button"
              className={`copy-btn${linkCopied ? " is-copied" : ""}`}
              onClick={() => copy(fx.refUrl, () => flash(setLinkCopied))}
            >
              {linkCopied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="aff-stats" aria-label="Earnings dashboard">
          {fx.stats.map((s) => (
            <div className="stat-card" key={s.id}>
              <div className="lbl">{s.label}</div>
              <div className="val">
                <span className="currency">$</span>
                {s.whole}
                <span className="currency cents">{s.cents}</span>
              </div>
              <div className={`delta${s.deltaMuted ? " is-muted" : ""}`}>{s.delta}</div>
            </div>
          ))}
        </section>

        {/* ── Share kit ── */}
        <section className="aff-section" aria-label="Share kit">
          <h2>Share kit</h2>
          <p className="section-sub">Pre-written copy + downloadable graphics. Tap any text to copy.</p>

          <div className="share-grid">
            {fx.shareCopies.map((c) => (
              <div className="share-card" key={c.id}>
                <div className="sc-head">
                  <span className="ic" aria-hidden>{c.icon}</span>
                  <span className="ttl">{c.title}</span>
                </div>
                <pre>{c.body}</pre>
                <div className="sc-actions">
                  <button type="button" className="btn-sm" onClick={() => copyCopyBlock(c.id, c.body)}>
                    {copiedCopy === c.id ? "Copied ✓" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className={`btn-sm${c.isTwitter ? " is-primary" : ""}`}
                    onClick={() => alert(c.secondaryAlert)}
                  >
                    {c.secondaryLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="gfx-label">Downloadable graphics</h3>
          <div className="graphics-grid">
            {fx.graphics.map((g) => (
              <button type="button" className={`gfx is-${g.variant}`} key={g.id} onClick={() => alert(g.alert)}>
                <span className="gfx-lines">
                  {g.lines.map((line, i) => (
                    <span className="gfx-line" key={i}>{line}</span>
                  ))}
                </span>
                <span className="dl-ic" aria-hidden>↓</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Referrals table ── */}
        <section className="aff-section" aria-label="Recent referrals">
          <h2>Recent referrals</h2>
          <p className="section-sub">
            Last 8 sign-ups via your link. Anonymized email shown until they opt-in to share.
          </p>

          <div className="ref-table-wrap">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Referred</th>
                  <th>Tier</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="num">Your share</th>
                </tr>
              </thead>
              <tbody>
                {fx.referrals.map((r) => (
                  <tr key={r.id}>
                    <td>{r.email}</td>
                    <td><span className={`pill tier-${r.tier}`}>{r.tierLabel}</span></td>
                    <td>{r.joined}</td>
                    <td><span className={`pill status-${r.status}`}>{r.statusLabel}</span></td>
                    <td className="num">{r.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Payout notice ── */}
        <div className="payout-notice">
          <div className="ic" aria-hidden>💸</div>
          <div className="body">
            <b>Payouts via Stripe Connect</b>
            <div className="muted">
              Connect your bank in 2 minutes. Payouts run on the 1st of each month for the previous
              month's earnings (USD, EUR, GBP supported).
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn-sm is-primary"
              onClick={() => alert("Mockup — would open Stripe Connect onboarding")}
            >
              Connect Stripe →
            </button>
          </div>
        </div>

        <p className="tos-row">
          By participating you agree to the{" "}
          <a href="/__proto/settings">Affiliate Terms of Service</a> — fair-use, no spam, 90-day
          attribution window.
        </p>
      </div>
    </DashboardChrome>
  );
}
