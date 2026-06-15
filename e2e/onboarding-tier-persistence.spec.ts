/**
 * Module: ONBOARDING
 * Covers: BR-ONBOARDING-005, TR-tadaify-004
 * Story: #139
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright test suite: onboarding tier-step persistence + profile_extras
 *
 * Story: F-ONBOARDING-001d (#139)
 * Covers: TR-tadaify-007 + TR-tadaify-004 + ECN-139-01..07
 *
 * S1 — happy path: complete wizard → profile_extras.tier_slug='free'
 * S2 — URL tier param tampering ignored (always free) — ECN-139-01
 * S3 — RLS denies cross-user read — ECN-139-05
 * S4 — GDPR delete cascades profile_extras row — ECN-139-06
 * S5 — GDPR export includes tier_slug in JSON payload — ECN-139-07
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with env-setup reliability fix (#168)
 *   - `.dev.vars` populated via `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:44200)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY exported in env
 *   - SUPABASE_ANON_KEY exported for S3 cross-user REST test
 *
 * Run: npx playwright test e2e/onboarding-tier-persistence.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ── Env / constants ───────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:44210";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const APP_URL = "http://localhost:44200";

/** Password used for all seeded test accounts */
const TEST_PASSWORD = "TestPass123!";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Service-role REST helper: runs a raw query and returns parsed JSON.
 */
async function serviceRoleGet(path: string): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`serviceRoleGet ${path} → ${res.status}`);
  return res.json();
}

/**
 * Creates a confirmed auth user via service-role Admin API.
 * Returns the user_id.
 */
async function createTestUser(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createTestUser failed ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

/**
 * Signs in the test user via password flow (anon key).
 * Returns the access_token.
 */
async function signInUser(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY || SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`signInUser failed ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Deletes all test users whose emails start with the given prefix (cleanup).
 * Uses the Admin API (/auth/v1/admin/users) — NOT the PostgREST auth.users table.
 */
async function cleanupUsersByEmailPrefix(prefix: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) return;
  try {
    // List users via Admin API (paginated, but test volumes are small)
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (!listRes.ok) {
      console.warn("[cleanup] Admin user list failed:", listRes.status);
      return;
    }
    const data = (await listRes.json()) as { users?: Array<{ id: string; email?: string }> };
    const users = (data.users ?? []).filter(
      (u) => u.email && u.email.startsWith(prefix),
    );
    for (const u of users) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
    }
  } catch (e) {
    console.warn("[cleanup] user cleanup failed:", e);
  }
}

/**
 * Navigates a Playwright page through the full onboarding wizard and submits
 * the tier step. The user must already be authenticated (session cookie set).
 *
 * The tier-step action performs the DB write via the auth cookie. For wizard
 * navigation we use direct URL navigation to each step (pre-auth wizard is
 * stateless URL params).
 */
async function completeWizardAndTierStep(
  page: Page,
  handle: string,
): Promise<void> {
  // Navigate directly to tier step with complete URL state (per wizard URL contract)
  await page.goto(
    `${APP_URL}/onboarding/tier?handle=${handle}&name=TierTest&bio=&av=&tpl=chopin&platforms=instagram&socials=%7B%7D`,
  );

  // Wait for tier comparison grid to load
  await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

  // Click CTA "Take me to my dashboard →"
  const ctaBtn = page.locator("button[type='submit']");
  await expect(ctaBtn).toBeVisible({ timeout: 5_000 });
  await ctaBtn.click();

  // Wait for redirect to /app (DEC-366=A) — auth gate will redirect to /login if no session
  await page.waitForURL(/\/(app|login)/, { timeout: 10_000 });
}

/**
 * Injects a Supabase auth session cookie into the Playwright browser context.
 */
async function injectSession(page: Page, accessToken: string): Promise<void> {
  await page.context().addCookies([
    {
      name: `sb-ihnvcuhabtzaxkdzjhhy-auth-token`,
      value: encodeURIComponent(
        JSON.stringify({ access_token: accessToken, token_type: "bearer" }),
      ),
      domain: "localhost",
      path: "/",
    },
  ]);
}

// ── S1: happy path — profile_extras.tier_slug='free' written ─────────────────

test("S1 — happy path: complete wizard → profile_extras.tier_slug='free' in DB", async ({
  page,
}) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S1");

  const email = "test-t139s1@local.test";
  const handle = "t139s1";
  let userId: string;

  try {
    userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    await injectSession(page, accessToken);

    await completeWizardAndTierStep(page, handle);

    // Verify DB row was written
    const rows = (await serviceRoleGet(
      `profile_extras?user_id=eq.${userId}&select=tier_slug`,
    )) as Array<{ tier_slug: string }>;

    expect(rows.length).toBe(1);
    expect(rows[0].tier_slug).toBe("free");
  } finally {
    await cleanupUsersByEmailPrefix("test-t139s1");
  }
});

// ── S2: URL tier param tampering ignored ──────────────────────────────────────

test("S2 — tier param tampering ignored: ?tier=premium in URL → DB writes 'free'", async ({
  page,
}) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S2");

  const email = "test-t139s2@local.test";
  const handle = "t139s2";
  let userId: string;

  try {
    userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    await injectSession(page, accessToken);

    // Navigate to tier step with tampered ?tier=premium param
    await page.goto(
      `${APP_URL}/onboarding/tier?handle=${handle}&name=TierTest&bio=&av=&tpl=chopin&platforms=instagram&socials=%7B%7D&tier=premium`,
    );
    await expect(page.getByText(/your starting plan/i)).toBeVisible({ timeout: 10_000 });

    const ctaBtn = page.locator("button[type='submit']");
    await ctaBtn.click();
    await page.waitForURL(/\/(app|login)/, { timeout: 10_000 });

    // Action MUST have written 'free', not 'premium'
    const rows = (await serviceRoleGet(
      `profile_extras?user_id=eq.${userId}&select=tier_slug`,
    )) as Array<{ tier_slug: string }>;

    expect(rows.length).toBe(1);
    expect(rows[0].tier_slug).toBe("free");
    expect(rows[0].tier_slug).not.toBe("premium");
  } finally {
    await cleanupUsersByEmailPrefix("test-t139s2");
  }
});

// ── S3: RLS denies cross-user read ────────────────────────────────────────────

test("S3 — RLS denies cross-user read: user B cannot see user A tier_slug", async ({
  page,
}) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S3");

  const emailA = "test-t139s3a@local.test";
  const emailB = "test-t139s3b@local.test";
  const handleA = "t139s3a";

  try {
    const userAId = await createTestUser(emailA);
    await createTestUser(emailB);

    // Complete wizard as user A (writes profile_extras row)
    const tokenA = await signInUser(emailA);
    await injectSession(page, tokenA);
    await completeWizardAndTierStep(page, handleA);

    // Verify user A's row exists via service-role
    const rowsA = (await serviceRoleGet(
      `profile_extras?user_id=eq.${userAId}&select=tier_slug`,
    )) as Array<{ tier_slug: string }>;
    expect(rowsA.length).toBe(1);

    // Now sign in as user B and try to read user A's row via anon REST
    const tokenB = await signInUser(emailB);
    const rlsCheckRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profile_extras?user_id=eq.${userAId}&select=tier_slug`,
      {
        headers: {
          apikey: ANON_KEY || SERVICE_ROLE_KEY,
          Authorization: `Bearer ${tokenB}`,
        },
      },
    );
    const rlsRows = (await rlsCheckRes.json()) as unknown[];
    // RLS USING clause filters to own row → returns 0 rows
    expect(rlsRows.length).toBe(0);

    // User B can still read their OWN row (if it exists)
    // (They haven't completed onboarding so no row expected — just verify 0 cross-read)
  } finally {
    await cleanupUsersByEmailPrefix("test-t139s3");
  }
});

