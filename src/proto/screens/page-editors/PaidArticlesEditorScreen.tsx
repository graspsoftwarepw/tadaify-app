/**
 * Paid articles list-page editor — the creator-facing editor a creator opens at
 * Pages > Paid articles. Faithful port of
 * mockups/tadaify-mvp/app-page-paid-articles.html, composed on the shared
 * EditorShell + Section primitives. This is the page visitors land on at
 * tadaify.com/<handle>/articles — per-article publishing/management lives in
 * Administration → Paid articles (a callout links there).
 *
 * Presentational, local-state only: collapse cards, edit title / slug / lede,
 * toggle publish / show-in-nav, pick a visitor-list layout, toggle visitor
 * controls (search / tag-filter / sort), pick a page-background swatch, edit SEO
 * + a custom-domain field, and a dirty-on-edit save bar. The custom-domain field
 * (Pro) stays fully visible and interactive — the gate is mocked at Save. Data
 * comes from the typed paidArticlesEditorFixture.
 *
 * @implements fr-page-editor-paid-articles
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
  type SaveState,
} from "./EditorShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { paidArticlesEditorFixture, type PaidArticlesLayout } from "./paidArticlesEditorFixture";

const PAID_ARTICLES_PAGE_SUBITEM = {
  id: "paid-articles",
  label: "Paid articles",
  href: "/__proto/page-paid-articles",
  icon: (
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
};

const LAYOUTS: { value: PaidArticlesLayout; name: string; thumb: "grid" | "list" | "feat" }[] = [
  { value: "grid", name: "Grid (default)", thumb: "grid" },
  { value: "list", name: "List", thumb: "list" },
  { value: "featured", name: "Featured-on-top", thumb: "feat" },
];

export function PaidArticlesEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = paidArticlesEditorFixture();

  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [showInNav, setShowInNav] = useState(fx.showInNav);
  const [layout, setLayout] = useState(fx.layout);
  const [search, setSearch] = useState(fx.visitorControls.search);
  const [tagFilter, setTagFilter] = useState(fx.visitorControls.tagFilter);
  const [sortSelector, setSortSelector] = useState(fx.visitorControls.sortSelector);
  const [bg, setBg] = useState(fx.selectedBackground);

  const dirty = () => setSaveState("dirty");

  return (
    <EditorShell
      profile={profile}
      emoji="💰"
      title="Paid articles"
      description={
        <>
          The page that lists all your monetized articles for visitors. Publish individual articles in{" "}
          <a className="pe-inline-link" href="/__proto/dashboard">Administration → Paid articles</a>.
        </>
      }
      slug={fx.slug}
      live={live}
      pageId="paid-articles"
      pageSubItems={[PAID_ARTICLES_PAGE_SUBITEM]}
      saveState={saveState}
      saveLabel="Save changes"
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
      <Section title="Page settings">
        <FieldRow>
          <Field label="Page title (visitor-facing)">
            <input className="pe-input" type="text" defaultValue={fx.pageTitle} onChange={dirty} />
          </Field>
          <Field label="URL slug">
            <div className="pe-prefix-wrap">
              <span className="pe-prefix">tadaify.com/{profile.handle}/</span>
              <input type="text" defaultValue={fx.slug} onChange={dirty} />
            </div>
          </Field>
        </FieldRow>

        <Field label="Lede / intro line (shown above the grid)">
          <input className="pe-input" type="text" defaultValue={fx.lede} onChange={dirty} />
        </Field>

        <RowToggle
          name="Page is published"
          sub="Visitors can browse the article list at the URL above."
          on={live}
          onChange={(v) => { setLive(v); dirty(); }}
        />
        <RowToggle
          name={<>Show in navigation <TierBadge tier="creator" /></>}
          sub={<>Add an "Articles" link to your home page header.</>}
          on={showInNav}
          onChange={(v) => { setShowInNav(v); dirty(); }}
        />
      </Section>

      {/* ── Layout ── */}
      <Section title="Layout" sub="How visitors see the article list">
        <div className="pa-layout-options" role="radiogroup" aria-label="Article list layout">
          {LAYOUTS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={layout === o.value}
              className={`pa-layout-option${layout === o.value ? " is-selected" : ""}`}
              onClick={() => { setLayout(o.value); dirty(); }}
            >
              <div className={`pa-lo-thumb ${o.thumb}`} aria-hidden>
                {o.thumb === "grid" && <><div /><div /><div /><div /></>}
                {o.thumb === "list" && <><div /><div /><div /></>}
                {o.thumb === "feat" && <><div style={{ opacity: 0.7 }} /><div /><div /></>}
              </div>
              <div className="pa-lo-name">{o.name}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Visitor controls ── */}
      <Section title="Visitor controls" sub="What filters appear above the grid">
        <RowToggle name="Search bar" sub="Filter by title." on={search} onChange={(v) => { setSearch(v); dirty(); }} />
        <RowToggle name="Tag filter chips" sub="Filter by article tag." on={tagFilter} onChange={(v) => { setTagFilter(v); dirty(); }} />
        <RowToggle
          name="Sort selector (Newest / Most popular / Price)"
          sub="Visitor can re-order articles."
          on={sortSelector}
          onChange={(v) => { setSortSelector(v); dirty(); }}
        />
      </Section>

      {/* ── Theme ── */}
      <Section title="Theme" sub="Page background color">
        <div className="pe-swatch-row">
          {fx.backgrounds.map((sw, i) => (
            <button
              key={sw.name}
              type="button"
              className={`pe-swatch${i === bg ? " is-selected" : ""}`}
              style={{ background: sw.css }}
              title={sw.name}
              aria-label={sw.name}
              onClick={() => { setBg(i); dirty(); }}
            />
          ))}
        </div>
      </Section>

      {/* ── SEO & sharing ── */}
      <Section title="SEO &amp; sharing">
        <details className="pe-expander">
          <summary>
            Custom meta + OG image (optional)
            <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
          </summary>
          <div className="ex-body">
            <Field label="Page title for search engines">
              <input className="pe-input" type="text" placeholder={fx.seo.title} onChange={dirty} />
            </Field>
            <Field label="Meta description">
              <textarea className="pe-area" placeholder={fx.seo.description} onChange={dirty} />
            </Field>
            <Field label="Open Graph image (1200×630)">
              <div className="pe-cover-drop">
                <span className="cd-emoji" aria-hidden>🖼</span>
                <div className="cd-title">Drop an image here, or click to browse</div>
                <div className="cd-sub">PNG or JPG · recommended 1200×630</div>
              </div>
            </Field>
            <Field label={<>Custom domain <TierBadge tier="pro" /></>}>
              <input className="pe-input" type="text" placeholder="articles.alexandra.com" onChange={dirty} />
            </Field>
          </div>
        </details>
      </Section>

      {/* ── Preview ── */}
      <Section
        title="Preview"
        sub="Sample of how visitors see this page"
        headExtra={
          <a className="btn btn-ghost btn-sm" href="/__proto/creator-public" target="_blank" rel="noopener">
            Open full preview ↗
          </a>
        }
      >
        <div className="pa-preview-frame">
          <div className="pa-preview-hero">
            <h3>Articles <span className="chip">{fx.previewCount}</span></h3>
            <p>{fx.lede}</p>
          </div>
          <div className="pa-preview-grid">
            {fx.preview.map((c) => (
              <div className="pa-preview-card" key={c.id}>
                <div className={`pa-pc-cover t-${c.tone}`} aria-hidden>{c.emoji}</div>
                <div className="pa-pc-meta">
                  <div className="pa-pc-title">{c.title}</div>
                  <div className="pa-pc-price">{c.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </EditorShell>
  );
}
