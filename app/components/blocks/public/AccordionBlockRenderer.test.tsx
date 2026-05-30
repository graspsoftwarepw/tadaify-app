/**
 * AccordionBlockRenderer unit tests.
 *
 * Story: F-BLOCK-ACCORDION-001 (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AccordionBlockRenderer } from "./AccordionBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-accordion-test",
    block_type: "accordion",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: {
      items: [
        { kind: "qa", id: "q1", q: "When is the drop?", a: "Announced on Instagram first." },
      ],
    },
    ...overrides,
  };
}

describe("AccordionBlockRenderer", () => {
  it("renders an <article data-block-type='accordion' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(AccordionBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="accordion"');
    expect(html).toContain('data-block-id="block-accordion-test"');
  });

  it("renders each Q&A as a native <details>/<summary>", () => {
    const html = renderToStaticMarkup(AccordionBlockRenderer(makeBlock()));
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("When is the drop?");
    expect(html).toContain("Announced on Instagram first.");
  });

  it("renders section items as <h3> group headings", () => {
    const html = renderToStaticMarkup(
      AccordionBlockRenderer(
        makeBlock({
          meta: {
            items: [
              { kind: "section", id: "s1", title: "Shipping" },
              { kind: "qa", id: "q1", q: "How long?", a: "3-5 days." },
            ],
          },
        }),
      ),
    );
    expect(html).toMatch(/<h3[^>]*block-accordion-section[^>]*>Shipping<\/h3>/);
  });

  it("renders an empty-state note when there are no items", () => {
    const html = renderToStaticMarkup(
      AccordionBlockRenderer(makeBlock({ meta: { items: [] } })),
    );
    expect(html).toContain("block-accordion-empty");
    expect(html).not.toContain("<details");
  });

  it("ignores malformed items safely", () => {
    const html = renderToStaticMarkup(
      AccordionBlockRenderer(
        makeBlock({
          meta: { items: [null, 42, { kind: "qa", id: "q1", q: "Ok?", a: "Yes" }] },
        }),
      ),
    );
    expect(html).toContain("Ok?");
    expect(html).toContain("<details");
  });
});
