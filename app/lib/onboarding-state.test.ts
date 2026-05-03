/**
 * U2 — Onboarding-state derivation
 *
 * Tests deriveOnboardingState() for all 6 interrupt states + completed.
 * Also tests getBannerCopy() and getResumeUrl() helpers.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: U2 per issue spec, ECN-26a-01..05
 */

import { describe, it, expect } from "vitest";
import {
  deriveOnboardingState,
  getBannerCopy,
  getResumeUrl,
} from "./onboarding-state.js";
import type { OnboardingProfile } from "./onboarding-state.js";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeProfile(overrides: Partial<OnboardingProfile> = {}): OnboardingProfile {
  return {
    onboarding_completed_at: null,
    display_name: null,
    bio: null,
    template_id: null,
    tier: "free",
    social_platforms: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// U2-1: derives 'completed' when onboarding_completed_at IS NOT NULL (ECN-26a-05)
// ---------------------------------------------------------------------------

describe("deriveOnboardingState — completed", () => {
  it("returns state='completed' when onboarding_completed_at is set", () => {
    const result = deriveOnboardingState(
      makeProfile({ onboarding_completed_at: "2026-05-01T12:00:00Z" })
    );
    expect(result.state).toBe("completed");
    expect(result.resumeUrl).toBeNull();
    expect(result.bannerCopy).toContain("add your first block to publish");
  });
});

// ---------------------------------------------------------------------------
// U2-2: derives 'interrupted-welcome' when only handle exists (ECN-26a-01)
// ---------------------------------------------------------------------------

describe("deriveOnboardingState — interrupted-welcome", () => {
  it("returns state='interrupted-welcome' with no profile data", () => {
    const result = deriveOnboardingState(makeProfile());
    expect(result.state).toBe("interrupted-welcome");
    expect(result.resumeUrl).toBe("/onboarding/welcome");
    expect(result.bannerCopy.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// U2-3: derives 'interrupted-profile' when name+bio set but no template (ECN-26a-03)
// ---------------------------------------------------------------------------

describe("deriveOnboardingState — interrupted-profile", () => {
  it("returns 'interrupted-profile' when display_name set, no template", () => {
    const result = deriveOnboardingState(
      makeProfile({ display_name: "Test User" })
    );
    expect(result.state).toBe("interrupted-profile");
    expect(result.resumeUrl).toBe("/onboarding/template");
    expect(result.ctaLabel).toContain("Pick template");
  });

  it("returns 'interrupted-profile' when bio set, no template", () => {
    const result = deriveOnboardingState(makeProfile({ bio: "Some bio" }));
    expect(result.state).toBe("interrupted-profile");
    expect(result.resumeUrl).toBe("/onboarding/template");
  });
});

// ---------------------------------------------------------------------------
// U2-4: derives 'interrupted-tier' when template set but no completion (ECN-26a-04)
// ---------------------------------------------------------------------------

describe("deriveOnboardingState — interrupted-tier", () => {
  it("returns 'interrupted-tier' when template_id set but no completion", () => {
    const result = deriveOnboardingState(
      makeProfile({ template_id: "creator-minimal", display_name: "Test" })
    );
    expect(result.state).toBe("interrupted-tier");
    expect(result.resumeUrl).toBe("/onboarding/tier");
  });
});

// ---------------------------------------------------------------------------
// U2-5: banner copy varies per state (DEC-332=D)
// ---------------------------------------------------------------------------

describe("getBannerCopy", () => {
  it("'completed' → includes 'add your first block to publish'", () => {
    const copy = getBannerCopy("completed");
    expect(copy).toContain("add your first block to publish");
    // DEC-332=D: NOT "your page is live"
    expect(copy.toLowerCase()).not.toContain("your page is live");
  });

  it("'interrupted-welcome' → non-empty copy", () => {
    const copy = getBannerCopy("interrupted-welcome");
    expect(copy.length).toBeGreaterThan(0);
  });

  it("'interrupted-profile' → includes 'template'", () => {
    const copy = getBannerCopy("interrupted-profile");
    expect(copy.toLowerCase()).toContain("template");
  });

  it("'interrupted-tier' → same as completed copy", () => {
    const copy = getBannerCopy("interrupted-tier");
    expect(copy).toContain("add your first block to publish");
  });
});

// ---------------------------------------------------------------------------
// getResumeUrl
// ---------------------------------------------------------------------------

describe("getResumeUrl", () => {
  it("'completed' → null (no resume needed)", () => {
    expect(getResumeUrl("completed")).toBeNull();
  });

  it("'interrupted-welcome' → /onboarding/welcome", () => {
    expect(getResumeUrl("interrupted-welcome")).toBe("/onboarding/welcome");
  });

  it("'interrupted-social' → /onboarding/profile", () => {
    expect(getResumeUrl("interrupted-social")).toBe("/onboarding/profile");
  });

  it("'interrupted-profile' → /onboarding/template", () => {
    expect(getResumeUrl("interrupted-profile")).toBe("/onboarding/template");
  });

  it("'interrupted-tier' → /onboarding/tier", () => {
    expect(getResumeUrl("interrupted-tier")).toBe("/onboarding/tier");
  });
});
