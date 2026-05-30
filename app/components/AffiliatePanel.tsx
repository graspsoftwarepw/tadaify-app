/**
 * AffiliatePanel — main content area for /app?tab=affiliate.
 *
 * Visual contract: mockups/tadaify-mvp/app-affiliate.html (433 LOC, full).
 * Every section, class name, ARIA label, text node, and stub value is mirrored
 * verbatim from the mockup. Styling lives in `app/styles/app-dashboard.css`
 * under `.app-dashboard-root .main-affiliate` (appended block headed
 * "AFFILIATE PANEL"). Mount must occur inside an ancestor carrying
 * `.app-dashboard-root` — the route component wraps `<main>` accordingly.
 *
 * Out of scope this pass (matches the mockup's stub behaviour):
 *   - Real referral count / earnings / payouts — rendered as the mockup's
 *     fixture values with a TODO comment for the future affiliate API.
 *   - Real Stripe Connect onboarding deep-link — the mockup `alert()`s a stub
 *     message; we keep the same stub via window.alert.
 *   - Downloadable graphics — the mockup `alert()`s; same stub here.
 *   - IG-story deep link — same stub.
 *
 * Story: app-affiliate mockup-fidelity pass (#234)
 * Covers: 1:1 match with `mockups/tadaify-mvp/app-affiliate.html`.
 */

import { useCallback, useMemo, useState } from "react";

interface AffiliatePanelProps {
  /** Creator's tadaify handle — used to seed the referral URL + share copy. */
  handle: string;
}

// ─── Stub referral fixtures (mockup-only) ─────────────────────────────────
// TODO: wire to affiliate API. The mockup ships these exact values, so we
// match them 1:1 so the rendered output diffs cleanly against the mockup.
const STUB_REFERRALS: ReadonlyArray<{
  email: string;
  tier: "creator" | "pro" | "business";
  tierLabel: string;
  joined: string;
  status: "active" | "pending" | "churned";
  statusLabel: string;
  share: string;
}> = [
  { email: "m••••@gmail.com",       tier: "pro",      tierLabel: "Pro",      joined: "Apr 22, 2026", status: "active",  statusLabel: "Active",    share: "$4.50/mo" },
  { email: "k••••@protonmail.com",  tier: "creator",  tierLabel: "Creator",  joined: "Apr 20, 2026", status: "active",  statusLabel: "Active",    share: "$1.50/mo" },
  { email: "j••••@hey.com",         tier: "business", tierLabel: "Business", joined: "Apr 14, 2026", status: "active",  statusLabel: "Active",    share: "$14.70/mo" },
  { email: "n••••@outlook.com",     tier: "creator",  tierLabel: "Creator",  joined: "Apr 10, 2026", status: "active",  statusLabel: "Active",    share: "$1.50/mo" },
  { email: "p••••@gmail.com",       tier: "pro",      tierLabel: "Pro",      joined: "Apr 02, 2026", status: "pending", statusLabel: "Trial",     share: "—" },
  { email: "v••••@icloud.com",      tier: "creator",  tierLabel: "Creator",  joined: "Mar 28, 2026", status: "active",  statusLabel: "Active",    share: "$1.50/mo" },
  { email: "z••••@gmail.com",       tier: "pro",      tierLabel: "Pro",      joined: "Mar 12, 2026", status: "active",  statusLabel: "Active",    share: "$4.50/mo" },
  { email: "l••••@gmail.com",       tier: "creator",  tierLabel: "Creator",  joined: "Feb 24, 2026", status: "churned", statusLabel: "Cancelled", share: "—" },
];

