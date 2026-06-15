/**
 * Administration → Blog — the day-to-day publishing surface a creator opens at
 * Administration > Blog. Faithful port of mockups/tadaify-mvp/app-admin-blog.html,
 * wrapped in the shared dashboard chrome (appbar + sidebar) with the Blog
 * Administration sub-item marked active. Pairs with the Blog page editor
 * (page-level theme / layout / SEO lives in Pages → Blog).
 *
 * Presentational, local-state only: switch the demo state (no Blog page yet /
 * empty / filled), filter the post tabs, search posts by title, and open the
 * centred post-composer modal (closes on Escape, Cancel, and backdrop click).
 * The Business-gated Author field stays fully visible and interactive; the gate
 * is mocked at Save. Data comes from the typed adminBlogFixture.
 *
 * @implements fr-admin-blog
 * @implements fr-globalui-view-layout
 */
import "./admin-blog-proto.css";
import { useEffect, useState } from "react";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  adminBlogFixture,
  type PostFilter,
  type PostStatus,
} from "./adminBlogFixture";

type DemoState = "filled" | "empty" | "no-page";

const STATUS_CHIP: Record<PostStatus, { cls: string; label: string }> = {
  published: { cls: "live", label: "● Published" },
  scheduled: { cls: "scheduled", label: "⏱ Scheduled" },
  draft: { cls: "draft", label: "○ Draft" },
};

const EditIcon = () => (
  <S w={16}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </S>
);

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const noop = (label: string) => () => window.alert(`${label} (prototype)`);

