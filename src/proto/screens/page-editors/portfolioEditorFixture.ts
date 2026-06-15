/**
 * Typed mock seam for the Portfolio page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-portfolio.html so the screen graduates by
 * swapping this factory for the real loader.
 *
 * @implements fr-page-editor-portfolio
 */
export type PortfolioGridMode = "masonry" | "grid" | "carousel";

export type PortfolioProjectStatus = "live" | "draft" | "archived";

export type PortfolioProject = {
  id: string;
  title: string;
  emoji: string;
  tint: string;
  status: PortfolioProjectStatus;
  featured?: boolean;
  video?: string;
  meta: string;
  tags: string[];
  cta: string;
};

export type PortfolioFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  rss: boolean;
  showTags: boolean;
  showFilters: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  seo: { title: string; description: string };
  layout: { gridMode: PortfolioGridMode; itemsPerRow: number; coverSizing: string };
  counts: { all: number; published: number; drafts: number; archived: number };
  filters: string[];
  projects: PortfolioProject[];
  categories: string[];
  years: string[];
};

export const portfolioEditorFixture = (): PortfolioFixture => ({
  pageTitle: "Portfolio",
  slug: "portfolio",
  live: true,
  rss: true,
  showTags: true,
  showFilters: true,
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
    title: "Selected work — Alexandra Silva, art direction & illustration",
    description:
      "A growing collection of brand systems, illustrations and lettering pieces. Available for commissions — Lisbon & remote.",
  },
  layout: { gridMode: "masonry", itemsPerRow: 3, coverSizing: "auto" },
  counts: { all: 47, published: 42, drafts: 3, archived: 2 },
  filters: ["All", "Branding", "Illustration", "Photography", "3D", "Video", "Lettering"],
  projects: [
    { id: "p-sourdough", title: "Sourdough & Co — bakery rebrand", emoji: "🍞", tint: "warm", status: "live", featured: true, meta: "2026 · Branding · Lisbon, PT", tags: ["branding", "illustration"], cta: "Edit" },
    { id: "p-norte", title: "Norte Bank — onboarding film", emoji: "▶", tint: "indigo", status: "live", featured: true, video: "0:42", meta: "2025 · Video · Norte Bank", tags: ["video", "branding"], cta: "Edit" },
    { id: "p-sintra", title: "Sintra fog — landscape series", emoji: "📷", tint: "rose", status: "live", featured: true, meta: "2025 · Photography · Personal", tags: ["photography"], cta: "Edit" },
    { id: "p-botanica", title: "Botanica — calendar lettering", emoji: "🌿", tint: "emerald", status: "live", meta: "2025 · Illustration · Botanica Magazine", tags: ["illustration", "lettering"], cta: "Edit" },
    { id: "p-cubica", title: "Cubica — 3D type explorations", emoji: "🧊", tint: "violet", status: "live", meta: "2024 · 3D · Personal", tags: ["3d", "branding"], cta: "Edit" },
    { id: "p-marca", title: "[Draft] Marca Café — coffeeshop identity", emoji: "📐", tint: "sky", status: "draft", meta: "Last edited 2 days ago", tags: ["branding"], cta: "Continue" },
    { id: "p-afterhours", title: "After hours — Lisbon nights", emoji: "🌃", tint: "slate", status: "live", meta: "2024 · Photography · Personal", tags: ["photography"], cta: "Edit" },
    { id: "p-bee", title: "Bee & Co — packaging (2022)", emoji: "🐝", tint: "warm", status: "archived", meta: "2022 · Illustration · Bee & Co", tags: ["illustration"], cta: "Edit" },
  ],
  categories: ["Branding", "Illustration"],
  years: ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "Earlier"],
});
