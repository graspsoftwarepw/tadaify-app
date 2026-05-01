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
