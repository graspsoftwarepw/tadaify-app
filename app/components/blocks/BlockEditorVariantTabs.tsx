/**
 * BlockEditorVariantTabs — A/B variant tab switcher for the canonical block editor.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html
 *   - Always-visible Variant A | B tabs (DEC-093)
 *   - Variant B carries 🔒 Business badge for non-Business tiers
 *   - ab-section-chip state="available"|"active" based on diff count
 *   - Inline tier callout when B is active on non-Business tier
 *   - Helper bar when B is active (Copy A→B, Reset B to A)
 *   - Win-criteria footnote when B has differing fields
 *   - Educational explainer always visible
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import type { TierLevel } from "~/components/TierGateModal";

export interface VariantTabsProps {
  /** Currently active variant tab */
  activeVariant: "A" | "B";
  /** Callback when variant tab changes */
  onVariantChange: (v: "A" | "B") => void;
  /** Count of fields that differ between A and B */
  abDiffCount: number;
  /** Current creator tier */
  tier: TierLevel;
  /** Callback to copy A state into B */
  onCopyAtoB: () => void;
  /** Callback to reset B to match A */
  onResetBtoA: () => void;
  /** Callback when upgrade CTA clicked */
  onUpgradeClick?: () => void;
}

export function BlockEditorVariantTabs({
  activeVariant,
  onVariantChange,
  abDiffCount,
  tier,
  onCopyAtoB,
  onResetBtoA,
  onUpgradeClick,
}: VariantTabsProps): ReactElement {
  const isBusinessTier = tier === "business";
  const chipState = abDiffCount > 0 ? "active" : "available";
  const chipLabel = abDiffCount > 0 ? `A/B active · ${abDiffCount} diff${abDiffCount === 1 ? "" : "s"}` : "A/B test available";
  const showTierCallout = activeVariant === "B" && !isBusinessTier;
  const showHelperBar = activeVariant === "B";
  const showWinNote = abDiffCount > 0 && isBusinessTier;

  return (
    <>
      {/* Section head row: "Content" label + A/B chip + A/B tabs + Visible toggle (outside this component) */}
      <div className="section-head-ab-row" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {/* A/B section identity chip */}
        <span
          className="ab-section-chip"
          data-state={chipState}
          title="Edit Variant B to start an A/B test — auto-detected at save"
        >
          <span className="dot" aria-hidden="true" />
          <span className="ab-section-chip-label">{chipLabel}</span>
        </span>

        {/* A/B tabs */}
        <div className="ab-tabs" role="tablist" aria-label="A/B variant tabs">
          <button
            type="button"
            className={`ab-tab${activeVariant === "A" ? " is-active" : ""}`}
            data-variant="A"
            role="tab"
            aria-selected={activeVariant === "A"}
            onClick={() => onVariantChange("A")}
          >
            <span className="ab-tab-pill ab-tab-pill-a">A</span>
            <span className="ab-tab-label">Variant A</span>
          </button>
          <button
            type="button"
            className={`ab-tab${activeVariant === "B" ? " is-active" : ""}${!isBusinessTier ? " is-locked" : ""}`}
            data-variant="B"
            role="tab"
            aria-selected={activeVariant === "B"}
            onClick={() => onVariantChange("B")}
          >
            <span className="ab-tab-pill ab-tab-pill-b">B</span>
            <span className="ab-tab-label">Variant B</span>
            {!isBusinessTier && (
              <span className="ab-tab-lock" aria-hidden="true">🔒 Business</span>
            )}
          </button>
        </div>
      </div>

      {/* Educational explainer — always visible */}
      <div className="ab-edu">
        <strong>A/B test</strong> — On <strong>Business</strong>, edit Variant B to test two versions of this block.
        Traffic splits 50/50 and the winner promotes automatically.{" "}
        {!isBusinessTier && (
          <span>
            You can explore Variant B freely —{" "}
            <button
              type="button"
              style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}
              onClick={onUpgradeClick}
            >
              upgrade to Business
            </button>{" "}
            to run real splits.
          </span>
        )}
      </div>

      {/* Inline tier callout when B is active and tier is below Business */}
      {showTierCallout && (
        <div className="ab-tier-callout" role="note">
          <span className="ico" aria-hidden="true">🔒</span>
          <div className="body">
            <div className="ttl">Variant B is part of A/B testing — Business plan</div>
            <div className="copy">
              Edit Variant B freely to preview how an A/B test looks.
              When you save, we&apos;ll prompt to upgrade to <strong>Business</strong> ($49.99/mo)
              to actually run the 50/50 split.
            </div>
            <button
              type="button"
              className="cta"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-block", marginTop: "6px", fontSize: "12px", fontWeight: 600, color: "var(--brand-warm-dark, var(--brand-warm))", textDecoration: "none" }}
              onClick={onUpgradeClick}
            >
              Upgrade to Business →
            </button>
          </div>
        </div>
      )}

      {/* Helper bar when active tab is B */}
      {showHelperBar && (
        <div className="ab-helper">
          <div className="ab-helper-text">
            {abDiffCount === 0
              ? "Variant B is a copy of A. Edit any field below to make it differ."
              : `Variant B differs in ${abDiffCount} field${abDiffCount === 1 ? "" : "s"}.`}
          </div>
          <div className="ab-helper-actions">
            <button
              type="button"
              className="ab-helper-btn"
              onClick={onCopyAtoB}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy A → B
            </button>
            <button
              type="button"
              className="ab-helper-btn ab-helper-btn-link"
              onClick={onResetBtoA}
            >
              Reset B to match A
            </button>
          </div>
        </div>
      )}

      {/* Win-criteria footnote when B has differing fields and tier is Business */}
      {showWinNote && (
        <div className="ab-win-note" role="note">
          <span className="ico" aria-hidden="true">📊</span>
          <span>
            When you save, traffic will split <strong>50/50</strong> across{" "}
            <strong>{abDiffCount}</strong> differing field{abDiffCount === 1 ? "" : "s"}.
            The winning variant auto-promotes after <strong>7 days or 1,000 clicks</strong>.
          </span>
        </div>
      )}
    </>
  );
}
