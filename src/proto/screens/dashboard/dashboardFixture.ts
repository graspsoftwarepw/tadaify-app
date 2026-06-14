/**
 * Typed mock seam for the creator dashboard "My page" view. Mirrors the data
 * shown in mockups/tadaify-mvp/app-dashboard.html so the screen graduates by
 * swapping this factory for the real loader.
 */

export type SocialKind = "ig" | "tt" | "yt" | "x";

export type Block = {
  id: string;
  kind: SocialKind;
  title: string;
  url: string;
  clicks: number;
  live: boolean;
};

export type DashboardProfile = {
  displayName: string;
  handle: string;
  bio: string;
  initials: string;
  verified: boolean;
  visitsThisWeek: number;
  blockCount: number;
  socials: SocialKind[];
};

export const dashboardProfileFixture = (): DashboardProfile => ({
  displayName: "Alexandra Silva",
  handle: "alexandra",
  bio: "Creator + educator 🪄 — helping people turn ideas into tiny daily wins.",
  initials: "A",
  verified: true,
  visitsThisWeek: 142,
  blockCount: 3,
  socials: ["ig", "tt", "yt", "x"],
});

export const dashboardBlocksFixture = (): Block[] => [
  { id: "ig", kind: "ig", title: "Follow me on Instagram", url: "instagram.com/alexandra", clicks: 41, live: true },
  { id: "tt", kind: "tt", title: "Follow me on TikTok", url: "tiktok.com/@alexandra", clicks: 32, live: true },
  { id: "yt", kind: "yt", title: "Follow me on YouTube", url: "youtube.com/@alexandra", clicks: 14, live: true },
];
