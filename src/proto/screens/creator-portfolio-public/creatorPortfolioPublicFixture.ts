/**
 * Typed mock seam for the public Portfolio page. Mirrors
 * mockups/tadaify-mvp/creator-portfolio-public.html so the screen graduates by
 * swapping these factories for the real published-portfolio loader. Defines the
 * FR's rendered data contract: the project list with metadata/tags, the tag and
 * layout controls, the carousel deck, a full single-project case study (body,
 * gallery, collaborators, related), and the footer social block.
 *
 * @implements fr-creator-portfolio-public
 */

export type PortfolioNavLink = { label: string; href: string; current?: boolean };

/** Cover gradient variants ported from the mockup `.cover` modifier classes. */
export type CoverTint =
  | "indigo"
  | "warm"
  | "rose"
  | "emerald"
  | "slate"
  | "sky"
  | "violet";

/** Masonry card height variants — the asymmetric heights are the point of masonry. */
export type MasonryHeight = "tall" | "mid" | "low";

export type PortfolioTag = { slug: string; label: string };

export type ProjectCard = {
  slug: string;
  title: string;
  emoji: string;
  cover: CoverTint;
  /** Only used by the masonry layout. */
  height: MasonryHeight;
  /** Meta line, e.g. "2026 · Lisbon" (masonry) / "2026" (grid). */
  yearLine: string;
  gridYear: string;
  /** Tag badges shown on the card and used for the tag-filter matching. */
  tags: string[];
  featured?: boolean;
  /** Video duration pill, e.g. "0:42". */
  videoPill?: string;
};

export type CarouselSlide = {
  slug: string;
  title: string;
  emoji: string;
  cover: CoverTint;
  year: string;
  client: string;
  tags: string[];
};

export type ProjectBodyBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "ul"; items: string[] };

export type GalleryImage = { emoji: string; cover: CoverTint; name: string };

export type Collaborator = { initial: string; name: string; role: string };

export type RelatedProject = {
  slug: string;
  title: string;
  emoji: string;
  cover: CoverTint;
  year: string;
  tag: string;
};

export type SingleProject = {
  slug: string;
  title: string;
  emoji: string;
  cover: CoverTint;
  year: string;
  medium: string;
  client: string;
  body: ProjectBodyBlock[];
  gallery: GalleryImage[];
  collaborators: Collaborator[];
  externalCta: { label: string; href: string };
  tags: string[];
  related: RelatedProject[];
};

export type SocialLink = { label: string; glyph: string };

export type PortfolioContent = {
  nav: PortfolioNavLink[];
  hero: {
    handle: string;
    initial: string;
    name: string;
    title: string;
    lede: string;
    projectCount: number;
    span: string;
    contactEmail: string;
  };
  sortOptions: { value: string; label: string }[];
  tags: PortfolioTag[];
  projects: ProjectCard[];
  carousel: CarouselSlide[];
  pagination: { rangeStart: number; rangeEnd: number; total: number; pages: number[]; current: number };
  single: SingleProject;
  socials: SocialLink[];
  footerNote: string;
};

