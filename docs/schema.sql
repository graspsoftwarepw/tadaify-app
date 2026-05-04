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
-- Ownership guard added in 20260503000002_secure_delete_user_data.sql (Codex P1 fix, PR #174)
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Ownership guard: caller must be the same user they are deleting.
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'permission denied: caller % cannot delete data for %',
      auth.uid(), p_user_id
      USING ERRCODE = '42501';
  END IF;
  DELETE FROM blocks           WHERE user_id = p_user_id;
  DELETE FROM pages            WHERE user_id = p_user_id;
  DELETE FROM account_settings WHERE id      = p_user_id;
  DELETE FROM profiles         WHERE id      = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;

-- OTP resend rate-limit audit table (BR-OTP-RATE-LIMIT-001, issue tadaify-app#179)
-- Migrations: 20260503000003_otp_rate_limit_attempts.sql
--             20260504000001_otp_rate_limit_pair_keyed_index.sql
--             20260504000002_otp_rate_limit_acquire_slot_rpc.sql
--             20260504000003_otp_slot_reservation_finalization.sql
CREATE TABLE public.otp_rate_limit_attempts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash   TEXT        NOT NULL,     -- sha256(lower(trim(email))) — raw email never stored
  handle       TEXT,                     -- null for login flow (no handle at OTP time)
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome      TEXT        NOT NULL CHECK (outcome IN ('sent', 'rate_limited', 'reserved', 'failed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pair-keyed index (email_hash + handle) — replaces old email-only index.
CREATE INDEX idx_otp_rate_limit_email_handle_attempted_at
  ON public.otp_rate_limit_attempts (email_hash, handle, attempted_at DESC);

ALTER TABLE public.otp_rate_limit_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "otp_rate_limit_service_role_only"
  ON public.otp_rate_limit_attempts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Atomic OTP slot acquisition RPC (two-phase reservation pattern).
-- acquire_otp_slot: atomically reserves a slot (outcome='reserved') and returns UUID.
-- Cap counts 'sent' + 'reserved' rows so in-flight reservations prevent TOCTOU races.
CREATE OR REPLACE FUNCTION public.acquire_otp_slot(
  p_email_hash TEXT,
  p_handle TEXT DEFAULT NULL,
  p_window_seconds INT DEFAULT 86400,
  p_max_attempts INT DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_oldest TIMESTAMPTZ;
  v_window_start TIMESTAMPTZ;
  v_retry_after_seconds INT;
  v_reservation_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtext(p_email_hash || '::' || COALESCE(p_handle, '__null__'))
  );

  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  SELECT COUNT(*), MIN(attempted_at)
  INTO v_count, v_oldest
  FROM public.otp_rate_limit_attempts
  WHERE email_hash = p_email_hash
    AND (
      (p_handle IS NULL AND handle IS NULL)
      OR handle = p_handle
    )
    AND outcome IN ('sent', 'reserved')
    AND attempted_at >= v_window_start;

  IF v_count >= p_max_attempts THEN
    INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
    VALUES (p_email_hash, p_handle, 'rate_limited');

    v_retry_after_seconds := GREATEST(
      0,
      CEIL(EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - now())))
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry_after_seconds
    );
  END IF;

  INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
  VALUES (p_email_hash, p_handle, 'reserved')
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object('allowed', true, 'reservation_id', v_reservation_id);
END;
$$;

REVOKE ALL ON FUNCTION public.acquire_otp_slot FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acquire_otp_slot TO service_role;

COMMENT ON FUNCTION public.acquire_otp_slot IS
  'Atomically acquires an OTP send slot for the given email_hash+handle pair. '
  'Returns {"allowed":true,"reservation_id":"<uuid>"} with a reserved row, or '
  '{"allowed":false,"retry_after_seconds":N} with a rate_limited audit row. '
  'Caller MUST finalize via finalize_otp_slot after Auth send. '
  'Uses advisory lock to serialize concurrent requests (BR-OTP-RATE-LIMIT-001).';

-- Finalize a reserved OTP slot to 'sent' or 'failed'.
CREATE OR REPLACE FUNCTION public.finalize_otp_slot(
  p_reservation_id UUID,
  p_outcome TEXT DEFAULT 'sent'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_outcome NOT IN ('sent', 'failed') THEN
    RETURN jsonb_build_object('error', 'outcome must be sent or failed');
  END IF;

  UPDATE public.otp_rate_limit_attempts
  SET outcome = p_outcome
  WHERE id = p_reservation_id
    AND outcome = 'reserved'
  ;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RETURN jsonb_build_object('finalized', false, 'reason', 'not_found_or_already_finalized');
  END IF;

  RETURN jsonb_build_object('finalized', true);
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_otp_slot FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_otp_slot TO service_role;

COMMENT ON FUNCTION public.finalize_otp_slot IS
  'Finalizes a reserved OTP slot to sent (Auth succeeded) or failed (Auth error). '
  'Idempotent: returns finalized=false if already finalized or not found. '
  'Part of the two-phase OTP rate-limit pattern (BR-OTP-RATE-LIMIT-001).';
