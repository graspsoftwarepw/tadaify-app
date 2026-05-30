/**
 * NewsletterBlockRenderer — public-page renderer for `block_type = "newsletter"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Renders the PUBLIC presentation of a newsletter signup: heading, subheadline,
 * an email field (plus an optional name field), and a call-to-action button.
 *
 * SECURITY: the `meta` blob also carries provider secrets (apiKey_*, listId_*,
 * webhookUrl, gsheet*). This renderer reads ONLY the presentational fields and
 * NEVER emits any secret into the public HTML.
 *
 * Submit is intentionally inert for now — the provider submit backend is a
 * separate, deferred slice. The CTA is a `type="button"` (it does not POST), so
 * the block is visually complete without pretending to subscribe anyone (no
 * fake margin). A `data-block-newsletter` hook is left for the backend slice to
 * progressively enhance.
 *
 * Block shape (PublicBlock):
 *   - `meta` mirrors the presentational subset of `NewsletterFormValue`:
 *     `{ provider?, heading?, subhead?, cta?, ctaIcon?, placeholder?, captureName? }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-newsletter*`.
 *
 * Story: F-BLOCK-NEWSLETTER-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";

interface NewsletterBlockMeta {
  provider: string;
  heading: string;
  subhead: string;
  cta: string;
  ctaIcon: string | null;
  placeholder: string;
  captureName: boolean;
}

/** Read ONLY presentational fields — never provider secrets. */
function readNewsletterMeta(meta: unknown): NewsletterBlockMeta {
  const m =
    meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {};
  return {
    provider: typeof m.provider === "string" ? m.provider : "",
    heading: typeof m.heading === "string" ? m.heading : "",
    subhead: typeof m.subhead === "string" ? m.subhead : "",
    cta: typeof m.cta === "string" && m.cta ? m.cta : "Subscribe",
    ctaIcon: typeof m.ctaIcon === "string" && m.ctaIcon ? m.ctaIcon : null,
    placeholder:
      typeof m.placeholder === "string" && m.placeholder
        ? m.placeholder
        : "you@email.com",
    captureName: m.captureName === true,
  };
}

/** IconPicker stores `lucide:<name>` / `simple-icons:<slug>`; tolerate bare names. */
function normalizeIconId(icon: string | null): string | null {
  if (!icon) return null;
  return icon.includes(":") ? icon : `lucide:${icon}`;
}

export function NewsletterBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readNewsletterMeta(block.meta);
  const iconEl = renderIcon(normalizeIconId(meta.ctaIcon), { size: 18 });

  return (
    <article
      data-block-type="newsletter"
      data-block-id={block.id}
      className="block-newsletter-wrap"
    >
      <div
        className="block-newsletter"
        data-provider={meta.provider || undefined}
        data-testid={`block-newsletter-${block.id}`}
      >
        {meta.heading ? (
          <h3 className="block-newsletter-heading">{meta.heading}</h3>
        ) : null}
        {meta.subhead ? (
          <p className="block-newsletter-subhead">{meta.subhead}</p>
        ) : null}
        <form
          className="block-newsletter-form"
          aria-label="Newsletter signup"
          data-block-newsletter=""
        >
          {meta.captureName ? (
            <input
              className="block-newsletter-input"
              type="text"
              name="name"
              placeholder="Your name"
              autoComplete="name"
              aria-label="Your name"
            />
          ) : null}
          <input
            className="block-newsletter-input"
            type="email"
            name="email"
            placeholder={meta.placeholder}
            autoComplete="email"
            aria-label="Email address"
          />
          {/* Inert until the provider submit backend slice lands. */}
          <button className="block-newsletter-btn" type="button">
            {iconEl ? (
              <span className="block-newsletter-btn-icon" aria-hidden="true">
                {iconEl}
              </span>
            ) : null}
            <span className="block-newsletter-btn-label">{meta.cta}</span>
          </button>
        </form>
      </div>
    </article>
  );
}
