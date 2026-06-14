/**
 * Typed mock seam for the public About page. Mirrors
 * mockups/tadaify-mvp/creator-about-public.html so the screen graduates by
 * swapping these factories for the real published-page loader. Defines the
 * FR's rendered data contract.
 *
 * @implements fr-creator-about-public
 */

export type AboutNavLink = { label: string; href: string; current?: boolean };

export type SocialProofStat = { value: string; suffix?: string; prefix?: string };

export type AboutHero = {
  initial: string;
  name: string;
  tagline: string;
  handle: string;
  followers: string;
  since: string;
};

export type AboutHighlight = {
  icon: string;
  value: string;
  caption: string;
};

export type TimelineEntry = {
  year: string;
  title: string;
  body: string;
  side: "left" | "right";
};

export type PressQuote = {
  quote: string;
  sourceIcon: string;
  source: string;
  /** Optional tint key for the source icon (warm / mint). */
  tint?: "warm" | "mint";
};

export type SocialLink = { label: string; glyph: string };

export type AboutContent = {
  nav: AboutNavLink[];
  hero: AboutHero;
  bioHeading: string;
  bioParagraphs: { text: string; em?: string }[];
  highlightsHeading: string;
  highlights: AboutHighlight[];
  timelineHeading: string;
  timeline: TimelineEntry[];
  pressHeading: string;
  press: PressQuote[];
  cta: { eyebrow: string; heading: string; button: string };
  socials: SocialLink[];
  footerNote: string;
};

export const aboutContentFixture = (): AboutContent => ({
  nav: [
    { label: "Home", href: "/__proto/creator-public" },
    { label: "About", href: "/__proto/creator-about-public", current: true },
    { label: "Blog", href: "#" },
    { label: "Portfolio", href: "#" },
    { label: "Book", href: "#" },
    { label: "Contact", href: "#" },
  ],
  hero: {
    initial: "A",
    name: "Alexandra Silva",
    tagline: "Strength coach for women who hate gymtok.",
    handle: "@alexandra",
    followers: "24k",
    since: "2018",
  },
  bioHeading: "My story",
  bioParagraphs: [
    {
      text: "I'm Alexandra. I coach busy women who want to get strong without making the gym their personality.",
    },
    {
      text: "I started lifting at 24 to fix a back I'd wrecked sitting at a desk. Five years later I'd quit my consulting job and was coaching full-time. Today I work with about 40 women a year — most of them mums, founders, or runners who'd hit a wall trying to \"just do more cardio.\"",
    },
    {
      text: "My method is unsexy: heavy basics, real recovery, and exactly enough volume to keep moving forward. ",
      em: "No 4 AM cold-plunge content. No 30-day shred programs.",
    },
  ],
  highlightsHeading: "Highlights",
  highlights: [
    { icon: "💪", value: "40 women / year", caption: "coached 1:1 since 2020" },
    { icon: "📚", value: "1 book published", caption: "Rest Days Are Workouts (2024)" },
    { icon: "🌍", value: "Lisbon, Portugal", caption: "working remotely since 2022" },
    { icon: "📅", value: "6 yrs coaching", caption: "started 2018, full-time since 2020" },
    { icon: "🎙", value: "40+ podcasts", caption: "guest on training & longevity shows" },
    { icon: "🏋️‍♀️", value: "DL 152 kg", caption: "current best · trained, not bro-spotted" },
  ],
  timelineHeading: "The road here",
  timeline: [
    {
      year: "2018",
      title: "First barbell",
      body: "Joined a powerlifting gym in Berlin to fix back pain. Stayed for the community.",
      side: "left",
    },
    {
      year: "2020",
      title: "Quit consulting",
      body: "Took a sabbatical to certify as a strength coach. Never went back to the office.",
      side: "right",
    },
    {
      year: "2022",
      title: "Moved to Lisbon",
      body: "Switched to remote-first coaching. Built the first cohort of online clients.",
      side: "left",
    },
    {
      year: "2024",
      title: "Published Rest Days Are Workouts",
      body: "Self-published the book on recovery. Sold out the first run in 6 weeks.",
      side: "right",
    },
    {
      year: "2026",
      title: "Now",
      body: "Building Strong Not Skinny — a small group program for busy women.",
      side: "left",
    },
  ],
  pressHeading: "In the press",
  press: [
    {
      quote:
        "\"Alexandra is the rare coach who treats rest as a workout. Her programs are quietly the best I've followed.\"",
      sourceIcon: "FT",
      source: "The Fitness Times — issue 47",
    },
    {
      quote:
        "\"Honest, no-nonsense coaching. She's the one I send my friends to when they ask where to start lifting.\"",
      sourceIcon: "RH",
      source: "Run Happy podcast · @robinhuxley",
      tint: "warm",
    },
    {
      quote:
        "\"The book Rest Days Are Workouts is the antidote to the cult of grind. Required reading for any tired lifter.\"",
      sourceIcon: "SH",
      source: "Strong Habits Newsletter",
      tint: "mint",
    },
  ],
  cta: {
    eyebrow: "Get in touch",
    heading: "Want to train together?",
    button: "Work with me",
  },
  socials: [
    { label: "Instagram", glyph: "IG" },
    { label: "TikTok", glyph: "TT" },
    { label: "YouTube", glyph: "YT" },
    { label: "Substack", glyph: "SB" },
    { label: "Spotify", glyph: "SP" },
  ],
  footerNote: "© 2026 Alexandra Silva · made with",
});
