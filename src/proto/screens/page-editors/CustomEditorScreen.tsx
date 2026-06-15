/**
 * Custom page editor — the creator-facing editor a creator opens for a Custom
 * page. Faithful port of mockups/tadaify-mvp/app-page-custom.html, composed on
 * the shared EditorShell + Section primitives. Pairs with the public visitor
 * view (creator-custom-public). A Custom page is a blank, creator-named page
 * built from the block library; its content is a drag-reorderable stack of
 * blocks, with six starter templates that pre-populate the stack.
 *
 * Presentational, local-state only: collapse cards, edit title / slug / nav /
 * noindex / SEO, pick a page-background swatch, edit page-level power options
 * (custom domain, password gate, redirect-after), open/close the block-row
 * kebab menus, flip empty ↔ filled, open the centred block-picker and starter-
 * template modals (never side drawers), and a dirty-on-edit save bar. Premium
 * power options (custom domain, password, redirect — all Pro) stay fully visible
 * and interactive; the gate is mocked at Save. Data comes from the typed
 * customEditorFixture.
 *
 * @implements fr-page-editor-custom
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
  TierBadge,
  TierHint,
  type SaveState,
} from "./EditorShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { customEditorFixture } from "./customEditorFixture";

const CUSTOM_PAGE_SUBITEM = {
  id: "custom",
  label: "Press kit",
  href: "/__proto/page-custom",
  icon: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
};

const Grip = () => (
  <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
);
const Kebab = () => (
  <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
);
const TemplateIcon = () => (
  <S w={13}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></S>
);
const PlusIcon = ({ w = 13 }: { w?: number }) => (
  <S w={w}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
);
const CloseIcon = () => (
  <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
);

export function CustomEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = customEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [title] = useState(fx.pageTitle);
  const [live, setLive] = useState(fx.live);
  const [showInNav, setShowInNav] = useState(fx.showInNav);
  const [noindex, setNoindex] = useState(fx.noindex);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [autoOg, setAutoOg] = useState(fx.seo.autoOg);
  const [passwordOn, setPasswordOn] = useState(fx.options.passwordOn);
  const [openKebab, setOpenKebab] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [templates, setTemplates] = useState(false);

  useEscapeKey(() => { setPicker(false); setTemplates(false); setOpenKebab(null); });

  const dirty = () => setSaveState("dirty");

  return (
    <EditorShell
      profile={profile}
      emoji="🧩"
      title={title}
      description="A blank page you build from the block library — use it for press kits, free downloads, FAQs, speaking, anything you need a dedicated URL for."
      slug={fx.slug}
      live={live}
      pageId="custom"
      pageSubItems={[CUSTOM_PAGE_SUBITEM]}
      crumbs={[
        { label: "Home", href: "/__proto/dashboard" },
        { label: "Pages", href: "/__proto/dashboard" },
        { label: title },
      ]}
      saveState={saveState}
      saveLabel="Save changes"
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerActions={
        <>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplates(true)}>
            <TemplateIcon />
            Use template
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => alert("Mockup — opens the public page in a new tab")}>
            <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
            Preview
          </button>
        </>
      }
    >
      {/* ── Page settings ── */}
      <Section title="Page settings" sub="URL, visibility, theme and SEO for this page.">
        <FieldRow>
          <Field label="URL slug" hint="letters, numbers, hyphens · must be unique on your site">
            <div className="pe-prefix-wrap">
              <span className="pe-prefix">tadaify.com/{profile.handle}/</span>
              <input type="text" defaultValue={fx.slug} onChange={dirty} />
            </div>
          </Field>
          <Field label="Publish">
            <RowToggle name="Page is live" sub="Visitors can find this page at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Show in nav menu">
            <RowToggle name="Add to homepage nav" sub="Visitors see a link to this page from your main page." on={showInNav} onChange={(v) => { setShowInNav(v); dirty(); }} />
          </Field>
          <Field label="Hide from search engines">
            <RowToggle name={<>Add <span className="pe-mono">noindex</span> meta</>} sub="Useful for private press kits or unlisted pages." on={noindex} onChange={(v) => { setNoindex(v); dirty(); }} />
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
            <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
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
              <RowToggle
                name="Auto-generated from page title"
                sub={<>Or <a className="pe-inline-link" href="#" onClick={(e) => e.preventDefault()}>upload your own →</a></>}
                on={autoOg}
                onChange={(v) => { setAutoOg(v); dirty(); }}
              />
            </Field>
          </div>
        </details>
      </Section>

      {/* ── Page options (premium power features, no blur) ── */}
      <Section title="Page options" sub="Power features — fully visible. Gated only at Save.">
        <Field label={<>Custom domain for this page <TierBadge tier="pro" /></>}>
          <div className="pe-prefix-wrap">
            <input type="text" placeholder="e.g. presskit.alexandra.com" defaultValue={fx.options.customDomain} onChange={dirty} />
            <button className="pe-suffix-action" type="button">Verify DNS</button>
          </div>
          <TierHint>Per-page custom domain points just this page (e.g. <b>presskit.yourbrand.com</b>) at tadaify. Available on <b>Pro</b> — we'll prompt to upgrade if you save with a value here.</TierHint>
        </Field>

        <Field label={<>Password protection <TierBadge tier="pro" /></>}>
          <RowToggle
            name="Require a password to view"
            sub="Visitors get a 'Locked' screen until they enter the right password. Useful for private press kits, client previews and pre-launch reveals."
            on={passwordOn}
            onChange={(v) => { setPasswordOn(v); dirty(); }}
          />
          <div className="pe-prefix-wrap" style={{ marginTop: 8 }}>
            <span className="pe-prefix" style={{ fontFamily: "var(--font-sans)" }}>🔑</span>
            <input type="text" defaultValue={fx.options.password} placeholder="Set a page password" onChange={dirty} />
          </div>
          <TierHint>Page passwords are a <b>Pro</b> perk. The password screen is fully themeable.</TierHint>
        </Field>

        <Field label={<>Redirect after viewing <TierBadge tier="pro" /></>}>
          <div className="pe-field-row">
            <div className="pe-prefix-wrap">
              <span className="pe-prefix">After</span>
              <input type="number" min={0} max={600} defaultValue={fx.options.redirectSecs} onChange={dirty} />
              <span className="pe-prefix" style={{ paddingRight: 12 }}>seconds</span>
            </div>
            <div className="pe-prefix-wrap">
              <span className="pe-prefix" style={{ fontFamily: "var(--font-sans)" }}>↗</span>
              <input type="text" placeholder="https://store.alexandra.com" defaultValue={fx.options.redirectUrl} onChange={dirty} />
            </div>
          </div>
          <TierHint>Redirect-after is a <b>Pro</b> perk. Leave seconds at <b>0</b> to keep the page sticky.</TierHint>
        </Field>
      </Section>

      {/* ── Page content (the block list) ── */}
      <Section
        title="Page content"
        sub="Drag to reorder. Click any block to edit."
        headExtra={
          <div className="pe-head-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplates(true)}>
              <TemplateIcon />
              Starter templates
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setPicker(true)}>
              <PlusIcon />
              Add block
            </button>
          </div>
        }
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>🧩</div>
            <h3>Start with a blank canvas — or pick a starter</h3>
            <p>This page is published but empty. Add blocks one at a time, or grab a ready-made composition you can edit. Press kit, speaking, FAQ, resources, coming-soon — they all start here.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setPicker(true)}>
                <PlusIcon w={14} />
                Add your first block
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setTemplates(true)}>
                <TemplateIcon />
                Browse starter templates
              </button>
            </div>
            <div className="cu-starter-grid" aria-label="Starter templates">
              {fx.starterTiles.map((t) => (
                <button className="cu-starter-card" type="button" key={t.id} onClick={() => setEmpty(false)}>
                  <span className="cu-st-emoji">{t.emoji}</span>
                  <div>
                    <div className="cu-st-name">{t.name}</div>
                    <div className="cu-st-sub">{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
          </div>
        ) : (
          <>
            <div className="cu-blocklist">
              {fx.blocks.map((b, i) => (
                <div key={b.id}>
                  <div className="cu-block-row">
                    <span className="cu-br-grip" aria-label="Drag to reorder"><Grip /></span>
                    <div className={`cu-br-icon t-${b.tone}`} aria-hidden>{b.emoji}</div>
                    <div className="cu-br-meta">
                      <div className="cu-br-name">
                        {b.name}
                        <span className="cu-br-type-pill">{b.type}</span>
                      </div>
                      <div className="cu-br-summary">{b.summary}</div>
                      {b.flags && b.flags.length > 0 && (
                        <div className="cu-br-flags">
                          {b.flags.map((f) => (
                            <span key={f.text} className={`cu-br-flag is-${f.kind}`}>{f.text}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="cu-br-actions">
                      <button className="btn btn-ghost btn-xs" type="button" onClick={() => setPicker(true)}>Edit</button>
                      <button className="iconbtn" type="button" aria-label="Block options" aria-expanded={openKebab === b.id} onClick={() => setOpenKebab((k) => (k === b.id ? null : b.id))}>
                        <Kebab />
                      </button>
                      {openKebab === b.id && (
                        <div className="cu-kebab-pop is-open">
                          <button type="button" onClick={() => setOpenKebab(null)}>Edit</button>
                          <button type="button" onClick={() => setOpenKebab(null)}>Duplicate</button>
                          <button type="button" onClick={() => setOpenKebab(null)}>Schedule visibility</button>
                          <button type="button" onClick={() => setOpenKebab(null)}>A/B test variants</button>
                          <button type="button" onClick={() => setOpenKebab(null)}>Hide from public</button>
                          <hr />
                          <button className="danger" type="button" onClick={() => setOpenKebab(null)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {i === 5 && (
                    <button className="cu-add-block-row" type="button" onClick={() => setPicker(true)}>
                      <PlusIcon />
                      Add block here
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="cu-add-block-row is-lg" type="button" onClick={() => setPicker(true)} style={{ marginTop: 12 }}>
              <PlusIcon />
              Add another block
            </button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
            </div>
          </>
        )}
      </Section>

      {/* ── Block picker modal ── */}
      {picker && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cu-pm-title" onClick={(e) => { if (e.target === e.currentTarget) setPicker(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="cu-pm-title">Add a block</h3>
              <span className="sub">Pick from the 12 block types</span>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setPicker(false)}><CloseIcon /></button>
            </div>
            <div className="pe-modal-body">
              <div className="search-wrap">
                <S w={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></S>
                <input type="text" placeholder="Search blocks — link, video, image, FAQ…" />
              </div>
              <div className="cu-picker-grid">
                {fx.blockTypes.map((t) => (
                  <button className="cu-picker-card" type="button" key={t.type} onClick={() => setPicker(false)}>
                    <div className="cu-pc-icon">{t.emoji}</div>
                    <div className="cu-pc-name">{t.name}{t.type === "html" && <TierBadge tier="business" />}</div>
                    <div className="cu-pc-desc">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Drag any block to reorder once added.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Starter templates modal ── */}
      {templates && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cu-tm-title" onClick={(e) => { if (e.target === e.currentTarget) setTemplates(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="cu-tm-title">Starter templates</h3>
              <span className="sub">Pre-built block compositions you can edit.</span>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setTemplates(false)}><CloseIcon /></button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Picking a template <b>replaces</b> your current block list. Your page settings (title, slug, theme) stay as they are.</p>
              <div className="cu-templ-grid">
                {fx.templates.map((t) => (
                  <button className="cu-templ-card" type="button" key={t.id} onClick={() => { setEmpty(false); setTemplates(false); }}>
                    <div className="cu-tc-head">
                      <div className="cu-tc-emoji">{t.emoji}</div>
                      <div>
                        <div className="cu-tc-name">{t.name}</div>
                        <div className="cu-tc-sub">{t.sub}</div>
                      </div>
                    </div>
                    <div className="cu-tc-blocks">
                      {t.blocks.map((bl, i) => (
                        <span key={`${bl}-${i}`} className="cu-tc-block-pill">{bl}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplates(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
