/**
 * DesignBackground — Background sub-tab content. DEFAULT sub-tab.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3077-3118
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .fg-help, .tile-grid, .tile, .tile-label,
 *   .wp-{fill,gradient,blur,pattern,image,video}, .pro-badge,
 *   .color-input, .swatch.
 *
 * Tier-gate at SAVE not at DISPLAY (feedback_no_blur_premium_features.md).
 * VE-26b-17: Tooltip uses CURRENT pricing from config, NOT mockup's stale $5/mo.
 * DEC-043: Fill/Gradient/Blur/Pattern are FREE.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-16..18, ECN-26b-09
 */

import { useState } from "react";
import { CREATOR_PRICE_MONTHLY, checkSaveAllowed } from "~/lib/tier-gate";

const BG_TILES = [
  { id: "fill", label: "Fill", gated: false },
  { id: "gradient", label: "Gradient", gated: false },
  { id: "blur", label: "Blur", gated: false },
  { id: "pattern", label: "Pattern", gated: false },
  { id: "image", label: "Image", gated: true },
  { id: "video", label: "Video", gated: true },
] as const;

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
  const [bgColor, setBgColor] = useState("#6366F1");
  const [showGateModal, setShowGateModal] = useState(false);
  const [gatedTile, setGatedTile] = useState<string | null>(null);

  const handleTileClick = (id: string, gated: boolean) => {
    setSelectedBg(id);
    if (gated) {
      // Check tier on tile-pick — DEC: select visually then save-gate
      const action = id === "image" ? "set-bg-image" : "set-bg-video";
      const result = checkSaveAllowed(action, currentTier);
      if (!result.allowed) {
        setGatedTile(id);
        setShowGateModal(true);
        onTierGateTriggered?.();
        return;
      }
    }
    onSave?.("Saved");
  };

  return (
    <>
      <div className="field-group">
        <label className="fg-label">Background style</label>
        <div className="fg-help">
          Pick the vibe behind your blocks. Image and Video live on Creator tier (
          {CREATOR_PRICE_MONTHLY}/mo) — your page still works on Free without them.
        </div>
        <div className="tile-grid">
          {BG_TILES.map((tile) => {
            const isSelected = selectedBg === tile.id;
            return (
              <div
                key={tile.id}
                className={`tile${isSelected ? " selected" : ""}`}
                data-wallpaper-kind={tile.id}
                data-bg-tile={tile.id}
                data-tip={
                  tile.gated ? `Creator tier — ${CREATOR_PRICE_MONTHLY}/mo` : undefined
                }
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={tile.label}
                onClick={() => handleTileClick(tile.id, tile.gated)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTileClick(tile.id, tile.gated);
                  }
                }}
              >
                <div className={`wp-${tile.id}`} style={{ position: "absolute", inset: 0 }} />
                {tile.gated && (
                  <span className="pro-badge" data-pro-badge>
                    💡 Creator
                  </span>
                )}
                <div className="tile-label">{tile.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="fg-label" htmlFor="bg-color">
          Background color
        </label>
        <div className="color-input">
          <input
            id="bg-color"
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            aria-label="Background color hex"
          />
          <span className="swatch" style={{ background: bgColor }} />
        </div>
      </div>

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
            <p
              style={{
                fontSize: 13.5,
                color: "var(--fg-muted)",
                lineHeight: 1.55,
                marginBottom: 20,
              }}
            >
              Upgrade to Creator ({CREATOR_PRICE_MONTHLY}/mo) to use custom{" "}
              {gatedTile === "image" ? "image" : "video"} backgrounds. Fill, Gradient, Blur and
              Pattern styles are available on all tiers.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowGateModal(false)}
              >
                Maybe later
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowGateModal(false)}
              >
                Upgrade to Creator
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
