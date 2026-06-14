<!-- Audiences map — persona × layer authority. Hand-authored (not generated). -->

# tadaify — audiences

> Who the users are and **what each may see / do / not do on each layer**. This matrix is the negative
> authority other skills enforce: a control offered to a persona whose row marks it *cannot do* is a
> finding (prototyping/requirements catch it at design time; `grasp-building-supabase-apps` proves it
> as RLS). Personas defined here are the single canonical "souls" reused by downstream test-data
> personas — define once, here. See the domain doc: [`tadaify.md`](./tadaify.md).

## Personas

- **Visitor / fan** — anonymous; the creator's audience. Lands on a public creator page from social,
  clicks out, subscribes, buys via external links, books. Holds no tadaify account.
- **Prospective creator** — anonymous on the marketing site; evaluates tadaify and claims a handle to
  register. Becomes a Creator after OTP. (signup-first — no anonymous editing.)
- **Creator (account owner)** — the paying customer; owns exactly one handle/page at MVP and the
  account's billing. Tier (Free / Creator / Pro / Business) modulates what is unlocked *within* the
  dashboard, asserted at save — not a separate persona.
- **Team member (Business)** — a collaborator invited to a Business account (≤10, account-level); edits
  content but holds no ownership or billing authority. Included so design never grants them owner
  powers. (Distinct from an *agency master* managing N sub-account pages — see the open reconciliation
  note below and in [`tadaify.md`](./tadaify.md#open-reconciliation).)
- **Platform admin / staff** — internal operator; runs the admin-only marketing preview generator and
  the moderation/appeals queue under the binding Creator Safeguard. Not a creator-facing role.

## Layers

- **Public landing & marketing** — `tadaify.com`, `/pricing`, `/register`, `/login`, legal pages.
- **Public creator surfaces** — `tadaify.com/<handle>` and its sub-pages (about, blog, portfolio,
  contact, FAQ, schedule, products, newsletter, paid articles, legal). Creator-generated, world-readable.
- **Creator dashboard** — `/app/*`: blocks editor, design, insights, shop, page editors, settings
  (account, billing, security, GDPR, API keys, team, domain, affiliate). Auth-gated.
- **Platform admin** — `/admin/*` and `preview.tadaify.com`: marketing preview generator, moderation
  and `admin_appeals`. Staff-only.

## Authority matrix

| persona | layer | can see | can do | cannot do |
|---|---|---|---|---|
| Visitor / fan | Public landing & marketing | marketing, pricing, value props, handle-claim field, login link | browse; check handle availability; start a handle claim | enter dashboard or admin; edit any page; see another user's account data |
| Visitor / fan | Public creator surfaces | a creator's published page, profile card, pinned message, published blocks, sub-pages | click links; subscribe to newsletter; submit contact form; book a schedule slot; open external product links | edit anything; see hidden or scheduled-off blocks; view insights or draft/unpublished content |
| Prospective creator | Public landing & marketing | everything the visitor sees plus register and OTP-verify flows | claim a handle; register; verify email-OTP; sign in via Google, X, or email-OTP | build a page before the account is verified (signup-first); claim a handle already held or reserved |
| Creator (account owner) | Public creator surfaces | own live page exactly as visitors do, plus own hidden and scheduled blocks via preview or view-as | share the page; copy the handle link; preview as a visitor | edit content from the public surface (editing is dashboard-only); see other creators' private data |
| Creator (account owner) | Creator dashboard | all own page data, blocks, design, insights, settings, billing and plan state | create, edit, reorder, schedule, and publish blocks; customise theme and layout; run AI features within the monthly credit bucket; manage billing, custom domain, API keys, team (Business), affiliate; export or delete own account (GDPR) | use tier-gated features without upgrading (gate asserts at save); access other creators' accounts; enter platform admin; moderate anyone; claim a second handle at MVP |
| Creator (account owner) | Public landing & marketing | marketing and pricing while signed in | start an upgrade or downgrade via pricing or billing | claim an additional handle at MVP; change another account's plan |
| Team member (Business) | Creator dashboard | the Business account's page data, blocks, design, and insights they are granted | create, edit, reorder, schedule, and publish blocks; customise design; run AI within the account bucket | manage billing or the plan; add or remove members; transfer or delete the account; change the bound handle |
| Team member (Business) | Public creator surfaces | the account's live page as a visitor does, plus hidden and scheduled blocks via preview | preview and view-as for the account's page | edit content from the public surface; act on any account other than the one they were invited to |
| Platform admin / staff | Platform admin | the marketing preview generator, generated previews, the moderation queue, and `admin_appeals` | generate private 1-to-1 previews on `preview.tadaify.com`; take moderation action under Creator Safeguard; review and resolve appeals | disable the mandatory preview "not live" disclosure; skip the 48h notice or human appeal; edit or publish a creator's page content as them |
| Platform admin / staff | Public creator surfaces | any public creator page for moderation review | flag or hide a single block; escalate an account for review under Creator Safeguard | account-suspend without the 48h notice and appeal path; impersonate a creator; alter a creator's content silently |

## Notes on authority

- **Tier is not a persona.** Free / Creator / Pro / Business all share the Creator-owner rows above;
  the difference is *which dashboard capabilities are unlocked*, gated honestly at save
  ([DEC-043](../decisions/0007-everything-free-gating.md)) — never by hiding or disabling the control.
- **Agency multi-handle is an unresolved conflict, not settled as post-MVP.** The accepted decision
  [DEC-Q5-A](../decisions/0014-full-business-tier-at-mvp.md) ships agency sub-accounts (a master
  managing N pages) at MVP, while an engineering note flags it SPIKE-gated; see the open reconciliation
  in [`tadaify.md`](./tadaify.md#open-reconciliation). The matrix above models only the single-account
  case; the **agency-master** persona and cross-account authority rows are deferred to that
  reconciliation. The Business team-member rows are account-level guardrails and stand regardless.
- **Creator Safeguard binds the admin layer** ([DEC-SYN-05](../decisions/0021-creator-safeguard-48h-warning.md)):
  every "cannot do" in the admin rows above is a hard platform commitment, not a UI nicety.
