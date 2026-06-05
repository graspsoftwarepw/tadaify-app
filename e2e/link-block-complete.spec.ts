/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, BR-DASH-004
 * Story: #289
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright suite — Link block, complete flow (F-BLOCK-LINK-COMPLETE-001, #289)
 *
 * Exercises the CANONICAL picker → editor flow end-to-end (not the legacy
 * LinkBlockEditor covered by link-block.spec.ts):
 *
 *   C1 — Add block → search "link" in the picker → editor opens → fill label +
 *        URL → save → POST /api/blocks → public page renders the link.
 *   C2 — Inline + server validation: a dangerous `javascript:` scheme and an
 *        empty URL block the save (no POST fires) and surface an inline alert.
 *   C3 — Edit an existing link: pencil opens the editor pre-filled with the
 *        stored URL; changing the label PATCHes /api/blocks/:id.
 *   C4 — Custom thumbnail upload: pick a PNG → /api/upload/block-thumb returns an
 *        r2_key → preview renders → meta.thumb is included in the save payload.
 *
 * Prereqs: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY; dev
 * server on PLAYWRIGHT_BASE_URL (Playwright webServer brings it up).
 *
 * Run: npx playwright test e2e/link-block-complete.spec.ts
 */

import { test, expect } from "@playwright/test";

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const TEST_PASSWORD = "TestPass123!";

// 1×1 transparent PNG (valid magic bytes — passes the server-side detector).
const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    headers: {
      apikey: ANON_KEY || SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`signInUser ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function seedUserWithHomepage(userId: string, handle: string): Promise<{ pageId: string }> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId,
      handle,
      email: `${handle}@local.test`,
      tos_version: "v1",
      tier: "free",
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
    body: JSON.stringify({
      user_id: userId,
      title: "Home",
      is_homepage: true,
      published_at: new Date().toISOString(),
    }),
  });
  const [page] = (await pageRes.json()) as Array<{ id: string }>;
  return { pageId: page.id };
}

async function seedLinkBlock(
  userId: string,
  pageId: string,
  fields: { title: string; url: string; meta: Record<string, unknown> },
): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blocks`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      page_id: pageId,
      user_id: userId,
      block_type: "link",
      title: fields.title,
      url: fields.url,
      position: 0,
      is_visible: true,
      meta: fields.meta,
    }),
  });
  const [block] = (await res.json()) as Array<{ id: string }>;
  return block.id;
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
  } catch {
    // ignore
  }
}

async function authedDashboard(
  page: import("@playwright/test").Page,
  context: import("@playwright/test").BrowserContext,
  accessToken: string,
): Promise<void> {
  const cookieValue = encodeURIComponent(
    JSON.stringify({ access_token: accessToken, refresh_token: "x" }),
  );
  await context.addCookies([
    { name: "sb-local-auth-token", value: cookieValue, url: APP_URL },
  ]);
  await page.goto(`${APP_URL}/app?tab=page`);
  await page.waitForLoadState("networkidle");
}

