/**
 * Typed mock seam for the creator Insights screen. Mirrors the data shown in
 * mockups/tadaify-mvp/app-insights.html (Pro-tier static view) so the screen
 * graduates by swapping these factories for the real D1-rollup loader.
 *
 * Internal decision-log references from the mockup are intentionally dropped —
 * only user-facing copy is reproduced here.
 *
 * @implements fr-insights
 */

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export type Kpi = {
  id: string;
  label: string;
  /** Tooltip body shown behind the "i" info icon. */
  tip: string;
  value: string;
  /** Optional unit rendered smaller after the value (e.g. "%"). */
  suffix?: string;
  delta: string;
  deltaDir: "up" | "down" | "flat";
  /** Previous-period comparison line. */
  foot: string;
  /** Normalised 0..1 spark points (oldest → newest). */
  spark: number[];
  /** Spark stroke colour token. */
  color: string;
  /** Optional area-fill under the spark. */
  fill?: boolean;
};

export type SeriesPoint = {
  label: string;
  pageviews: number;
  clicks: number;
  /** Previous-period pageviews for the compare overlay. */
  prevPageviews: number;
  /** Optional annotation pinned to this point. */
  annotation?: string;
};

export type TrafficSource = {
  id: string;
  name: string;
  /** Optional sub-note (e.g. "no referrer"). */
  note?: string;
  icon: string;
  /** Inline colour for the icon glyph. */
  iconColor: string;
  /** Background tint for the icon chip. */
  iconBg: string;
  pct: number;
  visits: number;
  /** Drill-down panel header line. */
  detailTitle: string;
  detailMeta: string;
  topBlocks: { icon: string; label: string; clicks: number }[];
};

export type TopBlock = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  page: string;
  clicks: number;
  ctr: string;
  /** Highlight strong CTR rows. */
  ctrStrong?: boolean;
  /** Normalised 0..1 spark points. */
  spark: number[];
  sparkColor: string;
};

export type BarItem = { label: string; pct: number; muted?: boolean; mono?: boolean; warm?: boolean };

export type CrosstabRow = {
  header: string;
  cells: { value: number; share: string; intensity: number }[];
};

export const insightsHeader = () => ({
  pageName: "Home",
  subtitle:
    "What worked, what didn't, and where your visitors came from — for the page you're viewing.",
  pageSlug: "tadaify.com/alexandra",
  updatedText: "Live · refreshed 23s ago",
  /** Pro tier: 100 req/h cap on the analytics API. */
  api: { used: 47, cap: 100 },
  /** Cross-page combined view is not built yet (single-handle scope). */
  pages: [
    { id: "home", label: "Home", meta: "tadaify.com/alexandra", current: true },
  ],
  ranges: [
    { id: "7d" as TimeRange, label: "7d" },
    { id: "30d" as TimeRange, label: "30d" },
    { id: "90d" as TimeRange, label: "90d" },
    { id: "1y" as TimeRange, label: "1y" },
  ],
});

