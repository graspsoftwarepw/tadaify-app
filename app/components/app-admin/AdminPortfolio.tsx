/**
 * AdminPortfolio — Administration → Portfolio (projects management) sub-page.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-portfolio.html (471 LOC)
 *
 * Three display states:
 *   "no-page" — Portfolio page not yet created
 *   "empty"   — Portfolio page exists but has no projects
 *   "filled"  — Projects grid with tabs/search/sort + drag-handle cards
 *
 * Project composer modal (centered, never a drawer).
 * All publish/save/upload/import actions stubbed — TODO: wire to admin API.
 */

import { useState } from "react";

interface AdminPortfolioProps {
  handle: string;
}

// ─── Project Composer Modal ───────────────────────────────────────────────────

function ComposerModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="admin-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-portfolio-composer-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3 id="admin-portfolio-composer-title">New project</h3>
          <span className="admin-chip admin-chip-draft">○ Draft</span>
          <button className="admin-iconbtn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-cover-uploader" role="button" tabIndex={0} aria-label="Upload cover image">
            <div style={{ fontSize: 28, marginBottom: 6 }}>🖼</div>
            <b>Drop cover image here</b> or click to upload
            {/* TODO: wire to admin API */}
            <div style={{ fontSize: 12, marginTop: 4 }}>PNG / JPG / WebP · max 5MB · 1600×1200 recommended</div>
          </div>
          <div style={{ marginTop: 16 }} />

          <div className="admin-field">
            <label className="admin-field-label">Title</label>
            <input className="admin-field-input" placeholder="Stellar Coffee Co. — Brand Identity" />
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">Category</label>
              <select className="admin-field-select">
                <option>Branding</option>
                <option>UI/UX</option>
                <option>Photography</option>
                <option>Print</option>
                <option>Code</option>
                <option>Editorial</option>
                <option>Other</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-field-label">URL slug</label>
              <input className="admin-field-input" placeholder="auto-generated-from-title" />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Short description (visitor card)</label>
            <textarea className="admin-field-area" placeholder="One sentence that earns the click." />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Long description (project page)</label>
            <textarea className="admin-field-area" style={{ minHeight: 140 }} placeholder="Problem → process → result. Markdown supported." />
          </div>

          <div className="admin-field">
            <label className="admin-field-label">Gallery</label>
            <div className="admin-gallery-thumbs">
              <div className="admin-gallery-thumb" aria-label="Image 1">📷</div>
              <div className="admin-gallery-thumb" aria-label="Image 2">📷</div>
              <div className="admin-gallery-thumb" aria-label="Image 3">📷</div>
              {/* TODO: wire to admin API */}
              <div className="admin-gallery-thumb admin-gallery-thumb-add" role="button" tabIndex={0} aria-label="Add image">＋</div>
            </div>
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-field-label">External link (optional)</label>
              <input className="admin-field-input" placeholder="https://stellar-coffee.com" />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Tags (comma-separated)</label>
              <input className="admin-field-input" placeholder="brand, packaging, illustration" />
            </div>
          </div>
        </div>
        <div className="admin-modal-foot">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-danger-ghost admin-btn-sm">Delete draft</button>
          <span className="admin-foot-spacer" />
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Save draft</button>
          <button className="admin-btn admin-btn-primary">Publish</button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo project cards ───────────────────────────────────────────────────────

