/**
 * Typed mock seam for the platform-admin Overview section. Mirrors the data
 * shown in mockups/tadaify-mvp/admin-panel.html (#pane-overview) so the section
 * graduates by swapping these factories for the real D1 + Workers-Analytics
 * loaders.
 *
 * Internal decision-log references from the mockup are intentionally dropped —
 * only user-facing copy is reproduced here.
 *
 * @implements fr-admin-panel
 */

/** A KPI tile in the 7-tile header row. */
export type AdminKpi = {
  label: string;
  value: string;
  /** Optional unit rendered smaller after the value (e.g. "/mo", "%"). */
  suffix?: string;
  delta: string;
  deltaDir: "up" | "down" | "flat";
  foot: string;
};

/** The trailing system-status tile (special layout). */
export type AdminStatusTile = {
  icon: string;
  title: string;
  sub: string;
};

/** A point in an area/line chart series (mockup SVG coords are 800×180). */
export type ChartSeries = {
  /** Polyline points, oldest → newest, in the mockup's 800×180 viewBox. */
  points: { x: number; y: number }[];
  /** Y-axis tick labels, top → bottom. */
  yTicks: { y: number; label: string }[];
  /** X-axis tick labels along the baseline. */
  xTicks: { x: number; label: string }[];
  /** Highlighted point (latest or notable spike). */
  marker: { x: number; y: number; label: string };
};

/** Range segmented-control option. */
export type RangeTab = { range: string; label: string; active: boolean };

/** One paying-tier row in the tier-mix breakdown. */
export type TierRow = {
  label: string;
  count: number;
  /** Bar width percentage, 0–100. */
  pct: number;
  foot: string;
  color: string;
};

/** A quick-action launcher button. */
export type QuickAction = {
  /** Target section to navigate to. */
  section: "registration" | "maintenance" | "moderation" | "audit";
  /** Inline SVG path/children markup, faithful to the mockup. */
  iconPaths: { d?: string; cx?: number; cy?: number; r?: number; points?: string; x1?: number; y1?: number; x2?: number; y2?: number; tag: "path" | "circle" | "line" | "polyline" }[];
  title: string;
  sub: string;
  subColor: string;
  /** Read-only-gated control. */
  readOnly?: boolean;
};

/** A recent-event feed row. */
export type FeedRow = {
  /** Icon glyph + tone class. */
  icon: string;
  tone: "pos" | "info" | "warn" | "neg";
  /** Title with optional bold/chip segments — rendered by the component. */
  title: { text: string; bold?: boolean; chip?: { label: string; cls: string } }[];
  meta: string;
};

/** An open support-ticket row. */
export type SupportTicket = {
  subject: string;
  subjectBold: boolean;
  who: string;
  chip: string;
  chipCls: string;
};

export const overviewKpisFixture = (): AdminKpi[] => [
  { label: "Total creators", value: "847", delta: "▲ 23", deltaDir: "up", foot: "+23 last 7d" },
  { label: "Active subs", value: "312", delta: "▲ 4.1%", deltaDir: "up", foot: "36.8% paid ratio" },
  { label: "MRR", value: "$4,184", suffix: "/mo", delta: "▲ 8.2%", deltaDir: "up", foot: "$50.2k ARR run-rate" },
  { label: "Churn (30d)", value: "2.1", suffix: "%", delta: "▼ 0.4pp", deltaDir: "down", foot: "7 cancels last 30d" },
  { label: "Signups today", value: "14", delta: "▲ 6 vs avg", deltaDir: "up", foot: "8.2 daily 30d avg" },
  { label: "Support open", value: "5", delta: "2 SLA breach", deltaDir: "flat", foot: "oldest: 3d 4h" },
];

export const overviewStatusTileFixture = (): AdminStatusTile => ({
  icon: "✓",
  title: "All systems green",
  sub: "7/7 services healthy",
});

export const signupRangeTabsFixture = (): RangeTab[] => [
  { range: "30d", label: "30d", active: true },
  { range: "90d", label: "90d", active: false },
  { range: "1y", label: "1y", active: false },
];

export const mrrRangeTabsFixture = (): RangeTab[] => [
  { range: "12m", label: "12m", active: true },
  { range: "all", label: "All", active: false },
];

export const signupsSeriesFixture = (): ChartSeries => ({
  points: [
    { x: 60, y: 120 }, { x: 80, y: 118 }, { x: 100, y: 115 }, { x: 120, y: 112 },
    { x: 140, y: 108 }, { x: 160, y: 110 }, { x: 180, y: 105 }, { x: 200, y: 100 },
    { x: 220, y: 108 }, { x: 240, y: 98 }, { x: 260, y: 92 }, { x: 280, y: 40 },
    { x: 300, y: 68 }, { x: 320, y: 78 }, { x: 340, y: 85 }, { x: 360, y: 90 },
    { x: 380, y: 95 }, { x: 400, y: 92 }, { x: 420, y: 88 }, { x: 440, y: 90 },
    { x: 460, y: 86 }, { x: 480, y: 82 }, { x: 500, y: 84 }, { x: 520, y: 80 },
    { x: 540, y: 78 }, { x: 560, y: 75 }, { x: 580, y: 72 }, { x: 600, y: 70 },
    { x: 620, y: 68 }, { x: 640, y: 65 }, { x: 660, y: 60 },
  ],
  yTicks: [
    { y: 34, label: "30" },
    { y: 84, label: "15" },
    { y: 134, label: "0" },
  ],
  xTicks: [
    { x: 60, label: "Mar 27" },
    { x: 240, label: "Apr 5" },
    { x: 420, label: "Apr 12" },
    { x: 600, label: "Apr 19" },
    { x: 660, label: "Apr 26" },
  ],
  marker: { x: 280, y: 40, label: "PH launch · 47" },
});

