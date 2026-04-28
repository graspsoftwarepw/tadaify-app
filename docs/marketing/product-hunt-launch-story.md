---
type: marketing-story
project: tadaify
title: Product Hunt Launch — Strategy + Playbook + Decision Backlog
created_at: 2026-04-24
author: orchestrator
status: deferred-decision-pending
tags: [marketing, product-hunt, launch, acquisition]
related_docs:
  - marketing-strategy.md (Track D, §5)
  - tadaify-research-synthesis.md DEC-SYN-28
  - decisions.json DEC-MKT-D
priority: medium
decision_required_by: ~2 months before planned launch date
---

# Product Hunt Launch — Strategy + Playbook

## Status

**DEFERRED.** User wants to make the decision closer to actual launch need. This document captures all context, options, and recommendations so the decision can be made quickly when the moment arrives.

## The decision

When tadaify launches on Product Hunt, 3 questions need answers:

1. **Timing:** how many weeks after tadaify public launch?
2. **Hunter:** hire a top PH hunter (cash or equity) or self-post as founder?
3. **Format:** PH only, or full "tidal wave" (PH → HN → IH → BetaList over 3-5 days)?

## Why Product Hunt matters for tadaify

- **Signup volume spike:** #1 of the day = 1000-5000 signups; #2-5 = 500-2000; top 10 = 100-500
- **Tier-1 press follow-up:** TechCrunch / The Verge / Fast Company frequently cover top-5 PH launches
- **Early credibility signal:** "Product of the Day" badge on landing + social proof for outreach
- **Developer/creator community attention:** PH audience skews creator-economy + indie-hacker heavy

## Decision 1 — Timing (week +4 / +8 / +12)

### Week +4 (early launch)

- **Pros:** launch momentum compounds; PH launch leverages existing outreach hype; shorter buildup = less chance of fatigue
- **Cons:** product may still have bugs; audience not yet built (need 200-500 upvote commitments); case studies thin; risky for one-shot play
- **Verdict:** too early for quality launch

### Week +8 (recommended)

- **Pros:** 2 months of private → public beta iterating; bug-fixed product; 5-10 real creator case studies; audience built (email waitlist 200-500, Discord/Slack 100+, Twitter followers 500+); PH followers seeded 50+
- **Cons:** risk of competitive response (Linktree / Beacons may ship features before launch); 8 weeks of focused prep
- **Verdict:** sweet spot for quality launch

### Week +12 (late launch)

- **Pros:** maximum product polish; largest case-study pool; team rested
- **Cons:** 3 months = meaningful competitive response window; launch momentum lost; harder to rally waitlist
- **Verdict:** too late; by then PH wouldn't be launch, it would be milestone

**Recommendation:** Week +8 (Tuesday).

## Decision 2 — Hunter (hire / self-post)

### Hire a top PH hunter ($500-2000 cash or 0.1-0.25% equity)

- **Who:** Chris Messina, Niv Dror, Ben Tossell, Kevin William David (verify current 2026 pricing via PH direct message — rates change quarterly)
- **What you get:**
  - Hunter's pre-built audience (5k-20k PH followers each)
  - Algorithm weight boost (PH favors hunter-launched vs self-launched)
  - Hunter's network proactively upvotes
  - Professional launch post copy
  - Their credibility attaches to your product
- **ROI math:**
  - With hunter: ~70% chance top-5 → 800-1500 signups → CAC $1-2 per signup
  - Without hunter: ~20% chance top-5 → 200-500 signups → CAC $0 but no compensating lift
  - At 5% free-to-paid conversion, 800 signups × $100 LTV = $4,000 revenue impact vs $1,500 hunter cost = **2.7x ROI**

### Self-post as founder

- **Pros:** $0 cost; authentic founder voice; full control; founder story credibility
- **Cons:** zero pre-built PH audience (0 followers); low algorithm weight; likely #10-30 ranking, not #1-5
- **Verdict:** only makes sense if budget is <$500 OR founder already has strong personal PH/Twitter brand (not applicable for tadaify)

