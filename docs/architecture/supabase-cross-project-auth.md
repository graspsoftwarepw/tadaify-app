---
type: architecture-research
project: tadaify-portfolio
title: Cross-Project User Identity — Supabase Research
created_at: 2026-04-24
author: orchestrator-sonnet-4-6-auth-research
status: draft-v1
---

# Cross-Project User Identity Research

## 0. Executive Summary

**Core answer: NO, Supabase does not natively support cross-project auth out of the box — but a native path now exists.**

Supabase launched an **OAuth 2.1 Server** (public beta, November 2025, free on all plans) that lets one Supabase project act as a full OIDC identity provider. Combined with the **Custom OAuth/OIDC Providers** feature (up to 3 per project), this creates a fully supported, zero-managed-infrastructure path:

1. `askbeforeship` Supabase project enables OAuth 2.1 Server → becomes an OIDC IdP.
2. `tadaify` Supabase project adds `askbeforeship` as a Custom OIDC Provider (via auto-discovery).
3. Users log in to `tadaify` with "Sign in with askbeforeship" — standard authorization code + PKCE flow.
4. Cost: $0 engineering infra (both stay on existing Supabase plans), only implementation time.

**Recommended architecture**: Supabase-native OAuth 2.1 federation — one project as hub IdP, others as relying parties — with a lightweight `identity_hub` Edge Function table to track cross-project links and shared profile data.

**At scale (>10k cross-MAU)**, migrate hub to Clerk: 1 Clerk instance, unlimited apps, satellite domains for seamless cross-app session sharing, at $0.02/MAU after 50k free MRU.

---

## 1. Native Supabase Capabilities

### 1.1 GoTrue Architecture

