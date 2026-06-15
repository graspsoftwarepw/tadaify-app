/**
 * Typed mock seam for the shared TierGate upsell modal. Mirrors TRIGGERS,
 * TIER_FEATURE_LISTS, and the pricing constants in
 * mockups/tadaify-mvp/app-tier-gate-modal.html. This is the single upsell scene
 * shown at Save when a feature needs a higher tier (premium features stay fully
 * visible everywhere else — the gate happens only here, at save).
 *
 * @implements fr-tier-gate-modal
 */

export type Tier = "free" | "creator" | "pro" | "business";

export const TIER_RANK: Record<Tier, number> = { free: 0, creator: 1, pro: 2, business: 3 };
export const TIER_LABEL: Record<Tier, string> = { free: "Free", creator: "Creator", pro: "Pro", business: "Business" };
/** Canonical monthly prices (per pricing.html, see mockup header). */
export const TIER_PRICE_MONTHLY: Record<Tier, number> = { free: 0, creator: 7.99, pro: 19.99, business: 49.99 };

/** Yearly bills 10 months' worth (2 free) — the mockup's "Save 2 mo". */
export const yearlyMonthly = (tier: Tier): number => (TIER_PRICE_MONTHLY[tier] * 10) / 12;
/** Dollars saved per year by choosing annual over monthly. */
export const yearlySaving = (tier: Tier): number => TIER_PRICE_MONTHLY[tier] * 2;

export type GatedFeature = {
  id: string;
  name: string;
  requires: Tier;
  contextLines: string[];
};

export type PartialSave = { label: string; desc: string } | null;

export type Trigger = {
  key: string;
  /** Short label for the demo trigger switcher. */
  demoLabel: string;
  currentTier: Tier;
  /** "You set up:" vs "You tried to:". */
  contextHeading: string;
  features: GatedFeature[];
  partialSave: PartialSave;
  /** A tier already covers everything — toast, no modal. */
  alreadyCovered?: boolean;
  toast?: string;
  /** Tier is fine, but the user lacks an Admin role. Different framing. */
  roleProblem?: boolean;
  /** Draft reassurance copy (block-specific). */
  draftCopy: string;
};

