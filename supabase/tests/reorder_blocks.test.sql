-- pgTAP tests for reorder_blocks() RPC
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- Covers: BR-BLOCK-CRUD-003, AC#2/7, ECN-CRUD-04/05/06
--
-- Tests:
--   T1: reorder_blocks atomically renumbers all blocks for a page
--   T2: reorder_blocks with ordered_ids from different page raises invalid_input (ECN-CRUD-04)
--   T3: reorder_blocks with length mismatch raises invalid_input (ECN-CRUD-05)
--   T4: reorder_blocks rejects unauthenticated calls (auth.uid() IS NULL)
--
-- Run locally:
--   supabase db reset
--   supabase test db

BEGIN;

SELECT plan(4);

-- ── Seed ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  VALUES
    ('00000000-0199-0010-0000-000000000a01'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-reorder-a@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now()),
    ('00000000-0199-0010-0000-000000000b02'::uuid,
     '00000000-0000-0000-0000-000000000000'::uuid,
     'authenticated', 'authenticated',
     'test-reorder-b@local.test', crypt('TestPass123!', gen_salt('bf')),
     now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, handle, email, tos_version, tier)
  VALUES
    ('00000000-0199-0010-0000-000000000a01'::uuid, 'reorder-user-a', 'test-reorder-a@local.test', 'v1', 'free'),
    ('00000000-0199-0010-0000-000000000b02'::uuid, 'reorder-user-b', 'test-reorder-b@local.test', 'v1', 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Page for user A
  INSERT INTO public.pages (id, user_id, title, is_homepage)
  VALUES
    ('00000000-0199-0011-0000-000000000a01'::uuid,
     '00000000-0199-0010-0000-000000000a01'::uuid,
     'Reorder Page A', true)
  ON CONFLICT (id) DO NOTHING;

  -- Page for user B (separate page)
  INSERT INTO public.pages (id, user_id, title, is_homepage)
  VALUES
    ('00000000-0199-0011-0000-000000000b02'::uuid,
     '00000000-0199-0010-0000-000000000b02'::uuid,
     'Reorder Page B', true)
  ON CONFLICT (id) DO NOTHING;

  -- 3 blocks for user A on page A (positions 0, 1, 2)
  INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
  VALUES
    ('00000000-0199-0012-0000-000000000001'::uuid,
     '00000000-0199-0011-0000-000000000a01'::uuid,
     '00000000-0199-0010-0000-000000000a01'::uuid,
     'link', 'Block 0', 0),
    ('00000000-0199-0012-0000-000000000002'::uuid,
     '00000000-0199-0011-0000-000000000a01'::uuid,
     '00000000-0199-0010-0000-000000000a01'::uuid,
     'link', 'Block 1', 1),
    ('00000000-0199-0012-0000-000000000003'::uuid,
     '00000000-0199-0011-0000-000000000a01'::uuid,
     '00000000-0199-0010-0000-000000000a01'::uuid,
     'link', 'Block 2', 2)
  ON CONFLICT (id) DO NOTHING;

  -- 1 block for user B on page B (used in cross-page test)
  INSERT INTO public.blocks (id, page_id, user_id, block_type, title, position)
  VALUES
    ('00000000-0199-0012-0000-000000000b01'::uuid,
     '00000000-0199-0011-0000-000000000b02'::uuid,
     '00000000-0199-0010-0000-000000000b02'::uuid,
     'link', 'Block B0', 0)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ── T1: reorder atomically renumbers all blocks ───────────────────────────────
-- User A reorders: Block2, Block0, Block1 → new positions 0, 1, 2 respectively

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0010-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT lives_ok(
  $$
    SELECT public.reorder_blocks(
      '00000000-0199-0011-0000-000000000a01'::uuid,
      ARRAY[
        '00000000-0199-0012-0000-000000000003'::uuid,
        '00000000-0199-0012-0000-000000000001'::uuid,
        '00000000-0199-0012-0000-000000000002'::uuid
      ]
    )
  $$,
  'T1: reorder_blocks succeeds for own page blocks'
);

-- Verify new positions
SET LOCAL role TO postgres;
SELECT is(
  (SELECT position FROM public.blocks WHERE id = '00000000-0199-0012-0000-000000000003'::uuid),
  0,
  'T1b: former Block2 now at position 0 after reorder'
);

-- ── T2: cross-page block raises invalid_input ─────────────────────────────────
-- ECN-CRUD-04: user A tries to include user B's block in the reorder of page A

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0199-0010-0000-000000000a01","role":"authenticated"}';
SET LOCAL role TO authenticated;

SELECT throws_matching(
  $$
    SELECT public.reorder_blocks(
      '00000000-0199-0011-0000-000000000a01'::uuid,
      ARRAY[
        '00000000-0199-0012-0000-000000000003'::uuid,
        '00000000-0199-0012-0000-000000000001'::uuid,
        '00000000-0199-0012-0000-000000000002'::uuid,
        '00000000-0199-0012-0000-000000000b01'::uuid  -- block from page B!
      ]
    )
  $$,
  'invalid_input',
  'T2: reorder_blocks raises invalid_input when cross-page block included (ECN-CRUD-04)'
);

-- ── T3: length mismatch raises invalid_input ──────────────────────────────────
-- ECN-CRUD-05: ordered_ids has only 2 entries but page A has 3 blocks

SELECT throws_matching(
  $$
    SELECT public.reorder_blocks(
      '00000000-0199-0011-0000-000000000a01'::uuid,
      ARRAY[
        '00000000-0199-0012-0000-000000000001'::uuid,
        '00000000-0199-0012-0000-000000000002'::uuid
        -- Block3 missing!
      ]
    )
  $$,
  'invalid_input',
  'T3: reorder_blocks raises invalid_input when ordered_ids missing some page blocks (ECN-CRUD-05)'
);

-- ── T4: unauthenticated call raises permission_denied ────────────────────────

SET LOCAL request.jwt.claims TO '{}';
RESET role;

SELECT throws_matching(
  $$
    SELECT public.reorder_blocks(
      '00000000-0199-0011-0000-000000000a01'::uuid,
      ARRAY[
        '00000000-0199-0012-0000-000000000001'::uuid
      ]
    )
  $$,
  'permission_denied',
  'T4: reorder_blocks raises permission_denied when not authenticated'
);

SELECT * FROM finish();
ROLLBACK;
