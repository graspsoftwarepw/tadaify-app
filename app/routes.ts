import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Landing
  index("routes/_index.tsx"),

  // Registration + login (F-REGISTER-001a)
  route("/register", "routes/register.tsx"),
  route("/login", "routes/login.tsx"),

  // Onboarding wizard (F-ONBOARDING-001a) — shared layout + 5 steps + complete
  layout("routes/onboarding.tsx", [
    route("/onboarding/welcome",  "routes/onboarding.welcome.tsx"),
    route("/onboarding/social",   "routes/onboarding.social.tsx"),
    route("/onboarding/profile",  "routes/onboarding.profile.tsx"),
    route("/onboarding/template", "routes/onboarding.template.tsx"),
    route("/onboarding/tier",     "routes/onboarding.tier.tsx"),
    route("/onboarding/complete", "routes/onboarding.complete.tsx"),
  ]),

  // App dashboard (F-APP-DASHBOARD-001a, #171)
  route("/app", "routes/app.tsx"),

  // Handle API (F-LANDING-001)
  route("/api/handle/check", "routes/api.handle.check.ts"),
  route("/api/handle/reserve", "routes/api.handle.reserve.ts"),

  // Auth API (F-REGISTER-001a)
  route("/api/auth/signup", "routes/api.auth.signup.ts"),
  route("/api/auth/login-otp", "routes/api.auth.login-otp.ts"),
  route("/api/auth/verify", "routes/api.auth.verify.ts"),
  route("/api/auth/password", "routes/api.auth.password.ts"),

  // Account API (F-APP-DASHBOARD-001a, #171)
  route("/api/account/dismiss-welcome", "routes/api.account.dismiss-welcome.ts"),

  // Avatar upload + serve API (F-ONBOARDING-001c, tadaify-app#138 / TR-tadaify-003)
  route("/api/upload/avatar", "routes/api.upload.avatar.ts"),
  route("/api/avatar/:key", "routes/api.avatar.$key.ts"),

  // Test harness — BlockPickerModal (Playwright S1–S7, tadaify-app#201)
  route("/test-block-picker-modal", "routes/test-block-picker-modal.tsx"),

  // Test harness — BlockEditorModal (Playwright S1–S7, tadaify-app#211)
  route("/test-block-editor-modal", "routes/test-block-editor-modal.tsx"),
] satisfies RouteConfig;
