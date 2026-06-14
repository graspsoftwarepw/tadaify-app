/**
 * FAQ / Help Center page editor — the creator-facing editor a creator opens at
 * Pages > FAQ. Faithful port of mockups/tadaify-mvp/app-page-faq.html, composed
 * on the shared EditorShell + Section primitives. Pairs with the public visitor
 * view (creator-faq-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish/search/TOC,
 * pick a default-expand visual radio + background swatch, collapse/expand each
 * Q&A section, edit section names, filter the composer, flip empty ↔ filled,
 * open the add-section / Q&A / CSV-import modals, and a dirty-on-edit save bar.
 * Data comes from the typed faqEditorFixture. Premium behaviours (helpful
 * feedback, cross-section tags, CSV import) stay fully visible and interactive
 * (no blur); the gate is mocked at Save.
 *
 * @implements fr-page-editor-faq
 */
import { useState } from "react";
import {
  EditorShell,
  EditorIcon as S,
  Field,
  FieldRow,
  RowToggle,
  Section,
  TierBadge,
  TierHint,
  type SaveState,
} from "./EditorShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { faqEditorFixture, type FaqExpandMode } from "./faqEditorFixture";

const FAQ_PAGE_SUBITEM = {
  id: "faq",
  label: "FAQ",
  href: "/__proto/page-faq",
  icon: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
};

const EXPAND_OPTIONS: { value: FaqExpandMode; name: string; sub: string; bars: ("on" | "off")[] }[] = [
  { value: "first", name: "First open", sub: "First section expanded, rest collapsed.", bars: ["on", "off", "off"] },
  { value: "collapsed", name: "All collapsed", sub: "Visitors click each Q to expand.", bars: ["off", "off", "off"] },
  { value: "expanded", name: "All expanded", sub: "Best for short FAQs (< 10 questions).", bars: ["on", "on", "on"] },
];

const GripIcon = () => (
  <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></S>
);

