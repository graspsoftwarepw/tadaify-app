# Changelog — tadaify

All notable changes to tadaify are documented here.
Format: date · description · BR/TR refs · PR link.

---

## [unreleased]

- Story 0 (v2): scaffold — React Router 7 (Remix) on Cloudflare Workers + Supabase local port-band 5435X (#110)
- Story 1: landing page with handle claim flow — full 11-section page, Motion v10 logo, live availability check (300ms debounce), 15-min handle reservation, locale-aware alternatives, Supabase `handle_reservations` table, `/api/handle/check` + `/api/handle/reserve` resource routes — BR-LANDING-001 (#1)
- 2026-04-29 · F-REGISTER-001a Slice B: email-OTP registration + login, Auth Hook, handle binding — `/register` (5-section state machine), `/login` (email-OTP returning-user flow via dedicated `/api/auth/login-otp`), `/api/auth/signup`, `/api/auth/login-otp`, `/api/auth/verify` (profiles INSERT + handle race guard), `/api/auth/password` (opt-in password setup), `profiles` table + RLS + cleanup trigger, handle reservation profiles pre-check — BR-AUTH-01..08, TR-AUTH-01..06 — Issue #129 (PR #133)
