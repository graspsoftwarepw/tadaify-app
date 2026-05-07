/**
 * S3 — Creator duplicates block — new block at source+1, subsequent shifted
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-004, AC#8, ECN-CRUD-03
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *
 * Run: npx playwright test e2e/block-crud-duplicate.spec.ts
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

async function seedPageWithBlocks(
  userId: string,
  count = 3
): Promise<{ pageId: string; blockIds: string[] }> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId, handle: `crudS3-${userId.slice(0, 6)}`,
      email: `test-crud-s3-${userId.slice(0, 6)}@local.test`,
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
    body: JSON.stringify({ user_id: userId, title: "S3 Page", is_homepage: true }),
  });
  const [pg] = (await pageRes.json()) as Array<{ id: string }>;

  const blockIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const bRes = await fetch(`${SUPABASE_URL}/rest/v1/blocks`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        page_id: pg.id, user_id: userId,
        block_type: "link", title: `Block ${i}`,
        url: `https://example.com/${i}`, position: i,
      }),
    });
    const [b] = (await bRes.json()) as Array<{ id: string }>;
    blockIds.push(b.id);
  }

  return { pageId: pg.id, blockIds };
}

async function getBlockPositions(
  pageId: string
): Promise<Array<{ id: string; title: string; position: number }>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?page_id=eq.${pageId}&order=position.asc&select=id,title,position`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  return res.json();
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

// ── S3 ────────────────────────────────────────────────────────────────────────

test("S3 — duplicate block: new block at source+1, subsequent blocks shifted", async ({ page }) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S3");

  const email = `test-crud-s3-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { pageId, blockIds } = await seedPageWithBlocks(userId, 3);

    await page.context().addCookies([{
      name: "sb-ihnvcuhabtzaxkdzjhhy-auth-token",
      value: encodeURIComponent(JSON.stringify({ access_token: accessToken, token_type: "bearer" })),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto(`${APP_URL}/app`);
    await page.waitForURL(/\/app/, { timeout: 10_000 });

    // All 3 blocks visible
    for (let i = 0; i < 3; i++) {
      await expect(page.getByText(`Block ${i}`)).toBeVisible({ timeout: 10_000 });
    }

    // Try to find duplicate button in the UI
    const dupBtns = page.locator('[data-testid="block-duplicate-btn"], [aria-label*="duplicate" i], [aria-label*="Duplicate" i]');
    const dupCount = await dupBtns.count();

    if (dupCount < 2) {
      // Duplicate UI not yet rendered (backend foundation story)
      // Verify via direct API call instead
      const res = await fetch(`${APP_URL}/api/blocks/${blockIds[1]}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { block_id: string };
      expect(body.block_id).toBeTruthy();

      // Verify positions in DB
      const rows = await getBlockPositions(pageId);
      expect(rows).toHaveLength(4); // 3 + 1 duplicate

      // Block 1 source stays at position 1
      const sourceRow = rows.find((r) => r.id === blockIds[1]);
      expect(sourceRow?.position).toBe(1);

      // New duplicate at position 2
      const dupRow = rows.find((r) => r.id === body.block_id);
      expect(dupRow?.position).toBe(2);

      // Former Block 2 shifted to position 3
      const shiftedRow = rows.find((r) => r.id === blockIds[2]);
      expect(shiftedRow?.position).toBe(3);

      test.info().annotations.push({
        type: "note",
        description: "Duplicate button UI not yet rendered; verified via API duplicate endpoint",
      });
      return;
    }

    // Click duplicate on the second block (Block 1, position 1)
    const secondDupBtn = dupBtns.nth(1);
    await secondDupBtn.click();

    // New block should appear in the list (4 total)
    await page.waitForTimeout(1_000);
    const blockItems = page.locator('[data-testid="block-item"], .block-item');
    await expect(blockItems).toHaveCount(4, { timeout: 5_000 });

    // Reload and verify DB persists
    const rows = await getBlockPositions(pageId);
    expect(rows).toHaveLength(4);
    // Block at position 1 (source) unchanged
    const sourceRow = rows.find((r) => r.id === blockIds[1]);
    expect(sourceRow?.position).toBe(1);
    // Former Block 2 shifted to 3
    const shiftedRow = rows.find((r) => r.id === blockIds[2]);
    expect(shiftedRow?.position).toBe(3);
  } finally {
    await cleanupUser(email);
  }
});
