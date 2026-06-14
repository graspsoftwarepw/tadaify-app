/**
 * Typed mock seam for the About page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-about.html so the screen graduates by swapping
 * this factory for the real loader.
 *
 * @implements fr-page-editor-about
 */
import type { Tier } from "./EditorShell";

export type AboutSectionType =
  | "hero"
  | "bio"
  | "highlights"
  | "timeline"
  | "press"
  | "contact";

export type AboutHighlight = { id: string; icon: string; value: string; caption: string };
export type AboutMilestone = { id: string; year: string; title: string; desc: string };
export type AboutQuote = { id: string; initials: string; tone: "" | "warm" | "emerald"; text: string; attribution: string };

export type AboutFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  showInNav: boolean;
  /** Background swatches; `selected` indexes the active one. */
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  customDomain: string;
  seo: { title: string; description: string };
  hero: {
    initial: string;
    name: string;
    tagline: string;
    proof: { handle: string; followers: string; since: string };
  };
  bio: { text: string; words: number };
  highlights: AboutHighlight[];
  timeline: AboutMilestone[];
  press: AboutQuote[];
  contact: { label: string; target: string };
  /** Section type registry for the Add-section picker. */
  sectionTypes: {
    type: AboutSectionType;
    icon: string;
    tone: "" | "warm" | "rose" | "emerald" | "indigo";
    name: string;
    desc: string;
    tier?: Tier;
  }[];
};

export const aboutEditorFixture = (): AboutFixture => ({
  pageTitle: "About",
  slug: "about",
  live: true,
  showInNav: true,
  backgrounds: [
    { name: "Inherit theme", css: "var(--bg)" },
    { name: "White", css: "#FFFFFF" },
    { name: "Warm cream", css: "#F8F4EE" },
    { name: "Slate", css: "#1F2937" },
    { name: "Dark canvas", css: "#0B0F1E" },
    { name: "Sunrise", css: "linear-gradient(135deg,#FDE68A,#F59E0B)" },
    { name: "Indigo", css: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { name: "Nightfall", css: "linear-gradient(135deg,#0F172A,#334155)" },
  ],
  selectedBackground: 0,
  customDomain: "",
  seo: {
    title: "About Alexandra Silva — strength coach & writer",
    description:
      'Strength coach since 2018. I help busy women train hard without burning out. Author of "Rest Days Are Workouts." Based in Lisbon.',
  },
  hero: {
    initial: "A",
    name: "Alexandra Silva",
    tagline: "Strength coach for women who hate gymtok.",
    proof: { handle: "@alexandra", followers: "24k", since: "2018" },
  },
  bio: {
    text: `I'm Alexandra. I coach busy women who want to get strong without making the gym their personality.

I started lifting at 24 to fix a back I'd wrecked sitting at a desk. Five years later I'd quit my consulting job and was coaching full-time. Today I work with about 40 women a year — most of them mums, founders, or runners who'd hit a wall trying to "just do more cardio."

My method is unsexy: heavy basics, real recovery, and exactly enough volume to keep moving forward. No 4 AM cold-plunge content. No 30-day shred programs. Just the boring stuff that actually works for the next ten years.`,
    words: 147,
  },
  highlights: [
    { id: "h1", icon: "💪", value: "40 women / year", caption: "coached 1:1 since 2020" },
    { id: "h2", icon: "📚", value: "1 book published", caption: "Rest Days Are Workouts (2024)" },
    { id: "h3", icon: "🌍", value: "Lisbon, Portugal", caption: "working remotely since 2022" },
    { id: "h4", icon: "📅", value: "6 yrs coaching", caption: "started 2018, full-time since 2020" },
    { id: "h5", icon: "🎙", value: "40+ podcasts", caption: "guest on training & longevity shows" },
  ],
  timeline: [
    { id: "t1", year: "2018", title: "First barbell", desc: "Joined a powerlifting gym in Berlin to fix back pain. Stayed for the community." },
    { id: "t2", year: "2020", title: "Quit consulting", desc: "Took a sabbatical to certify as a strength coach. Never went back to the office." },
    { id: "t3", year: "2022", title: "Moved to Lisbon", desc: "Switched to remote-first coaching. Built the first cohort of online clients." },
    { id: "t4", year: "2024", title: "Published Rest Days Are Workouts", desc: "Self-published the book on recovery. Sold out the first run in 6 weeks." },
    { id: "t5", year: "2026", title: "Now", desc: "Building Strong Not Skinny — a small group program for busy women." },
  ],
  press: [
    { id: "q1", initials: "FT", tone: "", text: "\"Alexandra is the rare coach who treats rest as a workout. Her programs are quietly the best I've followed.\"", attribution: "The Fitness Times — issue 47" },
    { id: "q2", initials: "RH", tone: "warm", text: "\"Honest, no-nonsense coaching. She's the one I send my friends to when they ask where to start lifting.\"", attribution: "Run Happy podcast · @robinhuxley" },
    { id: "q3", initials: "SH", tone: "emerald", text: "\"The book Rest Days Are Workouts is the antidote to the cult of grind. Required reading for any tired lifter.\"", attribution: "Strong Habits Newsletter" },
  ],
  contact: { label: "Work with me", target: "Contact page (tadaify.com/alexandra/contact)" },
  sectionTypes: [
    { type: "hero", icon: "🌅", tone: "warm", name: "Hero", desc: "Photo + name + tagline + social proof line. The first thing visitors see." },
    { type: "bio", icon: "📝", tone: "indigo", name: "Bio", desc: "Long-form story in your own words. Rich-text editor with ✨ AI assist." },
    { type: "highlights", icon: "⭐", tone: "emerald", name: "Highlights", desc: "3–6 stat cards. Clients coached, books published, places lived." },
    { type: "timeline", icon: "📅", tone: "rose", name: "Story timeline", desc: "Year-by-year milestones. List or card style on the public page." },
    { type: "press", icon: "📰", tone: "", name: "Press / quotes", desc: "Quote cards with attribution. Renders as a carousel for visitors.", tier: "creator" },
    { type: "contact", icon: "✉️", tone: "", name: "Contact CTA", desc: "A \"Get in touch\" button. Links to contact page, mailto, or external URL." },
  ],
});

export const aboutStarters = (): { id: string; emoji: string; name: string; meta: string }[] => [
  { id: "musician", emoji: "🎵", name: "Musician", meta: "Hero · Bio · Highlights · Press · Contact" },
  { id: "author", emoji: "📚", name: "Author", meta: "Hero · Bio · Timeline · Press · Contact" },
  { id: "coach", emoji: "💪", name: "Coach", meta: "Hero · Bio · Highlights · Timeline · Contact" },
];
