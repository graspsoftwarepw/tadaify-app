/**
 * Public Schedule / booking page — what a visitor sees at
 * tadaify.com/<handle>/book. Faithful port of
 * mockups/tadaify-mvp/creator-schedule-public.html onto the shared PublicChrome.
 * Presentational + local React state only; data from a typed fixture.
 *
 * The mockup drove its 7 sub-views (pick session → pick time → fill details →
 * booked / error / cancel / reschedule) via hash routing. Here those are a local
 * `view` state machine. A "Demo view" strip (mockup-only, replacing the mockup's
 * hash toolbar) lets reviewers jump between every view. Day / slot selection is
 * wired with local state; month nav, timezone switch, .ics export etc. are
 * mocked alerts as in the mockup.
 *
 * @implements fr-creator-schedule-public
 */
import { useState } from "react";
import { PublicChrome } from "../public/PublicChrome";
import { scheduleContentFixture, type SessionType } from "./creatorSchedulePublicFixture";
import "./creator-schedule-public-proto.css";

type View = "step1" | "step2" | "step3" | "booked" | "error" | "cancel" | "reschedule";

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function CreatorSchedulePublicScreen() {
  const c = scheduleContentFixture();
  const [view, setView] = useState<View>("step1");
  const [typeSlug, setTypeSlug] = useState("coaching");
  const [day, setDay] = useState("2026-05-19");
  const [slot, setSlot] = useState("10:00");

  const type: SessionType =
    c.sessionTypes.find((t) => t.slug === typeSlug) ?? c.sessionTypes[1];
  const priceLabel = type.total === 0 ? "Free" : `$${type.total}`;

  function pickType(slug: string) {
    setTypeSlug(slug);
    setView("step2");
  }

  const stepBar = (active: 1 | 2 | 3) => (
    <div className="step-bar">
      <div className={`step-pill ${active > 1 ? "is-done" : active === 1 ? "is-active" : ""}`}>
        <span className="sp-num">{active > 1 ? "✓" : "1"}</span> Pick a session
      </div>
      <span className="sp-arrow">→</span>
      <div className={`step-pill ${active > 2 ? "is-done" : active === 2 ? "is-active" : ""}`}>
        <span className="sp-num">{active > 2 ? "✓" : "2"}</span> Pick a time
      </div>
      <span className="sp-arrow">→</span>
      <div className={`step-pill ${active === 3 ? "is-active" : ""}`}>
        <span className="sp-num">3</span> Fill details
      </div>
    </div>
  );

  return (
    <PublicChrome
      rootClassName="proto-schedule-public"
      creator={c.creator}
      current="book"
      urlSuffix="book"
      socials={c.footerSocials}
    >
      {/* ── STEP 1 — pick a session ── */}
      {view === "step1" && (
        <section className="view">
          <div className="page-hero">
            <h1>Book a session</h1>
            <p className="lede">Pick a session type below, then a time that suits you. Free 30-min intros are perfect if you've never worked with me before.</p>
          </div>
          {stepBar(1)}
          <div className="section">
            <div className="types-grid">
              {c.sessionTypes.map((t) => (
                <button type="button" className="type-card" key={t.slug} onClick={() => pickType(t.slug)}>
                  <div className={`tc-cover t-${t.cover}`} aria-hidden="true">{t.emoji}</div>
                  <div className="tc-body">
                    <div className="tc-row1">
                      <span className="tc-pill">{t.duration}</span>
                      <span className={`tc-pill ${t.priceKind === "free" ? "is-free" : "is-paid"}`}>{t.price}</span>
                      <span className="tc-badge">{t.badge}</span>
                    </div>
                    <h3 className="tc-title">{t.title}</h3>
                    <p className="tc-desc">{t.desc}</p>
                    <span className="tc-cta">Pick a time →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 2 — pick a time ── */}
      {view === "step2" && (
        <section className="view">
          <div className="page-hero" style={{ paddingBottom: 0 }}>
            <h1>{type.title}</h1>
            <p className="lede">Pick a day, then a time that works for you. All times shown in your timezone — change it on the right if needed.</p>
          </div>
          {stepBar(2)}
          <div className="section">
            <div className="recap">
              <div className="rc-mark" aria-hidden="true">{type.emoji}</div>
              <div className="rc-meta">
                <div className="rc-title">{type.title}</div>
                <div className="rc-line">{type.recapLine}</div>
              </div>
              <button type="button" className="rc-change" onClick={() => setView("step1")}>Change</button>
            </div>

            <div className="step2-grid">
              <div className="panel">
                <div className="cal-head">
                  <button onClick={() => window.alert("Mockup — previous month")} aria-label="Previous month">‹</button>
                  <span className="cal-month">{c.month}</span>
                  <button onClick={() => window.alert("Mockup — next month")} aria-label="Next month">›</button>
                  <span className="cal-tz">
                    Times in{" "}
                    <select onChange={() => window.alert("Mockup — switches TZ display")} aria-label="Timezone" defaultValue={c.timezones[0]}>
                      {c.timezones.map((tz) => <option key={tz}>{tz}</option>)}
                    </select>
                  </span>
                </div>

                <div className="cal-grid">
                  {c.dow.map((d) => <div className="cg-dow" key={d}>{d}</div>)}
                  {c.calendar.map((cell, i) => {
                    const cls = [
                      "cal-day",
                      cell.state === "other" ? "is-other" : "",
                      cell.state === "slots" ? "has-slots" : "",
                      cell.state === "blocked" ? "is-blocked" : "",
                      cell.today ? "is-today" : "",
                      cell.iso === day ? "is-selected" : "",
                    ].filter(Boolean).join(" ");
                    const disabled = cell.state !== "slots";
                    return (
                      <button
                        key={i}
                        className={cls}
                        disabled={disabled}
                        title={cell.tip}
                        onClick={cell.iso ? () => { setDay(cell.iso!); setSlot(""); } : undefined}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="month-strip">
                  {c.monthStrip.map((m) => (
                    <button
                      key={m.iso}
                      className={`ms-day ${m.state === "slots" ? "has-slots" : "is-blocked"} ${m.iso === day ? "is-selected" : ""}`}
                      disabled={m.state !== "slots"}
                      onClick={m.state === "slots" ? () => { setDay(m.iso); setSlot(""); } : undefined}
                    >
                      <span className="ms-dow">{m.dow}</span>
                      <span className="ms-num">{m.num}</span>
                    </button>
                  ))}
                </div>

                <button className="cal-find-next" onClick={() => window.alert("Mockup — auto-picks the soonest free slot (Tue, May 19 at 10:00)")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Find next available
                </button>
              </div>

              <div className="panel">
                <h2>{dayLabel(day)}</h2>
                <div className="slot-list">
                  {c.slots.map((s) => (
                    <button
                      key={s.time}
                      className={`slot-btn ${slot === s.time ? "is-selected" : ""}`}
                      disabled={!s.available}
                      onClick={s.available ? () => setSlot(s.time) : undefined}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
                <div className="slot-meta">
                  <span>{c.slots.filter((s) => s.available).length} slots open this day</span>
                  <span className="slot-dot">·</span>
                  <span>15-min buffer between bookings</span>
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={!slot}
                  onClick={() => setView("step3")}
                >
                  {slot ? `Continue with ${slot} →` : "Pick a time above"}
                </button>
                <button type="button" className="step-back" onClick={() => setView("step1")}>← Back to session types</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 3 — fill details + checkout ── */}
      {view === "step3" && (
        <section className="view">
          <div className="page-hero" style={{ paddingBottom: 0 }}>
            <h1>Almost done — your details</h1>
            <p className="lede">A few quick questions, then we'll send the calendar invite.</p>
          </div>
          {stepBar(3)}
          <div className="section">
            <div className="recap">
              <div className="rc-mark" aria-hidden="true">{type.emoji}</div>
              <div className="rc-meta">
                <div className="rc-title">{type.title} — {dayLabel(day)} at {slot || "—"}</div>
                <div className="rc-line">{type.recapLine}</div>
              </div>
              <button type="button" className="rc-change" onClick={() => setView("step2")}>Change</button>
            </div>

            <div className="step3-grid">
              <div className="panel">
                <h2>Your info</h2>
                <form onSubmit={(e) => { e.preventDefault(); setView("booked"); }}>
                  <div className="field">
                    <label className="field-label" htmlFor="bk-name">Name <span className="req">*</span></label>
                    <input className="field-input" id="bk-name" type="text" required placeholder="Jamie Park" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="bk-email">Email <span className="req">*</span></label>
                    <input className="field-input" id="bk-email" type="email" required placeholder="jamie@example.com" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="bk-topic">What would you like to focus on? <span className="req">*</span></label>
                    <textarea className="field-area" id="bk-topic" required placeholder="Anything you want me to come prepared with — e.g. 'review my squat form', 'help me build a 12-week programme'…" />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="bk-phone">Phone <span className="optional">(optional)</span></label>
                    <input className="field-input" id="bk-phone" type="tel" placeholder="+48 600 000 000" />
                  </div>

                  {type.total > 0 && (
                    <>
                      <h2 className="pay-h">Payment</h2>
                      <div className="stripe-elements">
                        <div className="se-label">Card number</div>
                        <div className="se-row">4242 4242 4242 4242 <span className="se-brand">VISA</span></div>
                        <div className="se-row split">
                          <div><div className="se-label">Expiry</div><div>12 / 28</div></div>
                          <div><div className="se-label">CVC</div><div>•••</div></div>
                        </div>
                        <div className="se-trust">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Secured by Stripe · No charge if you cancel more than 24h before
                        </div>
                      </div>
                    </>
                  )}

                  <div className="policy-block">
                    <b>Cancellation policy:</b> Free cancel up to <b>24 hours</b> before. After that you can still reschedule once for free; cancellations within 24h are non-refundable.
                  </div>

                  <div className="submit-row">
                    <button type="button" className="step-back" onClick={() => setView("step2")}>← Back</button>
                    <span className="total-line">Total: <span className="price-tag"><span className="pt-cur">{type.total > 0 ? "$" : ""}</span><span className="pt-amt">{type.total > 0 ? type.total : "Free"}</span></span></span>
                    <button type="submit" className="btn btn-primary btn-lg">
                      {type.total > 0 ? `Pay $${type.total} & book →` : "Confirm booking →"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="panel">
                <h2>You're booking</h2>
                <div className="recap-rows">
                  <div className="rr"><span>Session</span><b>{type.title}</b></div>
                  <div className="rr"><span>When</span><b>{dayLabel(day)} · {slot || "—"}</b></div>
                  <div className="rr"><span>Where</span><b>Google Meet</b></div>
                  <div className="rr"><span>Timezone</span><b>Europe/Warsaw</b></div>
                  <div className="rr"><span>Length</span><b>{type.duration}</b></div>
                  <hr />
                  <div className="rr"><span>Total</span><span className="price-tag"><span className="pt-cur">{type.total > 0 ? "$" : ""}</span><span className="pt-amt">{type.total > 0 ? type.total : "Free"}</span></span></div>
                </div>
                <div className="next-note">
                  <b>What happens next:</b> instant calendar invite to your email. Day-before reminder. The Google Meet link is in the invite.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BOOKED ── */}
      {view === "booked" && (
        <section className="view">
          <div className="moment">
            <div className="mo-emoji" aria-hidden="true">🎉</div>
            <h2>You're booked!</h2>
            <p>Check your inbox at <b>jamie@example.com</b> — the calendar invite is on its way (under 30 seconds usually).</p>
            <div className="mo-card">
              <div className="mc-row"><span>Session</span><b>{type.title}</b></div>
              <div className="mc-row"><span>When</span><b>{dayLabel(day)} · {slot || "—"} (Europe/Warsaw)</b></div>
              <div className="mc-row"><span>Where</span><b>Google Meet — link in your invite</b></div>
              <div className="mc-row"><span>Paid</span><b>{priceLabel} — receipt #r_2026_05_b78a</b></div>
            </div>
            <div className="mo-actions">
              <button className="btn btn-ghost" onClick={() => window.alert("Mockup — downloads invite.ics")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download .ics
              </button>
              <button className="btn btn-ghost" onClick={() => window.alert("Mockup — opens Google Calendar quick-add")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Add to Google Calendar
              </button>
            </div>
            <div className="mo-extra">
              Need to change plans? <button type="button" className="link-btn" onClick={() => setView("reschedule")}>Reschedule</button> or <button type="button" className="link-btn" onClick={() => setView("cancel")}>Cancel</button>. Free cancellation up to 24 hours before.
            </div>
            <div className="mo-extra mo-extra-foot">
              <a href="/__proto/creator-public">← All from Alexandra</a>
              &nbsp;·&nbsp;
              <button type="button" className="link-btn" onClick={() => setView("step1")}>Book another session</button>
            </div>
          </div>
        </section>
      )}

      {/* ── ERROR ── */}
      {view === "error" && (
        <section className="view">
          <div className="moment">
            <div className="mo-emoji" aria-hidden="true">😬</div>
            <h2>Something went wrong</h2>
            <p>We couldn't lock in your slot — usually this means someone else booked it in the last few seconds, or there was a hiccup with payment. Your card was <b>not charged</b>.</p>
            <div className="mo-card">
              <div className="mc-row"><span>What happened</span><b>Slot no longer available</b></div>
              <div className="mc-row"><span>Was attempting</span><b>{dayLabel(day)} · {slot || "—"}</b></div>
              <div className="mc-row"><span>Charged</span><b>$0.00 — no payment taken</b></div>
            </div>
            <div className="mo-actions">
              <button className="btn btn-primary" onClick={() => setView("step2")}>Pick another time →</button>
              <button className="btn btn-ghost" onClick={() => setView("step1")}>Start over</button>
            </div>
            <div className="mo-extra">
              Still stuck? Email Alexandra directly at <a href="mailto:alex@strongnotskinny.coach">alex@strongnotskinny.coach</a>.
            </div>
          </div>
        </section>
      )}

      {/* ── CANCEL ── */}
      {view === "cancel" && (
        <section className="view">
          <div className="moment">
            <div className="mo-emoji" aria-hidden="true">🛑</div>
            <h2>Cancel this booking?</h2>
            <p>You're about to cancel your upcoming session with Alexandra. You can reschedule instead if your timing has changed.</p>
            <div className="mo-card">
              <div className="mc-row"><span>Session</span><b>{type.title}</b></div>
              <div className="mc-row"><span>When</span><b>{dayLabel(day)} · {slot || "—"}</b></div>
              <div className="mc-row"><span>Refund</span><b className="ok">Full refund — {priceLabel} will return to your card in 5–10 business days</b></div>
            </div>
            <div className="mo-actions">
              <button className="btn btn-ghost" onClick={() => setView("reschedule")}>Reschedule instead</button>
              <button className="btn btn-danger-ghost" onClick={() => window.alert("Mockup — cancellation confirmed; both parties get email")}>Yes, cancel my booking</button>
            </div>
            <div className="mo-extra">
              Changed your mind? <a href="/__proto/creator-public">Back to alexandra.tadaify.com</a>
            </div>
          </div>
        </section>
      )}

      {/* ── RESCHEDULE ── */}
      {view === "reschedule" && (
        <section className="view">
          <div className="moment moment-wide">
            <div className="mo-center">
              <div className="mo-emoji" aria-hidden="true">🔄</div>
              <h2>Reschedule your booking</h2>
              <p>Pick a new time below. Your existing booking stays until you confirm the new slot — no risk of losing your spot.</p>
            </div>
            <div className="mo-card">
              <div className="mc-row"><span>Currently booked</span><b>{type.title} · {dayLabel(day)} · {slot || "—"}</b></div>
              <div className="mc-row"><span>Status</span><b className="warn">Will be replaced when you confirm a new time</b></div>
              <div className="mc-row"><span>Free reschedule</span><b className="ok">Yes — first reschedule is free</b></div>
            </div>
            <div className="resch-pick">
              <div className="resch-head">
                <h3>Pick a new time</h3>
                <select aria-label="Timezone" defaultValue={c.timezones[0]}>
                  {c.timezones.slice(0, 3).map((tz) => <option key={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="resch-grid">
                <button className="resch-day" onClick={() => window.alert("Mockup — confirm reschedule to Wed, May 20 · 14:00")}>
                  <div className="rd-dow">Wed</div><div className="rd-date">May 20</div><div className="rd-meta">5 slots — earliest 14:00</div>
                </button>
                <button className="resch-day is-pref" onClick={() => window.alert("Mockup — confirm reschedule to Thu, May 21 · 10:00")}>
                  <div className="rd-dow">Thu</div><div className="rd-date">May 21</div><div className="rd-meta">7 slots — earliest 10:00</div>
                </button>
                <button className="resch-day" onClick={() => window.alert("Mockup — confirm reschedule to Fri, May 22 · 09:00")}>
                  <div className="rd-dow">Fri</div><div className="rd-date">May 22</div><div className="rd-meta">4 slots — earliest 09:00</div>
                </button>
              </div>
              <button className="btn btn-ghost resch-full" onClick={() => setView("step2")}>Open full calendar →</button>
            </div>
            <div className="mo-extra mo-center">
              <button type="button" className="link-btn" onClick={() => setView("cancel")}>Cancel instead</button>
              &nbsp;·&nbsp;
              <a href="/__proto/creator-public">Back to alexandra.tadaify.com</a>
            </div>
          </div>
        </section>
      )}

      {/* Mockup-only demo-view switcher (replaces the mockup's hash toolbar). */}
      <div className="demo-strip" aria-label="Demo views">
        <span>Demo view:</span>
        {([
          ["step1", "1 · Pick a session"],
          ["step2", "2 · Pick a time"],
          ["step3", "3 · Fill details"],
          ["booked", "4 · Confirmation"],
          ["error", "5 · Error"],
          ["cancel", "6 · Cancel"],
          ["reschedule", "7 · Reschedule"],
        ] as [View, string][]).map(([v, label]) => (
          <button key={v} type="button" className={view === v ? "is-active" : undefined} onClick={() => setView(v)}>
            {label}
          </button>
        ))}
      </div>
    </PublicChrome>
  );
}
