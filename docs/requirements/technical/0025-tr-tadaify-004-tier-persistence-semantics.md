---
id: TR-tadaify-004
title: "Tier persistence semantics (onboarding)"
level: MUST
status: accepted
created_at: 2026-05-05
story: F-ONBOARDING-001d (#139)
---

# TR-tadaify-004 — Tier persistence semantics on top of TR-tadaify-007

## Context

DEC-311=A refined: every user starts on the Free tier in onboarding. No paid-plan selection
or Stripe Checkout occurs during onboarding. The tier step is a read-only comparison matrix.
The system needs to write and read `tier_slug` reliably.

## Decision

1. **Write path (onboarding)**: `onboarding.tier` action UPSERTs `tier_slug='free'` into
   `profile_extras` via service-role REST (`Prefer: resolution=merge-duplicates`) immediately
   before redirecting to `/app`. The UPSERT is idempotent — re-submission does not error
   (ECN-139-02).
2. **Param enforcement**: `tier` param in URL/body is IGNORED. Server always writes `'free'`
   regardless of input (ECN-139-01, DEC-311=A enforcement). The function signature
   `upsertTierFree(userId, env)` does not accept a tier argument.
3. **Mutation path (future)**: Stripe webhook (F-PRICING-001) is the ONLY path that may
   mutate `tier_slug` to a non-free value. Webhook runs as `service_role` (bypasses RLS).
4. **Read path**: `settings/billing` page (F-PRICING-001) reads `tier_slug` via own-row
   SELECT. All other pages derive tier from this value.
5. **Unauthenticated graceful fallback**: if the action has no session cookie (e.g. bot hit),
   DB write is skipped and redirect to `/app` still proceeds (auth gate on `/app` handles it).

## Acceptance criteria

1. `onboarding.tier` action calls `upsertTierFree(userId, env)` before `redirect("/app")`.
2. `upsertTierFree` always posts `{ tier_slug: "free" }` — no external input accepted.
3. `Prefer: resolution=merge-duplicates` ensures second submission is a no-op, not an error.
4. Missing `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` → skip UPSERT + still redirect.
5. Missing session cookie → skip UPSERT + still redirect.

## Related

- TR-tadaify-007 (base table contract)
- DEC-311=A refined (Free-only MVP tier step)
- DEC-366=A (action redirects to /app directly, bypassing onboarding/complete)
- F-PRICING-001 (future: Stripe webhook mutates tier_slug)
