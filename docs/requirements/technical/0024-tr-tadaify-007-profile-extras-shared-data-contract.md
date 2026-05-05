---
id: TR-tadaify-007
title: "profile_extras shared data contract"
level: MUST
status: accepted
created_at: 2026-05-05
story: F-ONBOARDING-001d (#139)
---

# TR-tadaify-007 — `profile_extras` shared data contract

## Context

Multiple onboarding sub-features (tier step, R2 avatar upload, future profile extras) need
to store per-user data that does not belong on `auth.users` and is not part of the public
`profiles` blob (handle / name / bio). A single shared table ships incrementally — each
sub-feature ALTERs to add its own NULLABLE column.

## Decision

Ship a single table `public.profile_extras` as the shared contract:

```sql
CREATE TABLE public.profile_extras (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_slug  TEXT NOT NULL DEFAULT 'free'
             CHECK (tier_slug IN ('free','creator','pro','business')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Acceptance criteria

1. **PK + FK**: `user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`.
2. **Incremental extension**: each sub-feature ALTERs to add its own NULLABLE column.
3. **RLS**: own-row SELECT / INSERT / UPDATE; `service_role` bypasses (for Stripe webhook,
   admin ops, GDPR delete). **Tier lockdown (TR-tadaify-004):** authenticated INSERT
   enforces `tier_slug = 'free'`; authenticated UPDATE enforces `tier_slug` stays unchanged
   (immutable for authenticated users — only `service_role` may set paid tiers).
4. **updated_at trigger**: fires `BEFORE UPDATE` on every row mutation.
5. **GDPR Art. 17**: `ON DELETE CASCADE` removes row when `auth.users` row deleted (belt);
   `delete_user_data()` RPC also explicitly DELETEs (suspenders).
6. **GDPR Art. 20**: `user-export-data` Edge Function includes ALL columns of the row in
   exported JSON. Every future column added MUST update the Edge Function in the same PR.
7. **Idempotency**: migration uses `IF NOT EXISTS` / `CREATE OR REPLACE` guards.

## Related

- TR-tadaify-004 (tier persistence semantics built on top of this table)
- tadaify-app#138 (R2 avatar — adds `avatar_r2_key TEXT NULL` via ALTER)
- F-PRICING-001 (Stripe webhook mutates `tier_slug` via `service_role`)
