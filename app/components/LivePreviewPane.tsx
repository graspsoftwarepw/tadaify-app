/**
 * LivePreviewPane — right-side live preview column.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~3529-3621
 * (`<aside class="preview">`). Styled via Pass 1 CSS in
 * app/styles/app-dashboard.css (`.app-dashboard-root aside.preview` and
 * descendants). Hidden on mobile/tablet by `@media (min-width: 1180px)`.
 *
 * Structure (mockup-verbatim class names plus the task-spec aliases
 * `preview-stats`, `preview-title`, `preview-refresh`, `preview-foot`,
 * `preview-device-tabs` so downstream consumers and tests can target either):
 *   .preview                      — outer <aside>
 *     .preview-head
 *       .preview-title <h3>       — "Live preview"
 *       .refresh.preview-refresh  — reload button (reloads inner iframe)
 *       .preview-stats            — "Views today: —" · "Clicks: —" · live chip
 *     .device-toggle.preview-device-tabs
 *       .segmented.narrow         — radiogroup with three .seg buttons
 *     .preview-stage
 *       .preview-frame.is-<dev>   — frame; contains iframe src=/<handle>
 *         (placeholder when not published)
 *     .preview-foot
 *       <a> "Open in new tab"     — target=_blank → /<handle>
 *
 * Story: F-APP-DASHBOARD-001a (#171). Pass 5 of dashboard-mockup-fidelity.
 */

import { useEffect, useRef, useState } from "react";

export type DeviceSize = "mobile" | "tablet" | "desktop";

interface LivePreviewPaneProps {
  handle: string;
  /** Optional — only used when isPublished is false and the iframe falls back to a placeholder. */
  displayName?: string | null;
  bio?: string | null;
  isPublished: boolean;
  /** Initial device when uncontrolled. */
  initialDevice?: DeviceSize;
  /** Controlled device. When provided, the component reflects this value and calls onDeviceChange instead of holding internal state. */
  device?: DeviceSize;
  onDeviceChange?: (device: DeviceSize) => void;
  /** Optional real metrics. Rendered as "—" when undefined. */
  viewsToday?: number;
  clicks?: number;
}

const DEVICES: ReadonlyArray<{ id: DeviceSize; label: string }> = [
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
  { id: "desktop", label: "Desktop" },
];

