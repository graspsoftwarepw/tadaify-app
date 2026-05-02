/**
 * Auth email templates — Playwright spec
 * Issue: #150 (TR-tadaify-002 production templates Phase 1+2)
 *
 * PENDING: requires Playwright runtime setup (#158 escalation).
 * All test() calls below are documentation artifacts — they describe the
 * expected behaviour once the Playwright runtime is wired.
 * Per feedback_tadaify_per_playwright_test_authorization.md: each test
 * requires individual user approval before execution.
 *
 * Covers: BR-Slice-B, TR-tadaify-002, ECN-150-01..08
 */

import { test, expect } from "@playwright/test";


// ============================================================================
// PENDING: this entire suite is `.skip()`-gated until tadaify-app#160 lands
// (Playwright runtime install + playwright.config.ts + webServer env-passthrough).
// Codex review on PR #161 (Finding 2) — spec file ships as DOCUMENTATION
// artifact, NOT runnable tests, until #160 wires the runtime. Each test() call
// uses test.skip() so any future `npm run test:e2e` discovers the file but
// does not execute the scenarios.
// Tracking: https://github.com/graspsoftwarepw/tadaify-app/issues/160
// ============================================================================
const INBUCKET_URL = "http://127.0.0.1:54354";

// ---------------------------------------------------------------------------
// S1 — Signup OTP email rendering (HTML + plain-text + brand)
// ---------------------------------------------------------------------------
// Prerequisite: fresh DB, supabase start, custom templates wired in config.toml
// Covers: BR-Slice-B, TR-tadaify-002 (§1, §2, §4), ECN-150-08
// Pending: requires Playwright runtime setup (#158 escalation)
test.skip("S1 — signup OTP email: branded HTML, token-only, no external resources", async ({
  page,
}) => {
  // Pending: requires Playwright runtime setup (#158 escalation)
  await page.goto("/register");
  await page.fill('[data-testid="handle-input"]', "test-150-signup");
  await page.fill('[data-testid="email-input"]', "test-150-signup@local.test");
  await page.click('[data-testid="send-code-button"]');

  // Open Inbucket and find the latest email
  const inbucket = await page.context().newPage();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });

  // Subject must match "Your tadaify code: <6-digit>"
  const subject = await inbucket.locator('[data-testid="message-subject"]').first().textContent();
  expect(subject).toMatch(/^Your tadaify code: \d{6}$/);

  // Open the email body
  await inbucket.locator('[data-testid="message-row"]').first().click();
  const bodyFrame = inbucket.frameLocator('[data-testid="message-body-frame"]');
  const bodyText = await bodyFrame.locator("body").innerHTML();

  // Token rendered (not a literal placeholder)
  expect(bodyText).toMatch(/\d{6}/);
  expect(bodyText).not.toContain("{{ .Token }}");

  // No magic link / ConfirmationURL
  expect(bodyText).not.toContain("{{ .ConfirmationURL }}");
  expect(bodyText).not.toMatch(/href="http[^"]*confirm/i);

  // Branded greeting with handle
  expect(bodyText).toContain("Hey @test-150-signup");

  // TTL hint (ECN-150-04 / DEC-326)
  expect(bodyText).toContain("10 minutes");

  // No external resources (TR-tadaify-002 §4)
  expect(bodyText).not.toMatch(/<link[^>]+rel="stylesheet"/i);
  expect(bodyText).not.toMatch(/<img[^>]+src="https:/i);
  expect(bodyText).not.toMatch(/<script/i);

  // Plain-text part exists (view source)
  const rawSource = await inbucket.locator('[data-testid="message-source"]').textContent();
  expect(rawSource).toContain("text/plain");
  const token6 = bodyText.match(/\d{6}/)?.[0];
  expect(rawSource).toContain(token6 ?? "");
  expect(rawSource).toContain("noreply@tadaify.com");
}); // Covers: BR-Slice-B, TR-tadaify-002 §1 §2 §4, ECN-150-08

