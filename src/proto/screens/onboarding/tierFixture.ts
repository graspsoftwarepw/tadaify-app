/**
 * Typed mock seam for the onboarding Tier step (step 5/5). Mirrors the
 * read-only plan comparison in mockups/tadaify-mvp/onboarding-tier.html
 * (every user starts Free; the matrix is informational only).
 *
 * @implements fr-onboarding
 */
export type TierFeature = {
  text: string;
  /** Renders a small "coming soon" pill after the feature. */
  comingSoon?: boolean;
};

export type TierPlan = {
  id: "free" | "creator" | "pro" | "business";
  name: string;
  price: string;
  per?: string;
  sub: string;
  /** Marks Free as the user's starting plan + shows the ribbon. */
  startingPlan?: boolean;
  /** Shows the "Locked for life" badge (paid tiers). */
  lockForLife?: boolean;
  features: TierFeature[];
};

export type TierContent = {
  plans: TierPlan[];
};

export function tierFixture(): TierContent {
  return {
    plans: [
      {
        id: "free",
        name: "Free",
        price: "$0",
        sub: "Forever · no credit card",
        startingPlan: true,
        features: [
          { text: "1 page (homepage)", comingSoon: true },
          { text: "All core features" },
          { text: "Unlimited blocks" },
          { text: "30d analytics" },
          { text: "5 AI credits/mo" },
          { text: "tadaify.com/you subdomain" },
        ],
      },
      {
        id: "creator",
        name: "Creator",
        price: "$7.99",
        per: "/mo",
        sub: "Billed annually · $95.88/yr",
        lockForLife: true,
        features: [
          { text: "5 pages — privacy, about, portfolio…", comingSoon: true },
          { text: "Everything in Free" },
          { text: "1 custom domain included" },
          { text: "180d analytics" },
          { text: "20 AI credits/mo" },
          { text: "Sell products + communities" },
          { text: "Priority support" },
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "$19.99",
        per: "/mo",
        sub: "Billed annually · $239.88/yr",
        lockForLife: true,
        features: [
          { text: "20 pages", comingSoon: true },
          { text: "Everything in Creator" },
          { text: "1 custom domain included" },
          { text: "Unlimited analytics" },
          { text: "100 AI credits/mo" },
          { text: "Creator API + MCP server (Claude/ChatGPT)" },
          { text: "A/B testing" },
          { text: "Advanced integrations" },
        ],
      },
      {
        id: "business",
        name: "Business",
        price: "$49.99",
        per: "/mo",
        sub: "Billed annually · $599.88/yr",
        lockForLife: true,
        features: [
          { text: "Unlimited pages", comingSoon: true },
          { text: "Everything in Pro" },
          { text: "10 custom domains (agency)" },
          { text: "Agency multi-client" },
          { text: "Unlimited AI credits" },
          { text: "White-label exports" },
          { text: "Dedicated success manager" },
        ],
      },
    ],
  };
}
