/**
 * Typed mock seam for the onboarding Complete step (post-wizard success).
 * Mirrors mockups/tadaify-mvp/onboarding-complete.html: the live URL, the
 * secondary next-step cards, and the dismissible affiliate tip.
 *
 * @implements fr-onboarding
 */
export type NextStepCard = {
  icon: string;
  title: string;
  body: string;
  /** Real `/__proto/*` link, or undefined for a mock action. */
  href?: string;
  warm?: boolean;
};

export type CompleteContent = {
  handle: string;
  heading: string;
  lede: string;
  nextSteps: NextStepCard[];
  affiliate: { text: string };
};

export function completeFixture(): CompleteContent {
  return {
    handle: "alexandra",
    heading: "🎉 You're live!",
    lede: "Share your page anywhere. Every click, every sale, every email — yours.",
    nextSteps: [
      {
        icon: "👀",
        title: "Preview your page",
        body: "See what visitors see — including the desktop and mobile layouts.",
        href: "/__proto/creator-public",
      },
      {
        icon: "🌐",
        title: "Add custom domain",
        body: "Use your own domain (yoursite.com) for $1.99/mo. Free on Creator +.",
        href: "/__proto/domain",
        warm: true,
      },
    ],
    affiliate: {
      text: "Set up your affiliate code in 2 minutes and earn 30% recurring on anyone you refer to tadaify.",
    },
  };
}
