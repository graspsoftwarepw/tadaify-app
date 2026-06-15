---
id: fr-settings
title: Creator Settings area
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/settings]
related_files:
  - src/proto/screens/settings/SettingsShell.tsx
  - src/proto/screens/settings/SettingsScreen.tsx
  - src/proto/screens/settings/settings-proto.css
  - src/proto/screens/settings/AccountTab.tsx
  - src/proto/screens/settings/accountFixture.ts
  - src/proto/screens/settings/ThemeTab.tsx
  - src/proto/screens/settings/themeFixture.ts
  - src/proto/screens/settings/BillingTab.tsx
  - src/proto/screens/settings/billingFixture.ts
  - src/proto/screens/settings/SecurityTab.tsx
  - src/proto/screens/settings/securityFixture.ts
  - src/proto/screens/settings/GdprTab.tsx
  - src/proto/screens/settings/gdprFixture.ts
  - src/proto/screens/settings/ApiKeysTab.tsx
  - src/proto/screens/settings/apiKeysFixture.ts
  - src/proto/screens/settings/TeamTab.tsx
  - src/proto/screens/settings/teamFixture.ts
  - src/proto/screens/settings/DangerTab.tsx
  - src/proto/screens/settings/dangerFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Creator Settings area

The creator-facing Settings area a creator opens from the dashboard sidebar, ported from
`mockups/tadaify-mvp/app-settings*.html`. It renders inside the creator dashboard chrome
(appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) and uses the
global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- Settings shall be a single route. The active section is chosen by local tab state — clicking a left
  nav-rail item switches the rendered section in place (an SPA, not nine separate routes).
- The shell shall render: the dashboard appbar + sidebar, a page header (title + one-line
  description, with optional header actions on the right), a left `.settings-nav` rail listing every
  section, and the active section's content to the right of a divider.
- The nav rail shall be the ordered list: Account, Billing, Security, GDPR & data, Theme (New pill),
  a divider, API keys (Pro pill), Team (Business pill), a divider, Danger zone (rendered in the danger
  colour). The active item is highlighted and marked `aria-current="page"`.
- The **Team (Business)** tab is the seat surface for the **Team member (Business / agency)** persona
  defined in [`docs/domain/audiences.md`](../../../domain/audiences.md) — it backs the post-MVP agency
  use-case (one account managing many creator profiles). Member-management, role, SSO and audit
  controls shown here are owner-delegated; the owner-only powers (billing, plan, member management,
  account transfer/delete) never delegate to a team member.
- A section may opt into a shared sticky save-bar at the bottom of the viewport. The save-bar shows a
  status hint with a state dot, a "Discard" button, and a primary button; switching tabs clears it.
- On phones the nav rail shall collapse to a horizontal scrolling pill strip and the content drops its
  left divider; the save-bar offsets to clear the sidebar at desktop and tablet widths.

## Account section (hub landing)

- Account shall be the default section and the hub landing (the page header reads "Settings").
- **Profile photo** — an avatar circle with Upload / Remove actions (mocked) and a format hint.
- **Profile** — display name, a bio textarea with a live character counter against a max, and an
  optional pronouns field. Editing any field flips the shell save-bar to "Unsaved changes".
- **Account identity** — a handle field prefixed with `tadaify.com/` showing a status pill and a
  one-change-per-30-days note; its Save button enables only once the handle changes and opens a
  centred confirm modal explaining the 30-day redirect and that custom domains stay bound to the
  account. A read-only email field offers a "Change email →" action that opens a centred modal
  (new email + password confirm). A footer line cross-links to the GDPR & data section.

## Theme section

- The header shows a "Preview only" badge; the section opts into the save-bar with the copy
  "Preview only — your live page hasn't changed yet." and an "Apply theme" button.
- The content is a two-column grid — controls on the left, a sticky live-preview pane on the right
  (with desktop / tablet / mobile device switches) that reflows to one column on narrow widths.
- Controls: a **preset gallery** (eight cards, one active, plus "Surprise me"); a Pro-badged
  **custom palette** of four colour swatches (each opens a centred colour picker) with "Match my
  logo" / "Random palette" / save / reset actions; **typography** (display + body font/weight
  selects, letter-spacing and line-height sliders, a Business-badged custom-font uploader with an
  uploaded-fonts list); **background style** (four type radio cards incl. a Pro custom-image option,
  plus a Pro-badged pattern-overlay row with an opacity slider); **spacing & density** (three radio
  cards); a Business-badged **custom CSS** editor block with a disclaimer; and a Pro-badged
  **theme history** list with per-row Revert.
