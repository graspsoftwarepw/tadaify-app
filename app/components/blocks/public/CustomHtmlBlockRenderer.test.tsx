/**
 * CustomHtmlBlockRenderer unit tests.
 *
 * Story: F-BLOCK-CUSTOMHTML-001 (tadaify-app#56)
 *
 * The security-critical property: creator HTML lands in a sandboxed iframe's
 * srcdoc, NEVER injected into the public page's own document.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CustomHtmlBlockRenderer } from "./CustomHtmlBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-custom-html-test",
    block_type: "custom-html",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: { html: "<b>Hi from custom HTML.</b>" },
    ...overrides,
  };
}

describe("CustomHtmlBlockRenderer", () => {
  it("renders an <article data-block-type='custom-html' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(CustomHtmlBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="custom-html"');
    expect(html).toContain('data-block-id="block-custom-html-test"');
  });

  it("puts creator HTML in a sandboxed iframe srcdoc, not the page DOM", () => {
    const html = renderToStaticMarkup(CustomHtmlBlockRenderer(makeBlock()));
    expect(html).toContain("<iframe");
    expect(html).toContain('sandbox="allow-scripts');
    // No allow-same-origin → opaque origin isolation.
    expect(html).not.toContain("allow-same-origin");
    // The markup is HTML-escaped into the srcdoc attribute, not live in the page.
    expect(html).toMatch(/srcdoc=/i);
    expect(html).toContain("&lt;b&gt;Hi from custom HTML.&lt;/b&gt;");
  });

  it("escapes a script payload into the attribute (no live <script> in page)", () => {
    const html = renderToStaticMarkup(
      CustomHtmlBlockRenderer(
        makeBlock({ meta: { html: "<script>alert(1)</script>" } }),
      ),
    );
    // The raw tag must be entity-escaped in the attribute, never a live tag.
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders an empty state when html is blank", () => {
    const html = renderToStaticMarkup(
      CustomHtmlBlockRenderer(makeBlock({ meta: { html: "   " } })),
    );
    expect(html).toContain("block-custom-html-empty");
    expect(html).not.toContain("<iframe");
  });

  it("renders an empty state when meta is missing entirely", () => {
    const html = renderToStaticMarkup(
      CustomHtmlBlockRenderer(makeBlock({ meta: null })),
    );
    expect(html).toContain("block-custom-html-empty");
  });
});
