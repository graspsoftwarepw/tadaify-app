/**
 * Landing page FAQ items — exported for testability.
 *
 * DEC-355=C (2026-05-04): F-001 guest-mode permanently dropped.
 * FAQ answer for "How fast can I launch?" must never promise guest mode.
 * See: docs/decisions/0049-drop-f001-guest-mode-signup-first.md
 * See: feedback_tadaify_no_guest_mode_drafts.md
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const landingFaqItems: FaqItem[] = [
  {
    q: "Can I migrate my existing bio-link page?",
    a: "Yes. Paste your existing bio-link URL on signup — we auto-import your links in 30 seconds. Custom themes, scheduled links, email-capture blocks all come across. No manual copying.",
  },
  {
    /* Per DEC-043 (0007-everything-free-gating.md) — 0% fees on EVERY tier, including Free.
       Commerce features (shop, paid articles, tip jar) work on every tier.
       Pricing differentiation = custom-domain add-on + Pro power features + Business agency tools. */
    q: "Do you charge seller fees?",
    a: "0% platform fees on every tier, forever — including Free. Commerce features (shop, paid articles, tip jar) work the same on every tier; we never take a cut of your revenue. The only paid extras are your own custom domain ($1.99/mo add-on), Creator power features ($7.99/mo), Pro team + automation tools ($19.99/mo), and Business agency seats ($49.99/mo) — never a gate on whether you can sell.",
  },
  {
    q: "What about the data I put in?",
    a: "Your data. Export anytime as JSON or CSV. Delete your account — everything goes, including payment history, analytics, and email subscribers. GDPR Article 20 (portability) + Article 17 (erasure) compliant. We never sell creator data.",
  },
  {
    q: "What's the catch?",
    a: "No catch. Every product feature is on Free. You pay only if you want a custom domain ($1.99/mo add-on), or if you want Creator ($7.99) which bundles the domain with priority support and longer analytics retention, or Pro ($19.99) for team seats + custom code + email automations, or Business ($49.99) for agency sub-accounts and white-label.",
  },
  {
    q: "Do you have AI features?",
    /* DEC-AI-QUOTA-LADDER-01 / DEC-286 (0030): Free 5 credits/mo, Creator 20/mo, Pro 100/mo, Business unlimited */
    a: "Yes — three at MVP: theme matcher, bio rewrite, and page-copy suggestions. Free tier: 5 AI credits/month. Creator: 20/mo. Pro: 100/mo. Business: unlimited. Every AI edit shows a diff before applying — you approve, we never overwrite your voice silently.",
  },
  {
    /* DEC-355=C (2026-05-04): F-001 guest-mode permanently dropped. Tadaify is signup-first (Linktree/Beacons model). */
    q: "How fast can I launch?",
    a: "30 seconds to claim your handle and go live. Sign up, pick a template, add your links — most creators publish their first page in under 5 minutes.",
  },
];
