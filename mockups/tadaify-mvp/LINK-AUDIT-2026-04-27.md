# Mockup link audit — 2026-04-27

Cross-link audit of `mockups/tadaify-mvp/` (49 standalone pages + 12 email templates + 1 shared partials JS + 1 shared header partial).

**Branch:** `chore/link-audit-and-fixes`
**Tool:** `/tmp/link-audit.py` (custom Python discovery + validator). Raw inventory at `/tmp/link-audit-inventory.json`, per-link verdicts at `/tmp/link-audit-results.json`.

---

## Summary

| Metric | Pre-audit | Post-fix |
|---|---:|---:|
| Total links scanned | 1079 | 1079 |
| ok | 988 | 1016 |
| broken-file | 61 | 58 |
| broken-hash | 30 | 5 |

**Net: 28 broken links repaired across 9 files. 5 broken-hash + 58 broken-file remain — all are intentional placeholders (template variables, mockup stubs, semantic mismatches needing a separate design decision).**

### By category (post-fix)

| Category | Count |
|---|---:|
| internal (file/path) | 547 |
| skip (`#`, `mailto:`, `tel:`, `javascript:`) | 190 |
| external (non-graspsoftwarepw URLs) | 171 |
| hash-route (in-file SPA `#/route`) | 89 |
| hash-only (in-file `#anchor`) | 63 |
| issue-url (graspsoftwarepw/tadaify-app issues) | 18 |
| gh-other (graspsoftwarepw/tadaify-app issue index) | 1 |

External links + in-file hash routes were not opened (no internet probes); only graspsoftwarepw issue URLs were live-checked via `gh issue view`.

### Issue URL validation

