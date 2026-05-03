/**
 * POST /api/account/dismiss-welcome
 *
 * Persist welcome banner dismissal for the authenticated user. Called by the
 * client-side dismiss button on the /app dashboard so the next SSR loader
 * sees `account_settings.welcome_dismissed = true` and does not re-render
 * the banner.
 *
 * Story: F-APP-DASHBOARD-001a (#171). Without this endpoint AC#11 / ECN-26a-06
 * would silently regress — local state hides the banner until reload, then
 * SSR re-fetches from DB and re-renders it.
 *
 * Auth:    sb-*-auth-token cookie (same scheme as /app loader).
 * Request: empty body.
 * Response: { ok: true } on success; 401 on missing auth; 500 on env misconfig.
 */

import type { Route } from "./+types/api.account.dismiss-welcome";

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function extractAccessToken(request: Request): string | null {
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

  // Resolve userId from access_token via Supabase /auth/v1/user
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!userRes.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = (await userRes.json()) as { id?: string };
  if (!user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert welcome_dismissed=true into account_settings
  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/account_settings`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: user.id, welcome_dismissed: true }),
  });
  if (!upsertRes.ok) {
    const text = await upsertRes.text();
    return Response.json(
      { error: "Persist failed", detail: text },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
