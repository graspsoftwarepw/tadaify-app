-- Migration: secure_delete_user_data
-- Story: F-APP-DASHBOARD-001a (#171) — Codex review P1 fix (PR #174)
--
-- Adds an ownership guard to delete_user_data() so that an authenticated
-- user cannot pass another user's UUID and delete their data.
--
-- Replaces the function created in 20260503000001_app_dashboard_tables.sql
-- with a secured version. The migration chain replays cleanly: the original
-- migration creates the function first; this migration replaces it with the
-- ownership check added at the top of the body.

CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Ownership guard: caller must be the same user they are deleting.
  -- auth.uid() returns NULL for unauthenticated sessions (service_role
  -- bypasses RLS at the Supabase layer and is expected to pass the
  -- caller's own UUID, which will equal auth.uid() for user-initiated
  -- calls).
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'permission denied: caller % cannot delete data for %',
      auth.uid(), p_user_id
      USING ERRCODE = '42501';
  END IF;

  -- Delete blocks (FK ON DELETE CASCADE would handle this via pages,
  -- but explicit for clarity + safe against future schema changes)
  DELETE FROM blocks           WHERE user_id = p_user_id;
  DELETE FROM pages            WHERE user_id = p_user_id;
  DELETE FROM account_settings WHERE id      = p_user_id;
  DELETE FROM profiles         WHERE id      = p_user_id;
  -- auth.users deletion handled by caller (service_role) via Supabase Admin API.
END;
$$;

-- Grant is idempotent — function already granted to authenticated in the
-- previous migration; repeated GRANT is a no-op on PostgreSQL.
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;
