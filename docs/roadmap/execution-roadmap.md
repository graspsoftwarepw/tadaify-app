---
type: execution-roadmap
project: tadaify
title: Tadaify — Solo-Dev Execution Roadmap (Claude Code agent-driven)
created_at: 2026-04-24
author: orchestrator-opus-4-7-roadmap-v2
status: draft-v2-supersedes-v1
supersedes: execution-roadmap.md v1 (enterprise 20-week + $192k plan — rejected by user as context-mismatched)
---

# Tadaify — Solo-Dev Execution Roadmap

> **This document replaces v1 in full.** v1 assumed a 20-week build with 3-4 contract engineers and a $192k budget. That model does not describe the actual operator: **one human founder using Claude Max to dispatch parallel Claude Code agents**. Timeline compresses from 20 weeks → 5 weeks. Budget compresses from $192k → <$2k. Everything below is re-derived from that premise.

---

## 0. Context (the one page that changes everything)

| Axis | Reality |
|---|---|
| Human operator | 1 founder (the user). No team, no hires, no contractors. |
| Code execution | Claude Code orchestrator dispatches parallel Claude Code sub-agents (Sonnet for scaffolding + ports, Opus for complex features + Terraform + architecture). |
| Anthropic plan | Claude Max (highest tier). Parallel agent dispatch effectively uncapped for this workload. |
| Human's role | Product decisions · design review · mockup acceptance · PR review + merge · integration testing on DEV · marketing · launch ops. **NOT writing code lines.** |
| Realistic per-agent velocity | Sonnet small F-XYZ unit: 0.5–1.5h. Sonnet medium: 2–4h. Opus large/complex: 4–8h. Parallelism: 3–5 sustained, 8–10 on scaffolding days. |
| Raw build budget | ~131 MVP F-XYZ units × avg 2.5 agent-hours = ~330 agent-hours. At 5 parallel × 6h useful agent-time/day = 30 agent-hours/day → **11 raw build days** before review + integration overhead. With 40% overhead and bug rework: **~16 build days + 5 beta days + 5 launch-prep days = 26 working days ≈ 5 weeks.** |
| Budget reality | Infra + SaaS + domains + optional outreach tooling. **$500–$2,000 to public launch** (no payroll). Ongoing ~$305–500/mo fixed until 10k MAU. |
| Linkofme inheritance | 14 production-tested subsystems (DEC-SYN-35) — auth, profiles, admin, moderation, rate limits, GDPR export + delete, maintenance mode, social-icon detect, QR share, analytics skeleton, etc. Ported, not rewritten. Saves ~3–5 calendar days. |

---

## 1. Timeline overview — 5 weeks to public launch

```
Week 1 (days 1–5)    Foundation       infra + linkofme port + brand-to-code + scaffolding
Week 2 (days 6–10)   Core build       editor, public page renderer, inline checkout, custom domain
Week 3 (days 11–15)  Power features   Pro + Business + preview generator + subtle upsell + AI
Week 4 (days 16–20)  Beta + polish    seed 20 creators, bug fix, case studies, NPS
Week 5 (days 21–25)  Launch           PH + HN + IH tidal wave + outreach + press
```

Calendar assumption: 5-day weeks, with Saturdays off from week 2 onwards (anti-burnout). If the user wants a Monday launch, backward-plan from that day for Week 5 day 25.

---

## 2. Day-by-day schedule

### Week 1 — Foundation (days 1–5)

The goal of week 1 is to have a deployable skeleton on DEV by end of day 5: Supabase DEV + Cloudflare Workers hello-world + linkofme auth + linkofme admin + brand tokens + `/admin` shell + a CI/CD pipeline that ships merges to DEV automatically.

**Day 1 — Scaffolding & infra**

- 09:00 · User reviews roadmap + confirms launch date (DEC gate 1).
- 09:30 · Dispatch 4 parallel agents:
  - **Agent 1A (Opus)** — `tadaify-aws` Terraform skeleton (S3 cold-analytics bucket + Athena workgroup + Glue DB + OIDC role for GitHub Actions). No CloudFront, no Route53 (DNS moves to Cloudflare).
  - **Agent 1B (Opus)** — `tadaify-app` Supabase scaffolding (Supabase Pro project + GoTrue config + base schema for `users`, `profiles`, `admin_users`, `app_settings` maintenance row + seed.sql skeleton with per-test users).
  - **Agent 1C (Sonnet)** — `tadaify-app` Vite + React + TS + Tailwind + shadcn/ui scaffolding + theme tokens from `tadaify-theme-tokens.md` (Indigo Serif palette locked).
  - **Agent 1D (Sonnet)** — GitHub Actions: deploy-dev workflow (build → Supabase migrations → Cloudflare Workers push → Pages deploy). One workflow, `workflow_dispatch` enabled.
