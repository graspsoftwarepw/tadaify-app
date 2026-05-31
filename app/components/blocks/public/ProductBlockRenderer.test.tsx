/**
 * U — ProductBlockRenderer
 *
 * Story: F-BLOCK-PRODUCT-COMPLETE-001 (#291)
 *
 * Renders the JSX via `renderToStaticMarkup` (SSR pipeline, no DOM library) and
 * asserts the produced HTML. The product card is an external-store link: image
 * + title + price + Buy CTA → creator's shop. No native checkout (MVP scope).
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductBlockRenderer } from "./ProductBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-product-test",
    block_type: "product",
    title: "Spring drop merch",
    url: "https://shop.example.com/spring-drop",
    position: 0,
    is_visible: true,
    meta: { price: "$24", cta: "Buy on Shopify", ctaIcon: "lucide:shoppingCart", showPrice: true, image: null },
    ...overrides,
  };
}

describe("ProductBlockRenderer", () => {
  it("renders an <article data-block-type='product' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="product"');
    expect(html).toContain('data-block-id="block-product-test"');
    expect(html).toMatch(/<article/);
  });

  it("renders the title and a Buy CTA <a> → external url with target=_blank + rel=noopener", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock()));
    expect(html).toContain("Spring drop merch");
    expect(html).toContain("Buy on Shopify");
    expect(html).toContain('href="https://shop.example.com/spring-drop"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("shows the price when showPrice is true and a price is set", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock()));
    expect(html).toContain("block-product-price");
    expect(html).toContain("$24");
  });

  it("hides the price when showPrice is false", () => {
    const html = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { price: "$24", showPrice: false } })),
    );
    expect(html).not.toContain("block-product-price");
  });

  it("hides the price when the price string is empty even if showPrice is true", () => {
    const html = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { price: "", showPrice: true } })),
    );
    expect(html).not.toContain("block-product-price");
  });

  it("renders the product image <img> from meta.image (served via /api/block-thumb)", () => {
    const html = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { image: "block-thumbs/u1/abc.jpg" } })),
    );
    expect(html).toContain("block-product-image");
    expect(html).toContain("/api/block-thumb/");
  });

  it("omits the image when meta.image is null", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock({ meta: { image: null } })));
    expect(html).not.toContain("block-product-image");
  });

  it("renders a CTA icon span when meta.ctaIcon is set, and omits it when null", () => {
    const withIcon = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { cta: "Buy", ctaIcon: "lucide:shoppingCart" } })),
    );
    expect(withIcon).toContain("block-product-cta-icon");
    const noIcon = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { cta: "Buy", ctaIcon: null } })),
    );
    expect(noIcon).not.toContain("block-product-cta-icon");
  });

  it("falls back to 'Buy now' when meta.cta is empty", () => {
    const html = renderToStaticMarkup(
      ProductBlockRenderer(makeBlock({ meta: { cta: "", ctaIcon: null } })),
    );
    expect(html).toContain("Buy now");
  });

  it("falls back to 'Product' as the title when title is empty", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock({ title: "" })));
    expect(html).toContain(">Product<");
  });

  it("falls back to href='#' + aria-disabled when url is missing", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock({ url: null })));
    expect(html).toContain('href="#"');
    expect(html).toContain('aria-disabled="true"');
  });

  it("tolerates a null/garbage meta without throwing", () => {
    const html = renderToStaticMarkup(ProductBlockRenderer(makeBlock({ meta: null })));
    expect(html).toContain('data-block-type="product"');
    expect(html).toContain("Buy now");
  });
});
