/**
 * Typed mock seam for the FAQ / Help Center page editor. Mirrors the data shown
 * in mockups/tadaify-mvp/app-page-faq.html so the screen graduates by swapping
 * this factory for the real loader.
 *
 * @implements fr-page-editor-faq
 */
export type FaqQuestion = {
  id: string;
  q: string;
  helpful?: number;
  helpfulLow?: boolean;
  updated: string;
  tags: string[];
};

export type FaqSection = {
  id: string;
  icon: string;
  name: string;
  count: number;
  intro: string;
  collapsed?: boolean;
  questions: FaqQuestion[];
};

export type FaqExpandMode = "first" | "collapsed" | "expanded";

export type FaqSectionTile = { type: string; emoji: string; name: string; sub: string };
export type FaqStarterPack = { id: string; emoji: string; name: string; sections: string[] };

export type FaqFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  showInNav: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  titleAlts: { title: string; slug: string }[];
  seo: { title: string; description: string };
  behaviour: {
    search: boolean;
    toc: boolean;
    expandMode: FaqExpandMode;
    helpful: boolean;
    tags: boolean;
  };
  index: { questions: number; sections: number; tags: number };
  sections: FaqSection[];
  sectionTypes: FaqSectionTile[];
  starterPacks: FaqStarterPack[];
};

export const faqEditorFixture = (): FaqFixture => ({
  pageTitle: "FAQ",
  slug: "faq",
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
  titleAlts: [
    { title: "FAQ", slug: "faq" },
    { title: "Help Center", slug: "help" },
    { title: "Support", slug: "support" },
    { title: "Common questions", slug: "questions" },
  ],
  seo: {
    title: "FAQ — Strong Not Skinny by Alexandra Silva",
    description:
      "Answers to common questions about training plans, refunds, coaching calls, and how to access your downloads.",
  },
  behaviour: {
    search: true,
    toc: true,
    expandMode: "first",
    helpful: true,
    tags: true,
  },
  index: { questions: 47, sections: 6, tags: 18 },
  sections: [
    {
      id: "account",
      icon: "🔑",
      name: "Account & access",
      count: 8,
      intro: "Everything about logging in, downloads, and getting back into your training plan.",
      questions: [
        { id: "q-pw", q: "How do I reset my password?", helpful: 93, updated: "3d ago", tags: ["login"] },
        { id: "q-dl", q: "Where can I download the training PDF after I bought it?", helpful: 89, updated: "1w ago", tags: ["downloads"] },
        { id: "q-share", q: "Can I share my account with my workout partner?", helpful: 42, helpfulLow: true, updated: "2w ago", tags: ["policy"] },
      ],
    },
    {
      id: "billing",
      icon: "💳",
      name: "Billing & refunds",
      count: 12,
      intro: "30-day money-back guarantee. Stripe handles all payments — your card details never touch my server.",
      questions: [
        { id: "q-refund", q: "What's your refund policy?", helpful: 96, updated: "yesterday", tags: ["refund", "policy"] },
        { id: "q-twice", q: "Why was I charged twice this month?", helpful: 51, helpfulLow: true, updated: "3w ago", tags: ["billing"] },
        { id: "q-plans", q: "Do you offer payment plans for the 12-week program?", helpful: 78, updated: "1mo ago", tags: ["payment"] },
      ],
    },
    {
      id: "coaching",
      icon: "🎯",
      name: "1:1 coaching calls",
      count: 7,
      collapsed: true,
      intro: "Booking, rescheduling, what to bring, and how recordings work.",
      questions: [
        { id: "q-book", q: "How do I book my onboarding call?", updated: "5d ago", tags: ["booking"] },
      ],
    },
  ],
  sectionTypes: [
    { type: "account", emoji: "🔑", name: "Account & access", sub: "Login, password reset, downloads." },
    { type: "billing", emoji: "💳", name: "Billing & refunds", sub: "Charges, refunds, invoices." },
    { type: "shipping", emoji: "📦", name: "Shipping & delivery", sub: "Times, tracking, regions." },
    { type: "returns", emoji: "↩️", name: "Returns & exchanges", sub: "Process, conditions, timeline." },
    { type: "product", emoji: "🧰", name: "Product details", sub: "Sizing, materials, care." },
    { type: "technical", emoji: "🛠", name: "Technical help", sub: "Bugs, supported devices, exports." },
    { type: "booking", emoji: "📅", name: "Booking & scheduling", sub: "How to book, reschedule, cancel." },
    { type: "legal", emoji: "⚖️", name: "Legal & policy", sub: "Privacy, terms, copyright." },
    { type: "blank", emoji: "📄", name: "Blank section", sub: "Start from scratch with your own name." },
  ],
  starterPacks: [
    { id: "ecommerce", emoji: "🛍", name: "E-commerce returns", sections: ["Returns & exchanges", "Shipping & delivery", "Sizing & product", "Billing"] },
    { id: "course", emoji: "🎓", name: "Course buyer", sections: ["Access & downloads", "Refund policy", "Community access"] },
    { id: "coaching", emoji: "🎯", name: "Coaching client", sections: ["Booking & scheduling", "What's included", "Results timeline"] },
    { id: "general", emoji: "🏠", name: "General help", sections: ["Account & access", "Billing & refunds", "Technical help", "Contact"] },
  ],
});
