import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Landing
  index("routes/_index.tsx"),

  // Registration + login (F-REGISTER-001a)
  route("/register", "routes/register.tsx"),
  route("/login", "routes/login.tsx"),

  // Handle API (F-LANDING-001)
  route("/api/handle/check", "routes/api.handle.check.ts"),
  route("/api/handle/reserve", "routes/api.handle.reserve.ts"),

  // Auth API (F-REGISTER-001a)
  route("/api/auth/signup", "routes/api.auth.signup.ts"),
  route("/api/auth/login-otp", "routes/api.auth.login-otp.ts"),
  route("/api/auth/verify", "routes/api.auth.verify.ts"),
  route("/api/auth/password", "routes/api.auth.password.ts"),
] satisfies RouteConfig;