- 13:00 · Lunch + user reviews PRs as they land.
- 14:00 · Merge 4 PRs (one per agent). Integration test: DEV boots, `/admin` returns 200 behind auth.
- 16:00 · Dispatch Agent 1E (Sonnet) — smoke e2e that logs in as seed user and hits `/`. File: `e2e/critical-path.spec.ts`.
- 17:00 · End-of-day status: skeleton deploys to DEV automatically on merge to main.

**Day 2 — Linkofme port wave 1 (auth + admin + GDPR)**

- Dispatch 5 parallel agents:
  - **2A (Sonnet)** — Port linkofme auth flow (signup, login, magic link, password reset). 1 PR.
  - **2B (Sonnet)** — Port linkofme `/admin` shell + `admin_users` guard + MaintenanceTab + MaintenanceGuard. 1 PR.
  - **2C (Sonnet)** — Port linkofme GDPR: `delete_user_data()` RPC skeleton + `user-export-data` Edge Function skeleton + `/settings/privacy` UI.
  - **2D (Sonnet)** — Port linkofme rate-limit middleware + moderation queue data model.
  - **2E (Opus)** — Port linkofme analytics skeleton + Cloudflare Analytics Engine writes binding (replaces CloudFront logs path from linkofme).
- Afternoon merge window: 4 PRs land; 2E held for day 3 review (Analytics Engine is new surface).

**Day 3 — Linkofme port wave 2 + Cloudflare edge**

- Dispatch 4 parallel agents:
  - **3A (Opus)** — Cloudflare Workers SSR hello-world: `public-page` worker responds to `tadaify.com/:handle` with a stub. This is the single biggest technical unknown; Opus on it.
  - **3B (Sonnet)** — Port linkofme social-icon auto-detect + QR share component.
  - **3C (Sonnet)** — Port linkofme onboarding checklist shell (item structure; items filled in day 5).
  - **3D (Sonnet)** — `docs/BUSINESS_REQUIREMENTS.md` + `docs/TECHNICAL_REQUIREMENTS.md` seeded from functional-spec-v2.md (BR-001..N + TR-001..N). TR-015 traceability convention baked in.
- Review: Agent 3A is the critical-path item. Review carefully — this sets the rendering pattern for every public page.

**Day 4 — Editor skeleton + block system contract**

- Dispatch 3 parallel agents:
  - **4A (Opus)** — Editor skeleton: split-pane layout, block list, block registry (block type interface contract — every block type implements render + edit panel + serialize). Ships 1 block type (Link block) as reference.
  - **4B (Sonnet)** — Stripe Connect OAuth flow stub + Stripe account linking settings page (buttons wired, deeper commerce logic day 6).
  - **4C (Sonnet)** — AWS S3 cold-analytics Parquet writer Lambda stub (so analytics writes can start flowing immediately; query path comes week 3 via F-PRO-001).
- Merge. Integration test: creator can sign up, land on empty editor, add one Link block, click save.

**Day 5 — Wrap-up + onboarding + domain-add-on stub**

- Dispatch 4 parallel agents:
  - **5A (Sonnet)** — Onboarding checklist filled with 5 items including "Buy your custom domain for $2/mo".
  - **5B (Sonnet)** — F-CUSTOM-DOMAIN-001 stub: Cloudflare for SaaS API wrapper (attach/detach custom hostname). No UX yet; just the Edge Function that calls CF API.
  - **5C (Sonnet)** — `supabase/seed.sql` expanded: per-story test creators (`test-br042-empty-page@local.test`, etc.). Validates via `seed-validator` skill.
  - **5D (Opus)** — Retro + audit: Opus agent reviews all week-1 PRs, flags drift from spec-v2, opens issues for gaps.
- Friday EOD: deployable skeleton with auth, admin, editor shell, public-page stub, GDPR flows, analytics pipe, cold-analytics stub. **Launch-blocking surface = 0%.** Build-out begins week 2.

### Week 2 — Core build (days 6–10)

Goal: by end of day 10, a creator can sign up, build a page with 6 block types, publish it, and a buyer can buy an inline product via Stripe Connect. Custom domain attach works end-to-end. This is the week where the product becomes demo-able.

**Day 6 — Block types wave 1 + public page renderer**

- Dispatch 6 parallel agents (block types are embarrassingly parallel):
  - **6A (Opus)** — F-050 public page renderer on Workers: data fetch from Supabase → render → Cloudflare KV cache. This is the hot path.
  - **6B (Sonnet)** — F-021 Link block (already stubbed day 4; harden).
  - **6C (Sonnet)** — F-022 Text block.
  - **6D (Sonnet)** — F-023 Image/Banner block.
  - **6E (Sonnet)** — F-024 Embed block (YouTube, Spotify, TikTok).
  - **6F (Sonnet)** — F-025 Social icons block (reuses linkofme auto-detect from day 3).

**Day 7 — Block types wave 2 + commerce data model**

