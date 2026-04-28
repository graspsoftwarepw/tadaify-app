# Bio.link — UI Audit Notes

## Scope

Screenshot-based audit of the real logged-in product experience.

## 01. Onboarding & Auth

### BL-001 — Blocking trial paywall

Flow / route:
post-signup onboarding entry, before meaningful product access

Evidence:
- [bl-001-onboarding-blocking-trial-paywall.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-001-onboarding-blocking-trial-paywall.png)

Layout and visible functionality:
- Centered full-screen paywall with headline `Start your 7 day free trial`
- Two pricing options: yearly with trial and monthly without trial
- Feature bullets above pricing
- One dominant `Continue` CTA
- No obvious `Skip`, `Free`, or `Continue with limited plan` branch

How the flow works:
- The user is pushed into plan selection immediately after entry
- The flow frames trial as the default next step and does not expose a clear free-mode escape hatch

UI / usability assessment for users:
- Very aggressive and high-friction
- Bad first impression for low-intent or exploratory users
- Feels more like checkout than onboarding

Strategic assessment for Tadaify:
- This is useful as a negative benchmark
- It likely improves short-term trial starts, but hurts trust and activation

Irritation risk:
- Very high
- Strong `bait / forced billing path` feeling

Whether it is worth implementing:
- No, not in this form

How Tadaify could do it better:
- Let people enter the real product first
- Offer paid upgrade after first success or at premium feature usage
- If a trial exists, make free mode explicit and honest

### BL-002 — “How did you hear about us?” attribution step

Flow / route:
early onboarding questionnaire

Evidence:
- [bl-002-onboarding-hear-about-us-question.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-002-onboarding-hear-about-us-question.png)

Layout and visible functionality:
- Large centered question
- Progress bar at top
- Single-choice list of acquisition sources: Google, Instagram, TikTok, Facebook, YouTube, Twitter/X, Friends/family, Other

How the flow works:
- The product gathers acquisition attribution during onboarding, before value delivery

UI / usability assessment for users:
- Clean and easy to answer
- But it adds friction without helping the user directly

Strategic assessment for Tadaify:
- Good for internal marketing attribution
- Weak as user-facing priority during onboarding

Irritation risk:
- Medium
- Feels like a business question, not a setup question

Whether it is worth implementing:
- Only if optional or deferred

How Tadaify could do it better:
- Ask later, after first publish
- Or infer acquisition source from UTM/referrer instead of blocking a step

### BL-003 — Platform selection

Flow / route:
onboarding questionnaire before content setup

Evidence:
- [bl-003-onboarding-platform-selection.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-003-onboarding-platform-selection.png)

Layout and visible functionality:
- Large centered question: `Which platforms are you on?`
- Big button rows for Instagram, YouTube, TikTok, Facebook, Twitter/X, Buy Me a Coffee, Snapchat, and personal website

How the flow works:
- User selects platforms first, presumably to tailor later steps

UI / usability assessment for users:
- Straightforward and readable
- Less dense than Linktree's selection grid

Strategic assessment for Tadaify:
- Good pattern if it leads to smart defaults or suggested blocks

Irritation risk:
- Low to medium
- Fine on its own, but frustrating when stacked after a hard paywall

Whether it is worth implementing:
- Yes, in a shorter and more directly useful version

How Tadaify could do it better:
- Connect selections to instant starter blocks
- Include creator-relevant platforms based on our niche focus

### BL-004 — Profile details

Flow / route:
identity setup

Evidence:
- [bl-004-onboarding-profile-details.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-004-onboarding-profile-details.png)

Layout and visible functionality:
- `Add your profile details`
- One text input for name
- One multiline bio textarea with character counter
- Bottom sticky `Continue`

How the flow works:
- User fills core identity fields manually

UI / usability assessment for users:
- Clean but empty
- No prefill, no suggestions, no help

Strategic assessment for Tadaify:
- Necessary step, but Bio.link does the minimum here

Irritation risk:
- Medium
- Especially after already being asked to commit to trial

Whether it is worth implementing:
- Yes, but not in this bare form

How Tadaify could do it better:
- Prefill from socials where possible
- Offer smart bio rewrite / polish later

### BL-005 — Profile picture upload

Flow / route:
identity setup continuation

Evidence:
- [bl-005-onboarding-profile-picture-upload.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-005-onboarding-profile-picture-upload.png)

Layout and visible functionality:
- Very sparse screen
- Large dashed avatar placeholder with camera icon
- Sticky `Continue`

How the flow works:
- User is prompted to upload avatar as a separate dedicated step

UI / usability assessment for users:
- Very clear
- But inefficient as a standalone screen

Strategic assessment for Tadaify:
- Separate full-screen step for avatar feels too expensive in onboarding time

Irritation risk:
- Medium
- One more mandatory step in a long sequence

Whether it is worth implementing:
- No, not as a separate blocking screen

How Tadaify could do it better:
- Merge avatar into profile details step
- Allow skip without guilt

### BL-006 — Theme gallery, extended list

Flow / route:
theme selection during onboarding

Evidence:
- [bl-006-onboarding-theme-gallery-extended.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-006-onboarding-theme-gallery-extended.png)

