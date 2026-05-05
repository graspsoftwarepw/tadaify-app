import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // Local dev uses wrangler.dev.jsonc which declares AVATARS_R2 r2_buckets
      // so miniflare emulates R2 with filesystem-backed storage.
      // wrangler deploy uses the default wrangler.jsonc (no r2_buckets) so
      // deploys don't fail before the real bucket is provisioned.
      configPath: "./wrangler.dev.jsonc",
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
