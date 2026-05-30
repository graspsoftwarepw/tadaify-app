/**
 * DividerBlockRenderer unit tests.
 *
 * Story: F-BLOCK-DIVIDER-001 (tadaify-app#56)
 *
 * Renders the JSX via `renderToStaticMarkup` and asserts on the HTML string,
 * mirroring the LinkBlockRenderer test approach.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DividerBlockRenderer } from "./DividerBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-divider-test",
    block_type: "divider",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: null,
    ...overrides,
  };
}

describe("DividerBlockRenderer", () => {
  it("renders an <article data-block-type='divider' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(DividerBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="divider"');
    expect(html).toContain('data-block-id="block-divider-test"');
  });

  it("defaults to a solid <hr> (line, md) with the theme border color", () => {
    const html = renderToStaticMarkup(DividerBlockRenderer(makeBlock()));
    expect(html).toMatch(/<hr[^>]*block-divider-line/);
    expect(html).toContain("block-divider-md");
    expect(html).toContain("border-color:var(--border)");
  });

  it("renders a dotted rule when meta.style=dotted", () => {
    const html = renderToStaticMarkup(
      DividerBlockRenderer(makeBlock({ meta: { style: "dotted", size: "lg" } })),
    );
    expect(html).toMatch(/<hr[^>]*block-divider-dotted/);
    expect(html).toContain("block-divider-lg");
  });

  it("renders an aria-hidden separator div (no <hr>) for spacer style", () => {
    const html = renderToStaticMarkup(
      DividerBlockRenderer(makeBlock({ meta: { style: "spacer", size: "sm" } })),
    );
    expect(html).not.toMatch(/<hr/);
    expect(html).toContain("block-divider-spacer");
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("resolves a named swatch id to its hex color", () => {
    const html = renderToStaticMarkup(
      DividerBlockRenderer(makeBlock({ meta: { color: "indigo" } })),
    );
    expect(html).toContain("border-color:#6366F1");
  });

  it("passes a raw hex color through unchanged", () => {
    const html = renderToStaticMarkup(
      DividerBlockRenderer(makeBlock({ meta: { color: "#abcdef" } })),
    );
    expect(html).toContain("border-color:#abcdef");
  });

  it("falls back to theme border for an unknown color token", () => {
    const html = renderToStaticMarkup(
      DividerBlockRenderer(makeBlock({ meta: { color: "not-a-color" } })),
    );
    expect(html).toContain("border-color:var(--border)");
  });
});
