-- Migration: profile_extras_add_avatar_r2_key
-- Story: F-ONBOARDING-001c (tadaify-app#138) — R2 avatar upload integration
--
-- Adds `avatar_r2_key` column to the `profile_extras` table (base table
-- created by tadaify-app#139 / 20260506000000_profile_extras_base.sql).
--
-- Hard dependency: tadaify-app#139 must merge BEFORE this migration runs.
-- Migration timestamps ensure ordering: #139 → 20260506000000, this → 20260506000001.
--
-- RLS note: the RLS policies added by #139 cover all columns via "own row"
-- UPDATE rule — no new policies are needed for this column.
--
-- TR reference: TR-tadaify-003 (R2 avatar pipeline contract)
-- TR reference: TR-tadaify-007 (profile_extras shared contract — owned by #139)

ALTER TABLE public.profile_extras
  ADD COLUMN avatar_r2_key TEXT NULL;

COMMENT ON COLUMN public.profile_extras.avatar_r2_key IS
  'R2 object key for the user''s avatar. NULL means no avatar (default initial-letter rendered). Pattern: avatars/<userId>/<uuid>.<ext>';
