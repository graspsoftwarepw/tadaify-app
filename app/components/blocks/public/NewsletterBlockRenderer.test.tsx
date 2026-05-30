/**
 * NewsletterBlockRenderer unit tests.
 *
 * Story: F-BLOCK-NEWSLETTER-001 (tadaify-app#56)
 *
 * Security-critical property: provider secrets in meta are NEVER emitted.
 */

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NewsletterBlockRenderer } from "./NewsletterBlockRenderer";
import type { PublicBlock } from "~/lib/block-render-registry";

function makeBlock(overrides: Partial<PublicBlock> = {}): PublicBlock {
  return {
    id: "block-newsletter-test",
    block_type: "newsletter",
    title: "",
    url: null,
    position: 0,
    is_visible: true,
    meta: {
      provider: "kit",
      heading: "Join my list",
      subhead: "No spam — one email a week.",
      cta: "Subscribe",
      ctaIcon: "send",
      placeholder: "you@email.com",
      captureName: false,
    },
    ...overrides,
  };
}

describe("NewsletterBlockRenderer", () => {
  it("renders an <article data-block-type='newsletter' data-block-id> wrapper", () => {
    const html = renderToStaticMarkup(NewsletterBlockRenderer(makeBlock()));
    expect(html).toContain('data-block-type="newsletter"');
    expect(html).toContain('data-block-id="block-newsletter-test"');
  });

  it("renders heading, subhead, email input and CTA label", () => {
    const html = renderToStaticMarkup(NewsletterBlockRenderer(makeBlock()));
    expect(html).toContain("Join my list");
    expect(html).toContain("No spam");
    expect(html).toContain('type="email"');
    expect(html).toContain('placeholder="you@email.com"');
    expect(html).toContain("Subscribe");
  });

  it("uses a type='button' (inert) CTA — never an auto-submitting button", () => {
    const html = renderToStaticMarkup(NewsletterBlockRenderer(makeBlock()));
    expect(html).toContain('type="button"');
    expect(html).not.toContain('type="submit"');
  });

  it("NEVER emits provider secrets present in meta", () => {
    const html = renderToStaticMarkup(
      NewsletterBlockRenderer(
        makeBlock({
          meta: {
            provider: "webhook",
            heading: "Join",
            cta: "Go",
            apiKey_kit: "SECRET_KIT_KEY_123",
            apiKey_mailchimp: "SECRET_MC_KEY",
            webhookUrl: "https://hooks.example.com/secret-xyz",
            listId_kit: "list_987",
          },
        }),
      ),
    );
    expect(html).not.toContain("SECRET_KIT_KEY_123");
    expect(html).not.toContain("SECRET_MC_KEY");
    expect(html).not.toContain("hooks.example.com");
    expect(html).not.toContain("list_987");
  });

  it("renders a name input only when captureName is true", () => {
    const without = renderToStaticMarkup(NewsletterBlockRenderer(makeBlock()));
    expect(without).not.toContain('name="name"');
    const withName = renderToStaticMarkup(
      NewsletterBlockRenderer(
        makeBlock({ meta: { heading: "Join", cta: "Go", captureName: true } }),
      ),
    );
    expect(withName).toContain('name="name"');
  });

  it("falls back to sensible defaults when fields are missing", () => {
    const html = renderToStaticMarkup(
      NewsletterBlockRenderer(makeBlock({ meta: {} })),
    );
    expect(html).toContain("Subscribe");
    expect(html).toContain('placeholder="you@email.com"');
  });
});