- Dispatch 5 parallel agents:
  - **7A (Opus)** — F-070 commerce data model + F-071 product CRUD + F-074 inline checkout shell (Stripe Connect + payment intent creation).
  - **7B (Sonnet)** — F-026 Product block (links to commerce model from 7A).
  - **7C (Sonnet)** — F-027 Form / email-capture block.
  - **7D (Sonnet)** — F-147 Entrance animation framework + 10 animations.
  - **7E (Sonnet)** — F-140..145 Theme customization UI (palette, typography, layout preset).

**Day 8 — Commerce completion + Stripe Tax + custom domain UX**

- Dispatch 4 parallel agents:
  - **8A (Opus)** — F-074 inline checkout end-to-end: buyer flow, Stripe webhook handler, order record, thank-you page. Critical path.
  - **8B (Opus)** — F-CUSTOM-DOMAIN-002 + 003: creator UX for attach/verify/activate + `$2/mo` Stripe metered billing for add-on domains.
  - **8C (Sonnet)** — F-075 Stripe Tax enablement + EU VAT handling + F-127 PL VAT OSS template.
  - **8D (Sonnet)** — F-076 Przelewy24 + BLIK payment methods (already Stripe-supported; wire into checkout).

**Day 9 — Templates, QR, email capture, growth loops**

- Dispatch 5 parallel agents:
  - **9A (Sonnet)** — F-165..169 Templates (3 at launch per §12 cut list: "Indigo", "Dusk", "Minimal").
  - **9B (Sonnet)** — F-125..130 Growth loops: share-back watermark for Free, QR depth.
  - **9C (Sonnet)** — F-115..120 Email & Audience: capture → Resend → basic broadcast UI.
  - **9D (Sonnet)** — F-100..110 Analytics dashboards (28-day Free, full Free per DEC-043, 365-day Pro wired later).
  - **9E (Sonnet)** — F-131..139 Reviews + verified-buyer badges.

**Day 10 — Buffer day + integration tests + landing page v1**

- Morning: user runs through full buyer + creator flows on DEV. Opens bug issues.
- Dispatch 4 parallel agents:
  - **10A (Opus)** — Fix top 5 bugs from morning test session.
  - **10B (Sonnet)** — Landing page at `tadaify.com/` (hero + pricing table + three wedges copy from research synthesis).
  - **10C (Sonnet)** — Pricing page `tadaify.com/pricing`.
  - **10D (Sonnet)** — Sign the linkofme integration tests against tadaify's new schema where applicable.
- EOD: end-to-end working demo on DEV. Internal demo video recorded.

### Week 3 — Power features (days 11–15)

Goal: Pro tier earns its $15. Business tier earns its $49. Preview generator is operational. Subtle upsell signals live. AI features ship. This is the week that makes tadaify competitive, not just functional.

**Day 11 — Preview generator stack**

- Dispatch 3 parallel agents:
  - **11A (Opus)** — F-PREVIEW-001 admin preview-generator UI (split-pane). L-sized; takes most of day 11 + 12.
  - **11B (Sonnet)** — F-PREVIEW-003 Linktree parser + 20-handle smoke test suite.
  - **11C (Sonnet)** — F-PREVIEW-004 preview renderer at `preview.tadaify.com/<slug>` + slug mgmt + 90-day expiry cron.

**Day 12 — Preview generator completion + Pro analytics**

- Dispatch 4 parallel agents:
  - **12A (Opus continues)** — Finish F-PREVIEW-001 + F-PREVIEW-002 customization engine.
  - **12B (Sonnet)** — F-PREVIEW-005 hash-based referral + onboarding inheritance (cookie + attribution).
  - **12C (Sonnet)** — F-PREVIEW-006 admin preview dashboard (list/search/burn previews, attribution view).
  - **12D (Opus)** — F-PRO-001 365d analytics + cohort + funnel (Athena-backed; Parquet writer from day 4 starts paying off).

**Day 13 — Pro features wave 1**

- Dispatch 5 parallel agents:
  - **13A (Opus)** — F-PRO-003 team seats + roles + audit log (RLS-heavy; Opus).
  - **13B (Opus)** — F-PRO-004 API + rate limit + webhooks + scoped keys.
  - **13C (Sonnet)** — F-PRO-006 custom CSS + HTML head + script whitelist + sanitizer.
  - **13D (Sonnet)** — F-PRO-005 email marketing core: 10k/mo quota + basic automations + segmentation (custom sender domain deferred to week 4 if tight).
  - **13E (Sonnet)** — F-PREVIEW-007 outreach workflow integration (Notion/CSV export of sent previews + conversion pings).

**Day 14 — Business tier + AI features**

