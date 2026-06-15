/**
 * Portfolio page editor — the creator-facing editor a creator opens at
 * Pages > Portfolio. Faithful port of
 * mockups/tadaify-mvp/app-page-portfolio.html, composed on the shared
 * EditorShell + Section primitives. Pairs with the public visitor view
 * (creator-portfolio-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish / RSS / tag
 * pills / visitor filter UI, pick a page-background swatch, pick a grid-mode
 * layout card, tune items-per-row + cover sizing, filter the project list, flip
 * empty ↔ filled, open the new/edit project composer modal (cover media kind
 * tabs, gallery, multi-select category/tags, collaborators, featured, schedule),
 * and a dirty-on-edit save bar. Day-to-day project management lives in
 * Administration → Portfolio (a callout links there); this page is page-level
 * setup only. Premium fields (collaborators, featured cap, far-future
 * scheduling) stay fully visible and interactive — the gate is mocked at Save.
 * Data comes from the typed portfolioEditorFixture.
 *
 * @implements fr-page-editor-portfolio
 */
import { useState } from "react";
import {
  EditorShell,
  useEscapeKey,
  EditorIcon as S,
  Field,
  FieldRow,
  RowToggle,
  Section,
  TierHint,
  type SaveState,
} from "./EditorShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { portfolioEditorFixture, type PortfolioGridMode, type PortfolioProject } from "./portfolioEditorFixture";

const PORTFOLIO_PAGE_SUBITEM = {
  id: "portfolio",
  label: "Portfolio",
  href: "/__proto/page-portfolio",
  icon: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
};

const STATUS_LABEL: Record<PortfolioProject["status"], string> = {
  live: "Published",
  draft: "Draft",
  archived: "Archived",
};

const GRID_MODES: { value: PortfolioGridMode; name: string; sub: string }[] = [
  { value: "masonry", name: "Masonry", sub: "Pinterest-style — asymmetric heights. Best for mixed photo + illustration." },
  { value: "grid", name: "Grid", sub: "Uniform squares — clean, editorial. Designers + branding studios." },
  { value: "carousel", name: "Carousel", sub: "One project at a time, full-bleed. Filmmakers, photographers, single-hero work." },
];

const Grip = () => (
  <S w={16}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
);
const Kebab = () => (
  <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
);

const GALLERY = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#FB7185,#BE185D)",
  "linear-gradient(135deg,#34D399,#047857)",
  "linear-gradient(135deg,#FDE68A,#F59E0B)",
  "linear-gradient(135deg,#38BDF8,#0369A1)",
];

