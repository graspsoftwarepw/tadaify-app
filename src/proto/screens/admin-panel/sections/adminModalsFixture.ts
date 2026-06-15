/**
 * Typed mock seam for the option lists the global admin modals render. Mirrors
 * the <select>/<option> sets in mockups/tadaify-mvp/admin-panel.html so the
 * modals graduate by swapping these factories for real config.
 */

export type CompUpgradeOptions = {
  tiers: string[];
  durations: string[];
};

export type PublishLegalOptions = {
  notifications: string[];
};

export const compUpgradeOptionsFixture = (): CompUpgradeOptions => ({
  tiers: ["Pro", "Business", "Creator"],
  durations: ["1 month", "3 months", "6 months", "1 year", "Lifetime"],
});

export const publishLegalOptionsFixture = (): PublishLegalOptions => ({
  notifications: [
    "Banner + email (recommended)",
    "Banner only",
    "Silent (no notification)",
  ],
});
