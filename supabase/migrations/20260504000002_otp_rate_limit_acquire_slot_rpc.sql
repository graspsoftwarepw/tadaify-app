-- Migration: Atomic OTP rate-limit slot acquisition RPC
-- BR-OTP-RATE-LIMIT-001 (issue tadaify-app#179, DEC-342=A)
--
-- Replaces the check-then-send-then-record pattern with an atomic
-- reserve-or-deny operation. Prevents concurrent requests from bypassing
-- the 3-send-per-24h cap via TOCTOU race.
--
-- Codex follow-up review Finding 2.

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
BEGIN
  -- Lock on the email_hash+handle pair using advisory lock to serialize
  -- concurrent requests for the same pair without table-level locks.
  -- hashtext returns a 32-bit int suitable for pg_advisory_xact_lock.
  PERFORM pg_advisory_xact_lock(
    hashtext(p_email_hash || '::' || COALESCE(p_handle, '__null__'))
  );

  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Count existing 'sent' rows within the rolling window for this pair.
  SELECT COUNT(*), MIN(attempted_at)
  INTO v_count, v_oldest
  FROM public.otp_rate_limit_attempts
  WHERE email_hash = p_email_hash
    AND (
      (p_handle IS NULL AND handle IS NULL)
      OR handle = p_handle
    )
    AND outcome = 'sent'
    AND attempted_at >= v_window_start;

  IF v_count >= p_max_attempts THEN
    -- Denied: insert a 'rate_limited' audit row and return denial.
    INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
    VALUES (p_email_hash, p_handle, 'rate_limited');

    -- Compute retry_after from the oldest sent row.
    v_retry_after_seconds := GREATEST(
      0,
      CEIL(EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - now())))
    );

    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry_after_seconds
    );
  END IF;

  -- Allowed: insert a 'reserved' row. The caller updates it to 'sent' after
  -- Supabase Auth succeeds, or deletes/marks 'failed' on error.
  INSERT INTO public.otp_rate_limit_attempts (email_hash, handle, outcome)
  VALUES (p_email_hash, p_handle, 'sent');

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Only service_role may call this function.
REVOKE ALL ON FUNCTION public.acquire_otp_slot FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acquire_otp_slot TO service_role;

COMMENT ON FUNCTION public.acquire_otp_slot IS
  'Atomically acquires an OTP send slot for the given email_hash+handle pair. '
  'Returns {"allowed":true} with a pre-recorded sent row, or '
  '{"allowed":false,"retry_after_seconds":N} with a rate_limited audit row. '
  'Uses advisory lock to serialize concurrent requests (BR-OTP-RATE-LIMIT-001).';
