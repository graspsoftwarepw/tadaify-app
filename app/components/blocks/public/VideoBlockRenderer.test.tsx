/**
 * VideoBlockRenderer unit tests.
 *
 * Story: F-BLOCK-VIDEO-001 (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { VideoBlockRenderer } from "./VideoBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-video-test",
    block_type: "video",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: { url: "https://youtu.be/dQw4w9WgXcQ", provider: "youtube", caption: "" },
    ...overrides,
  };
}

describe("VideoBlockRenderer", () => {
  it("renders an <article data-block-type='video' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(VideoBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="video"');
    expect(html).toContain('data-block-id="block-video-test"');
  });

  it("embeds a youtu.be URL via youtube-nocookie.com", () => {
    const html = renderToStaticMarkup(VideoBlockRenderer(makeBlock()));
    expect(html).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(html).toContain("<iframe");
    expect(html).toContain("allowFullScreen");
  });

  it("embeds a youtube.com/watch?v= URL", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(
        makeBlock({ meta: { url: "https://www.youtube.com/watch?v=abc123XYZ_-" } }),
      ),
    );
    expect(html).toContain(
      "https://www.youtube-nocookie.com/embed/abc123XYZ_-",
    );
  });

  it("embeds a vimeo URL via player.vimeo.com", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(
        makeBlock({ meta: { url: "https://vimeo.com/123456789", provider: "vimeo" } }),
      ),
    );
    expect(html).toContain('src="https://player.vimeo.com/video/123456789"');
  });

  it("prefers URL detection over a mismatched provider hint", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(
        makeBlock({ meta: { url: "https://vimeo.com/555", provider: "youtube" } }),
      ),
    );
    expect(html).toContain("https://player.vimeo.com/video/555");
    expect(html).not.toContain("youtube-nocookie");
  });

  it("falls back to a Watch link when the URL is unparseable", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(makeBlock({ meta: { url: "https://example.com/foo" } })),
    );
    expect(html).not.toContain("<iframe");
    expect(html).toContain("block-video-fallback");
    expect(html).toContain('href="https://example.com/foo"');
  });

  it("renders an empty-state note when no URL is set", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(makeBlock({ meta: {}, url: null })),
    );
    expect(html).toContain("block-video-empty");
  });

  it("renders a caption when provided", () => {
    const html = renderToStaticMarkup(
      VideoBlockRenderer(
        makeBlock({ meta: { url: "https://youtu.be/xyz", caption: "Behind the scenes" } }),
      ),
    );
    expect(html).toContain("block-video-caption");
    expect(html).toContain("Behind the scenes");
  });
});
