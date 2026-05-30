/**
 * AppPageBlog — Pages → Blog page-level editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-blog.html (1408 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title, slug, publish toggle, RSS toggle,
 *      page background swatches, SEO expander (meta title, description, OG image).
 *   2. Layout — card layout select, posts per page, sort order, show-author toggle.
 *   3. Administration redirect banner — links to AdminBlog.
 *   4. Post composer modal — cover, title, slug, body (rich-text toolbar), tags,
 *      author (Business gate), schedule (Pro gate).
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All publish/save/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement } from "react";

interface AppPageBlogProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = "live" | "draft" | "scheduled";
type SortOrder  = "newest" | "oldest" | "manual";
type CardLayout = "cards" | "list" | "magazine";
type Tab        = "all" | "published" | "drafts" | "scheduled";

// ─── Demo data ────────────────────────────────────────────────────────────────

interface DemoPost {
  thumb: string;
  emoji: string;
  title: string;
  status: PostStatus;
  meta: string;
  tags: string[];
}

const DEMO_POSTS: DemoPost[] = [
  {
    thumb: "t-warm",
    emoji: "📝",
    title: "10 morning habits of high-energy women",
    status: "live",
    meta: "4 days ago · 6 min read",
    tags: ["habits", "mindset"],
  },
  {
    thumb: "t-rose",
    emoji: "💪",
    title: "Why I stopped chasing PRs (and what I do instead)",
    status: "live",
    meta: "2 weeks ago · 8 min read",
    tags: ["training"],
  },
  {
    thumb: "t-indigo",
    emoji: "🌅",
    title: "A 5-day reset for when training feels heavy",
    status: "scheduled",
    meta: "Goes live Tue, May 5 · 8:00",
    tags: ["recovery"],
  },
  {
    thumb: "t-emerald",
    emoji: "🥬",
    title: "[Draft] Macro tracking without losing your weekend",
    status: "draft",
    meta: "Last edited yesterday by you",
    tags: ["nutrition"],
  },
  {
    thumb: "t-slate",
    emoji: "🌙",
    title: "Sleep first, supplements second",
    status: "live",
    meta: "1 month ago · 5 min read · 1.2k reads",
    tags: ["recovery", "mindset"],
  },
];

const CHIP_MAP: Record<PostStatus, { cls: string; label: string }> = {
  live:      { cls: "app-page-blog-chip-live",      label: "Published" },
  draft:     { cls: "app-page-blog-chip-draft",     label: "Draft" },
  scheduled: { cls: "app-page-blog-chip-scheduled", label: "Scheduled" },
};

// ─── Toggle switch atom ───────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-blog-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

// ─── Toggle row atom ──────────────────────────────────────────────────────────

function ToggleRow({
  name,
  sub,
  defaultOn = false,
}: {
  name: string;
  sub: ReactElement | string;
  defaultOn?: boolean;
}): ReactElement {
  return (
    <div className="app-page-blog-row-toggle">
      <div>
        <div className="app-page-blog-rt-name">{name}</div>
        <div className="app-page-blog-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

// ─── Swatch row atom ──────────────────────────────────────────────────────────

const PAGE_SWATCHES = [
  { style: "var(--bg)",                                          label: "Inherit theme" },
  { style: "#FFFFFF",                                            label: "White" },
  { style: "#F8F4EE",                                            label: "Warm cream" },
  { style: "#1F2937",                                            label: "Slate" },
  { style: "#0B0F1E",                                            label: "Dark canvas" },
  { style: "linear-gradient(135deg,#FDE68A,#F59E0B)",            label: "Sunrise" },
  { style: "linear-gradient(135deg,#6366F1,#8B5CF6)",            label: "Indigo" },
  { style: "linear-gradient(135deg,#0F172A,#334155)",            label: "Nightfall" },
];

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-blog-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-blog-swatch${sel === i ? " is-selected" : ""}`}
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

// ─── Post composer modal ──────────────────────────────────────────────────────

function PostComposerModal({ mode, onClose }: { mode: "new" | "edit"; onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-blog-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-pm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-blog-modal">

        {/* Head */}
        <div className="app-page-blog-modal-head">
          <h3 id="blog-pm-title">{mode === "edit" ? "Edit post" : "New post"}</h3>
          <span className="app-page-blog-head-spacer" />
          <span className="app-page-blog-chip app-page-blog-chip-draft">Draft · auto-saving</span>
          <button
            className="app-page-blog-iconbtn"
            type="button"
            aria-label="Close (Esc)"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="app-page-blog-modal-body">

          {/* Cover image */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label">
              Cover image <span className="app-page-blog-field-hint">recommended 1600×900</span>
            </label>
            <div className="app-page-blog-cover-preview">
              <span className="app-page-blog-crop-hint">Crop to 16:9</span>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-blog-replace-btn" type="button">Replace</button>
            </div>
          </div>

          {/* Title */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label" htmlFor="blog-pm-title-input">Title</label>
            <div className="app-page-blog-field-prefix-wrap">
              <input
                id="blog-pm-title-input"
                type="text"
                defaultValue="A 5-day reset for when training feels heavy"
              />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-blog-field-suffix-action" type="button">✨ Suggest</button>
            </div>
          </div>

          {/* Slug */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label" htmlFor="blog-pm-slug">
              URL slug <span className="app-page-blog-field-hint">auto-filled · editable until first publish</span>
            </label>
            <div className="app-page-blog-field-prefix-wrap">
              <span className="app-page-blog-field-prefix">…/blog/</span>
              <input id="blog-pm-slug" type="text" defaultValue="5-day-reset-for-heavy-training" />
            </div>
          </div>

          {/* Body */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label" htmlFor="blog-pm-body">Body</label>
            <div className="app-page-blog-rt-toolbar" role="toolbar" aria-label="Formatting">
              <button type="button" className="app-page-blog-rt-btn" aria-label="Bold" title="Bold (Ctrl+B)"><b>B</b></button>
              <button type="button" className="app-page-blog-rt-btn" aria-label="Italic" title="Italic (Ctrl+I)"><i>I</i></button>
              <span className="app-page-blog-rt-sep" />
              <button type="button" className="app-page-blog-rt-btn" aria-label="Heading" title="Heading">H</button>
              <button type="button" className="app-page-blog-rt-btn" aria-label="Quote" title="Quote">❝</button>
              <button type="button" className="app-page-blog-rt-btn" aria-label="Code block" title="Code block">{"{ }"}</button>
              <span className="app-page-blog-rt-sep" />
              <button type="button" className="app-page-blog-rt-btn" aria-label="Link" title="Link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
              <button type="button" className="app-page-blog-rt-btn" aria-label="Insert image" title="Insert image">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <span className="app-page-blog-rt-sep" />
              <button type="button" className="app-page-blog-rt-btn" aria-label="Bullet list" title="Bullet list">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
                </svg>
              </button>
              <button type="button" className="app-page-blog-rt-btn" aria-label="Numbered list" title="Numbered list">1.</button>
              <span className="app-page-blog-rt-sep app-page-blog-rt-sep-push" />
              {/* TODO: wire to admin pages API */}
              <button type="button" className="app-page-blog-rt-btn" aria-label="Generate with AI" title="Generate paragraph with AI">✨</button>
            </div>
            <textarea
              id="blog-pm-body"
              className="app-page-blog-rt-area"
              defaultValue={
                "Some weeks the bar feels heavier than it should. Sleep slips, work piles up, motivation thins. Trying to grind through it usually costs you more than backing off would.\n\nHere's the 5-day reset I run when training stops feeling good — it brings me back without losing the base I built.\n\nDay 1: cut volume by 50%. Same lifts, half the sets. Eat to maintenance. Sleep 9 hours…"
              }
            />
          </div>

          {/* Tags */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label">
              Tags <span className="app-page-blog-field-hint">type and press Enter</span>
            </label>
            <div className="app-page-blog-tags-input">
              <span className="app-page-blog-tag-pill">
                recovery{" "}
                <button className="app-page-blog-tag-x" type="button" aria-label="Remove tag recovery">×</button>
              </span>
              <span className="app-page-blog-tag-pill">
                training{" "}
                <button className="app-page-blog-tag-x" type="button" aria-label="Remove tag training">×</button>
              </span>
              <input type="text" placeholder="Add a tag…" aria-label="Add a tag" />
            </div>
          </div>

          {/* Author — Business gate, fully visible per no-blur-premium */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label">Author</label>
            <div className="app-page-blog-author-row">
              <div className="app-page-blog-av" aria-hidden="true">A</div>
              <select aria-label="Author" defaultValue="self">
                <option value="self">Alexandra Silva (you)</option>
                <option value="maya">Maya Chen — Co-coach</option>
                <option value="jordan">Jordan Park — Guest contributor</option>
              </select>
              <span
                className="app-page-blog-chip"
                style={{ background: "rgba(245,158,11,0.14)", color: "#92400E", border: "1px solid rgba(245,158,11,0.32)" }}
              >
                🔒 Business
              </span>
            </div>
            <div className="app-page-blog-tier-hint">
              <span className="app-page-blog-th-icon" aria-hidden="true">💡</span>
              Switching author is part of <b>Team</b> on the Business plan. We&apos;ll prompt to upgrade when you save if you pick someone other than yourself.
            </div>
          </div>

          {/* Schedule */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label">
              Schedule publication{" "}
              <span className="app-page-blog-field-hint">leave blank to publish now</span>
            </label>
            <div className="app-page-blog-field-row">
              <input className="app-page-blog-field-input" type="date" defaultValue="2026-05-05" aria-label="Schedule date" />
              <input className="app-page-blog-field-input" type="time" defaultValue="08:00" aria-label="Schedule time" />
            </div>
            <div className="app-page-blog-tier-hint">
              <span className="app-page-blog-th-icon" aria-hidden="true">💡</span>
              Scheduling beyond the next 7 days is a <b>Pro</b> perk. We&apos;ll prompt to upgrade at save time if your selected date is more than 7 days out.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="app-page-blog-modal-foot">
          <button
            className="app-page-blog-btn app-page-blog-btn-ghost app-page-blog-btn-sm"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-blog-btn app-page-blog-btn-danger-ghost app-page-blog-btn-sm" type="button">
            Delete draft
          </button>
          <span className="app-page-blog-foot-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-blog-btn app-page-blog-btn-ghost app-page-blog-btn-sm" type="button">
            Save as draft
          </button>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-blog-btn app-page-blog-btn-warm app-page-blog-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Schedule for May 5
          </button>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-blog-btn app-page-blog-btn-primary app-page-blog-btn-sm" type="button">
            Publish now →
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Post row ─────────────────────────────────────────────────────────────────

function PostRow({
  post,
  onEdit,
}: {
  post: DemoPost;
  onEdit: () => void;
}): ReactElement {
  const chip = CHIP_MAP[post.status];
  return (
    <div className="app-page-blog-post-row">
      {/* Grip + thumb */}
      <div className="app-page-blog-pr-grip-col">
        <span className="app-page-blog-pr-handle" aria-label="Drag to reorder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/>
            <circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>
          </svg>
        </span>
        <div className={`app-page-blog-pr-thumb ${post.thumb}`} aria-hidden="true">{post.emoji}</div>
      </div>

      {/* Meta */}
      <div className="app-page-blog-pr-meta">
        <p className="app-page-blog-pr-title">{post.title}</p>
        <div className="app-page-blog-pr-line">
          <span className={`app-page-blog-chip ${chip.cls}`}>{chip.label}</span>
          <span className="app-page-blog-pr-dot" aria-hidden="true" />
          <span>{post.meta}</span>
          {post.tags.map((t) => (
            <span className="app-page-blog-pr-tag" key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="app-page-blog-pr-actions">
        {/* TODO: wire to admin pages API */}
        <button
          className="app-page-blog-btn app-page-blog-btn-ghost app-page-blog-btn-xs"
          type="button"
          onClick={onEdit}
        >
          {post.status === "draft" ? "Continue" : "Edit"}
        </button>
        <button className="app-page-blog-iconbtn" type="button" aria-label="More options">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageBlog({ handle }: AppPageBlogProps): ReactElement {
  const [activeTab, setActiveTab]       = useState<Tab>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"new" | "edit">("new");

  const openNew  = () => { setComposerMode("new");  setComposerOpen(true); };
  const openEdit = () => { setComposerMode("edit"); setComposerOpen(true); };

  const tabCounts: Record<Tab, number> = { all: 23, published: 18, drafts: 3, scheduled: 2 };

  return (
    <div className="app-page-blog-root" aria-labelledby="app-page-blog-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-blog-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-blog-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-blog-crumb-sep">/</span>
        <span className="app-page-blog-crumb-here">Blog</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-blog-page-head">
        <div>
          <h1 id="app-page-blog-h1" className="app-page-blog-h1">
            <span className="app-page-blog-ph-emoji" aria-hidden="true">📝</span>
            Blog
          </h1>
          <p className="app-page-blog-sub">
            Publish essays, devlogs, tutorials or journals on your own page. Visitors can subscribe to the RSS feed.
          </p>
        </div>
        <div className="app-page-blog-actions">
          <span className="app-page-blog-url-pill">
            <span className="app-page-blog-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>blog</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-blog-btn app-page-blog-btn-ghost app-page-blog-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 1 — Page settings
          ──────────────────────────────────────────────────────────────── */}
      <section className="app-page-blog-section">
        <div className="app-page-blog-section-head">
          <h2>Page settings</h2>
          <span className="app-page-blog-section-sub">
            Title, URL, visibility and SEO for the Blog page itself.
          </span>
        </div>
        <div className="app-page-blog-section-body">

          {/* Title + Slug */}
          <div className="app-page-blog-field-row">
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label" htmlFor="blog-page-title">
                Page title{" "}
                <span className="app-page-blog-field-hint">shown as &lt;h1&gt; on the public blog</span>
              </label>
              <input
                id="blog-page-title"
                className="app-page-blog-field-input"
                type="text"
                defaultValue="Blog"
              />
            </div>
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label" htmlFor="blog-page-slug">
                URL slug{" "}
                <span className="app-page-blog-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-blog-field-prefix-wrap">
                <span className="app-page-blog-field-prefix">tadaify.com/{handle}/</span>
                <input id="blog-page-slug" type="text" defaultValue="blog" />
              </div>
            </div>
          </div>

          {/* Publish + RSS toggles */}
          <div className="app-page-blog-field-row">
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label">Publish</label>
              <ToggleRow
                name="Page is live"
                sub="Visitors can find this blog at the URL above."
                defaultOn
              />
            </div>
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label">RSS feed</label>
              <ToggleRow
                name="Enable RSS"
                sub={<>Serve <span style={{ fontFamily: "var(--font-mono)" }}>/blog/feed.xml</span> for newsreaders.</>}
                defaultOn
              />
            </div>
          </div>

          {/* Background swatches */}
          <div className="app-page-blog-field">
            <label className="app-page-blog-field-label">
              Page background{" "}
              <span className="app-page-blog-field-hint">override theme colour for this page only</span>
            </label>
            <SwatchRow />
          </div>

          {/* SEO expander */}
          <details className="app-page-blog-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7"/>
                <path d="M9 12V7a3 3 0 0 1 6 0v5"/>
                <circle cx="12" cy="17" r="3"/>
              </svg>
              SEO settings{" "}
              <span className="app-page-blog-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-blog-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15"/>
              </svg>
            </summary>
            <div className="app-page-blog-ex-body">
              <div className="app-page-blog-field">
                <label className="app-page-blog-field-label" htmlFor="blog-seo-title">
                  Meta title{" "}
                  <span className="app-page-blog-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-blog-field-prefix-wrap">
                  <input
                    id="blog-seo-title"
                    type="text"
                    defaultValue="Strong Not Skinny — Blog by Alexandra Silva"
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-blog-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-blog-field">
                <label className="app-page-blog-field-label" htmlFor="blog-seo-desc">
                  Meta description{" "}
                  <span className="app-page-blog-field-hint">~155 chars</span>
                </label>
                <div className="app-page-blog-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="blog-seo-desc"
                    className="app-page-blog-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="Honest essays on training, recovery and building strength without burning out. New posts every Tuesday."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-blog-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-blog-field">
                <label className="app-page-blog-field-label">
                  OG image <span className="app-page-blog-field-hint">1200×630 — shown when shared on social</span>
                </label>
                {/* TODO: wire to admin pages API */}
                <div className="app-page-blog-cover-drop" role="button" tabIndex={0} aria-label="Upload OG image">
                  <span className="app-page-blog-cd-emoji">🖼</span>
                  <div className="app-page-blog-cd-title">Drop an image, or click to upload</div>
                  <div className="app-page-blog-cd-sub">
                    Or{" "}
                    <span
                      style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}
                    >
                      ✨ generate one with AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 2 — Layout
          ──────────────────────────────────────────────────────────────── */}
      <section className="app-page-blog-section">
        <div className="app-page-blog-section-head">
          <h2>Layout</h2>
          <span className="app-page-blog-section-sub">
            How the post list looks at{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>/{handle}/blog</span>.
          </span>
        </div>
        <div className="app-page-blog-section-body">

          <div className="app-page-blog-field-row">
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label" htmlFor="blog-cfg-layout">Card layout</label>
              <select className="app-page-blog-field-select" id="blog-cfg-layout" defaultValue="cards">
                <option value="cards">Cards — cover image + title + excerpt (recommended)</option>
                <option value="list">List — compact, no cover thumbnail</option>
                <option value="magazine">Magazine — first post hero, rest in 2-column grid</option>
              </select>
            </div>
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label" htmlFor="blog-cfg-pp">Posts per page</label>
              <input
                id="blog-cfg-pp"
                className="app-page-blog-field-input"
                type="number"
                defaultValue={10}
                min={1}
                max={50}
              />
            </div>
          </div>

          <div className="app-page-blog-field-row">
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label" htmlFor="blog-cfg-sort">Sort order</label>
              <select className="app-page-blog-field-select" id="blog-cfg-sort" defaultValue="newest">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="manual">Manual — drag to reorder</option>
              </select>
            </div>
            <div className="app-page-blog-field">
              <label className="app-page-blog-field-label">Show author byline</label>
              <ToggleRow
                name="Display author"
                sub="Avatar + name appear on each card."
                defaultOn
              />
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 3 — Administration redirect banner
          (Pages vs Administration separation — Fix #5)
          ──────────────────────────────────────────────────────────────── */}
      <section
        className="app-page-blog-section"
        style={{
          background: "rgba(99,102,241,0.04)",
          borderColor: "rgba(99,102,241,0.20)",
        }}
      >
        <div className="app-page-blog-section-head" style={{ borderBottom: 0, padding: 18 }}>
          <div style={{ fontSize: 26, flexShrink: 0 }} aria-hidden="true">📝</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              Manage posts in Administration → Blog
            </div>
            <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>
              Day-to-day publishing (write, edit, schedule, comments) lives in the Administration tab. This page is for page-level setup only — theme, layout, SEO.
            </div>
          </div>
          <a
            href="/app?tab=admin"
            className="app-page-blog-btn app-page-blog-btn-primary app-page-blog-btn-sm"
            style={{ flexShrink: 0 }}
          >
            Open Blog admin →
          </a>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 4 — Legacy posts stub (hidden, retained for in-page nav refs)
          ──────────────────────────────────────────────────────────────── */}
      <section className="app-page-blog-section" hidden>
        <div className="app-page-blog-section-head">
          <h2>Posts</h2>
          <span className="app-page-blog-section-sub">[MOVED] — see AdminBlog</span>
          <span className="app-page-blog-head-spacer" />
          {/* TODO: wire to admin pages API */}
          <button
            className="app-page-blog-btn app-page-blog-btn-primary app-page-blog-btn-sm"
            type="button"
            onClick={openNew}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New post
          </button>
        </div>

        <div className="app-page-blog-section-body">

          {/* Toolbar */}
          <div className="app-page-blog-posts-toolbar">
            <div className="app-page-blog-tabs" role="tablist">
              {(["all", "published", "drafts", "scheduled"] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`app-page-blog-tab${activeTab === t ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={activeTab === t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                  <span className="app-page-blog-tab-count">{tabCounts[t]}</span>
                </button>
              ))}
            </div>
            <div className="app-page-blog-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="search" placeholder="Search posts by title…" aria-label="Search posts" />
            </div>
          </div>

          {/* Post rows */}
          <div className="app-page-blog-posts-list">
            {DEMO_POSTS.map((p) => (
              <PostRow key={p.title} post={p} onEdit={openEdit} />
            ))}
          </div>

          {/* Pagination */}
          <div className="app-page-blog-pagination">
            <div className="app-page-blog-pg-meta">
              Showing <b>1–5</b> of <b>23</b> posts
            </div>
            <div className="app-page-blog-pg-controls">
              <button type="button" disabled aria-label="Previous">←</button>
              <button type="button" className="is-current" aria-current="page">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">4</button>
              <button type="button">5</button>
              <button type="button" aria-label="Next">→</button>
            </div>
          </div>

          {/* Empty state */}
          <div className="app-page-blog-empty-state" style={{ display: "none" }}>
            <div className="app-page-blog-es-emoji" aria-hidden="true">📝</div>
            <h3>Write your first post</h3>
            <p>
              Your blog is live but quiet. Start with a quick welcome post — even 3 short paragraphs is enough to get visitors reading and the RSS feed primed.
            </p>
            {/* TODO: wire to admin pages API */}
            <button
              className="app-page-blog-btn app-page-blog-btn-primary"
              type="button"
              onClick={openNew}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create your first post
            </button>
            <span style={{ color: "var(--brand-primary)", fontSize: 13, fontWeight: 600 }}>
              ✨ Or pick a starter template →
            </span>
          </div>

        </div>
      </section>

      {/* ── Post composer modal ── */}
      {composerOpen && (
        <PostComposerModal mode={composerMode} onClose={() => setComposerOpen(false)} />
      )}

    </div>
  );
}