**Recommendation:** Hire hunter at $1000-1500 price point (below $500 = not top-tier; above $2000 = overpay for MVP). Prefer equity option (0.1-0.25%) if hunter is interested — alignment signal.

## Decision 3 — Format (PH-only vs tidal wave)

### PH-only (single-day launch)

- Tuesday launch, max push for 24 hours
- **Pros:** focused founder attention; no dilution; one channel to optimize
- **Cons:** one-shot, if underperforms no backup; doesn't leverage other platforms

### Tidal wave (3-5 day coordinated sequence)

- **Day 0 Tuesday:** Product Hunt launch (primary, hunter-led)
- **Day +1 Wednesday:** "Show HN: Tadaify" (Hacker News — tech angle, Cloudflare architecture, bandwidth economics, public API)
- **Day +2 Thursday:** IndieHackers launch post (build-in-public angle, transparent MRR)
- **Day +3 Friday:** BetaList submission + tier-1 newsletter outreach (Site Builder Report, Bram's Betalist, Adam Connell)
- **Day +4-5 Weekend:** waitlist email blast + social recap
- **Pros:** effective shots multiply; each audience is different (PH = creators + startup, HN = technical, IH = indie SaaS, BetaList = early adopters); if PH flops, other channels redeem; captures different decision windows
- **Cons:** 3-5 days of intense founder time; can burn out; harder to coordinate if launch goes sideways

**Recommendation:** Tidal wave (Days 0-3). Reduces single-point-of-failure risk; amplifies total signups by 2-3x vs PH-only.

## Launch day playbook (Tuesday Week +8)

### Pre-launch (weeks -8 to -1)

**Weeks -8 to -4:**
- Private beta (50-100 creators)
- Iterate on feedback; fix critical bugs
- Build email waitlist (target 500)
- Build Discord/Slack community (target 100 active)
- Twitter audience build (target 500 followers)

**Week -4:**
- Engage hunter (contract signed, equity if applicable)
- Record 1-minute demo video (sharp, emotional, product-driven)
- Design PH gallery images (5-8 screenshots + product-of-day banner prep)
- Write launch post draft in hunter's voice (they post, not founder)

**Week -3:**
- Public beta — open signups
- 500-1000 signups target
- Collect 10+ creator case studies with usage data

**Week -2:**
- PH pre-launch "coming soon" page live
- Tease on Twitter daily ("6 days till we ship on PH")
- Email waitlist: "We're launching on Product Hunt next Tuesday — be ready to upvote"
- Final performance test at 10k concurrent load

**Week -1:**
- Final polish pass (copy, images, bug fixes)
- Coordinate 200+ upvote commitments (direct ask to inner circle, team, friends, early-beta creators)
- Brief all beta creators: "Here's how to upvote on PH, here's when to do it"

### Launch day (Tuesday 00:01 PT)

- **00:00-04:00 PT (09:00-13:00 CET):** hunter posts launch page; founder retweets; Discord/Slack mobilizes; first 50 upvotes in first hour (critical signal to PH algorithm)
- **04:00-08:00 PT (13:00-17:00 CET):** waitlist email sent ("We're LIVE, go upvote"); Twitter thread from founder; team accounts engage every comment <10min reply time; aim 300+ upvotes by hour 4 → "Maker of the Day" trigger
- **08:00-16:00 PT (17:00-01:00 CET next day):** sustain momentum; share in relevant Slack/Discord communities; reach out to tier-2 press live; AMA-style engagement in PH comments
- **16:00-24:00 PT:** final push; closing posts on Twitter recapping the day; thank-you DM to every upvoter

### Post-launch (Days +1 to +7)

- **Day +1 Wednesday:** "Show HN: Tadaify" — tech angle (aggressive pricing wedge, Cloudflare-first architecture, custom-domain economics). Submit at 08:00-10:00 PT (HN peak).
- **Day +2 Thursday:** IndieHackers launch post — transparent MRR disclosure, build-in-public tone, founder story
- **Day +3 Friday:** BetaList submit + outreach to tier-1 newsletters (Site Builder Report, Bram's Betalist, Adam Connell / Bloggingwizard, Creator Spotlight, Creator Mind)
- **Days +4-7:** reach out to tier-2 press (TechCrunch, The Verge, Fast Company) with "We just hit #X on PH with N signups" angle
- **Week +1:** analytics review — what worked, what didn't, CAC by channel

## KPIs (what success looks like)

| Metric | Target | Stretch |
|---|---|---|
| PH ranking | Top 5 of day | #1 of day |
| PH upvotes | 500+ day 1 | 1500+ |
| Total signups (PH + HN + IH + BetaList wave) | 2,000 | 10,000 |
| Paying conversions within 30 days | 100 (5%) | 500 (5%) |
| Press mentions (tier-2) | 2-3 articles | 5-10 |
| Twitter follower gain | +500 | +2000 |
| Waitlist → active within 7 days | 50% activation | 80% |

## Fallback / contingency

- **If PH underperforms (<200 upvotes day 1):** emphasize HN + IH days hard; pitch "we had a soft PH, but the product deserves attention" angle to tier-2 press; blog post with public post-mortem (build-in-public credibility)
- **If hunter drops out last-minute:** founder self-posts with Twitter+Discord push; expected top-10-20 ranking; not catastrophic
- **If product breaks under load:** incident page + apology blog post; redo launch in 2 weeks with "relaunch" narrative (can work!)

## Budget

| Item | Bootstrap | Seed | Well-funded |
|---|---|---|---|
| Hunter | $0 (self-post) | $1000-1500 | $2000 + equity |
| Pre-launch ads (Twitter promoted tweets) | $0 | $500 | $3000 |
| Demo video production | $0 (iPhone) | $500 (freelancer) | $2500 (agency) |
| PR firm for tier-2 press | $0 | $0 | $3000 (retainer) |
| Creator "pay for upvote support" (affiliate seed) | $0 | $500 | $2000 |
| **Total** | **$0** | **$2500-3000** | **$12500+** |

## Open questions (to answer at decision time)

- Q-PH-1: Can we lock a tier-1 hunter now (with equity option) for a late-2026 launch, or is it closer to launch negotiation?
- Q-PH-2: Do we have a creator case study pool by week -4? If not, shift timing.
- Q-PH-3: Has Linktree shipped a competitive response (entrance animations, custom domain at lower price) by our launch window? If yes, we may need to re-position.
- Q-PH-4: Is Poland-first launch (PH-PL equivalent e.g., IndieHackers PL community or Antyweb) more impactful than English PH? Especially relevant given bilingual day-0 strategy.

## Recommendation summary

**When user is ready to commit:**
1. **Timing:** Week +8 Tuesday
2. **Hunter:** hire tier-1 PH hunter, budget $1000-1500 or 0.1-0.25% equity
3. **Format:** tidal wave — PH Day 0 → HN Day +1 → IH Day +2 → BetaList Day +3
4. **Backup plan:** contingency for under-performance ready
5. **Budget:** seed-tier $2500-3000 cash covers Launch Week needs

**Context signals for adjusting timing:**
- If product has 500+ active creators by week +6 with strong case studies → pull timing to +7
- If product has bugs or thin case-study pool → defer to +10 or +12
- If tier-1 competitor launches similar feature in our window → maybe accelerate to +6 for "first-mover" narrative

## Related

- `marketing-strategy.md` §5 Track D (Agent 3's original analysis)
- `tadaify-research-synthesis.md` DEC-SYN-28 (3 Tier-1 pitch targets)
- `functional-spec-v2.md` F-PREVIEW-* (preview generator must be working by week -4 for outreach demos)
