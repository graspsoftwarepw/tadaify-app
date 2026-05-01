-- Migration: profiles table + handle binding
-- Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
-- PR: Fixes #129
-- DEC trail: DEC-291 (handle binding post-OTP), DEC-294 (force-email)

-- ── profiles ──────────────────────────────────────────────────────────────────
--
-- One row per authenticated user.
-- Row is inserted by api.auth.verify.ts (Workers route) via service-role key
-- AFTER Supabase OTP verification succeeds.
-- handle comes from auth.users.raw_user_meta_data.handle (set at signInWithOtp time).

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle        text        UNIQUE NOT NULL
                            CHECK (handle ~ '^[a-z0-9](?:[a-z0-9_]{1,29})?$'),
  email         text        NOT NULL,
  display_name  text,
  tos_version   text        NOT NULL DEFAULT 'v1',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for handle look-ups (availability checks + public profile pages)
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles (handle);

-- Index for email look-ups (login, duplicate detection)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read their own row
CREATE POLICY own_row_select ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users may update their own row (display_name changes, etc.)
CREATE POLICY own_row_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: INSERT is NOT granted to authenticated/anon.
-- The only path to create a profiles row is via service-role (Workers api.auth.verify.ts).
-- This prevents users from self-inserting arbitrary handles or claiming reserved handles.

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
