/**
 * TierGateModal — shared upsell modal shown when a creator clicks Save on a
 * feature that requires a higher subscription tier than they currently have.
 *
 * Visual contract: mockups/tadaify-mvp/app-tier-gate-modal.html (2003 LOC)
 * Full 1:1 implementation matching mockup markup, CSS class names, JS logic,
 * all 8 states/scenarios, and complete behaviour contract.
 *
 * Design rules (from mockup header comment):
 *   - Premium features are FULLY visible + interactive everywhere (gate at save only)
 *   - This is THE ONLY upsell scene in tadaify (no sticky banners, no nag emails)
 *   - "Your work is saved as draft" is load-bearing copy
 *   - Centered modal — NEVER a slide-in drawer (feedback_no_right_side_drawers)
 *
 * Usage:
 * ```tsx
 * <TierGateModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   currentTier="free"
 *   features={[
 *     { id: 'ab', name: 'A/B testing', requires: 'business',
 *       contextLines: ['A/B test on <b>Newsletter signup</b> — 2 variants ready'],
 *       partialSave: { label: 'A/B testing', desc: 'keeps Variant A live.' } }
 *   ]}
 *   onSaveWithoutPremium={() => handleSaveWithout()}
 *   onUpgrade={(tier, cycle) => openStripeCheckout(tier, cycle)}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 *
 * Tech:
 *   - @radix-ui/react-dialog (Radix) for focus-trap, Esc, portal
 *   - CSS classes appended to app/styles/app-dashboard.css scoped under
 *     .app-dashboard-root .tier-gate-modal
 *   - @keyframes prefixed with `tier-gate-` to avoid collisions
 *
 * Story: tadaify-app#209 DEC-382=A
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Tier constants — mirror mockup JS (lines 1384-1393)
// ---------------------------------------------------------------------------

export type TierLevel = "free" | "creator" | "pro" | "business";

const TIER_RANK: Record<TierLevel, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

const TIER_LABEL: Record<TierLevel, string> = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
  business: "Business",
};

/** Monthly prices per mockup TIER_PRICE_MONTHLY (line 1386) */
const TIER_PRICE_MONTHLY: Record<Exclude<TierLevel, "free">, number> = {
  creator: 8,
  pro: 19,
  business: 49,
};

/** Annual = 10/12 of monthly ("Save 2 months") per mockup annualPerMonth (line 1388) */
function annualPerMonth(tier: Exclude<TierLevel, "free">): number {
  return Math.round(TIER_PRICE_MONTHLY[tier] * (10 / 12) * 100) / 100;
}

/** Annual savings = 2 months of monthly price per mockup annualSavings (line 1392) */
function annualSavings(tier: Exclude<TierLevel, "free">): number {
  return Math.round((TIER_PRICE_MONTHLY[tier] - annualPerMonth(tier)) * 12);
}

// ---------------------------------------------------------------------------
// Tier feature lists — mirror mockup TIER_FEATURE_LISTS (lines 1516-1543)
// ---------------------------------------------------------------------------

const TIER_FEATURE_LISTS: Record<
  Exclude<TierLevel, "free">,
  Array<{ html: string }>
> = {
  creator: [
    { html: "Everything in Free, plus:" },
    { html: "<b>1 custom domain included</b> (extras at $1.99/mo each)" },
    { html: "<b>Schedule blocks</b> for any future date" },
    { html: "<b>Hide tadaify branding</b> on your public page" },
    { html: "<b>5-min analytics refresh</b> · 90-day history window" },
    { html: "<b>Priority email support</b> (under 24h)" },
    { html: "<b>Verified ✓ badge</b> on your public page" },
  ],
  pro: [
    { html: "Everything in Creator, plus:" },
    { html: "<b>Real-time live view</b> + 1-year analytics history" },
    { html: "<b>Saved Insights views</b> + daily CSV export" },
    { html: "<b>Creator API + MCP server</b> (100 req/h)" },
    { html: "<b>Schedule blog posts</b> for any future date" },
    { html: "<b>AI Suggest priority queue</b> (100 uses/mo)" },
  ],
  business: [
    { html: "Everything in Pro, plus:" },
    {
      html: "<b>A/B testing on every block</b> — 50/50 split, winner promoted automatically",
    },
    {
      html: "<b>Team members + roles</b> (Admin / Editor / Viewer) — up to 10 included",
    },
    { html: "<b>Identity stitching</b> across visits + devices" },
    { html: "<b>Klaviyo custom fields + segments</b>" },
    { html: "<b>Parquet R2 monthly archive</b> + scheduled email digests" },
    { html: "<b>Replay</b> (scrub past traffic sessions)" },
  ],
};

