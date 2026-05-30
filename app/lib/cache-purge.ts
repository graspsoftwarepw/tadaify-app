/**
 * cache-purge — Cloudflare Cache Purge helper for public render path
 *
 * Single responsibility: after a creator mutates blocks, invalidate the
 * cached HTML for their public page (`tadaify.com/<handle>`) plus their
 * custom domain (if configured).
 *
 * Contract (TR-tadaify-010):
 *   - Helper is pure — accepts env explicitly, never reads module globals.
 *   - Graceful no-op when CF_API_TOKEN is missing or still the placeholder
 *     `CHANGE_ME_VIA_WRANGLER_SECRET` (local dev or unconfigured environment).
 *   - Never throws. Callers MAY ignore the return value; the CRUD response
 *     to the creator MUST succeed even if cache purge fails.
 *   - On 4xx/5xx from the Cloudflare API, returns ok=false with the status
 *     embedded in `reason`. The caller logs separately.
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: BR-BLOCK-RENDER-005, TR-tadaify-010
 */

export interface CachePurgeEnv {
  CF_ZONE_ID?: string;
  CF_API_TOKEN?: string;
}

export interface CachePurgeResult {
  ok: boolean;
  reason?: string;
}

const CF_PLACEHOLDER_TOKEN = "CHANGE_ME_VIA_WRANGLER_SECRET";
const PUBLIC_ORIGIN = "https://tadaify.com";

/**
 * Purge the Cloudflare edge cache for a single creator handle (and optional
 * custom domain). Returns ok=true on a successful CF API response, ok=false
 * with `reason` otherwise. Never throws.
 *
 * The graceful no-op path (token missing / placeholder / zone missing) is the
 * expected steady state in local dev and CI — those environments do not own
 * a Cloudflare zone, so attempting a real purge would produce noise without
 * value.
 */
export async function purgeCacheForHandle(
  handle: string,
  customDomain: string | undefined,
  env: CachePurgeEnv | undefined,
): Promise<CachePurgeResult> {
  const token = env?.CF_API_TOKEN;
  const zone = env?.CF_ZONE_ID;

  if (!token || token === CF_PLACEHOLDER_TOKEN || !zone) {
    console.warn(
      "[cache-purge] CF_API_TOKEN or CF_ZONE_ID missing — no-op",
    );
    return { ok: false, reason: "token_missing" };
  }

  const files: string[] = [`${PUBLIC_ORIGIN}/${handle}`];
  if (customDomain && customDomain.trim() !== "") {
    files.push(`https://${customDomain}/`);
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      },
    );

    if (!res.ok) {
      console.warn(`[cache-purge] CF API ${res.status}`);
      return { ok: false, reason: `cf_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.warn("[cache-purge] fetch threw", err);
    return { ok: false, reason: "fetch_threw" };
  }
}
