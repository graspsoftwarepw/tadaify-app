/**
 * landingFixture — mock copy + data for the tadaify marketing landing page.
 * Verbatim from mockups/tadaify-mvp/landing.html (Indigo Serif v2, Phase A
 * three-flagships). Typed so the screen can graduate to real CMS data later.
 *
 * @implements fr-landing
 */

export type CreatorCard = {
  name: string;
  niche: string;
  handle: string;
  /** Decorative avatar gradient class (c1–c5). */
  avatarClass: string;
};

export type CompareRow = { feature: string; detail: string; us: string; usStrong?: boolean };

export type PrivacyRow = { platform: string; banner: string; method: string; us?: boolean };
export type ApiRow = { platform: string; access: string; tier: string; us?: boolean };
export type FreeRow = {
  platform: string;
  analytics: string;
  crossTab: string;
  geo: string;
  devices: string;
  us?: boolean;
};

export type FeatureCard = { icon: "checkout" | "domain" | "analytics"; title: string; body: string };
export type Wedge = { num: string; title: string; titleEm: string; body: string; bad: string; good: string };
export type Faq = { q: string; a: string };
export type UpgradeTile = { tier: string; refresh: string; window: string; accent: "free" | "creator" | "pro" | "business" };

/** Hero handle-claim validation rules (ported verbatim from the mockup JS). */
export const CLAIM_RULES = {
  re: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
  reserved: [
    "app", "admin", "login", "register", "try", "pricing", "templates", "trust",
    "faq", "docs", "api", "assets", "vs", "for", "blog", "help", "status",
    "about", "contact", "preview", "developers", "mail", "www", "root",
  ],
  taken: ["admin", "kuba", "marta", "alex", "test", "example", "tadaify", "john", "jane", "creator", "support"],
  idleMsg: "3–30 characters: lowercase letters, numbers, hyphens.",
};

export const hero = {
  eyebrow: "0% platform fees · every tier · forever",
  h1Lead: "Turn your bio link into your ",
  h1Em: "best first impression",
  subLead:
    "The only link-in-bio where ",
  subStrong1: "every feature is free",
  subMid: ". Pay only if you want your own domain — starting at ",
  subStrong2: "$1.99/mo",
  subTail: ". No seller fees. No upsell modals. No “Powered by” on your page, ever.",
  claimPrefix: "tadaify.com/",
  claimPlaceholder: "yourname",
  claimButton: "Claim your handle",
  trustNoCard: "No credit card.",
  trustNoTrial: "No trial.",
  trustRest: "Everything free. Upgrade when it helps you.",
  previewLabel: "Your public page",
  // Hero preview card (right column).
  card: {
    handle: "/alexandrasilva",
    sub: "Fitness coach · Lisbon",
    links: [
      { ico: "F", icoClass: "", label: "12-week fitness plan", price: "$29" },
      { ico: "M", icoClass: "warm", label: "Monthly mobility calls", price: "$12/mo" },
      { ico: "N", icoClass: "purple", label: "Free newsletter", price: "Join" },
    ],
    badges: ["💸 0% fees", "🔒 No cookies", "🎨 Your theme"],
  },
};

export const proof = {
  text: "Join thousands of creators building something that looks like them.",
  count: "14,283",
  countTail: "new pages created this month.",
};

export const creatorsHead = { lead: "Real creators, ", em: "real pages.", sub: "Click any to see the real thing — no mockups, no fake previews." };

export const creators: CreatorCard[] = [
  { name: "Alexandra Silva", niche: "Fitness coach · 50k IG", handle: "tadaify.com/alexandrasilva", avatarClass: "c1" },
  { name: "Kuba Bar", niche: "Music producer · 80k Spotify", handle: "tadaify.com/kubabar", avatarClass: "c2" },
  { name: "Marta Wolska", niche: "Newsletter · 15k subs", handle: "tadaify.com/martawolska", avatarClass: "c3" },
  { name: "Neon DJ", niche: "Live streamer · 120k Twitch", handle: "tadaify.com/neondj", avatarClass: "c4" },
  { name: "Chipmunk Guy", niche: "TikTok niche · 200k", handle: "tadaify.com/chipmunkguy", avatarClass: "c5" },
];

