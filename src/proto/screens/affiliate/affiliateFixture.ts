/**
 * Typed mock seam for the creator-side Affiliate program screen. Mirrors the
 * data shown in mockups/tadaify-mvp/app-affiliate.html so the screen graduates
 * by swapping this factory for the real loader.
 *
 * @implements fr-affiliate
 */

export type AffiliateStat = {
  /** Stable key. */
  id: string;
  label: string;
  /** Currency-prefixed value, split so the "$" + cents render muted. */
  whole: string;
  cents: string;
  /** Sub-line under the value. */
  delta: string;
  /** Render the delta in the muted (non-positive) colour. */
  deltaMuted?: boolean;
};

export type ShareCopy = {
  id: string;
  /** Leading glyph (rendered as plain text, matching the mockup). */
  icon: string;
  title: string;
  /** The pre-written copy block. */
  body: string;
  /** Secondary action label + the alert copy it fires (mockup no-op). */
  secondaryLabel: string;
  secondaryAlert: string;
  /** True only for the X card, which gets the "Post to X →" primary button. */
  isTwitter?: boolean;
};

export type ShareGraphic = {
  id: string;
  /** Visual variant → gradient class on `.gfx`. */
  variant: "indigo" | "warm" | "green";
  /** Caption lines rendered inside the tile. */
  lines: string[];
  /** Alert copy fired on click (mockup no-op download). */
  alert: string;
};

export type ReferralTier = "creator" | "pro" | "business";
export type ReferralStatus = "active" | "pending" | "churned";

export type Referral = {
  id: string;
  /** Anonymized email. */
  email: string;
  tier: ReferralTier;
  tierLabel: string;
  joined: string;
  status: ReferralStatus;
  statusLabel: string;
  /** Monthly share, or "—" when none. */
  share: string;
};

export type AffiliateFixture = {
  /** Creator handle the referral link is derived from. */
  handle: string;
  /** Fully-formed referral URL. */
  refUrl: string;
  badge: string;
  stats: AffiliateStat[];
  shareCopies: ShareCopy[];
  graphics: ShareGraphic[];
  referrals: Referral[];
};

export const affiliateFixture = (handle = "alexandra"): AffiliateFixture => ({
  handle,
  refUrl: `https://tadaify.com/?ref=${handle}`,
  badge: "⚡ 30% recurring",
  stats: [
    {
      id: "lifetime",
      label: "Lifetime earnings",
      whole: "1,284",
      cents: ".50",
      delta: "+ $128 last 30 days",
    },
    {
      id: "month",
      label: "This month",
      whole: "128",
      cents: ".00",
      delta: "8 active subscribers",
    },
    {
      id: "pending",
      label: "Pending payout",
      whole: "92",
      cents: ".00",
      delta: "Released on the 1st",
      deltaMuted: true,
    },
  ],
  shareCopies: [
    {
      id: "tweet",
      icon: "𝕏",
      title: "Tweet / X post",
      body: `Just moved my links to @tadaify and the analytics are next-level. Got a referral link if you want a fair shake on signup → https://tadaify.com/?ref=${handle}`,
      secondaryLabel: "Post to X →",
      secondaryAlert: "Mockup — would open an X compose window",
      isTwitter: true,
    },
    {
      id: "ig",
      icon: "📸",
      title: "Instagram bio / story",
      body: `my link-in-bio is now on tadaify ✨ better analytics, better payouts, free forever for the basics → tadaify.com/?ref=${handle}`,
      secondaryLabel: "Open in IG →",
      secondaryAlert: "Mockup — would open IG-story deep link",
    },
  ],
  graphics: [
    {
      id: "square",
      variant: "indigo",
      lines: ["Refer creators", "Earn 30% recurring"],
      alert: "Mockup — would download 1080×1080 PNG",
    },
    {
      id: "story",
      variant: "warm",
      lines: [`tadaify.com/?ref=${handle}`],
      alert: "Mockup — would download 1080×1920 IG story PNG",
    },
    {
      id: "og",
      variant: "green",
      lines: ["Switch to tadaify", "+ get 30% off forever"],
      alert: "Mockup — would download 1200×630 OG card",
    },
  ],
  referrals: [
    { id: "r1", email: "m••••@gmail.com", tier: "pro", tierLabel: "Pro", joined: "Apr 22, 2026", status: "active", statusLabel: "Active", share: "$4.50/mo" },
    { id: "r2", email: "k••••@protonmail.com", tier: "creator", tierLabel: "Creator", joined: "Apr 20, 2026", status: "active", statusLabel: "Active", share: "$1.50/mo" },
    { id: "r3", email: "j••••@hey.com", tier: "business", tierLabel: "Business", joined: "Apr 14, 2026", status: "active", statusLabel: "Active", share: "$14.70/mo" },
    { id: "r4", email: "n••••@outlook.com", tier: "creator", tierLabel: "Creator", joined: "Apr 10, 2026", status: "active", statusLabel: "Active", share: "$1.50/mo" },
    { id: "r5", email: "p••••@gmail.com", tier: "pro", tierLabel: "Pro", joined: "Apr 02, 2026", status: "pending", statusLabel: "Trial", share: "—" },
    { id: "r6", email: "v••••@icloud.com", tier: "creator", tierLabel: "Creator", joined: "Mar 28, 2026", status: "active", statusLabel: "Active", share: "$1.50/mo" },
    { id: "r7", email: "z••••@gmail.com", tier: "pro", tierLabel: "Pro", joined: "Mar 12, 2026", status: "active", statusLabel: "Active", share: "$4.50/mo" },
    { id: "r8", email: "l••••@gmail.com", tier: "creator", tierLabel: "Creator", joined: "Feb 24, 2026", status: "churned", statusLabel: "Cancelled", share: "—" },
  ],
});
