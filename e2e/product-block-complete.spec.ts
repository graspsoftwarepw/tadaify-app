/**
 * Module: BLOCKS
 * Covers: BR-CREATOR-001, BR-DASH-004
 * Story: #291
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright suite — Product block, complete flow (F-BLOCK-PRODUCT-COMPLETE-001, #291)
 *
 * Exercises the canonical picker → editor flow end-to-end for the product block,
 * which is an EXTERNAL-store link (Shopify / Stripe / Etsy / Gumroad / …) — no
 * native checkout (MVP scope, #69):
 *
 *   P1 — Add block → search "product" → editor opens → fill title + price + URL
 *        + CTA → save → POST /api/blocks → public page renders the product card
 *        with the image-less layout and the Buy CTA linking to the store URL.
 *   P2 — Inline + server validation: a dangerous `javascript:` scheme and an
 *        empty URL block the save (no POST fires); the API rejects a dangerous
 *        scheme and a missing title with 400.
 *   P3 — Edit an existing product: pencil opens the editor pre-filled; changing
 *        the title PATCHes /api/blocks/:id.
 *   P4 — Product image upload: pick a PNG → /api/upload/block-thumb returns an
 *        r2_key → preview renders → meta.image is included in the save payload.
 *
 * Prereqs: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY; dev
 * server on PLAYWRIGHT_BASE_URL (Playwright webServer brings it up).
 *
 * Run: npx playwright test e2e/product-block-complete.spec.ts
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

async function seedProductBlock(
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
      block_type: "product",
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

/** Open the picker, search "product", choose the Product card → canonical editor. */
async function openProductEditorViaPicker(page: import("@playwright/test").Page): Promise<void> {
  const addBtn = page.locator('[data-testid="page-head-actions-add-block"]');
  const search = page.locator('[data-testid="block-picker-search"]');
  await expect(addBtn).toBeVisible();
  // Retry the click until the picker opens — the first click can land before
  // React finishes hydrating the dashboard (the SSR button is inert until then).
  await expect(async () => {
    if (!(await search.isVisible())) await addBtn.click();
    await expect(search).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await search.fill("product");
  await page.locator('a[data-block-type="product"]').first().click();
  await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
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

// ── P1 — Add via picker → save → public render ───────────────────────────────

test("P1: add product via picker, fill fields, save, public page renders the card", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `pbc1_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openProductEditorViaPicker(page);

    await page.fill("#pf-title", "E2E Spring Drop");
    await page.fill("#pf-price", "$42");
    await page.fill("#pf-url", "shop.example.com/e2e-drop");
    await page.fill("#pf-cta", "Buy on Etsy");

    const respPromise = page.waitForResponse(
      (r) => r.url().endsWith("/api/blocks") && r.request().method() === "POST",
    );
    await saveViaEditor(page);

    const resp = await respPromise;
    expect(resp.status()).toBe(201);
    const body = JSON.parse(resp.request().postData() ?? "{}");
    expect(body.block_type).toBe("product");
    expect(body.title).toBe("E2E Spring Drop");
    expect(body.url).toBe("https://shop.example.com/e2e-drop");
    expect(body.meta?.price).toBe("$42");

    // Public render: the saved product renders as a card with a Buy CTA.
    await page.goto(`${APP_URL}/${handle}`, { waitUntil: "networkidle" });
    await expect(page.locator(".block-product-title", { hasText: "E2E Spring Drop" })).toBeVisible();
    await expect(page.locator(".block-product-price", { hasText: "$42" })).toBeVisible();
    const cta = page.locator("a.block-product-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "https://shop.example.com/e2e-drop");
    await expect(cta).toHaveAttribute("rel", /noopener/);
  } finally {
    await cleanupUser(email);
  }
});

// ── P2 — Validation blocks the save ──────────────────────────────────────────

test("P2: dangerous scheme / empty URL block the save; API rejects bad url + missing title", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `pbc2_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openProductEditorViaPicker(page);

    // No POST may fire while the URL is invalid.
    let postFired = false;
    page.on("request", (req) => {
      if (req.url().endsWith("/api/blocks") && req.method() === "POST") postFired = true;
    });

    // Dangerous scheme → inline alert, no POST.
    await page.fill("#pf-title", "Bad Product");
    await page.fill("#pf-url", "javascript:alert(1)");
    await page.locator('[data-testid="editor-save"]').click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    expect(postFired).toBe(false);

    // Empty URL → still blocked.
    await page.fill("#pf-url", "");
    await page.locator('[data-testid="editor-save"]').click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    expect(postFired).toBe(false);

    // Server-side guard: the API rejects a dangerous scheme…
    const badUrl = await page.request.post(`${APP_URL}/api/blocks`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      data: { page_id: "00000000-0000-0000-0000-000000000000", block_type: "product", title: "x", url: "javascript:alert(1)" },
    });
    expect(badUrl.status()).toBe(400);

    // …and a missing product title.
    const noTitle = await page.request.post(`${APP_URL}/api/blocks`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      data: { page_id: "00000000-0000-0000-0000-000000000000", block_type: "product", title: "   ", url: "https://shop.example.com/x" },
    });
    expect(noTitle.status()).toBe(400);
  } finally {
    await cleanupUser(email);
  }
});

