/**
 * GET /:handle — public creator page (SSR via Cloudflare Worker)
 *
 * Reads `pages` + `blocks` + `profiles` (+ `profile_extras` for avatar) from
 * Supabase via service-role and renders cookieless HTML for the visitor.
 * Per DEC-376=D this response is served from Cloudflare's CDN edge cache
 * (`Cache-Control: public, max-age=3600, s-maxage=3600`).
 *
 * Visual contract (mockup `mockups/tadaify-mvp/creator-public.html`):
 *   left-rail identity (avatar + display_name + bio) + right-rail block list.
 *   Per-block-type render markup is OUT OF SCOPE for this story (issue #202);
 *   each block renders via the registry default = `<article data-block-type
 *   data-block-id />`. Per-type stories (F-BLOCK-LINK, etc.) register their
 *   own markup.
 *
 * Privacy: no `Set-Cookie` on any 2xx response (BR-BLOCK-RENDER-003). No
 *          client JS required for first paint.
 *
 * Cache TTL ladder:
 *   200  → public, max-age=3600, s-maxage=3600 (TR-tadaify-009)
 *   301  → public, max-age=3600, s-maxage=3600 (canonical redirect — cheap to cache)
 *   404  → public, max-age=300,  s-maxage=300  (shorter so newly-claimed
 *          handles surface within 5 min — ECN-RENDER-02)
 *   500  → no-store                            (ECN-RENDER-09)
 *
 * Cloudflare `cf: { cacheTtl, cacheEverything }` options: React Router 7
 * does not expose a typed pass-through for CF-specific Response init
 * properties. The Cache-Control header above is the contractual public
 * signal; Cloudflare honours the `s-maxage` directive for edge TTL without
 * needing the `cf` object. (If we later need per-route `cacheEverything`,
 * we'll lift that into the workers entry — for now we keep it inline.)
 *
 * Story: F-BLOCK-INFRA-PUBLIC-RENDER-001 (tadaify-app#202)
 * Covers: BR-BLOCK-RENDER-001..005, TR-tadaify-009, ECN-RENDER-01/02/03/09
 */

import type { ReactNode } from "react";
import { redirect, isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/$handle";
import { fetchPublishedPage, type PublishedPageBundle } from "~/lib/public-page-query";
import { getBlockRenderer } from "~/lib/block-render-registry";
import { buildAvatarPreviewUrl } from "~/routes/api.avatar.$key";

// ── Cache headers ─────────────────────────────────────────────────────────────

export const CACHE_CONTROL_200 = "public, max-age=3600, s-maxage=3600";
export const CACHE_CONTROL_404 = "public, max-age=300, s-maxage=300";
export const CACHE_CONTROL_500 = "no-store";

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function getEnv(context: unknown): WorkerEnv {
  return (
    (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {}
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────

export interface LoaderData {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  pageTitle: string;
  blocks: PublishedPageBundle["blocks"];
}

export async function loader({
  params,
  context,
}: Route.LoaderArgs): Promise<Response> {
  const handleRaw = params.handle ?? "";

  // ECN-RENDER-01 — case-mismatch → 301 to canonical lowercase URL.
  const handleLower = handleRaw.toLowerCase();
  if (handleRaw !== handleLower) {
    return redirect(`/${handleLower}`, {
      status: 301,
      headers: { "Cache-Control": CACHE_CONTROL_200 },
    });
  }

  const env = getEnv(context);

  let bundle: PublishedPageBundle | null;
  try {
    bundle = await fetchPublishedPage(handleLower, env);
  } catch (err) {
    // ECN-RENDER-09: DB error → 500 with no-store.
    console.error("[public-render] fetchPublishedPage threw", err);
    throw new Response("Internal error", {
      status: 500,
      headers: { "Cache-Control": CACHE_CONTROL_500 },
    });
  }

  if (!bundle) {
    // ECN-RENDER-02: not-found OR unpublished → 404 (no info-leak between
    // the two cases — same status, same body, same cache TTL).
    throw new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": CACHE_CONTROL_404 },
    });
  }

  const data: LoaderData = {
    handle: bundle.profile.handle,
    displayName: bundle.profile.display_name ?? bundle.profile.handle,
    bio: bundle.profile.bio ?? "",
    avatarUrl: bundle.profile.avatar_r2_key
      ? buildAvatarPreviewUrl(bundle.profile.avatar_r2_key)
      : null,
    pageTitle: bundle.page.title,
    blocks: bundle.blocks,
  };

  return Response.json(data, {
    status: 200,
    headers: {
      "Cache-Control": CACHE_CONTROL_200,
      // NO Set-Cookie — BR-BLOCK-RENDER-003 (privacy-first).
    },
  });
}

// ── Meta (Open Graph + Twitter Card) ──────────────────────────────────────────

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Page not found · tadaify" }];
  }
  const { handle, displayName, bio, avatarUrl } = data as LoaderData;
  const url = `https://tadaify.com/${handle}`;
  const title = `${displayName} · tadaify.com/${handle}`;
  const description = bio || `${displayName} on tadaify.`;

  const tags: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (avatarUrl) {
    tags.push({ property: "og:image", content: avatarUrl });
    tags.push({ name: "twitter:image", content: avatarUrl });
  }
  return tags;
}

// ── Component ─────────────────────────────────────────────────────────────────

function Avatar({
  src,
  alt,
  fallbackInitials,
}: {
  src: string | null;
  alt: string;
  fallbackInitials: string;
}): ReactNode {
  if (src) {
    return (
      <div className="avatar">
        <img
          src={src}
          alt={alt}
          width={140}
          height={140}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      </div>
    );
  }
  return <div className="avatar">{fallbackInitials}</div>;
}

function computeInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PublicCreatorPage({
  loaderData,
}: Route.ComponentProps): ReactNode {
  const { handle, displayName, bio, avatarUrl, blocks } = loaderData as LoaderData;

  return (
    <div className="creator-shell">
      <aside className="identity">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          fallbackInitials={computeInitials(displayName)}
        />
        <h1 className="name">{displayName}</h1>
        {bio ? <p className="bio">{bio}</p> : null}
        <p className="handle-pill" aria-label="creator handle">
          tadaify.com/{handle}
        </p>
      </aside>
      <section className="blocks" aria-label="creator blocks">
        {blocks.map((block) => {
          const renderer = getBlockRenderer(block.block_type);
          return <PublicBlockSlot key={block.id} block={block} renderer={renderer} />;
        })}
      </section>
    </div>
  );
}

function PublicBlockSlot({
  block,
  renderer,
}: {
  block: PublishedPageBundle["blocks"][number];
  renderer: ReturnType<typeof getBlockRenderer>;
}): ReactNode {
  return <>{renderer(block)}</>;
}

// ── ErrorBoundary (branded 404 + 500) ─────────────────────────────────────────

export function ErrorBoundary(): ReactNode {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="not-found" role="main">
        <h1>Page not found</h1>
        <p>
          We couldn&apos;t find a tadaify creator at this address. The handle may
          not exist yet, or the creator hasn&apos;t published their page.
        </p>
        <p>
          <a href="/">Back to tadaify</a>
        </p>
      </main>
    );
  }
  return (
    <main className="render-error" role="main">
      <h1>Something went wrong</h1>
      <p>We hit an unexpected error rendering this page. Please try again.</p>
      <p>
        <a href="/">Back to tadaify</a>
      </p>
    </main>
  );
}
