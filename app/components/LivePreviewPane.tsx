/**
 * LivePreviewPane — phone-frame preview + 3-way device toggle + stats chips.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~3529-3621.
 *
 * Contains:
 *   - 3-way device toggle: Mobile / Tablet / Desktop (pill-buttons)
 *   - Phone/tablet/desktop frame with live preview content
 *   - Stats chips: views today / clicks (placeholder "—")
 *   - Publish state chip (live-dot mirror)
 *   - Preview iframe srcdoc: renders page content OR "Coming soon" placeholder
 *
 * Device toggle respects prefers-reduced-motion: transition 200ms → 0ms.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * DEC trail: DEC-332=D (published_at IS NULL → "Coming soon")
 * Covers: AC#12, ECN-26a-07, ECN-26a-13
 */

import { useEffect, useState } from "react";

export type DeviceSize = "mobile" | "tablet" | "desktop";

interface LivePreviewPaneProps {
  handle: string;
  displayName: string | null;
  bio: string | null;
  isPublished: boolean;
  initialDevice?: DeviceSize;
}

const DEVICE_DIMENSIONS: Record<DeviceSize, { width: number; height: number }> = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 },
};

const FRAME_DISPLAY: Record<DeviceSize, { width: number; height: number }> = {
  mobile: { width: 220, height: 440 },
  tablet: { width: 280, height: 380 },
  desktop: { width: 320, height: 220 },
};

export function LivePreviewPane({
  handle,
  displayName,
  bio,
  isPublished,
  initialDevice = "mobile",
}: LivePreviewPaneProps) {
  const [device, setDevice] = useState<DeviceSize>(initialDevice);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) {
      setPrefersReducedMotion(mq.matches);
    }
  }, []);

  const transitionDuration = prefersReducedMotion ? "0ms" : "200ms";

  const frame = FRAME_DISPLAY[device];
  const avatarInitial = (displayName || handle || "?").charAt(0).toUpperCase();

  // Build srcdoc for iframe preview
  const srcdoc = isPublished
    ? `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #EEF2FF; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; padding: 24px 16px; }
  .av { width: 64px; height: 64px; border-radius: 50%; background: #6366f1;
    color: #fff; font-size: 24px; font-weight: 700; display: flex;
    align-items: center; justify-content: center; margin: 0 auto 12px; }
  .name { font-size: 17px; font-weight: 700; text-align: center; color: #111; }
  .bio { font-size: 13px; color: #666; text-align: center; margin-top: 6px; line-height: 1.5; }
  .handle { font-size: 12px; color: #999; text-align: center; margin-top: 4px; }
  .empty { margin-top: 24px; font-size: 13px; color: #999; text-align: center; }
</style></head>
<body>
  <div class="av">${avatarInitial}</div>
  <div class="name">${escapeHtml(displayName || `@${handle}`)}</div>
  ${bio ? `<div class="bio">${escapeHtml(bio)}</div>` : ""}
  <div class="handle">tadaify.com/${escapeHtml(handle)}</div>
  <div class="empty">Add blocks to customise your page</div>
</body></html>`
    : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 24px; text-align: center; }
  .icon { font-size: 36px; margin-bottom: 16px; }
  .title { font-size: 16px; font-weight: 600; color: #333; }
  .sub { font-size: 13px; color: #888; margin-top: 8px; line-height: 1.5; }
</style></head>
<body>
  <div class="icon">🚀</div>
  <div class="title">Coming soon</div>
  <div class="sub">tadaify.com/${escapeHtml(handle)}<br>Add your first block to publish your page.</div>
</body></html>`;

  return (
    <aside
      data-testid="live-preview-pane"
      aria-label="Live preview"
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
        gap: 12,
      }}
    >
      {/* Preview header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3
          style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", margin: 0 }}
        >
          Live preview
        </h3>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 8px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 11.5,
            cursor: "pointer",
            color: "var(--fg-muted)",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11.5,
            padding: "3px 8px",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--fg-muted)",
          }}
        >
          Views today: —
        </span>
        <span
          style={{
            fontSize: 11.5,
            padding: "3px 8px",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--fg-muted)",
          }}
        >
          Clicks: —
        </span>
        <span
          style={{
            fontSize: 11.5,
            padding: "3px 8px",
            background: isPublished
              ? "rgba(34,197,94,0.08)"
              : "rgba(0,0,0,0.04)",
            border: `1px solid ${isPublished ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
            borderRadius: 12,
            color: isPublished ? "#16a34a" : "var(--fg-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isPublished ? "#22c55e" : "var(--fg-subtle)",
              flexShrink: 0,
            }}
          />
          {isPublished ? "Live" : "Not published"}
        </span>
      </div>

      {/* Device toggle */}
      <div
        data-testid="device-toggle"
        role="radiogroup"
        aria-label="Preview device"
        style={{
          display: "flex",
          background: "var(--bg-muted)",
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}
      >
        {(["mobile", "tablet", "desktop"] as DeviceSize[]).map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={device === d}
            data-device={d}
            onClick={() => setDevice(d)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "5px 6px",
              background: device === d ? "var(--bg-elevated)" : "transparent",
              border: device === d ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: 6,
              fontSize: 11.5,
              cursor: "pointer",
              color: device === d ? "var(--fg)" : "var(--fg-muted)",
              fontWeight: device === d ? 600 : 400,
              transition: `all ${transitionDuration} ease`,
            }}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Preview frame */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          data-testid="preview-frame"
          style={{
            width: frame.width,
            height: frame.height,
            border: "2px solid var(--border-strong)",
            borderRadius: device === "mobile" ? 20 : device === "tablet" ? 12 : 8,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            transition: `all ${transitionDuration} ease`,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Notch for mobile */}
          {device === "mobile" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 6,
                background: "var(--border-strong)",
                borderRadius: "0 0 8px 8px",
                zIndex: 2,
              }}
              aria-hidden="true"
            />
          )}
          <iframe
            srcDoc={srcdoc}
            title="Page preview"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "inherit",
            }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Open in new tab */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <a
          href={`https://tadaify.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "var(--fg-muted)",
            textDecoration: "none",
          }}
        >
          Open in new tab
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17l10-10M17 7H9M17 7v8" />
          </svg>
        </a>
      </div>
    </aside>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
