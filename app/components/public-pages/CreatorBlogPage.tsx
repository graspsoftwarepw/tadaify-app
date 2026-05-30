/**
 * CreatorBlogPage — public-facing blog list + single post render.
 *
 * Visitor view at tadaify.com/<handle>/blog. Three views via in-component state:
 *   "list" — paginated post grid, optionally filtered by tag (default)
 *   "post" — single post view (cover + body + tags + related + comments)
 *
 * Tag filtering operates on the rendered DOM via state. Pagination is mocked
 * (real pagination would fetch from the server). Comments provider is switchable.
 *
 * All outbound link/CTA actions stubbed with TODO comments.
 *
 * Dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-blog.css
 */

import type { ReactElement } from "react";
import { useState } from "react";
import "~/styles/public-pages/creator-blog.css";

type BlogView = "list" | "post";
type CommentsProvider = "disqus" | "hyvor" | "off";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  readMin: number;
  tags: string[];
  author: string;
}

const POSTS: Post[] = [
  {
    slug: "morning-habits",
    title: "10 morning habits of high-energy women",
    excerpt: "The morning is where your day is won or lost. Here are the 10 habits I run before 9am — none of them require an ice bath.",
    cover: "",
    date: "Apr 22",
    readMin: 6,
    tags: ["habits"],
    author: "Alexandra",
  },
  {
    slug: "why-i-stopped-chasing-prs",
    title: "Why I stopped chasing PRs (and what I do instead)",
    excerpt: "Personal records used to be everything. Now they're a side effect — here's what replaced them and why I lift more these days.",
    cover: "t-rose",
    date: "Apr 8",
    readMin: 8,
    tags: ["training"],
    author: "Alexandra",
  },
  {
    slug: "5-day-reset-for-heavy-training",
    title: "A 5-day reset for when training feels heavy",
    excerpt: "Some weeks the bar feels heavier than it should. The 5-day protocol I run to bring myself back without losing the base I built.",
    cover: "t-indigo",
    date: "Apr 2",
    readMin: 7,
    tags: ["recovery"],
    author: "Alexandra",
  },
  {
    slug: "sleep-first-supplements-second",
    title: "Sleep first, supplements second",
    excerpt: "Stack of pills and powders, but you sleep 5 hours? You're shovelling sand into a leaky bucket. Sleep is the multiplier — start there.",
    cover: "t-slate",
    date: "Mar 25",
    readMin: 5,
    tags: ["recovery", "mindset"],
    author: "Alexandra",
  },
  {
    slug: "macros-without-losing-weekend",
    title: "Macro tracking without losing your weekend",
    excerpt: "A pragmatic 80/20 system for tracking that keeps you eating with friends, not weighing chicken breast at brunch.",
    cover: "t-emerald",
    date: "Mar 18",
    readMin: 9,
    tags: ["nutrition"],
    author: "Alexandra",
  },
  {
    slug: "training-with-anxiety",
    title: "Training with anxiety — what works for me",
    excerpt: "A long letter to anyone who has stood at the squat rack, knees weak, mind louder than the playlist. You're not alone, and there's a path out.",
    cover: "t-sky",
    date: "Mar 11",
    readMin: 11,
    tags: ["mindset", "training"],
    author: "Alexandra",
  },
];

const COVER_EMOJIS: Record<string, string> = {
  "":          "📝",
  "t-rose":    "💪",
  "t-indigo":  "🌅",
  "t-slate":   "🌙",
  "t-emerald": "🥬",
  "t-sky":     "🧠",
};

const TAGS = ["training", "recovery", "mindset", "nutrition", "habits"];

function CoverDiv({ cover }: { cover: string }): ReactElement {
  return (
    <div className={`pc-cover${cover ? " " + cover : ""}`} aria-hidden="true">
      {COVER_EMOJIS[cover] ?? "📝"}
    </div>
  );
}

