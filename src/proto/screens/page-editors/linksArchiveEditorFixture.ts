/**
 * Typed mock seam for the Links archive page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-links-archive.html so the screen graduates by
 * swapping this factory for the real loader.
 *
 * @implements fr-page-editor-links-archive
 */
import type { Tier } from "./EditorShell";

export type LinkSource = {
  id: "home" | "blog" | "about" | "custom" | "manual";
  icon: string;
  tone: "" | "s-blog" | "s-about" | "s-custom" | "s-manual";
  name: string;
  sub: string;
  count: number;
  on: boolean;
  /** Renders a "default" chip in the name row. */
  isDefault?: boolean;
};

export type ManualLink = {
  id: string;
  icon: string;
  tone: "" | "t-rose" | "t-emerald" | "t-warm" | "t-sky";
  title: string;
  url: string;
  /** Renders an "A/B test" chip. */
  abTest?: boolean;
};

export type GroupMode = {
  id: "source" | "manual" | "alpha" | "clicks" | "newest";
  title: string;
  sub: string;
  tier?: Tier;
  isDefault?: boolean;
};

export type VisitorControl = {
  id: string;
  name: string;
  sub: string;
  on: boolean;
  tier?: Tier;
};

export type ExcludedLink = { id: string; title: string; url: string; reason: string };

export type LinksArchiveFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  showInFooter: boolean;
  titleIdeas: string[];
  swatches: { name: string; css: string }[];
  selectedSwatch: number;
  seo: { title: string; description: string };
  sources: LinkSource[];
  manualLinks: ManualLink[];
  groupModes: GroupMode[];
  selectedGroupMode: GroupMode["id"];
  visitorControls: VisitorControl[];
  excluded: ExcludedLink[];
};

export const linksArchiveEditorFixture = (): LinksArchiveFixture => ({
  pageTitle: "All links",
  slug: "links",
  live: true,
  showInFooter: true,
  titleIdeas: ["All links", "Browse all", "Links archive", "The full catalogue"],
  swatches: [
    { name: "Indigo", css: "#6366F1" },
    { name: "Warm", css: "#F59E0B" },
    { name: "Emerald", css: "#34D399" },
    { name: "Rose", css: "#FB7185" },
    { name: "Sky", css: "#38BDF8" },
    { name: "Magenta", css: "#C026D3" },
    { name: "Slate", css: "#475569" },
    { name: "Black", css: "#0B0F1E" },
  ],
  selectedSwatch: 0,
  seo: {
    title: "All my links — Alexandra Silva",
    description:
      "Browse 143 links from Alexandra — playlists, podcasts, guest interviews, merch, behind-the-scenes content, and more.",
  },
  sources: [
    { id: "home", icon: "🏠", tone: "", name: "Homepage main page", sub: "All Link button blocks on your main /alexandra page.", count: 87, on: true, isDefault: true },
    { id: "blog", icon: "📝", tone: "s-blog", name: "Blog post bodies", sub: 'Pulls every link button placed inside a blog post body — appears under "From blog" group.', count: 42, on: true },
    { id: "about", icon: "👤", tone: "s-about", name: "About page sections", sub: "Press, contact, story-timeline links from your /alexandra/about page.", count: 9, on: true },
    { id: "custom", icon: "📄", tone: "s-custom", name: "All custom pages", sub: "Future pages you create with the page-template framework. (0 today)", count: 0, on: false },
    { id: "manual", icon: "➕", tone: "s-manual", name: "Manually-added bonus links", sub: "Archive-only links that don't appear on any other page. Edit below.", count: 5, on: true },
  ],
  manualLinks: [
    { id: "m1", icon: "🎙️", tone: "", title: "Old podcast — 2019 Lex Fridman interview", url: "https://podcasts.apple.com/podcast/lex-fridman/id1434243584?i=1000452831024", abTest: true },
    { id: "m2", icon: "📰", tone: "t-rose", title: "2017 New York Times feature about my studio", url: "https://www.nytimes.com/2017/04/12/arts/music/alexandra-silva-studio.html" },
    { id: "m3", icon: "🎬", tone: "t-emerald", title: "Documentary short — 2020", url: "https://vimeo.com/447832901" },
    { id: "m4", icon: "🎤", tone: "t-warm", title: "Live at SXSW 2018 — full set", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "m5", icon: "🧵", tone: "t-sky", title: "Long Twitter thread on creative blocks", url: "https://twitter.com/alexandra/status/1456732891024" },
  ],
  groupModes: [
    { id: "source", title: "By source page", sub: '"From homepage" / "From blog" / "Manual"', isDefault: true },
    { id: "manual", title: "Manual categories", sub: 'You define groups like "Music" / "Merch" / "Podcasts" then drag links into them.', tier: "creator" },
    { id: "alpha", title: "Alphabetical", sub: "A → Z group headers. Easiest for huge libraries." },
    { id: "clicks", title: "Most clicked", sub: "Pulls from the last 30 days of analytics. Hot links float up.", tier: "creator" },
    { id: "newest", title: "Newest first", sub: "Sorted by date the link was added. Great for content drops." },
  ],
  selectedGroupMode: "source",
  visitorControls: [
    { id: "search", name: "🔎 Search bar", sub: "Client-side fuzzy search across all link titles. Always free.", on: true },
    { id: "tags", name: "🏷️ Tag filter chips", sub: "Auto-tagged from link metadata + manual tags. Visitor clicks a chip → filtered list.", on: true, tier: "creator" },
    { id: "sort", name: "↕️ Sort dropdown for visitors", sub: "Lets visitors re-sort: A-Z / Most clicked / Newest. Default sort comes from grouping mode.", on: false, tier: "pro" },
    { id: "counts", name: "📊 Show click counts on every link", sub: 'Public counts like "1.2k clicks" build trust. Free shows just titles.', on: false, tier: "pro" },
  ],
  excluded: [
    { id: "x1", title: "Old support form (deprecated)", url: "tadaify.com/alexandra/support-2019", reason: "replaced by Contact page" },
    { id: "x2", title: "Internal team Notion (private)", url: "notion.so/team-internal-9a82", reason: "not for public archive" },
    { id: "x3", title: "Affiliate code that expired", url: "store.example.com/?ref=alex-2024", reason: "link no longer pays" },
    { id: "x4", title: '"Coming soon" placeholder from launch week', url: "tadaify.com/alexandra/coming-soon", reason: "temporary" },
    { id: "x5", title: "Draft podcast episode I never released", url: "soundcloud.com/alex/private-draft-44", reason: "still working on it" },
  ],
});
