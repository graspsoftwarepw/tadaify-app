/**
 * validate-product — server-side guards for the product block's `meta`.
 *
 * The product block stores its full form value in `meta`
 * (`{ title, price, image, url, cta, ctaIcon, showPrice }`). The destination
 * `url` is validated separately via `validateLinkUrl` against the top-level
 * `url` column (see api.blocks*.ts). This module covers the meta-only field that
 * has no column: `price` is free text (e.g. "$24", "From €5") but must stay
 * bounded so it can't bloat `blocks.meta` (read by the public page loader).
 *
 * Non-product block types pass through unchanged — `meta` is opaque for them.
 *
 * Story: F-BLOCK-PRODUCT-COMPLETE-001 (#291).
 */

/** Max length for the free-text price string. */
export const PRODUCT_PRICE_MAX = 64;

export type ValidateProductMetaResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validate the product-specific fields inside a block's `meta`. Only enforces
 * constraints when `blockType === "product"`; any other type is a no-op pass.
 */
export function validateProductMeta(
  blockType: unknown,
  meta: unknown
): ValidateProductMetaResult {
  if (blockType !== "product") return { ok: true };
  if (meta === null || typeof meta !== "object") return { ok: true };

  const price = (meta as Record<string, unknown>).price;
  if (price !== undefined && price !== null) {
    if (typeof price !== "string") {
      return { ok: false, error: "product price must be a string" };
    }
    if (price.length > PRODUCT_PRICE_MAX) {
      return {
        ok: false,
        error: `product price must be ${PRODUCT_PRICE_MAX} characters or fewer`,
      };
    }
  }

  return { ok: true };
}
