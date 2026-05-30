/**
 * /pricing — Pricing landing page
 *
 * Story: F-PRICING-LANDING-001 v2 Phase A (mockups/tadaify-mvp/pricing.html, 896 LOC).
 * Framework: React Router 7 SSR on Cloudflare Workers.
 *
 * Prices (DEC-009 / DEC-047 / DEC-279):
 *   Creator $7.99/mo · Pro $19.99/mo · Business $49.99/mo · Domain add-on $1.99/mo
 * Locked DECs reflected: DEC-PRICELOCK-01/02, DEC-MULTIPAGE-01, DEC-CREATOR-API-01,
 *   DEC-AI-QUOTA-LADDER-01, DEC-AI-FEATURES-ROADMAP-01, DEC-TRIAL-01, AP-001,
 *   DEC-076 Option 9, DEC-078, DEC-080, DEC-082, DEC-083/287.
 */

import { useState, useEffect } from "react";
import type { Route } from "./+types/pricing";

// ─── Meta ─────────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [
    { title: "tadaify — Pricing · Pick your tier, switch anytime" },
    {
      name: "description",
      content:
        "Free forever, or upgrade to Creator ($7.99/mo), Pro ($19.99/mo), or Business ($49.99/mo). Price locked for life — we never raise your price. 0% platform fees on every tier.",
    },
    { property: "og:title", content: "tadaify Pricing" },
    {
      property: "og:description",
      content:
        "One page free forever. Creator $7.99 · Pro $19.99 · Business $49.99 — price locked for life.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://tadaify.com/pricing" },
    { name: "robots", content: "index, follow" },
    { rel: "canonical", href: "https://tadaify.com/pricing" },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");

  const cadence = (base: string) =>
    base === "forever"
      ? "/mo · forever"
      : billing === "annual"
        ? "/mo · billed annually"
        : "/mo · billed monthly";

  return (
    <>
      {/* ═══════════════════════ NAV ═══════════════════════ */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <a href="/" className="landing-nav-brand">
            <svg className="landing-logo-small" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="tada!ify logo">
              <rect width="44" height="44" rx="12" fill="#6366F1"/>
              <text x="22" y="30" textAnchor="middle" fontSize="22" fontWeight="700" fill="white" fontFamily="serif">t!</text>
            </svg>
            <span style={{fontFamily:"var(--font-display)",fontWeight:600,fontSize:20,letterSpacing:"-0.02em"}}>
              <span style={{color:"var(--wm-ta)"}}>tada</span><span style={{color:"var(--wm-da)"}}>!</span><span style={{color:"var(--wm-ify)"}}>ify</span>
            </span>
          </a>
          <div className="landing-nav-links">
            <a href="/">Home</a>
            <a href="/pricing" aria-current="page">Pricing</a>
          </div>
          <div className="landing-nav-cta">
            <a href="/login" className="landing-btn landing-btn-ghost" style={{fontSize:14}}>Log in</a>
            <a href="/register" className="landing-btn landing-btn-primary" style={{fontSize:14}}>Get started</a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="container" style={{padding:"64px 24px 32px",textAlign:"center"}}>
        <span className="pill pill-warm">💸 No trials · 30-day money-back on any paid tier</span>
        <h1 style={{marginTop:20,fontSize:"clamp(40px, 5vw, 60px)"}}>Pick your tier. Switch anytime.</h1>
        <p className="text-muted" style={{marginTop:16,fontSize:18,maxWidth:580,marginLeft:"auto",marginRight:"auto"}}>
          One page is forever free. Upgrade only when you want — every paid feature is previewable on Free with a 🔒 pill, no surprise paywalls mid-edit.
        </p>

        {/* Price-lock-for-life banner */}
        <div className="pricing-pricelock-banner" style={{marginTop:32}}>
          <div className="pricing-pricelock-icon" aria-hidden="true">🔒</div>
          <div className="pricing-pricelock-body">
            <p className="pricing-pricelock-title">Your price is locked for life.</p>
            <p className="pricing-pricelock-text">
              Subscribe today at Creator ($7.99), Pro ($19.99), or Business ($49.99) — pay the same price in year 3, year 5, year 10, as long as your subscription stays active. We <strong>never</strong> raise your price.
              Only if you cancel and re-subscribe later do you pay the then-current price.
            </p>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="pricing-billing-toggle">
          <button
            className={billing === "annual" ? "active" : ""}
            onClick={() => setBilling("annual")}
            type="button"
          >
            Annual <span className="pricing-save-badge">Save 2 months</span>
          </button>
          <button
            className={billing === "monthly" ? "active" : ""}
            onClick={() => setBilling("monthly")}
            type="button"
          >
            Monthly
          </button>
        </div>
      </section>

      {/* ═══════════════════════ TIER GRID ═══════════════════════ */}
      <section className="container" style={{paddingBottom:0}}>
        <div className="pricing-tier-grid">

          {/* FREE — DEC-076 Option 9: full analytics dataset ungated */}
          <div className="pricing-tier">
            <h3>Free</h3>
            <div className="pricing-price">
              <span className="pricing-price-currency">$</span>
              <span className="pricing-price-amount">0</span>
              <span className="pricing-price-cadence">/mo · forever</span>
            </div>
            <p className="pricing-tagline">Everything an indie creator needs — including the full analytics dataset. No data hidden.</p>
            <ul>
              <li>1 handle (tadaify.com/you)</li>
              <li>Unlimited blocks + links</li>
              <li>Full analytics dataset: cross-tab, geo+city, devices, referrers</li>
              <li>Hourly analytics refresh · 7-day history window</li>
              <li>5 AI credits/mo (theme matcher / bio rewrite / copy suggest)</li>
              <li>Inline Stripe checkout</li>
              <li>No "Powered by" footer — ever</li>
            </ul>
            <div className="pricing-domain-addon-hint">
              <strong style={{color:"#92400E"}}>Optional:</strong> Add your own domain for <strong>+$1.99/mo</strong> — no upgrade needed.
            </div>
            <a href="/register" className="btn btn-secondary" style={{marginTop:18,minHeight:44}}>Start free →</a>
          </div>

          {/* CREATOR — $7.99/mo locked for life */}
          <div className="pricing-tier pricing-tier-popular">
            <span className="pricing-tier-badge pill pill-pro">⭐ Most popular</span>
            <h3>Creator</h3>
            <div className="pricing-price">
              <span className="pricing-price-currency">$</span>
              <span className="pricing-price-amount">7.99</span>
              <span className="pricing-price-cadence">{cadence("paid")}</span>
            </div>
            <span className="pricing-lock-badge">🔒 Locked for life</span>
            <p className="pricing-tagline" style={{marginTop:10}}>Faster analytics, longer history, your own domain. The "I'm serious about this" tier.</p>
            <ul>
              <li>Everything in Free, plus:</li>
              <li>1 handle</li>
              <li>Full analytics dataset (same as Free)</li>
              <li>5-min analytics refresh · 90-day window</li>
              <li>Monthly CSV export</li>
              <li>1 custom domain included ($1.99/mo add-on for extras)</li>
              <li>20 AI credits/mo</li>
              <li>Sell products + communities</li>
              <li>Priority email support 24h</li>
              <li>Verified ✓ creator badge</li>
            </ul>
            <a href="/register?plan=creator" className="btn btn-primary">Go Creator →</a>
          </div>

          {/* PRO — $19.99/mo, DEC-083 → DEC-279, DEC-080 API access */}
          <div className="pricing-tier">
            <h3>Pro</h3>
            <div className="pricing-price">
              <span className="pricing-price-currency">$</span>
              <span className="pricing-price-amount">19.99</span>
              <span className="pricing-price-cadence">{cadence("paid")}</span>
            </div>
            <span className="pricing-lock-badge">🔒 Locked for life</span>
            <p className="pricing-tagline" style={{marginTop:10}}>Real-time analytics, 1-year history, and the <strong>first Creator API in link-in-bio</strong>.</p>
            <ul>
              <li>Everything in Creator, plus:</li>
              <li>1 handle</li>
              <li>Real-time live view (60s refresh polling)</li>
              <li>1-year analytics history window</li>
              <li>Daily CSV export</li>
              <li>Saved views (bookmark cross-tab combinations)</li>
              <li><strong>API access (100 req/h)</strong> — build dashboards, Slack bots, iOS widgets</li>
              <li>100 AI credits/mo</li>
              <li>A/B testing</li>
              <li>$1.99/mo per custom domain (add-on)</li>
            </ul>
            <a href="/register?plan=pro" className="btn btn-secondary">Go Pro →</a>
          </div>

          {/* BUSINESS — $49.99/mo, DEC-083 → DEC-287: 5 handles + 10 team members */}
          <div className="pricing-tier" id="business">
            <h3>Business</h3>
            <div className="pricing-price">
              <span className="pricing-price-currency">$</span>
              <span className="pricing-price-amount">49.99</span>
              <span className="pricing-price-cadence">{cadence("paid")}</span>
            </div>
            <span className="pricing-lock-badge">🔒 Locked for life</span>
            <p className="pricing-tagline" style={{marginTop:10}}>5 handles + 10 team members. Replay. API at scale. For music labels, talent agencies, content studios.</p>
            <ul>
              <li>Everything in Pro, plus:</li>
              <li><strong>5 handles included</strong> (add more for $9.99/mo each)</li>
              <li><strong>10 team members included</strong> (roles: Admin / Editor / Viewer)</li>
              <li>All-time analytics history</li>
              <li>Replay (scrub past traffic sessions)</li>
              <li>API access (1,000 req/h)</li>
              <li>Scheduled email digests</li>
              <li>Parquet R2 monthly archive</li>
              <li>Identity stitching</li>
              <li>Daily CSV + Parquet R2 export</li>
              <li>$1.99/mo per custom domain (add-on)</li>
            </ul>
            <div className="pricing-business-note">
              Need more than 30 handles or 10 team members? <a href="mailto:support@tadaify.com">Contact support</a>
            </div>
            <a href="/register?plan=business" className="btn btn-secondary" style={{marginTop:12}}>Start Business →</a>
          </div>

        </div>{/* .pricing-tier-grid */}

        {/* Universal $2 add-on banner */}
        <div className="pricing-addon-universal">
          <span className="pricing-addon-plus">+</span>
          <p>
            Need extra domains? Add <strong>$1.99/mo per custom domain</strong> to any plan — Free included. No upgrade needed.
          </p>
        </div>

        {/* AI credits explainer */}
        <div className="pricing-ai-explainer">
          <strong>What counts as an AI credit?</strong> Theme matcher, bio rewrite, block copy suggest — text-only AI features (DEC-AI-FEATURES-ROADMAP-01).
          Image generation never consumes your AI credits. Free: 5/mo · Creator: 20/mo · Pro: 100/mo · Business: unlimited.
        </div>
      </section>

      {/* ═══════════════════════ COMPARE MATRIX ═══════════════════════ */}
      <section className="section container" style={{maxWidth:960}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <span className="pill pill-warm" style={{marginBottom:14,display:"inline-flex"}}>📊 Compare all tiers</span>
          <h2>Everything, side by side</h2>
          <p className="text-muted" style={{marginTop:10}}>Quick-scan matrix. Expandable categories below for full detail.</p>
        </div>

        <div className="pricing-compare-matrix-wrap">
          <table className="pricing-compare-matrix">
            <thead>
              <tr>
                <th style={{width:"36%"}}>Feature</th>
                <th>Free</th>
                <th>Creator<br/><span style={{fontWeight:400,fontSize:12,color:"var(--fg-muted)"}}>$7.99/mo</span></th>
                <th>Pro<br/><span style={{fontWeight:400,fontSize:12,color:"var(--fg-muted)"}}>$19.99/mo</span></th>
                <th>Business<br/><span style={{fontWeight:400,fontSize:12,color:"var(--fg-muted)"}}>$49.99/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {/* Pages & Domains */}
              <tr className="pricing-category-row"><td colSpan={5}>Pages &amp; Domains</td></tr>
              <tr><td>Pages</td><td>1</td><td>5</td><td>20</td><td>Unlimited</td></tr>
              <tr><td>Custom domain</td><td>+$1.99/mo add-on</td><td>1 included</td><td>1 incl. (extra +$1.99/mo)</td><td>10 included</td></tr>
              <tr><td>tadaify.com subdomain</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Scheduled publishing</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Pre-launch waitlist pages</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>

              {/* Analytics — DEC-076 Option 9: full dataset ungated, tier = cadence + window */}
              <tr className="pricing-category-row"><td colSpan={5}>Analytics (DEC-076 Option 9 — no fake margin)</td></tr>
              <tr><td>Full dataset (cross-tab, geo+city, devices, referrers)</td><td className="pricing-check">✓ ALL</td><td className="pricing-check">✓ ALL</td><td className="pricing-check">✓ ALL</td><td className="pricing-check">✓ ALL</td></tr>
              <tr><td>Analytics refresh cadence</td><td>Hourly</td><td>5-min stale</td><td>Real-time (60s)</td><td>Real-time (60s)</td></tr>
              <tr><td>Analytics history window</td><td>7 days</td><td>90 days</td><td>1 year</td><td>All-time</td></tr>
              <tr><td>CSV export</td><td className="pricing-cross">✗</td><td>Monthly</td><td>Daily</td><td>Daily + Parquet R2</td></tr>
              <tr><td>Saved views</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Scheduled email digests</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>Replay (scrub traffic sessions)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>API access (DEC-080)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td>100 req/h</td><td>1,000 req/h</td></tr>
              <tr><td>Parquet R2 monthly archive (DEC-078)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>

              {/* AI */}
              <tr className="pricing-category-row"><td colSpan={5}>AI (text-only)</td></tr>
              <tr><td>AI credits / month</td><td>5</td><td>20</td><td>100</td><td>Unlimited</td></tr>
              <tr><td>Theme matcher</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Bio rewrite</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Block copy suggest</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Creator API + MCP server</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>

              {/* Editor & Branding */}
              <tr className="pricing-category-row"><td colSpan={5}>Editor &amp; Branding</td></tr>
              <tr><td>Unlimited blocks</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Theme customization</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Custom favicon</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Verified ✓ creator badge</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>A/B block testing</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Removable email branding</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>White-label exports</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>

              {/* Commerce */}
              <tr className="pricing-category-row"><td colSpan={5}>Commerce</td></tr>
              <tr><td>Inline Stripe checkout</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Platform fee on sales</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td></tr>
              <tr><td>Sell products + communities</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Abandoned-cart recovery</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Advanced SEO tools</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>

              {/* Email & Integrations */}
              <tr className="pricing-category-row"><td colSpan={5}>Email &amp; Integrations</td></tr>
              <tr><td>Email capture blocks</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Mailchimp / ConvertKit / Resend</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Zapier / Make webhooks</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Custom webhook on sale</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Directory listing (opt-in)</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>

              {/* Support & Team — DEC-083 */}
              <tr className="pricing-category-row"><td colSpan={5}>Support &amp; Team (DEC-083)</td></tr>
              <tr><td>Handles</td><td>1</td><td>1</td><td>1</td><td>5 included (+$9.99/mo each extra)</td></tr>
              <tr><td>Team members</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td>10 included</td></tr>
              <tr><td>Roles + audit log (Admin/Editor/Viewer)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>Support channel</td><td>Community</td><td>Email 24h</td><td>Email + chat 12h</td><td>Phone 2h</td></tr>
              <tr><td>SSO (Google Workspace / Okta)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>Onboarding + migration help</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>Dedicated account manager</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>99.95% uptime SLA</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>

              {/* Price guarantee */}
              <tr className="pricing-category-row" id="guarantee"><td colSpan={5}>Guarantee</td></tr>
              <tr><td>Price locked for life</td><td>—</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>30-day money-back</td><td>—</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════ CREATOR API SPOTLIGHT ═══════════════════════ */}
      <section className="section">
        <div className="pricing-creator-api-section">
          <span className="pill pill-pro" style={{marginBottom:14,display:"inline-flex"}}>⚡ Pro tier exclusive</span>
          <h2>Hire ChatGPT (or Claude) to manage your tada!ify</h2>
          <p className="text-muted" style={{marginTop:8,fontSize:15}}>
            Pro tier ships with our <strong>Creator API</strong> — so your AI assistant can run your page while you focus on creating.
          </p>
          <ul>
            <li>REST API + OpenAPI 3.0 schema published at <code>tadaify.com/api/openapi.json</code></li>
            <li>MCP server (<code>@tadaify/mcp</code> npm) — 1-line Claude Desktop config</li>
            <li>Custom GPT instructions template — copy-paste, add your API key, done</li>
            <li>Agent-recipe gallery: "daily refresh latest YouTube video" · "pinned message from Notion DB" · "reorder by analytics"</li>
          </ul>
          <div style={{marginTop:24,display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href="/register?plan=pro" className="btn btn-primary" style={{minHeight:44}}>Get Creator API with Pro →</a>
            <a href="#" className="btn btn-secondary" style={{minHeight:44}}>View API docs</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EXPANDABLE FULL COMPARISON ═══════════════════════ */}
      <section className="section container" style={{maxWidth:880}}>
        <h2 style={{textAlign:"center"}}>Full feature comparison</h2>
        <p className="text-muted text-center" style={{marginTop:10,marginBottom:28}}>
          By category — expand to see exactly what each tier includes.
        </p>

        <details className="pricing-compare-tab" open>
          <summary>Editor</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>Unlimited blocks</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Theme customization</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Custom favicon</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Scheduled publishing</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>A/B block testing</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </details>

        <details className="pricing-compare-tab">
          <summary>Commerce</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>Inline Stripe checkout</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Platform fee on sales</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td><td className="pricing-check">0%</td></tr>
              <tr><td>Sell products + communities</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Abandoned-cart recovery</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </details>

        <details className="pricing-compare-tab">
          <summary>Analytics</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>History window</td><td>30 days</td><td>180 days</td><td>Unlimited</td><td>Unlimited</td></tr>
              <tr><td>Per-block clicks</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Geography + UTM</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Conversion funnel</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </details>

        <details className="pricing-compare-tab">
          <summary>Email + Integrations</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>Email capture blocks</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Mailchimp / ConvertKit / Resend</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Zapier / Make webhooks</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Custom webhook on sale</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </details>

        <details className="pricing-compare-tab">
          <summary>AI (text-only — DEC-AI-FEATURES-ROADMAP-01)</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>AI credits / month</td><td>5</td><td>20</td><td>100</td><td>Unlimited</td></tr>
              <tr><td>Theme matcher</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Bio rewrite</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Block copy suggest</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>Creator API + MCP server</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
            </tbody>
          </table>
        </details>

        <details className="pricing-compare-tab">
          <summary>Team + Admin</summary>
          <table>
            <thead><tr><th>Feature</th><th>Free</th><th>Creator</th><th>Pro</th><th>Business</th></tr></thead>
            <tbody>
              <tr><td>Seats</td><td>1</td><td>1</td><td>2</td><td>5 (add $8/seat)</td></tr>
              <tr><td>Roles + audit log</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td><td className="pricing-check">✓</td></tr>
              <tr><td>SSO (Google Workspace / Okta)</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-cross">✗</td><td className="pricing-check">✓</td></tr>
              <tr><td>SLA</td><td>—</td><td>—</td><td>—</td><td>99.95%</td></tr>
            </tbody>
          </table>
        </details>
      </section>

      {/* ═══════════════════════ OPTIONAL SUPPORT BADGE ═══════════════════════ */}
      <section className="section">
        <div className="pricing-opt-badge-section">
          <span style={{fontSize:28}}>💚</span>
          <h3 style={{marginTop:10}}>Help us grow (optional)</h3>
          <p>
            tada!ify never forces our brand on your page. But if you want to support an indie team growing
            something they care about, you can opt-in to a small <strong>"made with tada!ify"</strong> footer badge.
            Default <strong>OFF</strong> on every tier, always free, never tracked. Turn it on in Settings → Branding.
          </p>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section className="section container" style={{maxWidth:760,background:"var(--bg-muted)",borderRadius:28,padding:"48px 40px",marginBottom:80}}>
        <h2 style={{textAlign:"center"}}>Pricing FAQ</h2>
        <div style={{marginTop:28}}>

          <details className="pricing-faq-item" open>
            <summary>Will my price ever go up?</summary>
            <p>No. Your price is locked for life as long as your subscription stays active (DEC-PRICELOCK-01). If you cancel and re-subscribe later, you pay the then-current price. We update prices for new signups only.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Are there free trials?</summary>
            <p>No trials (DEC-TRIAL-01) — they create dark-pattern pressure. Instead: every paid feature is <em>previewable</em> on Free with a 🔒 pill so you can see it before paying. And if you upgrade and change your mind, email us within 30 days for a full refund. No questions asked.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Can I have multiple pages?</summary>
            <p>Free starts with 1 page (homepage). Multi-page is coming post-MVP: Creator gets 5, Pro gets 20, Business gets unlimited. All current plans lock in at the multi-page tier when the feature ships — no price bump (DEC-MULTIPAGE-01).</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Do you take a cut on my products?</summary>
            <p>0% platform fee on every tier. We make money from subscriptions, not commissions. Stripe processor fees (~2.9% + $0.30/tx) are Stripe's — not ours.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Can ChatGPT manage my page for me?</summary>
            <p>Yes — Pro tier ships with our Creator API + MCP server + a copy-paste Custom GPT instructions template (DEC-CREATOR-API-01). Your AI assistant gets read/write access to your tada!ify page. Manage blocks, update content, reorder by analytics — all from a chat prompt.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Why 0% fees on paid tiers?</summary>
            <p>Because we already charge you a subscription. Charging again on each sale is a double-dip we opt out of. Stripe's processing fee still applies (~2.9% + 30¢) — that's Stripe's, not ours.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>How does the money-back guarantee work?</summary>
            <p>Email us within 30 days of your first charge on any paid tier. No questions, no "reason required". Full refund, no partial prorations.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Custom domain — cross-tier math?</summary>
            <p>Free + $1.99/mo domain add-on = $23.88/yr. Creator tier (no add-on needed) = $95.88/yr and includes 1 domain. If you only want a domain, stay Free + add the domain. If you want support + analytics + AI, Creator is $6/mo more net (DEC-PRICELOCK-02/DEC-279).</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Annual vs monthly — is it worth it?</summary>
            <p>Annual gives you 2 months free. If you're not sure, start monthly and switch anytime — no penalty, your locked price stays the same.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>Enterprise / over 5 seats?</summary>
            <p>Business tier scales per seat ($8/seat beyond 5). For agencies managing 10+ client brands, reach out — we offer a flat custom SOW with shared billing.</p>
          </details>

          <details className="pricing-faq-item">
            <summary>EU VAT / sales tax?</summary>
            <p>Yes, we collect EU VAT automatically for Member State buyers via Stripe Tax. Price shown excludes VAT; invoice includes both rows.</p>
          </details>

        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="cta-band">
        <div className="container">
          <h2>Start free. Upgrade anytime.</h2>
          <p style={{marginTop:12,fontSize:17}}>
            Every paid feature is previewable on Free. Never pay for a button you haven't clicked yet.
          </p>
          <p style={{marginTop:10,fontSize:15,opacity:0.85}}>
            🔒 Price locked for life — we never raise the price on active subscribers.
          </p>
          <div className="flex" style={{justifyContent:"center",gap:12,marginTop:28,flexWrap:"wrap"}}>
            <a href="/register" className="btn btn-warm btn-lg" style={{minHeight:44}}>Claim your handle →</a>
            <a href="/login" className="btn btn-ghost btn-lg" style={{color:"#FFF",border:"1px solid rgba(255,255,255,0.4)",minHeight:44}}>Already a creator? Log in</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STICKY CTA ═══════════════════════ */}
      <PricingStickyCta />

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-foot-grid">
            <div className="landing-foot-col">
              <h4>Product</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="landing-foot-col">
              <h4>Company</h4>
              <ul>
                <li><a href="mailto:support@tadaify.com">Support</a></li>
              </ul>
            </div>
            <div className="landing-foot-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
            <div className="landing-foot-col">
              <h4>Get started</h4>
              <ul>
                <li><a href="/register">Create account</a></li>
                <li><a href="/login">Log in</a></li>
              </ul>
            </div>
          </div>
          <div className="landing-foot-bottom">
            <span>© 2026 tada!ify. All rights reserved.</span>
            <span>No "Powered by" — ever. AP-001.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── Sticky CTA ───────────────────────────────────────────────────────────────

function PricingStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={`pricing-sticky-cta${visible ? " visible" : ""}`} id="pricing-sticky-cta">
      <p>Ready to unlock your full creator toolkit?</p>
      <a href="/register" className="btn btn-primary btn-sm" style={{minHeight:44,minWidth:140,whiteSpace:"nowrap"}}>Start free →</a>
      <a href="/register?plan=creator" className="btn btn-secondary btn-sm" style={{minHeight:44,minWidth:140,whiteSpace:"nowrap"}}>Go Creator $7.99/mo</a>
    </div>
  );
}
