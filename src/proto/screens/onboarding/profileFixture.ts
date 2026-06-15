/**
 * Typed mock seam for the onboarding Profile step (step 3/5). Mirrors the
 * manual-only "Make it yours" options in
 * mockups/tadaify-mvp/onboarding-profile.html (scraping skipped — avatar is
 * Upload OR Initials, bio is "Write your own").
 *
 * @implements fr-onboarding
 */
export type AvatarOption = {
  source: "upload" | "initials";
  label: string;
};

export type ProfileContent = {
  displayNamePlaceholder: string;
  bioPlaceholder: string;
  bioMaxLength: number;
  avatarOptions: AvatarOption[];
};

export function profileFixture(): ProfileContent {
  return {
    displayNamePlaceholder: "e.g. Alexandra Doe",
    bioPlaceholder: "A short line about you. 160 characters max.",
    bioMaxLength: 160,
    avatarOptions: [
      { source: "upload", label: "Upload your own" },
      { source: "initials", label: "Use initials" },
    ],
  };
}
