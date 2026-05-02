/**
 * U1: Auth email template content assertions.
 * Run: node --test supabase/templates/auth/templates.test.mjs
 *
 * Reads each production template from disk and asserts TR-tadaify-002 invariants:
 *   - OTP templates contain {{ .Token }} placeholder
 *   - No template contains {{ .ConfirmationURL }} (token-only contract)
 *   - Every template has a corresponding .txt plain-text file (DEC-333=B)
 *   - .txt files are clean plain text (no HTML tags, brand slug `tadaify` not `tada!ify`)
 *   - OTP .txt files contain {{ .Token }}
 *   - OTP templates contain trust-strip / brand attribution in footer
 *
 * Covers: TR-tadaify-002 §1 (multipart MIME via separate .txt files), §2 (token-only), §3 (local files)
 * Story: #150 (auth email templates Phase 1+2), DEC-333=B (proper multipart via text_path)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(__dirname, name), "utf-8");
const exists = (name) => existsSync(join(__dirname, name));

// OTP-bearing templates (TR-tadaify-002 §2: must contain {{ .Token }})
const OTP_TEMPLATES = [
  "otp-signup.html",
  "otp-login.html",
  "password-reset.html",
  "email-change-confirm.html",
];

// Informational templates (no token required)
const INFO_TEMPLATES = [
  "identity-linked.html",
  "welcome.html",
];

const ALL_TEMPLATES = [...OTP_TEMPLATES, ...INFO_TEMPLATES];

// Corresponding .txt files (DEC-333=B: separate plain-text files for proper multipart MIME)
const OTP_TXT_FILES = OTP_TEMPLATES.map((f) => f.replace(".html", ".txt"));
const INFO_TXT_FILES = INFO_TEMPLATES.map((f) => f.replace(".html", ".txt"));
const ALL_TXT_FILES = [...OTP_TXT_FILES, ...INFO_TXT_FILES];

// --- §2: Token-only invariants ---

describe("TR-tadaify-002 §2 — token-only OTP flows", () => {
  for (const name of OTP_TEMPLATES) {
    it(`${name} contains {{ .Token }} placeholder`, () => {
      const html = read(name);
      assert.ok(
        html.includes("{{ .Token }}"),
        `${name} must contain {{ .Token }} — OTP token is the sole auth path`
      );
    });

    it(`${name} does NOT contain {{ .ConfirmationURL }}`, () => {
      const html = read(name);
      assert.ok(
        !html.includes("{{ .ConfirmationURL }}"),
        `${name} must NOT contain {{ .ConfirmationURL }} — magic-link forbidden (TR-tadaify-002 §2)`
      );
    });
  }

  for (const name of INFO_TEMPLATES) {
    it(`${name} does NOT contain {{ .ConfirmationURL }}`, () => {
      const html = read(name);
      assert.ok(
        !html.includes("{{ .ConfirmationURL }}"),
        `${name} must NOT contain {{ .ConfirmationURL }}`
      );
    });
  }
});

// --- HTML files must NOT contain text-part markers (moved to .txt files — DEC-333=B) ---

describe("DEC-333=B — HTML files must NOT contain <!-- text-part --> markers", () => {
  for (const name of ALL_TEMPLATES) {
    it(`${name} does NOT contain <!-- text-part --> marker`, () => {
      const html = read(name);
      assert.ok(
        !html.includes("<!-- text-part -->"),
        `${name} must NOT contain <!-- text-part --> — plain-text is now in separate .txt file (DEC-333=B)`
      );
    });

    it(`${name} does NOT contain <!-- /text-part --> marker`, () => {
      const html = read(name);
      assert.ok(
        !html.includes("<!-- /text-part -->"),
        `${name} must NOT contain <!-- /text-part --> — plain-text is now in separate .txt file (DEC-333=B)`
      );
    });
  }
});

// --- §1: Separate .txt plain-text files exist (DEC-333=B) ---

describe("TR-tadaify-002 §1 / DEC-333=B — separate .txt plain-text files exist", () => {
  for (const name of ALL_TXT_FILES) {
    it(`${name} exists on disk`, () => {
      assert.ok(
        exists(name),
        `${name} must exist — separate plain-text file for multipart MIME (DEC-333=B)`
      );
    });

    it(`${name} ends with newline (POSIX)`, () => {
      const txt = read(name);
      assert.ok(
        txt.endsWith("\n"),
        `${name} must end with a newline character (POSIX standard)`
      );
    });

    it(`${name} contains no HTML tags`, () => {
      const txt = read(name);
      assert.ok(
        !/<[a-z]+[\s>]/i.test(txt),
        `${name} must contain NO HTML tags — pure plain text only (DEC-333=B)`
      );
    });

    it(`${name} does NOT contain tada!ify brand form (must use slug tadaify)`, () => {
      const txt = read(name);
      assert.ok(
        !txt.includes("tada!ify"),
        `${name} must NOT contain "tada!ify" — plain-text uses slug form "tadaify" per brand-lock.md line 49`
      );
    });

    it(`${name} contains tadaify brand slug`, () => {
      const txt = read(name);
      assert.ok(
        txt.includes("tadaify"),
        `${name} must contain brand slug "tadaify" (brand-lock.md line 49)`
      );
    });

    it(`${name} contains noreply@tadaify.com`, () => {
      const txt = read(name);
      assert.ok(
        txt.includes("noreply@tadaify.com"),
        `${name} must contain noreply@tadaify.com footer attribution`
      );
    });
  }
});

// --- OTP token also appears in .txt files ---

describe("TR-tadaify-002 §1+§2 — OTP token present in .txt plain-text files", () => {
  for (const name of OTP_TXT_FILES) {
    it(`${name} contains {{ .Token }}`, () => {
      const txt = read(name);
      assert.ok(
        txt.includes("{{ .Token }}"),
        `${name} must contain {{ .Token }} — token must appear in plain-text fallback`
      );
    });

    it(`${name} does NOT contain {{ .ConfirmationURL }}`, () => {
      const txt = read(name);
      assert.ok(
        !txt.includes("{{ .ConfirmationURL }}"),
        `${name} must NOT contain {{ .ConfirmationURL }} — token-only contract applies to .txt too`
      );
    });
  }
});

// --- welcome.html DEC-332=D semantics ---

describe("DEC-332=D — welcome.html handle-claim semantics", () => {
  it("welcome.html contains 'not yet published' status row", () => {
    const html = read("welcome.html");
    assert.ok(
      html.includes("not yet published"),
      "welcome.html must contain 'not yet published' — page is reserved, not live (DEC-332=D)"
    );
  });

  it("welcome.html contains Set up your page CTA pointing at /app/setup", () => {
    const html = read("welcome.html");
    assert.ok(
      html.includes("/app/setup"),
      "welcome.html must contain CTA pointing at /app/setup (DEC-332=D)"
    );
  });

  it("welcome.html contains {{ .Handle }} placeholder", () => {
    const html = read("welcome.html");
    assert.ok(
      html.includes("{{ .Handle }}"),
      "welcome.html must use {{ .Handle }} placeholder for handle-claim celebration"
    );
  });

  it("welcome.txt contains {{ .Handle }} placeholder", () => {
    const txt = read("welcome.txt");
    assert.ok(
      txt.includes("{{ .Handle }}"),
      "welcome.txt must use {{ .Handle }} placeholder"
    );
  });
});

// --- email-change-confirm.html uses both {{ .Email }} and {{ .NewEmail }} ---

describe("email-change-confirm.html — dual email placeholders", () => {
  it("contains {{ .Email }} (current address)", () => {
    const html = read("email-change-confirm.html");
    assert.ok(
      html.includes("{{ .Email }}"),
      "email-change-confirm.html must contain {{ .Email }} for current address"
    );
  });

  it("contains {{ .NewEmail }} (new address)", () => {
    const html = read("email-change-confirm.html");
    assert.ok(
      html.includes("{{ .NewEmail }}"),
      "email-change-confirm.html must contain {{ .NewEmail }} for new address"
    );
  });

  it("email-change-confirm.txt contains {{ .Email }}", () => {
    const txt = read("email-change-confirm.txt");
    assert.ok(
      txt.includes("{{ .Email }}"),
      "email-change-confirm.txt must contain {{ .Email }} for current address"
    );
  });

  it("email-change-confirm.txt contains {{ .NewEmail }}", () => {
    const txt = read("email-change-confirm.txt");
    assert.ok(
      txt.includes("{{ .NewEmail }}"),
      "email-change-confirm.txt must contain {{ .NewEmail }} for new address"
    );
  });
});

// --- identity-linked.html uses {{ .Provider }} ---

describe("identity-linked.html — provider placeholder", () => {
  it("contains {{ .Provider }} placeholder", () => {
    const html = read("identity-linked.html");
    assert.ok(
      html.includes("{{ .Provider }}"),
      "identity-linked.html must contain {{ .Provider }} for OAuth provider name"
    );
  });

  it("identity-linked.txt contains {{ .Provider }} placeholder", () => {
    const txt = read("identity-linked.txt");
    assert.ok(
      txt.includes("{{ .Provider }}"),
      "identity-linked.txt must contain {{ .Provider }} for OAuth provider name"
    );
  });
});
