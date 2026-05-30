/**
 * HeadingBlockRenderer — public-page renderer for `block_type = "heading"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`
 * so the public `GET /:handle` route emits a real heading/paragraph instead of
 * the empty `<article data-block-type data-block-id />` default.
 *
 * Block shape (PublicBlock):
 *   - `title` is the heading text.
 *   - `url`   is unused for headings.
 *   - `meta`  is a JSON blob mirroring `HeadingFormValue`:
 *             `{ level?: "hero"|"h1"|"h2"|"h3"|"p", align?: "left"|"center"|"right",
 *                icon?: string | null }`. Defaults: level=h2, align=center, no icon.
 *
 * Style lives in `app/styles/public-creator.css` under the `.block-heading*`
 * selectors.
 *
 * Story: F-BLOCK-HEADING-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";

type HeadingLevel = "hero" | "h1" | "h2" | "h3" | "p";
type HeadingAlign = "left" | "center" | "right";

interface HeadingBlockMeta {
  level: HeadingLevel;
  align: HeadingAlign;
  icon: string | null;
}

const LEVELS: readonly string[] = ["hero", "h1", "h2", "h3", "p"];
const ALIGNS: readonly string[] = ["left", "center", "right"];

/** Map a logical display level to the actual semantic HTML tag. */
const TAG_FOR_LEVEL: Record<HeadingLevel, "h1" | "h2" | "h3" | "p"> = {
  hero: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
};

/** Type-guard for the `meta` JSON blob. */
function readHeadingMeta(meta: unknown): HeadingBlockMeta {
  if (!meta || typeof meta !== "object") {
    return { level: "h2", align: "center", icon: null };
  }
  const m = meta as Record<string, unknown>;
  const level =
    typeof m.level === "string" && LEVELS.includes(m.level)
      ? (m.level as HeadingLevel)
      : "h2";
  const align =
    typeof m.align === "string" && ALIGNS.includes(m.align)
      ? (m.align as HeadingAlign)
      : "center";
  const icon = typeof m.icon === "string" ? m.icon : null;
  return { level, align, icon };
}

/**
 * Render a single heading block as the matching semantic element.
 *
 * `hero` upsizes an `<h1>` visually (via the `block-heading-hero` class) while
 * keeping a single top-level `<h1>` semantically. `p` renders body copy.
 */
export function HeadingBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readHeadingMeta(block.meta);
  const text = block.title || "";
  const Tag = TAG_FOR_LEVEL[meta.level];
  const iconEl = meta.icon ? renderIcon(meta.icon, { size: 20 }) : null;

  return (
    <article
      data-block-type="heading"
      data-block-id={block.id}
      className="block-heading-wrap"
      data-align={meta.align}
    >
      <Tag
        className={`block-heading block-heading-${meta.level} block-heading-${meta.align}`}
        data-testid={`block-heading-${block.id}`}
      >
        {iconEl ? (
          <span className="block-heading-icon" aria-hidden="true">
            {iconEl}
          </span>
        ) : null}
        <span className="block-heading-text">{text}</span>
      </Tag>
    </article>
  );
}
