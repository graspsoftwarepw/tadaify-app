---
id: TR-AUTH-01
type: tr
status: accepted
date: 2026-04-29
level: MUST
topics: [auth, login, otp, email]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-29
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
