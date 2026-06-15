---
id: fr-login
title: Login auth screen
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/login]
related_files:
  - src/proto/screens/auth/LoginScreen.tsx
  - src/proto/screens/auth/loginFixture.ts
  - src/proto/screens/auth/login-proto.css
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Login auth screen

What a returning creator sees when signing in. Ported from
`mockups/tadaify-mvp/login.html` (the `.login-page` / `.login-card` inside the auth top-bar). The
screen sits inside the shared minimal auth chrome (brand wordmark + theme toggle); colour tokens come
from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). All authentication
is mocked in the prototype.

## Composition

Shared chrome:

- The screen shall render inside the shared auth top-bar, which shows the brand wordmark linking back to
  the landing prototype, a "Don't have an account? Sign up →" cross-link to the register screen, and the
  theme toggle.

Card header:

- The card shall render a "Welcome back" heading and a "Sign in to keep building." subhead.

Provider picker (default step):

- The card shall render a vertical stack of three provider buttons: "Continue with Google" (fastest for
  Gmail users), "Continue with X" (creator-friendly), and "Continue with Email" (we'll send a 6-digit
  code), with Google given a thicker tier-1 border.
- It shall render an all-paths note ("All paths sign you in via your email. We never ask for your
  phone.") and a "Forgot password?" action.
- Clicking Google or X shall raise a prototype mock alert; clicking Email shall advance to the email
  step; "Forgot password?" shall raise a prototype mock alert.

Email step:

- The step shall render an email field and a "Send me a code →" submit that stays disabled until the
  address is syntactically valid, a code-expiry note, and a "back to sign-in options" link returning to
  the provider picker.

OTP step:

- The step shall render a 6-input code grid (auto-advance, backspace-back, paste-fill across boxes) with
  the target email echoed, a "Verify code →" submit disabled until all six digits are entered, a resend
  control disabled during a 60-second countdown, and a "wrong email? go back" link returning to the email
  step.
- Submitting a complete code shall navigate to the dashboard prototype route.

Footer:

- The card shall render the trust-chip strip (price-locked, money-back, GDPR), a "First time here? Create
  account →" row linking to the register screen, and a wordmark footer with the brand tagline.

## Layout

- **Desktop / tablet:** the card is centred with a fixed max width.
- **Phone (≤480px):** the card spans full width with its side and top borders and shadow removed.

## Related requirements

- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
