/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, TR-tadaify-008
 * Story: #199
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S2 — API integration: POST /api/blocks/reorder atomically updates positions
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-003, AC#7, ECN-CRUD-04/05
 *
 * Note: Drag-handle UI is NOT implemented in this PR — it lives in the
 * drag-reorder consumer story (issue tadaify-app#210, deferred per DEC-381=B).
 * This spec validates the backend reorder endpoint contract directly via
 * Playwright request API. Renamed from block-crud-reorder.spec.ts per
 * Codex P2 finding on PR #217.
 *
 * Prerequisites:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *   - Worker API running (npm run dev — http://localhost:5173)
 *
 * Run: npx playwright test e2e/block-crud-reorder-api.spec.ts
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

async function seedPageWithBlocks(userId: string): Promise<{ pageId: string; blockIds: string[] }> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId, handle: `crudS2-${userId.slice(0, 6)}`,
      email: `test-crud-s2-${userId.slice(0, 6)}@local.test`,
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
    body: JSON.stringify({ user_id: userId, title: "S2 Page", is_homepage: true }),
  });
  const [pg] = (await pageRes.json()) as Array<{ id: string }>;

  // Seed 5 blocks at positions 0-4
  const blockIds: string[] = [];
  for (let i = 0; i < 5; i++) {
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

// ── S2 ────────────────────────────────────────────────────────────────────────

test("S2 — API integration: POST /api/blocks/reorder atomically updates positions", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `test-crud-s2-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { pageId, blockIds } = await seedPageWithBlocks(userId);

    // Reorder: move Block 4 to position 0 (before all others)
    const reorderedIds = [
      blockIds[4], blockIds[0], blockIds[1], blockIds[2], blockIds[3],
    ];

    const res = await request.post(`${APP_URL}/api/blocks/reorder`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: { page_id: pageId, ordered_ids: reorderedIds },
    });
    expect(res.status()).toBe(200);

    // Verify positions persisted atomically in DB
    const rows = await getBlockPositions(pageId);
    expect(rows).toHaveLength(5);
    expect(rows[0].id).toBe(blockIds[4]); // formerly at position 4, now at 0
    expect(rows[1].id).toBe(blockIds[0]); // formerly at position 0, now at 1
    expect(rows[2].id).toBe(blockIds[1]);
    expect(rows[3].id).toBe(blockIds[2]);
    expect(rows[4].id).toBe(blockIds[3]);
  } finally {
    await cleanupUser(email);
  }
});

test("S2b — API integration: reorder with cross-page block id returns 422 (ECN-CRUD-04)", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `test-crud-s2b-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { pageId, blockIds } = await seedPageWithBlocks(userId);

    // Inject a random uuid that doesn't belong to this page
    const fakeId = "00000000-0000-0000-0000-000000000001";
    const badIds = [fakeId, ...blockIds.slice(1)]; // length matches but fakeId is cross-page

    const res = await request.post(`${APP_URL}/api/blocks/reorder`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: { page_id: pageId, ordered_ids: badIds },
    });
    expect(res.status()).toBe(422);
  } finally {
    await cleanupUser(email);
  }
});

test("S2c — API integration: reorder with wrong ordered_ids length returns 422 (ECN-CRUD-05)", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `test-crud-s2c-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { pageId, blockIds } = await seedPageWithBlocks(userId);

    // Only pass 4 of 5 block ids — length mismatch
    const shortIds = blockIds.slice(0, 4);

    const res = await request.post(`${APP_URL}/api/blocks/reorder`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: { page_id: pageId, ordered_ids: shortIds },
    });
    expect(res.status()).toBe(422);
  } finally {
    await cleanupUser(email);
  }
});
