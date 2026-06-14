/**
 * Typed mock seam for the Newsletter signup page editor. Mirrors the data shown
 * in mockups/tadaify-mvp/app-page-newsletter-signup.html so the screen graduates
 * by swapping this factory for the real loader.
 *
 * @implements fr-page-editor-newsletter-signup
 */
import type { Tier } from "./EditorShell";

export type NewsletterProvider =
  | "kit"
  | "beehiiv"
  | "mailerlite"
  | "mailchimp"
  | "klaviyo"
  | "google-sheets"
  | "webhook";

export type ProviderOption = { value: NewsletterProvider; label: string };

export type FormLayout = "oneline" | "twoline" | "card";

export type BulletRow = { id: string; emoji?: string; text: string };
export type PastIssue = { id: string; cover: string; tone: "" | "warm" | "rose"; title: string; excerpt: string; meta: string };
export type NlFaq = { id: string; q: string; a: string };

export type NlSectionTile = { type: string; emoji: string; name: string; sub: string; tier?: Tier; already?: boolean };

export type NewsletterFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  titleSlugAlts: { title: string; slug: string }[];
  seo: { title: string; description: string };
  hero: { headline: string; sub: string; headlineIdeas: string[] };
  providers: ProviderOption[];
  selectedProvider: NewsletterProvider;
  kit: { apiKey: string; list: string; sourceTag: string };
  form: { layout: FormLayout; placeholder: string; cta: string; consent: boolean; consentCopy: string };
  socialProof: {
    style: "count" | "quotes" | "both";
    template: string;
    pullCount: boolean;
    subscribers: string;
    showPublic: boolean;
    quotes: BulletRow[];
  };
  whatYoullGet: { heading: string; bullets: BulletRow[] };
  pastIssues: { show: boolean; issues: PastIssue[] };
  faq: NlFaq[];
  footerCta: { headline: string; button: string; fallback: string; showSocials: boolean };
  sectionTypes: NlSectionTile[];
};

