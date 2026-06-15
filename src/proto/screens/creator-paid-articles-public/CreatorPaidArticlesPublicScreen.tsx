/**
 * Public Paid articles listing — what a visitor sees at
 * tadaify.com/<handle>/articles: a searchable, tag-filterable grid of the
 * creator's paid articles. Each card shows a tinted cover, a locked badge, the
 * title, excerpt, one-time price, and read time; the card and its Buy button
 * are mocked. Faithful port of mockups/tadaify-mvp/creator-paid-articles-public.html
 * onto the shared PublicChrome. Presentational + local React state only; data
 * from a typed fixture.
 *
 * The mockup's search box and tag chips actually filter the grid, so they do
 * here too (live, client-side). "Articles" is not one of PublicChrome's
 * canonical nav ids, so a custom nav is passed with Articles marked current.
 *
 * @implements fr-creator-paid-articles-public
 */
import { useMemo, useState } from "react";
import {
  PublicChrome,
  type PublicNavLink,
  type PublicPageId,
} from "../public/PublicChrome";
import {
  paidArticlesContentFixture,
  type ArticleTint,
} from "./creatorPaidArticlesPublicFixture";
import "./creator-paid-articles-public-proto.css";

// "articles" is not a canonical PublicPageId; cast it so the custom nav entry
// can be marked current without forcing one of the built-in sections active.
const ARTICLES_CURRENT = "articles" as PublicPageId;

const ARTICLES_NAV: PublicNavLink[] = [
  { id: "home", label: "Home", href: "/__proto/creator-public" },
  { id: "about", label: "About", href: "/__proto/creator-about-public" },
  { id: "blog", label: "Blog", href: "/__proto/creator-blog-public" },
  { id: "portfolio", label: "Portfolio", href: "/__proto/creator-portfolio-public" },
  { id: ARTICLES_CURRENT, label: "Articles" },
  { id: "book", label: "Book me", href: "/__proto/creator-schedule-public" },
];

const TINT_CLASS: Record<ArticleTint, string> = {
  indigo: "t-indigo",
  warm: "t-warm",
  rose: "t-rose",
  emerald: "t-emerald",
  slate: "t-slate",
};

export function CreatorPaidArticlesPublicScreen() {
  const c = paidArticlesContentFixture();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(c.tags[0]); // "All"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return c.articles.filter((a) => {
      const matchesTag =
        activeTag === c.tags[0] || a.tags.includes(activeTag.toLowerCase());
      const matchesQuery =
        q === "" ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [c.articles, c.tags, query, activeTag]);

  const openArticle = () =>
    (window.location.href = "/__proto/creator-paid-article-public");

  return (
    <PublicChrome
      rootClassName="proto-paid-articles-public"
      creator={c.creator}
      current={ARTICLES_CURRENT}
      urlSuffix="articles"
      socials={c.footerSocials}
      footerNote="Built with"
      nav={ARTICLES_NAV}
    >
      <header className="hero">
        <h1>
          Articles <span className="badge">{c.hero.count}</span>
        </h1>
        <p>{c.hero.lede}</p>
      </header>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search articles…"
            aria-label="Search articles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="tag-chips" role="group" aria-label="Filter by tag">
          {c.tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`tag-chip${activeTag === tag ? " is-active" : ""}`}
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <section className="articles" aria-label="Paid articles">
        {filtered.map((a) => (
          <article className="art-card" key={a.id}>
            <button
              type="button"
              className={`art-cover ${TINT_CLASS[a.tint]}`}
              aria-label={`Open “${a.title}”`}
              onClick={openArticle}
            >
              <span aria-hidden="true">{a.emoji}</span>
              <span className="lock" aria-hidden="true">
                🔒
              </span>
            </button>
            <div className="art-meta">
              <h2 className="art-title">
                <button type="button" onClick={openArticle}>
                  {a.title}
                </button>
              </h2>
              <p className="art-excerpt">{a.excerpt}</p>
              <div className="art-foot">
                <span className="art-price">{a.price}</span>
                <span className="art-readtime">{a.readTime}</span>
                <button
                  type="button"
                  className="art-buy"
                  onClick={() =>
                    window.alert(
                      `Mockup — would start a Stripe checkout for “${a.title}” (${a.price})`,
                    )
                  }
                >
                  Buy
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="art-empty">
            No articles match that search. Try a different term or tag.
          </p>
        )}
      </section>

      <div className="load-more-wrap">
        <button
          type="button"
          className="load-more"
          onClick={() => window.alert("Mockup — would load the next page of articles")}
        >
          Load more · {filtered.length} of {c.total}
        </button>
      </div>
    </PublicChrome>
  );
}
