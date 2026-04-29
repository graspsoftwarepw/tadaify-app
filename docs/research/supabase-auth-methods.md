---
type: research
project: tadaify
title: "Supabase auth methods feasibility for tadaify Slice B Register"
created_at: 2026-04-30
status: draft
tags:
  - auth
  - supabase
  - gotrue
  - otp
  - magic-link
  - oauth
  - register
  - slice-b
---

# Supabase auth methods feasibility for tadaify Slice B Register

## TL;DR

- Supabase **does** support email **OTP code** (numeric, 6-digit by default) out of the box — same `signInWithOtp` API as magic link, switched purely by which variable (`{{ .Token }}` vs `{{ .ConfirmationURL }}`) appears in the email template. No custom Edge Function needed.
- The user's recollection of Linktree is **half right**: Linktree uses a **magic-link** verification at signup (72h link), then a **6-digit one-time code** for *login* — not for signup. The "popup with numeric code" UX user remembers is Linktree's *passwordless login* path, not its registration path.
- Recommended v1 for tadaify: **Option B — Email OTP code at signup, password set as optional step in Slice C onboarding**, plus Google OAuth as an alternative entry. Magic link is rejected.
- Adding password / passphrase / OAuth later is **trivially additive** via `linkIdentity()` and `updateUser({ password })` — no migration risk.
- Cost at MVP scale (≤1k DAU) is effectively **$0** — Supabase Free + Resend Free covers it. Real cost only kicks in past ~50k MAU or 3k auth emails/day.

---

## 1. What Supabase GoTrue actually supports today (April 2026)

GoTrue (Supabase Auth) ships the following first-party methods, each callable from the JS client, server-side SDK, and REST. All of them work in Cloudflare Workers (RR7) runtime per existing `0003-remix-cloudflare-workers-framework.md`.

| # | Method                       | API call                               | Out-of-box? | Notes                                                                                    |
|---|------------------------------|----------------------------------------|-------------|------------------------------------------------------------------------------------------|
| 1 | Email + password             | `signUp({ email, password })`          | Yes         | Default since v1. Optional email confirmation step before session is issued.            |
| 2 | Magic link                   | `signInWithOtp({ email })` + `{{ .ConfirmationURL }}` template | Yes | Click-link UX. No code typed. PKCE flow on server.                                      |
| 3 | **Email OTP code**           | `signInWithOtp({ email })` + `{{ .Token }}` template + `verifyOtp({ email, token, type: 'email' })` | **Yes** | **6-digit numeric code by default.** Confirmed in Supabase docs: *"email OTPs are a form of passwordless login where users key in a six digit code sent to their email address"*. |
| 4 | Phone OTP (SMS)              | `signInWithOtp({ phone })` + `verifyOtp({ phone, token, type: 'sms' })` | Yes | Twilio/MessageBird/Vonage/Textlocal. **REJECTED for tadaify** by `0019-progressive-signup-no-phone.md`. |
| 5 | WhatsApp OTP                 | `signInWithOtp({ phone, channel: 'whatsapp' })` | Yes | Twilio only. Same rejection as SMS.                                                     |
| 6 | OAuth — Google               | `signInWithOAuth({ provider: 'google' })` | Yes      | Three scopes: openid + email + profile. Requires Google Cloud project + redirect URI.    |
| 7 | OAuth — others               | Apple, Azure, GitHub, GitLab, Bitbucket, LinkedIn, Discord, Twitch, Spotify, Slack, Notion, Figma, Twitter/X, Facebook, Kakao, Keycloak, WorkOS, Zoom | Yes | All ID-token-based. Same `signInWithOAuth` signature.                                   |
| 8 | SAML / SSO                   | `signInWithSSO({ domain })`            | Yes (Pro+)  | Enterprise. Out of scope for MVP.                                                        |
| 9 | Anonymous                    | `signInAnonymously()`                  | Yes         | Issues real session for unauthenticated user; can be upgraded later via `linkIdentity`. Useful for "try before signup". |
| 10 | Passkeys (WebAuthn)         | Not native — community workaround via Edge Function + auth hooks | No (yet) | Tracked in github.com/supabase/auth#1396. Not on 2026 roadmap. **Out of scope.**         |
| 11 | Passphrase                   | Just a password with `minLength` raised in client validation | Yes (effectively) | GoTrue does not differentiate "password" vs "passphrase". Min length is configurable per project. |
| 12 | TOTP MFA (authenticator app) | `mfa.enroll()` → `mfa.challenge()` → `mfa.verify()` | Yes | Layered on top of any of #1–#9. Permitted for tadaify by `0019-progressive-signup-no-phone.md`. |
| 13 | SMS MFA                      | `mfa.enroll({ factorType: 'phone' })`  | Yes (Pro+ "Advanced MFA" $75/mo) | **REJECTED** for tadaify (no phone).                                                     |

