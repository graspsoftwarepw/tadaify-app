import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { MAPS_DIR, MAP_FILES, repoRoot } from "./lib/maps-lib.mjs";

const root = repoRoot();
const run = (command, args = []) => spawnSync(join(root, "bin", command), args, {
  cwd: root,
  encoding: "utf8",
});

describe("ignored requirement-map cache", () => {
  it("generates and checks every map under .metadata", () => {
    const generated = run("maps-gen");
    assert.equal(generated.status, 0);
    for (const file of MAP_FILES) assert.equal(existsSync(join(root, MAPS_DIR, file)), true);

    const checked = run("maps-check");
    assert.equal(checked.status, 0);
    assert.match(checked.stdout, /maps fresh/);
  });

  it("lets bin/req rebuild a missing cache before review lookup", () => {
    assert.equal(run("maps-gen").status, 0);
    const cache = join(root, MAPS_DIR);
    const backup = join(root, ".metadata", `maps-test-backup-${process.pid}`);
    renameSync(cache, backup);

    try {
      const result = run("req", ["find", "V-TAD-LANDING"]);
      assert.equal(result.status, 0);
      assert.match(result.stderr, new RegExp(`regenerated ${MAPS_DIR.replace(".", "\\.")}`));
      assert.match(result.stdout, /V-TAD-LANDING/);
      for (const file of MAP_FILES) assert.equal(existsSync(join(cache, file)), true);
    } finally {
      rmSync(cache, { recursive: true, force: true });
      renameSync(backup, cache);
    }
  });

  it("rejects a nested e2e spec without requirement coverage", () => {
    const e2eDir = join(root, "e2e", `maps-nested-${process.pid}`);
    const spec = join(e2eDir, "orphan.spec.ts");
    mkdirSync(e2eDir, { recursive: true });
    writeFileSync(spec, "import { test } from '@playwright/test';\ntest.skip('map orphan');\n", "utf8");
    try {
      const result = run("req", ["orphans"]);
      assert.equal(result.status, 1);
      assert.match(result.stdout, new RegExp(`maps-nested-${process.pid}/orphan\\.spec\\.ts`));
    } finally {
      rmSync(e2eDir, { recursive: true, force: true });
      assert.equal(run("maps-gen").status, 0);
    }
  });

  it("marks the cache stale when only an e2e Covers header changes", () => {
    const e2eDir = join(root, "e2e", `maps-digest-${process.pid}`);
    const spec = join(e2eDir, "covered.spec.ts");
    mkdirSync(e2eDir, { recursive: true });
    writeFileSync(spec, "// Covers: BR-MAPS-CACHE-001\n", "utf8");
    try {
      assert.equal(run("maps-gen").status, 0);
      assert.equal(run("maps-check").status, 0);
      writeFileSync(spec, "// Covers: BR-MAPS-CACHE-002\n", "utf8");
      const result = run("maps-check");
      assert.equal(result.status, 1);
      assert.match(result.stderr, /stale map:/);
    } finally {
      rmSync(e2eDir, { recursive: true, force: true });
      assert.equal(run("maps-gen").status, 0);
    }
  });
});
