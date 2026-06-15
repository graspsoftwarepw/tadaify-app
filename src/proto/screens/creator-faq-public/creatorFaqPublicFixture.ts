/**
 * Typed mock seam for the public FAQ / Help Center page. Mirrors
 * mockups/tadaify-mvp/creator-faq-public.html so the screen graduates by
 * swapping these factories for the real published-page loader. Defines the
 * FR's rendered data contract.
 *
 * @implements fr-creator-faq-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type FaqQuestion = {
  /** Stable slug used by the question deep-link (#/q/<slug> in the mockup). */
  slug: string;
  q: string;
  /** Answer paragraphs; an array entry that is `string[]` renders as a list. */
  body: (string | string[])[];
  tags: string[];
};

export type FaqSection = {
  slug: string;
  icon: string;
  title: string;
  intro: string;
  questions: FaqQuestion[];
};

export type FaqContent = {
  creator: PublicCreator;
  hero: { title: string; lede: string };
  meta: { questions: number; sections: number; updated: string };
  tags: string[];
  sections: FaqSection[];
  footerSocials: PublicSocial[];
};

export function faqContentFixture(): FaqContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    hero: {
      title: "FAQ",
      lede: "Answers to the questions I get every week — about training plans, refunds, coaching calls, and how to access your downloads.",
    },
    meta: { questions: 47, sections: 6, updated: "Apr 24, 2026" },
    tags: ["login", "downloads", "refund", "booking", "payment", "policy", "shipping", "sizing", "premium"],
    sections: [
      {
        slug: "account",
        icon: "🔑",
        title: "Account & access",
        intro: "Everything about logging in, downloads, and getting back into your training plan.",
        questions: [
          {
            slug: "reset-password",
            q: "How do I reset my password?",
            body: [
              "Go to tadaify.com/login and click \"Forgot password\". You'll get a reset link by email within 60 seconds. The link is valid for 1 hour.",
              "If the email never arrives, check spam first — Gmail occasionally filters reset emails. Still missing? DM me and I'll send a manual reset.",
            ],
            tags: ["login"],
          },
          {
            slug: "download-pdf",
            q: "Where can I download the training PDF after I bought it?",
            body: [
              "After checkout you'll get an email from no-reply@tadaify.com with your download link. The link is also pinned in your account at tadaify.com/alexandra/account.",
              "Heads up:",
              [
                "The link expires after 30 days, but you can re-generate it from your account.",
                "The PDF is watermarked with your email — please don't share it publicly.",
              ],
              "If the email never arrived, check spam first, then DM me — I'll resend within an hour.",
            ],
            tags: ["downloads", "post-purchase"],
          },
          {
            slug: "share-account",
            q: "Can I share my account with my workout partner?",
            body: [
              "Account sharing isn't allowed — each plan is licensed per person. If you'd like to train together, the second account is 50% off with code TRAIN2GETHER at checkout.",
            ],
            tags: ["policy", "login"],
          },
        ],
      },
      {
        slug: "billing",
        icon: "💳",
        title: "Billing & refunds",
        intro: "30-day money-back guarantee. Stripe handles all payments — your card details never touch my server.",
        questions: [
          {
            slug: "refund-policy",
            q: "What's your refund policy?",
            body: [
              "You get 30 days from purchase to ask for a full refund — no questions asked. Just reply to your purchase confirmation email and I'll refund you within 24 hours.",
              "The only exception is custom 1:1 plans — once I've delivered the personalised plan PDF, refunds are partial (50%).",
            ],
            tags: ["refund", "policy"],
          },
          {
            slug: "double-charge",
            q: "Why was I charged twice this month?",
            body: [
              "That's unusual. Most often it's an authorisation hold (especially on prepaid cards) that drops off in 3-5 business days, not an actual charge — Stripe shows both as \"pending\" briefly.",
              "If you see two completed charges after 5 days, send me your order numbers and I'll refund the duplicate within 24 hours.",
            ],
            tags: ["billing"],
          },
          {
            slug: "payment-plans",
            q: "Do you offer payment plans for the 12-week program?",
            body: [
              "Yes — at checkout you can split into 3 monthly payments via Stripe (no extra fees). For 6+ payments, message me directly and I'll set up a custom plan.",
            ],
            tags: ["payment"],
          },
        ],
      },
      {
        slug: "coaching",
        icon: "🎯",
        title: "1:1 coaching calls",
        intro: "Booking, rescheduling, what to bring, and how recordings work.",
        questions: [
          {
            slug: "book-call",
            q: "How do I book my onboarding call?",
            body: [
              "After purchase you'll get an email with a Cal.com link to my schedule. Pick any 45-minute slot in the next 14 days. If nothing works, reply to that email and I'll open extra slots.",
            ],
            tags: ["booking"],
          },
          {
            slug: "reschedule",
            q: "Can I reschedule a call last-minute?",
            body: [
              "Up to 24 hours before, just hit \"Reschedule\" in the Cal.com confirmation email — no fee. Inside 24 hours I'll do my best to swap, but I can't always promise.",
            ],
            tags: ["booking"],
          },
        ],
      },
      {
        slug: "shipping",
        icon: "📦",
        title: "Shipping & delivery",
        intro: "Times, tracking, and the regions I currently ship to.",
        questions: [
          {
            slug: "shipping-times",
            q: "How long does shipping take?",
            body: [
              "EU: 3-5 business days. UK: 5-7. US/Canada: 7-12. Rest of world: up to 21. You'll get a tracking link the moment your label is printed.",
            ],
            tags: ["shipping"],
          },
        ],
      },
      {
        slug: "product",
        icon: "🧰",
        title: "Product details",
        intro: "Sizing, materials, and how to take care of your gear.",
        questions: [
          {
            slug: "sizing",
            q: "How do I pick the right size?",
            body: [
              "Each product page has a size chart with chest / waist / hip in cm and inches. If you're between sizes, size up — the cut is on the fitted side.",
            ],
            tags: ["sizing"],
          },
        ],
      },
      {
        slug: "legal",
        icon: "⚖️",
        title: "Legal & policy",
        intro: "Privacy, terms, and how I handle your data.",
        questions: [
          {
            slug: "data-handling",
            q: "What data do you collect, and where is it stored?",
            body: [
              "I store the bare minimum: your name, email, purchases, and any messages you send me. Everything is on EU servers (Supabase Frankfurt). I never sell your data.",
              "You can request a full export or deletion at any time by emailing privacy@strongnotskinny.com. GDPR + UK GDPR rights apply.",
            ],
            tags: ["policy", "premium"],
          },
        ],
      },
    ],
    footerSocials: [
      { label: "Instagram", glyph: "IG" },
      { label: "TikTok", glyph: "TT" },
      { label: "YouTube", glyph: "YT" },
      { label: "Email", glyph: "@" },
    ],
  };
}
