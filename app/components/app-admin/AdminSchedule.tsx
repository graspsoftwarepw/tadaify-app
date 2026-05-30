/**
 * AdminSchedule — Administration → Schedule (bookings calendar) sub-page.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-schedule.html (497 LOC)
 *
 * Two display states:
 *   "no-page" — Schedule page not yet created
 *   "filled"  — Today's bookings + upcoming 14 days + monthly calendar
 *
 * Booking detail modal opens on "Details" click (centered, never a drawer).
 * All confirm/reschedule/cancel/export actions stubbed — TODO: wire to admin API.
 */

import { useState } from "react";

interface AdminScheduleProps {
  handle: string;
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingDetailModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="admin-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-booking-detail-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3 id="admin-booking-detail-title">Booking — Maya Rodriguez</h3>
          <span className="admin-chip admin-chip-confirmed">● Confirmed</span>
          <button className="admin-iconbtn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="admin-modal-body">
          <dl className="admin-detail-grid">
            <dt>When</dt>     <dd>Today, Apr 27 · 10:00–11:00 AM PT</dd>
            <dt>Type</dt>     <dd>1h portfolio review</dd>
            <dt>Price</dt>    <dd>$120 paid via Stripe (transaction <code>pi_3QXYz…</code>)</dd>
            <dt>Email</dt>    <dd>maya.r@example.com</dd>
            <dt>Phone</dt>    <dd>+1 415 555 0192</dd>
            <dt>Notes</dt>    <dd>&ldquo;Hi! I&apos;m working on my freelance illustration site, would love feedback on portfolio structure + pricing page. Thanks!&rdquo;</dd>
            <dt>Meeting link</dt>
            <dd>
              <a style={{ color: "var(--brand-primary)", textDecoration: "underline" }} href="#">
                https://meet.google.com/xyz-abcd-efg
              </a>{" "}
              (auto-generated)
            </dd>
            <dt>Reminder</dt> <dd>Sent 24h before · also 1h before</dd>
          </dl>
        </div>
        <div className="admin-modal-foot">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-danger-ghost admin-btn-sm">Cancel booking</button>
          <span className="admin-foot-spacer" />
          <button className="admin-btn admin-btn-ghost">Reschedule</button>
          <button className="admin-btn admin-btn-primary">Send message</button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar cells ───────────────────────────────────────────────────────────

interface CalEvent { text: string; variant?: "warm" | "success"; }
interface CalCell { num: number; other?: boolean; today?: boolean; events?: CalEvent[]; }

const CAL_CELLS: CalCell[] = [
  { num: 29, other: true },  { num: 30, other: true },  { num: 31, other: true },
  { num: 1 },  { num: 2,  events: [{ text: "9:00 P. Sharma" }] },
  { num: 3 },  { num: 4 },
  { num: 5 },  { num: 6,  events: [{ text: "11:00 D. Chen" }] },
  { num: 7 },  { num: 8,  events: [{ text: "10:30 Coaching", variant: "success" }] },
  { num: 9 },  { num: 10 }, { num: 11 },
  { num: 12, events: [{ text: "3:00 J. Smith" }] },
  { num: 13 }, { num: 14 },
  { num: 15, events: [{ text: "⏱ Pending", variant: "warm" }] },
  { num: 16 }, { num: 17 }, { num: 18 },
  { num: 19 },
  { num: 20, events: [{ text: "2:00 R. Patel" }] },
  { num: 21 }, { num: 22 },
  { num: 23, events: [{ text: "11:00 Coaching", variant: "success" }] },
  { num: 24 }, { num: 25 },
  { num: 26 },
  { num: 27, today: true, events: [{ text: "10:00 M. Rodriguez" }, { text: "2:30 J. Kemppi", variant: "warm" }, { text: "4:00 S. Lin", variant: "success" }] },
  { num: 28, events: [{ text: "11:00 D. Chen" }] },
  { num: 29 }, { num: 30 },
  { num: 1, other: true }, { num: 2, other: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminSchedule({ handle: _handle }: AdminScheduleProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("month");

  return (
    <section className="main-admin main-admin-schedule" aria-labelledby="admin-schedule-title">
      {/* Breadcrumb */}
      <nav className="admin-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="admin-crumb-sep">/</span>
        <span className="admin-crumb-here">Administration · Schedule</span>
      </nav>

      {/* Page head */}
      <div className="admin-page-head">
        <div>
          <h1 id="admin-schedule-title">
            <span className="admin-ph-emoji" aria-hidden="true">📅</span>
            Bookings
          </h1>
          <div className="admin-page-sub">
            Confirm, reschedule, and track sessions. Page-level setup (booking types, calendar sync, payments) lives in{" "}
            <a href="/app?tab=page" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
              Pages → Schedule
            </a>.
          </div>
        </div>
        <div className="admin-page-actions">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-ghost admin-btn-sm">Export CSV</button>
          <button className="admin-btn admin-btn-primary">＋ New booking</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Today</div>
          <div className="admin-stat-value">3</div>
          <div className="admin-stat-sub">bookings · 2 confirmed, 1 pending</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">This week</div>
          <div className="admin-stat-value">11</div>
          <div className="admin-stat-sub">$1,320 expected revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">
            No-show rate <span className="admin-chip admin-chip-tier">Pro</span>
          </div>
          <div className="admin-stat-value">2.4%</div>
          <div className="admin-stat-sub">last 90 days · 3 of 124 sessions</div>
        </div>
      </div>

      {/* Today's bookings */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Today — Mon, Apr 27</h2>
          <span className="admin-section-sub">All times in PT</span>
        </div>
        <div className="admin-section-body">
          <div className="admin-bookings">
            {/* Booking 1 — confirmed */}
            <div className="admin-booking-row" role="button" tabIndex={0} onClick={() => setDetailOpen(true)} onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}>
              <div className="admin-b-time">
                <div className="admin-t-hour">10:00</div>
                <div className="admin-t-period">AM</div>
              </div>
              <div className="admin-b-meta">
                <h4 className="admin-b-attendee">Maya Rodriguez</h4>
                <div className="admin-b-info">
                  <span className="admin-chip admin-chip-confirmed">● Confirmed</span>
                  <span>1h portfolio review · $120 paid</span>
                </div>
              </div>
              <div className="admin-b-actions">
                <button className="admin-btn admin-btn-xs admin-btn-ghost" onClick={(e) => { e.stopPropagation(); setDetailOpen(true); }}>Details</button>
                <button className="admin-iconbtn" aria-label="More options" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>

            {/* Booking 2 — pending */}
            <div className="admin-booking-row">
              <div className="admin-b-time">
                <div className="admin-t-hour">2:30</div>
                <div className="admin-t-period">PM</div>
              </div>
              <div className="admin-b-meta">
                <h4 className="admin-b-attendee">Jonas Kemppi</h4>
                <div className="admin-b-info">
                  <span className="admin-chip admin-chip-pending">⏱ Pending confirm</span>
                  <span>30m intro chat · Free</span>
                </div>
              </div>
              <div className="admin-b-actions">
                {/* TODO: wire to admin API */}
                <button className="admin-btn admin-btn-xs admin-btn-primary">Confirm</button>
                <button className="admin-iconbtn" aria-label="More options">
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>

            {/* Booking 3 — confirmed */}
            <div className="admin-booking-row">
              <div className="admin-b-time">
                <div className="admin-t-hour">4:00</div>
                <div className="admin-t-period">PM</div>
              </div>
              <div className="admin-b-meta">
                <h4 className="admin-b-attendee">Sara Lin (returning)</h4>
                <div className="admin-b-info">
                  <span className="admin-chip admin-chip-confirmed">● Confirmed</span>
                  <span>1h coaching · $120 paid · 4th session</span>
                </div>
              </div>
              <div className="admin-b-actions">
                <button className="admin-btn admin-btn-xs admin-btn-ghost">Details</button>
                <button className="admin-iconbtn" aria-label="More options">
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming 14 days */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Upcoming — next 14 days</h2>
          <span className="admin-section-sub">8 sessions</span>
        </div>
        <div className="admin-section-body">
          <div className="admin-bookings">
            <div className="admin-booking-row">
              <div className="admin-b-time">
                <div className="admin-t-hour">Apr</div>
                <div className="admin-t-period">28 · 11:00</div>
              </div>
              <div className="admin-b-meta">
                <h4 className="admin-b-attendee">David Chen</h4>
                <div className="admin-b-info">
                  <span className="admin-chip admin-chip-confirmed">● Confirmed</span>
                  <span>1h portfolio review · $120</span>
                </div>
              </div>
              <div className="admin-b-actions">
                {/* TODO: wire to admin API */}
                <button className="admin-iconbtn" aria-label="Reschedule">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </button>
                <button className="admin-iconbtn" aria-label="More options">
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>
            <div className="admin-booking-row">
              <div className="admin-b-time">
                <div className="admin-t-hour">May</div>
                <div className="admin-t-period">2 · 09:00</div>
              </div>
              <div className="admin-b-meta">
                <h4 className="admin-b-attendee">Priya Sharma</h4>
                <div className="admin-b-info">
                  <span className="admin-chip admin-chip-pending">⏱ Pending confirm</span>
                  <span>30m intro · Free</span>
                </div>
              </div>
              <div className="admin-b-actions">
                {/* TODO: wire to admin API */}
                <button className="admin-btn admin-btn-xs admin-btn-primary">Confirm</button>
                <button className="admin-iconbtn" aria-label="More options">
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2>Calendar</h2>
          <span className="admin-head-spacer" />
          <div className="admin-cal-toolbar">
            <div className="admin-cal-nav">
              <button className="admin-iconbtn" aria-label="Previous month">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="admin-month-label">April 2026</span>
              <button className="admin-iconbtn" aria-label="Next month">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="admin-view-tabs" role="tablist">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  className={`admin-view-tab${activeView === v ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={activeView === v}
                  onClick={() => setActiveView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="admin-section-body">
          <div className="admin-cal-grid" aria-label="Calendar grid">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="admin-cal-dow">{d}</div>
            ))}
            {CAL_CELLS.map((cell, i) => (
              <div
                key={i}
                className={[
                  "admin-cal-cell",
                  cell.other ? "is-other" : "",
                  cell.today ? "is-today" : "",
                  cell.events?.length ? "has-events" : "",
                ].filter(Boolean).join(" ")}
                role="gridcell"
                aria-label={`${cell.num}${cell.today ? " (today)" : ""}`}
              >
                <span className="admin-c-num">{cell.num}</span>
                {cell.events?.map((ev, j) => (
                  <span key={j} className={`admin-c-event${ev.variant ? ` ${ev.variant}` : ""}`}>{ev.text}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking detail modal */}
      {detailOpen && <BookingDetailModal onClose={() => setDetailOpen(false)} />}
    </section>
  );
}
