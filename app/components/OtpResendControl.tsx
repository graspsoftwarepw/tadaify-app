/**
 * OtpResendControl — shared resend button + per-session cap fallback
 *
 * Used by register.tsx and login.tsx in the B-otp section.
 *
 * Renders one of three states:
 *   1. Cooldown active (and cap not reached):  "You can resend in {N}s"  (disabled button)
 *   2. Ready to resend (cap not reached):       "Resend code"             (enabled button)
 *   3. Cap reached:                             "Too many resend attempts." + "Use a different email →" link
 *
 * Copy: "You can resend in {N}s" (NOT "Resend in {N}s" — BR-OTP-RATE-LIMIT-001)
 *
 * BR: BR-OTP-RATE-LIMIT-001 / DEC-342
 * Story: F-REGISTER-001a / issue tadaify-app#179
 */

import type { OtpState } from "~/lib/otp-state";
import { canResend, isResendCapReached } from "~/lib/otp-state";

interface OtpResendControlProps {
  state: OtpState;
  /** Current timestamp (ms) — passed in so the parent controls the tick */
  now: number;
  /** Seconds remaining in the 60s cooldown — computed by parent */
  resendSecondsLeft: number;
  /** Called when user clicks "Resend code" */
  onResend: () => void;
  /** Called when user clicks "Use a different email →" (cap reached) */
  onUseDifferentEmail: () => void;
}

export function OtpResendControl({
  state,
  now,
  resendSecondsLeft,
  onResend,
  onUseDifferentEmail,
}: OtpResendControlProps) {
  const capReached = isResendCapReached(state);
  const resendable = !capReached && canResend(state, now);

  if (capReached) {
    return (
      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          color: "var(--fg-muted)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 4px" }}>Too many resend attempts.</p>
        {/* Min 44px tap target height (BR-OTP-RATE-LIMIT-001 mobile requirement) */}
        <a
          href="javascript:void(0)"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            onUseDifferentEmail();
          }}
          style={{
            display: "inline-block",
            minHeight: 44,
            lineHeight: "44px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--brand-primary)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Use a different email →
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        fontSize: 13,
        color: "var(--fg-muted)",
        textAlign: "center",
      }}
    >
      Didn't get the code?{" "}
      <button
        type="button"
        onClick={onResend}
        disabled={!resendable}
        aria-label={
          resendable
            ? "Resend verification code"
            : `You can resend in ${resendSecondsLeft}s`
        }
        style={{
          background: "none",
          border: "none",
          cursor: resendable ? "pointer" : "not-allowed",
          fontSize: 13,
          fontWeight: 600,
          color: resendable ? "var(--brand-primary)" : "var(--fg-muted)",
          padding: 0,
        }}
      >
        {resendable ? "Resend code" : `You can resend in ${resendSecondsLeft}s`}
      </button>
    </div>
  );
}
