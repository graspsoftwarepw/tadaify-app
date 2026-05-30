/**
 * CreatorSchedulePage — public Schedule / Booking page render.
 *
 * Visitor view at tadaify.com/<handle>/book. 3-step booking flow:
 *   Step 1 — pick a booking type (4 session types shown)
 *   Step 2 — pick a date on the calendar, then a time slot
 *   Step 3 — fill contact details + Stripe checkout (mockup)
 *
 * Plus post-flow views:
 *   Confirmation (booked) · Error (slot taken) · Cancel · Reschedule
 *
 * All booking / payment actions stubbed with TODO comments.
 * Dead-code: NOT wired to app/routes.ts — added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-schedule.css
 */

import type { ReactElement } from "react";
import { useState, useCallback } from "react";
import "~/styles/public-pages/creator-schedule.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewName = "step1" | "step2" | "step3" | "booked" | "error" | "cancel" | "reschedule";

interface SessionType {
  slug: string;
  emoji: string;
  coverClass: string;
  durationLabel: string;
  pricePill: { label: string; kind: "free" | "paid" };
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
}

// ---------------------------------------------------------------------------
// Static data (mirrors mockup exactly)
// ---------------------------------------------------------------------------

const SESSION_TYPES: SessionType[] = [
  {
    slug: "intro",
    emoji: "☕",
    coverClass: "t-emerald",
    durationLabel: "30 min",
    pricePill: { label: "Free", kind: "free" },
    badge: "⭐ Most-booked",
    title: "30-min intro call",
    description:
      "A relaxed first chat to see if we click. Tell me about your training, goals, and what you'd want from coaching. No prep needed — bring questions if you have any.",
    ctaLabel: "Pick a time →",
  },
  {
    slug: "coaching",
    emoji: "💪",
    coverClass: "t-warm",
    durationLabel: "60 min",
    pricePill: { label: "$80", kind: "paid" },
    badge: "Free cancel up to 24h",
    title: "60-min coaching session",
    description:
      "A focused 60-minute session. Bring your current programme; we'll review form, fix sticking points, and plan the next 4 weeks. Held over Google Meet.",
    ctaLabel: "Pick a time →",
  },
  {
    slug: "checkin",
    emoji: "📋",
    coverClass: "t-indigo",
    durationLabel: "45 min",
    pricePill: { label: "$45", kind: "paid" },
    badge: "For existing clients",
    title: "Programme check-in",
    description:
      "A mid-cycle review for clients on a 12-week programme. We look at your logs, talk recovery, adjust the next block. Bring a recent video if you've got one.",
    ctaLabel: "Pick a time →",
  },
  {
    slug: "workshop",
    emoji: "👯",
    coverClass: "t-rose",
    durationLabel: "90 min · 8 spots",
    pricePill: { label: "$25/seat", kind: "paid" },
    badge: "Group session",
    title: "Group strength workshop",
    description:
      "A small-group workshop for 8 lifters at a time. We cover squat / bench / deadlift technique, then everyone runs through their working sets with feedback. Held monthly.",
    ctaLabel: "Pick a time →",
  },
];

interface SessionMeta {
  title: string;
  line: string;
  emoji: string;
  price: string;
}

const SESSION_META: Record<string, SessionMeta> = {
  intro: {
    title: "30-min intro call",
    line: "30 minutes · Free · A relaxed first chat · No prep needed",
    emoji: "☕",
    price: "Free",
  },
  coaching: {
    title: "60-min coaching session",
    line: "60 minutes · $80 · Held over Google Meet · Free cancel up to 24h",
    emoji: "💪",
    price: "$80",
  },
  checkin: {
    title: "Programme check-in",
    line: "45 minutes · $45 · For existing clients · Bring a recent video",
    emoji: "📋",
    price: "$45",
  },
  workshop: {
    title: "Group strength workshop",
    line: "90 minutes · $25/seat · 8 spots · Held monthly",
    emoji: "👯",
    price: "$25",
  },
};

// Calendar days for May 2026 (mirrors mockup)
interface CalDay {
  day: number;
  state: "other" | "blocked" | "available" | "has-slots" | "today-selected";
  iso?: string;
  blockTip?: string;
}

