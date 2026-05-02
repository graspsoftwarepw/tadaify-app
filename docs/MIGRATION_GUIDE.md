# Migration Guide — tadaify

All database migrations that need to be applied to PROD are listed here under
"Pending for PROD". After a migration is applied to PROD (via `v*` tag deploy),
move it to "Applied".

Migrations apply automatically to DEV on merge to `main` (GitHub Actions
`supabase db push`). PROD applies on tag push (`v*`).

---

## Pending for PROD

### 20260502000001_drop_handle_reservations_default.sql

**Effect:** drops the SQL `DEFAULT` clause on `handle_reservations.expires_at`.

**Why:** the JS route now reads `HANDLE_RESERVATION_TTL_SECONDS` from Workers env
at runtime (default 600 s = 10 min, DEC-326 = A). The old SQL DEFAULT was 15 min
and could not reflect the env-var value. The application always passes `expires_at`
explicitly on INSERT, so dropping the DEFAULT is backward-compatible.

**Pre-steps:** none — additive-safe schema change (dropping a DEFAULT never
invalidates existing rows or application code that already provides the value).

**Post-steps:** none.

**Rollback:**
```sql
ALTER TABLE handle_reservations
  ALTER COLUMN expires_at SET DEFAULT now() + interval '15 minutes';
```

---

## Applied

### 20260501000002_handle_reservation_cleanup_trigger.sql

Auto-cleanup trigger on `handle_reservations` to remove expired rows on INSERT.
Applied to DEV on merge of PR #133.

### 20260501000001_profiles.sql

`profiles` table with `handle` unique constraint + RLS policies. Applied to DEV
on merge of PR #133.

### 20260429000001_handle_reservations.sql

Initial `handle_reservations` table with PK on `handle`. Applied to DEV on merge
of landing page PR (#1).