export function AffiliatePanel({ handle }: AffiliatePanelProps) {
  // The mockup's <script> derives refUrl from `?handle=` and falls back to
  // 'alexandra'. In the app, the loader already provides the signed-in
  // creator's handle, so we use that directly.
  const refUrl = useMemo(() => `https://tadaify.com/?ref=${handle}`, [handle]);

  // Pre-written tweet — verbatim from the mockup, with the {handle}
  // substitution applied at the same position the mockup's <script> does
  // (the mockup ships "alexandra" baked into the <pre>; updating refUrl in
  // place is the same effect).
  const tweetText = useMemo(
    () =>
      `Just moved my links to @tadaify and the analytics are next-level. Got a referral link if you want a fair shake on signup → https://tadaify.com/?ref=${handle}`,
    [handle],
  );
  const igText = useMemo(
    () =>
      `my link-in-bio is now on tadaify ✨ better analytics, better payouts, free forever for the basics → tadaify.com/?ref=${handle}`,
    [handle],
  );

  // "Copied ✓" feedback state for the hero copy button.
  const [refCopied, setRefCopied] = useState(false);
  // Per-snippet "Copied ✓" feedback for the Copy buttons inside share cards.
  const [snippetCopiedId, setSnippetCopiedId] = useState<string | null>(null);

  const copyRef = useCallback(() => {
    const writeFallback = () => {
      // Mockup parity: when clipboard API is unavailable, the mockup shows
      // a window.alert with the link. Keep the same behaviour.
      if (typeof window !== "undefined") {
        window.alert(`Your link: ${refUrl}`);
      }
    };
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refUrl).then(
        () => {
          setRefCopied(true);
          window.setTimeout(() => setRefCopied(false), 1800);
        },
        () => writeFallback(),
      );
    } else {
      writeFallback();
    }
  }, [refUrl]);

  const copySnippet = useCallback((id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setSnippetCopiedId(id);
        window.setTimeout(
          () => setSnippetCopiedId((current) => (current === id ? null : current)),
          1500,
        );
      });
    }
  }, []);

  const shareTwitter = useCallback(() => {
    if (typeof window !== "undefined") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
        "_blank",
      );
    }
  }, [tweetText]);

  // The mockup uses bare window.alert() for the IG-story deep link, the
  // three graphics download buttons, and the Stripe Connect CTA. Keep the
  // exact alert strings so the UX matches.
  const stubAlert = useCallback((message: string) => {
    if (typeof window !== "undefined") {
      window.alert(message);
    }
  }, []);

  return (
    <section
      className="main-affiliate"
      data-testid="affiliate-panel"
      aria-labelledby="affiliate-title"
    >
      {/* ── 1. Page head ─────────────────────────────────────────────── */}
      <div className="page-head">
        <span className="badge">⚡ 30% recurring</span>
        <h1 id="affiliate-title">Affiliate program</h1>
        <p className="sub">
          Earn <b>30% of every monthly subscription</b> from creators you refer
          to tadaify — for as long as they stay paid. No cap, no expiry. Payouts
          via Stripe Connect.
        </p>
      </div>

      {/* ── 2. Hero: referral link ───────────────────────────────────── */}
      <section className="ref-card" aria-label="Your referral link">
        <h3 className="ttl">Your referral link</h3>
        <p className="lead">
          Auto-generated from your handle. Anyone who signs up via this link is
          locked to you for life.
        </p>
        <div className="ref-link-row">
          <code className="ref-link" id="ref-link" data-testid="affiliate-ref-link">
            {refUrl}
          </code>
          <button
            type="button"
            className={`copy-btn${refCopied ? " copied" : ""}`}
            id="copy-btn"
            data-testid="affiliate-copy-btn"
            onClick={copyRef}
          >
            {refCopied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </section>

      {/* ── 3. Stats grid ────────────────────────────────────────────── */}
      <section className="stats-grid" aria-label="Earnings dashboard">
        {/* TODO: wire to affiliate API — values mirror the mockup fixtures. */}
        <div className="stat-card">
          <div className="lbl">Lifetime earnings</div>
          <div className="val">
            <span className="currency">$</span>1,284
            <span className="currency" style={{ fontSize: 14 }}>.50</span>
          </div>
          <div className="delta">+ $128 last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="lbl">This month</div>
          <div className="val">
            <span className="currency">$</span>128
            <span className="currency" style={{ fontSize: 14 }}>.00</span>
          </div>
          <div className="delta">8 active subscribers</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Pending payout</div>
          <div className="val">
            <span className="currency">$</span>92
            <span className="currency" style={{ fontSize: 14 }}>.00</span>
          </div>
          <div className="delta muted">Released on the 1st</div>
        </div>
      </section>

      {/* ── 4. Share kit ─────────────────────────────────────────────── */}
      <section className="section" aria-label="Share kit">
        <h2>Share kit</h2>
        <p className="section-sub">
          Pre-written copy + downloadable graphics. Tap any text to copy.
        </p>

        <div className="share-grid">
          <div className="share-card">
            <div className="head">
              <span className="ic">𝕏</span>
              <span className="ttl">Tweet / X post</span>
            </div>
            <pre id="copy-tweet">{tweetText}</pre>
            <div className="actions">
              <button
                type="button"
                className="btn-sm"
                data-testid="affiliate-copy-tweet"
                onClick={() => copySnippet("tweet", tweetText)}
              >
                {snippetCopiedId === "tweet" ? "Copied ✓" : "Copy"}
              </button>
              <button
                type="button"
                className="btn-sm primary"
                data-testid="affiliate-post-x"
                onClick={shareTwitter}
              >
                Post to X →
              </button>
            </div>
          </div>

          <div className="share-card">
            <div className="head">
              <span className="ic">📸</span>
              <span className="ttl">Instagram bio / story</span>
            </div>
            <pre id="copy-ig">{igText}</pre>
            <div className="actions">
              <button
                type="button"
                className="btn-sm"
                data-testid="affiliate-copy-ig"
                onClick={() => copySnippet("ig", igText)}
              >
                {snippetCopiedId === "ig" ? "Copied ✓" : "Copy"}
              </button>
              <button
                type="button"
                className="btn-sm"
                data-testid="affiliate-open-ig"
                onClick={() => stubAlert("Mockup — would open IG-story deep link")}
              >
                Open in IG →
              </button>
            </div>
          </div>
        </div>

        <h3
          style={{
            marginTop: 22,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Downloadable graphics
        </h3>
        <div className="graphics-grid">
          <div
            className="gfx"
            data-testid="affiliate-gfx-1"
            onClick={() => stubAlert("Mockup — would download 1080×1080 PNG")}
          >
            Refer creators<br />Earn 30% recurring
            <span className="dl-ic" aria-hidden="true">↓</span>
          </div>
          <div
            className="gfx warm"
            data-testid="affiliate-gfx-2"
            onClick={() => stubAlert("Mockup — would download 1080×1920 IG story PNG")}
          >
            tadaify.com/?ref={handle}
            <span className="dl-ic" aria-hidden="true">↓</span>
          </div>
          <div
            className="gfx green"
            data-testid="affiliate-gfx-3"
            onClick={() => stubAlert("Mockup — would download 1200×630 OG card")}
          >
            Switch to tadaify<br />+ get 30% off forever
            <span className="dl-ic" aria-hidden="true">↓</span>
          </div>
        </div>
      </section>

      {/* ── 5. Referrals table ───────────────────────────────────────── */}
      <section className="section" aria-label="Recent referrals">
        <h2>Recent referrals</h2>
        <p className="section-sub">
          Last 8 sign-ups via your link. Anonymized email shown until they opt-in
          to share.
        </p>

        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Referred</th>
                <th>Tier</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Your share</th>
              </tr>
            </thead>
            <tbody>
              {STUB_REFERRALS.map((r, idx) => (
                <tr key={`${r.email}-${idx}`}>
                  <td>{r.email}</td>
                  <td>
                    <span className={`pill tier-${r.tier}`}>{r.tierLabel}</span>
                  </td>
                  <td>{r.joined}</td>
                  <td>
                    <span className={`pill status-${r.status}`}>{r.statusLabel}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>{r.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6. Payout notice ─────────────────────────────────────────── */}
      <div className="payout-notice">
        <div className="ic">💸</div>
        <div className="body">
          <b>Payouts via Stripe Connect</b>
          <div className="muted">
            Connect your bank in 2 minutes. Payouts run on the 1st of each month
            for the previous month's earnings (USD, EUR, GBP supported).
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn-sm primary"
            data-testid="affiliate-connect-stripe"
            onClick={() => stubAlert("Mockup — would open Stripe Connect onboarding")}
          >
            Connect Stripe →
          </button>
        </div>
      </div>

      {/* ── 7. TOS row ───────────────────────────────────────────────── */}
      <p className="tos-row">
        By participating you agree to the{" "}
        <a href="/app?tab=settings#affiliate-terms">Affiliate Terms of Service</a>
        {" "}— fair-use, no spam, 90-day attribution window.
      </p>
    </section>
  );
}
