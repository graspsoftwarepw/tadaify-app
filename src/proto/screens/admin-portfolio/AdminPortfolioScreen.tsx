/**
 * Administration → Portfolio — the creator-facing day-to-day project-management
 * view. Faithful port of mockups/tadaify-mvp/app-admin-portfolio.html, composed
 * on the shared DashboardChrome (appbar + sidebar) with the Administration ·
 * Portfolio nav entry marked current. Pairs with the Portfolio page editor,
 * which owns page-level layout/visitor controls.
 *
 * Presentational, local-state only: a demo state switcher (no-page / empty /
 * filled), status filter tabs, and a centred project composer modal that closes
 * on Escape, the close/Cancel control and a backdrop click. Data comes from the
 * typed adminPortfolioFixture.
 *
 * @implements fr-admin-portfolio
 * @implements fr-globalui-view-layout
 */
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  adminPortfolioFixture,
  type ProjectCard,
  type ProjectStatus,
} from "./adminPortfolioFixture";
import "./admin-portfolio-proto.css";

const noop = () => alert("Mockup — not wired up");

type DemoState = "no-page" | "empty" | "filled";

const STATUS_CHIP: Record<ProjectStatus, { cls: string; label: string }> = {
  published: { cls: "live", label: "● Published" },
  draft: { cls: "draft", label: "○ Draft" },
  archived: { cls: "archived", label: "📦 Archived" },
};

function EditIcon() {
  return (
    <S w={16}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </S>
  );
}

function MoreIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function ProjectGridCard({ project }: { project: ProjectCard }) {
  const status = STATUS_CHIP[project.status];
  return (
    <article className="ap-card">
      <div className={`ap-cover ap-tone-${project.tone}`}>
        <div className="ap-badge-row">
          <span className={`chip ${status.cls}`}>{status.label}</span>
          {project.featured && <span className="chip featured">★ Featured</span>}
        </div>
        <span className="ap-drag-handle" aria-hidden>⋮⋮</span>
        <span className="ap-cover-glyph" aria-hidden>{project.glyph}</span>
      </div>
      <div className="ap-meta">
        <h4 className="ap-title">{project.title}</h4>
        <div className="ap-sub">
          <span>{project.category}</span>
          <span aria-hidden>·</span>
          <span>{project.meta}</span>
        </div>
      </div>
      <div className="ap-card-actions">
        <button className="iconbtn" type="button" aria-label="Edit project" onClick={noop}>
          <EditIcon />
        </button>
        <button className="iconbtn" type="button" aria-label="More actions" onClick={noop}>
          <MoreIcon />
        </button>
      </div>
    </article>
  );
}

