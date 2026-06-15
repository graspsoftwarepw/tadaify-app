/**
 * pricingFixture — mock copy + data for the tadaify marketing pricing page.
 * Copy from mockups/tadaify-mvp/pricing.html (v2 Phase A), with the mockup's
 * internal decision-code annotations stripped from visible labels (they are
 * build artifacts, not public marketing copy). Typed so the screen can graduate
 * to a real billing catalogue later.
 *
 * @implements fr-pricing
 */

export type Tier = {
  name: string;
  /** Monthly price string used for both monthly/annual in the mockup (no separate annual figure). */
  amount: string;
  cadence: string;
  /** Display "$0/forever" Free uses a different cadence. */
  cadenceForever?: boolean;
  popular?: boolean;
  locked?: boolean;
  tagline: string;
  /** Tagline may carry a single bold phrase. */
  taglineStrong?: string;
  taglineTail?: string;
  features: string[];
  /** Optional inline note rendered after the feature list. */
  note?: { lead: string; strong: string; tail: string; tone: "amber" | "indigo" };
  cta: string;
  /** Register route query (e.g. `?plan=creator`). */
  ctaHref: string;
  ctaVariant: "primary" | "secondary";
};

export type MatrixRow = { feature: string; values: string[] };
export type MatrixGroup = { category: string; rows: MatrixRow[] };
export type CompareTabRow = { feature: string; values: string[] };
export type CompareTab = { title: string; rows: CompareTabRow[]; open?: boolean };
export type Faq = { q: string; a: string; open?: boolean };

export const hero = {
  pill: "💸 No trials · 30-day money-back on any paid tier",
  h1: "Pick your tier. Switch anytime.",
  sub: "One page is forever free. Upgrade only when you want — every paid feature is previewable on Free with a 🔒 pill, no surprise paywalls mid-edit.",
  lockTitle: "Your price is locked for life.",
  lockText1:
    "Subscribe today at Creator ($7.99), Pro ($19.99), or Business ($49.99) — pay the same price in year 3, year 5, year 10, as long as your subscription stays active. We ",
  lockTextStrong: "never",
  lockText2:
    " raise your price. Only if you cancel and re-subscribe later do you pay the then-current price.",
  billAnnual: "Annual",
  billAnnualBadge: "Save 2 months",
  billMonthly: "Monthly",
};

export const tiers: Tier[] = [
  {
    name: "Free",
    amount: "0",
    cadence: "forever",
    cadenceForever: true,
    tagline: "Everything an indie creator needs — including the full analytics dataset. No data hidden.",
    features: [
      "1 handle (tadaify.com/you)",
      "Unlimited blocks + links",
      "Full analytics dataset: cross-tab, geo+city, devices, referrers",
      "Hourly analytics refresh · 7-day history window",
      "5 AI credits/mo (theme matcher / bio rewrite / copy suggest)",
      "Inline Stripe checkout",
      'No "Powered by" footer — ever',
    ],
    note: { lead: "Optional:", strong: " Add your own domain for +$1.99/mo", tail: " — no upgrade needed.", tone: "amber" },
    cta: "Start free →",
    ctaHref: "/__proto/register",
    ctaVariant: "secondary",
  },
  {
    name: "Creator",
    amount: "7.99",
    cadence: "/mo · locked for life",
    popular: true,
    locked: true,
    tagline: 'Faster analytics, longer history, your own domain. The "I\'m serious about this" tier.',
    features: [
      "Everything in Free, plus:",
      "1 handle",
      "Full analytics dataset (same as Free)",
      "5-min analytics refresh · 90-day window",
      "Monthly CSV export",
      "1 custom domain included ($1.99/mo add-on for extras)",
      "20 AI credits/mo",
      "Sell products + communities",
      "Priority email support 24h",
      "Verified ✓ creator badge",
    ],
    cta: "Go Creator →",
    ctaHref: "/__proto/register?plan=creator",
    ctaVariant: "primary",
  },
  {
    name: "Pro",
    amount: "19.99",
    cadence: "/mo · locked for life",
    locked: true,
    tagline: "Real-time analytics, 1-year history, and the ",
    taglineStrong: "first Creator API in link-in-bio",
    taglineTail: ".",
    features: [
      "Everything in Creator, plus:",
      "1 handle",
      "Real-time live view (60s refresh polling)",
      "1-year analytics history window",
      "Daily CSV export",
      "Saved views (bookmark cross-tab combinations)",
      "API access (100 req/h) — build dashboards, Slack bots, iOS widgets",
      "100 AI credits/mo",
      "A/B testing",
      "$1.99/mo per custom domain (add-on)",
    ],
    cta: "Go Pro →",
    ctaHref: "/__proto/register?plan=pro",
    ctaVariant: "secondary",
  },
  {
    name: "Business",
    amount: "49.99",
    cadence: "/mo · locked for life",
    locked: true,
    tagline: "5 handles + 10 team members. Replay. API at scale. For music labels, talent agencies, content studios.",
    features: [
      "Everything in Pro, plus:",
      "5 handles included (add more for $9.99/mo each)",
      "10 team members included (roles: Admin / Editor / Viewer)",
      "All-time analytics history",
      "Replay (scrub past traffic sessions)",
      "API access (1,000 req/h)",
      "Scheduled email digests",
      "Parquet R2 monthly archive",
      "Identity stitching",
      "Daily CSV + Parquet R2 export",
      "$1.99/mo per custom domain (add-on)",
    ],
    note: {
      lead: "Need more than 30 handles or 10 team members?",
      strong: " Contact support",
      tail: "",
      tone: "indigo",
    },
    cta: "Start Business →",
    ctaHref: "/__proto/register?plan=business",
    ctaVariant: "secondary",
  },
];