export function AdminBlogScreen() {
  const profile = dashboardProfileFixture();
  const fx = adminBlogFixture();

  const [demoState, setDemoState] = useState<DemoState>("filled");
  const [filter, setFilter] = useState<PostFilter>("all");
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);

  useEffect(() => {
    if (!composerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setComposerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [composerOpen]);

  const visiblePosts = fx.posts.filter((p) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "published" && p.status === "published") ||
      (filter === "drafts" && p.status === "draft") ||
      (filter === "scheduled" && p.status === "scheduled");
    const matchesQuery = p.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <DashboardChrome profile={profile} activeNav="admin-blog">
      <div className="proto-admin-blog">
        <nav className="ab-crumb" aria-label="Breadcrumb">
          <a href="/__proto/dashboard">Dashboard</a>
          <span className="sep">/</span>
          <span className="here">Administration · Blog</span>
        </nav>

        <header className="ab-page-head">
          <div>
            <h1>
              <span className="ph-emoji" aria-hidden>✍️</span> Blog publishing
            </h1>
            <div className="sub">
              Write, schedule, and manage posts. Page-level setup (theme, layout,
              SEO) lives in{" "}
              <a className="ab-link" href="/__proto/page-blog">Pages → Blog</a>.
            </div>
          </div>
          {demoState !== "no-page" && (
            <div className="actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={noop("Comments")}>
                Comments
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setComposerOpen(true)}>
                ＋ New post
              </button>
            </div>
          )}
        </header>

        {/* Demo state switcher (prototype only) */}
        <div className="ab-demo-switch" role="group" aria-label="Demo state">
          <span className="ab-demo-label">Demo state:</span>
          {(["filled", "empty", "no-page"] as DemoState[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-xs${demoState === s ? " btn-primary" : " btn-ghost"}`}
              onClick={() => setDemoState(s)}
            >
              {s === "filled" ? "Filled (23 posts)" : s === "empty" ? "Empty (0 posts)" : "No Blog page yet"}
            </button>
          ))}
        </div>

        {/* ===== STATE: NO BLOG PAGE ===== */}
        {demoState === "no-page" && (
          <section>
            <div className="ab-empty">
              <div className="ab-empty-icon" aria-hidden>📝</div>
              <h3>You don't have a Blog page yet</h3>
              <p>
                Blog posts let you share long-form updates with your audience. To
                start publishing, add a Blog page first — pick a theme, lock the
                URL, and you're live.
              </p>
              <div className="ab-empty-actions">
                <a href="/__proto/dashboard" className="btn btn-primary">＋ Add Blog page now</a>
                <button className="btn btn-ghost" type="button" onClick={() => setExplainerOpen((v) => !v)}>
                  Skip — what is Blog?
                </button>
              </div>
            </div>
            <details className="ab-explainer" open={explainerOpen}>
              <summary onClick={(e) => { e.preventDefault(); setExplainerOpen((v) => !v); }}>
                What is the Blog page?
              </summary>
              <div className="ex-body">
                <p><b>Blog</b> is the long-form content surface for your tadaify creator page. Use it for:</p>
                <ul>
                  <li><b>Behind-the-scenes posts</b> — process notes, sketches, drafts your audience won't see anywhere else</li>
                  <li><b>Newsletters that live somewhere</b> — searchable archive of every issue</li>
                  <li><b>SEO-friendly long content</b> — articles that bring search traffic to your tadaify page</li>
                  <li><b>Substack alternative</b> — bring your existing audience without the Substack take-rate</li>
                </ul>
                <p>The Blog page is one of the page templates available on every paid plan (Creator+). Free tier ships Home only — upgrade to add Blog.</p>
              </div>
            </details>
          </section>
        )}

        {/* ===== STATE: EMPTY (page exists, no posts) ===== */}
        {demoState === "empty" && (
          <section>
            <div className="ab-empty">
              <div className="ab-empty-icon" aria-hidden>✍️</div>
              <h3>No posts yet</h3>
              <p>
                Your Blog page is live at <code>tadaify.com/{fx.handle}/blog</code> but
                it's empty. Publish your first post — even a 200-word welcome — to
                give visitors something to read.
              </p>
              <div className="ab-empty-actions">
                <button className="btn btn-primary" type="button" onClick={() => setComposerOpen(true)}>
                  ＋ Write your first post
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ===== STATE: FILLED ===== */}
        {demoState === "filled" && (
          <section>
            <div className="ab-section">
              <div className="ab-section-head">
                <h2>Posts</h2>
                <span className="sub">{fx.stats.summary}</span>
              </div>
              <div className="ab-section-body">
                <div className="ab-posts-toolbar">
                  <div className="ab-tabs" role="tablist" aria-label="Filter posts">
                    {fx.stats.tabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={filter === t.id}
                        className={`ab-tab${filter === t.id ? " is-active" : ""}`}
                        onClick={() => setFilter(t.id)}
                      >
                        {t.label} <span className="ab-tab-count">{t.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ab-search-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Search posts by title…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ab-posts-list">
                  {visiblePosts.map((p) => {
                    const chip = STATUS_CHIP[p.status];
                    return (
                      <article className="ab-post-row" key={p.id}>
                        <div className={`ab-pr-thumb t-${p.thumb}`} aria-hidden>{p.emoji}</div>
                        <div className="ab-pr-meta">
                          <h4 className="ab-pr-title">{p.title}</h4>
                          <div className="ab-pr-sub">
                            <span className={`chip ${chip.cls}`}>{chip.label}</span>
                            <span>{p.meta}</span>
                          </div>
                        </div>
                        <div className="ab-pr-actions">
                          <button className="iconbtn" type="button" aria-label="Edit" onClick={noop("Edit post")}>
                            <EditIcon />
                          </button>
                          <button className="iconbtn" type="button" aria-label="More" onClick={noop("More actions")}>
                            <MoreIcon />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {visiblePosts.length === 0 && (
                    <p className="ab-no-results">No posts match this filter.</p>
                  )}
                </div>

                <div className="ab-pagination">
                  <button className="ab-page-btn" type="button" aria-label="Previous page" onClick={noop("Previous page")}>‹</button>
                  {fx.pages.map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      className={`ab-page-btn${pg === fx.currentPage ? " is-current" : ""}`}
                      aria-current={pg === fx.currentPage ? "page" : undefined}
                      onClick={noop(`Page ${pg}`)}
                    >
                      {pg}
                    </button>
                  ))}
                  <button className="ab-page-btn" type="button" aria-label="Next page" onClick={noop("Next page")}>›</button>
                </div>
              </div>
            </div>

            {/* Recent comments */}
            <details className="ab-section ab-comments">
              <summary className="ab-section-head">
                <h2>Recent comments</h2>
                <span className="sub">{fx.comments.provider} · {fx.comments.awaiting}</span>
                <span className="head-spacer" />
                <span className="chip">{fx.comments.provider} connected</span>
              </summary>
              <div className="ab-section-body">
                <div className="ab-comments-list">
                  {fx.comments.items.map((c) => (
                    <div className="ab-comment" key={c.id}>
                      <div className="ab-av" aria-hidden>{c.initial}</div>
                      <div className="ab-c-body">
                        <div className="ab-c-author">{c.author}</div>
                        <div className="ab-c-meta">{c.context}</div>
                        <div className="ab-c-text">{c.text}</div>
                      </div>
                      <div className="ab-c-actions">
                        <button className="btn btn-xs btn-ghost" type="button" onClick={noop("Reply")}>Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </section>
        )}
      </div>

      {/* ===== POST COMPOSER MODAL (centred, never a drawer) ===== */}
      {composerOpen && (
        <div
          className="ab-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ab-composer-title"
          onClick={(e) => { if (e.target === e.currentTarget) setComposerOpen(false); }}
        >
          <div className="ab-modal">
            <div className="ab-modal-head">
              <h3 id="ab-composer-title">New post</h3>
              <span className="chip draft">○ Draft</span>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setComposerOpen(false)}>
                <S w={16}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="ab-modal-body">
              <div className="ab-cover-uploader" tabIndex={0} role="button" onClick={noop("Upload cover image")}>
                <div className="cu-emoji" aria-hidden>📷</div>
                <div><b>Drop cover image here</b> or click to upload</div>
                <div className="cu-hint">PNG / JPG / WebP · max 5MB · 1600×900 recommended</div>
              </div>

              <div className="ab-field">
                <label className="ab-field-label" htmlFor="ab-title">Title</label>
                <input id="ab-title" className="ab-field-input" type="text" placeholder="A title that earns the click…" />
              </div>

              <div className="ab-field-row">
                <div className="ab-field">
                  <label className="ab-field-label" htmlFor="ab-slug">URL slug</label>
                  <input id="ab-slug" className="ab-field-input" type="text" placeholder="auto-generated-from-title" />
                </div>
                <div className="ab-field">
                  <label className="ab-field-label" htmlFor="ab-tags">Tags</label>
                  <input id="ab-tags" className="ab-field-input" type="text" placeholder="pricing, freelance, illustration" />
                </div>
              </div>

              <div className="ab-field">
                <label className="ab-field-label" htmlFor="ab-body">Body</label>
                <div className="ab-toolbar-rich" aria-hidden>
                  <button className="iconbtn" type="button" aria-label="Bold" onClick={noop("Bold")}><b>B</b></button>
                  <button className="iconbtn" type="button" aria-label="Italic" onClick={noop("Italic")}><i>I</i></button>
                  <button className="iconbtn" type="button" aria-label="Heading" onClick={noop("Heading")}>H</button>
                  <button className="iconbtn" type="button" aria-label="Link" onClick={noop("Link")}>🔗</button>
                  <button className="iconbtn" type="button" aria-label="Image" onClick={noop("Image")}>🖼</button>
                  <button className="iconbtn" type="button" aria-label="Quote" onClick={noop("Quote")}>&quot;</button>
                  <button className="iconbtn" type="button" aria-label="Code" onClick={noop("Code")}>{"{ }"}</button>
                </div>
                <textarea
                  id="ab-body"
                  className="ab-field-area with-toolbar"
                  placeholder={"Write your post in Markdown…\n\n## A heading\nA paragraph with **bold** and _italic_ and a [link](https://)."}
                />
              </div>

              <div className="ab-field-row">
                <div className="ab-field">
                  <label className="ab-field-label" htmlFor="ab-author">
                    Author <span className="chip tier">Business</span>
                  </label>
                  <select id="ab-author" className="ab-field-select" defaultValue="me">
                    <option value="me">Alexandra Silva (you)</option>
                    <option value="teammate" disabled>Jonas K. — invite a teammate (Business+)</option>
                  </select>
                </div>
                <div className="ab-field">
                  <label className="ab-field-label" htmlFor="ab-schedule">Schedule</label>
                  <input id="ab-schedule" className="ab-field-input" type="datetime-local" />
                </div>
              </div>
            </div>
            <div className="ab-modal-foot">
              <button className="btn btn-danger-ghost btn-sm" type="button" onClick={noop("Delete draft")}>Delete draft</button>
              <span className="foot-spacer" />
              <button className="btn btn-ghost" type="button" onClick={() => setComposerOpen(false)}>Cancel</button>
              <button className="btn btn-ghost" type="button" onClick={noop("Save draft")}>Save draft</button>
              <button className="btn btn-warm" type="button" onClick={noop("Schedule")}>Schedule</button>
              <button className="btn btn-primary" type="button" onClick={noop("Publish now")}>Publish now</button>
            </div>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}
