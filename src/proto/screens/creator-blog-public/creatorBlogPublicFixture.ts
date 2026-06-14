/**
 * Typed mock seam for the public Blog page. Mirrors
 * mockups/tadaify-mvp/creator-blog-public.html so the screen graduates by
 * swapping these factories for the real published-blog loader. Defines the
 * FR's rendered data contract: the post list with metadata, the tag filter
 * bar, a full single-post body, related posts, and the comments providers.
 *
 * @implements fr-creator-blog-public
 */

export type BlogNavLink = { label: string; href: string; current?: boolean };

/** Cover gradient variants ported from the mockup `.pc-cover` modifier classes. */
export type CoverTint = "amber" | "indigo" | "rose" | "emerald" | "slate" | "sky";

export type BlogTag = { slug: string; label: string };

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  cover: CoverTint;
  emoji: string;
  author: string;
  authorInitial: string;
  date: string;
  readTime: string;
  /** Tags used both for the chip badges and the tag-filter matching. */
  tags: string[];
};

export type PostBodyBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "ul"; items: string[] };

export type RelatedPost = {
  slug: string;
  title: string;
  cover: CoverTint;
  emoji: string;
  readTime: string;
  tag: string;
};

export type SinglePost = {
  slug: string;
  title: string;
  cover: CoverTint;
  emoji: string;
  author: string;
  authorInitial: string;
  dateLong: string;
  readTime: string;
  body: PostBodyBlock[];
  tags: string[];
  related: RelatedPost[];
};

export type CommentsProvider = "disqus" | "hyvor" | "off";

export type CommentsPanel = {
  /** Rendered with <b> emphasis on the leading provider name. */
  leadEm: string;
  leadRest: string;
  sub: string;
  settingsLink?: { label: string; href: string };
};

export type SocialLink = { label: string; glyph: string };

export type BlogContent = {
  nav: BlogNavLink[];
  hero: {
    handle: string;
    initial: string;
    name: string;
    title: string;
    lede: string;
    postCount: number;
    span: string;
  };
  tags: BlogTag[];
  posts: BlogPostCard[];
  pagination: { rangeStart: number; rangeEnd: number; total: number; pages: number[]; current: number };
  single: SinglePost;
  comments: Record<CommentsProvider, CommentsPanel>;
  socials: SocialLink[];
  footerNote: string;
};

