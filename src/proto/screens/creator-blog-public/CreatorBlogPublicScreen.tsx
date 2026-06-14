/**
 * Public Blog page — what a visitor sees at tadaify.com/<handle>/blog.
 * Faithful port of mockups/tadaify-mvp/creator-blog-public.html, which demos
 * three sub-views in one file: the post LIST (optionally tag-filtered), a
 * SINGLE POST, and the tag-filtered list (the list view with a tag preselected).
 * Presentational + local React state only; content from typed fixtures. The
 * top-strip theme toggle is a mockup-only aid for reviewing both palettes.
 *
 * @implements fr-creator-blog-public
 */
import { useState } from "react";
import "./creator-blog-public-proto.css";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import {
  blogContentFixture,
  type CommentsProvider,
  type CoverTint,
  type PostBodyBlock,
} from "./creatorBlogPublicFixture";

const COVER_CLASS: Record<CoverTint, string> = {
  amber: "",
  indigo: "t-indigo",
  rose: "t-rose",
  emerald: "t-emerald",
  slate: "t-slate",
  sky: "t-sky",
};

function PostBody({ blocks }: { blocks: PostBodyBlock[] }) {
  return (
    <div className="post-body">
      {blocks.map((b, i) => {
        if (b.kind === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.kind === "blockquote") return <blockquote key={i}>{b.text}</blockquote>;
        if (b.kind === "ul")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

export function CreatorBlogPublicScreen() {
  const c = blogContentFixture();
  const [view, setView] = useState<"list" | "post">("list");
  const [activeTag, setActiveTag] = useState<string>("");
  const [provider, setProvider] = useState<CommentsProvider>("disqus");

  const openPost = () => {
    setView("post");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const backToList = () => {
    setView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const filterByTag = (tag: string) => {
    setActiveTag(tag);
    setView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visiblePosts = activeTag
    ? c.posts.filter((p) => p.tags.includes(activeTag))
    : c.posts;
  const isEmpty = activeTag !== "" && visiblePosts.length === 0;
  const urlTail =
    view === "post"
      ? `blog/${c.single.slug}`
      : activeTag
        ? `blog?tag=${activeTag}`
        : "blog";

  return (
    <div className="proto-root proto-blog-public">
      {/* Mockup-only top strip */}
      <div className="public-topstrip">
        <a href="/__proto" className="text-muted">← back to prototype hub</a>
        <span className="flex items-center gap-3">
          <span className="url">tadaify.com/{c.hero.handle}/{urlTail}</span>
          <ThemeToggle />
        </span>
      </div>

      {/* Canonical creator home nav (inherited chrome) */}
      <nav className="creator-nav">
        <a href="/__proto/creator-public" className="cn-handle">
          <span className="av" aria-hidden="true">{c.hero.initial}</span>
          {c.hero.name}
        </a>
        <div className="cn-links">
          {c.nav.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={link.current ? "is-current" : undefined}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── VIEW 1 — LIST ── */}
      {view === "list" && (
        <section className="view" aria-label="Blog post list">
          <div className="page-hero">
            <h1>{c.hero.title}</h1>
            <p className="lede">{c.hero.lede}</p>
            <div className="meta-line">
              <span><b>{visiblePosts.length}</b> posts · {c.hero.span}</span>
              <span className="dot" />
              <button type="button" className="linklike" onClick={() => alert("Mockup — opens RSS in newsreader")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
                </svg>
                Subscribe via RSS
              </button>
              <span className="dot" />
              <button type="button" className="linklike" onClick={() => alert("Mockup — opens email subscribe modal")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Get new posts by email
              </button>
            </div>

            <div className="tag-bar">
              <button
                type="button"
                className={`tag-chip${activeTag === "" ? " is-active" : ""}`}
                onClick={() => filterByTag("")}
              >
                All
              </button>
              {c.tags.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  className={`tag-chip${activeTag === t.slug ? " is-active" : ""}`}
                  onClick={() => filterByTag(t.slug)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {isEmpty ? (
            <div className="empty-tag">
              <div className="emoji" aria-hidden="true">🌿</div>
              <h3>No posts tagged "{activeTag}" yet</h3>
              <p>
                Try another tag, or{" "}
                <button type="button" className="linklike" onClick={() => filterByTag("")}>view all posts</button>.
              </p>
            </div>
          ) : (
            <div className="feed">
              {visiblePosts.map((p) => (
                <button type="button" className="post-card" key={p.slug} onClick={openPost}>
                  <div className={`pc-cover ${COVER_CLASS[p.cover]}`} aria-hidden="true">{p.emoji}</div>
                  <div className="pc-body">
                    <h2 className="pc-title">{p.title}</h2>
                    <p className="pc-excerpt">{p.excerpt}</p>
                    <div className="pc-meta">
                      <span className="pc-author"><span className="ax">{p.authorInitial}</span> {p.author}</span>
                      <span className="dot" />
                      <span>{p.date}</span>
                      <span className="dot" />
                      {p.tags.map((tag) => (
                        <span className="pc-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pagination">
            <div className="pg-meta">
              Showing <b>{c.pagination.rangeStart}–{c.pagination.rangeEnd}</b> of <b>{c.pagination.total}</b> posts
            </div>
            <div className="pg-controls">
              <button disabled aria-label="Previous">←</button>
              {c.pagination.pages.map((n) => (
                <button
                  key={n}
                  className={n === c.pagination.current ? "is-current" : undefined}
                  aria-current={n === c.pagination.current ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button aria-label="Next">→</button>
            </div>
            <button className="load-more" onClick={() => alert("Mockup — appends next 6 posts to feed")}>Load more posts</button>
          </div>
        </section>
      )}

      {/* ── VIEW 2 — SINGLE POST ── */}
      {view === "post" && (
        <section className="view" aria-label="Blog post">
          <div className={`post-cover-full t-${c.single.cover}`} aria-hidden="true">{c.single.emoji}</div>

          <div className="post-back">
            <button type="button" onClick={backToList}>← Back to all posts</button>
          </div>

          <article className="post-article">
            <h1>{c.single.title}</h1>
            <div className="post-meta-row">
              <span className="author-pill">
                <span className="av" aria-hidden="true">{c.single.authorInitial}</span>
                <span>Posted by <b>{c.single.author}</b></span>
              </span>
              <span className="dot" />
              <span>{c.single.dateLong}</span>
              <span className="dot" />
              <span>{c.single.readTime}</span>
              <div className="share">
                <button aria-label="Copy link" onClick={() => alert("Mockup — link copied")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                </button>
                <button aria-label="Share to X" onClick={() => alert("Mockup — opens share dialog")}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h3l-7.5 8.6L22 22h-6.6l-5.2-6.8L4.4 22H1.4l8.1-9.3L1 2h6.7l4.7 6.2L18 2z" /></svg>
                </button>
                <button aria-label="Share via email" onClick={() => alert("Mockup — opens mailto draft")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </button>
              </div>
            </div>
          </article>

          <PostBody blocks={c.single.body} />

          <div className="post-tags">
            {c.single.tags.map((tag) => (
              <button type="button" className="tag-chip" key={tag} onClick={() => filterByTag(tag)}>{tag}</button>
            ))}
          </div>

          <div className="related">
            <h2>Related posts</h2>
            <div className="related-grid">
              {c.single.related.map((r) => (
                <button type="button" className="post-card" key={r.slug} onClick={openPost}>
                  <div className={`pc-cover ${COVER_CLASS[r.cover]}`} aria-hidden="true">{r.emoji}</div>
                  <div className="pc-body">
                    <h3 className="pc-title">{r.title}</h3>
                    <div className="pc-meta">
                      <span>{r.readTime}</span>
                      <span className="dot" />
                      <span className="pc-tag">{r.tag}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="comments">
            <h2>
              Comments
              <span className="provider-row" role="tablist" aria-label="Comments provider">
                <button
                  className={provider === "disqus" ? "is-active" : undefined}
                  onClick={() => setProvider("disqus")}
                >
                  Disqus
                </button>
                <button
                  className={provider === "hyvor" ? "is-active" : undefined}
                  onClick={() => setProvider("hyvor")}
                >
                  Hyvor
                </button>
                <button
                  className={provider === "off" ? "is-active" : undefined}
                  onClick={() => setProvider("off")}
                >
                  Off
                </button>
              </span>
            </h2>
            <div className={`panel${provider === "off" ? " disabled" : ""}`}>
              <p>
                <b>{c.comments[provider].leadEm}</b>
                {c.comments[provider].settingsLink ? (
                  <>
                    {" embed renders here. Creator picks the provider in "}
                    <a href={c.comments[provider].settingsLink!.href}>
                      {c.comments[provider].settingsLink!.label}
                    </a>
                    .
                  </>
                ) : (
                  c.comments[provider].leadRest
                )}
              </p>
              <p className="sub">{c.comments[provider].sub}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer (mirror creator-public social block) ── */}
      <footer className="creator-footer">
        <div className="socials">
          {c.socials.map((s) => (
            <button
              type="button"
              key={s.label}
              className="social"
              title={s.label}
              aria-label={s.label}
              onClick={() => alert(`Mockup — opens ${s.label}`)}
            >
              {s.glyph}
            </button>
          ))}
        </div>
        <div className="ftr-row">
          {c.footerNote} <Wordmark size="sm" />
          <span style={{ opacity: 0.6 }}>·</span>
          <a href="#">get yours free →</a>
        </div>
      </footer>
    </div>
  );
}
