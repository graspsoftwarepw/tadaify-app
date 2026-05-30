# Migration Guide — tadaify

All database migrations that need to be applied to PROD are listed here under
"Pending for PROD". After a migration is applied to PROD (via `v*` tag deploy),
move it to "Applied".

Migrations apply automatically to DEV on merge to `main` (GitHub Actions
`supabase db push`). PROD applies on tag push (`v*`).

---

## Pending for PROD

### 20260505182021_profile_extras_base.sql

**Effect:** Creates `public.profile_extras` table (TR-tadaify-007 base contract): PK `user_id UUID`
references `auth.users(id) ON DELETE CASCADE`; `tier_slug TEXT NOT NULL DEFAULT 'free'` CHECK enum;
`created_at`/`updated_at` timestamps; `updated_at` trigger; RLS own-row SELECT/INSERT/UPDATE.
Also updates `delete_user_data()` RPC to include `DELETE FROM profile_extras`.

**Why:** Required for F-ONBOARDING-001d (#139) — tier-step DB persistence. Sister migration
for tadaify-app#138 (R2 avatar) depends on this table existing first.

**Pre-steps:** none — new table; no destructive changes to existing schema.

**Post-steps:**
- Re-deploy `user-export-data` Edge Function (now includes `profile_extras` in GDPR export).
- Sister migration tadaify-app#138 (ALTER ADD COLUMN avatar_r2_key) must be applied AFTER this one.

**Rollback:**
```sql
-- WARNING: drops all profile_extras data including any future columns from #138
DROP TABLE IF EXISTS public.profile_extras CASCADE;
DROP FUNCTION IF EXISTS public.profile_extras_set_updated_at() CASCADE;
-- Also restore delete_user_data() to previous version (remove profile_extras DELETE line)
```

---

### 20260506000002_profile_extras_rls_tier_lockdown.sql

**Depends on:** `20260505182021_profile_extras_base.sql` — MUST run after it.

**Effect:** Hardens RLS on `public.profile_extras` for tier-escalation prevention (TR-tadaify-004):
- INSERT policy tightened: `WITH CHECK` enforces `tier_slug = 'free'` for authenticated users.
- UPDATE policy simplified to ownership-only (no self-referential subquery).
- New BEFORE UPDATE trigger `profile_extras_guard_tier_slug` enforces tier_slug immutability
  for the `authenticated` role; `service_role`/`postgres` bypass the guard (Stripe webhook path).

**Why:** Codex P1 finding — the original UPDATE policy used a self-referential subquery
(`SELECT tier_slug FROM profile_extras` inside an RLS policy on `profile_extras`) which risks
PostgreSQL policy recursion. The trigger approach is non-recursive and separates ownership RLS
from column immutability.

**Pre-steps:** `20260505182021_profile_extras_base.sql` must already be applied.

**Post-steps:** none.

**Verification:**
```bash
supabase db reset && supabase test db
# Or: pg_prove supabase/tests/profile-extras-rls.test.sql
# Verify T5 (own non-tier update OK), T9 (INSERT non-free blocked),
# T10 (UPDATE tier escalation blocked), T11 (service_role tier update OK).
```

**Rollback:**
```sql
-- Remove the guard trigger and function
DROP TRIGGER IF EXISTS profile_extras_guard_tier_slug ON public.profile_extras;
DROP FUNCTION IF EXISTS public.profile_extras_guard_tier_slug() CASCADE;

-- Restore original permissive UPDATE policy from base migration
DROP POLICY IF EXISTS "profile_extras_own_update" ON public.profile_extras;
CREATE POLICY "profile_extras_own_update" ON public.profile_extras
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Restore original permissive INSERT policy from base migration
DROP POLICY IF EXISTS "profile_extras_own_insert" ON public.profile_extras;
CREATE POLICY "profile_extras_own_insert" ON public.profile_extras
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### 20260503000001_app_dashboard_tables.sql

**Effect:** Creates `account_settings`, `pages`, `blocks` tables; alters `profiles` to add
`onboarding_completed_at`, `bio`, `template_id`, `tier`; adds `delete_user_data(uuid)` RPC with
full GDPR deletion cascade (blocks → pages → account_settings → profiles) and drops/recreates the
function if it existed without the new tables.

**Why:** Required for F-APP-DASHBOARD-001a (#171) — the post-onboarding dashboard, GDPR user
deletion, and onboarding-state derivation.

**Pre-steps:** none — all new tables/columns; no destructive changes to existing schema.

**Post-steps:** deploy `user-export-data` Edge Function to Supabase (GDPR Art. 20 export).

**Rollback:**
```sql
-- Undo in reverse dependency order
DROP FUNCTION IF EXISTS delete_user_data(uuid);
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS account_settings;
ALTER TABLE profiles
  DROP COLUMN IF EXISTS onboarding_completed_at,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS template_id,
  DROP COLUMN IF EXISTS tier;
```

---

### 20260502000001_drop_handle_reservations_default.sql

**Effect:** drops the SQL `DEFAULT` clause on `handle_reservations.expires_at`.

**Why:** the JS route now reads `HANDLE_RESERVATION_TTL_SECONDS` from Workers env
at runtime (default 600 s = 10 min, DEC-326 = A). The old SQL DEFAULT was 15 min
and could not reflect the env-var value. The application always passes `expires_at`
explicitly on INSERT, so dropping the DEFAULT is backward-compatible.

**Pre-steps:** none — additive-safe schema change (dropping a DEFAULT never
invalidates existing rows or application code that already provides the value).

**Post-steps:** none.

**Rollback:**
```sql
ALTER TABLE handle_reservations
  ALTER COLUMN expires_at SET DEFAULT now() + interval '15 minutes';
```

---

## Applied

### 20260501000002_handle_reservation_cleanup_trigger.sql

Auto-cleanup trigger on `handle_reservations` to remove expired rows on INSERT.
Applied to DEV on merge of PR #133.

### 20260501000001_profiles.sql

`profiles` table with `handle` unique constraint + RLS policies. Applied to DEV
on merge of PR #133.

### 20260429000001_handle_reservations.sql

Initial `handle_reservations` table with PK on `handle`. Applied to DEV on merge
of landing page PR (#1).
