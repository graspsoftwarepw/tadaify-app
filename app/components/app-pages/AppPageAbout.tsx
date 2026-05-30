/**
 * AppPageAbout — Pages → About page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-about.html (1944 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title, URL slug (fixed "about"), publish toggle,
 *      show-in-nav toggle, page background swatches, custom domain (Pro),
 *      SEO expander (meta title, description, OG image).
 *   2. Page content — draggable section cards (filled state: 5 sections):
 *        Hero   — photo drop-zone, display name, tagline, social proof line.
 *        Bio    — rich-text editor with formatting toolbar, word count.
 *        Highlights — 3-column grid of stat cards + "Add highlight".
 *        Story timeline — year-by-year entries, style toggle (list / cards).
 *        Press / quotes — 2-column quote cards (Creator+), tier hint.
 *        Contact CTA — button label, destination select, style pills (Pro+).
 *      Empty state — "Tell visitors who you are" prompt.
 *   Add section modal — 6 section type tiles + 3 AI starter templates.
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageAboutProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TimelineEntry = { id: string; year: string; title: string; desc: string };
type QuoteCard     = { id: string; text: string; attribution: string; initials: string; iconTheme: string };
type TlStyle       = "list" | "cards";
type CtaStyle      = "pill" | "rounded" | "square" | "outline";

// ─── Demo data ────────────────────────────────────────────────────────────────

const INIT_TIMELINE: TimelineEntry[] = [
  { id: "t1", year: "2018", title: "First barbell",                     desc: "Joined a powerlifting gym in Berlin to fix back pain. Stayed for the community." },
  { id: "t2", year: "2020", title: "Quit consulting",                   desc: "Took a sabbatical to certify as a strength coach. Never went back to the office." },
  { id: "t3", year: "2022", title: "Moved to Lisbon",                   desc: "Switched to remote-first coaching. Built the first cohort of online clients." },
  { id: "t4", year: "2024", title: "Published Rest Days Are Workouts",  desc: "Self-published the book on recovery. Sold out the first run in 6 weeks." },
  { id: "t5", year: "2026", title: "Now",                               desc: "Building Strong Not Skinny — a small group program for busy women." },
];

const INIT_QUOTES: QuoteCard[] = [
  { id: "q1", text: '"Alexandra is the rare coach who treats rest as a workout. Her programs are quietly the best I\'ve followed."', attribution: "The Fitness Times — issue 47",  initials: "FT", iconTheme: "" },
  { id: "q2", text: '"Honest, no-nonsense coaching. She\'s the one I send my friends to when they ask where to start lifting."',    attribution: "Run Happy podcast · @robinhuxley", initials: "RH", iconTheme: "warm" },
  { id: "q3", text: '"The book Rest Days Are Workouts is the antidote to the cult of grind. Required reading for any tired lifter."', attribution: "Strong Habits Newsletter",   initials: "SH", iconTheme: "emerald" },
];

const HIGHLIGHT_DATA = [
  { id: "h1", icon: "💪", value: "40 women / year",     caption: "coached 1:1 since 2020" },
  { id: "h2", icon: "📚", value: "1 book published",    caption: "Rest Days Are Workouts (2024)" },
  { id: "h3", icon: "🌍", value: "Lisbon, Portugal",    caption: "working remotely since 2022" },
  { id: "h4", icon: "📅", value: "6 yrs coaching",      caption: "started 2018, full-time since 2020" },
  { id: "h5", icon: "🎙", value: "40+ podcasts",        caption: "guest on training & longevity shows" },
];

const PAGE_SWATCHES = [
  { style: "var(--bg)",                                           label: "Inherit theme" },
  { style: "#FFFFFF",                                             label: "White" },
  { style: "#F8F4EE",                                             label: "Warm cream" },
  { style: "#1F2937",                                             label: "Slate" },
  { style: "#0B0F1E",                                             label: "Dark canvas" },
  { style: "linear-gradient(135deg,#FDE68A,#F59E0B)",             label: "Sunrise" },
  { style: "linear-gradient(135deg,#6366F1,#8B5CF6)",             label: "Indigo" },
  { style: "linear-gradient(135deg,#0F172A,#334155)",             label: "Nightfall" },
];

const SECTION_TYPES = [
  { type: "hero",       icon: "🌅",  iconTheme: "warm",    name: "Hero",           desc: "Photo + name + tagline + social proof line. The first thing visitors see." },
  { type: "bio",        icon: "📝",  iconTheme: "indigo",  name: "Bio",            desc: "Long-form story in your own words. Rich-text editor with ✨ AI assist." },
  { type: "highlights", icon: "⭐",  iconTheme: "emerald", name: "Highlights",     desc: "3–6 stat cards. Clients coached, books published, places lived." },
  { type: "timeline",   icon: "📅",  iconTheme: "rose",    name: "Story timeline", desc: "Year-by-year milestones. List or card style on the public page." },
  { type: "press",      icon: "📰",  iconTheme: "slate",   name: "Press / quotes", desc: "Quote cards with attribution. Renders as a carousel for visitors." },
  { type: "contact",    icon: "✉️",  iconTheme: "",        name: "Contact CTA",    desc: 'A "Get in touch" button. Links to contact page, mailto, or external URL.' },
];

const STARTER_ABOUT = [
  { slug: "musician", emoji: "🎵", name: "Musician", meta: "Hero · Bio · Highlights · Press · Contact" },
  { slug: "author",   emoji: "📚", name: "Author",   meta: "Hero · Bio · Timeline · Press · Contact" },
  { slug: "coach",    emoji: "💪", name: "Coach",    meta: "Hero · Bio · Highlights · Timeline · Contact" },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-about-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: string; sub: string; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-about-row-toggle">
      <div>
        <div className="app-page-about-rt-name">{name}</div>
        <div className="app-page-about-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-about-tier-hint">
      <span className="app-page-about-th-icon" aria-hidden="true">💡</span>
      <span>{children}</span>
    </div>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-about-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-about-swatch${sel === i ? " is-selected" : ""}`}
          style={{ background: s.style }}
          role="button"
          tabIndex={0}
          title={s.label}
          aria-label={s.label}
          onClick={() => setSel(i)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(i); }}
        />
      ))}
    </div>
  );
}

// ─── Grip SVG ─────────────────────────────────────────────────────────────────

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
      <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SecCard({
  sectionId,
  sectionType,
  icon,
  iconTheme,
  title,
  sub,
  onRemove,
  children,
}: {
  sectionId: string;
  sectionType: string;
  icon: string;
  iconTheme?: string;
  title: ReactElement | string;
  sub: string;
  onRemove: (id: string) => void;
  children: ReactElement;
}): ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <article
      className={`app-page-about-sec-card${collapsed ? " is-collapsed" : ""}`}
      data-section-id={sectionId}
      data-section-type={sectionType}
    >
      <header className="app-page-about-sec-head">
        <span className="app-page-about-sec-grip" aria-label="Drag to reorder"><GripSvg /></span>
        <span className={`app-page-about-sec-icon${iconTheme ? " " + iconTheme : ""}`} aria-hidden="true">{icon}</span>
        <div className="app-page-about-sec-meta">
          <h3 className="app-page-about-sec-title">{title}</h3>
          <p className="app-page-about-sec-sub">{sub}</p>
        </div>
        <div className="app-page-about-sec-actions">
          <button
            className="app-page-about-iconbtn"
            type="button"
            aria-label="Remove section"
            onClick={() => onRemove(sectionId)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
          <button
            className="app-page-about-sec-toggle"
            type="button"
            aria-label="Toggle section"
            onClick={() => setCollapsed((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </header>
      {!collapsed && <div className="app-page-about-sec-body">{children}</div>}
    </article>
  );
}

// ─── Rich-text toolbar ────────────────────────────────────────────────────────

function RtToolbar(): ReactElement {
  return (
    <div className="app-page-about-rt-toolbar" role="toolbar" aria-label="Formatting">
      <button type="button" aria-label="Bold" title="Bold (Ctrl+B)"><b>B</b></button>
      <button type="button" aria-label="Italic" title="Italic (Ctrl+I)"><i>I</i></button>
      <span className="app-page-about-rt-sep" />
      <button type="button" aria-label="Heading">H</button>
      <button type="button" aria-label="Quote">❝</button>
      <span className="app-page-about-rt-sep" />
      <button type="button" aria-label="Link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <span className="app-page-about-rt-sep" />
      <button type="button" aria-label="Bullet list">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
        </svg>
      </button>
      <button type="button" aria-label="Numbered list">1.</button>
      <span className="app-page-about-rt-sep" style={{ marginLeft: "auto" }} />
      {/* TODO: wire to admin pages API */}
      <button type="button" aria-label="Generate paragraph with AI">✨ AI</button>
    </div>
  );
}

