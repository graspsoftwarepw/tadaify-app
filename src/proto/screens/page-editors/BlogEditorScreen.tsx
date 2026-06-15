/**
 * Blog page editor — the creator-facing editor a creator opens at Pages > Blog.
 * Faithful port of mockups/tadaify-mvp/app-page-blog.html, composed on the
 * shared EditorShell + Section primitives. Pairs with the public visitor view
 * (creator-blog-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish / RSS /
 * author byline, pick a page-background swatch, edit layout config, flip empty ↔
 * filled, open the new/edit post composer modal, kebab popovers, and a
 * dirty-on-edit save bar. Day-to-day publishing lives in Administration → Blog
 * (a callout links there); this page is page-level setup only. Premium fields
 * (author selection, far-future scheduling) stay fully visible and interactive
 * in the modal — the gate is mocked at Save. Data comes from the typed
 * blogEditorFixture.
 *
 * @implements fr-page-editor-blog
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
import { blogEditorFixture, type BlogPost } from "./blogEditorFixture";

const BLOG_PAGE_SUBITEM = {
  id: "blog",
  label: "Blog",
  href: "/__proto/page-blog",
  icon: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </>
  ),
};

const STATUS_LABEL: Record<BlogPost["status"], string> = {
  live: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
};

const Grip = () => (
  <S w={16}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
);
const Kebab = () => (
  <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
);

export function BlogEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = blogEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [rss, setRss] = useState(fx.rss);
  const [byline, setByline] = useState(fx.authorByline);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [tab, setTab] = useState<"all" | "published" | "drafts" | "scheduled">("all");
  const [postModal, setPostModal] = useState<null | "new" | "edit">(null);

  useEscapeKey(() => { setPostModal(null); });

  const dirty = () => setSaveState("dirty");

  return (
    <EditorShell
      profile={profile}
      emoji="📝"
      title="Blog"
      description="Publish essays, devlogs, tutorials or journals on your own page. Visitors can subscribe to the RSS feed."
      slug={fx.slug}
      live={live}
      pageId="blog"
      pageSubItems={[BLOG_PAGE_SUBITEM]}
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
      <Section title="Page settings" sub="Title, URL, visibility and SEO for the Blog page itself.">
        <FieldRow>
          <Field label="Page title" hint="shown as the <h1> on the public blog">
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
            <RowToggle name="Page is live" sub="Visitors can find this blog at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
          </Field>
          <Field label="RSS feed">
            <RowToggle name="Enable RSS" sub={<>Serve <span className="pe-mono">/blog/feed.xml</span> for newsreaders.</>} on={rss} onChange={(v) => { setRss(v); dirty(); }} />
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
                <div className="cd-sub">Or <button className="pe-ai-link" type="button">✨ generate one with AI</button></div>
              </div>
            </Field>
          </div>
        </details>
      </Section>

      {/* ── Layout ── */}
      <Section title="Layout" sub={<>How the post list looks at <span className="pe-mono">/{profile.handle}/blog</span>.</>}>
        <FieldRow>
          <Field label="Card layout">
            <select className="pe-select" defaultValue={fx.layout.cardLayout} onChange={dirty}>
              <option value="cards">Cards — cover image + title + excerpt (recommended)</option>
              <option value="list">List — compact, no cover thumbnail</option>
              <option value="magazine">Magazine — first post hero, rest in 2-column grid</option>
            </select>
          </Field>
          <Field label="Posts per page">
            <input className="pe-input" type="number" defaultValue={fx.layout.postsPerPage} min={1} max={50} onChange={dirty} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Sort order">
            <select className="pe-select" defaultValue={fx.layout.sort} onChange={dirty}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="manual">Manual — drag to reorder</option>
            </select>
          </Field>
          <Field label="Show author byline">
            <RowToggle name="Display author" sub="Avatar + name appear on each card." on={byline} onChange={(v) => { setByline(v); dirty(); }} />
          </Field>
        </FieldRow>
      </Section>

      {/* ── Admin callout ── */}
      <section className="pe-admin-callout">
        <div className="ac-emoji" aria-hidden>📝</div>
        <div className="ac-copy">
          <div className="ac-title">Manage posts in Administration → Blog</div>
          <div className="ac-sub">Day-to-day publishing (write, edit, schedule, comments) lives in the Administration tab. This page is for page-level setup only — theme, layout, SEO.</div>
        </div>
        <button className="btn btn-primary btn-sm" type="button">Open Blog admin →</button>
      </section>

      {/* ── Posts ── */}
      <Section
        title="Posts"
        sub="A quick view of recent posts. Full management lives in Administration → Blog."
        headExtra={
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setPostModal("new")}>
            <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
            New post
          </button>
        }
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>📝</div>
            <h3>Write your first post</h3>
            <p>Your blog is live but quiet. Start with a quick welcome post — even 3 short paragraphs is enough to get visitors reading and the RSS feed primed.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setPostModal("new")}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Create your first post
              </button>
            </div>
            <button className="pe-ai-link" type="button" onClick={() => setEmpty(false)}>✨ Or pick a starter template →</button>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
            </div>
          </div>
        ) : (
          <>
            <div className="pe-list-toolbar">
              <div className="pe-tabs" role="tablist">
                <button className={`pe-tab${tab === "all" ? " is-active" : ""}`} role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")}>All <span className="tab-count">{fx.counts.all}</span></button>
                <button className={`pe-tab${tab === "published" ? " is-active" : ""}`} role="tab" aria-selected={tab === "published"} onClick={() => setTab("published")}>Published <span className="tab-count">{fx.counts.published}</span></button>
                <button className={`pe-tab${tab === "drafts" ? " is-active" : ""}`} role="tab" aria-selected={tab === "drafts"} onClick={() => setTab("drafts")}>Drafts <span className="tab-count">{fx.counts.drafts}</span></button>
                <button className={`pe-tab${tab === "scheduled" ? " is-active" : ""}`} role="tab" aria-selected={tab === "scheduled"} onClick={() => setTab("scheduled")}>Scheduled <span className="tab-count">{fx.counts.scheduled}</span></button>
              </div>
              <div className="search-wrap">
                <S w={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>
                <input type="text" placeholder="Search posts by title…" onChange={dirty} />
              </div>
            </div>

            <div className="pe-rows">
              {fx.posts.map((p) => (
                <div className="pe-row" key={p.id}>
                  <div className="pr-grip-col">
                    <span className="pr-handle" aria-label="Drag to reorder"><Grip /></span>
                    <div className={`pr-thumb t-${p.tint}`} aria-hidden>{p.emoji}</div>
                  </div>
                  <div className="pr-meta">
                    <p className="pr-title">{p.title}</p>
                    <div className="pr-line">
                      <span className={`chip ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                      <span className="dot" />
                      <span>{p.meta}{p.metaBold && <b>{p.metaBold}</b>}</span>
                      {p.tags.map((t) => (
                        <span key={t} className="pr-tag-wrap"><span className="dot" /><span className="pr-tag">{t}</span></span>
                      ))}
                    </div>
                  </div>
                  <div className="pr-actions">
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setPostModal("edit")}>{p.cta}</button>
                    <button className="iconbtn" type="button" aria-label="Post options"><Kebab /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pe-pagination">
              <div className="pg-meta">Showing <b>1–5</b> of <b>{fx.counts.all}</b> posts</div>
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

      {/* ── New / Edit post composer modal ── */}
      {postModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bpm-title" onClick={(e) => { if (e.target === e.currentTarget) setPostModal(null); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="bpm-title">{postModal === "new" ? "New post" : "Edit post"}</h3>
              <span className="head-spacer" />
              <span className="chip draft">Draft · auto-saving</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setPostModal(null)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <Field label="Cover image" hint="recommended 1600×900">
                <div className="pe-cover-preview">
                  <span className="crop-hint">Crop to 16:9</span>
                  <button className="replace-btn" type="button">Replace</button>
                </div>
              </Field>
              <Field label="Title">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue={postModal === "edit" ? "A 5-day reset for when training feels heavy" : ""} onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>
              <Field label="URL slug" hint="auto-filled · editable until first publish">
                <div className="pe-prefix-wrap">
                  <span className="pe-prefix">…/blog/</span>
                  <input type="text" defaultValue="5-day-reset-for-heavy-training" onChange={dirty} />
                </div>
              </Field>
              <Field label="Body">
                <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                  <button type="button" aria-label="Bold"><b>B</b></button>
                  <button type="button" aria-label="Italic"><i>I</i></button>
                  <span className="rt-sep" />
                  <button type="button" aria-label="Heading">H</button>
                  <button type="button" aria-label="Quote">❝</button>
                  <button type="button" aria-label="Code">{"{ }"}</button>
                  <span className="rt-sep" style={{ marginLeft: "auto" }} />
                  <button type="button" aria-label="AI suggest paragraph">✨</button>
                </div>
                <textarea className="rt-area" defaultValue={"Some weeks the bar feels heavier than it should. Sleep slips, work piles up, motivation thins. Trying to grind through it usually costs you more than backing off would.\n\nHere's the 5-day reset I run when training stops feeling good — it brings me back without losing the base I built.\n\nDay 1: cut volume by 50%. Same lifts, half the sets. Eat to maintenance. Sleep 9 hours…"} onChange={dirty} />
              </Field>
              <Field label={<>Tags <span className="pe-field-hint">type and press Enter</span></>}>
                <div className="tags-input">
                  <span className="tag-pill">recovery <button className="x-btn" type="button" aria-label="Remove tag recovery">×</button></span>
                  <span className="tag-pill">training <button className="x-btn" type="button" aria-label="Remove tag training">×</button></span>
                  <input type="text" placeholder="Add a tag…" onChange={dirty} />
                </div>
              </Field>
              <Field label="Author">
                <div className="pe-author-row">
                  <div className="av" aria-hidden>A</div>
                  <select className="pe-select" defaultValue={fx.authors[0]} onChange={dirty}>
                    {fx.authors.map((a) => <option key={a}>{a}</option>)}
                  </select>
                  <span className="chip business">🔒 Business</span>
                </div>
                <TierHint>Switching author is part of <b>Team</b> on the Business plan. We'll prompt to upgrade at save if you pick someone other than yourself.</TierHint>
              </Field>
              <Field label="Schedule publication" hint="leave blank to publish now">
                <FieldRow>
                  <input className="pe-input" type="date" defaultValue="2026-05-05" onChange={dirty} />
                  <input className="pe-input" type="time" defaultValue="08:00" onChange={dirty} />
                </FieldRow>
                <TierHint>Scheduling beyond the next 7 days is a <b>Pro</b> perk. We'll prompt to upgrade at save time if your selected date is more than 7 days out.</TierHint>
              </Field>
            </div>
            <div className="pe-modal-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPostModal(null)}>Cancel</button>
              <button className="btn btn-danger-ghost btn-sm" type="button">Delete draft</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPostModal(null)}>Save as draft</button>
              <button className="btn btn-warm btn-sm" type="button" onClick={() => setPostModal(null)}>
                <S w={13}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></S>
                Schedule for May 5
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setPostModal(null)}>Publish now →</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
