/**
 * Legal page editor — the creator-facing editor a creator opens at Pages >
 * Legal. Faithful port of mockups/tadaify-mvp/app-page-legal.html, composed on
 * the shared EditorShell + Section primitives. Pairs with the public visitor
 * view (creator-legal-public). It is a multi-policy single page — Terms /
 * Privacy / Cookie / Refund / DMCA / Accessibility / AUP — each policy rendering
 * as its own anchored section with version tracking on the public page.
 *
 * Presentational, local-state only: collapse cards, quick-pick title, edit
 * title / slug / footer-link / noindex / SEO, pick a page-background swatch,
 * collapse/expand each policy, edit policy name / version / dates / body, flip
 * empty ↔ filled, open the centred add-policy / templates / version-history
 * modals (never side drawers), and a dirty-on-edit save bar. A right-hand
 * compliance helper lists required policies, an annual-review reminder, and
 * translations (Pro). Premium features (multi-language, DMCA/Accessibility/AUP)
 * stay fully visible and interactive; the gate is mocked at Save. All body text
 * is mockup placeholder content. Data comes from the typed legalEditorFixture.
 *
 * @implements fr-page-editor-legal
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
import { legalEditorFixture } from "./legalEditorFixture";

const LEGAL_PAGE_SUBITEM = {
  id: "legal",
  label: "Legal",
  href: "/__proto/page-legal",
  icon: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7l-2 5a3 3 0 0 0 6 0z" />
      <path d="M19 7l-2 5a3 3 0 0 0 6 0z" />
      <path d="M8 21h8" />
    </>
  ),
};

const Grip = () => (
  <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
);
const Kebab = () => (
  <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
);
const HistoryIcon = () => (
  <S w={16}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>
);
const PlusIcon = ({ w = 13 }: { w?: number }) => (
  <S w={w}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
);
const FileIcon = () => (
  <S w={13}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></S>
);
const CloseIcon = () => (
  <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
);

const TIER_BADGE_LABEL = { creator: "creator", pro: "pro", business: "business" } as const;

export function LegalEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = legalEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [footerLink, setFooterLink] = useState(fx.footerLink);
  const [noindex, setNoindex] = useState(fx.noindex);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [policies, setPolicies] = useState(fx.policies);
  const [openKebab, setOpenKebab] = useState<string | null>(null);
  const [addPolicy, setAddPolicy] = useState(false);
  const [templatesModal, setTemplatesModal] = useState(false);
  const [versionModal, setVersionModal] = useState<string | null>(null);

  useEscapeKey(() => { setAddPolicy(false); setTemplatesModal(false); setVersionModal(null); setOpenKebab(null); });

  const dirty = () => setSaveState("dirty");
  const toggleCollapse = (id: string) =>
    setPolicies((ps) => ps.map((p) => (p.id === id ? { ...p, collapsed: !p.collapsed } : p)));

  return (
    <EditorShell
      profile={profile}
      emoji="⚖️"
      title="Legal"
      description="All your legal documents in one place. Required for selling on Meta Ads / Google Ads, GDPR compliance, and refund disclosure for paid offers."
      slug={fx.slug}
      live={live}
      pageId="legal"
      pageSubItems={[LEGAL_PAGE_SUBITEM]}
      saveState={saveState}
      saveLabel="Save & publish"
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerExtra={
        <div className="pe-quick-titles" aria-label="Title quick-pick">
          {fx.titleAlts.map((a) => (
            <button className="pe-qt-chip" type="button" key={a.slug} onClick={dirty}>{a.title}</button>
          ))}
        </div>
      }
      headerActions={
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => alert("Mockup — opens the public page in a new tab")}>
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </button>
      }
    >
      <div className="lg-work-grid">
        <div className="lg-main-col">
          {/* ── Page settings ── */}
          <Section title="Page settings" sub="Title, URL, visibility, search-engine indexing.">
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
                <RowToggle name="Page is live" sub="Visitors can find your Legal page at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
              </Field>
              <Field label="Show in main page footer">
                <RowToggle name="Footer link from your homepage" sub={<>Adds a "Legal" link to the footer of <span className="pe-mono">/{profile.handle}</span>.</>} on={footerLink} onChange={(v) => { setFooterLink(v); dirty(); }} />
              </Field>
            </FieldRow>

            <Field label="Page background" hint="legal pages read best with high-contrast neutrals">
              <div className="pe-swatch-row">
                {fx.backgrounds.map((sw, i) => (
                  <button key={sw.name} type="button" className={`pe-swatch${i === bg ? " is-selected" : ""}`} style={{ background: sw.css }} title={sw.name} aria-label={sw.name} onClick={() => { setBg(i); dirty(); }} />
                ))}
              </div>
            </Field>

            <details className="pe-expander" open>
              <summary>
                SEO &amp; search-engine settings <span className="ex-sub">— legal pages typically excluded from search results</span>
                <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
              </summary>
              <div className="ex-body">
                <RowToggle
                  name={<>Hide from search engines (<span className="pe-mono">noindex,follow</span>)</>}
                  sub="Recommended for Legal pages — Google won't show them in results, but links to/from the page still work normally."
                  on={noindex}
                  onChange={(v) => { setNoindex(v); dirty(); }}
                />
                <Field label="Meta title" hint="~60 chars · only used if a visitor shares the link">
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

          {/* ── Policies ── */}
          <Section
            title="Policies"
            sub="Drag to reorder. Each policy renders as its own section on the public page."
            headExtra={
              <div className="pe-head-actions">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplatesModal(true)}>
                  <FileIcon />
                  Use template
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setAddPolicy(true)}>
                  <PlusIcon />
                  Add policy
                </button>
              </div>
            }
          >
            {empty ? (
              <div className="pe-empty">
                <div className="es-emoji" aria-hidden>⚖️</div>
                <h3>Start with a vetted template</h3>
                <p>Six pre-written starter policies cover the most common creator needs. Replace the placeholders, have a lawyer review, then publish.</p>
                <div className="templates-row" aria-label="Starter templates">
                  {fx.templates.map((t) => (
                    <button className="templ-tile" type="button" key={t.id} onClick={() => setTemplatesModal(true)}>
                      <span className="tt-emoji">{t.emoji}</span>
                      <span className="tt-name">{t.name}</span>
                      <span className="tt-sub">{t.sub}</span>
                    </button>
                  ))}
                </div>
                <div className="es-actions">
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddPolicy(true)}>
                    <PlusIcon />
                    Add a custom policy from scratch
                  </button>
                </div>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
              </div>
            ) : (
              <>
                <div className="lg-pol-list">
                  {policies.map((p) => (
                    <div className={`lg-pol-card${p.collapsed ? " is-collapsed" : ""}`} key={p.id}>
                      <div className="lg-pol-head">
                        <span className="lg-pol-grip" aria-label="Drag policy"><Grip /></span>
                        <span className="lg-pol-icon" aria-hidden>{p.icon}</span>
                        <div className="lg-pol-meta">
                          <input className="lg-pol-name" type="text" defaultValue={p.name} aria-label="Policy name" onChange={dirty} />
                          <div className="lg-pol-line">
                            <span className="chip">v{p.version}</span>
                            <span>Effective {p.effective}</span>
                            <span className="dot" />
                            <span>Updated {p.updated}</span>
                            {p.variant && <><span className="dot" /><span className="chip lg-chip-warn">{p.variant}</span></>}
                          </div>
                        </div>
                        <div className="lg-pol-actions">
                          <button className="iconbtn" type="button" aria-label="Version history" onClick={() => setVersionModal(p.name)}><HistoryIcon /></button>
                          <button className="iconbtn" type="button" aria-label="Policy options" aria-expanded={openKebab === p.id} onClick={() => setOpenKebab((k) => (k === p.id ? null : p.id))}><Kebab /></button>
                          {openKebab === p.id && (
                            <div className="cu-kebab-pop is-open">
                              <button type="button" onClick={() => setOpenKebab(null)}>Copy public link</button>
                              <button type="button" onClick={() => setOpenKebab(null)}>Duplicate</button>
                              <button type="button" onClick={() => setOpenKebab(null)}>Export as PDF</button>
                              <hr />
                              <button className="danger" type="button" onClick={() => setOpenKebab(null)}>Remove</button>
                            </div>
                          )}
                          <button className="lg-pol-collapse" type="button" aria-label={p.collapsed ? "Expand policy" : "Collapse policy"} aria-expanded={!p.collapsed} onClick={() => toggleCollapse(p.id)}>
                            <S w={16}><polyline points="6 9 12 15 18 9" /></S>
                          </button>
                        </div>
                      </div>

                      <div className="lg-pol-body">
                        {p.body ? (
                          <>
                            <div className="lg-meta-grid">
                              <div className="lg-meta-cell">
                                <div className="lg-mc-label">Version</div>
                                <div className="lg-mc-row">
                                  <input className="lg-mc-input" type="text" defaultValue={p.version} onChange={dirty} />
                                  <button className="lg-mc-bump" type="button" onClick={dirty}>+ patch</button>
                                </div>
                              </div>
                              <div className="lg-meta-cell">
                                <div className="lg-mc-label">Effective date</div>
                                <div className="lg-mc-row">
                                  <input className="lg-mc-input" type="date" defaultValue={p.effective} onChange={dirty} />
                                </div>
                              </div>
                              <div className="lg-meta-cell">
                                <div className="lg-mc-label">Last updated</div>
                                <div className="lg-mc-row">
                                  <input className="lg-mc-input" type="date" defaultValue={p.updated} onChange={dirty} />
                                  <button className="lg-mc-bump" type="button" onClick={dirty}>today</button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="pe-field-label" style={{ marginBottom: 6, display: "inline-flex" }}>Body</span>
                              <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                                <button type="button" aria-label="Bold"><b>B</b></button>
                                <button type="button" aria-label="Italic"><i>I</i></button>
                                <span className="rt-sep" />
                                <button type="button" aria-label="Heading 2">H2</button>
                                <button type="button" aria-label="Heading 3">H3</button>
                                <span className="rt-sep" />
                                <button type="button" aria-label="Quote">"</button>
                                <button type="button" aria-label="Bulleted list">•</button>
                                <button type="button" aria-label="Numbered list">1.</button>
                                <span className="rt-sep" style={{ marginLeft: "auto" }} />
                                <button type="button" aria-label="AI suggest section">✨ Suggest section</button>
                              </div>
                              <textarea className="rt-area" defaultValue={p.body} onChange={dirty} />
                              <div className="lg-placeholder-warn">
                                <span aria-hidden>⚠️</span>
                                <div><strong>Mockup placeholder text — replace before publishing.</strong> Have a lawyer review the final wording. tadaify provides starter templates as a convenience; we do not provide legal advice.</div>
                              </div>
                              {p.toc && (
                                <div className="lg-toc-preview" aria-hidden>
                                  <div className="lg-toc-label">Auto-generated TOC entries (from H2 / H3 headings)</div>
                                  <ul>
                                    {p.toc.map((t) => (
                                      <li key={t.num}><span className="lg-toc-num">{t.num}</span><span className="lg-toc-text">{t.text}</span></li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="lg-collapsed-note">Body collapsed — click the chevron to expand and edit.</p>
                            {p.tierHint && (
                              <TierHint>
                                DMCA Policy is part of <b>Creator</b>. Recommended if you host user-submitted content (comments, contact-form attachments, community submissions).
                              </TierHint>
                            )}
                          </>
                        )}
                      </div>

                      {p.body && (
                        <div className="lg-pol-foot">
                          <button className="lg-ver-link" type="button" onClick={() => setVersionModal(p.name)}>
                            <HistoryIcon />
                            View {p.pastVersions} past versions
                          </button>
                          <span className="spacer" />
                          <span className="chip">Anchor: <span className="pe-mono" style={{ marginLeft: 4 }}>{p.anchor}</span></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="sec-actions-row">
                  <span className="spacer" />
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplatesModal(true)}>
                    <FileIcon />
                    Browse templates
                  </button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => setAddPolicy(true)}>
                    <PlusIcon />
                    Add another policy
                  </button>
                </div>

                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
                </div>
              </>
            )}
          </Section>

          {/* ── Cookie banner integration ── */}
          <Section title="Cookie banner integration" sub="The cookie banner that pops up for first-time visitors lives elsewhere — this is just the policy text it links to.">
            <p className="lg-cb-copy">
              Your Cookie Policy on this page is automatically linked from the cookie consent banner. Visitors click "Cookie Policy" in the banner → land on <span className="pe-mono">tadaify.com/{profile.handle}/legal#cookie</span>.
            </p>
            <a className="lg-cookie-link" href="/__proto/dashboard">
              <S w={16}><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="13" r="1" /><circle cx="11" cy="15" r="1" /></S>
              Configure cookie banner →
            </a>
          </Section>
        </div>

        {/* ── Compliance helper sidebar ── */}
        <aside className="lg-helper" aria-label="Compliance helper">
          <h3>Compliance helper</h3>
          <p className="lg-h-sub">Auto-detected from your account setup. Updates as you add products, install integrations, or change account settings.</p>

          <div className="lg-h-block">
            <div className="lg-h-block-title">
              <S w={11}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></S>
              Required for your setup
            </div>
            <ul className="lg-check-list">
              {fx.checklist.map((c) => (
                <li className={`is-${c.state}`} key={c.name}>
                  <span className="lg-cl-ico" aria-hidden>{c.state === "met" ? "✓" : c.state === "needed" ? "!" : "·"}</span>
                  <div>
                    <div className="lg-cl-name">{c.name}</div>
                    <div className="lg-cl-sub">{c.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg-h-block">
            <div className="lg-h-block-title">
              <S w={11}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></S>
              Annual review reminder
            </div>
            <div className="lg-review-row">
              <div className="lg-rr-meta">
                <div className="lg-rr-name">Last reviewed: {fx.review.lastReviewed}</div>
                <div className="lg-rr-sub">All policies due for review by {fx.review.dueBy} (12-month cycle).</div>
              </div>
              <button className="btn btn-warm btn-xs" type="button" onClick={dirty}>Mark reviewed</button>
            </div>
          </div>

          <div className="lg-h-block">
            <div className="lg-h-block-title">
              <S w={11}><path d="M4 7h16" /><path d="M10 7V4" /><path d="M7 7c0 5 2 9 5 9s5-4 5-9" /></S>
              Translations <TierBadge tier="pro" />
            </div>
            <ul className="lg-translation-list">
              {fx.translations.map((t) => (
                <li key={t.name}>
                  <span className="lg-tl-flag" aria-hidden>{t.flag}</span>
                  <span className="lg-tl-name">{t.name}</span>
                  <span className={`lg-tl-status${t.done ? " is-done" : " is-todo"}`}>{t.done ? "Done" : "Add"}</span>
                </li>
              ))}
            </ul>
            <TierHint pro>Multi-language Legal pages are part of <b>Pro</b>. We'll prompt to upgrade at save.</TierHint>
          </div>

          <div className="lg-h-block">
            <div className="lg-h-block-title">
              <S w={11}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></S>
              Need help?
            </div>
            <p className="lg-h-help">Templates are starting points, not legal advice. We recommend booking a 30-min review with a lawyer before going live with paid offers.</p>
            <a className="pe-inline-link" href="/__proto/dashboard">Find a creator-friendly lawyer →</a>
          </div>
        </aside>
      </div>

      {/* ── Add policy modal ── */}
      {addPolicy && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lg-add-title" onClick={(e) => { if (e.target === e.currentTarget) setAddPolicy(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="lg-add-title">Add a policy</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setAddPolicy(false)}><CloseIcon /></button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Pick a policy type. Each one becomes its own section on this Legal page with version tracking + last-updated date.</p>
              <div className="types-grid">
                {fx.policyTypes.map((t) => (
                  <button className={`type-tile${t.added ? " tt-already" : ""}`} type="button" key={t.type} disabled={t.added} onClick={() => setAddPolicy(false)}>
                    {t.added && <span className="lg-tt-added">Added</span>}
                    <div className="tt-row">
                      <div className="tt-icon">{t.icon}</div>
                      <h4 className="tt-name">{t.name}{t.badge && <TierBadge tier={TIER_BADGE_LABEL[t.badge]} />}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>All policy types support version tracking + multi-language (Pro+).</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddPolicy(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Templates picker modal ── */}
      {templatesModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lg-tm-title" onClick={(e) => { if (e.target === e.currentTarget) setTemplatesModal(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="lg-tm-title">Pick a starter template</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setTemplatesModal(false)}><CloseIcon /></button>
            </div>
            <div className="pe-modal-body">
              <div className="lg-templ-disclaimer">
                <span aria-hidden>⚖️</span>
                <div><strong>Templates are starting points, not legal advice.</strong> tadaify provides these as a convenience based on common creator scenarios. Have a lawyer review before publishing — especially if you sell to EU/UK/CA customers, hold sensitive data, or operate in regulated industries.</div>
              </div>
              <div className="types-grid">
                {fx.templates.map((t) => (
                  <button className="type-tile" type="button" key={t.id} onClick={() => { setEmpty(false); setTemplatesModal(false); }}>
                    <div className="tt-row">
                      <div className="tt-icon">{t.emoji}</div>
                      <h4 className="tt-name">{t.name}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                    <ul className="tt-list">{t.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Picking a template adds it as a new policy on this page (or replaces the current draft of the same type).</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTemplatesModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Version history modal ── */}
      {versionModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="lg-ver-title" onClick={(e) => { if (e.target === e.currentTarget) setVersionModal(null); }}>
          <div className="pe-modal is-narrow">
            <div className="pe-modal-head">
              <h3 id="lg-ver-title">Version history</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setVersionModal(null)}><CloseIcon /></button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Past versions are kept for 7 years (UK/EU compliance retention). Visitors can view archived versions via direct link.</p>
              <div className="lg-version-list">
                {fx.versionHistory.map((v) => (
                  <div className={`lg-version-row${v.current ? " is-current" : ""}`} key={v.version}>
                    <span className="lg-vr-version">{v.version}</span>
                    <div className="lg-vr-meta">
                      <div className="lg-vr-eff">{v.effective}</div>
                      <div className="lg-vr-changes">{v.changes}</div>
                    </div>
                    <div className="lg-vr-actions">
                      {v.current ? (
                        <span className="chip live">Live</span>
                      ) : (
                        <button className="iconbtn" type="button" aria-label="View archived version">
                          <S w={16}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <TierHint>Version history with retention is part of <b>Creator</b>. Free plans keep current + previous version only.</TierHint>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Each save bumps version automatically. You can override the version number per save.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setVersionModal(null)}>Close</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setVersionModal(null)}>Export all as PDF</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
