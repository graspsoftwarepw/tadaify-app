---
id: TR-tadaify-002
type: tr
status: accepted
date: 2026-05-02
level: MUST
topics: [email, auth, templates, multipart-mime, inline-css, otp]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-05-02
---

# TR-tadaify-002 — Auth email templates contract

> **Level:** MUST

Codifies the production auth email template contract established in issue #150 (DEC-329 = A). All Supabase-emitted auth emails MUST satisfy all four acceptance criteria below. Traceability: `// Covers: TR-tadaify-002` in any test asserting these invariants.

## Acceptance criteria

1. **Plain-text fallback files (PARTIAL — multipart delivery pending dispatcher upgrade)** — every auth template ships an HTML body in `<purpose>.html` AND a plain-text body in a separate `<purpose>.txt` file, both in `supabase/templates/auth/`. Plain-text uses brand slug form `tadaify` (no `!`) per brand-lock.md line 49 ("Plain-text fallback: `tadaify` slug form, no punctuation"). The plain-text file MUST contain the same OTP token (where applicable), support contact, and brand attribution as the HTML part.

   **Current delivery reality (2026-05-02):** Supabase CLI 2.84.2 rejects `text_path` in `[auth.email.template.*]` blocks ("invalid keys: text_path"). GoTrue auto-fired auth emails (signup / magic_link / recovery / email_change) are emitted as HTML-only via `content_path` — they do NOT include a `text/plain` MIME part in the wire envelope. The `.txt` files therefore ship as repository artifacts for: (a) future Supabase CLI versions that support `text_path` per their changelog, (b) Edge Function-dispatched emails where we control MIME composition manually, (c) Resend Phase 3 production wiring where text alternatives are first-class. **TR-tadaify-002 §1 reaches its stated goal (true multipart MIME with both `text/plain` and `text/html` MIME parts) ONLY after one of those three paths lands** — see DEC-333 = B outcome notes. Until then, this §1 is partially satisfied (text fallback files maintained; runtime delivery remains HTML-only via Supabase auto-fire).

2. **Token-only payload (OTP flows)** — no `{{ .ConfirmationURL }}` placeholder rendered in OTP-classified templates (`otp-signup.html`, `otp-login.html`, `password-reset.html`, `email-change-confirm.html`). The token IS the entire auth path. Magic-link styling and clickable auth links are forbidden in this class of email.

3. **Sourced from `supabase/templates/auth/<purpose>.html`** — local files, version-controlled, referenced from `supabase/config.toml` via `content_path`. NOT inline strings in source code, NOT external service template editors as source of truth.

4. **Inline CSS only — no external resources** — no `<link rel="stylesheet">`, no `<img src="https://...">`, no `<script>`, no `@import url(...)`, no Google Fonts. Rendering MUST work offline (corporate firewall, mobile data restrictions, screen reader, plain-text-only client). Wordmark is stylized `<span>` text using system font fallbacks, NOT a remote SVG/PNG. Color values MUST be hardcoded hex — no `var(--*)` CSS variables.

## Template inventory

| File | Type | Token | Auto-wired |
|------|------|-------|-----------|
| `otp-signup.html` | OTP auth | `{{ .Token }}` | `[auth.email.template.signup]` |
| `otp-login.html` | OTP auth | `{{ .Token }}` | `[auth.email.template.magic_link]` |
| `password-reset.html` | OTP auth | `{{ .Token }}` | `[auth.email.template.recovery]` |
| `email-change-confirm.html` | OTP auth | `{{ .Token }}` | `[auth.email.template.email_change]` |
| `identity-linked.html` | Informational | none | Edge Function trigger (future) |
| `welcome.html` | Informational | none | Edge Function trigger (future) |

## Wordmark canonical

`tada!ify` — three `<span>` elements, zero separator:
- `<span style="color:#6366F1">ta</span>` (indigo)
- `<span style="color:#F59E0B">da!</span>` (warm amber)
- `<span style="color:#111827">ify</span>` (dark)

Domain reference: `tada!ify.com` — `.com` in `#111827`. ZERO hyphen in wordmark.

## System font stack

- Body: `'Inter', system-ui, -apple-system, sans-serif`
- Display / code: `'Crimson Pro', Georgia, serif` (OTP digit display, greeting headings)

## Welcome email semantics (DEC-332 = D)

`welcome.html` is a handle-claim celebration, NOT a page-live notification. Subject and copy celebrate `@handle is yours`; CTA is "Set up your page →" pointing at `/app/setup`; "Status: not yet published" row is mandatory; page-live language is forbidden until explicit Publish action.

## Related decisions

- DEC-329 = A — one combined TR-tadaify-002 with 4 bullets (2026-05-02)
- DEC-332 = D — welcome email semantics: handle-claim, not page-live (2026-05-02)
- DEC-333 = B — proper multipart MIME via separate `.txt` files; `text_path` not wired in config.toml (unsupported by CLI 2.84.2) (2026-05-02)
- DEC-291 / DEC-294 / DEC-295 / DEC-306 — Slice B OTP-only design contract
- DEC-307 — login flow returning-user path ("Welcome back")

## Migration note

Introduced 2026-05-02 via issue #150. Templates derived from Phase 1 mockups (PR #156) and Phase 2 mockups (PR #159). Legacy `supabase/templates/auth/email-otp.html` (PR #133) superseded by `otp-signup.html` — the legacy file is retained for historical reference but is no longer wired in `config.toml`.
