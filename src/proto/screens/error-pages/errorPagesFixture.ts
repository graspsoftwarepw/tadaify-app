/**
 * Typed fixture for the error-pages prototype — the 10 error / edge-case states
 * showcased in mockups/tadaify-mvp/error-pages.html. Copy is verbatim from the
 * mockup; only structure is reshaped for React rendering. Presentational data
 * only, no behaviour.
 *
 * @implements fr-error-pages
 */

/** A clickable action inside an error state. */
export type ErrorAction =
  | { kind: "home"; label: string; variant: "primary" | "warm" | "secondary" | "ghost" }
  | { kind: "mock"; label: string; variant: "primary" | "warm" | "secondary" | "ghost" };

export type EyebrowTone = "neutral" | "danger" | "warm" | "primary" | "success";
export type WrapTone = "primary" | "warm" | "danger" | "calm";

export type SuggestionFixture = {
  initial: string;
  name: string;
  handle: string;
  /** Optional inline avatar gradient override (matches the mockup). */
  avatarGradient?: string;
};

export type CacheItemFixture = {
  name: string;
  meta: string;
};

export type CountdownFixture = {
  hours: string;
  minutes: string;
  seconds: string;
};

export type ErrorStateFixture = {
  /** 1..10 — mirrors the mockup's data-state numbering. */
  state: number;
  /** Toolbar / switcher label, verbatim from the mockup's <option>. */
  switchLabel: string;
  wrapTone: WrapTone;
  eyebrowTone: EyebrowTone;
  eyebrow: string;
  /** Card heading. */
  heading: string;
  /**
   * Lead paragraph as ordered segments so handle-mono spans render inline
   * without dangerouslySetInnerHTML.
   */
  lead: Array<{ text: string; mono?: boolean }>;
  /** Illustration variant key (decorative SVG chosen in the component). */
  illustration:
    | "plane"
    | "key"
    | "cable"
    | "toolbox"
    | "wifi"
    | "shield"
    | "sleep"
    | "pause"
    | "hourglass"
    | "brokenlink";
  isWide?: boolean;

  // ---- Optional, state-specific blocks (only the states that use them) ----
  search?: { placeholder: string; button: string; suggestionsLabel: string };
  suggestions?: SuggestionFixture[];
  statusRow?: { tone: "ok" | "busy" | "down" | "warn"; segments: Array<{ text: string; bold?: boolean; href?: string }> };
  countdown?: CountdownFixture;
  progress?: boolean;
  estimatedEnd?: Array<{ text: string; bold?: boolean }>;
  cacheList?: { items: CacheItemFixture[] };
  userline?: { initial: string; email: string };
  appeal?: {
    reason: string;
    reasonTag: string;
    notes: string;
    referenceLabel: string;
    reference: string;
  };
  retryPill?: string;
  proHint?: Array<{ text: string; bold?: boolean; link?: boolean }>;
  details?: { summaryPrefix: string; requestId: string; summarySuffix: string; trace: string };

  actions: ErrorAction[];
  /** Secondary help paragraph as segments (links become mock buttons). */
  secondaryHelp?: Array<{ text: string; strong?: boolean; mono?: boolean; link?: boolean; br?: boolean }>;
};

