/**
 * CreatorPortfolioPage — public Portfolio page render.
 *
 * Visitor view at tadaify.com/<handle>/portfolio. Shows the creator's project
 * collection in one of three layout modes (Masonry / Grid / Carousel), with
 * tag filtering, pagination, single project case-study view, image lightbox,
 * and related projects.
 *
 * Sub-views via in-page routing:
 *   list/masonry  → Masonry list (default)
 *   list/grid     → Uniform grid
 *   list/carousel → Carousel with dots + thumbnails
 *   project       → Single project case study
 *   (tag filter works across all list layouts)
 *
 * All outbound link/CTA actions stubbed with TODO comments.
 * Dead-code: NOT wired to app/routes.ts — added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-portfolio.css
 */

import type { ReactElement } from "react";
import { useState, useEffect, useCallback } from "react";
import "~/styles/public-pages/creator-portfolio.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LayoutMode = "masonry" | "grid" | "carousel";
type PageView = "list" | "project";

interface ProjectCard {
  slug: string;
  emoji: string;
  coverClass: string;
  coverHeight?: "h-tall" | "h-mid" | "h-low";
  featured?: boolean;
  videoLabel?: string;
  title: string;
  year: string;
  client?: string;
  tags: string[];
  medium?: string;
}

interface CarouselItem {
  slug: string;
  title: string;
  year: string;
  client: string;
  colorClass: string;
  emoji: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Static data (mirrors mockup exactly)
// ---------------------------------------------------------------------------

const PROJECTS: ProjectCard[] = [
  {
    slug: "sourdough-and-co",
    emoji: "🍞",
    coverClass: "t-warm",
    coverHeight: "h-tall",
    featured: true,
    title: "Sourdough & Co — bakery rebrand",
    year: "2026",
    client: "Lisbon",
    tags: ["branding", "illustration"],
    medium: "Branding · Illustration",
  },
  {
    slug: "norte-bank-film",
    emoji: "▶",
    coverClass: "t-slate",
    coverHeight: "h-mid",
    featured: true,
    videoLabel: "▶ 0:42",
    title: "Norte Bank — onboarding film",
    year: "2025",
    client: "Norte Bank",
    tags: ["video", "branding"],
    medium: "Video · Branding",
  },
  {
    slug: "sintra-fog",
    emoji: "📷",
    coverClass: "t-rose",
    coverHeight: "h-mid",
    featured: true,
    title: "Sintra fog — landscape series",
    year: "2025",
    client: "Personal",
    tags: ["photography"],
    medium: "Photography",
  },
  {
    slug: "botanica",
    emoji: "🌿",
    coverClass: "t-emerald",
    coverHeight: "h-low",
    title: "Botanica — calendar lettering",
    year: "2025",
    tags: ["illustration", "lettering"],
    medium: "Illustration · Lettering",
    client: "Botanica Magazine",
  },
  {
    slug: "cubica",
    emoji: "🧊",
    coverClass: "t-violet",
    coverHeight: "h-tall",
    title: "Cubica — 3D type explorations",
    year: "2024",
    client: "Personal",
    tags: ["3d"],
    medium: "3D · Branding",
  },
  {
    slug: "after-hours",
    emoji: "🌃",
    coverClass: "t-slate",
    coverHeight: "h-mid",
    title: "After hours — Lisbon nights",
    year: "2024",
    client: "Personal",
    tags: ["photography"],
    medium: "Photography",
  },
  {
    slug: "marca-cafe",
    emoji: "📐",
    coverClass: "t-sky",
    coverHeight: "h-low",
    title: "Marca Café — coffeeshop identity",
    year: "2024",
    client: "Marca",
    tags: ["branding"],
    medium: "Branding",
  },
  {
    slug: "petalo",
    emoji: "🌸",
    coverClass: "t-rose",
    coverHeight: "h-low",
    title: "Pétalo — perfume box illustration",
    year: "2024",
    client: "Pétalo Studio",
    tags: ["illustration"],
    medium: "Illustration",
  },
  {
    slug: "ferrocarril",
    emoji: "🚂",
    coverClass: "t-warm",
    coverHeight: "h-mid",
    title: "Ferrocarril — heritage railway poster set",
    year: "2023",
    client: "CP Comboios",
    tags: ["branding", "lettering"],
    medium: "Branding · Lettering",
  },
];

const CAROUSEL_ITEMS: CarouselItem[] = [
  { slug: "sourdough-and-co", title: "Sourdough & Co — bakery rebrand", year: "2026", client: "Lisbon, PT", colorClass: "t-warm", emoji: "🍞", tags: ["branding", "illustration"] },
  { slug: "norte-bank-film",  title: "Norte Bank — onboarding film",   year: "2025", client: "Norte Bank", colorClass: "t-slate", emoji: "▶", tags: ["video", "branding"] },
  { slug: "sintra-fog",       title: "Sintra fog — landscape series",  year: "2025", client: "Personal",   colorClass: "t-rose", emoji: "📷", tags: ["photography"] },
  { slug: "botanica",         title: "Botanica — calendar lettering",  year: "2025", client: "Botanica",   colorClass: "t-emerald", emoji: "🌿", tags: ["illustration", "lettering"] },
  { slug: "cubica",           title: "Cubica — 3D type explorations",  year: "2024", client: "Personal",   colorClass: "t-violet", emoji: "🧊", tags: ["3d", "branding"] },
  { slug: "marca-cafe",       title: "Marca Café — coffeeshop identity", year: "2024", client: "Marca",    colorClass: "t-sky", emoji: "📐", tags: ["branding"] },
];

const ALL_TAGS = ["branding", "illustration", "photography", "3d", "video", "lettering"] as const;

const GALLERY_ITEMS = [
  { emoji: "🍞", colorClass: "t-warm",    label: "Cover — wordmark + crest" },
  { emoji: "🥖", colorClass: "t-rose",    label: "Loaf wrapper" },
  { emoji: "🌾", colorClass: "t-emerald", label: "Seasonal illustration — winter" },
  { emoji: "🧁", colorClass: "",          label: "Loyalty card — pearl + foil" },
  { emoji: "📦", colorClass: "t-sky",     label: "Reusable tote" },
  { emoji: "🏷",  colorClass: "t-slate",   label: "Wood bread tags" },
];

const RELATED_PROJECTS: Array<{ slug: string; emoji: string; colorClass: string; title: string; year: string; tag: string }> = [
  { slug: "marca-cafe",  emoji: "📐", colorClass: "t-sky",     title: "Marca Café — coffeeshop identity",     year: "2024", tag: "branding" },
  { slug: "botanica",    emoji: "🌿", colorClass: "t-emerald", title: "Botanica — calendar lettering",         year: "2025", tag: "illustration" },
  { slug: "petalo",      emoji: "🌸", colorClass: "t-rose",    title: "Pétalo — perfume box illustration",     year: "2024", tag: "illustration" },
];

// ---------------------------------------------------------------------------
// Lightbox component
// ---------------------------------------------------------------------------
function Lightbox({
  activeIndex,
  onClose,
  onNav,
}: {
  activeIndex: number | null;
  onClose: () => void;
  onNav: (delta: number) => void;
}): ReactElement | null {
  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, onNav]);

  const item = activeIndex !== null ? GALLERY_ITEMS[activeIndex] : null;

  return (
    <div
      className={`cpp-lightbox-backdrop${isOpen ? " is-open" : ""}`}
      id="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="cpp-lb-close"
        onClick={onClose}
        aria-label="Close (Esc)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="cpp-lightbox">
        <div className={`cpp-lb-stage ${item?.colorClass ?? ""}`} aria-live="polite">
          {item?.emoji ?? "🖼"}
        </div>
        <div className="cpp-lb-cap">
          <b>
            {activeIndex !== null ? activeIndex + 1 : 1} / {GALLERY_ITEMS.length}
          </b>
          <span>·</span>
          <span>{item?.label ?? ""}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project card — masonry variant
// ---------------------------------------------------------------------------
function MasonryCard({
  project,
  onOpen,
}: {
  project: ProjectCard;
  onOpen: (slug: string) => void;
}): ReactElement {
  return (
    <button
      className="cpp-pcard-mason"
      data-tags={project.tags.join(",")}
      onClick={() => onOpen(project.slug)}
      aria-label={project.title}
    >
      <div
        className={`cpp-cover ${project.coverClass} ${project.coverHeight ?? ""}`}
        aria-hidden="true"
      >
        {project.emoji}
      </div>
      {project.featured && (
        <span className="cpp-featured-pin">★ Featured</span>
      )}
      {project.videoLabel && (
        <span className="cpp-video-pill">{project.videoLabel}</span>
      )}
      <div className="cpp-pcard-meta">
        <h3 className="cpp-pc-title">{project.title}</h3>
        <div className="cpp-pc-line">
          <span>
            {project.year}
            {project.client ? ` · ${project.client}` : ""}
          </span>
          {project.tags.map((tag) => (
            <span key={tag} className="cpp-pc-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Project card — grid variant
// ---------------------------------------------------------------------------
function GridCard({
  project,
  onOpen,
}: {
  project: ProjectCard;
  onOpen: (slug: string) => void;
}): ReactElement {
  return (
    <button
      className="cpp-pcard-grid"
      data-tags={project.tags.join(",")}
      onClick={() => onOpen(project.slug)}
      aria-label={project.title}
    >
      <div className={`cpp-cover ${project.coverClass}`} aria-hidden="true">
        {project.emoji}
      </div>
      {project.featured && (
        <span className="cpp-featured-pin">★ Featured</span>
      )}
      <div className="cpp-pcard-meta">
        <h3 className="cpp-pc-title">{project.title}</h3>
        <div className="cpp-pc-line">
          <span>{project.year}</span>
          {project.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="cpp-pc-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Pagination block
// ---------------------------------------------------------------------------
function Pagination(): ReactElement {
  const handleLoadMore = useCallback(() => {
    // TODO: load next page of projects
  }, []);

  const handlePageNav = useCallback((_page: number) => {
    // TODO: navigate to page
  }, []);

  return (
    <div className="cpp-pagination">
      <div className="cpp-pg-meta">
        Showing <b>1–9</b> of <b>47</b> projects
      </div>
      <div className="cpp-pg-controls">
        <button disabled aria-label="Previous">
          ←
        </button>
        <button className="is-current" aria-current="page" onClick={() => handlePageNav(1)}>
          1
        </button>
        {[2, 3, 4, 5].map((p) => (
          <button key={p} onClick={() => handlePageNav(p)}>
            {p}
          </button>
        ))}
        <button aria-label="Next" onClick={() => handlePageNav(2)}>
          →
        </button>
      </div>
      <button className="cpp-load-more" onClick={handleLoadMore}>
        {/* TODO: append next 9 projects */}
        Load more
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CreatorPortfolioPage(): ReactElement {
  const [pageView, setPageView] = useState<PageView>("list");
  const [layout, setLayout] = useState<LayoutMode>("masonry");
  const [activeTag, setActiveTag] = useState<string>("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string>("sourdough-and-co");

  const currentProject = PROJECTS.find((p) => p.slug === currentProjectSlug) ?? PROJECTS[0];

  // Filter projects by tag
  const filteredProjects = activeTag
    ? PROJECTS.filter((p) => p.tags.includes(activeTag))
    : PROJECTS;

  const handleOpenProject = useCallback((slug: string) => {
    // TODO: navigate to project page
    setCurrentProjectSlug(slug);
    setPageView("project");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToList = useCallback(() => {
    // TODO: navigate back to list
    setPageView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFilterByTag = useCallback((tag: string) => {
    // TODO: filter route
    setActiveTag(tag === activeTag ? "" : tag);
  }, [activeTag]);

  const handleSwitchLayout = useCallback((mode: LayoutMode) => {
    // TODO: update URL layout param
    setLayout(mode);
  }, []);

  const handleCarouselGoTo = useCallback((i: number) => {
    // TODO: animate carousel transition
    const len = CAROUSEL_ITEMS.length;
    setCarouselIndex(((i % len) + len) % len);
  }, []);

  const handleCarouselStep = useCallback(
    (delta: number) => handleCarouselGoTo(carouselIndex + delta),
    [carouselIndex, handleCarouselGoTo]
  );

  const handleOpenLightbox = useCallback((i: number) => {
    // TODO: open lightbox at index
    setLightboxIndex(i);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handleLightboxNav = useCallback(
    (delta: number) => {
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        const len = GALLERY_ITEMS.length;
        return ((prev + delta) % len + len) % len;
      });
    },
    []
  );

  const handleCopyLink = useCallback(() => {
    // TODO: copy project permalink to clipboard
  }, []);

  const handleShareX = useCallback(() => {
    // TODO: open X share dialog
  }, []);

  const handleShareEmail = useCallback(() => {
    // TODO: open mailto draft
  }, []);

  const handleOpenBehance = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: open Behance case study in new tab
  }, []);

  const handleSubscribeRss = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: open RSS feed in newsreader
  }, []);

  const handleEmailAboutProject = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: open email composer
  }, []);

  const carousel = CAROUSEL_ITEMS[carouselIndex];

  return (
    <div className="creator-portfolio-page">
      {/* Creator nav */}
      <nav className="cpp-nav">
        <a href="/" className="cpp-nav-handle">
          {/* TODO: link to creator home */}
          <span className="cpp-av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="cpp-nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/portfolio" className="is-current">Portfolio</a>
          <a href="/book">Book</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      {/* ============================================================
          VIEW: LIST (Masonry / Grid / Carousel)
          ============================================================ */}
      <section
        className={`cpp-view${pageView === "list" ? " is-current" : ""}`}
        id="view-list"
        data-view="list"
      >
        {/* Page hero */}
        <div className="cpp-hero">
          <h1>Selected work</h1>
          <p className="cpp-lede">
            A growing collection of brand systems, illustrations, and photography
            from the last six years. Available for commissions — Lisbon &amp;
            remote.
          </p>
          <div className="cpp-meta-line">
            <span>
              <b>{filteredProjects.length}</b> project
              {filteredProjects.length !== 1 ? "s" : ""} · 6 years
            </span>
            <span className="cpp-meta-dot" />
            <a href="#" onClick={handleSubscribeRss}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              Subscribe via RSS
            </a>
            <span className="cpp-meta-dot" />
            <a href="mailto:hello@alexandrasilva.studio" onClick={handleEmailAboutProject}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email me about a project
            </a>
          </div>

          {/* Controls */}
          <div className="cpp-controls">
            <div className="cpp-layout-switch" role="tablist" aria-label="Grid mode">
              {(["masonry", "grid", "carousel"] as LayoutMode[]).map((mode) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={layout === mode}
                  className={layout === mode ? "is-active" : ""}
                  onClick={() => handleSwitchLayout(mode)}
                >
                  {mode === "masonry" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="9" rx="1" />
                      <rect x="14" y="3" width="7" height="5" rx="1" />
                      <rect x="14" y="12" width="7" height="9" rx="1" />
                      <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                  )}
                  {mode === "grid" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  )}
                  {mode === "carousel" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="4" width="12" height="16" rx="2" />
                      <line x1="2" y1="12" x2="4" y2="12" />
                      <line x1="20" y1="12" x2="22" y2="12" />
                    </svg>
                  )}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div>
              <select className="cpp-sort-select" aria-label="Sort">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
          </div>

          {/* Tag bar */}
          <div className="cpp-tag-bar">
            <button
              className={`cpp-tag-chip${!activeTag ? " is-active" : ""}`}
              data-tag=""
              onClick={() => handleFilterByTag("")}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`cpp-tag-chip${activeTag === tag ? " is-active" : ""}`}
                data-tag={tag}
                onClick={() => handleFilterByTag(tag)}
              >
                {/* TODO: filter by tag */}
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Masonry ===== */}
        <div
          className={`cpp-layout-pane${layout === "masonry" ? " is-visible" : ""}`}
          id="layout-masonry"
        >
          <div className="cpp-layout-section">
            <span className="cpp-layout-tag">layout · masonry</span>
          </div>
          <div className="cpp-masonry">
            {filteredProjects.map((p) => (
              <MasonryCard key={p.slug} project={p} onOpen={handleOpenProject} />
            ))}
          </div>
          {filteredProjects.length === 0 && (
            <div className="cpp-empty-tag">
              <div className="emoji">🌿</div>
              <h3>
                No projects tagged "{activeTag}" yet
              </h3>
              <p>
                Try another tag, or{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); handleFilterByTag(""); }}>
                  view all projects
                </a>
                .
              </p>
            </div>
          )}
          <Pagination />
        </div>

        {/* ===== Grid ===== */}
        <div
          className={`cpp-layout-pane${layout === "grid" ? " is-visible" : ""}`}
          id="layout-grid"
        >
          <div className="cpp-layout-section">
            <span className="cpp-layout-tag">layout · grid</span>
          </div>
          <div className="cpp-uniform-grid">
            {filteredProjects.map((p) => (
              <GridCard key={p.slug} project={p} onOpen={handleOpenProject} />
            ))}
          </div>
          <Pagination />
        </div>

        {/* ===== Carousel ===== */}
        <div
          className={`cpp-layout-pane${layout === "carousel" ? " is-visible" : ""}`}
          id="layout-carousel"
        >
          <div className="cpp-layout-section">
            <span className="cpp-layout-tag">layout · carousel</span>
          </div>
          <div className="cpp-carousel">
            <div
              className={`cpp-carousel-stage ${carousel.colorClass}`}
              aria-live="polite"
            >
              <button
                className="cpp-carousel-arrow prev"
                aria-label="Previous project"
                onClick={() => handleCarouselStep(-1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="cpp-carousel-arrow next"
                aria-label="Next project"
                onClick={() => handleCarouselStep(1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="cpp-stage-cap">
                <h2 dangerouslySetInnerHTML={{ __html: carousel.title }} />
                <div className="cpp-stage-meta">
                  <span>{carousel.year}</span>
                  <span className="cpp-stage-dot" />
                  <span>{carousel.client}</span>
                  <span className="cpp-stage-dot" />
                  {carousel.tags.map((t) => (
                    <span key={t} className="cpp-stage-tag">
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  className="cpp-open-cta"
                  href={`#/project/${carousel.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: open project
                    handleOpenProject(carousel.slug);
                  }}
                >
                  Open case study →
                </a>
              </div>
            </div>

            {/* Dots */}
            <div className="cpp-carousel-dots" role="tablist" aria-label="Project navigation">
              {CAROUSEL_ITEMS.map((_, i) => (
                <button
                  key={i}
                  className={carouselIndex === i ? "is-current" : ""}
                  data-i={i}
                  onClick={() => handleCarouselGoTo(i)}
                  aria-label={`Project ${i + 1}`}
                />
              ))}
            </div>

            {/* Thumbnails */}
            <div className="cpp-carousel-thumbs">
              {CAROUSEL_ITEMS.map((item, i) => (
                <button
                  key={item.slug}
                  className={`${item.colorClass} ${carouselIndex === i ? "is-current" : ""}`}
                  data-i={i}
                  onClick={() => handleCarouselGoTo(i)}
                  aria-label={item.title}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          VIEW: SINGLE PROJECT (#/project/<slug>)
          ============================================================ */}
      <section
        className={`cpp-view${pageView === "project" ? " is-current" : ""}`}
        id="view-project"
        data-view="project"
      >
        <div
          className="cpp-project-cover-full"
          aria-hidden="true"
          style={{ background: `linear-gradient(135deg, #FDE68A, #F59E0B)` }}
        >
          {currentProject.emoji}
        </div>

        <article className="cpp-project-article">
          <h1>{currentProject.title}</h1>
          <div className="cpp-project-meta-row">
            <span className="cpp-meta-cell">
              <b>{currentProject.year}</b>
            </span>
            <span className="cpp-meta-row-dot" />
            <span className="cpp-meta-cell">
              Medium · <b>{currentProject.medium}</b>
            </span>
            <span className="cpp-meta-row-dot" />
            <span className="cpp-meta-cell">
              Client · <b>{currentProject.client ?? "Personal"}</b>
            </span>
            <div className="cpp-share">
              <button aria-label="Copy link" onClick={handleCopyLink}>
                {/* TODO: copy project permalink */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button aria-label="Share to X" onClick={handleShareX}>
                {/* TODO: open X share */}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h3l-7.5 8.6L22 22h-6.6l-5.2-6.8L4.4 22H1.4l8.1-9.3L1 2h6.7l4.7 6.2L18 2z" />
                </svg>
              </button>
              <button aria-label="Share via email" onClick={handleShareEmail}>
                {/* TODO: open mailto draft */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </button>
            </div>
          </div>
        </article>

        <div className="cpp-project-body">
          <p>
            A four-month rebrand for a Lisbon neighborhood bakery — identity
            system, packaging across twelve SKUs, three custom illustrations for
            the seasonal range, and a printed loyalty card you genuinely want to
            keep in your wallet.
          </p>
          <p>
            The wordmark uses a single-stroke italic to evoke a baker's quick
            chalk hand on a paper bag. The seal sits in a softened crest —
            formal enough for the loaf wrappers, friendly enough for the kids'
            birthday boxes.
          </p>
          <h2>Brief</h2>
          <p>
            Sourdough &amp; Co opened in 2018 with a logo cobbled together from
            a photo of a vintage Portuguese bakery sign. They wanted an identity
            that could grow with them — three more locations were already on the
            roadmap.
          </p>
          <blockquote>
            "We needed something that doesn't shrink. The old logo only worked at
            the size we found it. The new one had to read on a 5cm sticker and a
            2-metre awning."
          </blockquote>
          <h2>Process</h2>
          <ul>
            <li>
              Two weeks of café visits + interviews with the head baker, two
              staff, six regulars
            </li>
            <li>
              Three rounds of mark exploration; the chalk-italic landed in round
              2
            </li>
            <li>
              Packaging system: paper bags + wax-paper sheets + wooden bread
              tags + reusable cotton totes
            </li>
            <li>
              Custom illustrations for the seasonal range (winter, spring,
              summer, fall) — printed in two-colour
            </li>
            <li>
              Loyalty card in pearl card stock with hot foil — the "want to keep"
              object
            </li>
          </ul>
          <h2>Outcome</h2>
          <p>
            Six months in, two new locations opened with the system applied
            end-to-end. The seasonal illustrations now drive an Instagram
            following the bakery did not have before — the original ask was
            identity, the unexpected outcome was content.
          </p>
        </div>

        {/* Gallery */}
        <div className="cpp-gallery">
          {GALLERY_ITEMS.map((item, i) => (
            <button
              key={i}
              className={`cpp-gthumb ${item.colorClass}`}
              onClick={() => handleOpenLightbox(i)}
              aria-label={`Gallery image ${i + 1}`}
            >
              {/* TODO: open lightbox at index */}
              {item.emoji}
              <span className="cpp-zoom-pill">
                {i + 1} / {GALLERY_ITEMS.length}
              </span>
            </button>
          ))}
        </div>

        {/* Collaborators */}
        <div className="cpp-collabs">
          <h3>Made with</h3>
          <div className="cpp-collab-list">
            {[
              { initial: "M", name: "Maya Chen", role: "Co-illustration" },
              { initial: "T", name: "Tomás Reis", role: "Print & production" },
            ].map((c) => (
              <div key={c.name} className="cpp-collab-card">
                <div className="cpp-collab-av">{c.initial}</div>
                <div className="cpp-collab-who">
                  <div className="cpp-collab-name">{c.name}</div>
                  <div className="cpp-collab-role">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* External CTA */}
        <div className="cpp-ext-cta">
          <a
            href="https://behance.net/alexandra/sourdough"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenBehance}
          >
            View full case study on Behance
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Project tags */}
        <div className="cpp-project-tags">
          {["branding", "illustration", "lettering"].map((tag) => (
            <button
              key={tag}
              className="cpp-tag-chip"
              onClick={() => {
                // TODO: filter by tag and return to list
                handleFilterByTag(tag);
                handleBackToList();
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Related */}
        <div className="cpp-related">
          <h2>Related projects</h2>
          <div className="cpp-related-grid">
            {RELATED_PROJECTS.map((rp) => (
              <button
                key={rp.slug}
                className="cpp-pcard-grid"
                onClick={() => handleOpenProject(rp.slug)}
                aria-label={rp.title}
              >
                <div className={`cpp-cover ${rp.colorClass}`} aria-hidden="true">
                  {rp.emoji}
                </div>
                <div className="cpp-pcard-meta">
                  <h3 className="cpp-pc-title">{rp.title}</h3>
                  <div className="cpp-pc-line">
                    <span>{rp.year}</span>
                    <span className="cpp-pc-tag">{rp.tag}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cpp-footer">
        <div className="cpp-socials">
          {[
            { icon: "📸", label: "Instagram" },
            { icon: "🅑", label: "Behance" },
            { icon: "🏀", label: "Dribbble" },
            { icon: "✉️", label: "Email" },
          ].map(({ icon, label }) => (
            <a
              key={label}
              href="#"
              className="cpp-social"
              title={label}
              aria-label={label}
              onClick={(e) => {
                e.preventDefault();
                // TODO: open social link
              }}
            >
              {icon}
            </a>
          ))}
        </div>
        <div className="cpp-ftr-row">
          Powered by{" "}
          <span style={{ fontFamily: "var(--font-display)" }}>tadaify</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              // TODO: link to tadaify landing
            }}
          >
            get yours free →
          </a>
        </div>
      </footer>

      {/* Lightbox */}
      <Lightbox
        activeIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        onNav={handleLightboxNav}
      />
    </div>
  );
}
