<!-- Audiences map — persona × layer authority. Hand-authored (not generated). -->

# tadaify — audiences

> Who the users are and **what each may see / do / not do on each layer**. This matrix is the negative
> authority other skills enforce: a control offered to a persona whose row marks it *cannot do* is a
> finding (prototyping/requirements catch it at design time; `grasp-building-supabase-apps` proves it
> as RLS). It is **complete** — every persona × layer combination has a row, including the ones where
> the answer is "no access", because an omitted combination reads as ambiguity, not denial. Personas
> defined here are the single canonical "souls" reused by downstream test-data personas — define once,
> here. See the domain doc: [`tadaify.md`](./tadaify.md).

## The audiences (Owner's model)

tadaify has **four** audiences (the fourth — the Business/agency team member — is a Business-tier
capability aimed at a post-MVP agency customer):

1. **Creator (influencer)** — our core **customer**. Comes to put themselves out there fast: claims a
   handle, picks a template, clicks together their page from modules, publishes, and watches their
   cookieless insights. Often someone fed up with cookie nags / paywalled basics / forced branding
   elsewhere. Pays for premium unlocks (incl. cheap branding removal). On the **Business** tier this
   same account-owner role can be a **marketing agency** managing many creator profiles (e.g. dozens of
   influencers) under one tadaify account, and inviting team members to help run them (see persona 4).
2. **Public visitor (follower / subscriber)** — the creator's own audience. **Anonymous**, holds no
   tadaify account; just visits the hosted public page, follows links out, subscribes, buys via the
   creator's external links, reads. May post and vote on the embedded "ask before ship" board where a
   creator has one.
3. **Platform admin (the Owner)** — runs tadaify. Has an admin dashboard for the business: who pays,
   how much, plans and promotions, platform operations, and **trust & safety / moderation**. Because
   tadaify hosts open self-registered profiles, the admin must assume bad actors alongside legitimate
   creators — scammers, fraudsters, and adult / OnlyFans-style or regionally-sensitive content that
   may be legal in one country and not another — and react to user reports by warning or taking down
   profiles. May **impersonate** a creator ("login as user") to investigate or assist, but only from
   the moderation/support path and only with a visible banner and a full audit trail. Not a
   creator-facing role and never edits a creator's page content as them outside such a logged session.
4. **Team member (Business / agency)** — a collaborator the Business account owner invites and assigns
   a role. Helps run the account's profile(s) and content from the dashboard, but never owns billing or
   the account itself. The seat model behind the agency use-case (one account, many managed profiles,
   several people). Business-tier capability; the agency customer is a **post-MVP** target, so this
   persona is forward-looking but is modelled now to justify the Settings → Team surface.

## Layers (app surfaces)

- **Public marketing & signup** — `tadaify.com` landing, pricing, register / login.
- **Public creator page** — `tadaify.com/<handle>` and its sub-pages, hosted by tadaify's engine.
- **Creator dashboard** — `/app/*`: template + module editor, design, insights, shop, settings,
  billing. Auth-gated.
- **Admin dashboard** — `/admin/*`: billing/revenue overview, plans & promotions, platform ops, and
  trust & safety — the report/moderation queue, warnings + cure-period workflow, take-downs, logged
  impersonation, and the continuous agent-monitoring feed. Owner-only.

## Authority matrix

Complete: 4 personas × 4 layers = 16 rows.

