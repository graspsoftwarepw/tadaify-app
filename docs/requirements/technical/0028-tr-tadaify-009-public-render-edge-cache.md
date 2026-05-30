# TR-tadaify-009 — Public-render edge cache contract

**Level:** MUST
**Introduced:** F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
**Status:** accepted
**Related:** TR-tadaify-010 (cache purge on CRUD), DEC-376=D

## Context

The visitor render path (`tadaify.com/<handle>`) is the most-frequently-hit
surface in the product. Hitting Supabase on every visitor visit would
saturate the database under load and add 100–300 ms of latency that buyers
in particular cannot tolerate (visitor → checkout funnel). DEC-376=D
selected Cloudflare's CDN edge cache as the layer that absorbs visitor
traffic; the Worker only runs on cache miss.

## Decision

### Cache-Control headers on the Worker response

The Worker route `app/routes/$handle.tsx` MUST emit these headers based on
status:

| Status | `Cache-Control`                                  | Rationale                                                                 |
|-------:|--------------------------------------------------|---------------------------------------------------------------------------|
|    200 | `public, max-age=3600, s-maxage=3600`            | 1 h edge TTL — purge on mutation keeps freshness; visitor browsers cache too |
|    301 | `public, max-age=3600, s-maxage=3600`            | Canonical lowercase redirect (ECN-RENDER-01) — cheap to cache              |
|    404 | `public, max-age=300, s-maxage=300`              | Shorter TTL so newly-claimed handles surface within 5 min (ECN-RENDER-02)  |
|    500 | `no-store`                                       | Never cache an error (ECN-RENDER-09)                                       |

### No `Set-Cookie` on 2xx responses

Visitor responses MUST NOT include `Set-Cookie` (BR-BLOCK-RENDER-003 —
privacy-first; see `feedback_tadaify_privacy_first_no_tracking_creators.md`).
This also keeps the response cacheable: Cloudflare bypasses the cache for
responses with `Set-Cookie` by default.

### Cache key

Cache key = full URL (handle + query string). The route does not vary on
cookies, headers, or auth (there is no auth on this path). Query strings
are part of the cache key by default; if/when we add UTM-stripping we'll
add a `cf.cacheKey` override at the workers entry layer.

### `cf: { cacheTtl, cacheEverything }` (deferred)

The original arch plan called for setting Cloudflare-specific `cf` options
on the Response init. React Router 7 does not expose a typed pass-through
for those properties, and Cloudflare honours `s-maxage` for edge TTL
without requiring the `cf` object. We therefore rely solely on the
`Cache-Control` header in this slice. If a future slice needs
`cacheEverything: true` (e.g. to force-cache `Set-Cookie`-bearing
responses, which this route does NOT emit), it MUST be applied in the
workers entry (`workers/app.ts`) rather than inline in the route.

## Verification

- Unit: `app/routes/$handle.test.tsx` asserts the header constants on 200 and 404.
- Local Playwright: `e2e/public-render.spec.ts` S1/S5/S6/S7/S8 — Cache-Control
  presence is exercised but `cf-cache-status` is **not** asserted locally
  (no edge in front of the dev server).
- Production: S3/S4 acceptance via `curl -I https://tadaify.com/<handle>`
  showing `cache-control` + `cf-cache-status: MISS|HIT` after the CF zone
  is configured.

## Out of scope

- Per-block-type render markup
- Custom-domain canonical handling (will need a `vary` strategy when added)
- Stale-while-revalidate (not required at this scale; would need an explicit
  `s-maxage` + `stale-while-revalidate` ladder)
