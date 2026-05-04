import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.test.ts", "supabase/functions/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
});
