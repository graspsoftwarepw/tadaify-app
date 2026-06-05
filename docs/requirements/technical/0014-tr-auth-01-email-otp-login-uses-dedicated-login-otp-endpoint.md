---
id: TR-AUTH-001
title: Login email-OTP uses `/api/auth/login-otp` (not signup endpoint)
area: AUTH
status: accepted
level: MUST
covers: [BR-AUTH-005]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [TR-AUTH-01]
---

# TR-AUTH-01 — Login email-OTP uses `/api/auth/login-otp` (not signup endpoint)

> **Level:** MUST

The returning-user login flow sends OTP via `POST /api/auth/login-otp` which
sets `create_user: false` (Supabase `create_user` flag). This endpoint accepts
only `{ email }` — no handle or tos_version required. The signup endpoint
(`/api/auth/signup`) continues to require a valid handle and must not be called
from the login flow. See DEC-307.

## Covers

BR-AUTH-05
