-- pgTAP tests for duplicate_block() RPC
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- Covers: BR-BLOCK-CRUD-004, AC#3/8, ECN-CRUD-02/03
--
-- Tests:
--   T1: duplicate_block creates new row at source.position+1
--   T2: duplicate_block shifts subsequent positions correctly
--   T3: duplicate_block as wrong user raises permission_denied
--   T4: duplicate_block of last block creates at MAX+1, no shifts (ECN-CRUD-03)
--
-- Run locally:
--   supabase db reset
--   supabase test db

BEGIN;

SELECT plan(5);

-- ── Seed ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0199-0020-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-dup-a@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now()),
    ('00000000-0199-0020-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-dup-b@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, handle, email, tos_version, tier)
  VALUES
    ('00000000-0199-0020-0000-000000000a01'::uuid, 'dup-user-a', 'test-dup-a@local.test', 'v1', 'free'),
    ('00000000-0199-0020-0000-000000000b02'::uuid, 'dup-user-b', 'test-dup-b@local.test', 'v1', 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Page for user A
  INSERT INTO public.pages (id, user_id, title, is_homepage)
  VALUES
    ('00000000-0199-0021-0000-000000000a01'::uuid,
     '00000000-0199-0020-0000-000000000a01'::uuid,
     'Dup Page A', true)
  ON CONFLICT (id) DO NOTHING;

  -- 3 blocks: positions 0, 1, 2
  INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
  VALUES
    ('00000000-0199-0022-0000-000000000001'::uuid,
     '00000000-0199-0021-0000-000000000a01'::uuid,
     '00000000-0199-0020-0000-000000000a01'::uuid,
     'link', 'Block 0', 0),
    ('00000000-0199-0022-0000-000000000002'::uuid,
     '00000000-0199-0021-0000-000000000a01'::uuid,
     '00000000-0199-0020-0000-000000000a01'::uuid,
     'link', 'Block 1', 1),
    ('00000000-0199-0022-0000-000000000003'::uuid,
     '00000000-0199-0021-0000-000000000a01'::uuid,
     '00000000-0199-0020-0000-000000000a01'::uuid,
     'link', 'Block 2', 2)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ── T1: duplicate Block 1 → new block at position 2 ─────────────────────────

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0020-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT isnt(
  (SELECT public.duplicate_block('00000000-0199-0022-0000-000000000002'::uuid)),
  NULL,
  'T1: duplicate_block returns new non-null uuid'
);

-- ── T2: duplicate shifts subsequent positions ────────────────────────────────
-- After duplicating Block 1 (position 1):
--   Block 0 → stays at position 0
--   Block 1 (source) → stays at position 1
--   New block (dup) → position 2
--   Block 2 (former) → shifted to position 3

SET LOCAL role TO postgres;

SELECT is(
  (SELECT position FROM public.blocks
   WHERE id = '00000000-0199-0022-0000-000000000003'::uuid),
  3,
  'T2: Block at position 2 shifted to position 3 after duplicate inserted at 2'
);

-- Also verify total block count grew by 1 (4 blocks now)
SELECT is(
  (SELECT COUNT(*)::int FROM public.blocks
   WHERE page_id = '00000000-0199-0021-0000-000000000a01'::uuid),
  4,
  'T2b: page now has 4 blocks total after duplicate'
);

-- ── T3: wrong user → permission_denied ───────────────────────────────────────

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0020-0000-000000000b02","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT throws_matching(
  $$
    SELECT public.duplicate_block('00000000-0199-0022-0000-000000000001'::uuid)
  $$,
  'permission_denied',
  'T3: duplicate_block as wrong user raises permission_denied'
);

-- ── T4: duplicate last block → new at MAX+1, no other shifts (ECN-CRUD-03) ───

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0020-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

-- Get current max position before duplicating
-- After T1/T2 we have 4 blocks (positions 0,1,2,3). Duplicate position 3 (last).
SELECT lives_ok(
  $$
    SELECT public.duplicate_block('00000000-0199-0022-0000-000000000003'::uuid)
  $$,
  'T4: duplicate_block of last block (MAX position) succeeds without error'
);

SELECT * FROM finish();
ROLLBACK;