export const freeTableHead = {
  lead: "Everything you need on ",
  em: "Free.",
  sub: "Pay only when you want a custom domain ($1.99/mo) or when you’re ready to grow.",
};

export const freeTable: CompareRow[] = [
  { feature: "Custom themes", detail: "All themes, all styles", us: "✓ Free" },
  { feature: "Analytics (geo · device · referrer)", detail: "365-day history included", us: "✓ Free" },
  { feature: "Link scheduling", detail: "Publish by date & time", us: "✓ Free" },
  { feature: "Email capture", detail: "Collect & export subscribers", us: "✓ Free" },
  { feature: "QR code", detail: "Download SVG or PNG", us: "✓ Free" },
  { feature: "Custom animations", detail: "30+ entrance effects", us: "✓ 30+ Free" },
  { feature: "No platform watermark", detail: "No “Powered by” — ever", us: "✓ Always — we never had one" },
  { feature: "Commerce (sell products)", detail: "Upgrade to Creator for 0% fees", us: "0% fee · Creator $7.99/mo", usStrong: true },
];

export const freeTableFoot = "Only paying for your own domain? $1.99/mo. Need more audience tools? Creator $7.99/mo.";

export const featuresHead = { lead: "Three things we do ", em: "better.", sub: "Not 47 features. Three that matter more than the rest." };

export const features: FeatureCard[] = [
  { icon: "checkout", title: "Inline checkout", body: "Buyers stay on your page — no redirects to Stripe. 1-tap Apple Pay and Google Pay. Higher conversion, every time." },
  { icon: "domain", title: "Custom domain at $1.99", body: "The most affordable custom domain in the category. Your name, your address, zero per-domain markup." },
  { icon: "analytics", title: "Analytics that mean something", body: "Real-time. Geo down to city level. Bot-filtered. All free — 90 days on Free, 365 days on Pro." },
];

/* ── Flagship #1 — Privacy-first ── */
export const privacy = {
  flagship: "Flagship #1 · Privacy-first",
  h2Lead: "🔒 No cookies. No tracking. ",
  h2Em: "Ever.",
  sub: "Your visitors don't see a cookie banner. ever. That means fewer distractions, better first impressions, and more conversions for you.",
  badges: ["🔒 no cookies", "👁‍🗨 no fingerprinting", "🇪🇺 GDPR-clean by design", "🤝 your visitors stay happy"],
  para1Strong: "Most platforms cookie-track your visitors",
  para1Tail: " — which means your audience has to dismiss a banner before seeing your page. We chose a different path.",
  para2: "We count unique visitors using a privacy-first daily method — no persistent ID, no browser storage. Visitors never see a consent banner on your tadaify page.",
  para3Strong: "The trade-off:",
  para3Tail: " if the same visitor returns tomorrow, we count them again. Slightly fuzzy number — but your audience's first impression stays clean.",
  detailsSummary: "How it works — for the technically curious",
  detailsP1: "Every day we generate a fresh random salt — it exists only in memory and is never stored. When someone visits your page, we create a temporary fingerprint from their IP address and browser, mix in the daily salt, and hash it. The result is a day-scoped count: same visitor, same day = 1 count. Same visitor, next day = fresh count.",
  detailsP2: "No cookies. No localStorage. Nothing written to the browser. The daily salt means even we can't link Tuesday's visitors to Monday's. Your audience stays private, your analytics stay meaningful.",
  foot: "Privacy is architectural, not a setting you can toggle. We built it this way from day one so we can't accidentally break it.",
  rows: [
    { platform: "Linktree", banner: "✗ Required", method: "Persistent cookies + 3rd-party scripts" },
    { platform: "Beacons", banner: "✗ Required", method: "Cookie-based session tracking" },
    { platform: "Stan", banner: "✗ Required", method: "Tracking pixels + cookies" },
    { platform: "Bento", banner: "✗ Required", method: "Cookie-based analytics" },
    { platform: "📷 tadaify", banner: "✓ Never", method: "Cookieless daily salt — nothing stored in browser", us: true },
  ] as PrivacyRow[],
};

