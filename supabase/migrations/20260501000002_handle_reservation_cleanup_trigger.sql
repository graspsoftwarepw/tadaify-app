-- Migration: handle_reservation cleanup trigger on profiles INSERT
-- Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
-- PR: Fixes #129
-- DEC trail: DEC-291 (handle reservation cleanup after claim)
--
-- When a profiles row is successfully inserted (user completed signup),
-- the matching handle_reservations row is deleted — the handle is now
-- permanently owned.
--
-- The Workers api.auth.verify.ts also issues a fire-and-forget DELETE
-- against handle_reservations. This trigger acts as a belt-and-suspenders
-- fallback in case the Workers cleanup call fails.

CREATE OR REPLACE FUNCTION on_profile_created_cleanup_reservation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  DELETE FROM handle_reservations WHERE handle = NEW.handle;
  RETURN NEW;
END;
$$;

-- Fires AFTER insert so the profiles row is visible (idempotent; DELETE is safe even if row absent)
CREATE TRIGGER profile_created_cleanup_reservation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION on_profile_created_cleanup_reservation();
