# P7 — e2e `<AREA>` → spec mapping (grasp-app-structure, issue #310)

Phase **P7** of adopting `grasp-app-structure` in tadaify-app (sub-issue of epic #303):
**module-first e2e layout + canonical `Covers:` headers, grandfathering the 41**.

Contract: `agents-local/skills/grasp-app-structure/reference/e2e.md`. Module slugs
(`<AREA>`) and BR ids come from the merged **P4** registry (`docs/modules/registry.yml`)
and **P3** business requirements (`docs/requirements/business/*.md`).

## What changed

- **Scaffolding (new, module-first):** `e2e/modules/blocks/` + parallel
  `e2e/plans/blocks/` — the first adopted area (`BLOCKS`, the registry's worked
  example). One **new** reference spec,
  `e2e/modules/blocks/block-link-create.spec.ts`, carries all **4 canonical header
  keys** (`Module:` / `Covers:` / `Routes:` / `Story:`) with its companion plan
  `e2e/plans/blocks/block-link-create.plan.md`.
- **Grandfather (the 41):** the existing feature-flat `e2e/*.spec.ts` are **NOT
  relocated** (paths unchanged). Each gained a canonical JSDoc header block — a
  `Module:` line resolving to one P4 `<AREA>`, and a `Covers:` line whose first
  match carries ≥1 canonical `BR-…`/`TR-…` token. A legacy spec migrates into
  `e2e/modules/<AREA>/` only when its module is next touched — never bulk.

The injected header is placed at the top of each spec's JSDoc; the validator reads
the **first** `Module:`/`Covers:` match, so the canonical tokens win while all the
original prose (TC ids, `AC#`, `ECN-…`, `DEC-…`, run commands) is preserved below
as non-parsed free-form.

## `<AREA>` slugs (from P4 `docs/modules/registry.yml`)

`ONBOARDING`, `APP-DASHBOARD`, `APP-DESIGN`, `APP-PAGES`, `APP-INSIGHTS`,
`APP-SETTINGS`, `BLOCKS`, `LANDING`, `PUBLIC-PAGES`, `AUTH`, `ADMIN`, `SHARED`.
Directory `<AREA>` segments under `e2e/modules/` and `e2e/plans/` are the
kebab-case lowercase form of the same slug (e.g. `BLOCKS` → `blocks/`).

## Mapping table (spec → `<AREA>` → canonical `Covers:`)

### New module-first spec

| Spec | `<AREA>` (`Module:`) | Canonical `Covers:` |
|------|----------------------|---------------------|
| `e2e/modules/blocks/block-link-create.spec.ts` | `BLOCKS` | BR-CREATOR-001, BR-DASH-004, TR-tadaify-008 |

### Grandfathered flat specs (41, paths unchanged)

| Spec (`e2e/…`) | `<AREA>` (`Module:`) | Canonical `Covers:` |
|----------------|----------------------|---------------------|
| `app-dashboard-design.spec.ts` | `APP-DESIGN` | BR-DASH-003 |
| `app-dashboard.spec.ts` | `APP-DASHBOARD` | BR-DASH-001, BR-DASH-002, BR-DASH-006, BR-DASH-007, BR-DASH-008, BR-DASH-009, BR-DASH-010, TR-tadaify-005 |
| `auth-email-templates.spec.ts` | `AUTH` | BR-AUTH-002, TR-AUTH-01 |
| `block-crud-delete-api.spec.ts` | `BLOCKS` | BR-CREATOR-001, TR-tadaify-008 |
| `block-crud-duplicate-api.spec.ts` | `BLOCKS` | BR-CREATOR-001, TR-tadaify-008 |
| `block-crud-list.spec.ts` | `BLOCKS` | BR-CREATOR-001, BR-DASH-004 |
| `block-crud-reorder-api.spec.ts` | `BLOCKS` | BR-CREATOR-001, TR-tadaify-008 |
| `block-crud-rls-isolation.spec.ts` | `BLOCKS` | BR-CREATOR-001, TR-tadaify-008 |
| `block-editor-modal.spec.ts` | `BLOCKS` | BR-DASH-004, TR-tadaify-008 |
| `block-picker-modal.spec.ts` | `BLOCKS` | BR-DASH-004, TR-tadaify-014 |
| `critical-path.spec.ts` | `LANDING` | BR-LANDING-001, BR-AUTH-001 |
| `email-templates-show-handle.spec.ts` | `AUTH` | BR-AUTH-002 |
| `icon-picker.spec.ts` | `BLOCKS` | BR-DASH-004, TR-tadaify-014 |
| `landing-no-guest-mode.spec.ts` | `LANDING` | BR-LANDING-001 |
| `link-block-complete.spec.ts` | `BLOCKS` | BR-CREATOR-001, BR-DASH-004 |
| `link-block.spec.ts` | `BLOCKS` | BR-CREATOR-001, BR-DASH-004 |
| `login-copy-log-in.spec.ts` | `AUTH` | BR-AUTH-005 |
| `login-no-account.spec.ts` | `AUTH` | BR-AUTH-005, TR-AUTH-01 |
| `login-redirect-to-app.spec.ts` | `AUTH` | BR-AUTH-005 |
| `onboarding-avatar-upload.spec.ts` | `ONBOARDING` | BR-ONBOARDING-003, TR-tadaify-003 |
| `onboarding-no-coming-soon-leaks.spec.ts` | `ONBOARDING` | BR-ONBOARDING-004, BR-ONBOARDING-005 |
| `onboarding-preview-pane.spec.ts` | `ONBOARDING` | BR-ONBOARDING-003 |
| `onboarding-template-preview-cards.spec.ts` | `ONBOARDING` | BR-ONBOARDING-004 |
| `onboarding-template-radio.spec.ts` | `ONBOARDING` | BR-ONBOARDING-004 |
| `onboarding-tier-completion.spec.ts` | `ONBOARDING` | BR-ONBOARDING-005, BR-ONBOARDING-006 |
| `onboarding-tier-persistence.spec.ts` | `ONBOARDING` | BR-ONBOARDING-005, TR-tadaify-004 |
| `onboarding-tier-pricing-source-of-truth.spec.ts` | `ONBOARDING` | BR-ONBOARDING-005 |
| `onboarding-welcome-mockup-parity.spec.ts` | `ONBOARDING` | BR-ONBOARDING-001 |
| `onboarding-wizard.spec.ts` | `ONBOARDING` | BR-ONBOARDING-001, BR-ONBOARDING-002, BR-ONBOARDING-006 |
| `otp-grid-layout.spec.ts` | `AUTH` | BR-AUTH-002 |
| `otp-rate-limit.spec.ts` | `AUTH` | BR-OTP-001, BR-AUTH-008 |
| `persistent-welcome-header.spec.ts` | `APP-DASHBOARD` | BR-DASH-005 |
| `post-onboarding-direct-to-dashboard.spec.ts` | `APP-DASHBOARD` | BR-DASH-001, BR-ONBOARDING-006 |
| `product-block-complete.spec.ts` | `BLOCKS` | BR-CREATOR-001, BR-DASH-004 |
| `public-render.spec.ts` | `PUBLIC-PAGES` | BR-CREATOR-001 |
| `register-cascade.spec.ts` | `AUTH` | BR-AUTH-001, BR-AUTH-002, BR-AUTH-003, BR-AUTH-004 |
| `register-handle-taken-smart-alternatives.spec.ts` | `AUTH` | BR-AUTH-006, BR-AUTH-007 |
| `register-mockup-match.spec.ts` | `AUTH` | BR-AUTH-001 |
| `register-no-duplicate-phone-disclaimer.spec.ts` | `AUTH` | BR-AUTH-001 |
| `register-welcome-copy-varying.spec.ts` | `APP-DASHBOARD` | BR-DASH-005 |
| `sso-providers-list.spec.ts` | `AUTH` | BR-AUTH-001 |

## Slug resolution check

Every `Module:` value above is a key in `docs/modules/registry.yml → modules:`,
so each resolves to exactly one module row. Every canonical `Covers:` token is a
real id defined in `docs/requirements/business/*.md` (BR) or
`docs/requirements/technical/*.md` (TR).

## BR coverage (validator check 9)

All **27** accepted UI/business BRs now have ≥1 covering spec via these headers, so
the validator's `BR-without-e2e` warnings for tadaify's accepted BRs are cleared:

- `AUTH`: BR-AUTH-001 … BR-AUTH-008, BR-OTP-001
- `ONBOARDING`: BR-ONBOARDING-001 … BR-ONBOARDING-006
- `APP-DASHBOARD` / `APP-DESIGN`: BR-DASH-001 … BR-DASH-010
- `LANDING`: BR-LANDING-001
- `BLOCKS` / `PUBLIC-PAGES`: BR-CREATOR-001

> Some dashboard BRs (e.g. BR-DASH-006…010) are covered by the `app-dashboard`
> shell spec because that spec exercises the rendered dashboard surface those BRs
> describe; the per-panel `<AREA>` rows (`APP-INSIGHTS`, `APP-SETTINGS`, …) stay
> in the P4 registry and adopt their own module-first specs as each panel is next
> touched.
