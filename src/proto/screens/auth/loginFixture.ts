/**
 * Typed mock seam for the Login screen. Mirrors mockups/tadaify-mvp/login.html
 * so the screen graduates by swapping these factories for the real Supabase
 * GoTrue auth flow. Defines the FR's rendered data contract.
 *
 * @implements fr-login
 */

/** A single sign-in provider button in the picker stack. */
export type LoginProvider = {
  id: "google" | "x" | "email";
  /** Visual prominence: `tier-1` (thicker border) vs `tier-2`. */
  tier: "tier-1" | "tier-2";
  labelMain: string;
  labelHint: string;
};

export type TrustChip = string;

export type LoginContent = {
  heading: string;
  subhead: string;
  providers: LoginProvider[];
  allPathsNote: string;
  /** Email-step copy. */
  email: {
    label: string;
    placeholder: string;
    sendLabel: string;
    note: string;
    backLabel: string;
  };
  /** OTP-step copy. */
  otp: {
    badge: string;
    heading: string;
    sentToLead: string;
    verifyLabel: string;
    backLabel: string;
    /** Seconds before "Resend" re-enables. */
    resendSeconds: number;
  };
  forgotLabel: string;
  trustChips: TrustChip[];
  createAccountLead: string;
  createAccountLink: string;
  footerTagline: string;
};

export function makeLoginContent(): LoginContent {
  return {
    heading: "Welcome back",
    subhead: "Sign in to keep building.",
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
    allPathsNote:
      "✉️ All paths sign you in via your email. We never ask for your phone.",
    email: {
      label: "Email address",
      placeholder: "you@example.com",
      sendLabel: "Send me a code →",
      note: "✉️ Your code expires in 10 minutes. Check spam if it doesn't arrive.",
      backLabel: "← back to sign-in options",
    },
    otp: {
      badge: "📬",
      heading: "Check your email",
      sentToLead: "We sent a 6-digit code to",
      verifyLabel: "Verify code →",
      backLabel: "← wrong email? go back",
      resendSeconds: 60,
    },
    forgotLabel: "Forgot password?",
    trustChips: [
      "🔒 Price locked for life",
      "💸 30-day money-back · No trials",
      "🛡 GDPR-compliant · export & delete anytime",
    ],
    createAccountLead: "First time here?",
    createAccountLink: "Create account →",
    footerTagline: "Turn your bio link into your best first impression.",
  };
}
