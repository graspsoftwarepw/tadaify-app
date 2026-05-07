/**
 * S5 — Dashboard loads blocks list for own page
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-001, AC#9, ECN-CRUD-12
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *
 * Run: npx playwright test e2e/block-crud-list.spec.ts
 */

import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const APP_URL = "http://localhost:5173";
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

async function seedUserWithBlocks(
  userId: string,
  email: string,
  handle: string
): Promise<string> {
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

  const pageRes = await fetch(`${SUPABASE_URL}/rest/v1/pages`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ user_id: userId, title: "S5 Page", is_homepage: true }),
  });
  const [pg] = (await pageRes.json()) as Array<{ id: string }>;

  // Seed 3 blocks at positions 0, 1, 2
  for (let i = 0; i < 3; i++) {
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
        block_type: "link", title: `S5 Block ${i}`,
        url: `https://example.com/${i}`, position: i,
      }),
    });
  }

  return pg.id;
}

async function cleanupUser(email: string): Promise<void> {
  try {
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    const data = (await listRes.json()) as { users?: Array<{ id: string; email?: string }> };
    for (const u of (data.users ?? []).filter((u) => u.email === email)) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      });
    }
  } catch { /* ignore cleanup errors */ }
}

// ── S5 ────────────────────────────────────────────────────────────────────────

test("S5 — dashboard loads 3 blocks ordered by position for own page", async ({ page }) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S5");

  const ts = Date.now();
  const email = `test-crud-s5-${ts}@local.test`;
  const handle = `crudS5-${ts}`.slice(0, 30);

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    await seedUserWithBlocks(userId, email, handle);

    await page.context().addCookies([{
      name: "sb-ihnvcuhabtzaxkdzjhhy-auth-token",
      value: encodeURIComponent(JSON.stringify({ access_token: accessToken, token_type: "bearer" })),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto(`${APP_URL}/app`);
    await page.waitForURL(/\/app/, { timeout: 10_000 });

    // All 3 blocks should be displayed
    for (let i = 0; i < 3; i++) {
      await expect(page.getByText(`S5 Block ${i}`)).toBeVisible({ timeout: 10_000 });
    }

    // Verify via direct API call that blocks are returned ordered by position
    const apiRes = await fetch(
      `${APP_URL}/api/blocks?page_id=${await getPageIdForUser(userId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    expect(apiRes.status).toBe(200);
    const body = (await apiRes.json()) as { blocks: Array<{ title: string; position: number }> };
    expect(body.blocks).toHaveLength(3);
    expect(body.blocks[0].position).toBe(0);
    expect(body.blocks[1].position).toBe(1);
    expect(body.blocks[2].position).toBe(2);
    expect(body.blocks[0].title).toBe("S5 Block 0");
    expect(body.blocks[2].title).toBe("S5 Block 2");
  } finally {
    await cleanupUser(email);
  }
});

async function getPageIdForUser(userId: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/pages?user_id=eq.${userId}&is_homepage=eq.true&select=id&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  const rows = (await res.json()) as Array<{ id: string }>;
  return rows[0].id;
}
