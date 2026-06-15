/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, TR-tadaify-008
 * Story: #199
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S3 — API integration: POST /api/blocks/:id/duplicate inserts at source+1 with shift
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-004, AC#8, ECN-CRUD-03
 *
 * Note: The dashboard duplicate button UI is NOT implemented in this PR — it lives
 * in the consumer story (dashboard rework issue #200). This spec validates the
 * backend duplicate endpoint contract directly via Playwright request API.
 * Renamed from block-crud-duplicate.spec.ts per Codex P2 finding on PR #217.
 *
 * Prerequisites:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *   - Worker API running (npm run dev — http://localhost:44200)
 *
 * Run: npx playwright test e2e/block-crud-duplicate-api.spec.ts
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

test("S3 — API integration: POST /api/blocks/:id/duplicate inserts at source+1, shifts subsequent", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `test-crud-s3-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { pageId, blockIds } = await seedPageWithBlocks(userId, 3);

    // Duplicate Block 1 (middle block, position 1)
    const res = await request.post(`${APP_URL}/api/blocks/${blockIds[1]}/duplicate`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
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
  } finally {
    await cleanupUser(email);
  }
});

test("S3b — API integration: duplicate on another user's block returns 404 (ECN-CRUD-03 auth boundary)", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const ownerEmail = `test-crud-s3b-owner-${Date.now()}@local.test`;
  const attackerEmail = `test-crud-s3b-attacker-${Date.now()}@local.test`;

  try {
    const ownerId = await createTestUser(ownerEmail);
    const attackerId = await createTestUser(attackerEmail);

    // Seed attacker profile
    await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: attackerId,
        handle: `attacker-${attackerId.slice(0, 6)}`,
        email: attackerEmail,
        tos_version: "v1", tier: "free",
        onboarding_completed_at: new Date().toISOString(),
      }),
    });

    const attackerToken = await signInUser(attackerEmail);
    const { blockIds } = await seedPageWithBlocks(ownerId, 1);

    // Attacker tries to duplicate owner's block
    const res = await request.post(`${APP_URL}/api/blocks/${blockIds[0]}/duplicate`, {
      headers: { Authorization: `Bearer ${attackerToken}` },
    });
    expect(res.status()).toBe(404);
  } finally {
    await cleanupUser(ownerEmail);
    await cleanupUser(attackerEmail);
  }
});