- Dispatch 5 parallel agents:
  - **14A (Opus)** — F-BIZ-001 agency sub-accounts data model + UX.
  - **14B (Sonnet)** — F-BIZ-002 white-label (remove footer option for Business).
  - **14C (Sonnet)** — F-BIZ-003/004/005 remaining Business surface (bulk management, custom T&Cs, 4h SLA tagging).
  - **14D (Opus)** — F-220..223 AI features (AI-assisted copy, AI-color-from-avatar, AI-CTA suggest, AI-first-page generator). OpenAI gpt-4o-mini for drafts, cache aggressively.
  - **14E (Sonnet)** — F-UPSELL-001..004 subtle signal-based upsell hints (never blocking, never nagging — the counter-positioning vs Linktree).

**Day 15 — Buffer + marketing surfaces + polish**

- Dispatch 4 parallel agents:
  - **15A (Sonnet)** — F-245..255 marketing surfaces: vs-linktree + vs-beacons + vs-stan pages (generated from `marketing-vs-articles-catalog.md`).
  - **15B (Sonnet)** — Niche landing pages (top 5 from SEO map).
  - **15C (Opus)** — Top 10 bug fixes from Opus retro agent's week-2 audit.
  - **15D (Opus)** — Security audit pass: SQL injection, RLS correctness, Stripe webhook verification, preview URL abuse vectors.
- EOD: **feature-complete MVP on DEV.** Week 4 is intentionally zero new features.

### Week 4 — Beta + polish (days 16–20)

Goal: 20 seeded beta creators on the product, top-10 bugs fixed, NPS collected, 3 case-study drafts written. Zero net-new F-XYZ units this week — that is the discipline. Agents do bug-fixes + polish only.

**Day 16 — Private beta launch**

- User personally invites 20 creators (DMs sent week 3 during spare cycles). 20 private beta slots open.
- Dispatch 2 agents:
  - **16A (Sonnet)** — beta-mode toggle: hides public signup, opens invite-code path.
  - **16B (Sonnet)** — Embed in-app NPS micro-survey + feedback widget.
- Afternoon: user onboards first 5 beta creators personally via Zoom / Loom. Hand-held. Notes everything.

**Day 17–18 — Feedback ingestion + bug bash**

- Each morning: user triages overnight beta feedback into top-5 bug list.
- Dispatch 3–5 Sonnet bug-fix agents per day, one per bug. Opus on anything that spans ≥3 files.
- Afternoon merges + re-test with 1 beta creator. Repeat.

**Day 19 — Case studies + content prep**

- User + Opus agent interview 3 best beta creators, write case-study drafts (`marketing-product-hunt-launch-story.md` companion pieces).
- Dispatch 2 Sonnet agents:
  - **19A** — PH gallery images (screenshots + short Loom scripts).
  - **19B** — Pre-launch emails for waitlist + outreach sequences (cold DMs).

**Day 20 — Launch-prep freeze**

- Code freeze for launch branch. Only critical bugs touch main.
- Dispatch 2 Opus agents:
  - **20A** — Load-test DEV with synthetic 10k-concurrent buyer sessions against a beta creator's checkout. Observe + fix.
  - **20B** — Full security + GDPR pass pre-PROD cutover.
- EOD: `/release v1.0.0-rc1` tag pushed — triggers PROD build that deploys to prod behind feature flag (`public_signup=false`).

### Week 5 — Launch (days 21–25)

Goal: public launch. First 100 signups and first 5 paying customers by end of day 25.

**Day 21 (Monday) — Soft open**

- Morning: user flips `public_signup=true` on PROD. Tadaify.com is live.
- Dispatch 2 agents:
  - **21A (Sonnet)** — Launch-day monitoring dashboard: live signups, errors, checkouts.
  - **21B (Sonnet)** — Uptime/health check cron (external monitor pointing at `/healthz`).
- Soft tweets + IH post. Gathering intel.

**Day 22 (Tuesday) — Product Hunt + HN Show**

- 00:01 PT — PH submission goes live (hunter if DEC-MKT-D picked a hunter; self-post otherwise).
- 08:00 ET — HN Show post goes live.
- User full-time on comments + DMs. No agents dispatched unless a launch-critical bug hits.
- On-call Opus agent **22-ONCALL** armed but idle — dispatched only if needed.

**Day 23 (Wednesday) — Indie Hackers + outreach wave 1**

- IH Show milestone post.
- Dispatch 1 Sonnet agent:
  - **23A** — Personalized preview generator batch: user queues up 50 target Linktree handles, agent runs them through preview generator, user sends 50 DMs.

**Day 24 (Thursday) — Press + bug-fix wave**

- User sends press outreach (5 journalists, 5 niche newsletter writers).
- Dispatch 3–4 Sonnet agents for any top-5 bugs surfaced by new public users.

**Day 25 (Friday) — Retrospective + Week 6 planning**

- EOD: user writes launch retrospective. Orchestrator closes Week 1–5 roadmap and opens post-launch immediate plan (§10).
- Success criteria check: 100 signups? 5 paying customers? Any P0 bugs? Case-study follow-up kickoff.

---

