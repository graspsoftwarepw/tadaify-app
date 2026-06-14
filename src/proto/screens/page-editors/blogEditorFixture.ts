/**
 * Typed mock seam for the Blog page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-blog.html so the screen graduates by swapping
 * this factory for the real loader.
 *
 * @implements fr-page-editor-blog
 */
export type BlogPostStatus = "live" | "draft" | "scheduled";

export type BlogPost = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  status: BlogPostStatus;
  meta: string;
  metaBold?: string;
  tags: string[];
  cta: string;
};

export type BlogFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  rss: boolean;
  authorByline: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  seo: { title: string; description: string };
  layout: { cardLayout: string; postsPerPage: number; sort: string };
  counts: { all: number; published: number; drafts: number; scheduled: number };
  posts: BlogPost[];
  authors: string[];
};

export const blogEditorFixture = (): BlogFixture => ({
  pageTitle: "Blog",
  slug: "blog",
  live: true,
  rss: true,
  authorByline: true,
  backgrounds: [
    { name: "Inherit theme", css: "var(--bg)" },
    { name: "White", css: "#FFFFFF" },
    { name: "Warm cream", css: "#F8F4EE" },
    { name: "Slate", css: "#1F2937" },
    { name: "Dark canvas", css: "#0B0F1E" },
    { name: "Sunrise", css: "linear-gradient(135deg,#FDE68A,#F59E0B)" },
    { name: "Indigo", css: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { name: "Nightfall", css: "linear-gradient(135deg,#0F172A,#334155)" },
  ],
  selectedBackground: 0,
  seo: {
    title: "Strong Not Skinny — Blog by Alexandra Silva",
    description:
      "Honest essays on training, recovery and building strength without burning out. New posts every Tuesday.",
  },
  layout: { cardLayout: "cards", postsPerPage: 10, sort: "newest" },
  counts: { all: 23, published: 18, drafts: 3, scheduled: 2 },
  posts: [
    {
      id: "p-habits",
      title: "10 morning habits of high-energy women",
      emoji: "📝",
      tint: "warm",
      status: "live",
      meta: "4 days ago · 6 min read",
      tags: ["habits", "mindset"],
      cta: "Edit",
    },
    {
      id: "p-prs",
      title: "Why I stopped chasing PRs (and what I do instead)",
      emoji: "💪",
      tint: "rose",
      status: "live",
      meta: "2 weeks ago · 8 min read",
      tags: ["training"],
      cta: "Edit",
    },
    {
      id: "p-reset",
      title: "A 5-day reset for when training feels heavy",
      emoji: "🌅",
      tint: "indigo",
      status: "scheduled",
      meta: "Goes live ",
      metaBold: "Tue, May 5 · 8:00",
      tags: ["recovery"],
      cta: "Edit",
    },
    {
      id: "p-macros",
      title: "[Draft] Macro tracking without losing your weekend",
      emoji: "🥬",
      tint: "emerald",
      status: "draft",
      meta: "Last edited yesterday by you",
      tags: ["nutrition"],
      cta: "Continue",
    },
    {
      id: "p-sleep",
      title: "Sleep first, supplements second",
      emoji: "🌙",
      tint: "slate",
      status: "live",
      meta: "1 month ago · 5 min read · 1.2k reads",
      tags: ["recovery", "mindset"],
      cta: "Edit",
    },
  ],
  authors: [
    "Alexandra Silva (you)",
    "Maya Chen — Co-coach",
    "Jordan Park — Guest contributor",
  ],
});
