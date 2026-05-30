/**
 * DesignProfile — Profile sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3016-3074
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .fg-help, .tile-grid, .tile, .tile-label,
 *   .segmented, .seg, .color-input, .swatch.
 *
 * Visual only — no persistence in this slice.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-13..15
 */

import { useState } from "react";

const LAYOUTS = [
  { id: "classic", label: "Classic Card" },
  { id: "hero", label: "Hero Cover" },
  { id: "sidebar", label: "Sidebar Compact" },
] as const;

type TitleKind = "text" | "logo";
type TitleSize = "S" | "M" | "L";

interface DesignProfileProps {
  onSave?: (toast: string) => void;
}

export function DesignProfile({ onSave }: DesignProfileProps) {
  const [layout, setLayout] = useState<string>("classic");
  const [titleKind, setTitleKind] = useState<TitleKind>("text");
  const [titleSize, setTitleSize] = useState<TitleSize>("M");
  const [titleColor, setTitleColor] = useState("#111827");

  const handleLayoutPick = (id: string) => {
    setLayout(id);
    onSave?.("Saved");
  };

  return (
    <>
      {/* Profile card layout */}
      <div className="field-group">
        <label className="fg-label">Profile card layout</label>
        <div className="fg-help">
          Choose how your avatar and name appear at the top of your page.
        </div>
        <div
          className="tile-grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 }}
        >
          {/* Classic Card preview */}
          <div
            className={`tile${layout === "classic" ? " selected" : ""}`}
            data-profile-layout="classic"
            role="button"
            tabIndex={0}
            aria-pressed={layout === "classic"}
            onClick={() => handleLayoutPick("classic")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLayoutPick("classic");
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--hero-gradient)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  background: "var(--fg-muted)",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 3,
                  background: "var(--fg-subtle)",
                  opacity: 0.4,
                }}
              />
            </div>
            <div className="tile-label">Classic Card</div>
          </div>

          {/* Hero Cover preview */}
          <div
            className={`tile${layout === "hero" ? " selected" : ""}`}
            data-profile-layout="hero"
            role="button"
            tabIndex={0}
            aria-pressed={layout === "hero"}
            onClick={() => handleLayoutPick("hero")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLayoutPick("hero");
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                gap: 4,
                padding: 8,
                background:
                  "linear-gradient(160deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--hero-gradient)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 5,
                  borderRadius: 3,
                  background: "var(--fg-muted)",
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="tile-label">Hero Cover</div>
          </div>

          {/* Sidebar Compact preview */}
          <div
            className={`tile${layout === "sidebar" ? " selected" : ""}`}
            data-profile-layout="sidebar"
            role="button"
            tabIndex={0}
            aria-pressed={layout === "sidebar"}
            onClick={() => handleLayoutPick("sidebar")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLayoutPick("sidebar");
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                padding: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--hero-gradient)",
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    borderRadius: 3,
                    background: "var(--fg-muted)",
                    opacity: 0.5,
                  }}
                />
                <div
                  style={{
                    width: "70%",
                    height: 3,
                    borderRadius: 3,
                    background: "var(--fg-subtle)",
                    opacity: 0.4,
                  }}
                />
              </div>
            </div>
            <div className="tile-label">Sidebar Compact</div>
          </div>
        </div>
      </div>

      {/* Title styling row */}
      <div className="field-group" style={{ marginTop: 16 }}>
        <label className="fg-label">Title styling</label>
        <div className="fg-help">Font, size, and color — in one row.</div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          {/* Kind: Text / Logo */}
          <div className="segmented" style={{ flexShrink: 0 }}>
            <button
              type="button"
              className={`seg${titleKind === "text" ? " active" : ""}`}
              onClick={() => setTitleKind("text")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={14}
                height={14}
                aria-hidden="true"
              >
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="12" y1="4" x2="12" y2="20" />
                <line x1="9" y1="20" x2="15" y2="20" />
              </svg>
              Text
            </button>
            <button
              type="button"
              className={`seg${titleKind === "logo" ? " active" : ""}`}
              onClick={() => setTitleKind("logo")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={14}
                height={14}
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Logo
            </button>
          </div>

          {/* Size: S / M / L */}
          <div className="segmented" style={{ flexShrink: 0 }}>
            {(["S", "M", "L"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`seg${titleSize === s ? " active" : ""}`}
                onClick={() => setTitleSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Color */}
          <div className="color-input" style={{ width: 120, flexShrink: 0 }}>
            <input
              type="text"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              style={{ fontSize: 12 }}
              aria-label="Title color hex"
            />
            <span className="swatch" style={{ background: titleColor }} />
          </div>
        </div>
      </div>
    </>
  );
}
