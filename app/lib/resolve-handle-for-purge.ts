/**
 * resolve-handle-for-purge — service-role lookup of a creator's handle.
 *
 * Helper for the block CRUD endpoints' cache-purge hook (TR-tadaify-010).
 * Uses the service-role key so the lookup succeeds regardless of the
 * caller's RLS context. Returns `null` on any error — purge failures must
 * never break the CRUD response.
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 */

export async function resolveHandleForUser(
  userId: string,
  supabaseUrl: string,
  serviceKey: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=handle&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ handle: string }>;
    return rows[0]?.handle ?? null;
  } catch {
    return null;
  }
}
