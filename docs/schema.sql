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