export function FaqEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = faqEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [showInNav, setShowInNav] = useState(fx.showInNav);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [search, setSearch] = useState(fx.behaviour.search);
  const [toc, setToc] = useState(fx.behaviour.toc);
  const [expandMode, setExpandMode] = useState(fx.behaviour.expandMode);
  const [helpful, setHelpful] = useState(fx.behaviour.helpful);
  const [tags, setTags] = useState(fx.behaviour.tags);
  const [sections, setSections] = useState(fx.sections);
  const [addSection, setAddSection] = useState(false);
  const [qaModal, setQaModal] = useState<null | "new" | "edit">(null);
  const [csvModal, setCsvModal] = useState(false);

  const dirty = () => setSaveState("dirty");
  const toggleSection = (id: string) => {
    setSections((ss) => ss.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)));
  };

  return (
    <EditorShell
      profile={profile}
      emoji="💬"
      title="FAQ / Help Center"
      description="Answer the questions you keep getting. Organize Q&A by section, and visitors can search across the whole page."
      slug={fx.slug}
      live={live}
      pageId="faq"
      pageSubItems={[FAQ_PAGE_SUBITEM]}
      saveState={saveState}
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerExtra={
        <div className="pe-quick-titles" aria-label="Title quick-pick">
          {fx.titleAlts.map((a) => (
            <button className="pe-qt-chip" type="button" key={a.slug} onClick={dirty}>{a.title}</button>
          ))}
          <button className="pe-qt-chip" type="button" onClick={dirty}><span className="sparkle">✨</span> Suggest more</button>
        </div>
      }
      headerActions={
        <a className="btn btn-ghost btn-sm" href="/__proto/creator-faq-public" target="_blank" rel="noopener">
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </a>
      }
    >
      {/* ── Page settings ── */}
      <Section title="Page settings" sub="Title, URL, visibility and SEO for the FAQ page itself.">
        <FieldRow>
          <Field label="Page title" hint="shown as the <h1> on the public page">
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
            <RowToggle name="Page is live" sub="Visitors can find this Help Center at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
          </Field>
          <Field label="Show in main page nav">
            <RowToggle name="Link from your homepage" sub={<>Adds a "FAQ" link to the footer of <span className="pe-mono">/{profile.handle}</span>.</>} on={showInNav} onChange={(v) => { setShowInNav(v); dirty(); }} />
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
          </div>
        </details>
      </Section>

      {/* ── FAQ behaviour ── */}
      <Section title="FAQ behaviour" sub="How visitors browse and search the page.">
        <FieldRow>
          <Field label="Search bar">
            <RowToggle name="Visitors can search" sub="Sticky search filters across all questions live as they type." on={search} onChange={(v) => { setSearch(v); dirty(); }} />
          </Field>
          <Field label="Table of contents">
            <RowToggle name="Show TOC sidebar" sub="Sticky on desktop · collapsible on mobile." on={toc} onChange={(v) => { setToc(v); dirty(); }} />
          </Field>
        </FieldRow>

        <Field label="Default expand state">
          <div className="visual-radio-row" role="radiogroup" aria-label="Default expand state">
            {EXPAND_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={expandMode === o.value}
                className={`visual-radio${expandMode === o.value ? " is-selected" : ""}`}
                onClick={() => { setExpandMode(o.value); dirty(); }}
              >
                <div className="vr-preview">
                  {o.bars.map((b, i) => <div key={i} className={`vr-bar${b === "off" ? " muted" : ""}`} />)}
                </div>
                <div className="vr-name">{o.name}</div>
                <div className="vr-sub">{o.sub}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label={<>"Was this helpful?" feedback <TierBadge tier="creator" /></>}>
          <RowToggle name="Show yes / no buttons under each answer" sub="Tracks click counts so you know which answers land." on={helpful} onChange={(v) => { setHelpful(v); dirty(); }} />
          <TierHint>Helpful-feedback tracking is part of <b>Creator</b>. We'll prompt to upgrade at save if you're on Free.</TierHint>
        </Field>

        <Field label={<>Cross-section tags <TierBadge tier="pro" /></>}>
          <RowToggle name="Allow tagging questions across sections" sub={<>Add tags like <span className="pe-mono">premium</span> or <span className="pe-mono">new</span>; visitors filter by tag chip.</>} on={tags} onChange={(v) => { setTags(v); dirty(); }} />
          <TierHint pro>Cross-section tagging + the public tag-filter chip bar are part of <b>Pro</b>. We'll prompt to upgrade at save.</TierHint>
        </Field>

        <div className="index-pill">
          <span className="ix-dot" aria-hidden />
          Search index → <b>{fx.index.questions}</b> questions across <b>{fx.index.sections}</b> sections · <b>{fx.index.tags}</b> distinct tags · indexed 2 min ago
        </div>
      </Section>

      {/* ── Sections & questions ── */}
      <Section
        title="Sections & questions"
        sub="Group related questions into sections. Drag to reorder either level."
        headExtra={
          <div className="pe-head-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCsvModal(true)}>
              <S w={13}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></S>
              Import CSV <TierBadge tier="pro" />
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setAddSection(true)}>
              <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add section
            </button>
          </div>
        }
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>💬</div>
            <h3>Build your Help Center</h3>
            <p>Group your most-asked questions into sections so visitors can find answers fast — and message you less.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setAddSection(true)}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Create your first section
              </button>
            </div>
            <button className="pe-ai-link" type="button" onClick={() => setEmpty(false)}>✨ Or let AI bootstrap your FAQ →</button>
            <div className="templates-row" aria-label="Starter templates">
              {fx.starterPacks.map((p) => (
                <button className="templ-tile" type="button" key={p.id} onClick={() => setEmpty(false)}>
                  <span className="tt-emoji">{p.emoji}</span>
                  <span className="tt-name">{p.name}</span>
                  <span className="tt-sub">{p.sections.slice(0, 3).join(" / ")}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
          </div>
        ) : (
          <>
            <div className="composer-toolbar">
              <div className="search-wrap">
                <S w={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>
                <input type="text" placeholder="Search questions you've added…" onChange={dirty} />
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSections((ss) => ss.map((s) => ({ ...s, collapsed: true })))}>Collapse all</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSections((ss) => ss.map((s) => ({ ...s, collapsed: false })))}>Expand all</button>
            </div>

            <div className="qa-composer">
              {sections.map((sec) => (
                <div className={`qa-sec-card${sec.collapsed ? " is-collapsed" : ""}`} key={sec.id}>
                  <div className="qa-sec-head">
                    <span className="sec-grip" aria-label="Drag section"><GripIcon /></span>
                    <span className="sec-icon" aria-hidden>{sec.icon}</span>
                    <input className="sec-name" type="text" defaultValue={sec.name} aria-label="Section name" onChange={dirty} />
                    <span className="sec-count">{sec.count} questions</span>
                    <button className="sec-collapse" type="button" aria-label={sec.collapsed ? "Expand section" : "Collapse section"} aria-expanded={!sec.collapsed} onClick={() => toggleSection(sec.id)}>
                      <S w={16}><polyline points="6 9 12 15 18 9" /></S>
                    </button>
                    <button className="iconbtn" type="button" aria-label="Section options">
                      <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
                    </button>
                  </div>
                  <div className="qa-sec-body">
                    <textarea className="sec-intro" defaultValue={sec.intro} placeholder="Optional intro paragraph…" onChange={dirty} />
                    <div className="qa-list">
                      {sec.questions.map((qq) => (
                        <div className="qa-row" key={qq.id}>
                          <span className="qa-grip" aria-label="Drag question"><GripIcon /></span>
                          <div className="qa-meta">
                            <p className="qa-q">{qq.q}</p>
                            <div className="qa-line">
                              {qq.helpful != null && (
                                <span className={`qa-helpful${qq.helpfulLow ? " is-low" : ""}`}>
                                  <S w={13}><path d="M14 9V5a3 3 0 0 0-6 0v4" /><rect x="2" y="9" width="20" height="12" rx="2" /></S>
                                  {qq.helpful}% helpful
                                </span>
                              )}
                              {qq.helpful != null && <span className="dot" />}
                              <span>Updated {qq.updated}</span>
                              {qq.tags.map((t) => (
                                <span key={t} className="qa-line-tag">
                                  <span className="dot" />
                                  <span className="qa-tag">{t}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="qa-actions">
                            <button className="btn btn-ghost btn-xs" type="button" onClick={() => setQaModal("edit")}>Edit</button>
                            <button className="iconbtn" type="button" aria-label="Question options">
                              <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="qa-add" type="button" onClick={() => setQaModal("new")}>
                      <S w={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                      Add question to "{sec.name}"
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sec-actions-row">
              <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>Need ideas?</span>
              <button className="ai-cta" type="button" onClick={dirty}>✨ AI suggest 5 common questions</button>
              <span className="spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddSection(true)}>
                <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add section
              </button>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
            </div>
          </>
        )}
      </Section>

      {/* ── Add section modal ── */}
      {addSection && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fas-title" onClick={(e) => { if (e.target === e.currentTarget) setAddSection(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="fas-title">Add a section</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setAddSection(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Pick a section type. You can rename, reorder, and delete sections any time.</p>
              <div className="types-grid">
                {fx.sectionTypes.map((t) => (
                  <button className="type-tile" type="button" key={t.type} onClick={() => setAddSection(false)}>
                    <div className="tt-row">
                      <div className="tt-icon">{t.emoji}</div>
                      <h4 className="tt-name">{t.name}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                  </button>
                ))}
              </div>
              <div className="templates-divider"><span>✨ AI starter packs</span></div>
              <div className="types-grid">
                {fx.starterPacks.map((p) => (
                  <button className="type-tile" type="button" key={p.id} onClick={() => setAddSection(false)}>
                    <div className="tt-row">
                      <div className="tt-icon">{p.emoji}</div>
                      <h4 className="tt-name">{p.name}</h4>
                    </div>
                    <ul className="tt-list">{p.sections.map((s) => <li key={s}>{s}</li>)}</ul>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>No section cap. Free tier OK.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddSection(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New / Edit Q&A modal ── */}
      {qaModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fqa-title" onClick={(e) => { if (e.target === e.currentTarget) setQaModal(null); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="fqa-title">{qaModal === "new" ? "New question" : "Edit question"}</h3>
              <span className="head-spacer" />
              <span className="chip draft">Draft · auto-saving</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setQaModal(null)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <Field label="Section">
                <select className="pe-select" defaultValue="account" onChange={dirty}>
                  {fx.sections.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  <option value="__new">+ Add new section…</option>
                </select>
              </Field>
              <Field label="Question" hint="phrase how a visitor would ask it">
                <input className="pe-input" type="text" defaultValue={qaModal === "edit" ? "Where can I download the training PDF after I bought it?" : ""} onChange={dirty} />
              </Field>
              <Field label="Answer">
                <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                  <button type="button" aria-label="Bold"><b>B</b></button>
                  <button type="button" aria-label="Italic"><i>I</i></button>
                  <span className="rt-sep" />
                  <button type="button" aria-label="Heading">H</button>
                  <button type="button" aria-label="Quote">❝</button>
                  <span className="rt-sep" style={{ marginLeft: "auto" }} />
                  <button type="button" aria-label="AI suggest answer">✨ Suggest</button>
                </div>
                <textarea className="rt-area" defaultValue={"After checkout you'll get an email from no-reply@tadaify.com with your download link. The link is also pinned in your account.\n\nHeads up:\n- The link expires after 30 days, but you can re-generate it from your account.\n- The PDF is watermarked with your email — please don't share it publicly."} onChange={dirty} />
              </Field>
              <Field label={<>Tags <span className="pe-field-hint">type and press Enter</span> <TierBadge tier="pro" /></>}>
                <div className="tags-input">
                  <span className="tag-pill">downloads <button className="x-btn" type="button" aria-label="Remove tag downloads">×</button></span>
                  <span className="tag-pill">post-purchase <button className="x-btn" type="button" aria-label="Remove tag post-purchase">×</button></span>
                  <input type="text" placeholder="Add a tag…" onChange={dirty} />
                </div>
                <TierHint pro>Tags become filterable chips on the public page. Cross-section filtering is part of <b>Pro</b> — we'll prompt at save if you're below.</TierHint>
              </Field>
            </div>
            <div className="pe-modal-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setQaModal(null)}>Cancel</button>
              <button className="btn btn-danger-ghost btn-sm" type="button">Delete question</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setQaModal(null)}>Save as draft</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setQaModal(null)}>Save &amp; publish →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV import modal ── */}
      {csvModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fcsv-title" onClick={(e) => { if (e.target === e.currentTarget) setCsvModal(false); }}>
          <div className="pe-modal is-narrow">
            <div className="pe-modal-head">
              <h3 id="fcsv-title">Import questions from CSV</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setCsvModal(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Bulk-import a Help Center CSV. Columns expected: <span className="pe-mono">section, question, answer, tags</span>. Sections are created automatically if they don't exist yet.</p>
              <div className="pe-cover-drop">
                <span className="cd-emoji" aria-hidden>📂</span>
                <div className="cd-title">Drop a .csv file here, or click to browse</div>
                <div className="cd-sub">Up to 500 rows · UTF-8 encoded · max 2 MB</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="pe-ai-link" type="button">↓ Download sample.csv</button>
              </div>
              <TierHint>CSV import is part of <b>Pro</b>. We'll prompt to upgrade at the import step if you're below.</TierHint>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Existing questions in the same section won't be deduped.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setCsvModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setCsvModal(false)}>Import →</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
