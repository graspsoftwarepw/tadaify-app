/**
 * Typed mock seam for the Paid articles list-page editor. Mirrors the data shown
 * in mockups/tadaify-mvp/app-page-paid-articles.html so the screen graduates by
 * swapping this factory for the real loader.
 *
 * @implements fr-page-editor-paid-articles
 */
export type PaidArticlesLayout = "grid" | "list" | "featured";

export type PaidArticlesPreviewCard = {
  id: string;
  emoji: string;
  /** Cover gradient tone key — maps to a `.pc-cover.t-*` class. */
  tone: "indigo" | "warm" | "rose" | "emerald";
  title: string;
  price: string;
};

export type PaidArticlesFixture = {
  pageTitle: string;
  slug: string;
  lede: string;
  live: boolean;
  showInNav: boolean;
  layout: PaidArticlesLayout;
  visitorControls: { search: boolean; tagFilter: boolean; sortSelector: boolean };
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  seo: { title: string; description: string };
  previewCount: number;
  preview: PaidArticlesPreviewCard[];
};

export const paidArticlesEditorFixture = (): PaidArticlesFixture => ({
  pageTitle: "Articles",
  slug: "articles",
  lede: "Long-form essays + behind-the-scenes you can't get anywhere else.",
  live: true,
  showInNav: true,
  layout: "grid",
  visitorControls: { search: true, tagFilter: true, sortSelector: false },
  backgrounds: [
    { name: "Default white", css: "#FFFFFF" },
    { name: "Cream", css: "#FAF5FF" },
    { name: "Mint", css: "#F0FDF4" },
    { name: "Slate dark", css: "#0F172A" },
    { name: "Violet", css: "#7C3AED" },
  ],
  selectedBackground: 0,
  seo: {
    title: "Alexandra Silva — Paid articles",
    description: "One-line description that shows up in Google.",
  },
  previewCount: 12,
  preview: [
    { id: "a1", emoji: "📖", tone: "indigo", title: "How I priced my last commission", price: "$5 · 12 min read" },
    { id: "a2", emoji: "☕", tone: "warm", title: "A morning in the studio", price: "$3 · 8 min read" },
    { id: "a3", emoji: "🎨", tone: "rose", title: "My color theory cheatsheet", price: "$8 · 18 min read" },
    { id: "a4", emoji: "🌱", tone: "emerald", title: "First year as a freelancer (deep dive)", price: "$12 · 30 min read" },
  ],
});
