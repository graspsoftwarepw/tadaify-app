# Tadaify App — Claude instructions

Project-level guidance for any Claude agent working on `graspsoftwarepw/tadaify-app`.

Applies to every session, every branch, every story. Extends the global `~/.claude/CLAUDE.md`.

---

## Marketing pillars (locked 2026-04-26)

Tadaify positioning rests on four flagship value props. Reinforce these on landing page, pricing page, onboarding flow, and any creator-facing UI surface:

1. 🔒 **Privacy-first** — no cookies, no tracking, ever (DEC-075 cookieless daily salt)
2. 🔌 **First creator analytics API in link-in-bio** — Pro 100 req/h, Business 1000 req/h (DEC-080)
3. 🎁 **Most generous Free in link-in-bio analytics** — full dataset (cross-tab, geo+city, device+browser+referrer detail) at hourly cadence + 7-day window (DEC-076 Option 9)
4. 👥 **Agency-friendly Business** — 5 handles + 10 team members for $49/mo (DEC-083) — **Phase B work pending multi-handle SPIKE; do NOT implement until SPIKE + sub-decisions are locked**

When designing or implementing any user-facing surface, ask: "does this surface reinforce these pillars or work against them?"

---

## Tier-gating discipline — no fake margin

When gating any feature behind a paid tier, classify it FIRST:

### Category A — real infra cost differential (gate freely)
Examples: Durable Objects live-view sessions, R2 reads/downloads, email API calls, rate-limited API access, A/B testing compute, identity stitching. Gate these — cite the actual marginal $/mo cost.

### Category B — storytelling / explicit upsell hook (gate only with user buy-in)
The feature costs $0 to deliver across tiers but functions as a defensible upsell pull. Examples: time window (7d → 90d → 1y → unlimited), saved views, CSV export frequency. Surface these as "Category B — storytelling" when proposing; user must acknowledge this is narrative gating, not cost.

### Category C — fake margin (FORBIDDEN — do NOT gate)
Feature costs $0 AND has no defensible upsell story:
- Cross-tab dimensions (same SQL slicing, any number of dimensions)
- Top-N counts (same query with different LIMIT)
- Geographic detail: country + city (same Cloudflare GeoIP headers)
- Device/browser detail (same User-Agent parsing)
- Referrer detail: full list (same data)

**Free gets the full thing for Category C features.** No exceptions.

**Quick test:** "If a Free user goes viral and uses this 1000×, what's our marginal cost?" If essentially $0 → do not gate.

**Source:** `feedback_no_fake_margin_tier_gating.md` in orchestrator memory. Full DEC context: `docs/decisions/insights-2026-04.md`.

---

## DEC presentation format (when surfacing decisions to user)

Every non-trivial decision presented to the user uses table format v3:

```
### DEC-NNN — <czego dotyczy>

**Czego dotyczy:** <short domain header>
**Szczegolowy opis:** 2-4 sentences, cold-readable without scrollback

**Opcje:**
1. <name>
2. <name>

**Uzasadnienie biznesowe per opcja:**
1. Who benefits, product impact, explicit trade-off
2. ...

**Koszt per opcja, per skala (extra $/mo):**

| Opcja | 100 DAU | 1k DAU | 10k DAU | 100k DAU | 1M DAU |
|-------|---------|--------|---------|----------|--------|
| 1     | ...     | ...    | ...     | ...      | ...    |
| 2     | ...     | ...    | ...     | ...      | ...    |

**Twoja rekomendacja:** Option N — optimised for <X>, accepting <Y> as trade-off.
```

Rules:
- Always include business rationale AND cost-at-scale table — a DEC without both is incomplete
- Recommendation is non-optional — always pick one and state which outcome you optimised for
- For multiple DECs in one turn: sequential sections (not a multi-row summary table)

**Source:** `feedback_dec_format_v2.md` + `feedback_dec_format_v3_business_cost.md` in orchestrator memory.

---

## Sidebar canonical structure

Every dashboard-style sidebar uses "Pages" as parent grouping (accordion-style, default expanded) with "Home" as the first page:

```
Pages                       ← parent group (accordion, default expanded)
  🏠 Home                   ← first page — NEVER labeled "Homepage"
  + Add page                ← disabled until multi-page ships
─── divider ───
Design / Domain
─── divider ───
Insights / Shop
─── divider ───
Settings / Help & docs
```

