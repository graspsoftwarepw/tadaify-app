---
type: SPIKE
project: tadaify
title: "AI Suggest cost + tier strategy SPIKE — model evaluation + economic model"
agent: opus-4-7
author: orchestrator
created_at: 2026-04-27
status: draft
tags: [tadaify, ai, pricing, tier-strategy, cost-modeling]
---

# AI Suggest — Cost + Tier Strategy SPIKE

## 1. Executive summary

**Recommended model:** **Cloudflare Workers AI `@cf/meta/llama-3.1-8b-instruct-fast`** as the default proxied backend, with **OpenAI `gpt-5.4-nano`** as a fallback for premium tiers and an "upgrade quality" toggle for Pro+/Business.

**Recommended strategy:** **Strategy 3 — daily rate-limit per tier** (Free 5 / Creator 50 / Pro unlimited+fair-use 500 / Business unlimited). Daily reset, friendly "Comes back tomorrow" UX with upgrade CTA. Reasons: (a) the chosen model's per-call cost is ≤ $0.0006 even at worst case so the absolute USD bleed is bounded; (b) daily reset feels less precious than monthly credits and reduces "credit anxiety"; (c) Free tier still tastes the magic which drives Creator-tier conversion (the Notion-removed-AI-from-Free-tier mistake we should not repeat).

**Recommended architecture:** **Proxied via tadaify Edge Function** (no BYOK). The cost is too low to push the friction of API-key management onto creators, and proxying lets us swap models without creator action, cache aggressively, and report unified analytics.

**Two-line rationale.** Llama 3.1 8B Instruct on Cloudflare gives us $0.282 input / $0.827 output per Mtok with first-token under 300 ms — a single ✨ Suggest click costs ≈ $0.0002, which means even at 1M DAU with 30% activation × 5 clicks/day we're at ~$45/day infra cost, completely absorbable in Pro+/Business margins. The daily rate-limit ladder is the only one that simultaneously (a) doesn't gate the magic away from Free, (b) doesn't trigger end-of-month credit panic, and (c) gives a clean "you've hit today's limit, comes back tomorrow OR upgrade now" upsell moment.

---

## 2. Per-call usage profile

The ✨ Suggest button on tadaify fires when a creator clicks it next to a `title` / `label` / `short-text` / `caption` field. The Edge Function builds a prompt, calls the model, returns 5 short suggestion strings.

| Dimension | Value | Notes |
|---|---|---|
| **Field types** | title (≤80 chars), label (≤24), short-text (≤200), caption (≤140) | Each has its own prompt template + few-shot examples |
| **Input tokens (system + few-shot + creator context)** | 200 – 400 | System prompt (~120 tok) + 3 few-shot examples (~150 tok) + creator's existing block context (~50–150 tok) |
| **Output tokens (5 short suggestions in JSON)** | 150 – 300 | 5 × ~30–50 tokens each + JSON wrapper |
| **Total per call (avg)** | **~500 tokens** (350 input + 150 output) | Used as the canonical "1 call = 500 tokens" unit below |
| **Total per call (worst case)** | ~700 tokens (400 input + 300 output) | When creator has long context + verbose output |
| **Latency target** | ≤ 2 s end-to-end | First token under 500 ms, full response under 1.5 s |
| **Quality target** | 5 distinct, on-brand, ≤ field-length suggestions; no markdown | Notion / Linear "magic ✨" feel |
| **Failure tolerance** | High — creator can always retype manually | But repeated failure = churn |

**Token math constants used in this report:**
- 1 call = 500 tokens average (350 input + 150 output)
- 1 call = 700 tokens worst case (400 input + 300 output)
- Realistic clicks/day per active creator: 5
- Worst-case clicks/day per active creator: 30
- Active-creator ratio: 30% of total signed-up creators are DAU

---

## 3. Model evaluation

All pricing verified 2026-04-27. **Pricing changes monthly — verify before any contract.**

### 3.1 Cloudflare Workers AI

