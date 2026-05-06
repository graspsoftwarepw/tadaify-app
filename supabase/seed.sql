-- tadaify local seed
-- Pattern: per-test users named test-<story>-<scenario>@local.test / password TestPass123!
-- Add as needed by feature stories. Seed validation runs via `seed-validator` skill.
-- Inbucket for email testing: http://localhost:54354

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