const DEMO_PROJECTS = [
  { cover: "t-indigo", emoji: "✦",  title: "Cosmic Brand Identity — Stellar Coffee Co.", category: "Branding",  views: "1.4k views", status: "live" as const, featured: true },
  { cover: "t-warm",   emoji: "🌅", title: "Sunrise Series — Photography",               category: "Photo",    views: "892 views",  status: "live" as const },
  { cover: "t-emerald",emoji: "🌿", title: "Greenhouse — App Redesign",                  category: "UI/UX",    views: "2.1k views", status: "live" as const },
  { cover: "t-rose",   emoji: "🎭", title: "Theatre Posters — A Midsummer Night's Dream",category: "Print",    views: "Not published", status: "draft" as const },
  { cover: "t-slate",  emoji: "🏔", title: "Alpine Field Notes — Editorial",             category: "Editorial",views: "674 views",  status: "live" as const },
  { cover: "t-indigo", emoji: "🗄", title: "Old Portfolio Site (2021)",                  category: "Web",      views: "Hidden from visitors", status: "archived" as const },
];

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  live:     { label: "● Published", cls: "admin-chip-live" },
  draft:    { label: "○ Draft",     cls: "admin-chip-draft" },
  archived: { label: "📦 Archived", cls: "admin-chip-archived" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPortfolio({ handle: _handle }: AdminPortfolioProps) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <section className="main-admin main-admin-portfolio" aria-labelledby="admin-portfolio-title">
      {/* Breadcrumb */}
      <nav className="admin-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="admin-crumb-sep">/</span>
        <span className="admin-crumb-here">Administration · Portfolio</span>
      </nav>

      {/* Page head */}
      <div className="admin-page-head">
        <div>
          <h1 id="admin-portfolio-title">
            <span className="admin-ph-emoji" aria-hidden="true">🎨</span>
            Projects
          </h1>
          <div className="admin-page-sub">
            Add, edit, and reorder projects. Page-level setup (layout, items per row, visitor controls) lives in{" "}
            <a href="/app?tab=page" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
              Pages → Portfolio
            </a>.
          </div>
        </div>
        <div className="admin-page-actions">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-ghost admin-btn-sm">Bulk import</button>
          <button className="admin-btn admin-btn-primary" onClick={() => setComposerOpen(true)}>
            ＋ New project
          </button>
        </div>
      </div>

      {/* Projects section */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Projects</h2>
          <span className="admin-section-sub">12 total · 9 published, 2 drafts, 1 archived</span>
        </div>
        <div className="admin-section-body">
          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-tabs" role="tablist">
              <button className="admin-tab is-active" role="tab">All <span className="admin-tab-count">12</span></button>
              <button className="admin-tab" role="tab">Published <span className="admin-tab-count">9</span></button>
              <button className="admin-tab" role="tab">Drafts <span className="admin-tab-count">2</span></button>
              <button className="admin-tab" role="tab">Archived <span className="admin-tab-count">1</span></button>
            </div>
            <div className="admin-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="search" placeholder="Search projects…" aria-label="Search projects" />
            </div>
            <select className="admin-sort-select" aria-label="Sort order">
              <option>Custom order (drag to reorder)</option>
              <option>Newest first</option>
              <option>Oldest first</option>
              <option>Most viewed</option>
              <option>A → Z</option>
            </select>
          </div>

          {/* Projects grid */}
          <div className="admin-projects-grid">
            {DEMO_PROJECTS.map((p) => (
              <article className="admin-proj-card" key={p.title}>
                <div className={`admin-proj-cover ${p.cover}`}>
                  <div className="admin-proj-badge-row">
                    <span className={`admin-chip ${STATUS_CHIP[p.status].cls}`}>{STATUS_CHIP[p.status].label}</span>
                    {p.featured && <span className="admin-chip admin-chip-featured">★ Featured</span>}
                  </div>
                  <div className="admin-proj-drag-handle" aria-hidden="true">⋮⋮</div>
                  <span aria-hidden="true">{p.emoji}</span>
                </div>
                <div className="admin-proj-meta">
                  <h4 className="admin-proj-title">{p.title}</h4>
                  <div className="admin-proj-sub">
                    <span>{p.category}</span>
                    <span>·</span>
                    <span>{p.views}</span>
                  </div>
                </div>
                <div className="admin-proj-actions">
                  {/* TODO: wire to admin API */}
                  <button className="admin-iconbtn" aria-label="Edit project">
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
            <button className="admin-page-btn" aria-label="Next page">›</button>
          </div>
        </div>
      </div>

      {/* Project composer modal */}
      {composerOpen && <ComposerModal onClose={() => setComposerOpen(false)} />}
    </section>
  );
}