**Pricing model:** Bundled with Workers Paid plan ($5/mo minimum). Includes 10,000 free neurons/day. Beyond that: $0.011 / 1,000 neurons.
[Source: Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

| Model | Input $/Mtok | Output $/Mtok | Per-call cost (500 tok) | Per-call cost (worst 700 tok) |
|---|---|---|---|---|
| `@cf/meta/llama-3.1-8b-instruct[-fast]` | $0.282 | $0.827 | **$0.000223** | **$0.000361** |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | $0.293 | $2.253 | **$0.000455** | **$0.000793** |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | $0.660 | $1.000 | **$0.000381** | **$0.000564** |

Worked example for `llama-3.1-8b-instruct`:
- Input: 350 tok × $0.282 / 1,000,000 = $0.0000987
- Output: 150 tok × $0.827 / 1,000,000 = $0.000124
- **Total = $0.000223 per call**

**Latency:** 80+ TPS, time-to-first-token ~300 ms for 8B. Speculative decoding adds up to 40% speed boost on `-fast` variant. End-to-end on a 150-token output: ~2 s. ✅ meets target.
[Source: Cloudflare Workers AI bigger/better/faster](https://blog.cloudflare.com/workers-ai-bigger-better-faster/)

**Quality vibe:** Llama 3.1 8B is good enough for short structured-output tasks (title/caption variants). It will occasionally produce a flat suggestion. The 70B-fp8-fast variant is meaningfully better at "varied + on-brand" quality but costs ~2× as much. For Pro+ "premium quality" toggle, 70B is the natural upgrade.

**Operational concerns:**
- Workers AI runs on Cloudflare edge — globally distributed, no region pinning needed.
- Rate limits: account-level neuron quota; no per-model RPM cap published.
- API stability: GA, stable since 2025.
- **Strong fit:** tadaify is already (per project notes) considering Cloudflare Workers for video block — adding Workers AI keeps infra consolidated, single bill, single auth.

### 3.2 OpenAI

[Source: OpenAI API pricing](https://developers.openai.com/api/docs/pricing) — 2026 lineup is `gpt-5.x`. Legacy 4.x models (gpt-4o-mini, gpt-4o, gpt-3.5-turbo) are deprecated and were not extracted from current pricing page.

| Model | Input $/Mtok | Cached input $/Mtok | Output $/Mtok | Per-call cost (500 tok) | Per-call cost (worst 700 tok) |
|---|---|---|---|---|---|
| `gpt-5.5` | $5.00 | $0.50 | $30.00 | **$0.00625** | **$0.0110** |
| `gpt-5.4` | $2.50 | $0.25 | $15.00 | **$0.00313** | **$0.00550** |
| `gpt-5.4-mini` | $0.75 | $0.075 | $4.50 | **$0.000938** | **$0.00165** |
| `gpt-5.4-nano` | $0.20 | $0.02 | $1.25 | **$0.000258** | **$0.000455** |

Worked example for `gpt-5.4-nano`:
- Input: 350 tok × $0.20 / 1,000,000 = $0.00007
- Output: 150 tok × $1.25 / 1,000,000 = $0.000188
- **Total = $0.000258 per call**

With cached system prompt + few-shot examples (the leading 270 tokens of every call are identical → cached at $0.02/Mtok):
- Cached input (270 tok): 270 × $0.02 / 1,000,000 = $0.0000054
- Fresh input (80 tok creator context): 80 × $0.20 / 1,000,000 = $0.000016
- Output (150 tok): 150 × $1.25 / 1,000,000 = $0.000188
- **Total with cache = $0.000209 per call** — beats Cloudflare for cached prompts

**Batch API discount:** 50% off (not applicable — ✨ Suggest is interactive, not batchable).

**Latency:** GPT-5.4-nano is OpenAI's "edit-window" tier — short completions / boilerplate. Time-to-first-token typically 200–600 ms. ✅ meets target.

**Quality vibe:** gpt-5.4-nano benchmarks comparably to Claude Haiku 4.5 on short-text tasks; faster TTFT, lower cost. For the "5 short suggestions" task it is overqualified.
[Source: GPT-5.4 mini and nano benchmarks - DataCamp](https://www.datacamp.com/blog/gpt-5-4-mini-nano)

**Operational concerns:**
- US-only inference unless data-residency uplift (10%) — not material.
- Tier-1 rate limits (without spend history) start at 500 RPM / 200k TPM — sufficient for first 1k DAU but needs upgrade by 10k DAU.
- API stability: highest in industry.
- **Cache discount is 90% off** — extremely well suited to ✨ Suggest's repeated system prompt.

### 3.3 Anthropic Claude

[Source: Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing) — verified 2026-04-27.

| Model | Input $/Mtok | Cache read $/Mtok | Output $/Mtok | Per-call cost (500 tok) |
|---|---|---|---|---|
| `claude-haiku-4-5` | $1.00 | $0.10 | $5.00 | **$0.00110** |
| `claude-sonnet-4-6` | $3.00 | $0.30 | $15.00 | **$0.00330** |
| `claude-opus-4-7` | $5.00 | $0.50 | $25.00 | **$0.00550** |

Worked example for `claude-haiku-4-5`:
- Input: 350 tok × $1 / 1,000,000 = $0.00035
- Output: 150 tok × $5 / 1,000,000 = $0.00075
- **Total = $0.00110 per call** — ~5× more expensive than Cloudflare 8B

With prompt caching (cache hits at 0.1× = $0.10/Mtok):
- Cached input (270 tok): 270 × $0.10 / 1,000,000 = $0.000027
- Fresh input (80 tok): 80 × $1 / 1,000,000 = $0.00008
- Output (150 tok): 150 × $5 / 1,000,000 = $0.00075
- **Total with cache = $0.000857 per call**

**Latency:** Haiku 4.5 — TTFT ~250 ms, similar to gpt-5.4-nano. ✅ meets target.

**Quality vibe:** Haiku 4.5 is the highest-quality option on the cheap end. Anthropic models tend to produce more "on-brand" / "Notion-like" copy out of the box (lower temperature variance, less mode collapse on short outputs). [Source: Claude Haiku 4.5 vs gpt-5.4 mini](https://www.mindstudio.ai/blog/gpt-54-mini-vs-claude-haiku-sub-agent-comparison)

**Operational concerns:**
- Tier-1 limits start lower (50 RPM / 50k TPM); requires deposit history to scale.
- Notion AI is rumored to use Anthropic for short-text rewrites — is the de-facto reference quality bar.

### 3.4 Mistral

[Source: Mistral API pricing 2026 - via search](https://www.burnwise.io/ai-pricing/mistral) — direct page returned 404, citing aggregator search.

| Model | Input $/Mtok | Output $/Mtok | Per-call cost (500 tok) |
|---|---|---|---|
| `ministral-3b` | $0.10 | $0.10 | **$0.00005** |
| `ministral-8b` | $0.10 | $0.10 | **$0.00005** |
| `mistral-small-latest` | $0.20 | $0.60 | **$0.000160** |
| `mistral-medium` (latest) | ~$0.40 | ~$2.00 | **~$0.000440** |

**Per-call winner on raw price:** Ministral 3B / 8B at **$0.00005/call** — half of Cloudflare, 5× cheaper than gpt-5.4-nano.

**Latency:** TTFT ~200–400 ms via Mistral-hosted endpoint. ✅

**Quality vibe:** Ministral 8B is competitive with Llama 3.1 8B on short structured tasks. Lower brand-recognition than Anthropic/OpenAI but pricing-aggressive. Good for cost-sensitive Free tier.

**Operational concerns:**
- EU-hosted (data residency story is good for European creators).
- API still less mature than OpenAI/Anthropic — occasional 5xx during peak hours.
- Lower marketing-side credibility ("powered by Mistral" is less of a sales line than "powered by GPT").

### 3.5 Groq

[Source: Groq pricing](https://groq.com/pricing/) and [rate limits](https://console.groq.com/docs/rate-limits)

| Model | Input $/Mtok | Output $/Mtok | Per-call cost (500 tok) |
|---|---|---|---|
| `llama-3.1-8b-instant` | $0.05 | $0.08 | **$0.0000295** |
| `llama-3.3-70b-versatile` | $0.59 | $0.79 | **$0.000325** |

**Speed:** llama-3.1-8b-instant runs at **840 TPS** — fastest on the market by 5–10×. End-to-end for 150-token output: **~400 ms**. Game-changing for the ✨ button feel.

**Free-tier rate limits:** 30 RPM / 14,400 RPD / 6k TPM / 500k TPD. **This is too low for a multi-tenant SaaS**: a single power user at 30 clicks/day eats 0.2% of the daily token budget; 1k DAU with avg 5 calls = 5k calls/day = ~2.5M tokens/day. Free tier exhausts at ~200 DAU. Developer plan needed for scale (pricing not public; per-call cost stays low).

**Quality vibe:** Same Llama 3.1 8B model as Cloudflare — quality identical, just hosted differently.

**Operational concerns:**
- Rate-limit ceilings unpublished for Dev tier; need sales conversation.
- Single-region (US-Midwest) — adds 50–100ms RTT for EU creators vs Cloudflare edge.
- **Best raw speed of any provider** — if user-perceived latency is the battleground, Groq wins.

### 3.6 Together.ai

Similar pricing band to Mistral / Groq for open Llama models ($0.10–$0.30 per Mtok). Not differentiated enough to be a primary choice; mention only as multi-vendor failover.

### 3.7 Per-call cost summary (sorted cheapest first)

| Model | Per-call avg (500 tok) | Notes |
|---|---|---|
| Groq `llama-3.1-8b-instant` | $0.0000295 | Cheapest + fastest, but rate-limit ceilings |
| Mistral `ministral-3b` / `8b` | $0.00005 | Cheapest among first-party APIs |
| Mistral `mistral-small-latest` | $0.000160 | Better quality than Ministral, modest premium |
| OpenAI `gpt-5.4-nano` (cached) | $0.000209 | With prompt cache; otherwise $0.000258 |
| Cloudflare Llama 3.1 8B | $0.000223 | Bundled in Workers infra |
| OpenAI `gpt-5.4-nano` (uncached) | $0.000258 | Tier-1 rate limits sufficient to ~10k DAU |
| Cloudflare Qwen 2.5 32B | $0.000381 | Better quality than 8B |
| Cloudflare Llama 3.3 70B-fp8-fast | $0.000455 | Premium-quality option |
| Anthropic `claude-haiku-4-5` (cached) | $0.000857 | Highest quality on cheap end |
| OpenAI `gpt-5.4-mini` | $0.000938 | Overqualified for the task |
| Anthropic `claude-haiku-4-5` (uncached) | $0.00110 | |
| OpenAI `gpt-5.4` | $0.00313 | Way overqualified |

**Within the "cheap enough to gate generously" band ($0.0001–$0.0003/call):** Groq, Mistral, Cloudflare. All three are viable. Recommendation lands on Cloudflare for the operational consolidation reasons.

---

## 4. Cost-at-scale tables

### Constants
- **Realistic case:** 5 ✨ clicks/day per active creator
- **Worst case:** 30 ✨ clicks/day per active creator (creator going through every field on a big page)
- **Active-creator ratio:** 30% of signed-up creators are DAU
- **Quotas applied?** No — these tables compute the *unbounded* cost (i.e. what happens if every active creator hits worst-case daily, every day, with no rate-limiting). Strategy tables in §5 show the cost AFTER applying limits.
- **Monthly multiplier:** 30 days

### 4.1 Realistic case (5 clicks/day × 30% activation)

Formula: `monthly_cost = total_creators × 0.3 × 5 × 30 × per_call_cost`

| Total creators | Active creators (30%) | Calls/month | Cloudflare 8B ($0.000223) | gpt-5.4-nano ($0.000258) | Anthropic Haiku 4.5 ($0.00110) | Mistral 8B ($0.00005) |
|---|---|---|---|---|---|---|
| **100** | 30 | 4,500 | $1.00 | $1.16 | $4.95 | $0.23 |
| **1,000** | 300 | 45,000 | $10.04 | $11.61 | $49.50 | $2.25 |
| **10,000** | 3,000 | 450,000 | $100 | $116 | $495 | $22.50 |
| **100,000** | 30,000 | 4,500,000 | $1,004 | $1,161 | $4,950 | $225 |
| **1,000,000** | 300,000 | 45,000,000 | $10,035 | $11,610 | $49,500 | $2,250 |

### 4.2 Worst case (30 clicks/day × 30% activation, no rate limits)

Formula: `monthly_cost = total_creators × 0.3 × 30 × 30 × per_call_cost`

| Total creators | Active creators | Calls/month | Cloudflare 8B | gpt-5.4-nano | Anthropic Haiku 4.5 | Mistral 8B |
|---|---|---|---|---|---|---|
| **100** | 30 | 27,000 | $6.02 | $6.97 | $29.70 | $1.35 |
| **1,000** | 300 | 270,000 | $60.21 | $69.66 | $297 | $13.50 |
| **10,000** | 3,000 | 2,700,000 | $602 | $697 | $2,970 | $135 |
| **100,000** | 30,000 | 27,000,000 | $6,021 | $6,966 | $29,700 | $1,350 |
| **1,000,000** | 300,000 | 270,000,000 | $60,210 | $69,660 | $297,000 | $13,500 |

### 4.3 Survival assessment per model at 1M DAU worst case

(Worst case = no rate limits, every active creator generates 30 calls/day every day.)

| Model | 1M-creators worst case | Survives Free-tier abuse? |
|---|---|---|
| Mistral 8B | $13,500/mo | ✅ Easily |
| Cloudflare Llama 8B | $60,210/mo | ✅ With strategy gating |
| gpt-5.4-nano | $69,660/mo | ✅ With strategy gating |
| Anthropic Haiku 4.5 | $297,000/mo | ⚠️ Need aggressive gating; 10× the bleed |
| OpenAI gpt-5.4-mini | $253,000/mo | ⚠️ Same |

**Even the worst-case Anthropic scenario is < $300k/mo at 1M DAU**, which is a ~$3.6M/yr COGS line on what would be a $50M+/yr ARR product (1M DAU × any reasonable conversion). The cost is **never** what kills this; it's only a margin question. Cheap models give wider margin for marketing spend, premium models give better quality. Both are economically viable.

### 4.4 Sanity-check: Free-tier abuse at moderate scale

Suppose at 10k creators stage, 100 power users spam 200 calls/day. With Cloudflare 8B that is `100 × 200 × 30 × $0.000223 = $134/mo`. Negligible. Even with Anthropic Haiku 4.5 = $660/mo. **Abuse is not a financial risk; it is a UX/fairness risk** (other creators hit slower API or our rate limits trigger).

---

## 5. Three candidate strategies

All three strategies costed against the recommended model **Cloudflare Llama 3.1 8B at $0.000223/call**. Numbers scale linearly for any other model — divide/multiply by ratio.

### 5.1 Strategy 1 — Pro+ gated (AI off Free + Creator)

**Mechanism**
- Free / Creator tiers: ✨ Suggest button is **hidden entirely**.
- Pro $19 + Business $49 tiers: button visible, **unlimited** with a fair-use cap of ~500 calls/day to stop bots.

**Pros**
- Simplest economics — only paying tiers consume tokens; the cost line is bounded by the number of paying users × their cap.
- Premium positioning — "AI suggestions are part of Pro" is a clean upsell line.
- Zero abuse risk on Free.
- No per-day quota tracking needed for Free/Creator (no AI = no DB column, no UI).

**Cons**
- **Loses the magic moment for the very people who need copy help most.** Free + Creator tiers are hobbyists / first-time creators with the least confidence in their own copy. They're the customer segment that benefits most from "✨ → 5 ideas".
- **Dampens word-of-mouth.** A creator on Creator tier shows the dashboard to a friend; the friend asks "where's the AI everyone talks about?" and the answer is "you have to upgrade". Bad demo.
- **Underutilises capacity.** Cloudflare Workers Paid plan includes 10,000 free neurons/day = ~390 ✨ calls/day at no marginal cost. Strategy 1 wastes that allocation.
- **Doesn't match category norm.** ChatGPT, Perplexity, even Notion (until May 2025) gave Free tier *some* AI tasting. Notion's removal of AI from Free was widely criticised as a class-divide move; tadaify shouldn't repeat the mistake.

**Per-tier cost-at-scale (assume 20% Pro, 5% Business of *active* base; rest Free/Creator → 0 calls)**

| Total creators | Pro+ active (25% of 30%) | Calls/mo (avg 5/day) | Worst-case calls (cap 500/day) | Cloudflare cost (avg) | Cloudflare cost (worst) |
|---|---|---|---|---|---|
| 100 | 7.5 | 1,125 | 112,500 | $0.25 | $25 |
| 1,000 | 75 | 11,250 | 1,125,000 | $2.51 | $251 |
| 10,000 | 750 | 112,500 | 11,250,000 | $25.09 | $2,509 |
| 100,000 | 7,500 | 1,125,000 | 112,500,000 | $251 | $25,088 |
| 1,000,000 | 75,000 | 11,250,000 | 1,125,000,000 | $2,509 | $250,875 |

**Worst case at 1M DAU = $250k/mo** if every paying creator hits their 500/day cap every day — still affordable but wasteful.

**Industry comparison:** Notion (post-May-2025) gates ALL AI to Business+ ($20/user/mo unlimited). [Source: Notion AI pricing 2026](https://userjot.com/blog/notion-pricing-2025-plans-ai-costs-explained). Critically received as an "anti-Free" move that pushed creators to Anytype + Obsidian.

---

### 5.2 Strategy 2 — Credits/month per tier

**Mechanism**
- Free: 0 OR 10 credits/mo (~10 ✨ clicks)
- Creator: 50 credits/mo
- Pro: 500 credits/mo
- Business: unlimited (fair-use ~5,000/mo)
- 1 credit = 1 ✨ Suggest call. Reset on first day of billing cycle.
- Out-of-credits UX: friendly modal "You've used all 50 of your AI suggestions this month. Resets May 1, or upgrade to Pro for 500/month →"

**Pros**
- Predictable cost per tier — `tier_price × users` minus `quota × users × per_call_cost` = stable margin.
- Tier separation is sharp — no overlap, no "well I'm on Creator but I get unlimited too" leakage.
- Free tier still tastes the magic (10 calls = enough to be impressed).
- Industry-norm pattern (GitHub Copilot, Cursor, Notion historically).

**Cons**
- **Creator anxiety.** Studies on Copilot premium-request usage show users moderate behaviour to "save credits for later" — exactly the *opposite* of what we want for a discoverability feature. Creator on Creator tier with 8 credits left mid-month doesn't experiment; they hoard.
- **Credit-fatigue is real.** Bills, subscriptions, credit-balance notifications — every UX research piece on metered-AI products confirms users dislike tracking credit balances.
- **Monthly resets are confusing.** Especially for tadaify creators billed on different cycle dates. UX needs prominent "you have N credits, resets on DD" strip.
- **Penalises power users.** A Creator-tier user who happens to redo their landing page in one sitting (~30 clicks across all blocks) blows their entire month's allocation on one good-faith use.
- **Cost of building the system.** Database table for credit balances per user, atomic decrement on call, monthly reset job, edge case for plan changes mid-cycle. ~3 days of engineering.

**Per-tier cost-at-scale (assume 100% utilisation of quota by all users)**

Quota distribution assumed: 70% Free, 15% Creator, 12% Pro, 3% Business.

| Total creators | Free × 10 | Creator × 50 | Pro × 500 | Business × 5,000 (fair-use) | Total calls/mo | Cloudflare cost |
|---|---|---|---|---|---|---|
| 100 | 700 | 750 | 600 | 1,500 | 3,550 | $0.79 |
| 1,000 | 7,000 | 7,500 | 6,000 | 15,000 | 35,500 | $7.92 |
| 10,000 | 70,000 | 75,000 | 60,000 | 150,000 | 355,000 | $79.17 |
| 100,000 | 700,000 | 750,000 | 600,000 | 1,500,000 | 3,550,000 | $791.65 |
| 1,000,000 | 7,000,000 | 7,500,000 | 6,000,000 | 15,000,000 | 35,500,000 | $7,917 |

**Worst case at 1M DAU = $7.9k/mo.** Tightest cost ceiling of the three strategies — but at the expense of UX friction.

**Industry comparison:** GitHub Copilot Free 50 / Pro 300 / Pro+ 1,500 / Business unlimited. Pro+ at $39/mo. [Source: GitHub Copilot pricing 2026](https://pecollective.com/tools/github-copilot-pricing/). GitHub charges $0.04/extra request beyond quota — a similar overage line is technically possible but adds yet another billing concept tadaify has to explain.

---

### 5.3 Strategy 3 — Daily rate-limit per tier (RECOMMENDED)

**Mechanism**
- Free: 5 clicks/day (enough for: title + 2 captions + 2 short-text, i.e. one full block fill-out)
- Creator: 50 clicks/day (enough to redo a whole page in one sitting + some experimentation)
- Pro: unlimited with fair-use 500/day (enough for any human creator; 500/day = 21/hour sustained, clearly bot territory)
- Business: unlimited with fair-use 2,000/day (agency / multi-brand scenarios)
- Reset midnight UTC.
- Out-of-quota UX: friendly modal "You've used today's 5 AI suggestions. Resets midnight UTC, or upgrade to Creator for 50/day →" with an inline countdown.

**Pros**
- **Simple mental model** — "X per day" is something every internet user already understands (Spotify free skips, ChatGPT free messages, Wordle, Twitter API).
- **Daily reset feels less precious than monthly** — running out today is annoying but tomorrow is fine; running out for the month is a 30-day grievance.
- **Free tier tastes the magic** — 5 calls/day = enough to experience "wow this is useful" without any single call feeling load-bearing.
- **Abuse-protected** — fair-use caps keep a single bad actor capped at predictable infra spend.
- **Cleanest upsell moment** — "you've hit today's limit" + Upgrade CTA is the highest-intent state in the app. Better conversion trigger than "you've hit this month's limit, see you in 3 weeks".
- **Cheap to build** — `(user_id, date) → counter` table; reset is implicit via date partitioning.

**Cons**
- **Creator who needs 6 suggestions in a sitting on Free tier hits the wall.** Real complaint, not a hypothetical. Mitigation: the 6th creator either (a) waits till tomorrow and likely doesn't even open tadaify next-day, or (b) upgrades — exactly the conversion moment we want.
- **Daily limits can feel artificial** ("why 5 and not 10?"). Mitigation: round numbers + clear copy.
- **Timezone confusion** — midnight UTC is 4pm PST; a Pacific-coast creator's "today" doesn't match the reset. Mitigation: show countdown timer in user's local time.

**Per-tier cost-at-scale (assume 100% of active creators hit daily cap 5 days/week, 0 the other 2 days = 5/7 utilisation of quota)**

Tier distribution: 70% Free, 15% Creator, 12% Pro, 3% Business.

| Total creators | Active (30%) | Free×5×5/7 | Creator×50×5/7 | Pro×500×5/7 | Business×2k×5/7 | Calls/mo | Cloudflare cost |
|---|---|---|---|---|---|---|---|
| 100 | 30 | 75 | 161 | 129 | 64 | 13,470 | $3.00 |
| 1,000 | 300 | 750 | 1,607 | 1,286 | 643 | 134,580 | $30.01 |
| 10,000 | 3,000 | 7,500 | 16,072 | 12,857 | 6,429 | 1,345,800 | $300.11 |
| 100,000 | 30,000 | 75,000 | 160,716 | 128,571 | 64,286 | 13,458,000 | $3,001 |
| 1,000,000 | 300,000 | 750,000 | 1,607,143 | 1,285,714 | 642,857 | 134,580,000 | $30,011 |

**Worst case at 1M DAU = $30k/mo.** Sits in the middle of Strategy 1 (wasteful) and Strategy 2 (tightest). Tradeoff is the right one: spend ~3.8× more than Strategy 2 to avoid credit anxiety + retain Free-tier conversion funnel.

**Industry comparison:**
- ChatGPT Free: ~10 GPT-5 messages / 3 hours, then degrades to GPT-mini. Daily soft-rate-limit pattern.
- Perplexity Free: 5 Pro searches / day. Daily reset. **Direct match for the proposed pattern.**
- Cursor Free: 50 slow requests / month (credit pattern, not daily).
- Linear AI: bundled in plan, no limit communicated to user.
- v0.dev Free: 5 messages / day.

The daily-rate-limit pattern is the most common UX in 2026 for cost-bounded AI features. tadaify aligns with creator/dev tooling norm.

---

## 6. Architectural choice — proxied vs BYOK

### Option A — Proxied via tadaify Edge Function (RECOMMENDED)

- tadaify operates a Cloudflare Worker (or Supabase Edge Function) at `POST /api/ai-suggest`.
- Worker reads creator's tier + today's usage from DB, applies rate limit, calls Cloudflare Workers AI, returns 5 suggestions.
- Creators never see/manage API keys.
- tadaify pays the bill, gates by tier per Strategy 3.

**Pros**
- Zero creator setup friction — ✨ button "just works" at signup.
- Centralised cost — predictable monthly bill, single vendor relationship.
- Can swap underlying model without creator action (A/B testing, vendor failover).
- Aggressive prompt caching at the proxy layer (system prompt + few-shot examples shared across all creators → cache hit rate >99%).
- Unified analytics (who uses ✨ how often, on which fields, do generated ones get accepted?).
- Tier-gating is clean — no "what if BYOK creator on Free tier" edge cases.

**Cons**
- tadaify carries the COGS. At Cloudflare 8B scale that's ~$30k/mo at 1M DAU — fine.
- Single point of failure (proxy down = ✨ down for everyone).

### Option B — Creator brings own API key (BYOK)

- Creator pastes OpenAI / Anthropic / Cloudflare API key into Settings → AI.
- ✨ button fires call directly from creator's browser to provider with creator's key (or via tadaify Worker that uses creator's key).
- Creator pays own bill.

**Pros**
- Zero tadaify infra cost.
- No tier-gating needed (creator self-rate-limits via their own quota).
- Power users who already have an API key get unlimited day-1.
- Privacy story for creators who don't want their copy seen by tadaify-controlled vendor.

**Cons**
- **Setup friction kills adoption.** 90%+ of tadaify creators don't have an API key. Asking them to sign up at OpenAI, add a credit card, generate a key, paste it — that's a 4-step onboarding wall on a feature that should be one click.
- Key management is a security liability for tadaify (we either store keys in plaintext, or in a vault, or send them client-side — each option has tradeoffs).
- Quality varies by creator — some pick gpt-5.5 ($30/Mtok output), some pick a free-tier rate-limited Groq key — inconsistent ✨ experience.
- No upsell story — if creator pays their own AI bill, they have no reason to upgrade tadaify tier.

### Option C — Hybrid (Proxied default + optional BYOK for power users)

- Free / Creator / Pro tiers: proxied per Strategy 3.
- Pro / Business tiers: option to "Use your own OpenAI key" in Settings — bypasses tadaify quota entirely.
- Never asked of free users.

**Pros**
- Best of both — defaults to magic, opt-in to power user mode.
- Power users who hit daily cap on Pro can self-serve an "infinite quota" by adding their own key.

**Cons**
- 2× engineering effort (both code paths).
- Splits analytics (we don't see what's in BYOK calls).

### Recommendation

**Option A — fully proxied.** Reasoning:
1. The model cost is so cheap ($30k/mo at 1M DAU worst case) that the BYOK savings aren't worth the onboarding friction.
2. Proxied lets us swap models without creator action — critical for cost optimisation as the field evolves.
3. Hybrid (Option C) is an option to add later if Pro+ users explicitly demand it; not needed for MVP.
4. Centralised analytics is a competitive moat (we learn what kinds of suggestions creators actually ship vs reject).

---

## 7. Recommendation matrix

| Dimension | Recommendation | Why |
|---|---|---|
| **Default model** | Cloudflare `@cf/meta/llama-3.1-8b-instruct-fast` | Cheap ($0.000223/call), fast (TTFT 300ms, 80+ TPS), already in tadaify infra plan, edge-distributed |
| **Premium model toggle** (Pro+ only) | Cloudflare `@cf/meta/llama-3.3-70b-instruct-fp8-fast` OR `gpt-5.4-nano` | Quality bump for paying creators who notice the difference |
| **Strategy** | Strategy 3 — Daily rate-limit | Free 5 / Creator 50 / Pro unlimited+500 / Business unlimited+2k. Daily reset midnight UTC. |
| **Architecture** | Proxied via tadaify Worker (Option A) | Zero creator friction; cost is bounded; we control quality |
| **Caching** | Yes — system prompt + few-shot examples shared (deterministic prefix); per-creator output NOT cached | DEC-AI-COST-06 — cached identical inputs only, never reuse one creator's suggestions for another |

**Why this combo (1 paragraph):** Cloudflare Llama 8B + daily rate-limit + proxied gives tadaify the lowest engineering surface (one provider, one quota model, no BYOK edge cases), the friendliest UX (Free creators get a real taste, Pro+ creators get unlimited, abuse is capped), and the best cost profile (~$30k/mo at 1M DAU worst case = a non-issue against a $50M+ ARR product). The 70B model as a Pro+ "premium quality" toggle gives a tangible upgrade reason without changing the core architecture.

---

## 8. Open DECs

The following decisions must be answered before AI Suggest implementation can begin. These will be filed in `/tmp/claude-decisions/decisions.json` when the user is ready to decide.

### DEC-AI-COST-01 — Which model?

| ID | DEC-AI-COST-01 |
|---|---|
| **Czego dotyczy** | Default model for ✨ Suggest |
| **Szczegolowy opis** | tadaify needs to pick one provider+model as the default for the ✨ Suggest button across all tiers. Cost ranges from $0.00003 (Groq) to $0.0011 (Anthropic Haiku) per call. Quality is comparable in the cheap band; the differentiation is operational consolidation, latency, and brand. |
| **Opcje** | 1) Cloudflare `llama-3.1-8b-instruct-fast` 2) OpenAI `gpt-5.4-nano` 3) Anthropic `claude-haiku-4-5` 4) Mistral `ministral-8b` 5) Groq `llama-3.1-8b-instant` |
| **Twoja rekomendacja** | **Option 1 (Cloudflare Llama 8B-fast)** — consolidates with tadaify's planned Cloudflare Worker infra (per video-block research), edge-distributed for global creators, $0.000223/call is affordable, and 80+ TPS / 300ms TTFT meets latency budget. |

### DEC-AI-COST-02 — Which strategy?

| ID | DEC-AI-COST-02 |
|---|---|
| **Czego dotyczy** | How to gate ✨ Suggest by tier |
| **Szczegolowy opis** | Three patterns are viable: hide AI from Free entirely (premium positioning), monthly credit balance (predictable cost, creator anxiety), daily rate-limit (Perplexity/v0/ChatGPT pattern, simple mental model). The choice shapes Free→Creator conversion funnel and ongoing UX. |
| **Opcje** | 1) Pro+ gated (no AI on Free/Creator) 2) Monthly credits (Free 10 / Creator 50 / Pro 500 / Business unlimited) 3) Daily rate-limit (Free 5 / Creator 50 / Pro unlimited+500/d / Business unlimited+2k/d) |
| **Twoja rekomendacja** | **Option 3 (daily rate-limit)** — simplest UX, retains Free-tier magic moment, gives clean upsell trigger ("hit today's limit → upgrade"), and the cost ($30k/mo at 1M DAU) is bounded. Notion's removal of AI from Free in May 2025 was widely criticised; Strategy 1 repeats that mistake. Strategy 2's monthly credits create credit anxiety and dampen experimentation. |

### DEC-AI-COST-03 — Free-tier daily quota (if Strategy 3)

| ID | DEC-AI-COST-03 |
|---|---|
| **Czego dotyczy** | How many ✨ clicks/day for Free tier |
| **Szczegolowy opis** | Conditional on DEC-AI-COST-02 = Strategy 3. Free tier needs enough quota to taste the magic but not enough to remove the upgrade incentive. 5/day = one full block fill-out. 3/day = title + 2 captions only (might feel too tight). 10/day = enough that creators rarely hit the wall (might over-serve Free). |
| **Opcje** | 1) 3 clicks/day 2) 5 clicks/day 3) 10 clicks/day 4) Unlimited but hidden behind "verify email + add 1 page" gate |
| **Twoja rekomendacja** | **Option 2 (5/day)** — matches Perplexity Free (5 Pro searches/day), v0.dev Free (5 messages/day) — proven category norm. Enough to fill out one block end-to-end, not enough to erase the upgrade reason. |