/* ── Flagship #2 — Creator API ── */
export const api = {
  flagship: "Flagship #2 · Creator API",
  h2Lead: "🔌 First creator analytics API in ",
  h2Em: "link-in-bio.",
  sub: "Every other platform locks your data inside their dashboard. Tadaify gives you the keys.",
  badges: ["🔌 first creator API", "📊 your data, your tools", "🪝 build dashboards / Slack bots / iOS widgets", "🌟 100 req/h Pro · 1000 req/h Business"],
  codeTitle: "terminal",
  code: `# Get clicks for all blocks — last 7 days
curl -H "Authorization: Bearer sk_tdf_..." \\
  "https://api.tadaify.com/v1/insights/clicks?from=7d"

# Response
{
  "from": "2026-04-19",
  "to":   "2026-04-26",
  "blocks": [
    { "id": "stripe", "clicks": 1247, "top_source": "tiktok" },
    { "id": "newsletter", "clicks": 839, "top_source": "instagram" }
  ]
}`,
  useCasesTitle: "Build anything on top of your data",
  useCases: [
    { emoji: "📊", strong: "Custom dashboards", tail: " — pipe your click and visitor data into Notion, Retool, or a plain spreadsheet. Own your reporting stack." },
    { emoji: "💬", strong: "Slack / Discord bots", tail: " — \"alert me when any block hits 500 clicks today.\" Build the notification logic you actually want, not a fixed in-app alert." },
    { emoji: "📱", strong: "iOS widgets & shortcuts", tail: " — tap your phone's Lock Screen to see today's page visitors. Weekend project, not a feature request ticket." },
    { emoji: "🥳", strong: "Daily DM yourself", tail: " — send yourself a morning summary via your own bot. \"Your Stripe link got 183 clicks yesterday. Top source: TikTok.\"" },
  ],
  cta: "Upgrade to Pro to get API access →",
  rows: [
    { platform: "Linktree", access: "✗ None", tier: "—" },
    { platform: "Beacons", access: "✗ None", tier: "—" },
    { platform: "Stan", access: "✗ None", tier: "—" },
    { platform: "Bento", access: "✗ None", tier: "—" },
    { platform: "📷 tadaify", access: "✓ Yes", tier: "Pro (100 req/h) · Business (1,000 req/h)", us: true },
  ] as ApiRow[],
  foot: "API docs at api.tadaify.com/docs — preview available before you upgrade.",
};

/* ── Flagship #3 — Most generous Free ── */
export const generousFree = {
  flagship: "Flagship #3 · Most generous Free",
  h2Lead: "🎁 The most generous Free tier in link-in-bio analytics. ",
  h2Em: "Period.",
  sub: "Competitors gate cross-tab analysis behind $24/mo Premium. We give it to Free.",
  trustBadge: "🎁 No data hidden behind paywall. Free creators get the full dataset.",
  rows: [
    { platform: "Linktree Free", analytics: "Basic clicks only", crossTab: "✗", geo: "✗", devices: "✗" },
    { platform: "Beacons Free", analytics: "Today's real-time + flat list", crossTab: "✗", geo: "Country only", devices: "✗" },
    { platform: "Bento Free", analytics: "Limited features", crossTab: "✗", geo: "✗", devices: "✗" },
    { platform: "Stan Free", analytics: "✗ Paid only*", crossTab: "✗", geo: "✗", devices: "✗" },
    { platform: "📷 tadaify Free", analytics: "✓ Full dataset", crossTab: "✓ All", geo: "✓ City-level", devices: "✓ Full detail", us: true },
  ] as FreeRow[],
  foot1: "Tadaify Free: hourly refresh · 7-day window. Upgrade to Creator for 5-min refresh + 90d window, or Pro for real-time + 1-year history.",
  foot2: "*Stan.store requires a paid plan ($29+/mo) for analytics access. Verified 2026-04-26.",
  upgradesTitle: "What upgrades unlock",
  upgradesSub: "Your data is complete on Free. Upgrades are about freshness and history — not access.",
  tiles: [
    { tier: "Free", refresh: "Hourly refresh", window: "7-day window", accent: "free" },
    { tier: "Creator $7.99/mo", refresh: "5-min refresh", window: "90-day window", accent: "creator" },
    { tier: "Pro $19.99/mo", refresh: "Real-time (60s)", window: "1-year window + API", accent: "pro" },
    { tier: "Business $49.99/mo", refresh: "+ Replay sessions", window: "All-time history + Parquet archive", accent: "business" },
  ] as UpgradeTile[],
  cta: "See full pricing →",
};

