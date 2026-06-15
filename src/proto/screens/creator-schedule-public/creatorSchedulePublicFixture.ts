/**
 * Typed mock seam for the public Schedule / booking page. Mirrors
 * mockups/tadaify-mvp/creator-schedule-public.html so the screen graduates by
 * swapping these factories for the real published-page loader. Defines the
 * FR's rendered data contract.
 *
 * @implements fr-creator-schedule-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type SessionType = {
  slug: string;
  cover: "emerald" | "warm" | "indigo" | "rose";
  emoji: string;
  duration: string;
  price: string;
  priceKind: "free" | "paid";
  badge: string;
  title: string;
  desc: string;
  /** Short one-line recap used on step 2 / 3. */
  recapLine: string;
  /** Numeric total for the checkout (0 = free). */
  total: number;
};

export type CalDay = {
  day: number;
  iso?: string;
  /** Cell state. `slots` = bookable, others are non-interactive. */
  state: "slots" | "blank" | "blocked" | "other";
  today?: boolean;
  tip?: string;
};

export type ScheduleContent = {
  creator: PublicCreator;
  sessionTypes: SessionType[];
  month: string;
  dow: string[];
  calendar: CalDay[];
  monthStrip: { iso: string; dow: string; num: number; state: "slots" | "blocked" }[];
  timezones: string[];
  slots: { time: string; available: boolean }[];
  footerSocials: PublicSocial[];
};

export function scheduleContentFixture(): ScheduleContent {
  const slots = (...times: string[]) =>
    times.map((t) => ({ time: t, available: t !== "12:00" && t !== "13:00" }));

  // Build the May 2026 grid (Mon-first) matching the mockup exactly.
  const cal: CalDay[] = [
    { day: 27, state: "other" }, { day: 28, state: "other" }, { day: 29, state: "other" }, { day: 30, state: "other" },
    { day: 1, state: "blocked", tip: "Holiday" }, { day: 2, state: "blank" }, { day: 3, state: "blank" },
    { day: 4, state: "slots", iso: "2026-05-04" }, { day: 5, state: "slots", iso: "2026-05-05" }, { day: 6, state: "slots", iso: "2026-05-06" }, { day: 7, state: "slots", iso: "2026-05-07" }, { day: 8, state: "slots", iso: "2026-05-08" }, { day: 9, state: "blank" }, { day: 10, state: "blank" },
    { day: 11, state: "blocked", tip: "Vacation" }, { day: 12, state: "blocked", tip: "Vacation" }, { day: 13, state: "blocked", tip: "Vacation" }, { day: 14, state: "blocked", tip: "Vacation" }, { day: 15, state: "blocked", tip: "Vacation" }, { day: 16, state: "blocked", tip: "Vacation" }, { day: 17, state: "blocked", tip: "Vacation" },
    { day: 18, state: "blocked" }, { day: 19, state: "slots", iso: "2026-05-19", today: true }, { day: 20, state: "slots", iso: "2026-05-20" }, { day: 21, state: "slots", iso: "2026-05-21" }, { day: 22, state: "slots", iso: "2026-05-22" }, { day: 23, state: "blank" }, { day: 24, state: "blank" },
    { day: 25, state: "slots", iso: "2026-05-25" }, { day: 26, state: "slots", iso: "2026-05-26" }, { day: 27, state: "slots", iso: "2026-05-27" }, { day: 28, state: "slots", iso: "2026-05-28" }, { day: 29, state: "slots", iso: "2026-05-29" }, { day: 30, state: "blank" }, { day: 31, state: "blank" },
  ];

  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    sessionTypes: [
      {
        slug: "intro", cover: "emerald", emoji: "☕", duration: "30 min", price: "Free", priceKind: "free",
        badge: "⭐ Most-booked", title: "30-min intro call",
        desc: "A relaxed first chat to see if we click. Tell me about your training, goals, and what you'd want from coaching. No prep needed — bring questions if you have any.",
        recapLine: "30 minutes · Free · A relaxed first chat · No prep needed", total: 0,
      },
      {
        slug: "coaching", cover: "warm", emoji: "💪", duration: "60 min", price: "$80", priceKind: "paid",
        badge: "Free cancel up to 24h", title: "60-min coaching session",
        desc: "A focused 60-minute session. Bring your current programme; we'll review form, fix sticking points, and plan the next 4 weeks. Held over Google Meet.",
        recapLine: "60 minutes · $80 · Held over Google Meet · Free cancel up to 24h", total: 80,
      },
      {
        slug: "checkin", cover: "indigo", emoji: "📋", duration: "45 min", price: "$45", priceKind: "paid",
        badge: "For existing clients", title: "Programme check-in",
        desc: "A mid-cycle review for clients on a 12-week programme. We look at your logs, talk recovery, adjust the next block. Bring a recent video if you've got one.",
        recapLine: "45 minutes · $45 · For existing clients · Bring a recent video", total: 45,
      },
      {
        slug: "workshop", cover: "rose", emoji: "👯", duration: "90 min · 8 spots", price: "$25/seat", priceKind: "paid",
        badge: "Group session", title: "Group strength workshop",
        desc: "A small-group workshop for 8 lifters at a time. We cover squat / bench / deadlift technique, then everyone runs through their working sets with feedback. Held monthly.",
        recapLine: "90 minutes · $25/seat · 8 spots · Held monthly", total: 25,
      },
    ],
    month: "May 2026",
    dow: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    calendar: cal,
    monthStrip: [
      { iso: "2026-05-04", dow: "Mon", num: 4, state: "slots" },
      { iso: "2026-05-05", dow: "Tue", num: 5, state: "slots" },
      { iso: "2026-05-06", dow: "Wed", num: 6, state: "slots" },
      { iso: "2026-05-07", dow: "Thu", num: 7, state: "slots" },
      { iso: "2026-05-08", dow: "Fri", num: 8, state: "slots" },
      { iso: "2026-05-11", dow: "Mon", num: 11, state: "blocked" },
      { iso: "2026-05-12", dow: "Tue", num: 12, state: "blocked" },
      { iso: "2026-05-19", dow: "Tue", num: 19, state: "slots" },
      { iso: "2026-05-20", dow: "Wed", num: 20, state: "slots" },
      { iso: "2026-05-21", dow: "Thu", num: 21, state: "slots" },
      { iso: "2026-05-22", dow: "Fri", num: 22, state: "slots" },
    ],
    timezones: ["Europe/Warsaw (auto)", "Europe/London", "America/New_York", "America/Los_Angeles"],
    slots: slots("09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"),
    footerSocials: [
      { label: "Instagram", glyph: "📷" },
      { label: "TikTok", glyph: "🎵" },
      { label: "YouTube", glyph: "▶" },
      { label: "Email", glyph: "✉" },
    ],
  };
}
