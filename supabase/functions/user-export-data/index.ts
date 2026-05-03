/**
 * user-export-data — GDPR Art. 20 data export.
 *
 * Returns ALL user-owned data as a JSON file for download.
 *
 * Tables covered (as of F-APP-DASHBOARD-001a, #171):
 *   - profiles
 *   - account_settings
 *   - pages
 *   - blocks
 *
 * Auth: requires Bearer JWT (user's own session token).
 * Runtime: Deno (Supabase Edge Runtime)
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * GDPR Art. 20 (Right to Data Portability)
 *
 * Codex P2 fix (PR #174): per-table Supabase errors are now propagated —
 * a read failure returns 500 with { error: "export_failed", failed_dataset }
 * instead of silently returning null/[] for the broken dataset.
 */

import { createClient, PostgrestError } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Error helper ─────────────────────────────────────────────────────────────

class ExportError extends Error {
  constructor(
    public readonly dataset: string,
    public readonly detail: string,
  ) {
    super(`export_failed: ${dataset} — ${detail}`);
    this.name = "ExportError";
  }
}

/**
 * Unwrap a Supabase query result, throwing ExportError on any read failure.
 * No internal DB details are forwarded to the response body.
 */
function unwrap<T>(
  name: string,
  res: { data: T | null; error: PostgrestError | null },
): T {
  if (res.error) {
    throw new ExportError(name, res.error.message);
  }
  return res.data as T;
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const jwt = authHeader.slice(7);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Create admin client to bypass RLS for data collection
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Verify the JWT and get user id
  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;

  // Collect data from all user-owned tables.
  // Any read failure returns 500 with the failing dataset name so the caller
  // knows the export is incomplete (Codex P2 fix, PR #174).
  try {
    const [profilesRes, settingsRes, pagesRes, blocksRes] = await Promise.all([
      adminClient.from("profiles").select("*").eq("id", userId),
      adminClient.from("account_settings").select("*").eq("id", userId),
      adminClient.from("pages").select("*").eq("user_id", userId),
      adminClient.from("blocks").select("*").eq("user_id", userId),
    ]);

    // Unwrap all four — throws ExportError on any failure
    const profiles = unwrap("profiles", profilesRes);
    const accountSettings = unwrap("account_settings", settingsRes);
    const pages = unwrap("pages", pagesRes);
    const blocks = unwrap("blocks", blocksRes);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      email: userData.user.email,
      profile: (profiles as unknown[])[0] ?? null,
      account_settings: (accountSettings as unknown[])[0] ?? null,
      pages: pages ?? [],
      blocks: blocks ?? [],
    };

    const filename = `tadaify-data-export-${userId.slice(0, 8)}-${Date.now()}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof ExportError) {
      return new Response(
        JSON.stringify({ error: "export_failed", failed_dataset: err.dataset }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }
    // Unexpected error — do not leak internals
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
});