export function errorPagesFixture(): ErrorStateFixture[] {
  return [
    // ---- STATE 1 — 404 handle not found ----
    {
      state: 1,
      switchLabel: "1 · 404 — handle not found",
      wrapTone: "primary",
      eyebrowTone: "primary",
      eyebrow: "404 · handle not found",
      heading: "We can't find that creator",
      illustration: "plane",
      lead: [
        { text: "We couldn't find anyone with the handle " },
        { text: "@nobody", mono: true },
        {
          text: ". Maybe they've moved, changed it, or you mistyped — happens to the best of us.",
        },
      ],
      search: {
        placeholder: "Search for a creator…",
        button: "Search",
        suggestionsLabel: "Popular creators",
      },
      suggestions: [
        { initial: "A", name: "Alexandra Silva", handle: "@alexandra" },
        {
          initial: "M",
          name: "Maya Chen",
          handle: "@mayareads",
          avatarGradient: "linear-gradient(135deg,#F59E0B,#8B5CF6)",
        },
        {
          initial: "J",
          name: "Jordan Park",
          handle: "@jordanbuilds",
          avatarGradient: "linear-gradient(135deg,#10B981,#6366F1)",
        },
      ],
      actions: [
        { kind: "mock", label: "Want this handle? Claim it →", variant: "primary" },
        { kind: "home", label: "Back home", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Looking for a specific creator? Try the search above, or " },
        { text: "browse popular pages", link: true },
        { text: "." },
      ],
    },

    // ---- STATE 2 — 404 handle released ----
    {
      state: 2,
      switchLabel: "2 · 404 — handle released",
      wrapTone: "warm",
      eyebrowTone: "warm",
      eyebrow: "Handle available",
      heading: "This handle was released",
      illustration: "key",
      lead: [
        { text: "@alex", mono: true },
        {
          text: " used to belong to a creator who changed their handle. After our 30-day redirect grace period, this URL is now available — first to claim it gets it.",
        },
      ],
      actions: [
        { kind: "mock", label: "Claim @alex →", variant: "warm" },
        { kind: "mock", label: "Looking for someone? Search", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Why does this happen? ", strong: true },
        {
          text: "When a creator changes their handle, we redirect the old URL for 30 days so their audience can find them. After that, the handle goes back into the pool — short, memorable handles get a second life this way.",
        },
        { text: "", br: true },
        { text: "Browse other creators", link: true },
        { text: " · " },
        { text: "See pricing", link: true },
      ],
    },

    // ---- STATE 3 — 500 server error ----
    {
      state: 3,
      switchLabel: "3 · 500 — server error",
      wrapTone: "danger",
      eyebrowTone: "danger",
      eyebrow: "500 · server error",
      heading: "Something broke on our side",
      illustration: "cable",
      lead: [
        {
          text: "We've been notified and our team is investigating. This isn't your fault — give it a minute and try again, or follow the status link below for updates.",
        },
      ],
      statusRow: {
        tone: "busy",
        segments: [
          { text: "Status:", bold: true },
          { text: " investigating · " },
          { text: "tadaify.statuspage.io ↗", href: "mock" },
        ],
      },
      actions: [
        { kind: "mock", label: "Retry", variant: "primary" },
        { kind: "home", label: "Back home", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "If this keeps happening, please email " },
        { text: "support@tadaify.com", link: true },
        { text: " and include the request ID below — it helps us trace the issue faster." },
      ],
      details: {
        summaryPrefix: "Request ID · ",
        requestId: "req_8FaB3qLp_2026-04-26T14:12:08Z",
        summarySuffix: " · stack trace (DEV)",
        trace: `TypeError: Cannot read property 'handle' of undefined
    at loader (app/routes/$.tsx:42:17)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at async Object.handleRequest (workers://tadaify/handler.ts:88:20)
    at async onRequest (workers://tadaify/index.ts:14:9)

Caused by: NetworkError: upstream timeout
    cf-ray: 8aa8c2e3f4d09c1f-WAW
    upstream: supabase (ihnvcuhabtzaxkdzjhhy.supabase.co)
    elapsed: 5012ms (limit 5000ms)`,
      },
    },

    // ---- STATE 4 — Maintenance mode ----
    {
      state: 4,
      switchLabel: "4 · Maintenance mode",
      wrapTone: "warm",
      eyebrowTone: "warm",
      eyebrow: "Scheduled maintenance",
      heading: "tadaify is under maintenance",
      illustration: "toolbox",
      isWide: true,
      lead: [
        {
          text: "We're upgrading our analytics pipeline so your insights get faster and more accurate. We'll be back shortly — thanks for your patience.",
        },
      ],
      statusRow: {
        tone: "busy",
        segments: [
          { text: "Reason (set by admin):", bold: true },
          { text: " Analytics pipeline upgrade · cookieless rollout" },
        ],
      },
      countdown: { hours: "00", minutes: "42", seconds: "17" },
      progress: true,
      estimatedEnd: [
        { text: "Estimated end: " },
        { text: "14:30 UTC", bold: true },
        { text: " · All services restoring…" },
      ],
      actions: [
        { kind: "mock", label: "Updates on X ↗", variant: "secondary" },
        { kind: "mock", label: "Discord ↗", variant: "secondary" },
        { kind: "mock", label: "Status page ↗", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Admin? ", strong: true },
        { text: "You're not affected — admins bypass maintenance mode automatically. Manage the toggle from " },
        { text: "/admin → Maintenance", mono: true },
        { text: "." },
      ],
    },

    // ---- STATE 5 — Offline (PWA) ----
    {
      state: 5,
      switchLabel: "5 · Offline (PWA)",
      wrapTone: "calm",
      eyebrowTone: "neutral",
      eyebrow: "You're offline",
      heading: "No connection right now",
      illustration: "wifi",
      lead: [
        {
          text: "Some pages may not work until you're back online. We're showing you the last data we cached on this device — it's read-only until your connection returns.",
        },
      ],
      cacheList: {
        items: [
          { name: "Your dashboard skeleton", meta: "2 min ago" },
          { name: "Block editor (last saved draft)", meta: "8 min ago" },
          { name: "Your public page preview", meta: "cached" },
        ],
      },
      actions: [
        { kind: "mock", label: "Try again", variant: "primary" },
        { kind: "home", label: "Go to cached home", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "New edits made offline will sync automatically when you're back online." },
      ],
    },

    // ---- STATE 6 — 403 permission denied ----
    {
      state: 6,
      switchLabel: "6 · 403 — permission denied",
      wrapTone: "danger",
      eyebrowTone: "danger",
      eyebrow: "403 · permission denied",
      heading: "You don't have access here",
      illustration: "shield",
      lead: [
        {
          text: "This area is restricted to admins. If you think you should have access, the team can sort it out.",
        },
      ],
      userline: { initial: "A", email: "alexandra@tadaify.com" },
      actions: [
        { kind: "mock", label: "Back to your dashboard", variant: "primary" },
        { kind: "mock", label: "Request access", variant: "secondary" },
        { kind: "mock", label: "Sign out", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Need help? " },
        { text: "Contact support", link: true },
        { text: " and we'll route your request to the right person." },
      ],
    },

    // ---- STATE 7 — Subscription expired ----
    {
      state: 7,
      switchLabel: "7 · Subscription expired",
      wrapTone: "primary",
      eyebrowTone: "neutral",
      eyebrow: "Page is currently inactive",
      heading: "This page is taking a quick break",
      illustration: "sleep",
      lead: [
        { text: "@maya", mono: true },
        {
          text: "'s page is temporarily inactive while their account is between subscriptions. Check back soon — or if you're trying to reach them, try their other channels.",
        },
      ],
      actions: [
        { kind: "home", label: "Discover other creators →", variant: "primary" },
        { kind: "mock", label: "Want your own page? Sign up free →", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "If you're @maya: ", strong: true },
        {
          text: "sign in to your dashboard to reactivate your subscription — your page comes right back online once billing is restored.",
        },
        { text: "", br: true },
        { text: "Sign in to tadaify →", link: true },
      ],
    },

    // ---- STATE 8 — Account suspended ----
    {
      state: 8,
      switchLabel: "8 · Account suspended",
      wrapTone: "danger",
      eyebrowTone: "danger",
      eyebrow: "Account suspended",
      heading: "Your account is on hold",
      illustration: "pause",
      lead: [
        {
          text: "Your tadaify account has been suspended pending review. Your public page is currently hidden — visitors will see an inactive notice.",
        },
      ],
      appeal: {
        reason: "Reason category:",
        reasonTag: "Terms of Service · pending review",
        notes: "Manual moderation queue · expected response within 48h.",
        referenceLabel: "Reference:",
        reference: "case_2026_04_26_alex_204",
      },
      actions: [
        { kind: "mock", label: "Submit an appeal", variant: "primary" },
        { kind: "home", label: "Sign out", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Believe this is a mistake? Email " },
        { text: "appeals@tadaify.com", link: true },
        { text: " with your case reference. Read our " },
        { text: "Terms of Service", link: true },
        { text: " · " },
        { text: "Acceptable Use Policy", link: true },
        { text: "." },
      ],
    },

    // ---- STATE 9 — 429 rate limited ----
    {
      state: 9,
      switchLabel: "9 · 429 — rate limited",
      wrapTone: "warm",
      eyebrowTone: "warm",
      eyebrow: "429 · slow down",
      heading: "You're moving fast!",
      illustration: "hourglass",
      lead: [
        {
          text: "We've temporarily throttled requests from your account so tadaify stays fast for everyone. This is automatic — no action needed except a short pause.",
        },
      ],
      retryPill: "00:42",
      actions: [
        { kind: "mock", label: "Retry now", variant: "secondary" },
        { kind: "mock", label: "Back to dashboard", variant: "ghost" },
      ],
      proHint: [
        { text: "Hitting the limit often? ", bold: true },
        { text: "API access on " },
        { text: "Pro", bold: true },
        { text: " includes " },
        { text: "10× higher rate limits", bold: true },
        { text: " (100 req/h on Pro, 1000 req/h on Business). Bigger workflows + scripts run smoothly there." },
        { text: "", br: true },
        { text: "See plans →", link: true },
      ],
    },

    // ---- STATE 10 — 404 block deleted ----
    {
      state: 10,
      switchLabel: "10 · 404 — block deleted",
      wrapTone: "primary",
      eyebrowTone: "primary",
      eyebrow: "Link no longer available",
      heading: "This link has been removed",
      illustration: "brokenlink",
      lead: [
        { text: "The block you clicked is no longer part of " },
        { text: "@alexandra", mono: true },
        {
          text: "'s page. Their content moves around — try heading to their main page for the latest.",
        },
      ],
      actions: [
        { kind: "mock", label: "Visit @alexandra's page →", variant: "primary" },
        { kind: "home", label: "Browse creators", variant: "ghost" },
      ],
      secondaryHelp: [
        { text: "Saw this from a bookmark or external link? Bookmarks to specific blocks may break when creators update their page — bookmark " },
        { text: "tadaify.com/alexandra", mono: true },
        { text: " instead." },
      ],
    },
  ];
}
