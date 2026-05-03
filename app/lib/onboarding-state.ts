/**
 * onboarding-state — derives onboarding interrupt state from profile data.
 *
 * Used by the /app loader to determine welcome banner copy + finish-setup CTA.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * DEC trail: DEC-332=D (page Publish-gated, welcome semantics)
 * Covers: U2 (unit tests in onboarding-state.test.ts)
 */

export type OnboardingState =
  | "completed"
  | "interrupted-welcome"
  | "interrupted-social"
  | "interrupted-profile"
  | "interrupted-template"
  | "interrupted-tier";

export interface OnboardingProfile {
  onboarding_completed_at: string | null;
  display_name: string | null;
  bio: string | null;
  template_id: string | null;
  tier: string | null;
  /** CSV of platform ids (e.g. "instagram,tiktok") — from onboarding social step */
  social_platforms?: string | null;
}

export interface OnboardingStateResult {
  state: OnboardingState;
  /** Deep-link URL for "Finish setup" CTA — null if completed */
  resumeUrl: string | null;
  /** Welcome banner copy variant */
  bannerCopy: string;
  /** Finish-setup CTA label — null if completed */
  ctaLabel: string | null;
}

/**
 * Derives the onboarding state from a profile snapshot.
 *
 * Priority ladder (each step implies all prior steps passed):
 *   completed  → onboarding_completed_at IS NOT NULL
 *   tier       → template_id set, but onboarding never completed
 *   template   → display_name+bio set, no template_id, not completed
 *   profile    → display_name OR bio set, but no template_id
 *   social     → no display_name/bio/template, social_platforms set
 *   welcome    → handle exists but nothing else filled
 */
export function deriveOnboardingState(profile: OnboardingProfile): OnboardingStateResult {
  // Fully completed
  if (profile.onboarding_completed_at) {
    return {
      state: "completed",
      resumeUrl: null,
      bannerCopy: "Your page is set up — add your first block to publish.",
      ctaLabel: null,
    };
  }

  // Interrupted after template step (tier abandoned)
  if (profile.template_id) {
    return {
      state: "interrupted-tier",
      resumeUrl: "/onboarding/tier",
      bannerCopy: "Your page is set up — add your first block to publish.",
      ctaLabel: "Choose a plan",
    };
  }

  // Interrupted after profile step (has name/bio, no template)
  if (profile.display_name || profile.bio) {
    return {
      state: "interrupted-profile",
      resumeUrl: "/onboarding/template",
      bannerCopy: "Almost there — pick a template to finish your page setup.",
      ctaLabel: "Pick template (next step)",
    };
  }

  // Interrupted after social step (has platforms but no profile data)
  if (profile.social_platforms) {
    return {
      state: "interrupted-social",
      resumeUrl: "/onboarding/profile",
      bannerCopy: "Finish setting up your page — add your name and bio.",
      ctaLabel: "Finish setup → /onboarding/profile",
    };
  }

  // Interrupted at welcome (only handle exists, nothing else)
  return {
    state: "interrupted-welcome",
    resumeUrl: "/onboarding/welcome",
    bannerCopy: "Welcome! Finish setting up your page to get started.",
    ctaLabel: "Finish setup → /onboarding/welcome",
  };
}

/**
 * Returns the banner copy based on state.
 * Used by WelcomeBanner component and unit tests.
 */
export function getBannerCopy(state: OnboardingState): string {
  switch (state) {
    case "completed":
    case "interrupted-tier":
      return "Your page is set up — add your first block to publish.";
    case "interrupted-profile":
      return "Almost there — pick a template to finish your page setup.";
    case "interrupted-social":
      return "Finish setting up your page — add your name and bio.";
    case "interrupted-welcome":
    default:
      return "Welcome! Finish setting up your page to get started.";
  }
}

/**
 * Returns the resume URL for the "Finish setup" CTA.
 * Returns null for completed state.
 */
export function getResumeUrl(state: OnboardingState): string | null {
  switch (state) {
    case "completed":
      return null;
    case "interrupted-tier":
      return "/onboarding/tier";
    case "interrupted-profile":
      return "/onboarding/template";
    case "interrupted-social":
      return "/onboarding/profile";
    case "interrupted-welcome":
    default:
      return "/onboarding/welcome";
  }
}
