/**
 * SocialBlockRenderer unit tests.
 *
 * Story: F-BLOCK-SOCIAL-001 (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SocialBlockRenderer, buildSocialUrl } from "./SocialBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-social-test",
    block_type: "social",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: {
      handles: {
        instagram: { handle: "@alexandra", iconStyle: "instagram" },
        github: { handle: "alex", iconStyle: "github" },
      },
      handlesOrder: ["instagram", "github"],
      shape: "circle",
    },
    ...overrides,
  };
}

describe("buildSocialUrl", () => {
  it("applies the platform template, stripping a leading @", () => {
    expect(buildSocialUrl("instagram", "@alexandra")).toBe(
      "https://instagram.com/alexandra",
    );
    expect(buildSocialUrl("tiktok", "alex")).toBe("https://tiktok.com/@alex");
  });

  it("passes a full URL through verbatim", () => {
    expect(buildSocialUrl("discord", "https://discord.gg/abc")).toBe(
      "https://discord.gg/abc",
    );
  });

  it("returns null for free-text display names (whitespace)", () => {
    expect(buildSocialUrl("youtube", "Alexandra Silva")).toBeNull();
  });

  it("returns null for unknown platforms and empty handles", () => {
    expect(buildSocialUrl("myspace", "alex")).toBeNull();
    expect(buildSocialUrl("instagram", "   ")).toBeNull();
  });

  it("reduces whatsapp handles to digits", () => {
    expect(buildSocialUrl("whatsapp", "+1 (555) 123-4567")).toBe(
      "https://wa.me/15551234567",
    );
  });
});

describe("SocialBlockRenderer", () => {
  it("renders an <article data-block-type='social' data-block-id> wrapper with shape class", () => {
    const html = renderToStaticMarkup(SocialBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="social"');
    expect(html).toContain('data-block-id="block-social-test"');
    expect(html).toContain("block-social-circle");
  });

  it("renders an <a> per linkable handle in order", () => {
    const html = renderToStaticMarkup(SocialBlockRenderer(makeBlock()));
    expect(html).toContain('href="https://instagram.com/alexandra"');
    expect(html).toContain('href="https://github.com/alex"');
    expect(html).toContain('rel="noopener noreferrer me"');
    expect(html).toContain('data-platform="instagram"');
  });

  it("renders a static (non-linked) item for unlinkable handles", () => {
    const html = renderToStaticMarkup(
      SocialBlockRenderer(
        makeBlock({
          meta: {
            handles: { youtube: { handle: "Alexandra Silva", iconStyle: "youtube" } },
            handlesOrder: ["youtube"],
            shape: "square",
          },
        }),
      ),
    );
    expect(html).toContain("is-static");
    expect(html).not.toMatch(/<a /);
    expect(html).toContain("block-social-square");
  });

  it("renders an empty-state note when there are no handles", () => {
    const html = renderToStaticMarkup(
      SocialBlockRenderer(makeBlock({ meta: { handles: {}, handlesOrder: [] } })),
    );
    expect(html).toContain("block-social-empty");
  });
});