export function AdminPortfolioScreen() {
  const profile = dashboardProfileFixture();
  const fx = adminPortfolioFixture();

  const [demoState, setDemoState] = useState<DemoState>("filled");
  const [activeTab, setActiveTab] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);

  const openComposer = () => setComposerOpen(true);
  const closeComposer = () => setComposerOpen(false);

  useEffect(() => {
    if (!composerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeComposer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composerOpen]);

  return (
    <DashboardChrome profile={profile} activeNav="admin-portfolio">
      <div className="proto-admin-portfolio">
        {/* ── Breadcrumb ── */}
        <nav className="ap-crumb" aria-label="Breadcrumb">
          <a href="/__proto/dashboard">Dashboard</a>
          <span className="sep" aria-hidden>/</span>
          <span className="here">Administration · Portfolio</span>
        </nav>

        {/* ── Page header ── */}
        <header className="ap-page-head">
          <div>
            <h1>
              <span className="ph-emoji" aria-hidden>🎨</span> Projects
            </h1>
            <div className="ap-sub-line">
              Add, edit, and reorder projects. Page-level setup (layout, items per row,
              visitor controls) lives in{" "}
              <a className="ap-inline-link" href="/__proto/page-portfolio">Pages → Portfolio</a>.
            </div>
          </div>
          {demoState !== "no-page" && (
            <div className="ap-head-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={noop}>Bulk import</button>
              <button className="btn btn-primary" type="button" onClick={openComposer}>＋ New project</button>
            </div>
          )}
        </header>

        {/* ── STATE: NO PAGE ── */}
        {demoState === "no-page" && (
          <section>
            <div className="ap-empty">
              <div className="ap-empty-icon" aria-hidden>🎨</div>
              <h3>You don't have a Portfolio page yet</h3>
              <p>
                Portfolio is your project showcase — case studies, design work, photography, code
                repos, anything that proves you can do the thing. Add a Portfolio page first, then
                come back here to publish projects.
              </p>
              <div className="ap-empty-actions">
                <button className="btn btn-primary" type="button" onClick={noop}>＋ Add Portfolio page now</button>
                <button className="btn btn-ghost" type="button" onClick={noop}>Skip — what is Portfolio?</button>
              </div>
            </div>
          </section>
        )}

        {/* ── STATE: EMPTY ── */}
        {demoState === "empty" && (
          <section>
            <div className="ap-empty">
              <div className="ap-empty-icon" aria-hidden>🎨</div>
              <h3>No projects yet</h3>
              <p>
                Your Portfolio page is live at <code>{fx.pageUrl}</code>. Start with one of these
                templates or create from scratch.
              </p>
              <div className="ap-empty-actions">
                <button className="btn btn-primary" type="button" onClick={openComposer}>＋ Add first project</button>
              </div>
              <div className="ap-templates">
                {fx.templates.map((t) => (
                  <button className="ap-template-card" type="button" key={t.name} onClick={openComposer}>
                    <div className="t-name">{t.name}</div>
                    <div className="t-sub">{t.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── STATE: FILLED ── */}
        {demoState === "filled" && (
          <section>
            <div className="ap-section">
              <div className="ap-section-head">
                <h2>Projects</h2>
                <span className="ap-section-sub">{fx.summary}</span>
              </div>
              <div className="ap-section-body">
                <div className="ap-toolbar">
                  <div className="ap-tabs" role="tablist" aria-label="Filter projects by status">
                    {fx.tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`ap-tab${activeTab === tab.id ? " is-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label} <span className="ap-tab-count">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ap-search-wrap">
                    <S w={14}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>
                    <input type="search" placeholder="Search projects…" aria-label="Search projects" />
                  </div>
                  <select className="ap-sort-select" aria-label="Sort projects" defaultValue={fx.sortOptions[0]}>
                    {fx.sortOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="ap-grid">
                  {fx.projects.map((p) => (
                    <ProjectGridCard project={p} key={p.id} />
                  ))}
                </div>

                <div className="ap-pagination">
                  <button className="ap-page-btn" type="button" aria-label="Previous page" onClick={noop}>‹</button>
                  {fx.pages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`ap-page-btn${Number(p) === fx.currentPage ? " is-current" : ""}`}
                      aria-current={Number(p) === fx.currentPage ? "page" : undefined}
                      onClick={noop}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="ap-page-btn" type="button" aria-label="Next page" onClick={noop}>›</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Demo state switcher ── */}
        <div className="ap-demo-switch">
          <span className="ap-demo-label">Demo state:</span>
          {(["filled", "empty", "no-page"] as DemoState[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-ghost btn-sm${demoState === s ? " is-active" : ""}`}
              aria-pressed={demoState === s}
              onClick={() => setDemoState(s)}
            >
              {s === "filled" ? "Filled (12 projects)" : s === "empty" ? "Empty (page exists, 0 projects)" : "No Portfolio page yet"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Project composer modal ── */}
      {composerOpen && (
        <div
          className="ap-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ap-composer-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeComposer(); }}
        >
          <div className="ap-modal">
            <div className="ap-modal-head">
              <h3 id="ap-composer-title">New project</h3>
              <span className="chip draft">○ Draft</span>
              <span className="ap-head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={closeComposer}>
                <S w={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="ap-modal-body">
              <button className="ap-cover-uploader" type="button" onClick={noop}>
                <div className="cu-emoji" aria-hidden>🖼</div>
                <b>Drop cover image here</b> or click to upload
                <div className="cu-sub">PNG / JPG / WebP · max 5MB · 1600×1200 recommended</div>
              </button>

              <div className="ap-field">
                <label className="ap-field-label" htmlFor="ap-title">Title</label>
                <input id="ap-title" className="ap-field-input" type="text" placeholder="Stellar Coffee Co. — Brand Identity" />
              </div>

              <div className="ap-field-row">
                <div className="ap-field">
                  <label className="ap-field-label" htmlFor="ap-category">Category</label>
                  <select id="ap-category" className="ap-field-select">
                    {fx.composerCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="ap-field">
                  <label className="ap-field-label" htmlFor="ap-slug">URL slug</label>
                  <input id="ap-slug" className="ap-field-input" type="text" placeholder="auto-generated-from-title" />
                </div>
              </div>

              <div className="ap-field">
                <label className="ap-field-label" htmlFor="ap-short">Short description (visitor card)</label>
                <textarea id="ap-short" className="ap-field-area" placeholder="One sentence that earns the click." />
              </div>

              <div className="ap-field">
                <label className="ap-field-label" htmlFor="ap-long">Long description (project page)</label>
                <textarea id="ap-long" className="ap-field-area ap-field-area-tall" placeholder="Problem → process → result. Markdown supported." />
              </div>

              <div className="ap-field">
                <span className="ap-field-label">Gallery</span>
                <div className="ap-gallery-thumbs">
                  <button className="ap-gallery-thumb" type="button" aria-label="Gallery image" onClick={noop}>📷</button>
                  <button className="ap-gallery-thumb" type="button" aria-label="Gallery image" onClick={noop}>📷</button>
                  <button className="ap-gallery-thumb" type="button" aria-label="Gallery image" onClick={noop}>📷</button>
                  <button className="ap-gallery-thumb add" type="button" aria-label="Add image" onClick={noop}>＋</button>
                </div>
              </div>

              <div className="ap-field-row">
                <div className="ap-field">
                  <label className="ap-field-label" htmlFor="ap-link">External link (optional)</label>
                  <input id="ap-link" className="ap-field-input" type="url" placeholder="https://stellar-coffee.com" />
                </div>
                <div className="ap-field">
                  <label className="ap-field-label" htmlFor="ap-tags">Tags (comma-separated)</label>
                  <input id="ap-tags" className="ap-field-input" type="text" placeholder="brand, packaging, illustration" />
                </div>
              </div>
            </div>
            <div className="ap-modal-foot">
              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={closeComposer}>Delete draft</button>
              <span className="ap-foot-spacer" />
              <button className="btn btn-ghost" type="button" onClick={closeComposer}>Save draft</button>
              <button className="btn btn-primary" type="button" onClick={closeComposer}>Publish</button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
