/**
 * Pure helpers for /login error-code → UI mapping.
 *
 * Extracted so the branching logic in login.tsx can be unit-tested without
 * spinning up a DOM (the project's vitest setup is node-only — see
 * package.json, no jsdom). Mirrors the helper-first pattern used by
 * otp-state.ts and auth-validator.ts.
 *
 * Story: issue tadaify-app#176 — friendly no-account UX on /login.
 */

/** Stable error codes returned by POST /api/auth/login-otp. */
export type LoginOtpErrorCode =
  | "no_account"
  | "server_error"
  | "invalid_email"
  | (string & {});

/**
 * What the /login form should render given a JSON response from
 * POST /api/auth/login-otp.
 *
 * - `kind: "ok"`        → backend reports sent=true; clear any error UI.
 * - `kind: "no_account"` → render the friendly CTA block with email.
 * - `kind: "inline"`    → render inline `<p role="alert">` with `text`.
 */
export type LoginOtpUiAction =
  | { kind: "ok" }
  | { kind: "no_account"; email: string }
  | { kind: "inline"; text: string };

/**
 * Map a (response, body, email) triple to a deterministic UI action.
 *
 * `responseOk` is the HTTP-level `res.ok`; `body.sent` is the success flag;
 * `body.error` is the stable error code returned by the backend.
 */
export function mapLoginOtpResponse(
  responseOk: boolean,
  body: { sent?: boolean; error?: string },
  emailEnteredByUser: string
): LoginOtpUiAction {
  if (responseOk && body.sent) {
    return { kind: "ok" };
  }
  switch (body.error) {
    case "no_account":
      return { kind: "no_account", email: emailEnteredByUser };
    case "server_error":
      return { kind: "inline", text: "Something went wrong — please try again." };
    case "invalid_email":
      return { kind: "inline", text: "Please enter a valid email address." };
    default:
      return { kind: "inline", text: body.error ?? "Failed to send code." };
  }
}

/**
 * Build the /register CTA href used by the no-account block.
 * Email is URL-encoded so unusual characters (`+`, spaces) survive the round-trip.
 */
export function buildRegisterCtaHref(email: string): string {
  return `/register?email=${encodeURIComponent(email)}`;
}