function DeviceIcon({ device }: { device: DeviceSize }) {
  if (device === "mobile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    );
  }
  if (device === "tablet") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function LivePreviewPane({
  handle,
  displayName,
  bio,
  isPublished,
  initialDevice = "mobile",
  device: controlledDevice,
  onDeviceChange,
  viewsToday,
  clicks,
}: LivePreviewPaneProps) {
  const isControlled = controlledDevice !== undefined;
  const [internalDevice, setInternalDevice] = useState<DeviceSize>(initialDevice);
  const device = isControlled ? (controlledDevice as DeviceSize) : internalDevice;

  const handleDeviceChange = (next: DeviceSize) => {
    if (!isControlled) {
      setInternalDevice(next);
    }
    onDeviceChange?.(next);
  };

  // Iframe reload counter — bumping it rebuilds the iframe src and forces a refetch.
  const [reloadNonce, setReloadNonce] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Reduced-motion → kill the device-frame transition.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq) setPrefersReducedMotion(mq.matches);
  }, []);

  const publicHref = `/${handle}`;
  const publicHrefWithNonce =
    reloadNonce === 0 ? publicHref : `${publicHref}?_r=${reloadNonce}`;

  const handleRefresh = () => {
    // Prefer in-place iframe reload so the URL state and scroll resets cleanly.
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.location.reload();
        return;
      } catch {
        // Cross-origin or detached — fall through to nonce bump.
      }
    }
    setReloadNonce((n) => n + 1);
  };

  const viewsLabel = typeof viewsToday === "number" ? viewsToday.toLocaleString() : "—";
  const clicksLabel = typeof clicks === "number" ? clicks.toLocaleString() : "—";

  return (
    <aside
      className="preview"
      data-testid="live-preview-pane"
      aria-label="Live preview"
      data-device={device}
    >
      <div className="preview-head">
        <h3 className="preview-title">Live preview</h3>
        <button
          type="button"
          className="refresh preview-refresh"
          data-tip="Reload preview"
          onClick={handleRefresh}
          aria-label="Reload preview"
        >
          <svg
            width={12}
            height={12}
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

        <div className="preview-stats" role="group" aria-label="Preview stats">
          <span className="preview-stat">Views today: {viewsLabel}</span>
          <span className="preview-stat">Clicks: {clicksLabel}</span>
          <span
            className={`chip preview-publish-chip ${isPublished ? "is-live" : "is-draft"}`}
            data-state={isPublished ? "live" : "not-published"}
          >
            <span className="live-dot" aria-hidden="true" />
            {isPublished ? "Live" : "Not published"}
          </span>
        </div>
      </div>

      <div className="device-toggle preview-device-tabs">
        <div
          className="segmented narrow"
          role="radiogroup"
          aria-label="Preview device"
          data-testid="device-toggle"
        >
          {DEVICES.map((d) => {
            const active = device === d.id;
            return (
              <button
                key={d.id}
                type="button"
                className={`seg${active ? " active" : ""}`}
                data-device={d.id}
                role="radio"
                aria-checked={active}
                onClick={() => handleDeviceChange(d.id)}
              >
                <DeviceIcon device={d.id} />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="preview-stage">
        <div
          className={`preview-frame is-${device}`}
          data-testid="preview-frame"
          data-device={device}
          style={
            prefersReducedMotion ? { transition: "none" } : undefined
          }
        >
          {device === "mobile" && <div className="pv-notch" aria-hidden="true" />}
          {device === "desktop" && (
            <div className="pv-chrome" aria-hidden="true">
              <span className="dot r" />
              <span className="dot y" />
              <span className="dot g" />
              <span className="url">tadaify.com/{handle}</span>
            </div>
          )}

          {isPublished ? (
            <iframe
              key={reloadNonce}
              ref={iframeRef}
              className="pv-iframe"
              src={publicHrefWithNonce}
              title={`Public page preview for @${handle}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "inherit",
                background: "#fff",
              }}
            />
          ) : (
            <PreviewPlaceholder handle={handle} displayName={displayName ?? null} bio={bio ?? null} />
          )}
        </div>
      </div>

      <div className="preview-foot">
        <a
          className="btn btn-ghost btn-sm preview-open"
          href={publicHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in new tab
          <svg
            width={12}
            height={12}
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

/**
 * In-DOM placeholder for unpublished pages. Mirrors the mockup `.pv-inner`
 * structure so Pass 1 CSS theming keeps working even before the page is live.
 */
function PreviewPlaceholder({
  handle,
  displayName,
  bio,
}: {
  handle: string;
  displayName: string | null;
  bio: string | null;
}) {
  const initial = (displayName || handle || "?").charAt(0).toUpperCase();
  return (
    <div
      className="pv-inner"
      data-wallpaper="fill"
      data-theme=""
      data-btn="fill"
      style={{ ["--pv-bg-color" as string]: "#EEF2FF" }}
    >
      <div className="pv-body">
        <div className="pv-avatar">{initial}</div>
        <div className="pv-name">{displayName || `@${handle}`}</div>
        {bio ? <div className="pv-bio">{bio}</div> : null}
        <div className="pv-handle">tadaify.com/{handle}</div>
        <div className="pv-empty" style={{ marginTop: 16, fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">
            ✨
          </div>
          <div style={{ fontWeight: 600, color: "#4B5563" }}>Coming soon</div>
          <div style={{ marginTop: 4 }}>Add blocks to customise your page</div>
        </div>
      </div>
    </div>
  );
}
