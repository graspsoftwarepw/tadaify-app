/**
 * ProductBlockRenderer — public-page renderer for `block_type = "product"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`
 * so the public `GET /:handle` route emits a full product detail + inline checkout
 * card instead of the empty `<article data-block-type data-block-id />` default.
 *
 * Visual contract: mockup `mockups/tadaify-mvp/product-public.html` (416 LOC).
 * Style lives in `app/styles/public-creator.css` under the `.product-*` selectors.
 *
 * Block shape (PublishedBlock):
 *   - `title` is the product name.
 *   - `meta.tagline` is the hero tagline (optional).
 *   - `meta` is a JSON blob — for product blocks we expect:
 *     {
 *       creatorName?: string,
 *       creatorHandle?: string,
 *       creatorLocation?: string,
 *       heroGradient?: string,        // e.g., "135deg, rgba(239,68,68,0.9), rgba(245,158,11,0.85)"
 *       price?: number,               // in cents: 12700 = $127.00
 *       originalPrice?: number,       // strike price in cents
 *       discount?: string,            // e.g., "50% off"
 *       upsellTitle?: string,         // optional upsell item name
 *       upsellPrice?: number,         // in cents
 *       upsellOriginal?: number,      // strike price in cents
 *       outcomes?: string[],          // bullet points: "Build measurable strength..."
 *       reviews?: Array<{
 *         stars: number,              // 1-5
 *         text: string,
 *         author: string,
 *         location?: string
 *       }>,
 *       igHandle?: string,            // @alexandrasilva_fit
 *       igFollowers?: string,         // "50.2k"
 *       igPosts?: string,             // "1,284"
 *       salesCopy?: string            // HTML-safe rich text (paragraphs + <strong>, <em>)
 *     }
 *
 * Story: F-BLOCK-PRODUCT-001 (tadaify-app#XXX)
 * Covers: BR-BLOCK-PRODUCT-001 (render), checkout form structure, upsell opt-in logic
 */

import type { ReactElement } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

/** Type-guard for the product meta JSON blob. */
interface ProductBlockMeta {
  tagline?: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorLocation?: string;
  heroGradient?: string;
  price?: number;
  originalPrice?: number;
  discount?: string;
  upsellTitle?: string;
  upsellPrice?: number;
  upsellOriginal?: number;
  outcomes?: string[];
  reviews?: Array<{
    stars?: number;
    text?: string;
    author?: string;
    location?: string;
  }>;
  igHandle?: string;
  igFollowers?: string;
  igPosts?: string;
  salesCopy?: string;
}

function readProductMeta(meta: unknown): ProductBlockMeta {
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  return {
    tagline: typeof m.tagline === "string" ? m.tagline : undefined,
    creatorName:
      typeof m.creatorName === "string" ? m.creatorName : undefined,
    creatorHandle:
      typeof m.creatorHandle === "string" ? m.creatorHandle : undefined,
    creatorLocation:
      typeof m.creatorLocation === "string" ? m.creatorLocation : undefined,
    heroGradient:
      typeof m.heroGradient === "string" ? m.heroGradient : undefined,
    price: typeof m.price === "number" ? m.price : undefined,
    originalPrice:
      typeof m.originalPrice === "number" ? m.originalPrice : undefined,
    discount: typeof m.discount === "string" ? m.discount : undefined,
    upsellTitle:
      typeof m.upsellTitle === "string" ? m.upsellTitle : undefined,
    upsellPrice:
      typeof m.upsellPrice === "number" ? m.upsellPrice : undefined,
    upsellOriginal:
      typeof m.upsellOriginal === "number" ? m.upsellOriginal : undefined,
    outcomes: Array.isArray(m.outcomes)
      ? m.outcomes.filter((o): o is string => typeof o === "string")
      : undefined,
    reviews: Array.isArray(m.reviews) ? m.reviews : undefined,
    igHandle: typeof m.igHandle === "string" ? m.igHandle : undefined,
    igFollowers: typeof m.igFollowers === "string" ? m.igFollowers : undefined,
    igPosts: typeof m.igPosts === "string" ? m.igPosts : undefined,
    salesCopy: typeof m.salesCopy === "string" ? m.salesCopy : undefined,
  };
}