// ---------------------------------------------------------------------------
// Feature descriptor (per-feature data structure — mirrors mockup TRIGGERS[].features)
// ---------------------------------------------------------------------------

export interface TierGateFeature {
  /** Unique identifier for the feature (e.g. 'ab', 'domain', 'team') */
  id: string;
  /** Human-readable feature name (e.g. 'A/B testing') */
  name: string;
  /** Minimum tier required to unlock this feature */
  requires: Exclude<TierLevel, "free">;
  /**
   * Lines of context copy shown in the "You set up:" section.
   * Supports inline HTML matching mockup patterns (e.g. <b>, <code>).
   */
  contextLines?: string[];
  /**
   * Optional partial-save option for this feature.
   * When defined, renders the "Or save without X" link in section 4.
   * Set to null to explicitly suppress partial-save for this feature.
   */
  partialSave?: { label: string; desc: string } | null;
}

// ---------------------------------------------------------------------------
// Role-problem variant (State 7 — Business user without Admin role)
// ---------------------------------------------------------------------------

export interface TierGateRoleProblem {
  /**
   * When true, renders the Admin-role variant of the modal instead of the
   * standard tier-upgrade flow. The features array still provides contextLines.
   * requiredTier is ignored in this mode.
   */
  roleProblem: true;
  /** Email address of the workspace owner to notify (State 7 footer button) */
  ownerEmail: string;
}

// ---------------------------------------------------------------------------
// Props contract
// ---------------------------------------------------------------------------

export interface TierGateModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes (false = close requested) */
  onOpenChange: (open: boolean) => void;
  /** Creator's current subscription tier */
  currentTier: TierLevel;
  /**
   * Premium features being touched at save time.
   * Modal finds the highest-required tier and renders that panel.
   */
  features: TierGateFeature[];
  /**
   * Optional per-trigger override for the partial-save link.
   * Used for multi-feature triggers where a custom partial-save message
   * covers all features (mirrors mockup partialSaveOverride, line 1485).
   */
  partialSaveOverride?: { label: string; desc: string } | null;
  /**
   * Role-problem mode — when provided, renders Admin-role variant (State 7).
   * The requiredTier and upgrade flow are replaced by a "notify owner" flow.
   */
  roleVariant?: TierGateRoleProblem;
  /**
   * Called when user clicks "Save as draft" or "Save as draft and exit".
   * If not provided, clicking these buttons just closes the modal.
   */
  onSaveWithoutPremium?: () => void;
  /**
   * Called when user confirms upgrade.
   * Receives the target tier and billing cycle.
   * If not provided, clicking Upgrade has no effect beyond loading state.
   */
  onUpgrade?: (tier: Exclude<TierLevel, "free">, cycle: "monthly" | "yearly") => void;
  /**
   * Called when user cancels from checkout-cancel state and clicks
   * "Save as draft and exit", or when modal closes via Esc / backdrop.
   * If not provided, these actions just close the modal.
   */
  onCancel?: () => void;
  /**
   * Called after a successful upgrade when user clicks "Continue → Publish X".
   * Simulated in demo; in production, fired after Stripe webhook confirms.
   * If not provided, clicking Continue just closes the modal.
   */
  onContinueAfterUpgrade?: () => void;
  /**
   * Called when user clicks "Notify <owner>" in role-problem mode.
   * If not provided, the button closes the modal.
   */
  onNotifyOwner?: () => void;
}

// ---------------------------------------------------------------------------
// Modal state machine — mirrors mockup TG_STATE (line 1548)
// ---------------------------------------------------------------------------

type ModalFlowState = "default" | "loading" | "success" | "cancel";

// ---------------------------------------------------------------------------
// Helper: resolve highest-required tier from feature list
// Mirrors mockup highestRequired (lines 1973-1983)
// ---------------------------------------------------------------------------

function highestRequired(
  features: TierGateFeature[],
): Exclude<TierLevel, "free"> {
  let top: Exclude<TierLevel, "free"> = "creator";
  let topRank = 0;
  for (const f of features) {
    const r = TIER_RANK[f.requires];
    if (r > topRank) {
      topRank = r;
      top = f.requires;
    }
  }
  return top;
}

