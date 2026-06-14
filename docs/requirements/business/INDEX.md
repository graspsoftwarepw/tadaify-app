# Business Requirements — INDEX

> **Auto-generated** on 2026-06-14 by `bin/migrate-records.mjs --kind=br`.
> Do NOT hand-edit this file. Edit the individual BR records in `docs/requirements/business/`.
> To add a new BR: create `docs/requirements/business/NNNN-<slug>.md` with MADR frontmatter.

## All Business Requirements

| ID | Title | Status |
|----|-------|--------|
| [BR-AUTH-001](0003-register-with-unique-handle.md) | User can register with a unique @handle | implemented |
| [BR-AUTH-002](0004-email-otp-verification.md) | Email-OTP verification (6-digit code) for new users | implemented |
| [BR-AUTH-003](0005-handle-permanently-bound-after-otp.md) | Handle is permanently bound to the user after OTP verification | implemented |
| [BR-AUTH-004](0006-optional-password-setup-post-otp.md) | Optional password setup post-OTP (returning users can use OTP-only) | implemented |
| [BR-AUTH-005](0007-returning-user-sign-in-via-email-otp.md) | Returning user can sign in via email OTP (no handle required) | implemented |
| [BR-AUTH-006](0008-handle-availability-live-check.md) | Handle availability check (live, 300 ms debounce) during registration | implemented |
| [BR-AUTH-007](0009-handle-reservation-prevents-race.md) | Handle reservation (15 min) prevents race on landing → register flow | implemented |
| [BR-AUTH-008](0010-otp-3-strike-lockout.md) | 3-strike OTP lockout protects against brute-force attempts | implemented |
| [BR-CREATOR-001](0001-creator-page-public-profile.md) | Creator page public profile | implemented |
| [BR-DASH-001](0017-dashboard-app-route.md) | Creator dashboard /app route - SSR-first, auth-gated, onboarding-interrupt-aware | implemented |
| [BR-DASH-002](0018-dashboard-appbar.md) | App appbar - 3-span wordmark (DEC-WORDMARK-01), handle pill with clipboard copy, live-dot, theme toggle | implemented |
| [BR-DASH-003](0019-dashboard-sidebar.md) | App sidebar - profile card, Pages group (Home active + +Add disabled Q+1), Configuration + Administration accordions | implemented |
| [BR-DASH-004](0020-dashboard-homepage-panel.md) | Homepage panel - blocks list, empty-state quick-start cards, pinned message toggle, profile card | implemented |
| [BR-DASH-005](0021-dashboard-welcome-banner.md) | Welcome banner - state-machine copy (6 states, DEC-332=D never claims the page is live), dismissible (persisted to account_settings) | implemented |
| [BR-DASH-006](0022-dashboard-live-preview-pane.md) | Live preview pane - 3-device toggle (mobile/tablet/desktop), publish-state chip, prefers-reduced-motion | implemented |
| [BR-DASH-007](0023-dashboard-mobile-tab-bar.md) | Mobile bottom tab bar (<600px) - 5 tabs (Home/Design/Insights/Shop/Settings), sidebar hidden | implemented |
| [BR-DASH-008](0024-dashboard-tablet-viewport.md) | Tablet viewport (600-1023px) - sidebar visible, preview pane hidden | implemented |
| [BR-DASH-009](0025-dashboard-theme-toggle.md) | Theme toggle - localStorage-persisted, body.dark-mode, graceful fallback if storage blocked | implemented |
| [BR-DASH-010](0026-dashboard-gdpr-export-delete.md) | GDPR - user-export-data Edge Function (Art. 20) + delete_user_data() RPC cascade | implemented |
| [BR-LANDING-001](0002-landing-page-with-handle-claim-flow.md) | Landing page with handle claim flow | implemented |
| [BR-ONBOARDING-001](0011-onboarding-step1-platform-picker.md) | Post-registration wizard - step 1/5 - platform picker (welcome) | implemented |
| [BR-ONBOARDING-002](0012-onboarding-step2-social-handle-entry.md) | Post-registration wizard - step 2/5 - social handle entry | implemented |
| [BR-ONBOARDING-003](0013-onboarding-step3-profile-setup.md) | Post-registration wizard - step 3/5 - profile setup (name + bio) | implemented |
| [BR-ONBOARDING-004](0014-onboarding-step4-template-picker.md) | Post-registration wizard - step 4/5 - template picker | implemented |
| [BR-ONBOARDING-005](0015-onboarding-step5-plan-overview.md) | Post-registration wizard - step 5/5 - plan overview (read-only, DEC-311=A) | implemented |
| [BR-ONBOARDING-006](0016-onboarding-success-complete-screen.md) | Post-registration wizard - success / complete screen (DEC-332=D page-coming-soon semantics) | implemented |
| [BR-OTP-001](0027-otp-resend-rate-limit.md) | OTP resend rate-limit - 3/session UI cap + 60s cooldown + 3/24h backend guard per email-handle pair | implemented |

---

*Generated from 27 MADR records in `docs/requirements/business/`.*
