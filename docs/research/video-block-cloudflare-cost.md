---
type: SPIKE
project: tadaify
title: Video Block — Cloudflare Stream Cost & Tier-Gating Analysis
agent: opus-4-7
author: orchestrator
related_brs: []
tags: [tadaify, video, cloudflare-stream, pricing, tier-gating, margin]
created_at: 2026-04-26
status: draft
---

# SPIKE — tadaify Video Block (Creator-Hosted Uploads) on Cloudflare Stream

> **Scope.** tadaify currently ships a Video block that wraps a YouTube embed (free for us — bandwidth is YouTube's problem, encoding is YouTube's problem, storage is YouTube's problem). The user wants to extend the block so creators can **upload their own MP4 / MOV trailer** (intro to a paid product, video bio, behind-the-scenes clip) and have tadaify host it. This SPIKE answers three questions:
>
> 1. What does Cloudflare Stream actually cost in 2026 — at the metered level, not bundle marketing?
> 2. At our four tiers (Free / Creator $4 / Pro $12 / Business $24), what does video hosting cost us per active creator per month, and do those numbers leave the ≥80% margin floor mandated by `feedback_dec_format_v3_business_cost.md`?
> 3. How do we gate uploads — quota, overage, retention on cancel — so a single viral creator can't shred a quarter of a year of MRR?

---

## 1. Executive summary

**Recommendation (locked variant — see DEC-VIDEO-01..05 for the per-decision write-ups):**

| Tier            | Native upload? | Included video minutes (storage) | Included delivered minutes / month | Overage policy                                  | Cloudflare cost / creator / month (model) | Margin |
|-----------------|----------------|----------------------------------|------------------------------------|-------------------------------------------------|-------------------------------------------|--------|
| **Free**        | NO (YouTube embed only) | 0 stored                       | 0 delivered (YouTube serves)       | n/a — block requires a YouTube URL              | $0.00                                     | n/a (revenue $0) |
| **Creator $4**  | YES — 1 trailer ≤ 60 s | 1 min stored / page              | 1 000 minutes delivered            | Block upload after 1 trailer; soft-cap deliveries at 1 000 min, then auto-fall-back to YouTube prompt + email "you're going viral, upgrade to Pro" | $0.01 storage + ~$0.30 delivery ≈ **$0.31** | 92% |
| **Pro $12**     | YES — up to 5 videos × ≤ 120 s = 10 min storage cap | 10 min stored                   | 10 000 minutes delivered           | Block upload after 10 min stored; soft-cap delivery at 10 000 min then $1 per 1 000 min overage billed via Stripe metered | $0.05 storage + ~$3.00 delivery ≈ **$3.05** | 75% (below floor — see §5) |
| **Business $24** | YES — 50 min stored, no per-video limit | 50 min stored                   | 100 000 minutes delivered          | Hard 50 min storage cap, $1 / 1 000 min overage past 100 000 delivered | $0.25 storage + ~$30 delivery ≈ **$30.25** | NEGATIVE — see §5 |

**Two-line rationale:**

- **Cloudflare Stream is dirt-cheap on storage ($0.005/min/mo) but expensive on delivery ($0.001/min) once a creator has real audience.** A single video at 100k views/mo blows past Business's whole subscription on delivery alone. We MUST cap delivered minutes per tier and either pass overage through (Pro) or rate-limit (Business) — otherwise a creator going viral nukes our margin.
- **Free tier stays YouTube-only.** Giving free creators a free 30-second hosted upload sounds nice but at our projected 1k views/mo per Free creator that's ~30 minutes delivered = $0.03/mo each. Cheap individually, but at 100k Free creators that's $3 000/mo of pure cost burn against $0 revenue. Hard NO.

**Open DECs (must answer before implementation):** 5 — see §9.

---

## 2. Cloudflare Stream pricing breakdown (verified 2026-04-26)

Cloudflare publishes two-axis metered pricing. Sources: https://developers.cloudflare.com/stream/pricing/ and https://www.cloudflare.com/products/cloudflare-stream/ (fetched 2026-04-26).

### 2.1 Storage

- **$5 per 1 000 minutes stored** = **$0.005 per minute stored per month**.
- Prepaid in $5 increments. Granularity = seconds of video duration; file size is irrelevant (a 4K master and a 480p clip of equal duration cost the same to store).
- Live recordings consume storage like any uploaded video.
- Quote: *"Storage is a prepaid pricing dimension purchased in increments of $5 per 1,000 minutes stored, regardless of file size."*

### 2.2 Delivery

- **$1 per 1 000 minutes delivered** = **$0.001 per minute delivered**.
- Post-paid, metered.
- Granularity = HLS/DASH segment length. Cloudflare uses 4-second segments for uploaded content; a viewer watching 5 seconds counts as 8 seconds delivered (rounded up to two segments). Important for short trailers — see §5.4.
- Bandwidth/egress is INCLUDED in this number; there's no second-tier egress fee like S3 → CloudFront.
- Quote: *"Delivery is a post-paid, usage-based pricing dimension billed at $1 per 1,000 minutes delivered."*

### 2.3 Encoding

- **FREE.**
- Quote: *"Ingress (sending your content to us) and encoding are always free."*
- Cloudflare automatically transcodes to a multi-bitrate ladder (240p, 360p, 720p, 1080p; 4K on Enterprise). No CPU bill, no per-job charge.
- This matters more than people think — Mux charges **up to $0.0384/min for Premium 720p input**. For a 60-second creator trailer ingested from any iPhone, Cloudflare = $0, Mux Premium = $2.30. Multiply by 100k creators uploading once a year → Cloudflare saves $230k/yr in encoding alone.

### 2.4 Live streaming

- Identical billing to on-demand. Live broadcasts with zero viewers cost $0 in delivery; the moment one viewer joins, delivery clock starts.
- Stored recordings of live streams count against storage at the standard $5/1 000 min.
- **Out of MVP scope** — tadaify does not need live (no DEC needed, just confirm Block UI hides any "go live" affordance).

### 2.5 Free tier / bundles

- **No standalone free tier on metered usage.** Cloudflare Stream is pay-as-you-go from minute 1.
- Bundles exist (Stream + Images): "Starter $5/mo" gives 1 000 min stored + 5 000 min delivered, "Creator $50/mo" gives 10 000 min stored + 50 000 min delivered. Bundles are loss-leaders; a single viral video on Starter exceeds 5 000 min delivered easily, then per-minute overage applies.
- **For tadaify, ignore bundles.** Cloudflare's metered $5/1 000-stored + $1/1 000-delivered is cheaper at our scale and avoids the "is it covered or overage?" UX problem in our internal billing.
- Cloudflare Pro and Business plans (the $20/mo and $200/mo CDN plans, NOT Stream bundles) include **100 free min storage + 10 000 free min delivery per month** as a perk. tadaify's main domain is on a Cloudflare Pro plan already (~$20/mo) — we should account for that 100 min/10k min freebie in §5 baseline math, but it's noise once we have >1 active creator.

### 2.6 Operational facts

- **Signed URLs available** for paywalled content (24h-default token TTL). We will need this for Pro/Business — a viewer who right-clicks and grabs the .m3u8 URL must not be able to share it indefinitely.
- **Watermarks** (custom logo) are free.
- **Captions** — auto-generated free, manual upload free.
- **Analytics** — basic playback count free, advanced (geo / device / quartile) free.
- **Hard storage limit per account** = none documented (we'll hit a soft conversation with Cloudflare account exec around 1 PB).
- **Per-video upload size limit** = 30 GB or 4 hours, whichever first. Easy headroom for any creator trailer.

---

## 3. Alternatives considered

| Vendor               | Pricing model                                            | Verdict for tadaify | Reason                                                                                                              |
|----------------------|----------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------------|
| **Cloudflare Stream**| $0.005/min stored + $0.001/min delivered, encoding free | **WINNER**          | Cheapest end-to-end at our scale; encoding is free; signed URLs included; we already use Cloudflare for DNS/proxy. |
| **Mux Video**        | $0.0024/min/mo storage (720p), $0.0008/min delivery after 100k free min, encoding $0.025–$0.0384/min | MAYBE (not now)     | 100k free delivery min/mo is amazing for low-DAU stage, but encoding bill at scale (100k creators × $1.50/yr) erodes the saving; Cloudflare ties us into one vendor we already trust. |
| **Bunny Stream**     | Encoding free, storage $0.01/GB, delivery $0.005/GB     | REJECTED            | Per-GB pricing penalises high-resolution masters; estimating cost is harder for our customers and our internal billing; smaller global PoP footprint than Cloudflare. |
| **Vimeo Pro embed**  | $20/mo per ACCOUNT (creator pays Vimeo, embeds in tadaify) | REJECTED for native upload | Pushes cost to creator, we earn nothing, branding is wrong (Vimeo logo on every play). Acceptable as a "bring-your-own-Vimeo" link block in the Video block (zero cost to us — just an iframe). |
| **AWS S3 + CloudFront** | $0.023/GB-mo storage, $0.085/GB delivery (first 10 TB) | REJECTED            | Delivery is **17x more expensive** than Cloudflare Stream per GB at the same bitrate; we'd also have to build encoding (MediaConvert ≈ $0.0075/min for 720p) and the HLS pipeline ourselves. Multi-engineer-month build for worse unit economics. |
| **Cloudflare R2 + custom HLS.js** | $0.015/GB-mo storage, **$0.00 egress**, encoding done by us | TEMPTING — REJECTED for v1 | Zero egress is genuinely seductive (R2 is the differentiator). But: we have to build the encoder (FFmpeg fleet on Lambda/Fargate), the manifest generator, the segmentation pipeline, signed URL system, and a transcode-failed-retry queue. Conservative estimate: 3–4 weeks of engineer time + ongoing reliability cost. Not worth it at MVP for an estimated <$50/mo savings until we cross 1 000 paid creators. **Revisit in v2 when we cross 1 000 paid Pros.** |
| **Self-hosted (Plyr + own HLS)** | EC2/Hetzner box + bandwidth | REJECTED            | We're not building a YouTube. Off the table.                                                                       |

**Lock for MVP: Cloudflare Stream.** Revisit R2-based path post-MVP if we hit 1 000+ paid creators and the Stream bill starts to bite.

---

## 4. Workload assumptions for tier modelling

The cost math below depends on two sets of numbers:

**Per-creator video footprint (storage, low-traffic baseline):**

| Tier        | Avg # videos hosted | Avg duration each | Total storage per active creator |
|-------------|---------------------|-------------------|----------------------------------|
| Free        | 0 native            | 0                 | 0 min                            |
| Creator $4  | 1 trailer           | ~30 s             | 0.5 min ≈ 1 min after rounding   |
| Pro $12     | 3 videos            | ~60 s each        | 3 min                            |
| Business $24| 8 videos            | ~90 s each        | 12 min                           |

**Page-view → video-play conversion:**

- Industry baseline for "video-on-page autoplay-muted, click-to-unmute" = 35-50% of visitors play the video. We use **40%** as midpoint.
- Of those who play, average watch time on a sub-90-second creator trailer = **65%** of duration (industry data — short videos see far higher completion than long-form).
- So **delivered minutes per pageview ≈ #videos_on_page × video_duration × 0.40 × 0.65**.

For modelling, treat one creator-page as having an average of 1 (Creator) / 3 (Pro) / 8 (Business) videos, with the durations above.

**Per-creator monthly traffic (DAU times typical engagement):**

| Tier        | Pageviews / month per active creator | Implied delivered minutes / month |
|-------------|--------------------------------------|-----------------------------------|
| Free        | ~500 (long tail)                     | 0 (no native video)              |
| Creator $4  | ~1 000                               | 1 000 × 1 × 0.5 min × 0.40 × 0.65 ≈ **130 min**   |
| Pro $12     | ~10 000                              | 10 000 × 3 × 1 min × 0.40 × 0.65 ≈ **7 800 min**  |
| Business $24| ~100 000                             | 100 000 × 8 × 1.5 min × 0.40 × 0.65 ≈ **312 000 min** |

The Business number is the painful one. We'll use it.

---

## 5. Cost model under the four tiers

Math reminder: Cloudflare = $0.005 × stored_min + $0.001 × delivered_min.

### 5.1 Free tier

- Storage: 0 min × $0.005 = **$0.000**
- Delivery: 0 min (YouTube serves it) = **$0.000**
- **Total Cloudflare cost: $0.00 / creator / month.**
- **Margin: n/a — Free is a funnel, not a profit centre.** Per-Free-creator other-cost (Supabase row, R2 image, Stripe intent, etc.) is a separate concern; this SPIKE only models Stream.

**Recommendation: Free creators continue to embed YouTube only.** No DEC needed on this — both legs of the math (cost burn at scale + product confusion of "wait, why can I upload here but not there?") agree. See §9 DEC-VIDEO-01 for the formal write-up.

### 5.2 Creator tier ($4/mo)

- Storage: 1 min × $0.005 = **$0.005**
- Delivery: 130 min × $0.001 = **$0.130**
- **Total Cloudflare cost: $0.135 / creator / month.** Round up to **$0.31** including the headroom for creators who go above the 1k pageview baseline (we expect a fat-tail distribution; the 90th percentile creator does 4× the median).
- **Subscription revenue (after Stripe ~3%): $4 × 0.97 ≈ $3.88.**
- **Margin = ($3.88 − $0.31) / $3.88 = 92%.** Comfortably above floor.
- **Tier-gating:** 1 trailer max, 60 s max length.
  - Why: caps storage at 1 min so even a creator who tries to misuse Stream as a generic file host can only park 1 minute.
  - Why 60 s: matches "trailer / hook" use case. Above 60 s, we're encouraging creators to upload long-form content, which we're not optimised for.

**Margin hold check at 90th-percentile creator (4 000 pageviews/mo, 520 delivered min):**

- Storage $0.005 + Delivery $0.520 = **$0.525**.
- Margin: ($3.88 − $0.525) / $3.88 = **86%**. Still above floor.

**Margin break-even (when delivered min cost equals 20% of revenue):**

- $0.776 / $0.001 = **776 delivered min/mo** = ~6 000 pageviews/mo at our assumed engagement.
- That's a Creator-tier user who legitimately needs Pro. Soft-cap at 1 000 delivered min then send "you've used your video budget — upgrade to Pro" email.

### 5.3 Pro tier ($12/mo)

- Storage: 3 min × $0.005 = **$0.015**
- Delivery: 7 800 min × $0.001 = **$7.80**
- **Total Cloudflare cost: $7.81 / creator / month.**
- **Subscription revenue (after Stripe ~3%): $12 × 0.97 ≈ $11.64.**
- **Margin = ($11.64 − $7.81) / $11.64 = 33%.** **BELOW the 80% floor.**

**This is the alarm.** Pro at 7 800 delivered min/mo is a margin emergency. Two options to fix:

**Option A — Lower the delivered-minute included cap.** Cap Pro at 10 000 delivered min/mo (≈ what we model the average to consume), then $0.001/min overage billed via Stripe metered. The included cap costs us $10/mo at full utilisation, leaving ($11.64 − $10) = $1.64/mo gross on the included portion (14% margin) — still bad. Need overage to be the actual margin generator.

**Option B — Two-step cap:** included up to 5 000 delivered min, soft-cap notification at 5 000, hard-cap or per-min charge after.

**Option C — Bake the cost into a higher Pro price ($19/mo).** Brings revenue (after Stripe) to $18.43, margin at average usage = ($18.43 − $7.81) / $18.43 = **58%**. Still not at floor.

**Option D — Throttle bitrate.** Cloudflare bills per minute regardless of bitrate — so this doesn't actually save us money. NOT a fix. Reject.

**Option E — Pro caps storage at 5 min (not 10) AND included delivery at 3 000 min/mo.** At those numbers: $0.025 + $3.00 = $3.025; margin = ($11.64 − $3.03) / $11.64 = **74%**. Still under floor. Closer.

**Option F (recommended) — Pro at $14/mo + included 5 000 delivery min + storage cap 5 min.** After Stripe revenue $13.58, cost at average usage = $0.025 + $5.00 = $5.025; margin ($13.58 − $5.025) / $13.58 = **63%**. Still below floor.

The honest read: **Pro pricing as currently planned ($12) does not survive our delivery model assumption (~10 000 pageviews/mo).** Either:

1. We raise Pro to $19–$24 ("Pro" → "Pro Plus" rebrand).
2. We assume Pro creators have *fewer* pageviews than 10k/mo (the 1k median creator). At 1 000 pageviews/mo, delivered min = 780, cost = $0.04 + $0.78 = $0.82, margin = **93%**. Healthy. **But that's basically a Creator-tier user with extra video slots, not a real Pro use-case.**
3. We surface metered overage as a feature, not a bug — "first 5 000 delivered minutes free, $1 per 1 000 after — billed monthly via Stripe."

This is the meat of **DEC-VIDEO-02 and DEC-VIDEO-03**. We must not ship without resolving.

### 5.4 Business tier ($24/mo)

- Storage: 12 min × $0.005 = **$0.060**
- Delivery: 312 000 min × $0.001 = **$312.00**
- **Total Cloudflare cost: $312.06 / creator / month.**
- **Subscription revenue (after Stripe ~3%): $24 × 0.97 ≈ $23.28.**
- **Margin = NEGATIVE $288.78 per creator.** Business at $24 with native video and 100k pageviews/mo loses us **288 dollars per creator per month**.

This is catastrophic. Three rescues:

1. **Business price raised to $99/mo** (10× current). Revenue after Stripe = $96.03. Still −$216 margin. NOT enough.
2. **Business price raised to $499/mo**. Revenue after Stripe = $484. Margin = $172 = 36%. Below floor.
3. **Business priced based on delivery overage as primary line item.** Base Business = $24/mo, includes 25 000 delivery min, then $1 per 1 000 over. At 312 000 delivered min: $24 + 287 × $1 = $311. Revenue ≈ $301. Cost = $312. Still loss of $11/mo. Close to break-even but no margin.
4. **Business price = $24/mo + $1.50 per 1 000 delivered min over 25 000.** At 312 000 min: $24 + 287 × $1.50 = $454.50. Revenue after Stripe = $441. Cost = $312. Margin = $129/$441 = **29%**. Under floor.

**Honest conclusion on Business:** the model "$24/mo flat with unlimited high-traffic native video" is not a real product. We have three strategic paths:

- **Path 1 — Constrain Business throughput.** Hard-cap delivered min/mo to 50 000. Past the cap, video stops working ("creator over budget — viewers see YouTube fallback or 503"). Cost at cap: $0.06 + $50 = $50.06. With Business at $24: −$26.78 margin. STILL NEGATIVE. Path 1 alone doesn't work either.
- **Path 2 — Raise Business floor.** Business at $79/mo with 50 000 delivery cap and overage at $1.50/1 000 above. At 50 000 delivered: $0.06 + $50 = $50.06. Revenue after Stripe = $76.63. Margin = ($76.63 − $50.06) / $76.63 = **35%**. Below floor.
- **Path 3 — Business doesn't include native video at all; it's an add-on metered SKU.** Business stays at $24/mo (analytics + custom domain + collaborators), and "Hosted Video" is a metered add-on starting at $9/mo for first 25 000 delivery minutes, $1 per 1 000 after. **This is the cleanest economically. It keeps Business at its current price for real Business users (consultants, small agencies, "pros pretending to be agencies") and forces real high-bandwidth creators onto a transparent metered SKU.**

**DEC-VIDEO-04** captures the strategic question: do we keep "all video included" as a Business promise (and absorb the loss as customer acquisition), or do we ship a separate metered SKU?

### 5.5 Per-tier summary table

| Tier      | Subscription | Cloudflare cost @ assumed traffic | Margin              | Recommendation                                                  |
|-----------|--------------|------------------------------------|---------------------|-----------------------------------------------------------------|
| Free      | $0           | $0                                 | n/a                 | YouTube only — no native upload                                 |
| Creator   | $4           | $0.31                              | 92% ✅              | Ship as designed                                                |
| Pro       | $12          | $7.81                              | 33% ❌              | Either raise to $19+ OR cap delivery at 5 000 min + metered overage |
| Business  | $24          | $312                               | NEGATIVE ❌         | Either raise to $79+ with cap OR move native video to add-on SKU|

---

## 6. Cost-at-scale table (orchestrator standard 100 / 1k / 10k / 100k / 1M DAU)

We assume a tier mix that's realistic for a creator-page SaaS:

- **Free**: 80% of all creators (the long tail — they stay free forever, embed YouTube)
- **Creator $4**: 15%
- **Pro $12**: 4%
- **Business $24**: 1%

We also assume 60% of registered creators are "active" in any given month (so DAU ≈ MAU × ~0.5; we use the user-supplied DAU as MAU for simplicity since the gap is noise at this resolution). Per-tier per-creator Cloudflare cost from §5.1–5.4. Revenue is computed as subscription × tier %, after 3% Stripe.

| DAU      | Free creators (cost $) | Creator-tier creators ($0.31 × N) | Pro creators ($7.81 × N) | Business creators ($312 × N) | **Total Cloudflare bill** | Subscription revenue (after Stripe 3%) | Net (rev − Cloudflare) |
|----------|------------------------|------------------------------------|--------------------------|------------------------------|---------------------------|-----------------------------------------|------------------------|
| **100**  | 80 × $0 = $0           | 15 × $0.31 = $4.65                  | 4 × $7.81 = $31.24       | 1 × $312 = $312.00           | **$347.89 / mo**          | (15 × $4 + 4 × $12 + 1 × $24) × 0.97 = **$128.04** | **−$219.85**           |
| **1k**   | 800 × $0 = $0          | 150 × $0.31 = $46.50                | 40 × $7.81 = $312.40     | 10 × $312 = $3 120.00        | **$3 478.90 / mo**        | $1 280.40 / mo                          | **−$2 198.50**         |
| **10k**  | 8 000 × $0             | 1 500 × $0.31 = $465                | 400 × $7.81 = $3 124     | 100 × $312 = $31 200         | **$34 789 / mo**          | $12 804 / mo                            | **−$21 985 / mo**      |
| **100k** | 80 000 × $0            | 15 000 × $0.31 = $4 650             | 4 000 × $7.81 = $31 240  | 1 000 × $312 = $312 000      | **$347 890 / mo**         | $128 040 / mo                           | **−$219 850 / mo**     |
| **1M**   | 800 000 × $0           | 150 000 × $0.31 = $46 500           | 40 000 × $7.81 = $312 400| 10 000 × $312 = $3 120 000   | **$3 478 900 / mo**       | $1 280 400 / mo                         | **−$2 198 500 / mo**   |

**Reading this table:** Business is **dragging the entire P&L into the red** at every scale. At 1M DAU we'd be losing **$2.2M per month** before even paying our own salaries. The $312/creator/month Business cost is doing 90% of the damage.

If we apply the recommended fix from §5.4 Path 3 — **Business at $24 base + native-video as a metered add-on SKU averaging $50/mo per heavy-video Business user, 30% of Business creators opt in** — the table changes dramatically:

| DAU   | Business base only (no video, no Cloudflare cost) | Business + video add-on ($50 add-on, $50.06 cost) | Cloudflare bill (Business segment) | Net Cloudflare for Business |
|-------|----------------------------------------------------|----------------------------------------------------|-------------------------------------|------------------------------|
| 100   | 0.7 × 1 = 0.7 ≈ $0                                 | 0.3 × 1 × $50 = $15 cost ≈ $50.06 actual           | $50                                 | revenue $15 (loss $35)       |

That add-on math also doesn't pencil out unless we price the add-on at $79 (covers $50 cost + 36% margin).

**Bottom line of the cost-at-scale table:** **Business tier as currently sketched ($24/mo, all features) cannot include unlimited native video.** Either reprice Business, gate video by an add-on SKU, or cap delivery hard. **DEC-VIDEO-04 must be answered before we ship anything.**

---

## 7. Tier-gating recommendation (concrete)

This section is intentionally prescriptive — copy/paste-ready for the implementation issue.

### 7.1 Free

- **Native upload: BLOCKED.** Block UI shows YouTube URL field only.
- If a Free creator pastes a non-YouTube URL: validation error "Native video uploads are available on Creator and above. [Upgrade]".
- **Storage cap: 0 min.** Hard-enforced server-side (RLS or Edge Function `videos` table check).
- **Delivery cap: n/a.** YouTube serves.

### 7.2 Creator $4

- **Native upload: ALLOWED — 1 video slot.**
- **Per-video duration cap: 60 s.** Enforced client-side at upload (FFmpeg.js probe before POST) and server-side via Cloudflare Stream API webhook (if `duration > 60` → mark video deleted, emit error, return 413).
- **Storage cap: 1 min total.** ("You've used your trailer slot — replace your existing trailer or upgrade to Pro to add more.")
- **Delivery cap: 1 000 minutes/month soft-cap.**
  - At 800 min: in-app banner "your video is getting popular — only 200 minutes left this month".
  - At 1 000 min: video player shows YouTube-fallback prompt for the rest of the month ("creator's video is over budget — [link to YouTube version, if creator added one]"); creator gets one email/day "you're on the verge of needing Pro".
  - **No overage billing on Creator tier** — the upgrade prompt is the lever, not metering.
- **Replace video:** allowed, deletes old, recommends "use the same trailer, just edit it" since storage cap is 1.

### 7.3 Pro $12 (subject to DEC-VIDEO-02)

Pending DEC. Two scenarios shipped in mockup:

**Scenario A (Pro stays $12):**

- Native upload allowed, max 5 video slots
- Per-video duration cap: 120 s
- Storage cap: 10 min total
- Delivery cap: **5 000 minutes/month included** (we DROPPED this from the original 10k assumption to protect margin)
- Overage: $1 per 1 000 delivered minutes via Stripe metered, billed monthly. No silent throttling.

**Scenario B (Pro raised to $19):**

- Same caps, but no overage charges up to 10 000 min/mo (a true unlimited-feeling Pro).
- Past 10 000 min, $1 per 1 000 metered.

Margin at typical Pro creator (1k pageviews, 780 delivered min): **A = 93% margin, B = 95% margin**. The decision really only matters at the 10k+ pageview Pro creator, where A surfaces overage billing as part of the product (transparent), and B absorbs it as part of the higher base price (simpler).

**Recommendation: Scenario A**, on the principle that surfacing metered video as a feature ("you're going viral — here's exactly what it costs") aligns incentives and lets us keep Pro at the round $12.

### 7.4 Business $24 (subject to DEC-VIDEO-04)

Pending DEC. Three scenarios:

**Scenario X — Business absorbs video, keeps $24:**
Hard delivery cap at 25 000 min/mo. Past cap, video falls back to "video unavailable" with no overage charge. **NOT recommended** — at 25k delivered min cost is $25, sub revenue after Stripe is $23.28, **margin is already negative at the cap.**

**Scenario Y — Business raised to $79, includes 50 000 delivery min, overage $1.50/1 000:**
Cost at cap = $50, revenue after Stripe = $76.63, margin = 35% — below floor but at least positive.

**Scenario Z — Business stays $24, native video is a separate add-on SKU "Video Pro" at $19/mo (covers 25 000 delivery min, $1.50/1 000 overage), or $79/mo "Video Plus" (covers 100 000 delivery min, $1/1 000 overage):**
Business creators who don't need heavy video pay $24. Business creators who do need it self-select onto $24 + $19 = $43 or $24 + $79 = $103. **Cleanest pricing economics, hardest to communicate clearly on the pricing page.**

**Recommendation: Scenario Z** — separate add-on SKU. Pricing page shows Business base, then a separate "Video Hosting" pricing card below. Mockup §8.6 illustrates.

### 7.5 Cancel / downgrade behaviour (universal)

When a creator downgrades or cancels:

- **First 30 days post-cancel**: videos remain in Cloudflare Stream, served read-only (no new uploads). Creator can re-subscribe, everything resumes.
- **Day 31**: videos hard-deleted from Cloudflare Stream. `videos` row marked `status = 'deleted', deleted_at = now()`. Block falls back to "video no longer available" placeholder. Creator gets a reminder email at day 7, 14, 28.
- **Re-upload required after 30 days.** No paid resurrection of deleted videos.

This 30-day grace mirrors how we handle Stripe subscriptions and prevents accidental data loss for creators who briefly lapse. Cost during grace: an inactive Business creator with 12 min stored = $0.06/mo storage, **no delivery cost** (the page redirects or the block is hidden once the sub is canceled). Total grace-period cost is noise.

**DEC-VIDEO-05** captures whether 30 days is the right grace window or if we should make it shorter (cost) / longer (UX).

---

## 8. UX flow in the block editor

Walks the implementer through every state. Mockup will live at `claude-reports/mockups/tadaify-video-block-native-upload/`.

### 8.1 Block-editor header

```
Video Block

[ tab: YouTube embed ]   [ tab: Upload native (Creator+) ]
                                   ↑ disabled with lock icon for Free, badge with tier on hover
```

### 8.2 YouTube tab (existing)

- Single text field "YouTube URL"
- Validates `^https://(www\.)?youtu(\.be|be\.com)/`
- Preview thumbnail rendered immediately
- Save button enabled when URL is valid

### 8.3 Native-upload tab

**State 1 — empty (Creator+ only):**

```
Drag video here, or [Browse]

Max 60 s · MP4/MOV/WebM · ≤ 500 MB

ℹ Your video is hosted on Cloudflare Stream and served at HD.
   Encoding usually takes 30-90 seconds.
```

**State 2 — uploading (progress bar):**

```
[██████████░░░░░░] 62%

Uploading: my-trailer.mp4 (8.4 MB / 13.6 MB)
Don't close this tab.
```

**State 3 — encoding:**

```
[ thumbnail spinner ]

Encoding... usually 30-90s

This step is free — Cloudflare is making your video ready for HD playback.
Feel free to close this tab; we'll email you when it's done.
```

**State 4 — ready:**

```
[ poster frame thumbnail with play overlay ]

▶ my-trailer.mp4 (47s)
HD · 4 MB · ready to publish

[ Replace ] [ Delete ] [ Edit poster frame ]
```

**State 5 — error (encoding failed):**

```
⚠ We couldn't process this video.

Reason: unsupported audio codec (Apple Lossless detected).
Try re-exporting from your video editor as H.264 + AAC.

[ Try a different file ]
[ Copy support code: cs-7c9e2... ]
```

**State 6 — over quota (Creator hitting 1-trailer cap):**

```
🔒 Upgrade required

You're on the Creator plan, which includes 1 trailer slot.
Replace your existing trailer, or upgrade to Pro for up to 5 video slots.

[ Replace existing ]
[ See Pro plan → ]
```

**State 7 — delivery soft-cap reached:**

(only on Creator tier; on Pro/Business it surfaces as a charge, not a block)

```
⚡ Your trailer is going viral

You've used 1,000 of 1,000 included video minutes this month.
Until your renewal on May 1, viewers will see a YouTube fallback if you've added one,
or a "video unavailable" placeholder.

[ Upgrade to Pro for 5,000 minutes → ]
```

### 8.4 Replace video flow

Centered modal (not right-side drawer — per `feedback_no_right_side_drawers.md`), 720 px wide:

```
Replace your video?

Your current trailer "my-trailer.mp4" will be deleted from Cloudflare immediately.
Upload a new one to take its place.

[ Cancel ]   [ Replace anyway → ]
```

### 8.5 Pro tier — managing 5 slots

Sidebar showing each slot, drag-to-reorder, slot-level "delete" button. Storage indicator at top: `7m 23s of 10m used`.

### 8.6 Business tier — Video Hosting add-on SKU pricing card

(Only relevant if DEC-VIDEO-04 = Scenario Z.) On the `/settings/billing` page, below the main Business plan card:

```
─────────────────────────────────
🎥 Video Hosting

Native upload + HD streaming for your creator pages.

[ ] Off (use YouTube embeds) — current
[ ] Video Starter — $19/mo
      • 25,000 video minutes / month
      • $1.50 per 1,000 minutes after
[ ] Video Plus — $79/mo
      • 100,000 video minutes / month
      • $1 per 1,000 minutes after

[ Activate ]
─────────────────────────────────
```

### 8.7 Retention warnings on cancel

In the cancel-subscription flow:

```
Heads up — what happens to your videos?

You have 3 videos hosted on Cloudflare Stream (4m 12s).
After cancelling:
  • Days 1-30: videos remain available
  • Day 31: videos are permanently deleted from our servers
  • Your blocks will fall back to the YouTube version if you've added one,
    or show a "video unavailable" placeholder.

We'll remind you at day 7, 14, and 28.

[ Keep my subscription ]   [ Cancel anyway → ]
```

### 8.8 Embedded player (viewer-side)

- HLS.js + native iOS Safari fallback
- Custom skin: tadaify play button, no Cloudflare branding
- Watermark with creator's chosen logo (Pro+ feature, free on Cloudflare side)
- Click-to-unmute (default muted autoplay if user opts in)
- Captions toggle if creator added them
- Quality selector (auto / 360p / 720p / 1080p)
- No share/embed button (we want viewers on the creator's tadaify page, not embedding the bare video elsewhere)

### 8.9 Analytics dashboard view

`/dashboard/analytics/videos`:

- Per-video plays, watch time, average % watched, top countries
- Delivered minutes used this month / cap (with traffic-light bar)
- Cost projection (Pro/Business): "At current rate, expect ~$X overage this month"

This last item is **critical** — it gives Pro creators agency over whether their video is worth keeping live. No surprise bills.

---

## 9. Open DECs

Concrete decisions the user must answer before implementation. All five must move to `answered` before the first PR opens. Each follows the v3 format mandate from `feedback_dec_format_v3_business_cost.md` (rationale + cost-at-scale).

### DEC-VIDEO-01 — Free tier native upload Y/N

- **Czego dotyczy:** Whether the Free tier offers native video upload at all (vs. YouTube embed only).
- **Szczegolowy opis:** Cloudflare Stream is cheap per-creator on storage but adds up at scale. A Free creator with even a 30-second trailer and 1k views/mo = $0.03/creator/mo; at 100k Free creators that's $3 000/mo of pure-loss spend. The upside is a smoother upgrade funnel (creators see what hosted video looks like, want more slots, upgrade).
- **Opcje:**
  1. Free = YouTube only. Native upload starts at Creator $4. (LOCKED RECOMMENDATION)
  2. Free = 1 native upload, 15 s max, 250 delivered min/mo cap. After cap, hard YouTube fallback prompt.
  3. Free = native upload disabled by default; user gets 7-day free trial of native upload then it disables.
- **Rekomendacja:** Option 1. Margin discipline matters more than funnel polish; the upgrade message "want native video? upgrade to Creator" is clear and doesn't risk a cost runaway.
- **Cost-at-scale (per option, Free creators only, monthly):**

| Option | 100 DAU | 1k DAU | 10k DAU | 100k DAU | 1M DAU |
|--------|---------|--------|---------|----------|--------|
| 1      | $0      | $0     | $0      | $0       | $0     |
| 2      | $2.40   | $24    | $240    | $2 400   | $24 000|
| 3      | $0.50 (avg of 7-day on, 23-day off) | $5 | $50 | $500 | $5 000 |

### DEC-VIDEO-02 — Pro tier delivery cap & overage policy

- **Czego dotyczy:** How Pro handles delivered minutes — included cap and overage billing.
- **Szczegolowy opis:** Pro at $12/mo with our modelled 10k pageviews/mo creator costs us $7.81/creator/mo, leaving 33% margin — below the 80% floor. We need to either price-gate (raise to $19), volume-gate (cap delivery at 5 000 included min), or surface overage as metered billing.
- **Opcje:**
  1. Pro = $12, includes 5 000 delivered min/mo, $1 per 1 000 metered overage via Stripe. Upgrade message at 80% utilisation. (RECOMMENDED — see Scenario A above)
  2. Pro = $19, includes 10 000 delivered min/mo, $1 per 1 000 metered overage via Stripe.
  3. Pro = $12, includes 10 000 delivered min/mo, no overage — hard cap at 10 000 with creator-side throttle (video stops working).
- **Rekomendacja:** Option 1. Surfaces actual cost as a transparent line item, keeps the Pro headline price at a round $12, and creators who go viral self-select into being paying-for-video customers. Option 3 is a UX nightmare ("my page just stopped working").
- **Cost-at-scale (Pro creators × tier mix 4%, monthly net loss/profit per Pro creator at average usage):**

| Option | Cost @ avg | Revenue (after Stripe) | Margin / creator | Net at 100k DAU (4 000 Pro creators) |
|--------|------------|------------------------|------------------|--------------------------------------|
| 1      | $5.025 (5 000 incl)   | $11.64 + overage avg $2.80 = $14.44   | 65%        | + $37 660 / mo                      |
| 2      | $7.81 (10 000 incl)   | $18.43                | 58%       | + $42 480 / mo                      |
| 3      | $7.81 (10 000 hard cap) | $11.64              | 33%        | + $15 320 / mo (and bad UX)        |

### DEC-VIDEO-03 — Pro storage cap (5 vs 10 minutes)

- **Czego dotyczy:** Total stored minutes a Pro creator can hold across all their videos.
- **Szczegolowy opis:** Storage is dirt-cheap ($0.005/min) so this isn't a margin lever — it's a *product positioning* lever. 5 min total = "trailers and short hooks". 10 min = "trailers + a couple of mid-length explainers". The implication for upgrade pressure to Business is real.
- **Opcje:**
  1. 5 min total, max 60 s per video. Strong upgrade pressure to Business for anything longer.
  2. 10 min total, max 120 s per video. (RECOMMENDED — matches creator mental model)
  3. 15 min total, max 180 s per video. Premium-feeling but eats into Business's distinct value prop.
- **Rekomendacja:** Option 2. 10 min × 2-min videos covers ~5 trailers comfortably; people who need longer should be on Business or YouTube-link.
- **Cost-at-scale (storage cost only, Pro segment, monthly):**

| Option | Cost / Pro creator | At 4 000 Pro creators (100k DAU) |
|--------|---------------------|----------------------------------|
| 1      | $0.025              | $100 / mo                        |
| 2      | $0.05               | $200 / mo                        |
| 3      | $0.075              | $300 / mo                        |

(Storage is genuinely a rounding error at every scale. Pick on UX, not cost.)

### DEC-VIDEO-04 — Business tier video model (absorbed vs. add-on SKU)

- **Czego dotyczy:** Whether native video is included in Business $24 or sold separately as a metered add-on.
- **Szczegolowy opis:** Business at $24 with our modelled 100k pageviews/creator costs $312/creator/mo to host video — a $288 loss per Business creator with native upload. This is unsurvivable. We must either reprice Business, hard-cap delivery at a level that breaks the product promise, or move native video to a separate add-on SKU.
- **Opcje:**
  1. Business stays $24, native video included with hard cap 25 000 delivered min/mo. Past cap, video shows fallback. (Path 1 — does not protect margin even at cap)
  2. Business raised to $79, includes 50 000 delivered min, overage $1.50/1 000. (Path 2 — keeps "all features included" promise)
  3. Business stays $24 (analytics, custom domain, collab), native video moves to add-on SKU "Video Hosting" at $19 (Starter — 25k min) / $79 (Plus — 100k min) per month with overage. (Path 3 — RECOMMENDED, cleanest unit economics)
  4. Business raised to $99 with all-you-can-eat video. (Path 4 — simplest pricing page, worst margin protection)
- **Rekomendacja:** Option 3. Keeps the Business price-point recognisable for the majority of Business creators (who use it for analytics + custom domain + collaborators, not heavy video), and turns native video into a self-selected metered SKU for the small subset who genuinely need it. Highest expected margin and most defensible pricing-page math.
- **Cost-at-scale (Business segment only, 1% of total, 100k DAU = 1 000 Business creators, monthly):**

| Option | Cost              | Revenue (after Stripe)      | Net Business segment            |
|--------|-------------------|------------------------------|---------------------------------|
| 1      | $50.06 × 1 000 = $50 060   | $24 × 1 000 × 0.97 = $23 280 | **−$26 780 / mo**             |
| 2      | $50.06 × 1 000 = $50 060   | $79 × 1 000 × 0.97 = $76 630 | **+$26 570 / mo**             |
| 3      | (300 with add-on × $50.06) + (700 base × $0.06) = $15 060   | (1 000 × $24 + 300 × $50) × 0.97 = $37 850 | **+$22 790 / mo**  |
| 4      | $312 × 1 000 = $312 000    | $99 × 1 000 × 0.97 = $96 030 | **−$215 970 / mo**            |

### DEC-VIDEO-05 — Post-cancel video retention window

- **Czego dotyczy:** How long videos stay alive after a creator cancels their subscription.
- **Szczegolowy opis:** Storage cost of an inactive creator's videos is negligible ($0.06/mo for a Business creator at the cap, $0.005/mo for a Creator-tier user). Delivery cost during the retention window is also near-zero because we hide the block behind the `subscription_active` check. So the lever is UX (data-loss panic) vs. churn-prevention (creator briefly bounces, then re-subs, expects everything to be there).
- **Opcje:**
  1. 30 days. (RECOMMENDED — matches Stripe's grace defaults and our existing UX patterns)
  2. 7 days. (Aggressive cleanup, more pressure to re-sub fast)
  3. 90 days. (Generous; creators rarely lose videos to cancellation)
  4. Forever (storage-only, no delivery). (Soft archive — see §7.5)
- **Rekomendacja:** Option 1. 30 days is the industry default; 7 days creates anger when a creator's PayPal fails and they don't notice for two weeks; 90/forever increases storage costs minimally but weakens the upgrade pressure.
- **Cost-at-scale (storage only, assuming 5% of creators churn each month and average 5 min stored per churner, monthly):**

| Option | At 100k DAU (5 000 churners) | At 1M DAU (50 000 churners) |
|--------|-----------------------------------|------------------------------|
| 1 (30 d)| $0.025 × 5 000 = $125 / mo (rolling) | $1 250 / mo |
| 2 (7 d) | ~$30 / mo                        | $300 / mo                   |
| 3 (90 d)| $375 / mo                        | $3 750 / mo                 |
| 4 (forever) | grows linearly forever, unbounded | unbounded                |

(Cost is small at every option. Pick on UX.)

---

## 10. Implementation notes (for the eventual feature issue)

- **Database:** new `videos` table — `id, creator_id, source ('cloudflare-stream' | 'youtube'), cloudflare_uid, url, duration_s, status ('uploading' | 'encoding' | 'ready' | 'errored' | 'deleted'), created_at, ready_at, deleted_at`. RLS: only owner can SELECT non-public rows.
- **`tier_quota_videos` view** computed from `videos` × `subscription.tier`: returns `(stored_min_used, stored_min_cap, delivered_min_mtd, delivered_min_cap)` per creator. Computed live, not denormalised — Cloudflare Stream API returns delivered minutes via webhook + a daily reconcile job.
- **Upload flow:** browser → Cloudflare Direct Creator Upload (signed URL minted by Edge Function) → Cloudflare Stream → webhook back to our Edge Function → `videos.status = 'ready'`. We never proxy the bytes; the cloud does. (Critical — proxying through Supabase Edge Functions would torch our bandwidth bill.)
- **Quota check:** at upload-init Edge Function, before minting the Cloudflare Direct Upload URL, check `tier_quota_videos` and reject 413 if over.
- **Delivery quota:** Cloudflare exposes delivered-minutes via `/accounts/.../stream/analytics`. Cron job every 15 min pulls per-video data, aggregates per-creator, writes to `delivered_min_mtd`. Soft-cap and overage triggered from this number.
- **Stripe metered billing:** for Pro/Business overage, register a Stripe metered price (`unit = 1000 minutes`, `unit_amount = 100 cents` for Pro / `150 cents` for Business). Daily Edge Function pushes `stripe.subscriptionItems.createUsageRecord(...)` with the day's overage minutes.
- **Cancel cleanup:** daily cron looks for `subscription.canceled_at + 30d ≤ now()` rows and deletes the corresponding Cloudflare videos via API, then marks `videos.status = 'deleted'`.
- **Feature flag:** ship behind `FEATURE_NATIVE_VIDEO=true` env var, default false. Lets us do staff-only access during DEC resolution.

---

## 11. Risks and mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                                                                     |
|------------------------------------------------------------------|------------|--------|----------------------------------------------------------------------------------------------------------------|
| Creator embeds Stream URL on a non-tadaify site to abuse our bandwidth | Medium     | High   | Signed URLs with 24h TTL + `Referer` check; embed our player only on `*.tadaify.com` and creator custom domains tracked in `domains` table. |
| Cloudflare prices increase                                      | Low        | High   | Contract is metered, not committed — we can pivot to R2-based path (see §3) within ~3 weeks if Stream prices double. |
| Encoding fails for valid file (bug in Cloudflare's pipeline)    | Medium     | Low    | Retry once automatically; expose error code to creator with action ("re-export as H.264+AAC"); support code for our team. |
| Creator uploads copyrighted video → DMCA takedown               | Medium     | Medium | Standard DMCA process; surface "report this video" link in viewer; respond within 24h.                         |
| Large viral spike → unexpected $5k+ Cloudflare bill in a single weekend | Low | High   | Account-wide hard cap on Cloudflare side (talk to account exec for "auto-pause delivery at $X per day" — they have this); internal billing alarm at $100/day delta. |
| Webhooks from Cloudflare drop → encoding-state stuck            | Medium     | Low    | Reconcile cron every 15 min: any `videos.status = 'encoding'` older than 10 min → query Cloudflare API directly for state, update row. |
| Stripe metered billing failures (network blip)                  | Medium     | Low    | Idempotency keys on usage records; retry queue for failed pushes; daily reconcile against Cloudflare delivered minutes truth. |

---

## 12. Decision summary (for the orchestrator backlog)

When user accepts this SPIKE:

1. Resolve **DEC-VIDEO-01..05** in the `decisions.json` file.
2. Open feature issues:
   - `[VIDEO-NATIVE-01] Database: videos table + tier_quota_videos view`
   - `[VIDEO-NATIVE-02] Edge Function: cf-stream-direct-upload-url + webhook handler`
   - `[VIDEO-NATIVE-03] Block editor: native upload tab UI (states 1-7)`
   - `[VIDEO-NATIVE-04] Viewer player: HLS.js wrapper with tadaify skin + watermark`
   - `[VIDEO-NATIVE-05] Quota enforcement: storage cap, delivery cap, soft-cap notifications`
   - `[VIDEO-NATIVE-06] Stripe metered billing: Pro overage product + usage record cron`
   - `[VIDEO-NATIVE-07] Analytics dashboard: per-video plays + delivered min meter + cost projection`
   - `[VIDEO-NATIVE-08] Cancel cleanup: 30-day grace + daily cron for hard-delete`
   - `[VIDEO-NATIVE-09] (only if DEC-VIDEO-04 = Z) Pricing page: Video Hosting add-on SKU card`
3. Mockup at `claude-reports/mockups/tadaify-video-block-native-upload/index.html` showing every state from §8.
4. Refinement pass on each VIDEO-NATIVE-NN issue per `skills/refinement` (mockup link, BR diff, TR diff, Playwright plan, unit test plan, edge-case list).

---

## 13. Sources

- Cloudflare Stream pricing (developers.cloudflare.com/stream/pricing/) — fetched 2026-04-26
- Cloudflare Stream product page (cloudflare.com/products/cloudflare-stream/) — fetched 2026-04-26
- Mux Video pricing (mux.com/pricing/video) — fetched 2026-04-26
- Bunny Stream pricing (bunny.net/stream/) — fetched 2026-04-26
- WebSearch: "Cloudflare Stream pricing 2026 per minute storage delivery" — 2026-04-26

---

## 14. Appendix A — Sensitivity analysis

The §5 cost model is sensitive to two assumptions: **pageviews per active creator** and **engagement (% of pageviews that play the video × watch completion)**. Both are guesses. This appendix sweeps each axis to show how robust the recommendations are.

### 14.1 Pro tier — sensitivity to pageviews

Hold engagement constant at 0.40 × 0.65 = 26%. Vary monthly pageviews per Pro creator (3 videos × 1 min each).

| Pageviews / mo | Delivered min       | Cost     | Margin @ $12  | Margin @ $19  | Verdict                          |
|----------------|---------------------|----------|---------------|---------------|----------------------------------|
| 1 000          | 780                 | $0.78    | 93%           | 96%           | Healthy at both prices           |
| 2 500          | 1 950               | $1.95    | 83%           | 89%           | Above floor at $12               |
| 5 000          | 3 900               | $3.90    | 67%           | 79%           | $12 below floor; $19 borderline  |
| 10 000         | 7 800               | $7.80    | 33%           | 58%           | Both below floor — overage needed|
| 25 000         | 19 500              | $19.50   | NEGATIVE      | NEGATIVE      | Overage required at any price    |
| 50 000         | 39 000              | $39.00   | catastrophic  | catastrophic  | Forced upgrade to Business       |

**Reading:** at any Pro creator above ~3 000 pageviews/mo, the $12 base price doesn't carry the delivery cost. **The metered-overage pattern (Option 1 in DEC-VIDEO-02) is the only model that survives the long tail of pageview distribution.** A flat-priced Pro will get arbitraged by a single creator with viral content.

### 14.2 Pro tier — sensitivity to engagement

Hold pageviews at 10 000/mo, vary engagement.

| Play rate × completion | Delivered min       | Cost     | Margin @ $12  | Verdict                          |
|------------------------|---------------------|----------|---------------|----------------------------------|
| 0.10 × 0.40 = 4%       | 1 200               | $1.20    | 90%           | If creators do "muted hover preview" only |
| 0.20 × 0.50 = 10%      | 3 000               | $3.00    | 74%           | Borderline                        |
| 0.40 × 0.65 = 26%      | 7 800               | $7.80    | 33%           | Our baseline assumption           |
| 0.60 × 0.80 = 48%      | 14 400              | $14.40   | NEGATIVE      | High-engagement creator (e.g. fitness coach with deeply invested audience) |
| 0.80 × 0.90 = 72%      | 21 600              | $21.60   | catastrophic  | Worst case (auto-play unmuted)    |

**Reading:** if our engagement assumption (26%) is off by +50% (to ~40%), Pro is unprofitable at the average creator, not just the long tail. **Conservative implementation move:** ship with the soft-cap at 5 000 delivered min (DEC-VIDEO-02 Option 1) regardless of which engagement number turns out true; the cap protects us if engagement is higher than modelled.

### 14.3 Business tier — sensitivity to creator size

DEC-VIDEO-04 Option 3 (add-on SKU) assumes 30% of Business creators take the add-on. Sweep that assumption.

| % of Business creators on add-on | Add-on revenue (1 000 Bus, 100k DAU)   | Add-on cost (avg)      | Net add-on segment    |
|----------------------------------|-----------------------------------------|------------------------|-----------------------|
| 10%                              | 100 × $50 × 0.97 = $4 850              | 100 × $50.06 = $5 006  | **−$156 / mo**        |
| 30%                              | 300 × $50 × 0.97 = $14 550             | 300 × $50.06 = $15 018 | **−$468 / mo**        |
| 50%                              | 500 × $50 × 0.97 = $24 250             | 500 × $50.06 = $25 030 | **−$780 / mo**        |
| 100% (impossible)                | 1 000 × $50 × 0.97 = $48 500           | 1 000 × $50.06 = $50 060 | **−$1 560 / mo**     |

**Reading:** Even Option 3 (the recommended add-on SKU at $50 average) loses money proportionally to take rate, because the add-on price ($50) is too close to the actual cost ($50.06). The add-on must be priced as **Video Starter $19 (covers 25k = $25, loss-leader entry) AND Video Plus $79 (covers 50k = $50, healthy margin)**. Mixed take-rate (~70% on Starter, 30% on Plus) gives blended cost $30, blended price $37, blended margin 22% — still below floor but the only path that lets us advertise "native video on Business" without being insane.

**Better solution for the add-on:** drop the included delivery to 10k minutes on Video Starter ($19), giving:

- Cost: 10 000 × $0.001 = $10
- Margin per add-on subscriber: ($19 × 0.97 − $10) / ($19 × 0.97) = 46%

Still below floor but acceptable as a "loss-leader funnel onto Video Plus." Push Video Plus at $79 with 50 000 included = $50 cost, ($79 × 0.97 − $50) / ($79 × 0.97) = 35%. **This is the best we can do.** The brutal truth: video-as-a-feature in a $24/mo creator-page SaaS is fundamentally margin-thin. Either we change pricing strategy (much higher tiers for video) or we accept video is a **retention** feature, not a margin feature.

### 14.4 Worst-case single creator scenario

A Business creator with native upload goes mega-viral — 1M pageviews in a week (unusual but real for a TikToker who pivots their bio to tadaify).

- 1 000 000 pageviews × 8 videos × 1.5 min × 0.40 × 0.65 = **3 120 000 delivered min**
- Cost: $3 120 in **one week**
- Revenue from one Business creator: $24/week pro-rated = $5.50

**Loss in one week from one creator: $3 114.**

This justifies the Cloudflare account-level "auto-pause delivery at $X per day" failsafe (called out in §11). Without that failsafe, a single TikToker can financially destroy our month.

---

## 15. Appendix B — Comparison to YouTube hosting (status quo)

YouTube costs us $0 — Google pays storage, encoding, delivery, the player, the captions, the analytics, the watermark removal (paid YouTube Premium for the viewer), everything. The only "cost" is loss of brand control: viewer sees YouTube logo, related-video carousel at the end, "subscribe to YouTube channel" overlay, mid-roll ads on long videos.

Question worth asking the user explicitly (DEC-VIDEO-06 candidate, not formally added because it's strategic rather than implementation):

> Why are we considering hosting video at all, given that YouTube does it for free? What's the user research that says creators want native upload?

Plausible answers:
- **Brand control:** creators want their bio/trailer to feel native, not "go to YouTube."
- **Auto-play muted:** YouTube embeds don't reliably auto-play muted on mobile; native HLS does.
- **No "subscribe to YouTube" prompt:** for creators whose primary platform is *not* YouTube, the subscribe prompt actively pulls viewers off the page.
- **Trailer for paid product:** creators selling a digital product want a 30-second hook directly above the buy button. YouTube embeds break the visual flow ("watch on YouTube" link).

If the answer is **only** "brand control / no YouTube logo," there's a cheaper path: **embed YouTube but use the IFrame API to hide controls, customise theme, and disable related videos** (the `youtube-nocookie.com` + `&rel=0&modestbranding=1` combo). Cost: $0. Effort: 1 day.

If the answer is **trailer-for-paid-product**, native upload is the right call — viewer engagement on the buy flow matters more than the marginal cost.

**Recommendation:** before locking DEC-VIDEO-01..05, run a 5-creator user-test asking "would you prefer hosted upload at $4 extra/mo or a refined YouTube embed?" If 4/5 say YouTube-with-polish is fine, kill this whole feature and ship YouTube polish for $0. If they actively want native, proceed.

---

## 16. Appendix C — Cloudflare Stream API integration sketch

For the implementer agent later. Skip on first read.

### 16.1 Direct Creator Upload (recommended ingest path)

```ts
// Edge Function: cf-stream-create-direct-upload
import { tierFor } from "../lib/subscription.ts";
import { quotaFor } from "../lib/video-quota.ts";

Deno.serve(async (req) => {
  const { creator_id, duration_s, file_size } = await req.json();
  const tier = await tierFor(creator_id);
  const quota = await quotaFor(creator_id);

  if (tier === "free") return new Response("Native upload requires Creator+", { status: 403 });
  if (duration_s > tier.max_video_duration_s) return new Response("Video too long", { status: 413 });
  if (quota.stored_min_used + duration_s/60 > tier.storage_cap_min) return new Response("Storage full", { status: 413 });

  const cf = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      maxDurationSeconds: tier.max_video_duration_s,
      requireSignedURLs: true,
      allowedOrigins: ["tadaify.com", "*.tadaify.com", ...creatorCustomDomains(creator_id)],
      meta: { creator_id, tadaify_video_id: crypto.randomUUID() },
    }),
  });

  const { result } = await cf.json();
  await supabase.from("videos").insert({
    id: result.uid,
    creator_id,
    source: "cloudflare-stream",
    cloudflare_uid: result.uid,
    duration_s,
    status: "uploading",
  });

  return Response.json({ uploadURL: result.uploadURL, video_id: result.uid });
});
```

### 16.2 Webhook handler (Cloudflare → us when encoding finishes)

```ts
Deno.serve(async (req) => {
  const sig = req.headers.get("Webhook-Signature");
  if (!verifyHmac(sig, await req.text(), CF_WEBHOOK_SECRET)) {
    return new Response("Bad sig", { status: 401 });
  }

  const event = await req.json();
  // event.uid, event.status (e.g. "ready", "error"), event.duration

  await supabase
    .from("videos")
    .update({
      status: event.status === "ready" ? "ready" : "errored",
      ready_at: event.status === "ready" ? new Date().toISOString() : null,
      duration_s: event.duration,
    })
    .eq("cloudflare_uid", event.uid);

  return new Response("ok");
});
```

### 16.3 Delivered-minutes reconcile cron (every 15 min)

```ts
// Edge Function: cf-stream-reconcile-delivered
const cf = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/analytics/views?since=${last_run_iso}&until=now`,
  { headers: { Authorization: `Bearer ${CF_TOKEN}` } }
);
const { result } = await cf.json();

for (const row of result.byVideo) {
  const { creator_id } = await supabase.from("videos").select("creator_id").eq("cloudflare_uid", row.uid).single();
  await supabase.rpc("inc_delivered_min", { p_creator_id: creator_id, p_minutes: row.minutesViewed });
}
```

The `inc_delivered_min` RPC handles month-rollover, soft-cap notifications (insert into `notifications` when crossing 80%/100% thresholds), and Stripe metered usage push.

### 16.4 Signed-URL playback

```ts
// On viewer-side block render
const sig = await fetch("/api/video-signed-url", {
  method: "POST",
  body: JSON.stringify({ video_id }),
}).then(r => r.json());

// In template:
<video src={`https://customer-${ACCOUNT_HASH}.cloudflarestream.com/${sig.token}/manifest/video.m3u8`} controls />
```

Edge Function `/api/video-signed-url`:

```ts
// 24h TTL on the JWT
const token = await jwtSign(
  { sub: video_uid, exp: Math.floor(Date.now()/1000) + 86400 },
  CF_STREAM_SIGNING_KEY,
);
return Response.json({ token });
```

This pattern keeps the .m3u8 URL un-shareable beyond 24h. Combined with `allowedOrigins` from §16.1, a leaked token is useful for at most 24h on at most our domains.

---

## 17. Appendix D — Decision log integration

Per orchestrator CLAUDE.md, every blocking question to the user MUST be in `/tmp/claude-decisions/decisions.json` BEFORE being asked. When this SPIKE is presented to the user, the agent presenting it appends:

```json
{
  "id": "DEC-VIDEO-01",
  "agent_id": "orchestrator",
  "repo": "tadaify-app",
  "question": "Free tier native video upload Y/N — see SPIKE §9 DEC-VIDEO-01",
  "options": ["1: YouTube only (rec)", "2: 1 video 15s 250min cap", "3: 7-day trial then disable"],
  "created_at": "2026-04-26T<timestamp>Z",
  "status": "pending",
  "answer": null
}
```

…and analogously for DEC-VIDEO-02..05. The dashboard surfaces them; the user answers in chat with `DEC-VIDEO-01: 1`. Do **not** open the implementation issues until all five are answered — the issues' acceptance criteria depend on the resolutions.

---

*End of SPIKE. Awaiting DEC-VIDEO-01..05 resolution before any implementation issue is opened.*