| persona | layer | can see | can do | cannot do |
|---|---|---|---|---|
| Creator (influencer) | Public marketing & signup | marketing, pricing, value props, handle-claim field, login | check handle availability; claim a handle; register and verify via email-OTP; sign in; start an upgrade | build a page before the account is verified; claim a handle already held or reserved |
| Creator (influencer) | Public creator page | own live page as visitors see it, plus own hidden / scheduled modules via preview | share the page; copy the handle link; preview / view-as a visitor | edit content from the public surface (editing is dashboard-only); see another creator's private data |
| Creator (influencer) | Creator dashboard | all own page data, modules, template/design, own insights, settings, billing and plan state | pick a template; add, arrange, edit, schedule and publish modules; customise the design; run AI within the plan allowance; manage billing and cheap branding removal; export or delete own account | use a paid feature without upgrading (gate asserts at save); access another creator's account; see platform-wide revenue or other creators' data |
| Creator (influencer) | Admin dashboard | nothing — the admin surface is not exposed to creators | nothing | reach `/admin/*`; see platform revenue, other creators' billing, plans/promotions config, or the moderation queue |
| Public visitor (follower) | Public marketing & signup | marketing, pricing, the handle-claim field | browse; start a handle claim to become a creator | reach any dashboard or admin surface; see another user's account data |
| Public visitor (follower) | Public creator page | a creator's published page, profile, published modules, sub-pages | click links; subscribe to a newsletter; submit a contact form; book a schedule slot; open external product links; read public content; post and vote on an embedded "ask before ship" board | edit anything; see hidden / scheduled-off / draft modules; view the creator's insights |
| Public visitor (follower) | Creator dashboard | nothing — the dashboard is auth-gated | nothing | reach `/app/*`; view or edit any creator's modules, insights, settings, or billing |
| Public visitor (follower) | Admin dashboard | nothing — the admin surface is internal | nothing | reach `/admin/*`; see any billing, revenue, plan, or moderation data |
| Platform admin (Owner) | Public marketing & signup | the public marketing and pricing pages, like anyone | browse the public site | gain creator or admin privileges from this layer (it grants none) |
| Platform admin (Owner) | Public creator page | any public creator page for moderation review, including content reported as scam / fraud / adult / regionally-illegal | flag or hide a module; issue a warning that starts the clear cure-period workflow; take down a page or account; review user reports; escalate for review | act outside the audited moderation path; edit a creator's content silently (every moderation action is logged) |
| Platform admin (Owner) | Creator dashboard | a creator's dashboard **only via logged, audited impersonation** ("login as user"), entered from the admin moderation/support path | impersonate a creator to investigate or assist, with every action logged and an impersonation banner shown; exit impersonation | enter a creator's dashboard silently or un-audited; impersonate outside the moderation/support path (the impersonation banner + audit log are mandatory) |
| Platform admin (Owner) | Admin dashboard | platform-wide billing and revenue, plans and promotions, platform ops, the moderation/report queue, take-down history, the warning/cure-period workflow, and the continuous agent-monitoring feed | view payments and revenue; configure plans and promotions; run platform operations; triage user reports; issue warnings and run the cure-period workflow; take down content/accounts; launch a logged impersonation; take moderation action | edit or publish a creator's page content as them outside an audited impersonation session |
| Team member (Business / agency) | Public marketing & signup | marketing and pricing, like anyone | browse the public site; accept an invite to join a Business account | self-provision a Business account or change its plan from here |
| Team member (Business / agency) | Public creator page | the account's public profile(s) as a visitor sees them, plus hidden/scheduled modules via preview | preview / view-as for the profiles they manage | edit content from the public surface; touch a profile outside the account they were invited to |
| Team member (Business / agency) | Creator dashboard | the Business account's managed profile(s), modules, design, insights and team roster, scoped to their assigned role | create, edit, schedule and publish modules; customise design; run AI within the account allowance; manage profiles their role permits | manage billing or the plan; add / remove members or change roles; transfer or delete the account; act on another agency's account (all owner-only) |
| Team member (Business / agency) | Admin dashboard | nothing — the admin surface is platform-staff-only | nothing | reach `/admin/*`; see platform revenue, plans, or the moderation queue |

## Notes on authority

- **Team member is a Business/agency seat, owner-delegated.** The Owner ratified adding this persona to
  back the agency use-case (one Business account managing many creator profiles for, e.g., 50
  influencers). A team member's authority is always a subset the account owner grants by role; the
  owner-only powers (billing, plan, member management, account transfer/delete) never delegate. Agencies
  are a **post-MVP** customer, so treat this persona as forward-looking — do not build multi-profile
  agency mechanics into MVP data/flows without a fresh Owner decision; the Settings → Team surface is
  the seam where it lands.
- **Tier is not a persona.** Free and paid creators share the Creator rows; tiers only change *which
  dashboard capabilities are unlocked*, gated honestly at save (`app/lib/tier-gate.ts`) — never by
  hiding or disabling a control.
- **The visitor is always anonymous.** No public-page action requires a tadaify account; feedback-board
  posting/voting is the visitor's only "write", and it belongs to the creator's board, not a tadaify
  account.
- **Admin is the Owner's business cockpit**, not a creator surface; its powers are revenue/plan/ops and
  trust & safety, never content authorship on a creator's behalf.
- **Moderation and impersonation are audited, never silent.** tadaify deliberately plans for bad actors
  (scam / fraud / adult / regionally-illegal content) alongside legitimate creators. Anyone can report a
  profile; the admin triages reports, and may warn, take down, or **impersonate** ("login as user") a
  creator to investigate or assist. Impersonation is allowed **only** from the moderation/support path,
  always shows an impersonation banner, and logs every action to the audit trail — the matrix permits
  it on exactly those terms and forbids any silent or un-audited entry into a creator's dashboard. A
  differentiator is the **clear warning path**: a warned creator gets an explicit "you've been warned,
  N days to cure" view rather than a silent strike, and tadaify agents monitor profiles continuously to
  surface serious issues early.

  > **Owner-ratified change (2026-06-15).** The Platform admin rows previously forbade impersonation
  > outright. The Owner ratified opening it as an **audited, banner-visible** moderation/support
  > capability — tadaify hosts open self-registration and must plan for scam / fraud / adult /
  > regionally-sensitive content, react to user reports, take down profiles, and let support
  > "login as user" to investigate or assist. This authority change was made by Owner decision (not to
  > fit a mockup); the trust & safety reporting → warn/cure-period → take-down workflow and continuous
  > agent monitoring were ratified in the same decision.
