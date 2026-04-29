import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("/api/handle/check", "routes/api.handle.check.ts"),
  route("/api/handle/reserve", "routes/api.handle.reserve.ts"),
] satisfies RouteConfig;