## 3. Parallel agent orchestration

### Concurrency rules

- **3–5 parallel agents** is the sustainable default. Human review capacity is the bottleneck, not agent availability.
- **8–10 parallel agents** reserved for scaffolding days (week 1 day 1, day 6 block types) where PRs are small + independent + easy to review.
- **Opus: 1–2 concurrent max.** Opus work is complex and demands a deeper human review. Batching 3 Opus PRs in one afternoon = review burnout.
- **Sonnet: 3–6 concurrent comfortable.** Small, independent F-XYZ units are Sonnet's sweet spot.
- **1 Opus retro/audit agent per week.** Reviews the week's merged PRs for spec drift + security + test coverage. Surfaces issues before they compound.

### Dependency rules (what blocks what)

- **Week 1 blocks everything.** No feature agents dispatched against an un-scaffolded repo.
- **Editor block registry (day 4) blocks all block-type agents (day 6–7).** Contract must be locked before parallel block work.
- **Public page renderer (day 6 agent 6A) blocks custom-domain UX (day 8 agent 8B).** Renderer is the thing the custom hostname points at.
- **Preview generator UI (day 11–12) blocks preview-based outreach (day 23).** Non-negotiable — we do not DM targets without working previews.
- **Stripe Connect OAuth (day 4 agent 4B) blocks inline checkout (day 8 agent 8A).** OAuth token path must exist.

### Eng-agent-hour estimate per F-XYZ (abridged)

| Unit class | Typical agent-hours | Example |
|---|---|---|
| S scaffolding (Sonnet) | 1–2h | F-022 Text block, F-126 share-back watermark |
| S port from linkofme (Sonnet) | 2–3h | F-180..199 admin skeleton |
| M feature (Sonnet) | 3–5h | F-074 inline checkout shell, F-147 animation framework |
| M feature (Opus) | 4–6h | F-PRO-001 365d analytics, F-PRO-003 team seats |
| L complex feature (Opus) | 6–10h | F-PREVIEW-001 admin UI, F-CUSTOM-DOMAIN-002 verification UX |
| XL cross-cutting (Opus) | 10–16h (over 2 days) | F-PRO-005 email marketing end-to-end |

At 5 parallel × 6 useful agent-hours/day = 30 agent-hours/day. Across 20 build days = 600 agent-hours. MVP demand ≈ 330 agent-hours raw + ~40% review-triggered rework = ~460 agent-hours. Comfortably inside the envelope.

---

## 4. F-XYZ sequencing (the actual plan)

| Day | F-XYZ batch | Agent type | Notes |
|---|---|---|---|
| 1 | Infra scaffolding (no F-XYZ yet) | Opus + Sonnet mix | Terraform + Supabase + Vite + CI |
| 2 | F-001..011, F-180..199, F-170..179 GDPR | Sonnet (linkofme ports) | 4 PRs |
| 3 | F-050 stub, F-015 shell, F-006 palette | Opus (Workers) + Sonnet | Workers SSR critical path |
| 4 | F-020 editor shell + F-021 Link block + Stripe Connect stub | Opus + Sonnet | Block registry contract locked |
| 5 | F-015 onboarding + F-CUSTOM-DOMAIN-001 stub + seed.sql | Sonnet | Week-1 close-out |
| 6 | F-021..025 block types + F-050 full renderer | Opus + 5× Sonnet | Parallel block wave |
| 7 | F-070..074 commerce + F-026/027 blocks + F-147 animations + F-140..145 theming | Opus + 4× Sonnet | |
| 8 | F-074 full checkout + F-CUSTOM-DOMAIN-002/003 + F-075 Stripe Tax + F-076 P24/BLIK | 2× Opus + 2× Sonnet | |
| 9 | F-165..169 templates + F-115..120 email + F-100..110 analytics + F-125..139 growth | 5× Sonnet | |
| 10 | Bug bash + F-245 landing + F-246 pricing | Opus + 3× Sonnet | Week-2 close-out |
| 11 | F-PREVIEW-001 + F-PREVIEW-003 + F-PREVIEW-004 | Opus + 2× Sonnet | |
| 12 | F-PREVIEW-001 (cont) + F-PREVIEW-002 + F-PREVIEW-005 + F-PRO-001 | 2× Opus + 2× Sonnet | |
| 13 | F-PRO-003 + F-PRO-004 + F-PRO-005 + F-PRO-006 + F-PREVIEW-007 | 2× Opus + 3× Sonnet | |
| 14 | F-BIZ-001..005 + F-220..223 AI + F-UPSELL-001..004 | 2× Opus + 3× Sonnet | |
| 15 | F-245..255 vs-pages + niche SEO + security pass + bug bash | 2× Opus + 2× Sonnet | Week-3 feature freeze EOD |
| 16–20 | **No new F-XYZ.** Bug fixes only. Beta polish. Case studies. | Mostly Sonnet | 20+ small PRs/week |
| 21–25 | Launch-day monitoring + outreach batch + press | Sonnet | Occasional Opus on critical bugs only |

