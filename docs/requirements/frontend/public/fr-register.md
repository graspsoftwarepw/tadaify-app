---
id: fr-register
title: Register / claim-handle auth screen
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/register]
related_files:
  - src/proto/screens/auth/RegisterScreen.tsx
  - src/proto/screens/auth/registerFixture.ts
  - src/proto/screens/auth/register-proto.css
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Register / claim-handle auth screen

What a new creator sees when signing up — the "Claim your handle" flow. Ported from
`mockups/tadaify-mvp/register.html` (split form + live URL preview, with a stacked progressive section
machine). The screen sits inside the shared minimal auth chrome (brand wordmark + theme toggle); colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). All
authentication and handle availability are mocked in the prototype.

## Composition

Shared chrome:

- The screen shall render inside the shared auth top-bar, which shows the brand wordmark linking back to
  the landing prototype, an "Already have an account? Log in →" cross-link to the login screen, and the
  theme toggle.

Live preview (desktop column):

- A right-hand preview column shall render the creator's prospective public URL (`tadaify.com/<handle>`),
  a URL string, and a thumbnail mock, all updating live as the handle is typed.

Section A — claim handle:

- The form shall render a greeting that echoes the typed handle, a "Your public URL" field prefixed with
  `tadaify.com/`, a live availability message, a Free-tier hint, and the trust-chip strip.
- Availability shall report idle (empty / below the 3-char minimum), taken (with three suggested
  alternatives that fill the field on click), reserved, over-length (30-char max), or available.
- A "Continue →" button shall stay disabled until the handle is available, then reveal Section B.

Section B — sign-in method:

- The section shall render the same three provider buttons as login (Google tier-1, X, Email), an
  all-paths note, a pre-checked Terms-of-Service consent row with mock-alert policy links, a no-phone
  notice, a "back to handle" link, and the trust strip.
- Any provider action with consent unchecked shall raise a prototype "accept the Terms" alert.
- Choosing Google or X (OAuth) shall skip the email/OTP/password steps and go straight to the success
  step; choosing Email shall reveal the email step.

Section B-email and B-otp:

- The email step shall render an email field and a "Send me a code →" submit disabled until the address
  is valid, plus a "back to sign-in options" link.
- The OTP step shall render a 6-input code grid (auto-advance, backspace-back, paste-fill), the echoed
  email, a "Verify code →" submit disabled until six digits are entered, a resend control disabled during
  a 60-second countdown, and a "wrong email? go back" link.
- A verified code shall reveal the password-choice step.

Section B-pwtoggle — login-next-time choice:

- The step shall render two radio cards: a pre-selected recommended "Send me a login code" card, and a
  "Set a password for faster sign-in" card that reveals password + confirm fields (each with a show/hide
  toggle) on selection.
- "Continue →" with the password card selected shall block on a password under 8 characters or a
  confirm mismatch (surfacing an inline error); otherwise it reveals the success step.

Section C — success:

- The step shall render a "tada! 🎉" burst, a welcome line echoing the handle, a "Let's go →" button, and
  a 2-second auto-advance; both the button and the countdown shall navigate to the onboarding-welcome
  prototype route carrying the handle.

Stacked reveal:

- Revealing a later section shall not collapse earlier sections; "back" links collapse the target section
  and everything after it.

## Layout

- **Desktop / tablet (>960px):** a two-column grid with the form left and the live preview right.
- **Phone / small tablet (≤960px):** a single column; the preview column is hidden.

## Related requirements

- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