- Premium controls (palette, custom fonts, custom image, patterns, custom CSS, history) shall stay
  fully visible and interactive on every tier; the upgrade gate is mocked at Apply.

## Billing section

- **Current plan** — a plan card (icon, name, price, locked-for-life + Active chips, Change/Downgrade
  actions) with a monthly/yearly cadence toggle in the section head; switching cadence flips the shell
  save-bar to dirty with a "Save cadence" button, and a "Compare plans" expander reveals a four-plan
  comparison grid (the current plan's CTA is disabled).
- **Payment method** — the card on file (brand, masked number, expiry, billing email) with an Update
  card action and a Stripe-trust note (all mocked).
- **Recent invoices** — a status-filtered table (Date, Description, Amount, Status, PDF) with a
  showing-N-of-M footer; rows and the full-history link are mocked. The table scrolls horizontally
  within its card on narrow widths.
- **Manage in Stripe** — primary "Manage billing in Stripe" plus Update card / All invoices actions
  (mocked); the cancel cross-link opens a centred multi-step cancel-flow modal (reason → confirm →
  done).
- **Custom domain add-ons** — one row per active domain ($1.99/mo) with a Manage domains action.
- **Billing email** — a read-only card cross-linking to the Account tab.

## Security section

- Security changes apply immediately — this section never raises the save-bar.
- **Sign-in password** — a "Last changed N days ago" chip, a Change password action (opens a centred
  modal: current / new / confirm + sessions-revoked notice), and a Sign-out-everywhere action (opens a
  centred confirm modal).
- **Authenticator app (TOTP)** — an Enabled/Disabled status pill; when enabled it shows the enrolment
  date + last-used, a Disable 2FA action (centred confirm modal), a backup-codes row (unused count,
  View remaining + Regenerate modals), and a recovery-method note; when disabled it shows a Set-up
  action that opens the centred 3-step setup modal (scan QR → verify code → save backup codes).
- **Active sessions** — a list of devices (icon, device, location, IP, last seen) with per-row Sign out
  (disabled for the current session) and a Sign-out-all action (centred confirm modal).
- **Login history** — a read-only audit log filterable by All / Successful / Failed, with a mocked
  Download-as-CSV link. The log scrolls within its card on narrow widths.
- **Connected accounts** — OAuth provider cards (Google connected, GitHub/Apple not) with
  Connect (mocked) / Disconnect (centred confirm modal) actions.
- A right-hand recommendations rail shows a security score and prioritised recommendations; it reflows
  below the main column on narrow widths.

## GDPR & data section

- This section is mostly actions and exports — it never raises the save-bar.
- A ready-export banner with a mocked Download action sits above the sections.
- **Export your data (Art. 20)** — a hero with a Request export action that opens a centred modal (a
  category checklist + format note + Generate); plus a recent-exports table (Requested, Status, Size,
  Expires, Download) where expired rows are disabled. The table scrolls within its card on narrow widths.
- **Cookies tadaify uses** — an essential-cookies notice (login session, security, CSRF) with an
  always-on locked toggle; states plainly there is no analytics or marketing cookie.
- **Visitor analytics — cookieless, no consent banner** — an explainer that tadaify counts visits
  without cookies and without a consent banner (privacy-preserving daily-salt hashing), so there is
  nothing for visitors to consent to and no banner to configure. There is **no** visitor
  cookie-consent-banner configuration surface — that would contradict the cookieless positioning in
  `docs/domain/tadaify.md`. GDPR data rights (export, erasure) remain fully available regardless.
- **Personal data on tadaify** — a data-stat summary grid and a "View detailed breakdown" expander
  revealing a per-category table.
- **Policies you've accepted** — a table (Policy, Version, Accepted on, View) with mocked View / "View
  what changed" links and a new-version tag.
- **DPA & subprocessors (Pro+)** — controller/processor explanation, a Download DPA action (mocked,
  gated at click), and the current-subprocessor list with a mocked View list action.
- **Right to be forgotten (Art. 17)** — an erasure card cross-linking to the Danger zone tab (mocked).

## Modals

- Every modal shall be centred (never a side drawer) and shall close on Escape, on a backdrop click,
  and on Cancel. The Account section uses the change-email and change-handle modals; the Theme section
  uses the colour-picker modal.

## Theming & responsiveness

- The whole area shall render correctly in light and dark themes and adapt across desktop, tablet, and
  phone widths (the nav rail, section cards, field rows, preset/swatch/radio grids, and the theme
  preview pane all reflow on narrow screens).
