/**
 * Public Links archive page — what a visitor sees at tadaify.com/<handle>/links.
 * Faithful port of mockups/tadaify-mvp/creator-links-archive-public.html onto
 * the shared PublicChrome. Renders the searchable + filterable + grouped
 * catalogue of every link button across the creator's site. Presentational +
 * local React state only; data from a typed fixture.
 *
 * The mockup demoed its sub-views via hash routing (full archive, single
 * group, tag filter, search results, no-match). Here search, the tag chips and
 * the sort dropdown are live local state; matches are highlighted; groups with
 * no visible rows are hidden. The "All links" archive isn't a canonical nav
 * section, so no nav item is forced active.
 *
 * @implements fr-creator-links-archive-public
 */
import { useMemo, useState } from "react";
import { PublicChrome, type PublicPageId } from "../public/PublicChrome";
import {
  linksArchiveContentFixture,
  type ArchiveLink,
} from "./creatorLinksArchivePublicFixture";
import "./creator-links-archive-public-proto.css";

// The archive is not part of the canonical creator nav, so nothing is marked
// active. Cast a non-canonical id so no nav link matches.
const NO_CURRENT = "none" as PublicPageId;

/** Split a string into matched / unmatched parts for highlight rendering. */
function highlight(text: string, q: string) {
  if (!q) return text;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(ql, i);
    if (idx < 0) {
      parts.push({ text: text.slice(i), hit: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), hit: false });
    parts.push({ text: text.slice(idx, idx + ql.length), hit: true });
    i = idx + ql.length;
  }
  return parts.map((p, k) =>
    p.hit ? (
      <span className="hi-match" key={k}>
        {p.text}
      </span>
    ) : (
      <span key={k}>{p.text}</span>
    ),
  );
}

export function CreatorLinksArchivePublicScreen() {
  const c = linksArchiveContentFixture();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("default");
  const [shown, setShown] = useState(c.initialShown);

  const q = query.trim().toLowerCase();

  function matches(link: ArchiveLink) {
    const tagOk = activeTag === "all" || link.tags.includes(activeTag);
    const searchOk =
      q === "" ||
      link.title.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q);
    return tagOk && searchOk;
  }

  function sortLinks(links: ArchiveLink[]) {
    const copy = [...links];
    if (sort === "alpha") copy.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "clicks") copy.sort((a, b) => b.clicks - a.clicks);
    else if (sort === "newest") copy.reverse();
    return copy;
  }

  const filteredGroups = useMemo(() => {
    return c.groups
      .map((g) => ({ ...g, links: sortLinks(g.links.filter(matches)) }))
      .filter((g) => g.links.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeTag, sort]);

  const visibleCount = filteredGroups.reduce((n, g) => n + g.links.length, 0);
  const hasFilter = q !== "" || activeTag !== "all";
  const noMatch = visibleCount === 0;
  const sampleTotal = c.groups.reduce((n, g) => n + g.links.length, 0);

  function clearAll() {
    setQuery("");
    setActiveTag("all");
  }

  return (
    <PublicChrome
      rootClassName="proto-links-archive-public"
      creator={c.creator}
      current={NO_CURRENT}
      urlSuffix="links"
      socials={c.footerSocials}
    >
      {/* Page hero */}
      <div className="page-hero">
        <h1>
          {c.hero.title}{" "}
          <span className="count-badge">{c.totalLinks} links</span>
        </h1>
        <p className="lede">{c.hero.lede}</p>
      </div>

      {/* Sticky search + sort bar */}
      <div className="control-bar" role="search">
        <div className="control-inner">
          <div className={`search-wrap${query ? " has-query" : ""}`}>
            <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={`Search ${c.totalLinks} links — title or URL…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search links"
            />
            {query && (
              <button
                className="search-x"
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <div className="sort-wrap">
            <label className="visually-hidden" htmlFor="la-sort">Sort</label>
            <select
              id="la-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort links"
            >
              {c.sorts.map((s) => (
                <option value={s.value} key={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tag filter chip bar */}
      <div className="tag-bar" aria-label="Filter by tag">
        {c.tags.map((t) => (
          <button
            type="button"
            key={t.slug}
            className={`tag-chip${activeTag === t.slug ? " is-active" : ""}`}
            aria-pressed={activeTag === t.slug}
            onClick={() => setActiveTag(t.slug)}
          >
            {t.label} <span className="chip-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Results meta strip (search + tag filter) */}
      {hasFilter && !noMatch && (
        <div className="results-meta">
          {q !== "" ? (
            <span>
              {visibleCount} result{visibleCount === 1 ? "" : "s"} for{" "}
              <b>"{query.trim()}"</b>
            </span>
          ) : (
            <span>
              Filtered by tag: <b>{activeTag}</b> · {visibleCount} link
              {visibleCount === 1 ? "" : "s"}
            </span>
          )}
          <button type="button" className="meta-clear" onClick={clearAll}>
            Clear filter →
          </button>
        </div>
      )}

      {/* Groups */}
      <main className="groups">
        {filteredGroups.map((g) => (
          <section className="group" key={g.slug}>
            <div className="group-head">
              <div className={`gh-emoji${g.emojiTone ? ` t-${g.emojiTone}` : ""}`}>
                {g.emoji}
              </div>
              <h2>{g.name}</h2>
              <span className="gh-count">{g.links.length} links</span>
            </div>
            <div className="link-list">
              {g.links.map((link) => (
                <button
                  type="button"
                  className="link-row"
                  key={link.title}
                  onClick={() => window.alert(`Mockup — would open ${link.url}`)}
                >
                  <span className={`lr-icon${link.tone ? ` t-${link.tone}` : ""}`} aria-hidden="true">
                    {link.icon}
                  </span>
                  <span className="lr-meta">
                    <span className="lr-title">{highlight(link.title, q)}</span>
                    <span className="lr-url">{highlight(link.url, q)}</span>
                    <span className="lr-tags">
                      {link.tags.map((tag) => (
                        <span
                          className="lr-tag"
                          key={tag}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTag(tag);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTag(tag);
                            }
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="lr-right">
                    <span className="lr-clicks">{link.clicksLabel}</span>
                    <span className="lr-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* No-match state */}
      {noMatch && (
        <div className="no-match">
          <div className="nm-emoji" aria-hidden="true">🔎</div>
          <h3>No links match your search</h3>
          <p>
            Try a shorter query, or browse by source page above. If you're
            looking for something specific, you can also{" "}
            <a href="/__proto/creator-contact-public" className="nm-link">
              message Alexandra
            </a>
            .
          </p>
        </div>
      )}

      {/* Pagination — Load more (count only; mirrors the mockup). */}
      {!hasFilter && !noMatch && (
        <div className="load-more-wrap">
          <span className="lm-meta">
            Showing {Math.min(shown, c.totalLinks)} of <b>{c.totalLinks}</b> links
            <span className="lm-sample"> · {sampleTotal} shown in this prototype</span>
          </span>
          {shown < c.totalLinks ? (
            <button
              type="button"
              className="lm-btn"
              onClick={() => setShown((n) => Math.min(c.totalLinks, n + c.loadStep))}
            >
              Load {c.loadStep} more
            </button>
          ) : (
            <button type="button" className="lm-btn is-done" disabled>
              All links loaded
            </button>
          )}
        </div>
      )}

      {/* Back-to-main link (mockup footer extra). */}
      <div className="archive-back">
        <a href="/__proto/creator-public" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to alexandra's main page
        </a>
      </div>
    </PublicChrome>
  );
}
