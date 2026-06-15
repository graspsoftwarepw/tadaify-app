/**
 * Administration → Paid articles — the day-to-day publishing surface where a
 * creator publishes and manages individual monetized articles. Faithful port of
 * mockups/tadaify-mvp/app-admin-paid-articles.html, rendered inside the shared
 * creator dashboard chrome. Pairs with the Paid-articles page editor
 * (Pages → Paid articles) that configures the visitor-facing list page.
 *
 * Presentational, local-state only: a demo control flips the empty (no page) ↔
 * filled state and the Stripe-connected ↔ not-connected banner, the article
 * tabs switch, and the "New article" composer opens as a centred modal that
 * closes on Escape / Cancel / backdrop. Data comes from the typed
 * adminPaidArticlesFixture. Premium / Stripe-gated features stay fully visible
 * (no blur); the Stripe requirement is a functional gate, not a visual one.
 *
 * @implements fr-admin-paid-articles
 * @implements fr-globalui-view-layout
 */
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  adminPaidArticlesFixture,
  type ArticleThumbTone,
  type StripeStatus,
} from "./adminPaidArticlesFixture";
import "./admin-paid-articles-proto.css";

type DemoState = "filled" | "no-page";

const THUMB_CLASS: Record<ArticleThumbTone, string> = {
  indigo: "",
  warm: "t-warm",
  rose: "t-rose",
  emerald: "t-emerald",
  slate: "t-slate",
};

const noop = (label: string) => () => alert(`Mockup — ${label}`);

