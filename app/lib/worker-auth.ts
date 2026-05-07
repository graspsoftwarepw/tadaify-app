/**
 * Shared auth helpers for Cloudflare Worker API routes.
 *
 * Provides:
 *   - extractAccessToken(request): extracts JWT from Authorization header or
 *     Supabase sb-*-auth-token cookie
 *   - resolveUserId(token, supabaseUrl, serviceKey): validates token via
 *     Supabase /auth/v1/user and returns user.id
 *
 * Pattern matches api.account.dismiss-welcome.ts + api.upload.avatar.ts.
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 */

/**
 * Extract the Supabase access token from the request.
 * Prefers Authorization: Bearer <token>; falls back to sb-*-auth-token cookie.
 */
export function extractAccessToken(request: Request): string | null {
  const auth = request.headers.get("Authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);

  const cookieHeader = request.headers.get("Cookie") ?? "";
  for (const pair of cookieHeader.split(";").map((c) => c.trim())) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx < 0) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed?.access_token) return parsed.access_token as string;
      } catch {
        // Not JSON; skip
      }
    }
  }
  return null;
}

/**
 * Validate the access token against Supabase /auth/v1/user.
 * Returns the authenticated user's id on success, or null on failure.
 *
 * Uses serviceKey as apikey (header requirement) and the caller's access_token
 * as the Authorization bearer — this is the standard Supabase pattern for
 * server-side JWT validation.
 */
export async function resolveUserId(
  accessToken: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<string | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}
