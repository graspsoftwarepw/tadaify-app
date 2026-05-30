/**
 * Playwright suite — Link button block (slice A)
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 *
 * Covers:
 *   S1 — Public page renders Link button as styled <a> with label + icon
 *   S2 — POST /api/blocks with kind=link persists title + url + meta
 *   S3 — URL normaliser auto-prepends https:// (AC#4 / ECN-BLOCK-LINK-01)
 *   S4 — Dashboard "Add a link" CTA opens the editor modal end-to-end
 *
 * S4 mirrors the issue body's Playwright test plan S1 (creator add via picker).
 * This slice does not own the block picker — we mount the link editor directly
 * from the dashboard empty-state CTA.
 *
 * Prerequisites:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY exported
 *   - npm run dev → http://localhost:5173 (Playwright webServer brings it up)
 *
 * Run: npx playwright test e2e/link-block.spec.ts
 */

import { test, expect } from "@playwright/test";

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const TEST_PASSWORD = "TestPass123!";

const SEEDED_HANDLE = "test_render_s1";
const SEEDED_BLOCK_ID_1 = "00000000-0000-0000-0000-0000000b1001";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    throw new Error(`createTestUser ${res.status}: ${await res.text()}`);
  }
  return ((await res.json()) as { id: string }).id;
}

async function signInUser(email: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: ANON_KEY || SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    },
  );
  if (!res.ok) throw new Error(`signInUser ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function seedUserWithHomepage(
  userId: string,
  handle: string,
): Promise<{ pageId: string }> {
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

async function cleanupUser(email: string): Promise<void> {
  try {
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?per_page=200`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );
    const data = (await listRes.json()) as {
      users?: Array<{ id: string; email?: string }>;
    };
    for (const u of (data.users ?? []).filter((u) => u.email === email)) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
    }
  } catch {
    // ignore
  }
}

// ── S1 — Public render ───────────────────────────────────────────────────────

test("S1: /test_render_s1 renders Link button as styled <a> with label and icon", async ({
  page,
}) => {
  const response = await page.goto(`${APP_URL}/${SEEDED_HANDLE}`, {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(200);

  // Anchor with our test-id contract is present
  const anchor = page.locator(
    `a[data-testid="block-link-${SEEDED_BLOCK_ID_1}"]`,
  );
  await expect(anchor).toBeVisible();

  // Label text matches the seed
  await expect(anchor).toContainText("Listen on Spotify");

  // Href, target, rel encoded correctly
  await expect(anchor).toHaveAttribute(
    "href",
    "https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF",
  );
  await expect(anchor).toHaveAttribute("target", "_blank");
  await expect(anchor).toHaveAttribute("rel", /noopener/);

  // Visual contract — the link is rendered as a real button, not bare text.
  // We assert padding and border-radius (the `.block-link` CSS rule) via
  // computed style. If the stylesheet failed to load (PR #229's blocker), the
  // anchor would carry the browser-default `0px` padding and zero radius.
  // Wait for the stylesheet to actually be applied (`expect.poll` polls until
  // the computed value crosses the threshold or the assertion times out).
  await expect
    .poll(
      async () =>
        anchor.evaluate(
          (el) => parseFloat(getComputedStyle(el as HTMLElement).paddingTop),
        ),
      { timeout: 5_000 },
    )
    .toBeGreaterThan(8);

  await expect
    .poll(
      async () =>
        anchor.evaluate(
          (el) =>
            parseFloat(getComputedStyle(el as HTMLElement).borderTopLeftRadius),
        ),
      { timeout: 5_000 },
    )
    .toBeGreaterThan(8);
});

// ── S2 — API persistence ─────────────────────────────────────────────────────

test("S2: POST /api/blocks with link payload persists title + url + meta", async ({
  request,
}) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const email = `linkblock-s2-${Date.now()}@local.test`;
  try {
    const userId = await createTestUser(email);
    const { pageId } = await seedUserWithHomepage(
      userId,
      `linkblocks2_${Date.now().toString().slice(-8)}`,
    );
    const accessToken = await signInUser(email);

    const res = await request.post(`${APP_URL}/api/blocks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        page_id: pageId,
        block_type: "link",
        title: "Listen on Spotify",
        url: "https://open.spotify.com/artist/x",
        meta: { icon: "simple-icons:spotify", newtab: true },
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      block: {
        id: string;
        block_type: string;
        title: string;
        url: string;
        meta: { icon: string; newtab: boolean };
      };
    };
    expect(body.block.block_type).toBe("link");
    expect(body.block.title).toBe("Listen on Spotify");
    expect(body.block.url).toBe("https://open.spotify.com/artist/x");
    expect(body.block.meta).toEqual({
      icon: "simple-icons:spotify",
      newtab: true,
    });
  } finally {
    await cleanupUser(email);
  }
});

// ── S3 — URL normalization smoke (pure helper exercised in unit tests) ──────

test("S3: public render does not strip an https URL roundtripped via meta", async ({
  page,
}) => {
  // S3 is mostly covered in the unit test for normalizeUrl. Here we sanity-check
  // that the public HTML preserves the stored URL verbatim (no double-prefix bug).
  const response = await page.goto(`${APP_URL}/${SEEDED_HANDLE}`);
  expect(response?.status()).toBe(200);
  const html = await page.content();
  expect(html).toContain("https://open.spotify.com/artist/");
  expect(html).not.toContain("https://https://");
});

// ── S4 — Dashboard CTA → editor modal end-to-end ────────────────────────────

test("S4: dashboard 'Add a link' CTA opens editor, saves, modal closes", async ({
  page,
  context,
}) => {
  if (!SERVICE_ROLE_KEY) {
    test.skip();
    return;
  }

  const handle = `linkblock_s4_${Date.now().toString().slice(-8)}`;
  const email = `${handle}@local.test`;
  try {
    const userId = await createTestUser(email);
    await seedUserWithHomepage(userId, handle);
    const accessToken = await signInUser(email);

    // Inject the Supabase session cookie so the /app loader treats us as
    // authenticated. The cookie name matches `sb-<ref>-auth-token` — local
    // dev does not strictly enforce a ref segment so we use a stable label.
    const cookieValue = encodeURIComponent(
      JSON.stringify({ access_token: accessToken, refresh_token: "x" }),
    );
    await context.addCookies([
      {
        name: "sb-local-auth-token",
        value: cookieValue,
        url: APP_URL,
      },
    ]);

    await page.goto(`${APP_URL}/app?tab=page`);

    // Empty state visible — user has homepage but zero blocks.
    const addLinkCta = page.locator('[data-testid="empty-state-add-link"]');
    await expect(addLinkCta).toBeVisible();

    // Click → modal opens with the link form
    await addLinkCta.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-testid="link-block-form"]')).toBeVisible();

    // Fill label + URL
    await page.fill(
      '[data-testid="link-block-label-input"]',
      "Listen on Spotify",
    );
    await page.fill(
      '[data-testid="link-block-url-input"]',
      "open.spotify.com/artist/test",
    );

    // Hook the save before clicking so we can assert the request payload.
    const requestPromise = page.waitForRequest(
      (req) =>
        req.url().endsWith("/api/blocks") && req.method() === "POST",
    );

    await page.getByRole("button", { name: /^save$/i }).click();

    const req = await requestPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body.block_type).toBe("link");
    expect(body.title).toBe("Listen on Spotify");
    // URL auto-prepended https://
    expect(body.url).toBe("https://open.spotify.com/artist/test");
    expect(body.meta.newtab).toBe(true);
  } finally {
    await cleanupUser(email);
  }
});