export function AdminPaidArticlesScreen() {
  const fx = adminPaidArticlesFixture();

  const [demoState, setDemoState] = useState<DemoState>("filled");
  const [stripe, setStripe] = useState<StripeStatus>(fx.stripe.status);
  const [activeTab, setActiveTab] = useState(fx.tabs[0]?.id ?? "all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [paywall, setPaywall] = useState(150);

  const closeComposer = () => setComposerOpen(false);

  useEffect(() => {
    if (!composerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeComposer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [composerOpen]);

  return (
    <DashboardChrome profile={dashboardProfileFixture()} activeNav="admin-paid-articles">
      <div className="proto-admin-paid-articles">
        <nav className="crumb" aria-label="Breadcrumb">
          <a href="/__proto/dashboard">Dashboard</a>
          <span className="sep">/</span>
          <span className="here">Administration · Paid articles</span>
        </nav>

        <header className="page-head">
          <div>
            <h1>
              <span className="ph-emoji" aria-hidden>
                💰
              </span>{" "}
              Paid articles
            </h1>
            <div className="sub">
              Publish individual monetized articles. Page-level setup (layout, theme, list URL) lives in{" "}
              <a href="/__proto/page-paid-articles">Pages → Paid articles</a>.
            </div>
          </div>
          {demoState !== "no-page" && (
            <div className="actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={noop("opens the sales report")}>
                Sales report
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setComposerOpen(true)}>
                ＋ New article
              </button>
            </div>
          )}
        </header>

        {/* ── Stripe Connect status banner ── */}
        {stripe === "connected" ? (
          <div className="stripe-banner">
            <div className="sb-icon" aria-hidden>
              S
            </div>
            <div className="sb-meta">
              <div className="sb-title">{fx.stripe.connectedTitle}</div>
              <div className="sb-sub">{fx.stripe.connectedSub}</div>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={noop("opens billing settings")}>
              Manage
            </button>
          </div>
        ) : (
          <div className="stripe-banner warn">
            <div className="sb-icon" aria-hidden>
              !
            </div>
            <div className="sb-meta">
              <div className="sb-title">{fx.stripe.warnTitle}</div>
              <div className="sb-sub">{fx.stripe.warnSub}</div>
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={noop("starts Stripe Connect")}>
              Connect Stripe →
            </button>
          </div>
        )}

        {/* ── STATE A: no Paid articles page ── */}
        {demoState === "no-page" ? (
          <section>
            <div className="empty">
              <div className="empty-icon" aria-hidden>
                💰
              </div>
              <h3>You don't have a Paid articles page yet</h3>
              <p>
                Paid articles let you sell individual long-form posts — Substack/Medium-style — without
                subscriptions. To start publishing, add a Paid articles page first.
              </p>
              <div className="empty-actions">
                <a className="btn btn-primary" href="/__proto/dashboard">
                  ＋ Add Paid articles page now
                </a>
                <button className="btn btn-ghost" type="button" onClick={noop("explains Paid articles")}>
                  Skip — what is Paid articles?
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* ── STATE B: filled ── */
          <section>
            {/* Sales analytics */}
            <div className="stats-row">
              {fx.stats.map((stat) => (
                <div className="stat-card" key={stat.id}>
                  <div className="stat-label">{stat.label}</div>
                  <div className={`stat-value${stat.valueSmall ? " is-small" : ""}`}>{stat.value}</div>
                  <div className="stat-sub">{stat.sub}</div>
                  {stat.spark && (
                    <div className="stat-spark" aria-hidden>
                      {stat.spark.map((h, i) => (
                        <div className="bar" style={{ height: `${h}%` }} key={i} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="section">
              <div className="section-head">
                <h2>Articles</h2>
                <span className="sub">{fx.sectionSub}</span>
              </div>
              <div className="section-body">
                <div className="toolbar">
                  <div className="tabs" role="tablist" aria-label="Filter articles">
                    {fx.tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`tab${activeTab === tab.id ? " is-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label} <span className="tab-count">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="search-wrap">
                    <S w={24}>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </S>
                    <input type="search" placeholder="Search articles…" aria-label="Search articles" />
                  </div>
                </div>

                <div className="articles-list">
                  {fx.articles.map((art) => (
                    <article className="art-row" key={art.id}>
                      <div className={`ar-thumb ${THUMB_CLASS[art.thumbTone]}`} aria-hidden>
                        {art.emoji}
                      </div>
                      <div className="ar-meta">
                        <h4 className="ar-title">{art.title}</h4>
                        <div className="ar-info">
                          {art.state === "published" ? (
                            <span className="chip live">● Published</span>
                          ) : (
                            <span className="chip draft">○ Draft</span>
                          )}
                          <span>{art.meta}</span>
                        </div>
                      </div>
                      <div className="ar-price">{art.price}</div>
                      <div className="ar-sales">
                        <b>{art.sales}</b>
                        <span>{art.salesLabel}</span>
                      </div>
                      <div className="ar-revenue">
                        <b>{art.revenue}</b>
                        <span>{art.revenueLabel}</span>
                      </div>
                      <div className="ar-actions">
                        <button className="iconbtn" type="button" aria-label="Edit article" onClick={noop("edits the article")}>
                          <S w={24}>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </S>
                        </button>
                        <button className="iconbtn" type="button" aria-label="More actions" onClick={noop("opens the article menu")}>
                          <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Demo state switcher (prototype only) ── */}
        <div className="demo-row">
          <span className="demo-group">
            <label htmlFor="apa-demo-state">State:</label>
            <select
              id="apa-demo-state"
              value={demoState}
              onChange={(e) => setDemoState(e.target.value as DemoState)}
            >
              <option value="filled">Filled (12+2)</option>
              <option value="no-page">No Paid articles page yet</option>
            </select>
          </span>
          <span className="demo-group">
            <label htmlFor="apa-demo-stripe">Stripe:</label>
            <select
              id="apa-demo-stripe"
              value={stripe}
              onChange={(e) => setStripe(e.target.value as StripeStatus)}
            >
              <option value="connected">Connected</option>
              <option value="not-connected">Not connected</option>
            </select>
          </span>
        </div>
      </div>

      {/* ── Article composer modal — centred, Escape / Cancel / backdrop close ── */}
      {composerOpen && (
        <div
          className="proto-admin-paid-articles-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apa-composer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeComposer();
          }}
        >
          <div className="proto-admin-paid-articles-modal">
            <div className="modal-head">
              <h3 id="apa-composer-title">New paid article</h3>
              <span className="chip">○ Draft</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={closeComposer}>
                <S w={24}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </S>
              </button>
            </div>
            <div className="modal-body">
              <button type="button" className="cover-uploader" onClick={noop("opens the image picker")}>
                <div className="cu-emoji" aria-hidden>
                  📷
                </div>
                <b>Drop cover image here</b> or click to upload
                <div className="cu-sub">PNG / JPG / WebP · max 5MB · 1600×900 recommended</div>
              </button>

              <div style={{ marginTop: 16 }} />

              <div className="field">
                <label className="field-label" htmlFor="apa-title">
                  Title
                </label>
                <input id="apa-title" className="field-input" placeholder="A title that earns the click…" />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="apa-slug">
                    URL slug
                  </label>
                  <input id="apa-slug" className="field-input" placeholder="auto-generated-from-title" />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="apa-tags">
                    Tags
                  </label>
                  <input id="apa-tags" className="field-input" placeholder="pricing, freelance, process" />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="apa-body">
                  Body
                </label>
                <textarea
                  id="apa-body"
                  className="field-area"
                  placeholder="## A heading&#10;Paragraph with **bold** and a [link](https://). Markdown supported."
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="apa-price">
                    Price (USD)
                  </label>
                  <div className="price-input-wrap">
                    <span className="ccy">$</span>
                    <input id="apa-price" type="number" min={1} max={999} step={1} defaultValue={5} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="apa-schedule">
                    Schedule (optional)
                  </label>
                  <input id="apa-schedule" className="field-input" type="datetime-local" />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="apa-paywall">
                  Paywall preview cutoff <span className="hint">(words visible before paywall)</span>
                </label>
                <div className="paywall-slider">
                  <input
                    id="apa-paywall"
                    type="range"
                    min={50}
                    max={500}
                    step={25}
                    value={paywall}
                    onChange={(e) => setPaywall(Number(e.target.value))}
                  />
                  <span className="pv-val">{paywall} words</span>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Stripe Connect status</label>
                {stripe === "connected" ? (
                  <div className="stripe-status">
                    <span className="check" aria-hidden>
                      ✓
                    </span>
                    <span>Stripe Connect active · Article will accept payments on publish</span>
                  </div>
                ) : (
                  <div className="stripe-status warn">
                    <span>Connect Stripe before publishing — drafts can still be saved.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={closeComposer}>
                Delete draft
              </button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost" type="button" onClick={closeComposer}>
                Save draft
              </button>
              <button className="btn btn-warm" type="button" onClick={closeComposer}>
                Schedule
              </button>
              <button className="btn btn-primary" type="button" onClick={closeComposer}>
                Publish now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
