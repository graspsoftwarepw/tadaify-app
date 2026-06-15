/**
 * Typed mock seam for the public Legal page. Mirrors
 * mockups/tadaify-mvp/creator-legal-public.html so the screen graduates by
 * swapping these factories for the real published-policies loader. Defines the
 * FR's rendered data contract: the page meta (last reviewed, policy count) plus
 * the ordered list of policies, each with an icon, version/effective metadata,
 * a body of sections (heading + paragraphs / lists / blockquote), a permalink,
 * and an optional archived-version history.
 *
 * @implements fr-creator-legal-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

/** A rendered block inside a policy body. */
export type PolicyBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "p"; html: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "blockquote"; html: string };

export type PolicyVersion = {
  version: string;
  /** Effective range shown in the version-history list. */
  range: string;
};

export type LegalPolicy = {
  /** Anchor slug + pill/TOC id. */
  id: string;
  emoji: string;
  title: string;
  version: string;
  /** Effective date line (e.g. "Effective Apr 1, 2026"). */
  effective: string;
  /** Optional extra meta chip (e.g. "Updated Mar 28, 2026" or "GDPR variant"). */
  note?: string;
  /** TOC sub-entries: [anchor id, label]. */
  toc: { id: string; label: string }[];
  body: PolicyBlock[];
  /** Permalink shown in the policy footer. */
  permalink: string;
  /** Past versions, newest first. Empty = no version-history disclosure. */
  history: PolicyVersion[];
};

export type LegalContent = {
  creator: PublicCreator;
  hero: { title: string; lede: string };
  /** Page meta line. */
  lastReviewed: string;
  nextReview: string;
  languages: string;
  policies: LegalPolicy[];
  /** Direct contact line under the page footer. */
  contactEmail: string;
  copyright: string;
  footerSocials: PublicSocial[];
};

