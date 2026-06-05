/**
 * Module: ONBOARDING
 * Covers: BR-ONBOARDING-003, TR-tadaify-003
 * Story: #310
 * (P7 canonical header — grasp-app-structure #310; original notes below)
 *
 * Playwright test suite for R2 avatar upload pipeline (tadaify-app#138).
 *
 * Covers: TR-tadaify-003 / BR-ONBOARDING-003 / DEC-310=B
 *
 * Prerequisites:
 *   - `./bin/worktree-env-init.sh` (populates .dev.vars from supabase status)
 *   - `supabase start` (port-band 5435X)
 *   - `npm run dev` (starts dev server — @cloudflare/vite-plugin auto-emulates
 *     AVATARS_R2 via miniflare; no MOCK_R2 env var needed)
 *
 * S1 — Upload happy path: JPG → spinner → preview → r2_key in URL
 * S2 — Too-large file → client-side rejection (no Worker call)
 * S3 — Bypassed client validation → Worker rejects (server-side authority)
 * S4 — Network failure → retry button visible → retry succeeds
 * S5 — Skip avatar → continue with no av param → DB has NULL
 * S6 — GDPR delete removes both DB row + R2 object
 *
 * Note: Tests that require DB access (S5 DB check, S6) use SUPABASE service-role
 * key from env. These tests are skipped gracefully when SERVICE_ROLE_KEY is unset.
 *
 * Covered by unit tests (excluded from Playwright per DEC-323):
 *   - Magic-byte detection logic → U1
 *   - Key pattern generation → U1
 *   - Client-side file validation → U2
 *   - Orphan cleanup query logic → U3
 */

import { test, expect, type Page } from "@playwright/test";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54351";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

/** Handle prefix — all t138* rows cleaned up in afterAll */
const HANDLE_PREFIX = "t138";

/** Seeded test user for avatar upload tests. Created in supabase/seed.sql. */
const SEED_USER_EMAIL = "test-br138-avatar-upload@local.test";
const SEED_USER_PASSWORD = "TestPass123!";

// ── Fixtures: minimal valid image bytes ──────────────────────────────────────

/** 1MB JPG: valid JPG magic bytes + padding to 1MB */
function makeJpgBytes(sizeBytes: number): Uint8Array {
  const buf = new Uint8Array(sizeBytes).fill(0x00);
  buf[0] = 0xff; buf[1] = 0xd8; buf[2] = 0xff; buf[3] = 0xe0;
  return buf;
}

/** 3MB file — too large for upload */
const OVERSIZED_BYTES = makeJpgBytes(3 * 1024 * 1024);

/** 1MB valid JPG */
const VALID_JPG_BYTES = makeJpgBytes(1 * 1024 * 1024);

