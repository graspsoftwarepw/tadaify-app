-- pgTAP tests for profile_extras RLS policies
-- Story: F-ONBOARDING-001d (#139) — U3 test bundle
-- TR-tadaify-007 RLS contract validation
--
-- Tests:
--   T1: user can SELECT own row
--   T2: user CANNOT SELECT other user's row
--   T3: user can INSERT own row
--   T4: user CANNOT INSERT row for another user_id
--   T5: user can UPDATE own row
--   T6: user CANNOT UPDATE other user's row
--   T7: service_role can SELECT all rows
--   T8: service_role can UPDATE any row (Stripe webhook future path)
--
-- Run locally:
--   supabase db reset
--   pg_prove supabase/tests/profile-extras-rls.test.sql
-- Or:
--   supabase test db

BEGIN;

SELECT plan(8);

-- ── Seed test users ───────────────────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0139-0001-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-rls-a@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now()),
    ('00000000-0139-0001-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-rls-b@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Pre-insert rows for both users via direct (service_role-level) INSERT
  INSERT INTO public.profile_extras (user_id, tier_slug)
  VALUES
    ('00000000-0139-0001-0000-000000000a01'::uuid, 'free'),
    ('00000000-0139-0001-0000-000000000b02'::uuid, 'free')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- ── T1: user can SELECT own row ───────────────────────────────────────────────
-- Simulate user A JWT: set request.jwt.claims (same as delete-user-data.test.sql pattern)

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0139-0001-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT is(
  (SELECT COUNT(*)::int FROM public.profile_extras
   WHERE user_id = '00000000-0139-0001-0000-000000000a01'::uuid),
  1,
  'T1: user A can SELECT their own profile_extras row'
);

-- ── T2: user CANNOT SELECT other user's row ───────────────────────────────────

SELECT is(
  (SELECT COUNT(*)::int FROM public.profile_extras
   WHERE user_id = '00000000-0139-0001-0000-000000000b02'::uuid),
  0,
  'T2: user A CANNOT SELECT user B profile_extras row (RLS blocks)'
);

-- ── T3: user can INSERT own row ───────────────────────────────────────────────

-- Delete the existing row for user A so we can INSERT fresh
SET LOCAL role TO postgres; -- step out of RLS to clean up
DELETE FROM public.profile_extras WHERE user_id = '00000000-0139-0001-0000-000000000a01'::uuid;

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0139-0001-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT lives_ok(
  $t$
    INSERT INTO public.profile_extras (user_id, tier_slug)
    VALUES ('00000000-0139-0001-0000-000000000a01'::uuid, 'free');
  $t$,
  'T3: user A can INSERT their own profile_extras row'
);

-- ── T4: user CANNOT INSERT row for another user_id ───────────────────────────

SELECT throws_ok(
  $t$
    INSERT INTO public.profile_extras (user_id, tier_slug)
    VALUES ('00000000-0139-0001-0000-000000000b02'::uuid, 'free');
  $t$,
  '42501',
  NULL,
  'T4: user A CANNOT INSERT profile_extras row with user_id=B (WITH CHECK violation)'
);

-- ── T5: user can UPDATE own row ───────────────────────────────────────────────

SELECT lives_ok(
  $t$
    UPDATE public.profile_extras
    SET tier_slug = 'free'
    WHERE user_id = '00000000-0139-0001-0000-000000000a01'::uuid;
  $t$,
  'T5: user A can UPDATE their own profile_extras row'
);

-- ── T6: user CANNOT UPDATE other user's row ───────────────────────────────────

-- Check that UPDATE with mismatched user returns 0 affected rows (RLS silently filters)
SELECT is(
  (
    WITH updated AS (
      UPDATE public.profile_extras
      SET tier_slug = 'creator'
      WHERE user_id = '00000000-0139-0001-0000-000000000b02'::uuid
      RETURNING user_id
    )
    SELECT COUNT(*)::int FROM updated
  ),
  0,
  'T6: user A UPDATE on user B row affects 0 rows (RLS USING clause filters)'
);

-- ── T7 + T8: service_role bypass ─────────────────────────────────────────────

-- Step back to service_role / postgres level
SET LOCAL role TO postgres;
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-000000000000"}';

SELECT is(
  (SELECT COUNT(*)::int FROM public.profile_extras
   WHERE user_id IN (
     '00000000-0139-0001-0000-000000000a01'::uuid,
     '00000000-0139-0001-0000-000000000b02'::uuid
   )),
  2,
  'T7: postgres/service_role can SELECT all rows (bypasses RLS)'
);

SELECT is(
  (
    WITH updated AS (
      UPDATE public.profile_extras
      SET tier_slug = 'pro'
      WHERE user_id = '00000000-0139-0001-0000-000000000b02'::uuid
      RETURNING user_id
    )
    SELECT COUNT(*)::int FROM updated
  ),
  1,
  'T8: postgres/service_role can UPDATE any row (Stripe webhook future path, bypasses RLS)'
);

SELECT finish();
ROLLBACK;
