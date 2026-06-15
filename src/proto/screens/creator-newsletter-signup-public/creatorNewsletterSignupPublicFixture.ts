/**
 * Typed mock seam for the public Newsletter signup page. Mirrors
 * mockups/tadaify-mvp/creator-newsletter-signup-public.html so the screen
 * graduates by swapping these factories for the real published-page loader.
 * Defines the FR's rendered data contract: the signup hero/form, social proof,
 * what-you-get list, past issues and FAQ.
 *
 * @implements fr-creator-newsletter-signup-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type NewsletterLayout = {
  id: "oneline" | "twoline" | "card";
  num: number;
  label: string;
  button: string;
  /** Centred-card layout extras. */
  cardIcon?: string;
  cardPrompt?: string;
};

export type ProofQuote = { quote: string; author: string };

export type WygItem = { emoji: string; text: string };

export type PastIssue = {
  cover: string;
  coverTone?: "warm" | "rose";
  title: string;
  excerpt: string;
  meta: string;
};

export type NewsletterFaq = { q: string; a: string };

export type NewsletterContent = {
  creator: PublicCreator;
  hero: { cover: string; heading: string; lede: string };
  trust: string;
  /** The single form layout the creator chose in their editor — the public page
      renders only this one (the layout picker lives in the dashboard editor). */
  chosenLayout: NewsletterLayout;
  consentLabel: string;
  proofCount: { lead: string; count: string; tail: string };
  proofQuotes: ProofQuote[];
  wygHeading: string;
  wyg: WygItem[];
  pastHeading: string;
  pastSub: string;
  pastIssues: PastIssue[];
  faqHeading: string;
  faqs: NewsletterFaq[];
  closer: { heading: string; button: string };
  footerSocials: PublicSocial[];
};

export function newsletterSignupContentFixture(): NewsletterContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    hero: {
      cover: "✉️",
      heading: "Get my weekly notes on training without burning out.",
      lede: "One short, honest email every Tuesday. Drills, mindset shifts, recovery tactics — no spam, no fluff.",
    },
    trust: "Powered by Kit · GDPR-friendly · 1-click unsubscribe",
    chosenLayout: {
      id: "card",
      num: 3,
      label: "Centered card layout",
      button: "Count me in",
      cardIcon: "✉️",
      cardPrompt: "Join 24,512 creators training smarter",
    },
    consentLabel: "I agree to receive emails from Alexandra and accept the privacy policy.",
    proofCount: { lead: "Join ", count: "24,512", tail: " creators learning to train smarter" },
    proofQuotes: [
      {
        quote: "Best fitness newsletter I read. Honest, no-fluff, and the Tuesday cadence is perfect for actually trying things.",
        author: "— Mira K., Berlin",
      },
      {
        quote: "Alex's Tuesday emails are the only ones I open every week. The recovery section alone changed how I sleep.",
        author: "— Daniel P., NYC",
      },
    ],
    wygHeading: "Here's what lands in your inbox:",
    wyg: [
      { emoji: "📅", text: "One short essay every Tuesday — usually 4-7 minutes to read." },
      { emoji: "🏋️", text: "Weekly drills you can try in your next session — no fancy gear." },
      { emoji: "🛌", text: "Recovery + sleep tactics that actually work for non-athletes." },
      { emoji: "💌", text: "Behind-the-scenes from my own training — the failures included." },
    ],
    pastHeading: "Recent issues you'd have read:",
    pastSub: "A peek at the last three Tuesdays.",
    pastIssues: [
      {
        cover: "📈",
        coverTone: "warm",
        title: "Why I stopped chasing PRs",
        excerpt: "Hitting a wall at 165kg taught me more about programming than any deload week ever did.",
        meta: "Apr 22 · 6 min read",
      },
      {
        cover: "💤",
        title: "Sleep is the cheat code",
        excerpt: "Three small experiments that doubled my deep-sleep minutes — backed by my Whoop data.",
        meta: "Apr 15 · 5 min read",
      },
      {
        cover: "🧠",
        coverTone: "rose",
        title: "Mental reps > physical reps",
        excerpt: "Visualisation is real, but only if you do it the way Olympic divers do — not the way Instagram does.",
        meta: "Apr 08 · 7 min read",
      },
    ],
    faqHeading: "Frequently asked",
    faqs: [
      {
        q: "How often will you email me?",
        a: "Once a week, every Tuesday morning. Sometimes a bonus drop alert when something time-sensitive lands. Never daily, never twice in one day.",
      },
      {
        q: "Can I unsubscribe at any time?",
        a: "Yes — every email has a one-click unsubscribe link in the footer. No survey, no \"are you sure\" — instant.",
      },
      {
        q: "Will you sell or share my email?",
        a: "Never. Your email lives in my Kit account and that's it. I don't sell, share, swap or rent lists. GDPR-compliant by default.",
      },
      {
        q: "What if I want to read past issues first?",
        a: "The \"Recent issues\" cards above show the last three Tuesdays. The full archive lives on my Kit page once you confirm.",
      },
    ],
    closer: { heading: "Ready? It's one click + your email.", button: "Subscribe now" },
    footerSocials: [
      { label: "Instagram", glyph: "IG" },
      { label: "TikTok", glyph: "TT" },
      { label: "YouTube", glyph: "YT" },
    ],
  };
}
