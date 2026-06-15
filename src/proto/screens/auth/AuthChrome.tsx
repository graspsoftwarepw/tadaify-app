/**
 * AuthChrome — the shared minimal top-bar for tadaify's auth screens (login +
 * register). Ported from the `.auth-bar` header in mockups/tadaify-mvp/login.html
 * (identical in register.html): brand wordmark linking back to the landing
 * prototype, a context cross-link, and the prototype ThemeToggle.
 *
 * Shared infra — carries NO per-page `@implements` and is NOT listed in any
 * per-page FR's related_files. The login/register screens own their own
 * Screen/css/fixture trios.
 */
import type { ReactNode } from "react";
import { ThemeToggle } from "../../lib/ThemeToggle";
import "./auth-chrome.css";

type AuthChromeProps = {
  /** The cross-link shown at the bar's right (login ↔ register). */
  barLink: ReactNode;
  children: ReactNode;
};

export function AuthChrome({ barLink, children }: AuthChromeProps) {
  return (
    <div className="proto-root proto-auth">
      <header className="auth-bar">
        <a className="brand" href="/__proto/landing">
          <span className="wordmark wordmark-md" aria-label="tada!ify">
            <span className="wm-ta" aria-hidden>ta</span>
            <span className="wm-da" aria-hidden>da!</span>
            <span className="wm-ify" aria-hidden>ify</span>
          </span>
        </a>
        <span className="spacer" />
        <span className="bar-link">{barLink}</span>
        <ThemeToggle />
      </header>
      {children}
    </div>
  );
}
