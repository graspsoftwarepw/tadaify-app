/**
 * Contact page editor — the creator-facing editor a creator opens at
 * Pages > Contact. Faithful port of mockups/tadaify-mvp/app-page-contact.html,
 * composed on the shared EditorShell + Section primitives. Pairs with the
 * public visitor view (creator-contact-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish, pick a
 * background swatch, expand/edit form-field rows, switch delivery channels,
 * toggle office-hour days, edit FAQ rows, flip empty ↔ filled, open the
 * section / field-type / thank-you modals, and a dirty-on-edit save bar. Data
 * comes from the typed contactEditorFixture. Premium fields stay fully visible
 * and interactive (no blur); tier badges are inline and the gate is mocked at
 * Save.
 *
 * @implements fr-page-editor-contact
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
import { contactEditorFixture } from "./contactEditorFixture";

const CONTACT_PAGE_SUBITEM = {
  id: "contact",
  label: "Contact",
  href: "/__proto/page-contact",
  icon: (
    <>
      <path d="M4 4h16v16H4z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
};

const Grip = () => (
  <span className="pe-grip" aria-label="Drag to reorder">
    <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></S>
  </span>
);

export function ContactEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = contactEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [fields, setFields] = useState(fx.form.fields);
  const [expandedField, setExpandedField] = useState<string | null>("f-email");
  const [emailRequired, setEmailRequired] = useState(true);
  const [conditional, setConditional] = useState(false);
  const [afterSubmit, setAfterSubmit] = useState(fx.form.afterSubmit);
  const [channels, setChannels] = useState(fx.delivery.channels);
  const [hours, setHours] = useState(fx.hours.rows);
  const [showMap, setShowMap] = useState(fx.other.showMap);
  const [faq, setFaq] = useState(fx.faq);
  const [sectionPicker, setSectionPicker] = useState(false);
  const [fieldPicker, setFieldPicker] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [copied, setCopied] = useState(false);

  const dirty = () => setSaveState("dirty");

  const removeField = (id: string) => { setFields((f) => f.filter((x) => x.id !== id)); dirty(); };
  const toggleChannel = (id: string) => {
    setChannels((cs) => cs.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
    dirty();
  };
  const toggleDay = (day: string) => {
    setHours((rs) => rs.map((r) => (r.day === day ? { ...r, on: !r.on } : r)));
    dirty();
  };

  const removeBtn = (
    <button className="iconbtn is-danger" type="button" aria-label="Remove section">
      <S w={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
    </button>
  );

  return (
    <EditorShell
      profile={profile}
      emoji="📮"
      title="Contact"
      description="A serious channel for visitor inquiries, project requests and bookings — beyond a single mailto link."
      slug={fx.slug}
      live={live}
      pageId="contact"
      pageSubItems={[CONTACT_PAGE_SUBITEM]}
      saveState={saveState}
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerActions={
        <a className="btn btn-ghost btn-sm" href="/__proto/creator-contact-public" target="_blank" rel="noopener">
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </a>
      }
    >
      {/* ── Page settings ── */}
      <Section title="Page settings" sub="Title, URL, theme & SEO." headExtra={<span className="chip live">Live</span>}>
        <FieldRow>
          <Field label="Page title" hint="shown in the browser tab + on the page">
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
              sub="Visitors can find this page at the URL above."
              on={live}
              onChange={(v) => { setLive(v); dirty(); }}
            />
          </Field>
          <Field label="Common alternatives" hint="click to use as title + slug">
            <div className="pe-chip-row">
              {fx.titleSlugAlts.map((a) => (
                <button className="chip" type="button" key={a.slug} onClick={dirty}>{a.title} · /{a.slug}</button>
              ))}
            </div>
          </Field>
        </FieldRow>

        <Field label="Theme color" hint="override theme for this page only">
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
                <div className="cd-sub">Or <span className="cd-ai">✨ generate one with AI</span></div>
              </div>
            </Field>
          </div>
        </details>

        <Field label={<>Custom domain <TierBadge tier="pro" /></>}>
          <div className="pe-prefix-wrap">
            <input type="text" placeholder="e.g. contact.alexandrasilva.com" onChange={dirty} />
            <button className="pe-suffix-action" type="button">Set up</button>
          </div>
          <TierHint>Custom domains are a <b>Pro</b> feature. We'll prompt you to upgrade when you save.</TierHint>
        </Field>
      </Section>

      {empty ? (
        <div className="pe-empty">
          <div className="es-emoji" aria-hidden>📮</div>
          <h3>Your contact page is empty</h3>
          <p>Start with our recommended layout — Hero, Form, Where messages go and Other contact methods — or pick sections one at a time.</p>
          <div className="es-actions">
            <button className="btn btn-primary" type="button" onClick={() => setEmpty(false)}>✨ Use recommended layout</button>
            <button className="btn btn-ghost" type="button" onClick={() => setSectionPicker(true)}>+ Add section</button>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
        </div>
      ) : (
        <>
          {/* ── Hero ── */}
          <Section title={<><Grip /> 🎯 Hero</>} sub="Headline + subhead + optional cover image." headExtra={removeBtn}>
            <Field label="Headline" hint="large, friendly, first thing visitors see">
              <div className="pe-prefix-wrap">
                <input type="text" defaultValue={fx.hero.headline} onChange={dirty} />
                <button className="pe-suffix-action" type="button">✨ Suggest</button>
              </div>
              <div className="pe-chip-row" style={{ marginTop: 6 }}>
                {fx.hero.headlineIdeas.map((h) => (
                  <button className="chip" type="button" key={h} onClick={dirty}>{h}</button>
                ))}
              </div>
            </Field>
            <Field label="Sub-headline">
              <textarea className="pe-area" defaultValue={fx.hero.sub} onChange={dirty} />
            </Field>
            <Field label="Cover image / illustration" hint="optional — 800×600 recommended">
              <div className="pe-cover-drop">
                <span className="cd-emoji" aria-hidden>🖼</span>
                <div className="cd-title">Drop an image, or click to upload</div>
                <div className="cd-sub">JPG, PNG, WebP · max 5MB · or <span className="cd-ai">✨ generate with AI</span></div>
              </div>
            </Field>
          </Section>

          {/* ── Contact form ── */}
          <Section title={<><Grip /> 📝 Contact form</>} sub="Fields visitors fill in to reach you." headExtra={removeBtn}>
            <Field label="Form fields" hint="drag to reorder · click a row to edit">
              <div className="ff-list">
                {fields.map((f) => {
                  const open = expandedField === f.id;
                  return (
                    <div className={`ff-row${open ? " is-expanded" : ""}${f.locked ? " is-required-locked" : ""}`} key={f.id}>
                      <div className={`ff-grip${f.locked ? " is-locked" : ""}`}>
                        <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></S>
                      </div>
                      <div className="ff-main">
                        <div className="ff-summary" onClick={() => !f.auto && setExpandedField(open ? null : f.id)}>
                          <span className="ff-type-icon" aria-hidden>{f.icon}</span>
                          <span className="ff-name">{f.name}</span>
                          <span className="ff-type-name">· {f.typeName}</span>
                          {f.required && <span className="chip required">Required</span>}
                          <span className="ff-spacer" />
                          {f.auto ? (
                            <span className="chip success">Auto</span>
                          ) : (
                            <span className={`ff-caret${open ? " is-open" : ""}`} aria-hidden>
                              <S w={14}><polyline points="6 9 12 15 18 9" /></S>
                            </span>
                          )}
                        </div>
                        {open && f.type === "email" && (
                          <div className="ff-config">
                            <FieldRow>
                              <Field label="Label"><input className="pe-input" type="text" defaultValue="Email" onChange={dirty} /></Field>
                              <Field label="Placeholder"><input className="pe-input" type="text" defaultValue="you@example.com" onChange={dirty} /></Field>
                            </FieldRow>
                            <FieldRow>
                              <Field label="Help text" hint="small caption shown below the field">
                                <input className="pe-input" type="text" defaultValue="We'll only use this to reply to you." onChange={dirty} />
                              </Field>
                              <Field label="Required">
                                <RowToggle name="Visitor must fill this in" sub="Email is the only way to reply — we recommend keeping this on." on={emailRequired} onChange={(v) => { setEmailRequired(v); dirty(); }} />
                              </Field>
                            </FieldRow>
                            <Field label={<>Conditional visibility <TierBadge tier="pro" /></>}>
                              <RowToggle name="Show this field only when…" sub='e.g. show "Project budget" only when "Inquiry type" = Booking. Lets you keep the form short.' on={conditional} onChange={(v) => { setConditional(v); dirty(); }} />
                              <TierHint pro>Conditional visibility is a <b>Pro</b> feature. We'll prompt you to upgrade when you save.</TierHint>
                            </Field>
                            <div className="ff-config-foot">
                              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => removeField(f.id)}>Delete field</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="ff-add" type="button" onClick={() => setFieldPicker(true)}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add field
              </button>
            </Field>

            <FieldRow>
              <Field label="Submit button label">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue={fx.form.submitLabel} onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>
              <Field label="After submit">
                <select className="pe-select" value={afterSubmit} onChange={(e) => { setAfterSubmit(e.target.value as typeof afterSubmit); dirty(); }}>
                  <option value="inline">Show inline success message</option>
                  <option value="redirect">Redirect to a URL</option>
                  <option value="thank-you">Show a custom Thank-you sub-page</option>
                </select>
                {afterSubmit === "redirect" && (
                  <input className="pe-input" type="url" placeholder="https://yoursite.com/thanks" style={{ marginTop: 6 }} onChange={dirty} />
                )}
                {afterSubmit === "thank-you" && (
                  <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 6 }} onClick={() => setThankYou(true)}>
                    <S w={13}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><polygon points="18.5 2.5 22 6 12 16 8 16 8 12 18.5 2.5" /></S>
                    Edit thank-you sub-page
                  </button>
                )}
              </Field>
            </FieldRow>

            <Field label="Spam protection">
              <RowToggle name="Invisible reCAPTCHA + honeypot" sub="Honeypot is always on. Invisible reCAPTCHA adds a Google check that runs in the background — visitors don't see it." on onChange={dirty} />
            </Field>
          </Section>

          {/* ── Where messages go ── */}
          <Section title={<><Grip /> 📡 Where messages go</>} sub="Email forwarding by default, plus optional third-party services. tadaify is a passthrough — we don't store messages." headExtra={removeBtn}>
            <Field label="Email forwarding" hint="we send each message here">
              <FieldRow>
                <input className="pe-input" type="email" defaultValue={fx.delivery.forwardEmail} onChange={dirty} />
                <Field label={<>Send to multiple <TierBadge tier="business" /></>}>
                  <RowToggle name="CC/BCC additional addresses" sub="Useful for team inboxes — every message also goes to your assistant or partner." on={false} onChange={dirty} />
                </Field>
              </FieldRow>
            </Field>

            <Field label={<>Send to other tools <TierBadge tier="pro" /></>} hint="optional — useful for team workflows">
              <div className="dch-grid">
                {channels.map((c) => (
                  <div className={`dch-card${c.on ? " is-on" : ""}`} key={c.id}>
                    <div className="dch-row">
                      <span className="dch-icon" aria-hidden>{c.icon}</span>
                      <span className="dch-name">{c.name}</span>
                      <button type="button" className={`pe-toggle${c.on ? " is-on" : ""}`} role="switch" aria-checked={c.on} aria-label={`Toggle ${c.name}`} onClick={() => toggleChannel(c.id)} />
                    </div>
                    <div className="dch-sub">{c.sub}</div>
                    {c.on && (
                      <div className="dch-config">
                        <input type="url" defaultValue={c.value} placeholder={c.placeholder} onChange={dirty} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <TierHint pro>Direct providers are a <b>Pro</b> feature. Toggles work in the editor; on Save we'll prompt you to upgrade if any provider is enabled.</TierHint>
              <div className="endpoint-block">
                <div className="endpoint-label">Your inbound endpoint <span className="pe-field-hint">(for testing or external posting tools)</span></div>
                <div className="endpoint-row">
                  <code>{fx.delivery.endpoint}</code>
                  <button className="ep-copy" type="button" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? "Copied ✓" : "Copy"}</button>
                </div>
              </div>
            </Field>
          </Section>

          {/* ── Office hours ── */}
          <Section title={<><Grip /> 🕐 Office hours <TierBadge tier="creator" /></>} sub="When you actually reply." headExtra={removeBtn}>
            <Field label="What to show on the page">
              <select className="pe-select" defaultValue="response" onChange={dirty}>
                <option value="schedule">Display schedule (full grid)</option>
                <option value="response">Display response time ("Replies usually within 24h")</option>
                <option value="both">Both</option>
              </select>
            </Field>
            <Field label="Schedule grid" hint="toggle a day off to mark it as closed">
              <div className="hours-grid">
                {hours.map((r) => (
                  <div className={`hours-row${r.on ? "" : " is-off"}`} key={r.day}>
                    <div className="hr-day">
                      <button type="button" className={`pe-toggle${r.on ? " is-on" : ""}`} role="switch" aria-checked={r.on} aria-label={`Toggle ${r.day}`} onClick={() => toggleDay(r.day)} />
                      {r.day}
                    </div>
                    <div className="hr-times">
                      {r.on ? (
                        <>
                          <input className="hr-time" type="text" defaultValue={r.from} onChange={dirty} />
                          <span className="hr-sep">→</span>
                          <input className="hr-time" type="text" defaultValue={r.to} onChange={dirty} />
                        </>
                      ) : (
                        <span className="hr-closed">Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Field>
            <FieldRow>
              <Field label="Timezone">
                <select className="pe-select" defaultValue={fx.hours.timezone} onChange={dirty}>
                  <option>{fx.hours.timezone}</option>
                  <option>Europe/Berlin</option>
                  <option>Europe/Warsaw</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Asia/Tokyo</option>
                </select>
              </Field>
              <Field label="Typical response time">
                <select className="pe-select" defaultValue={fx.hours.responseTime} onChange={dirty}>
                  <option>Within 1 hour</option>
                  <option>Within 4 hours</option>
                  <option>Within 24 hours</option>
                  <option>Within 2 business days</option>
                  <option>Within 1 week</option>
                </select>
              </Field>
            </FieldRow>
          </Section>

          {/* ── Other contact methods ── */}
          <Section title={<><Grip /> 📞 Other contact methods</>} sub="Phone, social, address, map." headExtra={removeBtn}>
            <Field label="Public business email" hint="shown on the page · separate from forwarding above">
              <div className="other-methods">
                <div className="om-card"><span className="om-icon">✉️</span><input type="email" defaultValue={fx.other.email} onChange={dirty} /></div>
                <div className="om-card"><span className="om-icon">📞</span><input type="tel" defaultValue={fx.other.phone} placeholder="Phone (optional)" onChange={dirty} /></div>
              </div>
            </Field>
            <Field label="Messaging">
              <div className="other-methods">
                <div className="om-card"><span className="om-icon">📱</span><input type="text" defaultValue={fx.other.whatsapp} placeholder="WhatsApp number (optional)" onChange={dirty} /></div>
                <div className="om-card"><span className="om-icon">💬</span><input type="text" defaultValue={fx.other.telegram} placeholder="Telegram handle (optional)" onChange={dirty} /></div>
              </div>
            </Field>
            <Field label="Social profiles" hint="visitors can DM you here too · pulled from main page if blank">
              <div className="other-methods">
                <div className="om-card"><span className="om-icon">📷</span><input type="text" defaultValue={fx.other.instagram} placeholder="Instagram handle" onChange={dirty} /></div>
                <div className="om-card"><span className="om-icon">🐦</span><input type="text" defaultValue={fx.other.twitter} placeholder="X / Twitter handle" onChange={dirty} /></div>
                <div className="om-card"><span className="om-icon">💼</span><input type="text" defaultValue={fx.other.linkedin} placeholder="LinkedIn handle" onChange={dirty} /></div>
                <div className="om-card"><span className="om-icon">▶️</span><input type="text" defaultValue={fx.other.youtube} placeholder="YouTube channel" onChange={dirty} /></div>
              </div>
            </Field>
            <Field label="Physical address" hint="optional — for service businesses or studios">
              <input className="pe-input" type="text" defaultValue={fx.other.address} onChange={dirty} />
            </Field>
            <Field label="Show map embed">
              <RowToggle name="Embed a map under the address" sub="Uses the Embedded block oEmbed pattern — Google Maps via iframe by default; OpenStreetMap as a fallback." on={showMap} onChange={(v) => { setShowMap(v); dirty(); }} />
              {showMap && (
                <div className="map-preview" aria-label="Map preview">
                  <span className="mp-pin" aria-hidden>📍</span>
                </div>
              )}
            </Field>
          </Section>

          {/* ── FAQ-quickref ── */}
          <Section title={<><Grip /> ❓ FAQ-quickref <TierBadge tier="creator" /></>} sub="3-5 common questions inline · cuts down dumb inquiries." headExtra={removeBtn}>
            {faq.map((q) => (
              <div className="faq-item" key={q.id}>
                <div className="faq-head">
                  <span className="faq-grip" aria-label="Drag to reorder">
                    <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></S>
                  </span>
                  <input className="faq-q" type="text" defaultValue={q.q} onChange={dirty} />
                  <button className="iconbtn is-danger" type="button" aria-label="Delete" onClick={() => { setFaq((f) => f.filter((x) => x.id !== q.id)); dirty(); }}>
                    <S w={14}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                  </button>
                </div>
                <textarea className="faq-a" defaultValue={q.a} onChange={dirty} />
              </div>
            ))}
            <button className="ff-add" type="button" onClick={dirty}>
              <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add question
            </button>
          </Section>

          <div className="add-section-row">
            <button className="add-section-cta" type="button" onClick={() => setSectionPicker(true)}>
              <S w={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add section
            </button>
          </div>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
          </div>
        </>
      )}

      {/* ── Section picker modal ── */}
      {sectionPicker && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="csp-title" onClick={(e) => { if (e.target === e.currentTarget) setSectionPicker(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="csp-title">Add a section</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setSectionPicker(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Pick a section to insert. You can drag to reorder once added.</p>
              <div className="types-grid">
                {fx.sectionTypes.map((t) => (
                  <button className="type-tile" type="button" key={t.type} onClick={() => setSectionPicker(false)}>
                    <div className="tt-row">
                      <div className="tt-icon">{t.emoji}</div>
                      <h4 className="tt-name">{t.name}{t.tier && <TierBadge tier={t.tier} />}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                    {t.already && <span className="tt-already">Already on page</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Pick a section to insert. You can drag to reorder once added.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSectionPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Field-type picker modal ── */}
      {fieldPicker && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cft-title" onClick={(e) => { if (e.target === e.currentTarget) setFieldPicker(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="cft-title">Add a form field</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setFieldPicker(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <div className="types-grid">
                {fx.fieldTypes.map((t) => (
                  <button className="type-tile" type="button" key={t.type} onClick={() => setFieldPicker(false)}>
                    <div className="tt-row">
                      <div className="tt-icon">{t.emoji}</div>
                      <h4 className="tt-name">{t.name}{t.tier && <TierBadge tier={t.tier} />}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Tier-gated fields are addable now — we'll prompt at Save if your tier doesn't include them.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setFieldPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Thank-you sub-page modal ── */}
      {thankYou && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cty-title" onClick={(e) => { if (e.target === e.currentTarget) setThankYou(false); }}>
          <div className="pe-modal is-narrow">
            <div className="pe-modal-head">
              <h3 id="cty-title">🙏 Thank-you sub-page</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setThankYou(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Shown after a visitor submits the form. Lives at <code>tadaify.com/{profile.handle}/contact/thanks</code>.</p>
              <Field label="Headline">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue={fx.thankYou.headline} onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>
              <Field label="Body">
                <textarea className="pe-area" defaultValue={fx.thankYou.body} onChange={dirty} />
              </Field>
            </div>
            <div className="pe-modal-foot">
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setThankYou(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setThankYou(false)}>Save thank-you page</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