Group totals:
- Foundation (days 1–5): 22 units ported/stubbed
- Core (days 6–10): 38 units
- Power features (days 11–15): 45 units
- Beta polish (days 16–20): 0 new, ~25 bug-fix PRs
- Launch prep (days 21–25): 0 new, content + outreach

Total MVP coverage: ~105 units directly + ~26 inherited/ported = ~131 MVP F-XYZ ✅

---

## 5. Decision gates (human-in-the-loop)

What ONLY the human can decide, approve, or do. These are the bottlenecks — if the user is unavailable, agents idle.

### Daily (every build day, ~2–3h total of user time)

- **09:00–10:00** — Review overnight PRs + merge approved ones (45–60 min).
- **10:00–10:30** — Dispatch today's agent plan.
- **12:30–13:30** — Mid-day review window (PRs landing from morning agents).
- **15:30–17:00** — End-of-day review + merge + integration test on DEV + next-day prep.
- Non-coding blocks in between: design review, content, marketing, admin.

### Week-level gates (must be closed before the next week's dispatch)

| Gate | Day | Decision | Blocks |
|---|---|---|---|
| G1 — Launch date lock | Day 1 | Confirm 5-week target OR slip | Everything |
| G2 — Brand final sign-off | Day 2 | Motion v10 + Indigo Serif + tagline all locked | Landing, PH assets |
| G3 — Editor block contract | Day 4 | Block type interface locked | Days 6–7 parallel block agents |
| G4 — Commerce UX review | Day 8 | Inline checkout UX matches mockup | Launch readiness |
| G5 — Preview generator UX review | Day 12 | Admin tool + conversion hash flow usable in <5 min | Week-5 outreach batch |
| G6 — Pro tier feature list final | Day 13 | 5 MVP Pro units green-lit; 3 deferred to Y1 confirmed | Pricing page copy |
| G7 — Beta invite list | Day 15 | 20 creators locked (names, DMs ready) | Week 4 day 16 |
| G8 — Launch date lock v2 | Day 20 | Confirm Monday day 21 OR slip 1 week | Launch ops |
| G9 — PH hunter decision | Day 20 | Self-post vs paid hunter ($1000–1500) | Day 22 PH submission |

Human time cost per gate: 30–90 min. Total user decision-work across 5 weeks: ~15–20 hours of "pure decisions" layered on top of daily PR review.

---

## 6. Budget — realistic solo-agent launch cost

| Item | One-time | Monthly | Notes |
|---|---|---|---|
| Claude Max subscription | — | Fixed (already paid) | Unlimited agent dispatch. Single largest implicit cost; zero marginal. |
| Cloudflare Business plan | — | $200 | Workers + R2 + Cloudflare for SaaS (first 100 domains free). |
| Supabase Pro | — | $25 | Postgres + GoTrue + Edge Functions + Realtime. |
| Resend Pro | — | $20 | Free tier likely sufficient at MVP; upgrade if ≥3k emails/mo. |
| AWS minimal (S3 cold + Athena + Glue) | — | $5–10 | Cold analytics only. Tiny. |
| OpenAI API | — | $30–80 | AI features at MVP scale. Gpt-4o-mini + aggressive caching. |
| Domain `tadaify.com` | $50 (already paid per DEC-004) | — | |
| Sentry / monitoring | — | $0–29 | Free tier OK at MVP. |
| Stripe fees | — | Passthrough | Creator pays; not our COGS. |
| GitHub + GitHub Actions | — | $0 | Free tier OK; CI is deploy-only per org convention. |
| PH hunter (OPTIONAL) | $1,000–1,500 | — | Skip: self-post saves $1,500. |
| Cold-outreach tooling (OPTIONAL) | — | $100–300 | Instantly / Modash for preview-generator batch. |
| Launch marketing domains (OPTIONAL) | $50 | — | vs-linktree.tadaify.com etc. — subdomains, no extra cost. |

### Cost bands

- **Rock-bottom launch (self-post PH, no cold-outreach tooling, no monitoring upgrade):** ~$280/mo ongoing + <$100 one-time. **$380–600 total to public launch.**
- **Recommended launch (PH self-post + Instantly cold outreach + Sentry paid + case-study assets):** ~$400–500/mo + ~$300 one-time. **~$900–1,500 to public launch.**
- **High-confidence launch (paid PH hunter + full tooling stack):** ~$500–600/mo + ~$1,800 one-time. **~$2,500–3,000 to public launch.**

**Reasonable target: $500–$2,000 total to public launch.** No payroll. 99% compression vs v1's $192k.

---

## 7. Risks specific to solo-agent operation

