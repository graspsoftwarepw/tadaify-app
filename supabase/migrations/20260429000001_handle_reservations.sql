-- Migration: handle_reservations table
-- Story: F-LANDING-001 — Landing page handle claim flow
-- PR: Fixes #1

-- 15-minute handle reservations created from the landing page claim form.
-- Anon users can INSERT (reservation), authenticated users can SELECT.
-- Cleanup via cleanup_expired_reservations() called on each INSERT or by a scheduled job.

CREATE TABLE handle_reservations (
  handle      text        PRIMARY KEY
                          CHECK (handle ~ '^[a-z0-9](?:[a-z0-9_]{1,29})?$'),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '15 minutes',
  ip          inet,
  user_agent  text
);

CREATE INDEX idx_handle_reservations_expires_at ON handle_reservations (expires_at);

ALTER TABLE handle_reservations ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can create a reservation (the landing-page claim button)
CREATE POLICY anon_insert_reservation ON handle_reservations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users (e.g. /register page validation) can read reservations
CREATE POLICY auth_read_reservation ON handle_reservations
  FOR SELECT TO authenticated
  USING (true);

-- Service role (used by Workers/Edge Functions) gets full access via its own JWT
-- No explicit policy needed — service role bypasses RLS.

-- Cleanup helper called on every INSERT to keep the table tidy.
-- Also safe to call from a pg_cron schedule: '*/5 * * * *'
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
  DELETE FROM handle_reservations WHERE expires_at < now();
$$;

-- Grant execute to anon + authenticated so the RR7 loader can call it
GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO anon, authenticated;
