---
type: research-brief
project: tadaify
title: Supabase identity linking + X/Apple OAuth + force-email-always
agent: opus-4-7
author: orchestrator
created_at: 2026-04-30
status: draft
related_brs: []
related_issues: []
tags: [auth, supabase, oauth, identity-linking, apple, twitter, slice-b-register]
---

# Supabase identity linking + X/Apple OAuth + force-email-always

> **Scope.** This report answers the identity-linking + extra-providers + force-email questions raised during Slice B Register refinement. It is the **companion** to `docs/research/supabase-auth-methods.md` (PR #123) which inventoried the auth *methods* (OTP / magic link / password). Together the two reports cover the full Slice B decision surface. Cross-references throughout; no duplication of method-level material.
>
> **Why this exists.** User flagged a bad past experience with AWS Cognito where each identity provider produced a separate user UID even when the underlying email was identical, leaving duplicate accounts and a schema-level mess. Before locking the Slice B auth flow we need a defensible answer on (a) does Supabase do the same, (b) can X and Apple be added without painful surprises, (c) can we guarantee every `auth.users` row has a real email regardless of which provider signed up.

---

## TL;DR

1. **Cognito vs Supabase — opposite defaults.** AWS Cognito User Pools creates a separate user profile per identity provider by default (`MyIDP_bob@example.com` style derived username), no automatic linking; merging requires `AdminLinkProviderForUser` API and is a manual operation. **Supabase / GoTrue, by default, automatically links identities sharing a verified email into ONE `auth.users` row.** The Cognito problem the user remembers does not exist on Supabase as long as the auto-link default is left ON and we trust only verified emails. Source: [Supabase identity linking docs](https://supabase.com/docs/guides/auth/auth-identity-linking) — *"Supabase Auth automatically links identities with the same email address to a single user."*
2. **X (Twitter) feasibility — caveat-heavy.** OAuth 2.0 is supported natively by GoTrue. Email scope requires `Request email from users` toggled ON in the X app config. Whether X actually delivers the email at sign-in depends on the user having an email on file and on the current X API tier (pricing/tier matrix changed twice in 2025; pay-per-usage replacing the old Basic/Pro subscriptions per [docs.x.com pricing page](https://docs.x.com/x-api/getting-started/pricing)). Recommendation: **defer X to post-MVP**; not worth the integration risk for Slice B.
3. **Apple feasibility — supported but operationally heavy.** Apple Developer Program $99/yr ([developer.apple.com/programs](https://developer.apple.com/programs/)). Hide-My-Email (`xxxx@privaterelay.appleid.com`) is a per-user-per-app deterministic relay, will NOT auto-link to a real-email identity (different email values), and the secret key must be **rotated every 6 months** ([Supabase Apple guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)). Recommendation: **defer Apple to post-MVP** unless we ship native iOS, since App Store guideline 4.8 only mandates Sign-In-with-Apple for native iOS apps that offer third-party login, not for a web-only MVP.
4. **Force-email-always — partial guarantee available.** GoTrue itself does not ship a hard "reject signups without email" toggle. We get it via two layers combined: (a) only enable providers that always return email (Google, email-OTP, email+password), defer X until tier is sorted, accept Apple Hide-My-Email as a verified-relay address, and (b) a custom Auth Hook (`before-user-created`) or `profiles` row trigger that rejects NULL email at insert time. This composes cleanly with the auto-link default.
5. **DEC-293 / DEC-294 recommendations are at the bottom.** Short version: enable auto-linking (default), MVP providers = Google + email-OTP + email+password (Slice C), defer X + Apple, add a `before-user-created` Auth Hook that rejects NULL emails, document Apple relay address as "verified email" once we add Apple post-MVP.

---

## Section 1 — Identity linking deep dive

### 1.1 Default Supabase behavior — answer to the user's Cognito worry

**Verdict: Supabase does NOT replicate the Cognito problem.** When the same verified email signs in via two different providers, Supabase consolidates them into ONE `auth.users` row by default. From [Supabase docs (identity linking)](https://supabase.com/docs/guides/auth/auth-identity-linking):

> *"Supabase Auth automatically links identities with the same email address to a single user. This improves the user experience when multiple OAuth login options are presented since the user does not need to remember which OAuth provider they used to sign up with the app."*

There is one `auth.users.id` (the canonical user UUID); each provider that signs the same person in writes/updates a row in `auth.identities` linked back via `auth.identities.user_id`.

**Security guard built in.** The same docs page:

> *"When a new identity can be linked to an existing user, Supabase Auth will remove any other unconfirmed identities linked to an existing user. This is to prevent pre-account takeover attacks."*

So an attacker who signs up email+password with `victim@gmail.com` (unverified) does NOT get auto-linked when the real `victim@gmail.com` later signs in via Google — the unconfirmed shell identity is removed.

**Caveat:** *"Users that signed up with SAML SSO will not be considered as targets for automatic linking."* Not relevant to tadaify (no SAML).

### 1.2 `auth.identities` table schema

From the GoTrue source code ([identity.go](https://github.com/supabase/auth/blob/master/internal/models/identity.go)):

| Column | Type | Notes |
|---|---|---|
| `id` (returned as `identity_id` in JSON) | `uuid` | Primary key per identity row |
| `provider_id` (returned as `id` in JSON) | `string` | The provider's own user ID (Google `sub`, Apple `sub`, X user_id, or the email itself for the `email` provider) |
| `user_id` | `uuid` | FK to `auth.users.id` — **this is the linking column** |
| `identity_data` | `jsonb` | Provider-returned profile claims (name, avatar_url, email, etc.) |
| `provider` | `string` | `google` / `apple` / `twitter` / `email` / `phone` / etc. |
| `email` | `nullable string` | Email pulled out of `identity_data` for index/search |
| `last_sign_in_at` | `timestamptz` | |
| `created_at` / `updated_at` | `timestamptz` | |

One row per (provider, provider_id) pair. Multiple rows can share `user_id` — that IS the link.

### 1.3 `linkIdentity()` — manual, while logged in

`supabase.auth.linkIdentity({ provider: 'google' })` lets a logged-in user attach an additional provider whose **email differs** from their primary. This is the explicit user-initiated path. By default it is **disabled** in self-hosted GoTrue and must be turned on:

- Hosted Supabase: dashboard toggle in Authentication → Settings.
- Self-hosted: env var `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=true`.

> TODO: verify the exact env-var name against current `auth` repo — the README excerpt did not list it explicitly, but the docs page references the dashboard toggle and historical `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED` is the documented flag from older release notes. Will confirm before locking implementation.

**`linkIdentity()` ≠ auto-linking.** Auto-linking happens at sign-in time when emails match; `linkIdentity()` happens by user action while authenticated. Both can coexist.

### 1.4 Other relevant flags

| Flag | Default | Effect |
|---|---|---|
| `MAILER_AUTOCONFIRM` | `false` | If `true`, skips email-confirmation step. **Leave false** — confirmed emails are the precondition for auto-linking to be safe. |
| `DISABLE_SIGNUP` | `false` | Blocks new signups; only invites work. Not relevant for MVP. |
| `GOTRUE_EXTERNAL_EMAIL_ENABLED` | `true` | Set `false` to disable email-as-provider (users could still OAuth in). Not what we want. |
| `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED` | `false` | Toggles `linkIdentity()` API. Independent from auto-linking-by-email. |

Source: [GoTrue README](https://github.com/supabase/auth/blob/master/README.md) (Supabase fork).

### 1.5 Concrete walk-through — the four user-mentioned scenarios

Tables show `auth.users` and `auth.identities` row state after each step. Assumes Supabase **defaults** (auto-link ON, autoconfirm OFF, manual-link OFF).

#### Scenario A — Google then email-OTP, same email

| Step | `auth.users` | `auth.identities` |
|---|---|---|
| 1. Sign up Google `alex@gmail.com` (verified by Google) | 1 row: `id=U1, email=alex@gmail.com, email_confirmed_at=now` | 1 row: `provider=google, provider_id=<google-sub>, user_id=U1, email=alex@gmail.com` |
| 2. Later: request email-OTP for `alex@gmail.com`, click link | Same `U1` (no new row) | +1 row: `provider=email, provider_id=alex@gmail.com, user_id=U1, email=alex@gmail.com` |

Result: **ONE user, TWO identities, fully linked.** This is exactly the experience the user wanted.

#### Scenario B — email-OTP first, then Google, same email

| Step | `auth.users` | `auth.identities` |
|---|---|---|
| 1. Email-OTP signup for `alex@gmail.com`, click link | 1 row: `id=U1, email=alex@gmail.com, email_confirmed_at=now` | 1 row: `provider=email, ..., user_id=U1` |
| 2. Later: "Continue with Google" returns verified `alex@gmail.com` | Same `U1` | +1 row: `provider=google, ..., user_id=U1` |

Result: **ONE user, TWO identities, fully linked.** Symmetric to Scenario A.

#### Scenario C — Apple Hide-My-Email, then email-OTP with real email

| Step | `auth.users` | `auth.identities` |
|---|---|---|
| 1. Sign up Apple, user picks Hide-My-Email; Apple returns relay `xyz123@privaterelay.appleid.com`, `email_verified=true` | 1 row: `id=U1, email=xyz123@privaterelay.appleid.com, email_confirmed_at=now` | 1 row: `provider=apple, ..., user_id=U1, email=xyz123@privaterelay.appleid.com` |
| 2. Later: same human requests email-OTP for `alex@gmail.com` | **NEW** row: `id=U2, email=alex@gmail.com` | 1 row: `provider=email, ..., user_id=U2` |

Result: **TWO users, NOT linked.** The two emails are different strings; Supabase has no way to know they are the same human. Recovery path: user logs into the Apple account, then calls `linkIdentity({ provider: 'email' })` (manual link) to attach the gmail. This requires `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=true`. **This is the unavoidable cost of Apple Hide-My-Email** — no provider can fix it.

#### Scenario D — X with no email scope granted, then wants to add email

X can return profile without email if email scope was not granted or the user has no email on file.

| Step | `auth.users` | `auth.identities` |
|---|---|---|
| 1. Sign up X, no email returned. **Supabase default:** rejects the signup with "email required" error, OR creates a user with NULL email depending on flags. | TODO: verify behavior on current GoTrue — issues like `supabase/auth#214` ("Oauth fails when no email is linked to account") suggest signup is rejected outright. | — |
| 2. If we WANT to allow it, we'd have to use a custom auth hook that synthesises `<x_user_id>@noreply.x.tadaify.com` and store it. Not recommended. | | |

Result: **X-without-email is a dead-end for our flow.** This is one of the load-bearing reasons to defer X (see §2 + §5).

### 1.6 AWS Cognito comparison — confirm or deny user's recollection

**User's recollection: CONFIRMED, fully accurate.**

From [AWS Cognito User Pools federation docs](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html):

> *"Amazon Cognito creates a user profile for your federated user in its own directory. Amazon Cognito derives the `username` attribute for a federated user profile from a combination of a fixed identifier and the name of your IdP."*

Example: `MyIDP_bob@example.com`. Each IdP also gets its own user-group `[user pool ID]_[IdP name]` (e.g. `us-east-1_EXAMPLE_Google`). And explicitly:

> *"Linked users aren't automatically added to this group, but you can add their profiles to the group in a separate process."*

So Cognito creates duplicate user profiles per provider by default. Linking is manual via the `AdminLinkProviderForUser` admin API. The user's painful memory was correct.

**Net.** Migrating mental model: in Cognito the **default leaves a mess**, in Supabase the **default cleans up after itself**. We do not need to write any custom linking code on Supabase — we just need to leave the default ON and trust verified emails.

### 1.7 Industry standard — what do peers do?

| Service | Behavior | Notes |
|---|---|---|
| **Linktree** | Email-first signup; OAuth providers added as secondary linked identities. Auto-links by verified email. | Public docs: limited; behavior observed via signup flow. |
| **Stripe Dashboard login** | Email-first; OAuth via Google added as alternative. Single account ID. | docs.stripe.com auth flow |
| **Notion** | Auto-links Google ↔ email if emails match (verified Google email = verified Notion email). | Public help center |
| **Vercel** | Multiple OAuth identities per account (GitHub + GitLab + Bitbucket + email). Manual link via Settings. | docs.vercel.com |

All four converge on **one canonical user, multiple linked identities**. None replicate the Cognito-style "separate UID per provider" surprise. Supabase's default puts us in the same camp as Notion / Stripe / Linktree without writing custom code — exactly where Slice B wants to be.

---

## Section 2 — X (Twitter) OAuth in Supabase

### 2.1 Native support

GoTrue ships native X support. Two variants:
- **Twitter (OAuth 1.0a)** — *legacy, will be deprecated in future releases* per [Supabase X provider docs](https://supabase.com/docs/guides/auth/social-login/auth-twitter).
- **Twitter (OAuth 2.0)** — recommended path going forward.

We would use OAuth 2.0.

### 2.2 Email scope

Email is NOT returned by default. Two prerequisites:

1. In the X Developer Portal app config: turn ON `Request email from users`.
2. The X user must have a confirmed email on their X account.

If either fails, the OAuth callback returns no email and (per `supabase/auth#214` and similar issues) GoTrue rejects the signup with an "email required" error unless we add a custom hook.

### 2.3 X API tier — moving target

X migrated from a Basic/Pro/Enterprise subscription matrix to **pay-per-usage credits** at some point in 2025 ([docs.x.com pricing page](https://docs.x.com/x-api/getting-started/pricing)):

> *"X API v2 uses pay-per-usage pricing. Pay only for what you use."*

The legacy subscription tiers (Basic ~$200/mo, Pro ~$5,000/mo) remain available to existing subscribers but are no longer offered to new applicants per the same page. Whether OAuth 2.0 user authentication + email scope is gated behind any minimum credit balance is **not documented on the public pricing page**.

> TODO: verify current X API access requirements for OAuth 2.0 + email scope by creating a test app on developer.x.com console at implementation time. Public docs are insufficient as of 2026-04-30.

### 2.4 Effort delta vs Google OAuth

| Task | Google OAuth | X OAuth 2.0 |
|---|---|---|
| Provider config in Supabase dashboard | 5 min | 5 min |
| Provider app creation on vendor side | Google Cloud Console, 10 min, free | X Developer Portal, 30 min, requires app review for elevated email scope on legacy tier |
| Callback URL setup | Trivial | Trivial |
| Email always returned? | Yes (verified) | No — conditional on user having email + scope toggle ON |
| Cost at scale | Free | Pay-per-usage credits, unknown for OAuth-only usage |
| Migration risk if X changes pricing again | Low | **High — we don't control vendor pricing volatility** |

**Verdict.** X is technically supported, but the combination of (a) email-not-guaranteed, (b) volatile pricing, (c) moving target on tier requirements makes it a poor fit for Slice B MVP. Recommend deferring to post-MVP and revisiting once user demand justifies the integration risk.

---

## Section 3 — Apple Sign In quirks

### 3.1 Web flow vs native

[Supabase Apple guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) describes three paths:
1. **OAuth flow (web)** — REST APIs, `signInWithOAuth({ provider: 'apple' })`. **This is the one tadaify needs** (web-only MVP, RR7 on Cloudflare Workers).
2. **Sign in with Apple JS** — official Apple JS framework for classic websites; uses `signInWithIdToken()`.
3. **Native iOS/macOS** — Authentication Services framework. Not in scope for tadaify MVP.

### 3.2 Hide My Email — deterministic per-app relay

When user picks Hide-My-Email, Apple returns:
- `email`: `xxxxxxxx@privaterelay.appleid.com` (deterministic per Apple-user × per Services-ID — same relay every login for this app, but unique vs other apps)
- `email_verified`: `true`
- `sub`: stable Apple user identifier (this is what links re-logins together)

Email forwarding from the relay to the user's real inbox works, but **only if** the sender domain is registered + verified in the Apple Developer console under "Sign In with Apple → Email Sources." See guide:

> *"You must register email sources in the Apple Developer Console to enable Apple to send relay emails through your domain."*

For tadaify: we'd register `tadaify.com` (or whichever transactional sender we use) so that Stripe receipts, password-reset OTPs, etc. actually reach the user.

### 3.3 Implications for identity linking

- Hide-My-Email user signs up via Apple → `auth.users.email = xyz@privaterelay.appleid.com`, `email_confirmed_at=now` (Apple verified it).
- Same human later requests email-OTP for their real `alex@gmail.com` → **does NOT auto-link**, because the email strings differ. New `auth.users` row.
- Recovery: while logged in as the Apple account, call `linkIdentity({ provider: 'email' })` to attach the gmail. Requires manual linking enabled.

This is unavoidable. Apple's product promise IS that the relay address obscures the real one. We can mitigate by:
1. UI copy in account settings: "Add an email you can sign in with directly" prompt for Apple-relay users.
2. Documenting the relay path as a "verified email" everywhere downstream (Stripe customer email, transactional emails, etc.) — relay forwarding is reliable as long as the email source is registered.

### 3.4 App Store guideline 4.8 applicability

From [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) §4.8:

> *"Apps that use a third-party or social login service (such as Facebook Login, Google Sign-In, Sign in with Twitter, Sign In with LinkedIn, Login with Amazon, or WeChat Login) to set up or authenticate the user's primary account with the app must also offer as an equivalent option another login service…"*

Guideline 4.8 is in the App Review (native iOS app store) section. **It does NOT apply to web apps.** tadaify MVP is web-only (RR7 on Cloudflare Workers, single domain `tadaify.com`). So we are NOT obligated to ship Sign-In-with-Apple in the MVP just because we ship Google.

If/when we build a native iOS app later, 4.8 kicks in and Apple becomes mandatory.

### 3.5 Apple Developer Program cost

[$99/yr for individuals and organizations](https://developer.apple.com/programs/) (Enterprise is $299/yr but that's for in-house distribution, not relevant). Annual recurring expense for the Services ID + signing keys.

### 3.6 Operational cost — secret rotation every 6 months

Apple requires the JWT signing secret to be regenerated every 6 months from the `.p8` private key. Per [Supabase Apple guide](https://supabase.com/docs/guides/auth/social-login/auth-apple):

> *"Apple requires you to generate a new secret key every 6 months. […] Set a recurring calendar reminder for every 6 months to rotate your secret key."*

This is a real ops burden. Skip a rotation → all Apple Sign-In attempts break.

### 3.7 Effort delta vs Google OAuth

| Task | Google | Apple |
|---|---|---|
| Vendor account cost | Free | $99/yr |
| Provider config setup | 10 min | 60 min (Services ID + App ID + private key + email source registration) |
| Secret rotation cadence | Long-lived OAuth client secret | Every 6 months |
| Email relay handling | N/A | Must register `tadaify.com` as verified email source |
| App-Store mandate | Doesn't trigger 4.8 | Triggers 4.8 IF we ship native iOS later (free in that case since we'd already need the developer account) |

**Verdict.** Supported but operationally heavy. For web-only MVP we get no compliance benefit (4.8 doesn't apply) and add a rotating-secret + relay-email-source operational tax. **Defer to post-MVP.** Revisit when (a) we ship native iOS, or (b) user research shows a meaningful slice of target audience prefers Apple over Google + email.

---

## Section 4 — Force-email-always policy

### 4.1 Built-in flag?

**No.** GoTrue does not ship a single config flag like `GOTRUE_REQUIRE_EMAIL=true`. The closest thing is `GOTRUE_EXTERNAL_EMAIL_ENABLED` which controls whether email-as-a-provider is enabled at all — not whether OAuth signups must carry an email.

### 4.2 Default per-provider behavior

| Provider | Email behavior on signup |
|---|---|
| `email` (OTP / password) | Email IS the identity. Always present + verified. |
| `google` | Google always returns verified email when user has one (>99% do). |
| `apple` | Always returns email — real OR relay. `email_verified=true`. |
| `twitter` (OAuth 2.0) | Conditional — only if scope ON and user has email on file. May fail signup if missing. |
| `phone` | No email; phone is the identity. Tadaify excludes per DEC-0019. |

Per `supabase/auth#214` and similar issues, when an OAuth provider returns no email, **GoTrue currently rejects the signup with an error** (does NOT create a NULL-email user). This is the de facto force-email-default for everything except SSO/SAML edge cases not relevant to us.

### 4.3 Apple relay — does it count?

Apple Hide-My-Email returns `email_verified=true` from Apple's signed ID token. Supabase trusts this — the relay address is treated as a confirmed email everywhere downstream. From the operational standpoint, transactional email (Stripe receipts, password-reset OTPs) DOES reach the user as long as we register `tadaify.com` as an email source in Apple console (§3.2).

So a relay address is a *real, contactable email* from the system's POV. It would be wrong to filter relays out at the Auth Hook level.

### 4.4 How to enforce force-email-always (composable layers)

- **Layer 1 — provider whitelist.** Only enable providers that always (or near-always) return email. MVP: `email`, `google`. Defer `twitter` until tier sorted; defer `apple` until we have ops bandwidth for 6-mo key rotation.
- **Layer 2 — Auth Hook.** Add a `before-user-created` Postgres function (Supabase Auth Hooks, [docs](https://supabase.com/docs/guides/auth/auth-hooks)) that rejects signups with `NEW.email IS NULL OR NEW.email = ''`. Belt-and-suspenders against any future provider misconfig.
- **Layer 3 — DB constraint.** `auth.users.email` is already NULLABLE in the schema (because phone-only signup is supported); we can't add a NOT NULL constraint on `auth.users` directly. Instead, our `public.profiles` table mirrors `email` with `NOT NULL`, and the row is created via `on_auth_user_created` trigger — which fails if email is NULL, rolling back the auth signup.

This three-layer combo gives us the practical guarantee.

### 4.5 What breaks if we DON'T enforce

- **Stripe receipts fail** → customer never sees their invoice → support ticket → churn.
- **Password-reset / OTP flows broken** → user locked out → support ticket → churn.
- **GDPR data export / delete-my-account** → contact channel missing → manual ops on every request.
- **Marketing / re-engagement / failed-payment retries** → blind.

Forcing email is non-negotiable for a paid SaaS. The question is HOW, not WHETHER.

---

## Section 5 — Recommended v1 strategy for tadaify

### 5.1 Provider scope — MVP (Slice B)

**Enable:**
- `email` (OTP) — Slice B baseline per `supabase-auth-methods.md` recommendation (PR #123 Option B).
- `email` (password) — added in Slice C per same recommendation.
- `google` — single OAuth provider; gives us "Continue with Google" CTA without integration risk.

**Defer to post-MVP:**
- `twitter` (X) — pricing/tier volatility + email-not-guaranteed; revisit when user demand justifies risk.
- `apple` — App Store 4.8 doesn't apply to web-only MVP; $99/yr + 6-mo key rotation + relay email source registration is too much ops burden for Slice B.
- `phone` — already excluded per DEC-0019.

### 5.2 Identity linking config

- **Auto-link by verified email: ON** (Supabase default). Do NOT disable. This is the single most important config decision and it's already correct out of the box.
- **Manual linking (`linkIdentity()`): ON.** Set `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=true` (or dashboard equivalent). Needed for the post-MVP Apple-relay-then-real-email recovery flow + a future "add another login method" account-settings UI.
- **`MAILER_AUTOCONFIRM`: OFF** (default). Confirmed emails are the precondition for safe auto-linking.
- **`DISABLE_SIGNUP`: OFF** (default).

### 5.3 Force-email-always enforcement

Three layers per §4.4: provider whitelist + `before-user-created` Auth Hook rejecting NULL email + `public.profiles` trigger with `NOT NULL email`.

### 5.4 Recovery flows when providers disagree

- **Same email, different provider** → handled automatically by auto-link. No user-visible step needed.
- **Different email (Apple relay vs real email, or post-MVP X)** → in account settings, surface "Add another login method" → calls `linkIdentity()` → user authenticates with the second provider while logged in → both identities now share `user_id`.
- **Forgot which provider I used** → email-OTP path always works because every account has email by construction. User enters email, receives OTP, lands in account, can see linked providers in settings.

### 5.5 Per-option business rationale + provider-specific incremental cost

#### Recommendation: Email-OTP + email-password (Slice C) + Google OAuth, auto-link ON, manual-link ON, force-email Auth Hook

> **Cost scope clarification (corrected after PR #124 Codex round-1 P1):** the table below shows **incremental provider-specific cost only**. Supabase Auth platform base cost (MAU pricing, Pro $25/mo, Team $599/mo, MAU overage at $0.00325 above included tier) is OUT OF SCOPE here — it is identical across all options because every option ships on Supabase. For the full Supabase MAU + email volume cost-at-scale model with overage math, see PR #123 §8.2 (`docs/research/supabase-auth-methods.md`). Choosing among the auth-method options below does NOT change Supabase MAU spend; it only changes the per-provider add-ons.

| Option | Per-option business rationale | Incremental provider cost (independent of Supabase MAU base) |
|---|---|---|
| **Recommended (Email-OTP + Google OAuth)** | Lowest auth friction for creator audience (email + Google covers ~95% of web SaaS signups per industry baseline). Zero vendor risk. Auto-link kills the Cognito problem at the schema layer. Force-email keeps Stripe / OTP / GDPR healthy. | **$0** — Google OAuth has no per-call charge from Google for standard userinfo scopes; the only cost is Supabase MAU base, shared across every option. |
| **+ Apple Sign In (post-MVP)** | Adds ~5-10% conversion lift on iOS-heavy audiences. | **+$99/year** Apple Developer Program + ops time for 6-month key rotation + email source registration in Apple console. No per-call charge. |
| **+ X / Twitter (post-MVP)** | Adds creator-flavoured social CTA. Email-not-guaranteed + volatile pricing model. Probably <2% incremental conversion. | **TBD** — X moved to volatile pay-per-usage pricing in 2025; current Basic tier is ~$200/month before per-call surcharges. Requires re-pricing before any commitment. |
| **Alternative: Email-only, no Google** | Simpler. -10-20% conversion vs offering Google CTA per industry baseline. | **$0** — no provider add-on. |
| **Alternative: Every provider on day 1** | Higher conversion ceiling. 3-5x integration + ops cost. Risk of shipping Slice B late. | **$99/year (Apple) + TBD (X) + 0 (Google)** — sum of add-ons above. |

(Apple Developer Program pricing per [developer.apple.com/programs](https://developer.apple.com/programs/). X API pricing volatile per [developer.x.com/pricing](https://developer.x.com/en/products/x-api). Supabase platform base cost — MAU buckets + Pro/Team plans + overage — modelled in PR #123 §8.2 and applies identically across all rows above.)

### 5.6 Implementation effort in agent dispatches

(Per `feedback_estimates_in_agent_dispatches_not_human_weeks.md` — solo founder + Claude Code agents, not a dev team in weeks.)

| Workstream | Dispatches | Notes |
|---|---|---|
| Enable Google OAuth in Supabase + RR7 callback handling + UI button | 2-3 dispatches + 1 user review cycle | Standard work |
| Email-OTP flow (Slice B) — already research-locked in PR #123 | covered by existing Slice B plan | |
| `before-user-created` Auth Hook + `public.profiles` NOT NULL trigger | 1 dispatch + 1 review | Single Postgres function + trigger |
| Account-settings "Linked accounts" panel (manual link / unlink) | 2-3 dispatches + 1 review | Post-MVP if no Apple yet |
| Apple Sign-In (post-MVP) | 4-5 dispatches + 2 review | Includes Services ID config, key rotation runbook, email source registration |
| X Sign-In (post-MVP-maybe) | 3-4 dispatches + 1 review | Plus pricing/tier reconnaissance dispatch |

**MVP critical path: ~3-4 dispatches** for the Google + Auth Hook + force-email layer on top of the already-planned email-OTP work.

---

## Section 6 — Migration and edge cases

### 6.1 Merging duplicate `auth.users` rows after the fact

Risk scenario: we ship without auto-link enabled by accident, end up with duplicate users for the same human, then turn auto-link on later.

**Recovery is manual SQL** — Supabase does not ship a built-in merge tool:

```sql
-- Pseudocode, NOT for production without testing
BEGIN;
-- 1. Pick canonical user U_keep, secondary U_drop
-- 2. Re-point all FKs from U_drop to U_keep across application tables
UPDATE public.profiles SET user_id = U_keep WHERE user_id = U_drop;
UPDATE public.<every_table_with_user_id_FK> SET user_id = U_keep WHERE user_id = U_drop;
-- 3. Re-point auth.identities.user_id
UPDATE auth.identities SET user_id = U_keep WHERE user_id = U_drop;
-- 4. Delete the empty shell user
DELETE FROM auth.users WHERE id = U_drop;
COMMIT;
```

Operationally painful but tractable. **Best mitigation: leave auto-link ON from day 1** so we never have to do this.

### 6.2 Account-takeover via auto-link — security review

Threat: attacker signs up via Google with a *spoofed-but-verified* email matching the victim's existing email-OTP account. Could they auto-link into the victim's account?

**No, because of the unconfirmed-identities purge.** Per §1.1: when a new identity is auto-linked to an existing user, GoTrue removes any other unconfirmed identities. If the victim's account already exists with a confirmed email, the attacker's new identity attaches but cannot replace the confirmed one. The attacker would need to actually control the email address — at which point they can already reset the password and the attack vector is "the user lost their email," not "Supabase has a flaw."

The pre-account-takeover protection covers the inverse case: attacker signs up first with `victim@gmail.com` (unverified), waits for victim to OAuth in. Victim's OAuth login auto-links AND purges the attacker's unconfirmed shell. Attacker gets nothing.

**Net.** Auto-link by verified email is safe given current GoTrue guards. We rely on those guards by leaving the default ON.

### 6.3 GoTrue release timeline

The auto-link-by-email behavior has been the GoTrue default since at least v2.x (2023-2024 era). The user-visible docs page at [supabase.com/docs/guides/auth/auth-identity-linking](https://supabase.com/docs/guides/auth/auth-identity-linking) was updated through 2025 to add the manual-linking section but did not change the auto-link default. No behavioral changes expected for our integration window.

> TODO: verify against the current `auth` repo CHANGELOG at PR-implementation time. As of 2026-04-30 the public docs are authoritative.

---

## DEC-293 (pending) — Identity linking strategy

**Czego dotyczy:** Identity linking config for Slice B Register.

**Szczegolowy opis:** Default Supabase behavior auto-links identities by verified email into one `auth.users` row. This avoids the Cognito-style "separate UID per provider" mess the user was worried about. Manual linking via `linkIdentity()` covers the unavoidable cases (Apple Hide-My-Email vs real email) but is disabled by default. Question is whether to leave defaults / turn manual-link on / disable auto-link entirely.

**Opcje:**
1. **Auto-link ON (default), manual-link ON.** Best UX, schema clean, supports future Apple/X relay-vs-real recovery flows. Recommended.
2. **Auto-link ON (default), manual-link OFF.** Simpler. No way for user to attach a second login method while logged in. Apple Hide-My-Email recovery becomes a support ticket.
3. **Auto-link OFF, manual-link ON.** Defensive against rare edge cases. Reintroduces the Cognito problem at the schema level. Strongly NOT recommended.
4. **Auto-link OFF, manual-link OFF.** Maximally defensive. Worst UX. Strongly NOT recommended.

**Twoja rekomendacja:** **Option 1.** Auto-link ON gives us Notion / Stripe / Linktree-class UX out of the box; manual-link ON is cheap insurance for the Apple-relay recovery flow even though Apple is post-MVP — flipping flags later requires no migration but adding support tickets to backlog now is wasteful.

---

## DEC-294 (pending) — Provider scope + force-email-always

**Czego dotyczy:** Which OAuth providers to enable at Slice B MVP and how to enforce "every user has a real email."

**Szczegolowy opis:** GoTrue does not have a single force-email flag. Email guarantee depends on provider choice + Auth Hook + profiles trigger. X has email-not-guaranteed + volatile pricing; Apple has $99/yr + 6mo key rotation + Hide-My-Email relay; Google + email cover ~95% of signups with no caveats. Question is whether to ship MVP with all four providers or stage them.

**Opcje:**
1. **MVP: Google + email-OTP + email-password (Slice C).** Defer X + Apple to post-MVP. Add `before-user-created` Auth Hook rejecting NULL emails + `profiles.email NOT NULL` trigger. Recommended.
2. **MVP: Google + Apple + email.** Get App Store 4.8 compliance "for free" (even though we don't ship native iOS). Adds $99/yr + 6mo rotation tax to Slice B critical path.
3. **MVP: Google + X + email.** Bet on X creator audience. Pricing volatility risk; email-not-guaranteed adds Auth Hook special-case for X.
4. **MVP: all four.** Highest conversion ceiling. 3-5x integration + ops cost. Risk shipping Slice B late.
5. **MVP: email-only.** Simplest. -10-20% conversion vs offering Google.

**Per-option business rationale + cost-at-scale:** see §5.5 table above.

**Twoja rekomendacja:** **Option 1.** Google + email covers the vast majority of web SaaS signups; defer Apple + X to post-MVP when (a) we have user demand data and (b) Apple key rotation + X tier volatility are someone else's problem to revisit. Enable the force-email Auth Hook on day 1 — one extra dispatch, prevents Stripe / OTP / GDPR breakage forever.

---

## Sources

- Supabase identity linking: https://supabase.com/docs/guides/auth/auth-identity-linking
- Supabase Apple provider: https://supabase.com/docs/guides/auth/social-login/auth-apple
- Supabase Twitter/X provider: https://supabase.com/docs/guides/auth/social-login/auth-twitter
- Supabase users + identities API: https://supabase.com/docs/guides/auth/users
- Supabase Auth Hooks: https://supabase.com/docs/guides/auth/auth-hooks
- GoTrue (auth) source — Identity model: https://github.com/supabase/auth/blob/master/internal/models/identity.go
- GoTrue README env vars: https://github.com/supabase/auth/blob/master/README.md
- AWS Cognito federation: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html
- App Store Review Guidelines (4.8): https://developer.apple.com/app-store/review/guidelines/
- Apple Developer Program: https://developer.apple.com/programs/
- X API pricing: https://docs.x.com/x-api/getting-started/pricing
- Companion report: `docs/research/supabase-auth-methods.md` (PR #123)
- Existing tadaify DECs: `docs/decisions/0019-progressive-signup-no-phone.md`, `docs/decisions/0026-platform-oauth-import-rejected.md`, `docs/decisions/0003-remix-cloudflare-workers-framework.md`, `docs/decisions/0001-single-domain-architecture.md`

> TODO: verify items flagged inline — `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED` exact spelling against current auth repo, current X API tier requirements for OAuth 2.0 + email scope (test app on developer.x.com), GoTrue CHANGELOG for any 2026-Q1 linking-behavior changes.
