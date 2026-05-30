/**
 * CreatorPaidArticlesPage — public-facing paid articles list page.
 *
 * Visitor view that renders the list of paid articles published by a creator.
 * Implements search + tag filtering UI. All purchase/subscribe actions stubbed
 * with TODO comments for Stripe integration (Q+1 multi-page feature).
 *
 * Pairs with CreatorPaidArticlePage for single article detail view.
 * This is dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-paid-articles.css
 */

import type { ReactElement } from "react";
import { useState } from "react";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  price: number;
  readtime: number;
  emoji: string;
  coverClass?: string;
}

const mockArticles: Article[] = [
  {
    id: "1",
    slug: "how-i-priced-my-last-commission",
    title: "How I priced my last commission",
    excerpt:
      "A walkthrough of the exact thinking that took a $400 quote up to $1,800 — what I added, what I cut, and the email script I sent.",
    price: 5,
    readtime: 12,
    emoji: "📖",
    coverClass: "",
  },
  {
    id: "2",
    slug: "a-morning-in-the-studio",
    title: "A morning in the studio",
    excerpt:
      "Hour-by-hour photo essay of a typical work day — coffee setup, Pomodoro routine, the playlist.",
    price: 3,
    readtime: 8,
    emoji: "☕",
    coverClass: "t-w",
  },
  {
    id: "3",
    slug: "my-color-theory-cheatsheet",
    title: "My color theory cheatsheet",
    excerpt:
      "Every palette I use + the quick rules for picking complementary, analogous, and triadic combinations on the fly.",
    price: 8,
    readtime: 18,
    emoji: "🎨",
    coverClass: "t-r",
  },
  {
    id: "4",
    slug: "first-year-as-a-freelancer-deep-dive",
    title: "First year as a freelancer (deep dive)",
    excerpt:
      "The full recap — clients, money, taxes, mistakes. Includes my actual P&L spreadsheet.",
    price: 12,
    readtime: 30,
    emoji: "🌱",
    coverClass: "t-e",
  },
  {
    id: "5",
    slug: "the-contract-template-i-send-every-client",
    title: "The contract template I send every client",
    excerpt:
      "My one-page MSA — what's in it, why each clause matters, and the 3 lines that saved me from a dispute last year.",
    price: 10,
    readtime: 15,
    emoji: "🧵",
    coverClass: "t-s",
  },
  {
    id: "6",
    slug: "how-i-find-clients-without-a-network",
    title: "How I find clients without a network",
    excerpt:
      "The 3 channels that actually moved the needle in my first 18 months — what I tried, what flopped, what I'd do again.",
    price: 7,
    readtime: 14,
    emoji: "💼",
    coverClass: "",
  },
];

const tags = [
  "All",
  "Pricing",
  "Process",
  "Behind the scenes",
  "Tools",
  "Career",
];

export function CreatorPaidArticlesPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterArticles(query, activeTag);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    filterArticles(searchQuery, tag);
  };

  const filterArticles = (query: string, tag: string) => {
    let filtered = mockArticles;

    if (query) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (tag !== "All") {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(tag.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(tag.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const handleBuy = () => {
    // TODO: wire to Stripe checkout flow
  };

  return (
    <div className="paid-articles-list-page">
      <div className="top-strip">
        <span className="pill">
          <span className="dot"></span>
          <b>tadaify.com/alexandra/articles</b>
        </span>
        <span style={{ opacity: 0.7 }}>— mockup view</span>
      </div>

      <nav className="creator-nav">
        <div className="av">A</div>
        <div className="who">
          Alexandra Silva<div className="handle">@alexandra</div>
        </div>
        <div className="nav-spacer"></div>
        <div className="nav-links">
          <a href="#" className="nav-link">
            Home
          </a>
          <a href="#" className="nav-link">
            About
          </a>
          <a href="#" className="nav-link">
            Blog
          </a>
          <a href="#" className="nav-link">
            Portfolio
          </a>
          <a href="#" className="nav-link is-current" aria-current="page">
            Articles
          </a>
          <a href="#" className="nav-link">
            Book me
          </a>
        </div>
      </nav>

      <header className="hero">
        <h1>
          Articles <span className="badge">{mockArticles.length}</span>
        </h1>
        <p>
          Long-form essays + behind-the-scenes you can't get anywhere else.
          One-time price per article — no subscription.
        </p>
      </header>

      <div className="toolbar">
        <div className="search-wrap">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search articles…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="tag-chips">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tag-chip ${activeTag === tag ? "is-active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <section className="articles">
        {filteredArticles.map((article) => (
          <article key={article.id} className="art-card">
            <a href={`#article/${article.slug}`} className={`art-cover ${article.coverClass || ""}`}>
              {article.emoji}
              <div className="lock">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </a>
            <div className="art-meta">
              <h2 className="art-title">
                <a href={`#article/${article.slug}`}>{article.title}</a>
              </h2>
              <p className="art-excerpt">{article.excerpt}</p>
              <div className="art-foot">
                <span className="art-price">${article.price}</span>
                <span className="art-readtime">{article.readtime} min read</span>
                <button className="art-buy" onClick={handleBuy}>
                  Buy
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="load-more-wrap">
        <button className="load-more">Load more · {filteredArticles.length} of {mockArticles.length}</button>
      </div>

      <footer className="creator-footer">
        <span>© Alexandra Silva 2026</span>
        <a href="#">Contact</a>
        <a href="#">Privacy</a>
        <span className="powered">
          Made with <a href="#"><b>tadaify</b></a>
        </span>
      </footer>
    </div>
  );
}
