/**
 * @module PUBLIC-PAGES
 * @covers BR-CREATOR-001
 * PublicChrome — visitor-facing page chrome shared across the public render
 * route (`GET /:handle`) and its 404 / 500 ErrorBoundary fallbacks.
 *
 * Visual contract: matches the landing's wordmark + sticky nav and the
 * landing's footer minimal row, so a visitor who clicks through from
 * `tadaify.com` to `tadaify.com/<handle>` sees the same chrome and stays in
 * one brand. We do NOT re-render the landing's full footer (the multi-column
 * link grid would dominate the creator's page) — only the minimal bottom row
 * with the wordmark + © + legal links, which is the part that satisfies
 * issue #202's "page chrome inheritance" hard-gate.
 *
 * Styling lives in `app/styles/public-creator.css` under the
 * `.public-chrome-*` selectors. That stylesheet is registered by the route's
 * `links()` export.
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: visitor chrome inheritance hard-gate (Owner gap #4, Codex round-1
 * finding #2 follow-on).
 */

import type { ReactNode } from "react";

function Wordmark({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <span className={className} aria-hidden="true">
      <span className="wm-ta">ta</span>
      <span className="wm-da">da!</span>
      <span className="wm-ify">ify</span>
    </span>
  );
}

export function PublicChrome({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      <header className="public-chrome-nav" aria-label="tadaify navigation">
        <div className="public-chrome-nav-inner">
          <a
            href="/"
            className="public-chrome-brand"
            aria-label="tadaify home"
          >
            <Wordmark />
          </a>
          <a href="/#hero-claim" className="public-chrome-nav-cta">
            Claim your handle
          </a>
        </div>
      </header>
      {children}
      <footer className="public-chrome-footer" aria-label="tadaify footer">
        <div className="public-chrome-footer-inner">
          <Wordmark className="public-chrome-footer-brand" />
          <span>© 2026 tadaify. Made by creators, for creators.</span>
          <span className="public-chrome-footer-links">
            <a href="/privacy">Privacy</a>
            {" · "}
            <a href="/terms">Terms</a>
            {" · "}
            <a href="/cookies">Cookies</a>
          </span>
        </div>
      </footer>
    </>
  );
}