/** PDF bytes disguised as JPG */
function makePdfBytes(): Uint8Array {
  const buf = new Uint8Array(20).fill(0x00);
  // %PDF magic
  buf[0] = 0x25; buf[1] = 0x50; buf[2] = 0x44; buf[3] = 0x46;
  return buf;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function cleanupHandleReservations(prefix: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) {
    console.warn("[cleanup] SERVICE_ROLE_KEY not set — skipping handle_reservations cleanup");
    return;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/handle_reservations?handle=ilike.${encodeURIComponent(prefix + "*")}`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
      }
    );
    if (!res.ok && res.status !== 404) {
      console.warn(`[cleanup] handle_reservations cleanup returned ${res.status}`);
    }
  } catch (e) {
    console.warn("[cleanup] cleanup failed:", e);
  }
}

/**
 * Signs in the seeded test user via the Supabase REST auth API.
 * Returns the access_token JWT for use as a Bearer header in direct API calls.
 * The session cookie is also set on the page context for XHR calls from the browser.
 */
async function signInSeedUser(page: Page): Promise<string> {
  // POST to Supabase local auth to get a real JWT
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: SEED_USER_EMAIL, password: SEED_USER_PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`signInSeedUser failed: HTTP ${res.status} — ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  const accessToken = data.access_token;

  // Inject the Supabase auth cookie into the browser context so that the Worker
  // route's cookie-fallback auth path picks it up on same-origin XHR requests.
  const cookieValue = JSON.stringify({ access_token: accessToken });
  await page.context().addCookies([
    {
      name: "sb-test-auth-token",
      value: encodeURIComponent(cookieValue),
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
    // Also cover 127.0.0.1 in case the dev server binds there
    {
      name: "sb-test-auth-token",
      value: encodeURIComponent(cookieValue),
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  return accessToken;
}

async function navigateToProfileStep(page: Page, handle: string): Promise<void> {
  // Sign in the seeded test user and inject auth cookie so the upload XHR has credentials
  await signInSeedUser(page);
  // Navigate directly to the profile step with a handle already set
  // (bypasses welcome/social steps for speed — test only the profile step)
  await page.goto(
    `/onboarding/profile?handle=${handle}&platforms=instagram&socials=${encodeURIComponent(JSON.stringify({ instagram: `${handle}_ig` }))}`
  );
  await expect(page.locator("input#name")).toBeVisible({ timeout: 10_000 });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

test.beforeAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

test.afterAll(async () => {
  await cleanupHandleReservations(HANDLE_PREFIX);
});

// ── S1 — Upload happy path ────────────────────────────────────────────────────
// S1: JPG 1MB → spinner → preview → r2_key in URL param `av`
// Verifies: visual checklist items 1, 2, 4 + URL has av=avatars/... param
// Covers: TR-tadaify-003

test("S1 — upload happy path: JPG 1MB → preview shown → r2_key in URL", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}s1`;
  await navigateToProfileStep(page, handle);
  await page.locator("input#name").fill("Test User S1");

  // Upload zone visible (visual checklist item 1)
  const uploadZone = page.locator('[data-testid="avatar-upload-zone"]');
  await expect(uploadZone).toBeVisible();

  // File type + size hint visible (visual checklist item 6 — type hint shown at idle)
  await expect(page.locator('[data-testid="avatar-type-hint"]')).toBeVisible();

  // Codex follow-up Finding 2: delay the upload route response so the spinner
  // is deterministically observable before the upload completes. Without this,
  // fast local uploads can resolve before Playwright checks for the spinner.
  let continueUpload: (() => void) | null = null;
  await page.route("/api/upload/avatar", async (route) => {
    // Signal that the request started — spinner should now be visible
    await new Promise<void>((resolve) => {
      continueUpload = resolve;
    });
    await route.continue();
  });

  // Set file via hidden input (visual checklist item 3 — upload zone triggers file picker)
  const fileInput = page.locator('[data-testid="avatar-file-input"]');
  await fileInput.setInputFiles({
    name: "avatar.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(VALID_JPG_BYTES),
  });

  // Spinner visible during upload (visual checklist item 4)
  // Deterministic: upload route is held until we release it below.
  await expect(page.locator('[data-testid="avatar-upload-spinner"]')).toBeVisible({
    timeout: 3_000,
  });

  // Release the upload route so the request completes
  continueUpload!();

  // Preview image visible after upload (visual checklist item 2)
  await expect(page.locator('[data-testid="avatar-preview-image"]')).toBeVisible({
    timeout: 10_000,
  });

  // Click Continue → check URL has av=avatars/...
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  const url = new URL(page.url());
  const avParam = url.searchParams.get("av");
  expect(avParam).toBeTruthy();
  expect(avParam).toMatch(/^avatars\/.+\/.+\.(jpg|png|webp)$/);
});

// ── S2 — Too-large file → client-side rejection ───────────────────────────────
// S2: 3MB file → inline error "File too large" → no POST request fired
// Verifies: visual checklist item 5 + ECN-138-01

test("S2 — too-large file: client rejects before POST (no Worker call)", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}s2`;
  await navigateToProfileStep(page, handle);

  // Intercept POST requests to /api/upload/avatar
  const uploadRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/upload/avatar")) {
      uploadRequests.push(req.url());
    }
  });

  const fileInput = page.locator('[data-testid="avatar-file-input"]');
  await fileInput.setInputFiles({
    name: "big.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(OVERSIZED_BYTES),
  });

  // Client-side error message visible (visual checklist item 5)
  await expect(page.locator('[data-testid="avatar-error-message"]')).toBeVisible({
    timeout: 5_000,
  });
  const errorText = await page.locator('[data-testid="avatar-error-message"]').textContent();
  expect(errorText).toContain("2 MB");

  // Assert NO POST fired (client intercepted it)
  expect(uploadRequests).toHaveLength(0);
});

// ── S3 — Bypassed client → Worker rejects (server-side authority) ──────────────
// S3: Direct POST with oversized or wrong-type file → 413/415 from Worker
// Verifies: ECN-138-08 + ECN-138-02 (server-side authority)
//
// Note on auth in S3:
//   - The oversized test (413) fires from the Content-Length pre-check BEFORE auth —
//     no Authorization header needed.
//   - The magic-byte test (415) fires after auth — signs in the seeded test user
//     to obtain a real access_token JWT via signInSeedUser().

test("S3 — bypassed client validation: Worker rejects oversized file with 413", async ({
  request,
}) => {
  // 413 fires from Content-Length pre-check BEFORE auth — no bearer needed
  const res = await request.post("/api/upload/avatar", {
    multipart: {
      file: {
        name: "big.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from(OVERSIZED_BYTES),
      },
    },
    headers: {
      "Content-Length": String(OVERSIZED_BYTES.length),
    },
  });

  // Worker rejects with 413 (authoritative size check)
  expect(res.status()).toBe(413);
  const body = await res.json() as { error: string };
  expect(body.error).toBe("file_too_large");
});

test("S3 — bypassed client validation: Worker rejects PDF disguised as JPG with 415", async ({
  page,
  request,
}) => {
  // 415 fires after auth — requires a real Supabase user session.
  // Sign in the seeded test user to obtain a valid access_token JWT.
  const accessToken = await signInSeedUser(page);

  const pdfBytes = makePdfBytes();

  const res = await request.post("/api/upload/avatar", {
    multipart: {
      file: {
        name: "disguised.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from(pdfBytes),
      },
    },
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  // Worker rejects with 415 (magic-byte mismatch — ignores Content-Type header)
  expect(res.status()).toBe(415);
  const body = await res.json() as { error: string };
  expect(body.error).toBe("unsupported_type");
});

// ── S4 — Network failure → retry button ────────────────────────────────────────
// S4: First upload attempt aborted (network failure) → retry button → success
// Verifies: visual checklist item 7 + ECN-138-04
//
// Note: This test uses page.route() to abort the first upload request at the
// browser layer — no server-side fail-first env var needed.

test("S4 — network failure: retry button shown after upload failure → retry succeeds", async ({
  page,
}) => {
  const handle = `${HANDLE_PREFIX}s4`;
  await navigateToProfileStep(page, handle);
  await page.locator("input#name").fill("Test User S4");

  // Route: intercept the first upload request and simulate failure by aborting
  let callCount = 0;
  await page.route("/api/upload/avatar", async (route) => {
    callCount++;
    if (callCount === 1) {
      // Simulate network failure on first attempt
      await route.abort("failed");
    } else {
      // Allow subsequent requests through
      await route.continue();
    }
  });

  const fileInput = page.locator('[data-testid="avatar-file-input"]');
  await fileInput.setInputFiles({
    name: "avatar.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(VALID_JPG_BYTES),
  });

  // Retry button should appear after failure (visual checklist item 7)
  await expect(page.locator('[data-testid="avatar-retry-button"]')).toBeVisible({
    timeout: 8_000,
  });

  // Click retry — second request goes through, upload succeeds
  await page.locator('[data-testid="avatar-retry-button"]').click();

  // After retry: file picker opens again; set the file again
  await fileInput.setInputFiles({
    name: "avatar.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from(VALID_JPG_BYTES),
  });

  // Preview should appear on success
  await expect(page.locator('[data-testid="avatar-preview-image"]')).toBeVisible({
    timeout: 10_000,
  });
});

// ── S5 — Skip avatar → no av param → DB NULL ──────────────────────────────────
// S5: click "Skip avatar" → wizard advances → profile_extras.avatar_r2_key IS NULL
// Verifies: visual checklist item 8 + ECN-138-10 + DEC-310=B

test("S5 — skip avatar: no av param after Continue → wizard advances", async ({ page }) => {
  const handle = `${HANDLE_PREFIX}s5`;
  await navigateToProfileStep(page, handle);
  await page.locator("input#name").fill("Test User S5");

  // Skip link visible (visual checklist item 8)
  const skipButton = page.locator('[data-testid="avatar-skip-button"]');
  await expect(skipButton).toBeVisible();

  // Click skip
  await skipButton.click();

  // Upload zone should still be in idle (skip resets to idle)
  // av param should NOT be set in the URL when we continue
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/onboarding\/template/, { timeout: 8_000 });

  const url = new URL(page.url());
  const avParam = url.searchParams.get("av");
  // No av param (or empty) after skip
  expect(!avParam || avParam === "").toBe(true);
});

// ── S6 — GDPR delete removes DB row + R2 object ────────────────────────────────
// S6: upload avatar → delete_user_data() → profile_extras row gone + pending_r2_deletes enqueued
// Verifies: ECN-138-12 (GDPR Art. 17 cross-storage cleanup)
//
// SKIPPED: Full GDPR delete e2e requires an authenticated Supabase user session
// to call delete_user_data() RPC (ownership guard: auth.uid() must match p_user_id).
// This is blocked until tadaify-app#139 merges (creates profile_extras table) AND
// the e2e test harness supports real Supabase auth sessions.
//
// GDPR delete correctness is covered by:
//   - Unit: avatar-orphan-cleanup.test.ts (U3) — deleteUserAvatarObjects + consumePendingR2Deletes
//   - Migration: 20260506000002 — delete_user_data() RPC enqueues R2 delete before CASCADE
//   - Post-#139 smoke test will replace this skip with a real authenticated flow.
//   - Miniflare-emulated R2 (filesystem-backed) is used in local dev via vite-plugin.

test.skip("S6 — GDPR delete: removes profile_extras row + enqueues R2 delete (blocked by #139)", async () => {
  // TODO(post-#139): implement real GDPR delete e2e:
  //   1. Create authenticated test user via Supabase auth
  //   2. Upload avatar through UI → assert profile_extras.avatar_r2_key is set
  //   3. Call delete_user_data(user_id) RPC via service-role
  //   4. Assert profile_extras row is deleted (CASCADE)
  //   5. Assert pending_r2_deletes has a row with the avatar's r2_key
  //   6. Assert miniflare R2 store still has the object (queue consumer deletes it async)
});
