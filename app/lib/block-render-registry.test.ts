/**
 * U3 — block-render-registry
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  registerBlockRenderer,
  getBlockRenderer,
  defaultBlockRenderer,
  __resetBlockRendererRegistryForTest,
  type PublicBlock,
} from "./block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-1",
    block_type: "link",
    title: "Test",
    url: null,
    position: 0,
    is_visible: true,
    meta: null,
    ...overrides,
  };
}

describe("U3 — block-render-registry", () => {
  beforeEach(() => {
    __resetBlockRendererRegistryForTest();
  });

  it("default fallback returns an <article data-block-type data-block-id />", () => {
    const block = makeBlock({ block_type: "unknown-kind", id: "abc-123" });
    const node = defaultBlockRenderer(block) as {
      type: string;
      props: Record<string, unknown>;
    };
    expect(node.type).toBe("article");
    expect(node.props["data-block-type"]).toBe("unknown-kind");
    expect(node.props["data-block-id"]).toBe("abc-123");
  });

  it("registerBlockRenderer + getBlockRenderer round-trip", () => {
    const customRenderer = (b: PublicBlock) =>
      ({
        type: "div",
        props: { "data-custom": b.id },
        key: null,
      }) as unknown as ReturnType<typeof defaultBlockRenderer>;
    registerBlockRenderer("link", customRenderer);

    const renderer = getBlockRenderer("link");
    expect(renderer).toBe(customRenderer);
  });

  it("getBlockRenderer for an unregistered kind returns the default fallback", () => {
    const renderer = getBlockRenderer("never-registered");
    expect(renderer).toBe(defaultBlockRenderer);
  });
});
