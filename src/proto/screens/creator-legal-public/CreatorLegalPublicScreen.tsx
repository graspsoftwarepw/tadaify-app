/**
 * Public Legal page — what a visitor sees at tadaify.com/<handle>/legal: a
 * single page that renders every published policy (Terms, Privacy, Cookie,
 * Refund, DMCA) with a sticky table of contents, a policy chooser, per-policy
 * version/effective metadata, permalinks, and collapsible version history.
 * Faithful port of mockups/tadaify-mvp/creator-legal-public.html onto the
 * shared PublicChrome. Presentational + local React state only; data from a
 * typed fixture.
 *
 * The mockup demoed sub-views via hash routing (#/ all policies, #/policy/<slug>
 * single-policy focus, #/version/<slug>/<v> archived, #/print). Here those
 * become local state: a "focus" selection narrows the page to one policy (the
 * chooser + TOC drive it), and an in-view "Mockup states" strip lets a reviewer
 * jump back to all policies. The print + copy-link actions are mocked. Legal is
 * not a canonical nav section, so no nav item is forced active.
 *
 * @implements fr-creator-legal-public
 */
import { useState } from "react";
import { PublicChrome, type PublicPageId } from "../public/PublicChrome";
import { legalContentFixture, type PolicyBlock } from "./creatorLegalPublicFixture";
import "./creator-legal-public-proto.css";

// Legal is not part of the canonical creator nav, so nothing is marked active.
const NO_CURRENT = "none" as PublicPageId;

function PolicyBody({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="policy-body">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "heading":
            return (
              <h3 id={b.id} key={i}>
                {b.text}
              </h3>
            );
          case "p":
            return <p key={i}>{b.html}</p>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            );
          case "blockquote":
            return <blockquote key={i}>{b.html}</blockquote>;
        }
      })}
    </div>
  );
}

