/**
 * U2: config.toml auth email template wiring assertions.
 * Run: node --test supabase/config.test.mjs
 *
 * Verifies that the four standard Supabase auth flow template sections are
 * wired in config.toml with correct content_path and subject lines containing
 * {{ .Token }} (TR-tadaify-002 §3).
 *
 * NOTE: Does NOT collide with supabase/config-hook.test.mjs which owns
 * Bug 2/3 regression guards (hook URL port + verify_jwt). This file owns
 * auth email template wiring only.
 *
 * NOTE on text_path (DEC-333=B): Supabase CLI 2.84.2 does NOT support
 * `text_path` in [auth.email.template.*] blocks — the CLI rejects it as
 * an invalid key. The .txt plain-text files exist on disk (shipped for
 * Edge Function dispatcher use and forward-compatibility) but are NOT
 * wired via config.toml in this CLI version. The separate .txt file
 * existence is asserted in templates.test.mjs (U1).
 *
 * Covers: TR-tadaify-002 §3 (sourced from local files, wired in config.toml)
 * Story: #150 (auth email templates Phase 1+2), DEC-333=B
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "config.toml");
const config = readFileSync(configPath, "utf-8");
// config.test.mjs lives in supabase/; .txt files live in supabase/templates/auth/
const templatesAuthDir = join(__dirname, "templates/auth");

/**
 * Extract the content_path value from a named [auth.email.template.<key>] block.
 * Returns null if block or key not found.
 */
function getTemplateField(key, field) {
  // Match the section and capture everything until the next section header
  const sectionRe = new RegExp(
    `\\[auth\\.email\\.template\\.${key}\\][^[]*`,
    "s"
  );
  const sectionMatch = config.match(sectionRe);
  if (!sectionMatch) return null;
  const section = sectionMatch[0];
  const fieldRe = new RegExp(`^${field}\\s*=\\s*"([^"]+)"`, "m");
  const fieldMatch = section.match(fieldRe);
  return fieldMatch ? fieldMatch[1] : null;
}

describe("config.toml — auth email template wiring (TR-tadaify-002 §3)", () => {

  // signup → otp-signup.html
  it("[auth.email.template.signup].content_path points at otp-signup.html", () => {
    const val = getTemplateField("signup", "content_path");
    assert.ok(val, "Expected [auth.email.template.signup] content_path to be defined");
    assert.equal(
      val,
      "./supabase/templates/auth/otp-signup.html",
      `signup content_path should be ./supabase/templates/auth/otp-signup.html, got: ${val}`
    );
  });

  it("[auth.email.template.signup].subject contains {{ .Token }}", () => {
    const val = getTemplateField("signup", "subject");
    assert.ok(val, "Expected [auth.email.template.signup] subject to be defined");
    assert.ok(
      val.includes("{{ .Token }}"),
      `signup subject must contain {{ .Token }}, got: ${val}`
    );
  });

  // magic_link → otp-login.html
  it("[auth.email.template.magic_link].content_path points at otp-login.html", () => {
    const val = getTemplateField("magic_link", "content_path");
    assert.ok(val, "Expected [auth.email.template.magic_link] content_path to be defined");
    assert.equal(
      val,
      "./supabase/templates/auth/otp-login.html",
      `magic_link content_path should be ./supabase/templates/auth/otp-login.html, got: ${val}`
    );
  });

  it("[auth.email.template.magic_link].subject contains {{ .Token }}", () => {
    const val = getTemplateField("magic_link", "subject");
    assert.ok(val, "Expected [auth.email.template.magic_link] subject to be defined");
    assert.ok(
      val.includes("{{ .Token }}"),
      `magic_link subject must contain {{ .Token }}, got: ${val}`
    );
  });

  // recovery → password-reset.html
  it("[auth.email.template.recovery].content_path points at password-reset.html", () => {
    const val = getTemplateField("recovery", "content_path");
    assert.ok(val, "Expected [auth.email.template.recovery] content_path to be defined");
    assert.equal(
      val,
      "./supabase/templates/auth/password-reset.html",
      `recovery content_path should be ./supabase/templates/auth/password-reset.html, got: ${val}`
    );
  });

  it("[auth.email.template.recovery].subject contains {{ .Token }}", () => {
    const val = getTemplateField("recovery", "subject");
    assert.ok(val, "Expected [auth.email.template.recovery] subject to be defined");
    assert.ok(
      val.includes("{{ .Token }}"),
      `recovery subject must contain {{ .Token }}, got: ${val}`
    );
  });

  // email_change → email-change-confirm.html
  it("[auth.email.template.email_change].content_path points at email-change-confirm.html", () => {
    const val = getTemplateField("email_change", "content_path");
    assert.ok(val, "Expected [auth.email.template.email_change] content_path to be defined");
    assert.equal(
      val,
      "./supabase/templates/auth/email-change-confirm.html",
      `email_change content_path should be ./supabase/templates/auth/email-change-confirm.html, got: ${val}`
    );
  });

  it("[auth.email.template.email_change].subject contains {{ .Token }}", () => {
    const val = getTemplateField("email_change", "subject");
    assert.ok(val, "Expected [auth.email.template.email_change] subject to be defined");
    assert.ok(
      val.includes("{{ .Token }}"),
      `email_change subject must contain {{ .Token }}, got: ${val}`
    );
  });
});

// --- DEC-333=B: .txt plain-text files exist alongside HTML templates ---
// NOTE: text_path is NOT wired in config.toml (unsupported by Supabase CLI 2.84.2).
// The .txt files are shipped for Edge Function dispatcher use and forward-compatibility.

describe("DEC-333=B — .txt plain-text files exist on disk for all 6 templates", () => {
  const txtFiles = [
    { key: "signup",       file: "otp-signup.txt" },
    { key: "magic_link",   file: "otp-login.txt" },
    { key: "recovery",     file: "password-reset.txt" },
    { key: "email_change", file: "email-change-confirm.txt" },
    { key: "identity_linked", file: "identity-linked.txt" },
    { key: "welcome",      file: "welcome.txt" },
  ];

  for (const { key, file } of txtFiles) {
    it(`${file} exists on disk`, () => {
      const filePath = join(templatesAuthDir, file);
      assert.ok(
        existsSync(filePath),
        `${file} must exist — separate plain-text file for multipart MIME (DEC-333=B)`
      );
    });
  }

  // Verify config.toml does NOT contain text_path (CLI 2.84.2 rejects it as invalid key)
  it("config.toml does NOT contain text_path (not supported by Supabase CLI 2.84.2)", () => {
    assert.ok(
      !config.includes("text_path"),
      "config.toml must NOT contain text_path — Supabase CLI 2.84.2 rejects it as an invalid key; .txt files are shipped for Edge Function use only"
    );
  });
});
