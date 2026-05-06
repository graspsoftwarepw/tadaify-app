-- Migration: delete_user_data_r2_enqueue
-- Story: F-ONBOARDING-001c (tadaify-app#138) — GDPR R2 cleanup wiring
--
-- Adds a `pending_r2_deletes` queue table for GDPR-triggered R2 object deletion.
-- The Worker cron (avatar-orphan-cleanup) consumes this queue and deletes objects
-- from R2 via the bucket binding.
--
-- Also replaces `delete_user_data()` to enqueue the user's avatar_r2_key for R2
-- deletion before removing the profile_extras row (which holds the key).
--
-- Hard dependency: tadaify-app#139 must merge BEFORE this migration runs
-- (creates the profile_extras table; this references it).
--
-- TR reference: TR-tadaify-003 (GDPR delete wiring — R2 object delete via queue)
-- ECN-138-12: GDPR delete removes both DB row + R2 object

CREATE TABLE IF NOT EXISTS public.pending_r2_deletes (
  id           BIGSERIAL PRIMARY KEY,
  r2_key       TEXT NOT NULL,
  user_id      UUID NOT NULL,
  reason       TEXT NOT NULL DEFAULT 'gdpr_delete',
  enqueued_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at  TIMESTAMPTZ NULL
);

COMMENT ON TABLE public.pending_r2_deletes IS
  'Queue of R2 object keys scheduled for deletion. Consumed by the Worker cron job.';

-- RLS: service role only (no public access)
ALTER TABLE public.pending_r2_deletes ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no authenticated user policy)
-- Functions running as SECURITY DEFINER use service_role implicitly.

-- Replace delete_user_data() to enqueue avatar R2 delete before removing profile_extras.
-- Note: profile_extras row itself is deleted via FK ON DELETE CASCADE from
-- tadaify-app#139's profile_extras table (user_id FK → auth.users with CASCADE).
-- The enqueue must happen BEFORE the CASCADE fires to capture the r2_key.
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_avatar_r2_key TEXT;
BEGIN
  -- Ownership guard: caller must be the same user they are deleting.
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'permission denied: caller % cannot delete data for %',
      auth.uid(), p_user_id
      USING ERRCODE = '42501';
  END IF;

  -- Capture avatar_r2_key BEFORE deleting profile_extras (via CASCADE from profiles delete).
  -- profile_extras table is owned by tadaify-app#139; safe to reference here post-#139 merge.
  SELECT avatar_r2_key
    INTO v_avatar_r2_key
    FROM public.profile_extras
   WHERE user_id = p_user_id;

  -- Enqueue R2 delete if the user had an avatar (ECN-138-12)
  IF v_avatar_r2_key IS NOT NULL THEN
    INSERT INTO public.pending_r2_deletes (r2_key, user_id, reason)
    VALUES (v_avatar_r2_key, p_user_id, 'gdpr_delete');
  END IF;

  -- Delete blocks (FK ON DELETE CASCADE would handle this via pages,
  -- but explicit for clarity + safe against future schema changes)
  DELETE FROM blocks           WHERE user_id = p_user_id;
  DELETE FROM pages            WHERE user_id = p_user_id;
  DELETE FROM account_settings WHERE id      = p_user_id;
  -- profile_extras deleted via FK CASCADE when profiles row is deleted
  DELETE FROM profiles         WHERE id      = p_user_id;
  -- auth.users deletion handled by caller (service_role) via Supabase Admin API.
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;
