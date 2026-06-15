/**
 * Typed mock seam for the onboarding Social step (step 2/5). Mirrors the
 * handle-entry rows in mockups/tadaify-mvp/onboarding-social.html: each
 * platform's display label, URL prefix, emoji glyph and icon background.
 *
 * @implements fr-onboarding
 */
export type SocialPlatform = {
  id: string;
  label: string;
  /** URL prefix shown before the handle input. */
  prefix: string;
  /** Emoji / glyph fallback shown in the icon tile. */
  icon: string;
  /** CSS background for the icon tile (gradient or solid). */
  bg: string;
};

export type SocialContent = {
  handle: string;
  /** Default platforms shown when arriving with none pre-selected. */
  defaultPlatformIds: string[];
  platforms: SocialPlatform[];
};

export function socialFixture(): SocialContent {
  return {
    handle: "yourname",
    defaultPlatformIds: ["instagram", "tiktok", "youtube"],
    platforms: [
      { id: "instagram", label: "Instagram", prefix: "instagram.com/", icon: "📸", bg: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)" },
      { id: "tiktok", label: "TikTok", prefix: "tiktok.com/@", icon: "🎵", bg: "#010101" },
      { id: "youtube", label: "YouTube", prefix: "youtube.com/@", icon: "▶", bg: "#FF0000" },
      { id: "x", label: "X", prefix: "x.com/", icon: "𝕏", bg: "#000000" },
      { id: "twitch", label: "Twitch", prefix: "twitch.tv/", icon: "🎮", bg: "#9146FF" },
      { id: "spotify", label: "Spotify", prefix: "open.spotify.com/user/", icon: "🎧", bg: "#1DB954" },
      { id: "linkedin", label: "LinkedIn", prefix: "linkedin.com/in/", icon: "in", bg: "#0A66C2" },
      { id: "pinterest", label: "Pinterest", prefix: "pinterest.com/", icon: "📌", bg: "#E60023" },
      { id: "threads", label: "Threads", prefix: "threads.net/@", icon: "@", bg: "#000000" },
    ],
  };
}
