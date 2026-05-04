# BR-OTP-RATE-LIMIT-001 — OTP resend rate-limit (security + cost guardrail)

Status: locked 2026-05-04 (DEC-342=A)

## Rule

Email-OTP resend on `/register` and `/login` is governed by three layered guards:

### 1. Per-session cap (UI layer)

Maximum **3** successful OTP sends per browser session.
After the 3rd send, the resend button is permanently disabled for the session
and replaced with:

> Too many resend attempts. [Use a different email →]

The link returns the user to the B-email step with:
- email field cleared
- handle preserved (register flow)
- `attemptCount` reset to 0

### 2. Per-attempt cooldown (UI layer)

60 seconds between any two send attempts.
UI copy: **"You can resend in {N}s"** (NOT "Resend in {N}s" — that form
implied an automatic action rather than a manual-click gate).

### 3. Backend rate-limit (API layer)

**3** successful sends per email-handle pair per rolling **24-hour** window.

Stored in Postgres table `public.otp_rate_limit_attempts`.
Backend returns HTTP 429 with `{ error: "rate_limited", retry_after_seconds: <N> }`
on the 4th attempt within the window.

Key: per-email-hash, not per-IP, so VPN rotation does not bypass the limit.
Pair-keyed (email_hash + handle) so different legitimate users on the same
shared email address (rare edge case) are not cross-blocked.

## Why

- Without a cap, a single user can spam the OTP endpoint every 60 seconds
  indefinitely → unbounded Supabase Auth email cost + spam to recipient.
- Without backend gating, the UI cap is bypassable via direct API call (curl
  or DevTools fetch).
- Per-email-handle (not per-IP) prevents VPN rotation bypass.
- 3/24h is the industry standard for transactional auth (Stripe, Vercel, Linear).

## Implementation details

### Postgres table

`public.otp_rate_limit_attempts` — see migration
`supabase/migrations/<timestamp>_otp_rate_limit_attempts.sql`.

Columns:
- `id` UUID PK
- `email_hash` TEXT — sha256(lower(trim(email))). Raw email is never stored
  (privacy + GDPR Art. 5 data minimisation).
- `handle` TEXT nullable — null for login flow (no handle at OTP send time)
- `attempted_at` TIMESTAMPTZ
- `outcome` TEXT CHECK IN ('sent', 'rate_limited')
- `created_at` TIMESTAMPTZ

RLS: service_role only. No end-user reads (PII concern + abuse risk if exposed).

### Shared utility

`app/lib/otp-rate-limit.ts` — callable from both API routes:
- `checkOtpRateLimit(supabaseUrl, serviceRoleKey, emailHash, windowSeconds=86400, maxAttempts=3)`
  → `{ allowed: boolean; retry_after_seconds?: number }`
- `recordOtpAttempt(supabaseUrl, serviceRoleKey, emailHash, handle, outcome)`
- `hashEmail(email)` → sha256(lower(trim(email))).hex via Web Crypto API

### Client-side state machine

`app/lib/otp-state.ts`:
- `attemptCount: number` field in `OtpState`
- `MAX_ATTEMPTS_PER_SESSION = 3` constant
- `RESEND_CODE` action increments `attemptCount`
- `canResend` returns false when `attemptCount >= MAX_ATTEMPTS_PER_SESSION` OR within cooldown
- `BACK_TO_EMAIL` action: resets `attemptCount=0`, `email=''`, `section='B-email'`

### Shared component

`app/components/OtpResendControl.tsx` — shared by register.tsx and login.tsx.

## Out of scope

- Per-IP rate-limit (orthogonal infrastructure concern — defer to Cloudflare WAF)
- Captcha / proof-of-work after Nth attempt (defer to v2 if abuse observed)
- Tier-based caps (no business case — DEC-043 "Everything Free")
- Rate-limiting non-OTP endpoints (separate concern)
- Worker KV / Edge cache for rate-limit state (DEC-342=A chose Postgres for
  audit trail; revisit at scale if Postgres becomes bottleneck)

## Cross-references

- Issue: tadaify-app#179
- DEC-342 = A (STRICT 3/3/24h + Postgres + new BR file)
- Related: BR-AUTH-08 (3-strike OTP lockout — different concern: wrong codes,
  not resend attempts)