/** Open the picker, search "link", choose the Link card → canonical editor. */
async function openLinkEditorViaPicker(page: import("@playwright/test").Page): Promise<void> {
  const addBtn = page.locator('[data-testid="page-head-actions-add-block"]');
  const search = page.locator('[data-testid="block-picker-search"]');
  await expect(addBtn).toBeVisible();
  // Retry the click until the picker opens — the first click can land before
  // React finishes hydrating the dashboard (the SSR button is inert until then).
  await expect(async () => {
    if (!(await search.isVisible())) await addBtn.click();
    await expect(search).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await search.fill("link");
  await page.locator('a[data-block-type="link"]').first().click();
  await expect(page.locator('[data-testid="link-form"]')).toBeVisible();
}

/**
 * Click Save in the canonical editor. On the Free tier, editing Variant A makes
 * it diverge from the (default) Variant B, so the A/B-testing upsell gate opens
 * — take the "save without A/B testing" partial-save path. Idempotent: if no
 * gate appears the direct save has already fired.
 */
async function saveViaEditor(page: import("@playwright/test").Page): Promise<void> {
  await page.locator('[data-testid="editor-save"]').click();
  const partial = page.getByRole("button", { name: /save without/i });
  try {
    await partial.click({ timeout: 4_000 });
  } catch {
    // No gate — direct save already in flight.
  }
}

// ── C1 — Add via picker → save → public render ───────────────────────────────

test("C1: add link via picker, fill fields, save, public page renders it", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `lbc1_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openLinkEditorViaPicker(page);

    await page.fill("#lf-label", "E2E Listen Now");
    await page.fill("#lf-url", "open.spotify.com/artist/e2e");

    // Wait for the RESPONSE (not just the request) so the DB insert has
    // committed before we read the public page.
    const respPromise = page.waitForResponse(
      (r) => r.url().endsWith("/api/blocks") && r.request().method() === "POST",
    );
    await saveViaEditor(page);

    const resp = await respPromise;
    expect(resp.status()).toBe(201);
    const body = JSON.parse(resp.request().postData() ?? "{}");
    expect(body.block_type).toBe("link");
    expect(body.title).toBe("E2E Listen Now");
    expect(body.url).toBe("https://open.spotify.com/artist/e2e");

    // Public render: the saved link appears as a styled anchor.
    await page.goto(`${APP_URL}/${handle}`, { waitUntil: "networkidle" });
    const anchor = page.locator("a.block-link", { hasText: "E2E Listen Now" });
    await expect(anchor).toBeVisible();
    await expect(anchor).toHaveAttribute("href", "https://open.spotify.com/artist/e2e");
  } finally {
    await cleanupUser(email);
  }
});

// ── C2 — Validation blocks the save ──────────────────────────────────────────

test("C2: dangerous scheme and empty URL block the save with an inline alert", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `lbc2_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openLinkEditorViaPicker(page);

    // No POST may fire while the URL is invalid.
    let postFired = false;
    page.on("request", (req) => {
      if (req.url().endsWith("/api/blocks") && req.method() === "POST") postFired = true;
    });

    // Dangerous scheme → inline alert, no POST.
    await page.fill("#lf-label", "Bad");
    await page.fill("#lf-url", "javascript:alert(1)");
    await page.locator('[data-testid="editor-save"]').click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    expect(postFired).toBe(false);

    // Empty URL → still blocked.
    await page.fill("#lf-url", "");
    await page.locator('[data-testid="editor-save"]').click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    expect(postFired).toBe(false);

    // Server-side guard: the API itself rejects a dangerous scheme.
    const api = await page.request.post(`${APP_URL}/api/blocks`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      data: { page_id: "00000000-0000-0000-0000-000000000000", block_type: "link", title: "x", url: "javascript:alert(1)" },
    });
    expect(api.status()).toBe(400);
  } finally {
    await cleanupUser(email);
  }
});

// ── C3 — Edit an existing link ───────────────────────────────────────────────

test("C3: pencil opens the editor pre-filled and PATCHes the block", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `lbc3_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    const { pageId } = await seedUserWithHomepage(userId, handle);
    const blockId = await seedLinkBlock(userId, pageId, {
      title: "Original Label",
      url: "https://original.example.com/x",
      meta: { label: "Original Label", url: "https://original.example.com/x", icon: null, newtab: true, thumb: null },
    });
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    const pencil = page.locator(`[data-testid="edit-block-${blockId}"]`);
    const form = page.locator('[data-testid="link-form"]');
    await expect(pencil).toBeVisible();
    // Retry through hydration (see openLinkEditorViaPicker).
    await expect(async () => {
      if (!(await form.isVisible())) await pencil.click();
      await expect(form).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });

    // Form is pre-filled from the stored block.
    await expect(page.locator("#lf-url")).toHaveValue("https://original.example.com/x");
    await expect(page.locator("#lf-label")).toHaveValue("Original Label");

    await page.fill("#lf-label", "Edited Label");

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes(`/api/blocks/${blockId}`) && req.method() === "PATCH",
    );
    await saveViaEditor(page);

    const req = await patchPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body.title).toBe("Edited Label");
    expect(body.block_type).toBe("link");
  } finally {
    await cleanupUser(email);
  }
});

// ── C4 — Custom thumbnail upload ─────────────────────────────────────────────

test("C4: uploading a thumbnail shows a preview and sends meta.thumb on save", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `lbc4_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openLinkEditorViaPicker(page);
    await page.fill("#lf-label", "Thumb Link");
    await page.fill("#lf-url", "example.com/thumb");

    // Pick the PNG → backend-proxy upload → preview appears.
    await page.locator('[data-testid="link-thumb-input"]').setInputFiles({
      name: "thumb.png",
      mimeType: "image/png",
      buffer: Buffer.from(PNG_1X1_BASE64, "base64"),
    });
    await expect(page.locator('[data-testid="link-thumb-preview"]')).toBeVisible({ timeout: 10_000 });

    const postPromise = page.waitForRequest(
      (req) => req.url().endsWith("/api/blocks") && req.method() === "POST",
    );
    await saveViaEditor(page);

    const req = await postPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(typeof body.meta?.thumb).toBe("string");
    expect(body.meta.thumb).toContain("block-thumbs/");
  } finally {
    await cleanupUser(email);
  }
});
