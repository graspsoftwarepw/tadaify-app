/**
 * Typed mock seam for the Administration → Portfolio project-management view.
 * Mirrors the data shown in mockups/tadaify-mvp/app-admin-portfolio.html so the
 * screen graduates by swapping this factory for the real loader.
 *
 * @implements fr-admin-portfolio
 */

export type ProjectStatus = "published" | "draft" | "archived";

export type ProjectCardTone = "indigo" | "emerald" | "warm" | "slate" | "rose";

export type ProjectCard = {
  id: string;
  title: string;
  glyph: string;
  tone: ProjectCardTone;
  category: string;
  status: ProjectStatus;
  featured?: boolean;
  /** Right-hand meta line after the category. */
  meta: string;
};

export type ProjectTab = { id: string; label: string; count: number };

export type ProjectSortOption = string;

export type TemplateTile = { name: string; sub: string };

export type CategoryOption = string;

export type AdminPortfolioFixture = {
  /** Public URL the page is published at, shown in the appbar handle pill area. */
  pageUrl: string;
  summary: string;
  tabs: ProjectTab[];
  sortOptions: ProjectSortOption[];
  projects: ProjectCard[];
  pages: string[];
  currentPage: number;
  templates: TemplateTile[];
  composerCategories: CategoryOption[];
};

export const adminPortfolioFixture = (): AdminPortfolioFixture => ({
  pageUrl: "tadaify.com/alexandra/portfolio",
  summary: "12 total · 9 published, 2 drafts, 1 archived",
  tabs: [
    { id: "all", label: "All", count: 12 },
    { id: "published", label: "Published", count: 9 },
    { id: "drafts", label: "Drafts", count: 2 },
    { id: "archived", label: "Archived", count: 1 },
  ],
  sortOptions: [
    "Custom order (drag to reorder)",
    "Newest first",
    "Oldest first",
    "Most viewed",
    "A → Z",
  ],
  projects: [
    {
      id: "p-cosmic",
      title: "Cosmic Brand Identity — Stellar Coffee Co.",
      glyph: "✦",
      tone: "indigo",
      category: "Branding",
      status: "published",
      featured: true,
      meta: "1.4k views",
    },
    {
      id: "p-sunrise",
      title: "Sunrise Series — Photography",
      glyph: "🌅",
      tone: "warm",
      category: "Photo",
      status: "published",
      meta: "892 views",
    },
    {
      id: "p-greenhouse",
      title: "Greenhouse — App Redesign",
      glyph: "🌿",
      tone: "emerald",
      category: "UI/UX",
      status: "published",
      meta: "2.1k views",
    },
    {
      id: "p-theatre",
      title: "Theatre Posters — A Midsummer Night's Dream",
      glyph: "🎭",
      tone: "rose",
      category: "Print",
      status: "draft",
      meta: "Not published",
    },
    {
      id: "p-alpine",
      title: "Alpine Field Notes — Editorial",
      glyph: "🏔",
      tone: "slate",
      category: "Editorial",
      status: "published",
      meta: "674 views",
    },
    {
      id: "p-old-site",
      title: "Old Portfolio Site (2021)",
      glyph: "🗄",
      tone: "indigo",
      category: "Web",
      status: "archived",
      meta: "Hidden from visitors",
    },
  ],
  pages: ["1", "2"],
  currentPage: 1,
  templates: [
    { name: "📐 Case study", sub: "Problem → process → result" },
    { name: "📸 Image gallery", sub: "Cover + lightbox grid" },
    { name: "🎬 Video showcase", sub: "Embed + description" },
    { name: "💻 Code project", sub: "Repo link + screenshots" },
  ],
  composerCategories: [
    "Branding",
    "UI/UX",
    "Photography",
    "Print",
    "Code",
    "Editorial",
    "Other",
  ],
});
