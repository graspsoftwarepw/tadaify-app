/**
 * Administration → Schedule (bookings) — the day-to-day bookings management
 * view a creator opens at Administration > Schedule. Faithful port of
 * mockups/tadaify-mvp/app-admin-schedule.html. It pairs with the Schedule page
 * editor (page-level setup lives in Pages → Schedule).
 *
 * It renders inside the shared creator dashboard chrome (appbar + sidebar) via
 * DashboardChrome with `activeNav="admin-schedule"`, and owns only its
 * `main.content` body. Presentational, local-state only: switch the calendar
 * view tab, flip between the filled and no-page states, and open/close the
 * centred booking-detail modal (Escape + Cancel + backdrop). Data comes from
 * the typed adminScheduleFixture. The no-show stat (Pro) stays fully visible
 * and interactive — no blur.
 *
 * @implements fr-admin-schedule
 * @implements fr-globalui-view-layout
 */
import "./admin-schedule-proto.css";
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  adminScheduleFixture,
  type Booking,
  type CalendarView,
} from "./adminScheduleFixture";

const noop = (label: string) => () => alert(`Mockup — ${label}`);

const Overflow = () => (
  <button className="iconbtn" type="button" aria-label="More" onClick={noop("booking actions")}>
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  </button>
);

function BookingRow({ b, onOpen }: { b: Booking; onOpen: () => void }) {
  return (
    <div
      className="booking-row"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("button")) onOpen();
      }}
    >
      <div className="b-time">
        <div className="t-hour">{b.timeTop}</div>
        <div className="t-period">{b.timeBottom}</div>
      </div>
      <div className="b-meta">
        <h4 className="b-attendee">{b.attendee}</h4>
        <div className="b-info">
          <span className={`chip ${b.status === "pending" ? "warm" : b.status === "noshow" || b.status === "cancelled" ? "danger" : "success"}`}>
            {b.statusLabel}
          </span>
          <span>{b.info}</span>
        </div>
      </div>
      <div className="b-actions">
        {b.primaryAction === "confirm" ? (
          <button className="btn btn-primary btn-xs" type="button" onClick={noop("confirm booking")}>
            Confirm
          </button>
        ) : (
          <button className="btn btn-ghost btn-xs" type="button" onClick={onOpen}>
            Details
          </button>
        )}
        {b.secondaryAction === "reschedule" && (
          <button className="iconbtn" type="button" aria-label="Reschedule" onClick={noop("reschedule booking")}>
            <S w={16}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></S>
          </button>
        )}
        <Overflow />
      </div>
    </div>
  );
}

