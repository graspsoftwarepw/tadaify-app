/**
 * ProductBlockRenderer — public-page renderer for `block_type = "product"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`
 * so the public `GET /:handle` route emits a product card instead of the empty
 * `<article data-block-type data-block-id />` default.
 *
 * tadaify MVP has **no native shop**: this block is an external-store link
 * (Shopify / Stripe Payment Links / Etsy / Gumroad / …). The card shows the
 * creator's own image + title + price and a Buy CTA that links out to their
 * store. Native checkout (Stripe Connect, product CRUD, payouts) is the v2 epic
 * — see #69 (scope locked 2026-04-26).
 *
 * Block shape (PublicBlock) — `meta` mirrors the ProductForm value
 * (block-save stores the form value as `meta`):
 *   - `title`        product name (top-level column)
 *   - `url`          external destination (normalised + validated before save)
 *   - `meta.image`   R2 key under `block-thumbs/…` (or null) — product photo
 *   - `meta.price`   free-text price string, e.g. "$24" (shown iff showPrice)
 *   - `meta.cta`     buy-button label
 *   - `meta.ctaIcon` icon id (default shopping-cart) or null
 *   - `meta.showPrice` boolean (default true)
 *
 * Style: `app/styles/public-creator.css` under the `.block-product*` selectors;
 * the CTA reuses the shared `.btn .btn-primary .btn-xl`.
 *
 * Story: F-BLOCK-PRODUCT-COMPLETE-001 (#291). Supersedes the earlier mock
 * detail+checkout renderer (F-BLOCK-PRODUCT-001) which read a divergent meta
 * shape the editor never produced.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";
import { buildBlockThumbUrl } from "~/routes/api.block-thumb.$key";

/** Type-guard for the product `meta` JSON blob (mirrors ProductFormValue). */
interface ProductBlockMeta {
  image: string | null;
  price: string;
  cta: string;
  ctaIcon: string | null;
  showPrice: boolean;
}

function readProductMeta(meta: unknown): ProductBlockMeta {
  if (!meta || typeof meta !== "object") {
    return { image: null, price: "", cta: "", ctaIcon: null, showPrice: true };
  }
  const m = meta as Record<string, unknown>;
  return {
    image: typeof m.image === "string" && m.image ? m.image : null,
    price: typeof m.price === "string" ? m.price : "",
    cta: typeof m.cta === "string" ? m.cta : "",
    ctaIcon: typeof m.ctaIcon === "string" && m.ctaIcon ? m.ctaIcon : null,
    showPrice: typeof m.showPrice === "boolean" ? m.showPrice : true,
  };
}

/**
 * Render a product block as an external-store card.
 *
 * When `url` is missing/empty the card still renders but the CTA falls back to
 * `href="#"` + `aria-disabled` so the visitor can see the creator hasn't filled
 * the destination yet (the "no fake margin" rule — don't pretend it works).
 */
export function ProductBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readProductMeta(block.meta);
  const title = block.title || "Product";
  const hasUrl = typeof block.url === "string" && block.url.length > 0;
  const imageUrl = meta.image ? buildBlockThumbUrl(meta.image) : null;
  const cta = meta.cta || "Buy now";
  const iconEl = meta.ctaIcon ? renderIcon(meta.ctaIcon, { size: 20 }) : null;
  const showPrice = meta.showPrice !== false && meta.price.trim().length > 0;

  // `rel="noopener noreferrer"` — outbound creator links must never get a
  // window.opener reference back into the visitor page.
  const rel = "noopener noreferrer";

  return (
    <article
      data-block-type="product"
      data-block-id={block.id}
      className="block-product-wrap"
    >
      <div className="block-product" data-testid={`block-product-${block.id}`}>
        {imageUrl ? (
          <img
            className="block-product-image"
            src={imageUrl}
            alt={title}
            data-testid={`block-product-image-${block.id}`}
          />
        ) : null}

        <div className="block-product-body">
          <h3 className="block-product-title">{title}</h3>
          {showPrice ? (
            <span
              className="block-product-price"
              data-testid={`block-product-price-${block.id}`}
            >
              {meta.price}
            </span>
          ) : null}
        </div>

        <a
          className="btn btn-primary btn-xl block-product-cta"
          href={hasUrl ? block.url ?? "#" : "#"}
          target="_blank"
          rel={rel}
          aria-disabled={hasUrl ? undefined : true}
          data-testid={`block-product-cta-${block.id}`}
        >
          {iconEl ? (
            <span className="block-product-cta-icon" aria-hidden="true">
              {iconEl}
            </span>
          ) : null}
          <span>{cta}</span>
        </a>
      </div>
    </article>
  );
}