export function CreatorLegalPublicScreen() {
  const c = legalContentFixture();
  // null = all policies; a slug = single-policy focus mode.
  const [focus, setFocus] = useState<string | null>(null);
  const [openHistory, setOpenHistory] = useState<Record<string, boolean>>({});

  const shown = focus ? c.policies.filter((p) => p.id === focus) : c.policies;

  const mockAction = (msg: string) => () => window.alert(`Mockup — ${msg}`);

  return (
    <PublicChrome
      rootClassName="proto-legal-public"
      creator={c.creator}
      current={NO_CURRENT}
      urlSuffix="legal"
      socials={c.footerSocials}
      footerNote="Built with"
    >
      <header className="page-hero">
        <h1>{c.hero.title}</h1>
        <p className="lede">{c.hero.lede}</p>
        <div className="meta-line">
          <span className="live-dot" aria-hidden="true" />
          <span>
            Last reviewed <b>{c.lastReviewed}</b>
          </span>
          <span className="dot" aria-hidden="true" />
          <span>{c.policies.length} policies</span>
          <span className="dot" aria-hidden="true" />
          <span>Available languages: {c.languages}</span>
        </div>
      </header>

      {/* Policy chooser pills — clicking focuses a single policy. */}
      <nav className="pill-bar" aria-label="Policy chooser">
        <span className="pb-label">Choose a section:</span>
        {c.policies.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`pb-pill${focus === p.id ? " is-active" : ""}`}
            aria-pressed={focus === p.id}
            onClick={() => setFocus((cur) => (cur === p.id ? null : p.id))}
          >
            <span className="pb-emoji" aria-hidden="true">
              {p.emoji}
            </span>{" "}
            {p.title}
          </button>
        ))}
      </nav>

      <div className="toolbar-row">
        <span className="tr-note">
          {focus
            ? "Showing one policy. Choose “All policies” below to see everything."
            : "Showing all policies. Use the chooser above to focus on one."}
        </span>
        <span className="tr-spacer" />
        <button className="btn-tool" type="button" onClick={mockAction("opens a print-friendly view")}>
          🖨 Print this page
        </button>
        <button
          className="btn-tool"
          type="button"
          onClick={mockAction("copies the canonical legal-page URL for sharing")}
        >
          🔗 Copy page link
        </button>
      </div>

      <div className="legal-grid">
        {/* TOC sidebar (collapses to an accordion on phone). */}
        <aside className="toc" aria-label="Policy contents">
          <ul className="toc-list">
            {c.policies.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`toc-section${focus === p.id ? " is-current" : ""}`}
                  aria-current={focus === p.id ? "true" : undefined}
                  onClick={() => setFocus((cur) => (cur === p.id ? null : p.id))}
                >
                  <span className="ts-emoji" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <span>{p.title}</span>
                </button>
                <ul className="toc-sub">
                  {p.toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>{t.label}</a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {shown.map((p) => {
            const histOpen = openHistory[p.id] ?? false;
            return (
              <article className="policy" id={p.id} key={p.id}>
                <div className="policy-head">
                  <div className="ph-icon" aria-hidden="true">
                    {p.emoji}
                  </div>
                  <div className="ph-meta">
                    <h2>{p.title}</h2>
                    <div className="ph-line">
                      <span className="ph-version">{p.version}</span>
                      <span className="ph-effective">⏱ {p.effective}</span>
                      {p.note && (
                        <>
                          <span className="dot" aria-hidden="true" />
                          <span>{p.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ph-actions">
                    <button
                      type="button"
                      className="ph-action"
                      aria-label="Copy permalink"
                      title="Copy permalink to this section"
                      onClick={mockAction(`copies the permalink ${p.permalink}`)}
                    >
                      🔗
                    </button>
                    <button
                      type="button"
                      className="ph-action"
                      aria-label="Single-policy mode"
                      title="Read in single-policy mode"
                      aria-pressed={focus === p.id}
                      onClick={() => setFocus((cur) => (cur === p.id ? null : p.id))}
                    >
                      ⛶
                    </button>
                  </div>
                </div>

                <PolicyBody blocks={p.body} />

                <div className="policy-foot">
                  <span>
                    Permalink: <code>{p.permalink}</code>
                  </span>
                  <span className="pf-spacer" />
                  {p.history.length > 0 && (
                    <div className="ver-history">
                      <button
                        type="button"
                        className="vh-summary"
                        aria-expanded={histOpen}
                        onClick={() =>
                          setOpenHistory((prev) => ({ ...prev, [p.id]: !histOpen }))
                        }
                      >
                        View {p.history.length} past{" "}
                        {p.history.length === 1 ? "version" : "versions"}
                        <span className="vh-caret" aria-hidden="true">
                          {histOpen ? "▴" : "▾"}
                        </span>
                      </button>
                      {histOpen && (
                        <ul className="vh-list">
                          {p.history.map((h) => (
                            <li key={h.version}>
                              <span className="vh-version">{h.version}</span>
                              <span className="vh-eff">{h.range}</span>
                              <button
                                type="button"
                                className="vh-view"
                                onClick={mockAction(
                                  `opens the archived ${p.title} ${h.version}`,
                                )}
                              >
                                View archived
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </main>
      </div>

      <div className="page-foot">
        <div className="pf-meta">
          ⏱ Last reviewed: <b>{c.lastReviewed}</b> · Next review due {c.nextReview}
        </div>
        <div>
          Have a legal question? Email{" "}
          <button
            type="button"
            className="pf-mail"
            onClick={mockAction(`opens your mail client to ${c.contactEmail}`)}
          >
            {c.contactEmail}
          </button>
        </div>
      </div>

      <div className="page-copyright">{c.copyright}</div>

      {/* Mockup-only state switcher (replaces the mockup's hash sub-views). */}
      <div className="state-strip" aria-label="Mockup states">
        <span>Mockup states (try each):</span>
        <button
          type="button"
          className={focus === null ? "is-active" : undefined}
          onClick={() => setFocus(null)}
        >
          All policies
        </button>
        {c.policies.map((p) => (
          <button
            key={p.id}
            type="button"
            className={focus === p.id ? "is-active" : undefined}
            onClick={() => setFocus(p.id)}
          >
            {p.emoji} {p.title} only
          </button>
        ))}
        <span className="ss-note">a visitor reaches these via the chooser or TOC</span>
      </div>
    </PublicChrome>
  );
}
