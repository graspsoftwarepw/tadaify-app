/**
 * AppPagePaidArticles — Pages → Paid articles page-level editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-paid-articles.html (405 LOC)
 *
 * This is the page-settings editor for tadaify.com/<handle>/articles — NOT
 * the per-article administration panel (that lives in AdminPaidArticles).
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement } from "react";

interface AppPagePaidArticlesProps {
  handle: string;
}

// ─── Preview card data ────────────────────────────────────────────────────────

const PREVIEW_ARTICLES = [
  { theme: "t-i", emoji: "📖", title: "How I priced my last commission", price: "$5 · 12 min read" },
  { theme: "t-w", emoji: "☕", title: "A morning in the studio",         price: "$3 · 8 min read" },
  { theme: "",    emoji: "🎨", title: "My color theory cheatsheet",      price: "$8 · 18 min read" },
  { theme: "t-e", emoji: "🌱", title: "First year as a freelancer (deep dive)", price: "$12 · 30 min read" },
];

// ─── Toggle row atom ──────────────────────────────────────────────────────────

function ToggleRow({
  name,
  sub,
  badge,
  defaultOn = false,
}: {
  name: ReactElement | string;
  sub: string;
  badge?: ReactElement;
  defaultOn?: boolean;
}): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="app-page-paid-row-toggle">
      <div>
        <div className="app-page-paid-rt-name">
          {name}
          {badge}
        </div>
        <div className="app-page-paid-rt-sub">{sub}</div>
      </div>
      <button
        className={`app-page-paid-toggle${on ? " is-on" : ""}`}
        type="button"
        aria-pressed={on}
        aria-label="Toggle"
        onClick={() => setOn((v) => !v)}
      />
    </div>
  );
}

// ─── Layout option atom ───────────────────────────────────────────────────────

type LayoutValue = "grid" | "list" | "featured";

function LayoutOption({
  value,
  label,
  selected,
  onSelect,
  children,
}: {
  value: LayoutValue;
  label: string;
  selected: boolean;
  onSelect: (v: LayoutValue) => void;
  children: ReactElement;
}): ReactElement {
  return (
    <button
      className={`app-page-paid-layout-option${selected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
    >
      {children}
      <div className="app-page-paid-lo-name">{label}</div>
    </button>
  );
}

// ─── Swatch atom ─────────────────────────────────────────────────────────────

const SWATCHES: { bg: string; label: string }[] = [
  { bg: "#FFFFFF", label: "Default white" },
  { bg: "#FAF5FF", label: "Cream" },
  { bg: "#F0FDF4", label: "Mint" },
  { bg: "#0F172A", label: "Slate dark" },
  { bg: "#7C3AED", label: "Violet" },
];

function SwatchRow(): ReactElement {
  const [selected, setSelected] = useState(0);
  return (
    <div className="app-page-paid-swatch-row">
      {SWATCHES.map((s, i) => (
        <button
          key={s.label}
          className={`app-page-paid-swatch${selected === i ? " is-selected" : ""}`}
          style={{ background: s.bg }}
          type="button"
          aria-label={s.label}
          title={s.label}
          onClick={() => setSelected(i)}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppPagePaidArticles({ handle }: AppPagePaidArticlesProps): ReactElement {
  const [layout, setLayout] = useState<LayoutValue>("grid");

  const publicUrl = `tadaify.com/${handle}/articles`;

  return (
    <div className="app-page-paid-root" aria-labelledby="app-page-paid-title">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-paid-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="app-page-paid-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-paid-crumb-sep">/</span>
        <span className="app-page-paid-crumb-here">Paid articles</span>
      </nav>

      {/* ── Page head ── */}
      <header className="app-page-paid-page-head">
        <div>
          <h1 id="app-page-paid-title" className="app-page-paid-h1">
            <span className="app-page-paid-ph-emoji" aria-hidden="true">💰</span>
            Paid articles
          </h1>
          <p className="app-page-paid-sub">
            The page that lists all your monetized articles for visitors. Publish individual articles in{" "}
            <a href="/app?tab=admin" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
              Administration → Paid articles
            </a>.
          </p>
        </div>
        <div className="app-page-paid-actions">
          <span className="app-page-paid-url-pill">
            <span className="app-page-paid-live-dot" aria-hidden="true" />
            <b>{publicUrl}</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-paid-btn app-page-paid-btn-ghost app-page-paid-btn-sm" type="button">
            Preview
          </button>
        </div>
      </header>

      {/* ── Section: Page settings ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>Page settings</h2>
        </div>
        <div className="app-page-paid-section-body">
          <div className="app-page-paid-field-row">
            <div className="app-page-paid-field">
              <label className="app-page-paid-field-label" htmlFor="apd-page-title">
                Page title (visitor-facing)
              </label>
              <input
                id="apd-page-title"
                className="app-page-paid-field-input"
                type="text"
                defaultValue="Articles"
              />
            </div>
            <div className="app-page-paid-field">
              <label className="app-page-paid-field-label" htmlFor="apd-slug">
                URL slug
              </label>
              <div className="app-page-paid-field-prefix-wrap">
                <span className="app-page-paid-field-prefix">/{handle}/</span>
                <input id="apd-slug" type="text" defaultValue="articles" />
              </div>
            </div>
          </div>

          <div className="app-page-paid-field">
            <label className="app-page-paid-field-label" htmlFor="apd-lede">
              Lede / intro line (shown above the grid)
            </label>
            <input
              id="apd-lede"
              className="app-page-paid-field-input"
              type="text"
              defaultValue="Long-form essays + behind-the-scenes you can't get anywhere else."
            />
          </div>

          <ToggleRow
            name="Page is published"
            sub="Visitors can browse the article list at the URL above."
            defaultOn
          />
          <ToggleRow
            name="Show in navigation"
            sub='Add an "Articles" link to your home page header.'
            badge={<span className="app-page-paid-chip app-page-paid-chip-tier">Creator</span>}
            defaultOn
          />
        </div>
      </section>

      {/* ── Section: Layout ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>Layout</h2>
          <span className="app-page-paid-section-sub">How visitors see the article list</span>
        </div>
        <div className="app-page-paid-section-body">
          <div className="app-page-paid-layout-options">
            <LayoutOption value="grid" label="Grid (default)" selected={layout === "grid"} onSelect={setLayout}>
              <div className="app-page-paid-lo-thumb app-page-paid-lo-thumb-grid">
                <div /><div /><div /><div />
              </div>
            </LayoutOption>
            <LayoutOption value="list" label="List" selected={layout === "list"} onSelect={setLayout}>
              <div className="app-page-paid-lo-thumb app-page-paid-lo-thumb-list">
                <div /><div /><div />
              </div>
            </LayoutOption>
            <LayoutOption value="featured" label="Featured-on-top" selected={layout === "featured"} onSelect={setLayout}>
              <div className="app-page-paid-lo-thumb app-page-paid-lo-thumb-feat">
                <div style={{ opacity: 0.7 }} /><div /><div />
              </div>
            </LayoutOption>
          </div>
        </div>
      </section>

      {/* ── Section: Visitor controls ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>Visitor controls</h2>
          <span className="app-page-paid-section-sub">What filters appear above the grid</span>
        </div>
        <div className="app-page-paid-section-body">
          <ToggleRow name="Search bar"     sub="Filter by title."     defaultOn />
          <ToggleRow name="Tag filter chips" sub="Filter by article tag." defaultOn />
          <ToggleRow
            name="Sort selector (Newest / Most popular / Price)"
            sub="Visitor can re-order articles."
            defaultOn={false}
          />
        </div>
      </section>

      {/* ── Section: Theme ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>Theme</h2>
          <span className="app-page-paid-section-sub">Page background color</span>
        </div>
        <div className="app-page-paid-section-body">
          <SwatchRow />
        </div>
      </section>

      {/* ── Section: SEO & sharing ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>SEO &amp; sharing</h2>
        </div>
        <div className="app-page-paid-section-body">
          <details className="app-page-paid-expander">
            <summary>
              Custom meta + OG image (optional)
              <svg className="app-page-paid-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="app-page-paid-ex-body">
              <div className="app-page-paid-field">
                <label className="app-page-paid-field-label" htmlFor="apd-seo-title">
                  Page title for search engines
                </label>
                <input
                  id="apd-seo-title"
                  className="app-page-paid-field-input"
                  type="text"
                  placeholder="Alexandra Silva — Paid articles"
                />
              </div>
              <div className="app-page-paid-field">
                <label className="app-page-paid-field-label" htmlFor="apd-meta-desc">
                  Meta description
                </label>
                <textarea
                  id="apd-meta-desc"
                  className="app-page-paid-field-area"
                  placeholder="One-line description that shows up in Google."
                />
              </div>
              <div className="app-page-paid-field">
                <label className="app-page-paid-field-label" htmlFor="apd-og-image">
                  Open Graph image (1200×630)
                </label>
                {/* TODO: wire to admin pages API */}
                <input id="apd-og-image" className="app-page-paid-field-input" type="file" />
              </div>
              <div className="app-page-paid-field">
                <label className="app-page-paid-field-label" htmlFor="apd-custom-domain">
                  Custom domain{" "}
                  <span className="app-page-paid-chip app-page-paid-chip-tier">Pro</span>
                </label>
                <input
                  id="apd-custom-domain"
                  className="app-page-paid-field-input"
                  type="text"
                  placeholder={`articles.${handle}.com`}
                />
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* ── Section: Preview ── */}
      <section className="app-page-paid-section">
        <div className="app-page-paid-section-head">
          <h2>Preview</h2>
          <span className="app-page-paid-section-sub">Sample of how visitors see this page</span>
          <span className="app-page-paid-head-spacer" />
          <a href="/preview/paid-articles" className="app-page-paid-btn app-page-paid-btn-ghost app-page-paid-btn-sm">
            Open full preview ↗
          </a>
        </div>
        <div className="app-page-paid-section-body" style={{ padding: 0 }}>
          <div className="app-page-paid-preview-frame">
            <div className="app-page-paid-preview-hero">
              <h3>
                Articles{" "}
                <span className="app-page-paid-chip" style={{ verticalAlign: "middle" }}>12</span>
              </h3>
              <p>Long-form essays + behind-the-scenes you can&apos;t get anywhere else.</p>
            </div>
            <div className="app-page-paid-preview-grid">
              {PREVIEW_ARTICLES.map((a) => (
                <div className="app-page-paid-preview-card" key={a.title}>
                  <div className={`app-page-paid-pc-cover${a.theme ? ` ${a.theme}` : ""}`} aria-hidden="true">
                    {a.emoji}
                  </div>
                  <div className="app-page-paid-pc-meta">
                    <div className="app-page-paid-pc-title">{a.title}</div>
                    <div className="app-page-paid-pc-price">{a.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky save bar ── */}
      <div className="app-page-paid-save-bar" role="status">
        <span className="app-page-paid-save-status">Last saved 2 min ago · Autosave on</span>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-paid-btn app-page-paid-btn-ghost app-page-paid-btn-sm" type="button">
          Discard changes
        </button>
        <button className="app-page-paid-btn app-page-paid-btn-primary app-page-paid-btn-sm" type="button">
          Save changes
        </button>
      </div>

    </div>
  );
}