export function CreatorBlogPage(): ReactElement {
  const [view, setView] = useState<BlogView>("list");
  const [activeTag, setActiveTag] = useState("");
  const [currentPost, setCurrentPost] = useState<Post>(POSTS[2]);
  const [commentsProvider, setCommentsProvider] = useState<CommentsProvider>("disqus");

  const showSingle = (slug: string) => {
    const post = POSTS.find((p) => p.slug === slug) ?? POSTS[0];
    setCurrentPost(post);
    setView("post");
  };

  const filterByTag = (tag: string) => {
    setActiveTag(tag);
    setView("list");
  };

  const visiblePosts = activeTag
    ? POSTS.filter((p) => p.tags.includes(activeTag))
    : POSTS;

  return (
    <div className="creator-blog-page">

      {/* Creator nav */}
      <nav className="creator-nav">
        <a href="#" className="cn-handle">
          {/* TODO: link to creator home */}
          <span className="av" aria-hidden="true">A</span>
          Alexandra Silva
        </a>
        <div className="cn-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#" className="is-current" aria-current="page">Blog</a>
          <a href="#">Portfolio</a>
          <a href="#">Book</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* ── VIEW: list ── */}
      <section className={`view${view === "list" ? " is-current" : ""}`} aria-label="Blog post list">

        <div className="page-hero">
          <h1>Strong Not Skinny — Blog</h1>
          <p className="lede">
            Honest essays on training, recovery and building strength without burning out.
            New posts every Tuesday — read in your inbox or right here.
          </p>
          <div className="meta-line">
            <span><b>{visiblePosts.length > 0 ? 23 : visiblePosts.length}</b> posts · 2 years</span>
            <span className="dot" />
            <a href="#" onClick={(e) => e.preventDefault()}>
              {/* TODO: wire to RSS feed */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              Subscribe via RSS
            </a>
            <span className="dot" />
            <a href="#" onClick={(e) => e.preventDefault()}>
              {/* TODO: open email subscribe modal */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Get new posts by email
            </a>
          </div>

          <div className="tag-bar" aria-label="Filter by tag">
            <button
              className={`tag-chip${activeTag === "" ? " is-active" : ""}`}
              onClick={() => setActiveTag("")}
            >
              All
            </button>
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip${activeTag === tag ? " is-active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {visiblePosts.length > 0 ? (
          <div className="feed">
            {visiblePosts.map((post) => (
              <a
                key={post.slug}
                className="post-card"
                href={`#/post/${post.slug}`}
                onClick={(e) => { e.preventDefault(); showSingle(post.slug); }}
              >
                <CoverDiv cover={post.cover} />
                <div className="pc-body">
                  <h2 className="pc-title">{post.title}</h2>
                  <p className="pc-excerpt">{post.excerpt}</p>
                  <div className="pc-meta">
                    <span className="pc-author">
                      <span className="ax">A</span>
                      {post.author}
                    </span>
                    <span className="dot" />
                    <span>{post.date} · {post.readMin} min</span>
                    {post.tags.map((t) => (
                      <span key={t} className="pc-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-tag">
            <div className="emoji">🌿</div>
            <h3>No posts tagged &ldquo;{activeTag}&rdquo; yet</h3>
            <p>
              Try another tag, or{" "}
              <a
                href="#"
                style={{ color: "var(--brand-primary)", fontWeight: 600 }}
                onClick={(e) => { e.preventDefault(); setActiveTag(""); }}
              >
                view all posts
              </a>.
            </p>
          </div>
        )}

        {/* Pagination (mocked) */}
        <div className="pagination">
          <div className="pg-meta">
            Showing <b>1–6</b> of <b>23</b> posts
          </div>
          <div className="pg-controls">
            <button disabled aria-label="Previous">←</button>
            <button className="is-current" aria-current="page">1</button>
            <button onClick={() => { /* TODO: load page 2 */ }}>2</button>
            <button onClick={() => { /* TODO: load page 3 */ }}>3</button>
            <button onClick={() => { /* TODO: load page 4 */ }}>4</button>
            <button aria-label="Next" onClick={() => { /* TODO: load next page */ }}>→</button>
          </div>
          <button className="load-more" onClick={() => { /* TODO: append next 6 posts */ }}>
            Load more posts
          </button>
        </div>

      </section>

      {/* ── VIEW: single post ── */}
      <section className={`view${view === "post" ? " is-current" : ""}`} aria-label="Single post">

        <div className="post-cover-full" aria-hidden="true">
          {COVER_EMOJIS[currentPost.cover] ?? "📝"}
        </div>

        <article className="post-article">
          <h1>{currentPost.title}</h1>
          <div className="post-meta-row">
            <span className="author-pill">
              <span className="av">A</span>
              <span>Posted by <b>Alexandra Silva</b></span>
            </span>
            <span className="dot" />
            <span>Apr 2, 2026</span>
            <span className="dot" />
            <span>{currentPost.readMin} min read</span>
            <div className="share">
              <button
                aria-label="Copy link"
                onClick={() => { /* TODO: copy link to clipboard */ }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button
                aria-label="Share to X"
                onClick={() => { /* TODO: open X share dialog */ }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h3l-7.5 8.6L22 22h-6.6l-5.2-6.8L4.4 22H1.4l8.1-9.3L1 2h6.7l4.7 6.2L18 2z" />
                </svg>
              </button>
              <button
                aria-label="Share via email"
                onClick={() => { /* TODO: open mailto draft */ }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </button>
            </div>
          </div>
        </article>

        <div className="post-body">
          <p>
            Some weeks the bar feels heavier than it should. Sleep slips, work piles up, motivation thins.
            Trying to grind through it usually costs you more than backing off would.
          </p>
          <p>
            Here&apos;s the 5-day reset I run when training stops feeling good — it brings me back without
            losing the base I built.
          </p>

          <h2>Day 1 — Cut volume by 50%</h2>
          <p>
            Same lifts, half the sets. Eat to maintenance. Sleep nine hours. The point isn&apos;t to train less;
            it&apos;s to train deliberately less. Let your nervous system breathe.
          </p>

          <blockquote>&ldquo;You can&apos;t out-program a tired body. You can only out-rest it.&rdquo;</blockquote>

          <h2>Day 2-3 — Walk + breathe</h2>
          <p>
            No barbells. Two long walks per day, twenty minutes of slow breathing in the evening. Sounds
            passive — feels active. By Day 3 your shoulders sit a centimetre lower than they did on Monday.
          </p>

          <ul>
            <li>Walk before coffee, in daylight</li>
            <li>Box-breath 4-4-4-4 for ten rounds</li>
            <li>Carbs around dinner, not breakfast</li>
          </ul>

          <h2>Day 4 — Light return</h2>
          <p>
            One session, 60% intensity, five reps below your true tens. The goal is to remember what good
            movement feels like, not to test anything. Walk away wanting more.
          </p>

          <h2>Day 5 — Honest check-in</h2>
          <p>
            If you woke up wanting to train, you&apos;re back. If you didn&apos;t, repeat Days 2-3 and try again.
            The protocol works on the timeline your body sets, not yours.
          </p>

          <p>
            Try it the next time you feel flat for more than 4 days in a row. Strong is what you build
            between the heavy weeks, not despite them.
          </p>
        </div>

        <div className="post-tags">
          <button className="tag-chip" onClick={() => { filterByTag("recovery"); }}>recovery</button>
          <button className="tag-chip" onClick={() => { filterByTag("training"); }}>training</button>
        </div>

        {/* Related posts */}
        <div className="related">
          <h2>Related posts</h2>
          <div className="related-grid">
            {["sleep-first-supplements-second", "training-with-anxiety", "morning-habits"].map((slug) => {
              const post = POSTS.find((p) => p.slug === slug);
              if (!post) return null;
              return (
                <a
                  key={slug}
                  className="post-card"
                  href={`#/post/${slug}`}
                  onClick={(e) => { e.preventDefault(); showSingle(slug); }}
                >
                  <CoverDiv cover={post.cover} />
                  <div className="pc-body">
                    <h3 className="pc-title">{post.title}</h3>
                    <div className="pc-meta">
                      <span>{post.readMin} min</span>
                      <span className="dot" />
                      {post.tags.map((t) => (
                        <span key={t} className="pc-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="comments">
          <h2>
            Comments
            <span className="provider-row" role="tablist" aria-label="Comments provider">
              {(["disqus", "hyvor", "off"] as CommentsProvider[]).map((p) => (
                <button
                  key={p}
                  className={commentsProvider === p ? "is-active" : ""}
                  role="tab"
                  aria-selected={commentsProvider === p}
                  onClick={() => setCommentsProvider(p)}
                >
                  {p === "disqus" ? "Disqus" : p === "hyvor" ? "Hyvor" : "Off"}
                </button>
              ))}
            </span>
          </h2>
          <div className={`panel${commentsProvider === "off" ? " disabled" : ""}`}>
            {commentsProvider === "disqus" && (
              <>
                {/* TODO: embed Disqus widget */}
                <p><b>Disqus</b> embed renders here. Creator picks the provider in Page settings → Comments.</p>
                <p style={{ fontSize: "12.5px", color: "var(--fg-subtle)", marginTop: "8px" }}>
                  No tracking, no third-party fonts. Visitors keep their privacy.
                </p>
              </>
            )}
            {commentsProvider === "hyvor" && (
              <>
                {/* TODO: embed Hyvor Talk widget */}
                <p><b>Hyvor Talk</b> embed renders here. Privacy-first, GDPR-friendly, no ads.</p>
                <p style={{ fontSize: "12.5px", color: "var(--fg-subtle)", marginTop: "8px" }}>
                  Free up to 1k pageviews/month — perfect for indie blogs.
                </p>
              </>
            )}
            {commentsProvider === "off" && (
              <>
                <p>Comments are <b>off</b> for this post.</p>
                <p style={{ fontSize: "12.5px", color: "var(--fg-subtle)", marginTop: "8px" }}>
                  Reach Alexandra by email instead — link in the footer.
                </p>
              </>
            )}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="creator-footer">
        <div className="socials">
          <a href="#" className="social" title="Instagram" aria-label="Instagram" onClick={(e) => e.preventDefault()}>📸</a>
          <a href="#" className="social" title="TikTok"    aria-label="TikTok"    onClick={(e) => e.preventDefault()}>🎵</a>
          <a href="#" className="social" title="YouTube"   aria-label="YouTube"   onClick={(e) => e.preventDefault()}>📺</a>
          <a href="#" className="social" title="Email"     aria-label="Email"     onClick={(e) => e.preventDefault()}>✉️</a>
        </div>
        <div className="ftr-row">
          Powered by{" "}
          <span style={{ fontFamily: "var(--font-display)" }}>ta<span>da!</span>ify</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>get yours free →</a>
        </div>
      </footer>

    </div>
  );
}