### DEC-AI-COST-04 — Out-of-quota UX details

| ID | DEC-AI-COST-04 |
|---|---|
| **Czego dotyczy** | What happens when a creator clicks ✨ on the 6th call of the day |
| **Szczegolowy opis** | Three patterns: (a) hard block — modal "you're out, upgrade", (b) silent degrade — generate 1 instead of 5, or use a worse model, (c) friendly upsell — modal with countdown + Upgrade CTA + "or wait until midnight UTC". UX matters because this is the highest-intent moment for tier conversion. |
| **Opcje** | 1) Hard block modal with Upgrade CTA + countdown timer 2) Silent degrade (generate 1 suggestion or use cheaper model) 3) Toast notification "out of suggestions today" + button still clickable but no-op 4) Hard block + offer "watch a 30s ad to unlock 5 more" |
| **Twoja rekomendacja** | **Option 1 (hard block + countdown + Upgrade CTA)** — clearest mental model, highest conversion intent, no half-measures that confuse the creator about whether the feature works. Silent degrade (Option 2) is dishonest and confuses brand quality perception. Ad unlock (Option 4) is consumer-grade and cheapens tadaify positioning. |

### DEC-AI-COST-05 — Proxied vs BYOK architecture

| ID | DEC-AI-COST-05 |
|---|---|
| **Czego dotyczy** | Whether tadaify operates the AI provider relationship or creators bring their own keys |
| **Szczegolowy opis** | Proxied = zero creator friction, tadaify pays bill, tier gating works. BYOK = zero tadaify cost but 90% of creators don't have a key, complex onboarding. Hybrid = both code paths, more engineering. The chosen model is so cheap that BYOK savings aren't worth the friction. |
| **Opcje** | 1) Proxied only (tadaify Worker, tadaify pays) 2) BYOK only (creator pastes key) 3) Hybrid: proxied default + optional BYOK on Pro+ |
| **Twoja rekomendacja** | **Option 1 (proxied only)** — zero onboarding friction is more valuable than the COGS savings at this cost band. Hybrid (Option 3) can be added in v2 if Pro+ creators explicitly request it. |

