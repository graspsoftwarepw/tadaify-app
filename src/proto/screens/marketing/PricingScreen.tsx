/**
 * PricingScreen — tadaify's marketing pricing page, faithfully ported from
 * mockups/tadaify-mvp/pricing.html (v2 Phase A). Rendered inside the shared
 * <MarketingChrome>. All copy lives in pricingFixture.ts.
 *
 * Interactive bits reproduced from the mockup JS: the annual/monthly billing
 * toggle (flips each tier's cadence label) and the scroll-triggered sticky CTA
 * bar. Tier/compare CTAs route to the real /__proto/register and /__proto/login
 * flows; "View API docs" is a mock window.alert. No dead placeholder links.
 *
 * @implements fr-pricing
 */
import { Fragment, useEffect, useState } from "react";
import { MarketingChrome } from "./MarketingChrome";
import {
  addonUniversal,
  aiExplainer,
  compareTabs,
  compareTabsHead,
  creatorApi,
  faqHead,
  faqs,
  finalCta,
  hero,
  matrix,
  matrixHead,
  optBadge,
  stickyCta,
  tiers,
} from "./pricingFixture";
import "./pricing-proto.css";

function cell(v: string) {
  if (v === "✓") return <span className="check">✓</span>;
  if (v === "✗") return <span className="cross">✗</span>;
  return v;
}

