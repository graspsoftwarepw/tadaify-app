/**
 * Schedule (booking) page editor — the creator-facing editor a creator opens at
 * Pages > Schedule. Faithful port of
 * mockups/tadaify-mvp/app-page-schedule.html, composed on the shared
 * EditorShell + Section primitives. Pairs with the public visitor view
 * (creator-schedule-public).
 *
 * Presentational, local-state only: collapse cards, toggle publish, pick a
 * page-theme swatch, pick a calendar provider, set buffer / window / timezone,
 * edit the seven-day working-hours grid, browse booking types (filled ↔ empty),
 * open the new/edit booking-type composer modal (duration, pricing, form-field
 * builder, visibility, status), toggle recurring availability rules + one-off
 * blackouts with a month-at-a-glance grid, configure creator + visitor
 * notifications and push-to-tools providers, and payment settings — plus a
 * dirty-on-edit save bar. Day-to-day bookings live in Administration → Schedule
 * (a callout links there); this page is page-level setup only. Premium features
 * (availability rules, payments, push providers, far-out reminders) stay fully
 * visible and interactive — the gate is mocked at Save. Data comes from the
 * typed scheduleEditorFixture.
 *
 * @implements fr-page-editor-schedule
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
import { scheduleEditorFixture, type BookingType, type ScheduleProvider } from "./scheduleEditorFixture";

const SCHEDULE_PAGE_SUBITEM = {
  id: "schedule",
  label: "Schedule",
  href: "/__proto/page-schedule",
  icon: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
};

const Grip = () => (
  <S w={16}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></S>
);
const Kebab = () => (
  <S><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></S>
);

export function ScheduleEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = scheduleEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [live, setLive] = useState(fx.live);
  const [bg, setBg] = useState(fx.selectedBackground);
  const [provider, setProvider] = useState<ScheduleProvider>(fx.selectedProvider);
  const [hours, setHours] = useState(fx.hours);
  const [rules, setRules] = useState(fx.recurringRules);
  const [tools, setTools] = useState(fx.pushTools);
  const [free, setFree] = useState(false);
  const [typeModal, setTypeModal] = useState<null | "new" | "edit">(null);

  useEscapeKey(() => { setTypeModal(null); });

  const dirty = () => setSaveState("dirty");
  const toggleDay = (day: string) => { setHours((hs) => hs.map((r) => (r.day === day ? { ...r, on: !r.on } : r))); dirty(); };
  const toggleRule = (id: string) => { setRules((rs) => rs.map((r) => (r.id === id ? { ...r, on: !r.on } : r))); dirty(); };
  const toggleTool = (id: string) => { setTools((ts) => ts.map((t) => (t.id === id ? { ...t, on: !t.on } : t))); dirty(); };

  const typeMeta = (t: BookingType) => (
    <div className="tr-line">
      {t.meta.map((m, i) => (
        <span key={i} className="pr-tag-wrap">{i > 0 && <span className="dot" />}<span>{m}</span></span>
      ))}
      {t.locked && <><span className="dot" /><span className="tr-locked">{t.locked}</span></>}
      {t.tag && <><span className="dot" /><span className="pr-tag">{t.tag}</span></>}
    </div>
  );

  return (
    <EditorShell
      profile={profile}
      emoji="📅"
      title="Schedule"
      description="Let visitors book your time. Pick session types, set when you're free, and tadaify handles the rest — calendar invites, reminders, payments."
      slug={fx.slug}
      live={live}
      pageId="schedule"
      pageSubItems={[SCHEDULE_PAGE_SUBITEM]}
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
      {/* ── Admin callout ── */}
      <section className="pe-admin-callout">
        <div className="ac-emoji" aria-hidden>📅</div>
        <div className="ac-copy">
          <div className="ac-title">Manage bookings in Administration → Schedule</div>
          <div className="ac-sub">Today's sessions, upcoming list, calendar view, and per-booking actions (Confirm / Reschedule / Cancel) live in the Administration tab. This page is for page-level setup — booking types, calendar integration, availability rules, notifications, payments.</div>
        </div>
        <button className="btn btn-primary btn-sm" type="button">Open Schedule admin →</button>
      </section>

      {/* ── Page settings ── */}
      <Section title="Page settings" sub="Title, URL, visibility and SEO for the booking page itself.">
        <FieldRow>
          <Field label="Page title" hint="shown as the <h1> on the public page">
            <div className="pe-prefix-wrap">
              <input type="text" defaultValue={fx.pageTitle} onChange={dirty} />
              <button className="pe-suffix-action" type="button">✨ Suggest</button>
            </div>
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
            <RowToggle name="Page is live" sub="Visitors can find this booking page at the URL above." on={live} onChange={(v) => { setLive(v); dirty(); }} />
          </Field>
          <Field label="Theme color">
            <div className="pe-swatch-row">
              {fx.backgrounds.map((sw, i) => (
                <button key={sw.name} type="button" className={`pe-swatch${i === bg ? " is-selected" : ""}`} style={{ background: sw.css }} title={sw.name} aria-label={sw.name} onClick={() => { setBg(i); dirty(); }} />
              ))}
            </div>
          </Field>
        </FieldRow>

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

      {/* ── Calendar integration ── */}
      <Section title="Calendar integration" sub="tadaify is the front-end. Your calendar lives in Google / Apple / Outlook — or right here in tadaify.">
        <Field label="Where do your appointments live?">
          <div className="provider-grid">
            {fx.providers.map((p) => (
              <button key={p.id} type="button" className={`provider-card${provider === p.id ? " is-selected" : ""}`} onClick={() => { setProvider(p.id); dirty(); }}>
                <span className={`pc-mark ${p.markClass}`} aria-hidden>{p.mark}</span>
                <span className="pc-meta">
                  <span className="pc-name">{p.name} {p.pill && <span className={`pill-soft pill-${p.pillClass}`}>{p.pill}</span>}</span>
                  <span className="pc-sub">{p.sub}</span>
                </span>
                <span className="pc-radio" aria-hidden />
              </button>
            ))}
          </div>
          <div className="pe-info-note">
            <span className="in-icon" aria-hidden>ℹ️</span>
            <div><b>MVP scope:</b> the standalone scheduler ships first. Calendar OAuth providers are designed here so you can see the long-term picture; they activate when the integration epic lands. Today, Manual / Tadaify-only handles bookings end-to-end.</div>
          </div>
        </Field>

        <div className="pe-field-row three">
          <Field label="Buffer between bookings">
            <select className="pe-select" defaultValue={fx.buffer} onChange={dirty}>
              <option>0 min — back-to-back</option>
              <option>15 min</option>
              <option>30 min</option>
              <option>60 min</option>
            </select>
          </Field>
          <Field label="Booking window">
            <select className="pe-select" defaultValue={fx.window} onChange={dirty}>
              <option>7 days ahead</option>
              <option>30 days ahead</option>
              <option>60 days ahead</option>
              <option>90 days ahead</option>
            </select>
          </Field>
          <Field label="Your timezone" hint="auto-detected">
            <select className="pe-select" defaultValue={fx.timezone} onChange={dirty}>
              <option>{fx.timezone}</option>
              <option>Europe/London</option>
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>Asia/Singapore</option>
            </select>
          </Field>
        </div>

        <Field label="Working hours" hint="when bookings are allowed by default">
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
                      <input className="hr-time" type="time" defaultValue={r.from} onChange={dirty} />
                      <span className="hr-sep">→</span>
                      <input className="hr-time" type="time" defaultValue={r.to} onChange={dirty} />
                    </>
                  ) : (
                    <span className="hr-closed">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── Booking types ── */}
      <Section
        title="Booking types"
        sub="What can visitors book? Each type has its own duration, price and form."
        headExtra={
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setTypeModal("new")}>
            <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
            New booking type
          </button>
        }
      >
        {empty ? (
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>📅</div>
            <h3>Create your first booking type</h3>
            <p>A booking type is what visitors pick first — like "30-min intro call" or "60-min coaching". You can change it anytime. Start from a template or build from scratch.</p>
            <div className="es-actions">
              <button className="btn btn-primary" type="button" onClick={() => setTypeModal("new")}>
                <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Build from scratch
              </button>
            </div>
            <div className="templates-row" aria-label="Starter templates">
              <button className="templ-tile" type="button" onClick={() => setTypeModal("new")}><span className="tt-emoji">☕</span><span className="tt-name">Free intro call</span><span className="tt-sub">30 min · free</span></button>
              <button className="templ-tile" type="button" onClick={() => setTypeModal("new")}><span className="tt-emoji">💪</span><span className="tt-name">Paid 1-on-1 coaching</span><span className="tt-sub">60 min · $80</span></button>
              <button className="templ-tile" type="button" onClick={() => setTypeModal("new")}><span className="tt-emoji">📋</span><span className="tt-name">Project consultation</span><span className="tt-sub">45 min · $45</span></button>
              <button className="templ-tile" type="button" onClick={() => setTypeModal("new")}><span className="tt-emoji">👯</span><span className="tt-name">Group workshop</span><span className="tt-sub">90 min · multi</span></button>
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
                <button className="pe-tab" role="tab">Active <span className="tab-count">{fx.counts.active}</span></button>
                <button className="pe-tab" role="tab">Paused <span className="tab-count">{fx.counts.paused}</span></button>
              </div>
              <div className="pe-plan-note">
                Free plan: <b>{fx.freePlan.used} of {fx.freePlan.cap}</b> active types used · <button className="pe-ai-link" type="button">Upgrade for unlimited →</button>
              </div>
            </div>

            <div className="pe-rows">
              {fx.bookingTypes.map((t) => (
                <div className={`pe-row${t.status === "paused" ? " is-off" : ""}`} key={t.id}>
                  <div className="pr-grip-col">
                    <span className="pr-handle" aria-label="Drag to reorder"><Grip /></span>
                    <div className={`pr-thumb t-${t.tint}`} aria-hidden>{t.emoji}</div>
                  </div>
                  <div className="pr-meta">
                    <p className="pr-title">
                      {t.title}{" "}
                      <span className={`chip ${t.status === "active" ? "live" : "draft"}`}>{t.status === "active" ? "Active" : "Paused"}</span>
                      {t.price && <span className="chip paid">{t.price}</span>}
                    </p>
                    {typeMeta(t)}
                  </div>
                  <div className="pr-actions">
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setTypeModal("edit")}>Edit</button>
                    <button className="iconbtn" type="button" aria-label="Booking type options"><Kebab /></button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
            </div>
          </>
        )}
      </Section>

      {/* ── Availability rules ── */}
      <Section
        title="Availability rules"
        sub="Refine the working-hours grid with recurring exceptions and one-off blackouts."
        headExtra={<span className="chip success">✨ Creator+</span>}
      >
        <Field label="Recurring rules">
          <div className="pe-rule-stack">
            {rules.map((r) => (
              <RowToggle key={r.id} name={r.name} sub={r.sub} on={r.on} onChange={() => toggleRule(r.id)} />
            ))}
            <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: "flex-start" }} onClick={dirty}>
              <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add recurring rule
            </button>
          </div>
        </Field>

        <Field label="One-off blackouts" hint="vacations, holidays, unavailable days">
          <div className="pe-rule-stack">
            {fx.blackouts.map((b) => (
              <div className="pe-row-toggle" key={b.id}>
                <div>
                  <div className="rt-name">{b.name}</div>
                  <div className="rt-sub">{b.sub}</div>
                </div>
                <button className="iconbtn" type="button" aria-label="Remove blackout">
                  <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: "flex-start" }} onClick={dirty}>
              <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add blackout
            </button>
          </div>
        </Field>

        <Field label={fx.monthLabel}>
          <div className="pe-month-grid">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <div key={d} className="mg-cell mg-head">{d}</div>)}
            {fx.monthCells.map((c, i) => (
              <div key={i} className={`mg-cell${c.state ? ` is-${c.state}` : ""}${c.today ? " is-today" : ""}`}>{c.day}</div>
            ))}
          </div>
          <div className="pe-legend-row">
            <span><span className="lg-dot is-free" /> Free</span>
            <span><span className="lg-dot is-busy" /> Has bookings</span>
            <span><span className="lg-dot is-block" /> Blocked</span>
            <span className="lg-note">Empty cells = outside working hours.</span>
          </div>
        </Field>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notifications" sub="When a booking happens — what gets sent and to whom.">
        <h3 className="pe-subhead">For you (the creator)</h3>
        <RowToggle name="Email me when someone books" sub={<>Sent to <b>{fx.payments.payoutEmail}</b>. Includes ICS attachment.</>} on onChange={dirty} />
        <RowToggle name={<>Day-before reminder <span className="chip success">✨ Creator+</span></>} sub="Email summary of all bookings tomorrow, sent at 18:00 your timezone." on onChange={dirty} />

        <Field label="Push to your tools" hint="click a provider to enable">
          <div className="pe-chip-toggle-row">
            {tools.map((t) => (
              <button key={t.id} type="button" className={`pe-prov-chip${t.on ? " is-on" : ""}`} onClick={() => toggleTool(t.id)}>
                <span className="pc-ico" aria-hidden>{t.icon}</span> {t.name}
              </button>
            ))}
          </div>
          <TierHint pro>Direct webhook providers (Slack, Discord, Notion, custom URL) are part of <b>Pro</b>. We'll prompt to upgrade at save time if any are enabled.</TierHint>
        </Field>

        <hr className="pe-divider" />

        <h3 className="pe-subhead">For the visitor</h3>
        <RowToggle name="Booking confirmation" sub="Sent immediately after booking. Includes ICS attachment + cancellation link." on onChange={dirty} />

        <details className="pe-expander">
          <summary>
            Customize confirmation email subject + body
            <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 15 12 9 18 15" /></svg>
          </summary>
          <div className="ex-body">
            <Field label="Subject">
              <div className="pe-prefix-wrap">
                <input type="text" defaultValue="You're booked! — {{booking_type}} with Alexandra on {{date}}" onChange={dirty} />
                <button className="pe-suffix-action" type="button">✨ Suggest</button>
              </div>
            </Field>
            <Field label="Body" hint="supports {{name}}, {{date}}, {{time}}, {{cancel_link}}">
              <textarea className="pe-area" defaultValue={"Hi {{name}},\n\nThanks for booking — see you {{date}} at {{time}}. The calendar invite is attached.\n\nIf anything changes, you can {{cancel_link}}. No charge if you cancel more than 24h before.\n\n— Alexandra"} onChange={dirty} />
            </Field>
          </div>
        </details>

        <RowToggle name={<>24-hour reminder <span className="chip success">✨ Creator+</span></>} sub='Polite "see you tomorrow" email.' on onChange={dirty} />
        <RowToggle name={<>1-hour reminder <span className="chip pro">✨ Pro+</span></>} sub="Last-minute heads-up so visitors don't no-show." on={false} onChange={dirty} />
      </Section>

      {/* ── Payments ── */}
      <Section
        title="Payments"
        sub="Settings for paid booking types. You connect Stripe once; payouts come straight to you."
        headExtra={<span className="chip success">✨ Creator+</span>}
      >
        <div className="pe-stripe-panel">
          <div className="sp-mark" aria-hidden>S</div>
          <div className="sp-meta">
            <div className="sp-row1">Stripe connected <span className="chip connected">✓ Active</span></div>
            <div className="sp-row2">Payouts to <b>{fx.payments.payoutEmail}</b> · {fx.payments.currency} · Daily payouts enabled.</div>
          </div>
          <button className="btn btn-ghost btn-xs" type="button">Open dashboard</button>
          <button className="btn btn-danger-ghost btn-xs" type="button">Disconnect</button>
        </div>

        <FieldRow>
          <Field label="Default currency">
            <select className="pe-select" defaultValue="USD — $" onChange={dirty}>
              <option>USD — $</option>
              <option>EUR — €</option>
              <option>GBP — £</option>
              <option>PLN — zł</option>
              <option>JPY — ¥</option>
            </select>
          </Field>
          <Field label="Default cancellation refund">
            <select className="pe-select" defaultValue="Free cancel up to 24h before" onChange={dirty}>
              <option>No refund — final sale</option>
              <option>Free cancel up to 24h before</option>
              <option>Free cancel up to 48h before</option>
              <option>Free cancel up to 7 days before</option>
              <option>Always full refund</option>
            </select>
          </Field>
        </FieldRow>

        <RowToggle name="Require deposit at booking" sub="Visitors pay a percentage upfront, the rest on the day. Reduces no-shows." on={false} onChange={dirty} />
      </Section>

      {/* ── New / Edit booking-type modal ── */}
      {typeModal && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="stm-title" onClick={(e) => { if (e.target === e.currentTarget) setTypeModal(null); }}>
          <div className="pe-modal">
            <div className="pe-modal-head">
              <h3 id="stm-title">{typeModal === "new" ? "New booking type" : "Edit booking type"}</h3>
              <span className="head-spacer" />
              <span className="chip draft">Draft · auto-saving</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setTypeModal(null)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <Field label="Title" hint="what visitors see in the picker">
                <div className="pe-prefix-wrap">
                  <input type="text" defaultValue="60-min coaching session" onChange={dirty} />
                  <button className="pe-suffix-action" type="button">✨ Suggest</button>
                </div>
              </Field>

              <Field label="Cover image" hint="optional · 1200×600 recommended">
                <div className="pe-cover-drop">
                  <span className="cd-emoji" aria-hidden>🖼</span>
                  <div className="cd-title">Drop an image, or click to upload</div>
                  <div className="cd-sub">Or <button className="pe-ai-link" type="button">✨ generate one with AI</button></div>
                </div>
              </Field>

              <FieldRow>
                <Field label="Duration">
                  <select className="pe-select" defaultValue="60 min" onChange={dirty}>
                    <option>15 min</option><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option><option>120 min</option><option>Custom…</option>
                  </select>
                </Field>
                <Field label="Pricing">
                  <RowToggle name="Free" sub="No payment needed · visitor just confirms." on={free} onChange={(v) => { setFree(v); dirty(); }} />
                </Field>
              </FieldRow>

              {!free && (
                <>
                  <FieldRow>
                    <Field label="Price">
                      <div className="pe-prefix-wrap">
                        <span className="pe-prefix">$</span>
                        <input type="number" defaultValue={80} min={0} step={1} onChange={dirty} />
                      </div>
                    </Field>
                    <Field label="Cancellation policy" hint="overrides default">
                      <select className="pe-select" defaultValue="Free cancel up to 24h before" onChange={dirty}>
                        <option>Inherit default — Free cancel up to 24h</option>
                        <option>Free cancel up to 24h before</option>
                        <option>Free cancel up to 48h before</option>
                        <option>No refund — final sale</option>
                      </select>
                    </Field>
                  </FieldRow>
                  <TierHint>Paid bookings need <b>Creator+</b> + connected Stripe. We'll prompt at save time if you don't have either.</TierHint>
                </>
              )}

              <FieldRow>
                <Field label="Buffer override" hint="overrides page-level buffer">
                  <select className="pe-select" defaultValue="Inherit — 15 min" onChange={dirty}>
                    <option>Inherit — 15 min</option><option>0 min — back-to-back</option><option>15 min</option><option>30 min</option><option>60 min</option>
                  </select>
                </Field>
                <Field label="Visibility">
                  <select className="pe-select" defaultValue="Public — listed on /book" onChange={dirty}>
                    <option>Public — listed on /book</option>
                    <option>Hidden — direct link only (/book/intro)</option>
                  </select>
                </Field>
              </FieldRow>

              <Field label="Booking form fields" hint="what visitors fill in at step 3">
                <div className="pe-field-builder">
                  {fx.formFields.map((f) => (
                    <div className="fb-row" key={f.id}>
                      <span className="fb-grip" aria-hidden><Grip /></span>
                      <span className="fb-name">{f.name}</span>
                      <span className="fb-type">{f.type}</span>
                      <span className={`fb-required${f.required ? " is-on" : " is-off"}${f.locked ? " locked" : ""}`}>{f.required ? "Required" : "Optional"}</span>
                      {f.locked ? (
                        <button className="iconbtn" type="button" disabled aria-label="Built-in"><S><polyline points="20 6 9 17 4 12" /></S></button>
                      ) : (
                        <button className="iconbtn" type="button" aria-label="Remove field"><S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S></button>
                      )}
                    </div>
                  ))}
                  <div className="fb-add-row">
                    <select className="pe-select" aria-label="Add field type" onChange={dirty}>
                      <option>Add a question…</option>
                      <option>Short text</option><option>Long text</option><option>Number</option><option>Email</option><option>Phone</option><option>URL</option><option>Single choice (radio)</option><option>Multi choice (checkbox)</option><option>Date</option><option>File upload</option>
                    </select>
                    <button className="btn btn-ghost btn-sm" type="button">
                      <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                      Add
                    </button>
                  </div>
                </div>
              </Field>

              <Field label="Description" hint="shown on the booking page when visitor selects this type">
                <textarea className="pe-area" defaultValue="A focused 60-minute session. Bring your current programme; we'll review form, fix sticking points, and plan the next 4 weeks. Held over Google Meet — link arrives with the calendar invite." onChange={dirty} />
              </Field>

              <Field label="Post-booking thank-you" hint="shown on the success screen + included in the email">
                <textarea className="pe-area" defaultValue="You're booked! 🎉 I'll send a quick prep email the day before with what to bring + the meeting link. Reply to this email any time." onChange={dirty} />
              </Field>

              <Field label="Status">
                <RowToggle name="Active — accepting bookings" sub="When off, this type stays in your list but visitors can't book it." on onChange={dirty} />
              </Field>
            </div>
            <div className="pe-modal-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTypeModal(null)}>Cancel</button>
              <button className="btn btn-danger-ghost btn-sm" type="button">Delete type</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTypeModal(null)}>Save as draft</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setTypeModal(null)}>Save &amp; activate →</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
