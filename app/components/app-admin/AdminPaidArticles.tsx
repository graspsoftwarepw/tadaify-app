/**
 * AdminPaidArticles — Administration → Paid articles sub-page.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-paid-articles.html (517 LOC)
 *
 * Two display states:
 *   "no-page" — Paid articles page not yet created
 *   "filled"  — Sales stats + articles list (Stripe Connect banner visible)
 *
 * Article composer modal (centered, never a drawer) with paywall slider.
 * All publish/save/upload/import actions stubbed — TODO: wire to admin API.
 */

import { useState } from "react";

interface AdminPaidArticlesProps {
  handle: string;
}

// ─── Article Composer Modal ───────────────────────────────────────────────────

function ComposerModal({ onClose }: { onClose: () => void }) {
  const [previewWords, setPreviewWords] = useState(150);

  return (
    <div
      className="admin-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-articles-composer-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal admin-modal-wide">
        <div className="admin-modal-head">
          <h3 id="admin-articles-composer-title">New paid article</h3>
          <span className="admin-chip admin-chip-draft">○ Draft</span>
          <button className="admin-iconbtn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-cover-uploader" role="button" tabIndex={0} aria-label="Upload cover image">
            <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
            <b>Drop cover image here</b> or click to upload
            {/* TODO: wire to admin API */}
            <div style={{ fontSize: 12, marginTop: 4 }}>PNG / JPG / WebP · max 5MB · 1600×900 recommended</div>
          </div>
          <div style={{ marginTop: 16 }} />

          <div className="admin-field">
            <label className="admin-field-label">Title</label>
            <input className="admin-field-input" placeholder="A title that earns the click…" />
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">URL slug</label>
              <input className="admin-field-input" placeholder="auto-generated-from-title" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tags</label>
              <input className="admin-field-input" placeholder="pricing, freelance, process" />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Body</label>
            <textarea className="admin-field-area" placeholder={"## A heading\nParagraph with **bold** and a [link](https://). Markdown supported."} />
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">Price (USD)</label>
              <div className="admin-price-input-wrap">
                <span className="admin-price-ccy">$</span>
                <input type="number" min={1} max={999} step={1} defaultValue={5} aria-label="Price in USD" />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Schedule (optional)</label>
              <input className="admin-field-input" type="datetime-local" />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">
              Paywall preview cutoff{" "}
              <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(words visible before paywall)</span>
            </label>
            <div className="admin-paywall-slider">
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={previewWords}
                onChange={(e) => setPreviewWords(Number(e.target.value))}
                aria-label="Paywall preview word count"
              />
              <span className="admin-pv-val">{previewWords} words</span>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Stripe Connect status</label>
            <div className="admin-stripe-status">
              <span className="admin-stripe-check" aria-hidden="true">✓</span>
              <span>Stripe Connect active · Article will accept payments on publish</span>
            </div>
          </div>
        </div>
        <div className="admin-modal-foot">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-danger-ghost admin-btn-sm">Delete draft</button>
          <span className="admin-foot-spacer" />
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Save draft</button>
          <button className="admin-btn admin-btn-warm">Schedule</button>
          <button className="admin-btn admin-btn-primary">Publish now</button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo articles ────────────────────────────────────────────────────────────

const DEMO_ARTICLES = [
  { thumb: "",     emoji: "🎨", title: "My color theory cheatsheet",                       status: "live" as const,  meta: "18 min · Apr 22",                          price: "$8",  sales: "28", revenue: "$224" },
  { thumb: "t-i",  emoji: "📖", title: "How I priced my last commission",                  status: "live" as const,  meta: "12 min · Apr 24",                          price: "$5",  sales: "21", revenue: "$105" },
  { thumb: "t-e",  emoji: "🌱", title: "First year as a freelancer (deep dive)",           status: "live" as const,  meta: "30 min · Apr 18 · Includes spreadsheet",   price: "$12", sales: "14", revenue: "$168" },
  { thumb: "t-w",  emoji: "☕", title: "A morning in the studio",                          status: "live" as const,  meta: "8 min · Apr 12",                           price: "$3",  sales: "34", revenue: "$102" },
  { thumb: "t-r",  emoji: "📝", title: "Pricing my freelance illustration in 2026 (draft)",status: "draft" as const, meta: "Last edited 3h ago · 2,840 words",          price: "$7",  sales: "—",  revenue: "—" },
];

const CHIP_LABELS: Record<string, string> = {
  live:  "● Published",
  draft: "○ Draft",
};

// ─── Spark bar heights (demo) ─────────────────────────────────────────────────

const SPARK_HEIGHTS = ["30%", "55%", "40%", "70%", "60%", "85%", "95%"];

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPaidArticles({ handle: _handle }: AdminPaidArticlesProps) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <section className="main-admin main-admin-paid-articles" aria-labelledby="admin-articles-title">
      {/* Breadcrumb */}
      <nav className="admin-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="admin-crumb-sep">/</span>
        <span className="admin-crumb-here">Administration · Paid articles</span>
      </nav>

      {/* Page head */}
      <div className="admin-page-head">
        <div>
          <h1 id="admin-articles-title">
            <span className="admin-ph-emoji" aria-hidden="true">💰</span>
            Paid articles
          </h1>
          <div className="admin-page-sub">
            Publish individual monetized articles. Page-level setup (layout, theme, list URL) lives in{" "}
            <a href="/app?tab=page" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
              Pages → Paid articles
            </a>.
          </div>
        </div>
        <div className="admin-page-actions">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-ghost admin-btn-sm">Sales report</button>
          <button className="admin-btn admin-btn-primary" onClick={() => setComposerOpen(true)}>
            ＋ New article
          </button>
        </div>
      </div>

      {/* Stripe Connect banner — connected */}
      <div className="admin-stripe-banner">
        <div className="admin-sb-icon" aria-hidden="true">S</div>
        <div className="admin-sb-meta">
          <div className="admin-sb-title">Stripe Connect — Connected</div>
          <div className="admin-sb-sub">Payouts go to your bank account ending ····4231 every 2 days. Tax handled automatically (EU + US).</div>
        </div>
        {/* TODO: wire to admin API */}
        <button className="admin-btn admin-btn-ghost admin-btn-sm">Manage</button>
      </div>

      {/* Sales analytics */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Revenue this month</div>
          <div className="admin-stat-value">$248</div>
          <div className="admin-stat-sub">42 sales · ↑ 18% vs last month</div>
          <div className="admin-stat-spark" aria-hidden="true">
            {SPARK_HEIGHTS.map((h, i) => (
              <div key={i} className="admin-stat-spark-bar" style={{ height: h }} />
            ))}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Top article</div>
          <div className="admin-stat-value" style={{ fontSize: 18, lineHeight: 1.3 }}>Color theory cheatsheet</div>
          <div className="admin-stat-sub">$8 · 28 sales · $224</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Lifetime revenue</div>
          <div className="admin-stat-value">$1,840</div>
          <div className="admin-stat-sub">312 sales · 12 articles</div>
        </div>
      </div>

      {/* Articles list */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Articles</h2>
          <span className="admin-section-sub">12 published · 2 drafts</span>
        </div>
        <div className="admin-section-body">
          <div className="admin-toolbar">
            <div className="admin-tabs" role="tablist">
              <button className="admin-tab is-active" role="tab">All <span className="admin-tab-count">14</span></button>
              <button className="admin-tab" role="tab">Published <span className="admin-tab-count">12</span></button>
              <button className="admin-tab" role="tab">Drafts <span className="admin-tab-count">2</span></button>
            </div>
            <div className="admin-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="search" placeholder="Search articles…" aria-label="Search articles" />
            </div>
          </div>

          <div className="admin-articles-list">
            {DEMO_ARTICLES.map((a) => (
              <article className="admin-art-row" key={a.title}>
                <div className={`admin-ar-thumb${a.thumb ? ` ${a.thumb}` : ""}`} aria-hidden="true">{a.emoji}</div>
                <div className="admin-ar-meta">
                  <h4 className="admin-ar-title">{a.title}</h4>
                  <div className="admin-ar-info">
                    <span className={`admin-chip admin-chip-${a.status}`}>{CHIP_LABELS[a.status]}</span>
                    <span>{a.meta}</span>
                  </div>
                </div>
                <div className="admin-ar-price">{a.price}</div>
                <div className="admin-ar-sales">
                  <b>{a.sales}</b>
                  <span>{a.sales === "—" ? "not pub" : "sales"}</span>
                </div>
                <div className="admin-ar-revenue">
                  <b>{a.revenue}</b>
                  <span>{a.revenue === "—" ? "—" : "revenue"}</span>
                </div>
                <div className="admin-ar-actions">
                  {/* TODO: wire to admin API */}
                  <button className="admin-iconbtn" aria-label="Edit article">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </button>
                  <button className="admin-iconbtn" aria-label="More options">
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Article composer modal */}
      {composerOpen && <ComposerModal onClose={() => setComposerOpen(false)} />}
    </section>
  );
}
