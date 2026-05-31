/**
 * U2 — LinkBlockRenderer
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 *
 * We render the JSX returned by the renderer via `renderToStaticMarkup`
 * (no DOM testing library needed — the route already uses React's
 * SSR pipeline). Assertions check the produced HTML string.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LinkBlockRenderer } from "./LinkBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-link-test",
    block_type: "link",
    title: "Listen on Spotify",
    url: "https://open.spotify.com/artist/x",
    position: 0,
    is_visible: true,
    meta: null,
    ...overrides,
  };
}

describe("LinkBlockRenderer", () => {
  it("renders an <article data-block-type='link' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(LinkBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="link"');
    expect(html).toContain('data-block-id="block-link-test"');
    expect(html).toMatch(/<article/);
  });

  it("renders an <a> with the URL, label, rel=noopener and target=_blank by default", () => {
    const html = renderToStaticMarkup(LinkBlockRenderer(makeBlock()));
    expect(html).toContain('href="https://open.spotify.com/artist/x"');
    expect(html).toContain("Listen on Spotify");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("respects newtab=false from meta and keeps rel=noopener for safety", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(makeBlock({ meta: { newtab: false } })),
    );
    expect(html).toContain('target="_self"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders an icon span when meta.icon is set", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(
        makeBlock({ meta: { icon: "simple-icons:spotify" } }),
      ),
    );
    expect(html).toContain("block-link-icon");
    // Simple Icons branch renders an inline <svg>.
    expect(html).toContain("<svg");
  });

  it("falls back to href='#' + aria-disabled when url is missing", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(makeBlock({ url: null })),
    );
    expect(html).toContain('href="#"');
    expect(html).toContain('aria-disabled="true"');
  });

  it("renders 'Link' as the label fallback when title is empty", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(makeBlock({ title: "" })),
    );
    expect(html).toContain(">Link<");
  });

  it("renders a custom thumbnail <img> from meta.thumb (served via /api/block-thumb)", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(
        makeBlock({ meta: { thumb: "block-thumbs/u1/abc.jpg" } }),
      ),
    );
    expect(html).toContain("block-link-thumb");
    expect(html).toContain("/api/block-thumb/");
  });

  it("prefers the thumbnail over the icon when both are set", () => {
    const html = renderToStaticMarkup(
      LinkBlockRenderer(
        makeBlock({ meta: { thumb: "block-thumbs/u1/abc.jpg", icon: "simple-icons:spotify" } }),
      ),
    );
    expect(html).toContain("block-link-thumb");
    expect(html).not.toContain("block-link-icon");
  });
});
