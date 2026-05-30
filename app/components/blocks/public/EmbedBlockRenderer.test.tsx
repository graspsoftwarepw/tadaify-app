/**
 * EmbedBlockRenderer unit tests.
 *
 * Story: F-BLOCK-EMBED-001 (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EmbedBlockRenderer, resolveEmbed } from "./EmbedBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-embed-test",
    block_type: "embed",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: { url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", caption: "" },
    ...overrides,
  };
}

describe("resolveEmbed", () => {
  it("maps a Spotify track to a short embed player", () => {
    const r = resolveEmbed("https://open.spotify.com/track/abc123");
    expect(r).toEqual({
      kind: "iframe",
      src: "https://open.spotify.com/embed/track/abc123",
      height: 152,
      title: "Spotify player",
    });
  });

  it("maps a Spotify album to a taller embed player", () => {
    const r = resolveEmbed("https://open.spotify.com/album/xyz");
    expect(r && r.kind === "iframe" && r.height).toBe(352);
  });

  it("maps YouTube + Vimeo + Loom to 16:9 video embeds", () => {
    expect(resolveEmbed("https://youtu.be/dQw4w9WgXcQ")).toMatchObject({
      kind: "video",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
    expect(resolveEmbed("https://vimeo.com/123")).toMatchObject({
      kind: "video",
      src: "https://player.vimeo.com/video/123",
    });
    expect(resolveEmbed("https://www.loom.com/share/abcDEF123")).toMatchObject({
      kind: "video",
      src: "https://www.loom.com/embed/abcDEF123",
    });
  });

  it("maps SoundCloud to a widget player with the encoded URL", () => {
    const r = resolveEmbed("https://soundcloud.com/artist/track");
    expect(r && r.kind).toBe("iframe");
    expect(r && r.kind === "iframe" && r.src).toContain("w.soundcloud.com/player");
    expect(r && r.kind === "iframe" && r.src).toContain(
      encodeURIComponent("https://soundcloud.com/artist/track"),
    );
  });

  it("rewrites Apple Podcasts/Music to the embed subdomains", () => {
    expect(
      (resolveEmbed("https://podcasts.apple.com/us/podcast/x/id1") as { src: string }).src,
    ).toBe("https://embed.podcasts.apple.com/us/podcast/x/id1");
    expect(
      (resolveEmbed("https://music.apple.com/us/album/x/1") as { src: string }).src,
    ).toBe("https://embed.music.apple.com/us/album/x/1");
  });

  it("degrades script-only providers to a link card", () => {
    expect(resolveEmbed("https://www.tiktok.com/@u/video/1")).toMatchObject({
      kind: "link",
      providerLabel: "TikTok",
    });
    expect(resolveEmbed("https://x.com/u/status/1")).toMatchObject({
      kind: "link",
      providerLabel: "X",
    });
    expect(resolveEmbed("https://www.instagram.com/p/abc/")).toMatchObject({
      kind: "link",
      providerLabel: "Instagram",
    });
  });

  it("returns null for an empty URL", () => {
    expect(resolveEmbed("")).toBeNull();
    expect(resolveEmbed("   ")).toBeNull();
  });
});

describe("EmbedBlockRenderer", () => {
  it("renders an <article data-block-type='embed' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(EmbedBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="embed"');
    expect(html).toContain('data-block-id="block-embed-test"');
  });

  it("renders a fixed-height iframe for a Spotify track", () => {
    const html = renderToStaticMarkup(EmbedBlockRenderer(makeBlock()));
    expect(html).toContain("block-embed-audio");
    expect(html).toContain("height:152px");
    expect(html).toContain("open.spotify.com/embed/track/");
  });

  it("renders a 16:9 video frame for a YouTube URL", () => {
    const html = renderToStaticMarkup(
      EmbedBlockRenderer(makeBlock({ meta: { url: "https://youtu.be/xyz" } })),
    );
    expect(html).toContain("block-embed-video");
    expect(html).toContain("youtube-nocookie.com/embed/xyz");
  });

  it("renders an 'Open on' link card for TikTok", () => {
    const html = renderToStaticMarkup(
      EmbedBlockRenderer(makeBlock({ meta: { url: "https://www.tiktok.com/@u/video/1" } })),
    );
    expect(html).toContain("block-embed-link");
    expect(html).toContain("Open on TikTok");
    expect(html).not.toContain("<iframe");
  });

  it("renders an empty state when no URL is set", () => {
    const html = renderToStaticMarkup(
      EmbedBlockRenderer(makeBlock({ meta: {}, url: null })),
    );
    expect(html).toContain("block-embed-empty");
  });

  it("renders a caption when provided", () => {
    const html = renderToStaticMarkup(
      EmbedBlockRenderer(
        makeBlock({ meta: { url: "https://youtu.be/xyz", caption: "My set" } }),
      ),
    );
    expect(html).toContain("block-embed-caption");
    expect(html).toContain("My set");
  });
});
