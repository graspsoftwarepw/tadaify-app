import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Landing
  index("routes/_index.tsx"),

  // Pricing landing (F-PRICING-LANDING-001)
  route("/pricing", "routes/pricing.tsx"),

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
  route("/api/account/pinned-message", "routes/api.account.pinned-message.ts"),

  // Profile update API (F-PROFILE-SAVE-001)
  route("/api/profile", "routes/api.profile.ts"),

  // Feedback API (F-FEEDBACK-001)
  route("/api/feedback", "routes/api.feedback.ts"),

  // Avatar upload + serve API (F-ONBOARDING-001c, tadaify-app#138 / TR-tadaify-003)
  route("/api/upload/avatar", "routes/api.upload.avatar.ts"),
  route("/api/avatar/:key", "routes/api.avatar.$key.ts"),

  // Block CRUD API (F-BLOCK-INFRA-CRUD-001, tadaify-app#199)
  // Order matters: specific routes before parameterised ones
  route("/api/blocks/reorder", "routes/api.blocks.reorder.ts"),
  route("/api/blocks/:id/duplicate", "routes/api.blocks.$id.duplicate.ts"),
  route("/api/blocks/:id", "routes/api.blocks.$id.ts"),
  route("/api/blocks", "routes/api.blocks.ts"),

  // Test harness — BlockPickerModal (Playwright S1–S7, tadaify-app#201)
  route("/test-block-picker-modal", "routes/test-block-picker-modal.tsx"),

  // Test harness — BlockEditorModal (Playwright S1–S7, tadaify-app#211)
  route("/test-block-editor-modal", "routes/test-block-editor-modal.tsx"),

  // Test harness — IconPicker (Playwright S1–S6, tadaify-app#205)
  route("/test-icon-picker", "routes/test-icon-picker.tsx"),

  // Public creator page (F-BLOCK-INFRA-PUBLIC-RENDER-001, tadaify-app#202).
  // MUST stay last — catch-all for any single-segment path that did not match
  // the specific routes above. Order matters: this would otherwise shadow
  // /app, /login, /register, /api/*, /onboarding/*, and the test harness routes.
  route("/:handle", "routes/$handle.tsx"),
] satisfies RouteConfig;
