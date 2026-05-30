# TR-tadaify-010 — Cache purge on block CRUD

**Level:** MUST
**Introduced:** F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
**Status:** accepted
**Related:** TR-tadaify-009 (edge cache contract), tadaify-app#199

## Context

Once a creator's public page is in Cloudflare's edge cache (`s-maxage=3600`,
per TR-tadaify-009), a block save would otherwise take up to an hour to
become visible to buyers. The visitor experience must show creator edits
within seconds, so every successful block mutation MUST trigger a targeted
cache purge for that creator's URL.

The 5 block CRUD endpoints from tadaify-app#199 (F-BLOCK-INFRA-CRUD-001) are
the only mutation surfaces today: POST `/api/blocks`, PATCH/DELETE
`/api/blocks/:id`, POST `/api/blocks/:id/duplicate`, POST
`/api/blocks/reorder`. Each one MUST call the purge helper after a
successful database write.

## Decision

### Helper contract — `app/lib/cache-purge.ts`

```ts
purgeCacheForHandle(
  handle: string,
  customDomain: string | undefined,
  env: { CF_ZONE_ID?: string; CF_API_TOKEN?: string } | undefined,
): Promise<{ ok: boolean; reason?: string }>
```

Properties:

1. **Never throws.** Even on `fetch` rejection, returns `{ ok: false }`.
   Cache purge failure MUST NOT fail the user's save.
2. **Graceful no-op** when `CF_API_TOKEN` is missing or equals the
   placeholder `CHANGE_ME_VIA_WRANGLER_SECRET` (local dev, CI, or any
   environment without a CF zone configured). Returns
   `{ ok: false, reason: "token_missing" }`. Logs a `console.warn`.
3. **Purges `https://tadaify.com/<handle>`** always; appends
   `https://<customDomain>/` only if `customDomain` is a non-empty string.
4. **Returns `{ ok: false, reason: "cf_<status>" }`** on CF API 4xx/5xx.

### CRUD hook pattern

Each of the 5 endpoints (`app/routes/api.blocks.ts`,
`api.blocks.$id.ts`, `api.blocks.$id.duplicate.ts`, `api.blocks.reorder.ts`)
resolves the affected handle (via a join on `pages.user_id =
profiles.id`), then calls:

```ts
const handle = await resolveHandleForPurge(...);
if (handle) {
  void purgeCacheForHandle(handle, undefined, env).catch((e) =>
    console.error("[cache-purge] threw unexpectedly", e),
  );
}
```

The `void` is intentional — purge runs in the background; the response is
already on its way back to the creator's dashboard. The `.catch` is belt
and braces: the helper already promises not to throw, but a defence in
depth costs nothing.

Custom-domain purge is left undefined in this slice — the custom-domain
story (post-MVP) will fan-in the lookup and pass the value through. The
helper's signature is already ready for it.

### Env vars

- **`CF_ZONE_ID`** — public var in `wrangler.jsonc [vars]`. Empty string in
  the checked-in file; real value supplied per-environment in the
  Cloudflare Workers dashboard.
- **`CF_API_TOKEN`** — Worker secret, configured via
  `wrangler secret put CF_API_TOKEN` per environment. NEVER committed.
  Local dev uses the placeholder in `.dev.vars.example`, which the helper
  treats as "no token" (graceful no-op).

## Verification

- Unit: `app/lib/cache-purge.test.ts` — 5 cases: happy path, token missing,
  placeholder token, custom domain in URL list, CF API 4xx.
- Unit (CRUD): extensions to the existing `app/routes/api.blocks.*.test.ts`
  files assert that each handler calls `purgeCacheForHandle` after success
  with the creator's handle.
- Local Playwright: not exercised (cache purge needs a real CF zone; the
  helper no-ops in dev).
- Production smoke: post-deploy, save a block on a published page and
  re-fetch the public URL within ≤30 s; assert content updated.

## Out of scope

- Retry-on-failure (purge is fire-and-forget; the 1 h TTL is a hard upper
  bound on staleness).
- Purge for sibling URLs (custom domain handled when the feature ships).
- Push-based invalidation via Workers KV / Durable Objects (not needed at
  current scale).
