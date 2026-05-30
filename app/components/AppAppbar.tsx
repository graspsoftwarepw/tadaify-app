/**
 * AppAppbar — top application bar for the /app dashboard.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2392-2411
 * (<header class="appbar"> ... </header>).
 *
 * Markup mirrors the mockup verbatim so the scoped CSS in
 * app/styles/app-dashboard.css (under `.app-dashboard-root`) applies
 * unchanged. Additional `appbar-*` composite class names are layered on
 * top to satisfy Pass 3 selector contract (appbar-left / appbar-right /
 * appbar-handle-pill / appbar-theme-toggle / appbar-mobile-toggle /
 * appbar-brand-meta + `icbtn` shorthand).
 *
 * Contains:
 *   - Mobile menu toggle (.icbtn.appbar-mobile-toggle, hidden ≥ tablet)
 *   - Brand wordmark (.wm — 3-span ta/da!/ify, DEC-WORDMARK-01) + .env meta
 *   - Handle pill (.handle-pill — live-dot + tadaify.com/<handle> + copy
 *     SVG → writes URL to clipboard, shows brief "Copied!" feedback)
 *   - Notification bell (.iconbtn — placeholder, no-op click)
 *   - Theme toggle (.iconbtn.theme-toggle — sun/moon SVGs, toggles
 *     body.dark-mode and persists via theme-utils helpers)
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * DEC trail: DEC-WORDMARK-01 (zero separator), DEC-332=D (live-dot = published_at)
 * Covers: AC#2, Visual checklist appbar items
 */

import { useEffect, useState } from "react";
import {
  readInitialTheme,
  applyTheme,
  nextTheme,
  type Theme,
} from "~/lib/theme-utils";

interface AppAppbarProps {
  handle: string;
  isPublished: boolean;
  /**
   * Optional callback fired when the mobile sidebar toggle (.icbtn.appbar-mobile-toggle)
   * is clicked. Pass 4 will wire this to the sidebar drawer state — left as a
   * no-op until then.
   */
  onMobileMenuToggle?: () => void;
}

// ---------------------------------------------------------------------------
// Internal helpers (mirrors ThemeToggleButton.tsx wiring so theme-utils tests
// continue to pass — applyTheme / nextTheme / readInitialTheme are the
// canonical persistence layer).
// ---------------------------------------------------------------------------

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getPrefersDarkMatcher() {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia("(prefers-color-scheme: dark)");
}

function getBodyClassList() {
  if (typeof document === "undefined") return null;
  return document.body.classList;
}

export function AppAppbar({ handle, isPublished, onMobileMenuToggle }: AppAppbarProps) {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = readInitialTheme(getBrowserStorage(), getPrefersDarkMatcher());
    setTheme(initial);
    applyTheme(initial, getBodyClassList(), getBrowserStorage());
  }, []);

  function handlePillClick() {
    const url = `https://tadaify.com/${handle}`;
    const showFeedback = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(showFeedback, showFeedback);
    } else {
      showFeedback();
    }
  }

  function toggleTheme() {
    const next = nextTheme(theme);
    setTheme(next);
    applyTheme(next, getBodyClassList(), getBrowserStorage());
  }

  function handleMobileMenuClick() {
    if (onMobileMenuToggle) onMobileMenuToggle();
  }

  return (
    <header className="appbar" data-testid="app-appbar">
      {/* ============ LEFT GROUP ============ */}
      <div className="appbar-left" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Mobile sidebar toggle — hidden ≥ tablet via scoped CSS (Pass 4). */}
        <button
          type="button"
          className="icbtn iconbtn appbar-mobile-toggle"
          aria-label="Open menu"
          onClick={handleMobileMenuClick}
          data-testid="appbar-mobile-toggle"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand — wordmark only. The mockup also renders a .logo-mark span,
            but that span has no inline SVG in app-dashboard.html (it relies
            on an unscoped CSS background that doesn't ship with our token
            CSS yet). Wordmark alone matches the rendered mockup; the bare
            .logo-mark span is omitted as a fallback rather than emit an
            empty visual. */}
        <a className="brand" href="/app" aria-label="tadaify dashboard home" style={{ textDecoration: "none" }}>
          <span className="wm" aria-hidden="true">
            <span className="ta">ta</span>
            <span className="da">da!</span>
            <span className="ify">ify</span>
          </span>
        </a>

        {/* CREATOR DASHBOARD meta — desktop only via scoped @media in
            app-dashboard.css ( .appbar .env display:inline-block ≥ 900px ). */}
        <span className="env appbar-brand-meta">Creator dashboard</span>
      </div>

      {/* Spacer pushes the right cluster to the edge. */}
      <span className="spacer" style={{ flex: 1 }} />

      {/* ============ RIGHT GROUP ============ */}
      <div className="appbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Handle pill — copies https://tadaify.com/<handle> on click. */}
        <button
          type="button"
          className="handle-pill appbar-handle-pill"
          onClick={handlePillClick}
          data-testid="handle-pill"
          data-clipboard-feedback={copied ? "copied" : undefined}
          aria-label={`Copy page URL: tadaify.com/${handle}`}
        >
          {/* Live-dot — green if published, gray if not (DEC-332=D). */}
          <span
            className="live-dot"
            data-testid="live-dot"
            data-published={isPublished ? "true" : "false"}
            aria-label={isPublished ? "Page is live" : "Page not yet published"}
            style={{
              background: isPublished ? "var(--color-success, #22c55e)" : "var(--fg-subtle)",
            }}
          />
          <span className="hide-sm">tadaify.com/</span>
          <b id="handle-text">{handle}</b>
          {copied ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success, #22c55e)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>

        {/* Notification bell — placeholder. */}
        <button
          type="button"
          className="icbtn iconbtn"
          aria-label="Notifications (coming soon)"
          data-testid="appbar-notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </button>

        {/* Theme toggle — sun + moon SVGs. Scoped CSS in app-dashboard.css
            swaps opacity/transform based on `body.dark-mode`. */}
        <button
          type="button"
          className="icbtn iconbtn theme-toggle appbar-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-pressed={theme === "dark"}
          data-testid="appbar-theme-toggle"
        >
          <svg
            className="theme-icon-sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg
            className="theme-icon-moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
