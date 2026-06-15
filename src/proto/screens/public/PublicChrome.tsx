/**
 * PublicChrome — the shared chrome for tadaify's public creator sub-pages.
 *
 * Wraps a page's content in the family chrome every visitor-facing creator
 * page shares: a mockup-only `.public-topstrip` (hub back-link + url pill +
 * ThemeToggle), the canonical `.creator-nav` (avatar handle + Home/About/Blog/
 * Portfolio/Book/Contact links with the current page marked `is-current`), and
 * the `.creator-footer` (social row + Wordmark powered-by note).
 *
 * Faithfully based on the chrome that CreatorAboutPublicScreen renders inline.
 * Presentational only — local state lives in the page, never here.
 *
 * NOTE: this component is for NEW public pages. The three already-merged public
 * screens (creator-about-public, creator-blog-public, creator-portfolio-public)
 * intentionally keep their chrome inline and are NOT migrated onto PublicChrome.
 *
 * PublicChrome is shared and carries no per-page `@implements`; it is not listed
 * in any per-page FR's related_files (each page's own Screen/css/fixture are).
 */
import type { ReactNode } from "react";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import "./public-chrome.css";

/** The canonical public-page sections, in nav order. */
export type PublicPageId =
  | "home"
  | "about"
  | "blog"
  | "portfolio"
  | "book"
  | "faq"
  | "contact";

export type PublicNavLink = {
  id: PublicPageId;
  label: string;
  /** A real `/__proto/*` route, or `undefined` for a not-yet-built target. */
  href?: string;
};

export type PublicCreator = {
  /** Display name shown beside the avatar. */
  name: string;
  /** Avatar initial (single glyph). */
  initial: string;
  /** Handle without the leading `@`, used to build the url pill. */
  handle: string;
};

export type PublicSocial = { label: string; glyph: string };

/** The default nav. `book`/`faq` are only linked once those routes exist. */
export const DEFAULT_PUBLIC_NAV: PublicNavLink[] = [
  { id: "home", label: "Home", href: "/__proto/creator-public" },
  { id: "about", label: "About", href: "/__proto/creator-about-public" },
  { id: "blog", label: "Blog", href: "/__proto/creator-blog-public" },
  { id: "portfolio", label: "Portfolio", href: "/__proto/creator-portfolio-public" },
  { id: "book", label: "Book", href: "/__proto/creator-schedule-public" },
  { id: "faq", label: "FAQ", href: "/__proto/creator-faq-public" },
  { id: "contact", label: "Contact", href: "/__proto/creator-contact-public" },
];

type PublicChromeProps = {
  /** Extra class on the public root (e.g. `proto-contact-public`). */
  rootClassName: string;
  creator: PublicCreator;
  /** Which nav link is the current page. */
  current: PublicPageId;
  /** Path appended to the url pill after the handle (e.g. `contact`). */
  urlSuffix: string;
  /** Footer social links. */
  socials: PublicSocial[];
  /** Footer powered-by lead text (defaults to "Made with"). */
  footerNote?: string;
  /** Optional nav override; defaults to DEFAULT_PUBLIC_NAV. */
  nav?: PublicNavLink[];
  children: ReactNode;
};

export function PublicChrome({
  rootClassName,
  creator,
  current,
  urlSuffix,
  socials,
  footerNote = "Made with",
  nav = DEFAULT_PUBLIC_NAV,
  children,
}: PublicChromeProps) {
  // Not-yet-built nav targets are mocked, never dead links.
  const onMockNav = (label: string) => () =>
    window.alert(`Mockup — would open the ${label} page`);

  return (
    <div className={`proto-root proto-public ${rootClassName}`}>
      {/* Mockup-only top strip (hub link + url pill + theme toggle). */}
      <div className="public-topstrip">
        <a href="/__proto" className="text-muted">
          ← back to prototype hub
        </a>
        <span className="ts-right">
          <span className="url">
            tadaify.com/{creator.handle}
            {urlSuffix ? `/${urlSuffix}` : ""}
          </span>
          <ThemeToggle />
        </span>
      </div>

      {/* Canonical creator home nav (inherited chrome). */}
      <nav className="creator-nav" aria-label="Creator sections">
        <a href="/__proto/creator-public" className="cn-handle">
          <span className="av" aria-hidden="true">
            {creator.initial}
          </span>
          {creator.name}
        </a>
        <div className="cn-links">
          {nav.map((link) => {
            const isCurrent = link.id === current;
            const className = isCurrent ? "is-current" : undefined;
            if (isCurrent || !link.href) {
              return (
                <button
                  key={link.id}
                  type="button"
                  className={`cn-link-btn${isCurrent ? " is-current" : ""}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={isCurrent ? undefined : onMockNav(link.label)}
                >
                  {link.label}
                </button>
              );
            }
            return (
              <a key={link.id} href={link.href} className={className}>
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>

      {children}

      {/* Inherited footer (social row + powered-by wordmark). */}
      <footer className="creator-footer">
        <div className="social-stack" aria-label="Social profiles">
          {socials.map((s) => (
            <button
              key={s.label}
              type="button"
              className="social-icon-pub"
              aria-label={s.label}
              onClick={() => window.alert(`Mockup — would open ${s.label}`)}
            >
              {s.glyph}
            </button>
          ))}
        </div>
        <div className="powered">
          {footerNote} <Wordmark size="sm" />
        </div>
      </footer>
    </div>
  );
}
