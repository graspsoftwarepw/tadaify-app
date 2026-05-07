/**
 * S1 — Creator deletes block — confirm modal then row gone
 *
 * Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
 * Covers: BR-BLOCK-CRUD-002, AC#5, ECN-CRUD-01
 * DEC-374=B: hard-delete via confirm modal
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X) with `./bin/worktree-env-init.sh`
 *   - `npm run dev` (App: http://localhost:5173)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *
 * Run: npx playwright test e2e/block-crud-delete.spec.ts
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

async function seedUserData(userId: string, accessToken: string): Promise<{ pageId: string; blockId: string }> {
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

  // Create page (service-role, bypasses RLS)
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

  // Create 1 block (service-role, bypasses RLS — insert policy not yet in place)
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

test("S1 — delete block: confirm modal then block gone from list", async ({ page }) => {
  test.skip(!SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY not set — skipping S1");

  const email = `test-crud-s1-${Date.now()}@local.test`;

  try {
    const userId = await createTestUser(email);
    const accessToken = await signInUser(email);
    await seedUserData(userId, accessToken);

    // Inject session cookie
    await page.context().addCookies([{
      name: "sb-ihnvcuhabtzaxkdzjhhy-auth-token",
      value: encodeURIComponent(JSON.stringify({ access_token: accessToken, token_type: "bearer" })),
      domain: "localhost",
      path: "/",
    }]);

    await page.goto(`${APP_URL}/app`);
    await page.waitForURL(/\/app/, { timeout: 10_000 });

    // Assert block "Delete Me Block" is visible in the dashboard
    await expect(page.getByText("Delete Me Block")).toBeVisible({ timeout: 10_000 });

    // Click the delete button on the block
    // The block row should have a delete button (aria-label or data-testid)
    const deleteBtn = page.locator('[data-testid="block-delete-btn"], [aria-label*="delete" i], [aria-label*="Delete" i]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();

    // Confirm modal should appear (DEC-374=B)
    const modal = page.locator('[role="dialog"]').or(page.locator('[data-testid="delete-confirm-modal"]'));
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/delete block|confirm delete|are you sure/i)).toBeVisible();

    // Click confirm
    const confirmBtn = modal.getByRole("button", { name: /confirm|delete|yes/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Block should disappear from the list
    await expect(page.getByText("Delete Me Block")).not.toBeVisible({ timeout: 5_000 });

    // Navigate away and back — block still gone
    await page.goto(`${APP_URL}/app`);
    await page.waitForURL(/\/app/, { timeout: 10_000 });
    await expect(page.getByText("Delete Me Block")).not.toBeVisible({ timeout: 5_000 });
  } finally {
    await cleanupUser(email);
  }
});