export const addonUniversal =
  "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included. No upgrade needed.";

export const aiExplainer = {
  strong: "What counts as an AI credit?",
  body: " Theme matcher, bio rewrite, block copy suggest — text-only AI features. Image generation never consumes your AI credits. Free: 5/mo · Creator: 20/mo · Pro: 100/mo · Business: unlimited.",
};

export const matrixHead = {
  pill: "📊 Compare all tiers",
  h2: "Everything, side by side",
  sub: "Quick-scan matrix. Expandable categories below for full detail.",
  cols: ["Free", "Creator $7.99/mo", "Pro $19.99/mo", "Business $49.99/mo"],
};

export const matrix: MatrixGroup[] = [
  {
    category: "Pages & Domains",
    rows: [
      { feature: "Pages", values: ["1", "5", "20", "Unlimited"] },
      { feature: "Custom domain", values: ["+$1.99/mo add-on", "1 included", "1 incl. (extra +$1.99/mo)", "10 included"] },
      { feature: "tadaify.com subdomain", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Scheduled publishing", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Pre-launch waitlist pages", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { feature: "Full dataset (cross-tab, geo+city, devices, referrers)", values: ["✓ ALL", "✓ ALL", "✓ ALL", "✓ ALL"] },
      { feature: "Analytics refresh cadence", values: ["Hourly", "5-min stale", "Real-time (60s)", "Real-time (60s)"] },
      { feature: "Analytics history window", values: ["7 days", "90 days", "1 year", "All-time"] },
      { feature: "CSV export", values: ["✗", "Monthly", "Daily", "Daily + Parquet R2"] },
      { feature: "Saved views", values: ["✗", "✗", "✓", "✓"] },
      { feature: "Scheduled email digests", values: ["✗", "✗", "✗", "✓"] },
      { feature: "Replay (scrub traffic sessions)", values: ["✗", "✗", "✗", "✓"] },
      { feature: "API access", values: ["✗", "✗", "100 req/h", "1,000 req/h"] },
      { feature: "Parquet R2 monthly archive", values: ["✗", "✗", "✗", "✓"] },
    ],
  },
  {
    category: "AI (text-only)",
    rows: [
      { feature: "AI credits / month", values: ["5", "20", "100", "Unlimited"] },
      { feature: "Theme matcher", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Bio rewrite", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Block copy suggest", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Creator API + MCP server", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    category: "Editor & Branding",
    rows: [
      { feature: "Unlimited blocks", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Theme customization", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Custom favicon", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Verified ✓ creator badge", values: ["✗", "✓", "✓", "✓"] },
      { feature: "A/B block testing", values: ["✗", "✗", "✓", "✓"] },
      { feature: "Removable email branding", values: ["✗", "✗", "✓", "✓"] },
      { feature: "White-label exports", values: ["✗", "✗", "✗", "✓"] },
    ],
  },
  {
    category: "Commerce",
    rows: [
      { feature: "Inline Stripe checkout", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Platform fee on sales", values: ["0%", "0%", "0%", "0%"] },
      { feature: "Sell products + communities", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Abandoned-cart recovery", values: ["✗", "✗", "✓", "✓"] },
      { feature: "Advanced SEO tools", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    category: "Email & Integrations",
    rows: [
      { feature: "Email capture blocks", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Mailchimp / ConvertKit / Resend", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Zapier / Make webhooks", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Custom webhook on sale", values: ["✗", "✗", "✓", "✓"] },
      { feature: "Directory listing (opt-in)", values: ["✗", "✓", "✓", "✓"] },
    ],
  },
  {
    category: "Support & Team",
    rows: [
      { feature: "Handles", values: ["1", "1", "1", "5 included (+$9.99/mo each extra)"] },
      { feature: "Team members", values: ["✗", "✗", "✗", "10 included"] },
      { feature: "Roles + audit log (Admin/Editor/Viewer)", values: ["✗", "✗", "✗", "✓"] },
      { feature: "Support channel", values: ["Community", "Email 24h", "Email + chat 12h", "Phone 2h"] },
      { feature: "SSO (Google Workspace / Okta)", values: ["✗", "✗", "✗", "✓"] },
      { feature: "Onboarding + migration help", values: ["✗", "✗", "✗", "✓"] },
      { feature: "Dedicated account manager", values: ["✗", "✗", "✗", "✓"] },
      { feature: "99.95% uptime SLA", values: ["✗", "✗", "✗", "✓"] },
    ],
  },
  {
    category: "Guarantee",
    rows: [
      { feature: "Price locked for life", values: ["—", "✓", "✓", "✓"] },
      { feature: "30-day money-back", values: ["—", "✓", "✓", "✓"] },
    ],
  },
];

export const creatorApi = {
  pill: "⚡ Pro tier exclusive",
  h2: "Hire ChatGPT (or Claude) to manage your tada!ify",
  sub: "Pro tier ships with our ",
  subStrong: "Creator API",
  subTail: " — so your AI assistant can run your page while you focus on creating.",
  items: [
    "REST API + OpenAPI 3.0 schema published at tadaify.com/api/openapi.json",
    "MCP server (@tadaify/mcp npm) — 1-line Claude Desktop config",
    "Custom GPT instructions template — copy-paste, add your API key, done",
    'Agent-recipe gallery: "daily refresh latest YouTube video" · "pinned message from Notion DB" · "reorder by analytics"',
  ],
  ctaPrimary: "Get Creator API with Pro →",
  ctaSecondary: "View API docs",
};

export const compareTabsHead = {
  h2: "Full feature comparison",
  sub: "By category — expand to see exactly what each tier includes.",
  cols: ["Free", "Creator", "Pro", "Business"],
};

export const compareTabs: CompareTab[] = [
  {
    title: "Editor",
    open: true,
    rows: [
      { feature: "Unlimited blocks", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Theme customization", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Custom favicon", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Scheduled publishing", values: ["✗", "✓", "✓", "✓"] },
      { feature: "A/B block testing", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    title: "Commerce",
    rows: [
      { feature: "Inline Stripe checkout", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Platform fee on sales", values: ["0%", "0%", "0%", "0%"] },
      { feature: "Sell products + communities", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Abandoned-cart recovery", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    title: "Analytics",
    rows: [
      { feature: "History window", values: ["30 days", "180 days", "Unlimited", "Unlimited"] },
      { feature: "Per-block clicks", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Geography + UTM", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Conversion funnel", values: ["✗", "✓", "✓", "✓"] },
    ],
  },
  {
    title: "Email + Integrations",
    rows: [
      { feature: "Email capture blocks", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Mailchimp / ConvertKit / Resend", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Zapier / Make webhooks", values: ["✗", "✓", "✓", "✓"] },
      { feature: "Custom webhook on sale", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    title: "AI (text-only)",
    rows: [
      { feature: "AI credits / month", values: ["5", "20", "100", "Unlimited"] },
      { feature: "Theme matcher", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Bio rewrite", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Block copy suggest", values: ["✓", "✓", "✓", "✓"] },
      { feature: "Creator API + MCP server", values: ["✗", "✗", "✓", "✓"] },
    ],
  },
  {
    title: "Team + Admin",
    rows: [
      { feature: "Seats", values: ["1", "1", "2", "5 (add $8/seat)"] },
      { feature: "Roles + audit log", values: ["✗", "✗", "✓", "✓"] },
      { feature: "SSO (Google Workspace / Okta)", values: ["✗", "✗", "✗", "✓"] },
      { feature: "SLA", values: ["—", "—", "—", "99.95%"] },
    ],
  },
];

export const optBadge = {
  emoji: "💚",
  h3: "Help us grow (optional)",
  body1:
    "tada!ify never forces our brand on your page. But if you want to support an indie team growing something they care about, you can opt-in to a small ",
  bodyStrong1: '"made with tada!ify"',
  body2: " footer badge. Default ",
  bodyStrong2: "OFF",
  body3: " on every tier, always free, never tracked. Turn it on in Settings → Branding.",
};

export const faqHead = "Pricing FAQ";
export const faqs: Faq[] = [
  { q: "Will my price ever go up?", a: "No. Your price is locked for life as long as your subscription stays active. If you cancel and re-subscribe later, you pay the then-current price. We update prices for new signups only.", open: true },
  { q: "Are there free trials?", a: "No trials — they create dark-pattern pressure. Instead: every paid feature is previewable on Free with a 🔒 pill so you can see it before paying. And if you upgrade and change your mind, email us within 30 days for a full refund. No questions asked." },
  { q: "Can I have multiple pages?", a: "Free starts with 1 page (homepage). Multi-page is coming post-MVP: Creator gets 5, Pro gets 20, Business gets unlimited. All current plans lock in at the multi-page tier when the feature ships — no price bump." },
  { q: "Do you take a cut on my products?", a: "0% platform fee on every tier. We make money from subscriptions, not commissions. Stripe processor fees (~2.9% + $0.30/tx) are Stripe's — not ours." },
  { q: "Can ChatGPT manage my page for me?", a: "Yes — Pro tier ships with our Creator API + MCP server + a copy-paste Custom GPT instructions template. Your AI assistant gets read/write access to your tada!ify page. Manage blocks, update content, reorder by analytics — all from a chat prompt." },
  { q: "Why 0% fees on paid tiers?", a: "Because we already charge you a subscription. Charging again on each sale is a double-dip we opt out of. Stripe's processing fee still applies (~2.9% + 30¢) — that's Stripe's, not ours." },
  { q: "How does the money-back guarantee work?", a: 'Email us within 30 days of your first charge on any paid tier. No questions, no "reason required". Full refund, no partial prorations.' },
  { q: "Custom domain — cross-tier math?", a: "Free + $1.99/mo domain add-on = $23.88/yr. Creator tier (no add-on needed) = $95.88/yr and includes 1 domain. If you only want a domain, stay Free + add the domain. If you want support + analytics + AI, Creator is $6/mo more net." },
  { q: "Annual vs monthly — is it worth it?", a: "Annual gives you 2 months free. If you're not sure, start monthly and switch anytime — no penalty, your locked price stays the same." },
  { q: "Enterprise / over 5 seats?", a: "Business tier scales per seat ($8/seat beyond 5). For agencies managing 10+ client brands, reach out — we offer a flat custom SOW with shared billing." },
  { q: "EU VAT / sales tax?", a: "Yes, we collect EU VAT automatically for Member State buyers via Stripe Tax. Price shown excludes VAT; invoice includes both rows." },
];

export const finalCta = {
  h2: "Start free. Upgrade anytime.",
  p1: "Every paid feature is previewable on Free. Never pay for a button you haven't clicked yet.",
  p2: "🔒 Price locked for life — we never raise the price on active subscribers.",
  ctaPrimary: "Claim your handle →",
  ctaSecondary: "Already a creator? Log in",
};

export const stickyCta = {
  text: "Ready to unlock your full creator toolkit?",
  ctaFree: "Start free →",
  ctaCreator: "Go Creator $5/mo",
};