export function legalContentFixture(): LegalContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    hero: {
      title: "Legal",
      lede: "All the policies that apply to your use of Strong Not Skinny — the website, the courses, the coaching subscriptions, and any communications we send you.",
    },
    lastReviewed: "Apr 1, 2026",
    nextReview: "Apr 1, 2027",
    languages: "🇬🇧 English",
    contactEmail: "hello@strongnotskinny.com",
    copyright: "© 2026 Strong Not Skinny by Alexandra Silva",
    footerSocials: [
      { label: "Instagram", glyph: "📸" },
      { label: "TikTok", glyph: "🎬" },
      { label: "YouTube", glyph: "▶️" },
    ],
    policies: [
      {
        id: "terms",
        emoji: "📜",
        title: "Terms of Service",
        version: "v1.2",
        effective: "Effective Apr 1, 2026",
        note: "Updated Mar 28, 2026",
        toc: [
          { id: "terms-acceptance", label: "Acceptance of terms" },
          { id: "terms-eligibility", label: "Eligibility" },
          { id: "terms-payments", label: "Subscriptions and payments" },
          { id: "terms-ip", label: "Intellectual property" },
          { id: "terms-disclaimer", label: "Disclaimer of warranties" },
          { id: "terms-liability", label: "Limitation of liability" },
          { id: "terms-law", label: "Governing law" },
        ],
        body: [
          { kind: "heading", id: "terms-acceptance", text: "1. Acceptance of terms" },
          {
            kind: "p",
            html: "By accessing strongnotskinny.com (the “Site”) and any products or services we offer, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.",
          },
          { kind: "heading", id: "terms-eligibility", text: "2. Eligibility" },
          {
            kind: "p",
            html: "You must be at least 18 years old, or the age of majority in your jurisdiction, to purchase services or products from us. By placing an order, you represent that you meet this requirement.",
          },
          { kind: "heading", id: "terms-payments", text: "3. Subscriptions and payments" },
          {
            kind: "p",
            html: "Coaching subscriptions auto-renew monthly at the price displayed at the time of your initial purchase. You may cancel at any time from your account dashboard; cancellation takes effect at the end of the current billing period. We do not provide pro-rated refunds for unused portions of an already-billed period.",
          },
          {
            kind: "p",
            html: "All payments are processed by Stripe. We do not store your card details on our servers.",
          },
          { kind: "heading", id: "terms-ip", text: "4. Intellectual property" },
          {
            kind: "p",
            html: "All training plans, video content, and written materials are owned by Alexandra Silva and may not be redistributed, resold, or reproduced without written permission. You may use our materials for your own personal, non-commercial use as the customer.",
          },
          { kind: "heading", id: "terms-disclaimer", text: "5. Disclaimer of warranties" },
          {
            kind: "blockquote",
            html: "Our content is for informational and educational purposes only and is not medical advice. Consult a qualified healthcare provider before starting any new fitness program.",
          },
          { kind: "heading", id: "terms-liability", text: "6. Limitation of liability" },
          {
            kind: "p",
            html: "To the maximum extent permitted by law, our total liability for any claim arising from your use of the Site is limited to the amount you paid us in the 12 months preceding the claim.",
          },
          { kind: "heading", id: "terms-law", text: "7. Governing law" },
          {
            kind: "p",
            html: "These Terms are governed by the laws of England and Wales. Any dispute will be resolved in the courts of London, United Kingdom.",
          },
        ],
        permalink: "tadaify.com/alexandra/legal#terms",
        history: [
          { version: "v1.1", range: "Effective Jan 15, 2026 to Mar 31, 2026" },
          { version: "v1.0", range: "Effective Sep 1, 2025 to Jan 14, 2026" },
        ],
      },
      {
        id: "privacy",
        emoji: "🔒",
        title: "Privacy Policy",
        version: "v2.0",
        effective: "Effective Apr 15, 2026",
        note: "GDPR variant",
        toc: [
          { id: "privacy-collect", label: "What we collect" },
          { id: "privacy-why", label: "Why we collect it" },
          { id: "privacy-retention", label: "How long we keep it" },
          { id: "privacy-rights", label: "Your rights" },
          { id: "privacy-transfers", label: "International transfers" },
          { id: "privacy-dpo", label: "Data Protection Officer" },
        ],
        body: [
          { kind: "heading", id: "privacy-collect", text: "1. What we collect" },
          {
            kind: "p",
            html: "We collect personal data you give us directly (name, email, billing address) and data automatically generated by your use of the Site (IP address, device type, pages visited, time on page).",
          },
          { kind: "heading", id: "privacy-why", text: "2. Why we collect it (legal basis under GDPR Art. 6)" },
          {
            kind: "ul",
            items: [
              "Performance of contract — to deliver the products and coaching you've purchased.",
              "Legitimate interest — to keep the Site secure and improve our services.",
              "Consent — for marketing emails and non-essential cookies. You can withdraw at any time.",
            ],
          },
          { kind: "heading", id: "privacy-retention", text: "3. How long we keep it" },
          {
            kind: "p",
            html: "Account data: as long as your account is active, plus 7 years for tax purposes after account closure (UK requirement).",
          },
          { kind: "p", html: "Anonymised analytics: 26 months (Google Analytics default)." },
          { kind: "heading", id: "privacy-rights", text: "4. Your rights" },
          {
            kind: "p",
            html: "Under GDPR you have the right to access, rectify, erase, restrict processing of, port, and object to processing of your personal data. Email hello@strongnotskinny.com to exercise any of these rights — we respond within 30 days.",
          },
          { kind: "heading", id: "privacy-transfers", text: "5. International transfers" },
          {
            kind: "p",
            html: "Some of our processors (Stripe, Google Workspace, Cloudflare) are based in the United States. Where data leaves the EU/UK, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission.",
          },
          { kind: "heading", id: "privacy-dpo", text: "6. Data Protection Officer" },
          {
            kind: "p",
            html: "We are not legally required to appoint a DPO, but data protection inquiries are handled by Alexandra Silva personally — privacy@strongnotskinny.com.",
          },
        ],
        permalink: "tadaify.com/alexandra/legal#privacy",
        history: [{ version: "v1.0", range: "Effective Sep 1, 2025 to Apr 14, 2026" }],
      },
      {
        id: "cookie",
        emoji: "🍪",
        title: "Cookie Policy",
        version: "v1.0",
        effective: "Effective Mar 1, 2026",
        toc: [
          { id: "cookie-what", label: "What cookies we set" },
          { id: "cookie-optout", label: "How to opt out" },
        ],
        body: [
          { kind: "heading", id: "cookie-what", text: "1. What cookies we set" },
          { kind: "p", html: "We use the following cookies on this Site:" },
          {
            kind: "ul",
            items: [
              "Essential — session_id, csrf_token (set by tadaify, lifetime: session). Required for the Site to function. Cannot be disabled.",
              "Analytics — _ga, _gid (Google Analytics, lifetime: 2 years and 24 hours). Help us understand how visitors use the Site. Set only with your consent.",
              "Payment — __stripe_mid, __stripe_sid (Stripe, lifetime: 1 year and 30 minutes). Set when you visit a checkout page; required to prevent fraud.",
            ],
          },
          { kind: "heading", id: "cookie-optout", text: "2. How to opt out" },
          {
            kind: "p",
            html: "You can manage your cookie preferences at any time via the cookie banner that appears on first visit, or by clicking “Cookie preferences” in our footer. You can also block cookies in your browser settings — note that blocking essential cookies will prevent the Site from working.",
          },
        ],
        permalink: "tadaify.com/alexandra/legal#cookie",
        history: [],
      },
      {
        id: "refund",
        emoji: "💸",
        title: "Refund Policy",
        version: "v1.1",
        effective: "Effective Apr 1, 2026",
        toc: [
          { id: "refund-window", label: "14-day refund window" },
          { id: "refund-eligibility", label: "Eligibility" },
          { id: "refund-howto", label: "How to request" },
        ],
        body: [
          { kind: "heading", id: "refund-window", text: "1. 14-day refund window" },
          {
            kind: "p",
            html: "We offer a 14-day money-back guarantee on all digital products and one-time coaching purchases. If you're not satisfied within 14 days of purchase, email us and we'll refund your payment in full — no questions asked.",
          },
          { kind: "heading", id: "refund-eligibility", text: "2. Eligibility" },
          {
            kind: "ul",
            items: [
              "One-time digital products (training plans, video courses, ebooks) — refundable within 14 days of purchase.",
              "Monthly coaching subscriptions — your first month is fully refundable within 14 days. After 14 days, cancel anytime to stop future renewals; we don't refund partial months.",
              "1:1 coaching sessions — refundable up to 24 hours before the scheduled session. Inside 24 hours, no refund (the slot is reserved for you).",
            ],
          },
          { kind: "heading", id: "refund-howto", text: "3. How to request" },
          {
            kind: "p",
            html: "Email refunds@strongnotskinny.com with your order number. We process refunds via Stripe within 5 business days; the refund typically appears on your statement within 5-10 business days after that, depending on your bank.",
          },
        ],
        permalink: "tadaify.com/alexandra/legal#refund",
        history: [],
      },
      {
        id: "dmca",
        emoji: "©️",
        title: "DMCA / Copyright Policy",
        version: "v1.0",
        effective: "Effective Mar 15, 2026",
        toc: [
          { id: "dmca-notice", label: "Filing a notice" },
          { id: "dmca-counter", label: "Counter-notice procedure" },
          { id: "dmca-agent", label: "Designated agent" },
        ],
        body: [
          { kind: "heading", id: "dmca-notice", text: "1. Filing a copyright notice" },
          {
            kind: "p",
            html: "If you believe any content on this Site infringes your copyright, send a written notice to our designated agent (below) including:",
          },
          {
            kind: "ol",
            items: [
              "A physical or electronic signature of the copyright owner or an authorized representative.",
              "Identification of the copyrighted work claimed to have been infringed.",
              "Identification of the material claimed to be infringing, with information sufficient to locate it (URL).",
              "Your contact information (name, address, email, phone).",
              "A statement that you have a good faith belief that use of the material is not authorized.",
              "A statement, under penalty of perjury, that the information in your notice is accurate and that you are authorized to act.",
            ],
          },
          { kind: "heading", id: "dmca-counter", text: "2. Counter-notice procedure" },
          {
            kind: "p",
            html: "If your content has been removed in response to a DMCA notice and you believe the removal was a mistake, you may file a counter-notice with the same information requirements (per 17 USC §512(g)). We will reinstate the content 10-14 business days after receiving a valid counter-notice, unless the original complainant files a court action.",
          },
          { kind: "heading", id: "dmca-agent", text: "3. Designated agent for DMCA notices" },
          {
            kind: "blockquote",
            html: "Alexandra Silva — DMCA Designated Agent · Email: dmca@strongnotskinny.com · Postal: 12 Example Street, London EC1A 1BB, United Kingdom · Phone: +44 20 0000 0000",
          },
        ],
        permalink: "tadaify.com/alexandra/legal#dmca",
        history: [],
      },
    ],
  };
}
