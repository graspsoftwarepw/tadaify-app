/**
 * @module ONBOARDING
 * @covers TR-tadaify-006
 * OnboardingPreviewPane — right-column live preview for onboarding steps.
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-profile.html
 *
 * Features:
 *   - 3-viewport switcher: Desktop / Tablet (820×1180 with transform:scale) /
 *     Mobile (390×844 with transform:scale). State persisted in sessionStorage.
 *   - Light/dark toggle — propagates via TEMPLATES_DARK_OVERRIDE in iframe srcdoc.
 *   - Live state broadcast: subscribes to tdf:onboarding:state-update events,
 *     updates iframe srcdoc with 150ms debounce already applied by the publisher.
 *   - Reduced motion: viewport-switcher transition disabled for prefers-reduced-motion.
 *   - No clipping: iframe height respects max-height with internal scroll.
 *
 * TR-tadaify-006 contract:
 *   Subscribes to: tdf:onboarding:state-update
 *   sessionStorage key: tadaify:onboarding:viewport
 *   Viewport dimensions: Desktop=native, Tablet=820×1180 scaled, Mobile=390×844 scaled
 *
 * Story: F-ONBOARDING-001b (tadaify-app#137)
 * DEC trail:
 *   DEC-251   preview pane shared partial pattern
 *   DEC-297=B tier step has no preview pane (enforced at layout level, not here)
 *   DEC-332=D complete step has no preview pane (enforced at layout level)
 * Covers: U3 (component wiring tests in OnboardingPreviewPane.test.tsx)
 */

import { useEffect, useRef, useState } from "react";
import {
  subscribe,
  type OnboardingPreviewState,
} from "~/lib/onboarding-preview-bus";
import {
  getViewport,
  setViewport,
  type ViewportSize,
} from "~/lib/onboarding-viewport-store";

// ─── Device dimensions ─────────────────────────────────────────────────────────

/** Real device logical pixels (the "true" width/height the page sees) */
const DEVICE_LOGICAL: Record<ViewportSize, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

