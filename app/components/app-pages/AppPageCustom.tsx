/**
 * AppPageCustom — Pages → Custom page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-custom.html (1811 LOC)
 *
 * Architecture (DEC-MULTIPAGE-01 + page-type framework):
 *   - Page type id: `custom` — NO opinionated section structure.
 *   - Content = stack of blocks (any of the 12 BLOCK_TYPES), drag-reorderable.
 *   - 6 starter templates pre-populate the block list.
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — inline-editable title, URL slug with collision warning,
 *      publish toggle, show-in-nav toggle, noindex toggle, page background
 *      swatches, SEO expander (meta title, description, auto-OG toggle).
 *   2. Page options — custom domain (Pro), password protection (Pro),
 *      redirect-after (Pro). All visible per no-blur-premium; gated at Save.
 *   3. Page content — draggable block list (filled state: 8 blocks),
 *      empty state with template quick-pick, inline Add-block CTAs.
 *   Block picker modal — 12 block types.
 *   Starter templates modal — 6 ready compositions.
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageCustomProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockFlag = { cls: string; label: string };

interface BlockItem {
  id: string;
  icon: string;
  iconTheme: string;
  name: string;
  typeLabel: string;
  summary: string;
  flags?: BlockFlag[];
}

// ─── Demo blocks (Press kit starter — 8 blocks) ───────────────────────────────

const DEMO_BLOCKS: BlockItem[] = [
  { id: "b1", icon: "📰", iconTheme: "",        name: "Press & media kit",       typeLabel: "Heading",    summary: 'H1 · centered · 48px display font · subtitle: "Everything you need to write about Alexandra Silva."' },
  { id: "b2", icon: "🖼",  iconTheme: "t-rose",  name: "Founder portrait",        typeLabel: "Image",     summary: 'alexandra-portrait-2026.jpg · 1600×1200 · alt "Alexandra Silva, founder, in studio" · centered, max 600px wide' },
  { id: "b3", icon: "📰", iconTheme: "",        name: "Logos & download assets",  typeLabel: "Heading",    summary: 'H2 · "Click any logo to download. SVG and PNG both included."' },
  { id: "b4", icon: "🔗", iconTheme: "t-emerald", name: "Download logos (4 buttons)", typeLabel: "Link",  summary: "Logo · Wordmark · Mono dark · Mono light — each links to assets.alexandra.com/press/...", flags: [{ cls: "is-ab", label: "⚡ A/B active · 312 / 287" }] },
  { id: "b5", icon: "📰", iconTheme: "",        name: "Quick facts about Alexandra", typeLabel: "Heading",  summary: "H2 · centered · serif display" },
  { id: "b6", icon: "📚", iconTheme: "t-warm",  name: "Key facts (5 Q&A)",        typeLabel: "Accordion", summary: '"Founded?" "Where based?" "How many clients?" "Speaking topics?" "Approved bio?"', flags: [{ cls: "is-sched", label: "📅 Scheduled · May 1 – Aug 31" }] },
  { id: "b7", icon: "✉️", iconTheme: "t-slate", name: "Press list signup",        typeLabel: "Newsletter", summary: '"Get press releases first." Provider: Kit · 1,247 subscribers · GDPR consent ON' },
  { id: "b8", icon: "🔗", iconTheme: "t-emerald", name: `"Reach me directly →"`, typeLabel: "Link",      summary: "Pill button · brand-warm · → tadaify.com/alexandra/contact" },
];

const STARTER_TEMPLATES = [
  { slug: "press-kit",    emoji: "📰", name: "Press kit",    sub: "Logos, founder bio, key facts, press signup.", pills: ["Heading", "Image", "Heading", "Link × 4", "Heading", "Accordion", "Newsletter", "Link"] },
  { slug: "speaking",     emoji: "🎤", name: "Speaking",     sub: "Recent talk, topics list, event photos, contact.", pills: ["Heading", "Embedded", "Heading", "Image × 4", "Accordion", "Link"] },
  { slug: "resources",    emoji: "📚", name: "Resources",    sub: "Free downloads + email signup to keep visitors.", pills: ["Heading", "Link × 6", "Divider", "Newsletter"] },
  { slug: "faq",          emoji: "❓", name: "FAQ-style",    sub: "Frequently-asked accordion + contact CTA.", pills: ["Heading", "Accordion × 8", "Link"] },
  { slug: "coming-soon",  emoji: "🌅", name: "Coming soon",  sub: "Hero + countdown + email signup for launch.", pills: ["Heading", "Image", "Countdown", "Newsletter"] },
  { slug: "thank-you",    emoji: "🎉", name: "Thank you",    sub: "Confirmation page after purchase / signup.", pills: ["Heading", "Image", "Heading", "Link × 3"] },
];

const PICKER_BLOCKS = [
  { type: "link",       icon: "🔗",    name: "Link",       desc: "Tappable button to any URL — store, video, profile." },
  { type: "social",     icon: "🌐",    name: "Social",     desc: "Icon row — 30+ platforms, 6 icon styles." },
  { type: "embedded",   icon: "📺",    name: "Embedded",   desc: "Spotify, YouTube, Apple Music, Maps, Calendly…" },
  { type: "video",      icon: "▶️",    name: "Video",      desc: "Native player — MP4, YouTube, Vimeo." },
  { type: "image",      icon: "🖼",     name: "Image",      desc: "Single image with optional caption + click target." },
  { type: "heading",    icon: "📰",    name: "Heading",    desc: "H1 / H2 / H3 with display font + alignment." },
  { type: "divider",    icon: "➖",    name: "Divider",    desc: "Visual separator — line, dots, gap." },
  { type: "newsletter", icon: "✉️",    name: "Newsletter", desc: "Email capture — Kit, Beehiiv, Mailchimp, Klaviyo, Sheets…" },
  { type: "countdown",  icon: "⏳",    name: "Countdown",  desc: "Timer to a launch, drop or live event." },
  { type: "product",    icon: "🛍",     name: "Product",    desc: "Link to your Shopify, Stripe, Etsy, Gumroad…" },
  { type: "accordion",  icon: "📚",    name: "Accordion",  desc: "Collapsible Q&A — perfect for FAQ + key facts." },
  { type: "html",       icon: "</>" ,  name: "Custom HTML", desc: "Drop arbitrary HTML — for advanced creators." },
];

const RESERVED_SLUGS = ["blog", "about", "portfolio", "subscribe", "contact", "faq", "book", "admin"];

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

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-custom-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub }: { name: ReactElement | string; sub: string }): ReactElement {
  return (
    <div className="app-page-custom-row-toggle">
      <div>
        <div className="app-page-custom-rt-name">{name}</div>
        <div className="app-page-custom-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={false} />
    </div>
  );
}

function ToggleRowOn({ name, sub }: { name: ReactElement | string; sub: string }): ReactElement {
  return (
    <div className="app-page-custom-row-toggle">
      <div>
        <div className="app-page-custom-rt-name">{name}</div>
        <div className="app-page-custom-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={true} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-custom-tier-hint">
      <span className="app-page-custom-th-icon" aria-hidden="true">💡</span>
      <span>{children}</span>
    </div>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-custom-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-custom-swatch${sel === i ? " is-selected" : ""}`}
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

// ─── Block row ────────────────────────────────────────────────────────────────

function BlockRow({ block }: { block: BlockItem }): ReactElement {
  return (
    <div className="app-page-custom-block-row" data-block-id={block.id}>
      <span className="app-page-custom-br-grip" aria-label="Drag to reorder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
          <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
        </svg>
      </span>
      <div className={`app-page-custom-br-icon${block.iconTheme ? " " + block.iconTheme : ""}`} aria-hidden="true">{block.icon}</div>
      <div className="app-page-custom-br-meta">
        <div className="app-page-custom-br-name">
          {block.name}
          <span className="app-page-custom-br-type-pill">{block.typeLabel}</span>
        </div>
        <div className="app-page-custom-br-summary">{block.summary}</div>
        {block.flags && block.flags.length > 0 && (
          <div className="app-page-custom-br-flags">
            {block.flags.map((f) => (
              <span key={f.label} className={`app-page-custom-br-flag ${f.cls}`}>{f.label}</span>
            ))}
          </div>
        )}
      </div>
      <div className="app-page-custom-br-actions">
        {/* TODO: wire to admin pages API */}
        <button className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-xs" type="button">Edit</button>
        <button className="app-page-custom-iconbtn" type="button" aria-label="Block options">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Block picker modal ───────────────────────────────────────────────────────

function BlockPickerModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-custom-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-pm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-custom-modal app-page-custom-modal-lg">
        <div className="app-page-custom-modal-head">
          <h3 id="custom-pm-title">Add a block</h3>
          <span className="app-page-custom-modal-sub">Pick from the 12 block types</span>
          <span className="app-page-custom-head-spacer" />
          <button className="app-page-custom-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-custom-modal-body">
          <div className="app-page-custom-picker-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search blocks — link, video, image, FAQ…" aria-label="Search block types" />
          </div>
          <div className="app-page-custom-picker-grid">
            {PICKER_BLOCKS.map((b) => (
              <button key={b.type} className="app-page-custom-picker-card" type="button">
                <div className="app-page-custom-pc-icon">{b.icon}</div>
                <div className="app-page-custom-pc-name">{b.name}</div>
                <div className="app-page-custom-pc-desc">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-custom-modal-foot">
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Drag any block to reorder once added.</span>
          <span className="app-page-custom-foot-spacer" />
          <button className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Starter templates modal ──────────────────────────────────────────────────

function StarterTemplatesModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-custom-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-tm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-custom-modal app-page-custom-modal-lg">
        <div className="app-page-custom-modal-head">
          <h3 id="custom-tm-title">Starter templates</h3>
          <span className="app-page-custom-modal-sub">Pre-built block compositions you can edit.</span>
          <span className="app-page-custom-head-spacer" />
          <button className="app-page-custom-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-custom-modal-body">
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "0 0 16px" }}>
            Picking a template <b>replaces</b> your current block list. Your page settings (title, slug, theme) stay as they are.
          </p>
          <div className="app-page-custom-templ-grid">
            {STARTER_TEMPLATES.map((t) => (
              <button key={t.slug} className="app-page-custom-templ-card" type="button">
                <div className="app-page-custom-tc-head">
                  <div className="app-page-custom-tc-emoji">{t.emoji}</div>
                  <div>
                    <div className="app-page-custom-tc-name">{t.name}</div>
                    <div className="app-page-custom-tc-sub">{t.sub}</div>
                  </div>
                </div>
                <div className="app-page-custom-tc-blocks">
                  {t.pills.map((p) => (
                    <span key={p} className="app-page-custom-tc-block-pill">{p}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-custom-modal-foot">
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>All templates are starting points — edit any block after.</span>
          <span className="app-page-custom-foot-spacer" />
          <button className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageCustom({ handle }: AppPageCustomProps): ReactElement {
  const [title, setTitle]               = useState("Press kit");
  const [slug, setSlug]                 = useState("press-kit");
  const [slugWarn, setSlugWarn]         = useState(false);
  const [slugWarnText, setSlugWarnText] = useState("");
  const [pickerOpen, setPickerOpen]     = useState(false);
  const [templOpen, setTemplOpen]       = useState(false);
  const [hasBlocks]                     = useState(true);   // toggled by demo toolbar in mockup; always filled here

  const onSlugChange = (raw: string) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setSlug(clean || "untitled");
    if (RESERVED_SLUGS.includes(clean)) {
      setSlugWarn(true);
      setSlugWarnText(`"${clean}" is reserved for a built-in page template. Pick a different slug.`);
    } else {
      setSlugWarn(false);
    }
  };

  return (
    <div className="app-page-custom-root" aria-labelledby="app-page-custom-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-custom-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-custom-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-custom-crumb-sep">/</span>
        <span className="app-page-custom-crumb-here">{title}</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-custom-page-head">
        <div>
          <h1 id="app-page-custom-h1" className="app-page-custom-h1">
            <span className="app-page-custom-ph-emoji" aria-hidden="true">🧩</span>
            <input
              id="custom-page-title"
              className="app-page-custom-title-inline"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Page title"
            />
          </h1>
          <p className="app-page-custom-sub">
            A blank page you build from the block library — use it for press kits, free downloads, FAQs, speaking, anything you need a dedicated URL for.
          </p>
        </div>
        <div className="app-page-custom-actions">
          <span className="app-page-custom-url-pill">
            <span className="app-page-custom-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>{slug}</b>
          </span>
          <button
            className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-sm"
            type="button"
            onClick={() => setTemplOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Use template
          </button>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-custom-btn app-page-custom-btn-primary app-page-custom-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 1 — Page settings
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-custom-section">
        <div className="app-page-custom-section-head">
          <h2>Page settings</h2>
          <span className="app-page-custom-section-sub">URL, visibility, theme and SEO for this page.</span>
        </div>
        <div className="app-page-custom-section-body">

          {/* Slug + Publish */}
          <div className="app-page-custom-field-row">
            <div className="app-page-custom-field">
              <label className="app-page-custom-field-label" htmlFor="custom-page-slug">
                URL slug{" "}
                <span className="app-page-custom-field-hint">letters, numbers, hyphens · must be unique on your site</span>
              </label>
              <div className="app-page-custom-field-prefix-wrap">
                <span className="app-page-custom-field-prefix">tadaify.com/{handle}/</span>
                <input
                  id="custom-page-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                />
              </div>
              {slugWarn && (
                <div className="app-page-custom-slug-warn">
                  <span aria-hidden="true">⚠️</span>
                  <span>{slugWarnText}</span>
                </div>
              )}
            </div>
            <div className="app-page-custom-field">
              <label className="app-page-custom-field-label">Publish</label>
              <ToggleRowOn
                name="Page is live"
                sub="Visitors can find this page at the URL above."
              />
            </div>
          </div>

          {/* Nav + noindex */}
          <div className="app-page-custom-field-row">
            <div className="app-page-custom-field">
              <label className="app-page-custom-field-label">Show in nav menu</label>
              <ToggleRowOn
                name="Add to homepage nav"
                sub="Visitors see a link to this page from your main page."
              />
            </div>
            <div className="app-page-custom-field">
              <label className="app-page-custom-field-label">Hide from search engines</label>
              <ToggleRow
                name={<>Add <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>noindex</span> meta</>}
                sub="Useful for private press kits or unlisted pages."
              />
            </div>
          </div>

          {/* Background swatches */}
          <div className="app-page-custom-field" style={{ marginTop: 14 }}>
            <label className="app-page-custom-field-label">
              Page background{" "}
              <span className="app-page-custom-field-hint">override theme colour for this page only</span>
            </label>
            <SwatchRow />
          </div>

          {/* SEO expander */}
          <details className="app-page-custom-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
              </svg>
              SEO settings{" "}
              <span className="app-page-custom-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-custom-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-custom-ex-body">
              <div className="app-page-custom-field">
                <label className="app-page-custom-field-label" htmlFor="custom-seo-title">
                  Meta title{" "}
                  <span className="app-page-custom-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-custom-field-prefix-wrap">
                  <input id="custom-seo-title" type="text" defaultValue="Press kit — Alexandra Silva" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-custom-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-custom-field">
                <label className="app-page-custom-field-label" htmlFor="custom-seo-desc">
                  Meta description{" "}
                  <span className="app-page-custom-field-hint">~155 chars</span>
                </label>
                <div className="app-page-custom-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="custom-seo-desc"
                    className="app-page-custom-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="Logos, founder photos, key facts and approved bios — everything journalists, podcasters and partners need."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-custom-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-custom-field">
                <label className="app-page-custom-field-label">
                  OG image{" "}
                  <span className="app-page-custom-field-hint">1200×630 — shown when shared on social</span>
                </label>
                <div className="app-page-custom-row-toggle" style={{ padding: "8px 12px" }}>
                  <div>
                    <div className="app-page-custom-rt-name">Auto-generated from page title</div>
                    <div className="app-page-custom-rt-sub">
                      {/* TODO: wire to admin pages API */}
                      Or <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>upload your own →</span>
                    </div>
                  </div>
                  <Toggle defaultOn={true} />
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — Page options (Pro power features; visible per no-blur-premium)
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-custom-section">
        <div className="app-page-custom-section-head">
          <h2>Page options</h2>
          <span className="app-page-custom-section-sub">Power features — fully visible. Gated only at Save.</span>
        </div>
        <div className="app-page-custom-section-body">

          {/* Custom domain */}
          <div className="app-page-custom-field">
            <label className="app-page-custom-field-label">Custom domain for this page</label>
            <div className="app-page-custom-field-prefix-wrap">
              <input id="custom-page-domain" type="text" placeholder="e.g. presskit.alexandra.com" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-custom-field-suffix-action" type="button">Verify DNS</button>
            </div>
            <TierHint>
              Per-page custom domain points just this page (e.g. <b>presskit.yourbrand.com</b>) at tadaify. Available on <b>Pro</b> — we&apos;ll prompt to upgrade if you save with a value here.
            </TierHint>
          </div>

          {/* Password protection */}
          <div className="app-page-custom-field">
            <label className="app-page-custom-field-label">Password protection</label>
            <div className="app-page-custom-row-toggle">
              <div>
                <div className="app-page-custom-rt-name">Require a password to view</div>
                <div className="app-page-custom-rt-sub">Visitors get a "Locked" screen until they enter the right password. Useful for private press kits, client previews and pre-launch reveals.</div>
              </div>
              <Toggle defaultOn={false} />
            </div>
            <div className="app-page-custom-field-prefix-wrap" style={{ marginTop: 8 }}>
              <span className="app-page-custom-field-prefix" style={{ fontFamily: "var(--font-sans)" }}>🔑</span>
              <input id="custom-page-password" type="text" defaultValue="atelier-2026" placeholder="Set a page password" />
            </div>
            <TierHint>
              Page passwords are a <b>Pro</b> perk. The password screen is fully themeable.
            </TierHint>
          </div>

          {/* Redirect-after */}
          <div className="app-page-custom-field">
            <label className="app-page-custom-field-label">Redirect after viewing</label>
            <div className="app-page-custom-field-row">
              <div className="app-page-custom-field-prefix-wrap" style={{ marginBottom: 0 }}>
                <span className="app-page-custom-field-prefix">After</span>
                <input id="custom-redirect-secs" type="number" defaultValue={0} min={0} max={600} />
                <span className="app-page-custom-field-prefix" style={{ paddingRight: 12 }}>seconds</span>
              </div>
              <div className="app-page-custom-field-prefix-wrap" style={{ marginBottom: 0 }}>
                <span className="app-page-custom-field-prefix" style={{ fontFamily: "var(--font-sans)" }}>↗</span>
                <input id="custom-redirect-url" type="text" placeholder="https://store.alexandra.com" />
              </div>
            </div>
            <TierHint>
              Redirect-after is a <b>Pro</b> perk. Leave seconds at <b>0</b> to keep the page sticky.
            </TierHint>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — Page content (block list)
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-custom-section">
        <div className="app-page-custom-section-head">
          <h2>Page content</h2>
          <span className="app-page-custom-section-sub">Drag to reorder. Click any block to edit.</span>
          <span className="app-page-custom-head-spacer" />
          <button
            className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-sm"
            type="button"
            onClick={() => setTemplOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Starter templates
          </button>
          {/* TODO: wire to admin pages API */}
          <button
            className="app-page-custom-btn app-page-custom-btn-primary app-page-custom-btn-sm"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add block
          </button>
        </div>

        <div className="app-page-custom-section-body app-page-custom-section-body-lg">

          {hasBlocks ? (
            <>
              <div className="app-page-custom-blocklist" id="custom-blocklist">
                {DEMO_BLOCKS.map((block, idx) => (
                  <div key={block.id}>
                    <BlockRow block={block} />
                    {idx === 5 && (
                      <button
                        className="app-page-custom-add-block-row"
                        type="button"
                        onClick={() => setPickerOpen(true)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add block here
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                {/* TODO: wire to admin pages API */}
                <button
                  className="app-page-custom-add-block-row"
                  type="button"
                  style={{ fontSize: 14, padding: 14 }}
                  onClick={() => setPickerOpen(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add another block
                </button>
              </div>
            </>
          ) : (
            <div className="app-page-custom-empty-state">
              <div className="app-page-custom-es-emoji" aria-hidden="true">🧩</div>
              <h3>Start with a blank canvas — or pick a starter</h3>
              <p>This page is published but empty. Add blocks one at a time, or grab a ready-made composition you can edit.</p>
              <div className="app-page-custom-es-actions">
                {/* TODO: wire to admin pages API */}
                <button className="app-page-custom-btn app-page-custom-btn-primary" type="button" onClick={() => setPickerOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add your first block
                </button>
                <button className="app-page-custom-btn app-page-custom-btn-ghost" type="button" onClick={() => setTemplOpen(true)}>
                  Browse starter templates
                </button>
              </div>
              <div className="app-page-custom-es-templates">
                {STARTER_TEMPLATES.map((t) => (
                  <button key={t.slug} className="app-page-custom-es-templ-card" type="button">
                    <span className="app-page-custom-es-templ-emoji">{t.emoji}</span>
                    <div>
                      <div className="app-page-custom-es-templ-name">{t.name}</div>
                      <div className="app-page-custom-es-templ-sub">{t.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="app-page-custom-save-bar" role="region" aria-label="Save changes">
        <span className="app-page-custom-sb-status" id="custom-sb-status">
          <span className="app-page-custom-sb-dot" aria-hidden="true" />
          All changes saved · 2 sec ago
        </span>
        <span className="app-page-custom-sb-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-custom-btn app-page-custom-btn-ghost app-page-custom-btn-sm" type="button">Discard changes</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-custom-btn app-page-custom-btn-primary app-page-custom-btn-sm" type="button">Save changes</button>
      </div>

      {/* ── Modals (centered, NEVER drawers) ── */}
      {pickerOpen && <BlockPickerModal onClose={() => setPickerOpen(false)} />}
      {templOpen  && <StarterTemplatesModal onClose={() => setTemplOpen(false)} />}

    </div>
  );
}
