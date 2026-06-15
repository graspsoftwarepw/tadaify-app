/**
 * Public FAQ / Help Center page — what a visitor sees at
 * tadaify.com/<handle>/faq. Faithful port of
 * mockups/tadaify-mvp/creator-faq-public.html onto the shared PublicChrome.
 * Presentational + local React state only; data from a typed fixture.
 *
 * The mockup demoed sub-views (section / question / search / tag) via hash
 * routing. Here those are local state: live search filters + highlights across
 * all sections; the TOC selects/scrolls to a section; tag chips filter; each
 * Q&A is an accordion with a "was this helpful?" toggle and a deep-link copy
 * (mocked alert, as the mockup did). The TOC collapses on phones.
 *
 * @implements fr-creator-faq-public
 */
import { useMemo, useRef, useState } from "react";
import { PublicChrome } from "../public/PublicChrome";
import { faqContentFixture, type FaqQuestion } from "./creatorFaqPublicFixture";
import "./creator-faq-public-proto.css";

/** Splits text on the query (case-insensitive) for highlight rendering. */
function highlight(text: string, query: string) {
  if (!query) return text;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase() ? (
      <span className="hi-match" key={i}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function questionText(qn: FaqQuestion): string {
  const body = qn.body
    .map((b) => (Array.isArray(b) ? b.join(" ") : b))
    .join(" ");
  return `${qn.q} ${body}`.toLowerCase();
}

export function CreatorFaqPublicScreen() {
  const c = faqContentFixture();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    // Default: first question of the first section open (mockup default).
    const first = c.sections[0]?.questions[0]?.slug;
    return new Set(first ? [first] : []);
  });
  const [currentSection, setCurrentSection] = useState(c.sections[0]?.slug ?? "");
  const [helpful, setHelpful] = useState<Record<string, "yes" | "no">>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  // Compute visible questions per section given the active search / tag filter.
  const filtered = useMemo(() => {
    return c.sections.map((sec) => {
      const questions = sec.questions.filter((qn) => {
        const tagOk = !tag || qn.tags.includes(tag);
        const searchOk = !q || questionText(qn).includes(q);
        return tagOk && searchOk;
      });
      return { ...sec, questions };
    });
  }, [c.sections, q, tag]);

  const totalMatches = filtered.reduce((n, s) => n + s.questions.length, 0);
  const hasFilter = q !== "" || tag !== "";

  function toggleOpen(slug: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function goSection(slug: string) {
    setCurrentSection(slug);
    setQuery("");
    setTag("");
    const el = contentRef.current?.querySelector(`#faq-section-${slug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function copyDeepLink(slug: string) {
    const url = `${window.location.href.split("#")[0]}#/q/${slug}`;
    window.alert(`Mockup — copied permalink:\n${url}`);
  }

  // A question is open if explicitly opened, or auto-expanded by an active filter.
  const isOpen = (slug: string) => hasFilter || openIds.has(slug);

  return (
    <PublicChrome
      rootClassName="proto-faq-public"
      creator={c.creator}
      current="faq"
      urlSuffix="faq"
      socials={c.footerSocials}
    >
      <header className="page-hero">
        <h1>{c.hero.title}</h1>
        <p className="lede">{c.hero.lede}</p>
        <div className="meta-line">
          <span>{c.meta.questions} questions</span>
          <span className="dot" />
          <span>{c.meta.sections} sections</span>
          <span className="dot" />
          <span>Last updated <b>{c.meta.updated}</b></span>
        </div>
      </header>

      <div className="search-bar-wrap">
        <div className="search-bar">
          <div className={`search-input-wrap${query ? " has-query" : ""}`}>
            <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the Help Center…"
              aria-label="Search FAQ"
            />
            {query && (
              <button className="clear-btn" onClick={() => setQuery("")} aria-label="Clear search">×</button>
            )}
          </div>
        </div>
      </div>

      <div className="tag-chip-bar">
        <button className={`tag-chip${tag === "" ? " is-active" : ""}`} onClick={() => setTag("")}>All tags</button>
        {c.tags.map((t) => (
          <button key={t} className={`tag-chip${tag === t ? " is-active" : ""}`} onClick={() => setTag(t === tag ? "" : t)}>
            {t}
          </button>
        ))}
      </div>

      {hasFilter && totalMatches > 0 && (
        <div className="search-banner">
          Showing <b>{totalMatches}</b> {tag ? <>tagged <b>{tag}</b></> : <>matches for "<b>{query}</b>"</>}
        </div>
      )}

      <div className="faq-layout">
        <aside className={`toc${tocCollapsed ? " is-collapsed" : ""}`} aria-label="Table of contents">
          <button className="toc-toggle" onClick={() => setTocCollapsed((v) => !v)} aria-expanded={!tocCollapsed}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Sections ({c.sections.length})
          </button>
          <ul className="toc-list">
            {c.sections.map((sec) => (
              <li key={sec.slug}>
                <button
                  type="button"
                  className={`toc-link${currentSection === sec.slug && !hasFilter ? " is-current" : ""}`}
                  onClick={() => goSection(sec.slug)}
                >
                  <span className="toc-icon" aria-hidden="true">{sec.icon}</span>
                  {sec.title}
                  <span className="toc-count">{sec.questions.length}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="toc-help">
            Can't find what you need?<br />
            Try <b>Cmd/Ctrl + F</b> on the page, or use the search above. Every answer has a permalink — click the <b>🔗</b> icon to share a single Q&amp;A.
          </div>
        </aside>

        <div className="faq-content" ref={contentRef}>
          {filtered.map((sec) =>
            sec.questions.length === 0 ? null : (
              <section className="faq-section" id={`faq-section-${sec.slug}`} key={sec.slug}>
                <h2><span className="h2-icon" aria-hidden="true">{sec.icon}</span> {sec.title}</h2>
                <p className="sec-intro">{sec.intro}</p>
                <div className="qa-stack">
                  {sec.questions.map((qn) => {
                    const open = isOpen(qn.slug);
                    return (
                      <div className={`qa-item${open ? " is-open" : ""}`} id={`faq-q-${qn.slug}`} key={qn.slug}>
                        <button className="qa-summary" aria-expanded={open} onClick={() => toggleOpen(qn.slug)}>
                          <span className="qi-q">{highlight(qn.q, q)}</span>
                          <svg className="qi-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {open && (
                          <>
                            <div className="qi-body">
                              {qn.body.map((b, i) =>
                                Array.isArray(b) ? (
                                  <ul key={i}>{b.map((li, j) => <li key={j}>{li}</li>)}</ul>
                                ) : (
                                  <p key={i}>{b}</p>
                                ),
                              )}
                            </div>
                            <div className="qi-meta-row">
                              <div className="qi-tags">
                                {qn.tags.map((t) => (
                                  <button key={t} className="qi-tag" onClick={() => setTag(t)}>{t}</button>
                                ))}
                              </div>
                              <div className="qi-actions">
                                <div className="qi-helpful">
                                  {helpful[qn.slug] ? (
                                    <span>{helpful[qn.slug] === "yes" ? "Thanks for the feedback!" : "Thanks — I'll improve this answer."}</span>
                                  ) : (
                                    <>
                                      <span>Was this helpful?</span>
                                      <button onClick={() => setHelpful((h) => ({ ...h, [qn.slug]: "yes" }))}>Yes</button>
                                      <button onClick={() => setHelpful((h) => ({ ...h, [qn.slug]: "no" }))}>No</button>
                                    </>
                                  )}
                                </div>
                                <button className="qi-deeplink" onClick={() => copyDeepLink(qn.slug)} aria-label="Copy permalink">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ),
          )}

          {hasFilter && totalMatches === 0 && (
            <div className="no-match">
              <h3>No matches{query ? <> for "{query}"</> : null}</h3>
              <p>Try a different keyword, or message me directly — I'll add an answer if it's a common one.</p>
              <div className="nm-actions">
                <a className="sq-cta" href="/__proto/creator-contact-public">Message Alexandra →</a>
                <button className="nm-clear" onClick={() => { setQuery(""); setTag(""); }}>Clear search</button>
              </div>
            </div>
          )}

          <div className="still-questions">
            <h3>Still have questions?</h3>
            <p>Send me a message — I usually reply within a day.</p>
            <a className="sq-cta" href="/__proto/creator-contact-public">Contact Alexandra →</a>
          </div>
        </div>
      </div>
    </PublicChrome>
  );
}
