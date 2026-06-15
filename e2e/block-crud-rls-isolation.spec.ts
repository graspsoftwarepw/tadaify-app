/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, TR-tadaify-008
 * Story: #199
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S4 — Cross-user isolation: User A's blocks invisible to User B
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#6, ECN-CRUD-12
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:44200)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *
 * Run: npx playwright test e2e/block-crud-rls-isolation.spec.ts
 */

import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:44210";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const APP_URL = "http://localhost:44200";
const TEST_PASSWORD = "TestPass123!";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestUser(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: TEST_PASSWORD, email_confirm: true }),
  });
  if (!res.ok) throw new Error(`createTestUser ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { id: string }).id;
}

async function signInUser(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON_KEY || SERVICE_ROLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`signInUser ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function createProfile(userId: string, handle: string, email: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId, handle, email,
      tos_version: "v1", tier: "free",
      onboarding_completed_at: new Date().toISOString(),
    }),
  });
}

async function createPageWithBlocks(
  userId: string,
  blockCount = 2
): Promise<string> {
  const pageRes = await fetch(`${SUPABASE_URL}/rest/v1/pages`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ user_id: userId, title: "S4 Page", is_homepage: true }),
  });
  const [pg] = (await pageRes.json()) as Array<{ id: string }>;

  for (let i = 0; i < blockCount; i++) {
    await fetch(`${SUPABASE_URL}/rest/v1/blocks`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        page_id: pg.id, user_id: userId,
        block_type: "link", title: `User A Block ${i}`,
        url: `https://example.com/${i}`, position: i,
      }),
    });
  }

  return pg.id;
}

async function cleanupUsers(emails: string[]): Promise<void> {
  try {
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    const data = (await listRes.json()) as { users?: Array<{ id: string; email?: string }> };
    for (const u of (data.users ?? []).filter((u) => u.email && emails.includes(u.email))) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      });
    }
  } catch { /* ignore cleanup errors */ }
}

// ── S4 ────────────────────────────────────────────────────────────────────────

test("S4 — cross-user isolation: User B sees 0 blocks from User A's page", async ({ page }) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S4");

  const ts = Date.now();
  const emailA = `test-crud-s4-a-${ts}@local.test`;
  const emailB = `test-crud-s4-b-${ts}@local.test`;

  try {
    // Create user A with 2 blocks
    const userIdA = await createTestUser(emailA);
    await createProfile(userIdA, `crudS4a-${ts}`, emailA);
    const pageIdA = await createPageWithBlocks(userIdA, 2);

    // Create user B (no blocks)
    const userIdB = await createTestUser(emailB);
    await createProfile(userIdB, `crudS4b-${ts}`, emailB);
    // Create user B's own page so /app loads without error
    await fetch(`${SUPABASE_URL}/rest/v1/pages`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: userIdB, title: "S4 Page B", is_homepage: true }),
    });

    const tokenB = await signInUser(emailB);

    // Log in as user B
    await page.context().addCookies([{
      name: "sb-ihnvcuhabtzaxkdzjhhy-auth-token",
      value: encodeURIComponent(JSON.stringify({ access_token: tokenB, token_type: "bearer" })),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto(`${APP_URL}/app`);
    await page.waitForURL(/\/app/, { timeout: 10_000 });

    // User B should NOT see User A's blocks in the UI
    await expect(page.getByText("User A Block 0")).not.toBeVisible({ timeout: 3_000 });
    await expect(page.getByText("User A Block 1")).not.toBeVisible({ timeout: 3_000 });

    // Direct API call: GET /api/blocks?page_id=<User A's page> as User B → empty array
    const apiRes = await fetch(
      `${APP_URL}/api/blocks?page_id=${pageIdA}`,
      {
        headers: { Authorization: `Bearer ${tokenB}` },
      }
    );
    expect(apiRes.status).toBe(200);
    const body = (await apiRes.json()) as { blocks: unknown[] };
    // RLS filters to 0 rows — User B cannot see User A's blocks (ECN-CRUD-12)
    expect(body.blocks).toHaveLength(0);
  } finally {
    await cleanupUsers([emailA, emailB]);
  }
});
