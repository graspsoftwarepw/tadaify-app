# TR-tadaify-003 — R2 avatar pipeline contract

**Level:** MUST
**Introduced:** F-ONBOARDING-001c (tadaify-app#138)
**Status:** accepted
**Inherits:** TR-tadaify-007 (profile_extras shared contract — owned by tadaify-app#139)

## Context

The onboarding wizard profile step (`/onboarding/profile`) allows users to upload an avatar.
Avatar files must be validated server-side for type and size before being stored in Cloudflare R2.
The upload pipeline must be secure (no path for malicious file types to land in R2), robust
(graceful error + retry UI), and testable without a real R2 bucket (MOCK_R2 for local dev).

Production R2 provisioning is deferred to a separate story in the **tadaify-aws** repo
(NOT untiltify-aws — that earlier reference was an error).

## Decision

### Backend-proxy model (NOT direct presigned PUT)

All avatar uploads flow through a Cloudflare Worker route (`POST /api/upload/avatar`) that:

1. Validates `Content-Length` ≤ 2MB before reading body (pre-flight rejection, 413)
2. Reads full body; detects file type via magic bytes (server-authoritative):
   - JPG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A`
   - WebP: `RIFF????WEBP` (bytes 0–3 and 8–11)
3. Rejects (415) if magic bytes do not match any supported type — client-sent Content-Type is IGNORED
4. Authenticates via Bearer JWT in `Authorization` header (Supabase JWT verified via `/auth/v1/user`)
5. Generates `r2_key = avatars/<userId>/<uuid>.<ext-from-magic>`
6. PUTs bytes to R2 binding with correct Content-Type
7. Returns `{ r2_key }` to client

This ensures the Worker is the choke point — no path for malicious clients to slip through.

### R2 key pattern

```
avatars/<userId>/<uuid>.<ext>
```

- `userId` — Supabase auth user UUID
- `uuid` — `crypto.randomUUID()` (collision-resistant)
- `ext` — derived from magic-byte detection (`jpg`, `png`, or `webp`)

### Signed read URL (avatar serving)

- GET `/api/avatar/:key` — serves avatar bytes
- `key` param is the r2_key encoded as base64url (to avoid path conflicts)
- Cache-Control: `public, max-age=604800, immutable` (7 days)
- In production: would generate presigned URL with 7-day TTL; for MVP, streams directly
- Rotation on access: deferred to post-MVP (sufficient for MVP scale)

### Local dev + test R2 emulation via miniflare

- `@cloudflare/vite-plugin` (already in project) auto-emulates `AVATARS_R2` R2 binding via miniflare
  when `npm run dev` is started. The binding is filesystem-backed local storage.
- No `MOCK_R2` env var, no in-memory stub — the binding is always present in local dev (identical
  interface to production; real `R2Bucket` type).
- Unit tests (CI): use hermetic `vi.fn()` mocks for the R2 binding (`{ put: vi.fn(), get: vi.fn() }`).
  They do NOT spin up miniflare. Per `feedback_ci_unit_tests_allowed.md`.
- Playwright (local only): runs against `npm run dev` which uses the vite-plugin → miniflare → real R2 API.
- Network failure for S4 retry test: simulated via `page.route()` abort, not a server-side env var.
- Prod R2 binding provisioned separately via tadaify-aws infra story (same binding name `AVATARS_R2`,
  bucket name `tadaify-avatars`). No code change needed for prod cutover beyond enabling the binding.

### Feature flag

- `AVATAR_UPLOADS_ENABLED=false` → Worker returns 503 with friendly message
- Defaults to enabled (`true`) if unset (dev + CI)
- Flip to `false` in prod env until tadaify-aws R2 infra PR merges

### GDPR cleanup (R2 + DB)

- **Orphan cleanup cron:** Worker cron (`avatar-orphan-cleanup.ts`) runs periodically.
  Lists all `avatars/` objects older than 24h not referenced by `profile_extras.avatar_r2_key`.
  Deletes unbound objects.
- **GDPR account delete:** `delete_user_data()` RPC (updated migration `20260506000002`)
  captures `avatar_r2_key` BEFORE deleting `profile_extras`, then inserts into
  `pending_r2_deletes` queue. Worker cron consumes queue and deletes from R2.

### Persistence

On wizard completion, `profile_extras.avatar_r2_key` is UPSERT'd:
- With r2_key if user uploaded an avatar
- With NULL if user skipped

### Client-side validation (fast feedback only)

`app/lib/avatar-validator.ts` runs before POST for fast UX:
- Rejects `size > 2MB` → "File too large (max 2 MB)"
- Rejects unsupported MIME type → "Only JPG / PNG / WebP allowed"
- Warns on non-square (no rejection)

Server is AUTHORITATIVE — client validation can be bypassed.

## Consequences

- Avatar upload pipeline is fully testable locally with `npm run dev` (miniflare emulates AVATARS_R2 automatically)
- Production R2 cutover requires only: (a) tadaify-aws infra PR + (b) flip `AVATAR_UPLOADS_ENABLED=true`
- No MOCK_R2 stub needed — the vite-plugin miniflare binding is interface-identical to the real Cloudflare R2 binding
- The `avatar_r2_key` column in `profile_extras` is the single source of truth for whether a user has an avatar
- GDPR Art. 17 compliance: deleting a user also deletes their R2 objects via `pending_r2_deletes` queue
- Future stories that read avatar URLs MUST use `buildAvatarPreviewUrl(r2Key)` from `app/routes/api.avatar.$key.ts`

## References

- `app/routes/api.upload.avatar.ts` — Worker upload route
- `app/routes/api.avatar.$key.ts` — Avatar serve route + `buildAvatarPreviewUrl`
- `app/lib/mock-r2.ts` — DELETED; replaced by miniflare binding via `@cloudflare/vite-plugin`
- `app/lib/avatar-validator.ts` — client-side validation
- `app/lib/avatar-orphan-cleanup.ts` — orphan cleanup + GDPR delete helper
- `supabase/migrations/20260506000001_profile_extras_add_avatar_r2_key.sql` — ALTER migration
- `supabase/migrations/20260506000003_delete_user_data_r2_enqueue.sql` — GDPR queue + RPC update
- TR-tadaify-007 — profile_extras shared contract (base table owned by tadaify-app#139)
- DEC-310=B — 4-issue split; avatar upload is F-ONBOARDING-001c
- DEC-329=A — one TR with N acceptance bullets
- tadaify-app#138 — implementation issue
- tadaify-aws — separate infra story for R2 bucket + Worker binding (prod cutover)