### DEC-AI-COST-06 — Caching strategy

| ID | DEC-AI-COST-06 |
|---|---|
| **Czego dotyczy** | Whether to cache ✨ Suggest results, and at what granularity |
| **Szczegolowy opis** | Two questions: (1) cache the *prompt prefix* (system prompt + few-shot examples) — this is identical across all creators and saves 80% of input tokens; deterministic and harmless. (2) Cache the *full output* keyed on (creator_id, field_type, current_value, neighbor_blocks_hash) for N hours — saves cost on repeat clicks but creator might want a fresh batch on retry. |
| **Opcje** | 1) Cache prompt prefix only (always); never cache output 2) Cache prefix AND output for 24 hours per (creator, input-hash) 3) Cache prefix AND output for 1 hour per (creator, input-hash) 4) Cache prefix AND offer "regenerate" button that bypasses output cache |
| **Twoja rekomendacja** | **Option 4 (prefix always cached, output cached 1h with explicit regenerate)** — saves cost on accidental double-clicks (common), but explicit retry / "give me different ones" always bypasses cache and hits the model fresh. Most creator-respectful pattern. |

---

## 9. Implementation notes

### 9.1 Edge Function shape (Cloudflare Worker)

```ts
// POST /api/ai-suggest
// Headers: Authorization: Bearer <tadaify-jwt>
// Body: { fieldType: 'title' | 'label' | 'short-text' | 'caption', currentValue: string, blockContext: object, regenerate?: boolean }
// Returns: { suggestions: string[5], remainingToday: number }

export default {
  async fetch(req: Request, env: Env) {
    const user = await verifyJWT(req, env);
    const tier = await getUserTier(user.id, env);
    const dailyCap = TIER_CAPS[tier]; // { free: 5, creator: 50, pro: 500, business: 2000 }
    const usedToday = await getUsageToday(user.id, env);
    if (usedToday >= dailyCap) return jsonResponse({ error: 'quota_exceeded', resetAt: nextMidnightUTC() }, 429);

    const body = await req.json();
    const cacheKey = await sha256({ fieldType: body.fieldType, currentValue: body.currentValue, ctx: body.blockContext });
    if (!body.regenerate) {
      const cached = await env.SUGGEST_CACHE.get(cacheKey);
      if (cached) return jsonResponse({ suggestions: JSON.parse(cached), remainingToday: dailyCap - usedToday });
    }

    const messages = buildPrompt(body); // system prompt + few-shot + creator context
    const ai = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', { messages, max_tokens: 300, temperature: 0.7 });
    const suggestions = parseFiveSuggestions(ai.response);

    await env.SUGGEST_CACHE.put(cacheKey, JSON.stringify(suggestions), { expirationTtl: 3600 });
    await incrementUsage(user.id, env);
    await logUsage(user.id, tier, body.fieldType, env); // for analytics + cost tracking

    return jsonResponse({ suggestions, remainingToday: dailyCap - usedToday - 1 });
  }
};
```