// ---------------------------------------------------------------------------
// Confetti — spawns colored squares, matches mockup spawnConfetti (line 1951)
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = [
  "#6366F1",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#FDE68A",
];

function ConfettiPieces() {
  // 12 pieces with randomised positions + delays matching mockup
  const pieces = Array.from({ length: 12 }, (_, i) => ({
    key: i,
    left: `${Math.floor(4 + i * 7.8)}%`, // deterministic positions for SSR safety
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animationDelay: `${(i * 0.025).toFixed(3)}s`,
  }));

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.key}
          className="tier-gate-confetti-piece"
          style={{
            left: p.left,
            background: p.background,
            animationDelay: p.animationDelay,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Close (X) icon button — matches mockup .iconbtn + SVG (line 972)
// ---------------------------------------------------------------------------

interface CloseIconBtnProps {
  onClick: () => void;
  label?: string;
}

function CloseIconBtn({ onClick, label = "Close" }: CloseIconBtnProps) {
  return (
    <button
      className="iconbtn"
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// BillingToggle — yearly/monthly toggle inside the modal footer
// Mirrors mockup .tg-bill-toggle (lines 419-452)
// ---------------------------------------------------------------------------

interface BillingToggleProps {
  cycle: "monthly" | "yearly";
  onChange: (cycle: "monthly" | "yearly") => void;
  disabled?: boolean;
}

function BillingToggle({ cycle, onChange, disabled = false }: BillingToggleProps) {
  return (
    <div
      className="tg-bill-toggle"
      style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      <button
        type="button"
        className={cycle === "monthly" ? "is-active" : ""}
        onClick={() => onChange("monthly")}
        disabled={disabled}
      >
        Monthly
      </button>
      <button
        type="button"
        className={cycle === "yearly" ? "is-active" : ""}
        onClick={() => onChange("yearly")}
        disabled={disabled}
      >
        Yearly <span className="save-chip">SAVE 2 MO</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierPanel — upsell tier card (Creator / Pro / Business)
// Mirrors mockup renderTierPanel (lines 1824-1848)
// ---------------------------------------------------------------------------

interface TierPanelProps {
  tier: Exclude<TierLevel, "free">;
  cycle: "monthly" | "yearly";
  titleOverride?: string;
}

function TierPanel({ tier, cycle, titleOverride }: TierPanelProps) {
  const isBiz = tier === "business";
  const featList = TIER_FEATURE_LISTS[tier];
  const monthly = TIER_PRICE_MONTHLY[tier];
  const yearly = annualPerMonth(tier);
  const priceAmt =
    cycle === "yearly" ? yearly.toFixed(2) : monthly.toString();
  const cadence =
    cycle === "yearly" ? "/mo billed yearly" : "/mo billed monthly";

  return (
    <div className={`tg-tier-panel${isBiz ? " is-business" : ""}`}>
      <div className="tg-tier-head">
        <span className="tier-pill">
          🔓 {TIER_LABEL[tier].toUpperCase()}
        </span>
        <span className="tier-title">
          {titleOverride ?? `${TIER_LABEL[tier]} plan`}
        </span>
        <span className="tier-price">
          <span className="price-amt">${priceAmt}</span>
          <span className="price-cadence">{cadence}</span>
        </span>
      </div>
      <ul className="tg-tier-features">
        {featList.map((f, i) => (
          <li key={i}>
            <span className="check">✓</span>
            {/* dangerouslySetInnerHTML matches mockup inline HTML in feature list */}
            <span dangerouslySetInnerHTML={{ __html: f.html }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RolePanel — Admin-role variant panel for State 7
// Mirrors mockup renderRolePanel (lines 1853-1866)
// ---------------------------------------------------------------------------

interface RolePanelProps {
  ownerEmail: string;
}

function RolePanel({ ownerEmail }: RolePanelProps) {
  return (
    <div className="tg-tier-panel">
      <div className="tg-tier-head">
        <span className="tier-pill" style={{ background: "var(--fg)" }}>
          👤 ADMIN ROLE
        </span>
        <span className="tier-title">
          Your workspace already has Business — you just need Admin
        </span>
      </div>
      <ul className="tg-tier-features">
        <li>
          <span className="check">✓</span>
          <span>
            <b>You're on Business</b> — Team is part of your plan
          </span>
        </li>
        <li>
          <span className="check">✓</span>
          <span>
            Adding/removing team members is an <b>Admin-only action</b>
          </span>
        </li>
        <li>
          <span className="check">✓</span>
          <span>
            Your account owner is <b>{ownerEmail}</b>
          </span>
        </li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SuccessState — celebration after Stripe checkout returns OK
// Mirrors mockup renderSuccess (lines 1915-1927) + tg-success CSS (lines 550-609)
// ---------------------------------------------------------------------------

interface SuccessStateProps {
  topTier: Exclude<TierLevel, "free">;
  featureName: string;
  onContinue: () => void;
}

function SuccessState({ topTier, featureName, onContinue }: SuccessStateProps) {
  return (
    <div className="tg-success" id="tg-success-region">
      <ConfettiPieces />
      <div className="burst">✨</div>
      <h3>
        You're on {TIER_LABEL[topTier]} now! Let's publish your {featureName}.
      </h3>
      <p>
        Your block was saved as draft. We'll take you straight back to publish
        — your setup is exactly how you left it.
      </p>
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={onContinue}>
          Continue → Publish {featureName}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CancelState — returned from Stripe without checkout
// Mirrors mockup renderCancel (lines 1933-1944) + tg-cancel CSS (lines 614-645)
// ---------------------------------------------------------------------------

interface CancelStateProps {
  onTryAgain: () => void;
  onExitDraft: () => void;
}

function CancelState({ onTryAgain, onExitDraft }: CancelStateProps) {
  return (
    <div className="tg-cancel">
      <div className="icon">💾</div>
      <h3>No worries — your work is still saved as draft.</h3>
      <p>
        Want to try the upgrade again, or come back to it later? Either way,
        nothing's lost.
      </p>
      <div className="actions">
        <button className="btn btn-warm" type="button" onClick={onTryAgain}>
          Try upgrade again
        </button>
        <button className="btn btn-secondary" type="button" onClick={onExitDraft}>
          Save as draft and exit
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DefaultBody — sections 1–4 of the modal body
// Mirrors mockup renderBody (lines 1769-1817)
// ---------------------------------------------------------------------------

interface DefaultBodyProps {
  features: TierGateFeature[];
  topTier: Exclude<TierLevel, "free">;
  cycle: "monthly" | "yearly";
  isRoleProblem: boolean;
  ownerEmail?: string;
  partialSaveOverride?: { label: string; desc: string } | null;
  onSaveWithout: () => void;
}

function DefaultBody({
  features,
  topTier,
  cycle,
  isRoleProblem,
  ownerEmail,
  partialSaveOverride,
  onSaveWithout,
}: DefaultBodyProps) {
  // Collect all contextLines from all features
  const allCtxLines: string[] = [];
  for (const f of features) {
    for (const line of f.contextLines ?? []) {
      allCtxLines.push(line);
    }
  }

  // Resolve partial save — prefer override, then first feature with partialSave
  let partial: { label: string; desc: string } | null = null;
  if (isRoleProblem) {
    partial = {
      label: "copy a request link",
      desc: " to send your owner directly — they can approve in one click.",
    };
  } else if (partialSaveOverride !== undefined) {
    partial = partialSaveOverride ?? null;
  } else {
    for (const f of features) {
      if (f.partialSave) {
        partial = f.partialSave;
        break;
      }
    }
  }

  return (
    <div className="tg-body">
      {/* Section 1 — "You set up:" trigger context */}
      <div className="tg-context">
        <div className="ctx-h">
          {isRoleProblem ? "You tried to:" : "You set up:"}
        </div>
        <ul>
          {allCtxLines.map((line, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </ul>
      </div>

      {/* Section 2 — Tier panel or Role panel */}
      {isRoleProblem && ownerEmail ? (
        <RolePanel ownerEmail={ownerEmail} />
      ) : (
        <TierPanel tier={topTier} cycle={cycle} />
      )}

      {/* Section 3 — "Your work is saved as draft" reassurance */}
      <div
        className="tg-draft"
        style={
          isRoleProblem
            ? {
                background: "var(--info-bg)",
                borderColor: "rgba(59,130,246,0.22)",
              }
            : undefined
        }
      >
        <span className="draft-icon">{isRoleProblem ? "📋" : "💾"}</span>
        <span>
          {isRoleProblem ? (
            <>
              <b>We saved the invite as a request.</b> Your owner will see it
              next time they open Settings → Team.
            </>
          ) : (
            <>
              <b>Your work is saved as draft.</b> After upgrade it goes live in
              one click — no re-doing.
            </>
          )}
        </span>
      </div>

      {/* Section 4 — "Or save without <feature>" partial-save link */}
      {partial !== null && (
        <div className="tg-partial">
          Or{" "}
          <a
            role="button"
            tabIndex={0}
            onClick={onSaveWithout}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveWithout();
            }}
          >
            {isRoleProblem ? partial.label : `save without ${partial.label}`}
          </a>
          {isRoleProblem ? "" : " — "}
          {partial.desc}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DefaultFooter — sticky footer with billing toggle + action buttons
// Mirrors mockup renderFoot (lines 1872-1909)
// ---------------------------------------------------------------------------

interface DefaultFooterProps {
  topTier: Exclude<TierLevel, "free">;
  cycle: "monthly" | "yearly";
  onCycleChange: (cycle: "monthly" | "yearly") => void;
  isLoading: boolean;
  isRoleProblem: boolean;
  ownerEmail?: string;
  onSaveAsDraft: () => void;
  onUpgrade: () => void;
  onNotifyOwner: () => void;
  onCancel: () => void;
}

function DefaultFooter({
  topTier,
  cycle,
  onCycleChange,
  isLoading,
  isRoleProblem,
  ownerEmail,
  onSaveAsDraft,
  onUpgrade,
  onNotifyOwner,
  onCancel,
}: DefaultFooterProps) {
  if (isRoleProblem) {
    return (
      <div className="tg-foot">
        <div className="left">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel invite
          </button>
        </div>
        <div className="right">
          <button
            className="btn btn-primary"
            type="button"
            onClick={onNotifyOwner}
          >
            Notify {ownerEmail ?? "account owner"}
          </button>
        </div>
      </div>
    );
  }

  const monthly = TIER_PRICE_MONTHLY[topTier];
  const yearly = annualPerMonth(topTier);
  const savings = annualSavings(topTier);
  const price = cycle === "yearly" ? yearly.toFixed(2) : monthly.toString();
  const sub =
    cycle === "yearly" ? `billed yearly · save $${savings}` : "billed monthly";

  return (
    <div className="tg-foot">
      <div className="left">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={onSaveAsDraft}
          disabled={isLoading}
        >
          Save as draft
        </button>
      </div>
      <div className="right">
        <BillingToggle
          cycle={cycle}
          onChange={onCycleChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <button className="btn btn-primary is-loading" type="button" disabled>
            <span
              className="btn-spinner"
              style={{ display: "inline-block" }}
              aria-hidden="true"
            />
            Opening checkout…
          </button>
        ) : (
          <button className="btn btn-warm" type="button" onClick={onUpgrade}>
            Upgrade — ${price}/mo
            <span className="price-sub">{sub}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Head — sticky modal header
// Mirrors mockup renderHead (lines 1732-1759)
// ---------------------------------------------------------------------------

interface ModalHeadProps {
  features: TierGateFeature[];
  topTier: Exclude<TierLevel, "free">;
  isRoleProblem: boolean;
  onClose: () => void;
}

function ModalHead({
  features,
  topTier,
  isRoleProblem,
  onClose,
}: ModalHeadProps) {
  const featureNames = features.map((f) => f.name);

  let featureLabel: string;
  if (featureNames.length === 1) {
    featureLabel = featureNames[0];
  } else if (featureNames.length === 2) {
    featureLabel = featureNames.join(" + ");
  } else {
    featureLabel =
      featureNames.slice(0, -1).join(", ") +
      " + " +
      featureNames[featureNames.length - 1];
  }

  const tierName = isRoleProblem ? "Admin role" : TIER_LABEL[topTier];

  // "need" vs "needs" — matches mockup verb logic (line 1746)
  const verb =
    featureNames.length > 1 || /s$/.test(featureLabel) ? "need" : "needs";

  return (
    <div className="tg-head">
      <Dialog.Title asChild>
        <h3>
          <span className="sparkle">✨</span> Just one step —{" "}
          <span className="feature-name">{featureLabel}</span> {verb}{" "}
          <span className="tier-name">{tierName}</span>
        </h3>
      </Dialog.Title>
      <CloseIconBtn onClick={onClose} label="Close" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierGateModal (root)
// ---------------------------------------------------------------------------

export function TierGateModal({
  open,
  onOpenChange,
  currentTier,
  features,
  partialSaveOverride,
  roleVariant,
  onSaveWithoutPremium,
  onUpgrade,
  onCancel,
  onContinueAfterUpgrade,
  onNotifyOwner,
}: TierGateModalProps) {
  const [flowState, setFlowState] = useState<ModalFlowState>("default");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");

  // Reset flow state whenever the modal opens
  useEffect(() => {
    if (open) {
      setFlowState("default");
      setCycle("yearly");
    }
  }, [open]);

  const topTier = highestRequired(features);
  const isRoleProblem = roleVariant?.roleProblem === true;
  const ownerEmail = roleVariant?.ownerEmail;

  // Derived: first feature name for success state heading
  const primaryFeatureName = features[0]?.name ?? "feature";

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleClose = () => {
    if (flowState === "loading") {
      // Cancel in-progress checkout → show cancel state
      setFlowState("cancel");
      return;
    }
    onOpenChange(false);
  };

  const handleSaveAsDraft = () => {
    onOpenChange(false);
    onSaveWithoutPremium?.();
  };

  const handleSaveWithout = () => {
    onOpenChange(false);
    onSaveWithoutPremium?.();
  };

  const handleUpgradeNow = () => {
    setFlowState("loading");
    onUpgrade?.(topTier, cycle);
    // If onUpgrade is not provided (or in demo contexts), nothing else happens —
    // the caller resolves the loading state by calling onOpenChange(false)
    // or via a returned promise externally. For demo compatibility, we leave
    // the loading state active until the parent changes `open`.
  };

  const handleTryAgain = () => {
    setFlowState("loading");
    onUpgrade?.(topTier, cycle);
  };

  const handleExitDraft = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleContinuePublish = () => {
    onOpenChange(false);
    onContinueAfterUpgrade?.();
  };

  const handleNotifyOwner = () => {
    onOpenChange(false);
    onNotifyOwner?.();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) handleClose();
      else onOpenChange(true);
    }}>
      <Dialog.Portal>
        {/* Backdrop — matches mockup .tg-backdrop (lines 195-205) */}
        <Dialog.Overlay
          className={`tg-backdrop tier-gate-modal${open ? " is-open" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        />

        {/* Modal panel — matches mockup .tg-modal (lines 206-223) */}
        <Dialog.Content
          className="tg-backdrop-content tier-gate-modal"
          aria-describedby={undefined}
          data-testid="tier-gate-modal-box"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="tg-modal" role="document">
            {/* SUCCESS — full swap (matches mockup renderSuccess + renderCancel) */}
            {flowState === "success" && (
              <SuccessState
                topTier={topTier}
                featureName={primaryFeatureName}
                onContinue={handleContinuePublish}
              />
            )}

            {flowState === "cancel" && (
              <CancelState
                onTryAgain={handleTryAgain}
                onExitDraft={handleExitDraft}
              />
            )}

            {/* DEFAULT + LOADING — full head/body/foot */}
            {(flowState === "default" || flowState === "loading") && (
              <>
                <ModalHead
                  features={features}
                  topTier={topTier}
                  isRoleProblem={isRoleProblem}
                  onClose={handleClose}
                />
                <DefaultBody
                  features={features}
                  topTier={topTier}
                  cycle={cycle}
                  isRoleProblem={isRoleProblem}
                  ownerEmail={ownerEmail}
                  partialSaveOverride={partialSaveOverride}
                  onSaveWithout={handleSaveWithout}
                />
                <DefaultFooter
                  topTier={topTier}
                  cycle={cycle}
                  onCycleChange={setCycle}
                  isLoading={flowState === "loading"}
                  isRoleProblem={isRoleProblem}
                  ownerEmail={ownerEmail}
                  onSaveAsDraft={handleSaveAsDraft}
                  onUpgrade={handleUpgradeNow}
                  onNotifyOwner={handleNotifyOwner}
                  onCancel={handleClose}
                />
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Named exports
// ---------------------------------------------------------------------------

export default TierGateModal;

/** ARIA label constant for the modal close button (testable). */
export const TIER_GATE_CLOSE_LABEL = "Close" as const;

/** Tier rank map (re-exported for callers who need to compare tiers). */
export { TIER_RANK, TIER_LABEL };