Rules:
- First page is **"Home"** — the word "Homepage" is rejected (user: strong wording, 2026-04-25)
- "Pages" is the canonical parent accordion label (`data-nav="pages"`)
- When multi-page ships, additional pages appear as sub-items under "Pages"
- Copy the Pages accordion structure from `mockups/tadaify-mvp/app-dashboard.html` (GROUP 1)
- When editing mockups that say "Homepage": rename to "Home" AND wrap in Pages parent

**Source:** `feedback_sidebar_pages_grouping.md` in orchestrator memory.

---

## Phase A / Phase B status (Insights work)

### Phase A — shipped 2026-04-26

| Issue | Story |
|-------|-------|
| #41 | Privacy-first flagship landing section (DEC-075) |
| #42 | API flagship landing section (DEC-080) |
| #43 | Generous-Free flagship landing section (DEC-076) |
| #44 | Cross-mockup feature-prominence audit |
| #45 | Insights tab mockup — single-handle scope |
| #38 | Team feature rescoped: Business-only, 10-member cap, account-level |

PRs: #46 (landing.html + pricing.html), #47 (app-insights.html single-handle).

Decisions locked: DEC-075 through DEC-083 (see `docs/decisions/insights-2026-04.md`).

### Phase B — NOT YET STARTED

**Do NOT start Phase B work without first running the multi-handle architecture SPIKE and locking DEC-084..DEC-090+.**

Queued stories:
- Multi-handle architecture SPIKE (separate research dispatch)
- F-APP-MULTI-HANDLE-001 — profile switcher, URL routing, per-handle independent data, aggregate billing, add-on subscription
- F-LANDING-AGENCY-FLAGSHIP-001 — pillar #4 (agency-friendly) on landing.html
- onboarding-tier.html update with multi-handle context

Issue body edits needed post-SPIKE:
- #33 (Account: per-user vs per-handle scoping)
- #34 (Billing: handle add-ons Stripe flow)
- #36 (GDPR: multi-handle export aggregation)
- #37 (API keys: handle-level vs account-level scoping)
- #39 (Danger: delete-handle vs delete-account)

Sub-decisions to lock before Phase B:
1. URL routing convention (`/app/{handle}/...` vs query param vs subdomain)
2. Per-handle vs per-account Settings tab scoping
3. Solo-Business default UX (profile switcher when only 1 handle)
4. GDPR export aggregation (all handles in one ZIP?)
5. Delete-handle vs delete-account separation (primary handle)
6. Add-on handle Stripe subscription_item design (downgrade edge cases)
7. Team member cross-handle visibility

---

## Reference docs

All docs live in the repo — no external sources needed for context:

- `docs/decisions/insights-2026-04.md` — all locked DECs (DEC-073..DEC-083) full text + cross-references
- `docs/research/insights-metrics-feasibility.md` — Opus 4.7 research SPIKE (technical capability × user demand, 970 lines, PR #40)
- `docs/research/insights-implementation-context.md` — implementation context, UI copy verbatim, tone rules, Phase A/B split (this doc is the single source of truth for the Insights implementation agent)
- `docs/research/custom-domains-cloudflare-vs-cloudfront.md` — earlier research on custom domains

---

## Stack

Remix + Supabase (auth via GoTrue) + Stripe (subscriptions) + AWS S3/CloudFront (frontend hosting) + Cloudflare for SaaS (custom creator domains) + Cloudflare Workers + Workers Analytics Engine (analytics pipeline).

---

## Conventions

- **Branch naming:** `feat/<short>-<issue>`, `fix/<short>-<issue>`, `mockup/<descriptor>`, `docs/<descriptor>`, `research/<topic>`
- **Branch–issue link (mandatory):** every branch linked to a GitHub issue via `gh issue develop <N> --name <branch> --checkout` before code is written. `feature-checklist §0.7` HARD-blocks PRs without the link.
- **PR body 7-section contract:** Summary / Business requirements (BR-NNN) / Technical requirements (TR-NNN) / Acceptance criteria (verbatim, all ✅) / Test plan (unit + Playwright + edge cases) / Mockup (blob URL or "No UI change") / Rollback. Missing any section → `pr-creator` HARD-fails.
- **Conventional commits:** `feat(<scope>): ...`, `fix(<scope>): ...`, `chore(<scope>): ...` with `Co-Authored-By: Claude` trailer.
- **Tests:** Playwright (e2e) + Vitest (unit) + pgTAP (RPC). Unit tests run in CI (MANDATORY). Playwright: local only (no CI).
- **Mockups:** `mockups/tadaify-mvp/` — file:// loadable, no external dependencies.
- **Never commit directly to main** — always feature branch + PR.
