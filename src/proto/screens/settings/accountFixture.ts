/**
 * Typed mock seam for the Settings · Account tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-account.html (and the Account pane of
 * app-settings.html) so the tab graduates by swapping this factory for the
 * real loader.
 *
 * @implements fr-settings
 */

export type AccountFixture = {
  initials: string;
  avatarFormats: string;
  displayName: string;
  bio: string;
  bioMax: number;
  pronouns: string;
  handle: string;
  handlePrefix: string;
  handleStatus: string;
  handleLastChanged: string;
  email: string;
  /** Active custom domain shown in the handle-change warning. */
  customDomain: string;
};

export const accountFixture = (): AccountFixture => ({
  initials: "A",
  avatarFormats: "JPG, PNG, GIF, WebP — max 5 MB",
  displayName: "Alexandra Silva",
  bio: "Photographer, traveller, and content creator based in Lisbon 🇵🇹",
  bioMax: 80,
  pronouns: "she/her",
  handle: "alexandra",
  handlePrefix: "tadaify.com/",
  handleStatus: "current",
  handleLastChanged: "never",
  email: "alexandra@example.com",
  customDomain: "alexandra.com",
});
