/**
 * CreatorLinksArchivePage — public-facing Links archive page render.
 *
 * Visitor view at tadaify.com/<handle>/links. Shows a searchable,
 * filterable, sortable catalogue of every link button across the
 * creator's site, grouped by source page.
 *
 * Sub-views (managed with local React state):
 *   default         → full archive, grouped by source page
 *   group/<slug>    → single group deep-link
 *   tag/<slug>      → tag filter view (Creator+ feature)
 *   search?q=<q>    → search results (filters across all groups, highlights)
 *
 * All outbound link/navigation actions stubbed with TODO comments.
 * Hash routing integration is Q+1 dead code (not wired).
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-links-archive.css
 */

import type { ReactElement } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import "~/styles/public-pages/creator-links-archive.css";

// ── Data types ─────────────────────────────────────────────────────────────

interface LinkItem {
  id: string;
  icon: string;
  iconStyle?: string;
  title: string;
  url: string;
  tags: string[];
  clicks: number;
  clicksLabel: string;
}

interface LinkGroup {
  id: string;
  slug: string;
  emoji: string;
  emojiStyle?: string;
  label: string;
  count: number;
  links: LinkItem[];
}

type SortMode = "default" | "alpha" | "clicks" | "newest";
type ViewMode = "all" | `group/${string}` | `tag/${string}` | `search/${string}`;

// ── Static data (mirrors mockup sample content) ────────────────────────────

const LINK_GROUPS: LinkGroup[] = [
  {
    id: "group-homepage",
    slug: "homepage",
    emoji: "🏠",
    label: "From homepage",
    count: 87,
    links: [
      { id: "hp-1", icon: "🎧", iconStyle: "t-violet", title: "Spotify — listen to my latest album", url: "open.spotify.com/album/4t8nE2KqL1jGcWvbPXR9YH", tags: ["music", "featured"], clicks: 3421, clicksLabel: "3.4k clicks" },
      { id: "hp-2", icon: "🛍️", iconStyle: "t-warm",   title: "Tour merch — vinyl + tees", url: "store.alexandra.com/tour-merch", tags: ["merch", "music"], clicks: 982, clicksLabel: "982 clicks" },
      { id: "hp-3", icon: "📺", iconStyle: "t-rose",   title: "YouTube channel — behind every track", url: "youtube.com/@alexandra-silva", tags: ["video"], clicks: 2110, clicksLabel: "2.1k clicks" },
      { id: "hp-4", icon: "🎙️", iconStyle: "t-sky",    title: "Apple Podcasts — Wednesday Notes", url: "podcasts.apple.com/us/podcast/wednesday-notes", tags: ["podcasts"], clicks: 745, clicksLabel: "745 clicks" },
      { id: "hp-5", icon: "📻", iconStyle: "t-emerald", title: "Bandcamp — exclusive demos + B-sides", url: "alexandra.bandcamp.com", tags: ["music"], clicks: 630, clicksLabel: "630 clicks" },
      { id: "hp-6", icon: "📸", title: "Instagram — daily studio", url: "instagram.com/alexandra.silva", tags: ["behind-scenes"], clicks: 412, clicksLabel: "412 clicks" },
    ],
  },
  {
    id: "group-blog",
    slug: "blog",
    emoji: "📝",
    emojiStyle: "t-blog",
    label: "From blog posts",
    count: 42,
    links: [
      { id: "bl-1", icon: "✍️", iconStyle: "t-rose", title: "Tools I used recording the last LP (linked from \"How I record at home\")", url: "notion.so/alex/tools-shelf-2026", tags: ["writing", "music"], clicks: 289, clicksLabel: "289 clicks" },
      { id: "bl-2", icon: "🎼", iconStyle: "t-emerald", title: "SoundCloud — the original demo for \"Late August\"", url: "soundcloud.com/alex/late-august-demo-v3", tags: ["music"], clicks: 194, clicksLabel: "194 clicks" },
      { id: "bl-3", icon: "📰", iconStyle: "t-slate", title: "Pitchfork review — 8.4 / 10", url: "pitchfork.com/reviews/albums/alexandra-silva-late-august", tags: ["press", "writing"], clicks: 156, clicksLabel: "156 clicks" },
      { id: "bl-4", icon: "🎙️", iconStyle: "t-sky", title: "Conversation with Hrishikesh Hirway — Song Exploder", url: "songexploder.net/episodes/alexandra-silva", tags: ["podcasts", "press"], clicks: 124, clicksLabel: "124 clicks" },
    ],
  },
  {
    id: "group-about",
    slug: "about",
    emoji: "👤",
    emojiStyle: "t-about",
    label: "From About page",
    count: 9,
    links: [
      { id: "ab-1", icon: "📰", iconStyle: "t-slate", title: "NPR Tiny Desk Concert — 2024", url: "npr.org/2024/06/12/tiny-desk-alexandra-silva", tags: ["press"], clicks: 71, clicksLabel: "71 clicks" },
      { id: "ab-2", icon: "📓", iconStyle: "t-rose", title: "Wired interview — \"songwriting in the era of stems\"", url: "wired.com/story/alexandra-silva-stems-interview", tags: ["press", "writing"], clicks: 62, clicksLabel: "62 clicks" },
    ],
  },
  {
    id: "group-manual",
    slug: "manual",
    emoji: "➕",
    emojiStyle: "t-manual",
    label: "Bonus archive-only links",
    count: 5,
    links: [
      { id: "mn-1", icon: "🎙️", iconStyle: "t-sky", title: "Old podcast — 2019 Lex Fridman interview", url: "podcasts.apple.com/podcast/lex-fridman/id1434243584", tags: ["podcasts", "archive"], clicks: 48, clicksLabel: "48 clicks" },
      { id: "mn-2", icon: "📰", iconStyle: "t-rose", title: "2017 New York Times feature about my studio", url: "nytimes.com/2017/04/12/arts/music/alexandra-silva-studio.html", tags: ["press", "archive"], clicks: 35, clicksLabel: "35 clicks" },
      { id: "mn-3", icon: "🎬", iconStyle: "t-emerald", title: "Documentary short — 2020", url: "vimeo.com/447832901", tags: ["video", "archive"], clicks: 29, clicksLabel: "29 clicks" },
      { id: "mn-4", icon: "🎤", iconStyle: "t-warm", title: "Live at SXSW 2018 — full set", url: "youtube.com/watch?v=alexandra-sxsw-2018", tags: ["music", "archive"], clicks: 22, clicksLabel: "22 clicks" },
      { id: "mn-5", icon: "🧵", title: "Long Twitter thread on creative blocks", url: "twitter.com/alexandra/status/1456732891024", tags: ["writing", "archive"], clicks: 18, clicksLabel: "18 clicks" },
    ],
  },
];