export const portfolioContentFixture = (): PortfolioContent => ({
  nav: [
    { label: "Home", href: "/__proto/creator-public" },
    { label: "About", href: "/__proto/creator-about-public" },
    { label: "Blog", href: "/__proto/creator-blog-public" },
    { label: "Portfolio", href: "/__proto/creator-portfolio-public", current: true },
    { label: "Book", href: "#" },
    { label: "Contact", href: "#" },
  ],
  hero: {
    handle: "alexandra",
    initial: "A",
    name: "Alexandra Silva",
    title: "Selected work",
    lede:
      "A growing collection of brand systems, illustrations, and photography from the last six years. Available for commissions — Lisbon & remote.",
    projectCount: 47,
    span: "6 years",
    contactEmail: "hello@alexandrasilva.studio",
  },
  sortOptions: [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "featured", label: "Featured first" },
  ],
  tags: [
    { slug: "branding", label: "Branding" },
    { slug: "illustration", label: "Illustration" },
    { slug: "photography", label: "Photography" },
    { slug: "3d", label: "3D" },
    { slug: "video", label: "Video" },
    { slug: "lettering", label: "Lettering" },
  ],
  projects: [
    {
      slug: "sourdough-and-co",
      title: "Sourdough & Co — bakery rebrand",
      emoji: "🍞",
      cover: "warm",
      height: "tall",
      yearLine: "2026 · Lisbon",
      gridYear: "2026",
      tags: ["branding", "illustration"],
      featured: true,
    },
    {
      slug: "norte-bank-film",
      title: "Norte Bank — onboarding film",
      emoji: "▶",
      cover: "slate",
      height: "mid",
      yearLine: "2025 · Norte Bank",
      gridYear: "2025",
      tags: ["video", "branding"],
      featured: true,
      videoPill: "0:42",
    },
    {
      slug: "sintra-fog",
      title: "Sintra fog — landscape series",
      emoji: "📷",
      cover: "rose",
      height: "mid",
      yearLine: "2025 · Personal",
      gridYear: "2025",
      tags: ["photography"],
      featured: true,
    },
    {
      slug: "botanica",
      title: "Botanica — calendar lettering",
      emoji: "🌿",
      cover: "emerald",
      height: "low",
      yearLine: "2025",
      gridYear: "2025",
      tags: ["illustration", "lettering"],
    },
    {
      slug: "cubica",
      title: "Cubica — 3D type explorations",
      emoji: "🧊",
      cover: "violet",
      height: "tall",
      yearLine: "2024 · Personal",
      gridYear: "2024",
      tags: ["3d", "branding"],
    },
    {
      slug: "after-hours",
      title: "After hours — Lisbon nights",
      emoji: "🌃",
      cover: "slate",
      height: "mid",
      yearLine: "2024 · Personal",
      gridYear: "2024",
      tags: ["photography"],
    },
    {
      slug: "marca-cafe",
      title: "Marca Café — coffeeshop identity",
      emoji: "📐",
      cover: "sky",
      height: "low",
      yearLine: "2024 · Marca",
      gridYear: "2024",
      tags: ["branding"],
    },
    {
      slug: "petalo",
      title: "Pétalo — perfume box illustration",
      emoji: "🌸",
      cover: "rose",
      height: "low",
      yearLine: "2024 · Pétalo Studio",
      gridYear: "2024",
      tags: ["illustration"],
    },
    {
      slug: "ferrocarril",
      title: "Ferrocarril — heritage railway poster set",
      emoji: "🚂",
      cover: "warm",
      height: "mid",
      yearLine: "2023 · CP Comboios",
      gridYear: "2023",
      tags: ["branding", "lettering"],
    },
  ],
  carousel: [
    {
      slug: "sourdough-and-co",
      title: "Sourdough & Co — bakery rebrand",
      emoji: "🍞",
      cover: "warm",
      year: "2026",
      client: "Lisbon, PT",
      tags: ["branding", "illustration"],
    },
    {
      slug: "norte-bank-film",
      title: "Norte Bank — onboarding film",
      emoji: "▶",
      cover: "slate",
      year: "2025",
      client: "Norte Bank",
      tags: ["video", "branding"],
    },
    {
      slug: "sintra-fog",
      title: "Sintra fog — landscape series",
      emoji: "📷",
      cover: "rose",
      year: "2025",
      client: "Personal",
      tags: ["photography"],
    },
    {
      slug: "botanica",
      title: "Botanica — calendar lettering",
      emoji: "🌿",
      cover: "emerald",
      year: "2025",
      client: "Botanica",
      tags: ["illustration", "lettering"],
    },
    {
      slug: "cubica",
      title: "Cubica — 3D type explorations",
      emoji: "🧊",
      cover: "violet",
      year: "2024",
      client: "Personal",
      tags: ["3d", "branding"],
    },
    {
      slug: "marca-cafe",
      title: "Marca Café — coffeeshop identity",
      emoji: "📐",
      cover: "sky",
      year: "2024",
      client: "Marca",
      tags: ["branding"],
    },
  ],
  pagination: { rangeStart: 1, rangeEnd: 9, total: 47, pages: [1, 2, 3, 4, 5], current: 1 },
  single: {
    slug: "sourdough-and-co",
    title: "Sourdough & Co — bakery rebrand",
    emoji: "🍞",
    cover: "warm",
    year: "2026",
    medium: "Branding · Illustration",
    client: "Sourdough & Co",
    body: [
      {
        kind: "p",
        text:
          "A four-month rebrand for a Lisbon neighborhood bakery — identity system, packaging across twelve SKUs, three custom illustrations for the seasonal range, and a printed loyalty card you genuinely want to keep in your wallet.",
      },
      {
        kind: "p",
        text:
          "The wordmark uses a single-stroke italic to evoke a baker's quick chalk hand on a paper bag. The seal sits in a softened crest — formal enough for the loaf wrappers, friendly enough for the kids' birthday boxes.",
      },
      { kind: "h2", text: "Brief" },
      {
        kind: "p",
        text:
          "Sourdough & Co opened in 2018 with a logo cobbled together from a photo of a vintage Portuguese bakery sign. They wanted an identity that could grow with them — three more locations were already on the roadmap.",
      },
      {
        kind: "blockquote",
        text:
          '"We needed something that doesn\'t shrink. The old logo only worked at the size we found it. The new one had to read on a 5cm sticker and a 2-metre awning."',
      },
      { kind: "h2", text: "Process" },
      {
        kind: "ul",
        items: [
          "Two weeks of café visits + interviews with the head baker, two staff, six regulars",
          "Three rounds of mark exploration; the chalk-italic landed in round 2",
          "Packaging system: paper bags + wax-paper sheets + wooden bread tags + reusable cotton totes",
          "Custom illustrations for the seasonal range (winter, spring, summer, fall) — printed in two-colour",
          'Loyalty card in pearl card stock with hot foil — the "want to keep" object',
        ],
      },
      { kind: "h2", text: "Outcome" },
      {
        kind: "p",
        text:
          "Six months in, two new locations opened with the system applied end-to-end. The seasonal illustrations now drive an Instagram following the bakery did not have before — the original ask was identity, the unexpected outcome was content.",
      },
    ],
    gallery: [
      { emoji: "🍞", cover: "warm", name: "Cover — wordmark + crest" },
      { emoji: "🥖", cover: "rose", name: "Loaf wrapper" },
      { emoji: "🌾", cover: "emerald", name: "Seasonal illustration — winter" },
      { emoji: "🧁", cover: "indigo", name: "Loyalty card — pearl + foil" },
      { emoji: "📦", cover: "sky", name: "Reusable tote" },
      { emoji: "🏷", cover: "slate", name: "Wood bread tags" },
    ],
    collaborators: [
      { initial: "M", name: "Maya Chen", role: "Co-illustration" },
      { initial: "T", name: "Tomás Reis", role: "Print & production" },
    ],
    externalCta: {
      label: "View full case study on Behance",
      href: "https://behance.net/alexandra/sourdough",
    },
    tags: ["branding", "illustration", "lettering"],
    related: [
      {
        slug: "marca-cafe",
        title: "Marca Café — coffeeshop identity",
        emoji: "📐",
        cover: "sky",
        year: "2024",
        tag: "branding",
      },
      {
        slug: "botanica",
        title: "Botanica — calendar lettering",
        emoji: "🌿",
        cover: "emerald",
        year: "2025",
        tag: "illustration",
      },
      {
        slug: "petalo",
        title: "Pétalo — perfume box illustration",
        emoji: "🌸",
        cover: "rose",
        year: "2024",
        tag: "illustration",
      },
    ],
  },
  socials: [
    { label: "Instagram", glyph: "📸" },
    { label: "Behance", glyph: "🅑" },
    { label: "Dribbble", glyph: "🏀" },
    { label: "Email", glyph: "✉️" },
  ],
  footerNote: "Powered by",
});