const CAL_DAYS: CalDay[] = [
  { day: 27, state: "other" }, { day: 28, state: "other" }, { day: 29, state: "other" }, { day: 30, state: "other" },
  { day: 1, state: "blocked", blockTip: "Holiday" }, { day: 2, state: "available" }, { day: 3, state: "available" },
  { day: 4, state: "has-slots", iso: "2026-05-04" }, { day: 5, state: "has-slots", iso: "2026-05-05" },
  { day: 6, state: "has-slots", iso: "2026-05-06" }, { day: 7, state: "has-slots", iso: "2026-05-07" },
  { day: 8, state: "has-slots", iso: "2026-05-08" }, { day: 9, state: "available" }, { day: 10, state: "available" },
  { day: 11, state: "blocked", blockTip: "Vacation" }, { day: 12, state: "blocked", blockTip: "Vacation" },
  { day: 13, state: "blocked", blockTip: "Vacation" }, { day: 14, state: "blocked", blockTip: "Vacation" },
  { day: 15, state: "blocked", blockTip: "Vacation" }, { day: 16, state: "blocked", blockTip: "Vacation" },
  { day: 17, state: "blocked", blockTip: "Vacation" },
  { day: 18, state: "blocked" }, { day: 19, state: "today-selected", iso: "2026-05-19" },
  { day: 20, state: "has-slots", iso: "2026-05-20" }, { day: 21, state: "has-slots", iso: "2026-05-21" },
  { day: 22, state: "has-slots", iso: "2026-05-22" }, { day: 23, state: "available" }, { day: 24, state: "available" },
  { day: 25, state: "has-slots", iso: "2026-05-25" }, { day: 26, state: "has-slots", iso: "2026-05-26" },
  { day: 27, state: "has-slots", iso: "2026-05-27" }, { day: 28, state: "has-slots", iso: "2026-05-28" },
  { day: 29, state: "has-slots", iso: "2026-05-29" }, { day: 30, state: "available" }, { day: 31, state: "available" },
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const DISABLED_SLOTS = new Set(["12:00", "13:00"]);

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepBar({ activeStep }: { activeStep: 1 | 2 | 3 }): ReactElement {
  const steps = ["Pick a session", "Pick a time", "Fill details"] as const;
  return (
    <div className="csp-step-bar">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const isDone = n < activeStep;
        const isActive = n === activeStep;
        return (
          <>
            <div
              key={label}
              className={`csp-step-pill${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
            >
              <span className="csp-sp-num">{isDone ? "✓" : n}</span>
              {label}
            </div>
            {i < 2 && (
              <span key={`arrow-${i}`} className="csp-sp-arrow">
                →
              </span>
            )}
          </>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CreatorSchedulePage(): ReactElement {
  const [view, setView] = useState<ViewName>("step1");
  const [selectedType, setSelectedType] = useState<string>("coaching");
  const [selectedDay, setSelectedDay] = useState<string>("Tuesday, May 19");
  const [selectedSlot, setSelectedSlot] = useState<string>("10:00");
  const [selectedDayIso, setSelectedDayIso] = useState<string>("2026-05-19");

  const meta = SESSION_META[selectedType] ?? SESSION_META["coaching"];

  const handlePickType = useCallback((slug: string) => {
    // TODO: navigate to type step
    setSelectedType(slug);
    setView("step2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePickDay = useCallback((iso: string) => {
    // TODO: load available slots for day
    setSelectedDayIso(iso);
    const dt = new Date(iso);
    const label = dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    setSelectedDay(label);
    setSelectedSlot("");
  }, []);

  const handlePickSlot = useCallback((time: string) => {
    // TODO: reserve slot
    setSelectedSlot(time);
  }, []);

  const handleContinueToStep3 = useCallback(() => {
    // TODO: advance to details step
    setView("step3");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmitBooking = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // TODO: submit booking + Stripe payment
    setView("booked");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePickAnotherTime = useCallback(() => {
    // TODO: navigate back to step2 for rescheduling
    setView("step2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStartOver = useCallback(() => {
    // TODO: reset booking flow
    setView("step1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleGoCancel = useCallback(() => {
    // TODO: navigate to cancel view
    setView("cancel");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleGoReschedule = useCallback(() => {
    // TODO: navigate to reschedule view
    setView("reschedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleConfirmCancel = useCallback(() => {
    // TODO: confirm cancellation, send email to both parties
  }, []);

  const handleConfirmReschedule = useCallback((_day: string) => {
    // TODO: confirm reschedule to new day
    void _day;
  }, []);

  const handleOpenFullCalendar = useCallback(() => {
    // TODO: navigate back to full calendar view
    setView("step2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFindNext = useCallback(() => {
    // TODO: auto-pick soonest free slot
  }, []);

  const handleDownloadIcs = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: download invite.ics
  }, []);

  const handleAddToGoogleCalendar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: open Google Calendar quick-add URL
  }, []);

  return (
    <div className="creator-schedule-page">
      {/* Creator nav */}
      <nav className="csp-nav">
        <a href="/" className="csp-nav-handle">
          {/* TODO: link to creator home */}
          <span className="csp-av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="csp-nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/book" className="is-current">Book</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      {/* ============================================================
          STEP 1 — Pick a booking type
          ============================================================ */}
      <section
        className={`csp-view${view === "step1" ? " is-active" : ""}`}
        data-view="step1"
      >
        <div className="csp-hero">
          <h1>Book a session</h1>
          <p className="csp-lede">
            Pick a session type below, then a time that suits you. Free 30-min
            intros are perfect if you've never worked with me before.
          </p>
        </div>
        <StepBar activeStep={1} />
        <div className="csp-section">
          <div className="csp-types-grid">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.slug}
                className="csp-type-card"
                onClick={() => handlePickType(t.slug)}
              >
                <div
                  className={`csp-tc-cover ${t.coverClass}`}
                  aria-hidden="true"
                >
                  {t.emoji}
                </div>
                <div className="csp-tc-body">
                  <div className="csp-tc-row1">
                    <span className="csp-tc-pill">{t.durationLabel}</span>
                    <span
                      className={`csp-tc-pill${t.pricePill.kind === "free" ? " is-free" : " is-paid"}`}
                    >
                      {t.pricePill.label}
                    </span>
                    {t.badge && (
                      <span className="csp-tc-badge">{t.badge}</span>
                    )}
                  </div>
                  <h3 className="csp-tc-title">{t.title}</h3>
                  <p className="csp-tc-desc">{t.description}</p>
                  <span className="csp-tc-cta">{t.ctaLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          STEP 2 — Pick a time
          ============================================================ */}
      <section
        className={`csp-view${view === "step2" ? " is-active" : ""}`}
        data-view="step2"
      >
        <div className="csp-hero" style={{ paddingBottom: 0 }}>
          <h1>{meta.title}</h1>
          <p className="csp-lede">
            Pick a day, then a time that works for you. All times shown in your
            timezone — change it on the right if needed.
          </p>
        </div>
        <StepBar activeStep={2} />
        <div className="csp-section">
          <div className="csp-recap">
            <div className="csp-rc-mark" aria-hidden="true">{meta.emoji}</div>
            <div className="csp-rc-meta">
              <div className="csp-rc-title">{meta.title}</div>
              <div className="csp-rc-line">{meta.line}</div>
            </div>
            <button
              className="csp-rc-change"
              onClick={() => {
                // TODO: go back to session type selection
                setView("step1");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Change
            </button>
          </div>

          <div className="csp-step2-grid">
            {/* Calendar panel */}
            <div className="csp-panel">
              <div className="csp-cal-head">
                <button
                  onClick={handleFindNext}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <span className="csp-cal-month">May 2026</span>
                <button
                  onClick={() => { /* TODO: next month */ }}
                  aria-label="Next month"
                >
                  ›
                </button>
                <span className="csp-cal-tz">
                  Times in{" "}
                  <select
                    onChange={() => { /* TODO: switch timezone display */ }}
                    aria-label="Timezone"
                  >
                    <option>Europe/Warsaw (auto)</option>
                    <option>Europe/London</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </span>
              </div>

              {/* Desktop month grid */}
              <div className="csp-cal-grid">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d} className="csp-cg-dow">
                    {d}
                  </div>
                ))}
                {CAL_DAYS.map((d, i) => {
                  const isSelected =
                    d.iso === selectedDayIso ||
                    (d.state === "today-selected" && !selectedDayIso);
                  const cls = [
                    "csp-cal-day",
                    d.state === "other" ? "is-other" : "",
                    d.state === "blocked" ? "is-blocked" : "",
                    d.state === "has-slots" || d.state === "today-selected"
                      ? "has-slots"
                      : "",
                    d.state === "today-selected" ? "is-today" : "",
                    isSelected ? "is-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const isDisabled =
                    d.state === "other" ||
                    d.state === "blocked" ||
                    d.state === "available";
                  return (
                    <button
                      key={i}
                      className={cls}
                      disabled={isDisabled}
                      onClick={() => d.iso && handlePickDay(d.iso)}
                      data-tip={d.blockTip}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>

              {/* Mobile horizontal strip */}
              <div className="csp-month-strip">
                {[
                  { dow: "Mon", num: 4, iso: "2026-05-04", state: "has-slots" },
                  { dow: "Tue", num: 5, iso: "2026-05-05", state: "has-slots" },
                  { dow: "Wed", num: 6, iso: "2026-05-06", state: "has-slots" },
                  { dow: "Thu", num: 7, iso: "2026-05-07", state: "has-slots" },
                  { dow: "Fri", num: 8, iso: "2026-05-08", state: "has-slots" },
                  { dow: "Mon", num: 11, iso: "", state: "blocked" },
                  { dow: "Tue", num: 12, iso: "", state: "blocked" },
                  { dow: "Tue", num: 19, iso: "2026-05-19", state: "has-slots" },
                  { dow: "Wed", num: 20, iso: "2026-05-20", state: "has-slots" },
                  { dow: "Thu", num: 21, iso: "2026-05-21", state: "has-slots" },
                  { dow: "Fri", num: 22, iso: "2026-05-22", state: "has-slots" },
                ].map((d) => {
                  const isSelected = d.iso === selectedDayIso;
                  return (
                    <button
                      key={`${d.dow}-${d.num}`}
                      className={`csp-ms-day ${d.state === "has-slots" ? "has-slots" : ""} ${d.state === "blocked" ? "is-blocked" : ""} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => d.iso && handlePickDay(d.iso)}
                      disabled={d.state === "blocked"}
                    >
                      <span className="csp-ms-dow">{d.dow}</span>
                      <span className="csp-ms-num">{d.num}</span>
                    </button>
                  );
                })}
              </div>

              <button className="csp-cal-find-next" onClick={handleFindNext}>
                {/* TODO: auto-pick soonest free slot */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Find next available
              </button>
            </div>

            {/* Time slots panel */}
            <div className="csp-panel">
              <h2>{selectedDay}</h2>
              <div className="csp-slot-list">
                {TIME_SLOTS.map((time) => {
                  const disabled = DISABLED_SLOTS.has(time);
                  return (
                    <button
                      key={time}
                      className={`csp-slot-btn${selectedSlot === time ? " is-selected" : ""}`}
                      disabled={disabled}
                      onClick={() => handlePickSlot(time)}
                    >
                      {/* TODO: select time slot */}
                      {time}
                    </button>
                  );
                })}
              </div>

              <div className="csp-slot-meta">
                <span>5 slots open this day</span>
                <span className="csp-slot-meta-dot">·</span>
                <span>15-min buffer between bookings</span>
              </div>

              <button
                className="csp-btn csp-btn-primary csp-btn-block csp-btn-lg"
                style={{ marginTop: 18 }}
                onClick={handleContinueToStep3}
                disabled={!selectedSlot}
              >
                {selectedSlot
                  ? `Continue with ${selectedSlot} →`
                  : "Select a time slot first"}
              </button>

              <button
                className="csp-back-link"
                style={{ display: "block", textAlign: "center", marginTop: 10 }}
                onClick={() => { setView("step1"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                ← Back to session types
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STEP 3 — Fill details + checkout
          ============================================================ */}
      <section
        className={`csp-view${view === "step3" ? " is-active" : ""}`}
        data-view="step3"
      >
        <div className="csp-hero" style={{ paddingBottom: 0 }}>
          <h1>Almost done — your details</h1>
          <p className="csp-lede">
            A few quick questions, then we'll send the calendar invite.
          </p>
        </div>
        <StepBar activeStep={3} />
        <div className="csp-section">
          <div className="csp-recap">
            <div className="csp-rc-mark" aria-hidden="true">{meta.emoji}</div>
            <div className="csp-rc-meta">
              <div className="csp-rc-title">
                {meta.title} — {selectedDay} at {selectedSlot}
              </div>
              <div className="csp-rc-line">
                {meta.line}
              </div>
            </div>
            <button
              className="csp-rc-change"
              onClick={() => { setView("step2"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Change
            </button>
          </div>

          <div className="csp-step3-grid">
            {/* Form panel */}
            <div className="csp-panel">
              <h2>Your info</h2>
              <form onSubmit={handleSubmitBooking}>
                <div className="csp-field">
                  <label className="csp-field-label" htmlFor="bk-name">
                    Name <span className="csp-field-req">*</span>
                  </label>
                  <input
                    className="csp-field-input"
                    id="bk-name"
                    type="text"
                    required
                    placeholder="Jamie Park"
                  />
                </div>
                <div className="csp-field">
                  <label className="csp-field-label" htmlFor="bk-email">
                    Email <span className="csp-field-req">*</span>
                  </label>
                  <input
                    className="csp-field-input"
                    id="bk-email"
                    type="email"
                    required
                    placeholder="jamie@example.com"
                  />
                </div>
                <div className="csp-field">
                  <label className="csp-field-label" htmlFor="bk-topic">
                    What would you like to focus on?{" "}
                    <span className="csp-field-req">*</span>
                  </label>
                  <textarea
                    className="csp-field-area"
                    id="bk-topic"
                    required
                    placeholder="Anything you want me to come prepared with — e.g. 'review my squat form', 'help me build a 12-week programme', 'I'm stuck at 80kg deadlift'…"
                  />
                </div>
                <div className="csp-field">
                  <label className="csp-field-label" htmlFor="bk-phone">
                    Phone{" "}
                    <span className="csp-field-opt">(optional)</span>
                  </label>
                  <input
                    className="csp-field-input"
                    id="bk-phone"
                    type="tel"
                    placeholder="+48 600 000 000"
                  />
                </div>

                <h2 style={{ marginTop: 22 }}>Payment</h2>
                <div className="csp-stripe-elements">
                  <div className="csp-se-label">Card number</div>
                  <div className="csp-se-row">
                    4242 4242 4242 4242{" "}
                    <span style={{ marginLeft: "auto", color: "var(--fg-subtle)" }}>
                      VISA
                    </span>
                  </div>
                  <div className="csp-se-row split">
                    <div>
                      <div className="csp-se-label">Expiry</div>
                      <div>12 / 28</div>
                    </div>
                    <div>
                      <div className="csp-se-label">CVC</div>
                      <div>•••</div>
                    </div>
                  </div>
                  <div className="csp-se-trust">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Secured by Stripe · No charge if you cancel more than 24h
                    before
                  </div>
                </div>

                <div className="csp-policy-block" style={{ marginTop: 14 }}>
                  <b>Cancellation policy:</b> Free cancel up to <b>24 hours</b>{" "}
                  before. After that you can still reschedule once for free;
                  cancellations within 24h are non-refundable.
                </div>

                <div className="csp-step3-form-actions">
                  <button
                    type="button"
                    className="csp-back-link"
                    onClick={() => { setView("step2"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    ← Back
                  </button>
                  <span className="csp-step3-total">
                    Total:{" "}
                    <span className="csp-price-tag" style={{ verticalAlign: "-3px" }}>
                      <span className="csp-pt-cur">$</span>
                      <span className="csp-pt-amt">
                        {meta.price.replace("$", "")}
                      </span>
                    </span>
                  </span>
                  <button type="submit" className="csp-btn csp-btn-primary csp-btn-lg">
                    {/* TODO: trigger Stripe payment flow */}
                    Pay {meta.price} &amp; book →
                  </button>
                </div>
              </form>
            </div>

            {/* Side recap */}
            <div className="csp-panel">
              <h2>You're booking</h2>
              <div className="csp-step3-recap-row">
                <div className="csp-step3-recap-item">
                  <span className="csp-step3-recap-label">Session</span>
                  <b>{meta.title}</b>
                </div>
                <div className="csp-step3-recap-item">
                  <span className="csp-step3-recap-label">When</span>
                  <b>
                    {selectedDay} · {selectedSlot}
                  </b>
                </div>
                <div className="csp-step3-recap-item">
                  <span className="csp-step3-recap-label">Where</span>
                  <b>Google Meet</b>
                </div>
                <div className="csp-step3-recap-item">
                  <span className="csp-step3-recap-label">Timezone</span>
                  <b>Europe/Warsaw</b>
                </div>
                <div className="csp-step3-recap-item">
                  <span className="csp-step3-recap-label">Length</span>
                  <b>{meta.line.split(" · ")[0]}</b>
                </div>
                <hr className="csp-divider" />
                <div className="csp-step3-recap-item" style={{ alignItems: "baseline" }}>
                  <span className="csp-step3-recap-label">Total</span>
                  <span className="csp-price-tag">
                    <span className="csp-pt-cur">$</span>
                    <span className="csp-pt-amt">{meta.price.replace("$", "")}</span>
                  </span>
                </div>
              </div>
              <div className="csp-step3-recap-note">
                <b>What happens next:</b> instant calendar invite to your email.
                Day-before reminder. The Google Meet link is in the invite.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONFIRMATION
          ============================================================ */}
      <section
        className={`csp-view${view === "booked" ? " is-active" : ""}`}
        data-view="booked"
      >
        <div className="csp-moment">
          <div className="csp-mo-emoji" aria-hidden="true">🎉</div>
          <h2>You're booked!</h2>
          <p>
            Check your inbox at <b>jamie@example.com</b> — the calendar invite
            is on its way (under 30 seconds usually).
          </p>
          <div className="csp-mo-card">
            <div className="csp-mc-row">
              <span>Session</span>
              <b>{meta.title}</b>
            </div>
            <div className="csp-mc-row">
              <span>When</span>
              <b>
                {selectedDay} · {selectedSlot} (Europe/Warsaw)
              </b>
            </div>
            <div className="csp-mc-row">
              <span>Where</span>
              <b>Google Meet — link in your invite</b>
            </div>
            <div className="csp-mc-row">
              <span>Paid</span>
              <b>{meta.price} — receipt #r_2026_05_b78a</b>
            </div>
          </div>
          <div className="csp-mo-actions">
            <a href="#" className="csp-btn csp-btn-ghost" onClick={handleDownloadIcs}>
              {/* TODO: download invite.ics */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download .ics
            </a>
            <a href="#" className="csp-btn csp-btn-ghost" onClick={handleAddToGoogleCalendar}>
              {/* TODO: open Google Calendar quick-add */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Add to Google Calendar
            </a>
          </div>
          <div className="csp-mo-extra">
            Need to change plans?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); handleGoReschedule(); }}>
              Reschedule
            </a>{" "}
            or{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); handleGoCancel(); }}>
              Cancel
            </a>
            . Free cancellation up to 24 hours before.
          </div>
          <div className="csp-mo-extra" style={{ marginTop: 34 }}>
            <a href="/">← All from Alexandra</a>
            &nbsp;·&nbsp;
            <a href="#" onClick={(e) => { e.preventDefault(); handleStartOver(); }}>
              Book another session
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          ERROR
          ============================================================ */}
      <section
        className={`csp-view${view === "error" ? " is-active" : ""}`}
        data-view="error"
      >
        <div className="csp-moment">
          <div className="csp-mo-emoji" aria-hidden="true">😬</div>
          <h2>Something went wrong</h2>
          <p>
            We couldn't lock in your slot — usually this means someone else
            booked it in the last few seconds, or there was a hiccup with
            payment. Your card was <b>not charged</b>.
          </p>
          <div className="csp-mo-card">
            <div className="csp-mc-row">
              <span>What happened</span>
              <b>Slot no longer available</b>
            </div>
            <div className="csp-mc-row">
              <span>Was attempting</span>
              <b>
                {selectedDay} · {selectedSlot}
              </b>
            </div>
            <div className="csp-mc-row">
              <span>Charged</span>
              <b>$0.00 — no payment taken</b>
            </div>
          </div>
          <div className="csp-mo-actions">
            <button className="csp-btn csp-btn-primary" onClick={handlePickAnotherTime}>
              {/* TODO: go back to time selection */}
              Pick another time →
            </button>
            <button className="csp-btn csp-btn-ghost" onClick={handleStartOver}>
              {/* TODO: reset to step 1 */}
              Start over
            </button>
          </div>
          <div className="csp-mo-extra">
            Still stuck? Email Alexandra directly at{" "}
            <a href="mailto:alex@strongnotskinny.coach">
              alex@strongnotskinny.coach
            </a>
            .
          </div>
        </div>
      </section>

      {/* ============================================================
          CANCEL
          ============================================================ */}
      <section
        className={`csp-view${view === "cancel" ? " is-active" : ""}`}
        data-view="cancel"
      >
        <div className="csp-moment">
          <div className="csp-mo-emoji" aria-hidden="true">🛑</div>
          <h2>Cancel this booking?</h2>
          <p>
            You're about to cancel your upcoming session with Alexandra. You can
            reschedule instead if your timing has changed.
          </p>
          <div className="csp-mo-card">
            <div className="csp-mc-row">
              <span>Session</span>
              <b>{meta.title}</b>
            </div>
            <div className="csp-mc-row">
              <span>When</span>
              <b>
                {selectedDay} · {selectedSlot}
              </b>
            </div>
            <div className="csp-mc-row">
              <span>Refund</span>
              <b className="csp-refund-ok">
                Full refund — {meta.price} will return to your card in 5–10
                business days
              </b>
            </div>
          </div>
          <div className="csp-mo-actions">
            <button
              className="csp-btn csp-btn-ghost"
              onClick={handleGoReschedule}
            >
              {/* TODO: navigate to reschedule */}
              Reschedule instead
            </button>
            <button
              className="csp-btn csp-btn-danger-ghost"
              onClick={handleConfirmCancel}
            >
              {/* TODO: confirm cancellation */}
              Yes, cancel my booking
            </button>
          </div>
          <div className="csp-mo-extra">
            Changed your mind?{" "}
            <a href="/">Back to alexandra.tadaify.com</a>
          </div>
        </div>
      </section>

      {/* ============================================================
          RESCHEDULE
          ============================================================ */}
      <section
        className={`csp-view${view === "reschedule" ? " is-active" : ""}`}
        data-view="reschedule"
      >
        <div className="csp-moment" style={{ textAlign: "left", maxWidth: 880 }}>
          <div className="csp-reschedule-center">
            <div className="csp-mo-emoji" aria-hidden="true">🔄</div>
            <h2>Reschedule your booking</h2>
            <p>
              Pick a new time below. Your existing booking stays until you
              confirm the new slot — no risk of losing your spot.
            </p>
          </div>

          <div className="csp-mo-card" style={{ marginTop: 24 }}>
            <div className="csp-mc-row">
              <span>Currently booked</span>
              <b>
                {meta.title} · {selectedDay} · {selectedSlot}
              </b>
            </div>
            <div className="csp-mc-row">
              <span>Status</span>
              <b className="csp-reschedule-warn">
                Will be replaced when you confirm a new time
              </b>
            </div>
            <div className="csp-mc-row">
              <span>Free reschedule</span>
              <b className="csp-refund-ok">Yes — first reschedule is free</b>
            </div>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="csp-reschedule-header">
              <h3>Pick a new time</h3>
              <select className="csp-reschedule-tz" onChange={() => { /* TODO: switch timezone */ }}>
                <option>Europe/Warsaw (auto)</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
              </select>
            </div>

            <div className="csp-day-picker">
              {[
                { dow: "Wed", date: "May 20", slots: "5 slots — earliest 14:00", iso: "2026-05-20" },
                { dow: "Thu", date: "May 21", slots: "7 slots — earliest 10:00", iso: "2026-05-21" },
                { dow: "Fri", date: "May 22", slots: "4 slots — earliest 09:00", iso: "2026-05-22" },
              ].map((d) => (
                <button
                  key={d.iso}
                  className="csp-day-btn"
                  onClick={() => handleConfirmReschedule(d.iso)}
                >
                  {/* TODO: confirm reschedule to this day */}
                  <div className="csp-day-dow">{d.dow}</div>
                  <div className="csp-day-date">{d.date}</div>
                  <div className="csp-day-slots">{d.slots}</div>
                </button>
              ))}
            </div>

            <button
              className="csp-btn csp-btn-ghost"
              style={{ alignSelf: "center", marginTop: 6 }}
              onClick={handleOpenFullCalendar}
            >
              {/* TODO: show full calendar */}
              Open full calendar →
            </button>
          </div>

          <div className="csp-mo-extra" style={{ textAlign: "center" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleGoCancel(); }}>
              Cancel instead
            </a>
            &nbsp;·&nbsp;
            <a href="/">Back to alexandra.tadaify.com</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="csp-footer">
        <div className="csp-footer-handle">@alexandra</div>
        <div className="csp-footer-socials">
          {["📷", "🎵", "▶", "✉"].map((icon, i) => (
            <a
              key={i}
              className="csp-footer-soc"
              href="#"
              aria-label={["Instagram", "TikTok", "YouTube", "Email"][i]}
              onClick={(e) => {
                e.preventDefault();
                // TODO: open social link
              }}
            >
              {icon}
            </a>
          ))}
        </div>
        <div className="csp-footer-poweredby">
          Built with{" "}
          <a href="/" onClick={(e) => { e.preventDefault(); /* TODO */ }}>
            tadaify
          </a>{" "}
          — your handle, your everything.
        </div>
      </footer>
    </div>
  );
}
