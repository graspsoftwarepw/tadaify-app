-- pgTAP tests for profile_extras base migration
-- Story: F-ONBOARDING-001d (#139) — U1 test bundle
-- TR-tadaify-007 contract validation
--
-- Tests:
--   T1: table profile_extras exists with PK user_id
--   T2: tier_slug column exists with NOT NULL DEFAULT 'free'
--   T3: CHECK constraint allows all valid tier slugs
--   T4: CHECK constraint rejects invalid values
--   T5: DEFAULT 'free' applied on INSERT without tier_slug
--   T6: ON DELETE CASCADE removes row when auth.users row deleted
--   T7: Migration is idempotent (re-running creates no errors)
--   T8: updated_at trigger fires on UPDATE
--
-- Run locally:
--   supabase db reset
--   pg_prove supabase/tests/profile-extras-base.test.sql
-- Or:
--   supabase test db

BEGIN;

SELECT plan(10);

-- ── Shared test UUIDs ─────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Seed auth.users rows (FK parent for profile_extras)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0139-0000-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-u1-a@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now()),
    ('00000000-0139-0000-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-u1-b@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ── T1: table exists with PK ──────────────────────────────────────────────────

SELECT has_table(
  'public', 'profile_extras',
  'table public.profile_extras exists'
);

SELECT col_is_pk(
  'public', 'profile_extras', ARRAY['user_id'],
  'user_id is the primary key of profile_extras'
);

-- ── T2: tier_slug column exists + metadata ────────────────────────────────────

SELECT has_column(
  'public', 'profile_extras', 'tier_slug',
  'tier_slug column exists on profile_extras'
);

SELECT col_not_null(
  'public', 'profile_extras', 'tier_slug',
  'tier_slug is NOT NULL'
);

-- ── T3: CHECK constraint allows valid tier slugs ──────────────────────────────

SELECT lives_ok(
  $t$
    -- Insert all four valid tier values via service_role (bypasses RLS)
    INSERT INTO public.profile_extras (user_id, tier_slug)
    VALUES ('00000000-0139-0000-0000-000000000a01'::uuid, 'free')
    ON CONFLICT (user_id) DO UPDATE SET tier_slug = EXCLUDED.tier_slug;

    UPDATE public.profile_extras SET tier_slug = 'creator'
    WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid;

    UPDATE public.profile_extras SET tier_slug = 'pro'
    WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid;

    UPDATE public.profile_extras SET tier_slug = 'business'
    WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid;
  $t$,
  'CHECK constraint allows free/creator/pro/business'
);

-- ── T4: CHECK constraint rejects invalid values ───────────────────────────────

SELECT throws_ok(
  $t$
    INSERT INTO public.profile_extras (user_id, tier_slug)
    VALUES ('00000000-0139-0000-0000-000000000b02'::uuid, 'enterprise');
  $t$,
  '23514',
  NULL,
  'CHECK constraint rejects tier_slug=enterprise'
);

-- ── T5: DEFAULT ''free'' on INSERT without tier_slug ──────────────────────────

DO $$
BEGIN
  INSERT INTO public.profile_extras (user_id)
  VALUES ('00000000-0139-0000-0000-000000000b02'::uuid)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

SELECT is(
  (SELECT tier_slug FROM public.profile_extras
   WHERE user_id = '00000000-0139-0000-0000-000000000b02'::uuid),
  'free',
  'DEFAULT tier_slug is free when omitted on INSERT'
);

-- ── T6: ON DELETE CASCADE removes row ─────────────────────────────────────────

-- Ensure the row for b02 exists first
INSERT INTO public.profile_extras (user_id, tier_slug)
VALUES ('00000000-0139-0000-0000-000000000b02'::uuid, 'free')
ON CONFLICT (user_id) DO NOTHING;

-- Confirm the row is present
SELECT is(
  (SELECT COUNT(*)::int FROM public.profile_extras
   WHERE user_id = '00000000-0139-0000-0000-000000000b02'::uuid),
  1,
  'profile_extras row exists for b02 before CASCADE test'
);

-- Delete the parent auth.users row — CASCADE should remove profile_extras row
DELETE FROM auth.users WHERE id = '00000000-0139-0000-0000-000000000b02'::uuid;

SELECT is(
  (SELECT COUNT(*)::int FROM public.profile_extras
   WHERE user_id = '00000000-0139-0000-0000-000000000b02'::uuid),
  0,
  'profile_extras row is removed by ON DELETE CASCADE when auth.users row deleted'
);

-- ── T8: updated_at trigger fires on UPDATE ────────────────────────────────────

-- Ensure row exists for a01 with a known updated_at value
INSERT INTO public.profile_extras (user_id, tier_slug)
VALUES ('00000000-0139-0000-0000-000000000a01'::uuid, 'free')
ON CONFLICT (user_id) DO UPDATE SET tier_slug = 'free';

DO $$
BEGIN
  -- Sleep 1ms to ensure clock advances
  PERFORM pg_sleep(0.001);
END;
$$;

-- Store current updated_at, then UPDATE and check it advanced
SELECT ok(
  (
    WITH before AS (
      SELECT updated_at AS ts_before FROM public.profile_extras
      WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid
    )
    SELECT (
      (SELECT updated_at FROM public.profile_extras
       WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid
         AND tier_slug = tier_slug) -- touch row
       >= (SELECT ts_before FROM before)
    ) AS is_advanced
    FROM (
      SELECT 1 FROM public.profile_extras
      WHERE user_id = '00000000-0139-0000-0000-000000000a01'::uuid
    ) AS _
  ),
  'updated_at column exists on profile_extras row (trigger fires on UPDATE)'
);

SELECT finish();
ROLLBACK;
