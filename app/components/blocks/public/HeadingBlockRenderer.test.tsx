/**
 * HeadingBlockRenderer unit tests.
 *
 * Story: F-BLOCK-HEADING-001 (tadaify-app#56)
 *
 * Renders the JSX via `renderToStaticMarkup` and asserts on the HTML string,
 * mirroring the LinkBlockRenderer test approach.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HeadingBlockRenderer } from "./HeadingBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-heading-test",
    block_type: "heading",
    title: "My latest releases",
    url: null,
    position: 0,
    is_visible: true,
    meta: null,
    ...overrides,
  };
}

describe("HeadingBlockRenderer", () => {
  it("renders an <article data-block-type='heading' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(HeadingBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="heading"');
    expect(html).toContain('data-block-id="block-heading-test"');
    expect(html).toMatch(/<article/);
  });

  it("defaults to an <h2>, center align, when meta is null", () => {
    const html = renderToStaticMarkup(HeadingBlockRenderer(makeBlock()));
    expect(html).toMatch(/<h2[^>]*class="[^"]*block-heading-h2[^"]*block-heading-center/);
    expect(html).toContain('data-align="center"');
    expect(html).toContain("My latest releases");
  });

  it("maps level=hero to a single <h1> with the hero class", () => {
    const html = renderToStaticMarkup(
      HeadingBlockRenderer(makeBlock({ meta: { level: "hero" } })),
    );
    expect(html).toMatch(/<h1[^>]*block-heading-hero/);
    expect(html).not.toMatch(/<h2/);
  });

  it("maps level=p to a <p> element", () => {
    const html = renderToStaticMarkup(
      HeadingBlockRenderer(makeBlock({ meta: { level: "p", align: "left" } })),
    );
    expect(html).toMatch(/<p[^>]*block-heading-p/);
    expect(html).toContain("block-heading-left");
  });

  it("renders a leading icon span when meta.icon is set", () => {
    const html = renderToStaticMarkup(
      HeadingBlockRenderer(makeBlock({ meta: { icon: "simple-icons:spotify" } })),
    );
    expect(html).toContain("block-heading-icon");
    expect(html).toContain("<svg");
  });

  it("falls back to a bad meta value safely (invalid level → h2)", () => {
    const html = renderToStaticMarkup(
      HeadingBlockRenderer(makeBlock({ meta: { level: "banana", align: "weird" } })),
    );
    expect(html).toMatch(/<h2/);
    expect(html).toContain("block-heading-center");
  });
});
