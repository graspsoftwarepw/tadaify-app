/**
 * Newsletter signup page editor — the creator-facing editor a creator opens at
 * Pages > Subscribe. Faithful port of
 * mockups/tadaify-mvp/app-page-newsletter-signup.html, composed on the shared
 * EditorShell + Section primitives. Pairs with the public visitor view
 * (creator-newsletter-signup-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish, pick a
 * background swatch, switch the email provider (panel swaps), pick a form
 * layout, edit bullet / quote / FAQ rows, flip empty ↔ filled, open the
 * section-picker / image-picker modals, and a dirty-on-edit save bar. Data comes
 * from the typed newsletterSignupEditorFixture. Premium fields (custom domain,
 * A/B testing, past-issues, public count) stay fully visible and interactive
 * (no blur); tier badges are inline and the gate is mocked at Save.
 *
 * @implements fr-page-editor-newsletter-signup
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
import {
  newsletterSignupEditorFixture,
  type FormLayout,
  type NewsletterProvider,
} from "./newsletterSignupEditorFixture";

const NEWSLETTER_PAGE_SUBITEM = {
  id: "newsletter-signup",
  label: "Subscribe",
  href: "/__proto/page-newsletter-signup",
  icon: (
    <>
      <path d="M4 4h16v16H4z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
};

const LAYOUTS: { value: FormLayout; name: string; sub: string }[] = [
  { value: "oneline", name: "One-line", sub: "Email + Subscribe on the same row. Highest conversion for short forms." },
  { value: "twoline", name: "Two-line", sub: "Email above, full-width Subscribe button below. Easier on mobile." },
  { value: "card", name: "Centered card", sub: "Stacked card with optional icon. Most editorial." },
];

const Grip = () => (
  <span className="pe-grip" aria-label="Drag to reorder">
    <S w={14}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></S>
  </span>
);

export function NewsletterSignupEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = newsletterSignupEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [ab, setAb] = useState(false);
  const [provider, setProvider] = useState<NewsletterProvider>(fx.selectedProvider);
  const [showKey, setShowKey] = useState(false);
  const [layout, setLayout] = useState(fx.form.layout);
  const [consent, setConsent] = useState(fx.form.consent);
  const [proofStyle, setProofStyle] = useState(fx.socialProof.style);
  const [quotes, setQuotes] = useState(fx.socialProof.quotes);
  const [bullets, setBullets] = useState(fx.whatYoullGet.bullets);
  const [showPast, setShowPast] = useState(fx.pastIssues.show);
  const [faq, setFaq] = useState(fx.faq);
  const [sectionPicker, setSectionPicker] = useState(false);
  const [imagePicker, setImagePicker] = useState(false);

  useEscapeKey(() => { setSectionPicker(false); setImagePicker(false); });
  const [copied, setCopied] = useState(false);

  const dirty = () => setSaveState("dirty");

  const removeBtn = (
    <button className="iconbtn is-danger" type="button" aria-label="Remove section">
      <S w={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
    </button>
  );

  const coverDrop = (
    <div className="pe-cover-drop" onClick={() => setImagePicker(true)}>
      <span className="cd-emoji" aria-hidden>🖼</span>
      <div className="cd-title">Drop an image, or click to upload</div>
      <div className="cd-sub">JPG, PNG, WebP · max 5MB · or <span className="cd-ai">✨ generate with AI</span></div>
    </div>
  );

  const providerLabel = fx.providers.find((p) => p.value === provider)?.label ?? "";

  return (
    <EditorShell
      profile={profile}
      emoji="✉️"
      title="Subscribe"
      description="A dedicated subscribe page — provider, form, social proof and past issues — for creators who want more than a single email field."
      slug={fx.slug}
      live={live}
      pageId="newsletter-signup"
      pageSubItems={[NEWSLETTER_PAGE_SUBITEM]}
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
            <RowToggle name="Page is live" sub="Visitors can find this page at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
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
              <div className="pe-cover-drop" onClick={() => setImagePicker(true)}>
                <span className="cd-emoji" aria-hidden>🖼</span>
                <div className="cd-title">Drop an image, or click to upload</div>
                <div className="cd-sub">Or <span className="cd-ai">✨ generate one with AI</span></div>
              </div>
            </Field>
          </div>
        </details>

        <Field label={<>Custom domain <TierBadge tier="pro" /></>}>
          <div className="pe-prefix-wrap">
            <input type="text" placeholder="e.g. subscribe.alexandrasilva.com" onChange={dirty} />
            <button className="pe-suffix-action" type="button">Set up</button>
          </div>
          <TierHint>Custom domains are a <b>Pro</b> feature. We'll prompt you to upgrade when you save.</TierHint>
        </Field>

        <Field label={<>A/B test variants <TierBadge tier="business" /></>}>
          <RowToggle name="Test two versions of this page" sub="Show different headlines or button labels to your visitors and we'll pick the winner automatically." on={ab} onChange={(v) => { setAb(v); dirty(); }} />
          {ab && <TierHint>A/B testing is a <b>Business</b> feature. We'll prompt you to upgrade when you save.</TierHint>}
        </Field>
      </Section>

      {empty ? (
        <div className="pe-empty">
          <div className="es-emoji" aria-hidden>✉️</div>
          <h3>Your subscribe page is empty</h3>
          <p>Start with our recommended layout — Hero, Provider, Signup form, What you'll get and FAQ — or pick sections one at a time.</p>
          <div className="es-actions">
            <button className="btn btn-primary" type="button" onClick={() => setEmpty(false)}>✨ Use recommended layout</button>
            <button className="btn btn-ghost" type="button" onClick={() => setSectionPicker(true)}>+ Add section</button>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
        </div>
      ) : (
        <>
          {/* ── Hero ── */}
          <Section title={<><Grip /> 🎯 Hero</>} sub="Headline + sub-headline + optional cover image." headExtra={removeBtn}>
            <Field label="Headline" hint="large, friendly, first thing visitors see">
              <div className="pe-prefix-wrap">
                <input type="text" defaultValue={fx.hero.headline} onChange={dirty} />
                <button className="pe-suffix-action" type="button">✨ Suggest</button>
              </div>
              <div className="pe-chip-row" style={{ marginTop: 6 }}>
                {fx.hero.headlineIdeas.map((h) => (<button className="chip" type="button" key={h} onClick={dirty}>{h}</button>))}
              </div>
            </Field>
            <Field label="Sub-headline">
              <textarea className="pe-area" defaultValue={fx.hero.sub} onChange={dirty} />
            </Field>
            <Field label="Cover image / logo" hint="optional — 800×600 recommended">{coverDrop}</Field>
          </Section>

          {/* ── Email provider ── */}
          <Section title={<><Grip /> 🔌 Email provider</>} sub="Where new subscribers land." headExtra={<span className="chip success">✓ Connected</span>}>
            <Field label="Email provider" hint="all providers free on every tadaify plan">
              <select className="pe-select" value={provider} onChange={(e) => { setProvider(e.target.value as NewsletterProvider); dirty(); }}>
                {fx.providers.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>

            <div className="nlt-panel">
              <div className="nlt-panel-head">
                <span className="nlt-panel-title">Connect {providerLabel}</span>
                <span className="nlt-panel-sub">{provider === "webhook" ? "Send signups to any HTTPS endpoint you control." : provider === "google-sheets" ? "Subscribers append to a row in your sheet." : `Find your API key in ${providerLabel} settings.`}</span>
              </div>

              {provider === "google-sheets" ? (
                <>
                  <Field label="Google account">
                    <button type="button" className="nlt-gsheets-signin">
                      <span aria-hidden>🔵</span> Sign in with Google
                    </button>
                    <div className="pe-field-hint">We only request access to the sheet you choose. You can revoke access at any time in your Google account.</div>
                  </Field>
                  <Field label="Sheet"><select className="pe-select" disabled><option>Sign in first to load sheets</option></select></Field>
                  <Field label="Append to tab"><input className="pe-input" type="text" defaultValue="Subscribers" onChange={dirty} /></Field>
                </>
              ) : provider === "webhook" ? (
                <>
                  <Field label="Webhook URL">
                    <input className="pe-input" type="url" placeholder="https://your-server.com/api/newsletter" onChange={dirty} />
                    <div className="pe-field-hint">We POST a JSON payload to this URL on every signup. Must be HTTPS. Should respond within 5 seconds.</div>
                  </Field>
                  <Field label="Or use our endpoint">
                    <div className="endpoint-row">
                      <code>https://tadaify.com/wh/v1/{profile.handle}</code>
                      <button className="ep-copy" type="button" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? "Copied ✓" : "Copy"}</button>
                    </div>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="API key">
                    <div className="nlt-key-row">
                      <input type={showKey ? "text" : "password"} autoComplete="off" spellCheck={false} placeholder={`Paste your ${providerLabel} API key`} defaultValue={provider === "kit" ? fx.kit.apiKey : ""} onChange={dirty} />
                      <button type="button" className="nlt-key-show" aria-label="Show / hide key" onClick={() => setShowKey((v) => !v)}>👁</button>
                    </div>
                    <div className="pe-field-hint">Stored encrypted in tadaify Vault — never shown after save.</div>
                  </Field>
                  <Field label="">
                    <div className="nlt-test-field">
                      <button type="button" className="nlt-test-btn">Test connection</button>
                      {provider === "kit" && <span className="nlt-test-badge is-success">✓ Connected</span>}
                    </div>
                  </Field>
                  <Field label="List / audience">
                    <select className="pe-select" defaultValue={fx.kit.list} onChange={dirty}>
                      <option>Pick a list…</option>
                      <option>Main signup form</option>
                      <option>New drops alerts</option>
                      <option>VIP early access</option>
                    </select>
                    <div className="pe-field-hint">Where new subscribers from this page will land.</div>
                  </Field>
                  <Field label="Source tag">
                    <input className="pe-input" type="text" defaultValue={fx.kit.sourceTag} onChange={dirty} />
                    <div className="pe-field-hint">Identifies subscribers who came in through this subscribe page — handy for segmenting later.</div>
                  </Field>
                </>
              )}
            </div>

            <Field label="Success message" hint="shown after a visitor signs up">
              <div className="pe-prefix-wrap">
                <input type="text" defaultValue="Thanks! Check your inbox to confirm your subscription." onChange={dirty} />
                <button className="pe-suffix-action" type="button">✨ Suggest</button>
              </div>
            </Field>
          </Section>

          {/* ── Signup form ── */}
          <Section title={<><Grip /> 📝 Signup form</>} sub="Layout, copy & consent." headExtra={removeBtn}>
            <Field label="Form layout">
              <div className="layout-picker">
                {LAYOUTS.map((l) => (
                  <button key={l.value} type="button" className={`lp-card${layout === l.value ? " is-selected" : ""}`} onClick={() => { setLayout(l.value); dirty(); }}>
                    <div className="lp-name"><span className="lp-check">✓</span> {l.name}</div>
                    <div className={`lp-preview${l.value === "card" ? " is-card" : l.value === "oneline" ? " is-oneline" : ""}`}>
                      {l.value === "card" && <div className="lp-fake-icon" />}
                      <div className="lp-fake-input" />
                      <div className="lp-fake-btn" style={l.value === "twoline" ? { width: "100%" } : undefined} />
                    </div>
                    <div className="lp-sub">{l.sub}</div>
                  </button>
                ))}
              </div>
            </Field>
            <FieldRow>
              <Field label="Email placeholder"><input className="pe-input" type="text" defaultValue={fx.form.placeholder} onChange={dirty} /></Field>
              <Field label="Button label">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue={fx.form.cta} onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>
            </FieldRow>
            <Field label="GDPR consent checkbox">
              <RowToggle name="Show consent checkbox" sub={'Required for EU visitors. Logs the explicit "I agree" timestamp on every signup.'} on={consent} onChange={(v) => { setConsent(v); dirty(); }} />
              <TierHint>EU visitors must opt-in explicitly under GDPR Art. 7. We default this on so you stay compliant.</TierHint>
            </Field>
            <Field label="Consent copy" hint="shown next to the checkbox">
              <textarea className="pe-area" defaultValue={fx.form.consentCopy} onChange={dirty} />
            </Field>
          </Section>

          {/* ── Social proof ── */}
          <Section title={<><Grip /> ⭐ Social proof</>} sub="Build trust with subscriber count or quotes." headExtra={removeBtn}>
            <Field label="Style">
              <select className="pe-select" value={proofStyle} onChange={(e) => { setProofStyle(e.target.value as typeof proofStyle); dirty(); }}>
                <option value="count">Subscriber count badge — "Join 24,512 creators"</option>
                <option value="quotes">Testimonial quotes — 1-3 cards</option>
                <option value="both">Both — count above quotes</option>
              </select>
            </Field>
            <FieldRow>
              <Field label="Template" hint="{count} = live count from your provider">
                <input className="pe-input" type="text" defaultValue={fx.socialProof.template} onChange={dirty} />
              </Field>
              <Field label="Live count source">
                <RowToggle name="Pull count from Kit" sub={<>Auto-updates daily via API. Currently <b>{fx.socialProof.subscribers}</b> subscribers.</>} on={fx.socialProof.pullCount} onChange={dirty} />
              </Field>
            </FieldRow>
            <Field label={<>Show count to visitors <TierBadge tier="creator" /></>}>
              <RowToggle name="Public subscriber count" sub="Free plan hides the count above 2,500 subscribers. Creator+ plans show your full count to visitors." on={fx.socialProof.showPublic} onChange={dirty} />
            </Field>
            <Field label="Testimonial quotes" hint="2-3 short quotes work best">
              <div className="bullet-list">
                {quotes.map((q) => (
                  <div className="bullet-item" key={q.id}>
                    <span className="bl-grip" aria-hidden>⋮⋮</span>
                    <input className="bl-text" type="text" defaultValue={q.text} onChange={dirty} />
                    <button className="bl-x" type="button" aria-label="Remove quote" onClick={() => { setQuotes((qs) => qs.filter((x) => x.id !== q.id)); dirty(); }}>✕</button>
                  </div>
                ))}
                <button className="add-row-btn" type="button" onClick={dirty}>+ Add quote</button>
              </div>
            </Field>
          </Section>

          {/* ── What you'll get ── */}
          <Section title={<><Grip /> 📬 What you'll get</>} sub="Set expectations on frequency, topics, format." headExtra={removeBtn}>
            <Field label="Section heading"><input className="pe-input" type="text" defaultValue={fx.whatYoullGet.heading} onChange={dirty} /></Field>
            <Field label="Bullets" hint="drag to reorder · click 🎯 to change emoji">
              <div className="bullet-list">
                {bullets.map((b) => (
                  <div className="bullet-item" key={b.id}>
                    <span className="bl-grip" aria-hidden>⋮⋮</span>
                    <button className="bl-emoji" type="button" onClick={dirty}>{b.emoji}</button>
                    <input className="bl-text" type="text" defaultValue={b.text} onChange={dirty} />
                    <button className="bl-x" type="button" aria-label="Remove bullet" onClick={() => { setBullets((bs) => bs.filter((x) => x.id !== b.id)); dirty(); }}>✕</button>
                  </div>
                ))}
                <button className="add-row-btn" type="button" onClick={dirty}>+ Add bullet</button>
              </div>
              <div className="pe-chip-row" style={{ marginTop: 10 }}>
                <span style={{ fontSize: 11.5, color: "var(--fg-muted)", alignSelf: "center" }}>Templates:</span>
                {["Weekly notes", "Monthly digest", "Drop alerts", "Behind-the-scenes"].map((t) => (
                  <button className="chip" type="button" key={t} onClick={dirty}>{t}</button>
                ))}
              </div>
            </Field>
          </Section>

          {/* ── Past issues preview ── */}
          <Section title={<><Grip /> 📰 Past issues preview <TierBadge tier="creator" /></>} sub="Shows 3 most recent posts pulled from your provider." headExtra={removeBtn}>
            <Field label="Show past issues">
              <RowToggle name="Display 3 recent posts" sub={<>Pulled from your <b>Kit</b> archive every hour. Visitors can read a preview before subscribing — boosts conversion ~18%.</>} on={showPast} onChange={(v) => { setShowPast(v); dirty(); }} />
            </Field>
            <Field label="Recent posts (live preview)">
              <div className="past-issues-grid">
                {fx.pastIssues.issues.map((p) => (
                  <div className="past-issue-card" key={p.id}>
                    <div className={`pic-cover${p.tone ? ` t-${p.tone}` : ""}`}>{p.cover}</div>
                    <div className="pic-body">
                      <div className="pic-title">{p.title}</div>
                      <div className="pic-excerpt">{p.excerpt}</div>
                      <div className="pic-meta">{p.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          </Section>

          {/* ── FAQ ── */}
          <Section title={<><Grip /> ❓ FAQ</>} sub="Tackle common objections before they kill the signup." headExtra={removeBtn}>
            {faq.map((q) => (
              <div className="faq-item" key={q.id}>
                <div className="faq-head">
                  <span className="faq-grip" aria-hidden>⋮⋮</span>
                  <input className="faq-q" type="text" defaultValue={q.q} onChange={dirty} />
                  <button className="iconbtn is-danger" type="button" aria-label="Remove" onClick={() => { setFaq((f) => f.filter((x) => x.id !== q.id)); dirty(); }}>
                    <S w={14}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                  </button>
                </div>
                <textarea className="faq-a" defaultValue={q.a} onChange={dirty} />
              </div>
            ))}
            <button className="add-row-btn" type="button" onClick={dirty}>+ Add question</button>
          </Section>

          {/* ── Footer CTA ── */}
          <Section title={<><Grip /> 🚀 Footer CTA</>} sub="Last-chance subscribe + social fallback for hesitant visitors." headExtra={removeBtn}>
            <FieldRow>
              <Field label="Closing headline"><input className="pe-input" type="text" defaultValue={fx.footerCta.headline} onChange={dirty} /></Field>
              <Field label="Button label"><input className="pe-input" type="text" defaultValue={fx.footerCta.button} onChange={dirty} /></Field>
            </FieldRow>
            <Field label="Social fallback copy"><input className="pe-input" type="text" defaultValue={fx.footerCta.fallback} onChange={dirty} /></Field>
            <Field label="Show social-fallback links">
              <RowToggle name="Use my main page socials" sub="Pulls Instagram / TikTok / YouTube from your Home page. Edit them once and they update everywhere." on={fx.footerCta.showSocials} onChange={dirty} />
            </Field>
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
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="nsp-title" onClick={(e) => { if (e.target === e.currentTarget) setSectionPicker(false); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="nsp-title">Add a section</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setSectionPicker(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">Pick the kind of section you want to add. Sections you've already added show an "added" badge — click again to add a second one.</p>
              <div className="types-grid">
                {fx.sectionTypes.map((t) => (
                  <button className="type-tile" type="button" key={t.type} onClick={() => setSectionPicker(false)}>
                    <div className="tt-row">
                      <div className="tt-icon">{t.emoji}</div>
                      <h4 className="tt-name">{t.name}{t.tier && <TierBadge tier={t.tier} />}</h4>
                    </div>
                    <p className="tt-desc">{t.sub}</p>
                    {t.already && <span className="tt-already">Added</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="pe-modal-foot">
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Sections can be reordered, removed, or added more than once.</span>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSectionPicker(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image picker modal ── */}
      {imagePicker && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="nip-title" onClick={(e) => { if (e.target === e.currentTarget) setImagePicker(false); }}>
          <div className="pe-modal is-narrow">
            <div className="pe-modal-head">
              <h3 id="nip-title">Add an image</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setImagePicker(false)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <div className="pe-cover-drop" style={{ height: 160 }}>
                <span className="cd-emoji" aria-hidden>🖼</span>
                <div className="cd-title">Drop an image here, or click to browse</div>
                <div className="cd-sub">JPG, PNG, WebP · max 5MB</div>
              </div>
              <p style={{ margin: "18px 0 8px", fontWeight: 600, fontSize: 13 }}>Or pick from your library:</p>
              <div className="img-library">
                <div className="img-tile" style={{ background: "linear-gradient(135deg,#FDE68A,#F59E0B)" }} />
                <div className="img-tile" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }} />
                <div className="img-tile" style={{ background: "linear-gradient(135deg,#FB7185,#BE185D)" }} />
                <div className="img-tile" style={{ background: "linear-gradient(135deg,#34D399,#047857)" }} />
              </div>
            </div>
            <div className="pe-modal-foot">
              <button className="btn btn-warm btn-sm" type="button">✨ Generate with AI</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setImagePicker(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setImagePicker(false)}>Use selected</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
