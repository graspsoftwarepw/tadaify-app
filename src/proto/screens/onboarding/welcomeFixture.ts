/**
 * Typed mock seam for the onboarding Welcome step (step 1/5). Mirrors the
 * platform picker in mockups/tadaify-mvp/onboarding-welcome.html — the @handle
 * and the selectable social platforms with their brand-gradient stops.
 *
 * @implements fr-onboarding
 */
export type PlatformOption = {
  id: string;
  name: string;
  /** Brand-gradient stops used by `--sp-a/--sp-b/--sp-c`. */
  a: string;
  b: string;
  c: string;
};

export type WelcomeContent = {
  handle: string;
  platforms: PlatformOption[];
};

export function welcomeFixture(): WelcomeContent {
  return {
    handle: "yourname",
    platforms: [
      { id: "instagram", name: "Instagram", a: "#F58529", b: "#DD2A7B", c: "#8134AF" },
      { id: "tiktok", name: "TikTok", a: "#25F4EE", b: "#000", c: "#FE2C55" },
      { id: "youtube", name: "YouTube", a: "#FF0000", b: "#CC0000", c: "#FF4444" },
      { id: "x", name: "X (Twitter)", a: "#000", b: "#333", c: "#666" },
      { id: "twitch", name: "Twitch", a: "#9146FF", b: "#772CE8", c: "#A970FF" },
      { id: "spotify", name: "Spotify", a: "#1DB954", b: "#1AA34A", c: "#4ADE80" },
      { id: "linkedin", name: "LinkedIn", a: "#0A66C2", b: "#004182", c: "#378FE9" },
      { id: "pinterest", name: "Pinterest", a: "#E60023", b: "#AD081B", c: "#FF4E5C" },
      { id: "threads", name: "Threads", a: "#000", b: "#1f1f1f", c: "#4a4a4a" },
    ],
  };
}
