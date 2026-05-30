/**
 * AppPagePortfolio — Pages → Portfolio page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-portfolio.html (1958 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title, URL slug, publish toggle, RSS toggle,
 *      page background swatches, SEO expander (meta title, desc, OG image).
 *   2. Layout — grid mode (Masonry / Grid / Carousel) visual radio cards,
 *      items-per-row slider, cover sizing, show tag pills toggle, visitor
 *      filter chips toggle.
 *   3. Administration banner — "Manage projects in Administration → Portfolio"
 *      redirect card.
 *   (Legacy hidden section + project modal kept in dead-code for reference.)
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPagePortfolioProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type LayoutMode  = "masonry" | "grid" | "carousel";
type CoverSizing = "auto" | "1:1" | "4:3" | "16:9" | "2:3" | "3:4";

// ─── Demo data ────────────────────────────────────────────────────────────────

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

interface ProjectRow {
  id: string;
  thumbTheme: string;
  thumbEmoji: string;
  title: string;
  status: "live" | "draft" | "archived";
  featured: boolean;
  isVideo: boolean;
  videoDuration?: string;
  meta: string;
  tags: string[];
  isArchived?: boolean;
}

const DEMO_PROJECTS: ProjectRow[] = [
  { id: "p1", thumbTheme: "t-warm",    thumbEmoji: "🍞", title: "Sourdough & Co — bakery rebrand",          status: "live",     featured: true,  isVideo: false, meta: "2026 · Branding · Lisbon, PT",               tags: ["branding", "illustration"] },
  { id: "p2", thumbTheme: "t-indigo",  thumbEmoji: "▶",  title: "Norte Bank — onboarding film",              status: "live",     featured: true,  isVideo: true,  videoDuration: "0:42", meta: "2025 · Video · Norte Bank",   tags: ["video", "branding"] },
  { id: "p3", thumbTheme: "t-rose",    thumbEmoji: "📷", title: "Sintra fog — landscape series",             status: "live",     featured: true,  isVideo: false, meta: "2025 · Photography · Personal",              tags: ["photography"] },
  { id: "p4", thumbTheme: "t-emerald", thumbEmoji: "🌿", title: "Botanica — calendar lettering",             status: "live",     featured: false, isVideo: false, meta: "2025 · Illustration · Botanica Magazine",   tags: ["illustration", "lettering"] },
  { id: "p5", thumbTheme: "t-violet",  thumbEmoji: "🧊", title: "Cubica — 3D type explorations",             status: "live",     featured: false, isVideo: false, meta: "2024 · 3D · Personal",                       tags: ["3d", "branding"] },
  { id: "p6", thumbTheme: "t-sky",     thumbEmoji: "📐", title: "[Draft] Marca Café — coffeeshop identity",  status: "draft",    featured: false, isVideo: false, meta: "Last edited 2 days ago",                    tags: ["branding"] },
  { id: "p7", thumbTheme: "t-slate",   thumbEmoji: "🌃", title: "After hours — Lisbon nights",               status: "live",     featured: false, isVideo: false, meta: "2024 · Photography · Personal",              tags: ["photography"] },
  { id: "p8", thumbTheme: "t-warm",    thumbEmoji: "🐝", title: "Bee & Co — packaging (2022)",               status: "archived", featured: false, isVideo: false, meta: "2022 · Illustration · Bee & Co",             tags: ["illustration"], isArchived: true },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-portfolio-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-portfolio-row-toggle">
      <div>
        <div className="app-page-portfolio-rt-name">{name}</div>
        <div className="app-page-portfolio-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-portfolio-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-portfolio-swatch${sel === i ? " is-selected" : ""}`}
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

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
      <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

// ─── Layout thumbnail previews ─────────────────────────────────────────────────

function MasonryThumb(): ReactElement {
  return (
    <div className="app-page-portfolio-lc-thumb masonry" aria-hidden="true">
      <div className="col">
        <div className="blk t-i" style={{ height: 30 }} />
        <div className="blk t-r" style={{ height: 18 }} />
        <div className="blk"     style={{ height: 14 }} />
      </div>
      <div className="col">
        <div className="blk t-e" style={{ height: 18 }} />
        <div className="blk t-s" style={{ height: 30 }} />
        <div className="blk t-y" style={{ height: 14 }} />
      </div>
      <div className="col">
        <div className="blk t-r" style={{ height: 14 }} />
        <div className="blk"     style={{ height: 22 }} />
        <div className="blk t-i" style={{ height: 26 }} />
      </div>
    </div>
  );
}

function GridThumb(): ReactElement {
  return (
    <div className="app-page-portfolio-lc-thumb grid" aria-hidden="true">
      <div className="blk a" /><div className="blk b" /><div className="blk c" />
      <div className="blk d" /><div className="blk e" /><div className="blk f" />
    </div>
  );
}

function CarouselThumb(): ReactElement {
  return (
    <div className="app-page-portfolio-lc-thumb carousel" aria-hidden="true">
      <div className="hero" />
      <div className="dots">
        <span className="dot is-current" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

// ─── Project row ───────────────────────────────────────────────────────────────

function ProjectRowItem({ project }: { project: ProjectRow }): ReactElement {
  const [popOpen, setPopOpen] = useState(false);

  const statusChipClass =
    project.status === "live" ? "live" :
    project.status === "draft" ? "draft" : "archived";

  const statusLabel =
    project.status === "live" ? "Published" :
    project.status === "draft" ? "Draft" : "Archived";

  return (
    <div className={`app-page-portfolio-post-row${project.isArchived ? " is-archived" : ""}`}>
      <div className="app-page-portfolio-pr-grip-col">
        <span className="app-page-portfolio-pr-handle" aria-label="Drag to reorder">
          <GripSvg />
        </span>
        <div className={`app-page-portfolio-pr-thumb ${project.thumbTheme}`} aria-hidden="true">
          {project.featured && (
            <span className="app-page-portfolio-pr-thumb-featured-pin" title="Featured — pinned to top of grid">★</span>
          )}
          {project.thumbEmoji}
          {project.isVideo && project.videoDuration && (
            <span className="app-page-portfolio-video-pill">{project.videoDuration}</span>
          )}
        </div>
      </div>
      <div className="app-page-portfolio-pr-meta">
        <p className="app-page-portfolio-pr-title">{project.title}</p>
        <div className="app-page-portfolio-pr-line">
          <span className={`app-page-portfolio-chip ${statusChipClass}`}>{statusLabel}</span>
          {project.featured && <span className="app-page-portfolio-chip featured">★ Featured</span>}
          <span className="app-page-portfolio-pr-dot" />
          <span>{project.meta}</span>
          {project.tags.length > 0 && <span className="app-page-portfolio-pr-dot" />}
          {project.tags.map((t) => (
            <span key={t} className="app-page-portfolio-pr-tag">{t}</span>
          ))}
        </div>
      </div>
      <div className="app-page-portfolio-pr-actions">
        {/* TODO: wire to admin pages API */}
        <button className="app-page-portfolio-btn app-page-portfolio-btn-ghost app-page-portfolio-btn-xs" type="button">
          {project.status === "draft" ? "Continue" : "Edit"}
        </button>
        <button
          className="app-page-portfolio-iconbtn"
          type="button"
          aria-label="Project options"
          onClick={() => setPopOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="5"  r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {popOpen && (
          <div className="app-page-portfolio-kebab-pop is-open">
            {/* TODO: wire to admin pages API */}
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              Edit
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              Duplicate
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2"/></svg>
              {project.featured ? "Unmark featured" : "Mark featured"}
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              Archive
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View public
            </button>
            <hr />
            <button className="danger" type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New/Edit project modal ────────────────────────────────────────────────────

function ProjectModal({ onClose }: { onClose: () => void }): ReactElement {
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  return (
    <div
      className="app-page-portfolio-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-portfolio-modal">
        <div className="app-page-portfolio-modal-head">
          <h3 id="pm-title">New project</h3>
          <span className="app-page-portfolio-head-spacer" />
          <span className="app-page-portfolio-chip draft">Draft · auto-saving</span>
          <button className="app-page-portfolio-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-portfolio-modal-body">

          {/* Cover media */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Cover media{" "}
              <span className="app-page-portfolio-field-hint">recommended 1600×1200 image · or MP4 up to 50 MB</span>
            </label>
            <div className="app-page-portfolio-cover-stack">
              <div className="app-page-portfolio-media-kind" role="tablist" aria-label="Cover media type">
                <button
                  className={mediaKind === "image" ? "is-active" : ""}
                  role="tab"
                  aria-selected={mediaKind === "image"}
                  type="button"
                  onClick={() => setMediaKind("image")}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  Image
                </button>
                <button
                  className={mediaKind === "video" ? "is-active" : ""}
                  role="tab"
                  aria-selected={mediaKind === "video"}
                  type="button"
                  onClick={() => setMediaKind("video")}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  Video
                </button>
              </div>
              <div
                className="app-page-portfolio-cover-primary"
                style={{ background: mediaKind === "video" ? "linear-gradient(135deg,#0F172A,#334155)" : "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
              >
                <span className="app-page-portfolio-crop-hint">
                  {mediaKind === "video" ? "Auto-pick first frame as still" : "Crop to Auto · 1600×1200"}
                </span>
                {mediaKind === "video" && (
                  <span className="app-page-portfolio-video-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                    {" "}MP4 · 0:42
                  </span>
                )}
                {/* TODO: wire to admin pages API */}
                <button className="app-page-portfolio-replace-btn" type="button">Replace</button>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Gallery{" "}
              <span className="app-page-portfolio-field-hint">up to 8 images · drag to reorder · cover above is image #1</span>
            </label>
            <div className="app-page-portfolio-gallery">
              {[
                { bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", n: 1 },
                { bg: "linear-gradient(135deg,#FB7185,#BE185D)", n: 2 },
                { bg: "linear-gradient(135deg,#34D399,#047857)", n: 3 },
                { bg: "linear-gradient(135deg,#FDE68A,#F59E0B)", n: 4 },
                { bg: "linear-gradient(135deg,#38BDF8,#0369A1)", n: 5 },
              ].map((img) => (
                <div key={img.n} className="app-page-portfolio-gal-item" style={{ background: img.bg }} aria-label={`Image ${img.n}`}>
                  {img.n}
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-portfolio-gal-x" type="button" aria-label={`Remove image ${img.n}`}>×</button>
                </div>
              ))}
              {[1, 2, 3].map((k, i) => (
                /* TODO: wire to admin pages API */
                <button
                  key={k}
                  type="button"
                  className="app-page-portfolio-gal-item add"
                  aria-label="Add image"
                  style={{ opacity: i === 0 ? 1 : i === 1 ? 0.5 : 0.3 }}
                >
                  +
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label" htmlFor="pm-title-input">Title</label>
            <div className="app-page-portfolio-field-prefix-wrap">
              <input id="pm-title-input" type="text" defaultValue="Sourdough &amp; Co — bakery rebrand" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-portfolio-field-suffix-action" type="button">✨ Suggest</button>
            </div>
          </div>

          {/* Slug + Year */}
          <div className="app-page-portfolio-field-row">
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="pm-slug-input">
                URL slug{" "}
                <span className="app-page-portfolio-field-hint">auto-filled · editable until first publish</span>
              </label>
              <div className="app-page-portfolio-field-prefix-wrap">
                <span className="app-page-portfolio-field-prefix">…/portfolio/</span>
                <input id="pm-slug-input" type="text" defaultValue="sourdough-and-co" />
              </div>
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="pm-year">Year</label>
              <select className="app-page-portfolio-field-select" id="pm-year" defaultValue="2025">
                <option>2026</option>
                <option value="2025">2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
                <option>Earlier</option>
              </select>
            </div>
          </div>

          {/* Medium / Category */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Medium / Category{" "}
              <span className="app-page-portfolio-field-hint">multi-select · drives the visitor filter chips</span>
            </label>
            <div className="app-page-portfolio-multi-select">
              <span className="app-page-portfolio-ms-pill">
                Branding
                <button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove Branding">×</button>
              </span>
              <span className="app-page-portfolio-ms-pill">
                Illustration
                <button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove Illustration">×</button>
              </span>
              <input type="text" placeholder="Add a category…" />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 6 }}>
              Available: Photography · Illustration · 3D · Video · Web design · Branding · Architecture · Music · Lettering · Print · Motion · UX
            </div>
          </div>

          {/* Description */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label" htmlFor="pm-body">Description</label>
            <div className="app-page-portfolio-rt-toolbar" role="toolbar" aria-label="Formatting">
              <button type="button" aria-label="Bold"><b>B</b></button>
              <button type="button" aria-label="Italic"><i>I</i></button>
              <span className="app-page-portfolio-rt-sep" />
              <button type="button" aria-label="Heading">H</button>
              <button type="button" aria-label="Quote">❝</button>
              <span className="app-page-portfolio-rt-sep" />
              <button type="button" aria-label="Link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button type="button" aria-label="Insert image">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <span className="app-page-portfolio-rt-sep" />
              <button type="button" aria-label="Bullet list">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
                </svg>
              </button>
              <span className="app-page-portfolio-rt-sep" style={{ marginLeft: "auto" }} />
              {/* TODO: wire to admin pages API */}
              <button type="button" aria-label="AI suggest">✨</button>
            </div>
            <textarea
              id="pm-body"
              className="app-page-portfolio-rt-area"
              defaultValue={
                "A 4-month rebrand for a Lisbon neighborhood bakery. Identity, packaging system across 12 SKUs, three custom illustrations for the seasonal range, and a printed loyalty card.\n\nThe wordmark uses a single-stroke italic to evoke a baker's quick chalk hand on a paper bag. The seal is set in a softened crest — formal enough for the loaf wrappers, friendly enough for the kids' birthday boxes."
              }
            />
          </div>

          {/* Tags */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Tags{" "}
              <span className="app-page-portfolio-field-hint">type and press Enter · improves search + RSS</span>
            </label>
            <div className="app-page-portfolio-multi-select">
              <span className="app-page-portfolio-ms-pill">bakery<button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove tag bakery">×</button></span>
              <span className="app-page-portfolio-ms-pill">packaging<button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove tag packaging">×</button></span>
              <span className="app-page-portfolio-ms-pill">lettering<button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove tag lettering">×</button></span>
              <input type="text" placeholder="Add a tag…" />
            </div>
          </div>

          {/* Project URL + Client */}
          <div className="app-page-portfolio-field-row">
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="pm-project-url">
                Project URL{" "}
                <span className="app-page-portfolio-field-hint">optional · live case study / Behance / Dribbble / GitHub</span>
              </label>
              <div className="app-page-portfolio-field-prefix-wrap">
                <span className="app-page-portfolio-field-prefix">https://</span>
                <input id="pm-project-url" type="text" defaultValue="behance.net/alexandra/sourdough" placeholder="behance.net/your-handle/project" />
              </div>
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="pm-client">
                Client{" "}
                <span className="app-page-portfolio-field-hint">optional · for commissioned work</span>
              </label>
              <input className="app-page-portfolio-field-input" id="pm-client" type="text" defaultValue="Sourdough & Co" placeholder="e.g. Acme, Inc. (or leave blank)" />
            </div>
          </div>

          {/* Collaborators (Business) */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Collaborators{" "}
              <span className="app-page-portfolio-field-hint">credit anyone you worked with on this project</span>
            </label>
            <div className="app-page-portfolio-multi-select">
              <span className="app-page-portfolio-ms-pill collab">
                Maya Chen — co-illustration
                <button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove Maya Chen">×</button>
              </span>
              <span className="app-page-portfolio-ms-pill collab">
                Tomás Reis — print & production
                <button className="app-page-portfolio-ms-x-btn" type="button" aria-label="Remove Tomás Reis">×</button>
              </span>
              <input type="text" placeholder="Add collaborator name + role…" />
              <span className="app-page-portfolio-chip" style={{ background: "rgba(245,158,11,0.14)", color: "#92400E", border: "1px solid rgba(245,158,11,0.32)", marginLeft: "auto" }}>
                🔒 Business
              </span>
            </div>
            <div className="app-page-portfolio-tier-hint">
              <span className="app-page-portfolio-th-icon" aria-hidden="true">💡</span>
              Crediting collaborators is part of <b>Team</b> on the Business plan. We&apos;ll prompt to upgrade when you save if any collaborator is set.
            </div>
          </div>

          {/* Featured */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">Featured project</label>
            <div className="app-page-portfolio-featured-row">
              <div className="app-page-portfolio-fr-ico" aria-hidden="true">★</div>
              <div className="app-page-portfolio-fr-copy">
                <div className="app-page-portfolio-fr-name">Pin to top of the grid</div>
                <div className="app-page-portfolio-fr-sub">Featured projects always appear before the rest, in the order you mark them.</div>
              </div>
              <Toggle defaultOn />
            </div>
            <div className="app-page-portfolio-tier-hint">
              <span className="app-page-portfolio-th-icon" aria-hidden="true">💡</span>
              You can feature up to <b>3 projects on Free</b> and <b>unlimited on Creator+</b>. We&apos;ll prompt to upgrade at save if you cross the cap.
            </div>
          </div>

          {/* Schedule */}
          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Schedule publication{" "}
              <span className="app-page-portfolio-field-hint">leave blank to publish now</span>
            </label>
            <div className="app-page-portfolio-field-row">
              <input className="app-page-portfolio-field-input" id="pm-sched-date" type="date" defaultValue="2026-05-08" />
              <input className="app-page-portfolio-field-input" id="pm-sched-time" type="time" defaultValue="10:00" />
            </div>
            <div className="app-page-portfolio-tier-hint">
              <span className="app-page-portfolio-th-icon" aria-hidden="true">💡</span>
              Scheduling beyond the next 7 days is a <b>Pro</b> perk. We&apos;ll prompt at save if your selected date is more than 7 days out.
            </div>
          </div>

        </div>
        <div className="app-page-portfolio-modal-foot">
          {/* TODO: wire to admin pages API */}
          <button className="app-page-portfolio-btn app-page-portfolio-btn-ghost app-page-portfolio-btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button className="app-page-portfolio-btn app-page-portfolio-btn-danger-ghost app-page-portfolio-btn-sm" type="button">Delete draft</button>
          <span className="app-page-portfolio-foot-spacer" />
          <button className="app-page-portfolio-btn app-page-portfolio-btn-ghost app-page-portfolio-btn-sm" type="button">Save as draft</button>
          <button className="app-page-portfolio-btn app-page-portfolio-btn-warm app-page-portfolio-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Schedule for May 8
          </button>
          <button className="app-page-portfolio-btn app-page-portfolio-btn-primary app-page-portfolio-btn-sm" type="button">Publish now →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPagePortfolio({ handle }: AppPagePortfolioProps): ReactElement {
  const [layout, setLayout]           = useState<LayoutMode>("masonry");
  const [perRow, setPerRow]           = useState(3);
  const [coverSizing, setCoverSizing] = useState<CoverSizing>("auto");
  const [modalOpen, setModalOpen]     = useState(false);

  return (
    <div className="app-page-portfolio-root" aria-labelledby="app-page-portfolio-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-portfolio-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-portfolio-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-portfolio-crumb-sep">/</span>
        <span className="app-page-portfolio-crumb-here">Portfolio</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-portfolio-page-head">
        <div>
          <h1 id="app-page-portfolio-h1" className="app-page-portfolio-h1">
            <span className="app-page-portfolio-ph-emoji" aria-hidden="true">🎨</span>
            Portfolio
          </h1>
          <p className="app-page-portfolio-sub">
            Show your best work in a visual gallery — projects, case studies, photos, films, builds. Visitors filter by tag.
          </p>
        </div>
        <div className="app-page-portfolio-actions">
          <span className="app-page-portfolio-url-pill">
            <span className="app-page-portfolio-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>portfolio</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-portfolio-btn app-page-portfolio-btn-ghost app-page-portfolio-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 1 — Page settings
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-portfolio-panel">
        <div className="app-page-portfolio-panel-head">
          <h2>Page settings</h2>
          <span className="app-page-portfolio-panel-sub">Title, URL, visibility, RSS and SEO for the Portfolio page itself.</span>
        </div>
        <div className="app-page-portfolio-panel-body">

          <div className="app-page-portfolio-field-row">
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="portfolio-page-title">
                Page title{" "}
                <span className="app-page-portfolio-field-hint">shown as &lt;h1&gt; on the public portfolio</span>
              </label>
              <input className="app-page-portfolio-field-input" id="portfolio-page-title" type="text" defaultValue="Portfolio" />
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="portfolio-page-slug">
                URL slug{" "}
                <span className="app-page-portfolio-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-portfolio-field-prefix-wrap">
                <span className="app-page-portfolio-field-prefix">tadaify.com/{handle}/</span>
                <input id="portfolio-page-slug" type="text" defaultValue="portfolio" />
              </div>
            </div>
          </div>

          <div className="app-page-portfolio-field-row">
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label">Publish</label>
              <ToggleRow name="Page is live" sub="Visitors can find this portfolio at the URL above." defaultOn />
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label">RSS feed</label>
              <ToggleRow
                name="Enable RSS"
                sub={<>Serve <span style={{ fontFamily: "var(--font-mono)" }}>/portfolio/feed.xml</span> so newsreaders pick up new projects.</>}
                defaultOn
              />
            </div>
          </div>

          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Page background{" "}
              <span className="app-page-portfolio-field-hint">override theme colour for this page only</span>
            </label>
            <SwatchRow />
          </div>

          <details className="app-page-portfolio-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
              </svg>
              SEO settings{" "}
              <span className="app-page-portfolio-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-portfolio-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-portfolio-ex-body">
              <div className="app-page-portfolio-field">
                <label className="app-page-portfolio-field-label" htmlFor="portfolio-seo-title">
                  Meta title{" "}
                  <span className="app-page-portfolio-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-portfolio-field-prefix-wrap">
                  <input id="portfolio-seo-title" type="text" defaultValue="Selected work — Alexandra Silva, art direction & illustration" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-portfolio-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-portfolio-field">
                <label className="app-page-portfolio-field-label" htmlFor="portfolio-seo-desc">
                  Meta description{" "}
                  <span className="app-page-portfolio-field-hint">~155 chars</span>
                </label>
                <div className="app-page-portfolio-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="portfolio-seo-desc"
                    className="app-page-portfolio-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="A growing collection of brand systems, illustrations and lettering pieces. Available for commissions — Lisbon & remote."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-portfolio-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-portfolio-field">
                <label className="app-page-portfolio-field-label">
                  OG image{" "}
                  <span className="app-page-portfolio-field-hint">1200×630 — shown when shared on social</span>
                </label>
                <div className="app-page-portfolio-og-drop">
                  <div style={{ fontSize: 30 }}>🖼</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>Drop an image, or click to upload</div>
                  <div style={{ color: "var(--fg-muted)", fontSize: 12.5, marginTop: 4 }}>
                    Or{" "}
                    {/* TODO: wire to admin pages API */}
                    <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>
                      ✨ generate one with AI
                    </span>
                    {" "}from your featured project
                  </div>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — Layout
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-portfolio-panel">
        <div className="app-page-portfolio-panel-head">
          <h2>Layout</h2>
          <span className="app-page-portfolio-panel-sub">
            How project covers arrange themselves at{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>/{handle}/portfolio</span>.
          </span>
        </div>
        <div className="app-page-portfolio-panel-body">

          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">Grid mode</label>
            <div className="app-page-portfolio-layout-cards" role="radiogroup" aria-label="Grid mode">

              <div
                className={`app-page-portfolio-layout-card${layout === "masonry" ? " is-selected" : ""}`}
                role="radio"
                aria-checked={layout === "masonry"}
                tabIndex={0}
                onClick={() => setLayout("masonry")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLayout("masonry"); }}
              >
                <MasonryThumb />
                <div>
                  <div className="app-page-portfolio-lc-title">Masonry</div>
                  <div className="app-page-portfolio-lc-sub">Pinterest-style — asymmetric heights. Best for mixed photo + illustration.</div>
                </div>
              </div>

              <div
                className={`app-page-portfolio-layout-card${layout === "grid" ? " is-selected" : ""}`}
                role="radio"
                aria-checked={layout === "grid"}
                tabIndex={0}
                onClick={() => setLayout("grid")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLayout("grid"); }}
              >
                <GridThumb />
                <div>
                  <div className="app-page-portfolio-lc-title">Grid</div>
                  <div className="app-page-portfolio-lc-sub">Uniform squares — clean, editorial. Designers + branding studios.</div>
                </div>
              </div>

              <div
                className={`app-page-portfolio-layout-card${layout === "carousel" ? " is-selected" : ""}`}
                role="radio"
                aria-checked={layout === "carousel"}
                tabIndex={0}
                onClick={() => setLayout("carousel")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLayout("carousel"); }}
              >
                <CarouselThumb />
                <div>
                  <div className="app-page-portfolio-lc-title">Carousel</div>
                  <div className="app-page-portfolio-lc-sub">One project at a time, full-bleed. Filmmakers, photographers, single-hero work.</div>
                </div>
              </div>

            </div>
          </div>

          <div className="app-page-portfolio-field-row col-3" style={{ opacity: layout === "carousel" ? 0.45 : 1 }}>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="cfg-perrow">
                Items per row{" "}
                <span className="app-page-portfolio-field-hint">Masonry &amp; Grid only</span>
              </label>
              <div className="app-page-portfolio-slider-row">
                <input
                  type="range"
                  id="cfg-perrow"
                  min={2}
                  max={4}
                  value={perRow}
                  step={1}
                  onChange={(e) => setPerRow(Number(e.target.value))}
                />
                <span className="app-page-portfolio-slider-val">{perRow}</span>
              </div>
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label" htmlFor="cfg-cover">Cover sizing</label>
              <select
                className="app-page-portfolio-field-select"
                id="cfg-cover"
                value={coverSizing}
                onChange={(e) => setCoverSizing(e.target.value as CoverSizing)}
              >
                <option value="auto">Auto — match each project&apos;s cover ratio</option>
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="16:9">Wide (16:9)</option>
                <option value="2:3">Portrait (2:3)</option>
                <option value="3:4">Tall portrait (3:4)</option>
              </select>
            </div>
            <div className="app-page-portfolio-field">
              <label className="app-page-portfolio-field-label">Show project tags on card</label>
              <ToggleRow name="Display tag pills" sub="Tag pills appear under each cover." defaultOn />
            </div>
          </div>

          <div className="app-page-portfolio-field">
            <label className="app-page-portfolio-field-label">
              Visitor filter UI{" "}
              <span className="app-page-portfolio-field-hint">render tag chips above the grid so visitors can filter by category</span>
            </label>
            <ToggleRow
              name="Show filter chips"
              sub="All · Photography · Illustration · Branding · 3D · Video — visible at the top of the public page."
              defaultOn
            />
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — Administration banner
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-portfolio-panel app-page-portfolio-panel-admin-banner">
        <div className="app-page-portfolio-admin-banner-inner">
          <div style={{ fontSize: 26, flexShrink: 0 }}>🎨</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="app-page-portfolio-admin-banner-title">Manage projects in Administration → Portfolio</div>
            <div className="app-page-portfolio-admin-banner-sub">
              Day-to-day project management (add, edit, archive, reorder, featured) lives in the Administration tab.
              This page is for page-level setup only — layout, theme, visitor controls.
            </div>
          </div>
          {/* TODO: wire to admin pages API */}
          <a href="/app?tab=admin&section=portfolio" className="app-page-portfolio-btn app-page-portfolio-btn-primary app-page-portfolio-btn-sm" style={{ flexShrink: 0 }}>
            Open Portfolio admin →
          </a>
        </div>
      </section>

      {/* ── (Legacy) Projects list — hidden, kept for modal reference ── */}
      <section className="app-page-portfolio-panel" hidden>
        <div className="app-page-portfolio-panel-head">
          <h2>Projects</h2>
          <span className="app-page-portfolio-panel-sub">[MOVED] — see Administration → Portfolio</span>
          <span className="app-page-portfolio-head-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-portfolio-btn app-page-portfolio-btn-primary app-page-portfolio-btn-sm" type="button" onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New project
          </button>
        </div>
        <div className="app-page-portfolio-panel-body-lg">

          {/* ── Posts toolbar ── */}
          <div className="app-page-portfolio-posts-toolbar">
            <div className="app-page-portfolio-tabs" role="tablist">
              <button className="app-page-portfolio-tab is-active" role="tab" aria-selected="true">
                All <span className="app-page-portfolio-tab-count">47</span>
              </button>
              <button className="app-page-portfolio-tab" role="tab" aria-selected="false">
                Published <span className="app-page-portfolio-tab-count">42</span>
              </button>
              <button className="app-page-portfolio-tab" role="tab" aria-selected="false">
                Drafts <span className="app-page-portfolio-tab-count">3</span>
              </button>
              <button className="app-page-portfolio-tab" role="tab" aria-selected="false">
                Archived <span className="app-page-portfolio-tab-count">2</span>
              </button>
            </div>
            <div className="app-page-portfolio-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search projects by title…" />
            </div>
            <div className="app-page-portfolio-sort-wrap">
              <select aria-label="Sort order" defaultValue="newest">
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="manual">Sort: Manual (drag to reorder)</option>
                <option value="alpha">Sort: A → Z</option>
              </select>
            </div>
          </div>

          {/* ── Filter chips ── */}
          <div className="app-page-portfolio-filter-chips">
            {["All", "Branding", "Illustration", "Photography", "3D", "Video", "Lettering"].map((tag) => (
              <button key={tag} className={`app-page-portfolio-fchip${tag === "All" ? " is-active" : ""}`} type="button">
                {tag}
              </button>
            ))}
          </div>

          {/* ── Projects list ── */}
          <div className="app-page-portfolio-posts-list">
            {DEMO_PROJECTS.map((p) => <ProjectRowItem key={p.id} project={p} />)}
          </div>

          {/* ── Pagination ── */}
          <div className="app-page-portfolio-pagination">
            <div className="app-page-portfolio-pg-meta">Showing <b>1–8</b> of <b>47</b> projects</div>
            <div className="app-page-portfolio-pg-controls">
              <button disabled aria-label="Previous">←</button>
              <button className="is-current" aria-current="page">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>6</button>
              <button aria-label="Next">→</button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Project composer modal (centered, NEVER a drawer) ── */}
      {modalOpen && <ProjectModal onClose={() => setModalOpen(false)} />}

    </div>
  );
}
