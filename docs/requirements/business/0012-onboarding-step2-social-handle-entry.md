---
id: BR-ONBOARDING-002
title: Post-registration wizard - step 2/5 - social handle entry
area: ONBOARDING
status: implemented
routes: [/onboarding/social]
modules: [ONBOARDING]
related_files: [app/routes/onboarding.social.tsx, app/lib/onboarding-state.ts]
tests: []
migrations: []
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-ONBOARDING-002 — Post-registration wizard: step 2/5 (social handle entry)

Step 2 collects per-platform social handles (`/onboarding/social`), generating
"Follow me on X" link blocks — handle-based, no OAuth (DEC-SOCIAL-01).

Traceability: functional-spec.md §3 (§3.4 F-004 social handle entry).
Originating issue: tadaify-app#136.
