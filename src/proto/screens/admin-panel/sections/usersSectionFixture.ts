/**
 * Per-section fixture for the platform-admin Users pane: the filter <select>
 * option lists and the seeded creator table rows. Mirrors the static rows in
 * mockups/tadaify-mvp/admin-panel.html (#pane-users) 1:1.
 *
 * Mock-only typed view-model — no live data.
 *
 * @implements fr-admin-panel
 */

/** Status chip tone classes used in the table's Status column. */
export type UserStatusTone = "success" | "warn" | "danger" | "info";

/** Tier chip class suffixes (chip tier-free / tier-creator / …). */
export type UserTier = "Free" | "Creator" | "Pro" | "Business";

/** One row action a kebab menu can offer. */
export type UserRowAction =
  | { kind: "view"; label: string }
  | { kind: "login"; label: string }
  | { kind: "password-reset"; label: string }
  | { kind: "send-email"; label: string }
  | { kind: "refund"; label: string; alert: string }
  | { kind: "comp-upgrade"; label: string }
  | { kind: "suspend"; label: string; alert: string }
  | { kind: "unsuspend"; label: string }
  | { kind: "audit"; label: string }
  | { kind: "moderation"; label: string }
  | { kind: "hard-delete"; label: string }
  | { kind: "divider" };

export type UserRow = {
  name: string;
  handle: string;
  email: string;
  tier: UserTier;
  /** Avatar text + palette modifier class (av / av-2 … av-6). */
  avatarClass: string;
  avatarInitial: string;
  signup: string;
  lastActive: string;
  /** Tone used to colour the muted/subtle last-active text. */
  lastActiveTone: "muted" | "subtle";
  status: { label: string; tone: UserStatusTone };
  /** Formatted MRR string, or null for the em-dash placeholder. */
  mrr: string | null;
  /** Whether the row carries the is-suspended modifier. */
  suspended: boolean;
  actions: UserRowAction[];
};

export function userTierFilterOptions(): string[] {
  return ["All tiers", "Free", "Creator", "Pro", "Business"];
}

export function userStatusFilterOptions(): string[] {
  return ["All statuses", "Active", "Suspended", "Deleted"];
}

export function userSignupFilterOptions(): string[] {
  return ["Signup: any", "Last 7 days", "Last 30 days", "Last 90 days"];
}

export function userDomainFilterOptions(): string[] {
  return ["Domain: any", "Has custom domain", "No custom domain"];
}

export function userStripeFilterOptions(): string[] {
  return ["Stripe: any", "Has customer", "No customer"];
}

export function userRowsFixture(): UserRow[] {
  return [
    {
      name: "Maya Chen",
      handle: "maya_creates",
      email: "maya@example.com",
      tier: "Pro",
      avatarClass: "av",
      avatarInitial: "M",
      signup: "2026-01-12",
      lastActive: "2m ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: "$19.99",
      suspended: false,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "login", label: "Login as user" },
        { kind: "password-reset", label: "Force password reset" },
        { kind: "send-email", label: "Send custom email" },
        { kind: "divider" },
        { kind: "refund", label: "Refund last payment", alert: "Mockup — would refund last $19.99 charge via Stripe" },
        { kind: "comp-upgrade", label: "Comp upgrade tier" },
        { kind: "divider" },
        { kind: "suspend", label: "Suspend account", alert: "Mockup — would suspend account" },
        { kind: "audit", label: "View audit log" },
        { kind: "hard-delete", label: "Hard delete" },
      ],
    },
    {
      name: "Lukas Berg",
      handle: "lukas_b",
      email: "lukas@example.com",
      tier: "Free",
      avatarClass: "av av-2",
      avatarInitial: "L",
      signup: "2026-04-22",
      lastActive: "23m ago",
      lastActiveTone: "muted",
      status: { label: "Reported (4)", tone: "warn" },
      mrr: null,
      suspended: false,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "moderation", label: "View reports" },
        { kind: "suspend", label: "Suspend account", alert: "Mockup — would suspend" },
        { kind: "hard-delete", label: "Hard delete" },
      ],
    },
    {
      name: "DJ Captain",
      handle: "dance_captain",
      email: "dj@example.com",
      tier: "Free",
      avatarClass: "av av-3",
      avatarInitial: "D",
      signup: "2025-11-08",
      lastActive: "1h 12m ago",
      lastActiveTone: "subtle",
      status: { label: "Suspended", tone: "danger" },
      mrr: null,
      suspended: true,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "unsuspend", label: "Unsuspend account" },
      ],
    },
    {
      name: "Nina Foodie",
      handle: "nina_food",
      email: "nina@example.com",
      tier: "Creator",
      avatarClass: "av av-4",
      avatarInitial: "N",
      signup: "2026-02-04",
      lastActive: "5h ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: "$5.00",
      suspended: false,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "login", label: "Login as user" },
      ],
    },
    {
      name: "Yuki Park",
      handle: "yuki_p",
      email: "yuki@example.com",
      tier: "Business",
      avatarClass: "av av-5",
      avatarInitial: "Y",
      signup: "2025-09-18",
      lastActive: "11h ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: "$49.99",
      suspended: false,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "refund", label: "Refund last payment", alert: "Mockup — would refund last $49.99" },
      ],
    },
    {
      name: "Chris Helder",
      handle: "chris_h",
      email: "chris@example.com",
      tier: "Creator",
      avatarClass: "av av-6",
      avatarInitial: "C",
      signup: "2026-03-01",
      lastActive: "3d ago",
      lastActiveTone: "muted",
      status: { label: "Domain pending", tone: "info" },
      mrr: "$5.00",
      suspended: false,
      actions: [{ kind: "view", label: "View profile" }],
    },
    {
      name: "Sea Traveller",
      handle: "sea_traveller",
      email: "sea@example.com",
      tier: "Pro",
      avatarClass: "av",
      avatarInitial: "S",
      signup: "2026-04-21",
      lastActive: "2h ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: "$19.99",
      suspended: false,
      actions: [{ kind: "view", label: "View profile" }],
    },
    {
      name: "Dev Lab",
      handle: "dev_lab",
      email: "dev@example.com",
      tier: "Free",
      avatarClass: "av av-2",
      avatarInitial: "D",
      signup: "2026-04-26",
      lastActive: "12m ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: null,
      suspended: false,
      actions: [{ kind: "view", label: "View profile" }],
    },
    {
      name: "Alex Morgan",
      handle: "alex_morgan",
      email: "alex@example.com",
      tier: "Business",
      avatarClass: "av av-6",
      avatarInitial: "A",
      signup: "2025-08-04",
      lastActive: "15m ago",
      lastActiveTone: "muted",
      status: { label: "Active", tone: "success" },
      mrr: "$49.99",
      suspended: false,
      actions: [
        { kind: "view", label: "View profile" },
        { kind: "login", label: "Login as user" },
      ],
    },
  ];
}