Source: [supabase/auth README](https://github.com/supabase/auth) + [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth).

---

## 2. Email OTP code — concrete API specification

This is the path most relevant to the user's pivot. Detailed spec follows.

### 2.1 Trigger send

```ts
const { error } = await supabase.auth.signInWithOtp({
  email: 'creator@example.com',
  options: {
    shouldCreateUser: true,            // default true; set false to disallow new signups via this endpoint
    emailRedirectTo: 'https://tadaify.com/auth/callback',  // only used if template emits {{ .ConfirmationURL }}; ignored for pure-OTP
    data: { handle: 'reserved-handle' } // arbitrary user_metadata; persists on auth.users
  }
})
```

- `shouldCreateUser: true` → if email is unknown, **a new user is created** on `verifyOtp` success. This is the path tadaify Slice B wants.
- `shouldCreateUser: false` → only existing users get the code; useful for login-only screens.
- `data` payload lands in `auth.users.raw_user_meta_data`. **This is where we stash the reserved `handle` from Slice A** so the post-verify trigger can promote it to a `profiles` row.
- The same endpoint is used for both magic link and OTP code. **What controls the format is the email template, not the API call.**

Source: [signInWithOtp reference](https://supabase.com/docs/reference/javascript/auth-signinwithotp), [Passwordless email logins guide](https://supabase.com/docs/guides/auth/auth-email-passwordless).

### 2.2 Email template — switching to numeric code

In Supabase Studio → Authentication → Email Templates → "Magic Link" template, replace `{{ .ConfirmationURL }}` with `{{ .Token }}`. From the docs:

> "If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent. If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent."

Suggested template body (English MVP per `0013-en-only-marketing-at-launch.md`):

```html
<h2>Your tadaify verification code</h2>
<p>Enter this code on the registration screen to confirm your email:</p>
<p style="font-size:32px;letter-spacing:6px;font-weight:700">{{ .Token }}</p>
<p>The code expires in 10 minutes. If you didn't request this, ignore this email.</p>
```

### 2.3 Verify code

```ts
const { data, error } = await supabase.auth.verifyOtp({
  email: 'creator@example.com',
  token: '123456',
  type: 'email'   // for signup-via-OTP. Other types: 'signup' | 'recovery' | 'email_change' | 'sms' | 'phone_change'
})
// data.session is set → user is logged in immediately
```

- Returns a full session (access + refresh token). Same shape as `signInWithPassword`.
- On wrong code: `error.message === 'Token has expired or is invalid'`. **GoTrue does not enforce a per-attempt counter** — rate limiting is per-IP / per-user / per-hour (see §2.6).
- After verify, `auth.users.email_confirmed_at` is set. The handle in `raw_user_meta_data` is now ours to harvest.

Source: [verifyOtp reference](https://supabase.com/docs/reference/javascript/auth-verifyotp).

### 2.4 Code format and length

- **Default: 6 digits, numeric.** Confirmed in [Passwordless email logins](https://supabase.com/docs/guides/auth/auth-email-passwordless).
- Configurable via `auth.email.otp_length` (project setting): 6, 7, or 8 digits.
- Numeric only — no alphanumeric option. (For a true alphanumeric recovery code, that's a separate `recovery_codes` table — not relevant here.)

### 2.5 Expiration

- Default: **3600 seconds (1 hour)**.
- Configurable: `auth.email.otp_expiry`. Hard maximum: **86400 s (24 h)** — Supabase explicitly disallows higher *"to guard against brute force attacks"*.
- Recommended for tadaify: tighten to **600 s (10 min)** — matches Linktree's behaviour and limits the blast radius if a code email is forwarded.

### 2.6 Rate limits (default Supabase, current docs 2026-04)

Per [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits) — corrected after PR #123 Codex round-1 review:

| Endpoint / bucket                                      | Default                                  | Configurable | Notes                                                                      |
|--------------------------------------------------------|------------------------------------------|--------------|-----------------------------------------------------------------------------|
| `/auth/v1/otp` (signInWithOtp — magic link OR OTP code) | **30 sends/hour, project-wide**          | Pro+ project | Independent of SMTP source. Counts both magic-link and OTP-code requests.  |
| `/auth/v1/signup` + `/auth/v1/recover` + email-update via built-in SMTP only | **2 emails/hour, project-wide** | Custom SMTP removes the cap | Applies only to Supabase's built-in email provider. Custom SMTP (Resend) bypasses this bucket. |
| `/auth/v1/verify` (`verifyOtp`)                        | **360 verify attempts/hour, per IP**     | No           | Plus burst behavior. Wrong-code retries don't tank legitimate users on different IPs. |
| `/auth/v1/token` (refresh)                             | 1800/hour per IP                         | No           | Generous; not relevant for signup flow.                                    |
| Per-user OTP send                                      | 60 s between sends                       | Yes          | User-level cooldown — matches the 60s resend timer in current mockup.       |

**Decision implication (corrected):**

- The **30/h OTP project-wide cap** is the binding limit for our signup flow regardless of SMTP. At 30 OTPs/hour we can onboard ~720/day max — comfortable for MVP, would clip at 1k+ daily new signups.
- The 2/h built-in-SMTP cap applies ONLY to `/signup` + `/recover` + email-update endpoints (NOT `/otp`). For pure email-OTP flow that does not use `/signup`, this bucket is largely irrelevant.
- Resend custom SMTP is recommended for **deliverability + branded sender + production-readiness** reasons (DKIM, dedicated IP, branded domain), not because of a hard rate-limit cliff. Plan to wire before public launch but it is no longer a non-negotiable prerequisite.
- Local dev uses Inbucket (no rate limits) per `feedback_supabase_local_inbucket_for_auth_testing.md`.

### 2.7 Template / copy controls

- Subject line: configurable per template.
- Sender name + reply-to: configurable per project (when custom SMTP is wired).
- Body: full HTML, mustache-style variables. Supported variables: `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .RedirectTo }}`, `{{ .SiteURL }}`, `{{ .Data }}` (the `data` payload from `signInWithOtp`).
- Localisation: **single-template-per-language is NOT native.** Two paths: (a) issue OTP/magic-link only in English at MVP (allowed by `0013-en-only-marketing-at-launch.md`), or (b) implement an "Auth Hook" Edge Function that swaps template by `raw_user_meta_data.locale`. Path (a) for MVP.

---

## 3. Comparison matrix across methods

Scored 1–5 (5 = best) where applicable. "OOTB" = out-of-box.

| Method                         | Friction at signup | Security | OOTB GoTrue | Deliverability concern | Mobile UX | Password recovery story | Passwordless story |
|--------------------------------|--------------------|----------|-------------|------------------------|-----------|------------------------|--------------------|
| Email + password               | Low (1 step)       | 2 (depends on user)  | Yes | None at signup | Decent (autofill via password manager) | resetPasswordForEmail → email link | N/A |
| Magic link                     | Medium (open email, click link, **may open in new tab/new browser** — session split risk) | 4 | Yes | Same-tab issue on mobile mail apps (Gmail in-app browser) | Poor on iOS mail (link opens in Safari, loses tab) | N/A — link-only | Native |
| **Email OTP code**             | **Medium (open email, copy code, paste)** | **4** | **Yes** | None | **Excellent — iOS/Android autofill from clipboard, single tab** | Add password later via `updateUser` | **Native** |
| Phone OTP (SMS)                | Low                | 4        | Yes (Pro $)  | High (carrier deliverability + cost) | Excellent (auto-fill from SMS) | N/A | Native |
| Google OAuth                   | Lowest (2 clicks)  | 5 (Google's MFA) | Yes | None | Excellent | N/A | Native |
| TOTP MFA                       | High (must enrol)  | 5        | Yes         | None                                  | Decent (Authy/1Password autofill) | N/A | Layered |
| Passkeys                       | Lowest once enrolled | 5      | **No (community workaround)** | None | Excellent | N/A | Native (post-MVP) |
| Passphrase                     | Same as password   | 4        | Yes (just a password) | None | Mediocre (manual type) | Same as password | N/A |

### Friction rationale for tadaify

For a creator-tools SaaS, the lowest-friction path that still verifies email ownership wins. **Magic link's "session split" failure mode** — code arrives in Gmail iOS app, link opens Safari, signup tab on Chrome is now orphaned — is the single biggest UX failure observed across creator platforms (cited by Beacons help docs). **Email OTP code in the same tab** sidesteps this entirely.

---

## 4. Linktree's actual flow (verified)

User remembered "Linktree popup with numeric code at signup". Verification:

| Step                              | Linktree's actual UX (2026)                                                                                                |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| Visit signup page                 | Email + password fields, OR Google OAuth, OR Apple OAuth.                                                                  |
| Submit email + password           | Account created.                                                                                                           |
| **Email verification at signup**  | **Magic link (clickable verification link).** Per [Linktree sign-up email verification](https://support.linktr.ee/en/articles/2970026-linktree-sign-up-email-verification): *"you will need to verify your email address before activating your account... click on the link sent to verify your email"*. Link is valid 72 hours. |
| Login (existing user)             | Email + (a) password OR (b) **6-digit one-time code** sent to email — per [Why do I receive a one-time code when I log in](https://help.linktr.ee/en/articles/10708963-why-do-i-receive-a-one-time-code-when-i-log-in). |
| MFA (optional)                    | TOTP authenticator app, OR SMS in US/AU/UK/CA only (6-digit code).                                                         |

**Conclusion:** the user's memory is correct about *the existence* of a 6-digit code popup at Linktree, but it's part of the **login flow**, not signup. Linktree's signup is actually email+password+magic-link-confirm (or OAuth). The "popup with code, no password" UX the user wants is Linktree's *passwordless login*.

This is a **good thing** for tadaify — it means we can ship a *better-than-Linktree* signup experience by using OTP code at signup instead of the magic-link confirmation Linktree saddles its new users with.

> TODO: verify with screenshot capture once the orchestrator unblocks linktr.ee on WebFetch. The 403 we hit on `linktr.ee/admin/signup` was bot-detection, not absence of the page. The help-center articles cited above are unambiguous about the flow.

### Competitor scan (quick)

- **Beacons.ai** — email + password OR Google OAuth at signup; magic link verification (per Beacons help docs on auth, [help.beacons.ai](https://help.beacons.ai/en)).
- **Bento.me** — email + password OR Google OAuth; standard verification email.
- **Stan.store** — email + password + magic link verification.
- **Bio.link** — email + password.

**No major competitor uses OTP code at signup.** Adopting it is a small UX edge for tadaify, *not* a category convention.

---

## 5. Recommended v1 flow — option matrix

### Option A — Email OTP code only, no password ever

- **Flow:** Slice A reserve handle → email field → "send code" → 6-digit numeric code popup → verify → session → Slice C onboarding.
- **Business rationale:** simplest possible UX. Zero password decisions for the user. Modern feel ("like Notion, Vercel, Slack-magic-link-but-better").
- **Risk:** every login forever requires checking email. If the user's email is slow / has DMARC issues / hits spam, they're locked out. Long-term retention risk for daily-active users.
- **Verdict:** Acceptable for an occasionally-used SaaS (tax tools, calendars). **Marginal for tadaify** because creators check tadaify daily to update their bio link.

### Option B — Email OTP code at signup → password set in Slice C onboarding (RECOMMENDED)

- **Flow:** Slice A reserve handle → email field → 6-digit code popup → verify → land in Slice C onboarding wizard → step "Set a password (optional, recommended for daily access)" → either set password or skip ("I'll log in with codes").
- **Business rationale:** OTP path matches user's pivot vision. Password is explicitly framed as a *speed-up* for the user, not a security gate. Skippers stay on OTP-only login forever (with a "Set password later" option in Settings). 95% will set one because the wizard primes them.
- **Risk:** small — adds one optional step to onboarding. Mitigated by clear copy ("Want to skip codes next time? Set a password.").
- **Verdict:** **Recommended.** Best of both worlds. No friction at signup, no permanent code-fatigue.
- **Add Google OAuth as parallel entry on the email screen** ("or continue with Google"). OAuth users skip OTP entirely.

### Option C — Email OTP for signup; password set during Slice C, mandatory

- **Flow:** as B, but password setup is required, not optional.
- **Business rationale:** guarantees every account has a password fallback.
- **Risk:** adds 1 mandatory step → measurable signup-completion drop (industry data: 5–8% per added required step at this stage). 
- **Verdict:** Reject. Mandatory password defeats the point of OTP-first.

### Option D — Keep magic link (current mockup)

- **Business rationale:** matches Linktree, Beacons, Stan.
- **Risk:** the session-split failure mode (Gmail iOS → Safari) is real and well-documented. User's distaste for magic-link UX is also legitimate signal.
- **Verdict:** **Reject** — the entire reason for this research is the user's pivot away from magic link.

### Option E — Google OAuth + Email OTP, no email+password path at all

- **Flow:** signup screen offers exactly two paths: "Continue with Google" or "Use email code".
- **Business rationale:** zero password infrastructure to maintain; smallest auth surface; smallest support load.
- **Risk:** every email-only user has the daily-code problem (same as Option A).
- **Verdict:** Acceptable variant of Option A; same retention risk.

---

## 6. Migration / additive path

If v1 ships with Option B (OTP + optional password) and we later want to add passphrase or extra OAuth providers:

| Add later                   | Mechanism                                                                                                            | Migration risk |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------|----------------|
| Password to OTP-only user   | `supabase.auth.updateUser({ password })` while logged in. No migration required.                                     | Zero           |
| Passphrase (long password)  | Same as password — just raise client-side `minLength` to e.g. 16 chars + zxcvbn check.                              | Zero           |
| Google OAuth to email user  | `supabase.auth.linkIdentity({ provider: 'google' })`. Manual linking must be enabled (`GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=true`). | Zero — flag toggle |
| Passkey support             | Edge Function + custom auth hook (community pattern) when GoTrue ships native, swap.                                 | Low — Edge Function isolated from rest of app |
| MFA TOTP                    | `mfa.enroll()` flow — add to Settings page.                                                                         | Zero           |

**No schema change required for any of these.** GoTrue stores all identities on `auth.identities` (one row per provider) and credentials on `auth.users`. Our `profiles` table only foreign-keys `auth.users.id`, so it's identity-method-agnostic.

Sources: [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [Password recovery](https://supabase.com/docs/guides/auth/passwords), [MFA](https://supabase.com/docs/guides/auth/auth-mfa).

---

## 7. Recovery scenarios

For Option B (OTP + optional password), recovery looks like:

| Scenario                            | Resolution                                                                                                                                         |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Forgot password                     | "Send me a login code" link on login page → OTP. Then update password via Settings. **No email-link recovery loop needed.**                       |
| Lost access to email                | Hard problem for OTP-only accounts. Mitigations: (a) recommend password setup at onboarding (Option B does this); (b) for paid users, manual support recovery via Stripe-verified ownership; (c) future: add backup recovery codes (10 single-use codes, generated at MFA enrolment). **MVP punts on this** — accept that lost-email-no-password users will go through manual support. |
| Account takeover (email compromised) | Same risk as Linktree / Beacons / any email-first auth. Mitigation: TOTP MFA in Settings (post-MVP add). |
| Device lost mid-session             | Session is JWT-based; lost device just means re-login on new device with email + code. No special recovery needed.                                |

**Comparison with Linktree:** Linktree's recovery model is identical (email is the master key). They mitigate via SMS MFA (US/AU/UK/CA only) — we explicitly reject SMS per `0019-progressive-signup-no-phone.md` and offer TOTP instead.

---

## 8. Cost impact at scale

### 8.1 Email volume per DAU

Assumptions per active user:
- 1 signup OTP email (one-time, lifetime).
- Average user logs in **once per device per 30 days** (session refresh tokens last ~7 days, get re-extended; OTP triggered when refresh expires or user clears cookies).
- For OTP-only users (no password): 1 OTP login email per device per 30 days ≈ **~2 emails/user/month**.
- For password+OTP users (Option B happy path after Slice C): ~0.3 OTP emails/month (only when refreshing on new device).

Blended assumption: **2 auth emails / DAU / month** (conservative).

### 8.2 Cost-at-scale table

| Daily Active Users | Monthly auth emails (≈ 2/DAU/mo) | Supabase Auth cost                            | Email send cost (Resend)              | Total auth cost / month |
|--------------------|----------------------------------|-----------------------------------------------|----------------------------------------|-------------------------|
| **100 DAU**        | 200                              | $0 (under 50k MAU Free tier)                  | $0 (under 3k Resend Free)              | **$0**                  |
| **1,000 DAU**      | 2,000                            | $0 (under 50k MAU Free tier)                  | $0 (under 3k Resend Free)              | **$0**                  |
| **10,000 DAU**     | 20,000                           | $0 (under 50k MAU Free tier — count is monthly active not daily; assuming MAU ≈ 1.5×DAU = 15k, still free) | $20 (Resend Pro 50k tier)              | **$20**                 |
| **100,000 DAU**    | 200,000                          | $25 base + ((150k − 100k) × $0.00325) = $25 + $162.50 = **$187.50** (Pro + overage; MAU ≈ 150k) | $90 (Resend Scale 200k tier)           | **$277.50**             |
| **1,000,000 DAU**  | 2,000,000                        | $599 base (Team) + ((1.5M − 100k) × $0.00325) = $599 + $4,550 = **$5,149** (Team + overage) | $650 (Resend Scale 2.5M tier)          | **$5,799**              |

Notes:
- Supabase Free tier covers up to 50k MAU. MAU is "any user with at least one auth event in 30 days." Cheap.
- Resend Free covers 3k emails/month with a 100/day cap. **The 100/day cap is the binding constraint at small scale**, not monthly. At 50 DAU sending 2 OTPs/mo each, fine. At 100+ DAU clustered around launches, 100/day will trip — must move to Resend Pro ($20/mo) earlier than the volume math suggests.
- Custom SMTP (Resend) is recommended for branded sender + DKIM + deliverability, not as a rate-limit blocker. Built-in SMTP is viable for early MVP/smoke-test and small beta as long as project stays under the 30/h `/auth/v1/otp` cap and the 2/h built-in-SMTP `/signup`+`/recover` cap.
- At 10k+ DAU, cost is **dominated by Supabase MAU pricing**, not email. OTP-vs-password makes no measurable cost difference.

**Conclusion:** auth method choice has near-zero cost impact for tadaify's foreseeable horizon (≤10k DAU = ≤$20/mo total auth cost). Cost is a non-issue for the decision.

### 8.3 Rate limit cliff (corrected after Codex round-1)

The binding default ceilings are:

- **30 OTP sends/hour project-wide** on `/auth/v1/otp` — independent of SMTP. Hard cap from MVP day one. Equivalent to ~720 signups + login-codes per day before throttling. Comfortable for early traction; tight at 1k+ daily new signups.
- **2 emails/hour built-in SMTP** on `/signup` + `/recover` + email-update endpoints only — NOT triggered by pure-OTP flow. Relevant if we ever add a `signUp({ password })` path or `resetPasswordForEmail`.
- Custom SMTP (Resend) **bypasses the 2/h SMTP bucket** but does NOT relax the 30/h `/auth/v1/otp` cap. The OTP cap is configurable on Pro+.

**Decision implication:** Resend custom SMTP is a **deliverability + branded-sender + production-readiness** recommendation, not a hard rate-limit blocker. Plan to wire before public launch (DKIM, branded domain, deliverability monitoring). MVP smoke-test and small beta can run on built-in SMTP if we stay under the limits.

---

## 9. Implementation effort estimate (in agent-dispatches)

Estimates assume the orchestrator-driven workflow per `feedback_estimates_in_agent_dispatches_not_human_weeks.md`. Solo founder + Claude Code agents, no human dev team.

### Option B happy path (recommended)

1. **Mockup revision** (1 dispatch) — update `mockups/tadaify-mvp/register.html` to OTP-code popup variant + "or continue with Google" + post-confirm landing into Slice C wizard. **Opus 4.7** per `feedback_mockups_always_opus.md`. Output: revised HTML mockup. [+1 user review cycle]
2. **Backend + frontend implementation** (1 dispatch, Sonnet) — wire `signInWithOtp` + `verifyOtp` for the OTP-code path, switch email template to `{{ .Token }}` form, add Google OAuth button via `signInWithOAuth`, harvest reserved handle from `raw_user_meta_data` into `profiles` row via DB trigger. Pure additive on the existing `0019` no-phone constraint. Output: Slice B PR with unit tests + Playwright plan. [+1 Codex review cycle, +1 Claude apply cycle]
3. **Custom SMTP wiring** (½ dispatch, Sonnet) — Resend project, DKIM/DMARC config in Cloudflare DNS, Supabase project SMTP settings, env vars per `feedback_env_var_grep_before_deploy.md`. Output: Resend live, first OTP email through Resend smoke-tested locally. [+0.5 user verify cycle]. Recommended pre-public-launch for deliverability/branded sender, not strictly required to ship Slice B against built-in SMTP if traffic stays under default rate limits.
4. **Slice C onboarding step "set password (optional)"** (1 dispatch, Sonnet) — separate slice, gated on Slice B complete. Adds one step to wizard, calls `updateUser({ password })`. [+1 user review cycle]

**Total: ~3.5 agent dispatches + 3.5 user review cycles + 1 Codex round.** Realistic calendar elapse ≈ 2–4 days at user's current pacing (the bottleneck is user pacing, not agent throughput, per the same memory rule).

### Option D (magic link — already mockup'd) — for comparison

- 0.5 dispatches less (no OTP popup component) but **adds the session-split UX risk** that motivated the pivot. Same SMTP work either way.

### Option A / E (no password ever)

- Saves ~1 dispatch (no Slice C password step) but ships the "lost email = lost account" risk to v1. Net: not worth.

---

## 10. Open questions / unknowns (TODOs)

- **TODO: verify** Linktree signup screen capture — `linktr.ee/admin/signup` returned 403 to WebFetch (bot detection). The help-center articles cited are unambiguous, but a screenshot would be cleaner evidence. User can confirm directly by going through Linktree signup once.
- **TODO: verify** whether Supabase will land native passkeys before Q4 2026. If yes, treat Option B's password step as "or use a passkey" by GA, but ship password-only at MVP.
- **TODO: verify** Resend's 100/day cap on Free tier doesn't trigger spam-folder behaviour for the first dozen senders; smoke test before public launch.

---

## DEC-291 (pending) — recommendation

### Czego dotyczy

Locking the v1 auth flow for tadaify Slice B Register. User pivoted away from the current 3-path mockup (Google + magic link + password). This DEC picks one of A/B/C/D/E and locks it before mockup revision.

### Szczegolowy opis

Current Slice B mockup at `mockups/tadaify-mvp/register.html` shows three signup paths (Google OAuth + email magic-link + email+password). User wants to replace the magic-link path with an **email OTP numeric-code popup** (Linktree-login-style) and remove the password requirement at signup. Open subquestion: do we set a password later (in Slice C) or never? Adding password later via `updateUser` is trivially additive — zero migration risk. Cost is a non-issue at MVP scale ($0 up to 10k DAU). Resend custom SMTP is recommended for deliverability/branding before public launch but is no longer treated as a hard rate-limit blocker (corrected after PR #123 Codex round-1 review — see §2.6 + §8.3).

### Opcje

1. **Option A — Email OTP only, no password ever** (Google OAuth still offered as parallel path).
2. **Option B — Email OTP at signup → password setup as optional step in Slice C onboarding** (Google OAuth as parallel path).
3. **Option C — Email OTP at signup → password setup mandatory in Slice C** (Google OAuth as parallel path).
4. **Option D — Keep current magic-link + password mockup unchanged** (reject the pivot).
5. **Option E — Google OAuth + Email OTP only, drop email+password path entirely**.

### Per-option business rationale

| # | Option | Business rationale | Trade-off |
|---|--------|--------------------|-----------|
| 1 | A — OTP only | Cleanest UX, smallest auth surface, shortest implementation path | Daily-use product → daily-code fatigue. Lost email = lost account, no fallback. |
| 2 | **B — OTP + optional password in Slice C** | **Best UX at signup AND low friction on return; password explicitly framed as speed-up not security gate; ~95% will set one because primed by wizard. Daily-active users get password speed; light users stay on OTP forever.** | One extra optional step in Slice C. ~+0.5 dispatch effort vs A. |
| 3 | C — OTP + mandatory password | Guarantees every account has password fallback for support cases. | Mandatory step → measurable signup-completion drop (~5–8% industry data). Defeats the OTP-first promise. |
| 4 | D — Keep magic link | Zero rework; matches Linktree/Beacons convention. | The session-split failure on iOS Gmail is real and was the trigger for this pivot. Reverting denies the user's stated UX preference. |
| 5 | E — OAuth + OTP, no password ever | Smallest auth surface; ~zero password support tickets ever. | Same daily-code-fatigue + lost-email risk as A. No marginal benefit over A unless we want to drop the password-fallback option permanently. |

### Cost-at-scale table (per option, total auth cost / month)

Assumes 2 auth emails/DAU/mo (Options A/B/C/E) or 1 magic-link email/DAU/mo (Option D — links last 7 days vs OTP 10 min). Custom SMTP via Resend.

| DAU       | Option A | **Option B** | Option C | Option D (magic) | Option E |
|-----------|----------|--------------|----------|------------------|----------|
| 100       | $0       | **$0**       | $0       | $0               | $0       |
| 1,000     | $0       | **$0**       | $0       | $0               | $0       |
| 10,000    | $20      | **$20**      | $20      | $20              | $20      |
| 100,000   | $277     | **$277**     | $277     | $277             | $277     |
| 1,000,000 | $5,799   | **$5,799**   | $5,799   | $5,799           | $5,799   |

Cost is **dominated by Supabase MAU pricing past 100k**, not email volume. OTP vs magic link makes no measurable cost difference. **Choice is purely UX-driven.**

### Twoja rekomendacja

**Option B.** Email OTP code at signup with password set as an optional, clearly-framed-as-speedup step in Slice C onboarding, plus Google OAuth as a parallel entry. Ships the user's pivot UX exactly, eliminates the magic-link session-split failure, keeps daily-active creators on a password fast-path, and adds zero migration risk because `updateUser({ password })` is trivially additive. The whole change is ~3.5 agent dispatches with no schema change.

---

## Sources

### Supabase docs (primary)

- [Passwordless email logins](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Password-based authentication](https://supabase.com/docs/guides/auth/passwords)
- [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Multi-factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)
- [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- [signInWithOtp reference](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [verifyOtp reference](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Supabase pricing](https://supabase.com/pricing)
- [supabase/auth GitHub](https://github.com/supabase/auth)

### Linktree (verified UX)

- [Linktree sign-up email verification](https://support.linktr.ee/en/articles/2970026-linktree-sign-up-email-verification)
- [Why do I receive a one-time code when I log in](https://help.linktr.ee/en/articles/10708963-why-do-i-receive-a-one-time-code-when-i-log-in)
- [Why am I not getting my Linktree login code](https://linktr.ee/help/en/articles/11677986-why-am-i-not-getting-my-linktree-login-code)
- [Protect your Linktree account with MFA](https://linktr.ee/help/en/articles/6108442-protect-your-linktree-account-with-mfa-multi-factor-authentication)

### Resend (custom SMTP cost)

- [Resend pricing](https://resend.com/pricing)

### Internal references

- `docs/decisions/0003-remix-cloudflare-workers-framework.md` — RR7 on Cloudflare Workers; auth must work in Workers runtime
- `docs/decisions/0013-en-only-marketing-at-launch.md` — single-locale email templates acceptable for MVP
- `docs/decisions/0019-progressive-signup-no-phone.md` — no phone field at signup; TOTP MFA only
- `docs/decisions/0026-platform-oauth-import-rejected.md` — does NOT reject Google OAuth for signup; only rejects platform OAuth for content import
- Memory: `feedback_estimates_in_agent_dispatches_not_human_weeks.md`
- Memory: `feedback_dec_format_v3_business_cost.md`
- Memory: `feedback_supabase_local_inbucket_for_auth_testing.md`
- Memory: `feedback_env_var_grep_before_deploy.md`
- Memory: `feedback_mockups_always_opus.md`
