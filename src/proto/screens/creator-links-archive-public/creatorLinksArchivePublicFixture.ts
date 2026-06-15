/**
 * Typed mock seam for the public Links archive page. Mirrors
 * mockups/tadaify-mvp/creator-links-archive-public.html so the screen
 * graduates by swapping these factories for the real link-catalogue loader.
 * Defines the FR's rendered data contract: the searchable, filterable,
 * grouped catalogue of every link button across the creator's site.
 *
 * @implements fr-creator-links-archive-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type ArchiveLink = {
  icon: string;
  /** Optional icon colour theme; maps to a gradient in the CSS. */
  tone?: "rose" | "emerald" | "warm" | "sky" | "slate" | "violet";
  title: string;
  url: string;
  tags: string[];
  clicks: number;
  clicksLabel: string;
};

export type ArchiveGroup = {
  slug: string;
  emoji: string;
  emojiTone?: "blog" | "about" | "manual";
  name: string;
  links: ArchiveLink[];
};

export type ArchiveTag = { slug: string; label: string; count: number };

export type ArchiveSort = { value: string; label: string };

export type LinksArchiveContent = {
  creator: PublicCreator;
  totalLinks: number;
  hero: { title: string; lede: string };
  tags: ArchiveTag[];
  sorts: ArchiveSort[];
  groups: ArchiveGroup[];
  /** Initial number of links shown before "Load more". */
  initialShown: number;
  loadStep: number;
  footerSocials: PublicSocial[];
};

export function linksArchiveContentFixture(): LinksArchiveContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    totalLinks: 143,
    hero: {
      title: "All links",
      lede: "Every link from across alexandra's site — homepage, blog posts, About page, plus a few archive-only bonus links. Search, browse by source, or filter by tag.",
    },
    tags: [
      { slug: "all", label: "All", count: 143 },
      { slug: "music", label: "Music", count: 38 },
      { slug: "podcasts", label: "Podcasts", count: 24 },
      { slug: "press", label: "Press", count: 18 },
      { slug: "merch", label: "Merch", count: 9 },
      { slug: "video", label: "Video", count: 21 },
      { slug: "writing", label: "Writing", count: 14 },
      { slug: "behind-scenes", label: "Behind the scenes", count: 11 },
      { slug: "archive", label: "Archive", count: 8 },
    ],
    sorts: [
      { value: "default", label: "Group by source page" },
      { value: "alpha", label: "A → Z" },
      { value: "clicks", label: "Most clicked" },
      { value: "newest", label: "Newest first" },
    ],
    initialShown: 30,
    loadStep: 30,
    groups: [
      {
        slug: "homepage",
        emoji: "🏠",
        name: "From homepage",
        links: [
          { icon: "🎧", tone: "violet", title: "Spotify — listen to my latest album", url: "open.spotify.com/album/4t8nE2KqL1jGcWvbPXR9YH", tags: ["music", "featured"], clicks: 3421, clicksLabel: "3.4k clicks" },
          { icon: "🛍️", tone: "warm", title: "Tour merch — vinyl + tees", url: "store.alexandra.com/tour-merch", tags: ["merch", "music"], clicks: 982, clicksLabel: "982 clicks" },
          { icon: "📺", tone: "rose", title: "YouTube channel — behind every track", url: "youtube.com/@alexandra-silva", tags: ["video"], clicks: 2110, clicksLabel: "2.1k clicks" },
          { icon: "🎙️", tone: "sky", title: "Apple Podcasts — Wednesday Notes", url: "podcasts.apple.com/us/podcast/wednesday-notes", tags: ["podcasts"], clicks: 745, clicksLabel: "745 clicks" },
          { icon: "📻", tone: "emerald", title: "Bandcamp — exclusive demos + B-sides", url: "alexandra.bandcamp.com", tags: ["music"], clicks: 630, clicksLabel: "630 clicks" },
          { icon: "📸", title: "Instagram — daily studio", url: "instagram.com/alexandra.silva", tags: ["behind-scenes"], clicks: 412, clicksLabel: "412 clicks" },
        ],
      },
      {
        slug: "blog",
        emoji: "📝",
        emojiTone: "blog",
        name: "From blog posts",
        links: [
          { icon: "✍️", tone: "rose", title: "Tools I used recording the last LP (linked from \"How I record at home\")", url: "notion.so/alex/tools-shelf-2026", tags: ["writing", "music"], clicks: 289, clicksLabel: "289 clicks" },
          { icon: "🎼", tone: "emerald", title: "SoundCloud — the original demo for \"Late August\"", url: "soundcloud.com/alex/late-august-demo-v3", tags: ["music"], clicks: 194, clicksLabel: "194 clicks" },
          { icon: "📰", tone: "slate", title: "Pitchfork review — 8.4 / 10", url: "pitchfork.com/reviews/albums/alexandra-silva-late-august", tags: ["press"], clicks: 156, clicksLabel: "156 clicks" },
          { icon: "🎙️", tone: "sky", title: "Conversation with Hrishikesh Hirway — Song Exploder", url: "songexploder.net/episodes/alexandra-silva", tags: ["podcasts", "press"], clicks: 124, clicksLabel: "124 clicks" },
        ],
      },
      {
        slug: "about",
        emoji: "👤",
        emojiTone: "about",
        name: "From About page",
        links: [
          { icon: "📰", tone: "slate", title: "NPR Tiny Desk Concert — 2024", url: "npr.org/2024/06/12/tiny-desk-alexandra-silva", tags: ["press"], clicks: 71, clicksLabel: "71 clicks" },
          { icon: "📓", tone: "rose", title: "Wired interview — \"songwriting in the era of stems\"", url: "wired.com/story/alexandra-silva-stems-interview", tags: ["press", "writing"], clicks: 62, clicksLabel: "62 clicks" },
        ],
      },
      {
        slug: "manual",
        emoji: "➕",
        emojiTone: "manual",
        name: "Bonus archive-only links",
        links: [
          { icon: "🎙️", tone: "sky", title: "Old podcast — 2019 Lex Fridman interview", url: "podcasts.apple.com/podcast/lex-fridman/id1434243584", tags: ["podcasts", "archive"], clicks: 48, clicksLabel: "48 clicks" },
          { icon: "📰", tone: "rose", title: "2017 New York Times feature about my studio", url: "nytimes.com/2017/04/12/arts/music/alexandra-silva-studio.html", tags: ["press", "archive"], clicks: 35, clicksLabel: "35 clicks" },
          { icon: "🎬", tone: "emerald", title: "Documentary short — 2020", url: "vimeo.com/447832901", tags: ["video", "archive"], clicks: 29, clicksLabel: "29 clicks" },
          { icon: "🎤", tone: "warm", title: "Live at SXSW 2018 — full set", url: "youtube.com/watch?v=alexandra-sxsw-2018", tags: ["music", "archive"], clicks: 22, clicksLabel: "22 clicks" },
          { icon: "🧵", title: "Long Twitter thread on creative blocks", url: "twitter.com/alexandra/status/1456732891024", tags: ["writing", "archive"], clicks: 18, clicksLabel: "18 clicks" },
        ],
      },
    ],
    footerSocials: [
      { label: "Instagram", glyph: "📸" },
      { label: "TikTok", glyph: "🎵" },
      { label: "YouTube", glyph: "▶️" },
      { label: "Spotify", glyph: "🎧" },
      { label: "Email", glyph: "✉️" },
    ],
  };
}
