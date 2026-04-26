# tadaify — email templates

10 production-ready HTML emails (+ plain-text twins) covering every transactional touchpoint:

| # | File | Path | Trigger | Subject |
|---|---|---|---|---|
| 1 | `verify-signup.html` | `supabase-auth/` | New signup | Confirm your tadaify account |
| 2 | `magic-link.html` | `supabase-auth/` | Magic link / OTP login | Your tadaify magic login link |
| 3 | `reset-password.html` | `supabase-auth/` | Forgot password | Reset your tadaify password |
| 4 | `change-email.html` | `supabase-auth/` | Email address change | Confirm your new email address |
| 5 | `team-invite.html` | `resend/` | Workspace invite (#38) | {{inviter_name}} invited you to join {{workspace_name}} on tadaify |
| 6 | `gdpr-export-ready.html` | `resend/` | GDPR Art. 20 export ready (#36) | Your tadaify data export is ready |
| 7 | `subscription-cancelled.html` | `resend/` | Stripe `customer.subscription.deleted` (#39 + AP-029) | Your tadaify subscription is cancelled (until {{period_end}}) |
| 8 | `payment-failed.html` | `resend/` | Stripe `invoice.payment_failed` (AP-029 dunning) | Payment for tadaify failed — please update your card |
| 9 | `handle-change-confirm.html` | `resend/` | User renamed handle (DEC-074) | You changed your tadaify handle: {{old_handle}} → {{new_handle}} |
| 10 | `waitlist-promote.html` | `resend/` | Waitlist seat opens (#55 / F-WAITLIST-001) | Your tadaify spot is ready! 🎉 |

---

## Two integration paths

### A. Supabase Auth (4 templates)

These run inside GoTrue. Configure them in `supabase/config.toml` with `[auth.email.template.<key>]` blocks pointing at `content_path`:

```toml
[auth.email.template.confirmation]
subject = "Confirm your tadaify account"
content_path = "./supabase/templates/verify-signup.html"

[auth.email.template.magic_link]
subject = "Your tadaify magic login link"
content_path = "./supabase/templates/magic-link.html"

[auth.email.template.recovery]
subject = "Reset your tadaify password"
content_path = "./supabase/templates/reset-password.html"

[auth.email.template.email_change]
subject = "Confirm your new email address"
content_path = "./supabase/templates/change-email.html"
```

Deployment: copy `supabase-auth/*.html` into the `-app` repo's `supabase/templates/` directory and reference them as above. The plain-text `.txt` twins are not consumed by Supabase Auth (GoTrue currently sends HTML only) — keep them alongside for parity / future use / reference for the production SMTP fallback.

GoTrue substitutes [Go template variables](https://supabase.com/docs/guides/auth/auth-email-templates#email-templates) at send time:

| Variable | Used in |
|---|---|
| `{{ .ConfirmationURL }}` | All four — primary CTA href |
| `{{ .Token }}` | `magic-link.html` (paste-fallback OTP) |
| `{{ .Email }}` | `verify-signup`, `magic-link`, `reset-password` (footer) |
| `{{ .OldEmail }}`, `{{ .NewEmail }}` | `change-email` (diff render) |
| `{{ .SiteURL }}` | `verify-signup` footer Privacy/Terms |

> **Note on `change-email`:** with `double_confirm_changes = true` (set in `supabase/config.toml`), GoTrue sends this same template to **both** the old and new addresses. The copy is intentionally written so it reads correctly from either inbox.

### B. Resend custom (6 templates)

These are sent from a Supabase Edge Function (or any backend) calling the Resend API directly. Pattern:

```ts
// supabase/functions/<your-fn>/index.ts
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@tadaify.com";
const FROM_NAME = "tadaify";

// 1. Load template
const html = await Deno.readTextFile(
  new URL("../../../mockups/tadaify-mvp/emails/resend/team-invite.html", import.meta.url)
);

// 2. Substitute placeholders (do this in app code — Resend does NOT)
const rendered = html
  .replaceAll("{{inviter_name}}", inviterName)
  .replaceAll("{{inviter_email}}", inviterEmail)
  .replaceAll("{{workspace_name}}", workspace)
  .replaceAll("{{role}}", role)
  .replaceAll("{{accept_url}}", acceptUrl)
  .replaceAll("{{expires_at}}", expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))
  .replaceAll("{{user_email}}", inviteeEmail);

// 3. Send via Resend
await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [inviteeEmail],
    subject: `${inviterName} invited you to join ${workspace} on tadaify`,
    html: rendered,
    text: renderedTextTwin,  // load + substitute the .txt file the same way
    reply_to: "support@tadaify.com",
  }),
});
```

Resend itself does **not** substitute placeholders — the curly-brace tokens here are our own convention, replaced before the API call. Same approach as `untiltify-app/supabase/functions/send-future-letter/index.ts`.

---

## Placeholder reference

### Supabase Auth (Go template syntax — substituted by GoTrue)

| Variable | Type | Description |
|---|---|---|
| `{{ .ConfirmationURL }}` | string (URL) | The single-use confirmation link |
| `{{ .Token }}` | string (6-digit) | OTP code — `magic-link` only |
| `{{ .Email }}` | string | The user's current email address |
| `{{ .OldEmail }}` | string | Pre-change email — `email_change` only |
| `{{ .NewEmail }}` | string | Post-change email — `email_change` only |
| `{{ .SiteURL }}` | string | The configured site URL (without trailing slash) |

### Resend custom (`{{snake_case}}` — substituted in our Edge Function)

| Template | Variables |
|---|---|
| `team-invite` | `user_email`, `inviter_name`, `inviter_email`, `workspace_name`, `role`, `accept_url`, `expires_at` |
| `gdpr-export-ready` | `user_email`, `handle`, `download_url`, `expires_at`, `file_size` |
| `subscription-cancelled` | `user_email`, `handle`, `tier`, `period_end`, `reactivate_url`, `locked_price` |
| `payment-failed` | `user_email`, `handle`, `amount_due`, `retry_at`, `update_card_url`, `period_end` |
| `handle-change-confirm` | `user_email`, `old_handle`, `new_handle`, `redirect_until`, `undo_url` |
| `waitlist-promote` | `user_email`, `handle`, `finalize_url`, `expires_at`, `waited_days`, `position` |

`user_email` is required on every Resend template (footer "Sent to ..." line). Date strings should be pre-formatted by the caller — keep the format consistent across templates (`Apr 27, 2026 at 2:00 PM UTC` is a good default).

---

## Testing

### Supabase Auth (local Inbucket)

When you run `supabase start`, an Inbucket inbox spins up at `http://127.0.0.1:54324`. All Auth emails land there with the templates already rendered. Iterate on the HTML, run `supabase stop && supabase start` (config reloads on start), trigger an auth flow, refresh Inbucket.

### Resend (delivered@resend.dev)

For Resend, send to the magic address `delivered@resend.dev` — Resend processes the email through their pipeline (rendering, inlining, deliverability checks) and returns a real `Email-ID` you can fetch via `GET /emails/:id` to inspect what would have been sent without spamming a real inbox.

For end-to-end deliverability tests, sign up a personal Gmail / Outlook / Apple Mail and send the rendered HTML there. Cross-client rendering varies more than any single tool can predict.

### Email-on-acid / Litmus (recommended before launch)

Run all 10 templates through Litmus or Email on Acid one time before first prod send. Outlook 2016/2019/365 desktop is the only consistent rendering risk; everything else (Gmail, Apple Mail, iOS, Android, Yahoo, Fastmail) generally Just Works with the patterns used here (table-based layout + inline styles + MSO conditional CTAs + `@media (prefers-color-scheme: dark)` for Apple Mail).

---

## Deployment

Once `tadaify-app` exists on Supabase:

```bash
# 1. Supabase Auth templates
mkdir -p supabase/templates
cp mockups/tadaify-mvp/emails/supabase-auth/*.html supabase/templates/

# 2. Wire config.toml (see "Two integration paths" above)
# Edit supabase/config.toml — add the four [auth.email.template.*] blocks

# 3. Deploy
supabase db push                    # not for templates, but for any related migrations
git push origin main                # CI deploys via supabase config sync
```

For Resend templates, embed them in the Edge Function source (read at runtime via `Deno.readTextFile` with a relative path bundled with the function) or compile them into the function bundle. Either approach works; the runtime-load approach keeps iteration fast.

---

## Branding update guide

All templates pull from the same brand canon. To update palette/logo across all 10:

1. **Brand palette** — search and replace these hex codes across `**/*.html`:
   - `#6366F1` → primary indigo
   - `#4F46E5` → primary indigo hover (used in logo gradient only)
   - `#F59E0B` → warm amber
   - `#92400E` → warm-on-warm-bg text color
   - `#111827` → fg
   - `#4B5563` → fg-muted
   - `#9CA3AF` → fg-subtle
   - `#E5E7EB` → border
   - `#F3F4F6` → bg-muted
   - `#F9FAFB` → bg
2. **Logo** — the brand bar in every template uses a flat orb mark (table cell with rounded corners and an `●` glyph) plus a four-color wordmark (`ta` indigo / `!` muted-fg / `da` amber / `ify` near-black). To change the logo across all 10 templates, edit the `<!-- Brand bar -->` block — it's the same markup in every file.
3. **Footer NIP / company line** — search-replace `[PLACEHOLDER]` once the company NIP is registered.
4. **Sender domain** — `noreply@tadaify.com` is the assumed sender; configure DKIM + SPF + DMARC in Resend dashboard before first prod send.

---

## Style budget (intentional constraints)

These choices were deliberate — keep them when adding new templates:

- **No web fonts** — system font stack only. Email clients load Google Fonts inconsistently, and the brand serif (`Crimson Pro`) is approximated with `Georgia` which is universally available.
- **No background images** — Outlook 2016+ on Windows strips them silently. Solid colors and gradients-via-`background:linear-gradient` (with solid-color fallback as the first `background:` declaration) are the safe path.
- **No JavaScript** — every email client strips `<script>` and event handlers.
- **No external CSS or images** — everything inline or base64-embedded; no `<link>` tags.
- **600px max-width** — desktop standard since 2008; responsive via `@media (max-width: 620px)`.
- **`<table role="presentation">` for layout** — Outlook does not understand modern flex/grid for layout; tables are the lowest-common-denominator that Just Works.
- **MSO conditional comments** for buttons — `<v:roundrect>` makes Outlook render rounded CTAs without falling back to ugly square buttons.
- **`@media (prefers-color-scheme: dark)`** — Apple Mail respects this; Gmail mostly inverts our light palette automatically. We don't ship a separate dark template, just dark-mode overrides on the same one.
- **WCAG AA contrast** — light theme: `#111827` on `#FFFFFF` (15:1), `#4B5563` on `#FFFFFF` (8:1); dark theme: `#F9FAFB` on `#111827` (15:1), `#9CA3AF` on `#111827` (5.7:1). All pass AA for body text.
- **44px CTA touch targets** — every button is at least 44px tall (Apple HIG / WCAG 2.5.5 Target Size recommendation).
- **Plain-text twin** — every HTML has a `.txt` sibling for spam filters that prefer multipart MIME and for accessibility-text-only readers.