Supabase Auth is a fork of GoTrue (Netlify's open-source auth service). The hosted platform deploys **one GoTrue instance per Supabase project** — there is no organization-level auth layer that spans multiple projects. Each instance owns its own:
- `auth` schema in its Postgres database
- JWT signing keys (asymmetric RS256/ES256 or legacy HS256 shared secret)
- JWKS endpoint at `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`

The instance is stateless with respect to other projects — it does not know about them.

### 1.2 Organization-Level Auth — Does Not Exist

Supabase organizations are billing groupings only. There is no organization-wide GoTrue instance or shared auth layer. Each project inside an organization has its own independent auth system.

### 1.3 Enterprise SSO (SAML 2.0)

Supabase supports SAML 2.0 on Pro plans and above. This is designed for enterprises wanting their employees to use a corporate IdP (Okta, Azure AD, etc.) to log into a single Supabase project — not for cross-Supabase-project federation.

Key limitations:
- Each Supabase project requires its own separate SAML setup.
- SLO (Single Logout) is not supported.
- No automatic account linking between SSO and email/password accounts.
- Priced per SSO MAU (Monthly Active User).

This is **not** the right tool for tadaify ↔ askbeforeship federation.

### 1.4 New: OAuth 2.1 Server (Beta — Key Finding)

**Launched public beta November 26, 2025.** Free on all Supabase plans during beta.

A Supabase project can be turned into a full **OAuth 2.1 + OIDC identity provider**. Once enabled, it exposes:

| Endpoint | URL Pattern |
|---|---|
| Authorization | `https://<ref>.supabase.co/auth/v1/oauth/authorize` |
| Token | `https://<ref>.supabase.co/auth/v1/oauth/token` |
| JWKS | `https://<ref>.supabase.co/auth/v1/.well-known/jwks.json` |
| OIDC Discovery | `https://<ref>.supabase.co/auth/v1/.well-known/openid-configuration` |
| UserInfo | `https://<ref>.supabase.co/auth/v1/oauth/userinfo` |

Supported scopes: `openid`, `email`, `profile`, `phone`. Supported flows: Authorization Code + PKCE (mandatory), Implicit (discouraged).

Access tokens issued are standard Supabase JWTs with `user_id`, `role`, and `client_id` claims.

### 1.5 Custom OAuth/OIDC Providers (Consumer Side)

A Supabase project can consume **up to 3 custom OAuth/OIDC providers** per project. When using OIDC with auto-discovery, you supply only the issuer URL — Supabase fetches the discovery document and JWKS automatically.

This means: if project A enables OAuth 2.1 Server, project B can add project A as a custom OIDC provider — "Sign in with Project A."

### 1.6 Third-Party Auth (JWT Trust without Native Session)

Supabase also supports "Third-Party Auth" integrations (Clerk, Firebase, Auth0, Cognito, WorkOS) where the Supabase API trusts JWTs issued by an external provider. The API verifies tokens against the provider's JWKS but does NOT create a native GoTrue session. This is useful for RLS enforcement but not for full auth UX.

This same mechanism can, in theory, be used to trust JWTs from another Supabase project — you fetch the other project's JWKS endpoint and configure trust — but this requires custom code (no dashboard toggle for "trust another Supabase project directly") and gives you only stateless JWT verification, not a user session.

### 1.7 Shared JWT Secret Trick (Legacy, Discouraged)

It is technically possible to set the same HS256 JWT secret on two Supabase projects. Tokens from project A would then validate on project B's API. This was a documented workaround for user migration (see Supabase migration troubleshooting guide).

**Supabase explicitly discourages this.** Reasons:
- Shared HS256 secret = if one project is compromised, both are.
- With the May 2025 rollout of asymmetric keys (RS256/ES256 by default for new projects), this technique doesn't work unless you explicitly import an HS256 secret on both sides.
- No dashboard support — manual configuration only.
- Security implications: a stolen secret can impersonate users on both platforms.

**Do not use this in production.**

---

## 2. JWT Federation Patterns

### 2.1 Can tadaify Trust JWTs from askbeforeship?

Yes, via two mechanisms:

**Mechanism A — OAuth 2.1 + Custom OIDC (Recommended):**
1. askbeforeship enables OAuth 2.1 Server.
2. tadaify adds askbeforeship as a Custom OIDC Provider (auto-discovery with issuer URL).
3. User clicks "Sign in with askbeforeship" on tadaify.
4. Standard OAuth redirect → user authenticates on askbeforeship → authorization code returned → tadaify exchanges for access token.
5. tadaify creates a native Supabase Auth session for the user with a linked identity record.
6. Result: full native session in tadaify, email/profile populated from askbeforeship token.

**Mechanism B — Third-Party JWT Trust (Limited):**
1. askbeforeship enables OAuth 2.1 Server (for asymmetric keys).
2. tadaify is configured (via Supabase CLI / config.toml) to trust JWTs from askbeforeship's JWKS.
3. The askbeforeship JWT can be passed as Bearer token to tadaify's REST/GraphQL API.
4. tadaify RLS rules execute as if the user were authenticated.
5. **Limitation**: no GoTrue session in tadaify — no `supabase.auth.getUser()`, no magic link, no refresh token in tadaify.

Mechanism A is the full UX path. Mechanism B is useful for background API calls when the user's askbeforeship session is already active.

### 2.2 Custom JWT Claims for Cross-Project Metadata

The **Custom Access Token Hook** runs before every JWT is issued and can add arbitrary claims to `app_metadata` or `user_metadata`. It can query the local Postgres database.

Practical use: in askbeforeship's Custom Access Token Hook, add a claim like:
```json
{
  "app_metadata": {
    "linked_products": ["tadaify"],
    "portfolio_user_id": "uuid-from-identity-hub-table"
  }
}
```

This claim would be visible to tadaify when it receives the OAuth token, enabling "you're already a portfolio member" UX.

---

## 3. Workaround: Central Auth Provider (Options A–E)

### Option A: Auth0 as Central Identity Provider

**How it works:**
Both tadaify and askbeforeship are registered as Auth0 Applications. Users authenticate with Auth0 once; both Supabase projects trust Auth0 JWTs via Third-Party Auth integration.

**Supabase integration:**
Both projects add Auth0 as a Third-Party Auth provider (dashboard config). The Auth0 token is used as Bearer token for Supabase API calls. Each Supabase project can still have its own user records created on first login via a database webhook triggered by Auth0.

**Pros:**
- Single canonical user identity across all apps.
- Rich user management dashboard.
- Social providers configured once, used everywhere.
- Auth0 SSO sessions: user logs into tadaify, askbeforeship auto-logs them in within the same browser session.

**Cons:**
- Additional vendor (Auth0 is an Okta product — enterprise-oriented pricing).
- Free tier: 25,000 MAU (generous).
- B2C cross-app SSO only available on Professional plan ($240/month).
- Migration required: existing Supabase Auth users need password re-import or magic link flow.
- Auth0's native Supabase integration exists but requires custom JWT templates or middleware.

**Cost:**
- 0–25k MAU: $0 (free tier)
- 25k–50k MAU: ~$35–240/month depending on plan and features needed
- Cross-app SSO specifically: Professional B2C at $240/month or Enterprise (custom)

**Security:** Strong — Auth0 handles MFA, attack protection, bot detection. JWTs are RS256 signed.

**Time to implement:** 3–5 days (Auth0 setup + both Supabase integrations + user migration).

---

### Option B: Custom Identity Hub (Dedicated Supabase Project + JWT Minting)

**How it works:**
A third Supabase project (`identity-hub`) serves as the canonical auth source. It runs GoTrue for user authentication. Other projects (tadaify, askbeforeship) trust JWTs issued by the hub via the Third-Party Auth mechanism or OAuth 2.1 Server.

In the hub project, a `cross_project_links` table maps hub users to per-project user IDs:
```sql
CREATE TABLE cross_project_links (
  hub_user_id uuid REFERENCES auth.users(id),
  project_name text NOT NULL,         -- 'tadaify' | 'askbeforeship'
  project_user_id uuid NOT NULL,       -- user's ID in that project
  linked_at timestamptz DEFAULT now(),
  PRIMARY KEY (hub_user_id, project_name)
);
```

When a user logs into tadaify "Sign in with identity-hub":
1. OAuth 2.1 flow to hub.
2. Hub JWT carries `hub_user_id`.
3. tadaify Edge Function creates/maps the local user record on first login.

**Supabase integration:** Hub enables OAuth 2.1 Server → other projects add it as Custom OIDC Provider.

**Pros:**
- Zero new vendors — pure Supabase.
- Full control over user data, migration pace.
- All projects can eventually share profile data via hub's public API.
- Cheapest long-term (additional Supabase project = $25/month on Pro).

**Cons:**
- Engineering effort: consent screen UI, token exchange, user mapping logic.
- Operational overhead: one more Supabase project to maintain.
- If hub goes down, cross-project login breaks (though each project retains its local session).
- No satellite domain magic — browser sessions are independent per domain.

**Cost:** $25/month for hub project (Pro plan) + engineering time (est. 5–8 days initial).

**Security:** Same as Supabase — RS256 signed JWTs, RLS in hub DB. Hub project must be treated as critical infrastructure.

**Time to implement:** 5–8 days.

---

### Option C: OAuth 2.0 Between Projects (askbeforeship as IDP for tadaify)

**How it works:**
This is now the native Supabase path (Section 1.4). No extra infrastructure needed.

1. askbeforeship enables OAuth 2.1 Server in `config.toml`:
   ```toml
   [auth.oauth_server]
   enabled = true
   authorization_url_path = "/oauth/consent"
   ```
2. Register tadaify as an OAuth client in askbeforeship's dashboard (Auth > OAuth Apps).
3. tadaify adds askbeforeship as a Custom OIDC provider (auto-discovery).
4. Build a consent screen in askbeforeship (React page at `/oauth/consent` that calls `supabase.auth.oauth.getAuthorizationDetails(id)` and `approveAuthorization()`).
5. When tadaify user clicks "Sign in with askbeforeship":
   - Redirected to askbeforeship's `/oauth/consent`
   - User authenticates in askbeforeship (if not already)
   - Approves scopes (email, profile)
   - Code returned to tadaify callback
   - tadaify exchanges code for JWT; GoTrue creates native session

**Pros:**
- Native Supabase feature — no extra vendor, no extra project.
- Standard OIDC — well-documented protocol.
- Free during beta (all plans).
- tadaify gets a real GoTrue session with email from askbeforeship.
- Identity linking in tadaify: askbeforeship identity linked to tadaify user.

**Cons:**
- Consent screen must be built — custom UI work.
- Only 3 custom providers per Supabase project — fine for now, limits future.
- Users need an askbeforeship account first (not reversible without implementing the reverse too).
- Session is not automatically shared across domains — tadaify still requires its own login after the OAuth flow.

**Cost:** $0 extra infra during beta. Engineering: ~3–4 days.

**Security:** RS256 signed, PKCE mandatory, asymmetric keys. Strong.

**Time to implement:** 3–4 days.

---

### Option D: SAML / Enterprise SSO

SAML 2.0 is designed for enterprise B2B scenarios (a company's employees log into SaaS via corporate IdP). It is not suitable for consumer cross-SaaS product federation.

Verdict: **Not applicable** for tadaify portfolio.

---

### Option E: Passwordless Shared-Email Approach (No True SSO)

**How it works:**
No auth federation at all. When askbeforeship user clicks "Try tadaify":
1. Their email is captured client-side (from existing session).
2. tadaify's `inviteUserByEmail()` admin API is called from an Edge Function.
3. User receives a magic link to tadaify (auto-creates tadaify account).
4. On first tadaify login, a "Recognized from askbeforeship" banner shows.

Repeated logins to tadaify: standard email/password or magic link — independent of askbeforeship.

**Pros:**
- Zero engineering complexity — just an email invite API call.
- No consent screen, no OAuth plumbing.
- Works today, no new features needed.
- Users don't need to understand OAuth — just "click the link in your email."

**Cons:**
- Not true SSO — user has two separate accounts, two separate passwords.
- If user changes email on askbeforeship, tadaify doesn't know.
- No "linked accounts" — user might forget they already signed up.
- Friction: requires inbox check for every cross-app first login.

**Cost:** $0.

**Time to implement:** 4 hours (Edge Function + UI button).

---

## 4. Magic Link Approach

Supabase supports the `inviteUserByEmail` admin API, which sends a magic link to create/accept an account:

```typescript
// In askbeforeship Edge Function (service role)
const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
  user.email,
  {
    redirectTo: 'https://tadaify.com/welcome?source=askbeforeship',
    data: {
      source_app: 'askbeforeship',
      source_user_id: user.id
    }
  }
)
```

The `redirectTo` URL can point to tadaify. The `data` object is stored in `user_metadata` on the new tadaify user. tadaify's welcome page reads `?source=askbeforeship` and shows "Welcome! We recognized you from askbeforeship."

**Limitations:**
- Magic link is one-time use and expires (default 24h, configurable).
- Redirect URL must be on tadaify's allowlist in Supabase dashboard.
- This creates a new independent tadaify user — not linked to askbeforeship identity at the auth level.
- For future logins, user needs their own tadaify credentials (or uses magic link again).

**Cross-project magic link with pre-fill:**
The email is always pre-filled because the invite is sent to the user's existing email. tadaify's onboarding reads `user_metadata.source_app` and tailors the welcome message.

**Verdict:** This is Option E in practice. Simplest path for the "try our other product" UX, but not true SSO.

---

## 5. Shared User Data (Profile, Avatar, Bio)

### 5.1 Profile Synchronization

Supabase does not support cross-project profile sync natively. Options:

**Option 1 — Webhook replication:**
askbeforeship triggers a database webhook when profile is updated → calls tadaify's Edge Function → tadaify updates its local profile table. Bidirectional sync requires webhooks on both sides.
- Eventual consistency (seconds lag).
- Engineering: ~1 day per sync direction.

**Option 2 — Shared profile API:**
A central Edge Function in the identity-hub project (Option B) exposes a `/profile/:hub_user_id` endpoint. Both apps call it to read profile data at render time.
- Single source of truth.
- Extra HTTP call per page load (can be cached).
- Requires Option B infrastructure.

**Option 3 — User-initiated sync:**
User visits settings page on either app and clicks "Sync profile from [other app]" — triggers a one-time pull.
- Zero automation complexity.
- Poor UX — users forget, profiles diverge.

### 5.2 Shared Avatar/Media Storage

Supabase Storage buckets are per-project — there is no cross-project shared bucket. Options:

**Option A — CDN-hosted avatars:** Store avatar on Cloudflare R2 or S3, share the CDN URL across projects. Each project stores only the URL string (not the blob).
- Clean, cheap, no cross-project complexity.
- Recommended for the portfolio architecture.

**Option B — Public bucket in hub project:** Hub's Supabase Storage bucket is public. Both apps use `https://<hub-ref>.supabase.co/storage/v1/object/public/avatars/<user_id>` as the avatar URL.
- Requires hub project (Option B).
- Simpler URL management.

**Option C — User uploads separately per app:** Each app has its own avatar. No sync.
- Works fine if the apps feel like independent products.
- No complexity.

### 5.3 Cross-Portfolio Analytics

If the user wants aggregate analytics ("total revenue across all products"):
- A dedicated analytics Supabase project (or separate schema in hub) collects normalized events from all apps via Edge Function webhooks.
- No native Supabase cross-project analytics.
- Alternatively, a BI tool (Metabase, Retool) queries both projects' Postgres directly via service-role connection strings.

---

## 6. Billing Integration — One Stripe Customer Across Projects

### 6.1 Can We Consolidate?

**Yes, natively via Stripe Organizations:**
Stripe supports sharing customers and payment methods across multiple Stripe accounts that are part of an organization. All accounts in the sharing group can:
- Retrieve and charge shared payment methods.
- View the same customer record.
- Sync customer fields: name, email, address, phone, description, metadata, shipping.

**Important limitations:**
- Only card-type payment methods are shareable (Apple Pay, Google Pay, Link included). ACH, Klarna, etc. remain account-specific.
- "You can't selectively share individual customers — when you turn on sharing, all customers and payment methods are shared."
- Consolidated invoicing (one invoice for all subscriptions) requires Stripe Billing Cadences feature (launched 2025) — all subscriptions share the same billing date.

### 6.2 Implementation Pattern

For the tadaify portfolio:
1. All products use the **same Stripe account** (simplest) — no sharing needed.
2. Or use separate Stripe accounts under one Stripe Organization → enable customer sharing.

Since tadaify and askbeforeship are likely the same business entity, using a single Stripe account is the simplest path. One Stripe `customer` per email. If the user subscribes to both products, two `subscriptions` under one `customer` → one invoice possible via Billing Cadences.

**Supabase side:** Each project has a `stripe_customers` table mapping `user_id → stripe_customer_id`. If the user exists in both projects, both tables point to the same `stripe_customer_id`. This is implemented via:
1. On first subscription in any project, create Stripe customer (or look up by email).
2. Store `customer_id` in that project's table.
3. When user arrives at second project: lookup by email → reuse existing `customer_id`.

```typescript
async function getOrCreateStripeCustomer(email: string, userId: string) {
  // Check local project table first
  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existing) return existing.stripe_customer_id

  // Check Stripe by email (same Stripe account, shared customers)
  const customers = await stripe.customers.list({ email, limit: 1 })
  if (customers.data.length > 0) {
    const id = customers.data[0].id
    await supabase.from('stripe_customers').insert({ user_id: userId, stripe_customer_id: id })
    return id
  }

  // Create new
  const customer = await stripe.customers.create({ email })
  await supabase.from('stripe_customers').insert({ user_id: userId, stripe_customer_id: customer.id })
  return customer.id
}
```

### 6.3 One Invoice for Both Subscriptions

Using Stripe Billing Cadences (2025 feature):
1. Create a Billing Cadence with monthly cycle on a fixed date.
2. Set it as the payer for both subscriptions.
3. Stripe generates one invoice per cycle covering both products.
4. Customer sees one line-item per product on one invoice.

Requirement: same `customer_id` on both subscriptions, same currency.

---

## 7. User Flow: askbeforeship → tadaify

### 7.1 Full OAuth Flow (Option C — Native Supabase)

```
askbeforeship app (user logged in)
  → User sees "Also check out tadaify" banner in account settings
  → Click "Try tadaify" button

askbeforeship redirects to:
  https://tadaify.com/auth/askbeforeship-connect

tadaify initiates OAuth:
  → Redirect to askbeforeship OAuth consent screen
  → https://<abs-ref>.supabase.co/auth/v1/oauth/authorize
     ?client_id=tadaify-client-id
     &redirect_uri=https://tadaify.com/auth/callback
     &scope=openid email profile
     &response_type=code
     &code_challenge=<pkce>
     &state=<csrf>

User sees askbeforeship consent UI:
  → "tadaify wants to access: Your email address, Your profile"
  → User clicks "Allow"

askbeforeship issues authorization code, redirects to:
  https://tadaify.com/auth/callback?code=<code>&state=<state>

tadaify exchanges code for tokens:
  POST https://<abs-ref>.supabase.co/auth/v1/oauth/token
  → Receives access_token (JWT with email, profile claims)

tadaify GoTrue creates/updates user:
  → If email doesn't exist in tadaify: creates new user, links askbeforeship identity
  → If email already exists: links askbeforeship as additional identity (via identity linking)
  → Creates native tadaify session (refresh token, session token)

User lands on tadaify dashboard:
  → Banner: "Welcome! We recognized you from askbeforeship."
  → Onboarding starts with email pre-filled, no password required
  → Settings shows: "Connected accounts: askbeforeship [Unlink]"
```

### 7.2 Light Path (Option E — Magic Link)

For faster shipping without OAuth server setup:

```
askbeforeship app → User clicks "Try tadaify"
  → askbeforeship Edge Function calls tadaify admin API:
    supabase.auth.admin.inviteUserByEmail(user.email, {
      redirectTo: 'https://tadaify.com/welcome?source=askbeforeship',
      data: { source_app: 'askbeforeship' }
    })
  → "Check your email for a tadaify invite"

User receives email → clicks link → lands on tadaify
  → Account auto-created (or logs into existing account)
  → Welcome screen: "Welcome from askbeforeship!"
  → Subsequent logins: standard tadaify email/password or magic link
```

**Recommendation:** Start with Light Path (Option E) — ship in < 1 day. Upgrade to Full OAuth Flow (Option C) when the cross-product user base exceeds 500 users.

---

## 8. User Flow: tadaify → askbeforeship

The reverse flow is architecturally identical — askbeforeship would need to be configured as consumer (Custom OIDC Provider pointing to tadaify's OAuth server), OR tadaify becomes the IDP.

**Key architectural consideration:** Only one project should be the "primary" IDP in the OAuth 2.1 relationship. If bidirectional cross-login is needed, the correct architecture is the **Identity Hub** (Option B) — a separate hub project that both apps use as their OAuth provider.

For asymmetric cross-launch (askbeforeship has users → tadaify is new):
- askbeforeship = IDP (OAuth 2.1 Server enabled)
- tadaify = relying party (Custom OIDC Provider pointing to askbeforeship)
- If a tadaify-first user wants to use askbeforeship: email-based invite (Option E) or standard signup

**When to add the reverse:**
When tadaify has its own established user base (>1k users) who should access askbeforeship — set up Option B (Hub) and migrate both.

---

## 9. Recommended Architecture for tadaify Portfolio

### Phase 1: Ship Now (< 1 week)
**Architecture: Option E (email invite) + shared Stripe customer_id**

| Component | Implementation |
|---|---|
| Cross-app invite | Edge Function in askbeforeship calling tadaify admin invite API |
| Stripe | Single account, email-based `customer_id` lookup |
| User profile | Independent per app (no sync) |
| Avatar | Independent per app |
| Cross-app analytics | Manual Postgres queries with service-role connection |

Cost: $0 extra infra. Engineering: ~2 days.

### Phase 2: Native OAuth Federation (1–2 months after launch)
**Architecture: Option C — askbeforeship as OAuth 2.1 IDP for tadaify**

| Component | Implementation |
|---|---|
| IDP | askbeforeship enables OAuth 2.1 Server |
| Consumer | tadaify adds askbeforeship as Custom OIDC Provider |
| Consent screen | Simple React page on askbeforeship (`/oauth/consent`) |
| Identity linking | tadaify uses Supabase identity linking on first login |
| Stripe | Shared `customer_id` via email lookup (Phase 1 already done) |
| Profile sync | Webhook from askbeforeship → tadaify Edge Function (update `display_name`, `avatar_url`) |

Cost: $0 extra infra (OAuth 2.1 beta is free). Engineering: ~4 days.

### Phase 3: Full Hub Architecture (when portfolio has 3+ products or >10k cross-MAU)
**Architecture: Option B (Dedicated Identity Hub) OR Clerk**

**Sub-option 3A: Supabase Hub**
- New Supabase project `graspsoftwarepw-hub` (Pro, $25/month)
- Hub enables OAuth 2.1 Server
- All portfolio apps register as OIDC clients
- `cross_project_links` table, shared profile API
- Stripe `customer_id` stored in hub, shared via API

**Sub-option 3B: Clerk (recommended when adding 3rd+ product)**
- Single Clerk instance, unlimited applications
- Satellite domains for cross-app session sharing (same session across `tadaify.com`, `askbeforeship.com`, `untiltify.com`)
- Supabase third-party auth integration: each project trusts Clerk JWTs
- 50,000 MRU free, then $0.02/MAU
- No consent screen to build — Clerk handles UI

**When to choose 3B over 3A:**
- Adding untiltify or other products to the cross-app SSO surface
- >5k users regularly cross-logging between apps
- Don't want to maintain Hub infrastructure
- Need passkeys, advanced MFA — Clerk has these built in

### Decision Matrix

| Criteria | Option E (email) | Option C (OAuth) | Option B (Hub) | Clerk |
|---|---|---|---|---|
| Time to ship | 2 days | 4 days | 8 days | 5 days |
| Extra infra cost | $0 | $0 | $25/mo | $0–$20/mo |
| True SSO (same session) | No | No (new session per app) | No | **Yes** (satellite domains) |
| User sees "linked accounts" | No | **Yes** | **Yes** | **Yes** |
| Works with 3+ apps | Limited | Yes (3 providers/project) | **Yes** | **Yes** |
| Bidirectional | No | Partial | **Yes** | **Yes** |
| Maintenance | Low | Medium | High | Low |

**Recommendation for 2026:** Start with Phase 1 (ship today), implement Phase 2 after tadaify MVP stabilizes, decide on Phase 3 when a third product enters the portfolio.

---

## 10. Cost Implications

### At 1,000 Cross-MAU (Early Stage)

| Solution | Monthly Cost | Notes |
|---|---|---|
| Option E (email invite) | $0 | No auth cross-linking |
| Option C (Supabase OAuth) | $0 | Beta period, all plans |
| Option B (Hub project) | $25 | Additional Pro project |
| Clerk | $0 | Under 50k MRU free |
| Auth0 | $0 | Under 25k MAU free |
| WorkOS AuthKit | $0 | Under 1M MAU free |

All options are effectively **free** at 1k cross-MAU.

### At 10,000 Cross-MAU

| Solution | Monthly Cost | Notes |
|---|---|---|
| Option C (Supabase OAuth) | $0–TBD | Beta pricing TBD post-beta |
| Option B (Hub project) | $25 | Fixed Pro project cost |
| Clerk | $0 | Still under 50k MRU free |
| Auth0 | $0–$35 | Under 25k MAU free; $35/mo B2C Essentials if exceeded |
| WorkOS AuthKit | $0 | Under 1M MAU free |

Clerk is the clear winner at this scale — free up to 50k MRU.

### At 100,000 Cross-MAU

| Solution | Monthly Cost | Notes |
|---|---|---|
| Option C (Supabase OAuth) | Unknown post-beta | Likely SSO MAU pricing |
| Option B (Hub project) | $25 + SSO MAU overages | Supabase Pro |
| Clerk | $1,000–$2,000 | 50k free + $0.02 × 50k MAU = $1,000; sliding scale down |
| Auth0 B2C | $240+ | Professional plan + per-MAU overages |
| WorkOS AuthKit | $0 | Under 1M MAU free — cheapest at scale |

**WorkOS AuthKit** is the cheapest at high scale (1M free MAU, then $2,500/1M). But WorkOS is B2B focused; B2C cross-app SSO is not its primary use case.

**Clerk** gives the best developer experience with satellite domains for true cross-domain sessions.

**Supabase OAuth 2.1** is free during beta (no MAU cap stated). Post-beta pricing is unknown — monitor the changelog.

### Summary: Cost-Optimal Path

| Stage | Users | Recommended | Cost |
|---|---|---|---|
| Early (0–5k MAU) | 0–5k | Supabase OAuth 2.1 (beta) | $0 |
| Growth (5k–50k MAU) | 5k–50k | Clerk (satellite domains) | $0 (under 50k MRU) |
| Scale (50k+ MAU) | 50k+ | Clerk or WorkOS | $1k–$2.5k/1M MAU |

---

## 11. Implementation Roadmap

### Immediate (This Week)
1. **Stripe consolidation** — implement `getOrCreateStripeCustomer(email)` in both tadaify and askbeforeship Edge Functions. Shared `customer_id` by email lookup. (~4 hours)
2. **Cross-app invite button** — "Try tadaify" on askbeforeship user settings → calls tadaify admin invite API. (~4 hours)

### Month 1 (After tadaify MVP Stabilizes)
3. **askbeforeship OAuth 2.1 Server** — enable in `config.toml`, deploy consent screen, register tadaify as OAuth client. (~2 days)
4. **tadaify Custom OIDC Provider** — add askbeforeship as custom provider via auto-discovery. (~4 hours)
5. **Identity linking** — tadaify: on first OAuth login from askbeforeship, call `linkIdentity()` to merge accounts if email already exists. (~4 hours)
6. **"Connected accounts" settings page** — visible on both apps, shows linked identities. (~1 day)

### Month 3+ (Portfolio Expansion)
7. **Evaluate Clerk** — when third product (e.g., untiltify if enabled) needs cross-app SSO.
8. **Stripe Billing Cadences** — if users with both subscriptions want one invoice.
9. **Shared profile Edge Function** — lightweight API in hub (or askbeforeship acting as hub) that returns `{ avatar_url, display_name }` by email. Tadaify reads from it at render time.

---

## 12. Open Questions

1. **Will Supabase OAuth 2.1 remain free post-beta?** The SSO MAU pricing model charges per cross-app active user — this could become expensive. Need to monitor Supabase changelog for beta→GA pricing announcement.

2. **Which project should be the canonical IDP?** askbeforeship (older, more users) or tadaify (newer, potentially larger)? Choosing askbeforeship makes more sense today, but if tadaify grows faster, the hub model becomes necessary sooner.

3. **Does the user want one Stripe invoice for both subscriptions?** This requires Billing Cadences setup and same billing date — worth confirming before building.

4. **What's the expected cross-MAU volume?** 1k, 10k, or 100k cross-app users changes the cost equation significantly (see Section 10).

5. **Is untiltify part of the cross-app identity surface?** If yes, start with the Hub architecture now rather than point-to-point OAuth.

---

## 13. Source URLs + Fetch Dates

All sources fetched 2026-04-24.

- Supabase Auth Overview: https://supabase.com/docs/guides/auth
- Supabase OAuth 2.1 Server: https://supabase.com/docs/guides/auth/oauth-server
- Supabase OAuth 2.1 Getting Started: https://supabase.com/docs/guides/auth/oauth-server/getting-started
- Supabase Custom OAuth/OIDC Providers: https://supabase.com/docs/guides/auth/custom-oauth-providers
- Supabase Third-Party Auth: https://supabase.com/docs/guides/auth/third-party/overview
- Supabase Identity Linking: https://supabase.com/docs/guides/auth/auth-identity-linking
- Supabase Enterprise SSO (SAML): https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml
- Supabase JWT Guide: https://supabase.com/docs/guides/auth/jwts
- Supabase JWT Signing Keys: https://supabase.com/docs/guides/auth/signing-keys
- Supabase Custom Access Token Hook: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
- Supabase Auth Architecture: https://supabase.com/docs/guides/auth/architecture
- Supabase Migrating Auth Users: https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects
- Supabase Blog — OAuth2 Provider: https://supabase.com/blog/oauth2-provider
- Clerk Pricing: https://clerk.com/pricing
- Clerk Satellite Domains: https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains
- Clerk + Supabase Integration: https://supabase.com/docs/guides/auth/third-party/clerk
- Auth0 Pricing: https://auth0.com/pricing
- WorkOS Pricing: https://workos.com/pricing
- Stripe Customer Sharing: https://docs.stripe.com/get-started/account/orgs/sharing/customers-payment-methods
- Stripe Invoice Consolidation: https://docs.stripe.com/billing/subscriptions/invoice-consolidation
- Supabase Discussion — External Auth Cross-Project: https://github.com/orgs/supabase/discussions/13427
- Supabase Discussion — OAuth 2.1 Capabilities: https://github.com/orgs/supabase/discussions/38022
- Supabase Discussion — Multiple Self-Hosted Projects: https://github.com/orgs/supabase/discussions/38048
