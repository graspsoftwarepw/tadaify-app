# Changelog — tadaify

All notable changes to tadaify are documented here.
Format: date · description · BR/TR refs · PR link.

---

## [unreleased]

- 2026-05-02 · infra: install Playwright runtime (@playwright/test ^1.59.1 + chromium) + playwright.config.ts; fix strict-mode violation in critical-path.spec.ts; add wrangler-dev runtime guard to S1-S6 in register-cascade.spec.ts; README Local testing section — TR-tadaify-001 (Playwright stays local, now actually runnable) — Issue #160

- 2026-05-02 · bug fix: register flow cascade fix (5 bugs from PR #133/#143) — Bug 1: hard-fail 500 when Workers env bindings missing (no silent stub); Bug 2: hook URL port 54321→54351; Bug 3: `[functions.before-user-created] verify_jwt = false`; Bug 4: `.dev.vars.example` + README Quickstart step; Bug 6: TTL env-var `HANDLE_RESERVATION_TTL_SECONDS` (DEC-326=A: 10 min default); drops SQL DEFAULT on `handle_reservations.expires_at`; unit tests U1/U3/U4 + Playwright S1/S2/S3/S5/S6 — no new BR/TR (regressions vs locked behavior) — Issue #149

- Story 0 (v2): scaffold — React Router 7 (Remix) on Cloudflare Workers + Supabase local port-band 5435X (#110)
- Story 1: landing page with handle claim flow — full 11-section page, Motion v10 logo, live availability check (300ms debounce), 15-min handle reservation, locale-aware alternatives, Supabase `handle_reservations` table, `/api/handle/check` + `/api/handle/reserve` resource routes — BR-LANDING-001 (#1)
- 2026-05-02 · infra: add unit-test CI gate (vitest + typecheck + build on PR + push to main) — TR-tadaify-001 introduced; TR-009 superseded; canonical Lambda CI pattern ref: untiltify-aws#147 — Issue #152
- 2026-05-02 · bug fix: remove dark:bg-gray-950 and color-scheme:dark from body — prevents invisible text on /register (and all pages) when OS prefers-color-scheme:dark; body stays light until tokens.css ships a dark variant — Issue #147
- 2026-04-29 · F-REGISTER-001a Slice B: email-OTP registration + login, Auth Hook, handle binding — `/register` (5-section state machine), `/login` (email-OTP returning-user flow via dedicated `/api/auth/login-otp`), `/api/auth/signup`, `/api/auth/login-otp`, `/api/auth/verify` (profiles INSERT + handle race guard), `/api/auth/password` (opt-in password setup), `profiles` table + RLS + cleanup trigger, handle reservation profiles pre-check — BR-AUTH-01..08, TR-AUTH-01..06 — Issue #129 (PR #133)
