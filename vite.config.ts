import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

// When this repo is checked out as a git worktree under
// `<repo>/.claude/worktrees/<branch>`, `node_modules` is a symlink to the
// parent checkout's directory. Vite's default `server.fs.strict` blocks
// `@fs` requests outside the project root, which makes the client never
// hydrate (every dynamic import returns 403) and breaks Playwright. We
// resolve both the checkout-local path and the path that Node actually used
// for Vite. The latter also covers managed worktrees that intentionally reuse
// the canonical checkout's dependencies without a node_modules symlink.
const require = createRequire(import.meta.url);
const serverFileSystemAllow = new Set([__dirname]);
const localWorkerBindingNames = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "HANDLE_RESERVATION_TTL_SECONDS",
] as const;
try {
  serverFileSystemAllow.add(realpathSync(resolve(__dirname, "node_modules")));
} catch {
  // A fresh worktree may have no checkout-local dependency directory.
}
try {
  const vitePackage = realpathSync(require.resolve("vite/package.json"));
  serverFileSystemAllow.add(resolve(dirname(vitePackage), ".."));
} catch {
  // Vite will report the missing dependency itself if resolution is broken.
}

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      config: (config) => {
        if (process.env.E2E_ISOLATED_STACK !== "1") return;
        const bindings = Object.fromEntries(
          localWorkerBindingNames.flatMap((name) =>
            process.env[name] ? [[name, process.env[name]]] : [],
          ),
        );
        if (Object.keys(bindings).length === 0) return;
        return { vars: { ...config.vars, ...bindings } };
      },
      // Uses the default wrangler.jsonc (single config for local + prod per DEC-367=C).
      // miniflare auto-emulates AVATARS_R2 r2_buckets locally via filesystem-backed storage.
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
    // Ensure a single React copy in the dev server. The Cloudflare SSR
    // environment + Vite dep optimization otherwise gave `lucide-react` its
    // own React instance, crashing every lucide icon with "Cannot read
    // properties of null (reading 'useContext')" — which blanked any component
    // that renders lucide icons (e.g. the block picker modal). Deduping React
    // and pre-bundling lucide-react against it fixes the dev crash. (Prod
    // builds bundle a single React already, so this was dev-only.)
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["lucide-react", "react", "react-dom"],
  },
  server: {
    fs: {
      allow: [...serverFileSystemAllow],
    },
  },
});