// ---------------------------------------------------------------------------
// S2 — Login OTP email rendering (returning user path)
// ---------------------------------------------------------------------------
// Prerequisite: seed user test-150-login@local.test exists with handle "test-150-login"
// Covers: BR-Slice-B (login path), TR-tadaify-002, DEC-307
// Pending: requires Playwright runtime setup (#158 escalation)
test.skip("S2 — login OTP email: Welcome back copy, token-only, brand invariants", async ({
  page,
}) => {
  // Pending: requires Playwright runtime setup (#158 escalation)
  await page.goto("/login");
  await page.fill('[data-testid="email-input"]', "test-150-login@local.test");
  await page.click('[data-testid="send-code-button"]');

  const inbucket = await page.context().newPage();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });

  const subject = await inbucket.locator('[data-testid="message-subject"]').first().textContent();
  expect(subject).toMatch(/^Sign in to tadaify: \d{6}$/);

  await inbucket.locator('[data-testid="message-row"]').first().click();
  const bodyFrame = inbucket.frameLocator('[data-testid="message-body-frame"]');
  const bodyText = await bodyFrame.locator("body").innerHTML();

  // Returning-user copy (DEC-307)
  expect(bodyText).toContain("Welcome back");
  expect(bodyText).not.toContain("{{ .ConfirmationURL }}");
  expect(bodyText).toMatch(/\d{6}/);
  expect(bodyText).not.toContain("{{ .Token }}");
  expect(bodyText).not.toMatch(/<link[^>]+rel="stylesheet"/i);
  expect(bodyText).not.toMatch(/<img[^>]+src="https:/i);
}); // Covers: BR-Slice-B (login), TR-tadaify-002, DEC-307

// ---------------------------------------------------------------------------
// S3 — Token expiry UX (>TTL → "code expired" message)
// ---------------------------------------------------------------------------
// Prerequisite: test env EMAIL_OTP_TTL_SECONDS=10 override, fresh DB
// Covers: ECN-150-04
// Pending: requires Playwright runtime setup (#158 escalation)
test.skip("S3 — expired token shows 'Code expired' inline error, not generic 401", async ({
  page,
}) => {
  // Pending: requires Playwright runtime setup (#158 escalation)
  await page.goto("/register");
  await page.fill('[data-testid="handle-input"]', "test-150-expiry");
  await page.fill('[data-testid="email-input"]', "test-150-expiry@local.test");
  await page.click('[data-testid="send-code-button"]');

  // Fetch OTP from Inbucket
  const inbucket = await page.context().newPage();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });
  await inbucket.locator('[data-testid="message-row"]').first().click();
  const bodyText = await inbucket.frameLocator('[data-testid="message-body-frame"]').locator("body").textContent();
  const token = bodyText?.match(/\d{6}/)?.[0];
  expect(token).toBeTruthy();

  // Wait for TTL to expire (10s override)
  await page.waitForTimeout(11_000);

  // Submit expired token
  await page.bringToFront();
  await page.fill('[data-testid="otp-input"]', token!);
  await page.click('[data-testid="verify-button"]');

  // Inline error — specific copy, NOT generic toast
  await expect(page.locator('[data-testid="otp-error"]')).toBeVisible();
  const errorText = await page.locator('[data-testid="otp-error"]').textContent();
  expect(errorText).toMatch(/code expired/i);
  await expect(page.locator('[data-testid="resend-button"]')).toBeVisible();
}); // Covers: ECN-150-04

