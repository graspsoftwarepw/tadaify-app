/**
 * Typed mock seam for the creator Feedback view. Mirrors the data shown in
 * mockups/tadaify-mvp/app-feedback.html so the screen graduates by swapping
 * this factory for the real loader.
 *
 * @implements fr-feedback
 */

/** Feedback topic, used both by the quick-pick cards and the form select. */
export type FeedbackTopic = "bug" | "idea" | "other";

/** A quick-pick card at the top of the page that pre-selects a topic. */
export type FeedbackCard = {
  topic: FeedbackTopic;
  /** Accent variant; maps to a scoped CSS modifier. */
  accent: "primary" | "warm" | "green";
  icon: string;
  title: string;
  desc: string;
};

/** An option in the "What is this about?" select. */
export type FeedbackTopicOption = {
  value: FeedbackTopic;
  label: string;
};

export type FeedbackFixture = {
  heading: string;
  sub: string;
  cards: FeedbackCard[];
  form: {
    heading: string;
    /** May contain a support mailto handled inline by the screen. */
    supportEmail: string;
    topics: FeedbackTopicOption[];
    titlePlaceholder: string;
    bodyPlaceholder: string;
    contactLabel: string;
    submitLabel: string;
  };
};

export const feedbackFixture = (): FeedbackFixture => ({
  heading: "Feedback",
  sub: "Tell us what's working, what isn't, and what you wish tadaify did. We read everything — read receipts ON.",
  cards: [
    {
      topic: "bug",
      accent: "primary",
      icon: "🐞",
      title: "Report a bug",
      desc: "Something broken, slow, or visually off. Screenshot welcome.",
    },
    {
      topic: "idea",
      accent: "warm",
      icon: "💡",
      title: "Suggest a feature",
      desc: "A block, integration, or workflow you wish existed.",
    },
    {
      topic: "other",
      accent: "green",
      icon: "💬",
      title: "General feedback",
      desc: "Anything else — pricing, tone, docs, onboarding, vibe.",
    },
  ],
  form: {
    heading: "Send us feedback",
    supportEmail: "support@tadaify.com",
    topics: [
      { value: "bug", label: "🐞 Bug report" },
      { value: "idea", label: "💡 Feature idea" },
      { value: "other", label: "💬 General feedback" },
    ],
    titlePlaceholder: "e.g. Schedule block fails on mobile Safari",
    bodyPlaceholder: "What were you trying to do? What happened? What did you expect?",
    contactLabel: "It's OK to email me back at my account address.",
    submitLabel: "Send feedback",
  },
});
