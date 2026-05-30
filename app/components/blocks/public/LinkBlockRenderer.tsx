/**
 * LinkBlockRenderer — public-page renderer for `block_type = "link"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`
 * so the public `GET /:handle` route emits a real button instead of the empty
 * `<article data-block-type data-block-id />` default.
 *
 * Visual contract: mockup `mockups/tadaify-mvp/creator-public.html`, the `.cb`
 * selector (rounded-card, hover-lift). Style lives in
 * `app/styles/public-creator.css` under the `.block-link*` selectors.
 *
 * Block shape (PublishedBlock):
 *   - `title` is the button label.
 *   - `url`   is the destination URL (already normalised via `normalizeUrl`
 *             before save; we DO trust it here).
 *   - `meta`  is a JSON blob — for link blocks we expect
 *             `{ icon?: string, newtab?: boolean }`. Both fields are optional;
 *             defaults: no icon, newtab=true.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 * Covers: BR-BLOCK-LINK-002 (render), TR (rel=noopener), AC#12 (styled <a>).
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";

/** Type-guard for the `meta` JSON blob. */
interface LinkBlockMeta {
  icon?: string | null;
  newtab?: boolean;
}

function readLinkMeta(meta: unknown): LinkBlockMeta {
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  return {
    icon: typeof m.icon === "string" ? m.icon : null,
    newtab: typeof m.newtab === "boolean" ? m.newtab : true,
  };
}

/**
 * Render a single link block as an anchor card.
 *
 * If `url` is missing/empty we still emit the `<article>` wrapper but the
 * inner `<a>` falls back to `href="#"` and is marked `aria-disabled` so the
 * visitor can see that the creator hasn't filled the destination yet —
 * matches the "no fake margin" rule (don't pretend the block is functional).
 */
export function LinkBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readLinkMeta(block.meta);
  const label = block.title || "Link";
  const hasUrl = typeof block.url === "string" && block.url.length > 0;
  const newtab = meta.newtab !== false;
  const iconEl = meta.icon ? renderIcon(meta.icon, { size: 20 }) : null;

  // `rel="noopener noreferrer"` per TR (BR-BLOCK-LINK-007 hardening) — even
  // when newtab is off we keep `noopener` because outbound creator links
  // should never get a window.opener reference back into the visitor page.
  const rel = "noopener noreferrer";
  const target = newtab ? "_blank" : "_self";

  return (
    <article
      data-block-type="link"
      data-block-id={block.id}
      className="block-link-wrap"
    >
      <a
        className="block-link"
        href={hasUrl ? block.url ?? "#" : "#"}
        target={target}
        rel={rel}
        aria-disabled={hasUrl ? undefined : true}
        data-testid={`block-link-${block.id}`}
      >
        {iconEl ? (
          <span className="block-link-icon" aria-hidden="true">
            {iconEl}
          </span>
        ) : null}
        <span className="block-link-label">{label}</span>
      </a>
    </article>
  );
}