export function PricingScreen() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cadenceFor = (t: (typeof tiers)[number]) => {
    if (t.cadenceForever) return t.cadence;
    return billing === "annual" ? "/mo · billed annually" : "/mo · billed monthly";
  };

  const onMock = (label: string) => () => window.alert(`${label} (prototype)`);

  return (
    <MarketingChrome>
      {/* ── HERO ── */}
      <section className="mk-container pr-hero">
        <span className="pill pill-warm">{hero.pill}</span>
        <h1>{hero.h1}</h1>
        <p className="pr-hero-sub">{hero.sub}</p>

        <div className="pricelock-banner">
          <div className="pricelock-icon" aria-hidden="true">
            🔒
          </div>
          <div className="pricelock-body">
            <p className="pricelock-title">{hero.lockTitle}</p>
            <p className="pricelock-text">
              {hero.lockText1}
              <strong>{hero.lockTextStrong}</strong>
              {hero.lockText2}
            </p>
          </div>
        </div>

        <div className="billing-toggle" role="group" aria-label="Billing period">
          <button
            type="button"
            className={billing === "annual" ? "active" : ""}
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
          >
            {hero.billAnnual} <span className="save-badge">{hero.billAnnualBadge}</span>
          </button>
          <button
            type="button"
            className={billing === "monthly" ? "active" : ""}
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
          >
            {hero.billMonthly}
          </button>
        </div>
      </section>

      {/* ── TIER GRID ── */}
      <section className="mk-container pr-tiers-section">
        <div className="tier-grid">
          {tiers.map((t) => (
            <div className={`tier ${t.popular ? "tier-popular" : ""}`} key={t.name}>
              {t.popular ? <span className="tier-badge pill pill-pro">⭐ Most popular</span> : null}
              <h3>{t.name}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{t.amount}</span>
                <span className="cadence">{t.cadenceForever ? t.cadence : cadenceFor(t)}</span>
              </div>
              {t.locked ? <span className="lock-badge">🔒 Locked for life</span> : null}
              <p className="tagline">
                {t.tagline}
                {t.taglineStrong ? <strong>{t.taglineStrong}</strong> : null}
                {t.taglineTail}
              </p>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {t.note ? (
                <div className={`tier-note ${t.note.tone}`}>
                  <strong className="note-lead">{t.note.lead}</strong>
                  {t.note.tone === "indigo" && t.note.strong ? (
                    <>
                      {" "}
                      <button type="button" className="note-link" onClick={onMock("Contact support")}>
                        {t.note.strong.trim()}
                      </button>
                    </>
                  ) : (
                    <strong>{t.note.strong}</strong>
                  )}
                  {t.note.tail}
                </div>
              ) : null}
              <a href={t.ctaHref} className={`btn btn-${t.ctaVariant} tier-cta`}>
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="addon-universal">
          <span className="addon-plus">+</span>
          <p>{addonUniversal}</p>
        </div>

        <div className="ai-explainer">
          <strong>{aiExplainer.strong}</strong>
          {aiExplainer.body}
        </div>
      </section>

      {/* ── COMPARE MATRIX ── */}
      <section className="section mk-container pr-matrix-section">
        <div className="pr-center-head">
          <span className="pill pill-warm">{matrixHead.pill}</span>
          <h2>{matrixHead.h2}</h2>
          <p className="text-muted">{matrixHead.sub}</p>
        </div>

        <div className="compare-matrix-wrap">
          <table className="compare-matrix">
            <thead>
              <tr>
                <th style={{ width: "36%" }}>Feature</th>
                {matrixHead.cols.map((c) => {
                  const [name, price] = c.split(" $");
                  return (
                    <th key={c}>
                      {name}
                      {price ? (
                        <>
                          <br />
                          <span className="col-price">${price}</span>
                        </>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrix.map((group) => (
                <Fragment key={group.category}>
                  <tr className="category-row">
                    <td colSpan={5}>{group.category}</td>
                  </tr>
                  {group.rows.map((r) => (
                    <tr key={r.feature}>
                      <td>{r.feature}</td>
                      {r.values.map((v, i) => (
                        <td key={i} className={v === "✓" ? "check" : v === "✗" ? "cross" : undefined}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CREATOR API SPOTLIGHT ── */}
      <section className="section pr-api-wrap">
        <div className="creator-api-section">
          <span className="pill pill-pro">{creatorApi.pill}</span>
          <h2>{creatorApi.h2}</h2>
          <p className="text-muted api-sub">
            {creatorApi.sub}
            <strong>{creatorApi.subStrong}</strong>
            {creatorApi.subTail}
          </p>
          <ul>
            {creatorApi.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="api-cta-row">
            <a href="/__proto/register?plan=pro" className="btn btn-primary">
              {creatorApi.ctaPrimary}
            </a>
            <button type="button" className="btn btn-secondary" onClick={onMock("View API docs")}>
              {creatorApi.ctaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* ── EXPANDABLE FULL COMPARISON ── */}
      <section className="section mk-container pr-tabs-section">
        <h2 className="pr-center-title">{compareTabsHead.h2}</h2>
        <p className="text-muted text-center pr-tabs-sub">{compareTabsHead.sub}</p>

        {compareTabs.map((tab) => (
          <details className="compare-tab" key={tab.title} open={tab.open}>
            <summary>{tab.title}</summary>
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  {compareTabsHead.cols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tab.rows.map((r) => (
                  <tr key={r.feature}>
                    <td>{r.feature}</td>
                    {r.values.map((v, i) => (
                      <td key={i}>{cell(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </section>

      {/* ── OPTIONAL SUPPORT BADGE ── */}
      <section className="section pr-optbadge-wrap">
        <div className="opt-badge-section">
          <span className="opt-emoji">{optBadge.emoji}</span>
          <h3>{optBadge.h3}</h3>
          <p>
            {optBadge.body1}
            <strong>{optBadge.bodyStrong1}</strong>
            {optBadge.body2}
            <strong>{optBadge.bodyStrong2}</strong>
            {optBadge.body3}
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section mk-container pr-faq-section">
        <h2 className="pr-center-title">{faqHead}</h2>
        <div className="pr-faq-list">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q} open={f.open}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-band">
        <div className="mk-container">
          <h2>{finalCta.h2}</h2>
          <p className="cta-p1">{finalCta.p1}</p>
          <p className="cta-p2">{finalCta.p2}</p>
          <div className="cta-actions">
            <a href="/__proto/register" className="btn btn-warm btn-lg">
              {finalCta.ctaPrimary}
            </a>
            <a href="/__proto/login" className="btn btn-ghost-inverse btn-lg">
              {finalCta.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── STICKY CTA ── */}
      <div className={`sticky-cta ${stickyVisible ? "visible" : ""}`}>
        <p>{stickyCta.text}</p>
        <a href="/__proto/register" className="btn btn-primary btn-sm">
          {stickyCta.ctaFree}
        </a>
        <a href="/__proto/register?plan=creator" className="btn btn-secondary btn-sm">
          {stickyCta.ctaCreator}
        </a>
      </div>
    </MarketingChrome>
  );
}
