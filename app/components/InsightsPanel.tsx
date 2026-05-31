/**
 * InsightsPanel — main content area for the /app dashboard, ?tab=insights view.
 *
 * Visual contract: mockups/tadaify-mvp/app-insights.html (entire file).
 * Pass: insights mockup-fidelity. Every element from the mockup is mirrored
 * here with the mockup's exact class names, DOM structure, inline SVG icons,
 * and stub data values. Styling lives in `app/styles/app-dashboard.css`
 * (scoped under `.app-dashboard-root`), so this component must render inside
 * an ancestor that carries that class — see `app/routes/app.tsx`.
 *
 * Out of scope this pass (TODO):
 *   - Real wiring for KPIs, time-series, sources, blocks, geo/devices/
 *     referrers, cross-tab — every number is a stub copied verbatim from
 *     the mockup so the visual is identical.
 *   - Time-range / compare-to-previous / CSV export / API tile / page
 *     selector / source switcher / cities toggle are visual only.
 *
 * Tier-gating renders exactly what the mockup shows for `data-tier="pro"`
 * (which is the mockup's default body attribute). Power-feature locked-cards
 * use the same `data-min-tier` attribute so the tier switch logic from the
 * mockup can be re-applied later when real tier-aware behaviour ships.
 *
 * Story: F-APP-INSIGHTS-001 Phase A
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";

interface InsightsPanelProps {
  /** Creator handle shown in the page selector menu meta line. */
  handle: string;
  /** Creator tier — drives the `data-tier` attribute and conditional UI. */
  tier: string;
  /**
   * Real Insights summary from the D1 event store, or null when unavailable
   * (no binding / not the insights tab) — in which case the panel keeps its
   * placeholder mockup visuals. When present, KPI tiles show real numbers and
   * the fabricated delta/sparkline/“vs previous period” chrome is suppressed
   * (no fake margin — we don't yet compute a trend).
   */
  insights?: InsightsSummaryView | null;
}

/** Mirror of `~/lib/insights/queries` InsightsSummary (kept local to avoid a type cycle). */
export interface InsightsSummaryView {
  windowDays: number | null;
  pageviews: number;
  clicks: number;
  todayUniques: number;
  topBlocks: Array<{ blockId: string; clicks: number }>;
}

/** Thousands-separated integer, deterministic across SSR/CSR. */
function fmtInt(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString("en-US");
}

function windowLabel(windowDays: number | null): string {
  if (windowDays == null) return "all time";
  if (windowDays === 7) return "last 7 days";
  if (windowDays === 90) return "last 90 days";
  if (windowDays === 365) return "last 12 months";
  return `last ${windowDays} days`;
}

type Tier = "free" | "creator" | "pro" | "business";

const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
  business: "Business",
};

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

const TIME_RANGES: Record<Tier, ReadonlyArray<string>> = {
  free: ["7d"],
  creator: ["7d", "30d", "90d"],
  pro: ["7d", "30d", "90d", "1y"],
  business: ["7d", "30d", "90d", "1y", "all"],
};

const RANGE_LABEL: Record<string, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
  all: "All",
};

interface SourceDetail {
  icon: string;
  color: string;
  title: string;
  meta: string;
  rows: ReadonlyArray<readonly [string, string, number]>;
}

const SOURCE_DETAILS: Record<string, SourceDetail> = {
  tiktok: {
    icon: "🎵",
    color: "#FF0050",
    title: "Most clicked from TikTok",
    meta: "847 visits → 392 clicks · 46.3% conversion",
    rows: [
      ["💳", "Stripe checkout — Ultimate Fitness Course", 186],
      ["🛍️", "TikTok Shop link", 89],
      ["📧", "Free PDF: 10 Morning Habits", 62],
      ["🎯", "1:1 Coaching Session", 31],
      ["🛒", "Peloton Bike+ (affiliate)", 14],
      ["🎙️", "My podcast: Strong Not Skinny", 10],
    ],
  },
  instagram: {
    icon: "📸",
    color: "#E1306C",
    title: "Most clicked from Instagram",
    meta: "560 visits → 192 clicks · 34.3% conversion",
    rows: [
      ["💳", "Stripe checkout — Ultimate Fitness Course", 54],
      ["📧", "Free PDF: 10 Morning Habits", 48],
      ["📸", "Latest on Instagram (embed)", 32],
      ["🛍️", "TikTok Shop link", 25],
      ["🎯", "1:1 Coaching Session", 20],
      ["🛒", "Affiliates (combined)", 13],
    ],
  },
  direct: {
    icon: "🔗",
    color: "var(--fg)",
    title: "Most clicked from Direct",
    meta: "360 visits → 108 clicks · 30.0% conversion · likely in-app browsers",
    rows: [
      ["💳", "Stripe checkout — Ultimate Fitness Course", 48],
      ["📧", "Free PDF: 10 Morning Habits", 15],
      ["🎯", "1:1 Coaching Session", 14],
      ["📸", "Latest on Instagram (embed)", 13],
      ["🛍️", "TikTok Shop link", 12],
      ["🛒", "Affiliates (combined)", 6],
    ],
  },
  youtube: {
    icon: "📺",
    color: "#FF0000",
    title: "Most clicked from YouTube",
    meta: "140 visits → 55 clicks · 39.3% conversion",
    rows: [
      ["💳", "Stripe checkout — Ultimate Fitness Course", 20],
      ["📸", "Latest on Instagram (embed)", 17],
      ["🎯", "1:1 Coaching Session", 6],
      ["🛍️", "TikTok Shop link", 5],
      ["📧", "Free PDF: 10 Morning Habits", 4],
      ["🛒", "Affiliates (combined)", 3],
    ],
  },
  twitter: {
    icon: "𝕏",
    color: "var(--fg)",
    title: "Most clicked from Twitter / X",
    meta: "100 visits → 21 clicks · 21.0% conversion",
    rows: [
      ["💳", "Stripe checkout — Ultimate Fitness Course", 8],
      ["📸", "Latest on Instagram (embed)", 6],
      ["📧", "Free PDF: 10 Morning Habits", 4],
      ["🛒", "Affiliates (combined)", 3],
      ["🛍️", "TikTok Shop link", 0],
      ["🎯", "1:1 Coaching Session", 0],
    ],
  },
};

