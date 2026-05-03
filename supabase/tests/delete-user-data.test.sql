-- pgTAP tests for delete_user_data() ownership guard
-- Story: F-APP-DASHBOARD-001a (#171) — Codex review P1 fix (PR #174)
--
-- Run locally:
--   supabase db reset
--   pg_prove supabase/tests/delete-user-data.test.sql
-- Or via supabase test db:
--   supabase test db

BEGIN;

SELECT plan(3);

-- ── Helpers ───────────────────────────────────────────────────────────────────
-- Create two synthetic UUIDs that we use as stand-ins for user A and user B.
-- We seed auth.users first (FK parent) then profiles (FK child).

DO $$
BEGIN
  -- Seed minimal auth.users rows so profiles FK constraint is satisfied.
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-p1-a@local.test', crypt('password', gen_salt('bf')),
     now(), now()),
    ('00000000-0000-0000-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-p1-b@local.test', crypt('password', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Insert profiles rows (FK child of auth.users).
  INSERT INTO public.profiles (id, handle, email, tos_version, tier)
  VALUES
    ('00000000-0000-0000-0000-000000000a01'::uuid,
     'testuser-a01', 'test-p1-a@local.test', 'v1', 'free'),
    ('00000000-0000-0000-0000-000000000b02'::uuid,
     'testuser-b02', 'test-p1-b@local.test', 'v1', 'free')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ── T1: ownership guard — cross-user deletion raises 42501 ────────────────────
-- Simulate user A (uid = a01) calling delete_user_data(b02).
-- We set the local.uid GUC that auth.uid() reads in supabase-local.

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-000000000a01"}';

SELECT throws_matching(
  $t$
    SELECT public.delete_user_data('00000000-0000-0000-0000-000000000b02'::uuid);
  $t$,
  'permission denied',
  'user A cannot delete user B''s data via delete_user_data — raises permission denied (42501)'
);

-- ── T2: ownership guard — same user can delete their own data ─────────────────
-- Simulate user A (uid = a01) calling delete_user_data(a01).

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-000000000a01"}';

SELECT lives_ok(
  $t$
    SELECT public.delete_user_data('00000000-0000-0000-0000-000000000a01'::uuid);
  $t$,
  'user A can delete their own data via delete_user_data(A''s uuid) without error'
);

-- Verify the row was actually deleted
SELECT is(
  (SELECT COUNT(*)::int FROM public.profiles
   WHERE id = '00000000-0000-0000-0000-000000000a01'::uuid),
  0,
  'profiles row for user A is gone after delete_user_data(A''s uuid)'
);

SELECT finish();
ROLLBACK;
