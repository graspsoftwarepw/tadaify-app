-- Consolidated DDL — auto-mirrors `supabase/migrations/`.
-- Update this file on every migration (keep in sync manually or via a post-migration script).
-- Source of truth for the current DB schema for quick reference.

-- Migration: 20260429000001_handle_reservations.sql
-- Added in Story 1 (F-LANDING-001) — landing page handle claim flow

CREATE TABLE handle_reservations (
  handle      text        PRIMARY KEY
                          CHECK (handle ~ '^[a-z0-9](?:[a-z0-9_]{1,29})?$'),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '15 minutes',
  ip          inet,
  user_agent  text
);

CREATE INDEX idx_handle_reservations_expires_at ON handle_reservations (expires_at);

-- RLS: anon INSERT (landing page), authenticated SELECT (register page validation)
ALTER TABLE handle_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_insert_reservation ON handle_reservations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY auth_read_reservation ON handle_reservations
  FOR SELECT TO authenticated USING (true);

-- Cleanup helper — called on each INSERT (fire-and-forget) or pg_cron schedule
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
  RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ DELETE FROM handle_reservations WHERE expires_at < now(); $$;

GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO anon, authenticated;

-- Migration: 20260501000001_profiles.sql
-- Added in Story F-REGISTER-001a — email-OTP + Auth Hook + handle binding

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

CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles (handle);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_row_select ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY own_row_update ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: INSERT granted to service-role only (Workers api.auth.verify.ts).
-- Anon/authenticated cannot self-insert.

CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

-- Migration: 20260501000002_handle_reservation_cleanup_trigger.sql
-- Automatically removes the handle_reservations row when a profiles row is inserted.

CREATE OR REPLACE FUNCTION on_profile_created_cleanup_reservation()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM handle_reservations WHERE handle = NEW.handle;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profile_created_cleanup_reservation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION on_profile_created_cleanup_reservation();
