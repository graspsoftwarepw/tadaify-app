/**
 * Typed mock seam for the public single Paid article page. Mirrors
 * mockups/tadaify-mvp/creator-paid-article-public.html so the screen graduates
 * by swapping these factories for the real article loader. Defines the FR's
 * rendered data contract: the article header (title, author, date, read time,
 * price), the free above-the-fold body, the locked body revealed after
 * purchase, the paywall card copy, comments, and related articles.
 *
 * @implements fr-creator-paid-article-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

/** A rendered block in the article body. */
export type ArticleBlock =
  | { kind: "h2"; text: string }
  | { kind: "p"; html: string }
  | { kind: "ul"; items: string[] }
  | { kind: "blockquote"; html: string };

export type ArticleComment = {
  initial: string;
  author: string;
  ago: string;
  text: string;
};

export type RelatedArticle = {
  emoji: string;
  tint: "indigo" | "warm" | "rose" | "emerald";
  title: string;
  meta: string;
};

export type PaidArticleContent = {
  creator: PublicCreator;
  /** URL slug appended to /articles/. */
  slug: string;
  title: string;
  date: string;
  readTime: string;
  /** Display price (e.g. "$5"). */
  price: string;
  priceLine: string;
  purchasedNote: string;
  coverEmoji: string;
  stickyMeta: string;
  /** Free, above-the-fold body shown to everyone. */
  freeBody: ArticleBlock[];
  /** Paywalled body revealed only after purchase. */
  lockedBody: ArticleBlock[];
  paywall: {
    heading: string;
    body: string;
    reassure: string;
    stripeNote: string;
  };
  comments: { count: number; provider: string; items: ArticleComment[] };
  related: RelatedArticle[];
  footerSocials: PublicSocial[];
};

export function paidArticleContentFixture(): PaidArticleContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    slug: "how-i-priced-my-last-commission",
    title: "How I priced my last commission",
    date: "Apr 24, 2026",
    readTime: "12 min read",
    price: "$5",
    priceLine: "$5 — pay once, read forever",
    purchasedNote: "✓ You bought this on Apr 25",
    coverEmoji: "📖",
    stickyMeta: "12 min read · pay once, read forever",
    freeBody: [
      {
        kind: "p",
        html: "Last month a returning client emailed me asking for a custom illustration commission. The brief was small on its face — a single editorial illustration for an essay they were publishing — but the brief itself opened up when I started reading more carefully. There were edge cases, a tight deadline, and an implicit ask for unlimited revisions baked into “we want to be sure it's right.”",
      },
      {
        kind: "p",
        html: "Three years ago I would have quoted $400 and been thrilled. This time I quoted $1,800 and the client said yes without negotiating. Here's exactly what changed in my thinking — and the email script I sent.",
      },
      { kind: "h2", text: "The starting point: what the client thought they were asking for" },
      {
        kind: "p",
        html: "The brief, as written, looked like a normal one-illustration job. Single deliverable, single revision round, two-week deadline. If you took that at face value, $400 felt about right for an editor pace.",
      },
      { kind: "p", html: "But the brief was wrong about itself. Three things gave it away:" },
      {
        kind: "ul",
        items: [
          "The deadline was actually seven days, not two weeks — they buried the publication date in paragraph 4.",
          "“Final approval from the executive editor” added a second decision-maker who wasn't on the kickoff thread.",
          "The piece was for a launch issue, which means social cuts, hero crop, thumbnail variants — three more deliverables disguised as one.",
        ],
      },
      {
        kind: "p",
        html: "So the real job wasn't “one editorial illustration.” The real job was “one illustration plus three derivatives, on half the timeline, with two approvers.” That's a completely different piece of work.",
      },
      { kind: "h2", text: "How I built the new quote" },
    ],
    lockedBody: [
      {
        kind: "p",
        html: "Once I'd reframed the brief, the math changed. I started with my normal editorial day rate — $600/day, full-day equivalent — and counted the actual days the work would take.",
      },
      {
        kind: "p",
        html: "Day 1 was concept and thumbnails. Two thumbnails per concept, three concepts, plus a one-page rationale doc explaining each. That's a normal first day on any editorial gig.",
      },
      {
        kind: "p",
        html: "Day 2 was tight pencil — the chosen concept rendered at full size, ready for review. With two approvers in the loop I knew this would attract feedback from both, so I padded the schedule by half a day for revisions.",
      },
      {
        kind: "p",
        html: "Day 3 was final art and color. The piece was going to print AND web, so I needed two color profiles (CMYK for print, sRGB for web) and the file would need to be delivered at 600dpi at the largest crop.",
      },
      {
        kind: "p",
        html: "Day 4 was the derivatives — social cuts at 1:1, 4:5, and 16:9, plus a hero banner and a thumbnail. Each derivative is its own composition decision; you can't just rescale.",
      },
      {
        kind: "p",
        html: "That's four full days. At $600/day my floor was $2,400. I quoted $1,800 because the client was a return customer with whom I have a great working relationship and I wanted to leave room for upside.",
      },
      { kind: "h2", text: "The email script" },
      {
        kind: "p",
        html: "Here's the exact email I sent. The structure matters: reframe → break-down → number → reassurance.",
      },
      {
        kind: "blockquote",
        html: "“Hi M — thanks for thinking of me again, I'd love to do this piece. Reading the brief carefully I see this is actually a launch-issue cover with three social derivatives on a one-week turnaround, so I want to make sure I scope it right. Here's what I'd deliver: [...] My quote for the full package is $1,800, broken down as [...]. Happy to discuss any of this — and if budget's tight, the first variation we can drop is the hero banner crop ($300) since you can re-purpose the print piece. Let me know!”",
      },
    ],
    paywall: {
      heading: "Continue reading — unlock for $5",
      body: "Pay once, read forever. Includes the rest of the breakdown, the full email script, the spreadsheet I use, and 4 more pricing scenarios.",
      reassure: "Pay once, read forever · No subscription · 7-day refund",
      stripeNote: "Secure checkout powered by Stripe",
    },
    comments: {
      count: 8,
      provider: "Disqus",
      items: [
        {
          initial: "M",
          author: "Maya R.",
          ago: "3 hours ago",
          text: "This is exactly the kind of breakdown I wish I'd had when I was starting out. Bought + saved.",
        },
        {
          initial: "J",
          author: "Jonas K.",
          ago: "1 day ago",
          text: "Quick question — do you ever quote ranges instead of a single number? Curious how you handle that.",
        },
      ],
    },
    related: [
      { emoji: "☕", tint: "warm", title: "A morning in the studio", meta: "$3 · 8 min read" },
      { emoji: "🎨", tint: "indigo", title: "My color theory cheatsheet", meta: "$8 · 18 min read" },
      { emoji: "🌱", tint: "emerald", title: "First year as a freelancer", meta: "$12 · 30 min" },
    ],
    footerSocials: [
      { label: "Instagram", glyph: "📸" },
      { label: "TikTok", glyph: "🎬" },
      { label: "YouTube", glyph: "▶️" },
    ],
  };
}
