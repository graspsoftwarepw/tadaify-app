/**
 * CreatorPaidArticlePage — public-facing single paid article detail page.
 *
 * Two sub-states:
 *   - "preview" (default): free visible preview + paywall + Buy CTA
 *   - "purchased": full body unlocked, no paywall, "You bought this" badge
 *
 * All purchase/subscribe actions stubbed with TODO comments for Stripe
 * integration (Q+1 multi-page feature).
 *
 * Pairs with CreatorPaidArticlesPage for list view.
 * This is dead-code: NOT wired to app/routes.ts — will be added when multi-page ships.
 *
 * Styling: app/styles/public-pages/creator-paid-articles.css
 */

import type { ReactElement } from "react";
import { useState } from "react";

export function CreatorPaidArticlePage(): ReactElement {
  const [isPurchased, setIsPurchased] = useState(false);

  const handleBuy = () => {
    // TODO: wire to Stripe checkout flow
    setIsPurchased(true);
  };

  return (
    <div className="paid-article-detail-page">
      <div className="top-strip">
        <span className="pill">
          <span className="dot"></span>
          <b>tadaify.com/alexandra/articles/how-i-priced-my-last-commission</b>
        </span>
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

      <article className="article-wrap">
        <div className="breadcrumb">
          <a href="#articles">← All articles</a>
        </div>

        <header className="article-hero">
          <h1>How I priced my last commission</h1>
          <div className="article-meta">
            <div className="author">
              <span className="av">A</span>
              <span>Alexandra Silva</span>
            </div>
            <span>· Apr 24, 2026</span>
            <span>· 12 min read</span>
            {!isPurchased && (
              <span className="price-chip">$5 — pay once, read forever</span>
            )}
            {isPurchased && (
              <span className="purchased-chip">✓ You bought this on Apr 25</span>
            )}
          </div>
        </header>

        <div className="cover-img">📖</div>

        {!isPurchased && (
          <div className="sticky-buy">
            <span className="sb-price">$5</span>
            <span className="sb-meta">12 min read · pay once, read forever</span>
            <span className="sb-spacer"></span>
            <button className="btn-buy-lg" onClick={handleBuy}>
              Buy now
            </button>
          </div>
        )}

        <div className="article-body">
          <p>
            Last month a returning client emailed me asking for a custom
            illustration commission. The brief was small on its face — a single
            editorial illustration for an essay they were publishing — but the
            brief itself <em>opened up</em> when I started reading more
            carefully. There were edge cases, a tight deadline, and an implicit
            ask for unlimited revisions baked into "we want to be sure it's
            right."
          </p>
          <p>
            Three years ago I would have quoted $400 and been thrilled. This
            time I quoted $1,800 and the client said yes without negotiating.
            Here's exactly what changed in my thinking — and the email script I
            sent.
          </p>

          <h2>The starting point: what the client thought they were asking for</h2>
          <p>
            The brief, as written, looked like a normal one-illustration job.
            Single deliverable, single revision round, two-week deadline. If you
            took that at face value, $400 felt about right for an editor pace.
          </p>
          <p>But the brief was wrong about itself. Three things gave it away:</p>
          <ul>
            <li>
              The deadline was <em>actually</em> seven days, not two weeks —
              they buried the publication date in paragraph 4.
            </li>
            <li>
              "Final approval from the executive editor" added a second
              decision-maker who wasn't on the kickoff thread.
            </li>
            <li>
              The piece was for a launch issue, which means social cuts, hero
              crop, thumbnail variants — three more deliverables disguised as
              one.
            </li>
          </ul>
          <p>
            So the real job wasn't "one editorial illustration." The real job
            was "one illustration plus three derivatives, on half the timeline,
            with two approvers." That's a <em>completely different</em> piece of
            work.
          </p>

          <h2>How I built the new quote</h2>
        </div>

        {/* Paywall — blurs the rest of the article */}
        <div className="paywall-wrap">
          <div className={`paywall-blur ${isPurchased ? "unlocked" : ""}`}>
            <div className="article-body">
              <p>
                Once I'd reframed the brief, the math changed. I started with my
                normal editorial day rate — $600/day, full-day equivalent — and
                counted the actual days the work would take.
              </p>
              <p>
                Day 1 was concept and thumbnails. Two thumbnails per concept,
                three concepts, plus a one-page rationale doc explaining each.
                That's a normal first day on any editorial gig.
              </p>
              <p>
                Day 2 was tight pencil — the chosen concept rendered at full
                size, ready for review. With two approvers in the loop I knew
                this would attract feedback from both, so I padded the schedule
                by half a day for revisions.
              </p>
              <p>
                Day 3 was final art and color. The piece was going to print AND
                web, so I needed two color profiles (CMYK for print, sRGB for
                web) and the file would need to be delivered at 600dpi at the
                largest crop.
              </p>
              <p>
                Day 4 was the derivatives — social cuts at 1:1, 4:5, and 16:9,
                plus a hero banner and a thumbnail. Each derivative is its own
                composition decision; you can't just rescale.
              </p>
              <p>
                That's four full days. At $600/day my floor was $2,400. I quoted
                $1,800 because the client was a return customer with whom I have
                a great working relationship and I wanted to leave room for
                upside.
              </p>
              <h2>The email script</h2>
              <p>
                Here's the exact email I sent. The structure matters:{" "}
                <strong>
                  reframe → break-down → number → reassurance
                </strong>
                .
              </p>
              <blockquote>
                "Hi M — thanks for thinking of me again, I'd love to do this
                piece. Reading the brief carefully I see this is actually a
                launch-issue cover with three social derivatives on a one-week
                turnaround, so I want to make sure I scope it right. Here's what
                I'd deliver: [...] My quote for the full package is $1,800,
                broken down as [...]. Happy to discuss any of this — and if
                budget's tight, the first variation we can drop is the hero
                banner crop ($300) since you can re-purpose the print piece. Let
                me know!"
              </blockquote>
            </div>
          </div>

          {!isPurchased && (
            <div className="paywall-card">
              <div className="pw-icon">🔓</div>
              <h3>Continue reading — unlock for $5</h3>
              <p>
                Pay once, read forever. Includes the rest of the breakdown, the
                full email script, the spreadsheet I use, and 4 more pricing
                scenarios.
              </p>
              <div className="pw-price">$5</div>
              <button className="pw-buy" onClick={handleBuy}>
                Buy with Stripe
              </button>
              <div className="pw-reassure">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Pay once, read forever · No subscription · 7-day refund
              </div>
              <div className="pw-stripe">
                🔒 Secure checkout powered by <b>Stripe</b>
              </div>
            </div>
          )}
        </div>

        {/* Comments (visible to all) */}
        <section className="comments-section">
          <h3>Comments</h3>
          <div className="cs-sub">8 comments · Disqus</div>
          <div className="comments-list">
            <div className="comment-row">
              <div className="av">M</div>
              <div>
                <div className="c-author">Maya R.</div>
                <div className="c-meta">3 hours ago</div>
                <div className="c-text">
                  This is exactly the kind of breakdown I wish I'd had when I
                  was starting out. Bought + saved.
                </div>
              </div>
            </div>
            <div className="comment-row">
              <div className="av">J</div>
              <div>
                <div className="c-author">Jonas K.</div>
                <div className="c-meta">1 day ago</div>
                <div className="c-text">
                  Quick question — do you ever quote ranges instead of a single
                  number? Curious how you handle that.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related articles */}
        <section className="related">
          <h3>You might also like</h3>
          <div className="related-grid">
            <a href="#article/a-morning-in-the-studio" className="related-card">
              <div className="rc-cover t-w">☕</div>
              <div className="rc-meta">
                <div className="rc-title">A morning in the studio</div>
                <div className="rc-price">$3 · 8 min read</div>
              </div>
            </a>
            <a href="#article/my-color-theory-cheatsheet" className="related-card">
              <div className="rc-cover">🎨</div>
              <div className="rc-meta">
                <div className="rc-title">My color theory cheatsheet</div>
                <div className="rc-price">$8 · 18 min read</div>
              </div>
            </a>
            <a href="#article/first-year-as-a-freelancer" className="related-card">
              <div className="rc-cover t-e">🌱</div>
              <div className="rc-meta">
                <div className="rc-title">First year as a freelancer</div>
                <div className="rc-price">$12 · 30 min</div>
              </div>
            </a>
          </div>
        </section>
      </article>

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
