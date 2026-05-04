# Business Requirements — tadaify

tadaify is a link-in-bio platform for creators with a 4-tier pricing model (Free / Creator / Pro / Business), 0% platform fees, and a Cloudflare-first architecture for edge performance on custom domains.

The full functional specification lives in `docs/specs/functional-spec.md`. This file is the BR index — each BR traces to one or more spec sections and stories on the GitHub Project board.

## BR Index

| ID | Title | Spec ref | Status |
|---|---|---|---|
| BR-001 | Creator page public profile | `specs/functional-spec.md` §3 | Planned |
| BR-LANDING-001 | Landing page with handle claim flow | `specs/functional-spec.md` §1, Issue #1 | Implemented |
| BR-AUTH-01 | User can register with a unique @handle | Issue #129 | Implemented |
| BR-AUTH-02 | Email-OTP verification (6-digit code) for new users | Issue #129 | Implemented |
| BR-AUTH-03 | Handle is permanently bound to the user after OTP verification | Issue #129 | Implemented |
| BR-AUTH-04 | Optional password setup post-OTP (returning users can use OTP-only) | Issue #129 | Implemented |
| BR-AUTH-05 | Returning user can sign in via email OTP (no handle required) | Issue #129 | Implemented |
| BR-AUTH-06 | Handle availability check (live, 300 ms debounce) during registration | Issue #129 | Implemented |
| BR-AUTH-07 | Handle reservation (15 min) prevents race on landing → register flow | Issue #129 | Implemented |
| BR-AUTH-08 | 3-strike OTP lockout protects against brute-force attempts | Issue #129 | Implemented |
| BR-ONBOARDING-001 | Post-registration wizard: step 1/5 — platform picker (welcome) | Issue #136 | Implemented |
| BR-ONBOARDING-002 | Post-registration wizard: step 2/5 — social handle entry | Issue #136 | Implemented |
| BR-ONBOARDING-003 | Post-registration wizard: step 3/5 — profile setup (name + bio) | Issue #136 | Implemented |
| BR-ONBOARDING-004 | Post-registration wizard: step 4/5 — template picker | Issue #136 | Implemented |
| BR-ONBOARDING-005 | Post-registration wizard: step 5/5 — plan overview (read-only, DEC-311=A) | Issue #136 | Implemented |
| BR-ONBOARDING-006 | Post-registration wizard: success / complete screen (DEC-332=D page-coming-soon semantics) | Issue #136 | Implemented |
| BR-DASH-001 | Creator dashboard /app route — SSR-first, auth-gated, onboarding-interrupt-aware | Issue #171 | Implemented |
| BR-DASH-002 | App appbar: 3-span wordmark (DEC-WORDMARK-01), handle pill with clipboard copy, live-dot, theme toggle | Issue #171 | Implemented |
| BR-DASH-003 | App sidebar: profile card, Pages group (Home active + +Add disabled Q+1), Configuration + Administration accordions | Issue #171 | Implemented |
| BR-DASH-004 | Homepage panel: blocks list, empty-state quick-start cards, pinned message toggle, profile card | Issue #171 | Implemented |
| BR-DASH-005 | Welcome banner: state-machine copy (6 states, DEC-332=D: never "your page is live"), dismissible (persisted to account_settings) | Issue #171 | Implemented |
| BR-DASH-006 | Live preview pane: 3-device toggle (mobile/tablet/desktop), publish-state chip, prefers-reduced-motion | Issue #171 | Implemented |
| BR-DASH-007 | Mobile bottom tab bar (<600px): 5 tabs (Home/Design/Insights/Shop/Settings), sidebar hidden | Issue #171 | Implemented |
| BR-DASH-008 | Tablet viewport (600–1023px): sidebar visible, preview pane hidden | Issue #171 | Implemented |
| BR-DASH-009 | Theme toggle: localStorage-persisted, body.dark-mode, graceful fallback if storage blocked | Issue #171 | Implemented |
| BR-DASH-010 | GDPR: user-export-data Edge Function (Art. 20) + delete_user_data() RPC cascade | Issue #171 | Implemented |
| BR-OTP-RATE-LIMIT-001 | OTP resend rate-limit: 3/session UI cap + 60s cooldown + 3/24h backend guard per email-handle pair | Issue #179, DEC-342=A | Implemented |

> Add BRs as features are implemented. Every PR must cite the BRs it implements in the commit body and changelog entry.
