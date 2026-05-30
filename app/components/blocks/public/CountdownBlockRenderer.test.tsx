/**
 * CountdownBlockRenderer unit tests.
 *
 * Story: F-BLOCK-COUNTDOWN-001 (tadaify-app#56)
 *
 * Tests use far-future / far-past targets so the expired/active branch is
 * deterministic regardless of the actual clock.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CountdownBlockRenderer } from "./CountdownBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-countdown-test",
    block_type: "countdown",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: {
      label: "Next live in",
      icon: "flame",
      targetAt: "2099-01-01T00:00",
      style: "boxed",
      autoHide: true,
      replacementCopy: "Live now!",
    },
    ...overrides,
  };
}

describe("CountdownBlockRenderer", () => {
  it("renders an <article data-block-type='countdown' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(CountdownBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="countdown"');
    expect(html).toContain('data-block-id="block-countdown-test"');
  });

  it("renders 4 unit boxes + label + a target hook for a future date", () => {
    const html = renderToStaticMarkup(CountdownBlockRenderer(makeBlock()));
    expect(html).toContain("Next live in");
    expect(html).toContain("block-countdown-units");
    expect((html.match(/block-countdown-unit-label/g) || []).length).toBe(4);
    expect(html).toContain("data-countdown-target=");
    expect(html).toContain("block-countdown-boxed");
  });

  it("shows replacement copy (not zeros) when expired + autoHide", () => {
    const html = renderToStaticMarkup(
      CountdownBlockRenderer(
        makeBlock({
          meta: {
            label: "Next live in",
            targetAt: "2000-01-01T00:00",
            autoHide: true,
            replacementCopy: "Live now!",
          },
        }),
      ),
    );
    expect(html).toContain("block-countdown-done");
    expect(html).toContain("Live now!");
    expect(html).not.toContain("block-countdown-units");
  });

  it("shows zeros when expired without autoHide", () => {
    const html = renderToStaticMarkup(
      CountdownBlockRenderer(
        makeBlock({
          meta: { targetAt: "2000-01-01T00:00", autoHide: false },
        }),
      ),
    );
    expect(html).toContain("block-countdown-units");
    expect((html.match(/>00</g) || []).length).toBe(4);
  });

  it("renders an optional link when both label and url are set", () => {
    const html = renderToStaticMarkup(
      CountdownBlockRenderer(
        makeBlock({
          meta: {
            targetAt: "2099-01-01T00:00",
            autoHide: false,
            linkLabel: "Set a reminder",
            linkUrl: "https://cal.example.com",
          },
        }),
      ),
    );
    expect(html).toContain("block-countdown-link");
    expect(html).toContain('href="https://cal.example.com"');
    expect(html).toContain("Set a reminder");
  });

  it("renders an empty state for a missing/invalid target", () => {
    expect(
      renderToStaticMarkup(CountdownBlockRenderer(makeBlock({ meta: {} }))),
    ).toContain("block-countdown-empty");
    expect(
      renderToStaticMarkup(
        CountdownBlockRenderer(makeBlock({ meta: { targetAt: "not-a-date" } })),
      ),
    ).toContain("block-countdown-empty");
  });
});
