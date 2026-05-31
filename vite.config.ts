import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";

// When this repo is checked out as a git worktree under
// `<repo>/.claude/worktrees/<branch>`, `node_modules` is a symlink to the
// parent checkout's directory. Vite's default `server.fs.strict` blocks
// `@fs` requests outside the project root, which makes the client never
// hydrate (every dynamic import returns 403) and breaks Playwright. We
// resolve the real `node_modules` path and add it to `server.fs.allow` so
// the worktree dev server (and the parent's) can both serve the symlinked
// dependency tree.
const NODE_MODULES_REAL = (() => {
  try {
    return realpathSync(resolve(__dirname, "node_modules"));
  } catch {
    return null;
  }
})();

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
  server: NODE_MODULES_REAL
    ? {
        fs: {
          allow: [__dirname, NODE_MODULES_REAL],
        },
      }
    : undefined,
});
