/**
 * Typed mock seam for the public Paid articles listing page. Mirrors
 * mockups/tadaify-mvp/creator-paid-articles-public.html so the screen graduates
 * by swapping these factories for the real published-articles loader. Defines
 * the FR's rendered data contract: the page hero count, the filter tags, and
 * the article cards (cover tint + emoji, locked badge, title, excerpt, price,
 * read time, and the tags each card carries for filtering).
 *
 * @implements fr-creator-paid-articles-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

/** Cover gradient tints, matching the mockup's `.t-*` classes. */
export type ArticleTint = "indigo" | "warm" | "rose" | "emerald" | "slate";

export type PaidArticleCard = {
  /** Stable id used as the React key and the focus target. */
  id: string;
  emoji: string;
  tint: ArticleTint;
  title: string;
  excerpt: string;
  /** Display price (e.g. "$5"). */
  price: string;
  readTime: string;
  /** Filter tags this card matches (lowercased labels from `tags`). */
  tags: string[];
};

export type PaidArticlesContent = {
  creator: PublicCreator;
  hero: { count: number; lede: string };
  /** Filter chips, in order. First is the "All" chip. */
  tags: string[];
  articles: PaidArticleCard[];
  /** Total in the catalogue (for the "Load more" affordance). */
  total: number;
  footerSocials: PublicSocial[];
};

export function paidArticlesContentFixture(): PaidArticlesContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    hero: {
      count: 12,
      lede: "Long-form essays + behind-the-scenes you can't get anywhere else. One-time price per article — no subscription.",
    },
    tags: ["All", "Pricing", "Process", "Behind the scenes", "Tools", "Career"],
    total: 12,
    footerSocials: [
      { label: "Instagram", glyph: "📸" },
      { label: "TikTok", glyph: "🎬" },
      { label: "YouTube", glyph: "▶️" },
    ],
    articles: [
      {
        id: "priced-commission",
        emoji: "📖",
        tint: "indigo",
        title: "How I priced my last commission",
        excerpt:
          "A walkthrough of the exact thinking that took a $400 quote up to $1,800 — what I added, what I cut, and the email script I sent.",
        price: "$5",
        readTime: "12 min read",
        tags: ["pricing", "process"],
      },
      {
        id: "morning-studio",
        emoji: "☕",
        tint: "warm",
        title: "A morning in the studio",
        excerpt:
          "Hour-by-hour photo essay of a typical work day — coffee setup, Pomodoro routine, the playlist.",
        price: "$3",
        readTime: "8 min read",
        tags: ["behind the scenes"],
      },
      {
        id: "color-theory",
        emoji: "🎨",
        tint: "rose",
        title: "My color theory cheatsheet",
        excerpt:
          "Every palette I use + the quick rules for picking complementary, analogous, and triadic combinations on the fly.",
        price: "$8",
        readTime: "18 min read",
        tags: ["process", "tools"],
      },
      {
        id: "first-year-freelancer",
        emoji: "🌱",
        tint: "emerald",
        title: "First year as a freelancer (deep dive)",
        excerpt:
          "The full recap — clients, money, taxes, mistakes. Includes my actual P&L spreadsheet.",
        price: "$12",
        readTime: "30 min read",
        tags: ["career", "behind the scenes"],
      },
      {
        id: "contract-template",
        emoji: "🧵",
        tint: "slate",
        title: "The contract template I send every client",
        excerpt:
          "My one-page MSA — what's in it, why each clause matters, and the 3 lines that saved me from a dispute last year.",
        price: "$10",
        readTime: "15 min read",
        tags: ["tools", "process"],
      },
      {
        id: "find-clients",
        emoji: "💼",
        tint: "indigo",
        title: "How I find clients without a network",
        excerpt:
          "The 3 channels that actually moved the needle in my first 18 months — what I tried, what flopped, what I'd do again.",
        price: "$7",
        readTime: "14 min read",
        tags: ["career"],
      },
    ],
  };
}
