/**
 * Typed mock seam for the Settings · Danger zone tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-danger.html (the current-plan summary, the
 * delete-account consequence list + before-you-go checklist, and the read-only
 * account-action history) so the tab graduates by swapping this factory for the
 * real loader.
 *
 * @implements fr-settings
 */

export type ConsequenceTone = "bad" | "warn" | "good";

export type Consequence = {
  tone: ConsequenceTone;
  title: string;
  meta: string;
};

export type ChecklistStep = {
  title: string;
  sub: string;
  /** Optional cross-link label (mocked alert). */
  link?: string;
};

export type AccountAuditTone = "reactivate" | "cancel" | "pause" | "delete-attempt";

export type AccountAuditRow = {
  id: string;
  tone: AccountAuditTone;
  ico: string;
  event: string;
  meta: string;
  time: string;
};

export type DangerFixture = {
  planName: string;
  planPrice: string;
  renews: string;
  card: string;
  startedOn: string;
  daysInto: string;
  accountEmail: string;
  pausesRemaining: number;
  deleteConsequences: Consequence[];
  beforeYouGo: ChecklistStep[];
  history: AccountAuditRow[];
};

export function dangerFixture(): DangerFixture {
  return {
    planName: "Creator",
    planPrice: "$7.99/month",
    renews: "May 26, 2026",
    card: "Visa **** 4242",
    startedOn: "Apr 14, 2026",
    daysInto: "12 days into period",
    accountEmail: "alexandra@example.com",
    pausesRemaining: 2,
    deleteConsequences: [
      { tone: "bad", title: "Your tadaify page (tadaify.com/alexandra) is permanently deleted", meta: "All inbound links to your page will 404 after the 30-day grace window. Update any external links pointing here before deleting." },
      { tone: "bad", title: "Your handle @alexandra becomes available for someone else", meta: "After the grace period ends. We hold the handle for you for 30 days — sign back in within that window to recover everything." },
      { tone: "bad", title: "All your data is erased within 30 days", meta: "Profile, blocks, pages, subscribers, bookings, blog posts, analytics. Audit log retained for 90 days for legal compliance, then deleted. Encrypted backups expire within 60 days." },
      { tone: "bad", title: "Active subscriptions are cancelled (no refund)", meta: "You had access through your paid period. No proration refund unless you're within the 7-day money-back window (Apr 14–21, 2026)." },
      { tone: "warn", title: "Your custom domain DNS records are NOT auto-removed", meta: "After deletion, point alexandra.com elsewhere via your DNS provider — otherwise visitors hit a dangling domain. We can't manage your DNS for you." },
      { tone: "good", title: "30-day recovery window", meta: "If you change your mind, just sign in within 30 days using your existing email + password. Your account is fully restored — no support ticket needed." },
    ],
    beforeYouGo: [
      { title: "Download all your data", sub: "Get a ZIP of your blocks, subscribers, bookings, analytics. You can't ask for this after deletion.", link: "GDPR & data →" },
      { title: "Notify your subscribers", sub: "Send a final newsletter with your new contact info or alternative platform.", link: "Newsletter →" },
      { title: "Update other sites pointing to your tadaify URL", sub: "Instagram bio, TikTok link, YouTube about, business cards. Replace tadaify.com/alexandra with your new destination." },
      { title: "Update your custom domain DNS (if you have one)", sub: "Point alexandra.com away from tadaify before the grace window ends.", link: "Domain →" },
    ],
    history: [
      { id: "h1", tone: "reactivate", ico: "↻", event: "Subscription reactivated — $7.99/mo Creator", meta: "From: 192.0.2.18 · MacBook Air · Stripe sub_1OZk4F", time: "Apr 22, 14:08" },
      { id: "h2", tone: "cancel", ico: "×", event: "Subscription cancelled at period end (Dec 1, 2026) · Reason: Going on hiatus", meta: "From: 192.0.2.18 · MacBook Air · Stripe sub_1OZk4F", time: "Apr 22, 13:55" },
      { id: "h3", tone: "pause", ico: "⏸", event: "Subscription paused for 2 months (resume Jun 27, 2026)", meta: "From: 198.51.100.42 · iPhone Safari · Stripe sub_1OZk4F", time: "Apr 18, 09:12" },
      { id: "h4", tone: "delete-attempt", ico: "?", event: "Delete account modal opened — abandoned (closed without confirming)", meta: "From: 192.0.2.18 · MacBook Air · Session 8m", time: "Apr 16, 22:34" },
    ],
  };
}
