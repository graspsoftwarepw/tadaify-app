<!-- generated: bin/maps-gen sha=4aeca7413b46 DO NOT EDIT -->

| id | url | kind | module | governs | parent | tests | e2e |
|----|----|----|----|----|----|----|----|
| V-TAD-LANDING | / | rr7-route | app/routes/_index.tsx | BR-LANDING-001 | — | _index.test.tsx | — |
| V-TAD-REGISTER | /register | rr7-route | app/routes/register.tsx | F-REGISTER-001a,BR-AUTH-001,BR-AUTH-002,BR-AUTH-003,BR-AUTH-006,BR-AUTH-007,BR-OTP-001 | — | register.test.tsx | e2e/sso-providers-list.spec.ts |
| V-TAD-LOGIN | /login | rr7-route | app/routes/login.tsx | F-REGISTER-001a,BR-AUTH-004,BR-AUTH-005,TR-AUTH-01,BR-OTP-001 | — | login.test.tsx | e2e/sso-providers-list.spec.ts |
| V-TAD-ONBOARDING-WELCOME | /onboarding/welcome | rr7-route | app/routes/onboarding.welcome.tsx | F-ONBOARDING-001a,BR-ONBOARDING-001 | app/routes/onboarding.tsx | onboarding.welcome.test.ts | — |
| V-TAD-APP | /app | rr7-route | app/routes/app.tsx | F-APP-DASHBOARD-001a,F-APP-DASHBOARD-001b,BR-DASH-001,BR-DASH-007,BR-DASH-008,TR-tadaify-005,BR-DASH-010 | — | app.test.ts | e2e/app-dashboard-design.spec.ts,e2e/app-dashboard.spec.ts |
| V-TAD-CREATOR | /:handle | rr7-route | app/routes/$handle.tsx | F-BLOCK-INFRA-PUBLIC-RENDER-001,BR-CREATOR-001,TR-tadaify-009 | — | $handle.test.tsx | e2e/public-render.spec.ts |
| V-TAD-DESIGN | /app?tab=design | query-panel | app/components/DesignPanel.tsx | F-APP-DASHBOARD-001a,F-APP-DASHBOARD-001b,BR-DASH-003 | app/routes/app.tsx | DesignPanel.test.tsx | e2e/app-dashboard-design.spec.ts,e2e/app-dashboard.spec.ts |
| V-TAD-INSIGHTS | /app?tab=insights | query-panel | app/components/InsightsPanel.tsx | F-APP-DASHBOARD-001a,F-APP-INSIGHTS-001,BR-DASH-007 | app/routes/app.tsx | InsightsPanel.kpi.test.tsx,InsightsPanel.render.test.tsx | e2e/app-dashboard.spec.ts |
| V-TAD-PREVIEW | — | non-url-panel | app/components/LivePreviewPane.tsx | F-APP-DASHBOARD-001a,TR-tadaify-005 | app/routes/app.tsx | app.test.ts | e2e/app-dashboard.spec.ts |
| V-TAD-SIDEBAR | — | non-url-panel | app/components/AppSidebar.tsx | F-APP-DASHBOARD-001a,BR-DASH-002 | app/routes/app.tsx | app.test.ts | e2e/app-dashboard.spec.ts |
| V-TAD-APPBAR | — | non-url-panel | app/components/AppAppbar.tsx | F-APP-DASHBOARD-001a,BR-DASH-002 | app/routes/app.tsx | app.test.ts | e2e/app-dashboard.spec.ts |
