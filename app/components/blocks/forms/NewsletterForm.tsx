/**
 * NewsletterForm — form body for block_type = "newsletter".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.newsletter.form
 * Fields: Provider selector · Provider connection panel · Heading (AI) · Subheadline (AI)
 *   · Button label (AI) · Button icon · Placeholder · Success message (AI)
 * 7 providers: Kit · Beehiiv · MailerLite · Mailchimp · Klaviyo · Google Sheets · Generic webhook
 *
 * FIX-NLT-001 locked MVP scope (DEC-116/117/118/119).
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement, useState } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export type NewsletterProvider =
  | "kit"
  | "beehiiv"
  | "mailerlite"
  | "mailchimp"
  | "klaviyo"
  | "google-sheets"
  | "webhook";

export interface NewsletterFormValue {
  provider: NewsletterProvider;
  heading: string;
  subhead: string;
  cta: string;
  ctaIcon: string | null;
  placeholder: string;
  success: string;
  // API key + list per provider
  apiKey_kit: string;
  listId_kit: string;
  apiKey_beehiiv: string;
  listId_beehiiv: string;
  apiKey_mailerlite: string;
  listId_mailerlite: string;
  apiKey_mailchimp: string;
  listId_mailchimp: string;
  apiKey_klaviyo: string;
  listId_klaviyo: string;
  gsheetsSignedIn: boolean;
  gsheetSheetId: string;
  gsheetTab: string;
  webhookUrl: string;
  doubleOptIn: boolean;
  captureName: boolean;
  sourceTag: string;
}

export const NEWSLETTER_FORM_DEFAULTS: NewsletterFormValue = {
  provider: "kit",
  heading: "Join my list",
  subhead: "No spam — one email a week.",
  cta: "Subscribe",
  ctaIcon: "lucide:send",
  placeholder: "you@email.com",
  success: "Thanks! Check your inbox to confirm.",
  apiKey_kit: "",
  listId_kit: "",
  apiKey_beehiiv: "",
  listId_beehiiv: "",
  apiKey_mailerlite: "",
  listId_mailerlite: "",
  apiKey_mailchimp: "",
  listId_mailchimp: "",
  apiKey_klaviyo: "",
  listId_klaviyo: "",
  gsheetsSignedIn: false,
  gsheetSheetId: "",
  gsheetTab: "Subscribers",
  webhookUrl: "",
  doubleOptIn: true,
  captureName: true,
  sourceTag: "tadaify-creator",
};

const PROVIDER_META: Record<string, { name: string; apiKeyHelp: string }> = {
  kit: { name: "Kit", apiKeyHelp: "Find your API key in Kit → Settings → Advanced." },
  beehiiv: { name: "Beehiiv", apiKeyHelp: "Find your API key in Beehiiv → Settings → API." },
  mailerlite: { name: "MailerLite", apiKeyHelp: "Find your API key in MailerLite → Integrations → API." },
  mailchimp: { name: "Mailchimp", apiKeyHelp: "Find your API key in Mailchimp → Account → Extras → API keys." },
  klaviyo: { name: "Klaviyo", apiKeyHelp: "Find your API key in Klaviyo → Settings → API keys." },
};

export interface NewsletterFormProps {
  value: NewsletterFormValue;
  onChange: (next: NewsletterFormValue) => void;
}

function ApiKeyProviderPanel({
  prov,
  value,
  onChange,
}: {
  prov: string;
  value: NewsletterFormValue;
  onChange: (next: NewsletterFormValue) => void;
}): ReactElement {
  const [keyVisible, setKeyVisible] = useState(false);
  const meta = PROVIDER_META[prov] || PROVIDER_META.kit;
  const apiKeyField = `apiKey_${prov}` as keyof NewsletterFormValue;
  const listIdField = `listId_${prov}` as keyof NewsletterFormValue;

  return (
    <div className="nlt-panel" data-provider={prov}>
      <div className="nlt-panel-head">
        <span className="nlt-panel-title">Connect {meta.name}</span>
      </div>
      <div className="field">
        <label htmlFor={`nlt-key-${prov}`}>API key</label>
        <div className="nlt-key-row">
          <input
            id={`nlt-key-${prov}`}
            type={keyVisible ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            placeholder={`Paste your ${meta.name} API key`}
            value={(value[apiKeyField] as string) || ""}
            onChange={(e) => onChange({ ...value, [apiKeyField]: e.target.value })}
          />
          <button
            type="button"
            className="nlt-key-show"
            aria-label="Show / hide key"
            onClick={() => setKeyVisible((v) => !v)}
          >
            {keyVisible ? "🙈" : "👁"}
          </button>
        </div>
        <div className="help">{meta.apiKeyHelp} Stored encrypted in tadaify Vault — never shown after save.</div>
      </div>
      <div className="field">
        <label>List / audience</label>
        <select
          value={(value[listIdField] as string) || ""}
          onChange={(e) => onChange({ ...value, [listIdField]: e.target.value })}
        >
          <option value="">Pick a list…</option>
          {/* TODO: wire to provider API to load lists */}
        </select>
        <div className="help">Where new subscribers from this block will land.</div>
      </div>
      <div className="field">
        <label htmlFor="nlt-tag">Source tag</label>
        <input
          id="nlt-tag"
          type="text"
          value={value.sourceTag}
          onChange={(e) => onChange({ ...value, sourceTag: e.target.value })}
        />
        <div className="help">Identifies subscribers who came in through this block — handy for segmenting later.</div>
      </div>
      {prov === "beehiiv" && (
        <div className="toggle-row" style={{ padding: "8px 0" }}>
          <div className="lbl">
            <div className="t">Double opt-in (recommended)</div>
            <div className="s">Sends a confirmation email before adding the subscriber. Improves deliverability and matches GDPR best practice.</div>
          </div>
          <span
            className={`switch${value.doubleOptIn ? " on" : ""}`}
            role="switch"
            aria-checked={value.doubleOptIn}
            tabIndex={0}
            onClick={() => onChange({ ...value, doubleOptIn: !value.doubleOptIn })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange({ ...value, doubleOptIn: !value.doubleOptIn });
              }
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}
      {prov === "klaviyo" && (
        <div className="toggle-row" style={{ padding: "8px 0" }}>
          <div className="lbl">
            <div className="t">Capture name field</div>
            <div className="s">Show a &ldquo;Name&rdquo; input next to the email field on the public page.</div>
          </div>
          <span
            className={`switch${value.captureName ? " on" : ""}`}
            role="switch"
            aria-checked={value.captureName}
            tabIndex={0}
            onClick={() => onChange({ ...value, captureName: !value.captureName })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange({ ...value, captureName: !value.captureName });
              }
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}
    </div>
  );
}

