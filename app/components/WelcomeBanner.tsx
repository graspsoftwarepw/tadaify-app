/**
 * WelcomeBanner — dismissible post-onboarding welcome message.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2603-2613.
 *
 * Copy varies per onboarding state (DEC-332=D):
 *   - completed/interrupted-tier: "Your page is set up — add your first block to publish."
 *   - interrupted-profile:        "Almost there — pick a template to finish your page setup."
 *   - interrupted-social:         "Finish setting up your page — add your name and bio."
 *   - interrupted-welcome:        "Welcome! Finish setting up your page to get started."
 *
 * NOT shown when welcome_dismissed=true.
 * NOT "your page is live" (DEC-332=D: NOT live until first block publish).
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * DEC trail: DEC-332=D
 * Covers: AC#10, AC#11, ECN-26a-05, ECN-26a-06, U4
 */

import type { OnboardingState } from "~/lib/onboarding-state";
import { getBannerCopy, getResumeUrl } from "~/lib/onboarding-state";

interface WelcomeBannerProps {
  onboardingState: OnboardingState;
  handle: string;
  dismissed: boolean;
  onDismiss: () => void;
}

export function WelcomeBanner({
  onboardingState,
  handle,
  dismissed,
  onDismiss,
}: WelcomeBannerProps) {
  // Not rendered when dismissed
  if (dismissed) return null;

  const bannerCopy = getBannerCopy(onboardingState);
  const resumeUrl = getResumeUrl(onboardingState);
  const isCompleted = onboardingState === "completed" || onboardingState === "interrupted-tier";

  return (
    <div
      data-testid="welcome-banner"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        background: "rgba(99, 102, 241, 0.06)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: 10,
        marginBottom: 16,
        animation: "fadein .3s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}
      >
        🎉
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--fg)",
            lineHeight: 1.5,
          }}
        >
          <strong>{bannerCopy}</strong>
        </p>
        {isCompleted && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--fg-muted)",
            }}
          >
            Share{" "}
            <a
              href={`https://tadaify.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand-primary)", fontWeight: 500 }}
            >
              tadaify.com/{handle}
            </a>{" "}
            on your socials once you&apos;ve added your first block.
          </p>
        )}
        {!isCompleted && resumeUrl && (
          <p style={{ margin: "6px 0 0" }}>
            <a
              href={resumeUrl}
              style={{
                fontSize: 13,
                color: "var(--brand-primary)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {getBannerCtaLabel(onboardingState)} →
            </a>
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss welcome banner"
        data-testid="welcome-banner-dismiss"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--fg-muted)",
          fontSize: 14,
          padding: "2px 4px",
          borderRadius: 4,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function getBannerCtaLabel(state: OnboardingState): string {
  switch (state) {
    case "interrupted-tier":
      return "Choose a plan";
    case "interrupted-profile":
      return "Pick template (next step)";
    case "interrupted-social":
      return "Add your name and bio";
    case "interrupted-welcome":
    default:
      return "Finish setup";
  }
}
