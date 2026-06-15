/**
 * Public Portfolio page — what a visitor sees at tadaify.com/<handle>/portfolio.
 * Faithful port of mockups/tadaify-mvp/creator-portfolio-public.html, which
 * demos five sub-views in one file via hash routing: the project LIST in three
 * switchable layouts (masonry / grid / carousel), an optional tag-filtered list,
 * and a SINGLE PROJECT case study (cover, body, gallery + lightbox,
 * collaborators, external CTA, tags, related). Presentational + local React
 * state only; content from typed fixtures. The mockup opened projects via hash
 * routing — here projects open via local state and an explicit "Back to all
 * work" control replaces the browser back button. The top-strip theme toggle is
 * a mockup-only aid for reviewing both palettes.
 *
 * @implements fr-creator-portfolio-public
 */
import { useEffect, useState } from "react";
import "./creator-portfolio-public-proto.css";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import {
  portfolioContentFixture,
  type CoverTint,
  type MasonryHeight,
  type ProjectBodyBlock,
} from "./creatorPortfolioPublicFixture";

type LayoutMode = "masonry" | "grid" | "carousel";

const TINT_CLASS: Record<CoverTint, string> = {
  indigo: "",
  warm: "t-warm",
  rose: "t-rose",
  emerald: "t-emerald",
  slate: "t-slate",
  sky: "t-sky",
  violet: "t-violet",
};

const HEIGHT_CLASS: Record<MasonryHeight, string> = {
  tall: "h-tall",
  mid: "h-mid",
  low: "h-low",
};