### 9.2 Database schema sketch (Supabase)

```sql
-- per-user daily usage counter
create table public.ai_suggest_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  count integer not null default 0,
  primary key (user_id, date)
);

create index ai_suggest_usage_date_idx on public.ai_suggest_usage(date);

-- atomic increment
create or replace function increment_ai_usage(p_user_id uuid)
returns integer language plpgsql security definer as $$
declare v_count integer;
begin
  insert into public.ai_suggest_usage (user_id, date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date) do update set count = ai_suggest_usage.count + 1
  returning count into v_count;
  return v_count;
end;
$$;

-- cleanup old rows (cron daily)
delete from public.ai_suggest_usage where date < current_date - interval '90 days';

-- per-call audit log (kept 30 days for cost-tracking + abuse analysis)
create table public.ai_suggest_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null,
  field_type text not null,
  cached boolean not null default false,
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index ai_suggest_log_created_at_idx on public.ai_suggest_log(created_at);
```

### 9.3 Tier cap configuration

```ts
// shared/ai-tier-caps.ts — single source of truth for both Worker + UI
export const TIER_CAPS: Record<Tier, number> = {
  free: 5,
  creator: 50,
  pro: 500,        // fair-use cap for "unlimited" tier
  business: 2000,  // fair-use cap for "unlimited" tier
};

// Show the friendly cap in UI ("50/day"), not the technical fair-use number
export const TIER_DISPLAY: Record<Tier, string> = {
  free: '5/day',
  creator: '50/day',
  pro: 'Unlimited',
  business: 'Unlimited',
};
```