// ---------------------------------------------------------------------------
// S4 — Resend OTP invalidates previous token
// ---------------------------------------------------------------------------
// Prerequisite: fresh DB, no TTL override needed
// Covers: ECN-150-07
// Pending: requires Playwright runtime setup (#158 escalation)
test.skip("S4 — resend invalidates old token; new token succeeds", async ({ page }) => {
  // Pending: requires Playwright runtime setup (#158 escalation)
  await page.goto("/register");
  await page.fill('[data-testid="handle-input"]', "test-150-resend");
  await page.fill('[data-testid="email-input"]', "test-150-resend@local.test");
  await page.click('[data-testid="send-code-button"]');

  // Grab token A from first email
  const inbucket = await page.context().newPage();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });
  await inbucket.locator('[data-testid="message-row"]').first().click();
  const bodyA = await inbucket.frameLocator('[data-testid="message-body-frame"]').locator("body").textContent();
  const tokenA = bodyA?.match(/\d{6}/)?.[0];
  expect(tokenA).toBeTruthy();

  // Resend
  await page.bringToFront();
  await page.click('[data-testid="resend-button"]');

  // Grab token B from second email (newer timestamp)
  await inbucket.bringToFront();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });
  await inbucket.locator('[data-testid="message-row"]').first().click();
  const bodyB = await inbucket.frameLocator('[data-testid="message-body-frame"]').locator("body").textContent();
  const tokenB = bodyB?.match(/\d{6}/)?.[0];
  expect(tokenB).toBeTruthy();
  expect(tokenB).not.toEqual(tokenA); // distinct tokens

  // Token A (old) should fail
  await page.bringToFront();
  await page.fill('[data-testid="otp-input"]', tokenA!);
  await page.click('[data-testid="verify-button"]');
  await expect(page.locator('[data-testid="otp-error"]')).toBeVisible();

  // Token B (new) should succeed
  await page.fill('[data-testid="otp-input"]', tokenB!);
  await page.click('[data-testid="verify-button"]');
  await expect(page).toHaveURL(/\/onboarding|\/app/);
}); // Covers: ECN-150-07

// ---------------------------------------------------------------------------
// S5 — Plain-text-only client (text part standalone integrity)
// ---------------------------------------------------------------------------
// Prerequisite: same as S1
// Covers: TR-tadaify-002 §1, ECN-150-01
// Pending: requires Playwright runtime setup (#158 escalation)
test.skip("S5 — plain-text part is a complete, well-formed fallback", async ({ page }) => {
  // Pending: requires Playwright runtime setup (#158 escalation)
  await page.goto("/register");
  await page.fill('[data-testid="handle-input"]', "test-150-plaintext");
  await page.fill('[data-testid="email-input"]', "test-150-plaintext@local.test");
  await page.click('[data-testid="send-code-button"]');

  const inbucket = await page.context().newPage();
  await inbucket.goto(`${INBUCKET_URL}/monitor`);
  await inbucket.waitForSelector('[data-testid="message-row"]', { timeout: 10000 });
  await inbucket.locator('[data-testid="message-row"]').first().click();

  // Get raw source to inspect multipart text/plain part
  const rawSource = await inbucket.locator('[data-testid="message-source"]').textContent() ?? "";

  // Multipart section present
  expect(rawSource).toContain("Content-Type: text/plain");

  // Extract plain text part (between text/plain content-type and next boundary)
  const textPartMatch = rawSource.match(/Content-Type: text\/plain[^\n]*\n\n([\s\S]*?)(?:--|\z)/);
  const textPart = textPartMatch?.[1] ?? rawSource;

  // Same OTP token in text part
  const htmlBodyMatch = rawSource.match(/Content-Type: text\/html[\s\S]*?(\d{6})/);
  const htmlToken = htmlBodyMatch?.[1];
  if (htmlToken) {
    expect(textPart).toContain(htmlToken);
  }

  // Greeting without HTML
  expect(textPart).toContain("@test-150-plaintext");

  // TTL hint
  expect(textPart).toContain("10 minutes");

  // Support contact
  expect(textPart).toContain("noreply@tadaify.com");

  // No HTML residue in text part
  expect(textPart).not.toMatch(/<[a-z]/i); // no HTML tags
  expect(textPart).not.toContain("&amp;");
  expect(textPart).not.toContain("&lt;");

  // Brand attribution
  expect(textPart).toContain("tada!ify");
}); // Covers: TR-tadaify-002 §1, ECN-150-01
