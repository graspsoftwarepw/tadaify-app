/**
 * Settings · API keys tab (Pro+) — your API keys table with a scope-permission
 * reference, MCP (Claude) and Custom-GPT (ChatGPT) integration snippets, a
 * filterable webhook delivery log, and the rate-limit / usage panel. Faithful
 * port of mockups/tadaify-mvp/app-settings-apikeys.html, composed on the shared
 * SettingsShell primitives.
 *
 * This is a premium tab: per the prototype's no-blur rule the whole surface is
 * shown fully and stays interactive, with inline Pro+ tier chips on each
 * section and a demonstration-mode strip; the gate is mocked. API actions apply
 * immediately, so the tab never raises the shell save-bar — every editor opens
 * a centred SettingsModal that closes on Escape / backdrop / Cancel: the
 * multi-step generate-key flow (form → reveal), rotate, the type-to-confirm
 * delete, and the webhook payload viewer. All side effects (copy, download,
 * rotate, revoke, replay) are mocked with an alert — no dead links. Data comes
 * from the typed apiKeysFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, FieldRow, SettingsModal } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { apiKeysFixture, type ApiKey, type ApiScope, type WebhookCode, type WebhookDelivery } from "./apiKeysFixture";

type Modal =
  | null
  | "generate"
  | { kind: "rotate"; key: ApiKey }
  | { kind: "delete"; key: ApiKey }
  | { kind: "payload"; wh: WebhookDelivery };

const mock = (msg: string) => () => alert(msg);

const ProPill = () => (
  <span className="chip pro sec-tier-pill" aria-label="Pro feature">
    Pro+
  </span>
);

export function ApiKeysTab() {
  const fx = apiKeysFixture();
  const [modal, setModal] = useState<Modal>(null);
  const [permOpen, setPermOpen] = useState(false);
  const [genStep, setGenStep] = useState<"form" | "reveal">("form");
  const [genName, setGenName] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [whEvent, setWhEvent] = useState("all");
  const [whStatus, setWhStatus] = useState<"all" | WebhookCode>("all");

  const close = () => {
    setModal(null);
    setGenStep("form");
    setGenName("");
    setDeleteText("");
  };

  const shownWebhooks = fx.webhooks.filter(
    (w) => (whEvent === "all" || w.event === whEvent) && (whStatus === "all" || w.code === whStatus),
  );

  return (
    <>
      {/* Upsell hero + demo strip (premium: no blur, fully interactive) */}
      <div className="upsell-hero" role="region" aria-label="API access comes with Pro">
        <div className="uh-icon" aria-hidden>
          🔑
        </div>
        <div className="uh-body">
          <div className="uh-title">Creator API comes with the Pro plan</div>
          <div className="uh-sub">
            Generate API keys, plug tadaify into Claude Desktop via MCP, or build a Custom GPT that publishes to your page. Everything below
            is shown fully — explore the layout and try the flows.
          </div>
        </div>
        <div className="uh-cta">
          <button className="btn btn-primary btn-sm" type="button" onClick={mock("Mockup — would open Stripe Checkout for Pro")}>
            Upgrade to Pro — $19.99/mo →
          </button>
        </div>
      </div>
      <div className="demo-mode-strip">
        <span className="dms-ico" aria-hidden>
          👀
        </span>
        <div>
          <b>Demonstration mode.</b> The full API surface is shown so you can decide if it's worth upgrading — no blur, no fake-disabled
          controls. Actions here are mocked.
        </div>
      </div>

      {/* Section 1 — Your API keys */}
      <SettingsSection
        title={
          <>
            Your API keys <ProPill />
          </>
        }
        action={
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setModal("generate")}>
            + Generate new key
          </button>
        }
      >
        <p className="section-help">
          Each key authenticates a single integration — give it a clear name so you can rotate it later without breaking anything else.
          Keys live in our DB as <code>SHA-256(key)</code>; the prefix you see is the only identifier we keep in plaintext.
        </p>
        <div className="table-scroll">
          <table className="keys-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Permissions</th>
                <th>Created</th>
                <th>Last used</th>
                <th className="ta-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fx.keys.map((k) => (
                <tr key={k.id} className={k.revoked ? "is-revoked" : undefined}>
                  <td>
                    <span className="k-name">{k.name}</span>
                    <span className="k-name-meta">{k.desc}</span>
                  </td>
                  <td>
                    <span className="k-token mono">sk_tdf_•••…{k.last4}</span>
                  </td>
                  <td>
                    <div className="k-scopes">
                      {k.scopes.map((s) => (
                        <span key={s} className="chip scope">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="k-date">{k.created}</td>
                  <td className="k-date">{k.lastUsed}</td>
                  <td className="k-actions">
                    {k.revoked ? (
                      <span className="k-revoked-note">Revoked Apr 8, 2026</span>
                    ) : (
                      <>
                        <button className="btn btn-ghost btn-xs" type="button" onClick={mock(`Mockup — would reveal ${k.name} once`)}>
                          Reveal once
                        </button>
                        <button className="btn btn-ghost btn-xs" type="button" onClick={() => setModal({ kind: "rotate", key: k })}>
                          Rotate
                        </button>
                        <button className="btn btn-danger-ghost btn-xs" type="button" onClick={() => setModal({ kind: "delete", key: k })}>
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
        <p className="field-help" style={{ marginTop: 10 }}>
          Lost a key? You can't recover the value — only see it once at generation. Rotate or revoke instead, then create a fresh one. Cap:{" "}
          <b>{fx.keysCap}</b> (revoked keys don't count).
        </p>

        <button type="button" className="compare-toggle" aria-expanded={permOpen} onClick={() => setPermOpen((v) => !v)}>
          <span className={`ct-caret${permOpen ? " is-open" : ""}`}>›</span> What can each scope do?
        </button>
        {permOpen && (
          <div className="permissions-grid" role="region" aria-label="Permission scope reference">
            <div className="perm-row is-head">
              <div>Scope</div>
              <div>What it lets the key do</div>
              <div className="ta-right">Category</div>
            </div>
            {fx.scopeRef.map((p) => (
              <div key={p.scope} className="perm-row">
                <div className="perm-name">{p.scope}</div>
                <div className="perm-desc">{p.desc}</div>
                <div className="perm-cat">
                  <span className={`perm-tag${p.write ? " write" : ""}`}>{p.write ? "Write" : "Read"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Section 2 — Plug into Claude (MCP) */}
      <SettingsSection
        title={
          <>
            Plug into Claude (MCP) <ProPill />
          </>
        }
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the MCP docs")}>
            What's MCP? ↗
          </button>
        }
      >
        <p className="section-help">
          MCP (Model Context Protocol) is how Claude Desktop talks to outside services. Drop these snippets in and Claude can list, edit, and
          publish your pages from inside any conversation.
        </p>
        <div className="code-block-label">One-liner — add tadaify MCP to Claude Code</div>
        <div className="code-block">
          <button className="cb-copy" type="button" onClick={mock("Mockup — copied to clipboard")}>
            Copy
          </button>
          <pre>{`$ claude mcp add tadaify --url https://api.tadaify.com/mcp \\
    --header "Authorization: Bearer YOUR_KEY"`}</pre>
        </div>
        <div className="code-block-label">Claude Desktop config</div>
        <div className="code-block">
          <button className="cb-copy" type="button" onClick={mock("Mockup — copied to clipboard")}>
            Copy
          </button>
          <pre>{`{
  "mcpServers": {
    "tadaify": {
      "command": "tadaify-mcp",
      "env": { "TADAIFY_API_KEY": "sk_tdf_•••…x9k2" }
    }
  }
}`}</pre>
        </div>
        <div className="set-section-title sub-title">Set up Claude Desktop in 4 steps</div>
        <ol className="quickstart-list">
          <li>Open Claude Desktop → Settings → Developer → Edit config.</li>
          <li>Paste the JSON above. Replace the placeholder with your real key — generate one above if you haven't yet.</li>
          <li>Save and quit Claude Desktop. Re-open it — the tadaify tool should appear in the conversation footer.</li>
          <li>Try a prompt: "What's on my main page right now?" — Claude reads your blocks live.</li>
        </ol>
      </SettingsSection>

      {/* Section 3 — Custom GPT template */}
      <SettingsSection
        title={
          <>
            Custom GPT template (ChatGPT) <ProPill />
          </>
        }
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would download the OpenAPI .json")}>
            ⬇ Download .json
          </button>
        }
      >
        <p className="section-help">
          Build your own ChatGPT Custom GPT that reads from and writes to your tadaify page. The schema below is the OpenAPI 3.1 schema
          ChatGPT's "Configure → Actions" expects, with auth pre-filled for our REST API.
        </p>
        <div className="code-block-label">OpenAPI 3.1 schema — paste into Configure → Actions → Schema</div>
        <div className="code-block">
          <button className="cb-copy" type="button" onClick={mock("Mockup — copied to clipboard")}>
            Copy
          </button>
          <pre>{`openapi: 3.1.0
info:
  title: tadaify Creator API
  version: "1.0"
servers:
  - url: https://api.tadaify.com/v1
security: [{ tadaifyBearer: [] }]`}</pre>
        </div>
        <div className="set-section-title sub-title">Make your Custom GPT in 3 steps</div>
        <ol className="quickstart-list">
          <li>Go to the ChatGPT GPT editor and start a new GPT (requires ChatGPT Plus or Team).</li>
          <li>Open Configure → Actions → Create new action. Paste the schema and set API Key bearer auth.</li>
          <li>Save and try it. Ask: "List my pages." The GPT should call listPages and respond with your slugs.</li>
        </ol>
      </SettingsSection>

      {/* Section 4 — Webhook delivery log */}
      <SettingsSection
        title={
          <>
            Webhook delivery log <ProPill />
          </>
        }
        action={
          <span className="wh-toolbar">
            <select className="field-select" value={whEvent} onChange={(e) => setWhEvent(e.target.value)} aria-label="Filter by event">
              <option value="all">All events</option>
              <option value="page.published">page.published</option>
              <option value="page.unpublished">page.unpublished</option>
              <option value="block.created">block.created</option>
              <option value="subscriber.added">subscriber.added</option>
              <option value="subscriber.removed">subscriber.removed</option>
              <option value="form.submitted">form.submitted</option>
            </select>
            <select
              className="field-select"
              value={whStatus}
              onChange={(e) => setWhStatus(e.target.value as typeof whStatus)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="2xx">2xx success</option>
              <option value="4xx">4xx client error</option>
              <option value="5xx">5xx server error</option>
              <option value="pending">Pending retry</option>
            </select>
          </span>
        }
      >
        <p className="section-help">
          Last 7 days of outbound webhook attempts. Click any row to inspect the payload. We retry failed deliveries 8 times with
          exponential backoff (1m → 24h) before the dead-letter queue.
        </p>
        <div className="table-scroll">
          <table className="wh-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Endpoint</th>
                <th>Event</th>
                <th>Status</th>
                <th>Time</th>
                <th>Retries</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shownWebhooks.map((w) => (
                <tr key={w.id}>
                  <td>{w.when}</td>
                  <td className="wh-endpoint" title={w.endpoint}>
                    {w.endpoint}
                  </td>
                  <td className="wh-event">{w.event}</td>
                  <td>
                    <span className={`wh-status s-${w.code}`}>{w.code === "pending" ? "pending" : w.status}</span>
                  </td>
                  <td className="mono">{w.rt}</td>
                  <td>{w.retries === 0 ? "—" : `${w.retries}×`}</td>
                  <td>
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setModal({ kind: "payload", wh: w })}>
                      View payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="invoices-footer">
          <span className="it-count">
            Showing <b>{shownWebhooks.length}</b> of <b>{fx.webhookTotal}</b>
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the webhook events reference")}>
            Webhook events reference ↗
          </button>
        </div>
      </SettingsSection>

      {/* Section 5 — Rate limits & usage */}
      <SettingsSection title="Rate limits & usage">
        <p className="section-help">
          Counters are per-key per clock hour. Hitting the limit returns <code>HTTP 429</code> with a <code>retry-after</code> header. We
          don't silently drop requests — your client must back off.
        </p>
        <div className="rate-panel">
          {fx.rateCards.map((c) => (
            <div key={c.label} className="rate-card">
              <div className="rc-label">{c.label}</div>
              <div className="rc-value">
                <span>{c.used}</span>
                <span className="rc-divisor"> / {c.limit} requests</span>
              </div>
              <div className="rc-sub">{c.sub}</div>
              <div className="rate-bar-wrap">
                <div className="rate-bar-fill" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rate-tier-list">
          {fx.rateTiers.map((t) => (
            <div key={t.name} className={`rate-tier-row${t.muted ? " is-muted" : ""}`}>
              <span className="rtr-name">{t.name}</span>
              <span className="rtr-limit">{t.limit}</span>
              <span className="rtr-note">{t.note}</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* ── Modals ── */}
      {modal === "generate" && (
        <SettingsModal
          title={genStep === "form" ? "Generate a new API key" : "Your new API key"}
          sub={
            genStep === "form"
              ? "We'll show you the full key on the next screen — copy it then. After this dialog closes you'll only see the prefix (sk_tdf_…) ever again."
              : undefined
          }
          onClose={close}
          hideCancel={genStep === "reveal"}
          confirm={
            genStep === "form" ? (
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  if (!genName.trim()) {
                    alert("Give your key a name first");
                    return;
                  }
                  setGenStep("reveal");
                }}
              >
                Generate key
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  alert("Mockup — key saved · stored as SHA-256 hash");
                  close();
                }}
              >
                I've copied it · Done
              </button>
            )
          }
        >
          {genStep === "form" ? (
            <>
              <div className="modal-fields">
                <input
                  className="field-input"
                  type="text"
                  placeholder="Key name — e.g. Production · Make.com · GPT integration"
                  maxLength={60}
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                />
                <select className="field-select" defaultValue="never" aria-label="Expires">
                  <option value="never">Expires: Never</option>
                  <option value="30">Expires in 30 days</option>
                  <option value="90">Expires in 90 days</option>
                  <option value="365">Expires in 1 year</option>
                </select>
              </div>
              <label className="modal-field-label">Permissions (pick at least one)</label>
              <div className="scope-list" role="group" aria-label="API key scopes">
                {fx.scopeRef.map((p, i) => (
                  <label key={p.scope} className="scope-item">
                    <input type="checkbox" name="gen-scope" defaultChecked={i < 2} value={p.scope} />
                    <span className="si-body">
                      <span className="si-title">
                        {p.scope}
                        {p.write && <span className="si-write">write</span>}
                      </span>
                      <span className="si-sub">{p.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="modal-warning">
                <strong>Copy it now — you won't see this key again.</strong> We store only the SHA-256 hash and the 12-char prefix.
              </div>
              <label className="modal-field-label">Full key</label>
              <div className="reveal-key">
                <span className="rk-key mono">sk_tdf_3HnX9ZkPq2VtRm7sLwY4d8FxkJ1cN6Bo</span>
                <span className="rk-actions">
                  <button type="button" onClick={mock("Mockup — copied to clipboard")}>
                    Copy
                  </button>
                  <button type="button" onClick={mock("Mockup — would download tadaify-key.txt")}>
                    ⬇ .txt
                  </button>
                </span>
              </div>
              <dl className="payload-meta">
                <dt>Name</dt>
                <dd>{genName || "—"}</dd>
                <dt>Prefix</dt>
                <dd className="mono">sk_tdf_3HnX9ZkPq2Vt</dd>
                <dt>Expires</dt>
                <dd>Never</dd>
              </dl>
            </>
          )}
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "rotate" && (
        <SettingsModal
          title={`Rotate ${modal.key.name}`}
          sub="We'll generate a fresh value with the same name and scopes. The old value works for 24 more hours so you can swap it without downtime."
          onClose={close}
          confirm={
            <button
              className="btn btn-warm btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would rotate ${modal.key.name} and reveal a new key`);
                close();
              }}
            >
              Rotate &amp; reveal new key
            </button>
          }
        >
          <dl className="payload-meta">
            <dt>Name</dt>
            <dd>{modal.key.name}</dd>
            <dt>Old prefix</dt>
            <dd className="mono">sk_tdf_•••…{modal.key.last4}</dd>
            <dt>Scopes preserved</dt>
            <dd>{modal.key.scopes.join(", ")}</dd>
            <dt>Old key invalid after</dt>
            <dd>24h grace</dd>
          </dl>
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "delete" && (
        <SettingsModal
          title={`Delete ${modal.key.name}?`}
          sub="Revoking is irreversible. Calls with this key return 401 within 60 seconds (cache TTL). In-flight requests already authorised will complete."
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              disabled={deleteText !== modal.key.name}
              onClick={() => {
                alert(`Mockup — would permanently revoke ${modal.key.name}`);
                close();
              }}
            >
              Delete forever
            </button>
          }
        >
          <div className="modal-warning">
            Any background job, automation, or webhook using this key stops working the moment it's revoked.
          </div>
          <label className="modal-field-label">
            Type the key name to confirm: <code className="mono">{modal.key.name}</code>
          </label>
          <input
            className="field-input"
            type="text"
            autoComplete="off"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
          />
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "payload" && (
        <SettingsModal
          title={`Webhook delivery · ${modal.wh.event}`}
          sub="Single attempt against your endpoint. Replay fires the same payload again — useful when fixing your handler."
          onClose={close}
          confirm={
            <button
              className="btn btn-warm btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would enqueue a replay of this delivery");
                close();
              }}
            >
              Replay this delivery
            </button>
          }
        >
          <dl className="payload-meta">
            <dt>Event</dt>
            <dd>{modal.wh.event}</dd>
            <dt>Endpoint</dt>
            <dd className="mono wrap">{modal.wh.endpoint}</dd>
            <dt>Status</dt>
            <dd>
              {modal.wh.status} · {modal.wh.rt} · attempt {modal.wh.retries + 1}/8
            </dd>
          </dl>
          <div className="code-block-label">Request body</div>
          <div className="code-block">
            <pre>{`{
  "event": "${modal.wh.event}",
  "timestamp": "2026-04-27T06:14:08Z",
  "tadaify_event_id": "evt_3Hn9ZkPqX2"
}`}</pre>
          </div>
        </SettingsModal>
      )}
    </>
  );
}
