/**
 * U3: config.toml hook URL + verify_jwt structural correctness tests.
 * Run: node --test supabase/config-hook.test.mjs
 *
 * Reads config.toml via simple regex (no TOML parser dep) to assert:
 *   - hook URL uses the correct custom port (54351, not 54321)
 *   - [functions.before-user-created] has verify_jwt = false (Bug 3 fix)
 *   - API port matches hook URL port (drift detector)
 *
 * Story: F-REGISTER-001a (Bug 2 + Bug 3 regression guards)
 * Covers: BUG-149-2, BUG-149-3, ECN-149-04
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "config.toml");
const config = readFileSync(configPath, "utf-8");

describe("config.toml — hook URL port (Bug 2 regression guard)", () => {
  it("hook URL uses port 54351 (not 54321)", () => {
    // Match the uri line under [auth.hook.before_user_created]
    const match = config.match(/\[auth\.hook\.before_user_created\][^[]*uri\s*=\s*"([^"]+)"/s);
    assert.ok(match, "Expected [auth.hook.before_user_created] uri to be present");
    const uri = match[1];
    assert.ok(
      uri.includes(":54351/"),
      `Hook URI should use port 54351, got: ${uri}`
    );
    assert.ok(
      !uri.includes(":54321/"),
      `Hook URI must NOT use default port 54321, got: ${uri}`
    );
  });

  it("hook URL targets the before-user-created function", () => {
    const match = config.match(/\[auth\.hook\.before_user_created\][^[]*uri\s*=\s*"([^"]+)"/s);
    assert.ok(match, "Expected [auth.hook.before_user_created] uri to be present");
    const uri = match[1];
    assert.ok(
      uri.endsWith("/functions/v1/before-user-created"),
      `Hook URI should target before-user-created function, got: ${uri}`
    );
  });
});

describe("config.toml — verify_jwt (Bug 3 regression guard)", () => {
  it("before-user-created has verify_jwt = false", () => {
    // Match [functions.before-user-created] block and its verify_jwt line
    const match = config.match(/\[functions\.before-user-created\][^[]*verify_jwt\s*=\s*(true|false)/s);
    assert.ok(
      match,
      "Expected [functions.before-user-created] block with verify_jwt to be present"
    );
    assert.equal(
      match[1],
      "false",
      "verify_jwt must be false for before-user-created (pre-auth hook, no user JWT available)"
    );
  });
});

describe("config.toml — API port drift detector (ECN-149-04)", () => {
  it("API port matches hook URL port", () => {
    // Extract [api] port value
    const apiPortMatch = config.match(/^\[api\][^[]*^port\s*=\s*(\d+)/ms);
    assert.ok(apiPortMatch, "Expected [api] port to be defined in config.toml");
    const apiPort = apiPortMatch[1];

    // Extract hook URI port
    const hookMatch = config.match(/\[auth\.hook\.before_user_created\][^[]*uri\s*=\s*"[^"]*:(\d+)\/functions/s);
    assert.ok(hookMatch, "Expected [auth.hook.before_user_created] uri with port");
    const hookPort = hookMatch[1];

    assert.equal(
      hookPort,
      apiPort,
      `Hook URL port (${hookPort}) must match [api] port (${apiPort}) — update hook URI when changing api port`
    );
  });
});
