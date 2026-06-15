/**
 * Typed mock seam for the Schedule (booking) page editor. Mirrors the data
 * shown in mockups/tadaify-mvp/app-page-schedule.html so the screen graduates
 * by swapping this factory for the real loader.
 *
 * @implements fr-page-editor-schedule
 */
export type ScheduleProvider = "google" | "apple" | "outlook" | "manual";

export type BookingTypeStatus = "active" | "paused";

export type BookingType = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  status: BookingTypeStatus;
  price?: string;
  meta: string[];
  locked?: string;
  tag?: string;
};

export type HoursRow = { day: string; on: boolean; from: string; to: string };

export type MonthCell = { day: number; state?: "busy" | "block" | "empty" | "out"; today?: boolean };

export type ScheduleFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  seo: { title: string; description: string };
  providers: { id: ScheduleProvider; mark: string; markClass: string; name: string; pill?: string; pillClass?: string; sub: string }[];
  selectedProvider: ScheduleProvider;
  buffer: string;
  window: string;
  timezone: string;
  hours: HoursRow[];
  counts: { all: number; active: number; paused: number };
  freePlan: { used: number; cap: number };
  bookingTypes: BookingType[];
  recurringRules: { id: string; name: string; sub: string; on: boolean }[];
  blackouts: { id: string; name: string; sub: string }[];
  monthLabel: string;
  monthCells: MonthCell[];
  pushTools: { id: string; icon: string; name: string; on: boolean }[];
  payments: { connected: boolean; payoutEmail: string; currency: string };
  formFields: { id: string; name: string; type: string; required: boolean; locked?: boolean }[];
};

export const scheduleEditorFixture = (): ScheduleFixture => ({
  pageTitle: "Book a session",
  slug: "book",
  live: true,
  backgrounds: [
    { name: "Inherit theme", css: "var(--bg)" },
    { name: "White", css: "#FFFFFF" },
    { name: "Warm cream", css: "#F8F4EE" },
    { name: "Slate", css: "#1F2937" },
    { name: "Sunrise", css: "linear-gradient(135deg,#FDE68A,#F59E0B)" },
    { name: "Indigo", css: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
  ],
  selectedBackground: 0,
  seo: {
    title: "Book a session with Alexandra Silva — strength coaching",
    description:
      "Personal coaching for women lifting heavy. 30-min intros are free; 60-min programmes start at $80. Book a slot below — calendar invite arrives in 30 seconds.",
  },
  providers: [
    { id: "google", mark: "G", markClass: "g", name: "Google Calendar", pill: "post-MVP", pillClass: "postmvp", sub: "Sync availability + write bookings to your Google Calendar via OAuth." },
    { id: "apple", mark: "", markClass: "a", name: "Apple Calendar", pill: "post-MVP", pillClass: "postmvp", sub: "Sync via your Apple ID. Works with iCloud Calendar on macOS + iOS." },
    { id: "outlook", mark: "O", markClass: "o", name: "Outlook / Microsoft 365", pill: "post-MVP", pillClass: "postmvp", sub: "Sync with Outlook.com or your Microsoft 365 work calendar via OAuth." },
    { id: "manual", mark: "📅", markClass: "m", name: "Manual / Tadaify-only", pill: "Recommended for MVP", pillClass: "recommended", sub: "tadaify keeps your availability. Booked slots show as busy here; nothing syncs out." },
  ],
  selectedProvider: "manual",
  buffer: "15 min",
  window: "30 days ahead",
  timezone: "Europe/Warsaw — auto",
  hours: [
    { day: "Monday", on: true, from: "09:00", to: "17:00" },
    { day: "Tuesday", on: true, from: "09:00", to: "17:00" },
    { day: "Wednesday", on: true, from: "09:00", to: "17:00" },
    { day: "Thursday", on: true, from: "09:00", to: "17:00" },
    { day: "Friday", on: true, from: "09:00", to: "15:00" },
    { day: "Saturday", on: false, from: "10:00", to: "14:00" },
    { day: "Sunday", on: false, from: "10:00", to: "14:00" },
  ],
  counts: { all: 4, active: 3, paused: 1 },
  freePlan: { used: 2, cap: 2 },
  bookingTypes: [
    { id: "bt-intro", title: "30-min intro call", emoji: "☕", tint: "emerald", status: "active", meta: ["30 min", "Free", "Most-booked"], tag: "video call" },
    { id: "bt-coaching", title: "60-min coaching session", emoji: "💪", tint: "warm", status: "active", price: "$80", meta: ["60 min", "Paid via Stripe", "Free cancel up to 24h"], tag: "video call" },
    { id: "bt-checkin", title: "Programme check-in (existing clients)", emoji: "📋", tint: "indigo", status: "active", price: "$45", meta: ["45 min", "Paid via Stripe", "Hidden — direct link only"], tag: "video call" },
    { id: "bt-workshop", title: "Group strength workshop (max 8)", emoji: "👯", tint: "rose", status: "paused", price: "$25/seat", meta: ["90 min · 8 attendees"], locked: "🔒 Group bookings — Business plan" },
  ],
  recurringRules: [
    { id: "rr-tue", name: "No bookings before 10:00 on Tuesdays", sub: "Auto-applied on every recurring Tuesday. Visitors won't see 09:00–10:00 slots.", on: true },
    { id: "rr-lunch", name: "Lunch break 12:30–13:30 every weekday", sub: "Blocks the slot across Mon–Fri.", on: true },
  ],
  blackouts: [
    { id: "bo-may1", name: "May 1 — National holiday", sub: "Full day blocked." },
    { id: "bo-sicily", name: "May 12–18 — Vacation in Sicily 🏖", sub: "Full week blocked." },
  ],
  monthLabel: "May 2026 — at a glance",
  monthCells: [
    { day: 27, state: "out" }, { day: 28, state: "out" }, { day: 29, state: "out" }, { day: 30, state: "out" }, { day: 1, state: "block" }, { day: 2, state: "empty" }, { day: 3, state: "empty" },
    { day: 4, state: "busy" }, { day: 5, state: "busy" }, { day: 6 }, { day: 7, state: "busy" }, { day: 8 }, { day: 9, state: "empty" }, { day: 10, state: "empty" },
    { day: 11, state: "block" }, { day: 12, state: "block" }, { day: 13, state: "block" }, { day: 14, state: "block" }, { day: 15, state: "block" }, { day: 16, state: "block" }, { day: 17, state: "block" },
    { day: 18, state: "block" }, { day: 19, state: "busy", today: true }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23, state: "empty" }, { day: 24, state: "empty" },
    { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30, state: "empty" }, { day: 31, state: "empty" },
  ],
  pushTools: [
    { id: "slack", icon: "💬", name: "Slack", on: true },
    { id: "discord", icon: "🎮", name: "Discord", on: false },
    { id: "notion", icon: "📓", name: "Notion", on: false },
    { id: "webhook", icon: "🔗", name: "Custom webhook", on: false },
  ],
  payments: { connected: true, payoutEmail: "alex@strongnotskinny.coach", currency: "USD" },
  formFields: [
    { id: "ff-name", name: "Name", type: "text", required: true, locked: true },
    { id: "ff-email", name: "Email", type: "email", required: true, locked: true },
    { id: "ff-topic", name: "Topic — what would you like to focus on?", type: "long text", required: true },
    { id: "ff-phone", name: "Phone (optional)", type: "phone", required: false },
  ],
});
