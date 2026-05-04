-- Migration: app_dashboard_tables
-- Story: F-APP-DASHBOARD-001a — home dashboard render shell (#171)
-- DEC trail: DEC-332=D (page Publish-gated), DEC-310=B (sub-issue split)
-- GDPR: delete_user_data() + user-export-data edge function updated below

-- ── account_settings ─────────────────────────────────────────────────────────
--
-- One row per authenticated user.
-- Stores theme preference, welcome banner dismiss state.
-- Row is created by service-role on first dashboard visit if absent.

CREATE TABLE IF NOT EXISTS account_settings (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_pref          text        NOT NULL DEFAULT 'light'
                                  CHECK (theme_pref IN ('light', 'dark')),
  welcome_dismissed   boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Index on id (already PK, explicit for reference)

ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read their own row
CREATE POLICY account_settings_own_select ON account_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Authenticated users may update their own row (theme_pref, welcome_dismissed)
CREATE POLICY account_settings_own_update ON account_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is NOT granted to authenticated/anon.
-- Service-role upserts account_settings row on first dashboard render.

-- updated_at trigger (reuses existing update_updated_at function from profiles migration)
CREATE TRIGGER account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── pages ─────────────────────────────────────────────────────────────────────
--
-- One page per user at MVP (is_homepage=true).
-- published_at IS NULL → page not yet live (DEC-332=D: Publish-gated).
-- published_at IS NOT NULL → page live after first block save.

CREATE TABLE IF NOT EXISTS pages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text        NOT NULL DEFAULT 'Home',
  is_homepage     boolean     NOT NULL DEFAULT true,
  published_at    timestamptz,           -- NULL until first publish (DEC-332=D)
  onboarding_resume_url text,            -- deep-link to last onboarding step
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient per-user page lookups
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages (user_id);

-- Index to quickly find homepage per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_user_homepage
  ON pages (user_id) WHERE is_homepage = true;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read their own pages
CREATE POLICY pages_own_select ON pages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users may update their own pages
CREATE POLICY pages_own_update ON pages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT is NOT granted to authenticated/anon.
-- Service-role creates the homepage page row on first dashboard visit if absent.

-- updated_at trigger
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── blocks ────────────────────────────────────────────────────────────────────
--
-- Link/embed blocks on a page. page_id FK NOT NULL.
-- At MVP: only one page (homepage) per user. Multi-page → #26b.

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks (page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON blocks (user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_page_position ON blocks (page_id, position);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read their own blocks
CREATE POLICY blocks_own_select ON blocks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users may update their own blocks
CREATE POLICY blocks_own_update ON blocks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT is NOT granted to authenticated/anon.
-- Service-role creates blocks (block CRUD actions → #26b).

-- updated_at trigger
CREATE TRIGGER blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── profiles: add onboarding_completed_at ─────────────────────────────────────
--
-- NULL = onboarding incomplete/interrupted.
-- NOT NULL = onboarding_complete action was successfully reached (DEC-332=D).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio                      text,
  ADD COLUMN IF NOT EXISTS template_id              text,
  ADD COLUMN IF NOT EXISTS tier                     text NOT NULL DEFAULT 'free'
                                                    CHECK (tier IN ('free', 'creator', 'pro', 'business'));

-- ── GDPR: update delete_user_data() RPC ───────────────────────────────────────
--
-- Adds DELETE for blocks, pages, account_settings.

CREATE OR REPLACE FUNCTION delete_user_data(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Delete blocks (FK ON DELETE CASCADE would handle this via pages,
  -- but explicit for clarity + safe against future schema changes)
  DELETE FROM blocks           WHERE user_id = p_user_id;
  DELETE FROM pages            WHERE user_id = p_user_id;
  DELETE FROM account_settings WHERE id      = p_user_id;
  DELETE FROM profiles         WHERE id      = p_user_id;
  -- auth.users deletion handled by caller (service-role) via Supabase Admin API.
END;
$$;

-- Grant execute to authenticated users (so they can delete their own data)
GRANT EXECUTE ON FUNCTION delete_user_data(uuid) TO authenticated;