export const newsletterSignupEditorFixture = (): NewsletterFixture => ({
  pageTitle: "Subscribe",
  slug: "subscribe",
  live: true,
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
  titleSlugAlts: [
    { title: "Subscribe", slug: "subscribe" },
    { title: "Newsletter", slug: "newsletter" },
    { title: "Stay in touch", slug: "stay-in-touch" },
    { title: "Updates", slug: "updates" },
  ],
  seo: {
    title: "Subscribe to Strong Not Skinny — by Alexandra Silva",
    description:
      "Honest essays on training, recovery and building strength without burning out. New posts every Tuesday — straight to your inbox.",
  },
  hero: {
    headline: "Get my weekly notes on training without burning out.",
    sub: "One short, honest email every Tuesday. Drills, mindset shifts, recovery tactics — no spam, no fluff.",
    headlineIdeas: ["Get my weekly notes", "Never miss a release", "Join 12k creators learning X", "Curated insights every Tuesday"],
  },
  providers: [
    { value: "kit", label: "Kit (ConvertKit)" },
    { value: "beehiiv", label: "Beehiiv" },
    { value: "mailerlite", label: "MailerLite" },
    { value: "mailchimp", label: "Mailchimp" },
    { value: "klaviyo", label: "Klaviyo" },
    { value: "google-sheets", label: "Google Sheets" },
    { value: "webhook", label: "Generic webhook" },
  ],
  selectedProvider: "kit",
  kit: {
    apiKey: "cnvrt_••••••••••••••••aB42",
    list: "Main signup form",
    sourceTag: "tadaify-alexandra-subscribe-page",
  },
  form: {
    layout: "oneline",
    placeholder: "you@email.com",
    cta: "Subscribe",
    consent: true,
    consentCopy: "I agree to receive emails from Alexandra and accept the privacy policy.",
  },
  socialProof: {
    style: "count",
    template: "Join {count} creators learning to train smarter",
    pullCount: true,
    subscribers: "24,512",
    showPublic: true,
    quotes: [
      { id: "sq1", text: '"Best fitness newsletter I read. Honest, no-fluff." — Mira, Berlin' },
      { id: "sq2", text: '"Alex\'s Tuesday emails are the only ones I open every week." — Daniel, NYC' },
    ],
  },
  whatYoullGet: {
    heading: "Here's what lands in your inbox:",
    bullets: [
      { id: "b1", emoji: "📅", text: "One short essay every Tuesday — usually 4-7 minutes to read." },
      { id: "b2", emoji: "🏋️", text: "Weekly drills you can try in your next session — no fancy gear." },
      { id: "b3", emoji: "🛌", text: "Recovery + sleep tactics that actually work for non-athletes." },
      { id: "b4", emoji: "💌", text: "Behind-the-scenes from my own training — the failures included." },
    ],
  },
  pastIssues: {
    show: true,
    issues: [
      { id: "pi1", cover: "📈", tone: "warm", title: "Why I stopped chasing PRs", excerpt: "Hitting a wall at 165kg taught me more about programming than any deload week ever did.", meta: "Apr 22 · 6 min read" },
      { id: "pi2", cover: "💤", tone: "", title: "Sleep is the cheat code", excerpt: "Three small experiments that doubled my deep-sleep minutes — backed by my Whoop data.", meta: "Apr 15 · 5 min read" },
      { id: "pi3", cover: "🧠", tone: "rose", title: "Mental reps > physical reps", excerpt: "Visualisation is real, but only if you do it the way Olympic divers do — not the way Instagram does.", meta: "Apr 08 · 7 min read" },
    ],
  },
  faq: [
    { id: "nf1", q: "How often will you email me?", a: "Once a week, every Tuesday morning. Sometimes a bonus drop alert when something time-sensitive lands. Never daily, never twice in one day." },
    { id: "nf2", q: "Can I unsubscribe at any time?", a: "Yes — every email has a one-click unsubscribe link in the footer. No survey, no \"are you sure\" — instant." },
    { id: "nf3", q: "Will you sell or share my email?", a: "Never. Your email lives in my Kit account and that's it. I don't sell, share, swap or rent lists. GDPR-compliant by default." },
  ],
  footerCta: {
    headline: "Ready? It's one click + your email.",
    button: "Subscribe now",
    fallback: "Or follow on Instagram, TikTok and YouTube — links in your bio.",
    showSocials: true,
  },
  sectionTypes: [
    { type: "hero", emoji: "🎯", name: "Hero", sub: "Big headline + sub-headline + optional image. The first thing visitors read.", already: true },
    { type: "provider", emoji: "🔌", name: "Email provider", sub: "Where new subscribers land — Kit, Beehiiv, Mailchimp + 4 more.", already: true },
    { type: "form", emoji: "📝", name: "Signup form", sub: "Email field + button. Three layout variants.", already: true },
    { type: "social-proof", emoji: "⭐", name: "Social proof", sub: "Subscriber count + testimonial quotes.", already: true },
    { type: "what-youll-get", emoji: "📬", name: "What you'll get", sub: "Bullet list — frequency, topics, format.", already: true },
    { type: "past-issues", emoji: "📰", name: "Past issues", sub: "3 most recent posts pulled from your provider.", tier: "creator" },
    { type: "faq", emoji: "❓", name: "FAQ", sub: "3-5 Q&A pairs. Tackle objections before they kill the signup.", already: true },
    { type: "footer-cta", emoji: "🚀", name: "Footer CTA", sub: "Closing button + social fallback for hesitant visitors.", already: true },
    { type: "cover-image", emoji: "🖼", name: "Full-width image", sub: "A standalone image break between sections." },
    { type: "quote", emoji: "💬", name: "Pull quote", sub: "A single large quote from a subscriber or press mention." },
    { type: "video", emoji: "🎬", name: "Video intro", sub: "YouTube or Vimeo embed — for creators who want a personal hello." },
  ],
});