/** Display container dimensions inside the preview pane */
const DISPLAY_CONTAINER = {
  width: 300,   // fixed container width in the aside
  height: 480,  // max display height
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildSocialLinksHtml(
  platforms: string[],
  socials: Record<string, string>,
  fgMuted: string,
  brand: string
): string {
  const entries = platforms
    .filter((p) => socials[p] && socials[p].trim() !== "")
    .map(
      (p) =>
        `<div class="social-row" data-platform="${escapeHtml(p)}">` +
        `<span class="social-platform">${escapeHtml(p)}</span>` +
        `<span class="social-value">${escapeHtml(socials[p])}</span>` +
        `</div>`
    );
  if (entries.length === 0) return "";
  return `<div class="social-links">${entries.join("")}</div>`;
}

function buildSrcdoc(
  state: OnboardingPreviewState,
  darkMode: boolean
): string {
  const { handle, name, bio, av, platforms, socials, tpl } = state;

  const avatarInitial = (name || handle || "?").charAt(0).toUpperCase();

  // Derive theme palette
  const bg = darkMode ? "#111827" : "#EEF2FF";
  const cardBg = darkMode ? "#1f2937" : "#ffffff";
  const fg = darkMode ? "#f9fafb" : "#111827";
  const fgMuted = darkMode ? "#9ca3af" : "#6b7280";
  const brand = "#6366f1";

  // Template hint for the preview
  const tplNote = tpl ? `Template: <em>${escapeHtml(tpl)}</em>` : "";

  // Social links — rendered in platform order
  const socialLinksHtml = buildSocialLinksHtml(platforms, socials, fgMuted, brand);
  const hasBlocks = socialLinksHtml.length > 0;

  return `<!DOCTYPE html>
<html lang="en" ${darkMode ? 'class="dark"' : ""}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${bg};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 20px;
    }
    .av {
      width: 72px; height: 72px; border-radius: 50%;
      background: ${brand};
      color: #fff; font-size: 28px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; overflow: hidden; flex-shrink: 0;
    }
    .av img { width: 100%; height: 100%; object-fit: cover; }
    .name { font-size: 18px; font-weight: 700; text-align: center; color: ${fg}; }
    .handle { font-size: 13px; color: ${fgMuted}; text-align: center; margin-top: 4px; }
    .bio {
      font-size: 13px; color: ${fgMuted}; text-align: center;
      margin-top: 10px; line-height: 1.55; max-width: 260px;
    }
    .tpl-note { font-size: 11px; color: ${fgMuted}; text-align: center; margin-top: 16px; }
    .card {
      background: ${cardBg}; border-radius: 12px;
      padding: 24px 20px; max-width: 340px; width: 100%;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      display: flex; flex-direction: column; align-items: center;
      margin-top: 0;
    }
    .social-links {
      margin-top: 16px; width: 100%; display: flex;
      flex-direction: column; gap: 8px;
    }
    .social-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 8px;
      background: ${darkMode ? "#374151" : "#f3f4f6"};
    }
    .social-platform {
      font-size: 12px; font-weight: 600; color: ${brand};
      text-transform: capitalize; min-width: 70px;
    }
    .social-value {
      font-size: 12px; color: ${fg}; word-break: break-all;
    }
    .empty-blocks {
      margin-top: 20px; font-size: 12px; color: ${fgMuted};
      text-align: center; opacity: 0.7;
    }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="av">
      ${av ? `<img src="${escapeHtml(av)}" alt="Avatar" onerror="this.style.display='none';this.parentElement.textContent='${avatarInitial}'" />` : avatarInitial}
    </div>
    <div class="name">${escapeHtml(name || `@${handle}`)}</div>
    <div class="handle">tadaify.com/${escapeHtml(handle)}</div>
    ${bio ? `<div class="bio">${escapeHtml(bio)}</div>` : ""}
    ${tplNote ? `<div class="tpl-note">${tplNote}</div>` : ""}
    ${socialLinksHtml}
    ${!hasBlocks ? `<div class="empty-blocks">Your blocks will appear here</div>` : ""}
  </div>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OnboardingPreviewPaneProps {
  /** Initial state snapshot (from URL params on first mount) */
  initialState: OnboardingPreviewState;
}

export function OnboardingPreviewPane({ initialState }: OnboardingPreviewPaneProps) {
  const [viewport, setViewportState] = useState<ViewportSize>("desktop");
  const [darkMode, setDarkMode] = useState(false);
  const [liveState, setLiveState] = useState<OnboardingPreviewState>(initialState);
  const [syncing, setSyncing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore viewport from sessionStorage on mount (SSR-safe)
  useEffect(() => {
    setViewportState(getViewport());
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) {
      setPrefersReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  // Subscribe to state-update events — unsubscribes on unmount (ECN-137-10)
  useEffect(() => {
    const unsub = subscribe((state) => {
      setLiveState(state);
      setSyncing(true);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => setSyncing(false), 400);
    });
    return () => {
      unsub();
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // Viewport change handler — persists to sessionStorage
  const handleViewportChange = (v: ViewportSize) => {
    setViewportState(v);
    setViewport(v);
  };

  const transition = prefersReducedMotion ? "none" : "all 200ms ease";

  // Calculate scale for tablet/mobile
  const logical = DEVICE_LOGICAL[viewport];
  const scale = Math.min(
    DISPLAY_CONTAINER.width / logical.width,
    DISPLAY_CONTAINER.height / logical.height
  );

  const scaledW = Math.round(logical.width * scale);
  const scaledH = Math.round(logical.height * scale);

  const srcdoc = buildSrcdoc(liveState, darkMode);

  return (
    <aside
      data-onboarding-preview
      data-testid="onboarding-preview-pane"
      aria-label="Page preview"
      style={{
        width: 360,
        background: "var(--bg-muted)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px",
        gap: 14,
        overflowY: "auto",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3
          style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", margin: 0 }}
        >
          Preview
        </h3>

        {/* Syncing indicator */}
        <span
          aria-live="polite"
          style={{
            fontSize: 11,
            color: "var(--fg-muted)",
            opacity: syncing ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          syncing…
        </span>

        {/* Light/Dark toggle — icon-only, per brand-lock */}
        <button
          type="button"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="preview-theme-toggle"
          onClick={() => setDarkMode((d) => !d)}
          style={{
            padding: "5px 7px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--fg-muted)",
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          {darkMode ? (
            // Sun icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            // Moon icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Viewport switcher ────────────────────────────────────────────── */}
      <div
        data-testid="viewport-switcher"
        role="radiogroup"
        aria-label="Preview viewport"
        style={{
          display: "flex",
          background: "var(--bg-elevated)",
          borderRadius: 8,
          padding: 3,
          gap: 2,
          border: "1px solid var(--border)",
        }}
      >
        {(["desktop", "tablet", "mobile"] as ViewportSize[]).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={viewport === v}
            data-viewport={v}
            data-testid={`viewport-btn-${v}`}
            onClick={() => handleViewportChange(v)}
            style={{
              flex: 1,
              padding: "5px 6px",
              background: viewport === v ? "var(--brand-primary)" : "transparent",
              border: "1px solid transparent",
              borderRadius: 6,
              fontSize: 11.5,
              cursor: "pointer",
              color: viewport === v ? "#fff" : "var(--fg-muted)",
              fontWeight: viewport === v ? 600 : 400,
              transition,
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Device frame + iframe ────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flex: 1,
          overflow: "hidden",
          minHeight: DISPLAY_CONTAINER.height + 16,
        }}
      >
        {/* Outer sized container — matches scaled display area */}
        <div
          data-testid="preview-frame-container"
          style={{
            width: scaledW,
            height: scaledH,
            position: "relative",
            flexShrink: 0,
            borderRadius: viewport === "mobile" ? 20 : viewport === "tablet" ? 14 : 8,
            border: "2px solid var(--border-strong)",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            transition,
          }}
        >
          {/* Notch for mobile */}
          {viewport === "mobile" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: Math.round(80 * scale),
                height: Math.round(6 * scale),
                background: "var(--border-strong)",
                borderRadius: "0 0 8px 8px",
                zIndex: 2,
              }}
            />
          )}

          {/* The actual iframe — rendered at full logical size, scaled down */}
          <iframe
            data-onboarding-preview
            title="Page preview"
            srcDoc={srcdoc}
            style={{
              width: logical.width,
              height: logical.height,
              border: "none",
              display: "block",
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* ── Viewport label ───────────────────────────────────────────────── */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--fg-subtle)",
          margin: 0,
        }}
        aria-hidden="true"
      >
        {viewport === "desktop" && "Desktop — native width"}
        {viewport === "tablet" && `Tablet — 820×1180 (${Math.round(scale * 100)}%)`}
        {viewport === "mobile" && `Mobile — 390×844 (${Math.round(scale * 100)}%)`}
      </p>
    </aside>
  );
}