export const insightsKpis = (): Kpi[] => [
  {
    id: "pageviews",
    label: "Pageviews",
    tip: "Total times your page was loaded in this period. One visitor reloading the page counts as multiple pageviews.",
    value: "2,007",
    delta: "▲ 12.4%",
    deltaDir: "up",
    foot: "vs 1,786 previous 7 days",
    spark: [0.2, 0.32, 0.38, 0.5, 0.45, 0.62, 0.72, 0.55, 0.78, 0.7, 0.92],
    color: "var(--brand-primary)",
    fill: true,
  },
  {
    id: "uniques",
    label: "Unique visitors today",
    tip: "This is an approximate count. We don't track you across visits — no cookies, no fingerprinting. We use a privacy-first method that counts unique visitors per day. Trade-off: if the same person visits Monday and Tuesday, we count them as 2 visitors (not 1). Why we do this: cookie banners annoy your visitors and hurt your conversion. We chose a slightly fuzzy number over an annoying experience for your audience.",
    value: "412",
    delta: "▲ 8.1%",
    deltaDir: "up",
    foot: "vs 381 previous 7 days",
    spark: [0.18, 0.28, 0.34, 0.42, 0.55, 0.45, 0.66, 0.78, 0.7, 0.86, 0.74],
    color: "var(--brand-secondary)",
    fill: true,
  },
  {
    id: "clicks",
    label: "Total clicks",
    tip: "Every block interaction — outbound link clicks, Stripe checkouts, social-icon taps, accordion expands. Counted at every tier.",
    value: "847",
    delta: "▲ 19.2%",
    deltaDir: "up",
    foot: "vs 711 previous 7 days",
    spark: [0.22, 0.28, 0.46, 0.58, 0.64, 0.74, 0.58, 0.86, 0.7, 0.92, 0.82],
    color: "var(--brand-warm)",
  },
  {
    id: "conversion",
    label: "Conversion rate",
    tip: "Clicks ÷ pageviews. Tells you how often a visit turned into at least one block click. 42% is strong — most link-in-bio pages run 15-25%.",
    value: "42",
    suffix: "%",
    delta: "▲ 3.2pp",
    deltaDir: "up",
    foot: "vs 38.8% previous 7 days",
    spark: [0.5, 0.55, 0.45, 0.6, 0.66, 0.72, 0.6, 0.78, 0.72, 0.86, 0.82],
    color: "var(--success)",
  },
];

export const insightsSeries = (): SeriesPoint[] => [
  { label: "Apr 20", pageviews: 218, clicks: 89, prevPageviews: 165 },
  { label: "Apr 21", pageviews: 245, clicks: 102, prevPageviews: 188 },
  { label: "Apr 22", pageviews: 488, clicks: 215, prevPageviews: 210, annotation: "🎵 TikTok went viral" },
  { label: "Apr 23", pageviews: 282, clicks: 124, prevPageviews: 196 },
  { label: "Apr 24", pageviews: 326, clicks: 138, prevPageviews: 232 },
  { label: "Apr 25", pageviews: 351, clicks: 152, prevPageviews: 208 },
  { label: "Apr 26", pageviews: 412, clicks: 174, prevPageviews: 240 },
];

