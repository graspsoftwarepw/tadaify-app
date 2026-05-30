/**
 * BlockEditorScheduleSection — Schedule visibility section for the canonical block editor.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html
 *   - Fully visible + interactive at all tiers (feedback_no_blur_premium_features)
 *   - Creator+ tier badge in section header
 *   - Tier hint shown for Free tier users
 *   - Show from / Hide after datetime-local fields
 *   - Save-time validation triggers TierGateModal (handled in parent)
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import type { TierLevel } from "~/components/TierGateModal";

export interface ScheduleSectionValue {
  scheduleStart: string;
  scheduleEnd: string;
}

export interface ScheduleSectionProps {
  value: ScheduleSectionValue;
  onChange: (next: ScheduleSectionValue) => void;
  tier: TierLevel;
  onUpgradeClick?: () => void;
}

const TIER_RANK: Record<TierLevel, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

export function BlockEditorScheduleSection({
  value,
  onChange,
  tier,
  onUpgradeClick,
}: ScheduleSectionProps): ReactElement {
  const isBelowCreator = TIER_RANK[tier] < TIER_RANK.creator;

  return (
    <section
      className="section tier-gated"
      id="schedule-card"
      data-min-tier="creator"
      aria-labelledby="sched-section-h"
    >
      <div className="section-head">
        <h4 id="sched-section-h">Schedule visibility</h4>
        <span
          className="pill"
          style={{
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "999px",
            background: TIER_RANK[tier] >= TIER_RANK.creator
              ? "rgba(16,185,129,0.12)"
              : "rgba(245,158,11,0.14)",
            color: TIER_RANK[tier] >= TIER_RANK.creator
              ? "#047857"
              : "var(--brand-warm-dark, var(--brand-warm))",
            border: TIER_RANK[tier] >= TIER_RANK.creator
              ? "1px solid rgba(16,185,129,0.35)"
              : "1px solid rgba(245,158,11,0.45)",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
          }}
        >
          {TIER_RANK[tier] >= TIER_RANK.creator ? "Creator ✓" : "Creator"}
        </span>
      </div>
      <div className="section-body">
        <div className="field-row">
          <div className="field">
            <label htmlFor="d-sched-start">Show from</label>
            <input
              id="d-sched-start"
              type="datetime-local"
              value={value.scheduleStart}
              onChange={(e) => onChange({ ...value, scheduleStart: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="d-sched-end">Hide after</label>
            <input
              id="d-sched-end"
              type="datetime-local"
              value={value.scheduleEnd}
              onChange={(e) => onChange({ ...value, scheduleEnd: e.target.value })}
            />
          </div>
        </div>
        <div className="help">
          Leave both empty to keep the block always visible. Useful for limited-time launches.
        </div>
        {isBelowCreator && (
          <div className="tier-hint">
            Schedule visibility unlocks on <strong>Creator</strong> ($7.99/mo). You can fill in the
            dates now — we&apos;ll prompt to upgrade when you save.{" "}
            <button
              type="button"
              style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}
              onClick={onUpgradeClick}
            >
              See plans →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