All 18 in-mockup references to `https://github.com/graspsoftwarepw/tadaify-app/issues/N` resolve to live issues (#5, #6, #14, #15, #16, #17, #19, #20, #21, #22, #23, #33, #35, #39, #52, #53, #55, #62). No dead-issue references found.

### GitHub blob URLs

Zero `https://github.com/graspsoftwarepw/tadaify-app/blob/<branch>/...` references in the mockup library — the `feedback_story_refs_main_not_branch.md` rule is naturally satisfied since the mockups don't link to repo source files. No `/blob/feat/` or `/blob/chore/` URLs to retarget.

---

## Fixes applied

### 1. File-path drift `app-settings-api.html` → `app-settings-apikeys.html` (commit `43181b1`)

The canonical file is `app-settings-apikeys.html`. Two settings sidebar entries pointed at the never-existed `app-settings-api.html`.

| File | Before | After |
|---|---|---|
| `app-settings-billing.html:782` | `./app-settings-api.html` | `./app-settings-apikeys.html` |
| `app-settings-team.html:1083` | `./app-settings-api.html` | `./app-settings-apikeys.html` |

### 2. Cross-page settings hash links → standalone sub-pages (commit `471f1f8`)

`app-settings.html` does not have `id="<tab>"` attributes nor a hash router — `switchTab()` ignores the URL hash. Links from sibling settings pages used `app-settings.html#TAB` and silently 404 the user to the default tab. Each tab has a dedicated standalone page; retarget the 20 cross-page navs.

Mapping:

| Hash | New target |
|---|---|
| `#api` | `app-settings-apikeys.html` |
| `#team` | `app-settings-team.html` |
| `#danger` | `app-settings-danger.html` |
| `#account` | `app-settings-account.html` |
| `#security` | `app-settings-security.html` |
| `#gdpr` | `app-settings-gdpr.html` |
| `#billing` | `app-settings-billing.html` |

Files touched (20 individual link replacements): `app-insights.html`, `app-settings-account.html`, `app-settings-danger.html`, `app-settings-gdpr.html`, `app-settings-security.html`, `app-settings-theme.html`.

### 3. Internal hash anchors + relative paths (commit `8226a52`)

| File:line | Before | After | Reason |
|---|---|---|---|
| `creator-legal-public.html:992` | `<a href="../landing.html">` | `<a href="./landing.html">` | Wrong relative path — file is in same dir as `landing.html` |
| `error-pages.html:618` | `./landing.html#how-it-works` | `./landing.html` | `#how-it-works` doesn't exist on landing; drop hash so link still lands |
| `app-settings-billing.html:1156` | `./app-settings-account.html#contact` | `mailto:support@tadaify.com?subject=Billing%20question` | No `#contact` anchor on account page; switch to mailto pattern used elsewhere (`app-settings-security.html`, `app-settings-team.html`) |
| `pricing.html:554` | `<tr class="category-row">` | `<tr class="category-row" id="guarantee">` | Added anchor — referenced by `app-settings-billing.html:888` "price-lock-for-life guarantee" |
| `pricing.html:425` | `<div class="tier">` | `<div class="tier" id="business">` | Added anchor — referenced by `app-settings-team.html:1139` and `app-settings-team.html:1484` ("Business plan ($49/mo)") |

### 4. Shared header partial alignment (commit `0eb7fed`)

`shared/partials.js` (the actual injector code) already used `./index.html` with a TODO comment for the templates/trust nav items. The documentation-mirror file `shared/header.html` had drifted to `./landing.html#templates` and `./landing.html#trust` which don't exist as anchors anywhere on `landing.html`. Aligned the static partial with the JS source.

| File:line | Before | After |
|---|---|---|
| `shared/header.html:21` | `./landing.html#templates` | `./index.html` (with TODO comment) |
| `shared/header.html:22` | `./landing.html#trust` | `./index.html` |

---

## Report-only items (intentional, NOT fixed)

These show as broken to a naive validator but are intentional placeholders. Listed for traceability — no PR action needed.

### Mockup `alert()` stubs for unbuilt pages

| File:line | Link | Why intentional |
|---|---|---|
| `app-settings-team.html:1439` | `./app-team-audit-log.html` | Wrapped in `onclick="event.preventDefault();alert('Mockup: would link to /app/team/audit-log full page (paginated 50/page)')"`. Explicit stub for a page that hasn't been mocked yet. |
| `app-page-legal.html:1594` | `./app-settings.html#cookie-banner` | Wrapped in `onclick="alert('Mockup — opens cookie banner config in Settings')"`. Target settings sub-section doesn't exist anywhere; needs a design decision about which settings page should host cookie-banner config. |

### Placeholder text inside form fields

| File:line | Link | Why intentional |
|---|---|---|
| `app-page-newsletter-signup.html:1373` | `/privacy` (inside `<textarea>` showing default consent copy) | Sample copy displayed to creators inside a textarea — represents what their visitors will see. The actual URL is rendered dynamically when the page is published. Changing it would break the preview's intent. |

### Semantic mismatch (need design decision, not link fix)

| File:line | Link | Issue |
|---|---|---|
| `app-settings-gdpr.html:1221` | `./app-page-legal.html#tos` | Wants tadaify's own ToS but `app-page-legal.html` is the **creator's editor** for THEIR brand's legal text. tadaify's own ToS / Subprocessors / AUP pages don't exist as mockups yet. |
| `app-settings-gdpr.html:1246` | `./app-page-legal.html#subprocessors` | Same as above — refers to tadaify's subprocessor list, no mockup exists. |
| `app-settings-gdpr.html:1255` | `./app-page-legal.html#aup` | Same as above — refers to tadaify's Acceptable Use Policy. |
| `app-settings-gdpr.html:1338` | `./app-page-legal.html#subprocessors` | Same as above (second occurrence in the same file). |

**Suggested follow-up:** create a separate `tadaify-legal.html` mockup (or a section on `landing.html`) hosting tadaify's own platform terms, then retarget these 4 links.

### Email template variables

`mockups/tadaify-mvp/emails/resend/*.html` and `mockups/tadaify-mvp/emails/supabase-auth/*.html` contain placeholders like `{{download_url}}`, `{{ .ConfirmationURL }}`, `{{ .SiteURL }}/privacy`. These are Resend / Supabase template syntax — substituted at send time. 31 occurrences across 11 email templates. NOT broken — leave as-is.

### `shared/partials.js` + `shared/header.html` relative paths (false positives)

The audit tool resolves paths relative to the file that **contains** the link. For `shared/partials.js` and `shared/header.html`, the contained HTML is **injected into** consumer pages in `mockups/tadaify-mvp/`, where `./landing.html` etc. correctly resolves. 27 broken-file flags in this category are false positives, not real navigation bugs.

---

## Tooling

Re-run the audit at any time:

```bash
python3 /tmp/link-audit.py 2>&1 | tail -80
```

Inputs:
- Scans every `*.html` under `mockups/tadaify-mvp/` recursively + `shared/*.js`.
- Captures: `href=`, `action=`, `formaction=`, `data-href=`, `window.location*=`, `window.open(...)`, raw `https://github.com/...` URLs in text/comments.
- Skips: empty `#`, `mailto:`, `tel:`, `javascript:`, `data:` URIs.

Outputs:
- `/tmp/link-audit-inventory.json` — every raw match (file, line, link_type, target).
- `/tmp/link-audit-results.json` — per-link verdict (`ok` / `broken-file` / `broken-hash` / `wrong-blob-path` / `dead-issue`).
