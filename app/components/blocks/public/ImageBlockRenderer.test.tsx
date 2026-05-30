/**
 * ImageBlockRenderer unit tests.
 *
 * Story: F-BLOCK-IMAGE-001 (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageBlockRenderer } from "./ImageBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-image-test",
    block_type: "image",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: {
      src: "https://cdn.example.com/cover.jpg",
      alt: "Album cover",
      caption: "",
      href: "",
      ctaLabel: "",
      aspect: "1",
    },
    ...overrides,
  };
}

describe("ImageBlockRenderer", () => {
  it("renders an <article data-block-type='image' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(ImageBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="image"');
    expect(html).toContain('data-block-id="block-image-test"');
  });

  it("renders an <img> with src, alt and the aspect class", () => {
    const html = renderToStaticMarkup(ImageBlockRenderer(makeBlock()));
    expect(html).toContain('src="https://cdn.example.com/cover.jpg"');
    expect(html).toContain('alt="Album cover"');
    expect(html).toContain("block-image-1");
    expect(html).toContain('loading="lazy"');
  });

  it("wraps the image in an anchor + CTA when href is set", () => {
    const html = renderToStaticMarkup(
      ImageBlockRenderer(
        makeBlock({
          meta: {
            src: "https://cdn.example.com/x.jpg",
            alt: "x",
            href: "https://shop.example.com",
            ctaLabel: "Buy now",
            aspect: "43",
          },
        }),
      ),
    );
    expect(html).toContain("block-image-link");
    expect(html).toContain('href="https://shop.example.com"');
    expect(html).toContain("Buy now");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("falls back to block.url for the click-through when meta.href is absent", () => {
    const html = renderToStaticMarkup(
      ImageBlockRenderer(
        makeBlock({
          url: "https://fallback.example.com",
          meta: { src: "https://cdn.example.com/x.jpg", alt: "x", aspect: "1" },
        }),
      ),
    );
    expect(html).toContain('href="https://fallback.example.com"');
  });

  it("renders a placeholder (no <img>) when src is missing", () => {
    const html = renderToStaticMarkup(
      ImageBlockRenderer(makeBlock({ meta: { alt: "x", aspect: "169" } })),
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("block-image-empty");
    expect(html).toContain("block-image-169");
  });

  it("defaults aspect to rounded for an unknown value", () => {
    const html = renderToStaticMarkup(
      ImageBlockRenderer(
        makeBlock({ meta: { src: "https://cdn.example.com/x.jpg", aspect: "weird" } }),
      ),
    );
    expect(html).toContain("block-image-rounded");
  });

  it("renders a caption when provided", () => {
    const html = renderToStaticMarkup(
      ImageBlockRenderer(
        makeBlock({
          meta: { src: "https://cdn.example.com/x.jpg", caption: "Spring Drops", aspect: "1" },
        }),
      ),
    );
    expect(html).toContain("block-image-caption");
    expect(html).toContain("Spring Drops");
  });
});