const SOURCE_ORDER: ReadonlyArray<{
  key: keyof typeof SOURCE_DETAILS;
  name: ReactNode;
  pct: number;
  count: number;
  iconBg: string;
  iconColor: string;
  icon: string;
}> = [
  {
    key: "tiktok",
    name: "TikTok",
    pct: 42,
    count: 847,
    iconBg: "rgba(255,0,80,0.10)",
    iconColor: "#FF0050",
    icon: "🎵",
  },
  {
    key: "instagram",
    name: "Instagram",
    pct: 28,
    count: 560,
    iconBg: "rgba(237,71,150,0.10)",
    iconColor: "#E1306C",
    icon: "📸",
  },
  {
    key: "direct",
    name: (
      <>
        Direct{" "}
        <span
          style={{
            fontSize: 10,
            color: "var(--fg-subtle)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginLeft: 4,
          }}
        >
          no referrer
        </span>
      </>
    ),
    pct: 18,
    count: 360,
    iconBg: "var(--bg-muted)",
    iconColor: "",
    icon: "🔗",
  },
  {
    key: "youtube",
    name: "YouTube",
    pct: 7,
    count: 140,
    iconBg: "rgba(255,0,0,0.10)",
    iconColor: "#FF0000",
    icon: "📺",
  },
  {
    key: "twitter",
    name: "Twitter / X",
    pct: 5,
    count: 100,
    iconBg: "rgba(0,0,0,0.06)",
    iconColor: "var(--fg)",
    icon: "𝕏",
  },
];

function normalizeTier(t: string): Tier {
  if (t === "free" || t === "creator" || t === "pro" || t === "business") return t;
  return "free";
}

