<!-- generated: bin/maps-gen sha=476740feb7e6 DO NOT EDIT -->

| module | kind | mounted_by | views | governs | api | e2e |
|----|----|----|----|----|----|----|
| app/routes/_index.tsx | rr7-route | / | V-TAD-LANDING | BR-LANDING-001 | — | — |
| app/routes/register.tsx | rr7-route | /register | V-TAD-REGISTER | F-REGISTER-001a,BR-AUTH-001,BR-AUTH-002,BR-AUTH-003,BR-AUTH-006,BR-AUTH-007 | — | e2e/sso-providers-list.spec.ts |
| app/routes/login.tsx | rr7-route | /login | V-TAD-LOGIN | F-REGISTER-001a,BR-AUTH-004,BR-AUTH-005,TR-AUTH-01 | — | e2e/sso-providers-list.spec.ts |
| app/routes/onboarding.welcome.tsx | rr7-route | /onboarding/welcome | V-TAD-ONBOARDING-WELCOME | F-ONBOARDING-001a | — | — |
| app/routes/app.tsx | rr7-route | /app | V-TAD-APP | F-APP-DASHBOARD-001a,F-APP-DASHBOARD-001b,BR-DASH-001,BR-DASH-007,BR-DASH-008,TR-tadaify-005 | — | e2e/app-dashboard-design.spec.ts,e2e/app-dashboard.spec.ts |
| app/routes/api.handle.check.ts | rr7-resource | /api/handle/check | — | F-LANDING-001,BR-LANDING-001 | yes | — |
| app/routes/api.handle.reserve.ts | rr7-resource | /api/handle/reserve | — | F-LANDING-001 | yes | — |
| app/routes/api.auth.signup.ts | rr7-resource | /api/auth/signup | — | F-REGISTER-001a | yes | e2e/sso-providers-list.spec.ts |
| app/routes/api.auth.login-otp.ts | rr7-resource | /api/auth/login-otp | — | F-REGISTER-001a | yes | e2e/sso-providers-list.spec.ts |
| app/routes/api.auth.verify.ts | rr7-resource | /api/auth/verify | — | F-REGISTER-001a | yes | e2e/sso-providers-list.spec.ts |
| app/routes/api.auth.password.ts | rr7-resource | /api/auth/password | — | F-REGISTER-001a | yes | e2e/sso-providers-list.spec.ts |
| app/routes/api.account.dismiss-welcome.ts | rr7-resource | /api/account/dismiss-welcome | — | F-APP-DASHBOARD-001a | yes | e2e/app-dashboard.spec.ts |
| app/routes/api.account.pinned-message.ts | rr7-resource | /api/account/pinned-message | — | F-APP-DASHBOARD-001a,F-PINNED-001 | yes | e2e/app-dashboard.spec.ts |
| app/routes/api.profile.ts | rr7-resource | /api/profile | — | F-PROFILE-SAVE-001,TR-tadaify-007 | yes | — |
| app/routes/api.feedback.ts | rr7-resource | /api/feedback | — | F-FEEDBACK-001,BR-DASH-009 | yes | — |
| app/routes/api.beacon.ts | rr7-resource | /api/beacon | — | F-INSIGHTS-CAPTURE-001,BR-DASH-007 | yes | — |
| app/routes/api.upload.avatar.ts | rr7-resource | /api/upload/avatar | — | F-ONBOARDING-001c,TR-tadaify-003 | yes | — |
| app/routes/api.avatar.$key.ts | rr7-resource | /api/avatar/:key | — | F-ONBOARDING-001c,TR-tadaify-003 | yes | — |
| app/routes/api.upload.block-thumb.ts | rr7-resource | /api/upload/block-thumb | — | F-BLOCK-LINK-COMPLETE-001 | yes | e2e/link-block-complete.spec.ts |
| app/routes/api.block-thumb.$key.ts | rr7-resource | /api/block-thumb/:key | — | F-BLOCK-LINK-COMPLETE-001 | yes | e2e/link-block-complete.spec.ts |
| app/routes/api.blocks.reorder.ts | rr7-resource | /api/blocks/reorder | — | F-BLOCK-INFRA-CRUD-001 | yes | e2e/block-crud-delete-api.spec.ts,e2e/block-crud-duplicate-api.spec.ts,e2e/block-crud-list.spec.ts,e2e/block-crud-reorder-api.spec.ts,e2e/block-crud-rls-isolation.spec.ts |
| app/routes/api.blocks.$id.duplicate.ts | rr7-resource | /api/blocks/:id/duplicate | — | F-BLOCK-INFRA-CRUD-001 | yes | e2e/block-crud-delete-api.spec.ts,e2e/block-crud-duplicate-api.spec.ts,e2e/block-crud-list.spec.ts,e2e/block-crud-reorder-api.spec.ts,e2e/block-crud-rls-isolation.spec.ts |
| app/routes/api.blocks.$id.ts | rr7-resource | /api/blocks/:id | — | F-BLOCK-INFRA-CRUD-001 | yes | e2e/block-crud-delete-api.spec.ts,e2e/block-crud-duplicate-api.spec.ts,e2e/block-crud-list.spec.ts,e2e/block-crud-reorder-api.spec.ts,e2e/block-crud-rls-isolation.spec.ts |
| app/routes/api.blocks.ts | rr7-resource | /api/blocks | — | F-BLOCK-INFRA-CRUD-001,BR-DASH-004,BR-CREATOR-001 | yes | e2e/block-crud-delete-api.spec.ts,e2e/block-crud-duplicate-api.spec.ts,e2e/block-crud-list.spec.ts,e2e/block-crud-reorder-api.spec.ts,e2e/block-crud-rls-isolation.spec.ts |
| app/routes/$handle.tsx | rr7-route | /:handle | V-TAD-CREATOR | F-BLOCK-INFRA-PUBLIC-RENDER-001,BR-CREATOR-001,TR-tadaify-009 | — | e2e/public-render.spec.ts |
| app/components/DesignPanel.tsx | panel | /app?tab=design | V-TAD-DESIGN | F-APP-DASHBOARD-001a,F-APP-DASHBOARD-001b,BR-DASH-003 | — | e2e/app-dashboard-design.spec.ts,e2e/app-dashboard.spec.ts |
| app/components/InsightsPanel.tsx | panel | /app?tab=insights | V-TAD-INSIGHTS | F-APP-DASHBOARD-001a,F-APP-INSIGHTS-001,BR-DASH-007 | — | e2e/app-dashboard.spec.ts |
| app/components/LivePreviewPane.tsx | panel | app/routes/app.tsx | V-TAD-PREVIEW | F-APP-DASHBOARD-001a,TR-tadaify-005 | — | e2e/app-dashboard.spec.ts |
| app/components/AppSidebar.tsx | panel | app/routes/app.tsx | V-TAD-SIDEBAR | F-APP-DASHBOARD-001a,BR-DASH-002 | — | e2e/app-dashboard.spec.ts |
| app/components/AppAppbar.tsx | panel | app/routes/app.tsx | V-TAD-APPBAR | F-APP-DASHBOARD-001a,BR-DASH-002 | — | e2e/app-dashboard.spec.ts |
