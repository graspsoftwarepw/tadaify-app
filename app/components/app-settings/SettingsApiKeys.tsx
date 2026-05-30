/**
 * SettingsApiKeys — API keys sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-apikeys.html
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real API wiring — all interactive handlers are no-ops or local state.
 *
 * Sections (in order):
 *   1. Upsell hero    — visible for Free / Creator tier; no-blur per policy
 *   2. Demo-mode strip — inline hint for Free / Creator
 *   3. Rate-limited banner — state-driven
 *   4. Your API keys  — table with 5 sample rows + empty state + permissions matrix
 *   5. Plug into Claude (MCP) — code snippets + 4-step quickstart
 *   6. Custom GPT template (ChatGPT) — OpenAPI schema + 3-step quickstart
 *   7. Webhook delivery log — filterable table + placeholder card (DEC-MULTIPAGE-01)
 *   8. Rate limits & usage — live usage cards + per-tier reference
 *   9. Help footer
 *   10. Modals (centered, NEVER drawers):
 *       - Generate new key (multi-step: form → reveal)
 *       - Rotate key
 *       - Delete key (type-to-confirm)
 *       - Webhook payload viewer
 *       - Upgrade gate (TierGate stub)
 *
 * TODO: wire to API keys service
 *
 * Story: F-APP-SETTINGS-API-KEYS-001 (#37)
 */

import { useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = "pro" | "business" | "creator" | "free";
type AppState = "filled" | "empty" | "rate-limited" | "cap-reached";

interface SampleKey {
  id: string;
  name: string;
  scopes: string[];
  created: string;
  lastUsed: string;
  last4: string;
  desc: string;
  revoked?: boolean;
}

interface SampleWebhook {
  when: string;
  endpoint: string;
  event: string;
  status: string;
  code: string;
  rt: string;
  retries: number;
}

// ─── Stub data (verbatim from mockup) ────────────────────────────────────────

const SAMPLE_KEYS: SampleKey[] = [
  {
    id: "ak_001", name: "Production",
    scopes: ["read:pages", "read:blocks", "write:blocks", "webhooks"],
    created: "Mar 2, 2026", lastUsed: "12 min ago", last4: "x9k2",
    desc: "Live integration · main pipeline",
  },
  {
    id: "ak_002", name: "Staging",
    scopes: ["read:pages", "read:blocks", "write:pages", "write:blocks"],
    created: "Feb 18, 2026", lastUsed: "4 hours ago", last4: "mPq7",
    desc: "Used by staging.tadaify.example for QA",
  },
  {
    id: "ak_003", name: "Webhook receiver",
    scopes: ["webhooks"],
    created: "Jan 11, 2026", lastUsed: "Yesterday", last4: "jL3v",
    desc: "Zapier — page.published → email blast",
  },
  {
    id: "ak_004", name: "GPT integration",
    scopes: ["read:pages", "read:blocks", "read:analytics"],
    created: "Dec 22, 2025", lastUsed: "2 hours ago", last4: "fA8t",
    desc: "My Custom GPT on chatgpt.com",
  },
  {
    id: "ak_005", name: "Make.com automation",
    scopes: ["read:subscribers", "write:subscribers", "webhooks"],
    created: "Nov 4, 2025", lastUsed: "6 days ago", last4: "wK1n",
    desc: "New form submission → Notion + Klaviyo · revoked Apr 8",
    revoked: true,
  },
]; // TODO: wire to API keys service

const SAMPLE_WEBHOOKS: SampleWebhook[] = [
  { when: "2 min ago",  endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc",     event: "page.published",     status: "200",     code: "2xx",     rt: "412 ms",   retries: 0 },
  { when: "14 min ago", endpoint: "https://hooks.make.com/r/x9KQpZ",                       event: "subscriber.added",   status: "200",     code: "2xx",     rt: "184 ms",   retries: 0 },
  { when: "38 min ago", endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc",     event: "block.created",      status: "200",     code: "2xx",     rt: "298 ms",   retries: 0 },
  { when: "1 h ago",    endpoint: "https://my-api.alexandra.com/webhooks/tadaify",         event: "form.submitted",     status: "500",     code: "5xx",     rt: "5,003 ms", retries: 3 },
  { when: "2 h ago",    endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc",     event: "page.unpublished",   status: "200",     code: "2xx",     rt: "356 ms",   retries: 0 },
  { when: "3 h ago",    endpoint: "https://my-api.alexandra.com/webhooks/tadaify",         event: "subscriber.removed", status: "404",     code: "4xx",     rt: "129 ms",   retries: 1 },
  { when: "5 h ago",    endpoint: "https://hooks.make.com/r/x9KQpZ",                       event: "block.created",      status: "pending", code: "pending", rt: "—",        retries: 2 },
  { when: "8 h ago",    endpoint: "https://hooks.zapier.com/hooks/catch/12345678/abc",     event: "page.published",     status: "200",     code: "2xx",     rt: "267 ms",   retries: 0 },
  { when: "11 h ago",   endpoint: "https://my-api.alexandra.com/webhooks/tadaify",         event: "form.submitted",     status: "200",     code: "2xx",     rt: "412 ms",   retries: 1 },
  { when: "Yesterday",  endpoint: "https://hooks.make.com/r/x9KQpZ",                       event: "subscriber.added",   status: "200",     code: "2xx",     rt: "202 ms",   retries: 0 },
]; // TODO: wire to API keys service

const SCOPE_DEFS = [
  { value: "read:pages",       label: "read:pages",       write: false, sub: "List pages, read settings + theme + SEO. No PII." },
  { value: "read:blocks",      label: "read:blocks",      write: false, sub: "Read every block on every page." },
  { value: "write:pages",      label: "write:pages",      write: true,  sub: "Create + edit + publish pages. Renames trigger DEC-074 redirects." },
  { value: "write:blocks",     label: "write:blocks",     write: true,  sub: "Add / edit / reorder / delete blocks on any page." },
  { value: "read:analytics",   label: "read:analytics",   write: false, sub: "Pull views, clicks, conversions. 1-hour cache." },
  { value: "read:subscribers", label: "read:subscribers", write: false, sub: "List subscribers (PII — appears in audit log)." },
  { value: "write:subscribers",label: "write:subscribers",write: true,  sub: "Add / unsubscribe people. Honours double opt-in." },
  { value: "webhooks",         label: "webhooks",         write: true,  sub: "Register endpoints to receive event callbacks." },
];

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c] ?? c);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsApiKeys() {
  // ── Tier / state (demo switchers, default: pro / filled) ─────────────────
  const [tier, setTier] = useState<Tier>("pro"); // TODO: wire to API keys service
  const [appState, setAppState] = useState<AppState>("filled"); // TODO: wire to API keys service

  const isPaidTier = tier === "pro" || tier === "business";

  // ── Permissions matrix ───────────────────────────────────────────────────
  const [permsOpen, setPermsOpen] = useState(false);

  // ── Webhook filters ──────────────────────────────────────────────────────
  const [whEventFilter, setWhEventFilter] = useState("all");
  const [whStatusFilter, setWhStatusFilter] = useState("all");

  // ── Modal state ──────────────────────────────────────────────────────────
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Generate modal
  const [genName, setGenName] = useState("");
  const [genExpires, setGenExpires] = useState("never");
  const [genScopes, setGenScopes] = useState<Record<string, boolean>>({ "read:pages": true, "read:blocks": true });
  const [genStep, setGenStep] = useState<"form" | "reveal">("form");

  // Rotate modal
  const [rotateKey, setRotateKey] = useState<SampleKey | null>(null);

  // Delete modal
  const [deleteKey, setDeleteKey] = useState<SampleKey | null>(null);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  // Payload modal
  const [payloadWebhook, setPayloadWebhook] = useState<SampleWebhook | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1800);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    showToast("Copied to clipboard");
  }, [showToast]);

  // ── Modal openers ─────────────────────────────────────────────────────────
  const openGenerateModal = useCallback(() => {
    if (!isPaidTier) { openUpsell("Generate API key"); return; }
    // TODO: wire to API keys service
    setGenName("");
    setGenExpires("never");
    setGenScopes({ "read:pages": true, "read:blocks": true });
    setGenStep("form");
    setOpenModal("generate");
  }, [isPaidTier]);

  const openRotate = useCallback((key: SampleKey) => {
    if (!isPaidTier) { openUpsell("Rotate API key"); return; }
    // TODO: wire to API keys service
    setRotateKey(key);
    setOpenModal("rotate");
  }, [isPaidTier]);

  const openDelete = useCallback((key: SampleKey) => {
    if (!isPaidTier) { openUpsell("Delete API key"); return; }
    // TODO: wire to API keys service
    setDeleteKey(key);
    setDeleteConfirmValue("");
    setOpenModal("delete");
  }, [isPaidTier]);

  const openPayload = useCallback((wh: SampleWebhook) => {
    if (!isPaidTier) { openUpsell("View webhook payload"); return; }
    // TODO: wire to API keys service
    setPayloadWebhook(wh);
    setOpenModal("payload");
  }, [isPaidTier]);

  const openUpsell = useCallback((feature: string) => {
    setUpsellFeature(feature);
    setOpenModal("upsell");
  }, []);

  // ── Upsell feature label ──────────────────────────────────────────────────
  const [upsellFeature, setUpsellFeature] = useState("API access");

  // ── Generate step: proceed to reveal ────────────────────────────────────
  const genStepReveal = useCallback(() => {
    const name = genName.trim();
    const scopes = SCOPE_DEFS.filter((s) => genScopes[s.value]).map((s) => s.value);
    if (!name) { showToast("Give your key a name first"); return; }
    if (scopes.length === 0) { showToast("Pick at least one scope"); return; }
    setGenStep("reveal");
  }, [genName, genScopes, showToast]);

  // ── Rotate confirm ───────────────────────────────────────────────────────
  const confirmRotate = useCallback(() => {
    // TODO: wire to API keys service
    setOpenModal(null);
    setRotateKey(null);
    setGenStep("reveal");
    setOpenModal("generate");
    showToast("Mockup: rotate · GET /api/keys/{id}/rotate");
  }, [showToast]);

  // ── Delete confirm ───────────────────────────────────────────────────────
  const confirmDelete = useCallback(() => {
    // TODO: wire to API keys service
    setOpenModal(null);
    setDeleteKey(null);
    showToast("Mockup: key revoked — DELETE /api/keys/{id}");
  }, [showToast]);

  // ── Webhook filter ────────────────────────────────────────────────────────
  const filteredWebhooks = SAMPLE_WEBHOOKS.filter((w) => {
    if (whEventFilter !== "all" && w.event !== whEventFilter) return false;
    if (whStatusFilter !== "all" && w.code !== whStatusFilter) return false;
    return true;
  });

  // ── Reveal meta ──────────────────────────────────────────────────────────
  const revealScopes = SCOPE_DEFS.filter((s) => genScopes[s.value]).map((s) => s.value).join(", ") || "—";
  const expiresLabel: Record<string, string> = {
    never: "Never",
    "30": "In 30 days · May 27, 2026",
    "90": "In 90 days · Jul 26, 2026",
    "365": "In 1 year · Apr 27, 2027",
    custom: "Custom date",
  };

  // ── Cap-reached state ────────────────────────────────────────────────────
  const capReached = appState === "cap-reached";

  // ── Rate usage values ─────────────────────────────────────────────────────
  const rateLimit = tier === "business" ? 5000 : 1000;
  const rateUsed = appState === "rate-limited" ? rateLimit : 423;
  const ratePct = Math.min(100, Math.round((rateUsed / rateLimit) * 100));
  const rateBarClass = appState === "rate-limited"
    ? "ak-rate-bar-fill is-crit"
    : ratePct > 80
    ? "ak-rate-bar-fill is-warn"
    : "ak-rate-bar-fill";

  return (
    <>
      {/* ============================================================
           Settings content pane
           ============================================================ */}
      <div className="settings-content" id="pane-api">

        {/* ============================================================
             UPSELL HERO — Free / Creator only (no-blur policy)
             ============================================================ */}
        {(tier === "free" || tier === "creator") && (
          <div className="ak-upsell-hero" role="region" aria-label="API access requires Pro">
            <div className="ak-uh-icon" aria-hidden="true">🔑</div>
            <div className="ak-uh-body">
              <div className="ak-uh-title">Creator API comes with the Pro plan</div>
              <div className="ak-uh-sub">
                Generate API keys, plug tadaify into Claude Desktop via MCP, or build a Custom GPT that publishes to your page.
                Everything below is shown in <b>demonstration mode</b> — explore the layout; we&apos;ll ask you to upgrade when you click an action.
              </div>
            </div>
            <div className="ak-uh-cta">
              <button className="btn btn-primary" onClick={() => openUpsell("api-access")}>
                Upgrade to Pro — $19.99/mo →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
             DEMO-MODE STRIP — below hero on Free / Creator
             ============================================================ */}
        {(tier === "free" || tier === "creator") && (
          <div className="ak-demo-mode-strip" aria-live="polite">
            <span className="ak-dms-ico" aria-hidden="true">👀</span>
            <div>
              <b>Demonstration mode.</b>{" "}
              Free + Creator tiers see the full API surface so you can decide if it&apos;s worth upgrading.
              Buttons here open the upgrade modal instead of taking action — no fake-disabled controls,
              no blur, no surprises.
            </div>
          </div>
        )}

        {/* ============================================================
             RATE-LIMITED BANNER — state-driven
             ============================================================ */}
        {appState === "rate-limited" && (
          <div className="ak-rate-banner" role="alert">
            <span className="ak-rb-ico" aria-hidden="true">🚦</span>
            <div>
              <strong>Rate limit reached — hold up briefly</strong>
              You&apos;ve hit <b>1,000 requests in the last hour</b> on Pro. New calls return{" "}
              <code>HTTP 429</code> with a <code>retry-after: 1820</code> header. The window resets at
              the top of the hour. Upgrade to Business for 5× the headroom.
            </div>
          </div>
        )}

        {/* ============================================================
             SECTION 1 — Your API keys
             ============================================================ */}
        <div className="settings-section">
          <div className="settings-section-title ak-with-action">
            <span>
              Your API keys{" "}
              <span className="chip pro ak-sec-tier-pill" aria-label="Pro feature">Pro+</span>
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (capReached) { showToast("Cap reached — revoke an existing key first"); return; }
                openGenerateModal();
              }}
              disabled={capReached}
              id="btn-generate-key"
            >
              {capReached ? "✕ Cap reached (25 / 25)" : "+ Generate new key"}
            </button>
          </div>
          <p className="ak-section-help">
            Each key authenticates a single integration — give it a clear name so you can rotate it later
            without breaking anything else. Keys live in our DB as{" "}
            <code>SHA-256(key)</code>; the prefix you see is the only identifier we keep in plaintext (BR-API-001).
          </p>

          {/* Filled state */}
          {appState !== "empty" && (
            <div id="keys-filled-wrap">
              <div className="ak-keys-table-wrap">
                <table className="ak-keys-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Permissions</th>
                      <th>Created</th>
                      <th>Last used</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_KEYS.map((k) => (
                      <tr key={k.id} className={k.revoked ? "is-revoked" : undefined}>
                        <td>
                          <span className="ak-k-name">{k.name}</span>
                          <span className="ak-k-name-meta">{k.desc}</span>
                        </td>
                        <td>
                          <span className="ak-k-token">sk_tdf_•••…{k.last4}</span>
                        </td>
                        <td>
                          <div className="ak-k-scopes">
                            {k.scopes.map((s) => (
                              <span key={s} className="chip scope">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="ak-k-date">{k.created}</td>
                        <td className="ak-k-date">{k.lastUsed}</td>
                        <td className="ak-k-actions">
                          {k.revoked ? (
                            <span style={{ fontSize: "11.5px", color: "var(--fg-subtle)", paddingRight: 8 }}>
                              Revoked Apr 8, 2026
                            </span>
                          ) : (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => {
                                  // TODO: wire to API keys service
                                  if (!isPaidTier) { openUpsell("Reveal API key"); return; }
                                  showToast("Can't reveal — we only store SHA-256. Rotate to get a fresh value.");
                                }}
                              >
                                Reveal once
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => openRotate(k)}
                              >
                                Rotate
                              </button>
                              <button
                                className="btn btn-danger-ghost btn-xs"
                                onClick={() => openDelete(k)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--fg-subtle)", marginTop: 10, lineHeight: 1.55 }}>
                Lost a key? You can&apos;t recover the value — only see it once at generation. Rotate or revoke
                instead, then create a fresh one. Cap:{" "}
                {capReached
                  ? <span style={{ color: "var(--danger)" }}>Cap reached: 25 / 25 active keys</span>
                  : <b>25 active keys per account</b>
                }{" "}
                (revoked keys don&apos;t count).
              </p>
            </div>
          )}

          {/* Empty state */}
          {appState === "empty" && (
            <div className="ak-keys-empty">
              <div className="ak-ke-ico" aria-hidden="true">🔑</div>
              <div><b style={{ color: "var(--fg)" }}>No keys yet</b></div>
              <div style={{ marginTop: 4 }}>
                Create your first key to plug tadaify into Claude, ChatGPT, Make.com, or your own scripts.
              </div>
              <div className="ak-ke-cta">
                <button className="btn btn-primary btn-sm" onClick={openGenerateModal}>
                  + Generate your first key
                </button>
              </div>
            </div>
          )}

          {/* Permissions matrix expander */}
          <button
            type="button"
            className={`ak-permissions-toggle${permsOpen ? " open" : ""}`}
            onClick={() => setPermsOpen((v) => !v)}
            aria-expanded={permsOpen}
            aria-controls="ak-permissions-grid"
          >
            <span className="ak-pt-caret">›</span> What can each scope do?
          </button>
          <div
            className={`ak-permissions-grid${permsOpen ? " open" : ""}`}
            id="ak-permissions-grid"
            role="region"
            aria-label="Permission scope reference"
          >
            <div className="ak-perm-row is-head">
              <div>Scope</div>
              <div>What it lets the key do</div>
              <div style={{ textAlign: "right" }}>Category</div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">read:pages</div>
              <div className="ak-perm-desc">List your pages, read settings, layout, theme, and SEO meta. No PII.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag">Read</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">read:blocks</div>
              <div className="ak-perm-desc">Read every block on every page (link / video / form / shop / FAQ / portfolio / blog).</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag">Read</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">write:pages</div>
              <div className="ak-perm-desc">Create new pages, change page settings (title, slug, theme), publish or unpublish. Renames trigger DEC-074 redirects.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag write">Write</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">write:blocks</div>
              <div className="ak-perm-desc">Add, edit, reorder, delete blocks. Bulk-publish a draft. Counts against AI credits when ✨ Suggest is invoked.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag write">Write</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">read:analytics</div>
              <div className="ak-perm-desc">Pull views, click counts, conversion KPIs, time-series. 1 hour cache window — fresh data costs more requests.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag">Read</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">read:subscribers</div>
              <div className="ak-perm-desc">List your email subscribers (creator-side). PII access — appears in your audit log on every call.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag">Read</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">write:subscribers</div>
              <div className="ak-perm-desc">Add or unsubscribe people from your list. Honours double opt-in flag and GDPR consent state.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag write">Write</span></div>
            </div>
            <div className="ak-perm-row">
              <div className="ak-perm-name">webhooks</div>
              <div className="ak-perm-desc">Register endpoints to receive event callbacks (page.published, subscriber.added, …). Required for the live webhook log below.</div>
              <div className="ak-perm-cat"><span className="ak-perm-tag write">Write</span></div>
            </div>
          </div>
        </div>

        {/* ============================================================
             SECTION 2 — Plug into Claude (MCP)
             ============================================================ */}
        <div className="settings-section">
          <div className="settings-section-title ak-with-action">
            <span>
              Plug into Claude (MCP){" "}
              <span className="chip pro ak-sec-tier-pill" aria-label="Pro feature">Pro+</span>
            </span>
            <a
              href="https://docs.anthropic.com/en/docs/build-with-claude/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              What&apos;s MCP? ↗
            </a>
          </div>
          <p className="ak-section-help">
            MCP (Model Context Protocol) is how Claude Desktop talks to outside services. Drop these snippets
            in and Claude can list, edit, and publish your pages from inside any conversation. The official
            tadaify MCP server (<code>@tadaify/mcp</code>) is open-source and runs locally.
          </p>

          <div className="ak-code-block-label">One-liner — add tadaify MCP to Claude Code</div>
          <div className="ak-code-block">
            <button
              className="ak-cb-copy"
              onClick={() => copyToClipboard(`claude mcp add tadaify --url https://api.tadaify.com/mcp --header "Authorization: Bearer YOUR_KEY"`)}
            >
              Copy
            </button>
            <span style={{ color: "#9CA3AF" }}>$ </span>
            {`claude mcp add tadaify --url https://api.tadaify.com/mcp \\\n    --header "Authorization: Bearer YOUR_KEY"`}
          </div>

          <div className="ak-code-block-label">npm install for self-hosted server (optional)</div>
          <div className="ak-code-block">
            <button
              className="ak-cb-copy"
              onClick={() => copyToClipboard("npm install -g @tadaify/mcp")}
            >
              Copy
            </button>
            <span style={{ color: "#9CA3AF" }}>$ </span>npm install -g @tadaify/mcp
          </div>

          <div className="ak-code-block-label">
            Claude Desktop config —{" "}
            <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
          </div>
          <div className="ak-code-block">
            <button
              className="ak-cb-copy"
              onClick={() => copyToClipboard(JSON.stringify({
                mcpServers: { tadaify: { command: "tadaify-mcp", env: { TADAIFY_API_KEY: "sk_tdf_•••…x9k2" } } }
              }, null, 2))}
            >
              Copy
            </button>
            {`{\n  "mcpServers": {\n    "tadaify": {\n      "command": "tadaify-mcp",\n      "env": {\n        "TADAIFY_API_KEY": "sk_tdf_•••…x9k2"\n      }\n    }\n  }\n}`}
          </div>

          <div className="ak-mcp-note">
            <span className="ak-mn-ico" aria-hidden="true">⚡</span>
            <div>
              The MCP package <code>@tadaify/mcp</code> ships separately at{" "}
              <a href="https://github.com/graspsoftwarepw/tadaify-mcp" target="_blank" rel="noopener noreferrer">
                github.com/graspsoftwarepw/tadaify-mcp
              </a>.
              The config above is ready for when it lands — copy buttons still work today.
              <br />
              Docs &amp; examples:{" "}
              <a href="https://docs.tadaify.com/api/mcp" target="_blank" rel="noopener noreferrer">
                docs.tadaify.com/api/mcp ↗
              </a>
            </div>
          </div>

          <div className="settings-section-title" style={{ marginTop: 18, fontSize: "14.5px" }}>
            Set up Claude Desktop in 4 steps
          </div>
          <ol className="ak-quickstart-list">
            <li>
              <span className="ak-qs-body">
                <b>Open Claude Desktop → Settings → Developer → Edit config.</b>
                <span className="ak-qs-sub">
                  If &ldquo;Developer&rdquo; isn&apos;t visible, enable it under{" "}
                  <code>Settings → General → Show developer options</code>.
                </span>
              </span>
            </li>
            <li>
              <span className="ak-qs-body">
                <b>Paste the JSON above.</b> Replace <code>sk_tdf_•••…x9k2</code> with your real key — generate one above if you haven&apos;t yet.
              </span>
            </li>
            <li>
              <span className="ak-qs-body">
                <b>Save and quit Claude Desktop.</b> Re-open it — the tadaify tool icon (🔑) should appear in the conversation footer.
              </span>
            </li>
            <li>
              <span className="ak-qs-body">
                <b>Try a prompt:</b>{" "}
                <em>&ldquo;What&apos;s on my main page right now?&rdquo;</em> — Claude reads your blocks live. Then try{" "}
                <em>&ldquo;Add a &apos;New album out!&apos; announcement at the top.&rdquo;</em>
              </span>
            </li>
          </ol>
        </div>

        {/* ============================================================
             SECTION 3 — Custom GPT template (ChatGPT)
             ============================================================ */}
        <div className="settings-section">
          <div className="settings-section-title ak-with-action">
            <span>
              Custom GPT template (ChatGPT){" "}
              <span className="chip pro ak-sec-tier-pill" aria-label="Pro feature">Pro+</span>
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                // TODO: wire to API keys service
                if (!isPaidTier) { openUpsell("Download Custom GPT template"); return; }
                showToast("Mockup: downloads tadaify-gpt-template.json (OpenAPI 3.1 + auth)");
              }}
            >
              ⬇ Download .json
            </button>
          </div>
          <p className="ak-section-help">
            Build your own ChatGPT Custom GPT that reads from and writes to your tadaify page in one click.
            The JSON below is the OpenAPI 3.1 schema ChatGPT&apos;s &ldquo;Configure → Actions&rdquo; expects, with auth
            pre-filled for our REST API. Pair it with your generated key and the{" "}
            <a href="/app?tab=settings&subtab=apikeys#mcp" style={{ color: "var(--brand-primary)" }}>
              MCP config above
            </a>{" "}
            covers Claude.
          </p>

          <div className="ak-code-block-label">
            OpenAPI 3.1 schema — paste into <code>Configure → Actions → Schema</code>
          </div>
          <div className="ak-code-block">
            <button
              className="ak-cb-copy"
              onClick={() => copyToClipboard(
                "openapi: 3.1.0\ninfo:\n  title: tadaify Creator API\n  version: \"1.0\"\n  description: Read and update your tadaify pages, blocks, and subscribers.\nservers:\n  - url: https://api.tadaify.com/v1\npaths:\n  /pages:\n    get:\n      operationId: listPages\n      summary: List all pages on this account\n      responses: { \"200\": { description: OK } }\n  /pages/{slug}/blocks:\n    get:\n      operationId: listBlocks\n      parameters:\n        - { name: slug, in: path, required: true, schema: { type: string } }\n    post:\n      operationId: addBlock\n      requestBody:\n        content:\n          application/json:\n            schema: { $ref: \"#/components/schemas/Block\" }\ncomponents:\n  securitySchemes:\n    tadaifyBearer:\n      type: http\n      scheme: bearer\nsecurity: [{ tadaifyBearer: [] }]"
              )}
            >
              Copy
            </button>
            <span style={{ color: "#FCD34D" }}>openapi</span>{": 3.1.0\n"}
            <span style={{ color: "#FCD34D" }}>info</span>{":\n"}
            {"  "}<span style={{ color: "#FCD34D" }}>title</span>{": tadaify Creator API\n"}
            {"  "}<span style={{ color: "#FCD34D" }}>version</span>{': "1.0"\n'}
            {"  "}<span style={{ color: "#FCD34D" }}>description</span>{": Read and update your tadaify pages, blocks, and subscribers.\n"}
            <span style={{ color: "#FCD34D" }}>servers</span>{":\n"}
            {"  - "}<span style={{ color: "#FCD34D" }}>url</span>{": https://api.tadaify.com/v1\n"}
            <span style={{ color: "#FCD34D" }}>paths</span>{":\n"}
            {"  /pages:\n    get:\n      "}<span style={{ color: "#FCD34D" }}>operationId</span>{": listPages\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>summary</span>{": List all pages on this account\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>responses</span>{':" { "200": { description: OK } }\n'}
            {"  /pages/{slug}/blocks:\n    get:\n      "}<span style={{ color: "#FCD34D" }}>operationId</span>{": listBlocks\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>parameters</span>{":\n"}
            {"        - { name: slug, in: path, required: true, schema: { type: string } }\n"}
            {"    post:\n      "}<span style={{ color: "#FCD34D" }}>operationId</span>{": addBlock\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>requestBody</span>{":\n"}
            {"        "}<span style={{ color: "#FCD34D" }}>content</span>{":\n"}
            {"          application/json:\n            "}<span style={{ color: "#FCD34D" }}>schema</span>{':" { $ref: "#/components/schemas/Block" }\n'}
            <span style={{ color: "#FCD34D" }}>components</span>{":\n"}
            {"  "}<span style={{ color: "#FCD34D" }}>securitySchemes</span>{":\n"}
            {"    "}<span style={{ color: "#FCD34D" }}>tadaifyBearer</span>{":\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>type</span>{": http\n"}
            {"      "}<span style={{ color: "#FCD34D" }}>scheme</span>{": bearer\n"}
            <span style={{ color: "#FCD34D" }}>security</span>{": [{ tadaifyBearer: [] }]"}
          </div>

          <div className="ak-code-block-label">Authentication settings (paste below the schema)</div>
          <div className="ak-code-block">
            <button
              className="ak-cb-copy"
              onClick={() => copyToClipboard("Authentication Type: API Key\nAuth Type: Bearer\nAPI Key: sk_tdf_<paste your key>")}
            >
              Copy
            </button>
            <span style={{ color: "#9CA3AF" }}># In ChatGPT Custom GPT builder → Configure → Authentication:</span>{"\n"}
            {"Authentication Type:  API Key\nAuth Type:            Bearer\nAPI Key:              sk_tdf_<paste your key>"}
          </div>

          <div className="settings-section-title" style={{ marginTop: 18, fontSize: "14.5px" }}>
            Make your Custom GPT in 3 steps
          </div>
          <ol className="ak-quickstart-list">
            <li>
              <span className="ak-qs-body">
                <b>
                  Go to{" "}
                  <a href="https://chatgpt.com/gpts/editor" target="_blank" rel="noopener noreferrer">
                    chatgpt.com/gpts/editor
                  </a>{" "}
                  and start a new GPT.
                </b>
                <span className="ak-qs-sub">
                  Requires ChatGPT Plus or Team. Name it something like &ldquo;My tadaify page assistant&rdquo;.
                </span>
              </span>
            </li>
            <li>
              <span className="ak-qs-body">
                <b>Open Configure → Actions → Create new action.</b>{" "}
                Paste the schema above and the auth block below it. Set Authentication Type to{" "}
                <code>API Key</code> and your key as the bearer token.
              </span>
            </li>
            <li>
              <span className="ak-qs-body">
                <b>Save and try it.</b> Ask:{" "}
                <em>&ldquo;List my pages.&rdquo;</em> The GPT should call <code>listPages</code> and respond with your slugs.
                <span className="ak-qs-sub">
                  Want examples that actually publish? Browse{" "}
                  <a href="https://docs.tadaify.com/api/gpt-recipes" target="_blank" rel="noopener noreferrer">
                    docs.tadaify.com/api/gpt-recipes ↗
                  </a>
                </span>
              </span>
            </li>
          </ol>
        </div>

        {/* ============================================================
             SECTION 4 — Webhook delivery log
             ============================================================ */}
        <div className="settings-section">
          <div className="settings-section-title ak-with-action">
            <span>
              Webhook delivery log{" "}
              <span className="chip pro ak-sec-tier-pill" aria-label="Pro feature">Pro+</span>
            </span>
            <span className="ak-wh-toolbar" style={{ marginBottom: 0 }}>
              <span className="ak-wht-label">Filter:</span>
              <select
                id="wh-event-filter"
                value={whEventFilter}
                onChange={(e) => setWhEventFilter(e.target.value)}
              >
                <option value="all">All events</option>
                <option value="page.published">page.published</option>
                <option value="page.unpublished">page.unpublished</option>
                <option value="block.created">block.created</option>
                <option value="subscriber.added">subscriber.added</option>
                <option value="subscriber.removed">subscriber.removed</option>
                <option value="form.submitted">form.submitted</option>
              </select>
              <select
                id="wh-status-filter"
                value={whStatusFilter}
                onChange={(e) => setWhStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="2xx">2xx success</option>
                <option value="4xx">4xx client error</option>
                <option value="5xx">5xx server error</option>
                <option value="pending">Pending retry</option>
              </select>
            </span>
          </div>
          <p className="ak-section-help">
            Last 7 days of outbound webhook attempts. Click any row to inspect the payload, request headers,
            and response body. We retry failed deliveries 8 times with exponential backoff (1m → 24h) before
            giving up. After give-up the event lands in the dead-letter queue you can replay from the API.
          </p>

          <div className="ak-keys-table-wrap">
            <table className="ak-wh-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Endpoint</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Retries</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredWebhooks.map((w, i) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => openPayload(w)}>
                    <td>{w.when}</td>
                    <td className="ak-wh-endpoint" title={w.endpoint}>{w.endpoint}</td>
                    <td className="ak-wh-event">{w.event}</td>
                    <td>
                      {w.code === "pending"
                        ? <span className="ak-wh-status spending">pending</span>
                        : <span className={`ak-wh-status s${w.code}`}>{w.status}</span>
                      }
                    </td>
                    <td className="ak-wh-rt">{w.rt}</td>
                    <td className="ak-wh-retries">{w.retries === 0 ? "—" : `${w.retries}×`}</td>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); openPayload(w); }}
                        className="btn btn-ghost btn-xs"
                      >
                        View payload
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
              Showing <b>{filteredWebhooks.length}</b> of <b>348</b>
            </span>
            <a
              href="https://docs.tadaify.com/api/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Webhook events reference ↗
            </a>
          </div>

          {/* Webhooks placeholder (DEC-MULTIPAGE-01) — kept per story body */}
          <div className="ak-webhook-future">
            <div className="ak-wf-ico" aria-hidden="true">🪝</div>
            <div className="ak-wf-body">
              <div className="ak-wf-title">Self-serve webhook endpoint manager — Coming Q+1</div>
              <div className="ak-wf-sub">
                Today the log above is read-only — you register endpoints via the API. The dashboard manager
                (add endpoint with secret, simulate event, replay failed deliveries from the UI) ships in the
                next quarter.
              </div>
              <div className="ak-wf-events">
                {["page.published","page.unpublished","block.created","block.updated","subscriber.added","subscriber.removed","form.submitted","order.placed"].map((ev) => (
                  <span key={ev} className="chip">{ev}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
             SECTION 5 — Rate limits & usage
             ============================================================ */}
        <div className="settings-section">
          <div className="settings-section-title">
            Rate limits &amp; usage
          </div>
          <p className="ak-section-help">
            Counters are per-key per clock hour. Hitting the limit returns <code>HTTP 429</code> with a{" "}
            <code>retry-after</code> header. We don&apos;t silently drop requests — your client must back off.
          </p>

          <div className="ak-rate-panel">
            {/* Current usage */}
            <div className="ak-rate-card">
              <div className="ak-rc-label">
                This hour ·{" "}
                {({ pro: "Pro", business: "Business", creator: "Pro (demo)", free: "Pro (demo)" })[tier]} tier
              </div>
              <div className="ak-rc-value">
                <span>{rateUsed.toLocaleString()}</span>
                <span className="ak-rc-divisor"> / {rateLimit.toLocaleString()} requests</span>
              </div>
              <div className="ak-rc-sub">
                {ratePct}% used · resets in <b>38 min</b> at the top of the hour (UTC)
              </div>
              <div className="ak-rate-bar-wrap">
                <div className={rateBarClass} style={{ width: `${ratePct}%` }} />
              </div>
            </div>

            {/* Today total */}
            <div className="ak-rate-card">
              <div className="ak-rc-label">Today · all keys combined</div>
              <div className="ak-rc-value">
                <span>3,184</span>
                <span className="ak-rc-divisor"> / day requests</span>
              </div>
              <div className="ak-rc-sub">
                Across 4 active keys · <b>Production</b> 71% / <b>GPT integration</b> 19% / <b>Make.com</b> 9% / others 1%
              </div>
              <div className="ak-rate-bar-wrap">
                <div className="ak-rate-bar-fill" style={{ width: "33%" }} />
              </div>
            </div>
          </div>

          {/* Per-tier reference */}
          <div style={{ marginTop: 18 }}>
            <div className="ak-rate-tier-row">
              <span className={`ak-rtr-name${tier === "pro" ? " is-current" : ""}`}>Pro</span>
              <span className="ak-rtr-limit">1,000 req/h</span>
              <span className="ak-rtr-note">Per key. Resets on the clock hour. 8 webhook retries per failed delivery.</span>
            </div>
            <div className="ak-rate-tier-row">
              <span className={`ak-rtr-name${tier === "business" ? " is-current" : ""}`}>Business</span>
              <span className="ak-rtr-limit">5,000 req/h</span>
              <span className="ak-rtr-note">Per key. Higher webhook concurrency (16 in flight). Fair-use cap ~50,000/day account-wide.</span>
            </div>
            <div className="ak-rate-tier-row">
              <span className="ak-rtr-name" style={{ color: "var(--fg-subtle)" }}>Free / Creator</span>
              <span className="ak-rtr-limit" style={{ color: "var(--fg-subtle)" }}>— no API access</span>
              <span className="ak-rtr-note">Upgrade to Pro to unlock keys.</span>
            </div>
          </div>
        </div>

        {/* Help footer */}
        <div className="ak-help-footer">
          Lost a key? You can&apos;t recover the value — rotate or revoke and create a fresh one.
          &nbsp;·&nbsp;
          Found a bug or have feature ideas? Open one at{" "}
          <a href="https://github.com/graspsoftwarepw/tadaify-app/issues" target="_blank" rel="noopener noreferrer">
            github.com/graspsoftwarepw/tadaify-app/issues ↗
          </a>
          &nbsp;·&nbsp;
          Status &amp; uptime:{" "}
          <a href="https://status.tadaify.com" target="_blank" rel="noopener noreferrer">
            status.tadaify.com ↗
          </a>
        </div>
      </div>

      {/* ============================================================
           MODAL — Generate new key (multi-step: form → reveal)
           Centered, NEVER drawer per feedback_no_right_side_drawers
           ============================================================ */}
      {openModal === "generate" && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpenModal(null); setGenStep("form"); } }}
        >
          <div className="modal modal-md" role="dialog" aria-modal={true} aria-labelledby="ak-gen-title">

            {/* Step 1 — form */}
            {genStep === "form" && (
              <>
                <h3 id="ak-gen-title">Generate a new API key</h3>
                <p className="modal-sub">
                  We&apos;ll show you the full key on the next screen — copy it then. After this dialog closes
                  you&apos;ll only see the prefix (
                  <code style={{ background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>
                    sk_tdf_…
                  </code>
                  ) ever again.
                </p>

                <div className="ak-modal-field-row">
                  <div>
                    <label htmlFor="gen-name">Key name</label>
                    <input
                      type="text"
                      id="gen-name"
                      className="field-input"
                      placeholder="e.g. Production · Make.com · GPT integration"
                      maxLength={60}
                      autoComplete="off"
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="gen-expires">Expires</label>
                    <select
                      id="gen-expires"
                      className="field-input"
                      value={genExpires}
                      onChange={(e) => setGenExpires(e.target.value)}
                    >
                      <option value="never">Never</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                      <option value="custom">Custom date…</option>
                    </select>
                  </div>
                </div>

                <label style={{ marginTop: 6 }}>Permissions (pick at least one)</label>
                <div className="ak-scope-list" role="group" aria-label="API key scopes">
                  {SCOPE_DEFS.map((s) => (
                    <label key={s.value} className="ak-scope-item">
                      <input
                        type="checkbox"
                        name="gen-scope"
                        value={s.value}
                        checked={!!genScopes[s.value]}
                        onChange={(e) => setGenScopes((prev) => ({ ...prev, [s.value]: e.target.checked }))}
                      />
                      <span className="ak-si-body">
                        <span className="ak-si-title">
                          {s.label}
                          {s.write && <span className="ak-si-write">write</span>}
                        </span>
                        <span className="ak-si-sub">{s.sub}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setOpenModal(null); setGenStep("form"); }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={genStepReveal}>
                    Generate key
                  </button>
                </div>
              </>
            )}

            {/* Step 2 — reveal */}
            {genStep === "reveal" && (
              <>
                <h3>Your new API key</h3>
                <div className="ak-reveal-banner">
                  <span style={{ fontSize: 18 }} aria-hidden="true">⚠️</span>
                  <div>
                    <b>Copy it now — you won&apos;t see this key again.</b>{" "}
                    We store only the SHA-256 hash and the 12-char prefix. Lose this and you&apos;ll have to rotate.
                  </div>
                </div>

                <label>Full key</label>
                <div className="ak-reveal-key">
                  <span className="ak-rk-key">sk_tdf_3HnX9ZkPq2VtRm7sLwY4d8FxkJ1cN6Bo</span>
                  <span className="ak-rk-actions">
                    <button
                      onClick={() => {
                        // TODO: wire to API keys service
                        copyToClipboard("sk_tdf_3HnX9ZkPq2VtRm7sLwY4d8FxkJ1cN6Bo");
                      }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        // TODO: wire to API keys service
                        showToast("Mockup: downloads tadaify-key-" + Date.now() + ".txt");
                      }}
                    >
                      ⬇ .txt
                    </button>
                  </span>
                </div>

                <dl className="ak-payload-meta">
                  <dt>Name</dt><dd>{genName || rotateKey?.name || "—"}</dd>
                  <dt>Prefix</dt><dd>sk_tdf_3HnX9ZkPq2Vt</dd>
                  <dt>Expires</dt><dd>{rotateKey ? "Never · old value valid 24h" : (expiresLabel[genExpires] ?? "Never")}</dd>
                  <dt>Scopes</dt><dd>{rotateKey ? rotateKey.scopes.join(", ") : revealScopes}</dd>
                </dl>

                <p style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55 }}>
                  Test it in your terminal:
                </p>
                <div className="ak-code-block" style={{ fontSize: "11.5px" }}>
                  <button
                    className="ak-cb-copy"
                    onClick={() => copyToClipboard(`curl -H "Authorization: Bearer sk_tdf_3HnX9ZkPq2VtRm7sLwY4d8FxkJ1cN6Bo" https://api.tadaify.com/v1/pages`)}
                  >
                    Copy
                  </button>
                  <span style={{ color: "#9CA3AF" }}>$ </span>
                  {`curl -H "Authorization: Bearer sk_tdf_3HnX..." \\\n    https://api.tadaify.com/v1/pages`}
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setOpenModal(null);
                      setGenStep("form");
                      setRotateKey(null);
                      showToast("Key saved · stored as SHA-256 hash");
                    }}
                  >
                    I&apos;ve copied it · Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Rotate key
           ============================================================ */}
      {openModal === "rotate" && rotateKey && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpenModal(null); setRotateKey(null); } }}
        >
          <div className="modal modal-sm" role="dialog" aria-modal={true} aria-labelledby="ak-rotate-title">
            <h3 id="ak-rotate-title">Rotate {rotateKey.name}</h3>
            <p className="modal-sub">
              We&apos;ll generate a fresh value with the same name and scopes. The old value works for 24 more
              hours so you can swap it without downtime. After 24h it returns{" "}
              <code style={{ background: "var(--bg-muted)", padding: "1px 5px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>
                401
              </code>.
            </p>

            <dl className="ak-payload-meta">
              <dt>Name</dt><dd>{rotateKey.name}</dd>
              <dt>Old prefix</dt><dd>sk_tdf_•••…{rotateKey.last4}</dd>
              <dt>Scopes preserved</dt><dd>{rotateKey.scopes.join(", ")}</dd>
              <dt>Old key invalid after</dt><dd>2026-04-28 08:30 UTC (24h grace)</dd>
            </dl>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setOpenModal(null); setRotateKey(null); }}>
                Cancel
              </button>
              <button className="btn btn-warm btn-sm" onClick={confirmRotate}>
                Rotate &amp; reveal new key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Delete (revoke) key — type-to-confirm
           ============================================================ */}
      {openModal === "delete" && deleteKey && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpenModal(null); setDeleteKey(null); setDeleteConfirmValue(""); } }}
        >
          <div className="modal modal-sm" role="dialog" aria-modal={true} aria-labelledby="ak-delete-title">
            <h3 id="ak-delete-title">Delete {deleteKey.name}?</h3>
            <p className="modal-sub">
              Revoking is irreversible. Calls with this key return{" "}
              <code style={{ background: "var(--bg-muted)", padding: "1px 5px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>
                401
              </code>{" "}
              within 60 seconds (cache TTL). In-flight requests already authorised at the gateway will complete.
            </p>

            <div className="ak-delete-summary">
              <b>What stops:</b><br />
              · Make.com automation pulling new form submissions<br />
              · Webhook deliveries to <code>https://hooks.zapier.com/hooks/catch/123/abc</code><br />
              · Any background job using this key
            </div>

            <label htmlFor="ak-delete-confirm-input">
              Type the key name to confirm:{" "}
              <code style={{ background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>
                {deleteKey.name}
              </code>
            </label>
            <input
              type="text"
              id="ak-delete-confirm-input"
              className="field-input"
              autoComplete="off"
              value={deleteConfirmValue}
              onChange={(e) => setDeleteConfirmValue(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setOpenModal(null); setDeleteKey(null); setDeleteConfirmValue(""); }}>
                Keep key
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={deleteConfirmValue.trim() !== deleteKey.name}
                onClick={confirmDelete}
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Webhook payload viewer
           ============================================================ */}
      {openModal === "payload" && payloadWebhook && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpenModal(null); setPayloadWebhook(null); } }}
        >
          <div className="modal modal-md" role="dialog" aria-modal={true} aria-labelledby="ak-payload-title">
            <h3 id="ak-payload-title">Webhook delivery · {payloadWebhook.event}</h3>
            <p className="modal-sub">
              Single attempt against your endpoint. Click &ldquo;Replay&rdquo; to fire the same payload again — useful when fixing your handler.
            </p>

            <dl className="ak-payload-meta">
              <dt>Event</dt><dd>{payloadWebhook.event}</dd>
              <dt>Endpoint</dt><dd>{payloadWebhook.endpoint}</dd>
              <dt>Status</dt><dd>{payloadWebhook.status}{payloadWebhook.code === "2xx" ? " OK" : ""} · {payloadWebhook.rt} · attempt {payloadWebhook.retries + 1}/8</dd>
              <dt>Sent at</dt><dd>2026-04-27 06:14:08 UTC</dd>
              <dt>Signature</dt><dd>sha256=8f3c…b2a1 (verify with your endpoint secret)</dd>
            </dl>

            <div className="ak-code-block-label">Request body</div>
            <div className="ak-code-block" style={{ whiteSpace: "pre-wrap" }}>
              <button
                className="ak-cb-copy"
                onClick={() => copyToClipboard('{"event":"page.published","page":{"slug":"main","url":"https://tadaify.com/alexandra"},"timestamp":"2026-04-27T06:14:08Z"}')}
              >
                Copy
              </button>
              {`{\n  "event": "${payloadWebhook.event}",\n  "page": {\n    "slug": "main",\n    "url": "https://tadaify.com/alexandra",\n    "blocks_count": 14\n  },\n  "timestamp": "2026-04-27T06:14:08Z",\n  "tadaify_event_id": "evt_3Hn9ZkPqX2"\n}`}
            </div>

            <div className="ak-code-block-label">Response from your endpoint</div>
            <div className="ak-code-block">
              <span style={{ color: "#10B981" }}>200 OK · 412 ms</span>{"\n"}
              {"content-type: application/json\nx-zapier-zap-id: 1234567\n\n{\"received\":true}"}
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setOpenModal(null); setPayloadWebhook(null); }}>
                Close
              </button>
              <button
                className="btn btn-warm btn-sm"
                onClick={() => {
                  // TODO: wire to API keys service
                  setOpenModal(null);
                  setPayloadWebhook(null);
                  showToast("Mockup: enqueued replay — POST /api/webhooks/replay");
                }}
              >
                Replay this delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Upgrade gate (shared TierGate stub)
           ============================================================ */}
      {openModal === "upsell" && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal modal-md" role="dialog" aria-modal={true} aria-labelledby="ak-upsell-title">
            <h3 id="ak-upsell-title">
              Just one step — <span>{upsellFeature}</span> needs Pro
            </h3>
            <p className="modal-sub">
              Generate keys, plug into Claude via MCP, build a Custom GPT, register webhooks.
              Your demo configuration is saved as a draft — upgrade and we&apos;ll apply it the moment you&apos;re in.
            </p>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--fg-muted)" }}>Current plan</span>
                <span><b>{{ free: "Free", creator: "Creator", pro: "Pro", business: "Business" }[tier]}</b></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--fg-muted)" }}>Pro adds</span>
                <span style={{ textAlign: "right", maxWidth: "60%", lineHeight: 1.45 }}>
                  API keys + MCP + Custom GPT + 1,000 req/h + custom domain + 100 AI credits/mo
                </span>
              </div>
              <div style={{ borderTop: "1px dashed var(--border)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>Pro · monthly</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>$19.99/mo · locked for life</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55 }}>
              Cancel anytime in{" "}
              <a href="/app?tab=settings&subtab=billing" style={{ color: "var(--brand-primary)" }}>
                Billing → Danger zone
              </a>. 30-day money-back on first charge.
            </p>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Stay on Free
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setOpenModal(null);
                  showToast("Mockup: would redirect to Stripe Checkout");
                }}
              >
                Upgrade to Pro — $19.99/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           TOAST
           ============================================================ */}
      <div className={`ak-toast${toastVisible ? " show" : ""}`} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </>
  );
}