const TAG_CHIPS = [
  { tag: "all",           label: "All",               count: 143 },
  { tag: "music",         label: "Music",              count: 38 },
  { tag: "podcasts",      label: "Podcasts",           count: 24 },
  { tag: "press",         label: "Press",              count: 18 },
  { tag: "merch",         label: "Merch",              count: 9 },
  { tag: "video",         label: "Video",              count: 21 },
  { tag: "writing",       label: "Writing",            count: 14 },
  { tag: "behind-scenes", label: "Behind the scenes",  count: 11 },
  { tag: "archive",       label: "Archive",            count: 8 },
];

const TOTAL_LINKS = 143;
const PAGE_SIZE = 30;

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function highlight(text: string, q: string): string {
  if (!q) return escapeHtml(text);
  const safe = escapeHtml(text);
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return safe.replace(re, '<span class="hi-match">$1</span>');
}

function sortLinks(links: LinkItem[], mode: SortMode): LinkItem[] {
  const copy = [...links];
  switch (mode) {
    case "alpha":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "clicks":
      return copy.sort((a, b) => b.clicks - a.clicks);
    case "newest":
      return copy.reverse();
    default:
      return copy;
  }
}

// ── SVG icons ──────────────────────────────────────────────────────────────

function ArrowIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function BackArrowIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function SearchIcon(): ReactElement {
  return (
    <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Link row ───────────────────────────────────────────────────────────────

interface LinkRowProps {
  link: LinkItem;
  query: string;
  onTagClick: (tag: string) => void;
}

function LinkRow({ link, query, onTagClick }: LinkRowProps): ReactElement {
  return (
    <a
      href="#"
      className="link-row"
      onClick={(e) => {
        e.preventDefault();
        // TODO: navigate to link.url in production
      }}
    >
      <div className={`lr-icon${link.iconStyle ? ` ${link.iconStyle}` : ""}`}>{link.icon}</div>
      <div className="lr-meta">
        <div
          className="lr-title"
          dangerouslySetInnerHTML={{ __html: highlight(link.title, query) }}
        />
        <div
          className="lr-url"
          dangerouslySetInnerHTML={{ __html: highlight(link.url, query) }}
        />
        {link.tags.length > 0 && (
          <div className="lr-tags">
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="lr-tag"
                onClick={(e) => { e.preventDefault(); onTagClick(tag); }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="lr-right">
        <span className="lr-clicks">{link.clicksLabel}</span>
        <span className="lr-arrow"><ArrowIcon /></span>
      </div>
    </a>
  );
}

// ── Group section ──────────────────────────────────────────────────────────

interface GroupSectionProps {
  group: LinkGroup;
  query: string;
  sortMode: SortMode;
  visibleFilter: ((link: LinkItem) => boolean) | null;
  onTagClick: (tag: string) => void;
  onGroupDeeplink: (slug: string) => void;
}

function GroupSection({ group, query, sortMode, visibleFilter, onTagClick, onGroupDeeplink }: GroupSectionProps): ReactElement | null {
  const filtered = visibleFilter ? group.links.filter(visibleFilter) : group.links;
  const sorted = sortLinks(filtered, sortMode);

  if (visibleFilter && sorted.length === 0) return null;

  return (
    <section className="group" id={group.id} data-group={group.slug}>
      <div className="group-head">
        <div className={`gh-emoji${group.emojiStyle ? ` ${group.emojiStyle}` : ""}`}>{group.emoji}</div>
        <h2>{group.label}</h2>
        <span className="gh-count">{group.count} links</span>
        <a
          href={`#/group/${group.slug}`}
          className="gh-deeplink"
          onClick={(e) => { e.preventDefault(); onGroupDeeplink(group.slug); }}
        >
          Open group →
        </a>
      </div>
      <div className="link-list">
        {sorted.map((link) => (
          <LinkRow key={link.id} link={link} query={query} onTagClick={onTagClick} />
        ))}
      </div>
    </section>
  );
}

// ── Creator nav ────────────────────────────────────────────────────────────

function CreatorNav(): ReactElement {
  return (
    <nav className="creator-nav">
      <a href="/" className="cn-handle">
        {/* TODO: wire to creator handle / avatar */}
        <span className="av" aria-hidden="true">A</span>
        Alexandra Silva
      </a>
      <div className="cn-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/portfolio">Portfolio</a>
        <a href="/contact">Contact</a>
        <a href="/links" className="is-current">All links</a>
      </div>
    </nav>
  );
}

// ── Page root ──────────────────────────────────────────────────────────────

export function CreatorLinksArchivePage(): ReactElement {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [activeGroupSlug, setActiveGroupSlug] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derived view mode
  const isSearch = query.trim().length > 0;
  const isTagFilter = activeTag !== "all" && !isSearch;
  const isGroupDeeplink = activeGroupSlug !== null && !isSearch && !isTagFilter;

  // Link filter function (null = show all)
  const linkFilter = useCallback(
    (link: LinkItem): boolean => {
      if (isSearch) {
        const q = query.toLowerCase().trim();
        return link.title.toLowerCase().includes(q) || link.url.toLowerCase().includes(q);
      }
      if (isTagFilter) {
        return link.tags.includes(activeTag);
      }
      return true;
    },
    [isSearch, isTagFilter, query, activeTag],
  );

  // Group filter (for group deep-link)
  const groupFilter = useCallback(
    (group: LinkGroup): boolean => {
      if (isGroupDeeplink) return group.slug === activeGroupSlug;
      return true;
    },
    [isGroupDeeplink, activeGroupSlug],
  );

  // Count all visible links for meta
  const visibleCount = LINK_GROUPS.filter(groupFilter).flatMap((g) => g.links).filter(linkFilter).length;

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveTag("all");
    setActiveGroupSlug(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    if (searchInputRef.current) searchInputRef.current.value = "";
    setActiveTag("all");
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    if (tag === "all") {
      setActiveTag("all");
      setActiveGroupSlug(null);
      setQuery("");
      return;
    }
    setActiveTag(tag);
    setActiveGroupSlug(null);
    setQuery("");
  }, []);

  const handleGroupDeeplink = useCallback((slug: string) => {
    setActiveGroupSlug(slug);
    setActiveTag("all");
    setQuery("");
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveTag("all");
    setActiveGroupSlug(null);
    setQuery("");
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortMode(e.target.value as SortMode);
  }, []);

  const handleLoadMore = useCallback(() => {
    setLoadedCount((prev) => Math.min(TOTAL_LINKS, prev + PAGE_SIZE));
  }, []);

  // Subview picker state label
  const pickerActive = (route: string): boolean => {
    if (route === "#/") return !isSearch && !isTagFilter && !isGroupDeeplink;
    if (route.startsWith("#/group/")) return isGroupDeeplink && activeGroupSlug === route.slice(8);
    if (route.startsWith("#/tag/"))   return isTagFilter && activeTag === route.slice(6);
    if (route.startsWith("#/search?q=")) return isSearch;
    return false;
  };

  const filteredGroups = LINK_GROUPS.filter(groupFilter);
  const showNoMatch = visibleCount === 0 && (isSearch || isTagFilter);
  const showLoadMore = !isSearch && !isTagFilter && !isGroupDeeplink;

  return (
    <div className="creator-links-archive-page">
      <CreatorNav />

      {/* Page hero */}
      <div className="page-hero" id="page-hero">
        <h1 id="page-title">
          All links{" "}
          <span className="count-badge" id="count-badge">
            {isSearch || isTagFilter ? `${visibleCount} links` : "143 links"}
          </span>
        </h1>
        <p className="lede" id="page-lede">
          Every link from across alexandra&apos;s site — homepage, blog posts, About page, plus a few archive-only bonus links. Search, browse by source, or filter by tag.
        </p>
      </div>

      {/* Sticky search + sort bar */}
      <div className="control-bar" role="search">
        <div className="control-inner">
          <div className={`search-wrap${query ? " has-query" : ""}`} id="search-wrap">
            <SearchIcon />
            <input
              ref={searchInputRef}
              id="search-input"
              type="search"
              placeholder="Search 143 links — title or URL…"
              onChange={handleSearchInput}
              autoComplete="off"
              value={query}
            />
            <button className="search-x" id="search-x" type="button" aria-label="Clear search" onClick={handleClearSearch}>
              ×
            </button>
          </div>
          <div className="sort-wrap">
            <label className="visually-hidden" htmlFor="sort-select">Sort</label>
            <select id="sort-select" onChange={handleSortChange} value={sortMode} aria-label="Sort links">
              <option value="default">Group by source page</option>
              <option value="alpha">A → Z</option>
              <option value="clicks">Most clicked</option>
              <option value="newest">Newest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tag filter chip bar (Creator+ feature) */}
      <div className="tag-bar" role="navigation" aria-label="Filter by tag">
        {TAG_CHIPS.map(({ tag, label, count }) => (
          <button
            key={tag}
            className={`tag-chip${activeTag === tag && !isSearch ? " is-active" : ""}`}
            data-tag={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
          >
            {label} <span className="chip-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Results meta strip */}
      {(isSearch || isTagFilter || isGroupDeeplink) && (
        <div className="results-meta" id="results-meta">
          {isSearch && (
            <>
              {visibleCount} result{visibleCount === 1 ? "" : "s"} for <b>&ldquo;{query}&rdquo;</b> ·{" "}
              <a href="#/" onClick={(e) => { e.preventDefault(); handleClearFilter(); }}>Clear search →</a>
            </>
          )}
          {isTagFilter && (
            <>
              Filtered by tag: <b>{activeTag}</b> · {visibleCount} link{visibleCount === 1 ? "" : "s"} ·{" "}
              <a href="#/" onClick={(e) => { e.preventDefault(); handleClearFilter(); }}>Clear filter →</a>
            </>
          )}
          {isGroupDeeplink && (
            <>
              Showing one group: <b>{LINK_GROUPS.find((g) => g.slug === activeGroupSlug)?.label ?? activeGroupSlug}</b> ·{" "}
              <a href="#/" onClick={(e) => { e.preventDefault(); handleClearFilter(); }}>Show all groups →</a>
            </>
          )}
        </div>
      )}

      {/* Groups */}
      <main className="groups" id="groups">
        {filteredGroups.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            query={isSearch ? query.toLowerCase().trim() : ""}
            sortMode={sortMode}
            visibleFilter={isSearch || isTagFilter ? linkFilter : null}
            onTagClick={handleTagClick}
            onGroupDeeplink={handleGroupDeeplink}
          />
        ))}
      </main>

      {/* No-match block */}
      {showNoMatch && (
        <div className="no-match" id="no-match">
          <div className="nm-emoji" aria-hidden="true">🔎</div>
          <h3>No links match your search</h3>
          <p id="no-match-text">
            {isSearch
              ? <>No links matched &ldquo;<b>{query}</b>&rdquo;. Try a shorter query, or browse by source page above. If you&apos;re looking for something specific, you can also{" "}<a href="/contact" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>message Alexandra</a>.</>
              : <>Try a shorter query, or browse by source page above. If you&apos;re looking for something specific, you can also{" "}<a href="/contact" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>message Alexandra</a>.</>
            }
          </p>
        </div>
      )}

      {/* Pagination — Load more */}
      {showLoadMore && (
        <div className="load-more-wrap" id="load-more">
          <span className="lm-meta">
            Showing {loadedCount} of <b id="lm-total">{TOTAL_LINKS}</b> links
          </span>
          <button
            className="lm-btn"
            type="button"
            onClick={handleLoadMore}
            disabled={loadedCount >= TOTAL_LINKS}
          >
            {loadedCount >= TOTAL_LINKS ? "All links loaded" : "Load 30 more"}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="archive-footer">
        {/* TODO: wire to creator home URL */}
        <a href="/" className="back-link">
          <BackArrowIcon />
          Back to alexandra&apos;s main page
        </a>
        <div className="socials">
          {/* TODO: wire social links from creator profile */}
          <a href="#" className="soc" aria-label="Instagram">📸</a>
          <a href="#" className="soc" aria-label="TikTok">🎵</a>
          <a href="#" className="soc" aria-label="YouTube">▶️</a>
          <a href="#" className="soc" aria-label="Spotify">🎧</a>
          <a href="mailto:hello@alexandra.com" className="soc" aria-label="Email">✉️</a>
        </div>
        <div className="made-with">
          Made with{" "}
          <span className="wm">
            <span className="ta">ta</span><span className="da">da!</span><span className="ify">ify</span>
          </span>{" "}
          · <a href="https://tadaify.com" style={{ color: "inherit" }}>tadaify.com</a>
        </div>
      </footer>

      {/* Mockup-only sub-view picker pill */}
      <div className="subview-picker" role="navigation" aria-label="Mockup sub-view picker">
        <span className="sp-label">demo:</span>
        <button type="button" className={pickerActive("#/") ? "is-on" : ""} onClick={handleClearFilter}>Full archive</button>
        <button type="button" className={pickerActive("#/group/homepage") ? "is-on" : ""} onClick={() => handleGroupDeeplink("homepage")}>Group: homepage</button>
        <button type="button" className={pickerActive("#/group/blog") ? "is-on" : ""} onClick={() => handleGroupDeeplink("blog")}>Group: blog</button>
        <button type="button" className={pickerActive("#/tag/music") ? "is-on" : ""} onClick={() => handleTagClick("music")}>Tag: music</button>
        <button
          type="button"
          className={pickerActive("#/search?q=podcast") ? "is-on" : ""}
          onClick={() => { setQuery("podcast"); setActiveTag("all"); setActiveGroupSlug(null); if (searchInputRef.current) searchInputRef.current.value = "podcast"; }}
        >
          Search: podcast
        </button>
        <button
          type="button"
          className={pickerActive("#/search?q=zzzzz") ? "is-on" : ""}
          onClick={() => { setQuery("zzzzz"); setActiveTag("all"); setActiveGroupSlug(null); if (searchInputRef.current) searchInputRef.current.value = "zzzzz"; }}
        >
          No-match
        </button>
      </div>
    </div>
  );
}
