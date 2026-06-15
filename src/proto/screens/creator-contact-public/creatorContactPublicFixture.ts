/**
 * Typed mock seam for the public Contact page. Mirrors
 * mockups/tadaify-mvp/creator-contact-public.html so the screen graduates by
 * swapping these factories for the real published-page loader. Defines the
 * FR's rendered data contract.
 *
 * @implements fr-creator-contact-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type ContactFaq = { q: string; a: string };

export type ContactMethod = {
  icon: string;
  label: string;
  value: string;
  href: string;
};

export type InlineSocial = { glyph: string; label: string; href: string };

export type ContactContent = {
  creator: PublicCreator;
  hero: { icon: string; heading: string; lede: string };
  hours: string;
  faqHeading: string;
  faqs: ContactFaq[];
  inquiryTypes: string[];
  methods: ContactMethod[];
  address: { label: string; value: string };
  inlineSocials: InlineSocial[];
  footerSocials: PublicSocial[];
};

export function contactContentFixture(): ContactContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    hero: {
      icon: "📮",
      heading: "Let's work together.",
      lede: "For project briefs, coaching calls, speaking invitations or just a friendly hello — I usually reply within 24h on weekdays.",
    },
    hours: "Replies usually within 24h · Mon–Fri 9-17 GMT",
    faqHeading: "Before you write — answers to the 3 most common questions",
    faqs: [
      {
        q: "How fast do you reply?",
        a: "Within 24h on weekdays. Weekends are off — I don't check email Sat/Sun on purpose. If it's truly urgent, mention \"URGENT\" in the subject and I'll triage faster.",
      },
      {
        q: "What's your typical project rate?",
        a: "Coaching packages start at £450 / month for 4 weekly sessions. One-off form-check sessions are £85. Custom programming is £600. Send me your goal in the form and I'll match you with the right option.",
      },
      {
        q: "Do you take on pro-bono / charity work?",
        a: "Yes — one project per quarter. Reach out with a short pitch (mission, audience, ask) and I'll let you know if it's a fit for the next slot.",
      },
    ],
    inquiryTypes: [
      "Coaching package",
      "Speaking / podcast",
      "Brand partnership",
      "General question",
    ],
    methods: [
      { icon: "✉️", label: "Email", value: "hello@alexandrasilva.com", href: "mailto:hello@alexandrasilva.com" },
      { icon: "📞", label: "Phone", value: "+44 20 7946 0192", href: "tel:+442079460192" },
      { icon: "📱", label: "WhatsApp", value: "+44 7700 900123", href: "https://wa.me/447700900123" },
      { icon: "📷", label: "Instagram DMs", value: "@alexandrasilva", href: "https://instagram.com/alexandrasilva" },
    ],
    address: {
      label: "Studio",
      value: "71 Shoreditch High Street, London E1 6JJ, United Kingdom",
    },
    inlineSocials: [
      { glyph: "📷", label: "Instagram", href: "https://instagram.com/alexandrasilva" },
      { glyph: "🐦", label: "X / Twitter", href: "https://twitter.com/alex_silva" },
      { glyph: "💼", label: "LinkedIn", href: "https://linkedin.com/in/alexandra-silva" },
    ],
    footerSocials: [
      { label: "Instagram", glyph: "IG" },
      { label: "TikTok", glyph: "TT" },
      { label: "YouTube", glyph: "YT" },
    ],
  };
}
