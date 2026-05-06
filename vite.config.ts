import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // Uses the default wrangler.jsonc (single config for local + prod per DEC-367=C).
      // miniflare auto-emulates AVATARS_R2 r2_buckets locally via filesystem-backed storage.
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
