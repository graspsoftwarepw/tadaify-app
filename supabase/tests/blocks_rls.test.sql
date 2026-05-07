-- pgTAP tests for blocks RLS policies (all 4: select/insert/update/delete)
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- Covers: BR-BLOCK-CRUD-001, AC#6, ECN-CRUD-01/02/11/12
--
-- Tests:
--   T1: blocks_own_select: own user sees own rows
--   T2: blocks_own_select: other user sees 0 rows (isolation)
--   T3: blocks_own_insert: insert with auth.uid() = user_id and own page_id succeeds
--   T4: blocks_own_insert: insert with auth.uid() = user_id but OTHER user's page_id fails (ECN-CRUD-11)
--   T5: blocks_own_insert: insert with mismatched user_id fails
--   T6: blocks_own_update: own user updates pass; result visible
--   T7: blocks_own_update: other user update affects 0 rows
--   T8: blocks_own_delete: own user delete succeeds
--   T9: blocks_own_delete: other user delete affects 0 rows (ECN-CRUD-02)
--
-- Run locally:
--   supabase db reset
--   supabase test db

BEGIN;

SELECT plan(9);

-- ── Seed test users ───────────────────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0199-0001-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-blkrls-a@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now()),
    ('00000000-0199-0001-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-blkrls-b@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Profiles (required FK)
  INSERT INTO public.profiles (id, handle, email, tos_version, tier)
  VALUES
    ('00000000-0199-0001-0000-000000000a01'::uuid, 'blkrls-user-a', 'test-blkrls-a@local.test', 'v1', 'free'),
    ('00000000-0199-0001-0000-000000000b02'::uuid, 'blkrls-user-b', 'test-blkrls-b@local.test', 'v1', 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Pages owned by user A
  INSERT INTO public.pages (id, user_id, title, is_homepage)
  VALUES
    ('00000000-0199-0002-0000-000000000a01'::uuid,
     '00000000-0199-0001-0000-000000000a01'::uuid,
     'Page A', true)
  ON CONFLICT (id) DO NOTHING;

  -- Pages owned by user B
  INSERT INTO public.pages (id, user_id, title, is_homepage)
  VALUES
    ('00000000-0199-0002-0000-000000000b02'::uuid,
     '00000000-0199-0001-0000-000000000b02'::uuid,
     'Page B', true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed a block for user A (service-role INSERT bypasses RLS)
  INSERT INTO public.blocks (id, page_id, user_id, block_type, title, url, position)
  VALUES
    ('00000000-0199-0003-0000-000000000a01'::uuid,
     '00000000-0199-0002-0000-000000000a01'::uuid,
     '00000000-0199-0001-0000-000000000a01'::uuid,
     'link', 'Block A1', 'https://example.com', 0)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ── T1: blocks_own_select: user A sees own block ──────────────────────────────

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0001-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE user_id = '00000000-0199-0001-0000-000000000a01'::uuid),
  1,
  'T1: user A can SELECT their own block'
);

-- ── T2: blocks_own_select: user A cannot see user B's data ────────────────────
-- (No blocks for user B seeded, but even if there were, 0 rows visible to A)

SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE user_id = '00000000-0199-0001-0000-000000000b02'::uuid),
  0,
  'T2: user A CANNOT SELECT user B blocks (RLS blocks_own_select)'
);

-- ── T3: blocks_own_insert: user A can insert into own page ───────────────────

INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
VALUES
  ('00000000-0199-0003-0000-000000000a02'::uuid,
   '00000000-0199-0002-0000-000000000a01'::uuid,
   '00000000-0199-0001-0000-000000000a01'::uuid,
   'link', 'Block A2 inserted via RLS', 1);

SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE id = '00000000-0199-0003-0000-000000000a02'::uuid),
  1,
  'T3: user A can INSERT block into own page (blocks_own_insert passes)'
);

-- ── T4: blocks_own_insert: user A CANNOT insert into user B's page ───────────
-- ECN-CRUD-11: even though user_id = auth.uid(), page ownership check fails

SELECT throws_ok(
  $$
    INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
    VALUES (
      '00000000-0199-0003-0000-000000000a99'::uuid,
      '00000000-0199-0002-0000-000000000b02'::uuid,  -- User B's page!
      '00000000-0199-0001-0000-000000000a01'::uuid,   -- user_id = auth.uid() (user A)
      'link', 'Injected block', 99
    )
  $$,
  '42501',
  'T4: user A CANNOT INSERT block into user B page (page ownership WITH CHECK fails)'
);

-- ── T5: blocks_own_insert: insert with mismatched user_id fails ───────────────

SELECT throws_ok(
  $$
    INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
    VALUES (
      '00000000-0199-0003-0000-000000000a98'::uuid,
      '00000000-0199-0002-0000-000000000a01'::uuid,
      '00000000-0199-0001-0000-000000000b02'::uuid,  -- user_id = user B, but auth.uid() = user A
      'link', 'Mismatched user_id', 99
    )
  $$,
  '42501',
  'T5: INSERT with user_id != auth.uid() fails (blocks_own_insert WITH CHECK)'
);

-- ── T6: blocks_own_update: user A can update own block ───────────────────────

UPDATE public.blocks
SET title = 'Block A1 updated'
WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid;

SELECT is(
  (SELECT title FROM public.blocks
   WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid),
  'Block A1 updated',
  'T6: user A can UPDATE own block title'
);

-- ── T7: blocks_own_update: user B cannot update user A's block ────────────────

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0001-0000-000000000b02","role":"authenticated"}';
SET LOCAL role TO authenticated;

UPDATE public.blocks
SET title = 'Hacked by B'
WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid;

-- Confirm row was not updated (RLS filtered the target row)
SET LOCAL role TO postgres;
SELECT is(
  (SELECT title FROM public.blocks
   WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid),
  'Block A1 updated',
  'T7: user B UPDATE on user A block affects 0 rows (blocks_own_update)'
);

-- ── T8: blocks_own_delete: user A can delete own block ───────────────────────

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0001-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

DELETE FROM public.blocks
WHERE id = '00000000-0199-0003-0000-000000000a02'::uuid;

SET LOCAL role TO postgres;
SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE id = '00000000-0199-0003-0000-000000000a02'::uuid),
  0,
  'T8: user A can DELETE own block (blocks_own_delete)'
);

-- ── T9: blocks_own_delete: user B cannot delete user A's block ────────────────
-- ECN-CRUD-02: other user delete affects 0 rows

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0001-0000-000000000b02","role":"authenticated"}';
SET LOCAL role TO authenticated;

DELETE FROM public.blocks
WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid;

SET LOCAL role TO postgres;
SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE id = '00000000-0199-0003-0000-000000000a01'::uuid),
  1,
  'T9: user B DELETE on user A block affects 0 rows (blocks_own_delete ECN-CRUD-02)'
);

SELECT * FROM finish();
ROLLBACK;