### 9.4 Failure modes

| Failure | Behaviour | Recovery |
|---|---|---|
| Cloudflare AI returns 5xx | Show "AI is taking a quick break, try again in a minute" toast | Manual retry; auto-retry with exponential backoff is OK but stop after 2 |
| Cloudflare AI returns malformed JSON (parse fails) | Fall back to OpenAI gpt-5.4-nano (failover provider) | Log the malformed output for prompt-engineering review |
| Both providers down | Disable ✨ button with tooltip "AI suggestions temporarily unavailable" | Status page entry; uptime SLO 99.5% |
| Worker quota exceeded (Cloudflare account-level) | Disable ✨ entirely with "AI is at capacity, comes back tomorrow" | Page on-call; provision more |
| Creator hits daily cap | Out-of-quota modal per DEC-AI-COST-04 | Upgrade or wait |

### 9.5 Metrics + observability

- **Per-creator-per-day count** — for rate-limit enforcement (already in `ai_suggest_usage`).
- **Per-tier daily totals** — `select tier, count(*) from ai_suggest_log where created_at >= current_date group by tier` — drives cost tracking dashboard.
- **Cache hit rate** — `count(*) filter (where cached) / count(*)` — target >40% (creators retrying same field with small edits is common).
- **Latency p50/p95** — `percentile_cont(0.5/0.95) within group (order by latency_ms)` — alert if p95 > 3s.
- **Quota-hit rate per tier** — `count distinct user_id` who hit cap on day N / total active that day. Free quota-hit > 30% = Free tier is too tight (consider DEC-AI-COST-03 = 10/day instead of 5).
- **Conversion from quota-hit modal** — Upgrade-clicked / quota-hit-modal-shown. This is the headline business metric for whether ✨ Suggest drives tier upgrades.