export function PortfolioEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = portfolioEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [rss, setRss] = useState(fx.rss);
  const [showTags, setShowTags] = useState(fx.showTags);
  const [showFilters, setShowFilters] = useState(fx.showFilters);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [gridMode, setGridMode] = useState(fx.layout.gridMode);
  const [perRow, setPerRow] = useState(fx.layout.itemsPerRow);
  const [filter, setFilter] = useState("All");
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [featured, setFeatured] = useState(true);
  const [projModal, setProjModal] = useState<null | "new" | "edit">(null);

  useEscapeKey(() => { setProjModal(null); });

  const dirty = () => setSaveState("dirty");
  const shown = filter === "All" ? fx.projects : fx.projects.filter((p) => p.tags.includes(filter.toLowerCase()));

  return (
    <EditorShell
      profile={profile}
      emoji="🎨"
      title="Portfolio"
      description="Show your best work in a visual gallery — projects, case studies, photos, films, builds. Visitors filter by tag."
      slug={fx.slug}
      live={live}
      pageId="portfolio"
      pageSubItems={[PORTFOLIO_PAGE_SUBITEM]}
      saveState={saveState}
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerActions={
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => alert("Mockup — opens the public page in a new tab")}>
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </button>
      }
    >
      {/* ── Page settings ── */}
      <Section title="Page settings" sub="Title, URL, visibility, RSS and SEO for the Portfolio page itself.">
        <FieldRow>
          <Field label="Page title" hint="shown as the <h1> on the public portfolio">
            <input className="pe-input" type="text" defaultValue={fx.pageTitle} onChange={dirty} />
          </Field>
          <Field label="URL slug" hint="letters, numbers, hyphens">
            <div className="pe-prefix-wrap">
              <span className="pe-prefix">tadaify.com/{profile.handle}/</span>
              <input type="text" defaultValue={fx.slug} onChange={dirty} />
            </div>
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Publish">
            <RowToggle name="Page is live" sub="Visitors can find this portfolio at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
          </Field>
          <Field label="RSS feed">
            <RowToggle name="Enable RSS" sub={<>Serve <span className="pe-mono">/portfolio/feed.xml</span> so newsreaders pick up new projects.</>} on={rss} onChange={(v) => { setRss(v); dirty(); }} />
          </Field>
        </FieldRow>

        <Field label="Page background" hint="override theme colour for this page only">
          <div className="pe-swatch-row">
            {fx.backgrounds.map((sw, i) => (
              <button key={sw.name} type="button" className={`pe-swatch${i === bg ? " is-selected" : ""}`} style={{ background: sw.css }} title={sw.name} aria-label={sw.name} onClick={() => { setBg(i); dirty(); }} />
            ))}
          </div>
        </Field>

        <details className="pe-expander">
          <summary>
            SEO settings <span className="ex-sub">— meta title, description, social card</span>
            <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 15 12 9 18 15" /></svg>
          </summary>
          <div className="ex-body">
            <Field label="Meta title" hint="~60 chars · used by Google + share previews">
              <div className="pe-prefix-wrap">
                <input type="text" defaultValue={fx.seo.title} onChange={dirty} />
                <button className="pe-suffix-action" type="button">✨ Suggest</button>
              </div>
            </Field>
            <Field label="Meta description" hint="~155 chars">
              <textarea className="pe-area" defaultValue={fx.seo.description} onChange={dirty} />
            </Field>
            <Field label="OG image" hint="1200×630 — shown when shared on social">
              <div className="pe-cover-drop">
                <span className="cd-emoji" aria-hidden>🖼</span>
                <div className="cd-title">Drop an image, or click to upload</div>
                <div className="cd-sub">Or <button className="pe-ai-link" type="button">✨ generate one with AI</button> from your featured project</div>
              </div>
            </Field>
          </div>
        </details>
      </Section>

      {/* ── Layout ── */}
      <Section title="Layout" sub={<>How project covers arrange themselves at <span className="pe-mono">/{profile.handle}/portfolio</span>.</>}>
        <Field label="Grid mode">
          <div className="visual-radio-row" role="radiogroup" aria-label="Grid mode">
            {GRID_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={gridMode === m.value}
                className={`visual-radio${gridMode === m.value ? " is-selected" : ""}`}
                onClick={() => { setGridMode(m.value); dirty(); }}
              >
                <div className={`grid-preview gp-${m.value}`} aria-hidden>
                  {m.value === "carousel" ? (
                    <><div className="gp-hero" /><div className="gp-dots"><span className="is-current" /><span /><span /></div></>
                  ) : (
                    Array.from({ length: 6 }).map((_, i) => <div key={i} className="gp-blk" />)
                  )}
                </div>
                <div className="vr-name">{m.name}</div>
                <div className="vr-sub">{m.sub}</div>
              </button>
            ))}
          </div>
        </Field>

        <div className="pe-field-row three">
          <Field label="Items per row" hint="Masonry & Grid only">
            <div className="pe-slider-row">
              <input type="range" min={2} max={4} value={perRow} step={1} onChange={(e) => { setPerRow(Number(e.target.value)); dirty(); }} />
              <span className="slider-val">{perRow}</span>
            </div>
          </Field>
          <Field label="Cover sizing">
            <select className="pe-select" defaultValue={fx.layout.coverSizing} onChange={dirty}>
              <option value="auto">Auto — match each project's cover ratio</option>
              <option value="1:1">Square (1:1)</option>
              <option value="4:3">Landscape (4:3)</option>
              <option value="16:9">Wide (16:9)</option>
              <option value="2:3">Portrait (2:3)</option>
              <option value="3:4">Tall portrait (3:4)</option>
            </select>
          </Field>
          <Field label="Show project tags on card">
            <RowToggle name="Display tag pills" sub="Tag pills appear under each cover." on={showTags} onChange={(v) => { setShowTags(v); dirty(); }} />
          </Field>
        </div>

        <Field label="Visitor filter UI" hint="render tag chips above the grid so visitors can filter by category">
          <RowToggle name="Show filter chips" sub="All · Photography · Illustration · Branding · 3D · Video — visible at the top of the public page." on={showFilters} onChange={(v) => { setShowFilters(v); dirty(); }} />
        </Field>
      </Section>

      {/* ── Admin callout ── */}
      <section className="pe-admin-callout">
        <div className="ac-emoji" aria-hidden>🎨</div>
        <div className="ac-copy">
          <div className="ac-title">Manage projects in Administration → Portfolio</div>
          <div className="ac-sub">Day-to-day project management (add, edit, archive, reorder, featured) lives in the Administration tab. This page is for page-level setup only — layout, theme, visitor controls.</div>
        </div>
        <button className="btn btn-primary btn-sm" type="button">Open Portfolio admin →</button>
      </section>

      {/* ── Projects ── */}
      <Section
        title="Projects"
        sub="A quick view of recent projects. Full management lives in Administration → Portfolio."
        headExtra={
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setProjModal("new")}>
            <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
            New project
          </button>
        }
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>🎨</div>
            <h3>Show your first project</h3>
            <p>Your portfolio is empty. Add a cover image (or video), a one-line description, and a tag. The grid takes shape from there.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setProjModal("new")}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add your first project
              </button>
            </div>
            <div className="templates-row" aria-label="Starter templates">
              <button className="templ-tile" type="button" onClick={() => setEmpty(false)}><span className="tt-emoji">📷</span><span className="tt-name">Photographer</span><span className="tt-sub">6 covers</span></button>
              <button className="templ-tile" type="button" onClick={() => setEmpty(false)}><span className="tt-emoji">🎨</span><span className="tt-name">Designer</span><span className="tt-sub">case studies</span></button>
              <button className="templ-tile" type="button" onClick={() => setEmpty(false)}><span className="tt-emoji">🏛</span><span className="tt-name">Architect</span><span className="tt-sub">project sheets</span></button>
              <button className="templ-tile" type="button" onClick={() => setEmpty(false)}><span className="tt-emoji">🖌</span><span className="tt-name">Illustrator</span><span className="tt-sub">gallery</span></button>
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
            </div>
          </div>
        ) : (
          <>
            <div className="pe-list-toolbar">
              <div className="pe-tabs" role="tablist">
                <button className="pe-tab is-active" role="tab" aria-selected="true">All <span className="tab-count">{fx.counts.all}</span></button>
                <button className="pe-tab" role="tab">Published <span className="tab-count">{fx.counts.published}</span></button>
                <button className="pe-tab" role="tab">Drafts <span className="tab-count">{fx.counts.drafts}</span></button>
                <button className="pe-tab" role="tab">Archived <span className="tab-count">{fx.counts.archived}</span></button>
              </div>
              <div className="search-wrap">
                <S w={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>
                <input type="text" placeholder="Search projects by title…" onChange={dirty} />
              </div>
              <select className="pe-select pe-sort" aria-label="Sort order" onChange={dirty}>
                <option value="newest">Sort: Newest first</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="manual">Sort: Manual (drag to reorder)</option>
                <option value="alpha">Sort: A → Z</option>
              </select>
            </div>

            <div className="pe-filter-chips">
              {fx.filters.map((f) => (
                <button key={f} type="button" className={`fchip${filter === f ? " is-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>

            <div className="pe-rows">
              {shown.map((p) => (
                <div className={`pe-row${p.status === "archived" ? " is-archived" : ""}`} key={p.id}>
                  <div className="pr-grip-col">
                    <span className="pr-handle" aria-label="Drag to reorder"><Grip /></span>
                    <div className={`pr-thumb t-${p.tint}`} aria-hidden>
                      {p.featured && <span className="featured-pin" title="Featured">★</span>}
                      {p.emoji}
                      {p.video && <span className="video-pill">{p.video}</span>}
                    </div>
                  </div>
                  <div className="pr-meta">
                    <p className="pr-title">{p.title}</p>
                    <div className="pr-line">
                      <span className={`chip ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                      {p.featured && <span className="chip featured">★ Featured</span>}
                      <span className="dot" />
                      <span>{p.meta}</span>
                      {p.tags.map((t) => (
                        <span key={t} className="pr-tag-wrap"><span className="dot" /><span className="pr-tag">{t}</span></span>
                      ))}
                    </div>
                  </div>
                  <div className="pr-actions">
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setProjModal("edit")}>{p.cta}</button>
                    <button className="iconbtn" type="button" aria-label="Project options"><Kebab /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pe-pagination">
              <div className="pg-meta">Showing <b>1–8</b> of <b>{fx.counts.all}</b> projects</div>
              <div className="pg-controls">
                <button type="button" disabled aria-label="Previous">←</button>
                <button type="button" className="is-current" aria-current="page">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button" aria-label="Next">→</button>
              </div>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
            </div>
          </>
        )}
      </Section>

      {/* ── New / Edit project composer modal ── */}
      {projModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ppm-title" onClick={(e) => { if (e.target === e.currentTarget) setProjModal(null); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="ppm-title">{projModal === "new" ? "New project" : "Edit project"}</h3>
              <span className="head-spacer" />
              <span className="chip draft">Draft · auto-saving</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setProjModal(null)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <Field label="Cover media" hint="recommended 1600×1200 image · or MP4 up to 50 MB">
                <div className="media-kind" role="tablist" aria-label="Cover media type">
                  <button type="button" role="tab" aria-selected={mediaKind === "image"} className={mediaKind === "image" ? "is-active" : ""} onClick={() => setMediaKind("image")}>
                    <S w={11}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></S>
                    Image
                  </button>
                  <button type="button" role="tab" aria-selected={mediaKind === "video"} className={mediaKind === "video" ? "is-active" : ""} onClick={() => setMediaKind("video")}>
                    <S w={11}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></S>
                    Video
                  </button>
                </div>
                <div className="pe-cover-preview">
                  <span className="crop-hint">Crop to Auto · 1600×1200</span>
                  <button className="replace-btn" type="button">Replace</button>
                </div>
              </Field>

              <Field label="Gallery" hint="up to 8 images · drag to reorder · cover above is image #1">
                <div className="pe-gallery">
                  {GALLERY.map((g, i) => (
                    <div key={i} className="gal-item" style={{ background: g }} aria-label={`Image ${i + 1}`}>{i + 1}<button className="gal-x" type="button" aria-label={`Remove image ${i + 1}`}>×</button></div>
                  ))}
                  <button type="button" className="gal-item add" aria-label="Add image">+</button>
                </div>
              </Field>

              <Field label="Title">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue="Sourdough & Co — bakery rebrand" onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>

              <FieldRow>
                <Field label="URL slug" hint="auto-filled · editable until first publish">
                  <div className="pe-prefix-wrap">
                    <span className="pe-prefix">…/portfolio/</span>
                    <input type="text" defaultValue="sourdough-and-co" onChange={dirty} />
                  </div>
                </Field>
                <Field label="Year">
                  <select className="pe-select" defaultValue="2025" onChange={dirty}>
                    {fx.years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </Field>
              </FieldRow>

              <Field label="Medium / Category" hint="multi-select · drives the visitor filter chips">
                <div className="tags-input">
                  {fx.categories.map((c) => (
                    <span key={c} className="tag-pill">{c} <button className="x-btn" type="button" aria-label={`Remove ${c}`}>×</button></span>
                  ))}
                  <input type="text" placeholder="Add a category…" onChange={dirty} />
                </div>
                <div className="pe-field-hint" style={{ marginTop: 6 }}>Available: Photography · Illustration · 3D · Video · Web design · Branding · Architecture · Music · Lettering · Print · Motion · UX</div>
              </Field>

              <Field label="Description">
                <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                  <button type="button" aria-label="Bold"><b>B</b></button>
                  <button type="button" aria-label="Italic"><i>I</i></button>
                  <span className="rt-sep" />
                  <button type="button" aria-label="Heading">H</button>
                  <button type="button" aria-label="Quote">❝</button>
                  <span className="rt-sep" style={{ marginLeft: "auto" }} />
                  <button type="button" aria-label="AI suggest description">✨</button>
                </div>
                <textarea className="rt-area" defaultValue={"A 4-month rebrand for a Lisbon neighborhood bakery. Identity, packaging system across 12 SKUs, three custom illustrations for the seasonal range, and a printed loyalty card.\n\nThe wordmark uses a single-stroke italic to evoke a baker's quick chalk hand on a paper bag."} onChange={dirty} />
              </Field>

              <Field label={<>Tags <span className="pe-field-hint">type and press Enter · improves search + RSS</span></>}>
                <div className="tags-input">
                  <span className="tag-pill">bakery <button className="x-btn" type="button" aria-label="Remove tag bakery">×</button></span>
                  <span className="tag-pill">packaging <button className="x-btn" type="button" aria-label="Remove tag packaging">×</button></span>
                  <span className="tag-pill">lettering <button className="x-btn" type="button" aria-label="Remove tag lettering">×</button></span>
                  <input type="text" placeholder="Add a tag…" onChange={dirty} />
                </div>
              </Field>

              <FieldRow>
                <Field label="Project URL" hint="optional · live case study / Behance / Dribbble / GitHub">
                  <div className="pe-prefix-wrap">
                    <span className="pe-prefix">https://</span>
                    <input type="text" defaultValue="behance.net/alexandra/sourdough" onChange={dirty} />
                  </div>
                </Field>
                <Field label="Client" hint="optional · for commissioned work">
                  <input className="pe-input" type="text" defaultValue="Sourdough & Co" onChange={dirty} />
                </Field>
              </FieldRow>

              <Field label="Collaborators" hint="credit anyone you worked with on this project">
                <div className="tags-input">
                  <span className="tag-pill">Maya Chen — co-illustration <button className="x-btn" type="button" aria-label="Remove Maya Chen">×</button></span>
                  <span className="tag-pill">Tomás Reis — print & production <button className="x-btn" type="button" aria-label="Remove Tomás Reis">×</button></span>
                  <input type="text" placeholder="Add collaborator name + role…" onChange={dirty} />
                  <span className="chip business" style={{ marginLeft: "auto" }}>🔒 Business</span>
                </div>
                <TierHint>Crediting collaborators is part of <b>Team</b> on the Business plan. We'll prompt to upgrade when you save if any collaborator is set.</TierHint>
              </Field>

              <Field label="Featured project">
                <div className="pe-featured-row">
                  <div className="ico" aria-hidden>★</div>
                  <div className="copy">
                    <div className="name">Pin to top of the grid</div>
                    <div className="sub">Featured projects always appear before the rest, in the order you mark them.</div>
                  </div>
                  <button type="button" className={`pe-toggle${featured ? " is-on" : ""}`} role="switch" aria-checked={featured} aria-label="Toggle featured" onClick={() => { setFeatured((v) => !v); dirty(); }} />
                </div>
                <TierHint>You can feature up to <b>3 projects on Free</b> and <b>unlimited on Creator+</b>. We'll prompt to upgrade at save if you cross the cap.</TierHint>
              </Field>

              <Field label="Schedule publication" hint="leave blank to publish now">
                <FieldRow>
                  <input className="pe-input" type="date" defaultValue="2026-05-08" onChange={dirty} />
                  <input className="pe-input" type="time" defaultValue="10:00" onChange={dirty} />
                </FieldRow>
                <TierHint>Scheduling beyond the next 7 days is a <b>Pro</b> perk. We'll prompt at save if your selected date is more than 7 days out.</TierHint>
              </Field>
            </div>
            <div className="pe-modal-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setProjModal(null)}>Cancel</button>
              <button className="btn btn-danger-ghost btn-sm" type="button">Delete draft</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setProjModal(null)}>Save as draft</button>
              <button className="btn btn-warm btn-sm" type="button" onClick={() => setProjModal(null)}>
                <S w={13}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></S>
                Schedule for May 8
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setProjModal(null)}>Publish now →</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
