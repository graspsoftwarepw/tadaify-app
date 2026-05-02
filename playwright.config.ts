import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for tadaify-app E2E tests.
 *
 * Tests run LOCAL ONLY — never in GitHub Actions CI
 * (Playwright is excluded from CI per feedback_no_ci_tests.md).
 *
 * Prerequisites:
 *   - `supabase start` (port-band 5435X)
 *   - `.dev.vars` configured with Workers env bindings
 *   - `npm run dev` started (or let webServer block start it)
 */

export default defineConfig({
  testDir: "e2e",

  // Chromium only — MVP scope (no Firefox/WebKit)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  reporter: [["list"], ["html", { open: "never" }]],

  expect: {
    timeout: 5_000,
  },

  // Test order matters for some scenarios (handle reservation tests share global state)
  fullyParallel: false,

  // Start dev server before running tests; reuse if already running
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      // Pass through env vars needed by Workers dev server
      // These must be set in the shell or .dev.vars for tests to work
      ...(process.env.HANDLE_RESERVATION_TTL_SECONDS && {
        HANDLE_RESERVATION_TTL_SECONDS: process.env.HANDLE_RESERVATION_TTL_SECONDS,
      }),
      ...(process.env.SUPABASE_URL && {
        SUPABASE_URL: process.env.SUPABASE_URL,
      }),
      ...(process.env.SUPABASE_ANON_KEY && {
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      }),
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY && {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }),
      ...(process.env.BEFORE_USER_CREATED_HOOK_SECRET && {
        BEFORE_USER_CREATED_HOOK_SECRET: process.env.BEFORE_USER_CREATED_HOOK_SECRET,
      }),
    },
  },
});
