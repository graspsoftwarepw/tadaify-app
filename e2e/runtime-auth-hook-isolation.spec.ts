import { expect, test } from "@playwright/test";

// Covers: F-REGISTER-001a

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)!;
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY!;

test("isolated signup reaches the worktree-owned before-user-created hook", async () => {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `runtime-hook-${nonce}@local.test`,
      password: `Runtime-${nonce}-Aa1!`,
    }),
  });
  const body = await response.text();

  expect(response.status, body).toBe(200);
  expect(body).not.toMatch(/hook.*(?:unavailable|failed)|connection refused/i);
});
