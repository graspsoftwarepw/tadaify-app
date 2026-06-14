/**
 * Typed mock seam for the public creator page. Mirrors
 * mockups/tadaify-mvp/creator-public.html so the screen graduates by swapping
 * this factory for the real published-page loader. Defines the FR's rendered
 * data contract.
 *
 * @implements fr-public-creator-page
 */

export type PublicProfile = {
  initials: string;
  name: string;
  handle: string;
  bioLines: string[];
  socials: { label: string; glyph: string }[];
  verified: boolean;
};

export type CountdownParts = { d: string; h: string; m: string; s: string };

export const publicProfileFixture = (): PublicProfile => ({
  initials: "AS",
  name: "Alexandra Silva",
  handle: "alexandrasilva",
  bioLines: [
    "Fitness coach + content creator 💪",
    "Helping 50k+ women build strength without burning out.",
    "Lisbon → worldwide.",
  ],
  socials: [
    { label: "Instagram", glyph: "📸" },
    { label: "TikTok", glyph: "🎵" },
    { label: "YouTube", glyph: "📺" },
    { label: "Email", glyph: "✉️" },
  ],
  verified: true,
});

/** Static countdown for the mock (the real block ticks in the browser). */
export const countdownFixture = (): CountdownParts => ({ d: "03", h: "12", m: "45", s: "18" });