export const wedgesHead = { lead: "Why creators ", em: "choose tadaify", sub: "Three things that take 30 seconds to see." };

export const wedges: Wedge[] = [
  { num: "01", title: "Your URL, ", titleEm: "your brand", body: "tadaify.com/yourname is your creator real estate. Clean. Memorable. Yours. Want your own domain? Add it for $1.99/mo.", bad: "yourname.someplatform.com", good: "tadaify.com/yourname" },
  { num: "02", title: "Every feature free", titleEm: "", body: "Custom themes, analytics, scheduling, email capture — all included from day one. Pay only when you want a custom domain ($1.99/mo).", bad: "locked behind upgrade", good: "$0 forever" },
  { num: "03", title: "Inline commerce", titleEm: "", body: "Sell directly on your page. Buyers stay with you, no redirects. 0% platform fees on paid tiers.", bad: "platform takes a cut", good: "0% — forever" },
];

export const philosophy = {
  hLead: "We don’t show upgrade popups. ",
  hEm: "Ever.",
  body1: "When Creator ($7.99) or Pro ($19.99) would help you, you’ll see a small ",
  tip: "💡 tip",
  body2: " — dismissible, non-blocking, never interrupts your flow. No black banners, no mid-edit modals, no dark patterns.",
  link: "Read our subtle-upsell philosophy →",
};

export const faqHead = { lead: "Questions? ", em: "Answered.", sub: "The six things creators ask before switching." };

export const faqs: Faq[] = [
  { q: "Can I migrate my existing bio-link page?", a: "Yes. Paste your existing bio-link URL on signup — we auto-import your links in 30 seconds. Custom themes, scheduled links, email-capture blocks all come across. No manual copying." },
  { q: "Do you charge seller fees?", a: "0% on every paid tier. Forever. Bound by our Price Lock on tadaify.com/trust. Free tier has no commerce — upgrade to Creator ($7.99/mo) to sell. We take nothing — only Stripe’s processing fee applies (~2.9% + 30¢)." },
  { q: "What about the data I put in?", a: "Your data. Export anytime as JSON or CSV. Delete your account — everything goes, including payment history, analytics, and email subscribers. GDPR Article 20 (portability) + Article 17 (erasure) compliant. We never sell creator data." },
  { q: "What’s the catch?", a: "No catch. Every product feature is on Free. You pay only if you want a custom domain ($1.99/mo add-on), or if you want Creator ($7.99) which bundles the domain with priority support and longer analytics retention, or Pro ($19.99) for team seats + custom code + email automations, or Business ($49.99) for agency sub-accounts and white-label." },
  { q: "Do you have AI features?", a: "Yes — three at MVP: theme matcher, bio rewrite, and page-copy suggestions. Free tier: 5 AI credits/month. Creator: 20/mo. Pro: 100/mo. Business: unlimited. Every AI edit shows a diff before applying — you approve, we never overwrite your voice silently." },
  { q: "How fast can I launch?", a: "30 seconds to claim your handle. Sign up free — pick a sign-in method (Google, Apple, X, or email code), and you’re building. Most creators go live in under 5 minutes." },
];

export const finalCta = {
  h2: "Ready to claim your handle?",
  sub: "Free forever. No credit card. No tricks.",
  claimPrefix: "tadaify.com/",
  claimPlaceholder: "yourname",
  claimButton: "Claim it",
  previewLabel: "Your public page",
  tinyCount: "14,283",
  tinyTail: " creators joined this month.",
};
