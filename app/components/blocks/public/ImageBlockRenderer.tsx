/**
 * ImageBlockRenderer — public-page renderer for `block_type = "image"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Renders a single image (optionally a click-through to a URL, optionally with
 * a caption) at the chosen aspect ratio. When no image source has been set yet
 * (upload backend is not wired), we render an honest placeholder rather than a
 * broken `<img>` (no fake margin).
 *
 * Block shape (PublicBlock):
 *   - `title` is unused (alt text lives in meta).
 *   - `url`   is a fallback click-through if `meta.href` is absent.
 *   - `meta`  mirrors `ImageFormValue`: `{ src?, alt?, caption?, href?,
 *             ctaLabel?, aspect?: "1"|"43"|"169"|"rounded" }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-image*`.
 *
 * Story: F-BLOCK-IMAGE-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

type ImageAspect = "1" | "43" | "169" | "rounded";

interface ImageBlockMeta {
  src: string | null;
  alt: string;
  caption: string;
  href: string;
  ctaLabel: string;
  aspect: ImageAspect;
}

const ASPECTS: readonly string[] = ["1", "43", "169", "rounded"];

function readImageMeta(block: PublicBlock): ImageBlockMeta {
  const m =
    block.meta && typeof block.meta === "object"
      ? (block.meta as Record<string, unknown>)
      : {};
  const src = typeof m.src === "string" && m.src ? m.src : null;
  const alt = typeof m.alt === "string" ? m.alt : "";
  const caption = typeof m.caption === "string" ? m.caption : "";
  const metaHref = typeof m.href === "string" ? m.href : "";
  const href = metaHref || (typeof block.url === "string" ? block.url : "");
  const ctaLabel = typeof m.ctaLabel === "string" ? m.ctaLabel : "";
  const aspect =
    typeof m.aspect === "string" && ASPECTS.includes(m.aspect)
      ? (m.aspect as ImageAspect)
      : "rounded";
  return { src, alt, caption, href: href ?? "", ctaLabel, aspect };
}

export function ImageBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readImageMeta(block);

  const figureClass = `block-image block-image-${meta.aspect}`;

  // Placeholder when no source is set — keeps the block honest pre-upload.
  if (!meta.src) {
    return (
      <article
        data-block-type="image"
        data-block-id={block.id}
        className="block-image-wrap"
      >
        <figure className={figureClass} data-testid={`block-image-${block.id}`}>
          <div className="block-image-empty" aria-hidden="true">
            No image set yet.
          </div>
          {meta.caption ? (
            <figcaption className="block-image-caption">{meta.caption}</figcaption>
          ) : null}
        </figure>
      </article>
    );
  }

  const img = (
    <img
      className="block-image-img"
      src={meta.src}
      alt={meta.alt}
      loading="lazy"
      decoding="async"
    />
  );

  const hasHref = meta.href.length > 0;

  return (
    <article
      data-block-type="image"
      data-block-id={block.id}
      className="block-image-wrap"
    >
      <figure className={figureClass} data-testid={`block-image-${block.id}`}>
        {hasHref ? (
          <a
            className="block-image-link"
            href={meta.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {img}
            {meta.ctaLabel ? (
              <span className="block-image-cta">{meta.ctaLabel}</span>
            ) : null}
          </a>
        ) : (
          img
        )}
        {meta.caption ? (
          <figcaption className="block-image-caption">{meta.caption}</figcaption>
        ) : null}
      </figure>
    </article>
  );
}
