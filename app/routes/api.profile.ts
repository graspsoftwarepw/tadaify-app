/**
 * @module APP-SETTINGS
 * @covers TR-tadaify-007
 * POST /api/profile
 *
 * Persist the authenticated creator's editable identity fields
 * (`display_name`, `bio`) to the `profiles` table. Called by the dashboard's
 * inline profile editor (HomepagePanel) so edits survive a reload instead of
 * living only in local state.
 *
 * Only `display_name` and `bio` are writable here — both are existing
 * `profiles` columns (confirmed via `app/lib/public-page-query.ts`, which
 * selects them for the public page). `pronouns` has NO column and is therefore
 * NOT persisted (the editor keeps it as a local-only field until a schema
 * migration adds storage).
 *
 * Auth:    sb-*-auth-token cookie (same scheme as the /app loader + other
 *          /api routes), resolved via worker-auth.
 * Request: JSON { display_name?: string, bio?: string } — partial update; only
 *          provided keys are written.
 * Response: { ok: true, profile } on success; 400 on validation; 401 on missing
 *          auth; 500 on env misconfig / persistence failure.
 *
 * Story: F-PROFILE-SAVE-001 (tadaify-app#56 follow-up).
 */

import type { Route } from "./+types/api.profile";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/** Bio limit mirrors the dashboard editor's `maxLength={80}` + counter. */
export const BIO_MAX_LENGTH = 80;
/** Defensive cap for display name (no explicit UI limit; keep it sane). */
export const DISPLAY_NAME_MAX_LENGTH = 80;

interface ProfileUpdate {
  display_name?: string | null;
  bio?: string | null;
}

export function validateProfileBody(
  body: unknown,
): { ok: true; data: ProfileUpdate } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;
  const data: ProfileUpdate = {};

  if ("display_name" in b) {
    if (typeof b.display_name !== "string") {
      return { ok: false, error: "display_name must be a string" };
    }
    const name = b.display_name.trim();
    if (name.length > DISPLAY_NAME_MAX_LENGTH) {
      return { ok: false, error: `display_name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer` };
    }
    // Empty display name → null (public page falls back to the handle).
    data.display_name = name.length > 0 ? name : null;
  }

  if ("bio" in b) {
    if (typeof b.bio !== "string") {
      return { ok: false, error: "bio must be a string" };
    }
    const bio = b.bio.trim();
    if (bio.length > BIO_MAX_LENGTH) {
      return { ok: false, error: `bio must be ${BIO_MAX_LENGTH} characters or fewer` };
    }
    data.bio = bio.length > 0 ? bio : null;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "At least one of display_name or bio must be provided" };
  }
  return { ok: true, data };
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateProfileBody(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const userId = await resolveUserId(accessToken, supabaseUrl, serviceKey);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patchRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(validated.data),
    },
  );

  if (!patchRes.ok) {
    const detail = await patchRes.text();
    return Response.json({ error: "Persist failed", detail }, { status: 500 });
  }

  const rows = (await patchRes.json().catch(() => null)) as unknown;
  const profile = Array.isArray(rows) ? rows[0] : rows;
  return Response.json({ ok: true, profile });
}
