/**
 * tier-gate — Utility for checking save-action permissions by tier.
 *
 * Design contract: gate at SAVE not at DISPLAY (feedback_no_blur_premium_features.md).
 * DEC-043: Everything Free for product features. Only COST-bearing surfaces gated.
 * Creator tier: $7.99/mo (DEC-279/287).
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: U4, ECN-26b-09, VE-26b-17
 */

/** Canonical pricing — pulled from config, never hard-coded in UI copy. */
export const CREATOR_PRICE_MONTHLY = "$7.99";

/** Actions that require Creator+ tier — cost-bearing surfaces only. */
const CREATOR_GATED_ACTIONS = new Set([
  "set-bg-image",
  "set-bg-video",
]);

/**
 * Returns true if the given tier is Creator or above.
 * Covers: isCreatorPlus(tier='free') = false, isCreatorPlus(tier='creator') = true
 */
export function isCreatorPlus(tier: string): boolean {
  return tier === "creator" || tier === "pro" || tier === "business";
}

export interface GateResult {
  allowed: boolean;
  reason?: "creator-tier-required";
}

/**
 * Checks whether an action is allowed for the given tier.
 * Called at Save time — NOT at display time.
 *
 * Covers: U4 tests (all 7 cases)
 */
export function checkSaveAllowed(action: string, currentTier: string): GateResult {
  if (CREATOR_GATED_ACTIONS.has(action)) {
    if (!isCreatorPlus(currentTier)) {
      return { allowed: false, reason: "creator-tier-required" };
    }
  }
  return { allowed: true };
}
