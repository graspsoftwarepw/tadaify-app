/**
 * AppPageSchedule — Pages → Schedule / Booking page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-schedule.html (2050 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   0. Administration banner — "Manage bookings in Administration → Schedule"
 *      redirect card.
 *   1. Page settings — inline title with ✨ Suggest, URL slug (default "book"),
 *      publish toggle, theme color swatches, SEO expander (meta title, desc).
 *   2. Calendar integration — 4 provider cards (Google post-MVP, Apple post-MVP,
 *      Outlook post-MVP, Manual/Tadaify-only recommended + selected), info note,
 *      OAuth status panel (hidden when Manual selected), buffer / booking window
 *      / timezone selects, working hours grid (Mon–Sun, on/off toggles + times).
 *   3. Booking types — tabs (All/Active/Paused), 4 type rows (intro free,
 *      60-min paid, programme check-in, group workshop paused), empty state
 *      with 4 starter cards.
 *   4. Availability rules — recurring rules toggles, one-off blackouts,
 *      May 2026 month-grid mini-calendar.
 *   5. Notifications — creator section (email, day-before reminder, push
 *      provider chips), visitor section (confirmation + customization expander,
 *      24h reminder, 1h reminder Pro+).
 *   6. Payments — Stripe Connect panel, currency + cancellation policy selects,
 *      deposit toggle.
 *   Centered modal: booking-type composer (title, cover image, duration,
 *      pricing, buffer/visibility, form field builder, description,
 *      confirmation message, active status toggle).
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageScheduleProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CalProvider = "google" | "apple" | "outlook" | "manual";

interface BookingType {
  id: string;
  thumbTheme: string;
  thumbEmoji: string;
  title: string;
  chips: Array<{ cls: string; label: string }>;
  meta: string[];
  tags: string[];
  isOff: boolean;
}

interface HoursDay {
  day: string;
  active: boolean;
  start: string;
  end: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const THEME_SWATCHES = [
  { style: "var(--bg)",                                           label: "Inherit theme" },
  { style: "#FFFFFF",                                             label: "White" },
  { style: "#F8F4EE",                                             label: "Warm cream" },
  { style: "#1F2937",                                             label: "Slate" },
  { style: "linear-gradient(135deg,#FDE68A,#F59E0B)",             label: "Sunrise" },
  { style: "linear-gradient(135deg,#6366F1,#8B5CF6)",             label: "Indigo" },
];

const BOOKING_TYPES: BookingType[] = [
  {
    id: "b1", thumbTheme: "t-emerald", thumbEmoji: "☕",
    title: "30-min intro call",
    chips: [{ cls: "live", label: "Active" }],
    meta: ["30 min", "Free", "Most-booked"],
    tags: ["video call"],
    isOff: false,
  },
  {
    id: "b2", thumbTheme: "t-warm", thumbEmoji: "💪",
    title: "60-min coaching session",
    chips: [{ cls: "live", label: "Active" }, { cls: "paid", label: "$80" }],
    meta: ["60 min", "Paid via Stripe", "Free cancel up to 24h"],
    tags: ["video call"],
    isOff: false,
  },
  {
    id: "b3", thumbTheme: "t-indigo", thumbEmoji: "📋",
    title: "Programme check-in (existing clients)",
    chips: [{ cls: "live", label: "Active" }, { cls: "paid", label: "$45" }],
    meta: ["45 min", "Paid via Stripe", "Hidden — direct link only"],
    tags: ["video call"],
    isOff: false,
  },
  {
    id: "b4", thumbTheme: "t-rose", thumbEmoji: "👯",
    title: "Group strength workshop (max 8)",
    chips: [{ cls: "draft", label: "Paused" }, { cls: "paid", label: "$25/seat" }],
    meta: ["90 min · 8 attendees"],
    tags: [],
    isOff: true,
  },
];

const HOURS_DAYS: HoursDay[] = [
  { day: "Monday",    active: true,  start: "09:00", end: "17:00" },
  { day: "Tuesday",   active: true,  start: "09:00", end: "17:00" },
  { day: "Wednesday", active: true,  start: "09:00", end: "17:00" },
  { day: "Thursday",  active: true,  start: "09:00", end: "17:00" },
  { day: "Friday",    active: true,  start: "09:00", end: "15:00" },
  { day: "Saturday",  active: false, start: "10:00", end: "14:00" },
  { day: "Sunday",    active: false, start: "10:00", end: "14:00" },
];

const MONTH_CELLS = [
  // Headers
  { label: "Mo", cls: "hdr" }, { label: "Tu", cls: "hdr" }, { label: "We", cls: "hdr" },
  { label: "Th", cls: "hdr" }, { label: "Fr", cls: "hdr" }, { label: "Sa", cls: "hdr" },
  { label: "Su", cls: "hdr" },
  // Week 1 (Apr 27 - May 3)
  { label: "27", cls: "dim" }, { label: "28", cls: "dim" }, { label: "29", cls: "dim" },
  { label: "30", cls: "dim" }, { label: "1",  cls: "is-block" }, { label: "2", cls: "is-empty" }, { label: "3", cls: "is-empty" },
  // Week 2
  { label: "4", cls: "is-busy" }, { label: "5", cls: "is-busy" }, { label: "6", cls: "" },
  { label: "7", cls: "is-busy" }, { label: "8", cls: "" }, { label: "9", cls: "is-empty" }, { label: "10", cls: "is-empty" },
  // Week 3 (vacation)
  { label: "11", cls: "is-block" }, { label: "12", cls: "is-block" }, { label: "13", cls: "is-block" },
  { label: "14", cls: "is-block" }, { label: "15", cls: "is-block" }, { label: "16", cls: "is-block" }, { label: "17", cls: "is-block" },
  // Week 4
  { label: "18", cls: "is-block" }, { label: "19", cls: "is-busy is-today" }, { label: "20", cls: "" },
  { label: "21", cls: "" }, { label: "22", cls: "" }, { label: "23", cls: "is-empty" }, { label: "24", cls: "is-empty" },
  // Week 5
  { label: "25", cls: "" }, { label: "26", cls: "" }, { label: "27", cls: "" },
  { label: "28", cls: "" }, { label: "29", cls: "" }, { label: "30", cls: "is-empty" }, { label: "31", cls: "is-empty" },
];

const STARTER_TYPES = [
  { emoji: "☕", name: "Free intro call",         sub: "30 min · free · perfect first touchpoint with new clients." },
  { emoji: "💪", name: "Paid 1-on-1 coaching",    sub: "60 min · $80 · prefilled with cancellation policy." },
  { emoji: "📋", name: "Project consultation",    sub: "45 min · $45 · adds Topic + Budget questions." },
  { emoji: "👯", name: "Group workshop",          sub: "90 min · multi-attendee · prompts upgrade to Business." },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-schedule-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-schedule-row-toggle">
      <div>
        <div className="app-page-schedule-rt-name">{name}</div>
        <div className="app-page-schedule-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children, isPro = false }: { children: ReactNode; isPro?: boolean }): ReactElement {
  return (
    <div className={`app-page-schedule-tier-hint${isPro ? " is-pro" : ""}`}>
      <span className="app-page-schedule-th-icon" aria-hidden="true">💡</span>
      <span>{children}</span>
    </div>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-schedule-swatch-row">
      {THEME_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-schedule-swatch${sel === i ? " is-selected" : ""}`}
          style={{ background: s.style }}
          role="button"
          tabIndex={0}
          title={s.label}
          aria-label={s.label}
          onClick={() => setSel(i)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(i); }}
        />
      ))}
    </div>
  );
}

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
      <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

// ─── Hours Row ─────────────────────────────────────────────────────────────────

function HoursRow({ entry }: { entry: HoursDay }): ReactElement {
  const [active, setActive] = useState(entry.active);
  return (
    <div className={`app-page-schedule-hours-row${!active ? " is-off" : ""}`}>
      <div className="app-page-schedule-hr-day">{entry.day}</div>
      <button
        className={`app-page-schedule-toggle${active ? " is-on" : ""}`}
        type="button"
        aria-pressed={active}
        aria-label={`Toggle ${entry.day}`}
        onClick={() => setActive((v) => !v)}
      />
      <input type="time" defaultValue={entry.start} disabled={!active} />
      <input type="time" defaultValue={entry.end}   disabled={!active} />
    </div>
  );
}

// ─── Booking type row ──────────────────────────────────────────────────────────

function BookingTypeRow({ bt, onEdit }: { bt: BookingType; onEdit: () => void }): ReactElement {
  const [popOpen, setPopOpen] = useState(false);
  return (
    <div className={`app-page-schedule-type-row${bt.isOff ? " is-off" : ""}`}>
      <div className="app-page-schedule-tr-grip-col">
        <span className="app-page-schedule-tr-handle" aria-label="Drag to reorder"><GripSvg /></span>
        <div className={`app-page-schedule-tr-thumb ${bt.thumbTheme}`} aria-hidden="true">{bt.thumbEmoji}</div>
      </div>
      <div className="app-page-schedule-tr-meta">
        <p className="app-page-schedule-tr-title">
          {bt.title}
          {bt.chips.map((c) => (
            <span key={c.label} className={`app-page-schedule-chip ${c.cls}`}>{c.label}</span>
          ))}
          {bt.isOff && (
            <span style={{ color: "#92400E", fontWeight: 600 }}>🔒 Group bookings — Business plan</span>
          )}
        </p>
        <div className="app-page-schedule-tr-line">
          {bt.meta.map((m, i) => (
            <span key={i}>
              {i > 0 && <span className="app-page-schedule-tr-dot" />}
              {m}
            </span>
          ))}
          {bt.tags.length > 0 && <span className="app-page-schedule-tr-dot" />}
          {bt.tags.map((t) => <span key={t} className="app-page-schedule-tr-tag">{t}</span>)}
        </div>
      </div>
      <div className="app-page-schedule-tr-actions">
        {/* TODO: wire to admin pages API */}
        <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-xs" type="button" onClick={onEdit}>Edit</button>
        <button className="app-page-schedule-iconbtn" type="button" aria-label="Booking type options" onClick={() => setPopOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {popOpen && (
          <div className="app-page-schedule-kebab-pop is-open">
            <button type="button" onClick={() => { setPopOpen(false); onEdit(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              Edit
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              Duplicate
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Copy direct link
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View public
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Pause
            </button>
            <hr />
            <button className="danger" type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Booking type composer modal ──────────────────────────────────────────────

function TypeModal({ onClose }: { onClose: () => void }): ReactElement {
  const [isFree, setIsFree] = useState(false);
  return (
    <div
      className="app-page-schedule-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-schedule-modal">
        <div className="app-page-schedule-modal-head">
          <h3 id="tm-title">New booking type</h3>
          <span className="app-page-schedule-head-spacer" />
          <span className="app-page-schedule-chip draft">Draft · auto-saving</span>
          <button className="app-page-schedule-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-schedule-modal-body">

          {/* Title */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label" htmlFor="tm-title-input">
              Title{" "}
              <span className="app-page-schedule-field-hint">what visitors see in the picker</span>
            </label>
            <div className="app-page-schedule-field-prefix-wrap">
              <input id="tm-title-input" type="text" defaultValue="60-min coaching session" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-schedule-field-suffix-action" type="button">✨ Suggest</button>
            </div>
          </div>

          {/* Cover image */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label">
              Cover image{" "}
              <span className="app-page-schedule-field-hint">optional · 1200×600 recommended</span>
            </label>
            <div className="app-page-schedule-cover-drop">
              <div style={{ fontSize: 28 }} aria-hidden="true">🖼</div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 4 }}>Drop an image, or click to upload</div>
              <div style={{ color: "var(--fg-muted)", fontSize: 12.5, marginTop: 2 }}>
                Or{" "}
                {/* TODO: wire to admin pages API */}
                <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate one with AI</span>
              </div>
            </div>
          </div>

          {/* Duration + pricing */}
          <div className="app-page-schedule-field-row">
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="tm-duration">Duration</label>
              <select className="app-page-schedule-field-select" id="tm-duration" defaultValue="60">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
                <option value="custom">Custom…</option>
              </select>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label">Pricing</label>
              <div className="app-page-schedule-row-toggle">
                <div>
                  <div className="app-page-schedule-rt-name">Free</div>
                  <div className="app-page-schedule-rt-sub">No payment needed · visitor just confirms.</div>
                </div>
                <button
                  className={`app-page-schedule-toggle${isFree ? " is-on" : ""}`}
                  type="button"
                  aria-pressed={isFree}
                  aria-label="Toggle free"
                  onClick={() => setIsFree((v) => !v)}
                />
              </div>
            </div>
          </div>

          {/* Paid fields */}
          <div style={{ opacity: isFree ? 0.45 : 1, pointerEvents: isFree ? "none" : "auto" }}>
            <div className="app-page-schedule-field-row">
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="tm-price">Price</label>
                <div className="app-page-schedule-field-prefix-wrap">
                  <span className="app-page-schedule-field-prefix">$</span>
                  <input id="tm-price" type="number" defaultValue={80} min={0} step={1} />
                </div>
              </div>
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="tm-cancel">
                  Cancellation policy{" "}
                  <span className="app-page-schedule-field-hint">overrides default</span>
                </label>
                <select className="app-page-schedule-field-select" id="tm-cancel" defaultValue="24h">
                  <option value="inherit">Inherit default — Free cancel up to 24h</option>
                  <option value="24h">Free cancel up to 24h before</option>
                  <option value="48h">Free cancel up to 48h before</option>
                  <option value="none">No refund — final sale</option>
                </select>
              </div>
            </div>
            <TierHint>
              Paid bookings need <b>Creator+</b> + connected Stripe. We&apos;ll prompt at save time if you don&apos;t have either.
            </TierHint>
          </div>

          {/* Buffer + visibility */}
          <div className="app-page-schedule-field-row" style={{ marginTop: 6 }}>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="tm-buffer">
                Buffer override{" "}
                <span className="app-page-schedule-field-hint">overrides page-level buffer</span>
              </label>
              <select className="app-page-schedule-field-select" id="tm-buffer" defaultValue="inherit">
                <option value="inherit">Inherit — 15 min</option>
                <option value="0">0 min — back-to-back</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="tm-visibility">Visibility</label>
              <select className="app-page-schedule-field-select" id="tm-visibility" defaultValue="public">
                <option value="public">Public — listed on /book</option>
                <option value="hidden">Hidden — direct link only (/book/intro)</option>
              </select>
            </div>
          </div>

          {/* Form field builder */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label">
              Booking form fields{" "}
              <span className="app-page-schedule-field-hint">what visitors fill in at step 3</span>
            </label>
            <div className="app-page-schedule-field-builder">
              {[
                { name: "Name",     type: "text",      required: true, locked: true },
                { name: "Email",    type: "email",     required: true, locked: true },
                { name: "Topic — what would you like to focus on?", type: "long text", required: true,  locked: false },
                { name: "Phone (optional)", type: "phone",  required: false, locked: false },
              ].map((f) => (
                <div key={f.name} className="app-page-schedule-fb-row">
                  <span className="app-page-schedule-fb-grip" aria-hidden="true"><GripSvg /></span>
                  <span className="app-page-schedule-fb-name">{f.name}</span>
                  <span className="app-page-schedule-fb-type">{f.type}</span>
                  <span className={`app-page-schedule-fb-required${f.required ? " is-on" : " is-off"}${f.locked ? " locked" : ""}`}>
                    {f.required ? "Required" : "Optional"}
                  </span>
                  {f.locked ? (
                    <button className="app-page-schedule-iconbtn" type="button" disabled aria-label="Built-in">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  ) : (
                    /* TODO: wire to admin pages API */
                    <button className="app-page-schedule-iconbtn" type="button" aria-label="Remove field">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <div className="app-page-schedule-fb-add-row">
                <select aria-label="Add field type" defaultValue="">
                  <option value="">Add a question…</option>
                  <option>Short text</option>
                  <option>Long text</option>
                  <option>Number</option>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>URL</option>
                  <option>Single choice (radio)</option>
                  <option>Multi choice (checkbox)</option>
                  <option>Date</option>
                  <option>File upload</option>
                </select>
                {/* TODO: wire to admin pages API */}
                <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label" htmlFor="tm-desc">
              Description{" "}
              <span className="app-page-schedule-field-hint">shown on the booking page when visitor selects this type</span>
            </label>
            <textarea
              id="tm-desc"
              className="app-page-schedule-field-area"
              defaultValue="A focused 60-minute session. Bring your current programme; we'll review form, fix sticking points, and plan the next 4 weeks. Held over Google Meet — link arrives with the calendar invite."
            />
          </div>

          {/* Post-booking confirmation */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label" htmlFor="tm-confirm">
              Post-booking thank-you{" "}
              <span className="app-page-schedule-field-hint">shown on the success screen + included in the email</span>
            </label>
            <textarea
              id="tm-confirm"
              className="app-page-schedule-field-area"
              style={{ minHeight: 70 }}
              defaultValue={"You're booked! 🎉 I'll send a quick prep email the day before with what to bring + the meeting link. Reply to this email any time."}
            />
          </div>

          {/* Active status */}
          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label">Status</label>
            <ToggleRow name="Active — accepting bookings" sub="When off, this type stays in your list but visitors can't book it." defaultOn />
          </div>

        </div>
        <div className="app-page-schedule-modal-foot">
          {/* TODO: wire to admin pages API */}
          <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button className="app-page-schedule-btn app-page-schedule-btn-danger-ghost app-page-schedule-btn-sm" type="button">Delete type</button>
          <span className="app-page-schedule-foot-spacer" />
          <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button">Save as draft</button>
          <button className="app-page-schedule-btn app-page-schedule-btn-primary app-page-schedule-btn-sm" type="button">Save &amp; activate →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageSchedule({ handle }: AppPageScheduleProps): ReactElement {
  const [provider, setProvider]     = useState<CalProvider>("manual");
  const [modalOpen, setModalOpen]   = useState(false);
  const [hasTypes]                  = useState(true);

  return (
    <div className="app-page-schedule-root" aria-labelledby="app-page-schedule-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-schedule-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-schedule-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-schedule-crumb-sep">/</span>
        <span className="app-page-schedule-crumb-here">Schedule</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-schedule-page-head">
        <div>
          <h1 id="app-page-schedule-h1" className="app-page-schedule-h1">
            <span className="app-page-schedule-ph-emoji" aria-hidden="true">📅</span>
            Schedule
          </h1>
          <p className="app-page-schedule-sub">
            Let visitors book your time. Pick session types, set when you&apos;re free, and tadaify handles the rest — calendar invites, reminders, payments.
          </p>
        </div>
        <div className="app-page-schedule-actions">
          <span className="app-page-schedule-url-pill">
            <span className="app-page-schedule-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>book</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          ADMIN BANNER — bookings management
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel app-page-schedule-panel-admin-banner">
        <div className="app-page-schedule-admin-banner-inner">
          <div style={{ fontSize: 26, flexShrink: 0 }}>📅</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="app-page-schedule-admin-banner-title">Manage bookings in Administration → Schedule</div>
            <div className="app-page-schedule-admin-banner-sub">
              Today&apos;s sessions, upcoming list, calendar view, and per-booking actions (Confirm / Reschedule / Cancel) live in the Administration tab.
              This page is for page-level setup — booking types, calendar integration, availability rules, notifications, payments.
            </div>
          </div>
          {/* TODO: wire to admin pages API */}
          <a href="/app?tab=admin&section=schedule" className="app-page-schedule-btn app-page-schedule-btn-primary app-page-schedule-btn-sm" style={{ flexShrink: 0 }}>
            Open Schedule admin →
          </a>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 1 — Page settings
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Page settings</h2>
          <span className="app-page-schedule-panel-sub">Title, URL, visibility and SEO for the booking page itself.</span>
        </div>
        <div className="app-page-schedule-panel-body">

          <div className="app-page-schedule-field-row">
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="schedule-page-title">
                Page title{" "}
                <span className="app-page-schedule-field-hint">shown as &lt;h1&gt; on the public page</span>
              </label>
              <div className="app-page-schedule-field-prefix-wrap">
                <input id="schedule-page-title" type="text" defaultValue="Book a session" />
                {/* TODO: wire to admin pages API */}
                <button className="app-page-schedule-field-suffix-action" type="button">✨ Suggest</button>
              </div>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="schedule-page-slug">
                URL slug{" "}
                <span className="app-page-schedule-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-schedule-field-prefix-wrap">
                <span className="app-page-schedule-field-prefix">tadaify.com/{handle}/</span>
                <input id="schedule-page-slug" type="text" defaultValue="book" />
              </div>
            </div>
          </div>

          <div className="app-page-schedule-field-row">
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label">Publish</label>
              <ToggleRow name="Page is live" sub="Visitors can find this booking page at the URL above." defaultOn />
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label">Theme color</label>
              <SwatchRow />
            </div>
          </div>

          <details className="app-page-schedule-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
              </svg>
              SEO settings{" "}
              <span className="app-page-schedule-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-schedule-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-schedule-ex-body">
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="schedule-seo-title">
                  Meta title{" "}
                  <span className="app-page-schedule-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-schedule-field-prefix-wrap">
                  <input id="schedule-seo-title" type="text" defaultValue="Book a session with Alexandra Silva — strength coaching" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-schedule-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="schedule-seo-desc">
                  Meta description{" "}
                  <span className="app-page-schedule-field-hint">~155 chars</span>
                </label>
                <div className="app-page-schedule-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="schedule-seo-desc"
                    className="app-page-schedule-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="Personal coaching for women lifting heavy. 30-min intros are free; 60-min programmes start at $80. Book a slot below — calendar invite arrives in 30 seconds."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-schedule-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — Calendar integration
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Calendar integration</h2>
          <span className="app-page-schedule-panel-sub">
            tadaify is the front-end. Your calendar lives in Google / Apple / Outlook — or right here in tadaify.
          </span>
        </div>
        <div className="app-page-schedule-panel-body">

          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label">Where do your appointments live?</label>
            <div className="app-page-schedule-provider-grid">

              {(["google", "apple", "outlook", "manual"] as CalProvider[]).map((prov) => {
                const provData = {
                  google:  { markCls: "g", mark: "G", name: "Google Calendar",          badge: "post-MVP", sub: "Sync availability + write bookings to your Google Calendar via OAuth." },
                  apple:   { markCls: "a", mark: "",  name: "Apple Calendar",            badge: "post-MVP", sub: "Sync via your Apple ID. Works with iCloud Calendar on macOS + iOS." },
                  outlook: { markCls: "o", mark: "O", name: "Outlook / Microsoft 365",   badge: "post-MVP", sub: "Sync with Outlook.com or your Microsoft 365 work calendar via OAuth." },
                  manual:  { markCls: "m", mark: "📅",name: "Manual / Tadaify-only",     badge: "recommended", sub: "tadaify keeps your availability. Booked slots show as busy here; nothing syncs out." },
                }[prov];
                return (
                  <button
                    key={prov}
                    type="button"
                    className={`app-page-schedule-provider-card${provider === prov ? " is-selected" : ""}`}
                    onClick={() => setProvider(prov)}
                  >
                    <span className={`app-page-schedule-pc-mark ${provData.markCls}`} aria-hidden="true">{provData.mark}</span>
                    <span className="app-page-schedule-pc-meta">
                      <span className="app-page-schedule-pc-name">
                        {provData.name}{" "}
                        <span className={`app-page-schedule-pill-soft${provData.badge === "recommended" ? " pill-recommended" : " pill-postmvp"}`}>
                          {provData.badge === "recommended" ? "Recommended for MVP" : "post-MVP"}
                        </span>
                      </span>
                      <span className="app-page-schedule-pc-sub">{provData.sub}</span>
                    </span>
                    <span className="app-page-schedule-pc-radio" aria-hidden="true" />
                  </button>
                );
              })}

            </div>

            <div className="app-page-schedule-info-note">
              <span className="app-page-schedule-in-icon" aria-hidden="true">ℹ️</span>
              <div>
                <b>MVP scope:</b> the standalone scheduler ships first (per DEC-APIPAGES-01 = C). Calendar OAuth providers are designed here so you can see the long-term picture; they activate when the integration epic lands. Today, Manual / Tadaify-only handles bookings end-to-end.
              </div>
            </div>
          </div>

          {/* OAuth status — only shown when non-manual provider selected */}
          {provider !== "manual" && (
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label">Connection status</label>
              <div className="app-page-schedule-oauth-status">
                <div className="app-page-schedule-os-mark" aria-hidden="true">
                  {{ google: "G", apple: "", outlook: "O" }[provider]}
                </div>
                <div className="app-page-schedule-os-meta">
                  <div className="app-page-schedule-os-row1">
                    Connected as <b>alex@gmail.com</b>
                    <span className="app-page-schedule-chip connected">✓ Active</span>
                  </div>
                  <div className="app-page-schedule-os-row2">Last sync: 12 minutes ago · Reading 3 calendars</div>
                </div>
                <div className="app-page-schedule-os-actions">
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-xs" type="button">Reconnect</button>
                  <button className="app-page-schedule-btn app-page-schedule-btn-danger-ghost app-page-schedule-btn-xs" type="button">Disconnect</button>
                </div>
              </div>
              <div className="app-page-schedule-field-row" style={{ marginTop: 14 }}>
                <div className="app-page-schedule-field">
                  <label className="app-page-schedule-field-label" htmlFor="cfg-cal-read">Read availability from</label>
                  <select className="app-page-schedule-field-select" id="cfg-cal-read" defaultValue="primary">
                    <option value="primary">Primary — alex@gmail.com</option>
                    <option>Work — alex@strongnotskinny.coach</option>
                    <option>Personal — family@gmail.com (do not write)</option>
                  </select>
                </div>
                <div className="app-page-schedule-field">
                  <label className="app-page-schedule-field-label" htmlFor="cfg-cal-write">Write bookings to</label>
                  <select className="app-page-schedule-field-select" id="cfg-cal-write" defaultValue="primary">
                    <option value="primary">Primary — alex@gmail.com</option>
                    <option>Coaching — coaching@strongnotskinny.coach</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Buffer / window / timezone */}
          <div className="app-page-schedule-field-row three" style={{ marginTop: 14 }}>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="cfg-buffer">Buffer between bookings</label>
              <select className="app-page-schedule-field-select" id="cfg-buffer" defaultValue="15">
                <option value="0">0 min — back-to-back</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="cfg-window">Booking window</label>
              <select className="app-page-schedule-field-select" id="cfg-window" defaultValue="30">
                <option value="7">7 days ahead</option>
                <option value="30">30 days ahead</option>
                <option value="60">60 days ahead</option>
                <option value="90">90 days ahead</option>
              </select>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="cfg-tz">
                Your timezone{" "}
                <span className="app-page-schedule-field-hint">auto-detected</span>
              </label>
              <select className="app-page-schedule-field-select" id="cfg-tz" defaultValue="Warsaw">
                <option value="Warsaw">Europe/Warsaw — auto</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Asia/Singapore</option>
              </select>
            </div>
          </div>

          {/* Working hours */}
          <div className="app-page-schedule-field" style={{ marginTop: 8 }}>
            <label className="app-page-schedule-field-label">
              Working hours{" "}
              <span className="app-page-schedule-field-hint">when bookings are allowed by default</span>
            </label>
            <div className="app-page-schedule-hours-grid">
              {HOURS_DAYS.map((d) => <HoursRow key={d.day} entry={d} />)}
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — Booking types
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Booking types</h2>
          <span className="app-page-schedule-panel-sub">What can visitors book? Each type has its own duration, price and form.</span>
          <span className="app-page-schedule-head-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-schedule-btn app-page-schedule-btn-primary app-page-schedule-btn-sm" type="button" onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New booking type
          </button>
        </div>
        <div className="app-page-schedule-panel-body-lg">

          {hasTypes ? (
            <>
              <div className="app-page-schedule-types-toolbar">
                <div className="app-page-schedule-tabs" role="tablist">
                  <button className="app-page-schedule-tab is-active" role="tab" aria-selected="true">
                    All <span className="app-page-schedule-tab-count">4</span>
                  </button>
                  <button className="app-page-schedule-tab" role="tab" aria-selected="false">
                    Active <span className="app-page-schedule-tab-count">3</span>
                  </button>
                  <button className="app-page-schedule-tab" role="tab" aria-selected="false">
                    Paused <span className="app-page-schedule-tab-count">1</span>
                  </button>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-muted)" }}>
                  Free plan: <b>2 of 2</b> active types used ·{" "}
                  <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>
                    Upgrade for unlimited →
                  </span>
                </div>
              </div>
              <div className="app-page-schedule-types-list">
                {BOOKING_TYPES.map((bt) => (
                  <BookingTypeRow key={bt.id} bt={bt} onEdit={() => setModalOpen(true)} />
                ))}
              </div>
            </>
          ) : (
            <div className="app-page-schedule-empty-state">
              <div className="app-page-schedule-es-emoji" aria-hidden="true">📅</div>
              <h3>Create your first booking type</h3>
              <p>A booking type is what visitors pick first — like &quot;30-min intro call&quot; or &quot;60-min coaching&quot;. You can change it anytime. Start from a template or build from scratch.</p>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-schedule-btn app-page-schedule-btn-primary" type="button" onClick={() => setModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Build from scratch
              </button>
              <div className="app-page-schedule-starter-grid">
                {STARTER_TYPES.map((s) => (
                  <button key={s.name} className="app-page-schedule-starter-card" type="button" onClick={() => setModalOpen(true)}>
                    <div className="app-page-schedule-sc-name">{s.emoji} {s.name}</div>
                    <div className="app-page-schedule-sc-sub">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 4 — Availability rules
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Availability rules</h2>
          <span className="app-page-schedule-panel-sub">Refine the working-hours grid with recurring exceptions and one-off blackouts.</span>
          <span className="app-page-schedule-head-spacer" />
          <span className="app-page-schedule-chip" style={{ background: "rgba(16,185,129,0.14)", color: "#047857" }}>✨ Creator+</span>
        </div>
        <div className="app-page-schedule-panel-body">

          <div className="app-page-schedule-field">
            <label className="app-page-schedule-field-label">Recurring rules</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ToggleRow name="No bookings before 10:00 on Tuesdays" sub="Auto-applied on every recurring Tuesday. Visitors won't see 09:00–10:00 slots." defaultOn />
              <ToggleRow name="Lunch break 12:30–13:30 every weekday" sub="Blocks the slot across Mon–Fri." defaultOn />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button" style={{ alignSelf: "flex-start" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add recurring rule
              </button>
            </div>
          </div>

          <div className="app-page-schedule-field" style={{ marginTop: 14 }}>
            <label className="app-page-schedule-field-label">
              One-off blackouts{" "}
              <span className="app-page-schedule-field-hint">vacations, holidays, unavailable days</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="app-page-schedule-row-toggle">
                <div>
                  <div className="app-page-schedule-rt-name">May 1 — National holiday</div>
                  <div className="app-page-schedule-rt-sub">Full day blocked.</div>
                </div>
                {/* TODO: wire to admin pages API */}
                <button className="app-page-schedule-iconbtn" aria-label="Remove blackout" type="button">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="app-page-schedule-row-toggle">
                <div>
                  <div className="app-page-schedule-rt-name">May 12–18 — Vacation in Sicily 🏖</div>
                  <div className="app-page-schedule-rt-sub">Full week blocked.</div>
                </div>
                {/* TODO: wire to admin pages API */}
                <button className="app-page-schedule-iconbtn" aria-label="Remove blackout" type="button">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-sm" type="button" style={{ alignSelf: "flex-start" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add blackout
              </button>
            </div>
          </div>

          {/* Month grid */}
          <div className="app-page-schedule-field" style={{ marginTop: 14 }}>
            <label className="app-page-schedule-field-label">May 2026 — at a glance</label>
            <div className="app-page-schedule-month-grid">
              {MONTH_CELLS.map((cell, idx) => (
                <div
                  key={idx}
                  className={`app-page-schedule-mg-cell${cell.cls ? " " + cell.cls : ""}${cell.cls === "hdr" ? "" : ""}`}
                  style={
                    cell.cls === "hdr" ? { fontWeight: 600, color: "var(--fg-subtle)" } :
                    cell.cls === "dim" ? { opacity: 0.4 } : {}
                  }
                >
                  {cell.label}
                </div>
              ))}
            </div>
            <div className="app-page-schedule-legend-row">
              <span><span className="app-page-schedule-lg-dot is-free" />Free</span>
              <span><span className="app-page-schedule-lg-dot is-busy" />Has bookings</span>
              <span><span className="app-page-schedule-lg-dot is-block" />Blocked</span>
              <span style={{ color: "var(--fg-subtle)" }}>Empty cells = outside working hours.</span>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 5 — Notifications
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Notifications</h2>
          <span className="app-page-schedule-panel-sub">When a booking happens — what gets sent and to whom.</span>
        </div>
        <div className="app-page-schedule-panel-body">

          <h3 className="app-page-schedule-notif-heading">For you (the creator)</h3>

          <ToggleRow
            name="Email me when someone books"
            sub={<>Sent to <b>alex@strongnotskinny.coach</b>. Includes ICS attachment.</>}
            defaultOn
          />
          <div style={{ marginTop: 8 }}>
            <ToggleRow
              name={<>Day-before reminder <span className="app-page-schedule-chip" style={{ background: "rgba(16,185,129,0.14)", color: "#047857", marginLeft: 6 }}>✨ Creator+</span></>}
              sub="Email summary of all bookings tomorrow, sent at 18:00 your timezone."
              defaultOn
            />
          </div>

          <div className="app-page-schedule-field" style={{ marginTop: 8 }}>
            <label className="app-page-schedule-field-label">
              Push to your tools{" "}
              <span className="app-page-schedule-field-hint">click a provider to enable</span>
            </label>
            <div className="app-page-schedule-provider-chip-row">
              {[
                { emoji: "💬", label: "Slack",          on: true },
                { emoji: "🎮", label: "Discord",        on: false },
                { emoji: "📓", label: "Notion",         on: false },
                { emoji: "🔗", label: "Custom webhook", on: false },
              ].map((chip) => {
                const [on, setOn] = useState(chip.on);
                return (
                  <button
                    key={chip.label}
                    className={`app-page-schedule-provider-chip${on ? " is-on" : ""}`}
                    type="button"
                    onClick={() => setOn((v) => !v)}
                  >
                    <span className="app-page-schedule-pc-ico" aria-hidden="true">{chip.emoji}</span>
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <TierHint isPro>
              Direct webhook providers (Slack, Discord, Notion, custom URL) are part of <b>Pro</b>. We&apos;ll prompt to upgrade at save time if any are enabled.
            </TierHint>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "16px 0" }} />

          <h3 className="app-page-schedule-notif-heading">For the visitor</h3>

          <ToggleRow
            name="Booking confirmation"
            sub="Sent immediately after booking. Includes ICS attachment + cancellation link."
            defaultOn
          />

          <details className="app-page-schedule-expander" style={{ margin: "10px 0" }}>
            <summary>
              Customize confirmation email subject + body
              <svg className="app-page-schedule-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-schedule-ex-body">
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="conf-subject">Subject</label>
                <div className="app-page-schedule-field-prefix-wrap">
                  <input id="conf-subject" type="text" defaultValue={"You're booked! — {{booking_type}} with Alexandra on {{date}}"} />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-schedule-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-schedule-field">
                <label className="app-page-schedule-field-label" htmlFor="conf-body">
                  Body{" "}
                  <span className="app-page-schedule-field-hint">supports {"{{"}{"}}"} tokens: name, date, time, cancel_link</span>
                </label>
                <textarea
                  id="conf-body"
                  className="app-page-schedule-field-area"
                  defaultValue={"Hi {{name}},\n\nThanks for booking — see you {{date}} at {{time}}. The calendar invite is attached.\n\nIf anything changes, you can {{cancel_link}}. No charge if you cancel more than 24h before.\n\n— Alexandra"}
                />
              </div>
            </div>
          </details>

          <div style={{ marginTop: 8 }}>
            <ToggleRow
              name={<>24-hour reminder <span className="app-page-schedule-chip" style={{ background: "rgba(16,185,129,0.14)", color: "#047857", marginLeft: 6 }}>✨ Creator+</span></>}
              sub={`Polite "see you tomorrow" email.`}
              defaultOn
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <ToggleRow
              name={<>1-hour reminder <span className="app-page-schedule-chip" style={{ background: "rgba(99,102,241,0.13)", color: "#4338CA", marginLeft: 6 }}>✨ Pro+</span></>}
              sub="Last-minute heads-up so visitors don't no-show."
            />
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 6 — Payments
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-schedule-panel">
        <div className="app-page-schedule-panel-head">
          <h2>Payments</h2>
          <span className="app-page-schedule-panel-sub">Settings for paid booking types. You connect Stripe once; payouts come straight to you.</span>
          <span className="app-page-schedule-head-spacer" />
          <span className="app-page-schedule-chip" style={{ background: "rgba(16,185,129,0.14)", color: "#047857" }}>✨ Creator+</span>
        </div>
        <div className="app-page-schedule-panel-body">

          <div className="app-page-schedule-stripe-panel" style={{ marginBottom: 14 }}>
            <div className="app-page-schedule-sp-mark" aria-hidden="true">S</div>
            <div className="app-page-schedule-sp-meta">
              <div className="app-page-schedule-sp-row1">
                Stripe connected <span className="app-page-schedule-chip connected">✓ Active</span>
              </div>
              <div className="app-page-schedule-sp-row2">
                Payouts to <b>alex@strongnotskinny.coach</b> · USD · Daily payouts enabled.
              </div>
            </div>
            {/* TODO: wire to admin pages API */}
            <button className="app-page-schedule-btn app-page-schedule-btn-ghost app-page-schedule-btn-xs" type="button">Open dashboard</button>
            <button className="app-page-schedule-btn app-page-schedule-btn-danger-ghost app-page-schedule-btn-xs" type="button">Disconnect</button>
          </div>

          <div className="app-page-schedule-field-row">
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="cfg-currency">Default currency</label>
              <select className="app-page-schedule-field-select" id="cfg-currency" defaultValue="USD">
                <option value="USD">USD — $</option>
                <option value="EUR">EUR — €</option>
                <option value="GBP">GBP — £</option>
                <option value="PLN">PLN — zł</option>
                <option value="JPY">JPY — ¥</option>
              </select>
            </div>
            <div className="app-page-schedule-field">
              <label className="app-page-schedule-field-label" htmlFor="cfg-cancel-policy">Default cancellation refund</label>
              <select className="app-page-schedule-field-select" id="cfg-cancel-policy" defaultValue="24h">
                <option value="none">No refund — final sale</option>
                <option value="24h">Free cancel up to 24h before</option>
                <option value="48h">Free cancel up to 48h before</option>
                <option value="7d">Free cancel up to 7 days before</option>
                <option value="always">Always full refund</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            <ToggleRow
              name="Require deposit at booking"
              sub="Visitors pay a percentage upfront, the rest on the day. Reduces no-shows."
            />
          </div>

        </div>
      </section>

      {/* ── Booking type modal (centered, NEVER a drawer) ── */}
      {modalOpen && <TypeModal onClose={() => setModalOpen(false)} />}

    </div>
  );
}