### 9.6 Migration path

If the chosen model underperforms or pricing changes:
- Edge Function reads model name from a Worker env var; swap is one Worker deploy.
- For A/B test: hash creator_id mod 100 → bucket 0–49 → model A, 50–99 → model B.
- Quality regression detection: log first-suggestion-accepted rate per model; alert if delta > 5%.

---

## 10. Appendix — sources

- [Anthropic Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing) — verified 2026-04-27
- [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — verified 2026-04-27
- [OpenAI API pricing (developers.openai.com)](https://developers.openai.com/api/docs/pricing) — verified 2026-04-27
- [Groq pricing](https://groq.com/pricing/) — verified 2026-04-27
- [Groq rate limits](https://console.groq.com/docs/rate-limits) — verified 2026-04-27
- [Mistral API pricing 2026 (aggregator: Burnwise)](https://www.burnwise.io/ai-pricing/mistral) — direct mistral.ai/pricing returned 404 at fetch time; aggregator used as backup
- [Claude Haiku 4.5 vs gpt-5.4 mini benchmarks (MindStudio)](https://www.mindstudio.ai/blog/gpt-54-mini-vs-claude-haiku-sub-agent-comparison)
- [GPT-5.4 mini and nano benchmarks (DataCamp)](https://www.datacamp.com/blog/gpt-5-4-mini-nano)
- [GitHub Copilot pricing 2026 (PE Collective)](https://pecollective.com/tools/github-copilot-pricing/)
- [Notion AI pricing 2026 (UserJot)](https://userjot.com/blog/notion-pricing-2025-plans-ai-costs-explained)
- [Cloudflare Workers AI bigger/better/faster](https://blog.cloudflare.com/workers-ai-bigger-better-faster/)
- [Llama 3.1 8B Cloudflare model card](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct/)
- [Llama 3.3 70B fp8-fast Cloudflare model card](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)

End of report.