export const blogContentFixture = (): BlogContent => ({
  nav: [
    { label: "Home", href: "/__proto/creator-public" },
    { label: "About", href: "/__proto/creator-about-public" },
    { label: "Blog", href: "/__proto/creator-blog-public", current: true },
    { label: "Portfolio", href: "#" },
    { label: "Book", href: "#" },
    { label: "Contact", href: "#" },
  ],
  hero: {
    handle: "alexandra",
    initial: "A",
    name: "Alexandra Silva",
    title: "Strong Not Skinny — Blog",
    lede:
      "Honest essays on training, recovery and building strength without burning out. New posts every Tuesday — read in your inbox or right here.",
    postCount: 23,
    span: "2 years",
  },
  tags: [
    { slug: "training", label: "training" },
    { slug: "recovery", label: "recovery" },
    { slug: "mindset", label: "mindset" },
    { slug: "nutrition", label: "nutrition" },
    { slug: "habits", label: "habits" },
  ],
  posts: [
    {
      slug: "morning-habits",
      title: "10 morning habits of high-energy women",
      excerpt:
        "The morning is where your day is won or lost. Here are the 10 habits I run before 9am — none of them require an ice bath.",
      cover: "amber",
      emoji: "📝",
      author: "Alexandra",
      authorInitial: "A",
      date: "Apr 22 · 6 min",
      readTime: "6 min",
      tags: ["habits", "mindset"],
    },
    {
      slug: "why-i-stopped-chasing-prs",
      title: "Why I stopped chasing PRs (and what I do instead)",
      excerpt:
        "Personal records used to be everything. Now they're a side effect — here's what replaced them and why I lift more these days.",
      cover: "rose",
      emoji: "💪",
      author: "Alexandra",
      authorInitial: "A",
      date: "Apr 8 · 8 min",
      readTime: "8 min",
      tags: ["training"],
    },
    {
      slug: "5-day-reset-for-heavy-training",
      title: "A 5-day reset for when training feels heavy",
      excerpt:
        "Some weeks the bar feels heavier than it should. The 5-day protocol I run to bring myself back without losing the base I built.",
      cover: "indigo",
      emoji: "🌅",
      author: "Alexandra",
      authorInitial: "A",
      date: "Apr 2 · 7 min",
      readTime: "7 min",
      tags: ["recovery"],
    },
    {
      slug: "sleep-first-supplements-second",
      title: "Sleep first, supplements second",
      excerpt:
        "Stack of pills and powders, but you sleep 5 hours? You're shovelling sand into a leaky bucket. Sleep is the multiplier — start there.",
      cover: "slate",
      emoji: "🌙",
      author: "Alexandra",
      authorInitial: "A",
      date: "Mar 25 · 5 min",
      readTime: "5 min",
      tags: ["recovery", "mindset"],
    },
    {
      slug: "macros-without-losing-weekend",
      title: "Macro tracking without losing your weekend",
      excerpt:
        "A pragmatic 80/20 system for tracking that keeps you eating with friends, not weighing chicken breast at brunch.",
      cover: "emerald",
      emoji: "🥬",
      author: "Alexandra",
      authorInitial: "A",
      date: "Mar 18 · 9 min",
      readTime: "9 min",
      tags: ["nutrition"],
    },
    {
      slug: "training-with-anxiety",
      title: "Training with anxiety — what works for me",
      excerpt:
        "A long letter to anyone who has stood at the squat rack, knees weak, mind louder than the playlist. You're not alone, and there's a path out.",
      cover: "sky",
      emoji: "🧠",
      author: "Alexandra",
      authorInitial: "A",
      date: "Mar 11 · 11 min",
      readTime: "11 min",
      tags: ["mindset", "training"],
    },
  ],
  pagination: { rangeStart: 1, rangeEnd: 6, total: 23, pages: [1, 2, 3, 4], current: 1 },
  single: {
    slug: "5-day-reset-for-heavy-training",
    title: "A 5-day reset for when training feels heavy",
    cover: "indigo",
    emoji: "🌅",
    author: "Alexandra Silva",
    authorInitial: "A",
    dateLong: "Apr 2, 2026",
    readTime: "7 min read",
    body: [
      {
        kind: "p",
        text:
          "Some weeks the bar feels heavier than it should. Sleep slips, work piles up, motivation thins. Trying to grind through it usually costs you more than backing off would.",
      },
      {
        kind: "p",
        text:
          "Here's the 5-day reset I run when training stops feeling good — it brings me back without losing the base I built.",
      },
      { kind: "h2", text: "Day 1 — Cut volume by 50%" },
      {
        kind: "p",
        text:
          "Same lifts, half the sets. Eat to maintenance. Sleep nine hours. The point isn't to train less; it's to train deliberately less. Let your nervous system breathe.",
      },
      {
        kind: "blockquote",
        text: '"You can\'t out-program a tired body. You can only out-rest it."',
      },
      { kind: "h2", text: "Day 2-3 — Walk + breathe" },
      {
        kind: "p",
        text:
          "No barbells. Two long walks per day, twenty minutes of slow breathing in the evening. Sounds passive — feels active. By Day 3 your shoulders sit a centimetre lower than they did on Monday.",
      },
      {
        kind: "ul",
        items: [
          "Walk before coffee, in daylight",
          "Box-breath 4-4-4-4 for ten rounds",
          "Carbs around dinner, not breakfast",
        ],
      },
      { kind: "h2", text: "Day 4 — Light return" },
      {
        kind: "p",
        text:
          "One session, 60% intensity, five reps below your true tens. The goal is to remember what good movement feels like, not to test anything. Walk away wanting more.",
      },
      { kind: "h2", text: "Day 5 — Honest check-in" },
      {
        kind: "p",
        text:
          "If you woke up wanting to train, you're back. If you didn't, repeat Days 2-3 and try again. The protocol works on the timeline your body sets, not yours.",
      },
      {
        kind: "p",
        text:
          "Try it the next time you feel flat for more than 4 days in a row. Strong is what you build between the heavy weeks, not despite them.",
      },
    ],
    tags: ["recovery", "training"],
    related: [
      {
        slug: "sleep-first-supplements-second",
        title: "Sleep first, supplements second",
        cover: "slate",
        emoji: "🌙",
        readTime: "5 min",
        tag: "recovery",
      },
      {
        slug: "training-with-anxiety",
        title: "Training with anxiety — what works for me",
        cover: "sky",
        emoji: "🧠",
        readTime: "11 min",
        tag: "mindset",
      },
      {
        slug: "morning-habits",
        title: "10 morning habits of high-energy women",
        cover: "amber",
        emoji: "📝",
        readTime: "6 min",
        tag: "habits",
      },
    ],
  },
  comments: {
    disqus: {
      leadEm: "Disqus",
      leadRest: " embed renders here. Creator picks the provider in Page settings → Comments.",
      sub: "No tracking, no third-party fonts. Visitors keep their privacy.",
      settingsLink: { label: "Page settings → Comments", href: "#" },
    },
    hyvor: {
      leadEm: "Hyvor Talk",
      leadRest: " embed renders here. Privacy-first, GDPR-friendly, no ads.",
      sub: "Free up to 1k pageviews/month — perfect for indie blogs.",
    },
    off: {
      leadEm: "Comments are off",
      leadRest: " for this post.",
      sub: "Reach Alexandra by email instead — link in the footer.",
    },
  },
  socials: [
    { label: "Instagram", glyph: "📸" },
    { label: "TikTok", glyph: "🎵" },
    { label: "YouTube", glyph: "📺" },
    { label: "Email", glyph: "✉️" },
  ],
  footerNote: "Powered by",
});