Layout and visible functionality:
- Large scrollable grid of theme cards
- Themes include: Neon · Live, Summer, Retro, Strawberry · Live, Desert, Sunny, Autumn, Leaf, Clear Sky, Blush, Unicorn, Minimal
- Visual variation comes from color, wallpaper, and button style combinations

How the flow works:
- User browses a larger theme catalog before proceeding

UI / usability assessment for users:
- Better than the earlier boring setup steps
- Gives some inspiration and product feel

Strategic assessment for Tadaify:
- Good evidence that visual choice matters early
- Also shows that themed onboarding is a retention hook after a poor paywall

Irritation risk:
- Low

Whether it is worth implementing:
- Yes

How Tadaify could do it better:
- Use fewer but more curated options
- Explain template intent, not only surface look

### BL-007 — Theme gallery, curated grid

Flow / route:
theme selection entry state

Evidence:
- [bl-007-onboarding-theme-gallery-curated.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-007-onboarding-theme-gallery-curated.png)

Layout and visible functionality:
- `Select a theme`
- Smaller curated grid with themes like Basics, Carbon, Christmas, Pride, Glitch, Winter · Live, Glassy · Live, Chameleon · Live, Rainy Night · Live

How the flow works:
- Bio.link appears to start with a tighter selection and then expose a broader gallery deeper in the step

UI / usability assessment for users:
- Much cleaner than a giant unfiltered library

Strategic assessment for Tadaify:
- Curated-first then extended browsing is a good pattern

Irritation risk:
- Low

Whether it is worth implementing:
- Yes

How Tadaify could do it better:
- Group themes by mood / persona / conversion goal

### BL-008 — First link is required

Flow / route:
content setup

Evidence:
- [bl-008-onboarding-first-link-required.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-008-onboarding-first-link-required.png)

Layout and visible functionality:
- `Start with a link`
- Two inputs: link name and URL
- Error message: `Please add at least one link to continue`
- Social URL fields below
- `+ Add another` CTA
- Bottom `Continue`

How the flow works:
- User cannot progress without creating at least one link

UI / usability assessment for users:
- Functional, but rigid
- The validation is honest and explicit

Strategic assessment for Tadaify:
- This creates real activation, but in a blunt way

Irritation risk:
- High
- It is another blocking requirement in an already over-controlled flow

Whether it is worth implementing:
- Not exactly like this

How Tadaify could do it better:
- Auto-create a draft spotlight block from selected platform
- Let users continue with an empty draft and fill later

### BL-009 — Preview / “Looking Good!” screen

Flow / route:
onboarding summary preview

Evidence:
- [bl-009-onboarding-preview-looking-good.png](/Users/waserekmacstudio/git/claude-startup-ideas/full-research/tadaify/competitors/bio-link/screens/bl-009-onboarding-preview-looking-good.png)

Layout and visible functionality:
- Large phone preview
- Heading `Looking Good!`
- Preview of selected theme, profile image, text, and CTA button
- Bottom `Continue`

How the flow works:
- The user gets a visual checkpoint before entering the full product

UI / usability assessment for users:
- One of the better moments in the flow
- Gives closure and reinforces progress

Strategic assessment for Tadaify:
- Worth keeping as a positive pattern

Irritation risk:
- Low

Whether it is worth implementing:
- Yes

How Tadaify could do it better:
- Show a more realistic final page
- Allow quick edits directly from the preview

## 02. Dashboard & Navigation

No screens documented yet.

## 03. Page Editor

No screens documented yet.

## 04. Public Page / Profile

No screens documented yet.

## 05. Analytics

No screens documented yet.

## 06. Monetization / Billing

No screens documented yet.

## 07. Audience / CRM / Email

No screens documented yet.

## 08. Growth / Integrations / Embeds

No screens documented yet.

## 09. Admin / Team / Agency

No screens documented yet.

## 10. Design System / UX Patterns

### Onboarding style observations

- Bio.link onboarding is visually clean, but structurally too long and too rigid
- The product overuses full-screen single-purpose steps
- Theme selection is the most alive and product-rich part of the sequence
- The progress bar helps orientation, but does not solve the underlying friction
- The strongest UX mismatch is: premium pressure first, user value later

## 11. Paywalls / Plan Gating

### Hard-gated onboarding

- The product appears to push a trial/paywall before meaningful product use
- There is no obvious free-mode branch on the captured screen
- This is more aggressive than Linktree and much worse for trust
- Even if a free path exists elsewhere, it is not discoverable enough in the visible flow

### Strategic take

- This can increase immediate paid intent capture
- But it likely hurts:
  - exploration
  - top-of-funnel activation
  - product trust
  - goodwill among price-sensitive creators

### Tadaify implication

- We should explicitly avoid a paywall-first onboarding
- If premium exists, it should feel like an upgrade, not an entrance fee

## 12. Open Questions

### Open questions

- Is there any hidden or non-obvious route to a true free mode?
- Does Bio.link unlock a less restrictive editor after onboarding, or does gating continue?
- Are the `Live` themes truly interactive/animated, or just differently textured skins?
