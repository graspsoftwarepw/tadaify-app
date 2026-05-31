/**
 * POST /api/account/pinned-message
 *
 * Persist the authenticated creator's pinned announcement
 * (`account_settings.pinned_message` + `pinned_enabled`). Called by the
 * dashboard's pinned-message row (HomepagePanel) so the message + on/off state
 * survive a reload and render on the public page.
 *
 * Auth:    sb-*-auth-token cookie (same scheme as the /app loader), resolved
 *          via worker-auth.
 * Request: JSON { pinned_enabled: boolean, pinned_message?: string }
 * Response: { ok: true } on success; 400 on validation; 401 on missing auth;
 *           500 on env misconfig / persistence failure.
 *
 * Story: F-PINNED-001 (tadaify-app#56 follow-up).
 */

import type { Route } from "./+types/api.account.pinned-message";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/** Mirrors the dashboard input maxLength + the DB CHECK constraint. */
export const PINNED_MESSAGE_MAX_LENGTH = 80;

interface PinnedUpdate {
  pinned_enabled: boolean;
  pinned_message: string | null;
}

export function validatePinnedBody(
  body: unknown,
): { ok: true; data: PinnedUpdate } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.pinned_enabled !== "boolean") {
    return { ok: false, error: "pinned_enabled must be a boolean" };
  }

  let pinned_message: string | null = null;
  if (b.pinned_message !== undefined && b.pinned_message !== null) {
    if (typeof b.pinned_message !== "string") {
      return { ok: false, error: "pinned_message must be a string" };
    }
    const msg = b.pinned_message.trim();
    if (msg.length > PINNED_MESSAGE_MAX_LENGTH) {
      return {
        ok: false,
        error: `pinned_message must be ${PINNED_MESSAGE_MAX_LENGTH} characters or fewer`,
      };
    }
    pinned_message = msg.length > 0 ? msg : null;
  }

  return { ok: true, data: { pinned_enabled: b.pinned_enabled, pinned_message } };
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

  const validated = validatePinnedBody(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const userId = await resolveUserId(accessToken, supabaseUrl, serviceKey);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert into account_settings (merge-duplicates so a row is created on first
  // use, matching the dismiss-welcome endpoint).
  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/account_settings`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId,
      pinned_enabled: validated.data.pinned_enabled,
      pinned_message: validated.data.pinned_message,
    }),
  });

  if (!upsertRes.ok) {
    const detail = await upsertRes.text();
    return Response.json({ error: "Persist failed", detail }, { status: 500 });
  }

  return Response.json({ ok: true });
}
