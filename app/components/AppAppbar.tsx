/**
 * AppAppbar — top application bar for the /app dashboard.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2392-2417.
 *
 * Contains:
 *   - Brand wordmark (3-span: ta/da!/ify zero separator — DEC-WORDMARK-01)
 *   - Handle pill (copies URL to clipboard with checkmark feedback)
 *   - Theme toggle (sun/moon icon swap — body.dark-mode class)
 *   - Bell icon (notification placeholder)
 *   - Live-dot indicator (green = published, gray = not yet published)
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * DEC trail: DEC-WORDMARK-01 (zero separator), DEC-332=D (live-dot = published_at)
 * Covers: AC#2, Visual checklist appbar items
 */

import { useEffect, useState } from "react";
import { ThemeToggleButton } from "~/components/ThemeToggleButton";

interface AppAppbarProps {
  handle: string;
  isPublished: boolean;
}

export function AppAppbar({ handle, isPublished }: AppAppbarProps) {
  const [copied, setCopied] = useState(false);

  function handlePillClick() {
    const url = `https://tadaify.com/${handle}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        () => {
          // Clipboard write failed — still show brief feedback
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      );
    } else {
      // Fallback: no clipboard API
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <header
      data-testid="app-appbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 54,
        padding: "0 16px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Brand wordmark — DEC-WORDMARK-01: 3-span, zero separator */}
      <a
        href="/app"
        aria-label="tadaify dashboard home"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <span
          className="font-display font-semibold"
          style={{ fontSize: 18, letterSpacing: "-0.02em" }}
          aria-hidden="true"
        >
          <span style={{ color: "var(--brand-primary)" }}>ta</span>
          <span style={{ color: "var(--brand-warm)" }}>da!</span>
          <span style={{ color: "var(--fg)" }}>ify</span>
        </span>
      </a>

      <span
        style={{
          fontSize: 11,
          color: "var(--fg-subtle)",
          fontWeight: 500,
          marginLeft: 4,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        Creator dashboard
      </span>

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Handle pill — copies URL with checkmark feedback */}
      <button
        type="button"
        onClick={handlePillClick}
        data-testid="handle-pill"
        data-clipboard-feedback={copied ? "copied" : undefined}
        aria-label={`Copy page URL: tadaify.com/${handle}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: "var(--bg-muted)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--fg)",
          cursor: "pointer",
          transition: "all .12s ease",
          flexShrink: 0,
        }}
      >
        {/* Live-dot — green if published, gray if not (DEC-332=D) */}
        <span
          data-testid="live-dot"
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: isPublished ? "var(--color-success, #22c55e)" : "var(--fg-subtle)",
            flexShrink: 0,
          }}
          aria-label={isPublished ? "Page is live" : "Page not yet published"}
        />
        <span style={{ color: "var(--fg-muted)" }}>tadaify.com/</span>
        <b style={{ color: "var(--fg)" }}>{handle}</b>
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

      {/* Bell icon — notification placeholder */}
      <button
        type="button"
        aria-label="Notifications (coming soon)"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "transparent",
          border: "1px solid transparent",
          color: "var(--fg-muted)",
          cursor: "pointer",
        }}
      >
        <svg
          width="18"
          height="18"
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

      {/* Theme toggle */}
      <ThemeToggleButton />
    </header>
  );
}
