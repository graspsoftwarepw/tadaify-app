-- Consolidated DDL — auto-mirrors `supabase/migrations/`.
-- Update this file on every migration (keep in sync manually or via a post-migration script).
-- Source of truth for the current DB schema for quick reference.

-- Migration: 20260429000001_handle_reservations.sql
-- Added in Story 1 (F-LANDING-001) — landing page handle claim flow

CREATE TABLE handle_reservations (
  handle      text        PRIMARY KEY
                          CHECK (handle ~ '^[a-z0-9](?:[a-z0-9_]{1,29})?$'),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,  -- DEFAULT dropped in 20260502000001 (JS computes via HANDLE_RESERVATION_TTL_SECONDS env var, DEC-326=A: 10 min)
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

-- Migration: 20260503000001_app_dashboard_tables.sql
-- Added in Story F-APP-DASHBOARD-001a — home dashboard render shell (#171)

CREATE TABLE IF NOT EXISTS account_settings (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_pref          text        NOT NULL DEFAULT 'light'
                                  CHECK (theme_pref IN ('light', 'dark')),
  welcome_dismissed   boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_settings_own_select ON account_settings
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY account_settings_own_update ON account_settings
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS pages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text        NOT NULL DEFAULT 'Home',
  is_homepage     boolean     NOT NULL DEFAULT true,
  published_at    timestamptz,
  onboarding_resume_url text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_user_homepage ON pages (user_id) WHERE is_homepage = true;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY pages_own_select ON pages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY pages_own_update ON pages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS blocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     uuid        NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_type  text        NOT NULL DEFAULT 'link',
  title       text        NOT NULL DEFAULT '',
  url         text,
  is_visible  boolean     NOT NULL DEFAULT true,
  position    integer     NOT NULL DEFAULT 0,
  meta        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks (page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON blocks (user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_page_position ON blocks (page_id, position);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY blocks_own_select ON blocks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY blocks_own_update ON blocks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- profiles: added onboarding_completed_at, bio, template_id, tier
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio                      text,
  ADD COLUMN IF NOT EXISTS template_id              text,
  ADD COLUMN IF NOT EXISTS tier                     text NOT NULL DEFAULT 'free'
                                                    CHECK (tier IN ('free', 'creator', 'pro', 'business'));

-- GDPR: delete_user_data RPC
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id uuid)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM blocks           WHERE user_id = p_user_id;
  DELETE FROM pages            WHERE user_id = p_user_id;
  DELETE FROM account_settings WHERE id      = p_user_id;
  DELETE FROM profiles         WHERE id      = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_data(uuid) TO authenticated;
