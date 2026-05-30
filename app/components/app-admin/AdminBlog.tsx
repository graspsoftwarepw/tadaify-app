/**
 * AdminBlog — Administration → Blog publishing sub-page.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-blog.html (702 LOC)
 *
 * Three display states:
 *   "no-page"  — Blog page not yet created (empty state + explainer)
 *   "empty"    — Blog page exists but has no posts
 *   "filled"   — Blog page with posts list + comments + composer modal
 *
 * All publish/save/upload/import actions stubbed — TODO: wire to admin API.
 */

import { useState } from "react";

interface AdminBlogProps {
  handle: string;
}

// ─── Composer Modal ───────────────────────────────────────────────────────────

function ComposerModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="admin-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-blog-composer-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3 id="admin-blog-composer-title">New post</h3>
          <span className="admin-chip admin-chip-draft">○ Draft</span>
          <button className="admin-iconbtn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="admin-modal-body">
          {/* Cover uploader */}
          <div className="admin-cover-uploader" tabIndex={0} role="button" aria-label="Upload cover image">
            <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
            <b>Drop cover image here</b> or click to upload
            {/* TODO: wire to admin API */}
            <div style={{ fontSize: 12, marginTop: 4 }}>PNG / JPG / WebP · max 5MB · 1600×900 recommended</div>
          </div>
          <div style={{ marginTop: 16 }} />

          {/* Title */}
          <div className="admin-field">
            <label className="admin-field-label">Title</label>
            <input className="admin-field-input" type="text" placeholder="A title that earns the click…" />
          </div>

          {/* Slug + Tags */}
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">URL slug</label>
              <input className="admin-field-input" type="text" placeholder="auto-generated-from-title" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tags</label>
              <input className="admin-field-input" type="text" placeholder="pricing, freelance, illustration" />
            </div>
          </div>

          {/* Body */}
          <div className="admin-field">
            <label className="admin-field-label">Body</label>
            <div className="admin-toolbar-rich">
              <button className="admin-iconbtn" aria-label="Bold"><b>B</b></button>
              <button className="admin-iconbtn" aria-label="Italic"><i>I</i></button>
              <button className="admin-iconbtn" aria-label="Heading">H</button>
              <button className="admin-iconbtn" aria-label="Link">🔗</button>
              <button className="admin-iconbtn" aria-label="Image">🖼</button>
              <button className="admin-iconbtn" aria-label="Quote">&quot;</button>
              <button className="admin-iconbtn" aria-label="Code">{"{ }"}</button>
            </div>
            <textarea
              className="admin-field-area admin-field-area-with-toolbar"
              placeholder={"Write your post in Markdown…\n\n## A heading\nA paragraph with **bold** and _italic_ and a [link](https://)."}
            />
          </div>

          {/* Author + Schedule */}
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">
                Author
                <span className="admin-chip admin-chip-tier">Business</span>
              </label>
              <select className="admin-field-select">
                <option>Alexandra Silva (you)</option>
                <option disabled>Jonas K. — invite a teammate (Business+)</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Schedule</label>
              <input className="admin-field-input" type="datetime-local" />
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

// ─── Posts list rows ──────────────────────────────────────────────────────────

const DEMO_POSTS = [
  { thumb: "t-indigo", emoji: "⚡", title: "How I price my custom illustration commissions in 2026", status: "live" as const, meta: "Apr 24 · 1.2k reads · 8 comments" },
  { thumb: "t-rose",   emoji: "📖", title: "3 lessons after 6 months of selling on tadaify", status: "scheduled" as const, meta: "Goes live Apr 30 · 09:00 PT" },
  { thumb: "t-emerald",emoji: "🌱", title: "Building a small audience the slow way (draft)", status: "draft" as const, meta: "Last edited 2 hours ago · 1,840 words" },
  { thumb: "t-warm",   emoji: "☕", title: "My morning routine + the tools I actually use", status: "live" as const, meta: "Apr 18 · 894 reads · 3 comments" },
  { thumb: "t-slate",  emoji: "🧵", title: "Why I left Patreon for tadaify (and what I'd do differently)", status: "live" as const, meta: "Apr 12 · 3.4k reads · 22 comments" },
];

