/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, TR-tadaify-008
 * Story: #199
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * S1 — API integration: DELETE /api/blocks/:id removes row; cache purge stub fires
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-002, AC#5, ECN-CRUD-01, ECN-CRUD-02
 * DEC-374=B: hard-delete via endpoint; confirm modal UI deferred to #200 consumer
 *
 * Note: This spec validates the backend DELETE endpoint contract. The dashboard
 * delete-confirm modal UI (button + dialog) is NOT implemented in this PR — it lives
 * in the consumer story (issue #200 / HomepagePanel dashboard rework). Renamed from
 * block-crud-delete.spec.ts per Codex P1 finding on PR #217.
 *
 * Prerequisites:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *   - Worker API running (npm run dev — http://localhost:5173)
 *
 * Run: npx playwright test e2e/block-crud-delete-api.spec.ts
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

async function seedBlock(userId: string): Promise<{ pageId: string; blockId: string }> {
  // Create profile (required for /app loader)
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId, handle: `crudS1-${userId.slice(0, 6)}`,
      email: `test-crud-s1-${userId.slice(0, 6)}@local.test`,
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
    body: JSON.stringify({ user_id: userId, title: "S1 Page", is_homepage: true }),
  });
  const [page] = (await pageRes.json()) as Array<{ id: string }>;

  const blockRes = await fetch(`${SUPABASE_URL}/rest/v1/blocks`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      page_id: page.id, user_id: userId,
      block_type: "link", title: "Delete Me Block",
      url: "https://example.com", position: 0,
    }),
  });
  const [block] = (await blockRes.json()) as Array<{ id: string }>;

  return { pageId: page.id, blockId: block.id };
}

async function getBlock(blockId: string): Promise<Array<{ id: string }>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blocks?id=eq.${blockId}&select=id`,
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

// ── S1 ────────────────────────────────────────────────────────────────────────

test("S1 — API integration: DELETE /api/blocks/:id removes row + 404 on second call (hard-delete)", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `test-crud-s1-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    const { blockId } = await seedBlock(userId);

    // Verify block exists before delete
    const before = await getBlock(blockId);
    expect(before).toHaveLength(1);

    // DELETE via Worker endpoint (authenticated as the block owner)
    const deleteRes = await request.delete(`${APP_URL}/api/blocks/${blockId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(deleteRes.status()).toBe(204);

    // Verify row gone from DB (hard-delete, not soft-delete)
    const after = await getBlock(blockId);
    expect(after).toHaveLength(0);

    // Second DELETE on same id returns 404 (ECN-CRUD-02: no info leak on missing)
    const secondDelete = await request.delete(`${APP_URL}/api/blocks/${blockId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(secondDelete.status()).toBe(404);
  } finally {
    await cleanupUser(email);
  }
});

test("S1b — API integration: DELETE on another user's block returns 404 (ECN-CRUD-02 no info leak)", async ({ request }) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const ownerEmail = `test-crud-s1b-owner-${Date.now()}@local.test`;
  const attackerEmail = `test-crud-s1b-attacker-${Date.now()}@local.test`;

  try {
    const ownerId = await createTestUser(ownerEmail);
    const attackerId = await createTestUser(attackerEmail);

    // Seed attacker profile (needed for JWT auth to succeed)
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
    const { blockId } = await seedBlock(ownerId);

    // Attacker tries to delete owner's block — must get 404, not 403 (no info leak)
    const res = await request.delete(`${APP_URL}/api/blocks/${blockId}`, {
      headers: { Authorization: `Bearer ${attackerToken}` },
    });
    expect(res.status()).toBe(404);

    // Owner's block still exists
    const still = await getBlock(blockId);
    expect(still).toHaveLength(1);
  } finally {
    await cleanupUser(ownerEmail);
    await cleanupUser(attackerEmail);
  }
});
