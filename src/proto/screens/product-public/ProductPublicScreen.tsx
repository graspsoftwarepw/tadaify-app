/**
 * Public single Product page — what a buyer sees at
 * tadaify.com/<handle>/p/<slug>: a per-product landing page with a hero banner,
 * the creator strip, sales copy + outcomes, an Instagram social-proof embed,
 * reviews, and an inline (mock) checkout with an opt-in upsell and a
 * live-updating order summary. Faithful port of
 * mockups/tadaify-mvp/product-public.html.
 *
 * Unlike the other public sub-pages, the product mockup has NO creator nav — it
 * uses a minimal back-bar (back link + url pill) and a tada!ify attribution at
 * the bottom. So this screen renders its own minimal chrome rather than
 * PublicChrome, but reuses the shared Wordmark and ThemeToggle. Presentational
 * + local React state only; data from a typed fixture. The checkout submit and
 * the discount-apply button are mocked.
 *
 * @implements fr-product-public
 */
import { useState } from "react";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import { productContentFixture } from "./productPublicFixture";
import "./product-public-proto.css";

export function ProductPublicScreen() {
  const c = productContentFixture();
  const [upsell, setUpsell] = useState(false);
  const total = upsell ? c.price + c.upsell.price : c.price;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.alert(
      `Mockup — payment of $${total} accepted. Would return you to ${c.creator.name}'s page.`,
    );
  };

  return (
    <div className="proto-root proto-product-public">
      {/* Minimal back-bar (the product page has no creator nav). */}
      <div className="back-bar">
        <a href="/__proto/creator-public">← back to {c.creator.name}'s page</a>
        <span className="bb-right">
          <span className="url">
            tadaify.com/{c.creator.handle}/p/{c.slug}
          </span>
          <ThemeToggle />
        </span>
      </div>

      <div className="hero-banner">
        <div>
          <span className="hero-pill">{c.badge}</span>
          <h1>{c.heroTitle}</h1>
          <p>{c.heroSub}</p>
        </div>
      </div>

      <div className="product-shell">
        {/* LEFT: sales copy */}
        <div className="product-card">
          <div className="creator-strip">
            <div className="ava" aria-hidden="true">
              {c.creator.initial}
            </div>
            <div>
              <div className="cs-name">{c.creator.name}</div>
              <div className="cs-role">
                {c.creator.role} ·{" "}
                <a href="/__proto/creator-public">tadaify.com/{c.creator.handle}</a>
              </div>
            </div>
          </div>

          <h2 className="product-title">{c.subtitle}</h2>
          <div className="product-price-row">
            <span className="main">${c.price}</span>
            <span className="strike">${c.strikePrice}</span>
            <span className="pill-warm">{c.discountLabel}</span>
            <span className="pr-note">· pay once · no subscription</span>
          </div>

          {/* Instagram social-proof embed */}
          <div className="ig-embed">
            <div className="ava" aria-hidden="true">
              {c.creator.initial}
            </div>
            <div className="ig-body">
              <div className="ig-head">
                <div>
                  <div className="ig-handle">{c.ig.handle}</div>
                  <div className="ig-stats">{c.ig.stats}</div>
                </div>
                <span className="pill-primary">📸 Instagram</span>
              </div>
              <div className="ig-grid" aria-hidden="true">
                {Array.from({ length: c.ig.tiles }).map((_, i) => (
                  <div className="ig-tile" key={i} />
                ))}
              </div>
            </div>
          </div>

          <div className="sales-copy">
            {c.copy.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <h3>{c.outcomesHeading}</h3>
            <ul className="outcomes">
              {c.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>

          <h3 className="reviews-heading">{c.reviewsHeading}</h3>
          <div className="reviews">
            {c.reviews.map((r) => (
              <div className="review" key={r.who}>
                <div className="stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p className="txt">{r.text}</p>
                <div className="who">{r.who}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: checkout */}
        <div className="checkout-col">
          <div className="checkout-card">
            <h3 className="cc-heading">Complete your purchase</h3>
            <p className="cc-sub">
              You're buying from <strong>{c.creator.name}</strong> · {c.reviewsLocation}
            </p>

            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="buyer-name">Your name</label>
                <input id="buyer-name" type="text" placeholder="Jane Doe" required />
              </div>
              <div className="field">
                <label htmlFor="buyer-email">Email (receipt + course access)</label>
                <input id="buyer-email" type="email" placeholder="you@example.com" required />
              </div>

              {/* Opt-in upsell, unchecked by default. */}
              <div className="upsell">
                <input
                  type="checkbox"
                  id="upsell"
                  checked={upsell}
                  onChange={(e) => setUpsell(e.target.checked)}
                />
                <label htmlFor="upsell" className="upsell-label">
                  <div className="label">
                    {c.upsell.label} <span className="tag">+${c.upsell.price}</span>
                  </div>
                  <div className="sub">
                    <span className="strike">${c.upsell.strikePrice}</span> {c.upsell.sub}
                  </div>
                </label>
              </div>

              <div className="field">
                <label htmlFor="discount">Discount code</label>
                <div className="discount-row">
                  <input id="discount" type="text" placeholder="LAUNCH50" />
                  <button
                    type="button"
                    className="btn-apply"
                    onClick={() => window.alert("Mockup — would validate the discount code")}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Card details</label>
                <div className="cc-mock" aria-hidden="true">
                  <span>1234 1234 1234 1234</span>
                  <span className="cc-mock-right">
                    <span>MM/YY</span>
                    <span>CVC</span>
                  </span>
                </div>
                <p className="cc-note">
                  🔒 Stripe Elements renders here in production — nothing leaves{" "}
                  {c.creator.name}'s page.
                </p>
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span>{c.heroTitle}</span>
                  <span>${c.price}.00</span>
                </div>
                {upsell && (
                  <div className="summary-row">
                    <span>Starter Kit</span>
                    <span>${c.upsell.price}.00</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total}.00</span>
                </div>
              </div>

              <label className="agree">
                <input type="checkbox" required />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="agree-link"
                    onClick={() => window.alert("Mockup — would open the Terms")}
                  >
                    Terms
                  </button>{" "}
                  and understand access is instant after payment.
                </span>
              </label>

              <button type="submit" className="btn-purchase">
                Purchase · ${total}
              </button>

              <p className="secure">
                🔒 Secure checkout powered by Stripe · 30-day money-back guarantee
              </p>
            </form>
          </div>

          <p className="tdf-attr">
            Built with <Wordmark size="sm" /> —{" "}
            <a href="/__proto">get yours →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