function formatPrice(cents: number | undefined): string {
  if (cents === undefined) return "0.00";
  return (cents / 100).toFixed(2);
}

function getInitialTotal(
  price: number | undefined,
  upsellPrice: number | undefined
): number {
  return (price || 0) + (upsellPrice || 0);
}

/**
 * Render a product block as a full detail + checkout page.
 *
 * Structure mirrors mockup product-public.html:
 * 1. Back bar (link to creator page)
 * 2. Hero banner (gradient, title, tagline)
 * 3. Product shell (left: sales copy + reviews, right: sticky checkout)
 * 4. Upsell checkbox (opt-in, default unchecked, live total update)
 * 5. Stub payment form (TODO: wire to Stripe checkout)
 */
export function ProductBlockRenderer(block: PublicBlock): ReactElement {
  const meta = readProductMeta(block.meta);
  const title = block.title || "Product";
  const tagline = meta.tagline || "";

  const price = meta.price ?? 0;
  const originalPrice = meta.originalPrice;
  const upsellPrice = meta.upsellPrice;
  const creatorName = meta.creatorName || "Creator";
  const creatorHandle = meta.creatorHandle || "";
  const creatorLocation = meta.creatorLocation || "";

  const priceFormatted = formatPrice(price);
  const originalPriceFormatted = originalPrice
    ? formatPrice(originalPrice)
    : null;
  const upsellPriceFormatted = upsellPrice ? formatPrice(upsellPrice) : null;
  const initialTotal = getInitialTotal(
    price,
    upsellPrice === undefined ? undefined : upsellPrice
  );
  const initialTotalFormatted = formatPrice(initialTotal);

  const outcomes = meta.outcomes || [];
  const reviews = meta.reviews || [];
  const igHandle = meta.igHandle || "@creator";
  const igFollowers = meta.igFollowers || "0";
  const igPosts = meta.igPosts || "0";

  // Extract initials for avatar
  const initials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article
      data-block-type="product"
      data-block-id={block.id}
      className="product-renderer-root"
    >
      {/* Back bar */}
      <div className="product-back-bar">
        <a href={`/${creatorHandle}`} className="product-back-link">
          ← back to {creatorName}'s page
        </a>
        <span className="product-back-url text-mono text-subtle">
          tadaify.com/{creatorHandle}/p/{block.id}
        </span>
      </div>

      {/* Hero banner */}
      <div
        className="product-hero-banner"
        style={{
          backgroundImage: meta.heroGradient
            ? `linear-gradient(135deg, ${meta.heroGradient}), radial-gradient(600px 300px at 20% 80%, rgba(253,230,138,0.6), transparent)`
            : "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(245,158,11,0.85)), radial-gradient(600px 300px at 20% 80%, rgba(253,230,138,0.6), transparent)",
        }}
      >
        <div className="product-hero-content">
          {meta.discount && (
            <span className="pill pill-warm product-hero-discount">
              🔥 {meta.discount}
            </span>
          )}
          <h1 className="product-hero-title">{title}</h1>
          {tagline && <p className="product-hero-tagline">{tagline}</p>}
        </div>
      </div>

      {/* Product shell */}
      <div className="product-shell">
        {/* LEFT: Sales copy */}
        <div className="product-card">
          {/* Creator strip */}
          <div className="product-creator-strip">
            <div className="product-creator-ava" title={creatorName}>
              {initials}
            </div>
            <div>
              <div className="product-creator-name">{creatorName}</div>
              <div className="text-muted text-sm">
                {creatorLocation}
                {creatorHandle && (
                  <>
                    {" "}
                    ·{" "}
                    <a href={`/${creatorHandle}`}>tadaify.com/{creatorHandle}</a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title + price row */}
          <h2 className="product-title">{title}</h2>
          <div className="product-price-row">
            <span className="product-price-main">${priceFormatted}</span>
            {originalPriceFormatted && (
              <span className="product-price-strike">
                ${originalPriceFormatted}
              </span>
            )}
            {meta.discount && (
              <>
                <span className="pill pill-warm">{meta.discount}</span>
                <span className="text-muted text-sm">· pay once · no subscription</span>
              </>
            )}
          </div>

          {/* IG embed */}
          <div className="product-ig-embed">
            <div className="product-creator-ava" title={igHandle}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div className="product-ig-header">
                <div>
                  <div className="product-ig-handle">{igHandle}</div>
                  <div className="text-muted text-sm">
                    {igFollowers} followers · {igPosts} posts
                  </div>
                </div>
                <span className="pill pill-primary">📸 Instagram</span>
              </div>
              <div className="product-ig-grid">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`product-ig-tile product-ig-tile-${(i % 6) + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sales copy */}
          {meta.salesCopy && (
            <div
              className="product-sales-copy"
              dangerouslySetInnerHTML={{ __html: meta.salesCopy }}
            />
          )}

          {/* Outcomes */}
          {outcomes.length > 0 && (
            <>
              <h3 className="product-section-title">What you'll learn</h3>
              <ul className="product-outcomes">
                {outcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <h3 className="product-section-title">What creators are saying</h3>
              <div className="product-reviews">
                {reviews.map((review, i) => (
                  <div key={i} className="product-review">
                    <div className="product-review-stars">
                      {"★".repeat(review.stars || 5)}
                    </div>
                    <p className="product-review-text">{review.text}</p>
                    <div className="product-review-who">
                      — {review.author}
                      {review.location && ` · ${review.location}`}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Checkout column */}
        <div className="product-checkout-col">
          <div className="product-checkout-card">
            <h3 className="product-checkout-title">Complete your purchase</h3>
            <p className="text-muted text-sm" style={{ marginTop: "4px" }}>
              You're buying from <strong>{creatorName}</strong>
              {creatorLocation && ` · ${creatorLocation}`}
            </p>

            <form
              className="product-checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: wire to product checkout (Stripe)
                alert(
                  `Demo: product checkout initiated.\nProduct: ${title}\nTotal: $${initialTotalFormatted}`
                );
              }}
            >
              {/* Name field */}
              <div className="product-field">
                <label htmlFor={`product-name-${block.id}`}>Your name</label>
                <input
                  id={`product-name-${block.id}`}
                  className="input"
                  type="text"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              {/* Email field */}
              <div className="product-field">
                <label htmlFor={`product-email-${block.id}`}>
                  Email (receipt + course access)
                </label>
                <input
                  id={`product-email-${block.id}`}
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Upsell (opt-in, unchecked by default) */}
              {meta.upsellTitle && (
                <div className="product-upsell">
                  <input
                    id={`product-upsell-${block.id}`}
                    type="checkbox"
                    defaultChecked={false}
                    data-testid={`product-upsell-${block.id}`}
                  />
                  <label
                    htmlFor={`product-upsell-${block.id}`}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    <div className="product-upsell-label">
                      Add: {meta.upsellTitle}{" "}
                      {upsellPriceFormatted && (
                        <span className="product-upsell-tag">
                          +${upsellPriceFormatted}
                        </span>
                      )}
                    </div>
                    {meta.upsellOriginal && (
                      <div className="product-upsell-sub">
                        <span className="product-upsell-strike">
                          ${formatPrice(meta.upsellOriginal)}
                        </span>
                        &nbsp;Templates + macro calculator + shopping list
                        PDFs. Ships instantly with your course.
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Discount code field */}
              <div className="product-field">
                <label htmlFor={`product-discount-${block.id}`}>
                  Discount code
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id={`product-discount-${block.id}`}
                    className="input"
                    type="text"
                    placeholder="LAUNCH50"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm">
                    Apply
                  </button>
                </div>
              </div>

              {/* Card details mock */}
              <div className="product-field">
                <label htmlFor={`product-card-${block.id}`}>Card details</label>
                <div className="product-cc-mock" id={`product-card-${block.id}`}>
                  <span>1234 1234 1234 1234</span>
                  <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span>MM/YY</span>
                    <span>CVC</span>
                  </span>
                </div>
                <p className="text-subtle text-sm" style={{ marginTop: "6px" }}>
                  🔒 Stripe Elements renders here in production — nothing leaves{" "}
                  {creatorName}'s page.
                </p>
              </div>

              {/* Order summary */}
              <div className="product-summary">
                <div className="product-summary-row">
                  <span>{title}</span>
                  <span>${priceFormatted}</span>
                </div>
                {meta.upsellTitle && (
                  <div
                    className="product-summary-row product-summary-upsell-row"
                    style={{ display: "none" }}
                    data-testid={`product-summary-upsell-${block.id}`}
                  >
                    <span>{meta.upsellTitle}</span>
                    <span>${upsellPriceFormatted}</span>
                  </div>
                )}
                <div className="product-summary-row product-summary-total">
                  <span>Total</span>
                  <span>
                    $<span data-testid={`product-total-${block.id}`}>
                      {initialTotalFormatted}
                    </span>
                  </span>
                </div>
              </div>

              {/* Terms agreement */}
              <label
                className="flex items-center gap-2 text-sm product-terms-label"
                style={{ marginTop: "16px" }}
              >
                <input type="checkbox" required />
                I agree to the{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Terms
                </a>{" "}
                and understand access is instant after payment.
              </label>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary btn-xl product-checkout-btn"
                data-testid={`product-checkout-btn-${block.id}`}
              >
                Purchase · $
                <span data-testid={`product-btn-total-${block.id}`}>
                  {initialTotalFormatted}
                </span>
              </button>

              {/* Secure footer */}
              <p className="product-secure">
                🔒 Secure checkout powered by Stripe · 30-day money-back guarantee
              </p>
            </form>
          </div>

          {/* Tadaify attribution */}
          <p
            className="text-center text-subtle text-sm"
            style={{ marginTop: "20px" }}
          >
            Built with{" "}
            <span className="wordmark" style={{ fontSize: "13px" }}>
              <span className="wm-ta">ta</span>
              <span className="wm-da">da!</span>
              <span className="wm-ify">ify</span>
            </span>
            — <a href="/">get yours →</a>
          </p>
        </div>
      </div>

      {/* Client-side upsell total update */}
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const blockId = "${block.id}";
              const upsellChk = document.getElementById(\`product-upsell-\${blockId}\`);
              if (!upsellChk) return;

              const basePrice = ${price};
              const upsellPrice = ${upsellPrice || 0};
              const totalEl = document.querySelector(\`[data-testid="product-total-\${blockId}"]\`);
              const btnTotal = document.querySelector(\`[data-testid="product-btn-total-\${blockId}"]\`);
              const upsellRow = document.querySelector(\`[data-testid="product-summary-upsell-\${blockId}"]\`);

              function updateTotal() {
                const total = upsellChk.checked ? basePrice + upsellPrice : basePrice;
                const totalCents = total;
                const totalDollars = (totalCents / 100).toFixed(2);
                if (totalEl) totalEl.textContent = totalDollars;
                if (btnTotal) btnTotal.textContent = totalDollars;
                if (upsellRow) upsellRow.style.display = upsellChk.checked ? 'flex' : 'none';
              }

              upsellChk.addEventListener('change', updateTotal);
            })();
          `,
        }}
      />
    </article>
  );
}