export const mrrSeriesFixture = (): ChartSeries => ({
  points: [
    { x: 60, y: 148 }, { x: 120, y: 142 }, { x: 180, y: 136 }, { x: 240, y: 128 },
    { x: 300, y: 118 }, { x: 360, y: 108 }, { x: 420, y: 98 }, { x: 480, y: 86 },
    { x: 540, y: 76 }, { x: 600, y: 62 }, { x: 660, y: 52 }, { x: 720, y: 40 },
  ],
  yTicks: [
    { y: 34, label: "$5k" },
    { y: 84, label: "$2.5k" },
    { y: 134, label: "$0" },
  ],
  xTicks: [
    { x: 60, label: "May '25" },
    { x: 240, label: "Aug '25" },
    { x: 420, label: "Nov '25" },
    { x: 600, label: "Feb '26" },
    { x: 720, label: "Apr '26" },
  ],
  marker: { x: 720, y: 40, label: "$4,184" },
});

export const tierMixFixture = (): TierRow[] => [
  { label: "Creator · $7.99/mo", count: 184, pct: 59, foot: "59% · $1,470/mo", color: "#10B981" },
  { label: "Pro · $19.99/mo", count: 108, pct: 35, foot: "35% · $2,159/mo", color: "#F59E0B" },
  { label: "Business · $49.99/mo", count: 20, pct: 6, foot: "6% · $980/mo", color: "#6366F1" },
];

export const quickActionsFixture = (): QuickAction[] => [
  {
    section: "registration",
    iconPaths: [
      { tag: "path", d: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
      { tag: "circle", cx: 8.5, cy: 7, r: 4 },
      { tag: "line", x1: 20, y1: 8, x2: 20, y2: 14 },
      { tag: "line", x1: 23, y1: 11, x2: 17, y2: 11 },
    ],
    title: "View waitlist",
    sub: "247 in queue",
    subColor: "var(--fg-muted)",
  },
  {
    section: "maintenance",
    iconPaths: [
      { tag: "path", d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
    ],
    title: "Maintenance",
    sub: "Online",
    subColor: "var(--success)",
    readOnly: true,
  },
  {
    section: "moderation",
    iconPaths: [
      { tag: "path", d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" },
      { tag: "line", x1: 12, y1: 9, x2: 12, y2: 13 },
      { tag: "line", x1: 12, y1: 17, x2: 12.01, y2: 17 },
    ],
    title: "Moderation",
    sub: "3 reports",
    subColor: "var(--danger)",
  },
  {
    section: "audit",
    iconPaths: [
      { tag: "circle", cx: 12, cy: 12, r: 10 },
      { tag: "polyline", points: "12 6 12 12 16 14" },
    ],
    title: "Audit log",
    sub: "last 24h: 47",
    subColor: "var(--fg-muted)",
  },
];

export const recentEventsFixture = (): FeedRow[] => [
  {
    icon: "+",
    tone: "pos",
    title: [
      { text: "@maya_creates", bold: true },
      { text: " upgraded to " },
      { text: "Pro", chip: { label: "Pro", cls: "chip tier-pro" } },
    ],
    meta: "2m ago · +$19.99 MRR · Stripe sub_K3jX",
  },
  {
    icon: "i",
    tone: "info",
    title: [{ text: "14 users promoted from waitlist" }],
    meta: "12m ago · by founder@tadaify.com",
  },
  {
    icon: "!",
    tone: "warn",
    title: [
      { text: "Page " },
      { text: "tadaify.com/lukas_b", bold: true },
      { text: " reported for spam" },
    ],
    meta: "23m ago · auto-flagged · 4 reports total",
  },
  {
    icon: "$",
    tone: "pos",
    title: [{ text: "8 successful Stripe payments processed" }],
    meta: "42m ago · $94 collected",
  },
  {
    icon: "×",
    tone: "neg",
    title: [
      { text: "@dance_captain", bold: true },
      { text: " account suspended (ToS violation)" },
    ],
    meta: "1h 12m ago · by founder@tadaify.com",
  },
  {
    icon: "↗",
    tone: "info",
    title: [{ text: "CloudFlare Workers · 1.2M requests this hour" }],
    meta: "1h 28m ago · p95: 142ms · errors: 0.04%",
  },
  {
    icon: "+",
    tone: "pos",
    title: [{ text: "5 new signups" }],
    meta: "2h ago · 3 from organic, 2 from referral",
  },
];

export const supportTicketsFixture = (): SupportTicket[] => [
  { subject: "Domain SSL stuck pending", subjectBold: true, who: "@chris_h · 3d 4h ago", chip: "SLA breach", chipCls: "chip danger" },
  { subject: "Stripe webhook missing", subjectBold: true, who: "@nina_food · 2d 8h ago", chip: "SLA close", chipCls: "chip warn" },
  { subject: "Cannot delete account", subjectBold: false, who: "@yuki_p · 11h ago", chip: "Open", chipCls: "chip" },
  { subject: "Refund request", subjectBold: false, who: "@dev_lab · 6h ago", chip: "Open", chipCls: "chip" },
  { subject: "Custom domain not loading", subjectBold: false, who: "@sea_traveller · 2h ago", chip: "Open", chipCls: "chip" },
];

/** Page-head meta line. */
export const overviewHeadFixture = () => ({
  title: "Overview",
  sub: "tadaify operations · Saturday, April 26 2026 · 14:32 UTC",
});
