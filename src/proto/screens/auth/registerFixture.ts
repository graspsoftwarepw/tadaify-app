/**
 * Typed mock seam for the Register / claim-handle screen. Mirrors
 * mockups/tadaify-mvp/register.html (section state machine A → B → B-email →
 * B-otp → B-pwtoggle → C) so the screen graduates by swapping these factories
 * for the real handle-availability + Supabase GoTrue flow. Defines the FR's
 * rendered data contract.
 *
 * @implements fr-register
 */

export type RegisterProvider = {
  id: "google" | "x" | "email";
  tier: "tier-1" | "tier-2";
  labelMain: string;
  labelHint: string;
};

export type RegisterContent = {
  /** Handle-availability mock rules. */
  handle: {
    prefix: string;
    defaultValue: string;
    minLen: number;
    maxLen: number;
    /** Handles that report as taken. */
    taken: string[];
    /** Reserved handles that can never be claimed. */
    reserved: string[];
  };
  tierHint: string;
  providers: RegisterProvider[];
  allPathsNote: string;
  tosLead: string;
  noPhoneNotice: string;
  email: {
    label: string;
    placeholder: string;
    sendLabel: string;
    note: string;
  };
  otp: {
    badge: string;
    heading: string;
    sentToLead: string;
    verifyLabel: string;
    resendSeconds: number;
  };
  trustChips: string[];
};

export function makeRegisterContent(): RegisterContent {
  return {
    handle: {
      prefix: "tadaify.com/",
      defaultValue: "alexandra",
      minLen: 3,
      maxLen: 30,
      taken: ["john", "alex", "jane", "mike", "sarah"],
      reserved: [
        "admin",
        "tadaify",
        "support",
        "pricing",
        "login",
        "register",
        "api",
        "help",
        "about",
        "blog",
        "terms",
        "privacy",
      ],
    },
    tierHint:
      "Start on Free — 5 AI credits, 1 page, all core features. Upgrade anytime, never auto-enrolled.",
    providers: [
      {
        id: "google",
        tier: "tier-1",
        labelMain: "Continue with Google",
        labelHint: "fastest for Gmail users",
      },
      {
        id: "x",
        tier: "tier-2",
        labelMain: "Continue with X",
        labelHint: "creator-friendly",
      },
      {
        id: "email",
        tier: "tier-2",
        labelMain: "Continue with Email",
        labelHint: "we'll send a 6-digit code",
      },
    ],
    allPathsNote: "✉️ All paths confirm your email. We never ask for your phone.",
    tosLead: "I agree to the",
    noPhoneNotice: "🔒 We never ask for your phone number. Ever.",
    email: {
      label: "Email address",
      placeholder: "you@example.com",
      sendLabel: "Send me a code →",
      note: "✉️ Your code expires in 10 minutes. Check spam if it doesn't arrive.",
    },
    otp: {
      badge: "📬",
      heading: "Check your email",
      sentToLead: "We sent a 6-digit code to",
      verifyLabel: "Verify code →",
      resendSeconds: 60,
    },
    trustChips: [
      "🔒 Price locked for life",
      "💸 30-day money-back · No trials",
      "🛡 GDPR-compliant · export & delete anytime",
    ],
  };
}

/** Mock handle-availability evaluation, mirroring register.html's `render()`. */
export type HandleState =
  | { kind: "idle"; message: string }
  | { kind: "taken"; message: string; alternatives?: string[] }
  | { kind: "ok"; message: string };

export function evaluateHandle(
  raw: string,
  rules: RegisterContent["handle"],
): HandleState {
  const h = (raw || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!h) return { kind: "idle", message: "Type a handle…" };
  if (h.length < rules.minLen)
    return { kind: "idle", message: `At least ${rules.minLen} characters` };
  if (h.length > rules.maxLen)
    return { kind: "taken", message: `✗ Too long — max ${rules.maxLen} characters` };
  if (rules.reserved.includes(h))
    return { kind: "taken", message: "✗ This handle is reserved." };
  if (rules.taken.includes(h))
    return {
      kind: "taken",
      message: "✗ Taken — try one of these:",
      alternatives: [`the${h}`, `its${h}`, `${h}-io`],
    };
  return { kind: "ok", message: `✓ tadaify.com/${h} is yours.` };
}
