# Playwright Test Plan: F-REGISTER-001a
# email-OTP + Auth Hook + handle binding

Story: [F-REGISTER-001a] issue tadaify-app#129  
Branch: feat/register-001a-email-otp  
Mockup: mockups/tadaify-mvp/register.html (merged PR #125)  
Per-test authorization protocol: user dictates edge cases live during Inbucket click-test  
(per memory `feedback_tadaify_per_playwright_test_authorization.md`)

## Prerequisites

- `supabase start` running (local Docker)
- Inbucket available at `http://localhost:54354`
- `npm run dev` running on port 5173
- Seed user `test-register-001a-happy@local.test` / `TestPass123!` in `supabase/seed.sql`

---

## S1 — Happy path: handle → method → email → OTP → success → onboarding

**Prerequisite:** Handle `testuser001a` not in profiles or active reservations.

**Steps:**
1. Navigate to `/` (landing page)
2. Type handle `testuser001a` in claim input → wait for "Available!" confirmation
3. Click "Claim your handle →" → should navigate to `/register?handle=testuser001a`
4. Assert Section A shows `@testuser001a` in greeting
5. Click "Continue →" → Section B (4 providers) appears
6. Click "Continue with Email" → Section B-email appears
7. Type `test-register-001a-happy@local.test` in email input
8. Click "Send me a code →" → Section B-otp appears; email in heading confirmed
9. Open Inbucket at `http://localhost:54354`; read 6-digit code from email
10. Enter code digit-by-digit in OTP grid → "Verify code →" button enables
11. Click "Verify code →" → Section B-password-toggle appears
12. Assert Card 1 (send code) is pre-selected (DEC-295 default)
13. Click "Continue →" → Section C (success) appears
14. Assert `@testuser001a` in welcome message
15. Wait 2s → assert redirect to `/onboarding-welcome?handle=testuser001a`

**Verifies:** AC-1/2/3/4/5/6, BR-AUTH-01, BR-AUTH-05, DEC-291, DEC-295  
**Covers:** BR-AUTH-01

---

## S2 — 3-strike OTP lockout (DEC-305)

**Prerequisite:** Section B-otp visible, fresh OTP sent.

**Steps:**
1. Navigate to `/register?handle=testlockout001a` through to Section B-otp
2. Enter `000000` (wrong code) → click "Verify code →"
3. Assert error: "2 attempts remaining"
4. Enter `000001` → click "Verify code →"
5. Assert error: "1 attempt remaining"
6. Enter `000002` → click "Verify code →"
7. Assert lockout error: "Too many incorrect codes. Try again in 15 minutes."
8. Assert all OTP inputs are disabled (locked state)
9. Assert "Verify code →" button is disabled

**Verifies:** AC (3-strike lockout), DEC-305  
**Covers:** BR-AUTH-08 (security controls)

---

## S3 — Resend cooldown: 60s timer + reactivation

**Prerequisite:** Section B-otp visible, OTP just sent (resend cooldown active).

**Steps:**
1. Navigate to Section B-otp (send code step)
2. Assert "Resend in Xs" button is disabled with countdown visible
3. Wait for countdown to reach 0 (or mock timer in test)
4. Assert "Resend code" button becomes enabled (active state)
5. Click "Resend code" → toast "New code sent! Check your inbox." appears
6. Assert countdown resets to ~60s and button disables again
7. Assert OTP grid is cleared (digits reset)

**Verifies:** AC (60s resend cooldown), DEC-291  
**Covers:** BR-AUTH-03

---

## S4 — Password opt-in toggle (DEC-295)

**Prerequisite:** OTP verified; Section B-password-toggle visible.

**Steps:**
1. Assert Card 1 (send code) is selected (default, DEC-295)
2. Click Card 2 (set password)
3. Assert password + confirm fields appear within Card 2
4. Type `weakpw` → assert validation error "Password must be at least 8 characters"
5. Type `nodigits!` → assert validation error "must contain at least one digit"
6. Type `Secure1!` in password + `Different2!` in confirm → assert "Passwords do not match"
7. Type `Secure1!` in both fields → assert "✓ Passwords match"
8. Click "Continue →" → assert redirect to `/onboarding-welcome`

**Verifies:** AC (password opt-in), DEC-295  
**Covers:** BR-AUTH-04

---

## S5 — Returning user via /login: email-OTP → dashboard (DEC-307)

**Prerequisite:** `test-register-001a-returning@local.test` already has a profiles row.

**Steps:**
1. Navigate to `/login`
2. Assert 4 provider buttons + email input visible
3. Type `test-register-001a-returning@local.test` in email input
4. Click "Send me a code →" → OTP sent; enter Inbucket code
5. Enter code in OTP grid → click "Verify code →"
6. Assert redirect to `/dashboard` (NOT `/onboarding-welcome`)

**Verifies:** AC (/login route + returning user → dashboard), DEC-307  
**Covers:** BR-AUTH-01

---

## S6 — ToS microcopy: visible on every method screen

**Steps:**
1. Navigate to `/register?handle=testtos`
2. Assert Section B shows "By continuing, you agree to the Terms of Service and Privacy Policy"
3. Assert ToS link href is `/terms` and Privacy link href is `/privacy`
4. Navigate to `/login`
5. Assert login page shows "By continuing you accept our Terms and Privacy Policy"

**Verifies:** DEC-306 (implicit ToS microcopy)  
**Covers:** BR-AUTH-06 (ToS consent)

---

## S7 — "Coming soon" toast for OAuth providers

**Steps:**
1. Navigate to `/register?handle=testoauth` → Section B visible
2. Click "Continue with Google" → assert toast "Google sign-in is coming soon. Use email for now."
3. Click "Continue with Apple" → assert toast "Apple sign-in is coming soon. Use email for now."
4. Click "Continue with X" → assert toast "X sign-in is coming soon. Use email for now."
5. Navigate to `/login`; repeat for all 3 OAuth buttons

**Verifies:** DEC-308=C (MVP scope; OAuth placeholders)  
**Covers:** BR-AUTH-01 (signup scope)

---

## S8 — Back navigation preserves state

**Steps:**
1. Navigate to `/register?handle=testback`
2. Proceed to Section B → click "← back to handle"
3. Assert Section A still shows handle `testback` (state preserved)
4. Proceed to Section B → click Email → Section B-email
5. Type email → click "← back to sign-in options"
6. Assert Section B still visible; email preserved in state

**Verifies:** Back navigation per state machine (DEC-291 B-modified)  
**Covers:** UX contract

---

## Edge cases (user-driven during Inbucket click-test)

- EC-001: Expired OTP (wait >10 min before entering) → verify Supabase returns error; assert "Incorrect or expired code" message
- EC-002: Handle taken mid-reservation (race: second device claims same handle) → verify 409 on verify; assert error surface
- EC-003: Paste 6-digit code from clipboard → assert all 6 digits populate; verify button enables
- EC-004: Double-click "Verify code →" (concurrent submits) → assert second click is debounced (isSubmitting)
- EC-005: Network failure during sendCode → assert "Network error. Please try again." error
- EC-006: Network failure during verify → assert "Network error. Please try again." error

---

## Notes

- Playwright spec files NOT pre-written per `feedback_tadaify_per_playwright_test_authorization.md`.
- Spec files will be generated post-DEV-deploy by `test-spec-generator` skill after user click-test.
- Unit tests (vitest) ship with this PR as auto-authorized.
