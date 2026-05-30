/**
 * Regression guard: Edge Functions must not depend on remote HTTP imports.
 *
 * Background: Importing modules over `https://` at cold-start (`deno.land`,
 * `esm.sh`, etc.) introduces a DNS dependency on the edge runtime container's
 * network namespace. After a Docker Desktop "Apply & restart", DNS in the
 * recreated bridge network can fail to resolve external hosts for a window of
 * seconds–minutes. While in that state, every Edge Function cold-start hangs
 * waiting for `deno.land` / `esm.sh`, GoTrue's 55s hook timeout fires, and the
 * UI shows `Service currently unavailable due to hook` (issue #227).
 *
 * The fix is to use Deno's native package resolution:
 *   - `npm:<pkg>@<version>` for runtime dependencies (pre-bundled by Supabase
 *     Edge Runtime, deterministic via pinned versions)
 *   - `jsr:@supabase/functions-js/edge-runtime.d.ts` for types (compile-time
 *     only, no runtime fetch)
 *   - native `Deno.serve(...)` instead of `serve()` from std/http
 *
 * This convention is enforced across the sibling project `untiltify-app`
 * (13/13 Edge Functions follow it). This test ensures tadaify-app does not
 * regress to remote-HTTP imports.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FUNCTIONS_DIR = new URL("../", import.meta.url).pathname;

function listFunctionIndexFiles(): string[] {
  return readdirSync(FUNCTIONS_DIR)
    .map((name) => join(FUNCTIONS_DIR, name))
    .filter((path) => {
      // Skip non-directories and internal/test scaffolding.
      if (!statSync(path).isDirectory()) return false;
      const base = path.split("/").pop() ?? "";
      return !base.startsWith("_");
    })
    .map((dir) => join(dir, "index.ts"))
    .filter((path) => {
      try {
        statSync(path);
        return true;
      } catch {
        return false;
      }
    });
}

// Match any `import ... "https://..."` or `import ... 'https://...'`,
// covering side-effect imports, named imports, and dynamic-style import lines.
// We intentionally allow the strings to appear elsewhere (docs comments,
// inline string literals) — only `from "https://..."` / `import "https://..."`
// trigger a remote module load at cold-start.
const REMOTE_IMPORT_PATTERNS: RegExp[] = [
  /^\s*import\s+[^;]*from\s+["']https:\/\/[^"']+["']/m,
  /^\s*import\s+["']https:\/\/[^"']+["']/m,
];

describe("Edge Functions — no remote HTTP imports (regression guard for #227)", () => {
  const files = listFunctionIndexFiles();

  it("discovers at least one Edge Function index.ts", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file.replace(FUNCTIONS_DIR, "")} has no remote HTTP import`, () => {
      const source = readFileSync(file, "utf8");
      const offenders: string[] = [];
      for (const pattern of REMOTE_IMPORT_PATTERNS) {
        const match = source.match(pattern);
        if (match) offenders.push(match[0].trim());
      }
      expect(
        offenders,
        `Found remote HTTP imports in ${file}. Use 'npm:<pkg>@<version>' or 'jsr:<pkg>' instead.\n` +
          `Offending lines:\n  ${offenders.join("\n  ")}`,
      ).toEqual([]);
    });
  }
});
