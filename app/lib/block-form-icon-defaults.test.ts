/**
 * U — block form default icons resolve to real glyphs
 *
 * Story: F-BLOCK-ICON-DEFAULTS-001 (#299)
 *
 * `renderIcon` resolves `lucide:<name>` / `simple-icons:<slug>` ids and falls
 * back to a HelpCircle "?" (with a `[renderIcon]` console.warn) for anything
 * else. Block form DEFAULTS that hardcode a bare/unknown id therefore ship the
 * wrong icon on the public page for any block saved without touching the icon.
 *
 * This guard renders every block form default icon id and fails if it doesn't
 * resolve cleanly — so a future bare default can't silently regress.
 */

import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderIcon } from "~/lib/icon-resolve";
import { LINK_FORM_DEFAULTS } from "~/components/blocks/forms/LinkForm";
import { COUNTDOWN_FORM_DEFAULTS } from "~/components/blocks/forms/CountdownForm";
import { NEWSLETTER_FORM_DEFAULTS } from "~/components/blocks/forms/NewsletterForm";
import { PRODUCT_FORM_DEFAULTS } from "~/components/blocks/forms/ProductForm";
import { HEADING_FORM_DEFAULTS } from "~/components/blocks/forms/HeadingForm";
import { ACCORDION_FORM_DEFAULTS } from "~/components/blocks/forms/AccordionForm";

/** Every block form default that carries a `renderIcon` id (null = no icon). */
const ICON_DEFAULTS: Array<[string, string | null]> = [
  ["link.icon", LINK_FORM_DEFAULTS.icon],
  ["countdown.icon", COUNTDOWN_FORM_DEFAULTS.icon],
  ["newsletter.ctaIcon", NEWSLETTER_FORM_DEFAULTS.ctaIcon],
  ["product.ctaIcon", PRODUCT_FORM_DEFAULTS.ctaIcon],
  ["heading.icon", HEADING_FORM_DEFAULTS.icon],
  ["accordion.sectionIcon", ACCORDION_FORM_DEFAULTS.sectionIcon],
];

describe("block form default icons resolve to real glyphs (no fallback)", () => {
  for (const [name, id] of ICON_DEFAULTS) {
    it(`${name} = ${JSON.stringify(id)} resolves cleanly`, () => {
      if (id == null) return; // intentionally no icon — nothing to resolve

      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const html = renderToStaticMarkup(renderIcon(id, { size: 18 }));
      const warned = warn.mock.calls.map((c) => String(c[0])).join("\n").includes("[renderIcon]");
      warn.mockRestore();

      expect(warned, `renderIcon emitted a fallback warning for "${id}"`).toBe(false);
      expect(html.length).toBeGreaterThan(0);
    });
  }
});