const CHIP_LABELS: Record<string, string> = {
  live: "● Published",
  draft: "○ Draft",
  scheduled: "⏱ Scheduled",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminBlog({ handle }: AdminBlogProps) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <section className="main-admin main-admin-blog" aria-labelledby="admin-blog-title">
      {/* Breadcrumb */}
      <nav className="admin-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="admin-crumb-sep">/</span>
        <span className="admin-crumb-here">Administration · Blog</span>
      </nav>

      {/* Page head */}
      <div className="admin-page-head">
        <div>
          <h1 id="admin-blog-title">
            <span className="admin-ph-emoji" aria-hidden="true">✍️</span>
            Blog publishing
          </h1>
          <div className="admin-page-sub">
            Write, schedule, and manage posts. Page-level setup (theme, layout, SEO) lives in{" "}
            <a href="/app?tab=page" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
              Pages → Blog
            </a>.
          </div>
        </div>
        <div className="admin-page-actions">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-ghost admin-btn-sm">Comments</button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setComposerOpen(true)}
          >
            ＋ New post
          </button>
        </div>
      </div>

      {/* Posts section */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Posts</h2>
          <span className="admin-section-sub">23 posts · 4 drafts · 1 scheduled</span>
        </div>
        <div className="admin-section-body">
          {/* Filter tabs + search */}
          <div className="admin-posts-toolbar">
            <div className="admin-tabs" role="tablist">
              <button className="admin-tab is-active" role="tab">All <span className="admin-tab-count">23</span></button>
              <button className="admin-tab" role="tab">Published <span className="admin-tab-count">18</span></button>
              <button className="admin-tab" role="tab">Drafts <span className="admin-tab-count">4</span></button>
              <button className="admin-tab" role="tab">Scheduled <span className="admin-tab-count">1</span></button>
            </div>
            <div className="admin-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="search" placeholder="Search posts by title…" aria-label="Search posts" />
            </div>
          </div>

          {/* Post rows */}
          <div className="admin-posts-list">
            {DEMO_POSTS.map((p) => (
              <article className="admin-post-row" key={p.title}>
                <div className={`admin-pr-thumb ${p.thumb}`}>{p.emoji}</div>
                <div className="admin-pr-meta">
                  <h4 className="admin-pr-title">{p.title}</h4>
                  <div className="admin-pr-sub">
                    <span className={`admin-chip admin-chip-${p.status}`}>{CHIP_LABELS[p.status]}</span>
                    <span>{p.meta}</span>
                  </div>
                </div>
                <div className="admin-pr-actions">
                  {/* TODO: wire to admin API */}
                  <button className="admin-iconbtn" aria-label="Edit post">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </button>
                  <button className="admin-iconbtn" aria-label="More options">
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="admin-pagination">
            <button className="admin-page-btn" aria-label="Previous page">‹</button>
            <button className="admin-page-btn is-current" aria-current="page">1</button>
            <button className="admin-page-btn" aria-label="Page 2">2</button>
            <button className="admin-page-btn" aria-label="Page 3">3</button>
            <button className="admin-page-btn" aria-label="Next page">›</button>
          </div>
        </div>
      </div>

      {/* Recent comments (collapsible) */}
      <details className="admin-section admin-comments-details">
        <summary className="admin-section-head" style={{ cursor: "pointer", listStyle: "none" }}>
          <h2>Recent comments</h2>
          <span className="admin-section-sub">Disqus · 12 awaiting reply</span>
          <span className="admin-head-spacer" />
          <span className="admin-chip">Disqus connected</span>
        </summary>
        <div className="admin-section-body">
          <div className="admin-comments-list">
            <div className="admin-comment">
              <div className="admin-comment-av" aria-hidden="true">M</div>
              <div className="admin-comment-body">
                <div className="admin-comment-author">Maya R.</div>
                <div className="admin-comment-meta">on &ldquo;How I price my custom illustration commissions&rdquo; · 3h ago</div>
                <div className="admin-comment-text">This pricing breakdown is exactly what I needed. Saved + sharing with my whole studio group.</div>
              </div>
              <div className="admin-comment-actions">
                {/* TODO: wire to admin API */}
                <button className="admin-btn admin-btn-xs admin-btn-ghost">Reply</button>
              </div>
            </div>
            <div className="admin-comment">
              <div className="admin-comment-av" aria-hidden="true">J</div>
              <div className="admin-comment-body">
                <div className="admin-comment-author">Jonas K.</div>
                <div className="admin-comment-meta">on &ldquo;Why I left Patreon for tadaify&rdquo; · 1 day ago</div>
                <div className="admin-comment-text">Curious — did you migrate your existing patrons or start over? Would love a follow-up post on that.</div>
              </div>
              <div className="admin-comment-actions">
                {/* TODO: wire to admin API */}
                <button className="admin-btn admin-btn-xs admin-btn-ghost">Reply</button>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Post composer modal */}
      {composerOpen && (
        <ComposerModal onClose={() => setComposerOpen(false)} />
      )}
    </section>
  );
}