function ProjectBody({ blocks }: { blocks: ProjectBodyBlock[] }) {
  return (
    <div className="project-body">
      {blocks.map((b, i) => {
        if (b.kind === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.kind === "blockquote") return <blockquote key={i}>{b.text}</blockquote>;
        if (b.kind === "ul")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

export function CreatorPortfolioPublicScreen() {
  const c = portfolioContentFixture();
  const [view, setView] = useState<"list" | "project">("list");
  const [layout, setLayout] = useState<LayoutMode>("masonry");
  const [activeTag, setActiveTag] = useState<string>("");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const single = c.single;
  const gallery = single.gallery;

  const openProject = () => {
    setView("project");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const backToList = () => {
    setView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const filterByTag = (tag: string) => {
    setActiveTag(tag);
    setView("list");
    setLayout("masonry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const switchLayout = (mode: LayoutMode) => setLayout(mode);

  const carouselGoTo = (i: number) => {
    const n = c.carousel.length;
    setCarouselIdx(((i % n) + n) % n);
  };

  const visibleProjects = activeTag
    ? c.projects.filter((p) => p.tags.includes(activeTag))
    : c.projects;
  const isEmpty = activeTag !== "" && visibleProjects.length === 0;

  // Lightbox keyboard nav (Esc / arrows), mirrors the mockup.
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? 0 : (i + 1) % gallery.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIdx, gallery.length]);

  const urlTail =
    view === "project"
      ? `portfolio/${single.slug}`
      : activeTag
        ? `portfolio?tag=${activeTag}`
        : layout === "masonry"
          ? "portfolio"
          : `portfolio?layout=${layout}`;

  const slide = c.carousel[carouselIdx];

  return (
    <div className="proto-root proto-portfolio-public">
      {/* Mockup-only top strip */}
      <div className="public-topstrip">
        <a href="/__proto" className="text-muted">← back to prototype hub</a>
        <span className="flex items-center gap-3">
          <span className="url">tadaify.com/{c.hero.handle}/{urlTail}</span>
          <ThemeToggle />
        </span>
      </div>

      {/* Canonical creator home nav (inherited chrome) */}
      <nav className="creator-nav">
        <a href="/__proto/creator-public" className="cn-handle">
          <span className="av" aria-hidden="true">{c.hero.initial}</span>
          {c.hero.name}
        </a>
        <div className="cn-links">
          {c.nav.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.current ? "is-current" : undefined}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── VIEW 1 — LIST (masonry / grid / carousel) ── */}
      {view === "list" && (
        <section className="view" aria-label="Project list">
          <div className="page-hero">
            <h1>{c.hero.title}</h1>
            <p className="lede">{c.hero.lede}</p>
            <div className="meta-line">
              <span><b>{activeTag ? visibleProjects.length : c.hero.projectCount}</b> projects · {c.hero.span}</span>
              <span className="dot" />
              <button type="button" className="linklike" onClick={() => alert("Mockup — opens RSS in newsreader")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
                </svg>
                Subscribe via RSS
              </button>
              <span className="dot" />
              <button type="button" className="linklike" onClick={() => alert("Mockup — opens email composer")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Email me about a project
              </button>
            </div>

            <div className="controls">
              <div className="layout-switch" role="tablist" aria-label="Grid mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={layout === "masonry"}
                  className={layout === "masonry" ? "is-active" : undefined}
                  onClick={() => switchLayout("masonry")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
                  Masonry
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={layout === "grid"}
                  className={layout === "grid" ? "is-active" : undefined}
                  onClick={() => switchLayout("grid")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                  Grid
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={layout === "carousel"}
                  className={layout === "carousel" ? "is-active" : undefined}
                  onClick={() => switchLayout("carousel")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
                  Carousel
                </button>
              </div>

              <div className="sort-wrap">
                <select aria-label="Sort" defaultValue="newest">
                  {c.sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tag-bar">
              <button
                type="button"
                className={`tag-chip${activeTag === "" ? " is-active" : ""}`}
                onClick={() => filterByTag("")}
              >
                All
              </button>
              {c.tags.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  className={`tag-chip${activeTag === t.slug ? " is-active" : ""}`}
                  onClick={() => filterByTag(t.slug)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Layout sub-view: MASONRY ── */}
          {layout === "masonry" && (
            <>
              <div className="layout-section">
                <span className="layout-tag">layout · masonry</span>
              </div>
              {isEmpty ? (
                <div className="empty-tag">
                  <div className="emoji" aria-hidden="true">🌿</div>
                  <h3>No projects tagged "{activeTag}" yet</h3>
                  <p>
                    Try another tag, or{" "}
                    <button type="button" className="linklike" onClick={() => filterByTag("")}>view all projects</button>.
                  </p>
                </div>
              ) : (
                <div className="masonry">
                  {visibleProjects.map((p) => (
                    <button type="button" className="pcard-mason" key={p.slug} onClick={openProject}>
                      <div className={`cover ${HEIGHT_CLASS[p.height]} ${TINT_CLASS[p.cover]}`} aria-hidden="true">{p.emoji}</div>
                      {p.featured && <span className="featured-pin">★ Featured</span>}
                      {p.videoPill && <span className="video-pill">▶ {p.videoPill}</span>}
                      <div className="meta">
                        <h3 className="pc-title">{p.title}</h3>
                        <div className="pc-line">
                          <span>{p.yearLine}</span>
                          {p.tags.map((tag) => (
                            <span className="pc-tag" key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Layout sub-view: GRID ── */}
          {layout === "grid" && (
            <>
              <div className="layout-section">
                <span className="layout-tag">layout · grid</span>
              </div>
              {isEmpty ? (
                <div className="empty-tag">
                  <div className="emoji" aria-hidden="true">🌿</div>
                  <h3>No projects tagged "{activeTag}" yet</h3>
                  <p>
                    Try another tag, or{" "}
                    <button type="button" className="linklike" onClick={() => filterByTag("")}>view all projects</button>.
                  </p>
                </div>
              ) : (
                <div className="uniform-grid">
                  {visibleProjects.map((p) => (
                    <button type="button" className="pcard-grid" key={p.slug} onClick={openProject}>
                      <div className={`cover ${TINT_CLASS[p.cover]}`} aria-hidden="true">{p.emoji}</div>
                      {p.featured && <span className="featured-pin">★ Featured</span>}
                      <div className="meta">
                        <h3 className="pc-title">{p.title}</h3>
                        <div className="pc-line">
                          <span>{p.gridYear}</span>
                          <span className="pc-tag">{p.tags[0]}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Layout sub-view: CAROUSEL ── */}
          {layout === "carousel" && (
            <>
              <div className="layout-section">
                <span className="layout-tag">layout · carousel</span>
              </div>
              <div className="carousel">
                <div className={`carousel-stage ${TINT_CLASS[slide.cover]}`} aria-live="polite">
                  <button type="button" className="carousel-arrow prev" aria-label="Previous project" onClick={() => carouselGoTo(carouselIdx - 1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button type="button" className="carousel-arrow next" aria-label="Next project" onClick={() => carouselGoTo(carouselIdx + 1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                  <div className="stage-cap">
                    <h2>{slide.title}</h2>
                    <div className="stage-meta">
                      <span>{slide.year}</span>
                      <span className="dot" />
                      <span>{slide.client}</span>
                      <span className="dot" />
                      {slide.tags.map((tag) => (
                        <span className="pc-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                    <button type="button" className="open-cta" onClick={openProject}>Open case study →</button>
                  </div>
                </div>

                <div className="carousel-dots" role="tablist" aria-label="Project navigation">
                  {c.carousel.map((s, i) => (
                    <button
                      key={s.slug}
                      type="button"
                      className={i === carouselIdx ? "is-current" : undefined}
                      aria-label={`Project ${i + 1}`}
                      onClick={() => carouselGoTo(i)}
                    />
                  ))}
                </div>

                <div className="carousel-thumbs">
                  {c.carousel.map((s, i) => (
                    <button
                      key={s.slug}
                      type="button"
                      className={`${TINT_CLASS[s.cover]}${i === carouselIdx ? " is-current" : ""}`}
                      aria-label={s.title}
                      onClick={() => carouselGoTo(i)}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isEmpty && layout !== "carousel" && (
            <div className="pagination">
              <div className="pg-meta">
                Showing <b>{c.pagination.rangeStart}–{c.pagination.rangeEnd}</b> of <b>{c.pagination.total}</b> projects
              </div>
              <div className="pg-controls">
                <button disabled aria-label="Previous">←</button>
                {c.pagination.pages.map((n) => (
                  <button
                    key={n}
                    className={n === c.pagination.current ? "is-current" : undefined}
                    aria-current={n === c.pagination.current ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button aria-label="Next">→</button>
              </div>
              <button className="load-more" onClick={() => alert("Mockup — appends next 9 projects")}>Load more</button>
            </div>
          )}
        </section>
      )}

      {/* ── VIEW 2 — SINGLE PROJECT ── */}
      {view === "project" && (
        <section className="view" aria-label="Project case study">
          <div className={`project-cover-full ${TINT_CLASS[single.cover]}`} aria-hidden="true">{single.emoji}</div>

          <div className="project-back">
            <button type="button" onClick={backToList}>← Back to all work</button>
          </div>

          <article className="project-article">
            <h1>{single.title}</h1>
            <div className="project-meta-row">
              <span className="meta-cell"><b>{single.year}</b></span>
              <span className="dot" />
              <span className="meta-cell">Medium · <b>{single.medium}</b></span>
              <span className="dot" />
              <span className="meta-cell">Client · <b>{single.client}</b></span>
              <div className="share">
                <button aria-label="Copy link" onClick={() => alert("Mockup — link copied")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                </button>
                <button aria-label="Share to X" onClick={() => alert("Mockup — opens share dialog")}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h3l-7.5 8.6L22 22h-6.6l-5.2-6.8L4.4 22H1.4l8.1-9.3L1 2h6.7l4.7 6.2L18 2z" /></svg>
                </button>
                <button aria-label="Share via email" onClick={() => alert("Mockup — opens mailto draft")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </button>
              </div>
            </div>
          </article>

          <ProjectBody blocks={single.body} />

          {/* Multi-image gallery — thumbs open the lightbox */}
          <div className="gallery">
            {gallery.map((g, i) => (
              <button
                type="button"
                className={`gthumb ${TINT_CLASS[g.cover]}`}
                key={i}
                aria-label={`Gallery image ${i + 1}`}
                onClick={() => setLightboxIdx(i)}
              >
                {g.emoji}
                <span className="zoom-pill">{i + 1} / {gallery.length}</span>
              </button>
            ))}
          </div>

          {/* Collaborators */}
          <div className="collabs">
            <h3>Made with</h3>
            <div className="collab-list">
              {single.collaborators.map((collab) => (
                <div className="collab-card" key={collab.name}>
                  <div className="av" aria-hidden="true">{collab.initial}</div>
                  <div className="who">
                    <div className="name">{collab.name}</div>
                    <div className="role">{collab.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External CTA */}
          <div className="ext-cta">
            <a
              href={single.externalCta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.preventDefault(); alert("Mockup — opens Behance case study in new tab"); }}
            >
              {single.externalCta.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
          </div>

          {/* Project tags — clicking returns to the masonry list filtered */}
          <div className="project-tags">
            {single.tags.map((tag) => (
              <button type="button" className="tag-chip" key={tag} onClick={() => filterByTag(tag)}>{tag}</button>
            ))}
          </div>

          {/* Related projects */}
          <div className="related">
            <h2>Related projects</h2>
            <div className="related-grid">
              {single.related.map((r) => (
                <button type="button" className="pcard-grid" key={r.slug} onClick={openProject}>
                  <div className={`cover ${TINT_CLASS[r.cover]}`} aria-hidden="true">{r.emoji}</div>
                  <div className="meta">
                    <h3 className="pc-title">{r.title}</h3>
                    <div className="pc-line"><span>{r.year}</span><span className="pc-tag">{r.tag}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer (mirror creator-public social block) ── */}
      <footer className="creator-footer">
        <div className="socials">
          {c.socials.map((s) => (
            <button
              type="button"
              key={s.label}
              className="social"
              title={s.label}
              aria-label={s.label}
              onClick={() => alert(`Mockup — opens ${s.label}`)}
            >
              {s.glyph}
            </button>
          ))}
        </div>
        <div className="ftr-row">
          {c.footerNote} <Wordmark size="sm" />
          <span style={{ opacity: 0.6 }}>·</span>
          <a href="#">get yours free →</a>
        </div>
      </footer>

      {/* ── Lightbox (centered modal — no right-drawer) ── */}
      {lightboxIdx !== null && (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxIdx(null); }}
        >
          <button className="lb-close" onClick={() => setLightboxIdx(null)} aria-label="Close (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <div className="lightbox">
            <div className={`lb-stage ${TINT_CLASS[gallery[lightboxIdx].cover]}`} aria-live="polite">{gallery[lightboxIdx].emoji}</div>
            <div className="lb-cap">
              <button
                type="button"
                className="lb-nav"
                aria-label="Previous image"
                onClick={() => setLightboxIdx((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length))}
              >
                ←
              </button>
              <b>{lightboxIdx + 1} / {gallery.length}</b>
              <span>·</span>
              <span>{gallery[lightboxIdx].name}</span>
              <button
                type="button"
                className="lb-nav"
                aria-label="Next image"
                onClick={() => setLightboxIdx((i) => (i === null ? 0 : (i + 1) % gallery.length))}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