// ─── Add-section modal ────────────────────────────────────────────────────────

function AddSectionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (type: string) => void }): ReactElement {
  return (
    <div
      className="app-page-about-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-sp-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-about-modal">
        <div className="app-page-about-modal-head">
          <h3 id="about-sp-title">Add a section</h3>
          <span className="app-page-about-head-spacer" />
          <button className="app-page-about-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-about-modal-body">
          <p style={{ margin: "0 0 14px", color: "var(--fg-muted)", fontSize: 13.5 }}>
            Pick a section type to add to your About page. You can reorder, edit and remove any section after adding it.
          </p>
          <div className="app-page-about-types-grid">
            {SECTION_TYPES.map((t) => (
              <button
                key={t.type}
                className="app-page-about-type-tile"
                type="button"
                onClick={() => { onAdd(t.type); onClose(); }}
              >
                <div className="app-page-about-tt-row">
                  <div className={`app-page-about-tt-icon${t.iconTheme ? " " + t.iconTheme : ""}`}>{t.icon}</div>
                  <h4 className="app-page-about-tt-name">
                    {t.name}
                    {t.type === "press" && (
                      <span className="app-page-about-sec-tier-badge app-page-about-tier-creator" style={{ marginLeft: 6 }}>⭐ Creator</span>
                    )}
                  </h4>
                </div>
                <p className="app-page-about-tt-desc">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="app-page-about-starter-row">
            <h4>✨ Or start from a template</h4>
            <p className="app-page-about-star-sub">Three ready-made compositions. You can edit everything after.</p>
            <div className="app-page-about-starter-grid">
              {STARTER_ABOUT.map((s) => (
                <button key={s.slug} className="app-page-about-starter-card" type="button">
                  <div className="app-page-about-sc-emoji">{s.emoji}</div>
                  <div className="app-page-about-sc-name">{s.name}</div>
                  <div className="app-page-about-sc-meta">{s.meta}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="app-page-about-modal-foot">
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            Free plan: up to 4 sections per About page.{" "}
            <a href="/pricing" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>See plans →</a>
          </span>
          <span className="app-page-about-foot-spacer" />
          <button className="app-page-about-btn app-page-about-btn-ghost app-page-about-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageAbout({ handle }: AppPageAboutProps): ReactElement {
  const [tlStyle, setTlStyle]           = useState<TlStyle>("list");
  const [ctaStyle, setCtaStyle]         = useState<CtaStyle>("pill");
  const [pickerOpen, setPickerOpen]     = useState(false);
  const [sectionCount, setSectionCount] = useState(5);
  const [hasContent, setHasContent]     = useState(true);
  const [quotes, setQuotes]             = useState<QuoteCard[]>(INIT_QUOTES);

  const removeSection = () => {
    const next = sectionCount - 1;
    setSectionCount(next);
    if (next === 0) setHasContent(false);
  };

  const addSection = (type: string) => {
    setSectionCount((n) => n + 1);
    setHasContent(true);
    // Actual section insertion wired in production; mockup stubs at Save.
    void type;
  };

  const removeQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="app-page-about-root" aria-labelledby="app-page-about-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-about-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-about-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-about-crumb-sep">/</span>
        <span className="app-page-about-crumb-here">About</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-about-page-head">
        <div>
          <h1 id="app-page-about-h1" className="app-page-about-h1">
            <span className="app-page-about-ph-emoji" aria-hidden="true">👤</span>
            About
          </h1>
          <p className="app-page-about-sub">
            A long-form story page — bio, timeline, highlights, press. For creators who want richer storytelling than the homepage hero.
          </p>
        </div>
        <div className="app-page-about-actions">
          <span className="app-page-about-url-pill">
            <span className="app-page-about-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>about</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-about-btn app-page-about-btn-ghost app-page-about-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          PANEL 1 — Page settings
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-about-panel">
        <div className="app-page-about-panel-head">
          <h2>Page settings</h2>
          <span className="app-page-about-panel-sub">Title, URL, visibility, theme and SEO for the About page.</span>
        </div>
        <div className="app-page-about-panel-body">

          {/* Title + slug (slug fixed for About) */}
          <div className="app-page-about-field-row">
            <div className="app-page-about-field">
              <label className="app-page-about-field-label" htmlFor="about-page-title">
                Page title{" "}
                <span className="app-page-about-field-hint">also used as the &lt;h1&gt; if Hero section is empty</span>
              </label>
              <input id="about-page-title" className="app-page-about-field-input" type="text" defaultValue="About" />
            </div>
            <div className="app-page-about-field">
              <label className="app-page-about-field-label" htmlFor="about-page-slug">
                URL slug{" "}
                <span className="app-page-about-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-about-field-prefix-wrap">
                <span className="app-page-about-field-prefix">tadaify.com/{handle}/</span>
                <input id="about-page-slug" type="text" defaultValue="about" />
              </div>
            </div>
          </div>

          {/* Publish + Show in nav */}
          <div className="app-page-about-field-row">
            <div className="app-page-about-field">
              <label className="app-page-about-field-label">Publish</label>
              <ToggleRow name="Page is live" sub="Visitors can find it at the URL above." defaultOn />
            </div>
            <div className="app-page-about-field">
              <label className="app-page-about-field-label">Show in nav</label>
              <ToggleRow name="Link from main page" sub={`"About" appears in your top navigation.`} defaultOn />
            </div>
          </div>

          {/* Background swatches */}
          <div className="app-page-about-field">
            <label className="app-page-about-field-label">
              Page background{" "}
              <span className="app-page-about-field-hint">override theme colour for this page only</span>
            </label>
            <SwatchRow />
          </div>

          {/* Custom domain (Pro+) */}
          <div className="app-page-about-field" style={{ marginTop: 14 }}>
            <label className="app-page-about-field-label">
              Custom domain{" "}
              <span className="app-page-about-sec-tier-badge app-page-about-tier-pro">✨ Pro</span>
              <span className="app-page-about-field-hint"> e.g. about.alexandrasilva.com instead of tadaify.com/{handle}/about</span>
            </label>
            <div className="app-page-about-field-prefix-wrap">
              <input id="about-custom-domain" type="text" placeholder="about.yourdomain.com" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-about-field-suffix-action" type="button">Set up →</button>
            </div>
            <TierHint>
              Per-page custom domains are part of the <b>Pro</b> plan. We&apos;ll prompt to upgrade when you save if you set one.
            </TierHint>
          </div>

          {/* SEO expander */}
          <details className="app-page-about-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
              </svg>
              SEO settings{" "}
              <span className="app-page-about-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-about-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-about-ex-body">
              <div className="app-page-about-field">
                <label className="app-page-about-field-label" htmlFor="about-seo-title">
                  Meta title{" "}
                  <span className="app-page-about-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-about-field-prefix-wrap">
                  <input id="about-seo-title" type="text" defaultValue="About Alexandra Silva — strength coach & writer" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-about-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-about-field">
                <label className="app-page-about-field-label" htmlFor="about-seo-desc">
                  Meta description{" "}
                  <span className="app-page-about-field-hint">~155 chars</span>
                </label>
                <div className="app-page-about-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="about-seo-desc"
                    className="app-page-about-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue={'Strength coach since 2018. I help busy women train hard without burning out. Author of "Rest Days Are Workouts." Based in Lisbon.'}
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-about-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-about-field">
                <label className="app-page-about-field-label">
                  OG image{" "}
                  <span className="app-page-about-field-hint">1200×630 — shown when shared on social</span>
                </label>
                <div className="app-page-about-photo-drop" style={{ aspectRatio: "auto", height: 120 }}>
                  <span className="app-page-about-pd-emoji">🖼</span>
                  <div className="app-page-about-pd-title">Drop an image, or click to upload</div>
                  <div className="app-page-about-pd-sub">
                    Or{" "}
                    {/* TODO: wire to admin pages API */}
                    <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate one with AI</span>
                  </div>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PANEL 2 — Page content (section cards)
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-about-panel">
        <div className="app-page-about-panel-head">
          <h2>Page content</h2>
          <span className="app-page-about-panel-sub">Drag sections to reorder. Click a card header to collapse / expand.</span>
          <span className="app-page-about-head-spacer" />
          <span className="app-page-about-chip">{sectionCount} section{sectionCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="app-page-about-panel-body">

          {hasContent ? (
            <>
              <div className="app-page-about-sections-stack" id="sections-stack">

                {/* ── Hero section ── */}
                <SecCard
                  sectionId="hero"
                  sectionType="hero"
                  icon="🌅"
                  iconTheme="warm"
                  title="Hero"
                  sub="Photo + name + one-line tagline + social proof."
                  onRemove={removeSection}
                >
                  <div className="app-page-about-hero-editor">
                    <div className="app-page-about-photo-drop app-page-about-photo-drop-has">
                      A
                      <div className="app-page-about-photo-overlay">
                        {/* TODO: wire to admin pages API */}
                        <button className="app-page-about-photo-replace-btn" type="button">Replace</button>
                      </div>
                    </div>
                    <div className="app-page-about-hero-fields">
                      <div className="app-page-about-field" style={{ margin: 0 }}>
                        <label className="app-page-about-field-label" htmlFor="about-hero-name">Display name</label>
                        <input className="app-page-about-field-input" id="about-hero-name" type="text" defaultValue="Alexandra Silva" />
                      </div>
                      <div className="app-page-about-field" style={{ margin: 0 }}>
                        <label className="app-page-about-field-label" htmlFor="about-hero-tagline">One-line tagline</label>
                        <div className="app-page-about-field-prefix-wrap">
                          <input id="about-hero-tagline" type="text" defaultValue="Strength coach for women who hate gymtok." />
                          {/* TODO: wire to admin pages API */}
                          <button className="app-page-about-field-suffix-action" type="button">✨ Suggest</button>
                        </div>
                      </div>
                      <div className="app-page-about-field" style={{ margin: 0 }}>
                        <label className="app-page-about-field-label">
                          Social proof line{" "}
                          <span className="app-page-about-field-hint">handle · followers · timeframe</span>
                        </label>
                        <div className="app-page-about-social-proof-line">
                          <b>@{handle}</b>
                          <span className="app-page-about-sp-dot" />
                          <span><b>24k</b> followers</span>
                          <span className="app-page-about-sp-dot" />
                          <span>since <b>2018</b></span>
                          <button
                            className="app-page-about-iconbtn"
                            type="button"
                            aria-label="Edit social proof"
                            style={{ marginLeft: "auto" }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SecCard>

                {/* ── Bio section ── */}
                <SecCard
                  sectionId="bio"
                  sectionType="bio"
                  icon="📝"
                  iconTheme="indigo"
                  title="Bio"
                  sub="Tell visitors who you are. ~150 words is the sweet spot."
                  onRemove={removeSection}
                >
                  <>
                    <RtToolbar />
                    <textarea
                      id="about-bio-text"
                      className="app-page-about-rt-area"
                      defaultValue={
                        "I'm Alexandra. I coach busy women who want to get strong without making the gym their personality.\n\nI started lifting at 24 to fix a back I'd wrecked sitting at a desk. Five years later I'd quit my consulting job and was coaching full-time. Today I work with about 40 women a year — most of them mums, founders, or runners who'd hit a wall trying to \"just do more cardio.\"\n\nMy method is unsexy: heavy basics, real recovery, and exactly enough volume to keep moving forward. No 4 AM cold-plunge content. No 30-day shred programs. Just the boring stuff that actually works for the next ten years."
                      }
                    />
                    <div className="app-page-about-rt-meta">
                      <span><span className="app-page-about-word-count app-page-about-is-good">147 words</span> · ~45 sec read</span>
                      <span>Sweet spot: 100–200 words</span>
                    </div>
                  </>
                </SecCard>

                {/* ── Highlights section ── */}
                <SecCard
                  sectionId="highlights"
                  sectionType="highlights"
                  icon="⭐"
                  iconTheme="emerald"
                  title="Highlights"
                  sub="3–6 stat cards. Pick an icon, set the value + caption."
                  onRemove={removeSection}
                >
                  <div className="app-page-about-highlights-grid">
                    {HIGHLIGHT_DATA.map((h) => (
                      <div key={h.id} className="app-page-about-highlight-card">
                        <div className="app-page-about-hc-icon-row">
                          {/* TODO: wire to admin pages API */}
                          <button className="app-page-about-hc-icon-btn" type="button" aria-label="Pick icon">{h.icon}</button>
                          <button className="app-page-about-iconbtn app-page-about-hc-remove" type="button" aria-label="Remove">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <input className="app-page-about-hc-value" type="text" defaultValue={h.value} />
                        <input className="app-page-about-hc-caption" type="text" defaultValue={h.caption} />
                      </div>
                    ))}
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-about-highlight-add" type="button" aria-label="Add highlight">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add highlight
                    </button>
                  </div>
                </SecCard>

                {/* ── Story timeline section ── */}
                <SecCard
                  sectionId="timeline"
                  sectionType="timeline"
                  icon="📅"
                  iconTheme="rose"
                  title="Story timeline"
                  sub="Year-by-year milestones. Drag entries within the section."
                  onRemove={removeSection}
                >
                  <>
                    <div className="app-page-about-tl-style-row">
                      <span>Visual style:</span>
                      <div className="app-page-about-tl-style-pills" role="tablist" aria-label="Timeline style">
                        {(["list", "cards"] as TlStyle[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={tlStyle === s ? "is-active" : ""}
                            role="tab"
                            aria-selected={tlStyle === s}
                            onClick={() => setTlStyle(s)}
                          >
                            {s === "list" ? "List (alternating)" : "Cards"}
                          </button>
                        ))}
                      </div>
                      <span style={{ marginLeft: "auto" }}>{INIT_TIMELINE.length} milestones</span>
                    </div>
                    <div className="app-page-about-timeline-editor">
                      {INIT_TIMELINE.map((entry) => (
                        <div key={entry.id} className="app-page-about-tl-entry">
                          <span className="app-page-about-tl-grip" aria-label="Drag to reorder"><GripSvg /></span>
                          <input className="app-page-about-tl-year" type="text" defaultValue={entry.year} />
                          <div className="app-page-about-tl-fields">
                            <input className="app-page-about-tl-title-input" type="text" defaultValue={entry.title} />
                            <textarea className="app-page-about-tl-desc-input" rows={2} defaultValue={entry.desc} />
                          </div>
                          <div className="app-page-about-tl-actions">
                            {/* TODO: wire to admin pages API */}
                            <button className="app-page-about-iconbtn" type="button" aria-label="Add photo">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                              </svg>
                            </button>
                            <button className="app-page-about-iconbtn" type="button" aria-label="Remove milestone">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-about-tl-add" type="button" style={{ marginTop: 10 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add milestone
                    </button>
                  </>
                </SecCard>

                {/* ── Press / quotes section (Creator+) ── */}
                <SecCard
                  sectionId="press"
                  sectionType="press"
                  icon="📰"
                  iconTheme="slate"
                  title={
                    <>
                      Press / quotes{" "}
                      <span className="app-page-about-sec-tier-badge app-page-about-tier-creator">⭐ Creator</span>
                    </>
                  }
                  sub="2–3 quote cards with attribution. Renders as a carousel on the public page."
                  onRemove={removeSection}
                >
                  <>
                    <div className="app-page-about-quotes-grid">
                      {quotes.map((q) => (
                        <div key={q.id} className="app-page-about-quote-card">
                          <button
                            className="app-page-about-iconbtn app-page-about-qc-remove"
                            type="button"
                            aria-label="Remove quote"
                            style={{ position: "absolute", top: 6, right: 6 }}
                            onClick={() => removeQuote(q.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                          <textarea className="app-page-about-qc-text" defaultValue={q.text} />
                          <div className="app-page-about-qc-attribution">
                            <span
                              className={`app-page-about-sec-icon${q.iconTheme ? " " + q.iconTheme : ""}`}
                              style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, width: 24, height: 24, borderRadius: 6 }}
                            >
                              {q.initials}
                            </span>
                            <input className="app-page-about-qc-attr-input" type="text" defaultValue={q.attribution} />
                          </div>
                        </div>
                      ))}
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-about-highlight-add" type="button" style={{ aspectRatio: "auto", minHeight: 110 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add quote
                      </button>
                    </div>
                    <TierHint>
                      Press / quotes is part of the <b>Creator</b> plan (Free is limited to the first 4 sections of any About page). We&apos;ll prompt to upgrade when you save if it&apos;s still here.
                    </TierHint>
                  </>
                </SecCard>

                {/* ── Contact CTA section ── */}
                <SecCard
                  sectionId="contact"
                  sectionType="contact"
                  icon="✉️"
                  title="Contact CTA"
                  sub={`A "Get in touch" button at the bottom of the page.`}
                  onRemove={removeSection}
                >
                  <>
                    <div className="app-page-about-cta-fields">
                      <div className="app-page-about-field" style={{ margin: 0 }}>
                        <label className="app-page-about-field-label" htmlFor="about-cta-label">Button label</label>
                        <div className="app-page-about-field-prefix-wrap">
                          <input id="about-cta-label" type="text" defaultValue="Work with me" />
                          {/* TODO: wire to admin pages API */}
                          <button className="app-page-about-field-suffix-action" type="button">✨ Suggest</button>
                        </div>
                      </div>
                      <div className="app-page-about-field" style={{ margin: 0 }}>
                        <label className="app-page-about-field-label" htmlFor="about-cta-target">Where it goes</label>
                        <select className="app-page-about-field-select" id="about-cta-target" defaultValue="contact">
                          <option value="contact">Contact page (tadaify.com/{handle}/contact)</option>
                          <option value="email">External email — mailto:hello@alexandrasilva.com</option>
                          <option value="url">External URL</option>
                          <option value="booking">Booking link (Calendly / Cal.com)</option>
                        </select>
                      </div>
                    </div>
                    <div className="app-page-about-field" style={{ marginTop: 14 }}>
                      <label className="app-page-about-field-label">
                        Button style{" "}
                        <span className="app-page-about-sec-tier-badge app-page-about-tier-pro">✨ Pro</span>
                        <span className="app-page-about-field-hint"> custom button styles unlock branded shapes</span>
                      </label>
                      <div className="app-page-about-cta-style-row">
                        <div className="app-page-about-cta-style-pills">
                          {(["pill", "rounded", "square", "outline"] as CtaStyle[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={ctaStyle === s ? "is-active" : ""}
                              onClick={() => setCtaStyle(s)}
                            >
                              {s === "pill" ? "Pill (default)" : s === "rounded" ? "Rounded square" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Brand colour from theme.</span>
                      </div>
                      <TierHint>
                        Anything other than <b>Pill</b> is part of the <b>Pro</b> plan. We&apos;ll prompt to upgrade when you save if you change it.
                      </TierHint>
                    </div>
                  </>
                </SecCard>

              </div>

              <div className="app-page-about-add-section-row">
                {/* TODO: wire to admin pages API */}
                <button className="app-page-about-add-section-cta" type="button" onClick={() => setPickerOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add section
                </button>
              </div>
            </>
          ) : (
            <div className="app-page-about-empty-state">
              <div className="app-page-about-es-emoji" aria-hidden="true">👋</div>
              <h3>Tell visitors who you are</h3>
              <p>Build your About page section by section — hero photo, bio, highlights, story timeline. Or pick a starter template and tweak it.</p>
              <div className="app-page-about-es-actions">
                {/* TODO: wire to admin pages API */}
                <button className="app-page-about-btn app-page-about-btn-primary" type="button" onClick={() => setPickerOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add your first section
                </button>
                <button className="app-page-about-btn app-page-about-btn-ghost" type="button" onClick={() => setPickerOpen(true)}>
                  ✨ Use a starter template
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="app-page-about-save-bar" role="status" aria-live="polite">
        <span className="app-page-about-save-status">
          <span className="app-page-about-save-dot" aria-hidden="true" />
          Auto-saved 2 min ago
        </span>
        <span className="app-page-about-save-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-about-btn app-page-about-btn-ghost app-page-about-btn-sm" type="button">Discard</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-about-btn app-page-about-btn-primary app-page-about-btn-sm" type="button">Save changes</button>
      </div>

      {/* ── Add section modal (centered, NEVER a drawer) ── */}
      {pickerOpen && (
        <AddSectionModal
          onClose={() => setPickerOpen(false)}
          onAdd={addSection}
        />
      )}

    </div>
  );
}