export function AdminScheduleScreen() {
  const profile = dashboardProfileFixture();
  const fx = adminScheduleFixture();

  const [empty, setEmpty] = useState(false);
  const [view, setView] = useState<CalendarView>(fx.view);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailOpen]);

  const openDetail = () => setDetailOpen(true);

  return (
    <DashboardChrome profile={profile} activeNav="admin-schedule">
      <section className="proto-admin-schedule" aria-labelledby="as-title">
        <nav className="as-crumb" aria-label="Breadcrumb">
          <a href="/__proto/dashboard">Dashboard</a>
          <span className="sep">/</span>
          <span className="here">Administration · Schedule</span>
        </nav>

        <header className="page-head">
          <div>
            <h1 id="as-title">📅 Bookings</h1>
            <div className="sub">
              Confirm, reschedule, and track sessions. Page-level setup (booking types, calendar sync,
              payments) lives in <a href="/__proto/admin-schedule">Pages → Schedule</a>.
            </div>
          </div>
          {!empty && (
            <div className="actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={noop("export CSV")}>
                Export CSV
              </button>
              <button className="btn btn-primary" type="button" onClick={noop("new booking")}>
                ＋ New booking
              </button>
            </div>
          )}
        </header>

        {empty ? (
          /* ── State A: no Schedule page ── */
          <div className="as-empty">
            <div className="empty-icon" aria-hidden>📅</div>
            <h3>You don't have a Schedule page yet</h3>
            <p>
              Schedule lets visitors book paid or free sessions with you — coaching calls,
              consultations, lessons. To start taking bookings, add a Schedule page first.
            </p>
            <div className="empty-actions">
              <button className="btn btn-primary" type="button" onClick={noop("add Schedule page")}>
                ＋ Add Schedule page now
              </button>
              <button className="btn btn-ghost" type="button" onClick={noop("what is Schedule?")}>
                Skip — what is Schedule?
              </button>
            </div>
            <div className="as-demo">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>
                Demo: show filled state
              </button>
            </div>
          </div>
        ) : (
          /* ── State B: filled ── */
          <>
            <div className="as-stats">
              {fx.stats.map((s) => (
                <div className="as-stat" key={s.id}>
                  <div className="stat-label">
                    {s.label}
                    {s.tier && <span className="chip tier">{s.tier}</span>}
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Today */}
            <div className="as-section">
              <div className="as-section-head">
                <h2>{fx.todayLabel}</h2>
                <span className="sub">{fx.todayTimezone}</span>
              </div>
              <div className="as-section-body">
                <div className="as-bookings">
                  {fx.today.map((b) => (
                    <BookingRow key={b.id} b={b} onOpen={openDetail} />
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="as-section">
              <div className="as-section-head">
                <h2>{fx.upcomingLabel}</h2>
                <span className="sub">{fx.upcomingCount}</span>
              </div>
              <div className="as-section-body">
                <div className="as-bookings">
                  {fx.upcoming.map((b) => (
                    <BookingRow key={b.id} b={b} onOpen={openDetail} />
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="as-section">
              <div className="as-section-head">
                <h2>Calendar</h2>
                <span className="as-head-spacer" />
                <div className="cal-toolbar">
                  <div className="cal-nav">
                    <button className="iconbtn" type="button" aria-label="Previous month" onClick={noop("previous month")}>
                      <S w={16}><polyline points="15 18 9 12 15 6" /></S>
                    </button>
                    <span className="month-label">{fx.monthLabel}</span>
                    <button className="iconbtn" type="button" aria-label="Next month" onClick={noop("next month")}>
                      <S w={16}><polyline points="9 18 15 12 9 6" /></S>
                    </button>
                  </div>
                  <div className="view-tabs" role="tablist" aria-label="Calendar view">
                    {(["day", "week", "month"] as CalendarView[]).map((v) => (
                      <button
                        key={v}
                        className={`view-tab${view === v ? " is-active" : ""}`}
                        type="button"
                        role="tab"
                        aria-selected={view === v}
                        onClick={() => setView(v)}
                      >
                        {v[0].toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="as-section-body">
                <div className="cal-grid">
                  {fx.dayNames.map((d) => (
                    <div className="cal-dow" key={d}>{d}</div>
                  ))}
                  {fx.calendar.map((cell, i) => {
                    const cls = [
                      "cal-cell",
                      cell.other ? "is-other" : "",
                      cell.today ? "is-today" : "",
                      cell.events.length ? "has-events" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <button className={cls} type="button" key={i} onClick={noop("day detail")}>
                        <span className="c-num">{cell.day}</span>
                        {cell.events.map((ev, j) => (
                          <span className={`c-event${ev.tone ? ` ${ev.tone}` : ""}`} key={j}>
                            {ev.label}
                          </span>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="as-demo">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>
                Demo: show no-page state
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── Booking-detail modal — centred ── */}
      {detailOpen && (
        <div
          className="as-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="as-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailOpen(false);
          }}
        >
          <div className="as-modal">
            <div className="as-modal-head">
              <h3 id="as-detail-title">Booking — {fx.detail.attendee}</h3>
              <span className="chip success">{fx.detail.statusLabel}</span>
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setDetailOpen(false)}>
                <S w={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="as-modal-body">
              <dl className="detail-grid">
                {fx.detail.rows.map((r) => (
                  <div style={{ display: "contents" }} key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="as-modal-foot">
              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={noop("cancel booking")}>
                Cancel booking
              </button>
              <span className="as-foot-spacer" />
              <button className="btn btn-ghost" type="button" onClick={noop("reschedule booking")}>
                Reschedule
              </button>
              <button className="btn btn-primary" type="button" onClick={noop("send message")}>
                Send message
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
