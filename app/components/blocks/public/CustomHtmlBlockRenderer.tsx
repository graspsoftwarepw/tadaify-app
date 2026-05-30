/**
 * CustomHtmlBlockRenderer — public-page renderer for `block_type = "custom-html"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * The creator's raw HTML/CSS/JS is rendered inside a SANDBOXED iframe via the
 * `srcdoc` attribute. The sandbox grants `allow-scripts` but deliberately NOT
 * `allow-same-origin`: the frame therefore runs in a unique opaque origin and
 * cannot read tadaify cookies, localStorage, or the parent DOM. This is the
 * key isolation that lets us host arbitrary creator code without an XSS hole —
 * we never inject the HTML into the public page's own document.
 *
 * Block shape (PublicBlock):
 *   - `meta` mirrors `CustomHtmlFormValue`: `{ html?: string }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-custom-html*`.
 *
 * Known limitation: without `allow-same-origin` the parent cannot measure the
 * frame's content height, so the frame uses a fixed default height with
 * internal scrolling. A self-resizing handshake is intentionally out of scope
 * for this render-only slice.
 *
 * Story: F-BLOCK-CUSTOMHTML-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

interface CustomHtmlBlockMeta {
  html: string;
}

function readCustomHtmlMeta(meta: unknown): CustomHtmlBlockMeta {
  if (!meta || typeof meta !== "object") return { html: "" };
  const m = meta as Record<string, unknown>;
  return { html: typeof m.html === "string" ? m.html : "" };
}

export function CustomHtmlBlockRenderer(block: PublicBlock): ReactNode {
  const { html } = readCustomHtmlMeta(block.meta);
  const trimmed = html.trim();

  return (
    <article
      data-block-type="custom-html"
      data-block-id={block.id}
      className="block-custom-html-wrap"
    >
      {trimmed ? (
        <iframe
          className="block-custom-html-frame"
          title="Custom HTML block"
          // allow-scripts WITHOUT allow-same-origin → opaque origin, no access
          // to parent cookies/DOM. allow-popups/forms keep creator links and
          // simple forms usable.
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
          referrerPolicy="no-referrer"
          loading="lazy"
          srcDoc={trimmed}
          data-testid={`block-custom-html-${block.id}`}
        />
      ) : (
        <p className="block-custom-html-empty">No custom HTML added yet.</p>
      )}
    </article>
  );
}
