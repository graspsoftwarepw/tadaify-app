/**
 * DesignBackground — Background sub-tab content. DEFAULT sub-tab.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3077-3120
 *
 * Contains:
 *   - Background style tile-grid: Fill / Gradient / Blur / Pattern / Image / Video
 *   - Image + Video tiles show Creator-tier badge (cost: bandwidth/storage)
 *   - Background color input field with hex + swatch
 *
 * Tier-gate: at SAVE not at DISPLAY (feedback_no_blur_premium_features.md).
 * VE-26b-17: Tooltip uses CURRENT PRICING from config ($7.99), NOT mockup's stale $5/mo.
 * DEC-043: Fill/Gradient/Blur/Pattern are FREE.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-16, VE-26b-17, VE-26b-18, ECN-26b-09
 */

import { useState } from "react";
import { CREATOR_PRICE_MONTHLY, checkSaveAllowed } from "~/lib/tier-gate";

interface BackgroundTile {
  id: string;
  label: string;
  creatorGated?: boolean;
  preview: React.ReactNode;
}

const BACKGROUND_TILES: BackgroundTile[] = [
  {
    id: "fill",
    label: "Fill",
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "#6366F1",
          borderRadius: "6px 6px 0 0",
        }}
      />
    ),
  },
  {
    id: "gradient",
    label: "Gradient",
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "linear-gradient(135deg, #6366F1 0%, #a78bfa 100%)",
          borderRadius: "6px 6px 0 0",
        }}
      />
    ),
  },
  {
    id: "blur",
    label: "Blur",
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "radial-gradient(ellipse at 30% 50%, #6366F155 0%, transparent 60%), linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%)",
          borderRadius: "6px 6px 0 0",
        }}
      />
    ),
  },
  {
    id: "pattern",
    label: "Pattern",
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "repeating-linear-gradient(45deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 8px)",
          borderRadius: "6px 6px 0 0",
        }}
      />
    ),
  },
  {
    id: "image",
    label: "Image",
    creatorGated: true,
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    ),
  },
  {
    id: "video",
    label: "Video",
    creatorGated: true,
    preview: (
      <div
        style={{
          width: "100%",
          height: 44,
          background: "linear-gradient(135deg, #1e293b 0%, #374151 100%)",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    ),
  },
];

interface DesignBackgroundProps {
  currentTier?: string;
  onSave?: (toast: string) => void;
  onTierGateTriggered?: () => void;
}

export function DesignBackground({
  currentTier = "free",
  onSave,
  onTierGateTriggered,
}: DesignBackgroundProps) {
  const [selectedBg, setSelectedBg] = useState<string>("fill");
  const [colorHex, setColorHex] = useState("#6366F1");
  const [showGateModal, setShowGateModal] = useState(false);
  const [gatedTile, setGatedTile] = useState<string | null>(null);

  const handleTileClick = (tileId: string, isGated?: boolean) => {
    setSelectedBg(tileId);
    // Visually select tile immediately (not gated at display)
  };

  const handleSave = () => {
    const action =
      selectedBg === "image"
        ? "set-bg-image"
        : selectedBg === "video"
        ? "set-bg-video"
        : "set-bg-fill";

    const result = checkSaveAllowed(action, currentTier);
    if (!result.allowed) {
      setGatedTile(selectedBg);
      setShowGateModal(true);
      onTierGateTriggered?.();
      return;
    }
    onSave?.("Saved");
  };

  return (
    <section data-panel="background" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Background
      </h3>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18, lineHeight: 1.5 }}>
        Choose how your page background looks. Free styles apply immediately.
      </p>

      {/* 6-tile style grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {BACKGROUND_TILES.map((tile) => {
          const isSelected = selectedBg === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              data-bg-tile={tile.id}
              onClick={() => handleTileClick(tile.id, tile.creatorGated)}
              style={{
                border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                borderRadius: 10,
                background: isSelected
                  ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
                  : "var(--bg-elevated)",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                position: "relative",
                transition: "border-color .15s",
              }}
              aria-pressed={isSelected}
              aria-label={tile.label}
            >
              {tile.preview}
              <div style={{ padding: "8px 10px", textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {tile.label}
                  {tile.creatorGated && (
                    <span
                      data-pro-badge
                      title={`Image/Video backgrounds require Creator tier — ${CREATOR_PRICE_MONTHLY}/mo`}
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "#fef3c7",
                        color: "#92400e",
                        borderRadius: 4,
                        padding: "1px 5px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      💡 Creator
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Background color input */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 18px",
          background: "var(--bg-elevated)",
          marginBottom: 20,
        }}
      >
        <label
          style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", display: "block", marginBottom: 10 }}
        >
          Background color
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            style={{
              width: 36,
              height: 36,
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 2,
              cursor: "pointer",
              background: "none",
            }}
            aria-label="Background color swatch"
          />
          <input
            type="text"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            maxLength={7}
            style={{
              width: 90,
              padding: "7px 10px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              fontFamily: "monospace",
            }}
            aria-label="Background color hex"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        style={{
          padding: "9px 22px",
          border: "none",
          borderRadius: 8,
          background: "var(--brand-primary)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        Apply
      </button>

      {/* Tier-gate modal */}
      {showGateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Creator tier required"
          data-tier-gate-modal
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowGateModal(false)}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              borderRadius: 14,
              padding: "28px 32px",
              maxWidth: 420,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", marginBottom: 8 }}>
              {gatedTile === "image" ? "Image" : "Video"} backgrounds are Creator-tier
            </div>
            <p style={{ fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 20 }}>
              Upgrade to Creator ({CREATOR_PRICE_MONTHLY}/mo) to use custom{" "}
              {gatedTile === "image" ? "image" : "video"} backgrounds. Free, Gradient, and Pattern
              styles are available on all tiers.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowGateModal(false)}
                style={{
                  padding: "8px 18px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "transparent",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => setShowGateModal(false)}
                style={{
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: 8,
                  background: "var(--brand-primary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Upgrade to Creator
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
