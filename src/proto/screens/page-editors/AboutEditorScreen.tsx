/**
 * About page editor — the creator-facing editor a creator sees at
 * Pages > About. Faithful port of mockups/tadaify-mvp/app-page-about.html,
 * composed on the shared EditorShell + Section primitives. Pairs with the
 * public visitor view (creator-about-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish/nav, pick a
 * background swatch, flip empty ↔ filled, open the Add-section picker modal, and
 * a dirty-on-edit save bar. Data comes from the typed aboutEditorFixture.
 * Premium fields stay fully visible + interactive (no blur); tier badges are
 * inline and the gate is mocked at Save.
 *
 * @implements fr-page-editor-about
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
import {
  aboutEditorFixture,
  aboutStarters,
  type AboutSectionType,
} from "./aboutEditorFixture";

const ABOUT_PAGE_SUBITEM = {
  id: "about",
  label: "About",
  href: "/__proto/page-about",
  icon: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

type CardId = AboutSectionType;

export function AboutEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = aboutEditorFixture();
  const starters = aboutStarters();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [showInNav, setShowInNav] = useState(fx.showInNav);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [tlStyle, setTlStyle] = useState<"list" | "cards">("list");
  const [ctaStyle, setCtaStyle] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<CardId, boolean>>({
    hero: false,
    bio: false,
    highlights: false,
    timeline: false,
    press: false,
    contact: false,
  });
  const [picker, setPicker] = useState(false);

  const dirty = () => setSaveState("dirty");
  const toggleCard = (id: CardId) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const shownCount = 5;

  return (
    <EditorShell
      profile={profile}
      emoji="👤"
      title="About"
      description="A long-form story page — bio, timeline, highlights, press. For creators who want richer storytelling than the homepage hero."
      slug={fx.slug}
      live={live}
      pageId="about"
      pageSubItems={[ABOUT_PAGE_SUBITEM]}
      saveState={saveState}
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerActions={
        <a className="btn btn-ghost btn-sm" href="/__proto/creator-about-public" target="_blank" rel="noopener">
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </a>
      }
    >
      {/* ── Section 1: Page settings ── */}
      <Section title="Page settings" sub="Title, URL, visibility, theme and SEO for the About page.">
        <FieldRow>
          <Field label="Page title" hint="also used as the <h1> if Hero section is empty">
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
            <RowToggle
              name="Page is live"
              sub="Visitors can find it at the URL above."
              on={live}
              onChange={(v) => { setLive(v); dirty(); }}
            />
          </Field>
          <Field label="Show in nav">
            <RowToggle
              name="Link from main page"
              sub='"About" appears in your top navigation.'
              on={showInNav}
              onChange={(v) => { setShowInNav(v); dirty(); }}
            />
          </Field>
        </FieldRow>

        <Field label="Page background" hint="override theme colour for this page only">
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
        </Field>

        <Field
          label={<>Custom domain <TierBadge tier="pro" /></>}
          hint="e.g. about.alexandrasilva.com instead of tadaify.com/alexandra/about"
        >
          <div className="pe-prefix-wrap">
            <input type="text" placeholder="about.yourdomain.com" onChange={dirty} />
            <button className="pe-suffix-action" type="button">Set up →</button>
          </div>
          <TierHint>
            Per-page custom domains are part of the <b>Pro</b> plan. We'll prompt to upgrade when you save if you set one.
          </TierHint>
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

      {/* ── Section 2: Page content ── */}
      <Section
        title="Page content"
        sub="Click a card header to collapse / expand."
        headExtra={<span className="chip">{shownCount} sections</span>}
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>👋</div>
            <h3>Tell visitors who you are</h3>
            <p>Build your About page section by section — hero photo, bio, highlights, story timeline. Or pick a starter template and tweak it.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setPicker(true)}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add your first section
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setPicker(true)}>✨ Use a starter template</button>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>
              Demo: show filled state
            </button>
          </div>
        ) : (
          <>
            <div className="pe-sections-stack">
              {/* Hero card */}
              <SecCard id="hero" icon="🌅" tone="warm" title="Hero" sub="Photo + name + one-line tagline + social proof." collapsed={collapsed.hero} onToggle={() => toggleCard("hero")}>
                <div className="hero-editor">
                  <div className="photo-drop has-photo" title="Click to replace">{fx.hero.initial}</div>
                  <div className="hero-fields">
                    <Field label="Display name">
                      <input className="pe-input" type="text" defaultValue={fx.hero.name} onChange={dirty} />
                    </Field>
                    <Field label="One-line tagline">
                      <div className="pe-prefix-wrap">
                        <input type="text" defaultValue={fx.hero.tagline} onChange={dirty} />
                        <button className="pe-suffix-action" type="button">✨ Suggest</button>
                      </div>
                    </Field>
                    <Field label="Social proof line" hint="handle · followers · timeframe">
                      <div className="social-proof-line">
                        <b>{fx.hero.proof.handle}</b>
                        <span className="sp-dot" />
                        <span><b>{fx.hero.proof.followers}</b> followers</span>
                        <span className="sp-dot" />
                        <span>since <b>{fx.hero.proof.since}</b></span>
                        <button className="iconbtn" aria-label="Edit social proof" type="button" style={{ marginLeft: "auto" }}>
                          <S><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" /></S>
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              </SecCard>

              {/* Bio card */}
              <SecCard id="bio" icon="📝" tone="indigo" title="Bio" sub="Tell visitors who you are. ~150 words is the sweet spot." collapsed={collapsed.bio} onToggle={() => toggleCard("bio")}>
                <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                  <button type="button" aria-label="Bold"><b>B</b></button>
                  <button type="button" aria-label="Italic"><i>I</i></button>
                  <span className="rt-sep" />
                  <button type="button" aria-label="Heading">H</button>
                  <button type="button" aria-label="Quote">❝</button>
                  <span className="rt-sep" style={{ marginLeft: "auto" }} />
                  <button type="button" aria-label="AI suggest">✨ AI</button>
                </div>
                <textarea className="rt-area" defaultValue={fx.bio.text} onChange={dirty} />
                <div className="rt-meta">
                  <span><span className="word-count is-good">{fx.bio.words} words</span> · ~45 sec read</span>
                  <span>Sweet spot: 100–200 words</span>
                </div>
              </SecCard>

              {/* Highlights card */}
              <SecCard id="highlights" icon="⭐" tone="emerald" title="Highlights" sub="3–6 stat cards. Pick an icon, set the value + caption." collapsed={collapsed.highlights} onToggle={() => toggleCard("highlights")}>
                <div className="highlights-grid">
                  {fx.highlights.map((h) => (
                    <div className="highlight-card" key={h.id}>
                      <div className="hc-icon-row">
                        <button className="hc-icon-btn" type="button" aria-label="Pick icon">{h.icon}</button>
                        <button className="iconbtn hc-remove" type="button" aria-label="Remove">
                          <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                        </button>
                      </div>
                      <input className="hc-value" type="text" defaultValue={h.value} onChange={dirty} />
                      <input className="hc-caption" type="text" defaultValue={h.caption} onChange={dirty} />
                    </div>
                  ))}
                  <button className="pe-add-tile" type="button" aria-label="Add highlight">
                    <S><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                    Add highlight
                  </button>
                </div>
              </SecCard>

              {/* Timeline card */}
              <SecCard id="timeline" icon="📅" tone="rose" title="Story timeline" sub="Year-by-year milestones. Drag entries within the section." collapsed={collapsed.timeline} onToggle={() => toggleCard("timeline")}>
                <div className="tl-style-row">
                  <span>Visual style:</span>
                  <div className="tl-style-pills" role="tablist" aria-label="Timeline style">
                    <button type="button" className={tlStyle === "list" ? "is-active" : ""} onClick={() => { setTlStyle("list"); dirty(); }}>List (alternating)</button>
                    <button type="button" className={tlStyle === "cards" ? "is-active" : ""} onClick={() => { setTlStyle("cards"); dirty(); }}>Cards</button>
                  </div>
                  <span style={{ marginLeft: "auto" }}>{fx.timeline.length} milestones</span>
                </div>
                <div className="timeline-editor">
                  {fx.timeline.map((m) => (
                    <div className="tl-entry" key={m.id}>
                      <span className="tl-grip" aria-label="Drag to reorder">
                        <S><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
                      </span>
                      <input className="tl-year" type="text" defaultValue={m.year} onChange={dirty} />
                      <div className="tl-fields">
                        <input className="tl-title-input" type="text" defaultValue={m.title} onChange={dirty} />
                        <textarea className="tl-desc-input" rows={2} defaultValue={m.desc} onChange={dirty} />
                      </div>
                      <div className="tl-actions">
                        <button className="iconbtn" type="button" aria-label="Add photo">
                          <S><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></S>
                        </button>
                        <button className="iconbtn" type="button" aria-label="Remove milestone">
                          <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="pe-add-inline" type="button" style={{ marginTop: 10 }}>
                  <S><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                  Add milestone
                </button>
              </SecCard>

              {/* Press card */}
              <SecCard id="press" icon="📰" tone="" title={<>Press / quotes <TierBadge tier="creator" /></>} sub="2–3 quote cards with attribution. Renders as a carousel on the public page." collapsed={collapsed.press} onToggle={() => toggleCard("press")}>
                <div className="quotes-grid">
                  {fx.press.map((q) => (
                    <div className="quote-card" key={q.id}>
                      <button className="iconbtn hc-remove" type="button" aria-label="Remove quote" style={{ position: "absolute", top: 6, right: 6 }}>
                        <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                      </button>
                      <textarea className="qc-text" defaultValue={q.text} onChange={dirty} />
                      <div className="qc-attribution">
                        <span className={`sec-icon ${q.tone}`} style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, width: 24, height: 24, borderRadius: 6 }}>{q.initials}</span>
                        <input className="qc-attr-input" type="text" defaultValue={q.attribution} onChange={dirty} />
                      </div>
                    </div>
                  ))}
                  <button className="pe-add-tile" type="button" aria-label="Add quote" style={{ minHeight: 110 }}>
                    <S><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                    Add quote
                  </button>
                </div>
                <TierHint>
                  Press / quotes is part of the <b>Creator</b> plan (Free is limited to the first 4 sections of any About page). We'll prompt to upgrade when you save if it's still here.
                </TierHint>
              </SecCard>

              {/* Contact CTA card */}
              <SecCard id="contact" icon="✉️" tone="" title="Contact CTA" sub='A "Get in touch" button at the bottom of the page.' collapsed={collapsed.contact} onToggle={() => toggleCard("contact")}>
                <div className="cta-fields">
                  <Field label="Button label">
                    <div className="pe-prefix-wrap">
                      <input type="text" defaultValue={fx.contact.label} onChange={dirty} />
                      <button className="pe-suffix-action" type="button">✨ Suggest</button>
                    </div>
                  </Field>
                  <Field label="Where it goes">
                    <select className="pe-select" defaultValue={fx.contact.target} onChange={dirty}>
                      <option>{fx.contact.target}</option>
                      <option>External email — mailto:hello@alexandrasilva.com</option>
                      <option>External URL</option>
                      <option>Booking link (Calendly / Cal.com)</option>
                    </select>
                  </Field>
                </div>
                <Field label={<>Button style <TierBadge tier="pro" /></>} hint="custom button styles unlock branded shapes">
                  <div className="cta-style-pills">
                    {["Pill (default)", "Rounded square", "Square", "Outline"].map((label, i) => (
                      <button key={label} type="button" className={i === ctaStyle ? "is-active" : ""} onClick={() => { setCtaStyle(i); dirty(); }}>{label}</button>
                    ))}
                  </div>
                  <TierHint>
                    Anything other than <b>Pill</b> is part of the <b>Pro</b> plan. We'll prompt to upgrade when you save if you change it.
                  </TierHint>
                </Field>
              </SecCard>
            </div>

            <div className="add-section-row">
              <button className="add-section-cta" type="button" onClick={() => setPicker(true)}>
                <S w={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add section
              </button>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>
                Demo: show empty state
              </button>
            </div>
          </>
        )}
      </Section>

      {/* ── Add-section picker modal ── */}
      {picker && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sp-title" onClick={(e) => { if (e.target === e.currentTarget) setPicker(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="sp-title">Add a section</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setPicker(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Pick a section type to add to your About page. You can reorder, edit and remove any section after adding it.</p>
              <div className="types-grid">
                {fx.sectionTypes.map((t) => (
                  <button className="type-tile" type="button" key={t.type} onClick={() => setPicker(false)}>
                    <div className="tt-row">
                      <div className={`tt-icon ${t.tone}`}>{t.icon}</div>
                      <h4 className="tt-name">{t.name}{t.tier && <TierBadge tier={t.tier} />}</h4>
                    </div>
                    <p className="tt-desc">{t.desc}</p>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, margin: "0 0 8px" }}>✨ Or start from a template</h4>
                <div className="types-grid">
                  {starters.map((s) => (
                    <button className="type-tile" type="button" key={s.id} onClick={() => setPicker(false)}>
                      <div className="tt-row">
                        <div className="tt-icon">{s.emoji}</div>
                        <h4 className="tt-name">{s.name}</h4>
                      </div>
                      <p className="tt-desc">{s.meta}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Free plan: up to 4 sections per About page.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}

/* ============================================================
   Section card — the About-specific draggable card (distinct from
   the shared collapsible Section which wraps each top-level block).
   ============================================================ */
function SecCard({
  icon,
  tone,
  title,
  sub,
  collapsed,
  onToggle,
  children,
}: {
  id: CardId;
  icon: string;
  tone: "warm" | "rose" | "emerald" | "indigo" | "";
  title: React.ReactNode;
  sub: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className={`pe-sec-card${collapsed ? " is-collapsed" : ""}`}>
      <header className="sec-head">
        <span className="sec-grip" aria-label="Drag to reorder">
          <S><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
        </span>
        <span className={`sec-icon ${tone}`} aria-hidden>{icon}</span>
        <div className="sec-meta">
          <h3 className="sec-title">{title}</h3>
          <p className="sec-sub">{sub}</p>
        </div>
        <div className="sec-actions">
          <button className="iconbtn" type="button" aria-label="Remove section">
            <S><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></S>
          </button>
          <button className="sec-toggle" type="button" aria-label="Toggle section" aria-expanded={!collapsed} onClick={onToggle}>
            <S><polyline points="6 9 12 15 18 9" /></S>
          </button>
        </div>
      </header>
      <div className="sec-body">{children}</div>
    </article>
  );
}
