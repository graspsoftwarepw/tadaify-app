-- Migration: OTP slot reservation/finalization pattern
-- BR-OTP-RATE-LIMIT-001 (issue tadaify-app#179, DEC-342=A)
--
-- Codex follow-up review Finding 1: acquire_otp_slot recorded 'sent' before
-- Supabase Auth actually sent the OTP. If Auth failed, the slot was wasted and
-- a legitimate user could be locked out after 3 failed upstream attempts.
--
-- Fix: two-phase reservation pattern:
--   1. acquire_otp_slot now inserts outcome='reserved' and returns the row UUID.
--   2. Caller finalizes via finalize_otp_slot(id, 'sent'|'failed') after Auth.
--   3. Cap counts 'sent' + 'reserved' rows so in-flight reservations still
--      prevent TOCTOU races.
--   4. Failed Auth marks the row 'failed' — does NOT consume a successful-send slot.

-- Step 1: expand the CHECK constraint to allow 'reserved' and 'failed'.
ALTER TABLE public.otp_rate_limit_attempts
  DROP CONSTRAINT IF EXISTS otp_rate_limit_attempts_outcome_check;

ALTER TABLE public.otp_rate_limit_attempts
  ADD CONSTRAINT otp_rate_limit_attempts_outcome_check
    CHECK (outcome IN ('sent', 'rate_limited', 'reserved', 'failed'));

-- Step 2: replace acquire_otp_slot to insert 'reserved' and return UUID.
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
  -- Lock on the email_hash+handle pair using advisory lock to serialize
  -- concurrent requests for the same pair without table-level locks.
  PERFORM pg_advisory_xact_lock(
    hashtext(p_email_hash || '::' || COALESCE(p_handle, '__null__'))
  );

  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Count 'sent' + 'reserved' rows within the rolling window for this pair.
  -- 'reserved' = in-flight send that hasn't been finalized yet; must count
  -- toward the cap to prevent concurrent TOCTOU bypass.
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
    -- Denied: insert a 'rate_limited' audit row and return denial.
    INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
    VALUES (p_email_hash, p_handle, 'rate_limited');

    -- Compute retry_after from the oldest sent/reserved row.
    v_retry_after_seconds := GREATEST(
      0,
      CEIL(EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - now())))
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry_after_seconds
    );
  END IF;

  -- Allowed: insert a 'reserved' row. The caller MUST finalize via
  -- finalize_otp_slot(id, 'sent') after Auth succeeds, or
  -- finalize_otp_slot(id, 'failed') on Auth error.
  INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
  VALUES (p_email_hash, p_handle, 'reserved')
  RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object('allowed', true, 'reservation_id', v_reservation_id);
END;
$$;

-- Step 3: finalize_otp_slot — updates a 'reserved' row to 'sent' or 'failed'.
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
    -- Row not found or already finalized — idempotent, not an error.
    RETURN jsonb_build_object('finalized', false, 'reason', 'not_found_or_already_finalized');
  END IF;

  RETURN jsonb_build_object('finalized', true);
END;
$$;

-- Only service_role may call these functions.
REVOKE ALL ON FUNCTION public.finalize_otp_slot FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_otp_slot TO service_role;

COMMENT ON FUNCTION public.acquire_otp_slot IS
  'Atomically acquires an OTP send slot for the given email_hash+handle pair. '
  'Returns {"allowed":true,"reservation_id":"<uuid>"} with a reserved row, or '
  '{"allowed":false,"retry_after_seconds":N} with a rate_limited audit row. '
  'Caller MUST finalize via finalize_otp_slot after Auth send. '
  'Uses advisory lock to serialize concurrent requests (BR-OTP-RATE-LIMIT-001).';

COMMENT ON FUNCTION public.finalize_otp_slot IS
  'Finalizes a reserved OTP slot to sent (Auth succeeded) or failed (Auth error). '
  'Idempotent: returns finalized=false if already finalized or not found. '
  'Part of the two-phase OTP rate-limit pattern (BR-OTP-RATE-LIMIT-001).';
