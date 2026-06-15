/**
 * Typed mock seam for the AI Suggest sub-modal. Mirrors the TRIGGER_CONTEXTS
 * + QUOTAS data in mockups/tadaify-mvp/app-ai-suggest-modal.html. The ✨ Suggest
 * button on any short-text field (title / caption / button label) opens this.
 *
 * @implements fr-ai-suggest-modal
 */

export type SuggestionTone =
  | "Direct"
  | "Playful"
  | "Friendly"
  | "Professional"
  | "Curious";

export type Suggestion = { copy: string; tag: SuggestionTone };

export type FieldFlavour = "title" | "caption" | "cta";

export type TriggerContext = {
  flavour: FieldFlavour;
  /** Field label shown in the modal title, e.g. "Block title". */
  label: string;
  /** Plain context line — what the AI is basing suggestions on. */
  contextLabel: string;
  /** Block type the field belongs to (bolded in the context strip). */
  basedOn: string;
  /** Short monospaced context detail (URL / filename / alt text). */
  contextCode: string;
  suggestions: Suggestion[];
};

export const triggerContextsFixture = (): Record<FieldFlavour, TriggerContext> => ({
  title: {
    flavour: "title",
    label: "Block title",
    contextLabel: "Based on your",
    basedOn: "Link button",
    contextCode: "open.spotify.com/album/spring-drops",
    suggestions: [
      { copy: "Spring Drops — out now", tag: "Direct" },
      { copy: "Hit play. New album, fresh feels.", tag: "Playful" },
      { copy: "My new album is here — give it a spin", tag: "Friendly" },
      { copy: "Listen to Spring Drops on Spotify", tag: "Professional" },
      { copy: "Wonder what's new? Spring Drops is live", tag: "Curious" },
    ],
  },
  caption: {
    flavour: "caption",
    label: "Caption",
    contextLabel: "Based on your",
    basedOn: "Image",
    contextCode: "album-cover.jpg · alt: Spring Drops cover",
    suggestions: [
      { copy: "The cover that started it all", tag: "Curious" },
      { copy: "Spring Drops — album cover", tag: "Direct" },
      { copy: "Behind the artwork: Spring Drops", tag: "Friendly" },
      { copy: "Cover art for my new album", tag: "Professional" },
      { copy: "Pretty proud of this cover, ngl", tag: "Playful" },
    ],
  },
  cta: {
    flavour: "cta",
    label: "Button label",
    contextLabel: "Based on your",
    basedOn: "Link button",
    contextCode: "open.spotify.com/album/spring-drops",
    suggestions: [
      { copy: "Listen now", tag: "Direct" },
      { copy: "Hit play 🎧", tag: "Playful" },
      { copy: "Stream Spring Drops", tag: "Professional" },
      { copy: "Take a listen", tag: "Friendly" },
      { copy: "Curious? Press play", tag: "Curious" },
    ],
  },
});

export type AiTier = "free" | "creator" | "pro" | "business";

export type TierQuota = {
  label: string;
  /** Daily cap; null = unlimited (cost strip hidden). */
  limit: number | null;
  price: number;
  used: number;
};

export const tierQuotasFixture = (): Record<AiTier, TierQuota> => ({
  free: { label: "Free", limit: 5, price: 0, used: 2 },
  creator: { label: "Creator", limit: 50, price: 7.99, used: 23 },
  pro: { label: "Pro", limit: null, price: 19.99, used: 47 },
  business: { label: "Business", limit: null, price: 49.99, used: 132 },
});

/** The six review-only modal states reproduced behind the in-view switcher. */
export type AiModalState =
  | "loaded"
  | "loading"
  | "error"
  | "empty"
  | "out";

export const aiModalStateLabels: Record<AiModalState, string> = {
  loaded: "5 suggestions",
  loading: "Loading",
  error: "Error",
  empty: "Empty (no input)",
  out: "Out of quota",
};