export function InsightsPanel({ handle, tier, insights = null }: InsightsPanelProps) {
  const normTier = normalizeTier(tier);
  const tierLabel = TIER_LABEL[normTier];
  const ranges = TIME_RANGES[normTier];
  const canCompare = normTier === "pro" || normTier === "business";
  const apiIsActive = normTier === "pro" || normTier === "business";
  const apiCap = normTier === "business" ? "1,000" : "100";
  const showFreePill = normTier === "free";
  const pageQuota: Record<Tier, string> = {
    free: "1",
    creator: "5",
    pro: "20",
    business: "∞",
  };
  const updatedText =
    normTier === "free"
      ? "Last updated ~1 hour ago"
      : normTier === "creator"
        ? "Last updated 5 min ago"
        : "Live · refreshed 23s ago";
  const updatedStale = normTier === "free" || normTier === "creator";

  const csvLabel: Record<Tier, string | null> = {
    free: null,
    creator: "Export CSV (monthly)",
    pro: "Export CSV (daily)",
    business: "Export CSV + Parquet",
  };
  const csvText = csvLabel[normTier];

  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [activeRange, setActiveRange] = useState<string>("7d");
  const [compareOn, setCompareOn] = useState(false);
  const [activeSource, setActiveSource] = useState<keyof typeof SOURCE_DETAILS>("tiktok");
  const [showCities, setShowCities] = useState(false);

  const togglePageMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPageMenuOpen((v) => !v);
  }, []);

  const stub = useCallback((msg: string) => {
    // eslint-disable-next-line no-alert
    if (typeof window !== "undefined") window.alert(msg);
  }, []);

  const detail = SOURCE_DETAILS[activeSource];

  const lockedCard = useCallback(
    (minTier: Tier): { locked: boolean; unlocked: boolean } => {
      const unlocked = TIER_RANK[normTier] >= TIER_RANK[minTier];
      return { locked: !unlocked, unlocked };
    },
    [normTier],
  );

  // Saved views (Pro+), A/B (Business), digest (Business), replay (Business),
  // identity (Business), parquet (Business). Mockup defaults: card-saved-views
  // data-locked="false" for pro; rest data-locked="true".
  const savedViews = lockedCard("pro");
  const ab = lockedCard("business");
  const digest = lockedCard("business");
  const replay = lockedCard("business");
  const identity = lockedCard("business");
  const parquet = lockedCard("business");

  const headSubtitle =
    "What worked, what didn't, and where your visitors came from — for the page you're viewing.";

  const ranges7d = useMemo(() => ranges, [ranges]);

  return (
    <section className="main-insights" data-tier={normTier}>
      {/* ============================================================
           PAGE HEADER — title + page selector + tier-aware controls + API tile
           ============================================================ */}
      <div className="page-head">
        <div className="page-head-row">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1>
              Insights <span className="crumb-sep">·</span>{" "}
              <span className="crumb-page" id="current-page-name">
                Home
              </span>
            </h1>
            <div className="sub" id="head-subtitle">
              {headSubtitle}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              {/* Page selector dropdown */}
              <div className="page-selector">
                <button
                  type="button"
                  className="page-selector-trigger"
                  onClick={togglePageMenu}
                  aria-haspopup="true"
                  aria-expanded={pageMenuOpen}
                  id="page-selector-trigger"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span id="page-selector-label">Home</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className={`page-selector-menu${pageMenuOpen ? " open" : ""}`}
                  id="page-selector-menu"
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="page-menu-hint">
                    Your pages (1 of <span id="page-quota">{pageQuota[normTier]}</span>)
                  </div>
                  <button type="button" className="page-menu-item active" role="menuitem">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Home</span>
                    <span className="meta">tadaify.com/{handle}</span>
                  </button>
                  <div className="page-menu-divider" />
                  <div className="page-menu-hint">All pages</div>
                  <button
                    type="button"
                    className="page-menu-item is-disabled"
                    role="menuitem"
                    aria-disabled="true"
                    title="Cross-page Insights view — coming with multi-page support"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>All pages combined</span>
                    <span className="meta">soon</span>
                  </button>
                  <div className="page-menu-divider" />
                  <button
                    type="button"
                    className="page-menu-item is-disabled"
                    role="menuitem"
                    aria-disabled="true"
                    title="Multi-page coming Q+1 — DEC-MULTIPAGE-01"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add a new page</span>
                    <span className="meta">soon</span>
                  </button>
                </div>
              </div>

              {/* Last updated chip — tier-aware */}
              <div
                className={`updated-chip${updatedStale ? " stale" : ""}`}
                id="updated-chip"
              >
                <span className="live-dot" />
                <span id="updated-text">{updatedText}</span>
              </div>

              {/* Free pill (Free tier only) */}
              {showFreePill && (
                <span
                  id="free-pill"
                  className="free-pill tooltip-wrap"
                  style={{ display: "inline-flex" }}
                >
                  🎁 Free tier — full dataset, hourly refresh
                  <span className="tooltip-popover tooltip-wide">
                    <strong>Tadaify Free includes all data dimensions</strong> — cross-tab,
                    geo, devices, referrers. Other platforms gate this behind paid tiers.
                    Upgrade to Creator/Pro for faster refresh, longer history, and live view.
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right cluster: time range + compare + API tile + CSV */}
          <div className="head-controls">
            {/* Time-range — tier-aware */}
            <div id="time-range-host">
              {normTier === "free" ? (
                <div className="time-range-static tooltip-wrap">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Last 7 days
                  <span className="tooltip-popover">
                    Free tier window is 7 days. Upgrade to Creator (90d), Pro (1 year),
                    or Business (all-time).
                  </span>
                </div>
              ) : (
                <div className="time-range" role="tablist" aria-label="Time range">
                  {ranges7d.map((r) => (
                    <button
                      type="button"
                      key={r}
                      data-range={r}
                      className={r === activeRange ? "active" : ""}
                      onClick={() => setActiveRange(r)}
                    >
                      {RANGE_LABEL[r] ?? r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compare-to-previous toggle — Pro+ only */}
            {canCompare && (
              <button
                type="button"
                id="compare-toggle"
                className={`compare-toggle${compareOn ? " on" : ""}`}
                onClick={() => setCompareOn((v) => !v)}
              >
                <span className="check" />
                <span>Compare to previous</span>
              </button>
            )}

            {/* CSV export — tier-aware */}
            {csvText && (
              <button
                type="button"
                className="btn btn-ghost csv-btn"
                id="csv-btn"
                onClick={() => stub("Mockup — would download CSV")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span id="csv-btn-text">{csvText}</span>
              </button>
            )}

            {/* API tile */}
            {apiIsActive ? (
              <a
                id="api-tile-active"
                href="./app-settings-apikeys.html"
                className="api-tile active tooltip-wrap"
                style={{ display: "inline-flex" }}
              >
                <span className="api-icon">🔌</span>
                <span className="api-text-long">
                  API · <span id="api-meta-used">47</span> / <span id="api-meta-cap">{apiCap}</span> req/h
                </span>
                <span className="api-text-short">🔌 47/{apiCap}</span>
                <span className="tooltip-popover tooltip-right">
                  <strong>API access — {tierLabel} tier</strong>
                  <br />
                  Build your own dashboards, Slack bots, iOS widgets. First creator
                  analytics API in link-in-bio.
                  <br />
                  <br />
                  <a href="./app-settings-apikeys.html">Manage API keys →</a>
                </span>
              </a>
            ) : (
              <button
                type="button"
                id="api-tile-locked"
                className="api-tile locked tooltip-wrap"
                onClick={() => stub("Mockup — would open upgrade flow")}
              >
                <span className="api-icon">🔌</span>
                <span className="api-text-long">API access — available on Pro</span>
                <span className="api-text-short">🔌 Pro</span>
                <span className="tooltip-popover tooltip-right">
                  <strong>First creator analytics API in link-in-bio</strong>
                  <br />
                  Build your own dashboards, Slack bots, iOS widgets — read your own
                  metrics, no scraping.
                  <br />
                  <br />
                  <a href="./pricing.html">Upgrade to Pro →</a>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
           HERO KPI ROW
           ============================================================ */}
      <div className="kpi-row" id="kpi-row">
        {/* Pageviews */}
        <div className="kpi-tile">
          <div className="kpi-label">
            Pageviews
            <span className="tooltip-wrap">
              <button className="info-icon" type="button" aria-label="What is pageviews?">
                i
              </button>
              <span className="tooltip-popover">
                Total times your page was loaded in this period. One visitor reloading
                the page counts as multiple pageviews.
              </span>
            </span>
          </div>
          <div className="kpi-num" data-testid="kpi-pageviews">
            {insights ? fmtInt(insights.pageviews) : "2,007"}{" "}
            <span className="kpi-suffix"></span>
          </div>
          {insights ? (
            <div className="kpi-foot">{windowLabel(insights.windowDays)}</div>
          ) : (
            <>
              <span className="kpi-delta up">▲ 12.4%</span>
              <svg
                className="kpi-spark"
                viewBox="0 0 200 36"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-grad-pv" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,28 L20,24 L40,22 L60,18 L80,20 L100,14 L120,11 L140,16 L160,9 L180,12 L200,5 L200,36 L0,36 Z"
                  fill="url(#spark-grad-pv)"
                />
                <path
                  d="M0,28 L20,24 L40,22 L60,18 L80,20 L100,14 L120,11 L140,16 L160,9 L180,12 L200,5"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="kpi-foot tier-pro">vs 1,786 previous 7 days</div>
            </>
          )}
        </div>

        {/* Unique visitors today */}
        <div className="kpi-tile">
          <div className="kpi-label" id="uv-label">
            <span id="uv-label-text">Unique visitors today</span>
            <span className="tooltip-wrap">
              <button
                className="info-icon"
                type="button"
                aria-label="About unique visitors"
              >
                i
              </button>
              {/* TR-INSIGHTS-001 verbatim copy — DO NOT EDIT */}
              <span className="tooltip-popover tooltip-wide">
                <strong>About this number</strong>
                <br />
                This is an approximate count. We don't track you across visits — no
                cookies, no fingerprinting. We use a privacy-first method that counts
                unique visitors per day.
                <br />
                <br />
                <strong>Trade-off:</strong> if the same person visits Monday and
                Tuesday, we count them as 2 visitors (not 1).
                <br />
                <br />
                <strong>Why we do this:</strong> cookie banners annoy your visitors and
                hurt your conversion. We chose a slightly fuzzy number over an annoying
                experience for your audience. Most creators tell us they'd rather have
                happy visitors than perfectly precise analytics.
                <br />
                <br />
                <a href="./landing.html#privacy">Learn more →</a>
              </span>
            </span>
          </div>
          <div className="kpi-num" data-testid="kpi-uniques-today">
            <span id="uv-num">{insights ? fmtInt(insights.todayUniques) : "412"}</span>
          </div>
          {insights ? (
            <div className="kpi-foot">today</div>
          ) : (
            <>
              <span className="kpi-delta up">▲ 8.1%</span>
              <svg
                className="kpi-spark"
                viewBox="0 0 200 36"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="spark-grad-uv" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,30 L20,26 L40,24 L60,21 L80,17 L100,20 L120,14 L140,10 L160,12 L180,8 L200,11 L200,36 L0,36 Z"
                  fill="url(#spark-grad-uv)"
                />
                <path
                  d="M0,30 L20,26 L40,24 L60,21 L80,17 L100,20 L120,14 L140,10 L160,12 L180,8 L200,11"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="kpi-foot tier-pro">vs 381 previous 7 days</div>
            </>
          )}
        </div>

        {/* Total clicks */}
        <div className="kpi-tile">
          <div className="kpi-label">
            Total clicks
            <span className="tooltip-wrap">
              <button
                className="info-icon"
                type="button"
                aria-label="What counts as a click?"
              >
                i
              </button>
              <span className="tooltip-popover">
                Every block interaction — outbound link clicks, Stripe checkouts,
                social-icon taps, accordion expands. Counted at every tier per{" "}
                <strong>DEC-077</strong>.
              </span>
            </span>
          </div>
          <div className="kpi-num" data-testid="kpi-clicks">
            {insights ? fmtInt(insights.clicks) : "847"}
          </div>
          {insights ? (
            <div className="kpi-foot">{windowLabel(insights.windowDays)}</div>
          ) : (
            <>
              <span className="kpi-delta up">▲ 19.2%</span>
              <svg
                className="kpi-spark"
                viewBox="0 0 200 36"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,30 L20,28 L40,22 L60,18 L80,16 L100,12 L120,18 L140,8 L160,14 L180,6 L200,10"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="kpi-foot tier-pro">vs 711 previous 7 days</div>
            </>
          )}
        </div>

        {/* Conversion rate */}
        <div className="kpi-tile">
          <div className="kpi-label">
            Conversion rate
            <span className="tooltip-wrap">
              <button
                className="info-icon"
                type="button"
                aria-label="How is CTR computed?"
              >
                i
              </button>
              <span className="tooltip-popover">
                Clicks ÷ pageviews. Tells you how often a visit turned into at least one
                block click. <strong>42% is strong</strong> — most link-in-bio pages run
                15-25%.
              </span>
            </span>
          </div>
          <div className="kpi-num">
            42<span className="kpi-suffix">%</span>
          </div>
          <span className="kpi-delta up">▲ 3.2pp</span>
          <svg
            className="kpi-spark"
            viewBox="0 0 200 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,22 L20,20 L40,24 L60,18 L80,16 L100,14 L120,18 L140,12 L160,14 L180,10 L200,11"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="kpi-foot tier-pro">vs 38.8% previous 7 days</div>
        </div>
      </div>

      {/* ============================================================
           TIME-SERIES CHART
           ============================================================ */}
      <section className="chart-shell">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Activity over time</h2>
            <p className="panel-sub">
              Pageviews and clicks for the last 7 days. Hover any day for exact numbers;
              the spike on Tuesday matched your TikTok going viral.
            </p>
          </div>
          <div className="chart-toggles" role="tablist" aria-label="Chart granularity">
            <button type="button" className="active" data-granularity="day">
              Daily
            </button>
            <button
              type="button"
              data-granularity="hour"
              id="hourly-toggle"
              onClick={() => stub("Mockup — would re-bucket data to hour-of-day")}
            >
              Hourly
            </button>
          </div>
        </div>

        <div
          className="chart-legend"
          style={{ marginTop: 6, marginBottom: 6 }}
        >
          <span className="chart-legend-item">
            <span className="chart-legend-dot" /> Pageviews
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-dot dot-clicks" /> Clicks
          </span>
          <span
            className="chart-legend-item compare-legend"
            style={{ display: compareOn ? "inline-flex" : "none" }}
          >
            <span className="chart-legend-dot dot-prev" /> Previous 7 days
          </span>
        </div>

        <div className="chart-canvas" id="chart-canvas">
          <svg
            viewBox="0 0 800 280"
            preserveAspectRatio="none"
            aria-label="7-day activity chart"
          >
            <defs>
              <linearGradient id="ts-area-pv" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y-grid lines */}
            <g stroke="rgba(156,163,175,0.18)" strokeDasharray="3 4" strokeWidth="1">
              <line x1="40" y1="40" x2="780" y2="40" />
              <line x1="40" y1="100" x2="780" y2="100" />
              <line x1="40" y1="160" x2="780" y2="160" />
              <line x1="40" y1="220" x2="780" y2="220" />
            </g>

            {/* Y-axis labels */}
            <g fontFamily="Inter" fontSize="10" fill="#9CA3AF">
              <text x="34" y="44" textAnchor="end">
                600
              </text>
              <text x="34" y="104" textAnchor="end">
                400
              </text>
              <text x="34" y="164" textAnchor="end">
                200
              </text>
              <text x="34" y="224" textAnchor="end">
                0
              </text>
            </g>

            {/* X-axis labels (7 days) */}
            <g fontFamily="Inter" fontSize="10" fill="#9CA3AF" textAnchor="middle">
              <text x="93" y="252">
                Apr 20
              </text>
              <text x="200" y="252">
                Apr 21
              </text>
              <text x="307" y="252">
                Apr 22
              </text>
              <text x="414" y="252">
                Apr 23
              </text>
              <text x="521" y="252">
                Apr 24
              </text>
              <text x="628" y="252">
                Apr 25
              </text>
              <text x="735" y="252">
                Apr 26
              </text>
            </g>

            {/* Previous-period dashed line */}
            <g
              id="ts-compare-group"
              style={{ display: compareOn ? "inline" : "none" }}
            >
              <path
                d="M 93,170 L 200,158 L 307,150 L 414,154 L 521,142 L 628,148 L 735,140"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.6"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Pageviews — filled area + line */}
            <path
              d="M 93,156 L 200,148 L 307,77 L 414,135 L 521,122 L 628,113 L 735,98 L 735,220 L 93,220 Z"
              fill="url(#ts-area-pv)"
            />
            <path
              d="M 93,156 L 200,148 L 307,77 L 414,135 L 521,122 L 628,113 L 735,98"
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pageview points */}
            <g fill="#6366F1">
              <circle cx="93" cy="156" r="3.5" />
              <circle cx="200" cy="148" r="3.5" />
              <circle cx="307" cy="77" r="4.5" stroke="#fff" strokeWidth="2" />
              <circle cx="414" cy="135" r="3.5" />
              <circle cx="521" cy="122" r="3.5" />
              <circle cx="628" cy="113" r="3.5" />
              <circle cx="735" cy="98" r="3.5" />
            </g>

            {/* Clicks line */}
            <path
              d="M 93,193 L 200,189 L 307,156 L 414,182 L 521,178 L 628,170 L 735,164"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g fill="#F59E0B">
              <circle cx="93" cy="193" r="3" />
              <circle cx="200" cy="189" r="3" />
              <circle cx="307" cy="156" r="3.5" stroke="#fff" strokeWidth="1.5" />
              <circle cx="414" cy="182" r="3" />
              <circle cx="521" cy="178" r="3" />
              <circle cx="628" cy="170" r="3" />
              <circle cx="735" cy="164" r="3" />
            </g>
          </svg>

          {/* Annotation pin */}
          <div
            className="chart-pin"
            style={{ left: "38.4%", top: "24%" }}
            title="Tuesday — TikTok went viral · 488 pageviews, 215 clicks"
          >
            🎵 TikTok went viral
          </div>

          {/* Hover guide + tooltip */}
          <div className="chart-hover-guide" id="chart-hover-guide" />
          <div className="chart-hover-tooltip" id="chart-hover-tooltip">
            <div className="htt-date">Apr 22</div>
            <div className="htt-row">
              <span className="htt-dot" /> Pageviews{" "}
              <strong style={{ marginLeft: "auto" }}>488</strong>
            </div>
            <div className="htt-row">
              <span className="htt-dot dot-clicks" /> Clicks{" "}
              <strong style={{ marginLeft: "auto" }}>215</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           TRAFFIC SOURCES
           ============================================================ */}
      <section className="sources-shell">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Traffic sources</h2>
            <p className="panel-sub">
              Where your visitors actually came from. Click a source to see the blocks
              they clicked most.
            </p>
          </div>
        </div>

        <div className="sources-method">
          <span className="lock">🔒</span>
          <div>
            <strong>How we know this:</strong> We detect traffic source from the
            standard HTTP{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11.5px",
                background: "var(--bg-elevated)",
                padding: "1px 5px",
                borderRadius: 4,
              }}
            >
              Referer
            </code>{" "}
            header your visitor's browser sends — the same way every website has known
            where you came from since 1995. We never store the specific URL or use
            cookies. Some traffic appears as <em>Direct</em> when in-app browsers
            (TikTok, Instagram apps) strip referrer information. Add{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11.5px",
                background: "var(--bg-elevated)",
                padding: "1px 5px",
                borderRadius: 4,
              }}
            >
              ?utm_source=tiktok
            </code>{" "}
            to your shared links for 100% accurate attribution.
          </div>
        </div>

        <div className="sources-grid">
          {/* LEFT: source list */}
          <div className="source-list" role="tablist" aria-label="Traffic sources">
            {SOURCE_ORDER.map((s) => (
              <button
                type="button"
                key={s.key}
                className={`source-row${activeSource === s.key ? " active" : ""}`}
                role="tab"
                data-source={s.key}
                onClick={() => setActiveSource(s.key)}
              >
                <span
                  className="src-icon"
                  style={{
                    background: s.iconBg,
                    color: s.iconColor || undefined,
                  }}
                >
                  {s.icon}
                </span>
                <div>
                  <div className="src-name">{s.name}</div>
                  <div className="src-bar-track">
                    <div className="src-bar-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
                <div className="src-pct">
                  {s.pct}
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--fg-subtle)",
                      fontWeight: 500,
                    }}
                  >
                    %
                  </span>
                </div>
                <div className="src-count">{s.count} visits</div>
              </button>
            ))}
          </div>

          {/* RIGHT: drill-down panel */}
          <div className="src-detail" id="src-detail">
            <div className="src-detail-head">
              <span
                className="src-icon"
                id="src-detail-icon"
                style={{ color: detail.color }}
              >
                {detail.icon}
              </span>
              <div>
                <h4 id="src-detail-title">{detail.title}</h4>
                <div className="src-detail-meta" id="src-detail-meta">
                  {detail.meta}
                </div>
              </div>
            </div>
            <div id="src-detail-body">
              {detail.rows.map((r, i) => (
                <div className="top-block-row" key={`${r[1]}-${i}`}>
                  <span className="tb-rank">{i + 1}.</span>
                  <span className="tb-name">
                    <span className="tb-icon">{r[0]}</span>{" "}
                    <span className="tb-label">{r[1]}</span>
                  </span>
                  <span className="tb-clicks">{r[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           TOP BLOCKS
           ============================================================ */}
      <section className="blocks-shell">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">
              Top blocks{" "}
              <span
                className="chip muted"
                style={{ marginLeft: 4, fontSize: "10.5px" }}
              >
                all tiers
              </span>
            </h2>
            <p className="panel-sub">
              Every block on your page, ranked by clicks. Click a row to see traffic
              sources, hour-of-day, and time-series for that block.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>Sort by:</span>
            <select
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12.5px",
                fontWeight: 600,
                padding: "5px 8px",
                borderRadius: 7,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-elevated)",
                color: "var(--fg)",
                cursor: "pointer",
              }}
              defaultValue="Clicks (desc)"
            >
              <option>Clicks (desc)</option>
              <option>Click-through rate</option>
              <option>Page position</option>
              <option>Recently changed</option>
            </select>
          </div>
        </div>

        <table className="blocks-table">
          <thead>
            <tr>
              <th>Block</th>
              <th className="col-page">On page</th>
              <th className="num">Clicks</th>
              <th className="num">CTR</th>
              <th className="col-spark">Last 7 days</th>
            </tr>
          </thead>
          <tbody>
            <tr
              onClick={() =>
                stub(
                  "Mockup — would drill into block detail view (sources × time-series × hour-of-day for this block)",
                )
              }
            >
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(99,102,241,0.10)",
                      color: "var(--brand-primary)",
                    }}
                  >
                    💳
                  </span>
                  <span className="b-label">Stripe checkout — Ultimate Fitness Course</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">312</td>
              <td className="num" style={{ color: "#059669" }}>
                15.5%
              </td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,18 L14,16 L28,8 L42,14 L56,12 L70,10 L84,7"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(245,158,11,0.10)",
                      color: "var(--brand-warm-dark)",
                    }}
                  >
                    🛍️
                  </span>
                  <span className="b-label">TikTok Shop link</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">198</td>
              <td className="num" style={{ color: "#059669" }}>
                9.9%
              </td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,18 L14,15 L28,4 L42,16 L56,14 L70,12 L84,10"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(139,92,246,0.10)",
                      color: "var(--brand-secondary)",
                    }}
                  >
                    📧
                  </span>
                  <span className="b-label">
                    Free PDF: 10 Morning Habits of High-Energy Women
                  </span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">128</td>
              <td className="num">6.4%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,16 L14,14 L28,12 L42,10 L56,9 L70,7 L84,6"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(16,185,129,0.10)",
                      color: "#059669",
                    }}
                  >
                    🎯
                  </span>
                  <span className="b-label">1:1 Coaching Session</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">76</td>
              <td className="num">3.8%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,17 L14,16 L28,12 L42,14 L56,11 L70,12 L84,9"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(99,102,241,0.10)",
                      color: "var(--brand-primary)",
                    }}
                  >
                    📸
                  </span>
                  <span className="b-label">Latest on Instagram (embed)</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">52</td>
              <td className="num">2.6%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,15 L14,15 L28,11 L42,13 L56,14 L70,11 L84,12"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(245,158,11,0.10)",
                      color: "var(--brand-warm-dark)",
                    }}
                  >
                    🛒
                  </span>
                  <span className="b-label">Peloton Bike+ (affiliate)</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">38</td>
              <td className="num">1.9%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,18 L14,16 L28,15 L42,14 L56,13 L70,11 L84,12"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{
                      background: "rgba(245,158,11,0.10)",
                      color: "var(--brand-warm-dark)",
                    }}
                  >
                    🛒
                  </span>
                  <span className="b-label">Gymshark — Alexandra's picks</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">29</td>
              <td className="num">1.5%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,17 L14,16 L28,16 L42,14 L56,12 L70,13 L84,11"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
            <tr onClick={() => stub("Mockup — would drill into block detail")}>
              <td>
                <div className="b-name">
                  <span
                    className="b-icon"
                    style={{ background: "#0F1115", color: "#fff" }}
                  >
                    🎙️
                  </span>
                  <span className="b-label">My podcast: Strong Not Skinny</span>
                </div>
              </td>
              <td className="col-page">
                <span className="b-page-pill">Home</span>
              </td>
              <td className="num">14</td>
              <td className="num">0.7%</td>
              <td className="col-spark">
                <svg
                  className="b-spark"
                  viewBox="0 0 84 22"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,17 L14,17 L28,16 L42,17 L56,15 L70,16 L84,14"
                    fill="none"
                    stroke="#0F1115"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="blocks-foot">
          <span>Showing 8 of 8 blocks · clicks counted at every tier (DEC-077)</span>
          <button
            type="button"
            className="panel-action"
            onClick={() => stub("Mockup — would drill into per-block detail")}
          >
            Open block detail view →
          </button>
        </div>
      </section>

      {/* ============================================================
           3-UP: Geo / Devices / Referrers
           ============================================================ */}
      <h2 className="section-heading">
        Audience breakdown{" "}
        <span className="chip muted">all tiers — DEC-076 Option 9</span>
      </h2>

      <div className="three-up">
        {/* Geographic */}
        <div className="mini-card">
          <div className="mc-head">
            <h3>🌍 Top countries</h3>
            <button
              type="button"
              className="mc-action"
              id="cities-toggle"
              onClick={() => setShowCities((v) => !v)}
            >
              {showCities ? "Hide cities" : "Show cities"}
            </button>
          </div>
          <div className="bar-list" id="geo-list">
            <div className="bar-row">
              <span className="bar-label">🇺🇸 United States</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "38%" }} />
              </span>
              <span className="bar-pct">38%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🇵🇹 Portugal</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "18%" }} />
              </span>
              <span className="bar-pct">18%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🇧🇷 Brazil</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "12%" }} />
              </span>
              <span className="bar-pct">12%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🇬🇧 United Kingdom</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "9%" }} />
              </span>
              <span className="bar-pct">9%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🇨🇦 Canada</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "7%" }} />
              </span>
              <span className="bar-pct">7%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🌐 16 other</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{ width: "16%", background: "var(--fg-subtle)" }}
                />
              </span>
              <span className="bar-pct">16%</span>
            </div>
          </div>
          <div
            className="bar-list"
            id="cities-list"
            style={{
              display: showCities ? "block" : "none",
              borderTop: "1px dashed var(--border)",
              paddingTop: 10,
              marginTop: 6,
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--fg-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Top cities
            </div>
            <div className="bar-row">
              <span className="bar-label">Lisbon, PT</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "11%" }} />
              </span>
              <span className="bar-pct">11%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">New York, US</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "8%" }} />
              </span>
              <span className="bar-pct">8%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">São Paulo, BR</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "6%" }} />
              </span>
              <span className="bar-pct">6%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">London, UK</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "5%" }} />
              </span>
              <span className="bar-pct">5%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Los Angeles, US</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "5%" }} />
              </span>
              <span className="bar-pct">5%</span>
            </div>
          </div>
        </div>

        {/* Devices */}
        <div className="mini-card">
          <div className="mc-head">
            <h3>📱 Devices</h3>
            <button
              type="button"
              className="mc-action"
              onClick={() => stub("Mockup — would expand device drill-down")}
            >
              Detail →
            </button>
          </div>
          <div className="bar-list">
            <div className="bar-row">
              <span className="bar-label">📱 Mobile</span>
              <span className="bar-track">
                <span className="bar-fill warm" style={{ width: "78%" }} />
              </span>
              <span className="bar-pct">78%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">💻 Desktop</span>
              <span className="bar-track">
                <span className="bar-fill warm" style={{ width: "18%" }} />
              </span>
              <span className="bar-pct">18%</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">📲 Tablet</span>
              <span className="bar-track">
                <span className="bar-fill warm" style={{ width: "4%" }} />
              </span>
              <span className="bar-pct">4%</span>
            </div>
          </div>
          <div className="device-toggle-row">
            <strong>Browsers:</strong>
            <span>Safari 54%</span>
            <span>· Chrome 31%</span>
            <span>· in-app TikTok 11%</span>
            <span>· Other 4%</span>
          </div>
        </div>

        {/* Top referrers */}
        <div className="mini-card">
          <div className="mc-head">
            <h3>🔗 Top referrers</h3>
            <button
              type="button"
              className="mc-action"
              onClick={() => stub("Mockup — would show all referrers")}
            >
              All →
            </button>
          </div>
          <div className="bar-list">
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                tiktok.com
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "42%" }} />
              </span>
              <span className="bar-pct">42%</span>
            </div>
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                l.instagram.com
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "24%" }} />
              </span>
              <span className="bar-pct">24%</span>
            </div>
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                (direct)
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "18%" }} />
              </span>
              <span className="bar-pct">18%</span>
            </div>
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                youtube.com
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "7%" }} />
              </span>
              <span className="bar-pct">7%</span>
            </div>
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                t.co
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: "5%" }} />
              </span>
              <span className="bar-pct">5%</span>
            </div>
            <div className="bar-row">
              <span
                className="bar-label"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
              >
                11 others
              </span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{ width: "4%", background: "var(--fg-subtle)" }}
                />
              </span>
              <span className="bar-pct">4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
           CROSS-TAB ANALYSIS
           ============================================================ */}
      <section className="crosstab-shell">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">
              Cross-tab analysis <span className="chip muted">all tiers</span>
            </h2>
            <p className="panel-sub">
              Slice your data along any two dimensions. Default view: source × block.
              Click any cell to drill in.
            </p>
          </div>
          <button
            type="button"
            className="panel-action"
            onClick={() => stub("Mockup — would reset to default rows=Source, cols=Block")}
          >
            Reset to default
          </button>
        </div>

        <div className="crosstab-help">
          <strong>How to read this:</strong> rows are one dimension, columns are
          another, cell value is total clicks where they intersect. Want to know if
          Tuesday's TikTok post drove Stripe-link clicks at 9 PM? Set{" "}
          <kbd>Rows = Hour of day</kbd>, <kbd>Cols = Block</kbd>, then filter source =
          TikTok in the source list above. <strong>Hover a cell</strong> for
          share-of-total + drill-down.
        </div>

        <div className="crosstab-controls">
          <label htmlFor="ct-rows">Rows:</label>
          <select
            id="ct-rows"
            defaultValue="source"
            onChange={() =>
              stub("Mockup — would re-render the table with the new row dimension")
            }
          >
            <option value="source">Source</option>
            <option value="country">Country</option>
            <option value="device">Device</option>
            <option value="day">Day of week</option>
            <option value="hour">Hour of day</option>
            <option value="block">Block</option>
            <option value="referrer">Referrer</option>
          </select>
          <label htmlFor="ct-cols">Columns:</label>
          <select
            id="ct-cols"
            defaultValue="block"
            onChange={() =>
              stub("Mockup — would re-render the table with the new column dimension")
            }
          >
            <option value="source">Source</option>
            <option value="country">Country</option>
            <option value="device">Device</option>
            <option value="day">Day of week</option>
            <option value="hour">Hour of day</option>
            <option value="block">Block</option>
            <option value="referrer">Referrer</option>
          </select>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11.5px",
              color: "var(--fg-subtle)",
            }}
          >
            Showing <strong>5 sources × 6 blocks</strong> · 7-day window
          </span>
        </div>

        <div className="crosstab-table-wrap">
          <table
            className="crosstab-table"
            aria-label="Cross-tab: source × block click counts"
          >
            <thead>
              <tr>
                <th className="row-header" style={{ textAlign: "left" }}>
                  Source ↓ / Block →
                </th>
                <th>💳 Stripe</th>
                <th>🛍️ TikTok Shop</th>
                <th>📧 Free PDF</th>
                <th>🎯 Coaching</th>
                <th>📸 IG embed</th>
                <th>🛒 Affiliates</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="row-header">🎵 TikTok</td>
                <td
                  className="ct-cell"
                  style={{ background: "rgba(99,102,241,0.55)", color: "#fff" }}
                  data-share="22.0%"
                >
                  186
                </td>
                <td
                  className="ct-cell"
                  style={{ background: "rgba(99,102,241,0.30)", color: "#fff" }}
                  data-share="10.5%"
                >
                  89
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.20)",
                    color: "var(--fg)",
                  }}
                  data-share="7.3%"
                >
                  62
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.10)",
                    color: "var(--fg)",
                  }}
                  data-share="3.7%"
                >
                  31
                </td>
                <td className="ct-cell ct-zero" data-share="0.5%">
                  4
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    color: "var(--fg)",
                  }}
                  data-share="2.8%"
                >
                  24
                </td>
              </tr>
              <tr>
                <td className="row-header">📸 Instagram</td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.20)",
                    color: "var(--fg)",
                  }}
                  data-share="6.4%"
                >
                  54
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.10)",
                    color: "var(--fg)",
                  }}
                  data-share="3.0%"
                >
                  25
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.18)",
                    color: "var(--fg)",
                  }}
                  data-share="5.7%"
                >
                  48
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    color: "var(--fg)",
                  }}
                  data-share="2.4%"
                >
                  20
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "var(--fg)",
                  }}
                  data-share="3.8%"
                >
                  32
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    color: "var(--fg)",
                  }}
                  data-share="1.5%"
                >
                  13
                </td>
              </tr>
              <tr>
                <td className="row-header">🔗 Direct</td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.18)",
                    color: "var(--fg)",
                  }}
                  data-share="5.7%"
                >
                  48
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    color: "var(--fg)",
                  }}
                  data-share="1.4%"
                >
                  12
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    color: "var(--fg)",
                  }}
                  data-share="1.8%"
                >
                  15
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    color: "var(--fg)",
                  }}
                  data-share="1.7%"
                >
                  14
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.04)",
                    color: "var(--fg)",
                  }}
                  data-share="1.5%"
                >
                  13
                </td>
                <td className="ct-cell ct-zero" data-share="0.7%">
                  6
                </td>
              </tr>
              <tr>
                <td className="row-header">📺 YouTube</td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    color: "var(--fg)",
                  }}
                  data-share="2.4%"
                >
                  20
                </td>
                <td className="ct-cell ct-zero" data-share="0.6%">
                  5
                </td>
                <td className="ct-cell ct-zero" data-share="0.5%">
                  4
                </td>
                <td className="ct-cell ct-zero" data-share="0.7%">
                  6
                </td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    color: "var(--fg)",
                  }}
                  data-share="2.0%"
                >
                  17
                </td>
                <td className="ct-cell ct-zero" data-share="0.4%">
                  3
                </td>
              </tr>
              <tr>
                <td className="row-header">𝕏 Twitter</td>
                <td
                  className="ct-cell"
                  style={{
                    background: "rgba(99,102,241,0.04)",
                    color: "var(--fg)",
                  }}
                  data-share="1.0%"
                >
                  8
                </td>
                <td className="ct-cell ct-zero" data-share="0.0%">
                  0
                </td>
                <td className="ct-cell ct-zero" data-share="0.5%">
                  4
                </td>
                <td className="ct-cell ct-zero" data-share="0.0%">
                  0
                </td>
                <td className="ct-cell ct-zero" data-share="0.7%">
                  6
                </td>
                <td className="ct-cell ct-zero" data-share="0.4%">
                  3
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          style={{
            fontSize: "11.5px",
            color: "var(--fg-subtle)",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--fg-muted)" }}>Reading the table:</strong>{" "}
          the darker the cell, the more clicks. Empty/dim cells are zero or near-zero.
          Tip: the brightest cell is your <em>most reliable funnel</em> — TikTok →
          Stripe checkout (186 clicks, 22% of all clicks).
        </p>
      </section>

      {/* ============================================================
           POWER FEATURES — tier-gated cards
           ============================================================ */}
      <h2 className="section-heading">
        Power features{" "}
        <span className="chip muted" id="power-tier-label">
          your tier: {tierLabel}
        </span>
      </h2>

      <div className="locked-grid">
        {/* 1. Saved views — Pro+ */}
        <div
          className={`locked-card${savedViews.unlocked ? " is-unlocked" : ""}`}
          id="card-saved-views"
          data-locked={savedViews.locked ? "true" : "false"}
          data-min-tier="pro"
        >
          <div className="locked-card-head">
            <h3>📌 Saved views</h3>
            <span className="chip pro">Pro+</span>
          </div>
          <p className="locked-card-sub">
            Bookmark your favourite cross-tab combinations. Switch between "Tuesday
            post performance" and "USA mobile checkout" with one click.
          </p>
          <div className="locked-card-body">
            <div
              className="lc-preview"
              style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
            >
              <span className="saved-view-chip">
                <span className="sv-dot" /> Tuesday TikTok post
              </span>
              <span className="saved-view-chip">
                <span
                  className="sv-dot"
                  style={{ background: "var(--brand-warm)" }}
                />{" "}
                US mobile checkout
              </span>
              <span className="saved-view-chip">
                <span
                  className="sv-dot"
                  style={{ background: "var(--brand-secondary)" }}
                />{" "}
                Coaching funnel
              </span>
              <span
                className="saved-view-chip"
                style={{
                  background: "var(--bg-elevated)",
                  borderStyle: "dashed",
                  color: "var(--fg-muted)",
                }}
              >
                + Save current view
              </span>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Pro.</strong> The preview above is real — drop in
                any saved view as soon as you upgrade.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Pro →
              </a>
            </div>
          </div>
        </div>

        {/* 2. A/B testing — Business */}
        <div
          className={`locked-card${ab.unlocked ? " is-unlocked" : ""}`}
          id="card-ab"
          data-locked={ab.locked ? "true" : "false"}
          data-min-tier="business"
        >
          <div className="locked-card-head">
            <h3>🧪 A/B testing framework</h3>
            <span className="chip business">Business</span>
          </div>
          <p className="locked-card-sub">
            Test two variants of any block (label, image, CTA, target URL) at a 50/50
            split. We pick the winner automatically when significance threshold is
            reached.
          </p>
          <div className="locked-card-body">
            <div className="lc-preview">
              <div className="faux-row">
                <span className="faux-pic">A</span>
                <span className="faux-name">
                  Stripe checkout — "Get the course $127"
                </span>
                <span className="faux-num">186</span>
              </div>
              <div className="faux-row">
                <span className="faux-pic">B</span>
                <span className="faux-name">
                  Stripe checkout — "Start training today"
                </span>
                <span className="faux-num">241</span>
              </div>
              <div
                className="faux-row"
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span
                  className="faux-pic"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "#059669",
                  }}
                >
                  ✓
                </span>
                <span
                  className="faux-name"
                  style={{ color: "#059669", fontWeight: 600 }}
                >
                  Variant B winning · 95% confidence
                </span>
                <span className="faux-num">+30%</span>
              </div>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Business.</strong> The preview above is the real
                auto-pick UI — your test runs as soon as you upgrade.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Business →
              </a>
            </div>
          </div>
        </div>

        {/* 3. Scheduled email digest — Business */}
        <div
          className={`locked-card${digest.unlocked ? " is-unlocked" : ""}`}
          id="card-digest"
          data-locked={digest.locked ? "true" : "false"}
          data-min-tier="business"
        >
          <div className="locked-card-head">
            <h3>📬 Scheduled email digest</h3>
            <span className="chip business">Business</span>
          </div>
          <p className="locked-card-sub">
            Get this dashboard in your inbox every Monday morning — top blocks,
            traffic, week-over-week deltas. Send a copy to your manager too.
          </p>
          <div className="locked-card-body">
            <div
              className="lc-preview"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "12.5px",
                }}
              >
                <span style={{ fontWeight: 600 }}>Send to:</span>
                <span className="saved-view-chip">alexandra@example.com</span>
                <span className="saved-view-chip">+ Add</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "12.5px",
                }}
              >
                <span style={{ fontWeight: 600 }}>When:</span>
                <span className="saved-view-chip">Monday 9:00 (Europe/Lisbon)</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "12.5px",
                }}
              >
                <span style={{ fontWeight: 600 }}>Include:</span>
                <span className="saved-view-chip">KPIs</span>
                <span className="saved-view-chip">Top blocks</span>
                <span className="saved-view-chip">Traffic sources</span>
              </div>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Business.</strong> Set the recipients and schedule
                above — your first digest sends Monday after upgrade.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Business →
              </a>
            </div>
          </div>
        </div>

        {/* 4. Replay — Business */}
        <div
          className={`locked-card${replay.unlocked ? " is-unlocked" : ""}`}
          id="card-replay"
          data-locked={replay.locked ? "true" : "false"}
          data-min-tier="business"
        >
          <div className="locked-card-head">
            <h3>⏯ Replay traffic minute-by-minute</h3>
            <span className="chip business">Business</span>
          </div>
          <p className="locked-card-sub">
            Scrub back through any past hour second-by-second. See the exact moment
            your TikTok went viral.{" "}
            <em style={{ color: "var(--fg-subtle)" }}>
              Capped at 60 min/day per creator (DEC-082).
            </em>
          </p>
          <div className="locked-card-body">
            <div
              className="lc-preview"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div
                style={{
                  height: 30,
                  background:
                    "linear-gradient(90deg, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.50) 38%, rgba(99,102,241,0.10) 50%, rgba(99,102,241,0.20) 100%)",
                  borderRadius: 6,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    bottom: -4,
                    left: "38%",
                    width: 2,
                    background: "var(--brand-primary)",
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "38%",
                    top: -22,
                    transform: "translateX(-50%)",
                    fontSize: "10.5px",
                    color: "var(--brand-primary)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  21:14 ▼
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--fg-muted)",
                }}
              >
                <span>← Apr 22, 21:00</span>
                <span style={{ marginLeft: "auto" }}>Apr 22, 22:00 →</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  fontSize: "11.5px",
                  color: "var(--fg-muted)",
                }}
              >
                <span className="saved-view-chip">▶ Play</span>
                <span className="saved-view-chip">1× speed</span>
                <span className="saved-view-chip">+ Mark moment</span>
              </div>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Business.</strong> The scrubber above is live —
                pick any past hour and replay second-by-second.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Business →
              </a>
            </div>
          </div>
        </div>

        {/* 5. Identity stitching — Business */}
        <div
          className={`locked-card${identity.unlocked ? " is-unlocked" : ""}`}
          id="card-identity"
          data-locked={identity.locked ? "true" : "false"}
          data-min-tier="business"
        >
          <div className="locked-card-head">
            <h3>🪡 Identity stitching</h3>
            <span className="chip business">Business</span>
          </div>
          <p className="locked-card-sub">
            Connect anonymous web visitors to your email subscribers when they click a
            tracked link from your newsletter. Still cookieless — uses a one-time
            signed token, never stored long-term.
          </p>
          <div className="locked-card-body">
            <div className="lc-preview">
              <div className="faux-row">
                <span className="faux-pic">📧</span>
                <span className="faux-name">jane@example.com → 4 visits, 2 purchases</span>
                <span className="faux-num">$254</span>
              </div>
              <div className="faux-row">
                <span className="faux-pic">📧</span>
                <span className="faux-name">mark@example.com → 7 visits, 1 coaching</span>
                <span className="faux-num">$49</span>
              </div>
              <div className="faux-row">
                <span className="faux-pic">📧</span>
                <span className="faux-name">
                  amelia@example.com → 12 visits, 3 purchases
                </span>
                <span className="faux-num">$381</span>
              </div>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Business.</strong> The matched-visitor list above
                is what you'll see once your newsletter links are tracked.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Business →
              </a>
            </div>
          </div>
        </div>

        {/* 6. Parquet R2 archive — Business */}
        <div
          className={`locked-card${parquet.unlocked ? " is-unlocked" : ""}`}
          id="card-parquet"
          data-locked={parquet.locked ? "true" : "false"}
          data-min-tier="business"
        >
          <div className="locked-card-head">
            <h3>📦 Parquet R2 archive</h3>
            <span className="chip business">Business</span>
          </div>
          <p className="locked-card-sub">
            Monthly snapshot of every event, queryable from your own warehouse
            (DuckDB, BigQuery, Snowflake). Per <strong>DEC-078</strong>: D1 rollups
            stay forever; raw events archive monthly.
          </p>
          <div className="locked-card-body">
            <div
              className="lc-preview"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div className="faux-row">
                <span className="faux-pic">📦</span>
                <span
                  className="faux-name"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
                >
                  2026-04.parquet · 1.2 MB
                </span>
                <span
                  className="faux-num"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Download
                </span>
              </div>
              <div className="faux-row">
                <span className="faux-pic">📦</span>
                <span
                  className="faux-name"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
                >
                  2026-03.parquet · 1.4 MB
                </span>
                <span
                  className="faux-num"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Download
                </span>
              </div>
              <div className="faux-row">
                <span className="faux-pic">📦</span>
                <span
                  className="faux-name"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px" }}
                >
                  2026-02.parquet · 1.0 MB
                </span>
                <span
                  className="faux-num"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
                >
                  Download
                </span>
              </div>
            </div>
            <div className="lc-cta-footer" role="note">
              <p className="lc-cta-msg">
                <strong>Available on Business.</strong> Your monthly snapshots will
                land here — downloadable Parquet, queryable from your warehouse.
              </p>
              <a href="./pricing.html" className="btn btn-primary btn-sm">
                Upgrade to Business →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
           FOOTER PRIVACY BANNER
           ============================================================ */}
      <div className="privacy-footer" role="note">
        <span className="lock-icon">🔒</span>
        <div>
          <strong>Cookieless analytics.</strong> No cookie banner shown to your
          visitors. We chose this on purpose — fewer interruptions, more conversions,
          full privacy promise to your audience.{" "}
          <a href="./landing.html#privacy">Read the full methodology →</a>
        </div>
      </div>
    </section>
  );
}
