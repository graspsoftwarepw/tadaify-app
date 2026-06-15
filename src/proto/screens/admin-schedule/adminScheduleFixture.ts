/**
 * Typed mock seam for the Administration → Schedule (bookings) view. Mirrors
 * the data shown in mockups/tadaify-mvp/app-admin-schedule.html so the screen
 * graduates by swapping these factories for the real loaders.
 *
 * @implements fr-admin-schedule
 */

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "noshow";

/** A stat card in the top summary row. */
export type ScheduleStat = {
  id: string;
  label: string;
  /** Optional inline tier badge (e.g. "Pro") rendered after the label. */
  tier?: string;
  value: string;
  sub: string;
};

/** A booking row in the Today / Upcoming lists. */
export type Booking = {
  id: string;
  /** Big time token (e.g. "10:00" or "Apr"). */
  timeTop: string;
  /** Small caption under the token (e.g. "AM" or "28 · 11:00"). */
  timeBottom: string;
  attendee: string;
  status: BookingStatus;
  statusLabel: string;
  /** One-line meta describing type / price. */
  info: string;
  /** Primary inline action: "details" opens the modal, "confirm" is a CTA. */
  primaryAction: "details" | "confirm";
  /** Secondary icon button before the overflow menu: none or a reschedule clock. */
  secondaryAction?: "reschedule";
};

/** A single calendar month cell. */
export type CalendarCell = {
  day: number;
  /** Belongs to the previous/next month (dimmed). */
  other?: boolean;
  /** Highlighted as today. */
  today?: boolean;
  events: { label: string; tone?: "warm" | "success" }[];
};

export type CalendarView = "day" | "week" | "month";

/** The booking-detail modal content (a single, representative booking). */
export type BookingDetail = {
  attendee: string;
  status: BookingStatus;
  statusLabel: string;
  rows: { label: string; value: string }[];
};

export type AdminScheduleFixture = {
  handle: string;
  pageSlug: string;
  stats: ScheduleStat[];
  todayLabel: string;
  todayTimezone: string;
  today: Booking[];
  upcomingLabel: string;
  upcomingCount: string;
  upcoming: Booking[];
  monthLabel: string;
  view: CalendarView;
  dayNames: string[];
  calendar: CalendarCell[];
  detail: BookingDetail;
};

export const adminScheduleFixture = (): AdminScheduleFixture => ({
  handle: "alexandra",
  pageSlug: "schedule",
  stats: [
    { id: "today", label: "Today", value: "3", sub: "bookings · 2 confirmed, 1 pending" },
    { id: "week", label: "This week", value: "11", sub: "$1,320 expected revenue" },
    { id: "noshow", label: "No-show rate", tier: "Pro", value: "2.4%", sub: "last 90 days · 3 of 124 sessions" },
  ],
  todayLabel: "Today — Mon, Apr 27",
  todayTimezone: "All times in PT",
  today: [
    {
      id: "bk-1",
      timeTop: "10:00",
      timeBottom: "AM",
      attendee: "Maya Rodriguez",
      status: "confirmed",
      statusLabel: "● Confirmed",
      info: "1h portfolio review · $120 paid",
      primaryAction: "details",
    },
    {
      id: "bk-2",
      timeTop: "2:30",
      timeBottom: "PM",
      attendee: "Jonas Kemppi",
      status: "pending",
      statusLabel: "⏱ Pending confirm",
      info: "30m intro chat · Free",
      primaryAction: "confirm",
    },
    {
      id: "bk-3",
      timeTop: "4:00",
      timeBottom: "PM",
      attendee: "Sara Lin (returning)",
      status: "confirmed",
      statusLabel: "● Confirmed",
      info: "1h coaching · $120 paid · 4th session",
      primaryAction: "details",
    },
  ],
  upcomingLabel: "Upcoming — next 14 days",
  upcomingCount: "8 sessions",
  upcoming: [
    {
      id: "up-1",
      timeTop: "Apr",
      timeBottom: "28 · 11:00",
      attendee: "David Chen",
      status: "confirmed",
      statusLabel: "● Confirmed",
      info: "1h portfolio review · $120",
      primaryAction: "details",
      secondaryAction: "reschedule",
    },
    {
      id: "up-2",
      timeTop: "May",
      timeBottom: "2 · 09:00",
      attendee: "Priya Sharma",
      status: "pending",
      statusLabel: "⏱ Pending confirm",
      info: "30m intro · Free",
      primaryAction: "confirm",
    },
  ],
  monthLabel: "April 2026",
  view: "month",
  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  calendar: [
    // Week 1
    { day: 29, other: true, events: [] },
    { day: 30, other: true, events: [] },
    { day: 31, other: true, events: [] },
    { day: 1, events: [] },
    { day: 2, events: [{ label: "9:00 P. Sharma" }] },
    { day: 3, events: [] },
    { day: 4, events: [] },
    // Week 2
    { day: 5, events: [] },
    { day: 6, events: [{ label: "11:00 D. Chen" }] },
    { day: 7, events: [] },
    { day: 8, events: [{ label: "10:30 Coaching", tone: "success" }] },
    { day: 9, events: [] },
    { day: 10, events: [] },
    { day: 11, events: [] },
    // Week 3
    { day: 12, events: [{ label: "3:00 J. Smith" }] },
    { day: 13, events: [] },
    { day: 14, events: [] },
    { day: 15, events: [{ label: "⏱ Pending", tone: "warm" }] },
    { day: 16, events: [] },
    { day: 17, events: [] },
    { day: 18, events: [] },
    // Week 4
    { day: 19, events: [] },
    { day: 20, events: [{ label: "2:00 R. Patel" }] },
    { day: 21, events: [] },
    { day: 22, events: [] },
    { day: 23, events: [{ label: "11:00 Coaching", tone: "success" }] },
    { day: 24, events: [] },
    { day: 25, events: [] },
    // Week 5
    { day: 26, events: [] },
    {
      day: 27,
      today: true,
      events: [
        { label: "10:00 M. Rodriguez" },
        { label: "2:30 J. Kemppi", tone: "warm" },
        { label: "4:00 S. Lin", tone: "success" },
      ],
    },
    { day: 28, events: [{ label: "11:00 D. Chen" }] },
    { day: 29, events: [] },
    { day: 30, events: [] },
    { day: 1, other: true, events: [] },
    { day: 2, other: true, events: [] },
  ],
  detail: {
    attendee: "Maya Rodriguez",
    status: "confirmed",
    statusLabel: "● Confirmed",
    rows: [
      { label: "When", value: "Today, Apr 27 · 10:00–11:00 AM PT" },
      { label: "Type", value: "1h portfolio review" },
      { label: "Price", value: "$120 paid via Stripe (transaction pi_3QXYz…)" },
      { label: "Email", value: "maya.r@example.com" },
      { label: "Phone", value: "+1 415 555 0192" },
      {
        label: "Notes",
        value:
          "\"Hi! I'm working on my freelance illustration site, would love feedback on portfolio structure + pricing page. Thanks!\"",
      },
      { label: "Meeting link", value: "https://meet.google.com/xyz-abcd-efg (auto-generated)" },
      { label: "Reminder", value: "Sent 24h before · also 1h before" },
    ],
  },
});