| # | Risk | P | I | Mitigation |
|---|---|---|---|---|
| 1 | Agent ships broken code that compounds across features (one bad migration → every test red). | M | H | User reviews every PR before merge; no auto-merge; `seed-validator` skill + `feature-checklist` §0.5 / §0.6 / §8 HARD blocks; strict CI. |
| 2 | User becomes PR-review bottleneck. | H | H | Batch reviews at fixed daily windows (4×/day × 45 min = 3h). Sonnet PRs pre-vetted by Opus retro agent. Avoid bunching ≥3 Opus PRs/day. |
| 3 | Context loss between agent dispatches (agent unaware of recent DEC). | M | M | Every dispatch prompt includes latest DEC-NNN + spec-v2 + `feature-checklist` link. `decisions.json` is canonical. |
| 4 | Cloudflare Workers SSR slip (team's first Workers-as-app). | M | H | Opus-only on 3A day 3 renderer + 6A day 6 full. 1-day buffer in day 10. Break-glass: fall back to Next.js on Vercel if day 6 fails (cost: 2-day re-work). |
| 5 | Custom-domain stack end-to-end bugs at PROD (CF SaaS + Stripe metered billing + DNS UX). | M | H | Day 15 security pass + day 20 dedicated load-test. Ship with 10-domain cap on day-1 PROD, lift after 72h green. |
| 6 | Preview generator URL-abuse vector (scraper farming hashes). | L | M | `noindex`, robots disallow, CF Bot Mgmt, rate-limit 100/hr per slug, 90-day default expiry. |
| 7 | User burnout (5 weeks × 8–10h/day is real). | H | H | Saturdays off from week 2. Week 4 intentionally feature-frozen. No agent dispatch after 18:00. Week 5 is mostly decisions, not coding. |
| 8 | AI/OpenAI cost spike from a viral creator. | L | M | Hard quota per tier + gpt-4o-mini default + aggressive R2 cache. Monitor day 21+ spend daily. |
| 9 | Supabase schema drift between migrations ⇄ seed.sql. | M | M | `seed-validator` skill HARD-fails any migration PR where `db reset` + seed.sql fails. |
| 10 | Launch day traffic spike overwhelms untested path. | M | H | Day 20 synthetic load-test at 10k concurrent. CF caching is the safety net. |

---

## 8. Success metrics

| Week | Metric |
|---|---|
| 1 end | Skeleton deploys to DEV on merge-to-main; auth, admin, editor shell, public-page stub, GDPR flows, analytics pipe, cold-analytics stub — all green. |
| 2 end | Creator can sign up → build a page with 6 block types → publish → buyer buys via inline Stripe checkout → funds land in Stripe Connect account. Custom domain attach works end-to-end. |
| 3 end | All Pro + Business power features ready. Preview generator operational (Linktree handle → private preview in <5 min admin workflow). AI features live. Feature freeze. |
| 4 end | 20 beta creators onboarded, top-10 bugs fixed, NPS ≥+30, 3 case-study drafts in hand. |
| 5 end | Public launch complete: 100+ signups, 5+ paying customers, 1+ custom domain sold, zero P0 production incidents. |

---

## 9. Integration with parallel tracks (what the user does alongside code build)

While agents execute code, the human runs parallel non-code tracks:

- **Design/brand (days 1–10)** — Motion v10 final acceptance (day 2), landing page Figma polish (day 9), pricing page visual (day 10), PH gallery (day 19).
- **Marketing content (days 8–15)** — outreach template copy (already written in `marketing-pitch-angles.md`); vs-pages + niche pages generated by Sonnet but **human must review + personalize hero for voice**. Case study interviews week 4.
- **Pre-launch audience (days 6–20)** — Twitter posts (build-in-public), IH weekly milestones, waitlist collection. Requires 30–60 min/day of founder presence.
- **Legal/ops (days 1–5, days 18–20)** — ToS + Privacy Policy review, Stripe Connect account activation, VAT OSS registration (if EU-based), business banking ready for Stripe payouts.

---

## 10. Post-launch immediate plan (weeks 6–10)

| Week | Focus |
|---|---|
| 6 | Top-10 launch bugs fixed. F-PREVIEW-010..012 (Beacons/Stan/Bio.link parsers) shipped (M+0.5). Week-1 post-launch retro. |
| 7 | F-PRO-007 A/B testing + F-PRO-008 abandoned cart + F-PRO-002 Google Sheets sync (the 3 deferred Pro features). Start askbeforeship integration if relevant. |
| 8 | Onboarding checklist v2 (data-driven from beta signals). Email drip sequences. Affiliate program live. |
| 9 | First round of data-driven UX fixes based on analytics. Expand template library 3 → 8. |
| 10 | First paid cold-outreach campaign (budget from week 5 revenue). Supabase OAuth 2.1 server if askbeforeship partnership proceeds. |

---

## 11. Critical path (revised for solo-agent)

Ordered by actual wall-clock impact:

1. **Linkofme subsystems port (days 2–3)** — parallelized across 5 agents; ~2 calendar days at 5× Sonnet concurrency.
2. **Editor + block-system contract + 6 block types (days 4, 6–7)** — editor shell is sequential-ish; block types explode in parallel once contract is locked.
3. **Inline checkout + Stripe Connect + custom domain stack (days 7–8)** — integration-heavy; 2 Opus agents holding the heaviest work.
4. **Preview generator admin UI + Linktree parser + renderer (days 11–12)** — complex UI + parsing; L-sized for Opus.
5. **Beta polish cycle (days 16–20)** — no new code; pure bug-fix + UX refinement. This is where Week 3 feature quality is paid off OR paid for.

If any of (1)–(4) slips by >1 day, the 5-week target requires a Week 4 bug-day sacrificed OR a Week 5 launch slip. Pre-commit: if day 8 EOD doesn't have working end-to-end checkout, add 1 calendar day and slip launch to day 26.

---

## 12. What gets cut if time pressure

Ordered trim-first list. Cut from the bottom of this list when a week shows a ≥10% slippage signal.

| Cut | F-XYZ | Saves (agent-hours) | Rationale |
|---|---|---|---|
| 1 | F-UPSELL-005 peer benchmarking | 5–8h | Needs N≥1k creators per cohort; impossible at launch. |
| 2 | F-PRO-002 Google Sheets sync | 6–10h | Rare creator ask; Y1. |
| 3 | F-PRO-007 A/B testing | 10–16h | Only matters for creators with meaningful traffic; Y1. |
| 4 | F-PRO-008 Abandoned cart | 6–10h | Only matters with recurring commerce; Y1. |
| 5 | F-BIZ-002/003/004/005 (keep F-BIZ-001 sub-accounts) | 12–18h | Agency surface can ship iteratively; F-BIZ-001 alone covers core Business story. |
| 6 | Template library 3 → 1 | 4–6h | Ship "Indigo" only; add "Dusk" + "Minimal" week 6. |
| 7 | 10 entrance animations → 3 | 4–6h | Ship 3 classics; expand over Y1. |

**Max trimmable scope: ~15–20 agent-days = ~3 calendar days buffer.** If trimmed, MVP still delivers all 3 wedges (everything Free, 0% fees, preview generator).

---

## 13. Absolute critical path (non-cuttable)

Must ship at launch — no matter what happens with velocity:

- Auth + profile + admin + GDPR export/delete (all linkofme ports) — legal + trust floor.
- Editor + public page renderer + 6 block types (F-021..027) — the product does not exist without this.
- Inline Stripe Connect checkout (F-074) — **this is the signature differentiator**; without it, the "0% fees" story evaporates.
- Preview generator MVP path (F-PREVIEW-001..007) — **the wedge**; outreach conversion depends on this.
- Custom domain attach + $2/mo billing (F-CUSTOM-DOMAIN-001..003) — the primary revenue surface.
- 3 AI features (F-220..222) — the tier-neutral "why this feels modern" layer.
- Landing page + pricing page + 1 vs-linktree page — the surface prospects actually read.
- Cloudflare + Supabase + minimal AWS infra — the deployment floor.

If any one of these slips, the launch slips. No exceptions.

---

## Return summary (for orchestrator)

- **File written:** `/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/execution-roadmap.md` (v2, overwrites v1 in full).
- **Realistic MVP launch target:** Day 25 from kickoff (5 weeks). Hard floor day 28 if one critical-path item slips by 1–2 days; soft floor day 21 if everything runs clean + linkofme port is faster than estimated.
- **Daily engineering workload:** 3–5 concurrent agents sustained; 8–10 on scaffolding days. 30 useful agent-hours/day. User time: 3–5 hours coding-adjacent (PR review + dispatch + integration test) + 2–4 hours non-code (design, marketing, decisions).
- **Top 3 bottlenecks capping agent parallelism:**
  1. Human PR review capacity — hard cap at 5 sustained parallel Sonnet PRs. Opus capped at 1–2.
  2. Sequential contract points — editor block interface (day 4) and public-page renderer (day 6) block their downstream parallel waves.
  3. DEV integration tests — full end-to-end checkout + custom domain tests run in real browsers; not parallelizable.
- **Top 3 things the human MUST personally do (no delegation possible):**
  1. PR review + merge (every PR). This is the quality gate; no auto-merge.
  2. Mockup acceptance + design review + brand decisions (editor UX, landing hero, PH assets).
  3. Launch-week ops: PH comments, HN replies, DMs to beta creators + first paying customers, press outreach. The voice of tadaify is the founder's voice.
- **Realistic total cost to launch:** $500–$2,000 — skipping the optional PH hunter and bundling modest tooling. Rock-bottom $380. If paid PH hunter is picked (DEC-MKT-D), add $1,000–1,500 one-time. No payroll. Ongoing fixed infra ~$280–500/mo until 10k MAU.
