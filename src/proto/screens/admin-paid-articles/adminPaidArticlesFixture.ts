/**
 * Typed mock seam for the Administration → Paid articles screen. Mirrors the
 * data shown in mockups/tadaify-mvp/app-admin-paid-articles.html so the screen
 * graduates by swapping these factories for the real loader.
 *
 * @implements fr-admin-paid-articles
 */

export type StripeStatus = "connected" | "not-connected";

export type ArticleState = "published" | "draft";

/** A spark-bar height (0-100) for the revenue mini-chart. */
export type SparkBar = number;

export type SalesStat = {
  id: string;
  label: string;
  value: string;
  /** Smaller value rendering for long text (the "Top article" card). */
  valueSmall?: boolean;
  sub: string;
  spark?: SparkBar[];
};

export type ArticleThumbTone = "indigo" | "warm" | "rose" | "emerald" | "slate";

export type Article = {
  id: string;
  emoji: string;
  thumbTone: ArticleThumbTone;
  title: string;
  state: ArticleState;
  /** Right-hand meta line (read time, date, extras). */
  meta: string;
  price: string;
  /** Sales count, or "—" for drafts. */
  sales: string;
  salesLabel: string;
  /** Revenue, or "—" for drafts. */
  revenue: string;
  revenueLabel: string;
};

export type ArticleTab = { id: string; label: string; count: number };

export type AdminPaidArticlesFixture = {
  handle: string;
  stripe: {
    status: StripeStatus;
    connectedTitle: string;
    connectedSub: string;
    warnTitle: string;
    warnSub: string;
  };
  stats: SalesStat[];
  sectionSub: string;
  tabs: ArticleTab[];
  articles: Article[];
};

export const adminPaidArticlesFixture = (): AdminPaidArticlesFixture => ({
  handle: "alexandra",
  stripe: {
    status: "connected",
    connectedTitle: "Stripe Connect — Connected",
    connectedSub:
      "Payouts go to your bank account ending ····4231 every 2 days. Tax handled automatically (EU + US).",
    warnTitle: "Connect Stripe to start selling",
    warnSub:
      "Paid articles need Stripe Connect to take payments + send payouts. Setup takes 5 minutes — bank account + ID upload.",
  },
  stats: [
    {
      id: "revenue-month",
      label: "Revenue this month",
      value: "$248",
      sub: "42 sales · ↑ 18% vs last month",
      spark: [30, 55, 40, 70, 60, 85, 95],
    },
    {
      id: "top-article",
      label: "Top article",
      value: "Color theory cheatsheet",
      valueSmall: true,
      sub: "$8 · 28 sales · $224",
    },
    {
      id: "lifetime-revenue",
      label: "Lifetime revenue",
      value: "$1,840",
      sub: "312 sales · 12 articles",
    },
  ],
  sectionSub: "12 published · 2 drafts",
  tabs: [
    { id: "all", label: "All", count: 14 },
    { id: "published", label: "Published", count: 12 },
    { id: "drafts", label: "Drafts", count: 2 },
  ],
  articles: [
    {
      id: "a-color-theory",
      emoji: "🎨",
      thumbTone: "indigo",
      title: "My color theory cheatsheet",
      state: "published",
      meta: "18 min · Apr 22",
      price: "$8",
      sales: "28",
      salesLabel: "sales",
      revenue: "$224",
      revenueLabel: "revenue",
    },
    {
      id: "a-priced-commission",
      emoji: "📖",
      thumbTone: "indigo",
      title: "How I priced my last commission",
      state: "published",
      meta: "12 min · Apr 24",
      price: "$5",
      sales: "21",
      salesLabel: "sales",
      revenue: "$105",
      revenueLabel: "revenue",
    },
    {
      id: "a-first-year",
      emoji: "🌱",
      thumbTone: "emerald",
      title: "First year as a freelancer (deep dive)",
      state: "published",
      meta: "30 min · Apr 18 · Includes spreadsheet",
      price: "$12",
      sales: "14",
      salesLabel: "sales",
      revenue: "$168",
      revenueLabel: "revenue",
    },
    {
      id: "a-morning-studio",
      emoji: "☕",
      thumbTone: "warm",
      title: "A morning in the studio",
      state: "published",
      meta: "8 min · Apr 12",
      price: "$3",
      sales: "34",
      salesLabel: "sales",
      revenue: "$102",
      revenueLabel: "revenue",
    },
    {
      id: "a-pricing-2026",
      emoji: "📝",
      thumbTone: "rose",
      title: "Pricing my freelance illustration in 2026 (draft)",
      state: "draft",
      meta: "Last edited 3h ago · 2,840 words",
      price: "$7",
      sales: "—",
      salesLabel: "not pub",
      revenue: "—",
      revenueLabel: "—",
    },
  ],
});