// ── S4: GDPR delete cascades profile_extras row ───────────────────────────────

test("S4 — GDPR delete cascades profile_extras: delete_user_data() removes row", async ({
  page,
}) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S4");

  const email = "test-t139s4@local.test";
  const handle = "t139s4";

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    await injectSession(page, accessToken);
    await completeWizardAndTierStep(page, handle);

    // Confirm row exists
    const before = (await serviceRoleGet(
      `profile_extras?user_id=eq.${userId}&select=tier_slug`,
    )) as Array<{ tier_slug: string }>;
    expect(before.length).toBe(1);

    // Trigger GDPR delete via service-role RPC (simulates Settings → Delete Account)
    // The ownership guard in delete_user_data() checks auth.uid() — service_role bypasses
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_user_data`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${accessToken}`, // User calls their own deletion
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_user_id: userId }),
    });
    // RPC may return 200 (void) or 204; 500 indicates failure
    expect(rpcRes.status).not.toBe(500);

    // profile_extras row must be gone (explicit DELETE in RPC)
    const afterRpc = (await serviceRoleGet(
      `profile_extras?user_id=eq.${userId}&select=tier_slug`,
    )) as unknown[];
    expect(afterRpc.length).toBe(0);

    // Also verify FK cascade: insert a fresh row and test auth.users DELETE
    const cascadeId = await createTestUser("test-t139s4cascade@local.test");

    {
      // Insert profile_extras row directly via service_role
      await fetch(`${SUPABASE_URL}/rest/v1/profile_extras`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id: cascadeId, tier_slug: "free" }),
      });

      // Delete auth.users row — CASCADE must remove profile_extras
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${cascadeId}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });

      const afterCascade = (await serviceRoleGet(
        `profile_extras?user_id=eq.${cascadeId}&select=tier_slug`,
      )) as unknown[];
      expect(afterCascade.length).toBe(0);
    }
  } finally {
    await cleanupUsersByEmailPrefix("test-t139s4");
  }
});

// ── S5: GDPR export includes tier_slug ────────────────────────────────────────

test("S5 — GDPR export: user-export-data Edge Function returns tier_slug='free'", async ({
  page,
}) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S5");

  const email = "test-t139s5@local.test";
  const handle = "t139s5";

  try {
    await createTestUser(email);
    const accessToken = await signInUser(email);
    await injectSession(page, accessToken);
    await completeWizardAndTierStep(page, handle);

    // Call the Edge Function (local: http://127.0.0.1:44210/functions/v1/user-export-data)
    const edgeFnUrl = `${SUPABASE_URL}/functions/v1/user-export-data`;
    const exportRes = await fetch(edgeFnUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: ANON_KEY || SERVICE_ROLE_KEY,
      },
    });

    // Edge function must be deployed when SERVICE_ROLE_KEY is set (full local env).
    // 404/503 = missing deployment → test failure, not a silent skip.
    if (exportRes.status === 404 || exportRes.status === 503) {
      throw new Error(
        `S5: user-export-data Edge Function unavailable (${exportRes.status}). ` +
        `Deploy it via 'supabase functions serve' before running this test.`,
      );
    }

    expect(exportRes.status).toBe(200);

    const exportData = (await exportRes.json()) as Record<string, unknown>;
    // profile_extras key must be present (TR-tadaify-007 export contract)
    expect(exportData).toHaveProperty("profile_extras");
    const extras = exportData.profile_extras as { tier_slug?: string } | null;
    expect(extras?.tier_slug).toBe("free");
  } finally {
    await cleanupUsersByEmailPrefix("test-t139s5");
  }
});
