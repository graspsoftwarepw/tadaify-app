/**
 * Typed mock seam for the Administration → Blog publishing screen. Mirrors the
 * data shown in mockups/tadaify-mvp/app-admin-blog.html so the screen graduates
 * by swapping these factories for the real loader.
 *
 * @implements fr-admin-blog
 */

export type PostStatus = "published" | "scheduled" | "draft";

/** Gradient theme applied to a post-row thumbnail (mirrors the mockup tints). */
export type PostThumbTheme = "warm" | "indigo" | "rose" | "emerald" | "slate";

export type BlogPost = {
  id: string;
  title: string;
  /** Single-glyph thumbnail badge. */
  emoji: string;
  thumb: PostThumbTheme;
  status: PostStatus;
  /** Status-line text (reads/comments, scheduled time, last edited…). */
  meta: string;
};

export type PostFilter = "all" | "published" | "drafts" | "scheduled";

export type PostTab = { id: PostFilter; label: string; count: number };

export type BlogComment = {
  id: string;
  author: string;
  initial: string;
  /** "on \"…\" · 3h ago" context line. */
  context: string;
  text: string;
};

export type AdminBlogStats = {
  /** Summary line under the Posts section header. */
  summary: string;
  tabs: PostTab[];
};

export type AdminBlogFixture = {
  handle: string;
  stats: AdminBlogStats;
  posts: BlogPost[];
  /** Pagination page labels shown in the filled state. */
  pages: string[];
  currentPage: string;
  comments: {
    provider: string;
    awaiting: string;
    items: BlogComment[];
  };
};

export const adminBlogFixture = (): AdminBlogFixture => ({
  handle: "alexandra",
  stats: {
    summary: "23 posts · 4 drafts · 1 scheduled",
    tabs: [
      { id: "all", label: "All", count: 23 },
      { id: "published", label: "Published", count: 18 },
      { id: "drafts", label: "Drafts", count: 4 },
      { id: "scheduled", label: "Scheduled", count: 1 },
    ],
  },
  posts: [
    {
      id: "p-pricing",
      title: "How I price my custom illustration commissions in 2026",
      emoji: "⚡",
      thumb: "indigo",
      status: "published",
      meta: "Apr 24 · 1.2k reads · 8 comments",
    },
    {
      id: "p-lessons",
      title: "3 lessons after 6 months of selling on tadaify",
      emoji: "📖",
      thumb: "rose",
      status: "scheduled",
      meta: "Goes live Apr 30 · 09:00 PT",
    },
    {
      id: "p-audience",
      title: "Building a small audience the slow way (draft)",
      emoji: "🌱",
      thumb: "emerald",
      status: "draft",
      meta: "Last edited 2 hours ago · 1,840 words",
    },
    {
      id: "p-routine",
      title: "My morning routine + the tools I actually use",
      emoji: "☕",
      thumb: "warm",
      status: "published",
      meta: "Apr 18 · 894 reads · 3 comments",
    },
    {
      id: "p-patreon",
      title: "Why I left Patreon for tadaify (and what I'd do differently)",
      emoji: "🧵",
      thumb: "slate",
      status: "published",
      meta: "Apr 12 · 3.4k reads · 22 comments",
    },
  ],
  pages: ["1", "2", "3"],
  currentPage: "1",
  comments: {
    provider: "Disqus",
    awaiting: "12 awaiting reply",
    items: [
      {
        id: "c-maya",
        author: "Maya R.",
        initial: "M",
        context: 'on "How I price my custom illustration commissions" · 3h ago',
        text: "This pricing breakdown is exactly what I needed. Saved + sharing with my whole studio group.",
      },
      {
        id: "c-jonas",
        author: "Jonas K.",
        initial: "J",
        context: 'on "Why I left Patreon for tadaify" · 1 day ago',
        text: "Curious — did you migrate your existing patrons or start over? Would love a follow-up post on that.",
      },
    ],
  },
});