function GoogleSheetsPanel({
  value,
  onChange,
}: {
  value: NewsletterFormValue;
  onChange: (next: NewsletterFormValue) => void;
}): ReactElement {
  return (
    <div className="nlt-panel" data-provider="google-sheets">
      <div className="nlt-panel-head">
        <span className="nlt-panel-title">Connect Google Sheets</span>
      </div>
      <div className="field">
        {value.gsheetsSignedIn ? (
          <div className="nlt-gsheets-connected">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
            </svg>
            <span>Signed in as <strong>your-account@gmail.com</strong></span>
            <button
              type="button"
              className="nlt-gsheets-disconnect"
              onClick={() => onChange({ ...value, gsheetsSignedIn: false })}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="nlt-gsheets-signin"
            onClick={() => onChange({ ...value, gsheetsSignedIn: true })}
          >
            {/* TODO: wire to Google OAuth API */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        )}
        <div className="help">We only request access to the sheet you choose. You can revoke access at any time in your Google account.</div>
      </div>
      <div className="field">
        <label>Sheet</label>
        <select
          value={value.gsheetSheetId}
          onChange={(e) => onChange({ ...value, gsheetSheetId: e.target.value })}
          disabled={!value.gsheetsSignedIn}
        >
          <option value="">{value.gsheetsSignedIn ? "Loading sheets…" : "Sign in first to load sheets"}</option>
          {/* TODO: wire to Google Sheets API */}
        </select>
      </div>
      <div className="field">
        <label htmlFor="nlt-tab">Append to tab</label>
        <input
          id="nlt-tab"
          type="text"
          value={value.gsheetTab}
          onChange={(e) => onChange({ ...value, gsheetTab: e.target.value })}
        />
        <div className="help">If the tab doesn&apos;t exist yet, we&apos;ll create it on the first signup.</div>
      </div>
    </div>
  );
}

function WebhookPanel({
  value,
  onChange,
}: {
  value: NewsletterFormValue;
  onChange: (next: NewsletterFormValue) => void;
}): ReactElement {
  const ourEndpoint = "https://tadaify.com/wh/v1/creator";
  const samplePayload = `{
  "email": "fan@example.com",
  "name": "Fan name (if captured)",
  "source": "tadaify-creator",
  "block_id": "blk_a1b2c3",
  "submitted_at": "2026-04-26T18:14:22Z"
}`;

  return (
    <div className="nlt-panel" data-provider="webhook">
      <div className="nlt-panel-head">
        <span className="nlt-panel-title">Generic webhook</span>
        <span className="nlt-panel-sub">Send signups to any HTTPS endpoint you control.</span>
      </div>
      <div className="field">
        <label htmlFor="nlt-webhook-url">Webhook URL</label>
        <input
          id="nlt-webhook-url"
          type="url"
          placeholder="https://your-server.com/api/newsletter"
          value={value.webhookUrl}
          onChange={(e) => onChange({ ...value, webhookUrl: e.target.value })}
        />
        <div className="help">We POST a JSON payload to this URL on every signup. Must be HTTPS. Should respond within 5 seconds.</div>
      </div>
      <div className="field">
        <label>Or use our endpoint</label>
        <div className="nlt-our-endpoint">
          <code>{ourEndpoint}</code>
          <button
            type="button"
            className="nlt-copy-btn"
            onClick={() => navigator.clipboard?.writeText(ourEndpoint)}
          >
            Copy
          </button>
        </div>
        <div className="help">If you don&apos;t have a server yet, point your form at this URL — we&apos;ll forward signups to your inbox while you set things up.</div>
      </div>
      <details className="nlt-payload-details">
        <summary>Payload schema</summary>
        <pre className="nlt-payload"><code>{samplePayload}</code></pre>
        <div className="help">Fields are stable — we add new optional fields without breaking your integration.</div>
      </details>
    </div>
  );
}

export function NewsletterForm({ value, onChange }: NewsletterFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="newsletter-form">
      {/* Provider selector */}
      <div className="field">
        <label htmlFor="nlt-provider">Email provider</label>
        <select
          id="nlt-provider"
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value as NewsletterProvider })}
        >
          <option value="kit">Kit (ConvertKit)</option>
          <option value="beehiiv">Beehiiv</option>
          <option value="mailerlite">MailerLite</option>
          <option value="mailchimp">Mailchimp</option>
          <option value="klaviyo">Klaviyo</option>
          <option value="google-sheets">Google Sheets</option>
          <option value="webhook">Generic webhook</option>
        </select>
        <div className="help">Where new subscribers land. All providers are free on every tadaify plan.</div>
      </div>

      {/* Provider-specific connection panel */}
      {value.provider === "google-sheets" ? (
        <GoogleSheetsPanel value={value} onChange={onChange} />
      ) : value.provider === "webhook" ? (
        <WebhookPanel value={value} onChange={onChange} />
      ) : (
        <ApiKeyProviderPanel prov={value.provider} value={value} onChange={onChange} />
      )}

      {/* Form copy */}
      <div className="field with-ai">
        <label htmlFor="nlt-heading">
          Form heading
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest heading">✨ Suggest</button>
        </label>
        <input
          id="nlt-heading"
          type="text"
          value={value.heading}
          placeholder="Join my list"
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
        />
        <div className="help">Big, friendly headline above the email input.</div>
      </div>

      <div className="field with-ai">
        <label htmlFor="nlt-subhead">
          Subheadline
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest subheadline">✨ Suggest</button>
        </label>
        <input
          id="nlt-subhead"
          type="text"
          value={value.subhead}
          placeholder="No spam — one email a week."
          onChange={(e) => onChange({ ...value, subhead: e.target.value })}
        />
        <div className="help">One short sentence under the heading. Promise something specific.</div>
      </div>

      <div className="field with-ai">
        <label htmlFor="nlt-cta">
          Button label
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest button label">✨ Suggest</button>
        </label>
        <input
          id="nlt-cta"
          type="text"
          value={value.cta}
          placeholder="Subscribe"
          onChange={(e) => onChange({ ...value, cta: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Button icon</label>
        <IconPicker
          value={value.ctaIcon}
          onChange={(id) => onChange({ ...value, ctaIcon: id })}
          clearable
        />
        <div className="help">Shown to the left of the button label.</div>
      </div>

      <div className="field">
        <label htmlFor="nlt-placeholder">Input placeholder</label>
        <input
          id="nlt-placeholder"
          type="text"
          value={value.placeholder}
          placeholder="you@email.com"
          onChange={(e) => onChange({ ...value, placeholder: e.target.value })}
        />
      </div>

      <div className="field with-ai">
        <label htmlFor="nlt-success">
          Success message
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest success message">✨ Suggest</button>
        </label>
        <input
          id="nlt-success"
          type="text"
          value={value.success}
          placeholder="Thanks! Check your inbox to confirm."
          onChange={(e) => onChange({ ...value, success: e.target.value })}
        />
        <div className="help">Shown after a visitor signs up.</div>
      </div>
    </div>
  );
}