export const trafficSources = (): TrafficSource[] => [
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    iconColor: "#FF0050",
    iconBg: "color-mix(in srgb, #FF0050 10%, transparent)",
    pct: 42,
    visits: 847,
    detailTitle: "Most clicked from TikTok",
    detailMeta: "847 visits → 392 clicks · 46.3% conversion",
    topBlocks: [
      { icon: "💳", label: "Stripe checkout — Ultimate Fitness Course", clicks: 186 },
      { icon: "🛍️", label: "TikTok Shop link", clicks: 89 },
      { icon: "📧", label: "Free PDF: 10 Morning Habits", clicks: 62 },
      { icon: "🎯", label: "1:1 Coaching Session", clicks: 31 },
      { icon: "🛒", label: "Peloton Bike+ (affiliate)", clicks: 14 },
      { icon: "🎙️", label: "My podcast: Strong Not Skinny", clicks: 10 },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    iconColor: "#E1306C",
    iconBg: "color-mix(in srgb, #E1306C 10%, transparent)",
    pct: 28,
    visits: 560,
    detailTitle: "Most clicked from Instagram",
    detailMeta: "560 visits → 192 clicks · 34.3% conversion",
    topBlocks: [
      { icon: "💳", label: "Stripe checkout — Ultimate Fitness Course", clicks: 54 },
      { icon: "📧", label: "Free PDF: 10 Morning Habits", clicks: 48 },
      { icon: "📸", label: "Latest on Instagram (embed)", clicks: 32 },
      { icon: "🛍️", label: "TikTok Shop link", clicks: 25 },
      { icon: "🎯", label: "1:1 Coaching Session", clicks: 20 },
      { icon: "🛒", label: "Affiliates (combined)", clicks: 13 },
    ],
  },
  {
    id: "direct",
    name: "Direct",
    note: "no referrer",
    icon: "🔗",
    iconColor: "var(--fg)",
    iconBg: "var(--bg-muted)",
    pct: 18,
    visits: 360,
    detailTitle: "Most clicked from Direct",
    detailMeta: "360 visits → 108 clicks · 30.0% conversion · likely in-app browsers",
    topBlocks: [
      { icon: "💳", label: "Stripe checkout — Ultimate Fitness Course", clicks: 48 },
      { icon: "📧", label: "Free PDF: 10 Morning Habits", clicks: 15 },
      { icon: "🎯", label: "1:1 Coaching Session", clicks: 14 },
      { icon: "📸", label: "Latest on Instagram (embed)", clicks: 13 },
      { icon: "🛍️", label: "TikTok Shop link", clicks: 12 },
      { icon: "🛒", label: "Affiliates (combined)", clicks: 6 },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    iconColor: "#FF0000",
    iconBg: "color-mix(in srgb, #FF0000 10%, transparent)",
    pct: 7,
    visits: 140,
    detailTitle: "Most clicked from YouTube",
    detailMeta: "140 visits → 55 clicks · 39.3% conversion",
    topBlocks: [
      { icon: "💳", label: "Stripe checkout — Ultimate Fitness Course", clicks: 20 },
      { icon: "📸", label: "Latest on Instagram (embed)", clicks: 17 },
      { icon: "🎯", label: "1:1 Coaching Session", clicks: 6 },
      { icon: "🛍️", label: "TikTok Shop link", clicks: 5 },
      { icon: "📧", label: "Free PDF: 10 Morning Habits", clicks: 4 },
      { icon: "🛒", label: "Affiliates (combined)", clicks: 3 },
    ],
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    iconColor: "var(--fg)",
    iconBg: "color-mix(in srgb, var(--fg) 6%, transparent)",
    pct: 5,
    visits: 100,
    detailTitle: "Most clicked from Twitter / X",
    detailMeta: "100 visits → 21 clicks · 21.0% conversion",
    topBlocks: [
      { icon: "💳", label: "Stripe checkout — Ultimate Fitness Course", clicks: 8 },
      { icon: "📸", label: "Latest on Instagram (embed)", clicks: 6 },
      { icon: "📧", label: "Free PDF: 10 Morning Habits", clicks: 4 },
      { icon: "🛒", label: "Affiliates (combined)", clicks: 3 },
      { icon: "🛍️", label: "TikTok Shop link", clicks: 0 },
      { icon: "🎯", label: "1:1 Coaching Session", clicks: 0 },
    ],
  },
];

export const sourcesMethod = () =>
  "We detect traffic source from the standard HTTP Referer header your visitor's browser sends — the same way every website has known where you came from since 1995. We never store the specific URL or use cookies. Some traffic appears as Direct when in-app browsers (TikTok, Instagram apps) strip referrer information. Add ?utm_source=tiktok to your shared links for 100% accurate attribution.";

export const topBlocks = (): TopBlock[] => [
  { id: "stripe", icon: "💳", iconBg: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", iconColor: "var(--brand-primary)", label: "Stripe checkout — Ultimate Fitness Course", page: "Home", clicks: 312, ctr: "15.5%", ctrStrong: true, spark: [0.1, 0.2, 0.7, 0.35, 0.45, 0.6, 0.82], sparkColor: "var(--brand-primary)" },
  { id: "shop", icon: "🛍️", iconBg: "color-mix(in srgb, var(--brand-warm) 10%, transparent)", iconColor: "var(--brand-warm-dark)", label: "TikTok Shop link", page: "Home", clicks: 198, ctr: "9.9%", ctrStrong: true, spark: [0.1, 0.25, 0.9, 0.2, 0.35, 0.5, 0.6], sparkColor: "var(--brand-warm)" },
  { id: "pdf", icon: "📧", iconBg: "color-mix(in srgb, var(--brand-secondary) 10%, transparent)", iconColor: "var(--brand-secondary)", label: "Free PDF: 10 Morning Habits of High-Energy Women", page: "Home", clicks: 128, ctr: "6.4%", spark: [0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 0.85], sparkColor: "var(--brand-secondary)" },
  { id: "coaching", icon: "🎯", iconBg: "color-mix(in srgb, var(--success) 10%, transparent)", iconColor: "var(--success)", label: "1:1 Coaching Session", page: "Home", clicks: 76, ctr: "3.8%", spark: [0.15, 0.2, 0.45, 0.35, 0.55, 0.5, 0.7], sparkColor: "var(--success)" },
  { id: "ig", icon: "📸", iconBg: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", iconColor: "var(--brand-primary)", label: "Latest on Instagram (embed)", page: "Home", clicks: 52, ctr: "2.6%", spark: [0.3, 0.3, 0.6, 0.45, 0.35, 0.6, 0.5], sparkColor: "var(--brand-primary)" },
  { id: "peloton", icon: "🛒", iconBg: "color-mix(in srgb, var(--brand-warm) 10%, transparent)", iconColor: "var(--brand-warm-dark)", label: "Peloton Bike+ (affiliate)", page: "Home", clicks: 38, ctr: "1.9%", spark: [0.1, 0.25, 0.3, 0.4, 0.5, 0.7, 0.6], sparkColor: "var(--brand-warm)" },
  { id: "gymshark", icon: "🛒", iconBg: "color-mix(in srgb, var(--brand-warm) 10%, transparent)", iconColor: "var(--brand-warm-dark)", label: "Gymshark — Alexandra's picks", page: "Home", clicks: 29, ctr: "1.5%", spark: [0.15, 0.2, 0.2, 0.4, 0.6, 0.5, 0.7], sparkColor: "var(--brand-warm)" },
  { id: "podcast", icon: "🎙️", iconBg: "var(--bg-muted)", iconColor: "var(--fg)", label: "My podcast: Strong Not Skinny", page: "Home", clicks: 14, ctr: "0.7%", spark: [0.15, 0.15, 0.2, 0.15, 0.35, 0.25, 0.45], sparkColor: "var(--fg-muted)" },
];

export const geoCountries = (): BarItem[] => [
  { label: "🇺🇸 United States", pct: 38 },
  { label: "🇵🇹 Portugal", pct: 18 },
  { label: "🇧🇷 Brazil", pct: 12 },
  { label: "🇬🇧 United Kingdom", pct: 9 },
  { label: "🇨🇦 Canada", pct: 7 },
  { label: "🌐 16 other", pct: 16, muted: true },
];

export const geoCities = (): BarItem[] => [
  { label: "Lisbon, PT", pct: 11 },
  { label: "New York, US", pct: 8 },
  { label: "São Paulo, BR", pct: 6 },
  { label: "London, UK", pct: 5 },
  { label: "Los Angeles, US", pct: 5 },
];

export const devices = (): BarItem[] => [
  { label: "📱 Mobile", pct: 78, warm: true },
  { label: "💻 Desktop", pct: 18, warm: true },
  { label: "📲 Tablet", pct: 4, warm: true },
];

export const browsers = () => ["Safari 54%", "Chrome 31%", "in-app TikTok 11%", "Other 4%"];

export const referrers = (): BarItem[] => [
  { label: "tiktok.com", pct: 42, mono: true },
  { label: "l.instagram.com", pct: 24, mono: true },
  { label: "(direct)", pct: 18, mono: true },
  { label: "youtube.com", pct: 7, mono: true },
  { label: "t.co", pct: 5, mono: true },
  { label: "11 others", pct: 4, mono: true, muted: true },
];

export const crosstab = () => ({
  rowDims: [
    { value: "source", label: "Source" },
    { value: "country", label: "Country" },
    { value: "device", label: "Device" },
    { value: "day", label: "Day of week" },
    { value: "hour", label: "Hour of day" },
    { value: "block", label: "Block" },
    { value: "referrer", label: "Referrer" },
  ],
  cols: ["💳 Stripe", "🛍️ TikTok Shop", "📧 Free PDF", "🎯 Coaching", "📸 IG embed", "🛒 Affiliates"],
  summary: "5 sources × 6 blocks",
  rows: [
    { header: "🎵 TikTok", cells: [
      { value: 186, share: "22.0%", intensity: 0.55 },
      { value: 89, share: "10.5%", intensity: 0.3 },
      { value: 62, share: "7.3%", intensity: 0.2 },
      { value: 31, share: "3.7%", intensity: 0.1 },
      { value: 4, share: "0.5%", intensity: 0 },
      { value: 24, share: "2.8%", intensity: 0.05 },
    ] },
    { header: "📸 Instagram", cells: [
      { value: 54, share: "6.4%", intensity: 0.2 },
      { value: 25, share: "3.0%", intensity: 0.1 },
      { value: 48, share: "5.7%", intensity: 0.18 },
      { value: 20, share: "2.4%", intensity: 0.08 },
      { value: 32, share: "3.8%", intensity: 0.12 },
      { value: 13, share: "1.5%", intensity: 0.05 },
    ] },
    { header: "🔗 Direct", cells: [
      { value: 48, share: "5.7%", intensity: 0.18 },
      { value: 12, share: "1.4%", intensity: 0.05 },
      { value: 15, share: "1.8%", intensity: 0.06 },
      { value: 14, share: "1.7%", intensity: 0.05 },
      { value: 13, share: "1.5%", intensity: 0.04 },
      { value: 6, share: "0.7%", intensity: 0 },
    ] },
    { header: "📺 YouTube", cells: [
      { value: 20, share: "2.4%", intensity: 0.05 },
      { value: 5, share: "0.6%", intensity: 0 },
      { value: 4, share: "0.5%", intensity: 0 },
      { value: 6, share: "0.7%", intensity: 0 },
      { value: 17, share: "2.0%", intensity: 0.06 },
      { value: 3, share: "0.4%", intensity: 0 },
    ] },
    { header: "𝕏 Twitter", cells: [
      { value: 8, share: "1.0%", intensity: 0.04 },
      { value: 0, share: "0.0%", intensity: 0 },
      { value: 4, share: "0.5%", intensity: 0 },
      { value: 0, share: "0.0%", intensity: 0 },
      { value: 6, share: "0.7%", intensity: 0 },
      { value: 3, share: "0.4%", intensity: 0 },
    ] },
  ] as CrosstabRow[],
});

export type PowerFeature = {
  id: string;
  icon: string;
  title: string;
  tier: "pro" | "business";
  locked: boolean;
  sub: string;
  cta: string;
  ctaMsg: string;
  /** Discriminated preview body the screen renders. */
  preview:
    | { kind: "chips"; chips: { label: string; dot?: string; dashed?: boolean }[] }
    | { kind: "ab"; rows: { tag: string; label: string; num: string; winner?: boolean }[] }
    | { kind: "kv"; rows: { key: string; values: string[] }[] }
    | { kind: "replay" }
    | { kind: "faux"; rows: { pic: string; name: string; num: string; mono?: boolean }[] };
};

export const powerFeatures = (): PowerFeature[] => [
  {
    id: "saved-views",
    icon: "📌",
    title: "Saved views",
    tier: "pro",
    locked: false,
    sub: 'Bookmark your favourite cross-tab combinations. Switch between "Tuesday post performance" and "USA mobile checkout" with one click.',
    cta: "Upgrade to Pro →",
    ctaMsg: "Available on Pro. The preview above is real — drop in any saved view as soon as you upgrade.",
    preview: { kind: "chips", chips: [
      { label: "Tuesday TikTok post", dot: "var(--brand-primary)" },
      { label: "US mobile checkout", dot: "var(--brand-warm)" },
      { label: "Coaching funnel", dot: "var(--brand-secondary)" },
      { label: "+ Save current view", dashed: true },
    ] },
  },
  {
    id: "ab",
    icon: "🧪",
    title: "A/B testing framework",
    tier: "business",
    locked: true,
    sub: "Test two variants of any block (label, image, CTA, target URL) at a 50/50 split. We pick the winner automatically when significance threshold is reached.",
    cta: "Upgrade to Business →",
    ctaMsg: "Available on Business. The preview above is the real auto-pick UI — your test runs as soon as you upgrade.",
    preview: { kind: "ab", rows: [
      { tag: "A", label: 'Stripe checkout — "Get the course $127"', num: "186" },
      { tag: "B", label: 'Stripe checkout — "Start training today"', num: "241" },
      { tag: "✓", label: "Variant B winning · 95% confidence", num: "+30%", winner: true },
    ] },
  },
  {
    id: "digest",
    icon: "📬",
    title: "Scheduled email digest",
    tier: "business",
    locked: true,
    sub: "Get this dashboard in your inbox every Monday morning — top blocks, traffic, week-over-week deltas. Send a copy to your manager too.",
    cta: "Upgrade to Business →",
    ctaMsg: "Available on Business. Set the recipients and schedule above — your first digest sends Monday after upgrade.",
    preview: { kind: "kv", rows: [
      { key: "Send to:", values: ["alexandra@example.com", "+ Add"] },
      { key: "When:", values: ["Monday 9:00 (Europe/Lisbon)"] },
      { key: "Include:", values: ["KPIs", "Top blocks", "Traffic sources"] },
    ] },
  },
  {
    id: "replay",
    icon: "⏯",
    title: "Replay traffic minute-by-minute",
    tier: "business",
    locked: true,
    sub: "Scrub back through any past hour second-by-second. See the exact moment your TikTok went viral. Capped at 60 min/day per creator.",
    cta: "Upgrade to Business →",
    ctaMsg: "Available on Business. The scrubber above is live — pick any past hour and replay second-by-second.",
    preview: { kind: "replay" },
  },
  {
    id: "identity",
    icon: "🪡",
    title: "Identity stitching",
    tier: "business",
    locked: true,
    sub: "Connect anonymous web visitors to your email subscribers when they click a tracked link from your newsletter. Still cookieless — uses a one-time signed token, never stored long-term.",
    cta: "Upgrade to Business →",
    ctaMsg: "Available on Business. The matched-visitor list above is what you'll see once your newsletter links are tracked.",
    preview: { kind: "faux", rows: [
      { pic: "📧", name: "jane@example.com → 4 visits, 2 purchases", num: "$254" },
      { pic: "📧", name: "mark@example.com → 7 visits, 1 coaching", num: "$49" },
      { pic: "📧", name: "amelia@example.com → 12 visits, 3 purchases", num: "$381" },
    ] },
  },
  {
    id: "parquet",
    icon: "📦",
    title: "Parquet R2 archive",
    tier: "business",
    locked: true,
    sub: "Monthly snapshot of every event, queryable from your own warehouse (DuckDB, BigQuery, Snowflake). D1 rollups stay forever; raw events archive monthly.",
    cta: "Upgrade to Business →",
    ctaMsg: "Available on Business. Your monthly snapshots will land here — downloadable Parquet, queryable from your warehouse.",
    preview: { kind: "faux", rows: [
      { pic: "📦", name: "2026-04.parquet · 1.2 MB", num: "Download", mono: true },
      { pic: "📦", name: "2026-03.parquet · 1.4 MB", num: "Download", mono: true },
      { pic: "📦", name: "2026-02.parquet · 1.0 MB", num: "Download", mono: true },
    ] },
  },
];
