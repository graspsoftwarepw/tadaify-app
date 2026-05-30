/**
 * public-page-query — read a creator's published page + blocks by handle.
 *
 * Uses Supabase REST as service-role (RLS-bypass acceptable because the
 * Worker filters published_at IS NOT NULL + is_visible = true server-side,
 * matching the existing pattern used by app/routes/api.blocks.*.ts).
 *
 * Note vs the arch plan in #202 comment 4582393551: the plan sketched the
 * query as one PostgREST embedded-select call against a `published` boolean
 * column. The actual schema (supabase/migrations/20260503000001) uses
 * `published_at timestamptz` (NULL = drafted) + a separate `profile_extras`
 * table for `avatar_r2_key`. We therefore issue three small REST calls and
 * filter/sort in memory. The cross-call cost is dominated by the in-network
 * round trip to Supabase; ≤50 blocks per page keeps the in-memory work
 * negligible.
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: BR-BLOCK-RENDER-001, BR-BLOCK-RENDER-002, ECN-RENDER-01/02/03,
 *         TR-tadaify-009 (data path side)
 */

export interface PublishedProfile {
  user_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_r2_key: string | null;
}

export interface PublishedPage {
  id: string;
  user_id: string;
  title: string;
}

export interface PublishedBlock {
  id: string;
  block_type: string;
  title: string;
  url: string | null;
  position: number;
  is_visible: boolean;
  meta: unknown;
}

export interface PublishedPageBundle {
  profile: PublishedProfile;
  page: PublishedPage;
  blocks: PublishedBlock[];
}

export interface PublicPageQueryEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Fetch a creator's published homepage by handle.
 *
 * Returns:
 *   - `null` if the handle does not exist, the user has no homepage, or the
 *     homepage is unpublished. The caller renders 404 (no info leak between
 *     "no such handle" and "drafted" per ECN-RENDER-02).
 *   - `PublishedPageBundle` otherwise. `blocks` is already filtered to
 *     is_visible=true and sorted by position ASC.
 *
 * Handle MUST be lowercased by the caller before invocation; the function
 * does not re-normalize. (The route handler is the canonical
 * lowercase-redirect point — ECN-RENDER-01.)
 */
export async function fetchPublishedPage(
  handle: string,
  env: PublicPageQueryEnv,
): Promise<PublishedPageBundle | null> {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Server misconfigured: SUPABASE_URL or service-role key missing");
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Accept: "application/json",
  } as const;

  // 1. Profile by handle.
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?handle=eq.${encodeURIComponent(handle)}&select=id,handle,display_name,bio&limit=1`,
    { headers },
  );
  if (!profileRes.ok) {
    throw new Error(`Supabase profiles lookup failed: ${profileRes.status}`);
  }
  const profileRows = (await profileRes.json()) as Array<{
    id: string;
    handle: string;
    display_name: string | null;
    bio: string | null;
  }>;
  if (profileRows.length === 0) {
    return null;
  }
  const profileRow = profileRows[0];

  // 2. Published homepage for this user.
  // `is.not.null` is the PostgREST encoding for `IS NOT NULL`.
  const pageRes = await fetch(
    `${SUPABASE_URL}/rest/v1/pages?user_id=eq.${encodeURIComponent(profileRow.id)}&is_homepage=eq.true&published_at=not.is.null&select=id,user_id,title&limit=1`,
    { headers },
  );
  if (!pageRes.ok) {
    throw new Error(`Supabase pages lookup failed: ${pageRes.status}`);
  }
  const pageRows = (await pageRes.json()) as Array<{
    id: string;
    user_id: string;
    title: string;
  }>;
  if (pageRows.length === 0) {
    // ECN-RENDER-02: unpublished page → 404, NOT 403.
    return null;
  }
  const pageRow = pageRows[0];

  // 3. Profile extras (avatar_r2_key) — optional; absence is fine.
  const extrasRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profile_extras?user_id=eq.${encodeURIComponent(profileRow.id)}&select=avatar_r2_key&limit=1`,
    { headers },
  );
  let avatarR2Key: string | null = null;
  if (extrasRes.ok) {
    const extrasRows = (await extrasRes.json()) as Array<{
      avatar_r2_key: string | null;
    }>;
    if (extrasRows.length > 0) {
      avatarR2Key = extrasRows[0].avatar_r2_key ?? null;
    }
  }
  // Don't fail render on extras lookup error — avatar is decorative.

  // 4. Blocks for the page.
  const blocksRes = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?page_id=eq.${encodeURIComponent(pageRow.id)}&select=id,block_type,title,url,position,is_visible,meta&order=position.asc`,
    { headers },
  );
  if (!blocksRes.ok) {
    throw new Error(`Supabase blocks lookup failed: ${blocksRes.status}`);
  }
  const blockRows = (await blocksRes.json()) as PublishedBlock[];

  // Post-filter is_visible=true (defense in depth — server-side filter
  // could be done via &is_visible=eq.true but doing it in memory keeps the
  // query shape uniform with the per-position-sort path and avoids two
  // PostgREST quirks at once).
  const visibleBlocks = blockRows
    .filter((b) => b.is_visible === true)
    .sort((a, b) => a.position - b.position);

  return {
    profile: {
      user_id: profileRow.id,
      handle: profileRow.handle,
      display_name: profileRow.display_name,
      bio: profileRow.bio,
      avatar_r2_key: avatarR2Key,
    },
    page: {
      id: pageRow.id,
      user_id: pageRow.user_id,
      title: pageRow.title,
    },
    blocks: visibleBlocks,
  };
}
