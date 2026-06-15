/**
 * Public single Paid article — what a visitor sees at
 * tadaify.com/<handle>/articles/<slug>: the article header, a free
 * above-the-fold preview, then a paywall that blurs the rest with an unlock
 * CTA. After purchase the full body unlocks, the paywall and sticky Buy bar
 * disappear, and a "You bought this" badge replaces the price chip. Faithful
 * port of mockups/tadaify-mvp/creator-paid-article-public.html onto the shared
 * PublicChrome. Presentational + local React state only; data from a typed
 * fixture.
 *
 * The mockup demoed two states (preview / purchased) via a state switch and a
 * Buy CTA that flips the state. Here those are local state: Buy and the
 * paywall CTA mock the Stripe purchase and unlock the article; an in-view
 * "Mockup states" strip lets a reviewer toggle directly. The paywall blur is
 * the product mechanic for paid content, not premium-feature gating.
 * "Articles" is not a canonical PublicChrome nav id, so a custom nav marks it
 * current.
 *
 * @implements fr-creator-paid-article-public
 */
import { useState } from "react";
import {
  PublicChrome,
  type PublicNavLink,
  type PublicPageId,
} from "../public/PublicChrome";
import {
  paidArticleContentFixture,
  type ArticleBlock,
} from "./creatorPaidArticlePublicFixture";
import "./creator-paid-article-public-proto.css";

const ARTICLES_CURRENT = "articles" as PublicPageId;

const ARTICLES_NAV: PublicNavLink[] = [
  { id: "home", label: "Home", href: "/__proto/creator-public" },
  { id: "about", label: "About", href: "/__proto/creator-about-public" },
  { id: "blog", label: "Blog", href: "/__proto/creator-blog-public" },
  { id: "portfolio", label: "Portfolio", href: "/__proto/creator-portfolio-public" },
  { id: ARTICLES_CURRENT, label: "Articles", href: "/__proto/creator-paid-articles-public" },
  { id: "book", label: "Book me", href: "/__proto/creator-schedule-public" },
];

const RELATED_TINT: Record<string, string> = {
  indigo: "t-indigo",
  warm: "t-warm",
  rose: "t-rose",
  emerald: "t-emerald",
};

function Body({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
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
          case "blockquote":
            return <blockquote key={i}>{b.html}</blockquote>;
        }
      })}
    </>
  );
}

export function CreatorPaidArticlePublicScreen() {
  const c = paidArticleContentFixture();
  const [purchased, setPurchased] = useState(false);

  const buy = () => {
    window.alert(`Mockup — would start a Stripe checkout for “${c.title}” (${c.price})`);
    setPurchased(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PublicChrome
      rootClassName="proto-paid-article-public"
      creator={c.creator}
      current={ARTICLES_CURRENT}
      urlSuffix={`articles/${c.slug}`}
      socials={c.footerSocials}
      footerNote="Built with"
      nav={ARTICLES_NAV}
    >
      <article className="article-wrap">
        <div className="breadcrumb">
          <a href="/__proto/creator-paid-articles-public">← All articles</a>
        </div>

        <header className="article-hero">
          <h1>{c.title}</h1>
          <div className="article-meta">
            <span className="author">
              <span className="av" aria-hidden="true">
                {c.creator.initial}
              </span>
              <span>{c.creator.name}</span>
            </span>
            <span>· {c.date}</span>
            <span>· {c.readTime}</span>
            {purchased ? (
              <span className="purchased-chip">{c.purchasedNote}</span>
            ) : (
              <span className="price-chip">{c.priceLine}</span>
            )}
          </div>
        </header>

        <div className="cover-img" aria-hidden="true">
          {c.coverEmoji}
        </div>

        {!purchased && (
          <div className="sticky-buy">
            <span className="sb-price">{c.price}</span>
            <span className="sb-meta">{c.stickyMeta}</span>
            <span className="sb-spacer" />
            <button type="button" className="btn-buy-lg" onClick={buy}>
              Buy now
            </button>
          </div>
        )}

        <div className="article-body">
          <Body blocks={c.freeBody} />
        </div>

        {/* Paywalled body — blurred until purchased, then revealed. */}
        <div className="paywall-wrap">
          <div className={`paywall-blur${purchased ? " is-unlocked" : ""}`} aria-hidden={!purchased}>
            <div className="article-body">
              <Body blocks={c.lockedBody} />
            </div>
          </div>

          {!purchased && (
            <div className="paywall-card">
              <div className="pw-icon" aria-hidden="true">
                🔓
              </div>
              <h3>{c.paywall.heading}</h3>
              <p>{c.paywall.body}</p>
              <div className="pw-price">{c.price}</div>
              <button type="button" className="pw-buy" onClick={buy}>
                Buy with Stripe
              </button>
              <div className="pw-reassure">✓ {c.paywall.reassure}</div>
              <div className="pw-stripe">🔒 {c.paywall.stripeNote}</div>
            </div>
          )}
        </div>

        <section className="comments-section">
          <h3>Comments</h3>
          <div className="cs-sub">
            {c.comments.count} comments · {c.comments.provider}
          </div>
          <div className="comments-list">
            {c.comments.items.map((cm) => (
              <div className="comment-row" key={cm.author}>
                <div className="av" aria-hidden="true">
                  {cm.initial}
                </div>
                <div>
                  <div className="c-author">{cm.author}</div>
                  <div className="c-meta">{cm.ago}</div>
                  <div className="c-text">{cm.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="related">
          <h3>You might also like</h3>
          <div className="related-grid">
            {c.related.map((r) => (
              <button
                type="button"
                className="related-card"
                key={r.title}
                onClick={() =>
                  (window.location.href = "/__proto/creator-paid-article-public")
                }
              >
                <div className={`rc-cover ${RELATED_TINT[r.tint]}`} aria-hidden="true">
                  {r.emoji}
                </div>
                <div className="rc-meta">
                  <div className="rc-title">{r.title}</div>
                  <div className="rc-price">{r.meta}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </article>

      {/* Mockup-only state switcher (replaces the mockup's state select). */}
      <div className="state-strip" aria-label="Mockup states">
        <span>Mockup states (try each):</span>
        <button
          type="button"
          className={!purchased ? "is-active" : undefined}
          onClick={() => setPurchased(false)}
        >
          Preview (paywalled)
        </button>
        <button
          type="button"
          className={purchased ? "is-active" : undefined}
          onClick={() => setPurchased(true)}
        >
          Purchased (unlocked)
        </button>
        <span className="ss-note">a visitor unlocks by buying</span>
      </div>
    </PublicChrome>
  );
}
