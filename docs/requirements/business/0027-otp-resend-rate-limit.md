---
id: BR-OTP-001
title: OTP resend rate-limit - 3/session UI cap + 60s cooldown + 3/24h backend guard per email-handle pair
area: OTP
status: implemented
routes: [/register, /login]
modules: [OTP]
related_files: [app/lib/otp-rate-limit.ts, app/lib/otp-state.ts, app/components/OtpResendControl.tsx]
tests: []
migrations: [supabase/migrations/20260503000003_otp_rate_limit_attempts.sql, supabase/migrations/20260504000001_otp_rate_limit_pair_keyed_index.sql, supabase/migrations/20260504000002_otp_rate_limit_acquire_slot_rpc.sql, supabase/migrations/20260504000003_otp_slot_reservation_finalization.sql]
authorized_by: vvaser@gmail.com
aliases: [BR-OTP-RATE-LIMIT-001]
---

# BR-OTP-001 — OTP resend rate-limit

Email-OTP resend on `/register` and `/login` is governed by three layered guards
(DEC-342=A):

1. **Per-session cap (UI):** max 3 successful sends per browser session; after the
   3rd, the resend control is disabled and offers "Use a different email".
2. **Per-attempt cooldown (UI):** 60 seconds between send attempts.
3. **Backend rate-limit (API):** 3 successful sends per email-handle pair per
   rolling 24-hour window, keyed on `sha256(email)` (not IP, so VPN rotation
   does not bypass), returning HTTP 429 on the 4th attempt. State is stored in
   `public.otp_rate_limit_attempts` (service-role RLS only).

Distinct from BR-AUTH-008 (3-strike lockout on wrong codes — a different concern).

Traceability: functional-spec.md §3 (auth flows; OTP send governance).
Originating issue: tadaify-app#179. DEC-342=A (STRICT 3/3/24h + Postgres).
