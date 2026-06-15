-- tadaify local seed
-- Pattern: per-test users named test-<story>-<scenario>@local.test / password TestPass123!
-- Add as needed by feature stories. Seed validation runs via `seed-validator` skill.
-- Inbucket for email testing: http://localhost:44214

-- ── F-REGISTER-001a users ────────────────────────────────────────────────────
-- Scenario: returning user for /login test (S5 in F-REGISTER-001a.plan.md)
-- Pattern: insert into auth.users first, then profiles (FK constraint order)
-- Password is hashed; for local tests use signInWithPassword("TestPass123!")

-- Note: seed users for email-OTP registration testing are created LIVE via
-- the Inbucket flow (supabase start → send OTP → verify). Pre-seeded confirmed
-- users are NOT used for signup tests per feedback_supabase_local_inbucket_for_auth_testing.md.
-- Only the returning-user login scenario (S5) needs a pre-existing profile.
-- This is set up by running the full happy-path once, which creates the profile row.

-- ── F-ONBOARDING-001c users (tadaify-app#138) ────────────────────────────────
-- Pre-confirmed user for avatar upload Playwright tests (S1, S3-pdf, S4, S5).
-- Signs in via signInWithPassword("TestPass123!") in test setup.
-- Covers: TR-tadaify-003 (miniflare-emulated R2 binding, no MOCK_R2 stub).

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000138',
  'test-br138-avatar-upload@local.test',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Matching auth.identities row for the email provider — required by GoTrue
-- for signInWithPassword to succeed. Without this row the local auth stack
-- returns "Invalid login credentials" even though the users row exists.
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000138',
  '00000000-0000-0000-0000-000000000138',
  'test-br138-avatar-upload@local.test',
  'email',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000138',
    'email', 'test-br138-avatar-upload@local.test',
    'email_verified', true
  ),
  now(),
  now(),
  now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- ── F-BLOCK-INFRA-PUBLIC-RENDER-001 seeds (idempotent) ───────────────────────
-- Story: tadaify-app#202
-- Three creators for Playwright public-render.spec.ts (S1, S5, S8). All three:
--   - have a confirmed auth.users row + matching auth.identities row
--   - have a profiles row with handle
--   - have a published homepage (pages.is_homepage=true AND published_at NOT NULL)
-- Variation:
--   - test_render_s1 → 3 visible blocks at positions 0/1/2
--   - test_render_s5 → 3 blocks at positions 0/1/2, middle one is_visible=false
--   - test_render_s8 → 0 blocks (published page with empty block list)

-- ---- creator 1: test_render_s1 (3 visible blocks) ----

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES (
  '00000000-0000-0000-0000-000000000a01',
  'test_render_s1@local.test',
  crypt('TestPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000a01',
  '00000000-0000-0000-0000-000000000a01',
  'test_render_s1@local.test', 'email',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000a01',
    'email', 'test_render_s1@local.test',
    'email_verified', true
  ),
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO profiles (id, handle, email, display_name, bio, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000a01',
  'test_render_s1',
  'test_render_s1@local.test',
  'S1 Test Creator',
  'Seeded by F-BLOCK-INFRA-PUBLIC-RENDER-001 (#202).',
  now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pages (id, user_id, title, is_homepage, published_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-0000000a0001',
  '00000000-0000-0000-0000-000000000a01',
  'Home', true, now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

-- F-BLOCK-LINK-001 slice A (#56): seed real Link button content + meta so
-- visiting /test_render_s1 shows three styled buttons instead of empty cards.
INSERT INTO blocks (id, page_id, user_id, block_type, title, url, is_visible, position, meta, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-0000000b1001',
   '00000000-0000-0000-0000-0000000a0001',
   '00000000-0000-0000-0000-000000000a01',
   'link', 'Listen on Spotify', 'https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF', true, 0,
   '{"icon":"simple-icons:spotify","newtab":true}'::jsonb,
   now(), now()),
  ('00000000-0000-0000-0000-0000000b1002',
   '00000000-0000-0000-0000-0000000a0001',
   '00000000-0000-0000-0000-000000000a01',
   'link', 'Watch on YouTube', 'https://youtube.com/@example', true, 1,
   '{"icon":"simple-icons:youtube","newtab":true}'::jsonb,
   now(), now()),
  ('00000000-0000-0000-0000-0000000b1003',
   '00000000-0000-0000-0000-0000000a0001',
   '00000000-0000-0000-0000-000000000a01',
   'link', 'Buy my newsletter', 'https://example.com/newsletter', true, 2,
   '{"icon":"lucide:mail","newtab":true}'::jsonb,
   now(), now())
ON CONFLICT (id) DO NOTHING;

-- ---- creator 5: test_render_s5 (3 blocks, middle one hidden) ----

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES (
  '00000000-0000-0000-0000-000000000a05',
  'test_render_s5@local.test',
  crypt('TestPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000a05',
  '00000000-0000-0000-0000-000000000a05',
  'test_render_s5@local.test', 'email',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000a05',
    'email', 'test_render_s5@local.test',
    'email_verified', true
  ),
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO profiles (id, handle, email, display_name, bio, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000a05',
  'test_render_s5',
  'test_render_s5@local.test',
  'S5 Test Creator',
  'Seeded by F-BLOCK-INFRA-PUBLIC-RENDER-001 (#202).',
  now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pages (id, user_id, title, is_homepage, published_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-0000000a0005',
  '00000000-0000-0000-0000-000000000a05',
  'Home', true, now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (id, page_id, user_id, block_type, title, url, is_visible, position, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-0000000b5001',
   '00000000-0000-0000-0000-0000000a0005',
   '00000000-0000-0000-0000-000000000a05',
   'link', 'S5 block 1 (visible)', 'https://example.com/s5-1', true, 0, now(), now()),
  ('00000000-0000-0000-0000-0000000b5002',
   '00000000-0000-0000-0000-0000000a0005',
   '00000000-0000-0000-0000-000000000a05',
   'link', 'S5 block 2 (HIDDEN)', 'https://example.com/s5-2', false, 1, now(), now()),
  ('00000000-0000-0000-0000-0000000b5003',
   '00000000-0000-0000-0000-0000000a0005',
   '00000000-0000-0000-0000-000000000a05',
   'link', 'S5 block 3 (visible)', 'https://example.com/s5-3', true, 2, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ---- creator 8: test_render_s8 (published page, ZERO blocks) ----

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, aud, role
) VALUES (
  '00000000-0000-0000-0000-000000000a08',
  'test_render_s8@local.test',
  crypt('TestPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000a08',
  '00000000-0000-0000-0000-000000000a08',
  'test_render_s8@local.test', 'email',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000a08',
    'email', 'test_render_s8@local.test',
    'email_verified', true
  ),
  now(), now(), now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

INSERT INTO profiles (id, handle, email, display_name, bio, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000a08',
  'test_render_s8',
  'test_render_s8@local.test',
  'S8 Test Creator',
  'Seeded by F-BLOCK-INFRA-PUBLIC-RENDER-001 (#202).',
  now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pages (id, user_id, title, is_homepage, published_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-0000000a0008',
  '00000000-0000-0000-0000-000000000a08',
  'Home', true, now(), now(), now()
) ON CONFLICT (id) DO NOTHING;
-- No blocks for s8 — that's the test contract.