export const triggersFixture = (): Trigger[] => [
  {
    key: "ab",
    demoLabel: "A/B testing",
    currentTier: "free",
    contextHeading: "You set up:",
    features: [
      {
        id: "ab",
        name: "A/B testing",
        requires: "business",
        contextLines: [
          "A/B test on **Newsletter signup** block — **2 variants** ready",
          "Variant B differs in: `heading`, `CTA copy`",
        ],
      },
    ],
    partialSave: { label: "A/B testing", desc: "keeps your block live with just Variant A. You can add Variant B back any time." },
    draftCopy: "After upgrade it goes live in one click — no re-doing.",
  },
  {
    key: "domain",
    demoLabel: "Custom domain",
    currentTier: "free",
    contextHeading: "You set up:",
    features: [
      {
        id: "domain",
        name: "Custom domain",
        requires: "creator",
        contextLines: [
          "Custom domain `links.alexandra.com` for your tadaify page",
          "Plus the optional **$1.99/mo extra-domain add-on** for your second domain",
        ],
      },
    ],
    partialSave: null,
    draftCopy: "After upgrade your custom domain is one DNS step away.",
  },
  {
    key: "team",
    demoLabel: "Team invite",
    currentTier: "pro",
    contextHeading: "You set up:",
    features: [
      {
        id: "team",
        name: "Team member invite",
        requires: "business",
        contextLines: ["Invite **maya@example.com** as **Editor**", "Role: read + edit any block, no billing access"],
      },
    ],
    partialSave: null,
    draftCopy: "After upgrade your team invite sends in one click.",
  },
  {
    key: "schedule",
    demoLabel: "Far-future schedule",
    currentTier: "free",
    contextHeading: "You set up:",
    features: [
      {
        id: "schedule",
        name: "Scheduling beyond 7 days",
        requires: "creator",
        contextLines: [
          "Schedule **Spring Drops** block to publish on `Jan 15, 2027`",
          "That's **4 months ahead** — Free schedules up to 7 days out",
        ],
      },
    ],
    partialSave: { label: "Scheduling", desc: "publishes the block right now instead. You can re-schedule any time after upgrade." },
    draftCopy: "After upgrade your scheduled date is honoured automatically.",
  },
  {
    key: "klaviyo",
    demoLabel: "Klaviyo fields",
    currentTier: "pro",
    contextHeading: "You set up:",
    features: [
      {
        id: "klaviyo",
        name: "Klaviyo custom fields",
        requires: "business",
        contextLines: [
          "Newsletter block syncing to **Klaviyo**",
          "Custom field mapping: `signup_source → tadaify_block_id`",
          "Auto-add to segment: `spring-launch-2026`",
        ],
      },
    ],
    partialSave: { label: "custom fields", desc: "syncs only the email + name to Klaviyo (default fields). Custom mapping waits until upgrade." },
    draftCopy: "After upgrade your custom mapping syncs automatically.",
  },
  {
    key: "multi",
    demoLabel: "Multi-feature",
    currentTier: "free",
    contextHeading: "You set up:",
    features: [
      { id: "ab", name: "A/B testing", requires: "business", contextLines: ["A/B test on **Newsletter signup** — 2 variants ready (needs **Business**)"] },
      { id: "domain", name: "Custom domain", requires: "creator", contextLines: ["Custom domain `links.alexandra.com` for your tadaify page (needs **Creator**)"] },
      { id: "schedule", name: "Scheduling beyond 7 days", requires: "creator", contextLines: ["Schedule visibility from **Jan 15 → Feb 28** (needs **Creator**)"] },
    ],
    partialSave: { label: "A/B testing", desc: "Variant A goes live; you keep the custom domain + schedule for after upgrade." },
    draftCopy: "After upgrade everything you staged goes live in one click.",
  },
  {
    key: "already",
    demoLabel: "Already covered (toast)",
    currentTier: "business",
    contextHeading: "You set up:",
    features: [{ id: "ab", name: "A/B testing", requires: "business", contextLines: ["A/B test live"] }],
    partialSave: null,
    alreadyCovered: true,
    toast: "All set — A/B test is live",
    draftCopy: "",
  },
  {
    key: "admin-required",
    demoLabel: "Admin-role gate",
    currentTier: "business",
    contextHeading: "You tried to:",
    roleProblem: true,
    features: [
      {
        id: "team-add",
        name: "Adding team members",
        requires: "business",
        contextLines: ["Invite **maya@example.com** as **Editor**", "Workspace: **alexandra-creative** · 6 of 10 seats used"],
      },
    ],
    partialSave: { label: "request link", desc: "to send your owner directly — they can approve in one click." },
    draftCopy: "We saved the invite as a request. Your owner will see it in Settings → Team.",
  },
];

/** Per-tier feature catalogue shown in the upgrade panel (mirrors pricing.html). */
export const tierFeatureLists = (): Record<"creator" | "pro" | "business", string[]> => ({
  creator: [
    "Everything in Free, plus:",
    "**1 custom domain included** (extras at $1.99/mo each)",
    "**Schedule blocks** for any future date",
    "**Hide tadaify branding** on your public page",
    "**5-min analytics refresh** · 90-day history window",
    "**Priority email support** (under 24h)",
    "**Verified ✓ badge** on your public page",
  ],
  pro: [
    "Everything in Creator, plus:",
    "**Real-time live view** + 1-year analytics history",
    "**Saved Insights views** + daily CSV export",
    "**Creator API + MCP server** (100 req/h)",
    "**Schedule blog posts** for any future date",
    "**AI Suggest priority queue** (100 uses/mo)",
  ],
  business: [
    "Everything in Pro, plus:",
    "**A/B testing on every block** — 50/50 split, winner promoted automatically",
    "**Team members + roles** (Admin / Editor / Viewer) — up to 10 included",
    "**Identity stitching** across visits + devices",
    "**Klaviyo custom fields + segments**",
    "**Parquet R2 monthly archive** + scheduled email digests",
    "**Replay** (scrub past traffic sessions)",
  ],
});

/** The four review-only checkout states reproduced behind the in-view switcher. */
export type TierGateState = "default" | "loading" | "success" | "cancel";
export const tierGateStateLabels: Record<TierGateState, string> = {
  default: "Default",
  loading: "Loading checkout",
  success: "Checkout success",
  cancel: "Checkout cancel",
};

export type BillingCycle = "monthly" | "yearly";

/** Highest tier required across a trigger's features. */
export function topTier(features: GatedFeature[]): Tier {
  return features.reduce<Tier>((acc, f) => (TIER_RANK[f.requires] > TIER_RANK[acc] ? f.requires : acc), "free");
}