// ── P3 — Edit an existing product ────────────────────────────────────────────

test("P3: pencil opens the editor pre-filled and PATCHes the block", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `pbc3_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    const { pageId } = await seedUserWithHomepage(userId, handle);
    const blockId = await seedProductBlock(userId, pageId, {
      title: "Original Product",
      url: "https://original.example.com/item",
      meta: {
        title: "Original Product",
        price: "$10",
        image: null,
        url: "https://original.example.com/item",
        cta: "Buy now",
        ctaIcon: "lucide:shoppingCart",
        showPrice: true,
      },
    });
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    const pencil = page.locator(`[data-testid="edit-block-${blockId}"]`);
    const form = page.locator('[data-testid="product-form"]');
    await expect(pencil).toBeVisible();
    await expect(async () => {
      if (!(await form.isVisible())) await pencil.click();
      await expect(form).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });

    // Form is pre-filled from the stored block.
    await expect(page.locator("#pf-url")).toHaveValue("https://original.example.com/item");
    await expect(page.locator("#pf-title")).toHaveValue("Original Product");
    await expect(page.locator("#pf-price")).toHaveValue("$10");

    await page.fill("#pf-title", "Edited Product");

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes(`/api/blocks/${blockId}`) && req.method() === "PATCH",
    );
    await saveViaEditor(page);

    const req = await patchPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body.title).toBe("Edited Product");
    expect(body.block_type).toBe("product");
  } finally {
    await cleanupUser(email);
  }
});

// ── P4 — Product image upload ────────────────────────────────────────────────

test("P4: uploading a product image shows a preview and sends meta.image on save", async ({ page, context }) => {
  if (!SERVICE_ROLE_KEY) return void test.skip();

  const handle = `pbc4_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);
    await authedDashboard(page, context, accessToken);

    await openProductEditorViaPicker(page);
    await page.fill("#pf-title", "Image Product");
    await page.fill("#pf-url", "example.com/image-product");

    // Pick the PNG → backend-proxy upload → preview appears.
    await page.locator('[data-testid="product-image-input"]').setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from(PNG_1X1_BASE64, "base64"),
    });
    await expect(page.locator('[data-testid="product-image-preview"]')).toBeVisible({ timeout: 10_000 });

    const postPromise = page.waitForRequest(
      (req) => req.url().endsWith("/api/blocks") && req.method() === "POST",
    );
    await saveViaEditor(page);

    const req = await postPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(typeof body.meta?.image).toBe("string");
    expect(body.meta.image).toContain("block-thumbs/");
  } finally {
    await cleanupUser(email);
  }
});
